# Relic of Lies - Pitch Deck

## 🎮 The Game

**Relic of Lies** is a fully on-chain strategic card game built on Sui blockchain, bringing the classic Love Letter gameplay to Web3 with revolutionary privacy-preserving technology.

### Game Overview

A fast-paced deduction game for 2-4 players where you must:
- **Eliminate opponents** through strategic card plays
- **Collect 3 Relics** to win the game
- **Use card abilities** to gain information and eliminate rivals

### Core Mechanics

- **21-card deck** with 10 unique card types (Scout, Knight, Healer, Berserker, Cleric, Wizard, Tactician, Paladin, Cursed Idol, Sacred Crystal)
- **Hidden information**: Your cards are encrypted - only you can see them
- **Strategic depth**: Each card has unique abilities requiring different strategies
- **Quick rounds**: Games typically last 5-10 minutes per round
- **Multiple rounds**: First to 3 Relics wins the game

---

## 🔐 Revolutionary Technology

### On-Chain Encryption with Seal

**Relic of Lies** is the first card game to implement **fully on-chain encryption** using Seal (Sui Encryption & Authentication Layer).

#### How It Works

1. **Card Encryption**
   ```typescript
   // Each card is encrypted using Seal IBE before submission
   const encrypted = await sealClient.encrypt({
     threshold: 2,
     packageId: PACKAGE_ID,
     id: sealId,  // [roomId][cardIndex][nonce]
     data: plaintext,  // [cardValue][padding]
   });
   ```

2. **On-Chain Storage**
   ```move
   // Stored as Decryptable on-chain
   public struct Decryptable {
     Encrypted { 
       ciphertext: vector<u8>,  // Seal-encrypted data
       hash: vector<u8>,         // blake2b256(plaintext || nonce)
       nonce: vector<u8>         // 32-byte random nonce
     }
   }
   ```

3. **Decryption & Verification**
   ```typescript
   // Only card owner can decrypt via Seal SDK
   const decrypted = await sealClient.decrypt({
     data: ciphertext,
     sessionKey,
     txBytes,  // Contains seal_approve_card() call
   });
   
   // Contract verifies: blake2b256(decrypted || nonce) == hash
   ```

#### Technical Implementation

**Smart Contract** (`apps/contract-v4/sources/game.move`):
```move
// Encrypted cards stored on-chain
encrypted_cards: vector<Decryptable>,

// Seal access control
seal_access: SealAccessState,  // Ownership, temporary access

// Verification on play
public fun play_turn(
    room: &mut GameRoom,
    card_index: u64,
    revealed_value: u8,
    plaintext_data: vector<u8>,
    ...
) {
    // Decrypt and verify
    decryptable::decrypt(&mut room.encrypted_cards[card_index], plaintext_data);
    let card_value = decryptable::extract_card_value(&room.encrypted_cards[card_index]);
    
    // Verify commitment
    assert!(card_value == revealed_value, E_INVALID_CARD_VALUE);
    
    // Execute card effect...
}
```

**Key Features**:
- ✅ **Fully On-Chain**: All encryption stored on Sui blockchain
- ✅ **Privacy-Preserving**: Only card owners can decrypt
- ✅ **Provably Fair**: Cryptographic commitments prevent cheating
- ✅ **Access Control**: Seal enforces ownership via `seal_approve_card()`
- ✅ **Threshold Security**: 2-of-N Seal servers required for decryption

### Commitment Scheme

Every card play is verified cryptographically:

```
1. Round Start: Contract generates hash = blake2b256(plaintext || nonce)
2. Card Play: Player submits plaintext_data
3. Verification: Contract checks blake2b256(plaintext_data || nonce) == hash
4. If match → Execute effect
5. If mismatch → Transaction fails (cheating detected)
```

**Security Guarantee**: Players **cannot lie** about card values because:
- Hash is computed on-chain at round start
- Nonce is random and unpredictable (Sui Random VRF)
- One-way hash function (cannot reverse)

---

## 🎯 Why This Matters

### Traditional Blockchain Games
- ❌ Card values stored in plaintext
- ❌ Anyone can read all cards via blockchain explorer
- ❌ No privacy for players
- ❌ Centralized servers for hidden information

### Relic of Lies
- ✅ Cards encrypted on-chain using Seal IBE
- ✅ Only owners can decrypt (via Seal SDK)
- ✅ Full privacy while maintaining decentralization
- ✅ No trusted servers needed

### Use Cases
1. **Gaming**: Private card games, poker, trading card games
2. **DeFi**: Private auctions, sealed-bid mechanisms
3. **NFTs**: Encrypted metadata, private collections
4. **Enterprise**: Confidential on-chain data

---

## 🚀 Demo Scenario

### Scenario: 3-Player Game

**Players**: Alice, Bob, Charlie  
**Entry Fee**: 0.1 SUI each (0.3 SUI prize pool)

#### Round 1 Setup

1. **Deck Submission**
   - Each card encrypted using Seal IBE
   - 21 cards stored on-chain as `Decryptable` structs
   - Hash commitments created: `blake2b256(plaintext || nonce)`

2. **Deal Cards**
   - Alice receives card index 5 (encrypted)
   - Bob receives card index 12 (encrypted)
   - Charlie receives card index 18 (encrypted)
   - Seal access control assigns ownership

3. **Card Viewing**
   - Alice decrypts her card via Seal SDK → **Knight (1)**
   - Bob decrypts his card → **Healer (2)**
   - Charlie decrypts his card → **Cleric (4)**
   - Each player only sees their own card

#### Turn 1: Alice

- **Hand**: Knight (1)
- **Action**: Plays Knight, guesses "Healer" on Bob
- **Transaction**: `play_turn(room, 5, 1, plaintext_data, target_idx=1, guess=2)`
- **Verification**:
  ```move
  // Contract verifies commitment
  decryptable::decrypt(&mut encrypted_cards[5], plaintext_data);
  assert!(extract_card_value(&encrypted_cards[5]) == 1, E_INVALID);
  ```
- **Result**: Bob's card revealed → Healer (2) → **Bob eliminated** ✓
- **State**: Bob `is_alive = false`, Alice continues

#### Turn 2: Charlie

- **Hand**: Cleric (4)
- **Action**: Plays Cleric
- **Transaction**: `play_turn(room, 18, 4, plaintext_data)`
- **Verification**: Commitment verified ✓
- **Result**: Charlie becomes immune (`is_immune = true`)

#### Turn 3: Alice

- **Hand**: Empty (played Knight)
- **Action**: Draws new card → **Tactician (6)**
- **Action**: Plays Tactician
- **Transaction**: `play_turn(room, new_card_index, 6, plaintext_data)`
- **Result**: Draws 2 cards, keeps 1, returns 2 to bottom
- **Resolution**: Alice chooses which card to keep via `resolve_chancellor()`

#### Round End

- **Winner**: Alice (last player standing)
- **Reward**: +1 Relic
- **Scout Bonus**: Check if Alice played/holds Scout → No bonus
- **State**: Alice has 1 Relic, Bob has 0, Charlie has 0

#### Round 2-3

- Rounds continue until someone reaches 3 Relics
- Each round: New deck encrypted and submitted
- **Final Winner**: First to 3 Relics wins 0.3 SUI prize pool

---

## 📊 Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  - Seal SDK integration                                 │
│  - Card encryption/decryption                           │
│  - Game UI & animations                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Sui Blockchain (Smart Contract)            │
│  - Game logic enforcement                                │
│  - Encrypted card storage (Decryptable)                  │
│  - Seal access control                                  │
│  - Commitment verification                              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Seal Key Servers (Threshold: 2-of-N)       │
│  - Decryption key management                            │
│  - Access verification via seal_approve_card()          │
│  - Threshold decryption                                 │
└─────────────────────────────────────────────────────────┘
```

### Smart Contract Modules

| Module | Purpose |
|--------|---------|
| `game.move` | Core game logic, turn management, card effects |
| `decryptable.move` | Encrypted card storage (ciphertext, hash, nonce) |
| `seal_access.move` | Access control (ownership, temporary access) |
| `utils.move` | Hashing, Seal ID parsing |
| `constants.move` | Game constants (card types, counts) |

### Data Structures

**On-Chain**:
```move
GameRoom {
    encrypted_cards: vector<Decryptable>,  // Seal-encrypted cards
    seal_access: SealAccessState,          // Access control
    players: vector<Player>,              // Player states
    commitments: vector<vector<u8>>,       // Hash commitments
}
```

**Decryptable**:
```move
enum Decryptable {
    Encrypted { ciphertext, hash, nonce },
    Decrypted { data },
}
```

---

## 💡 Competitive Advantages

### 1. First Fully On-Chain Encrypted Card Game
- No other game implements Seal encryption on-chain
- Demonstrates practical use of IBE for gaming

### 2. True Privacy in Web3
- Cards encrypted on-chain (not just hidden in UI)
- Only owners can decrypt via Seal SDK
- No trusted servers required

### 3. Provably Fair
- Cryptographic commitments prevent cheating
- All game logic on-chain (auditable)
- Sui Random VRF for unbiased shuffling

### 4. Composable & Extensible
- Built on Sui (high throughput, low fees)
- Can integrate with other Sui protocols
- Modular design allows easy feature additions

---

## 🎯 Market Opportunity

### Target Audience
- **Web3 Gamers**: Players seeking on-chain games with privacy
- **Crypto Enthusiasts**: Early adopters of new blockchain tech
- **Card Game Fans**: Love Letter players, strategic game lovers

### Market Size
- **Blockchain Gaming**: $4.6B market (2023), growing 20% YoY
- **Card Games**: $2.1B market globally
- **Web3 Gaming**: Rapidly growing segment

### Differentiation
- Only game with on-chain Seal encryption
- True privacy without centralized servers
- Provably fair gameplay

---

## 🛠️ Technical Validation

### Code Verification

**Confirmed Implementation** (`apps/contract-v4/sources/game.move`):

1. ✅ **Encrypted Card Storage**:
   ```move
   encrypted_cards: vector<Decryptable>,  // Line 72
   ```

2. ✅ **Seal Access Control**:
   ```move
   seal_access: SealAccessState,  // Line 101
   ```

3. ✅ **On-Chain Decryption Verification**:
   ```move
   decryptable::decrypt(&mut room.encrypted_cards[card_index], plaintext_data);
   let card_value = decryptable::extract_card_value(&room.encrypted_cards[card_index]);
   ```

4. ✅ **Commitment Verification**:
   ```move
   // In decryptable.move line 48
   assert!(blake2b256(&data) == *hash, EHashMismatch);
   ```

5. ✅ **Seal Access Entry Function**:
   ```move
   // seal_access.move provides can_access_card() for Seal servers
   ```

**Conclusion**: ✅ **Fully implemented** - Cards are encrypted on-chain using Seal, with proper access control and commitment verification.

---

## 📈 Roadmap

### Phase 1: Core Game (✅ Complete)
- ✅ On-chain game logic
- ✅ Seal encryption integration
- ✅ Frontend UI
- ✅ Card effects implementation

### Phase 2: Enhanced Features (In Progress)
- 🔄 Tournament system
- 🔄 Leaderboard & rankings
- 🔄 Card marketplace
- 🔄 Gacha system

### Phase 3: Expansion
- 📋 Mobile app
- 📋 Cross-chain support
- 📋 NFT card collections
- 📋 Governance token

---

## 🎮 Try It Now

### Quick Start

1. **Connect Wallet**: Use Sui wallet (Sui Wallet, Ethos, etc.)
2. **Create Room**: Pay 0.1 SUI entry fee
3. **Join Game**: Wait for other players
4. **Submit Deck**: Cards automatically encrypted
5. **Play**: Use strategy to eliminate opponents
6. **Win**: Collect 3 Relics to win prize pool

### Live Demo
- **Testnet**: [Coming Soon]
- **Mainnet**: [Coming Soon]

---

## 📞 Contact & Resources

- **GitHub**: [Repository Link]
- **Documentation**: `/docs/TECHNICAL_ARCHITECTURE.md`
- **Game Flow**: `/docs/GAME_FLOW.md`
- **Tech Stack**: Sui Move, Seal IBE, Next.js, TypeScript

---

## 🏆 Summary

**Relic of Lies** is not just a game - it's a **proof-of-concept** for the future of private, on-chain applications. By combining Seal encryption with fully on-chain game logic, we demonstrate that:

1. ✅ **Privacy is possible** in fully decentralized systems
2. ✅ **On-chain encryption** is practical and scalable
3. ✅ **Provably fair** games can maintain player privacy
4. ✅ **Web3 gaming** can rival traditional gaming experiences

**Join us in building the future of private, decentralized gaming.**

---

**Last Updated**: January 2026  
**Version**: v4 (Seal-Integrated)
