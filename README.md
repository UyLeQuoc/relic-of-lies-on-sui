# Relic of Lies - Love Letter Card Game on Sui

A decentralized implementation of the classic **Love Letter** card game on the **Sui blockchain**, featuring **Seal Protocol** for card privacy and cryptographic verification.

## Overview

Relic of Lies brings the beloved Love Letter card game to Web3 with a unique twist: **your cards are truly private**. Using the Seal threshold decryption protocol, only you can see your hand until cards are played and verified on-chain.

### Key Features

- **Private Hands**: Card values are encrypted and only visible to their owners
- **On-Chain Verification**: Commitment scheme ensures players cannot lie about card values
- **Real-Time Multiplayer**: 2-4 players per game room
- **Leaderboard**: Track wins, losses, and player rankings
- **Modern UI**: Beautiful, responsive interface with animations

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
| **Seal Protocol** | Threshold decryption for card privacy |

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

### Why This Architecture is Secure AND Fully On-Chain

Traditional blockchain games face a fundamental dilemma: **transparency vs. privacy**. Blockchains are inherently public - anyone can read all data. For card games, this means opponents could see your hand by reading the blockchain state.

Our solution combines **Seal Protocol** with a **Commitment Scheme** to achieve both privacy AND full on-chain verification.

#### The Problem with Traditional Approaches

| Approach | Privacy | Verifiable | Decentralized |
|----------|---------|------------|---------------|
| Store cards in plaintext | ❌ | ✅ | ✅ |
| Use centralized server | ✅ | ❌ | ❌ |
| Client-side only | ✅ | ❌ | ❌ |
| **Our Approach (Seal + Commitments)** | ✅ | ✅ | ✅ |

### How Seal Protocol Enables Privacy

**Seal** is a threshold decryption system built on Sui. Here's how it works:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SEAL DECRYPTION FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. ENCRYPTION (Game Start)                                                 │
│     ┌──────────┐                                                            │
│     │ Card Data │──▶ Encrypt with Seal ──▶ Store encrypted blob            │
│     │ (value=5) │    (threshold keys)       (on Walrus/IPFS)               │
│     └──────────┘                                                            │
│                                                                             │
│  2. ACCESS REQUEST (Player wants to see their card)                         │
│     ┌──────────┐     ┌──────────────┐     ┌──────────────┐                 │
│     │  Player  │────▶│ Seal Server  │────▶│ Smart Contract│                │
│     │          │     │ (asks: can   │     │ (seal_approve) │                │
│     │          │     │  they access?)│     │               │                │
│     └──────────┘     └──────────────┘     └──────────────┘                 │
│                              │                    │                         │
│                              │◀───────────────────┘                         │
│                              │  "Yes, player owns card #3"                  │
│                              ▼                                              │
│                       Return decryption key share                           │
│                                                                             │
│  3. THRESHOLD DECRYPTION                                                    │
│     Player collects key shares from multiple Seal servers                   │
│     (e.g., 2 of 3 servers must approve)                                     │
│     Combines shares to decrypt card data locally                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Security Properties:**

1. **No Single Point of Failure**: Multiple independent Seal servers must agree
2. **On-Chain Access Control**: The `seal_approve_card` function in our contract determines who can decrypt
3. **Trustless**: Seal servers cannot see the decrypted data - they only provide key shares
4. **Dynamic Permissions**: Access can be granted/revoked (e.g., King swaps hands, Priest views card)

### How Commitments Enable Verification

Even with Seal hiding card values, we need to ensure players don't cheat when playing cards. This is where **cryptographic commitments** come in:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMMITMENT SCHEME                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ROUND START (Contract generates):                                          │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  Card Index │ Value │ Secret (32 bytes)    │ Commitment          │       │
│  │─────────────│───────│──────────────────────│─────────────────────│       │
│  │      0      │   5   │ 0xabc123...          │ hash(5 || 0xabc123) │       │
│  │      1      │   3   │ 0xdef456...          │ hash(3 || 0xdef456) │       │
│  │      2      │   9   │ 0x789ghi...          │ hash(9 || 0x789ghi) │       │
│  │     ...     │  ...  │ ...                  │ ...                 │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  WHAT'S STORED ON-CHAIN:                                                    │
│  • Card indices assigned to players (public)                                │
│  • Commitments for all cards (public)                                       │
│  • Values and secrets (private - only via Seal)                             │
│                                                                             │
│  WHEN PLAYER PLAYS A CARD:                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │  Player submits: card_index=0, value=5, secret=0xabc123...       │      │
│  │                                                                   │      │
│  │  Contract verifies:                                               │      │
│  │    hash(5 || 0xabc123...) == commitments[0] ✓                    │      │
│  │                                                                   │      │
│  │  If match: Card is valid, execute game logic                      │      │
│  │  If no match: Transaction fails, player caught cheating           │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why Players Cannot Cheat:**

1. **Cannot Lie About Card Value**: The commitment was created at round start with the true value
2. **Cannot Reuse Secrets**: Each card has a unique 32-byte random secret
3. **Cannot Predict Commitments**: Blake2b256 is a one-way hash function
4. **Cannot Modify History**: Blockchain is immutable

### Fully On-Chain Game Logic

All game rules are enforced by the smart contract:

```move
// Example: Countess rule enforcement
public fun play_turn(...) {
    // If player has Countess (8) with King (7) or Prince (5), MUST play Countess
    if (has_countess && (has_king || has_prince) && revealed_value != COUNTESS) {
        abort error::must_play_countess()
    }
    
    // Verify commitment before accepting the play
    assert!(verify_commitment(revealed_value, secret, commitments[card_index]), 
            error::invalid_commitment());
    
    // Execute card effect...
}
```

**What's Verified On-Chain:**
- Turn order and player validity
- Card ownership (player actually has the card)
- Commitment verification (card value is truthful)
- Game rules (Countess rule, elimination conditions, etc.)
- Win conditions and token distribution

### Security Comparison

| Attack Vector | Protection |
|---------------|------------|
| **Read opponent's hand from blockchain** | Card values encrypted via Seal |
| **Lie about card value when playing** | Commitment verification fails |
| **Play card you don't own** | On-chain ownership tracking |
| **Skip your turn / play out of order** | Turn validation in contract |
| **Collude with Seal server** | Threshold requirement (multiple servers) |
| **Replay old transactions** | Sui's transaction uniqueness |
| **Front-run card plays** | Commitment already locked at round start |

### Trust Assumptions

1. **Sui Network**: Consensus is honest (standard blockchain assumption)
2. **Seal Servers**: At least `threshold` servers are honest (e.g., 2 of 3)
3. **Cryptography**: Blake2b256 and Seal's encryption are secure
4. **Randomness**: Sui Random provides unbiased randomness for shuffling

### Why This is Better Than Alternatives

**vs. Centralized Server:**
- No single point of failure
- No trust in game operator
- Transparent, auditable rules

**vs. Zero-Knowledge Proofs:**
- Simpler implementation
- Lower computational cost
- Faster transactions
- Still achieves necessary privacy

**vs. Commit-Reveal (without Seal):**
- Players can see their cards immediately (no waiting for reveal phase)
- Dynamic access control (Priest can view, King can swap)
- Better UX while maintaining security

### On-Chain Security

1. **Commitment Verification**: Players cannot lie about card values
2. **State Validation**: All game rules enforced on-chain
3. **Access Control**: Only valid players can interact with rooms

### Off-Chain Security (Seal)

1. **Threshold Decryption**: Multiple Seal servers required
2. **Session Keys**: Time-limited decryption permissions
3. **Access Policies**: On-chain verification before decryption

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
