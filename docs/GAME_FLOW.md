# Relic of Lies - Basic Game Flow

## Overview

Relic of Lies is a strategic card game for 2-4 players where you must eliminate opponents or collect 3 Relics to win. Each card has unique abilities that can help you or harm your opponents.

---

## Game Setup

### 1. Room Creation
- Player creates a room (Free fee)
- Sets room name and max players (2-4)
- Room is created as a shared object on Sui blockchain

### 2. Players Join
- Other players join the room (each pays 0.0 SUI)
- Entry fees accumulate in the prize pool
- Game starts when minimum 2 players join

### 3. Deck Submission
- **Encryption Phase**: Each card is encrypted using Seal IBE
  - Card value (0-9) is encrypted into ciphertext
  - Hash commitment: `blake2b256(plaintext || nonce)`
  - Stored on-chain as `Decryptable` (ciphertext, hash, nonce)
- **Deck Composition**: 21 cards total
  - Scout (0): 2 cards
  - Knight (1): 6 cards
  - Healer (2): 2 cards
  - Berserker (3): 2 cards
  - Cleric (4): 2 cards
  - Wizard (5): 2 cards
  - Tactician (6): 2 cards
  - Paladin (7): 1 card
  - Cursed Idol (8): 1 card
  - Sacred Crystal (9): 1 card

### 4. Round Start
- Deck is shuffled using Sui Random (VRF)
- Each player receives 1 card (encrypted)
- Seal access control assigns ownership
- Burn card is removed (face-down)
- For 2-player games: 3 cards revealed face-up

---

## Turn Structure

### Turn Order
- Players take turns in order (round-robin)
- Turn number increments: `current_turn % player_count == your_index`

### On Your Turn

1. **View Your Hand**
   - Frontend decrypts your card using Seal SDK
   - Only you can see your card value
   - Other players see "???" for your card

2. **Play a Card**
   - Select a card from your hand
   - Choose target player (if required)
   - Submit `play_turn()` transaction:
     - `card_index`: Which card to play
     - `revealed_value`: Card value (0-9)
     - `plaintext_data`: Full decrypted data for verification
     - `target_idx`: Target player (optional)
     - `guess`: Card guess for Knight (optional)

3. **Commitment Verification**
   - Contract verifies: `blake2b256(plaintext_data || nonce) == stored_hash`
   - If mismatch → transaction fails (cheating detected)
   - If match → card effect executes

4. **Card Effect Executes**
   - Card is moved to discard pile
   - Effect triggers (see Card Effects below)
   - Game state updates
   - Turn advances

---

## Card Effects

### Scout (Value 0)
- **Effect**: No immediate effect
- **Bonus**: At round end, if ONLY you played/hold Scout → +1 Relic

### Knight (Value 1)
- **Effect**: Guess a non-Knight card. If target holds it → they're eliminated
- **Response**: Target must reveal their card (auto-responded)

### Healer (Value 2)
- **Effect**: Privately view another player's hand
- **Access**: Temporary Seal access granted (expires after your next turn)
- **UI**: Modal shows opponent's card

### Berserker (Value 3)
- **Effect**: Compare hands with target. Lower card value → eliminated
- **Response**: Both players reveal cards (auto-responded)

### Cleric (Value 4)
- **Effect**: Immune to all card effects until your next turn
- **State**: `is_immune = true` set on player

### Wizard (Value 5)
- **Effect**: Choose any player. They discard their card and draw a new one
- **Response**: Target discards and draws (auto-responded)

### Tactician (Value 6)
- **Effect**: Draw 2 cards, keep 1, return 2 to bottom of deck in any order
- **Resolution**: Player chooses which card to keep via `resolve_chancellor()`

### Paladin (Value 7)
- **Effect**: Swap hands with another player
- **Access**: Seal ownership swapped between players

### Cursed Idol (Value 8)
- **Effect**: Must be discarded if you have Wizard or Paladin
- **Rule**: If holding Cursed Idol + (Wizard OR Paladin) → MUST play Cursed Idol

### Sacred Crystal (Value 9)
- **Effect**: If discarded (by you or forced) → you are eliminated
- **Auto-Elimination**: Triggered on discard

---

## Round End Conditions

### Win Conditions
1. **Last Player Standing**: All other players eliminated → you win
2. **Deck Empty**: When deck runs out, highest hand value wins
   - Tiebreaker: Compare sum of discarded cards

### Round End Process
1. Check for Scout bonus (if applicable)
2. Award 1 Relic to round winner
3. Update player statistics
4. Check if any player has 3 Relics → Game End
5. If not, start new round (players submit new decks)

---

## Game End

### Victory
- First player to collect **3 Relics** wins the game
- Prize pool distributed to winner
- Leaderboard updated

### New Game
- `start_new_game()` resets all state
- New prize pool starts
- Players can continue or leave

---

## Special Rules

### Cursed Idol Rule
- If you have Cursed Idol AND (Wizard OR Paladin) → MUST play Cursed Idol
- UI enforces this (other cards grayed out)

### Scout Bonus
- Only awarded if EXACTLY ONE player qualifies
- If multiple players have Scout → no bonus

### 2-Player Game
- 3 cards revealed face-up at start
- Provides more information for strategy

### Pending Actions
- Some cards require responses (Knight, Berserker, Wizard)
- `PendingAction` struct tracks who needs to respond
- Auto-responded by frontend when card is decrypted

---

## Privacy & Security

### Card Encryption
- All cards encrypted on-chain using Seal IBE
- Only card owner can decrypt (via Seal SDK)
- Contract verifies decryption via hash commitment

### Access Control
- Seal access control enforces ownership
- Temporary access for Healer effect
- Ownership swap for Paladin effect

### Commitment Scheme
- Prevents cheating: `blake2b256(plaintext || nonce) == hash`
- Contract verifies every card play
- Cannot lie about card values

---

## State Management

### On-Chain State
- `GameRoom`: Shared object containing all game state
- `encrypted_cards`: Vector of `Decryptable` (encrypted cards)
- `seal_access`: Access control state
- `players`: Player states (hand indices, tokens, etc.)
- `pending_action`: Current pending action (if any)

### Frontend State
- Decrypted cards cached locally
- Session keys reused (TTL: 10 minutes)
- Real-time room state polling

---

## Example Turn Sequence

```
Turn 1: Alice
- Hand: [Knight (1)]
- Plays Knight, guesses "Healer" on Bob
- Contract verifies commitment ✓
- Bob's card revealed: Healer (2) → Bob eliminated

Turn 2: Charlie
- Hand: [Cleric (4)]
- Plays Cleric
- Contract verifies commitment ✓
- Charlie becomes immune

Turn 3: Alice
- Hand: [Tactician (6)]
- Plays Tactician
- Draws 2 cards, keeps 1
- Returns 2 to bottom of deck

... continues until round end
```

---

**Last Updated**: January 2026
