const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send verification email
 */
const sendVerificationEmail = async (email, verificationLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '¡Bienvenido a GHOUL! Verifica tu email',
      html: `
        <h2>¡Bienvenido a GHOUL!</h2>
        <p>Gracias por crear tu cuenta. Para completar el registro, verifica tu email haciendo clic en el siguiente enlace:</p>
        <p><a href="${verificationLink}" style="background-color: #db3122; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verificar Email</a></p>
        <p>Este enlace expirará en 24 horas.</p>
        <hr />
        <p style="color: #999; font-size: 12px;">Si no creaste esta cuenta, ignora este email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✓ Verification email sent to', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmation = async (email, orderData) => {
  try {
    const itemsHtml = orderData.items
      .map(item => `
        <tr>
          <td>${item.nombre_producto}</td>
          <td>${item.talla}</td>
          <td>${item.cantidad}</td>
          <td>$${parseFloat(item.precio_unitario).toFixed(2)} COP</td>
        </tr>
      `)
      .join('');

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Pedido Confirmado #${orderData.orderId} - GHOUL`,
      html: `
        <h2>¡Tu pedido ha sido confirmado!</h2>
        <p>Hola ${orderData.nombre_envio},</p>
        <p>Gracias por tu compra en GHOUL. Aquí está el resumen de tu pedido:</p>

        <h3>Número de Pedido: #${orderData.orderId}</h3>

        <h4>Artículos:</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Producto</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Talla</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Cantidad</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Precio</th>
          </tr>
          ${itemsHtml}
        </table>

        <h4>Envío a:</h4>
        <p>
          ${orderData.nombre_envio} ${orderData.apellido_envio}<br />
          ${orderData.direccion_envio}<br />
          ${orderData.ciudad}, ${orderData.departamento} ${orderData.codigo_postal}<br />
          ${orderData.pais}
        </p>

        <h4>Total: $${parseFloat(orderData.total).toFixed(2)} COP</h4>

        <p>Recibirás un email con el número de seguimiento cuando tu pedido sea despachado.</p>
        <hr />
        <p style="color: #999; font-size: 12px;">Preguntas? Contáctanos en info@ghoul.com.co</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✓ Order confirmation sent to', email);
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
const sendPasswordReset = async (email, resetLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Recupera tu contraseña de GHOUL',
      html: `
        <h2>Recuperar Contraseña</h2>
        <p>Recibimos una solicitud para recuperar tu contraseña. Haz clic en el siguiente enlace para restablecerla:</p>
        <p><a href="${resetLink}" style="background-color: #db3122; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Recuperar Contraseña</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <hr />
        <p style="color: #999; font-size: 12px;">Si no solicitaste esto, ignora este email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✓ Password reset email sent to', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendOrderConfirmation,
  sendPasswordReset
};
