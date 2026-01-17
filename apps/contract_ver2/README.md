# Relic of Lies - ZK Version (contract_ver2)

Zero-Knowledge Proof implementation for Love Letter card game on Sui blockchain.

## Overview

This version implements hidden card information using **commitments** and **ZK proofs** instead of storing plaintext cards on-chain.

### Key Differences from v1

| Aspect | v1 (Original) | v2 (ZK Version) |
|--------|---------------|-----------------|
| **Card Storage** | Plaintext `hand: vector<u8>` | Commitment `card_commitment: vector<u8>` |
| **Card Verification** | Direct comparison | ZK proof verification |
| **Privacy** | Cards visible on-chain | Cards hidden, only commitments public |
| **Card Effects** | Immediate execution | Async (pending action → proof → result) |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZK GAME FLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. ROUND START                                                 │
│     - Dealer shuffles deck off-chain                           │
│     - Dealer commits to deck (Merkle root)                     │
│     - Each player receives card + commits hash(card || salt)   │
│                                                                 │
│  2. PLAY TURN                                                   │
│     - Player reveals card being played                         │
│     - Player updates commitment for remaining card             │
│     - Some cards trigger pending action                        │
│                                                                 │
│  3. RESPOND TO ACTION (if needed)                              │
│     - Target generates ZK proof                                │
│     - Proof verifies statement without revealing card          │
│     - Contract applies result                                  │
│                                                                 │
│  4. TIMEOUT HANDLING                                           │
│     - If target doesn't respond within deadline                │
│     - Target is eliminated                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Card Effects & ZK Requirements

| Card | Effect | ZK Proof Needed |
|------|--------|-----------------|
| **Spy (0)** | Bonus at round end | ❌ Just track who played |
| **Guard (1)** | Guess opponent's card | ✅ Prove guess correct/wrong |
| **Priest (2)** | View opponent's card | ❌ Off-chain encrypted reveal |
| **Baron (3)** | Compare hands | ✅ Prove comparison result |
| **Handmaid (4)** | Become immune | ❌ No proof needed |
| **Prince (5)** | Force discard | ⚠️ Reveal discarded card |
| **Chancellor (6)** | Draw and choose | ⚠️ Complex state management |
| **King (7)** | Swap hands | ⚠️ Swap commitments |
| **Countess (8)** | Must discard with K/P | ❌ Client-side enforcement |
| **Princess (9)** | Eliminated if discarded | ❌ Revealed when played |

## Structs

### Player (ZK Version)

```move
public struct Player has store, copy, drop {
    addr: address,
    card_commitment: vector<u8>,  // hash(card || salt), 32 bytes
    hand_count: u8,               // 1 or 2 cards
    discarded: vector<u8>,        // Public - revealed cards
    is_alive: bool,
    is_immune: bool,
    tokens: u8,
    has_played_spy: bool,
}
```

### PendingAction

```move
public struct PendingAction has store, copy, drop {
    action_type: u8,          // GUARD, BARON, PRINCE, KING, CHANCELLOR
    initiator_idx: u64,
    target_idx: u64,
    guess: Option<u8>,        // For Guard
    deadline: u64,            // Timestamp
    extra_data: vector<u8>,
}
```

## API

### Round Start

```move
public fun start_round(
    room: &mut ZKGameRoom,
    deck_commitment: vector<u8>,      // Merkle root of shuffled deck
    player_commitments: vector<vector<u8>>, // Each player's card commitment
    public_cards: vector<u8>,         // For 2-player games
    ctx: &mut TxContext,
)
```

### Play Turn

```move
public fun play_turn(
    room: &mut ZKGameRoom,
    card: u8,                         // Card being played (revealed)
    new_commitment: vector<u8>,       // Commitment for remaining card
    target_idx: Option<u64>,
    guess: Option<u8>,                // For Guard
    clock: &Clock,
    ctx: &mut TxContext,
)
```

### Respond to Guard

```move
public fun respond_guard(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    vk: &ZKVerificationKeys,
    proof: vector<u8>,                // ZK proof
    is_correct: bool,                 // Public output
    ctx: &mut TxContext,
)
```

### Respond to Baron

```move
public fun respond_baron(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    vk: &ZKVerificationKeys,
    proof: vector<u8>,
    result: u8,                       // 0=initiator wins, 1=target wins, 2=tie
    ctx: &mut TxContext,
)
```

## Client-Side Implementation

The client needs to:

1. **Generate commitments**: `commitment = poseidon_hash(card, salt)`
2. **Generate ZK proofs**: Using snarkjs or similar library
3. **Handle encrypted reveals**: For Priest card effect
4. **Manage timeouts**: Respond before deadline

### Example Client Flow

```typescript
// 1. Receive card from dealer (encrypted)
const card = decrypt(encryptedCard, myPrivateKey);
const salt = randomBytes(32);
const commitment = poseidonHash([card, ...salt]);

// 2. Submit commitment
await contract.updateCommitment(commitment);

// 3. When targeted by Guard
const isCorrect = myCard === guessedCard;
const proof = await generateGuardProof({
  card: myCard,
  salt: mySalt,
  commitment: myCommitment,
  guessedCard,
  isCorrect,
});
await contract.respondGuard(proof, isCorrect);
```

## ZK Circuits (TODO)

Circuits to be implemented in Circom:

1. **guard_response.circom**: Prove guess is correct/wrong
2. **baron_compare.circom**: Prove comparison result
3. **card_ownership.circom**: Prove card matches commitment

## Build & Test

```bash
cd apps/contract_ver2
sui move build
sui move test
```

## Deployment

```bash
sui client publish --gas-budget 100000000
```

## Security Considerations

1. **Commitment binding**: Once committed, player cannot change their card
2. **Timeout protection**: Non-responsive players are eliminated
3. **Dealer trust**: Dealer sees all cards during dealing (semi-trusted)
4. **Proof verification**: Groth16 proofs verified on-chain

## Future Improvements

1. **Full ZK proof verification**: Currently trusting client's output
2. **Mental poker protocol**: Remove dealer trust requirement
3. **Optimistic execution**: Assume honest, challenge if cheating detected
4. **Batch proofs**: Combine multiple proofs for gas efficiency
