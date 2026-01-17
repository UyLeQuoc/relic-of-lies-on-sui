/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Constants module for Love Letter with Seal Integration Contains all fixed values
 * for cards, game rules, and Seal configuration
 */

import { type Transaction } from '@mysten/sui/transactions';
export interface EntryFeeOptions {
    package: string;
    arguments?: [
    ];
}
export function entryFee(options: EntryFeeOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'entry_fee',
    });
}
export interface MaxPlayersOptions {
    package: string;
    arguments?: [
    ];
}
export function maxPlayers(options: MaxPlayersOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'max_players',
    });
}
export interface MinPlayersOptions {
    package: string;
    arguments?: [
    ];
}
export function minPlayers(options: MinPlayersOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'min_players',
    });
}
export interface TokensToWinOptions {
    package: string;
    arguments?: [
    ];
}
export function tokensToWin(options: TokensToWinOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'tokens_to_win',
    });
}
export interface StatusWaitingOptions {
    package: string;
    arguments?: [
    ];
}
export function statusWaiting(options: StatusWaitingOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'status_waiting',
    });
}
export interface StatusPlayingOptions {
    package: string;
    arguments?: [
    ];
}
export function statusPlaying(options: StatusPlayingOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'status_playing',
    });
}
export interface StatusRoundEndOptions {
    package: string;
    arguments?: [
    ];
}
export function statusRoundEnd(options: StatusRoundEndOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'status_round_end',
    });
}
export interface StatusFinishedOptions {
    package: string;
    arguments?: [
    ];
}
export function statusFinished(options: StatusFinishedOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'status_finished',
    });
}
export interface StatusPendingResponseOptions {
    package: string;
    arguments?: [
    ];
}
export function statusPendingResponse(options: StatusPendingResponseOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'status_pending_response',
    });
}
export interface CardSpyOptions {
    package: string;
    arguments?: [
    ];
}
export function cardSpy(options: CardSpyOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'card_spy',
    });
}
export interface CardGuardOptions {
    package: string;
    arguments?: [
    ];
}
export function cardGuard(options: CardGuardOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'card_guard',
    });
}
export interface CardPriestOptions {
    package: string;
    arguments?: [
    ];
}
export function cardPriest(options: CardPriestOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'card_priest',
    });
}
export interface CardBaronOptions {
    package: string;
    arguments?: [
    ];
}
export function cardBaron(options: CardBaronOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'card_baron',
    });
}
export interface CardHandmaidOptions {
    package: string;
    arguments?: [
    ];
}
export function cardHandmaid(options: CardHandmaidOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'card_handmaid',
    });
}
export interface CardPrinceOptions {
    package: string;
    arguments?: [
    ];
}
export function cardPrince(options: CardPrinceOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'card_prince',
    });
}
export interface CardChancellorOptions {
    package: string;
    arguments?: [
    ];
}
export function cardChancellor(options: CardChancellorOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'card_chancellor',
    });
}
export interface CardKingOptions {
    package: string;
    arguments?: [
    ];
}
export function cardKing(options: CardKingOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'card_king',
    });
}
export interface CardCountessOptions {
    package: string;
    arguments?: [
    ];
}
export function cardCountess(options: CardCountessOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'card_countess',
    });
}
export interface CardPrincessOptions {
    package: string;
    arguments?: [
    ];
}
export function cardPrincess(options: CardPrincessOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'card_princess',
    });
}
export interface SpyCountOptions {
    package: string;
    arguments?: [
    ];
}
export function spyCount(options: SpyCountOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'spy_count',
    });
}
export interface GuardCountOptions {
    package: string;
    arguments?: [
    ];
}
export function guardCount(options: GuardCountOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'guard_count',
    });
}
export interface PriestCountOptions {
    package: string;
    arguments?: [
    ];
}
export function priestCount(options: PriestCountOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'priest_count',
    });
}
export interface BaronCountOptions {
    package: string;
    arguments?: [
    ];
}
export function baronCount(options: BaronCountOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'baron_count',
    });
}
export interface HandmaidCountOptions {
    package: string;
    arguments?: [
    ];
}
export function handmaidCount(options: HandmaidCountOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'handmaid_count',
    });
}
export interface PrinceCountOptions {
    package: string;
    arguments?: [
    ];
}
export function princeCount(options: PrinceCountOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'prince_count',
    });
}
export interface ChancellorCountOptions {
    package: string;
    arguments?: [
    ];
}
export function chancellorCount(options: ChancellorCountOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'chancellor_count',
    });
}
export interface KingCountOptions {
    package: string;
    arguments?: [
    ];
}
export function kingCount(options: KingCountOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'king_count',
    });
}
export interface CountessCountOptions {
    package: string;
    arguments?: [
    ];
}
export function countessCount(options: CountessCountOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'countess_count',
    });
}
export interface PrincessCountOptions {
    package: string;
    arguments?: [
    ];
}
export function princessCount(options: PrincessCountOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'princess_count',
    });
}
export interface TotalCardsOptions {
    package: string;
    arguments?: [
    ];
}
export function totalCards(options: TotalCardsOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'total_cards',
    });
}
export interface BurnCardCountOptions {
    package: string;
    arguments?: [
    ];
}
export function burnCardCount(options: BurnCardCountOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'burn_card_count',
    });
}
export interface TwoPlayerPublicCardsOptions {
    package: string;
    arguments?: [
    ];
}
export function twoPlayerPublicCards(options: TwoPlayerPublicCardsOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'two_player_public_cards',
    });
}
export interface MaxLeaderboardEntriesOptions {
    package: string;
    arguments?: [
    ];
}
export function maxLeaderboardEntries(options: MaxLeaderboardEntriesOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'max_leaderboard_entries',
    });
}
export interface PendingNoneOptions {
    package: string;
    arguments?: [
    ];
}
export function pendingNone(options: PendingNoneOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'pending_none',
    });
}
export interface PendingGuardResponseOptions {
    package: string;
    arguments?: [
    ];
}
export function pendingGuardResponse(options: PendingGuardResponseOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'pending_guard_response',
    });
}
export interface PendingBaronResponseOptions {
    package: string;
    arguments?: [
    ];
}
export function pendingBaronResponse(options: PendingBaronResponseOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'pending_baron_response',
    });
}
export interface PendingChancellorResolveOptions {
    package: string;
    arguments?: [
    ];
}
export function pendingChancellorResolve(options: PendingChancellorResolveOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'pending_chancellor_resolve',
    });
}
export interface PendingRoundEndRevealOptions {
    package: string;
    arguments?: [
    ];
}
export function pendingRoundEndReveal(options: PendingRoundEndRevealOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'pending_round_end_reveal',
    });
}
export interface SecretLengthOptions {
    package: string;
    arguments?: [
    ];
}
export function secretLength(options: SecretLengthOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'constants',
        function: 'secret_length',
    });
}