const pool = require('../config/database');

class Order {
  /**
   * Create new order from cart items
   */
  static async createOrder(userId, orderData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get cart items
      const cartQuery = `
        SELECT c.id, c.product_id, c.talla, c.cantidad, p.sku, p.nombre, p.precio
        FROM carts c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = $1
      `;
      const cartResult = await client.query(cartQuery, [userId]);
      const cartItems = cartResult.rows;

      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // Calculate total
      const total = cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

      // Create order
      const orderQuery = `
        INSERT INTO orders (
          user_id, total, estado,
          nombre_envio, apellido_envio, direccion_envio,
          ciudad, departamento, codigo_postal, pais,
          email_envio, metodo_pago
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const orderResult = await client.query(orderQuery, [
        userId,
        total,
        'pendiente',
        orderData.nombre_envio,
        orderData.apellido_envio,
        orderData.direccion_envio,
        orderData.ciudad,
        orderData.departamento,
        orderData.codigo_postal,
        orderData.pais,
        orderData.email_envio,
        orderData.metodo_pago
      ]);

      const order = orderResult.rows[0];

      // Create order items
      const orderItemsQuery = `
        INSERT INTO order_items (
          order_id, product_id, sku, nombre_producto, talla, cantidad, precio_unitario
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      for (const item of cartItems) {
        await client.query(orderItemsQuery, [
          order.id,
          item.product_id,
          item.sku,
          item.nombre,
          item.talla,
          item.cantidad,
          item.precio
        ]);
      }

      // Clear cart
      await client.query('DELETE FROM carts WHERE user_id = $1', [userId]);

      await client.query('COMMIT');

      return { order, items: cartItems };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get user's order history
   */
  static async getUserOrders(userId, limit = 20, offset = 0) {
    const query = `
      SELECT id, user_id, total, estado, created_at, updated_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  /**
   * Get order details with items
   */
  static async getOrderDetails(orderId, userId) {
    const query = `
      SELECT
        o.id,
        o.user_id,
        o.total,
        o.estado,
        o.nombre_envio,
        o.apellido_envio,
        o.direccion_envio,
        o.ciudad,
        o.departamento,
        o.codigo_postal,
        o.pais,
        o.email_envio,
        o.metodo_pago,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE o.id = $1 AND o.user_id = $2
    `;
    const result = await pool.query(query, [orderId, userId]);
    return result.rows[0] || null;
  }

  /**
   * Get order items
   */
  static async getOrderItems(orderId) {
    const query = `
      SELECT
        id,
        order_id,
        product_id,
        sku,
        nombre_producto,
        talla,
        cantidad,
        precio_unitario,
        (cantidad * precio_unitario) as subtotal
      FROM order_items
      WHERE order_id = $1
    `;
    const result = await pool.query(query, [orderId]);
    return result.rows;
  }

  /**
   * Update order status
   */
  static async updateStatus(orderId, userId, newStatus) {
    const query = `
      UPDATE orders
      SET estado = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [orderId, userId, newStatus]);
    return result.rows[0] || null;
  }

  /**
   * Get total order count for user
   */
  static async getUserOrderCount(userId) {
    const query = 'SELECT COUNT(*) as count FROM orders WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = Order;
