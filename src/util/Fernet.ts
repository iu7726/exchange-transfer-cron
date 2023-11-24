import * as crypto from 'crypto';

const fromBase64Url = (base64url: string) => {
    const unpadded = base64url.replace(/\=/g, '');
    if (Buffer.from(unpadded, 'base64url').toString('base64url') !== unpadded) {
      throw new Error(
        'Invalid encoding. String must be base64url encoded string.'
      );
    }
    const buff = Buffer.from(unpadded, 'base64url');
    return buff;
};

const compareBuffers = (a: Buffer, b: Buffer): boolean => {
    return crypto.timingSafeEqual(a, b);
};

const computeHmac = (input: Buffer, key: Buffer, algo = 'sha256'): Buffer => {
    return crypto.createHmac(algo, key).update(input).digest();
};

const checkKey = (key: string): void => {
    try {
      const buffer = fromBase64Url(key);
      if (buffer.length !== 32) {
        throw new Error('Key must be 32-byte long base64url encoded string.');
      }
    } catch (error) {
      throw new Error('Key must be 32-byte long base64url encoded string.');
    }
}

const aesDecrypt = (
    cipherText: Buffer,
    key: Buffer,
    iv: Buffer,
    algo = 'aes-128-cbc'
  ): Buffer => {
    const decipher = crypto.createDecipheriv(algo, key, iv);
    let decrypted = decipher.update(cipherText);
    return Buffer.concat([decrypted, decipher.final()]);
};

const decrypt = (token: string, key: string): string => {
    try {
      checkKey(key);
      const keyBuffer = fromBase64Url(key);
      const signingKey = keyBuffer.subarray(0, 16);
      const encryptionKey = keyBuffer.subarray(16, 32);
      const tokenBuffer = fromBase64Url(token);
      if (
        tokenBuffer.length < 73 ||
        (tokenBuffer.length - (1 + 8 + 16 + 32)) % 16 !== 0
      ) {
        throw new Error('Fernet token has invalid length.');
      }
      const version = tokenBuffer.subarray(0, 1);
      if (!compareBuffers(version, Buffer.from([0x80]))) {
        throw new Error('Fernet version must be 0x80');
      }
      const timestamp = tokenBuffer.subarray(1, 9);
      const iv = tokenBuffer.subarray(9, 25);
      const cipherText = tokenBuffer.subarray(25, tokenBuffer.length - 32);
      const hmac = tokenBuffer.subarray(
        tokenBuffer.length - 32,
        tokenBuffer.length
      );
      const toVerify = tokenBuffer.subarray(0, tokenBuffer.length - 32);
      const computedHmac = computeHmac(toVerify, signingKey);
      const isVerified = compareBuffers(hmac, computedHmac);
      if (!isVerified) {
        throw new Error('Invalid signature. Signature did not match digest.');
      }
      const decrypted = aesDecrypt(cipherText, encryptionKey, iv);
      return decrypted.toString('utf-8');
    } catch (err) {
      throw err;
    }
}

export {
    fromBase64Url,
    computeHmac,
    decrypt
}

