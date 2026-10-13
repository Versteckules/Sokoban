// ZERO-KNOWLEDGE KRYPTOTRESOR (WEB CRYPTO API)
// 256-Bit AES-GCM Entschlüsselung der Geocaching Final-Koordinaten
// Ersteller: versteckules

import { LEVELS, COMBINED_TOKENS_HASH } from './levels.js';

// Standard Test-Tresor (Wird mit dem Master-Key aller 15 Level entschlüsselt)
// Standard-Koordinaten: "N 50° 16.782 E 011° 55.430"
// Hinweis: "Das Geheimnis ruht am Fuß der alten Steinstele im Moosversteck."
export const DEFAULT_CIPHER_DATA = {
  ivHex: "9853d256b228d223dfc5a9e0",
  ciphertextHex: "2f9ab662de435165f8960f0c478d088e7df7091ce991055faaf01e05f481a3648fc33607ea500f329b1f2e5aecc013e081f4a28422f41fde877f25d5febf836b6f2d1251d92830910d28059c035e2ed02f461f217971ac4685d69d1a0b6d674136b481d832e412b3bd17aefc06e06b8b48254110cf62b64367cfa25aa8f396dd0c8ebbb2045afd91b9f16b4a0346a579a16a5966952fcb6b266c7379eccf5ecc07612809c5fc"
};

export class CryptoVault {
  constructor() {
    this.decryptedData = null;
  }

  // Konvertiert Hex-String zu Uint8Array
  static hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  // Konvertiert Uint8Array zu Hex-String
  static bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Leitet den 256-Bit Master-Key aus den 15 Level-Tokens ab
  static async deriveMasterKey(tokensMap) {
    const tokenList = [];
    for (let i = 0; i < LEVELS.length; i++) {
      const token = tokensMap[i];
      if (!token || token !== LEVELS[i].token) {
        throw new Error(`Token für Level ${i + 1} fehlt oder ist manipuliert.`);
      }
      tokenList.push(token);
    }

    const combined = tokenList.join('');
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(combined));

    return await crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Verschlüsselt einen beliebigen Text mit den 15 Tokens (für das Entwickler-Tool)
  static async encryptPayload(payloadJsonString, tokensMap) {
    const key = await CryptoVault.deriveMasterKey(tokensMap);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();

    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(payloadJsonString)
    );

    return {
      ivHex: CryptoVault.bytesToHex(iv),
      ciphertextHex: CryptoVault.bytesToHex(new Uint8Array(ciphertextBuffer))
    };
  }

  // Entschlüsselt die Final-Koordinaten
  async unlockCoordinates(tokensMap, customCipher = null) {
    const cipherData = customCipher || DEFAULT_CIPHER_DATA;

    try {
      const key = await CryptoVault.deriveMasterKey(tokensMap);
      const iv = CryptoVault.hexToBytes(cipherData.ivHex);
      const ciphertext = CryptoVault.hexToBytes(cipherData.ciphertextHex);

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      const jsonStr = decoder.decode(decryptedBuffer);
      const data = JSON.parse(jsonStr);

      this.decryptedData = data;
      return {
        success: true,
        coordinates: data.coordinates,
        hint: data.hint,
        creator: data.creator || 'versteckules'
      };
    } catch (err) {
      console.error('Tresor-Entschlüsselung fehlgeschlagen:', err);
      return {
        success: false,
        reason: 'Siegel beschädigt – Nicht alle 15 Fundamentsteine verifiziert!'
      };
    }
  }
}
