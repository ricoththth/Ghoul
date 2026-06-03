const pool = require('../config/database');

class Cart {
  /**
   * Get user's cart items
   */
  static async getCartItems(userId) {
    const query = `
      SELECT
        c.id,
        c.user_id,
        c.product_id,
        c.talla,
        c.cantidad,
        p.sku,
        p.nombre,
        p.precio,
        (p.precio * c.cantidad) as subtotal,
        c.created_at,
        c.updated_at
      FROM carts c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Get single cart item
   */
  static async getCartItem(cartItemId, userId) {
    const query = `
      SELECT
        c.id,
        c.user_id,
        c.product_id,
        c.talla,
        c.cantidad,
        p.sku,
        p.nombre,
        p.precio,
        p.inventory,
        c.created_at,
        c.updated_at
      FROM carts c
      JOIN products p ON c.product_id = p.id
      WHERE c.id = $1 AND c.user_id = $2
    `;
    const result = await pool.query(query, [cartItemId, userId]);
    return result.rows[0] || null;
  }

  /**
   * Add item to cart
   */
  static async addItem(userId, productId, talla, cantidad = 1) {
    try {
      const query = `
        INSERT INTO carts (user_id, product_id, talla, cantidad)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, product_id, talla)
        DO UPDATE SET cantidad = carts.cantidad + $4, updated_at = CURRENT_TIMESTAMP
        RETURNING id, user_id, product_id, talla, cantidad, created_at, updated_at
      `;
      const result = await pool.query(query, [userId, productId, talla, cantidad]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateQuantity(cartItemId, userId, quantity) {
    if (quantity < 1) {
      // Delete if quantity is 0 or less
      return this.removeItem(cartItemId, userId);
    }

    const query = `
      UPDATE carts
      SET cantidad = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id, product_id, talla, cantidad, created_at, updated_at
    `;
    const result = await pool.query(query, [cartItemId, userId, quantity]);
    return result.rows[0] || null;
  }

  /**
   * Remove item from cart
   */
  static async removeItem(cartItemId, userId) {
    const query = 'DELETE FROM carts WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await pool.query(query, [cartItemId, userId]);
    return result.rows[0] || null;
  }

  /**
   * Clear entire cart
   */
  static async clearCart(userId) {
    const query = 'DELETE FROM carts WHERE user_id = $1 RETURNING id';
    const result = await pool.query(query, [userId]);
    return result.rowCount;
  }

  /**
   * Get cart summary (total items, total price)
   */
  static async getCartSummary(userId) {
    const query = `
      SELECT
        COUNT(*) as item_count,
        SUM(c.cantidad) as total_items,
        SUM(p.precio * c.cantidad) as total_price
      FROM carts c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    const summary = result.rows[0];
    return {
      item_count: parseInt(summary.item_count) || 0,
      total_items: parseInt(summary.total_items) || 0,
      total_price: parseFloat(summary.total_price) || 0
    };
  }
}

module.exports = Cart;
