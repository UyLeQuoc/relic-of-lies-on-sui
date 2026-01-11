## Love Letter On‑Chain Game Contract

This package implements a simplified on‑chain version of the **Love Letter** card game using Sui Move.

The goal of the game is to be the last remaining player or to hold the highest‑value card when the deck is exhausted.  
Players take turns playing cards from their hand to perform actions such as guessing an opponent’s card, viewing another player’s card, protecting themselves, or eliminating opponents.

### High‑Level Architecture

The contract is organized into several logical areas:

- **Core Game Module**
  - Manages game sessions, player list, deck, and turn order
  - Encodes the main game rules and win/lose conditions
- **Card & Effect Modules**
  - Define card data (value and name)
  - Implement the effect of each card (Guard, Priest, Baron, Handmaid, Prince, King, Princess)
- **State & Flags**
  - Track eliminated players
  - Track temporary protection (e.g. Handmaid)
  - Track whether a game is still active
- **Utilities**
  - Card deck construction and shuffling
  - Drawing cards and minting `SealedCard` objects
  - Advancement of the current turn
- **Error & Events**
  - Centralized error codes for invalid actions
  - Events for revealing card information to observers

### Core Data Structures

- **`Card`**
  - Contains `value: u8` and `name: vector<u8>`
  - Represents the logical card used inside decks
- **`SealedCard`**
  - A `key` object that binds a specific `Card` instance to a `game_id`
  - Ensures a card cannot be reused across different games
- **`GameSession`**
  - Stores deck, players, eliminated and protected sets
  - Tracks `current_turn_idx` and `game_active` flag

### Main Entry Functions

- **`start_game`**
  - Initializes a new game session
  - Builds the standard 16‑card Love Letter deck
  - Shuffles the deck with Sui randomness
  - Creates and shares the `GameSession` object
- **`play_card`**
  - Single unified entry point to apply the effect of any card
  - Validates that:
    - The card belongs to the target `GameSession`
    - The game is still active
    - The target is not currently protected
  - Dispatches to the correct effect logic based on the card value
  - Cleans up used cards and advances the turn

### Card Logic Overview

- **Guard (1)**
  - Guess the value of another player’s card
  - If correct, the target is eliminated; otherwise their card is returned
- **Priest (2)**
  - Allows the player to see the target’s card
  - Emits an event with the seen card value
- **Baron (3)**
  - Compares card values between the current player and target
  - The player with the lower card is eliminated
- **Handmaid (4)**
  - Grants temporary protection from being targeted until the player’s next turn
- **Prince (5)**
  - Forces a player to discard their card and draw a new one
  - If the discarded card is the Princess, that player is eliminated
- **King (6)**
  - Swaps hands between the current player and the target
- **Princess (8)**
  - If played or discarded, the owner is immediately eliminated

### Suggested Module Split

To keep the codebase maintainable, the full game logic can be split into multiple Move files under `sources/`:

- `sources/app.move`
  - Public entry points: `start_game`, `play_card`
  - High‑level orchestration of game flow
- `sources/cards.move`
  - Card constants and helper functions for deck construction
- `sources/game_state.move`
  - `GameSession`, `SealedCard`, and state helpers (elimination, protection, turn updates)
- `sources/error.move`
  - Shared error codes such as `ENotYourTurn`, `EWrongGame`, `EPlayerProtected`, `EInvalidMove`
- `sources/events.move`
  - Event definitions (e.g. `CardSeenEvent`)

This separation makes it easier to:

- Extend the game with new rules or variants
- Add more events or analytics
- Reuse generic state or utility functions across multiple games

### Testing

- Use the `tests/` directory to:
  - Verify card effects and edge cases (e.g. Princess discard, protected players)
  - Validate turn rotation and elimination logic
  - Ensure that random shuffling always produces a valid deck configuration

### Notes

- The contract uses Sui’s randomness and `SealedCard` objects to avoid card duplication or reuse across games.
- All Move modules should follow Sui coding conventions and ensure that invalid actions fail with clear error codes.
