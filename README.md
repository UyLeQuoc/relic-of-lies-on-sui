# Relic of Lies - Love Letter Card Game on Sui

A decentralized implementation of the classic **Love Letter** card game on the **Sui blockchain**, with **cryptographic commitment verification** for provably fair gameplay.

## Overview

Relic of Lies brings the beloved Love Letter card game to Web3 with full on-chain game logic. The smart contract uses a **commitment scheme** to ensure players cannot cheat - when you play a card, the contract cryptographically verifies you're telling the truth about its value.

### Key Features

- **Provably Fair**: Commitment scheme ensures players cannot lie about card values
- **Fully On-Chain**: All game logic enforced by smart contract
- **Real-Time Multiplayer**: 2-4 players per game room
- **Leaderboard**: Track wins, losses, and player rankings
- **Modern UI**: Beautiful, responsive interface with animations

---

## Current Implementation Status

### What's Implemented

| Feature | Status | Description |
|---------|--------|-------------|
| **Commitment Scheme** | ✅ Complete | `hash(value \|\| secret)` verification on-chain |
| **On-Chain Game Logic** | ✅ Complete | All card effects, turn order, win conditions |
| **Sui Random** | ✅ Complete | VRF-based deck shuffling |
| **Seal Access Control** | ✅ Complete | `seal_approve_card` entry function ready |
| **Frontend UI** | ✅ Complete | Full game interface with card animations |

### What's NOT Yet Implemented

| Feature | Status | Description |
|---------|--------|-------------|
| **Seal Encryption** | ❌ Not Applied | Card values currently stored as plaintext on-chain |
| **Walrus Storage** | ❌ Not Applied | No encrypted blob storage |
| **Threshold Decryption** | ❌ Not Applied | Frontend reads values directly from contract |

### Current Privacy Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CURRENT IMPLEMENTATION                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ON-CHAIN (SealedGameRoom struct):                                          │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  deck_values: vector<u8>      ← Card values (PLAINTEXT!)        │       │
│  │  deck_secrets: vector<vector<u8>>  ← Secrets (PLAINTEXT!)       │       │
│  │  commitments: vector<vector<u8>>   ← hash(value || secret)      │       │
│  │  player.hand: vector<u64>     ← Card indices only               │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  FRONTEND (useDecryptCards hook):                                           │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  // Currently reads directly from on-chain data:                 │       │
│  │  const value = room.deck_values[cardIndex];     // No encryption │       │
│  │  const secret = room.deck_secrets[cardIndex];   // No encryption │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ⚠️  Anyone can read all card values by querying the blockchain!           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why This Model? What's the Purpose?

The current implementation serves as a **foundation and proof-of-concept** for the full Seal-integrated version:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PURPOSE OF CURRENT IMPLEMENTATION                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. COMMITMENT VERIFICATION PROOF-OF-CONCEPT                                │
│     ─────────────────────────────────────────                               │
│     • Demonstrates that players CANNOT lie about card values                │
│     • Contract verifies hash(value || secret) == commitment                 │
│     • This logic remains UNCHANGED when Seal is added                       │
│                                                                             │
│  2. COMPLETE GAME LOGIC IMPLEMENTATION                                      │
│     ────────────────────────────────────                                    │
│     • All 10 card effects fully implemented and tested                      │
│     • Turn order, elimination, win conditions all on-chain                  │
│     • Pending actions (Guard response, Baron comparison)                    │
│     • Chancellor resolution flow                                            │
│                                                                             │
│  3. SEAL ACCESS CONTROL READY                                               │
│     ──────────────────────────                                              │
│     • seal_approve_card entry function already implemented                  │
│     • SealAccessState tracks card ownership                                 │
│     • Temporary access for Priest effect                                    │
│     • Ownership swap for King effect                                        │
│     → Just needs Seal SDK integration on frontend                           │
│                                                                             │
│  4. FRONTEND UI COMPLETE                                                    │
│     ─────────────────────                                                   │
│     • Card display, animations, game table                                  │
│     • useDecryptCards hook ready to swap implementation                     │
│     • Pending action UI (Guard/Baron responses)                             │
│     • Chancellor choice interface                                           │
│                                                                             │
│  5. TESTING & DEVELOPMENT                                                   │
│     ────────────────────────                                                │
│     • Easier to debug without encryption layer                              │
│     • Can verify game logic correctness                                     │
│     • Frontend can be fully tested                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**In summary:** The current model implements **everything except the encryption layer**. When Seal is integrated:
- Smart contract changes: Store blob IDs instead of plaintext values
- Frontend changes: Call Seal SDK in `useDecryptCards` instead of reading directly
- **All game logic remains the same**

### How to Integrate Seal (Based on `apps/seal` Example)

The `apps/seal` folder contains a working example of Seal integration. Here's how to apply it to the game:

#### Step 1: Encrypt Card Data at Round Start

```typescript
// Based on apps/seal/frontend/src/EncryptAndUpload.tsx
import { SealClient } from '@mysten/seal';

const sealClient = new SealClient({
  suiClient,
  serverConfigs: [
    { objectId: "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75", weight: 1 },
    { objectId: "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8", weight: 1 },
  ],
  verifyKeyServers: false,
});

// Encrypt each card's (value, secret) pair
const cardData = new Uint8Array([cardValue, ...secretBytes]);
const policyObjectBytes = fromHex(roomId);  // Room ID as namespace
const nonce = crypto.getRandomValues(new Uint8Array(5));
const sealId = toHex(new Uint8Array([...policyObjectBytes, ...nonce, cardIndex]));

const { encryptedObject } = await sealClient.encrypt({
  threshold: 2,
  packageId: PACKAGE_ID,
  id: sealId,
  data: cardData,
});

// Upload to Walrus
const response = await fetch(`${WALRUS_PUBLISHER_URL}/v1/blobs?epochs=1`, {
  method: 'PUT',
  body: encryptedObject,
});
const { blobId } = await response.json();
```

#### Step 2: Store Blob IDs On-Chain (Contract Change)

```move
// Instead of storing plaintext values:
public struct SealedGameRoom has key, store {
    // REMOVE: deck_values: vector<u8>,
    // REMOVE: deck_secrets: vector<vector<u8>>,
    
    // ADD: References to encrypted blobs on Walrus
    encrypted_blob_ids: vector<String>,
    commitments: vector<vector<u8>>,  // Keep for verification
    seal_access: SealAccessState,
}
```

#### Step 3: Decrypt Cards Using Seal SDK

```typescript
// Based on apps/seal/frontend/src/AllowlistView.tsx and utils.ts
import { SealClient, SessionKey, EncryptedObject } from '@mysten/seal';

// 1. Create or load session key
const sessionKey = await SessionKey.create({
  address: playerAddress,
  packageId: PACKAGE_ID,
  ttlMin: 10,
  suiClient,
});

// 2. Sign personal message to authorize session
const signature = await signPersonalMessage(sessionKey.getPersonalMessage());
await sessionKey.setPersonalMessageSignature(signature);

// 3. Download encrypted blob from Walrus
const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`);
const encryptedData = new Uint8Array(await response.arrayBuffer());

// 4. Build approval transaction (calls seal_approve_card)
const sealId = EncryptedObject.parse(encryptedData).id;
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::sealed_game::seal_approve_card`,
  arguments: [tx.pure.vector('u8', fromHex(sealId)), tx.object(roomId)],
});
const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });

// 5. Fetch decryption keys from Seal servers
await sealClient.fetchKeys({ ids: [sealId], txBytes, sessionKey, threshold: 2 });

// 6. Decrypt locally
const decryptedData = await sealClient.decrypt({
  data: encryptedData,
  sessionKey,
  txBytes,
});

// decryptedData contains [cardValue, ...secretBytes]
const cardValue = decryptedData[0];
const secret = Array.from(decryptedData.slice(1));
```

#### Step 4: The `seal_approve_card` Entry Function (Already Implemented)

```move
// apps/contract_v3/sources/sealed_game.move - Line 1188
entry fun seal_approve_card(
    seal_id: vector<u8>,
    room: &SealedGameRoom,
    ctx: &TxContext
) {
    let caller = ctx.sender();
    let namespace = room.id.to_inner().to_bytes();
    
    // Verify namespace prefix (seal_id starts with room ID)
    assert!(utils::is_prefix(&namespace, &seal_id), error::invalid_namespace());
    
    // Extract card index from seal_id
    let card_index = utils::extract_card_index_from_seal_id(&seal_id, namespace.length());
    
    // Check if caller can access this card (owner or temporary access)
    assert!(
        seal_access::can_access_card(&room.seal_access, caller, card_index),
        error::no_access()
    );
}
```

This function is called by Seal servers to verify if a player has permission to decrypt a card.

#### Architecture with Seal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SEAL INTEGRATION FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ROUND START (Frontend encrypts, uploads to Walrus):                        │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  For each card:                                                  │       │
│  │    1. sealClient.encrypt({ data: [value, ...secret], id })      │       │
│  │    2. Upload encryptedObject to Walrus → get blobId             │       │
│  │    3. Store blobId on-chain via start_round()                   │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  PLAYER VIEWS CARD (Frontend decrypts via Seal):                            │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  1. Download encrypted blob from Walrus                          │       │
│  │  2. Create SessionKey + sign personal message                    │       │
│  │  3. Build tx calling seal_approve_card                           │       │
│  │  4. sealClient.fetchKeys() → Seal servers verify via contract   │       │
│  │  5. sealClient.decrypt() → Get [value, secret] locally          │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  SEAL SERVER VERIFICATION:                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  Seal server simulates tx with seal_approve_card                 │       │
│  │  → Contract checks: Does caller own this card?                   │       │
│  │  → If yes: Return key share                                      │       │
│  │  → If no: Reject (NoAccessError)                                 │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ✅ Only card owners can decrypt                                           │
│  ✅ Seal servers never see decrypted data                                  │
│  ✅ Threshold requirement (2 of N servers)                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Setup Requirements for Seal Integration

To enable Seal encryption, you need to configure the following:

#### 1. Install Seal SDK

```bash
# Add to apps/web/package.json
bun add @mysten/seal
```

#### 2. Seal Server Configuration (Testnet)

```typescript
// Seal key servers on testnet (already deployed by Mysten Labs)
const SEAL_SERVER_OBJECT_IDS = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];

const sealClient = new SealClient({
  suiClient,
  serverConfigs: SEAL_SERVER_OBJECT_IDS.map((id) => ({
    objectId: id,
    weight: 1,
  })),
  verifyKeyServers: false,
});
```

#### 3. Walrus Storage Configuration (Testnet)

Walrus is the decentralized storage layer for encrypted blobs. Configure proxy in `next.config.js`:

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      // Walrus Aggregators (for downloading blobs)
      {
        source: '/walrus/aggregator/:path*',
        destination: 'https://aggregator.walrus-testnet.walrus.space/:path*',
      },
      // Walrus Publishers (for uploading blobs)
      {
        source: '/walrus/publisher/:path*',
        destination: 'https://publisher.walrus-testnet.walrus.space/:path*',
      },
    ];
  },
};
```

**Available Walrus Services (Testnet):**

| Provider | Aggregator URL | Publisher URL |
|----------|----------------|---------------|
| walrus.space | `https://aggregator.walrus-testnet.walrus.space` | `https://publisher.walrus-testnet.walrus.space` |
| staketab.org | `https://wal-aggregator-testnet.staketab.org` | `https://wal-publisher-testnet.staketab.org` |
| redundex.com | `https://walrus-testnet-aggregator.redundex.com` | `https://walrus-testnet-publisher.redundex.com` |
| nodes.guru | `https://walrus-testnet-aggregator.nodes.guru` | `https://walrus-testnet-publisher.nodes.guru` |
| banansen.dev | `https://aggregator.walrus.banansen.dev` | `https://publisher.walrus.banansen.dev` |
| everstake.one | `https://walrus-testnet-aggregator.everstake.one` | `https://walrus-testnet-publisher.everstake.one` |

#### 4. Session Key Storage (Optional but Recommended)

Use IndexedDB to persist session keys across page reloads:

```bash
bun add idb-keyval
```

```typescript
import { get, set } from 'idb-keyval';

// Save session key
await set('sessionKey', sessionKey.export());

// Load session key
const imported = await get('sessionKey');
if (imported) {
  const sessionKey = await SessionKey.import(imported, suiClient);
  if (!sessionKey.isExpired()) {
    // Reuse existing session key
  }
}
```

#### 5. Contract Changes Required

The smart contract needs to store blob IDs instead of plaintext values:

```move
// apps/contract_v3/sources/sealed_game.move

public struct SealedGameRoom has key, store {
    // REMOVE these (plaintext):
    // deck_values: vector<u8>,
    // deck_secrets: vector<vector<u8>>,
    
    // ADD this (encrypted references):
    encrypted_blob_ids: vector<String>,  // Walrus blob IDs
    
    // KEEP these:
    commitments: vector<vector<u8>>,     // For verification
    seal_access: SealAccessState,        // Access control
}
```

#### 6. Summary of Required Changes

| Component | Current | With Seal |
|-----------|---------|-----------|
| **Package** | - | Add `@mysten/seal`, `idb-keyval` |
| **Contract** | `deck_values`, `deck_secrets` (plaintext) | `encrypted_blob_ids` (references) |
| **Frontend** | Read directly from chain | Encrypt/decrypt via Seal SDK |
| **Storage** | On-chain | Walrus (encrypted blobs) |
| **Config** | - | Walrus proxy, Seal server IDs |

#### 7. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SEAL_SERVER_1=0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75
NEXT_PUBLIC_SEAL_SERVER_2=0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8
NEXT_PUBLIC_WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_PUBLISHER=https://publisher.walrus-testnet.walrus.space
```

---

## Tech Stack

### Frontend (`apps/web`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | React framework with App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Framer Motion** | 12.x | Animations |
| **GSAP** | 3.14.2 | Advanced animations |
| **@mysten/dapp-kit** | 0.19.11 | Sui wallet integration |
| **@mysten/sui** | 1.45.2 | Sui SDK |
| **@tanstack/react-query** | 5.x | Data fetching & caching |
| **Radix UI** | 1.4.3 | Accessible UI primitives |
| **shadcn/ui** | 3.6.2 | UI component library |
| **Sonner** | 2.x | Toast notifications |

### Smart Contracts (`apps/contract_v3`)

| Technology | Purpose |
|------------|---------|
| **Sui Move** | Smart contract language |
| **Sui Random** | On-chain randomness for deck shuffling |
| **Blake2b256** | Cryptographic hashing for commitments |
| **Seal Access Control** | Entry function ready for Seal integration (not yet active) |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Bun** | Package manager & runtime |
| **Turbo** | Monorepo build system |
| **Biome** | Linting & formatting |
| **sui-ts-codegen** | TypeScript bindings for Move contracts |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │    Frontend     │────▶│   Sui Network   │◀────│  Seal Servers   │       │
│  │   (Next.js)     │     │  (Smart Contracts)    │  (Decryption)   │       │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│          │                        │                       │                 │
│          │                        │                       │                 │
│          ▼                        ▼                       ▼                 │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                         DATA FLOW                                │       │
│  │                                                                  │       │
│  │  ON-CHAIN (Public)              OFF-CHAIN (Private via Seal)    │       │
│  │  ─────────────────              ────────────────────────────    │       │
│  │  • Room state                   • Card values (encrypted)       │       │
│  │  • Player addresses             • Deck order (encrypted)        │       │
│  │  • Card indices (not values!)   • Hand viewing via Seal SDK     │       │
│  │  • Commitments: hash(value||secret)                             │       │
│  │  • Discarded cards (revealed)                                   │       │
│  │  • Game rules enforcement                                       │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Smart Contract Modules (V3)

### Module Structure

```
apps/contract_v3/sources/
├── constants.move      # Game constants (card types, counts, status codes)
├── error.move          # Error codes and validation
├── events.move         # On-chain events for frontend tracking
├── utils.move          # Deck manipulation, commitment functions, Seal ID helpers
├── seal_access.move    # Seal access control (ownership, temporary access)
├── sealed_game.move    # Main game logic
└── leaderboard.move    # Player statistics and rankings
```

### Key Data Structures

```move
// Player state - stores card INDICES, not values
public struct Player has store, copy, drop {
    addr: address,
    hand: vector<u64>,           // Card indices (not values!)
    discarded: vector<u8>,       // Revealed discarded cards
    is_alive: bool,
    is_immune: bool,
    tokens: u64,
    has_played_spy: bool,
}

// Game room with Seal integration
public struct SealedGameRoom has key, store {
    id: UID,
    name: String,
    creator: address,
    players: vector<Player>,
    deck_values: vector<u8>,     // Actual card values (private)
    deck_secrets: vector<vector<u8>>,  // 32-byte secrets per card
    commitments: vector<vector<u8>>,   // hash(value || secret)
    deck_indices: vector<u64>,   // Remaining deck
    seal_access: SealAccessState, // Seal ownership tracking
    pending_action: Option<PendingAction>,
    // ... other fields
}
```

### Commitment Scheme

The commitment scheme ensures players cannot lie about their card values:

```
commitment = blake2b256(card_value || secret)
```

1. **Round Start**: Contract generates random secrets and creates commitments for all cards
2. **Card Play**: Player reveals `card_value` and `secret`
3. **Verification**: Contract verifies `hash(card_value || secret) == commitment`

### Seal Access Control

```move
public struct SealAccessState has store, drop {
    card_ownership: vector<CardOwnership>,    // Who owns each card
    temporary_access: vector<TemporaryAccess>, // Priest effect
}

// Entry function for Seal servers to verify access
public entry fun seal_approve_card(
    id: vector<u8>,
    room: &SealedGameRoom,
    ctx: &TxContext
)
```

## Game Flow

### 1. Room Creation & Joining

```typescript
// Create room
const tx = new Transaction();
sealedGame.createRoom(tx, {
  roomRegistry: REGISTRY_ID,
  name: "My Game Room",
  maxPlayers: 4n,
});

// Join room
sealedGame.joinRoom(tx, {
  roomRegistry: REGISTRY_ID,
  room: roomId,
});
```

### 2. Start Round

When a round starts, the contract:
1. Shuffles deck using Sui Random
2. Generates 32-byte secret for each card
3. Creates commitment: `hash(value || secret)`
4. Deals card indices to players
5. Registers Seal ownership for each dealt card

### 3. View Cards (Decryption)

```typescript
// Frontend decrypts cards using Seal
const { decryptCards } = useDecryptCards();

// Get decrypted card values and secrets
const decrypted = await decryptCards(room, cardIndices);
// Returns: { cardIndex, value, secret }[]
```

### 4. Play Turn

```typescript
const { playTurn } = usePlayTurnV3();

await playTurn(
  roomId,
  cardIndex,      // Which card to play
  revealedValue,  // Card value (0-9)
  secret,         // 32-byte secret for verification
  targetIdx,      // Target player (optional)
  guess           // Guard guess (optional)
);
```

### 5. Card Effects

| Card | Value | Effect | Implementation |
|------|-------|--------|----------------|
| **Spy** | 0 | Bonus token at round end | Track `has_played_spy` |
| **Guard** | 1 | Guess opponent's card | `pending_action` → `respond_guard()` |
| **Priest** | 2 | View opponent's card | `grant_temporary_access()` via Seal |
| **Baron** | 3 | Compare hands, lower eliminated | `pending_action` → `respond_baron()` |
| **Handmaid** | 4 | Immune until next turn | Set `is_immune = true` |
| **Prince** | 5 | Force discard & redraw | Reveal discarded card |
| **Chancellor** | 6 | Draw 2, keep 1, return 2 | `resolve_chancellor()` |
| **King** | 7 | Swap hands | `swap_ownership()` in Seal |
| **Countess** | 8 | Must discard with King/Prince | Enforced in `play_turn()` |
| **Princess** | 9 | Eliminated if discarded | Auto-eliminate on discard |

### 6. Pending Actions

Some cards require responses from other players:

```typescript
// Guard response - target reveals their card
const { respondGuard } = useRespondGuardV3();
await respondGuard(roomId, cardIndex, value, secret);

// Baron response - target reveals for comparison
const { respondBaron } = useRespondBaronV3();
await respondBaron(roomId, cardIndex, value, secret);
```

## Frontend Structure

### Key Directories

```
apps/web/
├── app/(root)/
│   ├── rooms_v3/           # Sealed game lobby
│   │   ├── page.tsx
│   │   └── _components/
│   │       ├── rooms-lobby-v3.tsx
│   │       └── create-room-v3.tsx
│   └── game_v3/            # Sealed game room
│       ├── page.tsx
│       └── _components/
│           └── sealed-game-adapter.tsx
├── hooks/
│   └── use-sealed-game-contract.ts  # V3 hooks
├── components/
│   ├── game/               # Game UI components
│   ├── game-table/         # Table layout
│   └── ui/                 # shadcn components
└── contracts/
    └── generated/          # Auto-generated TypeScript bindings
```

### Key Hooks

```typescript
// Room management
useCreateRoomV3()      // Create sealed game room
useJoinRoomV3()        // Join existing room
useGetRoomV3(roomId)   // Fetch room state
useGetActiveRoomsV3()  // List all active rooms

// Game actions
useStartRoundV3()      // Start new round
usePlayTurnV3()        // Play card with commitment proof
useRespondGuardV3()    // Respond to Guard effect
useRespondBaronV3()    // Respond to Baron comparison
useResolveChancellorV3() // Resolve Chancellor choice

// Seal integration
useDecryptCards()      // Decrypt card values using Seal
usePendingActionV3()   // Check for pending actions
useChancellorStateV3() // Chancellor resolution state

// Leaderboard
useGetLeaderboardV3()  // Fetch leaderboard
useGetPlayerStatsV3()  // Fetch player statistics
```

## Getting Started

### Prerequisites

- Node.js >= 18
- Bun >= 1.2
- Sui CLI (for contract deployment)

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/relic-of-lies.git
cd relic-of-lies

# Install dependencies
bun install

# Generate TypeScript bindings (after contract deployment)
bun run codegen
```

### Development

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Lint & format
bun run format:fix
```

### Contract Deployment

```bash
cd apps/contract_v3

# Build contract
sui move build

# Deploy to testnet
sui client publish --gas-budget 100000000

# Update package ID in sui-provider.tsx
```

## Configuration

### Network Configuration (`apps/web/app/(root)/_components/sui-provider.tsx`)

```typescript
export const networkConfig = {
  testnet: {
    movePackageIdV3: "0x...",      // V3 contract package ID
    roomRegistryIdV3: "0x...",     // Room registry object ID
    leaderboardIdV3: "0x...",      // Leaderboard object ID
  },
};
```

### Seal Configuration

```typescript
export const DEFAULT_SEAL_CONFIG: SealConfig = {
  serverObjectIds: [
    "0x...",  // Seal server 1
    "0x...",  // Seal server 2
  ],
  threshold: 2,
};
```

## Security Model

### Current Approach: Commitment-Based Verification

Our architecture uses a **Cryptographic Commitment Scheme** to ensure game integrity while keeping all logic fully on-chain.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMMITMENT-BASED GAME ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ON-CHAIN (Stored in Smart Contract)                                        │
│  ───────────────────────────────────                                        │
│  • Room state & player addresses                                            │
│  • Card indices assigned to each player                                     │
│  • Deck values & secrets (generated by contract)                            │
│  • Commitments: hash(value || secret) for each card                         │
│  • Discarded cards (publicly revealed)                                      │
│  • All game rules enforced by contract                                      │
│                                                                             │
│  SECURITY GUARANTEE                                                         │
│  ─────────────────                                                          │
│  Players CANNOT lie about card values because:                              │
│  1. Contract generates values & secrets at round start                      │
│  2. When playing, player must provide value + secret                        │
│  3. Contract verifies: hash(value || secret) == stored commitment           │
│  4. If mismatch → transaction fails                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### How the Commitment Scheme Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMMITMENT SCHEME FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. ROUND START (Contract generates using Sui Random):                      │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  Card Index │ Value │ Secret (32 bytes)    │ Commitment          │       │
│  │─────────────│───────│──────────────────────│─────────────────────│       │
│  │      0      │   5   │ 0xabc123...          │ hash(5 || 0xabc123) │       │
│  │      1      │   3   │ 0xdef456...          │ hash(3 || 0xdef456) │       │
│  │      2      │   9   │ 0x789ghi...          │ hash(9 || 0x789ghi) │       │
│  │     ...     │  ...  │ ...                  │ ...                 │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  2. CARD DEALING:                                                           │
│     • Players receive card INDICES (e.g., player 1 gets card #0, #5)       │
│     • Frontend reads deck_values[index] and deck_secrets[index]            │
│     • Only the player's client shows them their actual card values          │
│                                                                             │
│  3. PLAYING A CARD:                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │  Player submits transaction:                                      │      │
│  │    - card_index = 0                                               │      │
│  │    - revealed_value = 5                                           │      │
│  │    - secret = 0xabc123...                                         │      │
│  │                                                                   │      │
│  │  Contract verifies:                                               │      │
│  │    blake2b256(5 || 0xabc123...) == commitments[0] ✓              │      │
│  │                                                                   │      │
│  │  ✓ Match → Execute card effect                                    │      │
│  │  ✗ No match → Transaction ABORTED (cheating detected)             │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why This is Secure

#### 1. Players Cannot Lie About Card Values

```move
// In play_turn():
let expected_commitment = commitments[card_index];
let actual_commitment = create_commitment(revealed_value, secret);
assert!(expected_commitment == actual_commitment, E_INVALID_COMMITMENT);
```

The commitment was created by the **contract itself** at round start. Players don't know other players' secrets, so they cannot forge a valid commitment for a different card value.

#### 2. Secrets Are Unpredictable

Each card's secret is a **32-byte random value** generated using Sui's on-chain randomness:

```move
// In start_round():
let mut random_generator = random::new_generator(r, ctx);
let secrets = generate_secrets(&mut random_generator, deck_size);
```

- Secrets are generated AFTER players join (no pre-computation)
- Uses Sui Random (VRF-based, unpredictable)
- Each card has a unique secret

#### 3. Commitments Are One-Way

```move
public fun create_commitment(value: u8, secret: &vector<u8>): vector<u8> {
    let mut data = vector::empty<u8>();
    vector::push_back(&mut data, value);
    vector::append(&mut data, *secret);
    blake2b256(&data)  // One-way hash function
}
```

Given a commitment, it's computationally infeasible to:
- Find the original value without the secret
- Find a different (value, secret) pair that produces the same commitment

#### 4. All Game Logic is On-Chain

```move
// Countess rule - MUST play Countess if holding King or Prince
if (has_card_value(player, COUNTESS) && 
    (has_card_value(player, KING) || has_card_value(player, PRINCE))) {
    assert!(revealed_value == COUNTESS, E_MUST_PLAY_COUNTESS);
}

// Turn validation
assert!(room.current_turn % players_count == player_idx, E_NOT_YOUR_TURN);

// Card ownership
assert!(vector::contains(&player.hand, &card_index), E_CARD_NOT_IN_HAND);
```

**Everything is enforced by the smart contract:**
- Turn order
- Card ownership
- Game rules (Countess, Princess elimination, etc.)
- Win conditions
- Token distribution

### Security Properties

| Property | How It's Achieved |
|----------|-------------------|
| **Integrity** | Commitment verification ensures truthful card plays |
| **Fairness** | Sui Random provides unbiased deck shuffling |
| **Immutability** | Blockchain state cannot be modified after commit |
| **Transparency** | All rules are in open-source smart contract |
| **Atomicity** | Sui transactions are all-or-nothing |

### Attack Prevention

| Attack Vector | Protection |
|---------------|------------|
| **Lie about card value** | Commitment verification fails → tx aborted |
| **Play card you don't own** | `player.hand.contains(card_index)` check |
| **Play out of turn** | `current_turn % player_count == your_index` check |
| **Replay transaction** | Sui's transaction uniqueness (object versions) |
| **Front-run to see cards** | Commitments locked at round start, values revealed only when played |
| **Predict deck order** | Sui Random (VRF) is unpredictable |

### Trust Assumptions

1. **Sui Network**: Consensus is honest (standard blockchain assumption)
2. **Sui Random**: VRF provides unbiased, unpredictable randomness
3. **Cryptography**: Blake2b256 is collision-resistant and pre-image resistant
4. **Client Honesty**: Players don't share their card info with opponents (social, not cryptographic)

### Why Fully On-Chain?

**All critical game state and logic lives in the smart contract:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    FULLY ON-CHAIN BENEFITS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓ No centralized server to trust or maintain                  │
│  ✓ Game rules are transparent and auditable                    │
│  ✓ No single point of failure                                  │
│  ✓ Censorship resistant                                        │
│  ✓ Provably fair (randomness from Sui VRF)                     │
│  ✓ Immutable game history                                      │
│  ✓ Composable with other Sui protocols                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Comparison with Alternatives

| Approach | Verifiable | Decentralized | Complexity | Our Choice |
|----------|------------|---------------|------------|------------|
| Centralized server | ❌ | ❌ | Low | ❌ |
| Client-side only | ❌ | ✅ | Low | ❌ |
| Zero-Knowledge Proofs | ✅ | ✅ | Very High | ❌ |
| **Commitment Scheme** | ✅ | ✅ | Medium | ✅ |

**Why Commitments over ZK Proofs?**
- Simpler implementation and auditing
- Lower gas costs
- Faster transaction times
- Sufficient for card game use case (don't need to hide computation, just values)

## Project Structure

```
relic-of-lies/
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── contract_v3/         # Sui Move contracts (sealed)
│   └── seal/                # Seal protocol reference
├── packages/
│   ├── biome-config/        # Linting configuration
│   ├── eslint-config/       # ESLint configuration
│   └── typescript-config/   # TypeScript configuration
├── scripts/
│   └── fix-codegen-imports.js
├── turbo.json               # Turbo build configuration
├── biome.json               # Biome configuration
└── sui-codegen.config.ts    # TypeScript codegen config
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Love Letter](https://www.zmangames.com/en/games/love-letter/) by Z-Man Games
- [Sui Network](https://sui.io/)
- [Seal Protocol](https://github.com/MystenLabs/seal)
