# Love Letter V3 - Sealed Game Contract

Game Love Letter với **Seal Integration** để ẩn thông tin bài và verify on-chain.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SEALED GAME ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ON-CHAIN (Public)                    OFF-CHAIN (Private via Seal)          │
│  ─────────────────                    ────────────────────────────          │
│  • Room state                         • Card values (encrypted)             │
│  • Player addresses                   • Deck order (encrypted)              │
│  • Card indices (not values!)         • Hand viewing via Seal SDK           │
│  • Commitments: hash(value||secret)   • Card decryption                     │
│  • Discarded cards (revealed)                                               │
│  • Game rules enforcement                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Modules

### `constants.move`
Game constants: card types, counts, status codes, etc.

### `error.move`
Error codes and validation functions.

### `events.move`
All game events for frontend tracking.

### `utils.move`
- Deck creation and shuffling
- Commitment functions: `create_commitment()`, `verify_commitment()`
- Seal ID helpers: `build_seal_id()`, `extract_card_index_from_seal_id()`
- Vector utilities

### `seal_access.move`
Seal access control:
- `SealAccessState` - tracks card ownership and temporary access
- `register_card()` - register card ownership
- `transfer_ownership()` / `swap_ownership()` - for King effect
- `grant_temporary_access()` - for Priest effect
- `can_access_card()` - check if player can decrypt

### `sealed_game.move`
Main game logic:
- `create_room()` - create game room with Seal namespace
- `join_room()` - join existing room
- `start_round()` - shuffle deck, create commitments, deal cards
- `play_turn()` - play card with commitment verification
- `respond_guard()` / `respond_baron()` - respond to card effects
- `seal_approve_card()` - entry function for Seal servers

### `leaderboard.move`
Player statistics and rankings.

## Game Flow

### 1. Setup
```
create_room() → join_room() → start_round()
```

### 2. Start Round
- Deck shuffled on-chain with Sui Random
- Secret generated for each card
- Commitment created: `hash(card_value || secret)`
- Cards dealt (indices only, not values)
- Seal access registered for each player's cards

### 3. View Cards (Off-chain)
```typescript
// Frontend calls Seal to decrypt
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::sealed_game::seal_approve_card`,
  args: [tx.pure.vector('u8', sealId), tx.object(roomId)],
});

const decrypted = await sealClient.decrypt({
  data: encryptedCardData,
  sessionKey,
  txBytes,
});
```

### 4. Play Turn
```
play_turn(
  card_index,      // Which card to play
  revealed_value,  // Card value (0-9)
  secret,          // 32-byte secret for verification
  target_idx,      // Target player (optional)
  guess,           // Guard guess (optional)
)
```

Contract verifies: `hash(revealed_value || secret) == commitments[card_index]`

### 5. Card Effects

| Card | Effect | Implementation |
|------|--------|----------------|
| Spy (0) | Bonus at round end | Track `has_played_spy` |
| Guard (1) | Guess card | `pending_action` → `respond_guard()` |
| Priest (2) | View card | `grant_temporary_access()` via Seal |
| Baron (3) | Compare | `pending_action` → `respond_baron()` |
| Handmaid (4) | Immune | Set `is_immune = true` |
| Prince (5) | Force discard | Reveal discarded card |
| Chancellor (6) | Draw 2, keep 1 | `resolve_chancellor()` |
| King (7) | Swap hands | `swap_ownership()` in Seal |
| Countess (8) | Must discard | Checked in `play_turn()` |
| Princess (9) | Eliminated | Auto-eliminate on discard |

## Security

### Commitment Scheme
- Each card has: `commitment = blake2b256(value || secret)`
- Player cannot lie about card value
- Secret is 32 bytes random

### Seal Access Control
- Only card owner can decrypt
- Priest grants temporary access (expires after N turns)
- King swaps ownership atomically
- Discarded cards are revealed publicly

## Build

```bash
cd apps/contract_v3
sui move build
```

## Deploy

```bash
sui client publish --gas-budget 100000000
```

## Frontend Integration

See `apps/seal/frontend/src` for Seal SDK usage examples.

Key functions:
- `SealClient.encrypt()` - encrypt card data
- `SealClient.decrypt()` - decrypt with session key
- `SessionKey.create()` - create session for decryption
