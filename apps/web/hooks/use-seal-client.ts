"use client";

import { useCallback, useMemo, useState } from "react";
import { SealClient, SessionKey, NoAccessError, EncryptedObject } from "@mysten/seal";
import type { ExportedSessionKey } from "@mysten/seal";
import { useSuiClient, useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkConfig } from "@/app/(root)/_components/sui-provider";
import { fromHex, toHex } from "@mysten/sui/utils";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { blake2b } from "@noble/hashes/blake2.js";

// ============== Types ==============

export interface EncryptedCard {
  ciphertext: Uint8Array;
  hash: Uint8Array;
  nonce: Uint8Array;
}

export interface DecryptedCard {
  cardIndex: number;
  value: number;
  plaintext: Uint8Array;
}

// ============== Constants ==============

// Standard deck for Love Letter 2019 Premium Edition (21 cards)
const DECK_COMPOSITION = [
  0, 0, // 2 Spies
  1, 1, 1, 1, 1, 1, // 6 Guards
  2, 2, // 2 Priests
  3, 3, // 2 Barons
  4, 4, // 2 Handmaids
  5, 5, // 2 Princes
  6, 6, // 2 Chancellors
  7, // 1 King
  8, // 1 Countess
  9, // 1 Princess
];

// Testnet key servers for Seal (from official example)
const TESTNET_KEY_SERVER_OBJECT_IDS = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];

// Session key TTL in minutes
const SESSION_KEY_TTL_MIN = 10;

// IndexedDB key for session storage
const SESSION_KEY_STORAGE = "seal-session-key-v4";

// ============== Utility Functions ==============

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j] as T;
    shuffled[j] = temp as T;
  }
  return shuffled;
}

/**
 * Generate random bytes
 */
export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Compute blake2b256 hash (matches Sui's blake2b256)
 * This is used for on-chain verification: blake2b256(plaintext || nonce) == stored_hash
 */
function computeBlake2b256(data: Uint8Array): Uint8Array {
  return blake2b(data, { dkLen: 32 });
}

/**
 * Create plaintext data for a card
 * Format: [card_value: u8][padding: 31 bytes of zeros]
 */
export function createPlaintext(cardValue: number): Uint8Array {
  const plaintext = new Uint8Array(32);
  plaintext[0] = cardValue;
  // Rest is already zeros
  return plaintext;
}

/**
 * Create Seal identity for a card
 * Format: [namespace (room ID bytes)][card_index (8 bytes big-endian)][nonce (5 bytes, optional)]
 * This format must match contract's extract_card_index_from_seal_id which expects:
 * [namespace][card_index (8 bytes)][nonce (variable)]
 */
function createSealIdentity(namespace: Uint8Array, cardIndex: number, nonce?: Uint8Array): string {
  const indexBytes = new Uint8Array(8);
  const view = new DataView(indexBytes.buffer);
  view.setBigUint64(0, BigInt(cardIndex), false); // big-endian
  
  // If nonce provided, include it at the end (for encryption uniqueness)
  if (nonce) {
    const identity = new Uint8Array(namespace.length + 8 + nonce.length);
    identity.set(namespace, 0);
    identity.set(indexBytes, namespace.length);
    identity.set(nonce, namespace.length + 8);
    return toHex(identity);
  }
  
  // Without nonce (for simple identity)
  const identity = new Uint8Array(namespace.length + 8);
  identity.set(namespace, 0);
  identity.set(indexBytes, namespace.length);
  return toHex(identity);
}

/**
 * Save session key to localStorage
 */
function saveSessionKey(exported: ExportedSessionKey): void {
  try {
    localStorage.setItem(SESSION_KEY_STORAGE, JSON.stringify(exported));
  } catch (e) {
    console.warn("Failed to save session key:", e);
  }
}

/**
 * Load session key from localStorage
 */
function loadSessionKey(): ExportedSessionKey | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY_STORAGE);
    if (stored) {
      return JSON.parse(stored) as ExportedSessionKey;
    }
  } catch (e) {
    console.warn("Failed to load session key:", e);
  }
  return null;
}

/**
 * Clear session key from localStorage
 */
function clearSessionKey(): void {
  try {
    localStorage.removeItem(SESSION_KEY_STORAGE);
  } catch (e) {
    console.warn("Failed to clear session key:", e);
  }
}

// ============== Hooks ==============

/**
 * Hook to get Seal client instance
 */
export function useSealClient() {
  const client = useSuiClient();
  
  const sealClient = useMemo(() => {
    try {
      return new SealClient({
        suiClient: client,
        serverConfigs: TESTNET_KEY_SERVER_OBJECT_IDS.map((id) => ({
          objectId: id,
          weight: 1,
        })),
        verifyKeyServers: false, // Set to true in production
      });
    } catch (error) {
      console.error("Failed to create SealClient:", error);
      return null;
    }
  }, [client]);
  
  return sealClient;
}

/**
 * Hook to manage Seal session key
 */
export function useSealSession() {
  const currentAccount = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const {
    variables: { movePackageIdV4 },
  } = useNetworkConfig();
  const [sessionKey, setSessionKey] = useState<SessionKey | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const getOrCreateSessionKey = useCallback(async (): Promise<SessionKey | null> => {
    if (!currentAccount) return null;

    // Try to use existing session key
    if (sessionKey && !sessionKey.isExpired() && sessionKey.getAddress() === currentAccount.address) {
      return sessionKey;
    }

    // Try to load from storage
    const imported = loadSessionKey();
    if (imported) {
      try {
        const loadedKey = await SessionKey.import(
          imported,
          new SuiClient({ url: getFullnodeUrl("testnet") })
        );
        if (loadedKey && !loadedKey.isExpired() && loadedKey.getAddress() === currentAccount.address) {
          setSessionKey(loadedKey);
          return loadedKey;
        }
      } catch (error) {
        console.log("Imported session key is expired or invalid:", error);
      }
    }

    // Clear old session key
    clearSessionKey();
    setIsCreatingSession(true);

    try {
      // Create new session key
      const newSessionKey = await SessionKey.create({
        address: currentAccount.address,
        packageId: movePackageIdV4,
        ttlMin: SESSION_KEY_TTL_MIN,
        suiClient: client,
      });

      // Sign the personal message
      const result = await signPersonalMessage({
        message: newSessionKey.getPersonalMessage(),
      });

      await newSessionKey.setPersonalMessageSignature(result.signature);

      // Save to storage
      saveSessionKey(newSessionKey.export());
      setSessionKey(newSessionKey);
      
      return newSessionKey;
    } catch (error) {
      console.error("Failed to create session key:", error);
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  }, [currentAccount, client, signPersonalMessage, movePackageIdV4, sessionKey]);

  return {
    sessionKey,
    getOrCreateSessionKey,
    isCreatingSession,
  };
}

/**
 * Hook to encrypt a deck of cards for a room
 */
export function useEncryptDeck() {
  const sealClient = useSealClient();
  const {
    variables: { movePackageIdV4 },
  } = useNetworkConfig();
  
  const encryptDeck = useCallback(
    async (roomId: string): Promise<{
      shuffledDeck: number[];
      encryptedCards: EncryptedCard[];
    }> => {
      // Convert room ID to namespace bytes
      const namespace = fromHex(roomId);
      
      // Shuffle the deck
      const shuffledDeck = shuffleArray(DECK_COMPOSITION);
      
      const encryptedCards: EncryptedCard[] = [];
      
      for (let i = 0; i < shuffledDeck.length; i++) {
        const cardValue = shuffledDeck[i];
        if (cardValue === undefined) continue;
        
        // Create plaintext: [card_value][31 bytes padding]
        const plaintext = createPlaintext(cardValue);
        
        // Generate random nonce (32 bytes for hash, 5 bytes for identity)
        const hashNonce = randomBytes(32);
        const identityNonce = randomBytes(5);
        
        // Compute hash: blake2b256(plaintext || nonce)
        // This must match the contract's verification: blake2b256(data || nonce) == hash
        const hashInput = new Uint8Array(plaintext.length + hashNonce.length);
        hashInput.set(plaintext, 0);
        hashInput.set(hashNonce, plaintext.length);
        const hash = computeBlake2b256(hashInput);
        
        if (i === 0) {
          console.log("=== Encrypt Card 0 Debug ===");
          console.log("cardValue:", cardValue);
          console.log("plaintext:", Array.from(plaintext));
          console.log("plaintext hex:", Array.from(plaintext).map(b => b.toString(16).padStart(2, '0')).join(''));
          console.log("hashNonce:", Array.from(hashNonce));
          console.log("hashInput:", Array.from(hashInput));
          console.log("hash:", Array.from(hash));
          console.log("hash hex:", Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join(''));
        }
        
        // Create Seal identity for this card
        // Format: [namespace][card_index (8 bytes)][nonce (5 bytes)]
        const id = createSealIdentity(namespace, i, identityNonce);
        
        if (i === 0) {
          console.log("=== Seal Identity Debug (Card 0) ===");
          console.log("namespace hex:", Array.from(namespace).map(b => b.toString(16).padStart(2, '0')).join(''));
          console.log("cardIndex:", i);
          console.log("identityNonce:", Array.from(identityNonce));
          console.log("full id:", id);
        }
        
        // TEMPORARY: Skip Seal encryption for testing hash verification
        // TODO: Re-enable Seal encryption once hash verification works
        const SKIP_SEAL_ENCRYPTION = true;
        
        let ciphertext: Uint8Array;
        
        if (!SKIP_SEAL_ENCRYPTION && sealClient) {
          try {
            const encryptedData = await sealClient.encrypt({
              threshold: 2,
              packageId: movePackageIdV4,
              id,
              data: plaintext,
            });
            
            ciphertext = encryptedData.encryptedObject;
          } catch (error) {
            console.warn(`Seal encryption failed for card ${i}, using plaintext:`, error);
            // Fallback: use plaintext as ciphertext for testing
            ciphertext = plaintext;
          }
        } else {
          // Use plaintext as ciphertext for testing
          console.log(`Card ${i}: Using plaintext mode (Seal disabled)`);
          ciphertext = plaintext;
        }
        
        encryptedCards.push({
          ciphertext,
          hash,
          nonce: hashNonce,
        });
      }
      
      return { shuffledDeck, encryptedCards };
    },
    [sealClient, movePackageIdV4]
  );
  
  return { encryptDeck };
}

/**
 * Hook to decrypt cards using Seal with proper session key management
 */
export function useDecryptCards() {
  const sealClient = useSealClient();
  const client = useSuiClient();
  const { getOrCreateSessionKey, isCreatingSession } = useSealSession();
  const {
    variables: { movePackageIdV4 },
  } = useNetworkConfig();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Construct the move call for seal_approve_card
   */
  const constructMoveCall = useCallback(
    (tx: Transaction, id: string, roomId: string) => {
      tx.moveCall({
        target: `${movePackageIdV4}::game::seal_approve_card`,
        arguments: [
          tx.pure.vector("u8", Array.from(fromHex(id))),
          tx.object(roomId),
        ],
      });
    },
    [movePackageIdV4]
  );

  /**
   * Decrypt multiple cards (player's hand)
   */
  const decryptCards = useCallback(
    async (
      roomId: string,
      cardIndices: number[],
      encryptedCards: Array<{ ciphertext: Uint8Array }>
    ): Promise<DecryptedCard[]> => {
      if (!sealClient || cardIndices.length === 0) {
        // Fallback: try to extract values from plaintext ciphertext
        return cardIndices.map((cardIndex) => {
          const card = encryptedCards[cardIndex];
          const value = card?.ciphertext[0] ?? 0;
          return {
            cardIndex,
            value,
            plaintext: card?.ciphertext ?? new Uint8Array([value]),
          };
        });
      }

      setIsDecrypting(true);
      setError(null);

      try {
        // Get or create session key
        const sessionKey = await getOrCreateSessionKey();
        if (!sessionKey) {
          throw new Error("Failed to create session key");
        }

        const decryptedCards: DecryptedCard[] = [];

        // Filter valid encrypted cards (those that are actually Seal encrypted, not plaintext)
        const validCards: Array<{ cardIndex: number; ciphertext: Uint8Array }> = [];
        const plaintextCards: DecryptedCard[] = [];

        for (const cardIndex of cardIndices) {
          const card = encryptedCards[cardIndex];
          if (!card) continue;

          // If ciphertext is 32 bytes, it's likely plaintext (testing mode)
          if (card.ciphertext.length === 32) {
            const value = card.ciphertext[0] ?? 0;
            console.log(`=== Decrypt Card ${cardIndex} (plaintext mode) ===`);
            console.log("ciphertext length:", card.ciphertext.length);
            console.log("ciphertext:", Array.from(card.ciphertext));
            console.log("extracted value:", value);
            plaintextCards.push({
              cardIndex,
              value,
              plaintext: card.ciphertext,
            });
          } else {
            validCards.push({ cardIndex, ciphertext: card.ciphertext });
          }
        }

        // Add plaintext cards directly
        decryptedCards.push(...plaintextCards);

        if (validCards.length === 0) {
          return decryptedCards;
        }

        // Parse encrypted objects to get IDs
        const encryptedObjects = validCards.map(({ ciphertext, cardIndex }) => {
          try {
            const parsed = EncryptedObject.parse(ciphertext);
            console.log(`=== Parsed Encrypted Object (Card ${cardIndex}) ===`);
            console.log("id from encrypted object:", parsed.id);
            console.log("id bytes:", Array.from(fromHex(parsed.id)));
            return parsed;
          } catch (e) {
            console.error(`Failed to parse encrypted object for card ${cardIndex}:`, e);
            return null;
          }
        });

        const validEncrypted = validCards.filter((_, i) => encryptedObjects[i] !== null);
        const validIds = encryptedObjects
          .filter((obj): obj is NonNullable<typeof obj> => obj !== null)
          .map((obj) => obj.id);

        if (validIds.length === 0) {
          return decryptedCards;
        }

        // Fetch keys in batches of 10
        for (let i = 0; i < validIds.length; i += 10) {
          const batchIds = validIds.slice(i, i + 10);
          const tx = new Transaction();
          for (const id of batchIds) {
            constructMoveCall(tx, id, roomId);
          }
          const txBytes = await tx.build({ client, onlyTransactionKind: true });

          try {
            await sealClient.fetchKeys({
              ids: batchIds,
              txBytes,
              sessionKey,
              threshold: 2,
            });
          } catch (err) {
            if (err instanceof NoAccessError) {
              setError("No access to decryption keys");
            } else {
              setError("Unable to fetch decryption keys");
            }
            console.error("Failed to fetch keys:", err);
            // Continue with what we have
          }
        }

        // Decrypt each card
        for (let i = 0; i < validEncrypted.length; i++) {
          const encryptedItem = validEncrypted[i];
          const id = validIds[i];
          if (!encryptedItem || !id) continue;
          const { cardIndex, ciphertext } = encryptedItem;

          const tx = new Transaction();
          constructMoveCall(tx, id, roomId);
          const txBytes = await tx.build({ client, onlyTransactionKind: true });

          try {
            const decryptedData = await sealClient.decrypt({
              data: ciphertext,
              sessionKey,
              txBytes,
            });

            decryptedCards.push({
              cardIndex,
              value: decryptedData[0] ?? 0,
              plaintext: decryptedData,
            });
          } catch (err) {
            console.error(`Failed to decrypt card ${cardIndex}:`, err);
            // When Seal decryption fails, we cannot know the card value
            // Mark as unknown (-1) so UI can show "???" 
            decryptedCards.push({
              cardIndex,
              value: -1, // Unknown value - Seal decryption failed
              plaintext: new Uint8Array(0),
            });
          }
        }

        return decryptedCards;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Decryption failed";
        setError(errorMsg);
        console.error("Decryption error:", err);

        // Fallback: return plaintext values
        return cardIndices.map((cardIndex) => {
          const card = encryptedCards[cardIndex];
          const value = card?.ciphertext[0] ?? 0;
          return {
            cardIndex,
            value,
            plaintext: card?.ciphertext ?? new Uint8Array([value]),
          };
        });
      } finally {
        setIsDecrypting(false);
      }
    },
    [sealClient, client, getOrCreateSessionKey, constructMoveCall]
  );

  return {
    decryptCards,
    isDecrypting: isDecrypting || isCreatingSession,
    error,
  };
}

/**
 * Legacy hook for backward compatibility
 */
export function useDecryptHand() {
  const { decryptCards, isDecrypting, error } = useDecryptCards();

  const decryptHand = useCallback(
    async (
      roomId: string,
      cardIndices: number[],
      encryptedCards: Array<{ ciphertext: Uint8Array }>
    ): Promise<DecryptedCard[]> => {
      return decryptCards(roomId, cardIndices, encryptedCards);
    },
    [decryptCards]
  );

  return { decryptHand, isDecrypting, error };
}

/**
 * Create plaintext data for contract verification
 * This is used when playing a card - the contract verifies hash(plaintext || nonce) == stored_hash
 */
export function createPlaintextForVerification(cardValue: number): Uint8Array {
  return createPlaintext(cardValue);
}

/**
 * Convert encrypted cards to format expected by contract
 */
export function prepareEncryptedDeckForSubmission(encryptedCards: EncryptedCard[]): {
  ciphertexts: number[][];
  hashes: number[][];
  nonces: number[][];
} {
  return {
    ciphertexts: encryptedCards.map((card) => Array.from(card.ciphertext)),
    hashes: encryptedCards.map((card) => Array.from(card.hash)),
    nonces: encryptedCards.map((card) => Array.from(card.nonce)),
  };
}
