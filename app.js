import { getInitialItems } from './sample-data.js';
import { getProductSvg } from './icons.js';

// Application State
const STORAGE_KEY = 'runcitcheck_items_v2';

let items = [];
let activeSection = 'ALL'; // 'ALL' | 'DIY' | 'Medicine'
let activeFilter = 'all'; // 'all' | 'low_or_out' | 'expiring' | 'missing_tag' | 'unchecked'
let searchQuery = '';
let sortBy = 'location'; // Default to rack location for walk-through aisle auditing
let soundEnabled = true;

// Sound effects generator using Web Audio API
class SoundFX {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playToggle(type = 'success') {
    if (!soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      if (type === 'cycle_green') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'cycle_yellow') {
        osc.frequency.setValueAtTime(440, now); // A4
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'cycle_red') {
        osc.frequency.setValueAtTime(329.63, now); // E4
        osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.1); // C4
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      } else {
        osc.frequency.setValueAtTime(580, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      // Audio not permitted or failed
    }
  }
}

const sfx = new SoundFX();

// Haptic feedback helper
function triggerHaptic(type = 'light') {
  if (navigator.vibrate) {
    if (type === 'heavy') navigator.vibrate([40, 30, 40]);
    else if (type === 'medium') navigator.vibrate([30]);
    else navigator.vibrate([15]);
  }
}

// Format Currency
function formatRM(num) {
  return 'RM ' + Number(num || 0).toFixed(2);
}

// Calculate days between today and expiry
function getExpiryInfo(expiryDateStr) {
  if (!expiryDateStr) return { hasExpiry: false, daysLeft: 9999 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDateStr);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      hasExpiry: true,
      daysLeft,
      status: 'expired',
      isExpiringSoon: true,
      label: 'EXPIRED',
      badgeClass: 'bg-red-600 text-white font-extrabold',
      desc: `Expired ${Math.abs(daysLeft)}d ago (${expiryDateStr})`
    };
  } else if (daysLeft <= 30) {
    return {
      hasExpiry: true,
      daysLeft,
      status: 'critical',
      isExpiringSoon: true,
      label: `CRITICAL (${daysLeft}d left)`,
      badgeClass: 'bg-rose-500 text-white animate-subtle-pulse font-extrabold',
      desc: `Luput dlm ${daysLeft} hari (${expiryDateStr})`
    };
  } else if (daysLeft <= 90) {
    return {
      hasExpiry: true,
      daysLeft,
      status: 'warning',
      isExpiringSoon: true,
      label: `EXPIRING (${daysLeft}d left)`,
      badgeClass: 'bg-amber-500 text-white font-bold',
      desc: `Luput dlm ${daysLeft} hari (${expiryDateStr})`
    };
  } else {
    return {
      hasExpiry: true,
      daysLeft,
      status: 'safe',
      isExpiringSoon: false,
      label: `Exp: ${expiryDateStr}`,
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
      desc: `Selamat: Luput ${expiryDateStr}`
    };
  }
}

// Load items from localStorage
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        items = parsed;
        return;
      }
    }
  } catch (err) {
    console.error('Failed to parse saved items:', err);
  }
  // Fallback to initial data
  items = getInitialItems();
  saveData();
}

// Save items to localStorage
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    showToast('Amaran: Gagal menyimpan data!', 'error');
  }
}

// Toast Notification
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    info: 'bg-slate-900 text-white border border-slate-700',
    success: 'bg-emerald-600 text-white border border-emerald-500',
    warning: 'bg-amber-600 text-white border border-amber-500',
    error: 'bg-rose-600 text-white border border-rose-500'
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  toast.className = `toast-item flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold max-w-sm w-full mx-auto backdrop-blur-md ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <span class="text-base">${icons[type] || '🔔'}</span>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 2300);
}

// Cycle Stock Status: in_stock -> low_stock -> out_of_stock -> in_stock
export function cycleStockStatus(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  const current = item.stockStatus;
  let next = 'in_stock';
  let soundType = 'cycle_green';
  let toastMsg = '';

  if (current === 'in_stock') {
    next = 'low_stock';
    soundType = 'cycle_yellow';
    toastMsg = `🟡 ${item.name}: STOK RENDAH`;
  } else if (current === 'low_stock') {
    next = 'out_of_stock';
    soundType = 'cycle_red';
    toastMsg = `🔴 ${item.name}: HABIS STOK`;
  } else {
    next = 'in_stock';
    soundType = 'cycle_green';
    toastMsg = `🟢 ${item.name}: ADA STOK`;
  }

  item.stockStatus = next;
  // Mark as checked today when staff inspects/updates it
  item.checkedToday = true;
  item.lastCheckedTime = new Date().toISOString();

  sfx.playToggle(soundType);
  triggerHaptic('medium');
  saveData();
  renderApp();
  showToast(toastMsg, next === 'out_of_stock' ? 'error' : (next === 'low_stock' ? 'warning' : 'success'));
}

// Toggle Price Tag Checked
export function togglePriceTag(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  item.priceTagChecked = !item.priceTagChecked;
  item.checkedToday = true;
  item.lastCheckedTime = new Date().toISOString();

  sfx.playToggle('success');
  triggerHaptic('light');
  saveData();
  renderApp();

  if (item.priceTagChecked) {
    showToast(`🏷️ Tanda harga "${item.name}" OK`, 'success');
  } else {
    showToast(`⚠️ Tanda harga "${item.name}" HILANG`, 'warning');
  }
}

// Toggle Daily Checked Status
export function toggleDailyChecked(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  item.checkedToday = !item.checkedToday;
  item.lastCheckedTime = item.checkedToday ? new Date().toISOString() : null;

  sfx.playToggle(item.checkedToday ? 'cycle_green' : 'toggle');
  triggerHaptic('light');
  saveData();
  renderApp();

  showToast(item.checkedToday ? `✓ Disemak: ${item.name}` : `Batal semak: ${item.name}`, 'info');
}

// Reset Daily Check for all items
export function resetDailyCheck() {
  items.forEach(i => {
    i.checkedToday = false;
  });
  saveData();
  renderApp();
  showToast('Semua semakan harian telah di-reset untuk giliran baru!', 'info');
}

// Filter and Sort Items
function getFilteredItems() {
  return items.filter(item => {
    // 1. Section Filter
    if (activeSection !== 'ALL' && item.section !== activeSection) {
      return false;
    }

    // 2. Search Query (name, malay alias, category, shelfLocation, notes)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const match =
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.aliasMalay && item.aliasMalay.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.shelfLocation && item.shelfLocation.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));
      if (!match) return false;
    }

    // 3. Filter Chips
    if (activeFilter === 'low_or_out') {
      return item.stockStatus === 'low_stock' || item.stockStatus === 'out_of_stock';
    } else if (activeFilter === 'expiring') {
      const exp = getExpiryInfo(item.expiryDate);
      return exp.hasExpiry && exp.daysLeft <= 90;
    } else if (activeFilter === 'missing_tag') {
      return item.priceTagChecked === false;
    } else if (activeFilter === 'unchecked') {
      return !item.checkedToday;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'location') {
      return (a.shelfLocation || '').localeCompare(b.shelfLocation || '', undefined, { numeric: true, sensitivity: 'base' });
    } else if (sortBy === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    } else if (sortBy === 'expiry') {
      const expA = a.expiryDate ? new Date(a.expiryDate).getTime() : 9999999999999;
      const expB = b.expiryDate ? new Date(b.expiryDate).getTime() : 9999999999999;
      return expA - expB;
    } else if (sortBy === 'status') {
      const weight = { out_of_stock: 1, low_stock: 2, in_stock: 3 };
      return (weight[a.stockStatus] || 3) - (weight[b.stockStatus] || 3);
    }
    return 0;
  });
}

// Calculate Summary Statistics
function getStats() {
  const sectionItems = items.filter(i => activeSection === 'ALL' || i.section === activeSection);
  const total = sectionItems.length;
  const checked = sectionItems.filter(i => i.checkedToday).length;
  const outOfStock = sectionItems.filter(i => i.stockStatus === 'out_of_stock').length;
  const lowStock = sectionItems.filter(i => i.stockStatus === 'low_stock').length;
  const expiringSoon = sectionItems.filter(i => {
    const exp = getExpiryInfo(i.expiryDate);
    return exp.hasExpiry && exp.daysLeft <= 90;
  }).length;
  const missingPriceTag = sectionItems.filter(i => !i.priceTagChecked).length;
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

  return { total, checked, outOfStock, lowStock, expiringSoon, missingPriceTag, percent };
}

// Generate Boss WhatsApp Report
export function generateWhatsAppReport() {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('ms-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const timeFormatted = now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });

  const total = items.length;
  const checked = items.filter(i => i.checkedToday).length;
  const outOfStockList = items.filter(i => i.stockStatus === 'out_of_stock');
  const lowStockList = items.filter(i => i.stockStatus === 'low_stock');
  const expiringSoonList = items.filter(i => {
    const exp = getExpiryInfo(i.expiryDate);
    return exp.hasExpiry && exp.daysLeft <= 90;
  });
  const missingTagList = items.filter(i => !i.priceTagChecked);

  let text = `📋 *LAPORAN STOK HARIAN (DAILY AISLE CHECK)*\n`;
  text += `🏪 *Kedai*: Mini Mart Maju\n`;
  text += `📅 *Masa*: ${dateFormatted} | ${timeFormatted}\n`;
  text += `📊 *Kemajuan Semakan*: ${checked}/${total} Barangan (${Math.round((checked / total) * 100)}% Selesai)\n`;
  text += `--------------------------------------\n\n`;

  // 1. Out of stock
  text += `🔴 *HABIS STOK / PERLU ORDER (${outOfStockList.length} Item)*:\n`;
  if (outOfStockList.length === 0) {
    text += `  ✅ Tiada barang habis stok. Semua mencukupi!\n`;
  } else {
    outOfStockList.forEach((it, idx) => {
      text += `  ${idx + 1}. *${it.name}* (${it.aliasMalay || it.category})\n`;
      text += `     📍 Lokasi: ${it.shelfLocation} | Harga: ${formatRM(it.price)}\n`;
    });
  }
  text += `\n`;

  // 2. Low stock
  text += `🟡 *STOK RENDAH (${lowStockList.length} Item)*:\n`;
  if (lowStockList.length === 0) {
    text += `  ✅ Tiada stok rendah dikesan.\n`;
  } else {
    lowStockList.forEach((it, idx) => {
      text += `  ${idx + 1}. *${it.name}* (Baki: ${it.stockQty || 'Sedikit'})\n`;
      text += `     📍 Lokasi: ${it.shelfLocation}\n`;
    });
  }
  text += `\n`;

  // 3. Expiring Soon
  text += `⚠️ *TARIKH LUPUT HAMPIR / <90 HARI (${expiringSoonList.length} Item)*:\n`;
  if (expiringSoonList.length === 0) {
    text += `  ✅ Tiada ubat/barangan yang tamat tempoh dalam masa 90 hari.\n`;
  } else {
    expiringSoonList.forEach((it, idx) => {
      const exp = getExpiryInfo(it.expiryDate);
      const alertEmoji = exp.daysLeft <= 30 ? '🚨' : '⏳';
      text += `  ${idx + 1}. ${alertEmoji} *${it.name}*\n`;
      text += `     Luput: ${it.expiryDate} (${exp.daysLeft < 0 ? 'TELAH LUPUT' : exp.daysLeft + ' hari lagi'})\n`;
      text += `     📍 Lokasi: ${it.shelfLocation}\n`;
    });
  }
  text += `\n`;

  // 4. Missing Price Tags
  text += `🏷️ *TANDA HARGA HILANG / PERLU PRINT (${missingTagList.length} Item)*:\n`;
  if (missingTagList.length === 0) {
    text += `  ✅ Semua tanda harga lengkap di rak.\n`;
  } else {
    missingTagList.forEach((it, idx) => {
      text += `  ${idx + 1}. *${it.name}* -> *${formatRM(it.price)}*\n`;
      text += `     📍 Lokasi: ${it.shelfLocation}\n`;
    });
  }

  text += `\n--------------------------------------\n`;
  text += `_Dihantar melalui Sistem Semakan Mudah Alih RuncitCheck_`;

  return text;
}

// Render Summary & KPI Cards
function renderSummary() {
  const stats = getStats();
  const summaryEl = document.getElementById('daily-summary-container');
  if (!summaryEl) return;

  summaryEl.innerHTML = `
    <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-4 shadow-lg border border-slate-700/60 relative overflow-hidden">
      <!-- Background pattern -->
      <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <!-- Top Header Row -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2.5">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm border border-emerald-500/30">
            ✓
          </span>
          <div>
            <h2 class="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">Semakan Harian (Daily Check)</h2>
            <div class="text-sm font-extrabold flex items-center gap-2">
              <span>${stats.checked} / ${stats.total} Barangan</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${stats.percent === 100 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}">
                ${stats.percent}%
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <button id="btn-open-report" class="active-press inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
            <span>Hantar Boss</span>
          </button>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="w-full bg-slate-700/80 rounded-full h-2 mb-3 overflow-hidden p-0.5 border border-slate-600/50">
        <div class="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-300 ease-out" style="width: ${stats.percent}%"></div>
      </div>

      <!-- KPI quick filter pills (Tappable on mobile) -->
      <div class="grid grid-cols-4 gap-2 pt-1 border-t border-slate-700/60">
        <!-- Out of stock -->
        <button data-filter-kpi="low_or_out" class="active-press flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border ${activeFilter === 'low_or_out' ? 'border-red-500 bg-red-950/40 text-red-300 ring-2 ring-red-500/30' : 'border-slate-700/80 text-slate-300'} transition-all">
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-red-500"></span>
            <span class="text-sm font-black text-red-400">${stats.outOfStock}</span>
          </div>
          <span class="text-[10px] uppercase font-bold tracking-tight text-slate-400 mt-0.5">Habis</span>
        </button>

        <!-- Low stock -->
        <button data-filter-kpi="low_or_out" class="active-press flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border ${activeFilter === 'low_or_out' ? 'border-amber-500 bg-amber-950/40 text-amber-300' : 'border-slate-700/80 text-slate-300'} transition-all">
          <span class="text-sm font-black text-amber-400">${stats.lowStock}</span>
          <span class="text-[10px] uppercase font-bold tracking-tight text-slate-400 mt-0.5">Rendah</span>
        </button>

        <!-- Expiring Soon -->
        <button data-filter-kpi="expiring" class="active-press flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border ${activeFilter === 'expiring' ? 'border-orange-500 bg-orange-950/40 text-orange-300 ring-2 ring-orange-500/30' : 'border-slate-700/80 text-slate-300'} transition-all">
          <span class="text-sm font-black text-orange-400">${stats.expiringSoon}</span>
          <span class="text-[10px] uppercase font-bold tracking-tight text-slate-400 mt-0.5">&lt;90 Hari</span>
        </button>

        <!-- Missing Tag -->
        <button data-filter-kpi="missing_tag" class="active-press flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border ${activeFilter === 'missing_tag' ? 'border-yellow-400 bg-yellow-950/40 text-yellow-300 ring-2 ring-yellow-400/30' : 'border-slate-700/80 text-slate-300'} transition-all">
          <span class="text-sm font-black text-yellow-300">${stats.missingPriceTag}</span>
          <span class="text-[10px] uppercase font-bold tracking-tight text-slate-400 mt-0.5">Tiada Tag</span>
        </button>
      </div>
    </div>
  `;

  // Attach event listener to Hantar Boss button
  document.getElementById('btn-open-report')?.addEventListener('click', () => {
    openReportModal();
  });

  // Attach listeners to KPI buttons for rapid filtering
  document.querySelectorAll('[data-filter-kpi]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetFilter = btn.getAttribute('data-filter-kpi');
      activeFilter = activeFilter === targetFilter ? 'all' : targetFilter;
      renderApp();
    });
  });
}

// Render Filter Chips
function renderFilterChips() {
  const container = document.getElementById('filter-chips-container');
  if (!container) return;

  const chips = [
    { id: 'all', label: 'Semua' },
    { id: 'low_or_out', label: '⚠️ Habis/Rendah' },
    { id: 'expiring', label: '⏳ Luput &lt;90h' },
    { id: 'missing_tag', label: '🏷️ Tiada Tag' },
    { id: 'unchecked', label: '👁️ Belum Semak' }
  ];

  container.innerHTML = chips.map(c => `
    <button data-filter-id="${c.id}" class="active-press whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeFilter === c.id ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
      ${c.label}
    </button>
  `).join('');

  container.querySelectorAll('[data-filter-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.getAttribute('data-filter-id');
      renderApp();
    });
  });
}

// Render Main Item Cards
function renderItemCards() {
  const container = document.getElementById('items-list-container');
  const countBadge = document.getElementById('search-result-count');
  if (!container) return;

  const filtered = getFilteredItems();
  if (countBadge) {
    countBadge.textContent = `${filtered.length} item dijumpai`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
        <div class="text-4xl mb-3">🔍</div>
        <h3 class="text-sm font-bold text-slate-800">Tiada Barangan Dijumpai</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Cuba tukar kata kunci carian atau reset filter di bahagian atas.
        </p>
        <button id="btn-reset-filters-empty" class="active-press mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow">
          Reset Tapisan
        </button>
      </div>
    `;
    document.getElementById('btn-reset-filters-empty')?.addEventListener('click', () => {
      searchQuery = '';
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.value = '';
      activeFilter = 'all';
      activeSection = 'ALL';
      renderApp();
    });
    return;
  }

  container.innerHTML = filtered.map(item => {
    const exp = getExpiryInfo(item.expiryDate);

    // Stock Status Config
    let statusBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    let statusText = '🟢 ADA STOK';
    let statusBorderClass = '';

    if (item.stockStatus === 'low_stock') {
      statusBadgeClass = 'bg-amber-50 text-amber-900 border-amber-300';
      statusText = '🟡 STOK RENDAH';
    } else if (item.stockStatus === 'out_of_stock') {
      statusBadgeClass = 'bg-rose-50 text-rose-800 border-rose-300';
      statusText = '🔴 HABIS STOK';
      statusBorderClass = 'card-out-of-stock';
    }

    if (exp.status === 'critical' || exp.status === 'expired') {
      statusBorderClass = 'card-critical-expiry';
    } else if (exp.status === 'warning') {
      statusBorderClass = statusBorderClass || 'card-warning-expiry';
    }

    // Checked Today pill styling
    const checkedPill = item.checkedToday
      ? `<span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">✓ Semak Hari Ini</span>`
      : `<span class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Belum Semak</span>`;

    // Visual thumbnail
    const svgIllustration = getProductSvg(item.svgIcon, item.section);

    return `
      <div data-item-id="${item.id}" class="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/90 relative transition-all ${statusBorderClass} ${item.checkedToday ? 'card-checked bg-slate-50/40' : ''}">
        
        <!-- Top Metadata Row: Section + Shelf Location + Checked Pill -->
        <div class="flex items-center justify-between gap-1.5 mb-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <!-- Section Badge -->
            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${item.section === 'DIY' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-rose-100 text-rose-900 border border-rose-200'}">
              ${item.section === 'DIY' ? '🔧 DIY' : '💊 Farmasi'}
            </span>

            <!-- Shelf Location Badge (Prominent for aisle walking) -->
            <span class="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-800 text-slate-100 px-2 py-0.5 rounded-md shadow-xs">
              <svg class="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
              ${item.shelfLocation}
            </span>
          </div>

          <div class="flex items-center gap-1">
            ${checkedPill}
            <button data-action="edit" data-id="${item.id}" class="active-press p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
          </div>
        </div>

        <!-- Middle Body: Photo + Name + Alias + Price -->
        <div class="flex items-start gap-3 my-2">
          <!-- Thumbnail Image with SVG Vector Fallback -->
          <div data-action="zoom-photo" data-id="${item.id}" class="active-press flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 relative group cursor-pointer shadow-xs">
            <div class="absolute inset-0 flex items-center justify-center p-1.5">
              ${svgIllustration}
            </div>
            ${item.image ? `
              <img src="${item.image}" alt="${item.name}" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-200" onerror="this.remove()"/>
            ` : ''}
            <div class="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
              🔍
            </div>
          </div>

          <!-- Product Details -->
          <div class="flex-1 min-w-0">
            <h3 class="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2">
              ${item.name}
            </h3>
            
            ${item.aliasMalay ? `
              <p class="text-[11px] font-semibold text-emerald-800 mt-0.5 line-clamp-1 italic">
                "${item.aliasMalay}"
              </p>
            ` : ''}

            <div class="flex items-center gap-2 mt-1">
              <span class="text-[11px] text-slate-500 font-medium">${item.category}</span>
            </div>

            <!-- Price and Expiry info -->
            <div class="flex items-baseline justify-between mt-1.5 gap-2">
              <span class="price-tag text-sm font-black text-slate-900">
                ${formatRM(item.price)}
              </span>

              ${exp.hasExpiry ? `
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${exp.badgeClass}">
                  ${exp.label}
                </span>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Notes if present -->
        ${item.notes ? `
          <div class="mt-2 text-[11px] text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-150 flex items-start gap-1.5">
            <span class="text-slate-400">📝</span>
            <span class="line-clamp-2">${item.notes}</span>
          </div>
        ` : ''}

        <!-- BOTTOM ACTION BUTTONS: One-Handed Mobile Fast Toggles -->
        <div class="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2">
          
          <!-- Stock Cycle Button (One tap to cycle) -->
          <button data-action="cycle-stock" data-id="${item.id}" class="active-press flex items-center justify-between px-2.5 py-2 rounded-xl border text-[11px] font-extrabold shadow-xs ${statusBadgeClass} transition-all">
            <span class="truncate">${statusText}</span>
            <span class="text-xs opacity-75 ml-1">↻</span>
          </button>

          <!-- Price Tag Verification Button (One tap to check) -->
          <button data-action="toggle-price-tag" data-id="${item.id}" class="active-press flex items-center justify-between px-2.5 py-2 rounded-xl border text-[11px] font-extrabold transition-all shadow-xs ${item.priceTagChecked ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-700 border-red-300 animate-pulse'}">
            <div class="flex items-center gap-1 truncate">
              <span>${item.priceTagChecked ? '🏷️' : '⚠️'}</span>
              <span class="truncate">${item.priceTagChecked ? 'Tag Harga OK' : 'Tag HILANG'}</span>
            </div>
            <span class="text-xs font-black">${item.priceTagChecked ? '✓' : '✗'}</span>
          </button>
        </div>

        <!-- Quick "Mark Checked" row -->
        <div class="mt-2 flex items-center justify-between text-xs">
          <button data-action="toggle-checked" data-id="${item.id}" class="active-press flex items-center gap-1.5 text-[11px] font-semibold ${item.checkedToday ? 'text-emerald-700 hover:text-emerald-800' : 'text-slate-500 hover:text-slate-800'} py-1 px-1">
            <span class="w-4 h-4 rounded border flex items-center justify-center ${item.checkedToday ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'}">
              ${item.checkedToday ? '✓' : ''}
            </span>
            <span>${item.checkedToday ? 'Telah Disemak Hari Ini' : 'Tandakan Sudah Semak'}</span>
          </button>

          <span class="text-[10px] text-slate-400">
            ${item.lastCheckedTime ? `Masa: ${new Date(item.lastCheckedTime).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}` : ''}
          </span>
        </div>

      </div>
    `;
  }).join('');

  // Attach card event listeners
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');

      if (action === 'cycle-stock') {
        cycleStockStatus(id);
      } else if (action === 'toggle-price-tag') {
        togglePriceTag(id);
      } else if (action === 'toggle-checked') {
        toggleDailyChecked(id);
      } else if (action === 'edit') {
        openEditModal(id);
      } else if (action === 'zoom-photo') {
        openPhotoZoom(id);
      }
    });
  });
}

// Render Section Tabs
function renderSectionTabs() {
  const tabs = [
    { id: 'ALL', label: 'Semua (All)' },
    { id: 'DIY', label: '🔧 DIY' },
    { id: 'Medicine', label: '💊 Farmasi' }
  ];

  const container = document.getElementById('section-tabs-container');
  if (!container) return;

  container.innerHTML = tabs.map(tab => {
    const isActive = activeSection === tab.id;
    const count = items.filter(i => tab.id === 'ALL' || i.section === tab.id).length;

    return `
      <button data-section-id="${tab.id}" class="active-press flex-1 py-2 px-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
        <span>${tab.label}</span>
        <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}">
          ${count}
        </span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('[data-section-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSection = btn.getAttribute('data-section-id');
      renderApp();
    });
  });
}

// Photo Zoom Modal
function openPhotoZoom(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  const modal = document.getElementById('photo-modal');
  const modalContent = document.getElementById('photo-modal-content');
  if (!modal || !modalContent) return;

  const svgIllustration = getProductSvg(item.svgIcon, item.section);

  modalContent.innerHTML = `
    <div class="relative bg-white rounded-3xl overflow-hidden max-w-sm w-full mx-4 shadow-2xl border border-slate-200 animate-in fade-in">
      <div class="relative w-full h-64 bg-slate-100 flex items-center justify-center">
        <div class="absolute inset-0 flex items-center justify-center p-8">
          ${svgIllustration}
        </div>
        ${item.image ? `
          <img src="${item.image}" alt="${item.name}" class="absolute inset-0 w-full h-full object-cover" onerror="this.remove()"/>
        ` : ''}
        <button id="close-photo-modal" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow">
          ✕
        </button>
        <span class="absolute bottom-3 left-3 bg-slate-900/85 text-white text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
          📍 ${item.shelfLocation}
        </span>
      </div>

      <div class="p-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[10px] uppercase font-black px-2 py-0.5 rounded ${item.section === 'DIY' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}">
            ${item.section}
          </span>
          <span class="text-xs font-bold text-slate-500">${item.category}</span>
        </div>
        <h3 class="text-sm font-extrabold text-slate-900">${item.name}</h3>
        ${item.aliasMalay ? `<p class="text-xs font-semibold text-emerald-800 mt-0.5">"${item.aliasMalay}"</p>` : ''}

        <div class="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span class="price-tag text-base font-black text-slate-900">${formatRM(item.price)}</span>
          <span class="text-xs font-bold px-2.5 py-1 rounded-lg ${item.stockStatus === 'in_stock' ? 'bg-emerald-100 text-emerald-800' : (item.stockStatus === 'low_stock' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')}">
            ${item.stockStatus === 'in_stock' ? '🟢 Ada Stok' : (item.stockStatus === 'low_stock' ? '🟡 Stok Rendah' : '🔴 Habis')}
          </span>
        </div>

        <button id="btn-edit-from-photo" class="active-press mt-3 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow">
          Edit Maklumat Barangan
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  document.getElementById('close-photo-modal')?.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  });

  document.getElementById('btn-edit-from-photo')?.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    openEditModal(item.id);
  });
}

// Edit / Add Item Modal
let editingItemId = null;

export function openAddModal() {
  editingItemId = null;
  populateItemForm(null);
  const modal = document.getElementById('item-form-modal');
  document.getElementById('form-modal-title').textContent = 'Tambah Barangan Baru';
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}

export function openEditModal(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  editingItemId = id;
  populateItemForm(item);
  const modal = document.getElementById('item-form-modal');
  document.getElementById('form-modal-title').textContent = 'Edit Barangan';
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}

function populateItemForm(item) {
  const form = document.getElementById('item-form');
  if (!form) return;

  if (item) {
    form.name.value = item.name || '';
    form.aliasMalay.value = item.aliasMalay || '';
    form.section.value = item.section || 'DIY';
    form.category.value = item.category || '';
    form.shelfLocation.value = item.shelfLocation || '';
    form.price.value = item.price || '';
    form.expiryDate.value = item.expiryDate || '';
    form.stockStatus.value = item.stockStatus || 'in_stock';
    form.priceTagChecked.checked = item.priceTagChecked ?? true;
    form.notes.value = item.notes || '';
    form.imageUrl.value = item.image || '';
    updateImagePreview(item.image);
    document.getElementById('btn-delete-item').classList.remove('hidden');
  } else {
    form.reset();
    form.section.value = activeSection === 'ALL' ? 'DIY' : activeSection;
    form.stockStatus.value = 'in_stock';
    form.priceTagChecked.checked = true;
    updateImagePreview('');
    document.getElementById('btn-delete-item').classList.add('hidden');
  }
}

function updateImagePreview(src) {
  const preview = document.getElementById('image-preview-container');
  const imgEl = document.getElementById('image-preview-img');
  const placeholder = document.getElementById('image-preview-placeholder');

  if (src) {
    imgEl.src = src;
    imgEl.classList.remove('hidden');
    placeholder.classList.add('hidden');
  } else {
    imgEl.src = '';
    imgEl.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }
}

// Close Modals
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.classList.add('hidden');
    m.classList.remove('flex');
  });
}

// WhatsApp Report Modal
function openReportModal() {
  const modal = document.getElementById('report-modal');
  const reportTextArea = document.getElementById('report-text-content');
  if (!modal || !reportTextArea) return;

  const report = generateWhatsAppReport();
  reportTextArea.value = report;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// Setup Event Listeners
function setupEventListeners() {
  // Search input with instant feedback
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('btn-clear-search');

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearSearchBtn?.classList.toggle('hidden', searchQuery.length === 0);
    renderApp();
  });

  clearSearchBtn?.addEventListener('click', () => {
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    renderApp();
  });

  // Sort Selector
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.value = sortBy;
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      renderApp();
    });
  }

  // Add Item Button
  document.getElementById('btn-add-item')?.addEventListener('click', () => {
    openAddModal();
  });

  // Reset Daily Check confirmation
  document.getElementById('btn-reset-daily')?.addEventListener('click', () => {
    if (confirm('Mulakan semakan baru? Ini akan menetapkan semula status "Telah Semak" untuk semua barang.')) {
      resetDailyCheck();
    }
  });

  // Form submission
  const itemForm = document.getElementById('item-form');
  itemForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(itemForm);

    const name = formData.get('name')?.toString().trim();
    if (!name) {
      alert('Sila masukkan nama barangan!');
      return;
    }

    const newItemData = {
      name,
      aliasMalay: formData.get('aliasMalay')?.toString().trim() || '',
      section: formData.get('section')?.toString() || 'DIY',
      category: formData.get('category')?.toString().trim() || 'General',
      shelfLocation: formData.get('shelfLocation')?.toString().trim() || 'Unassigned',
      price: parseFloat(formData.get('price')?.toString()) || 0,
      expiryDate: formData.get('expiryDate')?.toString() || '',
      stockStatus: formData.get('stockStatus')?.toString() || 'in_stock',
      priceTagChecked: itemForm.priceTagChecked.checked,
      notes: formData.get('notes')?.toString().trim() || '',
      image: formData.get('imageUrl')?.toString().trim() || '',
      checkedToday: true,
      lastCheckedTime: new Date().toISOString()
    };

    if (editingItemId) {
      // Update existing
      const idx = items.findIndex(i => i.id === editingItemId);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...newItemData };
        showToast(`Disimpan: ${newItemData.name}`, 'success');
      }
    } else {
      // Create new
      const newId = `${newItemData.section.toLowerCase()}-${Date.now().toString(36)}`;
      items.unshift({
        id: newId,
        ...newItemData,
        stockQty: newItemData.stockStatus === 'in_stock' ? 10 : (newItemData.stockStatus === 'low_stock' ? 2 : 0)
      });
      showToast(`Barangan baru ditambah!`, 'success');
    }

    saveData();
    closeAllModals();
    renderApp();
  });

  // Delete item button
  document.getElementById('btn-delete-item')?.addEventListener('click', () => {
    if (!editingItemId) return;
    const it = items.find(i => i.id === editingItemId);
    if (!it) return;

    if (confirm(`Padam barangan "${it.name}" dari sistem?`)) {
      items = items.filter(i => i.id !== editingItemId);
      saveData();
      closeAllModals();
      renderApp();
      showToast(`Barangan telah dipadam`, 'info');
    }
  });

  // Photo URL input live preview
  const imageUrlInput = document.getElementById('image-url-input');
  imageUrlInput?.addEventListener('input', (e) => {
    updateImagePreview(e.target.value);
  });

  // Local File Upload photo preview (base64 reader for localStorage persistence)
  const fileInput = document.getElementById('image-file-input');
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Saiz gambar terlalu besar (maksimum 2MB)!');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result;
        if (base64 && imageUrlInput) {
          imageUrlInput.value = base64;
          updateImagePreview(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // Close modals on cancel or backdrop click
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeAllModals());
  });

  // Copy WhatsApp text to clipboard
  document.getElementById('btn-copy-report')?.addEventListener('click', () => {
    const text = document.getElementById('report-text-content')?.value;
    if (!text) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('📋 Laporan disalin ke papan keratan (Clipboard)!', 'success');
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  });

  function fallbackCopy(text) {
    const ta = document.getElementById('report-text-content');
    ta.focus();
    ta.select();
    document.execCommand('copy');
    showToast('📋 Laporan disalin!', 'success');
  }

  // Direct WhatsApp Button (opens WhatsApp with prefilled message)
  document.getElementById('btn-share-whatsapp')?.addEventListener('click', () => {
    const text = document.getElementById('report-text-content')?.value;
    if (!text) return;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  });

  // Backup / Settings Modal
  document.getElementById('btn-open-settings')?.addEventListener('click', () => {
    const modal = document.getElementById('settings-modal');
    modal?.classList.remove('hidden');
    modal?.classList.add('flex');
  });

  // Export JSON file
  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `runcitcheck-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Fail sandaran JSON berjaya dimuat turun!', 'success');
  });

  // Import JSON file
  const importFileInput = document.getElementById('import-file-input');
  importFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          if (confirm(`Muat naik ${parsed.length} barangan daripada fail sandaran ini? Data sedia ada akan digantikan.`)) {
            items = parsed;
            saveData();
            closeAllModals();
            renderApp();
            showToast('Data sandaran berjaya dipulihkan!', 'success');
          }
        } else {
          alert('Format fail JSON tidak sah!');
        }
      } catch (err) {
        alert('Gagal membaca fail JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  // Reset to default sample data button
  document.getElementById('btn-reset-sample-data')?.addEventListener('click', () => {
    if (confirm('Kembalikan ke data asal barangan Mini-Mart Malaysia?')) {
      items = getInitialItems();
      saveData();
      closeAllModals();
      renderApp();
      showToast('Data asal Mini-Mart telah dipulihkan!', 'success');
    }
  });

  // Sound toggle button
  const soundToggleBtn = document.getElementById('btn-toggle-sound');
  soundToggleBtn?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? '🔊 Bunyi: HIDUP' : '🔇 Bunyi: SENYAP';
    showToast(soundEnabled ? 'Bunyi diaktifkan' : 'Bunyi disenyapkan', 'info');
  });
}

// Main Render Function
export function renderApp() {
  renderSummary();
  renderSectionTabs();
  renderFilterChips();
  renderItemCards();
}

// Initial Boot
window.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  renderApp();
});
