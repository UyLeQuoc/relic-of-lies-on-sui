/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Events module for Love Letter 2019 Premium Edition (ZK Version) Used for
 * frontend to track match history and game state changes
 */

import { MoveStruct } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
const $moduleName = 'contract::events';
export const RoomCreated = new MoveStruct({ name: `${$moduleName}::RoomCreated`, fields: {
        room_id: bcs.Address,
        creator: bcs.Address,
        room_name: bcs.string(),
        max_players: bcs.u8(),
        tokens_to_win: bcs.u8()
    } });
export const PlayerJoined = new MoveStruct({ name: `${$moduleName}::PlayerJoined`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        current_players: bcs.u8(),
        max_players: bcs.u8()
    } });
export const PlayerLeft = new MoveStruct({ name: `${$moduleName}::PlayerLeft`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        current_players: bcs.u8()
    } });
export const RoundStarted = new MoveStruct({ name: `${$moduleName}::RoundStarted`, fields: {
        room_id: bcs.Address,
        round_number: bcs.u8(),
        players: bcs.vector(bcs.Address),
        first_player: bcs.Address,
        dealer: bcs.Address,
        deck_commitment: bcs.vector(bcs.u8())
    } });
export const TurnPlayed = new MoveStruct({ name: `${$moduleName}::TurnPlayed`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        card_played: bcs.u8(),
        target: bcs.option(bcs.Address),
        guess: bcs.option(bcs.u8())
    } });
export const PlayerEliminated = new MoveStruct({ name: `${$moduleName}::PlayerEliminated`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        eliminated_by: bcs.Address,
        card_used: bcs.u8()
    } });
export const RoundEnded = new MoveStruct({ name: `${$moduleName}::RoundEnded`, fields: {
        room_id: bcs.Address,
        round_number: bcs.u8(),
        winner: bcs.Address,
        spy_bonus_player: bcs.option(bcs.Address)
    } });
export const TokenAwarded = new MoveStruct({ name: `${$moduleName}::TokenAwarded`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        token_count: bcs.u8(),
        reason: bcs.string()
    } });
export const GameEnded = new MoveStruct({ name: `${$moduleName}::GameEnded`, fields: {
        room_id: bcs.Address,
        winner: bcs.Address,
        final_tokens: bcs.u8(),
        prize_pool: bcs.u64(),
        total_rounds: bcs.u8()
    } });
export const GuardPlayed = new MoveStruct({ name: `${$moduleName}::GuardPlayed`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        target: bcs.Address,
        guessed_card: bcs.u8(),
        deadline: bcs.u64()
    } });
export const GuardProofSubmitted = new MoveStruct({ name: `${$moduleName}::GuardProofSubmitted`, fields: {
        room_id: bcs.Address,
        target: bcs.Address,
        is_correct: bcs.bool()
    } });
export const BaronPlayed = new MoveStruct({ name: `${$moduleName}::BaronPlayed`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        target: bcs.Address,
        deadline: bcs.u64()
    } });
export const BaronProofSubmitted = new MoveStruct({ name: `${$moduleName}::BaronProofSubmitted`, fields: {
        room_id: bcs.Address,
        result: bcs.u8(),
        loser: bcs.option(bcs.Address)
    } });
export const PriestPlayed = new MoveStruct({ name: `${$moduleName}::PriestPlayed`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        target: bcs.Address
    } });
export const ProofTimeout = new MoveStruct({ name: `${$moduleName}::ProofTimeout`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        action_type: bcs.u8()
    } });
export const CardCommitted = new MoveStruct({ name: `${$moduleName}::CardCommitted`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        commitment: bcs.vector(bcs.u8())
    } });
export const KingSwapInitiated = new MoveStruct({ name: `${$moduleName}::KingSwapInitiated`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        target: bcs.Address,
        deadline: bcs.u64()
    } });
export const KingSwapCompleted = new MoveStruct({ name: `${$moduleName}::KingSwapCompleted`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        target: bcs.Address
    } });
export const PrinceEffectInitiated = new MoveStruct({ name: `${$moduleName}::PrinceEffectInitiated`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        target: bcs.Address,
        deadline: bcs.u64()
    } });
export const ChancellorDrawn = new MoveStruct({ name: `${$moduleName}::ChancellorDrawn`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        cards_count: bcs.u8()
    } });
export const ChancellorReturned = new MoveStruct({ name: `${$moduleName}::ChancellorReturned`, fields: {
        room_id: bcs.Address,
        player: bcs.Address
    } });
export const LeaderboardUpdated = new MoveStruct({ name: `${$moduleName}::LeaderboardUpdated`, fields: {
        player: bcs.Address,
        total_wins: bcs.u64(),
        total_games: bcs.u64()
    } });