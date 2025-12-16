import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (plain: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(plain, salt);
  return hash;
};

export const comparePassword = async (
  plain: string,
  hash: string,
): Promise<boolean> => {
  const isMatch = await bcrypt.compare(plain, hash);
  return isMatch;
};


