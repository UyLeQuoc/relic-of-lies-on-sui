# Relic of Lies - Technical Architecture

## Executive Summary

**Relic of Lies** is a fully on-chain card game deployed on the Sui blockchain, leveraging **Seal (Sui Encryption & Authentication Layer)** for on-chain card encryption. The game implements a cryptographic commitment scheme to ensure provably fair gameplay while maintaining card privacy through Identity-Based Encryption (IBE).

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐            │
│  │   Frontend   │◄────►│ Sui Network  │◄────►│ Seal Servers │            │
│  │  (Next.js)   │      │  (On-Chain)  │      │  (Key Mgmt)  │            │
│  └──────────────┘      └──────────────┘      └──────────────┘            │
│         │                      │                       │                   │
│         │                      │                       │                   │
│         └──────────────────────┴───────────────────────┘                   │
│                            │                                                │
│                            ▼                                                │
│                    ┌──────────────┐                                        │
│                    │   Walrus     │                                        │
│                    │  (Storage)   │                                        │
│                    └──────────────┘                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Fully On-Chain Game Logic**: All rules, state, and verification executed by smart contracts
2. **On-Chain Encryption**: Card values encrypted using Seal IBE, stored on-chain
3. **Privacy-Preserving**: Only card owners can decrypt their cards
4. **Provably Fair**: Commitment scheme prevents cheating
5. **Trustless**: No central authority required

---

## Technology Stack

### Frontend Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | React framework with App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **GSAP** | 3.14.2 | Advanced animations |
| **@mysten/dapp-kit** | 0.19.11 | Sui wallet integration |
| **@mysten/sui** | 1.45.2 | Sui SDK |
| **@mysten/seal** | Latest | Seal encryption/decryption SDK |

### Smart Contract Layer

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Language** | Sui Move | Smart contract language |
| **Randomness** | Sui Random (VRF) | Unbiased deck shuffling |
| **Cryptography** | Blake2b256 | Commitment hashing |
| **Encryption** | Seal IBE | On-chain card encryption |
| **Storage** | Sui Objects | Game state persistence |

### Infrastructure

| Service | Purpose |
|---------|---------|
| **Sui Network** | Blockchain layer (testnet/mainnet) |
| **Seal Key Servers** | Decryption key management (threshold: 2 of N) |
| **Walrus** | Encrypted blob storage (optional, for large data) |

---

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Location**: `apps/web/`

**Responsibilities**:
- User interface rendering
- User interaction handling
- Card encryption/decryption orchestration
- Real-time game state updates
- Animation and visual effects

**Key Components**:
```
apps/web/
├── app/(root)/
│   ├── game_v4/              # Game UI (Seal-enabled)
│   │   └── _components/
│   │       └── sealed-game-adapter-v4.tsx
│   └── rooms_v4/             # Room listing/creation
├── hooks/
│   ├── use-game-contract-v4.ts      # Game contract interactions
│   └── use-seal-client.ts           # Seal encryption/decryption
├── components/
│   └── common/game-ui/       # Reusable game UI components
└── contracts/
    └── generated/            # Auto-generated TypeScript bindings
```

### 2. Smart Contract Layer

**Location**: `apps/contract-v4/sources/`

**Responsibilities**:
- Game logic enforcement
- Card commitment verification
- Seal access control
- Player state management
- Win condition validation

**Module Structure**:
```move
apps/contract-v4/sources/
├── game.move           # Core game logic, turn management, card effects
├── decryptable.move    # On-chain encryption storage (ciphertext, hash, nonce)
├── seal_access.move    # Seal access control (ownership, temporary access)
├── deck.move           # Custom deck management
├── constants.move      # Game constants (card types, counts)
├── error.move          # Error codes
├── events.move         # On-chain events
├── utils.move          # Helper functions (hashing, Seal ID parsing)
├── leaderboard.move    # Player statistics
├── marketplace.move    # Card marketplace
└── gacha.move          # Card gacha system
```

### 3. Encryption Layer (Seal)

**Technology**: Seal IBE (Identity-Based Encryption)

**Responsibilities**:
- Encrypt card values on-chain
- Manage decryption key distribution
- Enforce access control policies
- Threshold decryption (2-of-N servers)

**Integration Points**:
- Frontend: `@mysten/seal` SDK for encryption/decryption
- Smart Contract: `seal_approve_card()` entry function for access verification

---

## Data Flow

### 1. Deck Submission Flow

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│ Frontend │                    │  Seal    │                    │  Sui     │
│          │                    │  SDK     │                    │ Network  │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                               │                               │
     │ 1. Generate deck              │                               │
     │ 2. For each card:             │                               │
     │    - Create plaintext         │                               │
     │    - Generate nonce           │                               │
     │    - Compute hash             │                               │
     │                               │                               │
     │ 3. Encrypt with Seal IBE ────►│                               │
     │    (plaintext → ciphertext)   │                               │
     │                               │                               │
     │ 4. Submit to contract ────────┼──────────────────────────────►│
     │    (ciphertext, hash, nonce)  │                               │
     │                               │                               │
     │                               │                               │ 5. Store on-chain
     │                               │                               │    - encrypted_cards
     │                               │                               │    - commitments
     │                               │                               │    - Seal access state
```

**Implementation**:
- **Frontend**: `useEncryptDeck()` hook in `use-seal-client.ts`
- **Contract**: `submit_deck()` function in `game.move`

### 2. Card Decryption Flow

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│ Frontend │                    │ Seal     │                    │ Sui      │
│          │                    │ Servers  │                    │ Network  │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                               │                               │
     │ 1. Create session key         │                               │
     │    (sign personal message)    │                               │
     │                               │                               │
     │ 2. Build approval tx ─────────┼──────────────────────────────►│
     │    (seal_approve_card call)   │                               │
     │                               │                               │
     │ 3. Fetch decryption keys ────►│ 4. Verify access ───────────►│
     │    (with tx bytes)            │    (simulate seal_approve)    │
     │                               │                               │
     │                               │ 5. Return key shares          │
     │ 6. Decrypt locally ◄──────────│                               │
     │    (threshold: 2 of N)        │                               │
```

**Implementation**:
- **Frontend**: `useDecryptCards()` hook in `use-seal-client.ts`
- **Contract**: `seal_approve_card()` entry function in `seal_access.move`

### 3. Card Play Flow

```
┌──────────┐                    ┌──────────┐
│ Frontend │                    │  Sui     │
│          │                    │ Network  │
└────┬─────┘                    └────┬─────┘
     │                               │
     │ 1. User selects card          │
     │    (cardIndex)                │
     │                               │
     │ 2. Decrypt card to get value  │
     │    (via Seal SDK)             │
     │                               │
     │ 3. Submit play_turn() ───────►│
     │    - cardIndex                │
     │    - revealedValue            │
     │    - plaintextData (for verif)│
     │                               │
     │                               │ 4. Verify commitment
     │                               │    blake2b256(plaintext || nonce) == hash
     │                               │
     │                               │ 5. Execute card effect
     │                               │    - Update game state
     │                               │    - Trigger card logic
     │                               │    - Emit events
```

**Implementation**:
- **Frontend**: `usePlayTurnV4()` hook in `use-game-contract-v4.ts`
- **Contract**: `play_turn()` function in `game.move`

---

## Security Model

### 1. Cryptographic Commitments

**Purpose**: Ensure players cannot lie about card values when playing.

**Implementation**:
```typescript
// Frontend: Create commitment
const plaintext = [cardValue, ...padding];
const nonce = randomBytes(32);
const hash = blake2b256(plaintext || nonce);
```

```move
// Contract: Verify commitment
fun verify_commitment(
    plaintext: vector<u8>,
    nonce: vector<u8>,
    expected_hash: vector<u8>
): bool {
    let hash_input = vector::append(plaintext, nonce);
    blake2b256(&hash_input) == expected_hash
}
```

**Security Properties**:
- One-way hash function (cannot reverse)
- Nonce prevents pre-computation attacks
- Contract verifies every play

### 2. Seal Identity-Based Encryption

**Purpose**: Encrypt card values so only owners can decrypt.

**Seal ID Format**:
```
[namespace (32 bytes: room ID)][card_index (8 bytes, big-endian)][nonce (5 bytes)]
```

**Access Control**:
- **Ownership**: Card assigned to player during deal
- **Temporary Access**: Granted for Priest effect (Healer viewing opponent's card)
- **Ownership Swap**: For Paladin effect (King trading hands)

**Implementation**:
```move
// seal_access.move
public entry fun seal_approve_card(
    seal_id: vector<u8>,
    room: &GameRoom,
    ctx: &TxContext
) {
    // Verify namespace (must match room ID)
    assert!(is_prefix(&room.id_bytes(), &seal_id), E_INVALID_NAMESPACE);
    
    // Extract card index
    let card_index = extract_card_index(seal_id);
    
    // Check access (owner or temporary access)
    assert!(can_access_card(&room.seal_access, ctx.sender(), card_index), E_NO_ACCESS);
}
```

### 3. Threshold Decryption

**Configuration**: 2-of-N Seal servers

**Security Model**:
- Multiple servers hold key shares
- Requires threshold (2) to decrypt
- Single server compromise doesn't break security
- Servers verify access via smart contract simulation

---

## Key Data Structures

### Smart Contract: `GameRoom`

```move
public struct GameRoom has key, store {
    id: UID,
    name: String,
    creator: address,
    players: vector<Player>,
    
    // Encrypted card storage
    encrypted_cards: vector<Decryptable>,  // ciphertext, hash, nonce
    commitments: vector<vector<u8>>,       // blake2b256(plaintext || nonce)
    
    // Deck management
    deck_indices: vector<u64>,
    discard_pile: vector<u8>,
    discarded_cards_log: vector<DiscardLog>,  // Game log
    
    // Seal access control
    seal_access: SealAccessState,  // Ownership, temporary access
    
    // Game state
    current_turn: u64,
    round_number: u64,
    status: u8,
    pending_action: Option<PendingAction>,
    
    // Win conditions
    tokens_to_win: u64,
    
    // ... other fields
}
```

### Smart Contract: `Decryptable`

```move
public struct Decryptable has store, copy, drop {
    ciphertext: vector<u8>,    // Seal-encrypted card data
    hash: vector<u8>,          // blake2b256(plaintext || nonce)
    nonce: vector<u8>,         // 32-byte random nonce
}
```

### Smart Contract: `SealAccessState`

```move
public struct SealAccessState has store, drop {
    card_ownership: vector<CardOwnership>,      // Who owns each card
    temporary_access: vector<TemporaryAccess>,  // Priest/Healer effect
}
```

### Frontend: `EncryptedCard`

```typescript
interface EncryptedCard {
  ciphertext: Uint8Array;  // Seal-encrypted data
  hash: Uint8Array;        // Commitment hash
  nonce: Uint8Array;       // Nonce for hash
}
```

### Frontend: `DecryptedCard`

```typescript
interface DecryptedCard {
  cardIndex: number;       // Card position in deck
  value: number;           // Card value (0-9), or -1 if unknown
  plaintext: Uint8Array;   // Full decrypted data
}
```

---

## Component Interaction

### Frontend Hooks Architecture

```
useSealClient()
    ├── Creates SealClient instance
    ├── Manages session keys
    └── Provides encryption/decryption methods

useEncryptDeck()
    ├── Shuffles deck
    ├── Encrypts each card (via Seal SDK)
    └── Returns encryptedCards array

useDecryptCards()
    ├── Creates/loads session key
    ├── Builds approval transaction
    ├── Fetches keys from Seal servers
    └── Decrypts cards locally

useGameContractV4()
    ├── useSubmitDeckV4()       → submit_deck()
    ├── usePlayTurnV4()         → play_turn()
    ├── useRespondGuardV4()     → respond_guard()
    ├── useRespondBaronV4()     → respond_baron()
    ├── useRespondPrinceV4()    → respond_prince()
    ├── useResolveChancellorV4()→ resolve_chancellor()
    └── useGetRoomV4()          → Query room state
```

### Smart Contract Module Dependencies

```
game.move
    ├── depends on: decryptable.move  (card storage)
    ├── depends on: seal_access.move  (access control)
    ├── depends on: utils.move        (hashing, helpers)
    ├── depends on: constants.move    (card types, counts)
    └── emits: events.move            (on-chain events)

decryptable.move
    └── Defines: Decryptable struct (ciphertext, hash, nonce)

seal_access.move
    ├── Defines: SealAccessState (ownership, temp access)
    └── Entry: seal_approve_card() (for Seal servers)
```

---

## Seal Encryption Flow Details

### Encryption (Deck Submission)

1. **Plaintext Creation**:
   ```typescript
   const plaintext = new Uint8Array(32);
   plaintext[0] = cardValue;  // Card value (0-9)
   // Remaining 31 bytes: padding/secret data
   ```

2. **Hash Computation**:
   ```typescript
   const hashNonce = randomBytes(32);
   const hashInput = concat(plaintext, hashNonce);
   const hash = blake2b256(hashInput);
   ```

3. **Seal ID Creation**:
   ```typescript
   const namespace = fromHex(roomId);  // 32 bytes
   const cardIndexBytes = bigEndianU64(cardIndex);  // 8 bytes
   const identityNonce = randomBytes(5);  // 5 bytes
   const sealId = concat(namespace, cardIndexBytes, identityNonce);
   ```

4. **Seal Encryption**:
   ```typescript
   const encrypted = await sealClient.encrypt({
     threshold: 2,
     packageId: MOVE_PACKAGE_ID,
     id: toHex(sealId),
     data: plaintext,
   });
   ```

5. **On-Chain Storage**:
   ```move
   encrypted_cards.push(Decryptable {
     ciphertext: encrypted.ciphertext,
     hash: hash,
     nonce: hashNonce,
   });
   ```

### Decryption (Card Viewing)

1. **Session Key Management**:
   ```typescript
   const sessionKey = await SessionKey.create({
     address: playerAddress,
     packageId: MOVE_PACKAGE_ID,
     ttlMin: 10,
   });
   await sessionKey.setPersonalMessageSignature(signature);
   ```

2. **Approval Transaction**:
   ```typescript
   const tx = new Transaction();
   tx.moveCall({
     target: `${PACKAGE_ID}::seal_access::seal_approve_card`,
     arguments: [
       tx.pure.vector('u8', fromHex(sealId)),
       tx.object(roomId),
     ],
   });
   const txBytes = await tx.build({ onlyTransactionKind: true });
   ```

3. **Key Fetching**:
   ```typescript
   await sealClient.fetchKeys({
     ids: [sealId],
     txBytes,
     sessionKey,
     threshold: 2,
   });
   ```

4. **Local Decryption**:
   ```typescript
   const decryptedData = await sealClient.decrypt({
     data: ciphertext,
     sessionKey,
     txBytes,
   });
   const cardValue = decryptedData[0];
   ```

---

## Deployment Architecture

### Network Configuration

**Testnet**:
- Sui Network: `testnet.sui.io`
- Seal Servers: Testnet key servers (2 of N)
- Walrus: `walrus-testnet.walrus.space` (if used)

**Mainnet** (Future):
- Sui Network: `mainnet.sui.io`
- Seal Servers: Mainnet key servers
- Walrus: Production Walrus instances

### Contract Deployment

1. **Build Contract**:
   ```bash
   cd apps/contract-v4
   sui move build
   ```

2. **Publish**:
   ```bash
   sui client publish --gas-budget 100000000
   ```

3. **Update Frontend Config**:
   ```typescript
   // apps/web/app/(root)/_components/sui-provider.tsx
   export const networkConfig = {
     testnet: {
       movePackageIdV4: "0x...",
       roomRegistryIdV4: "0x...",
       leaderboardIdV4: "0x...",
     },
   };
   ```

---

## Performance Considerations

### On-Chain Storage

- **Encrypted Cards**: Each card stored as `Decryptable` (ciphertext + hash + nonce)
- **Gas Costs**: Encryption storage requires additional gas for larger ciphertexts
- **Optimization**: Batching card submissions in single transaction

### Frontend Decryption

- **Session Key Caching**: Reuse session keys across decryption calls (TTL: 10 minutes)
- **Lazy Decryption**: Only decrypt cards when needed (player's hand)
- **Error Handling**: Gracefully handle decryption failures (show "???" for unknown cards)

### Scalability

- **Room Isolation**: Each room is independent (no cross-room dependencies)
- **Parallel Processing**: Multiple games can run simultaneously
- **State Queries**: Frontend polls room state via Sui RPC (can optimize with subscriptions)

---

## Security Considerations

### Threat Model

| Threat | Mitigation |
|--------|------------|
| **Card value cheating** | Commitment verification on-chain |
| **Unauthorized card viewing** | Seal access control + threshold decryption |
| **Replay attacks** | Sui transaction uniqueness |
| **Front-running** | Commitments locked before reveals |
| **Key server compromise** | Threshold scheme (2-of-N) |

### Audit Points

1. **Commitment Verification**: Ensure `blake2b256(plaintext || nonce) == hash` checked for every play
2. **Seal Access Control**: Verify `seal_approve_card()` correctly enforces ownership
3. **Game Logic**: All card effects correctly implemented
4. **State Transitions**: No invalid state transitions possible

---

## Future Enhancements

### Potential Improvements

1. **Walrus Integration**: Store large encrypted blobs off-chain, reference on-chain
2. **Indexer Integration**: Use Sui indexer for faster state queries
3. **WebSocket Subscriptions**: Real-time room state updates (when Sui supports)
4. **Cross-Chain**: Support multiple chains via bridge protocols
5. **Tournament System**: Multi-room tournaments with brackets

---

## References

- [Sui Documentation](https://docs.sui.io/)
- [Seal Protocol](https://github.com/MystenLabs/seal)
- [Sui Move Language](https://move-language.github.io/move/)
- [Relic of Lies Game Rules](https://www.zmangames.com/en/games/love-letter/)

---

**Last Updated**: January 2026  
**Version**: v4 (Seal-Integrated)
