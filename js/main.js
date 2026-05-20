/* ============================================
   GHOUL — Main JS
   ============================================ */

// --- Countdown Timer ---
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

// --- Size Selector ---
function initSizeSelector() {
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.size-grid').querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// --- Quantity ---
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

// --- Thumbnail carousel (product detail) ---
function initThumbs() {
  const thumbs = document.querySelectorAll('.thumb-item');
  const main = document.querySelector('.pd-main-img');
  if (!thumbs.length || !main) return;
  thumbs.forEach(t => {
    t.addEventListener('click', () => {
      thumbs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
    });
  });
}

// --- Waveform fake progress ---
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

// --- Filter tabs (Tienda) ---
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

// --- Init all ---
document.addEventListener('DOMContentLoaded', () => {
  initCountdown('2025-09-01T00:00:00', document.querySelector('.countdown'));
  initSizeSelector();
  initQuantity();
  initThumbs();
  initWaveforms();
  initFilters();
});
