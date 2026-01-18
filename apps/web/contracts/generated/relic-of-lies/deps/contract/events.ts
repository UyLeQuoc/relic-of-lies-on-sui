/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Events module for Relic Of Lies  Used for frontend to track
 * match history and game state changes
 */

import { MoveStruct } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
const $moduleName = 'contract::events';
export const RoomCreated = new MoveStruct({ name: `${$moduleName}::RoomCreated`, fields: {
        room_id: bcs.Address,
        creator: bcs.Address,
        room_name: bcs.string(),
        max_players: bcs.u8(),
        bet_amount: bcs.u64(),
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
        public_cards: bcs.vector(bcs.u8())
    } });
export const TurnPlayed = new MoveStruct({ name: `${$moduleName}::TurnPlayed`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        card_played: bcs.u8(),
        target: bcs.option(bcs.Address),
        guess: bcs.option(bcs.u8()),
        result: bcs.string()
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
        winning_card: bcs.u8(),
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
export const CardRevealed = new MoveStruct({ name: `${$moduleName}::CardRevealed`, fields: {
        room_id: bcs.Address,
        viewer: bcs.Address,
        target: bcs.Address,
        card_value: bcs.u8()
    } });
export const BaronCompared = new MoveStruct({ name: `${$moduleName}::BaronCompared`, fields: {
        room_id: bcs.Address,
        player1: bcs.Address,
        player1_card: bcs.u8(),
        player2: bcs.Address,
        player2_card: bcs.u8(),
        loser: bcs.option(bcs.Address)
    } });
export const ChancellorDrawn = new MoveStruct({ name: `${$moduleName}::ChancellorDrawn`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        cards_drawn: bcs.vector(bcs.u8())
    } });
export const ChancellorReturned = new MoveStruct({ name: `${$moduleName}::ChancellorReturned`, fields: {
        room_id: bcs.Address,
        player: bcs.Address
    } });
export const HandsSwapped = new MoveStruct({ name: `${$moduleName}::HandsSwapped`, fields: {
        room_id: bcs.Address,
        player1: bcs.Address,
        player2: bcs.Address
    } });
export const SpyBonusChecked = new MoveStruct({ name: `${$moduleName}::SpyBonusChecked`, fields: {
        room_id: bcs.Address,
        players_with_spy: bcs.vector(bcs.Address),
        bonus_awarded: bcs.bool(),
        bonus_recipient: bcs.option(bcs.Address)
    } });
export const LeaderboardUpdated = new MoveStruct({ name: `${$moduleName}::LeaderboardUpdated`, fields: {
        player: bcs.Address,
        total_wins: bcs.u64(),
        total_games: bcs.u64()
    } });