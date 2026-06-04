import argon2 from "argon2";
import bcrypt from "bcrypt";

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(password: string) {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(hash: string, password: string) {
  if (hash.startsWith("$argon2")) {
    return argon2.verify(hash, password);
  }

  if (hash.startsWith("$2")) {
    return bcrypt.compare(password, hash);
  }

  return false;
}

export function needsPasswordRehash(hash: string) {
  return !hash.startsWith("$argon2id$");
}
