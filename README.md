# Relic of Lies

A Web3 fantasy dungeon-themed card game built on the Sui blockchain. Combining turn-based elimination gameplay (inspired by Love Letter) with blockchain technology to create a transparent, fair, and rewarding gaming experience.

## 🎮 Overview

Relic of Lies is a multiplayer card game where players can:
- Connect via Sui wallet for decentralized identity
- Play turn-based elimination matches (2-6 players)
- Stake Sui coins to compete for rewards
- Experience real-time multiplayer gameplay
- Enjoy fair, verifiable gameplay through smart contracts

### Key Features

- **Smart Contract Enforcement**: Game rules enforced on-chain for transparency
- **Commit-Reveal Anti-Cheat**: Cryptographic system prevents cheating
- **Real-time Multiplayer**: Colyseus integration for smooth gameplay
- **Fair Rewards**: Automated, transparent reward distribution
- **Quality Gameplay**: Focus on game quality alongside blockchain integration

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.3.3** with React 19.0.0
- **TypeScript** for type safety
- **Shadcn UI** for components
- **Tailwind CSS 4** for styling
- **Apollo Client** for GraphQL
- **WalletKit** for Sui wallet integration

### Backend
- **NestJS** with GraphQL (Apollo Server)
- **PostgreSQL** with Prisma ORM
- **Colyseus** for real-time game server
- **Sui SDK** for blockchain integration

### Smart Contracts
- **Move** language (2024.beta edition)
- **Sui** blockchain
- Game contract, staking, and commit-reveal verification

### Development
- **Turborepo** for monorepo management
- **Biome** for linting and formatting
- **Docker** for containerization
- **GitHub Actions** for CI/CD

## 📁 Project Structure

```
relic-of-lies/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # NestJS backend with GraphQL
│   └── contract/         # Move smart contracts
├── packages/
│   ├── biome-config/     # Shared Biome configuration
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── docs/                 # Project documentation
└── turbo.json            # Turborepo configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18 (LTS recommended)
- **Bun** 1.2.23 (package manager)
- **PostgreSQL** database
- **Sui CLI** for smart contract development
- **Docker** (optional, for containerized development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd relic-of-lies
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
   - Copy `.env.example` files in each app directory
   - Configure database connection
   - Set up Sui network configuration (testnet/mainnet)
   - Configure API keys and service endpoints

4. Set up the database:
```bash
cd apps/api
bun run prisma migrate dev
bun run prisma generate
```

5. Deploy smart contracts (if needed):
```bash
cd apps/contract
sui move build           # Optional: check contracts
sui client publish       # Deploy to your chosen network
```

### Quick Setup & Run (Web + Contracts)

For a minimal setup focusing on the on-chain game and the web UI:

1. **Install dependencies** (from repo root):
```bash
bun install
```

2. **Build & (optionally) publish contracts**:
```bash
cd apps/contract
sui move build
# Optional – requires configured Sui CLI & wallet
sui client publish --gas-budget 100000000
```

3. **Configure the web app**:
```bash
cd ../web
cp .env.example .env.local   # if provided
# Edit .env.local to set:
# - NEXT_PUBLIC_SUI_NETWORK (e.g. "testnet")
# - CONTRACT_PACKAGE_ID, ROOM_REGISTRY_ID, LEADERBOARD_ID, ...
```

4. **Run the web app in dev mode**:
```bash
bun run dev     # inside apps/web
```

5. **Build for production**:
```bash
bun run build   # inside apps/web
bun run start   # start the production server
```

## 🛠️ Development

### Run All Apps

Start all applications in development mode:

```bash
bun run dev
```

### Run Specific Apps

Start only the frontend:
```bash
turbo dev --filter=web
```

Start only the backend:
```bash
turbo dev --filter=api
```

### Available Scripts

- `bun run dev` - Start all apps in development mode
- `bun run build` - Build all apps and packages
- `bun run lint` - Lint all code
- `bun run check-types` - Type check all TypeScript code
- `bun run format` - Check code formatting
- `bun run format:fix` - Fix code formatting issues

### App-Specific Scripts

#### Web App
```bash
cd apps/web
bun run dev          # Start Next.js dev server
bun run build        # Build for production
bun run codegen      # Generate GraphQL types
```

#### API
```bash
cd apps/api
bun run dev          # Start NestJS dev server
bun run build        # Build for production
bun run prisma:studio # Open Prisma Studio
```

#### Contracts
```bash
cd apps/contract
sui move test        # Run Move contract tests
sui client publish   # Deploy contracts
```

## 🧪 Testing

### Backend Tests
```bash
cd apps/api
bun run test
```

### Contract Tests
```bash
cd apps/contract
sui move test
```

## 🐳 Docker

### Development with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Backend API
- Frontend web app

### Build Docker Images

```bash
docker build -t relic-of-lies-api ./apps/api
docker build -t relic-of-lies-web ./apps/web
```

## 📚 Documentation

For detailed project documentation, see:
- [Project Documentation](./docs/PROJECT_DOCUMENTATION.md) - Complete project overview and technical architecture

## 🎯 Game Features

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

## 🔐 Security

- **Wallet-Based Authentication**: Sui wallet connection
- **Commit-Reveal Anti-Cheat**: Cryptographic card commitment
- **Smart Contract Verification**: Formal verification with Move Prover
- **Input Validation**: Comprehensive validation on all inputs
- **Rate Limiting**: API abuse prevention

## 🚢 Deployment

### Production Deployment

1. Build all apps:
```bash
bun run build
```

2. Run database migrations:
```bash
cd apps/api
bun run prisma migrate deploy
```

3. Deploy smart contracts:
```bash
cd apps/contract
sui client publish --gas-budget 100000000
```

4. Deploy using Docker:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📝 License

[Add your license here]

## 🔗 Links

- [Sui Blockchain](https://sui.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Move Language](https://move-language.github.io/move/)
- [Turborepo Documentation](https://turborepo.org/docs)

## 📊 Project Status

### Completed ✅
- Project initialization and structure
- Development environment setup
- GraphQL Code Generator configuration
- Apollo Client integration
- GitHub Actions CI/CD workflow
- Docker configuration
- Basic Move contract setup
- Basic UI components

### In Progress 🚧
- Sui wallet integration
- Smart contract development
- Database schema implementation
- UI development
- GraphQL API development
- Colyseus real-time server design

### Planned 📋
- Game room creation and management
- Player authentication and profiles
- Real-time multiplayer functionality
- Card game mechanics implementation
- Complete staking and reward distribution

---

For more information, see the [Project Documentation](./docs/PROJECT_DOCUMENTATION.md).
