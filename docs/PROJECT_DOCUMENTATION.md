# Relic of Lies - Project Documentation

## Executive Summary

**Relic of Lies** is a Web3 fantasy dungeon-themed card game built on the Sui blockchain. It combines turn-based elimination gameplay (inspired by Love Letter) with blockchain technology to create a transparent, fair, and rewarding gaming experience. Players can stake Sui coins, compete in real-time multiplayer matches, and earn rewards through smart contract-enforced gameplay.

## Core Concept

### Problem Statement
Traditional card games lack transparency, fair play guarantees, and the ability to earn real rewards. Players face issues with cheating, unverifiable game outcomes, and no way to monetize their gaming skills. Existing Web3 games often sacrifice gameplay quality for blockchain integration.

### Solution
Relic of Lies provides:
- **Transparent Gameplay**: Smart contract-enforced game rules ensure fairness
- **Anti-Cheat System**: Commit-reveal mechanism prevents cheating
- **Real Rewards**: Players can stake Sui coins and earn rewards through gameplay
- **Real-time Multiplayer**: Smooth WebSocket-based multiplayer experience
- **Fair Distribution**: Automated reward distribution via smart contracts

## Game Features

### Gameplay
- **Player Count**: 2-6 players per match
- **Game System**: Best-of-N rounds (3 points to win)
- **Mechanics**: Turn-based elimination gameplay
- **Deck**: 10 unique cards with special effects
- **Theme**: Fantasy dungeon setting

### Staking System
- Optional staking for matches
- Automatic reward distribution to winners
- Transparent pot management
- Fair distribution via smart contracts

### Real-time Experience
- WebSocket-based communication
- Live game state updates
- Player turn indicators
- Action history and logs

## User Flow

1. **Wallet Connection**: User connects Sui wallet, system creates/retrieves player profile
2. **Room Creation/Joining**: Create room with optional stake or join existing room with room code
3. **Card Commitment**: Commit card hash to blockchain for anti-cheat protection
4. **Gameplay**: Host starts match, players take turns playing cards with real-time updates
5. **Round Management**: Players reveal cards with salt, system determines winner, points awarded
6. **Reward Distribution**: Match winner receives pot via smart contract, game session resets

## Project Goals

- Build an engaging Web3 card game with blockchain integration
- Create a fair and secure gaming environment using smart contracts
- Enable players to stake and earn rewards through gameplay
- Provide smooth real-time multiplayer experience
- Establish a foundation for future game expansions and NFT integration

## Success Metrics

- Number of active players and matches
- Game completion rates
- Staking volume and distribution
- Player retention and engagement
- Smart contract security and reliability
- Real-time performance metrics
- User satisfaction with gameplay experience

## Development Phases

1. **Phase 1**: Core game mechanics and smart contracts
2. **Phase 2**: Real-time multiplayer and UI implementation
3. **Phase 3**: Staking system and reward distribution
4. **Phase 4**: Testing, optimization, and deployment

## Current Status

### Completed
- Project initialization and structure
- Development environment setup
- GraphQL Code Generator configuration
- Apollo Client integration
- GitHub Actions CI/CD workflow
- Docker configuration
- Database migration automation
- Basic Move contract setup
- Basic UI components with Shadcn UI

### In Progress
- Sui wallet integration
- Smart contract development (game contract, staking, commit-reveal)
- Database schema implementation
- UI development
- GraphQL API development
- Colyseus real-time server design

### Pending
- Game room creation and management
- Player authentication and profiles
- Real-time multiplayer functionality
- Card game mechanics implementation
- Turn-based gameplay system
- Complete staking and reward distribution
- Full anti-cheat commit-reveal system
- Game state synchronization

## Key Differentiators

1. **Smart Contract Enforcement**: Game rules enforced on-chain for transparency
2. **Commit-Reveal Anti-Cheat**: Cryptographic system prevents cheating
3. **Real-time Multiplayer**: Colyseus integration for smooth gameplay
4. **Fair Rewards**: Automated, transparent reward distribution
5. **Quality Gameplay**: Focus on game quality alongside blockchain integration

---

## Technical Architecture

### Architecture Overview

Relic of Lies uses a **monorepo structure** with a modern tech stack combining:
- **Frontend**: Next.js 15 with React 19
- **Backend**: NestJS with GraphQL
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Colyseus game server
- **Blockchain**: Sui network with Move smart contracts
- **Deployment**: Docker-based with GitHub Actions CI/CD

### Technology Stack

#### Frontend
- **Framework**: Next.js 15.3.3
- **UI Library**: React 19.0.0
- **Language**: TypeScript
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS 4
- **GraphQL**: Apollo Client 3.13.8
- **Code Generation**: GraphQL Code Generator
- **Web3**: WalletKit for Sui integration, Sui SDK
- **Real-time**: WebSocket client

#### Backend
- **Framework**: NestJS
- **API**: Apollo Server with GraphQL
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Real-time**: Colyseus game server
- **Blockchain**: Sui SDK integration
- **WebSocket**: Real-time game state management

#### Smart Contracts
- **Language**: Move (2024.beta edition)
- **Blockchain**: Sui
- **Modules**:
  - Game contract for match management
  - Staking and reward distribution
  - Commit-reveal verification
- **Testing**: Move testing framework
- **Verification**: Move Prover

#### Development & Deployment
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Jest
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Hosting**: VPS with Docker Compose
- **Blockchain Tools**: Sui CLI, Move Analyzer, Move Prover

### System Architecture

#### Component Relationships

```
Frontend (Next.js)
  ├── GraphQL Queries → Backend (NestJS)
  ├── WebSocket → Colyseus Server
  ├── WalletKit → Sui Wallet
  └── UI Components → Shadcn UI

Backend (NestJS)
  ├── Database Operations → PostgreSQL (via Prisma)
  ├── GraphQL API → Apollo Server
  ├── Sui SDK → Sui Blockchain
  └── Game State → Colyseus Server

Sui Blockchain
  └── Smart Contracts → Move Contracts

CI/CD (GitHub Actions)
  └── Build & Deploy → Docker Images → VPS
```

### Code Organization

#### Monorepo Structure
```
relic-of-lies/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── app/
│   │   └── codegen.ts    # GraphQL Code Generator config
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   │   ├── games/    # Game module
│   │   │   ├── players/  # Player module
│   │   │   ├── blockchain/ # Blockchain integration
│   │   │   └── app.module.ts
│   └── contract/         # Move smart contracts
│       ├── sources/
│       │   ├── relic_of_lies.move
│       │   ├── game.move
│       │   └── staking.move
│       └── tests/
├── packages/             # Shared packages
├── docs/                 # Documentation
└── memory-bank/          # Project documentation
```

#### Backend Module Structure
```
apps/api/src/
├── games/
│   ├── dto/              # Data Transfer Objects
│   ├── entities/         # Database models
│   ├── games.module.ts
│   ├── games.resolver.ts # GraphQL resolvers
│   └── games.service.ts  # Business logic
├── players/
│   ├── dto/
│   ├── entities/
│   ├── players.module.ts
│   ├── players.resolver.ts
│   └── players.service.ts
└── blockchain/
    ├── dto/
    ├── blockchain.module.ts
    ├── blockchain.resolver.ts
    └── blockchain.service.ts
```

### Design Patterns

#### Backend Patterns
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation
- **GraphQL Resolvers**: API endpoint handlers
- **Dependency Injection**: NestJS IoC container
- **DTOs**: Data validation and transfer
- **Error Handling**: Custom exception filters

#### Frontend Patterns
- **Component Composition**: Reusable UI components
- **Server Components**: Next.js RSC for performance
- **Client Components**: Minimal 'use client' usage
- **State Management**: React hooks and context
- **Error Boundaries**: Graceful error handling
- **Form Handling**: Zod validation

#### Smart Contract Patterns
- **Modular Design**: Separate modules for different concerns
- **Resource-Oriented**: Sui object model
- **Capability-Based**: Access control patterns
- **Event Emission**: On-chain event logging

#### Real-time Patterns
- **Room Management**: Colyseus room lifecycle
- **State Synchronization**: Authoritative server state
- **Action Broadcasting**: Real-time player updates
- **Connection Management**: WebSocket lifecycle

### Data Models

#### Game
- Room ID and status
- Player list and order
- Current round and turn
- Staking amount
- Game state and history

#### Player
- Wallet address
- Game participation
- Commit hash and salt
- Revealed cards
- Points and elimination status

#### GameSession
- Round management
- Move history
- Player actions
- Round outcomes

#### Move
- Player actions
- Card plays
- Target selections
- Timestamps

### Security Patterns

#### Authentication & Authorization
- **Wallet-Based Auth**: Sui wallet connection
- **JWT Tokens**: Session management
- **Resource Ownership**: Player ownership validation
- **Transaction Signing**: Blockchain transaction verification

#### Anti-Cheat
- **Commit-Reveal**: Cryptographic card commitment
- **Salt Validation**: Random salt verification
- **State Verification**: On-chain state validation
- **Transaction Integrity**: Blockchain-enforced rules

#### General Security
- **Input Validation**: Class-validator for DTOs
- **Rate Limiting**: API abuse prevention
- **Data Encryption**: Sensitive data protection
- **Smart Contract Security**: Formal verification

### Integration Points

#### Colyseus Game Server
- WebSocket connections
- Game state synchronization
- Player turn management
- Action broadcasting
- Room lifecycle management

#### Sui Blockchain
- Smart contract deployment
- Transaction submission
- Event listening
- State queries
- Wallet integration

#### Database
- Prisma ORM for type-safe queries
- PostgreSQL for persistent storage
- Migration automation
- Connection pooling

### Performance Optimizations

#### Backend
- Query optimization with Prisma
- Caching strategies
- Batch operations
- Connection pooling
- Efficient GraphQL resolvers

#### Frontend
- Code splitting
- Lazy loading
- Image optimization (WebP)
- Server Components (RSC)
- Minimal client-side JavaScript

#### Real-time
- WebSocket optimization
- State synchronization efficiency
- Action batching
- Connection management

#### Smart Contracts
- Gas optimization
- Efficient data structures
- Minimal on-chain storage
- Batch operations where possible

### Deployment Architecture

#### Development
- Local development servers
- Docker Compose for services
- Hot reloading
- Development database

#### Production
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Hosting**: VPS
- **Database**: PostgreSQL with migrations
- **Blockchain**: Sui testnet/mainnet

#### Deployment Flow
1. Code push triggers GitHub Actions
2. Build Docker images
3. Run tests (unit, integration, contract)
4. Deploy to VPS
5. Run database migrations
6. Health checks
7. Contract deployment/verification

### Testing Strategy

#### Backend Testing
- Unit tests for services
- Integration tests for resolvers
- E2E tests for API endpoints
- Mock Sui transactions

#### Frontend Testing
- Component tests
- Integration tests
- E2E tests
- Mock API responses

#### Contract Testing
- Move unit tests
- Integration tests
- Property-based testing
- Formal verification with Move Prover

### Development Workflow

1. Clone repository
2. Install dependencies (`npm install`)
3. Set up environment variables
4. Deploy smart contracts (`npm run deploy:contracts`)
5. Start development servers (`npm run dev`)
6. Run database migrations
7. Run contract tests (`npm run test:contracts`)

### Key Technical Decisions

1. **Monorepo**: Better code sharing and management
2. **GraphQL**: Flexible API with type safety
3. **Prisma**: Type-safe database operations
4. **TypeScript**: Type safety across the stack
5. **Shadcn UI**: Consistent design system
6. **Sui Blockchain**: Fast, scalable blockchain
7. **Move Language**: Safe smart contract development
8. **Colyseus**: Real-time game server
9. **Next.js 15**: Modern React framework with RSC
10. **Docker**: Consistent deployment environment

### Environment Variables

#### Required Variables
- Database connection string
- Sui network configuration (testnet/mainnet)
- Game contract address
- API keys
- Service endpoints
- Wallet configuration
- Contract verification keys
- Colyseus server configuration

### Development Scripts

- `npm run dev`: Run both frontend and backend concurrently
- `npm run dev:api`: Run backend only
- `npm run dev:web`: Run frontend only
- `npm run codegen`: Generate GraphQL types and operations
- `npm run test:contracts`: Run Move contract tests
- `npm run verify:contracts`: Verify contract code
- `npm run deploy:contracts`: Deploy contracts to Sui network

