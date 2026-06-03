/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength (at least 8 chars, 1 uppercase, 1 number)
 */
const isValidPassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

/**
 * Validate registration input
 */
const validateRegister = (data) => {
  const errors = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Email inválido');
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.push('Contraseña debe tener al menos 8 caracteres, 1 mayúscula y 1 número');
  }

  if (!data.nombre || data.nombre.trim().length < 2) {
    errors.push('Nombre es requerido (mín 2 caracteres)');
  }

  if (!data.apellido || data.apellido.trim().length < 2) {
    errors.push('Apellido es requerido (mín 2 caracteres)');
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validate login input
 */
const validateLogin = (data) => {
  const errors = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Email inválido');
  }

  if (!data.password || data.password.length === 0) {
    errors.push('Contraseña es requerida');
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validate cart item
 */
const validateCartItem = (data) => {
  const errors = [];

  if (!data.product_id || typeof data.product_id !== 'number') {
    errors.push('Product ID inválido');
  }

  if (!data.talla || data.talla.length === 0) {
    errors.push('Talla es requerida');
  }

  if (!data.cantidad || data.cantidad < 1 || data.cantidad > 99) {
    errors.push('Cantidad debe ser entre 1 y 99');
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validate order
 */
const validateOrder = (data) => {
  const errors = [];

  if (!data.nombre_envio || data.nombre_envio.trim().length === 0) {
    errors.push('Nombre de envío es requerido');
  }

  if (!data.apellido_envio || data.apellido_envio.trim().length === 0) {
    errors.push('Apellido de envío es requerido');
  }

  if (!data.direccion_envio || data.direccion_envio.trim().length === 0) {
    errors.push('Dirección de envío es requerida');
  }

  if (!data.ciudad || data.ciudad.trim().length === 0) {
    errors.push('Ciudad es requerida');
  }

  if (!data.departamento || data.departamento.trim().length === 0) {
    errors.push('Departamento es requerido');
  }

  if (!data.codigo_postal || data.codigo_postal.trim().length === 0) {
    errors.push('Código postal es requerido');
  }

  if (!data.pais || data.pais.trim().length === 0) {
    errors.push('País es requerido');
  }

  if (!data.email_envio || !isValidEmail(data.email_envio)) {
    errors.push('Email de envío inválido');
  }

  if (!data.metodo_pago || data.metodo_pago.length === 0) {
    errors.push('Método de pago es requerido');
  }

  return { valid: errors.length === 0, errors };
};

module.exports = {
  isValidEmail,
  isValidPassword,
  validateRegister,
  validateLogin,
  validateCartItem,
  validateOrder
};
