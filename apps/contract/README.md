# 🎴 Relic of Lies - Love Letter 2019 Premium Edition

A fully on-chain implementation of the **Love Letter 2019 Premium Edition** card game built on Sui blockchain.

## 🎮 Game Overview

Love Letter is a game of risk, deduction, and luck. The goal is to be the last player standing or hold the highest-value card when the deck runs out.

### Key Features
- **Players**: 2-6 players per room
- **Cards**: 21 cards total, 10 card types (2019 Premium Edition)
- **Token System**: First player to collect 3 tokens wins the game
- **Spy Bonus**: Unique end-of-round bonus mechanic (only awarded to single qualifying player)

## 📦 Module Structure

```
sources/
├── constants.move    # Game constants (fees, card values, status codes)
├── error.move        # Error codes for assertions
├── events.move       # Events for frontend/match history
├── utils.move        # Deck creation, shuffling, helpers
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
| **Chancellor** | 6 | 2 | Draw 2 cards, keep 1, return 2 to bottom of deck in any order |
| **King** | 7 | 1 | Trade hands with another player |
| **Countess** | 8 | 1 | Must be discarded if you have King or Prince in hand |
| **Princess** | 9 | 1 | If discarded (by you or forced), you are eliminated |

**Total**: 21 cards

## 🏆 Token System

- **Round Win**: +1 token
- **Spy Bonus**: +1 token (if ONLY you played Spy)
- **Game Win**: First to collect 3 tokens wins the prize pool

## 🎯 Game Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. CREATE ROOM                                             │
│     create_room("My Room")                               │
│     → Creates shared GameRoom object                        │
├─────────────────────────────────────────────────────────────┤
│  2. JOIN ROOM                                               │
│     join_room(room)                                         │
│     → Players join (free entry - no payment required)       │
├─────────────────────────────────────────────────────────────┤
│  3. START ROUND                                             │
│     start_round(room, random)                               │
│     → Shuffle 21 cards                                      │
│     → For 3-6 players: Burn 1 card, deal 1 each            │
│     → For 2 players: Burn 3 cards at start, deal 1 each    │
├─────────────────────────────────────────────────────────────┤
│  4. PLAY TURNS                                              │
│     play_turn(room, card, target?, guess?)                  │
│     → Clear immunity, draw card, play card, execute effect  │
│     → Special: Chancellor requires resolve_chancellor()     │
├─────────────────────────────────────────────────────────────┤
│  5. ROUND END                                               │
│     → Last player alive OR highest card value when deck     │
│        is empty                                              │
│     → Tiebreaker: sum of discarded card values              │
│     → Winner gets +1 token                                  │
│     → Check Spy bonus (exactly 1 qualifying player = +1)    │
├─────────────────────────────────────────────────────────────┤
│  6. GAME END                                                │
│     → First to 3 tokens wins                                │
│     → Winner receives entire prize pool                     │
│     → Leaderboard updated                                   │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Data Structures

### GameRoom (Shared Object)
*Main game state container stored on-chain as a shared object*
```move
public struct GameRoom has key {
    id: UID,
    name: String,
    creator: address,
    players: vector<Player>,
    deck: vector<u8>,
    burn_cards: vector<u8>,
    status: u8,                   // 0=waiting, 1=playing, 2=round_end, 3=finished 
    current_turn: u8,
    round_number: u8,
    // Chancellor state (tracked during multi-step card action)
    chancellor_pending: bool,     // True when player needs to resolve Chancellor
    chancellor_player_idx: u8,    // Index of player who played Chancellor
    chancellor_cards: vector<u8>, // Cards drawn (3 cards total: 1 hand + 2 drawn)
}
```

### Player
*Individual player state including hand, tokens, and status*
```move
public struct Player has store, copy, drop {
    addr: address,                // Player's wallet address
    hand: vector<u8>,             // Current cards in hand (1-2 cards)
    discarded: vector<u8>,        // Cards discarded this round
    is_alive: bool,               // True if player is still in the round
    is_immune: bool,              // Protected by Handmaid (immune to targeting)
    tokens: u8,                   // Round wins + Spy bonuses (win at 3 tokens)
    has_played_spy: bool,         // Track if player played/holds Spy for bonus check
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
| 1 | `insufficient_payment` | Entry fee not met (reserved for future use - currently free) |
| 15 | `round_not_finished` | Round still in progress |
| 16 | `round_in_progress` | Cannot start new round |
| 20 | `not_your_turn` | Not the current player's turn |
| 21 | `card_not_in_hand` | Card not in player's hand |
| 22 | `invalid_target` | Target player index invalid |
| 23 | `target_immune` | Target protected by Handmaid |
| 30 | `must_discard_countess` | Must discard Countess when holding King or Prince |
| 34 | `cannot_guess_guard` | Cannot guess Guard (1) with Guard |
| 40-43 | Chancellor errors | Invalid Chancellor actions |

## 🔒 Security Considerations

- **Random**: Uses Sui's `sui::random` for deck shuffling
- **Entry Fee**: Free to join (0 SUI)
- **Turn Validation**: Strict checks for current player, alive status, card ownership
- **Immunity**: Handmaid protection properly enforced
- **Countess Rule**: Mandatory discard when holding King or Prince
- **Chancellor**: Two-step action prevents manipulation
- **Spy Bonus**: Only awarded if exactly one player qualifies

## 📋 Special Rules

### Countess Rule
If you have Countess AND (King OR Prince) in hand, you MUST discard Countess on your turn (you cannot play King or Prince in this situation).

### Chancellor Flow
1. Play Chancellor card
2. Draw 2 cards from deck (now holding 3 cards)
3. Call `resolve_chancellor` to select 1 card to keep
4. Return 2 cards to bottom of deck in any order

### Spy Bonus
- At end of round, check all players who played Spy
- If EXACTLY ONE player qualifies, they get +1 token
- If multiple players had played Spy, no bonus is awarded

### 2-Player Game
- 3 cards are burned at start (revealed face-up as public information)
- Helps balance the game with more information for strategic play

### Tiebreaker
When deck is empty and multiple players are alive:
1. Compare hand card values (highest value wins)
2. If tied, compare sum of all discarded card values (highest sum wins)

### Handmaid or No Target
- If there is no valid target when playing King, Guard, Priest, Baron, or Prince (e.g., all other players are immune or eliminated), the card is played with no effect (no target selected)

## 📝 License

MIT

---

Built with ❤️ on Sui
