const { z } = require('zod');

const name = z.string().trim().min(2).max(100);
const email = z.string().trim().email().toLowerCase();
const password = z.string().min(6).max(128);

const registerSchema = z
  .object({
    name,
    email,
    password,
  })
  .strict();

const loginSchema = z
  .object({
    email,
    password,
  })
  .strict();

const forgotPasswordSchema = z
  .object({
    email,
  })
  .strict();

module.exports = { registerSchema, loginSchema, forgotPasswordSchema };
