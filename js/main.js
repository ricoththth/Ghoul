/* ============================================
   GHOUL — Main JS with API Integration
   ============================================ */

import { auth, cart, orders, products, setToken, removeToken, getToken, isAuthenticated } from './api.js';

// ============================================
// Auth Modal & Navigation
// ============================================

let authModalOpen = false;
let authMode = 'login'; // 'login' or 'register'

function createAuthModal() {
  if (document.querySelector('.auth-modal')) return;

  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.innerHTML = `
    <div class="auth-modal__overlay"></div>
    <div class="auth-modal__content">
      <button class="auth-modal__close">✕</button>

      <div class="auth-tabs">
        <button class="auth-tab auth-tab--active" data-mode="login">Iniciar sesión</button>
        <button class="auth-tab" data-mode="register">Crear cuenta</button>
      </div>

      <!-- Login Form -->
      <form class="auth-form auth-form--active" data-mode="login">
        <input type="email" class="input auth-email" placeholder="Correo electrónico" required>
        <input type="password" class="input auth-password" placeholder="Contraseña" required>
        <button type="submit" class="btn btn--dark btn--full">Iniciar sesión</button>
        <p class="auth-error" style="display:none;color:#d32f2f;margin-top:10px;text-align:center"></p>
      </form>

      <!-- Register Form -->
      <form class="auth-form" data-mode="register">
        <input type="email" class="input auth-email" placeholder="Correo electrónico" required>
        <input type="password" class="input auth-password" placeholder="Contraseña (mín. 8 caracteres)" required>
        <input type="text" class="input auth-nombre" placeholder="Nombre" required>
        <input type="text" class="input auth-apellido" placeholder="Apellido" required>
        <button type="submit" class="btn btn--dark btn--full">Crear cuenta</button>
        <p class="auth-error" style="display:none;color:#d32f2f;margin-top:10px;text-align:center"></p>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Tab switching
  modal.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;
      modal.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('auth-tab--active'));
      modal.querySelectorAll('.auth-form').forEach(f => f.classList.remove('auth-form--active'));
      tab.classList.add('auth-tab--active');
      modal.querySelector(`.auth-form[data-mode="${mode}"]`).classList.add('auth-form--active');
      authMode = mode;
    });
  });

  // Form submissions
  modal.querySelectorAll('.auth-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const mode = form.dataset.mode;
      const email = form.querySelector('.auth-email').value;
      const password = form.querySelector('.auth-password').value;
      const errorEl = form.querySelector('.auth-error');

      if (mode === 'login') {
        const result = await auth.login(email, password);
        if (result.success) {
          setToken(result.data.token);
          closeAuthModal();
          updateAuthUI();
          alert('¡Sesión iniciada!');
        } else {
          errorEl.textContent = result.error;
          errorEl.style.display = 'block';
        }
      } else {
        const nombre = form.querySelector('.auth-nombre').value;
        const apellido = form.querySelector('.auth-apellido').value;
        const result = await auth.register(email, password, nombre, apellido);
        if (result.success) {
          setToken(result.data.token);
          closeAuthModal();
          updateAuthUI();
          alert('¡Cuenta creada! Verifica tu correo para activarla.');
        } else {
          errorEl.textContent = result.error;
          errorEl.style.display = 'block';
        }
      }
    });
  });

  // Close modal
  modal.querySelector('.auth-modal__close').addEventListener('click', closeAuthModal);
  modal.querySelector('.auth-modal__overlay').addEventListener('click', closeAuthModal);
}

function openAuthModal() {
  createAuthModal();
  const modal = document.querySelector('.auth-modal');
  modal.style.display = 'flex';
  authModalOpen = true;
}

function closeAuthModal() {
  const modal = document.querySelector('.auth-modal');
  if (modal) modal.style.display = 'none';
  authModalOpen = false;
}

function updateAuthUI() {
  const navActions = document.querySelector('.nav__actions');
  if (!navActions) return;

  if (isAuthenticated()) {
    // Show logout button
    const authBtn = navActions.querySelector('.auth-btn');
    if (authBtn) {
      authBtn.textContent = 'Cerrar sesión';
      authBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
        removeToken();
        updateAuthUI();
        alert('Sesión cerrada');
      });
    }
  } else {
    // Show login button
    const authBtn = navActions.querySelector('.auth-btn');
    if (authBtn) {
      authBtn.textContent = 'Iniciar sesión';
      authBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal();
      });
    }
  }
}

// ============================================
// Cart Count Update
// ============================================

async function updateCartCount() {
  let count = 0;
  if (isAuthenticated()) {
    const result = await cart.get();
    if (result.success && result.data.summary) count = result.data.summary.item_count;
  } else {
    count = getLocalCart().reduce((sum, item) => sum + item.cantidad, 0);
  }
  document.querySelectorAll('.nav__cart-count').forEach(el => el.textContent = count);
}

// ============================================
// Carrito Anónimo (localStorage)
// ============================================

const LOCAL_CART_KEY = 'ghoul_anonymous_cart';

function getLocalCart() {
  const cart = localStorage.getItem(LOCAL_CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

function saveLocalCart(cartItems) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems));
  updateCartCount();
}

function addToLocalCart(productId, nombre, precio, talla, cantidad) {
  const cartItems = getLocalCart();
  const existing = cartItems.find(item => item.product_id === productId && item.talla === talla);

  if (existing) {
    existing.cantidad += cantidad;
  } else {
    cartItems.push({ product_id: productId, nombre, precio, talla, cantidad });
  }

  saveLocalCart(cartItems);
}

// ============================================
// Add to Cart
// ============================================

function initAddToCart() {
  const atcBtn = document.querySelector('.pd-atc');
  if (!atcBtn) return;

  atcBtn.addEventListener('click', async () => {
    // Get selected size
    const sizeBtn = document.querySelector('.size-btn.active');
    if (!sizeBtn) {
      alert('Por favor selecciona una talla');
      return;
    }

    // Get product info
    const sku = document.querySelector('.pd-sku')?.textContent || 'HD-01';
    const nombre = document.querySelector('.pd-name')?.textContent || 'Producto';
    const precioText = document.querySelector('.pd-price')?.textContent || '$0';
    const precio = parseInt(precioText.replace(/\D/g, '')) || 0;
    const productId = sku === 'HD-01' ? 1 : 2;

    const talla = sizeBtn.textContent;
    const qtyInput = document.querySelector('.qty-input');
    const cantidad = parseInt(qtyInput?.value) || 1;

    atcBtn.disabled = true;
    atcBtn.textContent = 'Agregando...';

    // Si está autenticado, agregar a backend
    if (isAuthenticated()) {
      const result = await cart.add(productId, talla, cantidad);
      if (result.success) {
        alert('¡Producto agregado al carrito!');
        updateCartCount();
      } else {
        alert('Error: ' + result.error);
      }
    } else {
      // Si no está autenticado, guardar en localStorage
      addToLocalCart(productId, nombre, precio, talla, cantidad);
      alert('¡Producto agregado al carrito!');
    }

    atcBtn.disabled = false;
    atcBtn.textContent = 'Agregar al carrito';
  });
}

// ============================================
// Cart Page
// ============================================

function renderCartSummary(items, total) {
  const cartSummary = document.querySelector('.cart-summary');
  if (!cartSummary) return;

  let html = '<h3 class="cart-summary__title">Resumen del pedido</h3>';

  if (items.length > 0) {
    items.forEach((item, index) => {
      html += `
        <div class="summary-item" data-index="${index}" data-id="${item.id || ''}">
          <div class="summary-item__img ph"></div>
          <div class="summary-item__info">
            <p class="summary-item__name">${item.nombre}</p>
            <p class="summary-item__size">Talla: ${item.talla}</p>
            <div class="summary-item__controls">
              <button class="cart-qty-btn" data-action="dn" data-index="${index}">−</button>
              <span class="cart-qty-val">${item.cantidad}</span>
              <button class="cart-qty-btn" data-action="up" data-index="${index}">+</button>
              <button class="cart-remove-btn" data-index="${index}">Eliminar</button>
            </div>
          </div>
          <div class="summary-item__price">$${(item.precio * item.cantidad).toLocaleString('es-CO')}</div>
        </div>
      `;
    });
  } else {
    html += '<p style="text-align:center;padding:20px;color:var(--gray-mid)">Tu carrito está vacío</p>';
  }

  html += `
    <div class="summary-subtotal">
      <span>Subtotal</span>
      <span>$${total.toLocaleString('es-CO')}</span>
    </div>
  `;

  cartSummary.innerHTML = html;

  // Bind controls
  cartSummary.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const action = btn.dataset.action;
      if (isAuthenticated()) {
        // backend: update via API
        const item = items[idx];
        const newQty = action === 'up' ? item.cantidad + 1 : Math.max(1, item.cantidad - 1);
        cart.updateQuantity(item.id, newQty).then(() => loadCartItems());
      } else {
        const localItems = getLocalCart();
        if (action === 'up') localItems[idx].cantidad += 1;
        else localItems[idx].cantidad = Math.max(1, localItems[idx].cantidad - 1);
        saveLocalCart(localItems);
        loadCartItems();
      }
    });
  });

  cartSummary.querySelectorAll('.cart-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      if (isAuthenticated()) {
        cart.remove(items[idx].id).then(() => loadCartItems());
      } else {
        const localItems = getLocalCart();
        localItems.splice(idx, 1);
        saveLocalCart(localItems);
        loadCartItems();
      }
    });
  });
}

async function loadCartItems() {
  const cartSummary = document.querySelector('.cart-summary');
  if (!cartSummary) return;

  let items = [];
  let total = 0;

  if (isAuthenticated()) {
    const result = await cart.get();
    if (!result.success) { alert('Error cargando carrito: ' + result.error); return; }
    items = result.data.items || [];
    total = result.data.summary?.total || 0;
  } else {
    items = getLocalCart();
    total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  }

  renderCartSummary(items, total);
}

// ============================================
// Checkout / Create Order
// ============================================

function initCheckout() {
  const continueBtn = document.querySelector('.cart-continue');
  if (!continueBtn) return;

  continueBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      openAuthModal();
      return;
    }

    // Get form data using IDs
    const formData = {
      email_envio: document.getElementById('email_envio')?.value,
      nombre_envio: document.getElementById('nombre_envio')?.value,
      apellido_envio: document.getElementById('apellido_envio')?.value,
      direccion_envio: document.getElementById('direccion_envio')?.value,
      ciudad: document.getElementById('ciudad')?.value,
      pais: document.getElementById('pais')?.value,
      departamento: document.getElementById('departamento')?.value,
      codigo_postal: document.getElementById('codigo_postal')?.value,
      metodo_pago: 'tarjeta'
    };

    // Validate
    if (!formData.email_envio || !formData.nombre_envio || !formData.apellido_envio || !formData.direccion_envio) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    continueBtn.disabled = true;
    continueBtn.textContent = 'Creando orden...';

    const result = await orders.create(formData);

    if (result.success) {
      alert('¡Orden creada exitosamente!');
      localStorage.setItem('lastOrderId', result.data.id);
      window.location.href = 'confirmacion.html';
    } else {
      alert('Error creando orden: ' + result.error);
    }

    continueBtn.disabled = false;
    continueBtn.textContent = 'Continuar al pago';
  });
}

// ============================================
// Custom Cursor
// ============================================

function initCursor() {
  const dot = document.createElement('div');
  dot.className = 'cursor';
  document.body.appendChild(dot);

  document.addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
  });

  document.addEventListener('click', e => {
    const ripple = document.createElement('div');
    ripple.className = 'cursor-ripple';
    ripple.style.left   = e.clientX + 'px';
    ripple.style.top    = e.clientY + 'px';
    ripple.style.width  = '32px';
    ripple.style.height = '32px';
    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

// ============================================
// Original UI Functions
// ============================================

function initCountdown(targetDateStr, el) {
  if (!el) return;
  const target = new Date(targetDateStr).getTime();

  function tick() {
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) { el.textContent = '00:00:00:00'; return; }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const pad = n => String(n).padStart(2, '0');
    const labels = el.querySelectorAll('.cd-value');
    if (labels.length === 4) {
      labels[0].textContent = pad(d);
      labels[1].textContent = pad(h);
      labels[2].textContent = pad(m);
      labels[3].textContent = pad(s);
    }
  }
  tick();
  setInterval(tick, 1000);
}

function initSizeSelector() {
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.size-grid').querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function initQuantity() {
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.qty-row').querySelector('.qty-input');
      let val = parseInt(input.value) || 1;
      if (btn.dataset.dir === 'up') val = Math.min(val + 1, 99);
      if (btn.dataset.dir === 'dn') val = Math.max(val - 1, 1);
      input.value = val;
    });
  });
}

function initThumbs() {
  const thumbs = document.querySelectorAll('.thumb-item');
  const slides = document.querySelector('.pd-slides');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.pd-arrow--prev');
  const nextBtn = document.querySelector('.pd-arrow--next');

  if (!thumbs.length || !slides) return;

  const total = thumbs.length;
  let current = 0;

  function goTo(index) {
    current = (index + total) % total;
    slides.style.transform = `translateX(-${current * 100}%)`;
    thumbs.forEach((t, i) => t.classList.toggle('active', i === current));
    dots.forEach((d, i) => d.classList.toggle('dot--active', i === current));
  }

  thumbs.forEach((t, i) => t.addEventListener('click', () => goTo(i)));
  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));
}

function initWaveforms() {
  document.querySelectorAll('.waveform').forEach(wf => {
    const bars = wf.querySelectorAll('.bar');
    const total = bars.length;
    let progress = Math.floor(Math.random() * 0.5 * total);
    bars.forEach((b, i) => {
      if (i < progress) b.classList.add('played');
    });
    wf.addEventListener('click', e => {
      const rect = wf.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      progress = Math.floor(ratio * total);
      bars.forEach((b, i) => {
        b.classList.toggle('played', i < progress);
      });
    });
  });
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.filter-bar').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = (cat === 'todo' || card.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
}

// ============================================
// Init All
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  initCursor();
  // UI Initialization
  initCountdown('2025-09-01T00:00:00', document.querySelector('.countdown'));
  initSizeSelector();
  initQuantity();
  initThumbs();
  initWaveforms();
  initFilters();

  // API Integration
  updateAuthUI();
  updateCartCount();
  initAddToCart();
  loadCartItems();
  initCheckout();
});
