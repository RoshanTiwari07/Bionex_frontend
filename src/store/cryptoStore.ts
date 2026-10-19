/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BioNex Crypto Store
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Zustand store that owns the entire keypair lifecycle for zero-knowledge E2E
 * encryption. This is the single source of truth for cryptographic state
 * across the app.
 *
 * State machine:
 *
 *   IDLE ──initializeKeys()──► INITIALIZING
 *     INITIALIZING ──success──► READY
 *     INITIALIZING ──failure──► ERROR
 *   READY ──clearKeys()──────► IDLE        (logout / keypair revoked)
 *   ERROR ──retryInitialize()─► INITIALIZING
 *
 * Lifecycle:
 *   1. Call initializeKeys() after successful login.
 *   2. The store checks the server and local SecureStore.
 *   3. If a private key exists locally and server has a matching keypair → READY.
 *   4. If private key is missing but server has a keypair → re-generate and re-register.
 *   5. If neither exist → generate, store, register.
 *   6. Call clearKeys() on logout to wipe device-side cryptographic material.
 *
 * Security invariants:
 *   • Private key material NEVER enters the store state — only the fingerprint.
 *   • All private key I/O goes through keyStorage.ts (SecureStore wrapper).
 *   • If a server-registration fails after local save, the unregistered flag
 *     ensures the next initializeKeys() call will retry registration.
 *
 * @module cryptoStore
 */

import { create } from 'zustand';
import { generateKeyPair, signRegistrationNonce } from '../utils/cryptoEngine';
import {
  savePrivateKey,
  markKeyRegistered,
  deleteAllKeys,
  getKeyStatus,
} from '../utils/keyStorage';
import { getMyKeypair, getRegistrationChallenge, registerPublicKey } from '../api/keysApi';

// ─── State Shape ──────────────────────────────────────────────────────────────

export type CryptoStatus = 'idle' | 'initializing' | 'ready' | 'error';

interface CryptoState {
  /** Current status of the keypair lifecycle */
  status: CryptoStatus;

  /**
   * SHA-256 hex fingerprint of the current public key.
   * Populated when status === 'ready'. Used for display and server
   * cross-referencing. Does NOT expose private key material.
   */
  keyFingerprint: string | null;

  /**
   * Whether the public key has been confirmed registered on the server.
   * If false, the user can decrypt but cannot receive new sessions until
   * the registration is retried.
   */
  isRegisteredOnServer: boolean;

  /**
   * Human-readable error message for the last failure.
   * Always null when status !== 'error'.
   */
  error: string | null;

  /**
   * Machine-readable error code — stable identifier for programmatic handling.
   * null when status !== 'error'.
   */
  errorCode: string | null;

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Initialize or restore the keypair.
   * Safe to call multiple times — idempotent when status === 'ready'.
   *
   * Flow:
   *   1. Check GET /keypairs/me (server state)
   *   2. Check hasPrivateKey() (local state)
   *   3. Cross-reference: handle 4 possible state combinations
   *   4. Generate/register if needed
   *   5. Transition to READY
   */
  initializeKeys: () => Promise<void>;

  /**
   * Securely wipe all cryptographic material from the device.
   * Called on logout, keypair revocation, or account deletion.
   * Does NOT call the server — call revokeMyKeypair() first if revocation is needed.
   */
  clearKeys: () => Promise<void>;

  /**
   * Retry after an ERROR state.
   * Resets error state and calls initializeKeys() again.
   */
  retryInitialize: () => Promise<void>;
}

// ─── Store Implementation ─────────────────────────────────────────────────────

export const useCryptoStore = create<CryptoState>((set, get) => ({
  status: 'idle',
  keyFingerprint: null,
  isRegisteredOnServer: false,
  error: null,
  errorCode: null,

  // ── initializeKeys ────────────────────────────────────────────────────────

  initializeKeys: async () => {
    // Idempotent guard — if we're already initializing or ready, skip
    const { status } = get();
    if (status === 'initializing' || status === 'ready') return;

    set({ status: 'initializing', error: null, errorCode: null });

    try {
      // ── Step 1: Query server for existing keypair metadata ─────────────────
      const serverKeypair = await getMyKeypair();

      // ── Step 2: Query local SecureStore ───────────────────────────────────
      const localStatus = await getKeyStatus();

      // ── Step 3: Cross-reference all four possible states ──────────────────
      //
      // Case A: Local key exists + Server has keypair
      //         → Happy path. Validate fingerprints match.
      //
      // Case B: Local key missing + Server has keypair
      //         → Keys diverged (app reinstall, device wipe, SecureStore loss).
      //           Must revoke server keypair and re-generate.
      //           NOTE: Old encrypted sessions will become un-decryptable.
      //           This is a security property — not a bug.
      //
      // Case C: Local key exists + Server has no keypair
      //         → Registration failed on a previous attempt.
      //           Retry registration with the existing private key.
      //
      // Case D: Neither exists
      //         → Fresh install / new user. Generate and register.

      if (localStatus.hasKey && serverKeypair && !serverKeypair.is_revoked) {
        // ── Case A: Both exist ───────────────────────────────────────────────
        // Validate fingerprint match to detect storage corruption
        if (
          localStatus.fingerprint &&
          serverKeypair.public_key_fingerprint &&
          localStatus.fingerprint !== serverKeypair.public_key_fingerprint
        ) {
          // Fingerprint mismatch — local key doesn't match server's record.
          // This should never happen unless SecureStore was tampered with.
          // Force re-generation for security.
          await deleteAllKeys();
          await _generateAndRegister(set);
          return;
        }

        // All good — transition to READY
        set({
          status: 'ready',
          keyFingerprint: serverKeypair.public_key_fingerprint,
          isRegisteredOnServer: true,
          error: null,
          errorCode: null,
        });
        return;
      }

      if (!localStatus.hasKey && serverKeypair && !serverKeypair.is_revoked) {
        // ── Case B: Local key lost, server still has old public key ─────────
        // We can't decrypt anything the old key protected — but we can
        // generate a new keypair. The server must first revoke the old record.
        // We handle this by generating + registering, which the backend should
        // handle by replacing (or the backend returns 409, handled below).
        await _generateAndRegister(set);
        return;
      }

      if (localStatus.hasKey && (!serverKeypair || serverKeypair.is_revoked)) {
        // ── Case C: Registration was never confirmed ─────────────────────────
        // We have a private key locally but registration didn't complete.
        // Re-derive the public key and retry registration.
        // We cannot re-export a CryptoKey marked non-extractable, so we
        // must re-generate a fresh keypair and save it over the old one.
        // (The old private key is useless without a server-side public key.)
        await deleteAllKeys();
        await _generateAndRegister(set);
        return;
      }

      // ── Case D: Fresh state — nothing on either side ────────────────────
      await _generateAndRegister(set);

    } catch (err: unknown) {
      const { message, code } = _parseError(err);
      set({
        status: 'error',
        error: message,
        errorCode: code,
      });
    }
  },

  // ── clearKeys ─────────────────────────────────────────────────────────────

  clearKeys: async () => {
    try {
      await deleteAllKeys();
    } finally {
      // Always reset state — even if SecureStore delete partially fails
      set({
        status: 'idle',
        keyFingerprint: null,
        isRegisteredOnServer: false,
        error: null,
        errorCode: null,
      });
    }
  },

  // ── retryInitialize ───────────────────────────────────────────────────────

  retryInitialize: async () => {
    set({ status: 'idle', error: null, errorCode: null });
    await get().initializeKeys();
  },
}));

// ─── Private Helpers ──────────────────────────────────────────────────────────

/**
 * Generate a fresh ECDH keypair, persist the private key to SecureStore,
 * and register the public key with the backend using proof-of-possession.
 *
 * Hardened 7-step flow (crash-safe):
 *   1. Generate keypair in memory
 *   2. Fetch single-use challenge nonce from server (60s TTL)
 *   3. Sign nonce with private key (ECDSA-SHA-256) — proof of possession
 *   4. Save private key to SecureStore (BEFORE server registration)
 *      → crash here: next initializeKeys() hits Case C and retries
 *   5. POST /keypairs/register { pem, nonce, signature }
 *      → crash here: key is local, registration retries on next open
 *   6. markKeyRegistered() — flip registration flag
 *   7. Transition store to READY
 */
type SetFn = (partial: Partial<{
  status: CryptoStatus;
  keyFingerprint: string | null;
  isRegisteredOnServer: boolean;
  error: string | null;
  errorCode: string | null;
}>) => void;

async function _generateAndRegister(set: SetFn): Promise<void> {
  // ── 1. Generate keypair in memory ─────────────────────────────────────────
  const { publicKeyPEM, privateKeyJWK, publicKeyFingerprint } = await generateKeyPair();

  // ── 2. Fetch single-use challenge nonce ───────────────────────────────────
  // Fetched BEFORE SecureStore write to minimise nonce TTL consumption.
  // If this fails, nothing is committed — safe to retry completely.
  const challenge = await getRegistrationChallenge();

  if (!challenge.nonce || challenge.nonce.length < 32) {
    throw new Error('cryptoStore: server returned an invalid registration challenge nonce');
  }

  // ── 3. Sign nonce — proof-of-possession (ECDSA-SHA-256) ──────────────────
  // Proves caller holds the private key matching the submitted public key.
  // signRegistrationNonce() imports JWK under ECDSA as non-extractable.
  const nonceSignature = await signRegistrationNonce(challenge.nonce, privateKeyJWK);

  // ── 4. Save private key to SecureStore FIRST ──────────────────────────────
  // If registration (step 5) fails, key is local → Case C on next open.
  // If THIS step fails, nothing is committed → safe fresh retry.
  await savePrivateKey(privateKeyJWK, publicKeyFingerprint);

  // ── 5. Register public key (PEM + nonce + ECDSA signature) ───────────────
  const serverKeypair = await registerPublicKey({
    publicKeyPEM,
    displayFingerprint: publicKeyFingerprint,
    nonce:              challenge.nonce,
    nonceSignature,
  });

  // ── 6. Mark as successfully registered ────────────────────────────────────
  await markKeyRegistered();

  // ── 7. Transition to READY ────────────────────────────────────────────────
  set({
    status: 'ready',
    keyFingerprint: serverKeypair.public_key_fingerprint ?? publicKeyFingerprint,
    isRegisteredOnServer: true,
    error: null,
    errorCode: null,
  });
}


/** Extract a safe error message and code from any thrown value */
function _parseError(err: unknown): { message: string; code: string } {
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    // CryptoError (from cryptoEngine.ts)
    if (typeof e.code === 'string' && typeof e.message === 'string') {
      return { message: e.message as string, code: e.code as string };
    }
    // ApiError (from api/client.ts)
    if (typeof e.statusCode === 'number' && typeof e.message === 'string') {
      return {
        message: e.message as string,
        code: (e.code as string) ?? `HTTP_${e.statusCode}`,
      };
    }
  }
  if (err instanceof Error) {
    return { message: err.message, code: 'UNKNOWN_ERROR' };
  }
  return { message: 'An unexpected error occurred during key initialization', code: 'UNKNOWN_ERROR' };
}
