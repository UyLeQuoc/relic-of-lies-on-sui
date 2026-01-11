# 🎴 Relic of Lies - Love Letter 2019 Premium Edition

A fully on-chain implementation of the **Love Letter 2019 Premium Edition** card game built on Sui blockchain.

## 🎮 Game Overview

Love Letter is a game of risk, deduction, and luck. The goal is to be the last player standing or hold the highest-value card when the deck runs out.

### Key Features
- **Players**: 2-4 per room
- **Entry Fee**: 0.1 SUI
- **Cards**: 21 cards, 10 types (2019 Premium Edition)
- **Token System**: Win 3 tokens to win the game
- **Spy Bonus**: Unique end-of-round bonus mechanic
- **Winner Takes All**: Prize pool goes to the final winner

## 📦 Module Structure

```
sources/
├── constants.move    # Game constants (fees, card values, status codes)
├── error.move        # Error codes for assertions
├── events.move       # Events for frontend/match history
├── utils.move        # Deck creation, shuffling, helpers
├── leaderboard.move  # Global rankings (shared object)
├── game.move         # Core game logic & card effects
└── app.move          # Clean API entry points
```

## 🃏 Card Effects (2019 Premium Edition)

| Card | Value | Count | Effect |
|------|-------|-------|--------|
| **Spy** | 0 | 2 | No immediate effect. At round end, if you're the ONLY player who played/holds Spy, gain +1 token |
| **Guard** | 1 | 6 | Guess a player's card (not Guard). If correct, they're eliminated |
| **Priest** | 2 | 2 | Look at another player's hand |
| **Baron** | 3 | 2 | Compare hands with a player. Lower value is eliminated |
| **Handmaid** | 4 | 2 | Immune to targeting until your next turn |
| **Prince** | 5 | 2 | Choose any player to discard and draw. If Princess discarded, eliminated |
| **Chancellor** | 6 | 2 | Draw 2 cards, keep 1, return 2 to bottom of deck |
| **King** | 7 | 1 | Trade hands with another player |
| **Countess** | 8 | 1 | Must be discarded if you have King or Prince |
| **Princess** | 9 | 1 | If discarded (by you or forced), you are eliminated |

**Total**: 21 cards

## 🏆 Token System

- **Round Win**: +1 token
- **Spy Bonus**: +1 token (if ONLY you played/hold Spy)
- **Game Win**: First to collect 3 tokens wins the prize pool

## 🎯 Game Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. CREATE ROOM                                             │
│     create_room("My Room", 4)                               │
│     → Creates shared GameRoom object                        │
├─────────────────────────────────────────────────────────────┤
│  2. JOIN ROOM                                               │
│     join_room(room, 0.1 SUI)                                │
│     → Players join and pay entry fee                        │
├─────────────────────────────────────────────────────────────┤
│  3. START ROUND                                             │
│     start_round(room, random)                               │
│     → Shuffle 21 cards, burn 1, deal 1 each                 │
│     → For 2 players: reveal 3 public cards                  │
├─────────────────────────────────────────────────────────────┤
│  4. PLAY TURNS                                              │
│     play_turn(room, card, target?, guess?)                  │
│     → Clear immunity, draw card, play card, execute effect  │
│     → Special: Chancellor requires resolve_chancellor()     │
├─────────────────────────────────────────────────────────────┤
│  5. ROUND END                                               │
│     → Last player alive OR highest card when deck empty     │
│     → Tiebreaker: sum of discarded cards                    │
│     → Winner gets +1 token                                  │
│     → Check Spy bonus (only 1 player = +1 token)            │
├─────────────────────────────────────────────────────────────┤
│  6. GAME END                                                │
│     → First to 3 tokens wins                                │
│     → Winner receives entire prize pool                     │
│     → Leaderboard updated                                   │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Data Structures

### GameRoom (Shared Object)
```move
public struct GameRoom has key {
    id: UID,
    name: String,
    creator: address,
    pot: Balance<SUI>,
    players: vector<Player>,
    deck: vector<u8>,
    burn_card: Option<u8>,
    public_cards: vector<u8>,    // For 2-player games
    status: u8,                   // 0=waiting, 1=playing, 2=round_end, 3=finished
    current_turn: u64,
    max_players: u8,
    round_number: u8,
    tokens_to_win: u8,            // Default: 3
    // Chancellor state
    chancellor_pending: bool,
    chancellor_player_idx: u64,
    chancellor_cards: vector<u8>,
}
```

### Player
```move
public struct Player has store, copy, drop {
    addr: address,
    hand: vector<u8>,
    discarded: vector<u8>,
    is_alive: bool,
    is_immune: bool,
    tokens: u8,
    has_played_spy: bool,         // Track for Spy bonus
}
```

## 🚀 Deployment

### Build
```bash
sui move build
```

### Test
```bash
sui move test
```

### Deploy
```bash
sui client publish --gas-budget 100000000
```

On deployment, two shared objects are automatically created:
- **RoomRegistry** - Tracks all active game rooms
- **Leaderboard** - Global player rankings

## 📡 Frontend Integration

### Create Room
```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::app::create_room`,
  arguments: [
    tx.object(REGISTRY_ID),
    tx.pure.string("My Room"),
    tx.pure.u8(4),
  ],
});
```

### Join Room
```typescript
const tx = new Transaction();
const [coin] = tx.splitCoins(tx.gas, [100_000_000]); // 0.1 SUI
tx.moveCall({
  target: `${PACKAGE_ID}::app::join_room`,
  arguments: [
    tx.object(ROOM_ID),
    coin,
  ],
});
```

### Start Round
```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::app::start_round`,
  arguments: [
    tx.object(ROOM_ID),
    tx.object("0x8"),  // Random object
  ],
});
```

### Play Turn
```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::app::play_turn`,
  arguments: [
    tx.object(ROOM_ID),
    tx.object(LEADERBOARD_ID),
    tx.pure.u8(1),                    // card (Guard)
    tx.pure.option("u64", 1),         // target player index
    tx.pure.option("u8", 5),          // guess (Prince)
    tx.object("0x8"),                 // Random object
  ],
});
```

### Resolve Chancellor
```typescript
// After playing Chancellor, must call this to complete the action
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::app::resolve_chancellor`,
  arguments: [
    tx.object(ROOM_ID),
    tx.object(LEADERBOARD_ID),
    tx.pure.u8(3),                    // card to keep
    tx.pure.vector("u8", [5, 2]),     // cards to return to deck bottom
  ],
});
```

### Query Functions
```typescript
// Get room info
app::get_room_info(room)
// Returns: (room_id, name, creator, pot_value, status, current_players, max_players, round_number, tokens_to_win)

// Get game state
app::get_game_state(room)
// Returns: (current_turn, current_player, deck_size, alive_count, chancellor_pending)

// Get public cards (2-player games)
app::get_public_cards(room)
// Returns: vector<u8>

// Get your hand
app::get_my_hand(room, ctx)
// Returns: vector<u8>

// Get player tokens
app::get_player_tokens(room, player_address)
// Returns: u8

// Get Chancellor cards (when pending)
app::get_chancellor_cards(room, ctx)
// Returns: vector<u8>

// Get leaderboard
app::get_top_players(leaderboard, 10)
// Returns: vector<PlayerRecord>
```

## 📊 Events

| Event | Fields |
|-------|--------|
| `RoomCreated` | room_id, creator, room_name, max_players, bet_amount, tokens_to_win |
| `PlayerJoined` | room_id, player, current_players, max_players |
| `RoundStarted` | room_id, round_number, players, first_player, public_cards |
| `TurnPlayed` | room_id, player, card_played, target, guess, result |
| `PlayerEliminated` | room_id, player, eliminated_by, card_used |
| `RoundEnded` | room_id, round_number, winner, winning_card, spy_bonus_player |
| `TokenAwarded` | room_id, player, token_count, reason |
| `GameEnded` | room_id, winner, final_tokens, prize_pool, total_rounds |
| `CardRevealed` | room_id, viewer, target, card_value (Priest) |
| `BaronComparison` | room_id, player1, player1_card, player2, player2_card, loser |
| `ChancellorDraw` | room_id, player, cards_drawn |
| `ChancellorReturn` | room_id, player |
| `HandsSwapped` | room_id, player1, player2 |
| `SpyBonusCheck` | room_id, players_with_spy, bonus_awarded, bonus_recipient |

## ⚠️ Error Codes

| Code | Name | Description |
|------|------|-------------|
| 0 | `room_full` | Room has reached max players |
| 1 | `insufficient_payment` | Entry fee not met |
| 15 | `round_not_finished` | Round still in progress |
| 16 | `round_in_progress` | Cannot start new round |
| 20 | `not_your_turn` | Not the current player's turn |
| 21 | `card_not_in_hand` | Card not in player's hand |
| 22 | `invalid_target` | Target player index invalid |
| 23 | `target_immune` | Target protected by Handmaid |
| 30 | `must_discard_countess` | Must play Countess with King/Prince |
| 34 | `cannot_guess_guard` | Cannot guess Guard (1) with Guard |
| 40-43 | Chancellor errors | Invalid Chancellor actions |

## 🔒 Security Considerations

- **Random**: Uses Sui's `sui::random` for deck shuffling
- **Entry Fee**: Fixed at 0.1 SUI
- **Turn Validation**: Strict checks for current player, alive status, card ownership
- **Immunity**: Handmaid protection properly enforced
- **Countess Rule**: Mandatory discard when holding King or Prince
- **Chancellor**: Two-step action prevents manipulation
- **Spy Bonus**: Only awarded if exactly one player qualifies

## 📋 Special Rules

### Countess Rule
If you have Countess AND (King OR Prince) in hand, you MUST play Countess.

### Chancellor Flow
1. Play Chancellor card
2. Draw 2 cards from deck (now holding 3 cards)
3. Call `resolve_chancellor` to select 1 card to keep
4. Return 2 cards to bottom of deck

### Spy Bonus
- At end of round, check all players who played or hold Spy
- If EXACTLY ONE player qualifies, they get +1 token
- If multiple players have Spy, no bonus is awarded

### 2-Player Game
- 3 cards are revealed face-up at start (public information)
- Helps balance the game with more information

### Tiebreaker
When deck is empty and multiple players are alive:
1. Compare hand card values (highest wins)
2. If tied, compare sum of discarded cards (highest wins)

## 📝 License

MIT

---

Built with ❤️ on Sui
