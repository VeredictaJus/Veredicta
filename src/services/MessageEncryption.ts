interface EncryptedMessage {
  encryptedContent: string;
  iv: string;
  timestamp: number;
  checksum: string;
}

interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

class MessageEncryption {
  private keyPair: KeyPair | null = null;
  private symmetricKey: CryptoKey | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if Web Crypto API is available
      if (!window.crypto || !window.crypto.subtle) {
        console.warn('Web Crypto API not available, encryption disabled');
        return;
      }

      // Generate or load symmetric key for message encryption
      await this.generateSymmetricKey();
      
      // Generate or load RSA key pair for key exchange
      await this.generateKeyPair();
      
      this.initialized = true;
      console.log('Message encryption initialized');
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
    }
  }

  private async generateSymmetricKey(): Promise<void> {
    try {
      // Try to load existing key from secure storage
      const existingKey = await this.loadSymmetricKeyFromStorage();
      if (existingKey) {
        this.symmetricKey = existingKey;
        return;
      }

      // Generate new AES-GCM key
      this.symmetricKey = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true, // extractable
        ['encrypt', 'decrypt']
      );

      // Store the key securely
      await this.storeSymmetricKey();
    } catch (error) {
      console.error('Error generating symmetric key:', error);
    }
  }

  private async generateKeyPair(): Promise<void> {
    try {
      // Try to load existing key pair
      const existingKeyPair = await this.loadKeyPairFromStorage();
      if (existingKeyPair) {
        this.keyPair = existingKeyPair;
        return;
      }

      // Generate new RSA key pair
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true, // extractable
        ['encrypt', 'decrypt']
      );

      this.keyPair = keyPair;
      
      // Store the key pair securely
      await this.storeKeyPair();
    } catch (error) {
      console.error('Error generating key pair:', error);
    }
  }

  async encryptMessage(message: string): Promise<EncryptedMessage | null> {
    if (!this.initialized || !this.symmetricKey) {
      console.warn('Encryption not initialized, sending plain text');
      return null;
    }

    try {
      // Generate random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      // Encode message
      const encodedMessage = new TextEncoder().encode(message);
      
      // Encrypt the message
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        this.symmetricKey,
        encodedMessage
      );

      // Convert to base64
      const encryptedContent = this.arrayBufferToBase64(encryptedData);
      const ivBase64 = this.arrayBufferToBase64(iv);
      
      // Generate checksum for integrity
      const checksum = await this.generateChecksum(encryptedContent + ivBase64);

      return {
        encryptedContent,
        iv: ivBase64,
        timestamp: Date.now(),
        checksum
      };
    } catch (error) {
      console.error('Error encrypting message:', error);
      return null;
    }
  }

  async decryptMessage(encryptedMessage: EncryptedMessage): Promise<string | null> {
    if (!this.initialized || !this.symmetricKey) {
      console.warn('Encryption not initialized, cannot decrypt');
      return null;
    }

    try {
      // Verify checksum
      const expectedChecksum = await this.generateChecksum(
        encryptedMessage.encryptedContent + encryptedMessage.iv
      );
      
      if (expectedChecksum !== encryptedMessage.checksum) {
        console.error('Checksum verification failed');
        return null;
      }

      // Convert from base64
      const encryptedData = this.base64ToArrayBuffer(encryptedMessage.encryptedContent);
      const iv = this.base64ToArrayBuffer(encryptedMessage.iv);

      // Decrypt the message
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        this.symmetricKey,
        encryptedData
      );

      // Decode message
      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('Error decrypting message:', error);
      return null;
    }
  }

  async encryptForUser(message: string, userPublicKey: string): Promise<string | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Import user's public key
      const publicKey = await this.importPublicKey(userPublicKey);
      
      // Encrypt message with user's public key
      const encodedMessage = new TextEncoder().encode(message);
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP',
        },
        publicKey,
        encodedMessage
      );

      return this.arrayBufferToBase64(encryptedData);
    } catch (error) {
      console.error('Error encrypting for user:', error);
      return null;
    }
  }

  async decryptFromUser(encryptedMessage: string): Promise<string | null> {
    if (!this.initialized || !this.keyPair) {
      console.warn('Encryption not initialized');
      return null;
    }

    try {
      // Convert from base64
      const encryptedData = this.base64ToArrayBuffer(encryptedMessage);

      // Decrypt with private key
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP',
        },
        this.keyPair.privateKey,
        encryptedData
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('Error decrypting from user:', error);
      return null;
    }
  }

  async getPublicKey(): Promise<string | null> {
    if (!this.initialized || !this.keyPair) {
      await this.initialize();
    }

    if (!this.keyPair) {
      return null;
    }

    try {
      const exportedKey = await window.crypto.subtle.exportKey(
        'spki',
        this.keyPair.publicKey
      );

      return this.arrayBufferToBase64(exportedKey);
    } catch (error) {
      console.error('Error exporting public key:', error);
      return null;
    }
  }

  // Utility Methods
  private async generateChecksum(data: string): Promise<string> {
    const encodedData = new TextEncoder().encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encodedData);
    return this.arrayBufferToBase64(hashBuffer);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private async importPublicKey(publicKeyString: string): Promise<CryptoKey> {
    const publicKeyBuffer = this.base64ToArrayBuffer(publicKeyString);
    
    return await window.crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt']
    );
  }

  // Storage Methods
  private async storeSymmetricKey(): Promise<void> {
    if (!this.symmetricKey) return;

    try {
      const exportedKey = await window.crypto.subtle.exportKey('raw', this.symmetricKey);
      const keyBase64 = this.arrayBufferToBase64(exportedKey);
      
      // Store in secure storage (IndexedDB in production)
      localStorage.setItem('chat_symmetric_key', keyBase64);
    } catch (error) {
      console.error('Error storing symmetric key:', error);
    }
  }

  private async loadSymmetricKeyFromStorage(): Promise<CryptoKey | null> {
    try {
      const keyBase64 = localStorage.getItem('chat_symmetric_key');
      if (!keyBase64) return null;

      const keyBuffer = this.base64ToArrayBuffer(keyBase64);
      
      return await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        {
          name: 'AES-GCM',
        },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Error loading symmetric key:', error);
      return null;
    }
  }

  private async storeKeyPair(): Promise<void> {
    if (!this.keyPair) return;

    try {
      const publicKey = await window.crypto.subtle.exportKey('spki', this.keyPair.publicKey);
      const privateKey = await window.crypto.subtle.exportKey('pkcs8', this.keyPair.privateKey);
      
      localStorage.setItem('chat_public_key', this.arrayBufferToBase64(publicKey));
      localStorage.setItem('chat_private_key', this.arrayBufferToBase64(privateKey));
    } catch (error) {
      console.error('Error storing key pair:', error);
    }
  }

  private async loadKeyPairFromStorage(): Promise<KeyPair | null> {
    try {
      const publicKeyBase64 = localStorage.getItem('chat_public_key');
      const privateKeyBase64 = localStorage.getItem('chat_private_key');
      
      if (!publicKeyBase64 || !privateKeyBase64) return null;

      const publicKeyBuffer = this.base64ToArrayBuffer(publicKeyBase64);
      const privateKeyBuffer = this.base64ToArrayBuffer(privateKeyBase64);

      const publicKey = await window.crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['encrypt']
      );

      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['decrypt']
      );

      return { publicKey, privateKey };
    } catch (error) {
      console.error('Error loading key pair:', error);
      return null;
    }
  }

  // Cleanup
  clearKeys(): void {
    localStorage.removeItem('chat_symmetric_key');
    localStorage.removeItem('chat_public_key');
    localStorage.removeItem('chat_private_key');
    this.symmetricKey = null;
    this.keyPair = null;
    this.initialized = false;
  }
}

export const messageEncryption = new MessageEncryption();
export type { EncryptedMessage };