const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * GET /api/products
 * Get all products with pagination
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const products = await Product.getAll(limit, offset);
    const count = await Product.getCount();

    res.json({
      data: products,
      pagination: {
        limit,
        offset,
        total: count,
        hasMore: offset + limit < count
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * GET /api/products/:id
 * Get single product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ data: product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

/**
 * POST /api/products
 * Create new product (admin only)
 */
router.post('/', async (req, res) => {
  try {
    const { sku, nombre, precio, descripcion, inventory } = req.body;

    // Validate required fields
    if (!sku || !nombre || !precio) {
      return res.status(400).json({
        error: 'Missing required fields: sku, nombre, precio'
      });
    }

    const product = await Product.create(sku, nombre, precio, descripcion, inventory);
    res.status(201).json({ data: product });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

module.exports = router;
