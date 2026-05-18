export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(pwd: string): boolean {
  return pwd.length >= 6;
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export interface LoginErrors {
  email?: string;
  password?: string;
}

export interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export function validateLogin(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  if (!isNotEmpty(email)) errors.email = 'E-mail obrigatório';
  else if (!isValidEmail(email)) errors.email = 'E-mail inválido';
  if (!isNotEmpty(password)) errors.password = 'Senha obrigatória';
  return errors;
}

export function validateRegister(
  name: string,
  email: string,
  password: string,
  confirm: string
): RegisterErrors {
  const errors: RegisterErrors = {};
  if (!isNotEmpty(name)) errors.name = 'Nome obrigatório';
  if (!isNotEmpty(email)) errors.email = 'E-mail obrigatório';
  else if (!isValidEmail(email)) errors.email = 'E-mail inválido';
  if (!isValidPassword(password)) errors.password = 'Mínimo 6 caracteres';
  if (password !== confirm) errors.confirm = 'Senhas não coincidem';
  return errors;
}
