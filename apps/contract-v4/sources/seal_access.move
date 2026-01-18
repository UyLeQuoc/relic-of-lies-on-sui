/// Seal Access Control module for Love Letter with Seal Integration
/// Handles card ownership verification for Seal key server access control
module contract_v4::seal_access;

// ============== Structs ==============

/// Card ownership record
public struct CardOwnership has store, copy, drop {
    card_index: u64,
    owner: address,
    is_revealed: bool,
}

/// Temporary access grant (e.g., Priest viewing opponent's card)
public struct TemporaryAccess has store, copy, drop {
    viewer: address,
    card_index: u64,
    expires_turn: u64,
}

/// Access control state for a game room
public struct SealAccessState has store, drop {
    /// Room's Seal namespace (derived from room ID)
    namespace: vector<u8>,
    /// Card ownership mapping: index in vector = card index
    card_owners: vector<CardOwnership>,
    /// Temporary access grants (Priest effect, etc.)
    temporary_access: vector<TemporaryAccess>,
    /// Current turn number for access expiration
    current_turn: u64,
}

// ============== Constructor ==============

/// Create new access state for a room
public fun new(namespace: vector<u8>): SealAccessState {
    SealAccessState {
        namespace,
        card_owners: vector[],
        temporary_access: vector[],
        current_turn: 0,
    }
}

// ============== Card Ownership Functions ==============

/// Register a new card with owner
public fun register_card(state: &mut SealAccessState, card_index: u64, owner: address) {
    let ownership = CardOwnership {
        card_index,
        owner,
        is_revealed: false,
    };
    state.card_owners.push_back(ownership);
}

/// Register multiple cards for a player
public fun register_cards_for_player(
    state: &mut SealAccessState,
    card_indices: &vector<u64>,
    owner: address
) {
    card_indices.do_ref!(|idx| {
        register_card(state, *idx, owner);
    });
}

/// Transfer card ownership (King effect)
public fun transfer_ownership(
    state: &mut SealAccessState,
    card_index: u64,
    new_owner: address
) {
    let len = state.card_owners.length();
    len.do!(|i| {
        if (state.card_owners[i].card_index == card_index) {
            state.card_owners[i].owner = new_owner;
        };
    });
}

/// Swap card ownership between two players (King effect)
public fun swap_ownership(
    state: &mut SealAccessState,
    card_index_1: u64,
    card_index_2: u64
) {
    let mut owner_1 = @0x0;
    let mut owner_2 = @0x0;
    let mut idx_1 = 0u64;
    let mut idx_2 = 0u64;
    
    let len = state.card_owners.length();
    len.do!(|i| {
        if (state.card_owners[i].card_index == card_index_1) {
            owner_1 = state.card_owners[i].owner;
            idx_1 = i;
        };
        if (state.card_owners[i].card_index == card_index_2) {
            owner_2 = state.card_owners[i].owner;
            idx_2 = i;
        };
    });
    
    // Swap owners
    state.card_owners[idx_1].owner = owner_2;
    state.card_owners[idx_2].owner = owner_1;
}

/// Mark card as revealed
public fun reveal_card(state: &mut SealAccessState, card_index: u64) {
    let len = state.card_owners.length();
    len.do!(|i| {
        if (state.card_owners[i].card_index == card_index) {
            state.card_owners[i].is_revealed = true;
        };
    });
}

/// Remove card from ownership (when discarded)
public fun remove_card(state: &mut SealAccessState, card_index: u64) {
    let len = state.card_owners.length();
    let mut remove_idx: std::option::Option<u64> = std::option::none();
    
    len.do!(|i| {
        if (state.card_owners[i].card_index == card_index && remove_idx.is_none()) {
            remove_idx = std::option::some(i);
        };
    });
    
    if (remove_idx.is_some()) {
        state.card_owners.remove(remove_idx.destroy_some());
    };
}

// ============== Temporary Access Functions ==============

/// Grant temporary access (Priest effect)
public fun grant_temporary_access(
    state: &mut SealAccessState,
    viewer: address,
    card_index: u64,
    duration_turns: u64
) {
    let access = TemporaryAccess {
        viewer,
        card_index,
        expires_turn: state.current_turn + duration_turns,
    };
    state.temporary_access.push_back(access);
}

/// Check if viewer has temporary access to card
public fun has_temporary_access(
    state: &SealAccessState,
    viewer: address,
    card_index: u64
): bool {
    let mut has_access = false;
    
    state.temporary_access.do_ref!(|access| {
        if (access.viewer == viewer && 
            access.card_index == card_index && 
            access.expires_turn > state.current_turn) {
            has_access = true;
        };
    });
    
    has_access
}

/// Clean up expired temporary access
public fun cleanup_expired_access(state: &mut SealAccessState) {
    let mut new_access = vector[];
    
    state.temporary_access.do_ref!(|access| {
        if (access.expires_turn > state.current_turn) {
            new_access.push_back(*access);
        };
    });
    
    state.temporary_access = new_access;
}

/// Update current turn
public fun advance_turn(state: &mut SealAccessState) {
    state.current_turn = state.current_turn + 1;
    cleanup_expired_access(state);
}

// ============== Access Verification ==============

/// Check if caller owns the card
public fun owns_card(state: &SealAccessState, caller: address, card_index: u64): bool {
    let mut owns = false;
    
    state.card_owners.do_ref!(|ownership| {
        if (ownership.card_index == card_index && ownership.owner == caller) {
            owns = true;
        };
    });
    
    owns
}

/// Check if caller can access the card (owns OR has temporary access)
public fun can_access_card(
    state: &SealAccessState,
    caller: address,
    card_index: u64
): bool {
    owns_card(state, caller, card_index) || has_temporary_access(state, caller, card_index)
}

/// Get card owner
public fun get_card_owner(state: &SealAccessState, card_index: u64): std::option::Option<address> {
    let mut owner: std::option::Option<address> = std::option::none();
    
    state.card_owners.do_ref!(|ownership| {
        if (ownership.card_index == card_index) {
            owner = std::option::some(ownership.owner);
        };
    });
    
    owner
}

/// Get all cards owned by a player
public fun get_player_cards(state: &SealAccessState, player: address): vector<u64> {
    let mut cards = vector[];
    
    state.card_owners.do_ref!(|ownership| {
        if (ownership.owner == player) {
            cards.push_back(ownership.card_index);
        };
    });
    
    cards
}

/// Check if card is revealed
public fun is_card_revealed(state: &SealAccessState, card_index: u64): bool {
    let mut revealed = false;
    
    state.card_owners.do_ref!(|ownership| {
        if (ownership.card_index == card_index) {
            revealed = ownership.is_revealed;
        };
    });
    
    revealed
}

// ============== Seal ID Helper Functions ==============

/// Check if prefix matches the start of data
public fun is_prefix(prefix: &vector<u8>, data: &vector<u8>): bool {
    if (prefix.length() > data.length()) {
        return false
    };
    
    let mut i = 0;
    while (i < prefix.length()) {
        if (prefix[i] != data[i]) {
            return false
        };
        i = i + 1;
    };
    true
}

/// Extract card index from Seal ID
/// Format: [namespace (32 bytes)] [card_index (8 bytes)] [nonce (variable)]
public fun extract_card_index_from_seal_id(seal_id: &vector<u8>, namespace_len: u64): u64 {
    let start = namespace_len;
    let mut result = 0u64;
    let mut i = 0u8;
    
    while (i < 8 && (start + (i as u64)) < seal_id.length()) {
        result = result | ((seal_id[start + (i as u64)] as u64) << ((7 - i) * 8));
        i = i + 1;
    };
    
    result
}

// ============== View Functions ==============

public fun namespace(state: &SealAccessState): vector<u8> {
    state.namespace
}

public fun current_turn(state: &SealAccessState): u64 {
    state.current_turn
}

public fun card_owners_count(state: &SealAccessState): u64 {
    state.card_owners.length()
}

public fun temporary_access_count(state: &SealAccessState): u64 {
    state.temporary_access.length()
}
