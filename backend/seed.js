require('dotenv').config();
const pool = require('./config/database');
const Product = require('./models/Product');

const products = [
  {
    sku: 'HD-01',
    nombre: 'Hoodie Oversize',
    precio: 189000,
    descripcion: 'Hoodie oversize con diseño minimalista. Material de algodón premium.',
    inventory: 50
  },
  {
    sku: 'TS-01',
    nombre: 'T-Shirt GHOUL',
    precio: 89000,
    descripcion: 'Camiseta básica con logo GHOUL bordado.',
    inventory: 100
  },
  {
    sku: 'TS-02',
    nombre: 'T-Shirt Oversized',
    precio: 99000,
    descripcion: 'Camiseta oversized con fit relajado.',
    inventory: 75
  },
  {
    sku: 'CB-01',
    nombre: 'Cardigan Wool',
    precio: 299000,
    descripcion: 'Cardigan de lana merino con cierre de botones.',
    inventory: 30
  },
  {
    sku: 'TB-01',
    nombre: 'Tote Bag Canvas',
    precio: 129000,
    descripcion: 'Bolso tote en canvas resistente con asas de cuero.',
    inventory: 60
  },
  {
    sku: 'SC-01',
    nombre: 'Scarf Wool',
    precio: 79000,
    descripcion: 'Bufanda de lana en color neutro.',
    inventory: 40
  },
  {
    sku: 'CP-01',
    nombre: 'Cap Baseball',
    precio: 69000,
    descripcion: 'Gorra de béisbol con bordado frontal.',
    inventory: 50
  },
  {
    sku: 'JK-01',
    nombre: 'Jacket Denim',
    precio: 349000,
    descripcion: 'Chaqueta de mezclilla orgánica con detalles de cuero.',
    inventory: 25
  },
  {
    sku: 'PN-01',
    nombre: 'Pants Cargo',
    precio: 229000,
    descripcion: 'Pantalón cargo con múltiples bolsillos funcionales.',
    inventory: 45
  }
];

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing products
    await pool.query('DELETE FROM products');
    console.log('✓ Cleared existing products');

    // Insert products
    for (const product of products) {
      await Product.create(
        product.sku,
        product.nombre,
        product.precio,
        product.descripcion,
        product.inventory
      );
      console.log(`✓ Added: ${product.nombre} (${product.sku})`);
    }

    console.log(`\n✓ Successfully seeded ${products.length} products`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
