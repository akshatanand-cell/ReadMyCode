const crypto = require("crypto");
const logger = require("./logger");

// Derive a 32-byte key from ENCRYPTION_KEY or JWT_SECRET
const SECRET = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || "readmycode_secure_aes_secret_key_32_bytes";
const KEY = crypto.createHash("sha256").update(SECRET).digest();
const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc:";

/**
 * Encrypts a sensitive string (e.g. GitHub OAuth token) using AES-256-GCM.
 * Output format: enc:<iv_hex>:<auth_tag_hex>:<ciphertext_hex>
 */
function encryptToken(plainText) {
  if (!plainText || typeof plainText !== "string") return plainText;
  if (plainText.startsWith(PREFIX)) return plainText; // already encrypted

  try {
    const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag().toString("hex");
    return `${PREFIX}${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (err) {
    logger.error(`Token encryption failure: ${err.message}`);
    return plainText; // Fallback so critical operation isn't broken
  }
}

/**
 * Decrypts an AES-256-GCM encrypted token.
 * If input is not encrypted with enc: prefix, returns text as-is for backwards compatibility.
 */
function decryptToken(cipherText) {
  if (!cipherText || typeof cipherText !== "string") return cipherText;
  if (!cipherText.startsWith(PREFIX)) return cipherText; // legacy unencrypted token

  try {
    const parts = cipherText.slice(PREFIX.length).split(":");
    if (parts.length !== 3) {
      logger.warn("Malformed encrypted token format; returning as-is");
      return cipherText;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    logger.warn(`Token decryption failed: ${err.message}. Returning fallback.`);
    return null;
  }
}

module.exports = {
  encryptToken,
  decryptToken,
};
