const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { validateCartItem } = require('../utils/validators');

// All cart routes require authentication
router.use(authenticateToken);

/**
 * GET /api/cart
 * Get user's shopping cart items
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await Cart.getCartItems(userId);
    const summary = await Cart.getCartSummary(userId);

    res.json({
      items,
      summary
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

/**
 * POST /api/cart
 * Add item to cart
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, talla, cantidad } = req.body;

    // Validate input
    const validation = validateCartItem({ product_id, talla, cantidad });
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Check if product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check inventory
    if (!await Product.checkInventory(product_id, cantidad)) {
      return res.status(400).json({ error: 'Insufficient inventory' });
    }

    // Add to cart
    const cartItem = await Cart.addItem(userId, product_id, talla, cantidad);

    res.status(201).json({
      message: 'Item added to cart',
      item: cartItem
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

/**
 * PUT /api/cart/:cartItemId
 * Update cart item quantity
 */
router.put('/:cartItemId', async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = parseInt(req.params.cartItemId);
    const { cantidad } = req.body;

    // Validate quantity
    if (!cantidad || cantidad < 1 || cantidad > 99) {
      return res.status(400).json({ error: 'Cantidad must be between 1 and 99' });
    }

    // Check cart item ownership
    const cartItem = await Cart.getCartItem(cartItemId, userId);
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Check inventory
    if (!await Product.checkInventory(cartItem.product_id, cantidad)) {
      return res.status(400).json({ error: 'Insufficient inventory' });
    }

    // Update quantity
    const updatedItem = await Cart.updateQuantity(cartItemId, userId, cantidad);

    res.json({
      message: 'Cart updated',
      item: updatedItem
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

/**
 * DELETE /api/cart/:cartItemId
 * Remove item from cart
 */
router.delete('/:cartItemId', async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = parseInt(req.params.cartItemId);

    // Check cart item ownership
    const cartItem = await Cart.getCartItem(cartItemId, userId);
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Remove item
    await Cart.removeItem(cartItemId, userId);

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

/**
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const deletedCount = await Cart.clearCart(userId);

    res.json({ message: 'Cart cleared', deleted: deletedCount });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
