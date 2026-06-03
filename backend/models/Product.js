const pool = require('../config/database');

class Product {
  /**
   * Get all products with pagination
   */
  static async getAll(limit = 20, offset = 0) {
    const query = `
      SELECT id, sku, nombre, precio, descripcion, inventory, created_at
      FROM products
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Get product by ID
   */
  static async findById(id) {
    const query = `
      SELECT id, sku, nombre, precio, descripcion, inventory, created_at
      FROM products WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get product by SKU
   */
  static async findBySku(sku) {
    const query = `
      SELECT id, sku, nombre, precio, descripcion, inventory, created_at
      FROM products WHERE sku = $1
    `;
    const result = await pool.query(query, [sku]);
    return result.rows[0] || null;
  }

  /**
   * Create new product
   */
  static async create(sku, nombre, precio, descripcion, inventory = 0) {
    try {
      const query = `
        INSERT INTO products (sku, nombre, precio, descripcion, inventory)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, sku, nombre, precio, descripcion, inventory, created_at
      `;
      const result = await pool.query(query, [sku, nombre, precio, descripcion, inventory]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Product SKU already exists');
      }
      throw error;
    }
  }

  /**
   * Update product
   */
  static async update(id, { nombre, precio, descripcion, inventory }) {
    const query = `
      UPDATE products
      SET nombre = COALESCE($2, nombre),
          precio = COALESCE($3, precio),
          descripcion = COALESCE($4, descripcion),
          inventory = COALESCE($5, inventory),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, sku, nombre, precio, descripcion, inventory, created_at
    `;
    const result = await pool.query(query, [id, nombre, precio, descripcion, inventory]);
    return result.rows[0] || null;
  }

  /**
   * Delete product
   */
  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get total product count
   */
  static async getCount() {
    const query = 'SELECT COUNT(*) as count FROM products';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Check inventory availability
   */
  static async checkInventory(productId, quantity) {
    const product = await this.findById(productId);
    if (!product) return false;
    return product.inventory >= quantity;
  }

  /**
   * Reduce inventory
   */
  static async reduceInventory(productId, quantity) {
    const query = `
      UPDATE products
      SET inventory = inventory - $2
      WHERE id = $1 AND inventory >= $2
      RETURNING inventory
    `;
    const result = await pool.query(query, [productId, quantity]);
    return result.rows[0] || null;
  }
}

module.exports = Product;
