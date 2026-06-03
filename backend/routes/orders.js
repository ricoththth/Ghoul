const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { sendOrderConfirmation } = require('../utils/mailer');
const { validateOrder } = require('../utils/validators');

// All order routes require authentication
router.use(authenticateToken);

/**
 * POST /api/orders
 * Create a new order from cart
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      nombre_envio,
      apellido_envio,
      direccion_envio,
      ciudad,
      departamento,
      codigo_postal,
      pais,
      email_envio,
      metodo_pago
    } = req.body;

    // Validate input
    const validation = validateOrder({
      nombre_envio,
      apellido_envio,
      direccion_envio,
      ciudad,
      departamento,
      codigo_postal,
      pais,
      email_envio,
      metodo_pago
    });

    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Create order
    const orderData = {
      nombre_envio,
      apellido_envio,
      direccion_envio,
      ciudad,
      departamento,
      codigo_postal,
      pais,
      email_envio,
      metodo_pago
    };

    const { order, items } = await Order.createOrder(userId, orderData);

    // Prepare email data
    const emailOrderData = {
      orderId: order.id,
      nombre_envio,
      apellido_envio,
      direccion_envio,
      ciudad,
      departamento,
      codigo_postal,
      pais,
      total: order.total,
      items
    };

    // Send confirmation email (don't fail if email fails)
    try {
      await sendOrderConfirmation(email_envio, emailOrderData);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        total: order.total,
        estado: order.estado,
        created_at: order.created_at
      },
      items
    });
  } catch (error) {
    console.error('Create order error:', error);
    if (error.message === 'Cart is empty') {
      return res.status(400).json({ error: 'Cannot create order: cart is empty' });
    }
    res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * GET /api/orders
 * Get user's order history
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const orders = await Order.getUserOrders(userId, limit, offset);
    const count = await Order.getUserOrderCount(userId);

    res.json({
      data: orders,
      pagination: {
        limit,
        offset,
        total: count,
        hasMore: offset + limit < count
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/orders/:orderId
 * Get single order with items
 */
router.get('/:orderId', async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.orderId);

    const order = await Order.getOrderDetails(orderId, userId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await Order.getOrderItems(orderId);

    res.json({
      order,
      items
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * PUT /api/orders/:orderId
 * Update order status (admin only in production)
 */
router.put('/:orderId', async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.orderId);
    const { estado } = req.body;

    const validStatuses = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    if (!estado || !validStatuses.includes(estado)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedOrder = await Order.updateStatus(orderId, userId, estado);
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: 'Order updated',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = router;
