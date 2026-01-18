/// Decryptable module for Seal encryption integration
/// Provides encrypted/decrypted state management with on-chain verification
module contract_v4::decryptable;

use sui::hash::blake2b256;

// ============== Errors ==============

const EHashMismatch: u64 = 0;
const EInvalidHashLength: u64 = 1;
const EInvalidNonceLength: u64 = 2;
const ENotDecrypted: u64 = 3;
const ENotEncrypted: u64 = 4;

// ============== Enums ==============

/// Decryptable enum - represents either encrypted or decrypted state
public enum Decryptable has copy, drop, store {
    /// Encrypted state - contains ciphertext, hash for verification, and nonce
    Encrypted { ciphertext: vector<u8>, hash: vector<u8>, nonce: vector<u8> },
    /// Decrypted state - contains the plaintext data
    Decrypted { data: vector<u8> },
}

// ============== Public Functions ==============

/// Create a new Decryptable in encrypted state
/// - ciphertext: The encrypted data (from Seal SDK)
/// - hash: blake2b256(plaintext_data || nonce) - 32 bytes
/// - nonce: Random 32 bytes used in hash
public fun new(ciphertext: vector<u8>, hash: vector<u8>, nonce: vector<u8>): Decryptable {
    assert!(hash.length() == 32, EInvalidHashLength);
    assert!(nonce.length() == 32, EInvalidNonceLength);

    Decryptable::Encrypted { ciphertext, hash, nonce }
}

/// Decrypt and verify the data
/// - data: The plaintext data (decrypted off-chain via Seal)
/// Verifies: blake2b256(data || nonce) == hash
/// Transitions from Encrypted to Decrypted state
/// If already decrypted, this is a no-op (idempotent)
public fun decrypt(self: &mut Decryptable, mut data: vector<u8>) {
    match (self) {
        Decryptable::Encrypted { hash, nonce, .. } => {
            // Append nonce to data for hash verification
            data.append(*nonce);
            assert!(blake2b256(&data) == *hash, EHashMismatch);
            
            // Remove nonce from data (restore original plaintext)
            let data_len = data.length() - 32;
            let mut original_data = vector[];
            data_len.do!(|i| {
                original_data.push_back(data[i]);
            });
            
            *self = Decryptable::Decrypted { data: original_data };
        },
        Decryptable::Decrypted { .. } => {
            // Already decrypted - no-op (idempotent behavior)
            // This allows re-playing cards that were already revealed
        },
    };
}

/// Check if the Decryptable is in encrypted state
public fun is_encrypted(self: &Decryptable): bool {
    match (self) {
        Decryptable::Encrypted { .. } => true,
        Decryptable::Decrypted { .. } => false,
    }
}

/// Check if the Decryptable is in decrypted state
public fun is_decrypted(self: &Decryptable): bool {
    !is_encrypted(self)
}

// ============== View Functions ==============

/// Get the ciphertext (only valid when encrypted)
public fun ciphertext(self: &Decryptable): &vector<u8> {
    match (self) {
        Decryptable::Encrypted { ciphertext, .. } => ciphertext,
        Decryptable::Decrypted { .. } => abort ENotEncrypted,
    }
}

/// Get the decrypted data (only valid when decrypted)
public fun data(self: &Decryptable): &vector<u8> {
    match (self) {
        Decryptable::Encrypted { .. } => abort ENotDecrypted,
        Decryptable::Decrypted { data } => data,
    }
}

/// Get the hash (only valid when encrypted)
public fun hash(self: &Decryptable): &vector<u8> {
    match (self) {
        Decryptable::Encrypted { hash, .. } => hash,
        Decryptable::Decrypted { .. } => abort ENotEncrypted,
    }
}

/// Get the nonce (only valid when encrypted)
public fun nonce(self: &Decryptable): &vector<u8> {
    match (self) {
        Decryptable::Encrypted { nonce, .. } => nonce,
        Decryptable::Decrypted { .. } => abort ENotEncrypted,
    }
}

/// Extract card value from decrypted data
/// Data format: [card_value: u8][padding: 31 bytes]
public fun extract_card_value(self: &Decryptable): u8 {
    let d = data(self);
    assert!(!d.is_empty(), ENotDecrypted);
    d[0]
}

// ============== Test Helpers ==============

#[test_only]
public fun create_test_decryptable(card_value: u8, nonce: vector<u8>): Decryptable {
    use sui::hash::blake2b256;
    
    // Create plaintext data: [card_value][31 bytes padding]
    let mut data = vector[card_value];
    31u64.do!(|_| data.push_back(0u8));
    
    // Create hash: blake2b256(data || nonce)
    let mut hash_input = data;
    hash_input.append(nonce);
    let hash = blake2b256(&hash_input);
    
    // For testing, ciphertext can be empty
    Decryptable::Encrypted { 
        ciphertext: vector[], 
        hash, 
        nonce 
    }
}
