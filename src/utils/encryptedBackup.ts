import { gcm } from '@noble/ciphers/aes.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import * as Crypto from 'expo-crypto';
import type { Account } from '@/src/types/accounts';
import type { AnyEntry } from '@/src/types/entries';
import { deserializeCalendify, serializeCalendify } from '@/src/utils/calendifyFormat';

const APP_BACKUP_SECRET = utf8ToBytes('calendify-backup-v1::e6fb4a5d1cb94092a718f84f3b65e86d');
const BACKUP_INFO = utf8ToBytes('calendify/encrypted-backup/v1');

export const CALENDIFY_BACKUP_EXTENSION = '.calendify';
export const CALENDIFY_BACKUP_FILENAME = `calendify_backup${CALENDIFY_BACKUP_EXTENSION}`;

interface EncryptedBackupEnvelope {
  format: 'calendify-backup';
  version: '1';
  algorithm: 'AES-256-GCM';
  kdf: 'HKDF-SHA256';
  salt: string;
  nonce: string;
  ciphertext: string;
}

function deriveBackupKey(salt: Uint8Array) {
  return hkdf(sha256, APP_BACKUP_SECRET, salt, BACKUP_INFO, 32);
}

function isEncryptedBackupEnvelope(value: unknown): value is EncryptedBackupEnvelope {
  if (!value || typeof value !== 'object') return false;

  const envelope = value as Record<string, unknown>;
  return envelope.format === 'calendify-backup'
    && envelope.version === '1'
    && envelope.algorithm === 'AES-256-GCM'
    && envelope.kdf === 'HKDF-SHA256'
    && typeof envelope.salt === 'string'
    && typeof envelope.nonce === 'string'
    && typeof envelope.ciphertext === 'string';
}

export function createEncryptedBackup(accounts: Account[], entries: AnyEntry[]) {
  const plaintext = utf8ToBytes(serializeCalendify(accounts, entries));
  const salt = Crypto.getRandomBytes(16);
  const nonce = Crypto.getRandomBytes(12);
  const key = deriveBackupKey(salt);
  const ciphertext = gcm(key, nonce).encrypt(plaintext);

  const envelope: EncryptedBackupEnvelope = {
    format: 'calendify-backup',
    version: '1',
    algorithm: 'AES-256-GCM',
    kdf: 'HKDF-SHA256',
    salt: bytesToHex(salt),
    nonce: bytesToHex(nonce),
    ciphertext: bytesToHex(ciphertext),
  };

  return JSON.stringify(envelope);
}

export function parseEncryptedBackup(content: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Invalid .calendify file format.');
  }

  if (!isEncryptedBackupEnvelope(parsed)) {
    throw new Error('Unsupported or malformed .calendify backup.');
  }

  let plaintext: string;
  try {
    const salt = hexToBytes(parsed.salt);
    const nonce = hexToBytes(parsed.nonce);
    const ciphertext = hexToBytes(parsed.ciphertext);
    const key = deriveBackupKey(salt);
    const decrypted = gcm(key, nonce).decrypt(ciphertext);
    plaintext = new TextDecoder().decode(decrypted);
  } catch {
    throw new Error('Unable to decrypt this .calendify backup.');
  }

  try {
    return deserializeCalendify(plaintext);
  } catch (e) {
    throw new Error(`Backup data is invalid: ${e instanceof Error ? e.message : 'unknown error'}`);
  }
}

export function isCalendifyBackupFile(name?: string | null) {
  return !!name?.toLowerCase().endsWith(CALENDIFY_BACKUP_EXTENSION);
}
