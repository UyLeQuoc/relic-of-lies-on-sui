📜 Relic of Lies - Technical Documentation (2026 Edition)
1. Executive Summary
Relic of Lies is a 1v1 fantasy dungeon-themed card game built on the Sui blockchain. It utilizes the zkTunnel (State Channel) pattern to allow players to execute turns off-chain with instantaneous speed while ensuring absolute privacy and security through Zero-Knowledge Proofs (ZKP).

2. Updated Tech Stack
Blockchain: Sui Network (Move Language).

State Channel: zkTunnel (Groth16 Proofs) for secure on-chain settlement.

Onboarding: Enoki (zkLogin) for Google authentication and gasless user experience.

Privacy: SEAL (Sui Encryption & Authentication Layer) for encrypting hand cards.

Real-time & DB: Supabase (Realtime & Edge Functions) replacing traditional WebSocket servers.

Frontend: Next.js 15 (App Router) with React 19.

3. System Architecture
The architecture follows a Hybrid Model:

Next.js Frontend: Handles the UI and generates ZK Proofs locally.

Supabase Realtime: Acts as the "Signaling Layer" to pass signed game states between players.

Sui Blockchain: Acts as the "Truth Layer" that holds stakes and verifies the final game outcome.

4. Step-by-Step Implementation Guide (For AI)
Step 1: Smart Contract Foundation (zkTunnel)
Task: Deploy the zk_tunnel.move module provided by Mysten Labs.

AI Instructions:

Define the Tunnel object to hold staked Balance<T>.

Ensure the verify_groth16_bn254_proof function is correctly linked to Sui's native verifier.

Implement the dispute_period logic to protect players if an opponent disconnects.

Step 2: Seamless Onboarding with Enoki
Task: Set up a passwordless login flow.

AI Instructions:

Integrate the Enoki SDK into the Next.js app.

Configure zkLogin so players can create a Sui wallet using Google accounts (Ephemeral Keys).

Set up the Enoki Gas Station to sponsor transactions for create_tunnel and close_tunnel.

Step 3: Private State Management (SEAL & Supabase)
Task: Manage hidden information (cards in hand).

AI Instructions:

Write a Supabase Edge Function to perform the initial deck shuffle.

Use SEAL to encrypt card IDs. Only the cardholder should be able to decrypt their own "Guard" or "Princess" card.

Store match metadata in the Supabase PostgreSQL database.

Step 4: Off-chain Game Loop (The "Tunnel")
Task: Build the real-time interaction mechanism between players.

AI Instructions:

Use Supabase Realtime to broadcast LatestStateData (version, balances, finality status).

Each player must sign the latest state off-chain using their Enoki Ephemeral Key.

Maintain a local log of these signed states to serve as evidence during potential disputes.

Step 5: ZK Proof Generation & Settlement
Task: Generate the mathematical proof to close the tunnel and distribute funds.

AI Instructions:

Write a ZK Circuit (using Circom) that proves the game logic (e.g., "Player A wins because Card X > Card Y" and "The final balance matches the LatestState").

Use snarkjs within the Next.js frontend to generate the Groth16 Proof.

Call the close_tunnel function on Sui with the LatestState and the generated proof to settle the stake.

5. Key Differentiators
Zero-Knowledge Privacy: Unlike earlier versions, cards are never revealed on the explorer, even during settlement, thanks to zkTunnel.

Web2 UX: Thanks to Enoki, users don't need to install wallets or manage seed phrases.

Instantaneous Gameplay: Card plays happen at the speed of Supabase Realtime (milliseconds), not restricted by blockchain latency.