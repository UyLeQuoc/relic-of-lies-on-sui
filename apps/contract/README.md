# 🎴 Relic of Lies - Relic Of Lies 

A fully on-chain implementation of the **Relic Of Lies ** card game built on Sui blockchain.

## 🎮 Game Overview

Relic Of Lies is a game of risk, deduction, and luck. The goal is to be the last player standing or hold the highest-value card when the deck runs out.

### Key Features
- **Players**: 2-6 players per room
- **Cards**: 21 cards total, 10 card types ()
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
├── app.move          # Clean API entry points
├── gacha.move        # NFT Card gacha system
├── marketplace.move  # Kiosk-based NFT marketplace
└── leaderboard.move  # Global player rankings
```

## 🃏 Card Effects ()

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
│     → First player draws second card (has 2 cards ready)   │
├─────────────────────────────────────────────────────────────┤
│  4. PLAY TURNS                                              │
│     play_turn(room, card, target?, guess?)                  │
│     → Player has 2 cards, chooses 1 to play                │
│     → Clear immunity, play card, execute effect            │
│     → Next player auto-draws card (will have 2 cards)      │
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

---

# 🎰 Gacha System

## Overview

The Gacha system allows players to collect NFT cards with different rarities. Each pull costs **0.05 SUI** and gives you a random card.

## Card NFT Structure

```move
public struct Card has key, store {
    id: UID,
    value: u8,        // 0-9 (corresponds to game cards)
    rarity: u8,       // 0=Common, 1=Rare, 2=Epic, 3=Legendary, 4=Mythic
    wins: u64,        // Number of wins with this card
    games_played: u64 // Number of games played
}
```

## Rarity Drop Rates

| Rarity | Drop Rate | Color |
|--------|-----------|-------|
| Common | 67.5% | Gray |
| Rare | 20% | Blue |
| Epic | 10% | Purple |
| Legendary | 2% | Gold |
| Mythic | 0.5% | Red |

## Gacha Functions

### Pull a Card

```typescript
// Cost: 0.05 SUI per pull
gacha::pull_and_keep(treasury, payment, random)
```

**Parameters:**
- `treasury`: GachaTreasury shared object
- `payment`: Coin<SUI> (minimum 0.05 SUI)
- `random`: Random object for randomness

**Returns:** Card NFT transferred to sender

### Upgrade Cards

Combine **3 cards of the same rarity** to attempt upgrading to higher rarity. **Upgrade has a chance to fail!**

```typescript
gacha::upgrade_and_keep(card1, card2, card3, random)
```

**Rules:**
- All 3 cards must have the same rarity
- Cannot upgrade Mythic cards (already max rarity)
- New card inherits combined stats (wins + games_played)
- New card gets random value (0-9)
- **3 cards are always consumed** (burned)

**Upgrade Success Rates:**

| Upgrade | Success Rate | On Failure |
|---------|--------------|------------|
| Common → Rare | 80% | Get 1 Common back |
| Rare → Epic | 60% | Get 1 Rare back |
| Epic → Legendary | 40% | Get 1 Epic back |
| Legendary → Mythic | 20% | Get 1 Legendary back |

**Outcome:**
- ✅ **SUCCESS**: Get 1 card of **higher rarity** with combined stats
- ❌ **FAILURE**: Get 1 card of **same rarity** with combined stats (2 cards lost)

## Gacha Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. PULL CARD                                               │
│     pull_and_keep(treasury, 0.05 SUI, random)              │
│     → Random card value (0-9)                               │
│     → Random rarity based on drop rates                     │
│     → Card NFT transferred to wallet                        │
├─────────────────────────────────────────────────────────────┤
│  2. COLLECT CARDS                                           │
│     → Collect 3 cards of same rarity                        │
│     → Use cards in games to build stats                     │
├─────────────────────────────────────────────────────────────┤
│  3. UPGRADE                                                 │
│     upgrade_and_keep(card1, card2, card3, random)          │
│     → Burns 3 cards                                         │
│     → Creates 1 higher rarity card                          │
│     → Stats are combined                                    │
└─────────────────────────────────────────────────────────────┘
```

## Sui Object Display

Card NFTs use Sui's Display standard for rich metadata in wallets and explorers.

### Display Fields

| Field | Value | Description |
|-------|-------|-------------|
| `name` | `Relic of Lies Card #{value}` | Card name with value |
| `description` | Dynamic | Card description with value and rarity |
| `image_url` | `https://relic-of-lies.vercel.app/api/card-image/{value}/{rarity}` | Card image |
| `thumbnail_url` | `https://relic-of-lies.vercel.app/api/card-thumbnail/{value}/{rarity}` | Thumbnail |
| `project_name` | `Relic of Lies` | Project name |
| `project_url` | `https://relic-of-lies.vercel.app` | Project website |
| `creator` | `Relic of Lies Team` | Creator info |
| `value` | `{value}` | Card value (0-9) |
| `rarity` | `{rarity}` | Rarity level (0-4) |
| `wins` | `{wins}` | Total wins |
| `games_played` | `{games_played}` | Total games |

### Rarity Values

| Rarity ID | Name | Display Color |
|-----------|------|---------------|
| 0 | Common | Gray |
| 1 | Rare | Blue |
| 2 | Epic | Purple |
| 3 | Legendary | Gold |
| 4 | Mythic | Red |

### Card Values (Relic Of Lies)

| Value | Card Name |
|-------|-----------|
| 0 | Spy |
| 1 | Guard |
| 2 | Priest |
| 3 | Baron |
| 4 | Handmaid |
| 5 | Prince |
| 6 | Chancellor |
| 7 | King |
| 8 | Countess |
| 9 | Princess |

### Update Display (Admin)

The Display object is owned by the publisher. To update display fields:

```typescript
// Get Display object
const display = await client.getObject({ id: DISPLAY_ID });

// Update a field
display::edit(display, "image_url", "new_url");
display::update_version(display);
```

---

# 🏪 Marketplace

## Overview

The Marketplace uses **Sui Kiosk** for trading NFT cards. It features a **no-lock policy** meaning cards are transferred immediately upon purchase.

## Key Components

### MarketplaceRegistry
Tracks global marketplace statistics.

```move
public struct MarketplaceRegistry has key {
    id: UID,
    total_kiosks: u64,   // Total kiosks created
    total_volume: u64,   // Total SUI traded
}
```

### Kiosk
Each seller has their own Kiosk to list cards.

### TransferPolicy
No-lock policy allows instant transfers without restrictions.

## Marketplace Functions

### Create a Kiosk

```typescript
marketplace::create_kiosk_and_share(registry)
```

Creates a new Kiosk for the sender. You need a Kiosk to sell cards.

**Returns:**
- `Kiosk` (shared object)
- `KioskOwnerCap` (transferred to sender)

### List a Card for Sale

```typescript
// Option 1: Place card then list
marketplace::place_card(kiosk, cap, card)
marketplace::list_card(kiosk, cap, card_id, price)

// Option 2: Place and list in one call
marketplace::place_and_list(kiosk, cap, card, price)
```

**Parameters:**
- `kiosk`: Your Kiosk object
- `cap`: Your KioskOwnerCap
- `card`: Card NFT to sell
- `price`: Price in MIST (1 SUI = 1,000,000,000 MIST)

### Delist a Card

```typescript
marketplace::delist_card(kiosk, cap, card_id)
```

Removes card from sale but keeps it in your Kiosk.

### Withdraw a Card

```typescript
marketplace::withdraw_card_and_keep(kiosk, cap, card_id)
```

Withdraws card from Kiosk back to your wallet. Card must not be listed.

### Purchase a Card

```typescript
marketplace::purchase_card_and_keep(kiosk, card_id, payment, policy, registry)
```

**Parameters:**
- `kiosk`: Seller's Kiosk
- `card_id`: ID of the card to buy
- `payment`: Coin<SUI> matching the listed price
- `policy`: TransferPolicy<Card> shared object
- `registry`: MarketplaceRegistry shared object

### Withdraw Profits

```typescript
marketplace::withdraw_profits(kiosk, cap)
```

Withdraws all accumulated profits from sales.

## Marketplace Flow

```
┌─────────────────────────────────────────────────────────────┐
│  SELLER FLOW                                                │
├─────────────────────────────────────────────────────────────┤
│  1. Create Kiosk (one-time)                                │
│     create_kiosk_and_share(registry)                       │
│                                                             │
│  2. List Card                                               │
│     place_and_list(kiosk, cap, card, price)                │
│                                                             │
│  3. Wait for buyer...                                       │
│                                                             │
│  4. Withdraw Profits                                        │
│     withdraw_profits(kiosk, cap)                           │
├─────────────────────────────────────────────────────────────┤
│  BUYER FLOW                                                 │
├─────────────────────────────────────────────────────────────┤
│  1. Browse listings (off-chain indexer)                    │
│                                                             │
│  2. Purchase Card                                           │
│     purchase_card_and_keep(kiosk, card_id, payment, ...)   │
│                                                             │
│  3. Card transferred to wallet instantly                    │
└─────────────────────────────────────────────────────────────┘
```

## Setup Transfer Policy

The package publisher must create a TransferPolicy once after deployment:

```typescript
marketplace::create_and_share_card_policy(publisher)
```

This creates a no-lock policy that allows instant card transfers.

---

# 🔗 Shared Objects Reference

After deployment, these shared objects are created:

| Object | Module | Purpose |
|--------|--------|---------|
| `RoomRegistry` | game | Tracks active game rooms |
| `Leaderboard` | leaderboard | Global player rankings |
| `GachaTreasury` | gacha | Collects gacha fees |
| `MarketplaceRegistry` | marketplace | Marketplace statistics |
| `TransferPolicy<Card>` | marketplace | Card trading policy |

---

## 📝 License

MIT

---

Built with ❤️ on Sui
