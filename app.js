import { getInitialItems } from './sample-data.js';
import { getProductSvg } from './icons.js';
import { translations } from './i18n.js';

// Application State
const STORAGE_KEY = 'runcitcheck_items_v3';
const LANG_KEY = 'runcitcheck_lang_v1';

let currentLang = localStorage.getItem(LANG_KEY) || 'en'; // 'en' | 'my'
let items = [];
let activeSection = 'ALL'; // 'ALL' | 'DIY' | 'Medicine'
let activeFilter = 'all'; // 'all' | 'low_or_out' | 'expiring' | 'missing_tag' | 'unchecked'
let searchQuery = '';
let sortBy = 'location'; // Default to rack location for walk-through aisle auditing
let soundEnabled = true;

// Translation helper
export function t(key) {
  const dict = translations[currentLang] || translations.en;
  return dict[key] || translations.en[key] || key;
}

// Language Switcher
export function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'my') return;
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  updateStaticTexts();
  renderApp();
  showToast(currentLang === 'my' ? 'ဘာသာစကားကို မြန်မာဘာသာသို့ ပြောင်းလဲပြီးပါပြီ' : 'Language switched to English', 'info');
}

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
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'cycle_yellow') {
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'cycle_red') {
        osc.frequency.setValueAtTime(329.63, now);
        osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.1);
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
      // Audio not supported
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
    const absDays = Math.abs(daysLeft);
    return {
      hasExpiry: true,
      daysLeft,
      status: 'expired',
      isExpiringSoon: true,
      label: currentLang === 'my' ? `သက်တမ်းကုန်ပြီ (${absDays}ရက်)` : `${t('expiredBadge')} (${absDays}d ago)`,
      badgeClass: 'bg-red-600 text-white font-extrabold',
      desc: currentLang === 'my' ? `${absDays} ရက် လွန်သွားပါပြီ (${expiryDateStr})` : `Expired ${absDays}d ago (${expiryDateStr})`
    };
  } else if (daysLeft <= 30) {
    return {
      hasExpiry: true,
      daysLeft,
      status: 'critical',
      isExpiringSoon: true,
      label: currentLang === 'my' ? `အရေးပေါ် (${daysLeft}ရက် လို)` : `${t('criticalBadge')} (${daysLeft}d left)`,
      badgeClass: 'bg-rose-500 text-white animate-subtle-pulse font-extrabold',
      desc: currentLang === 'my' ? `${daysLeft} ရက် လိုသေး (${expiryDateStr})` : `${daysLeft} days left (${expiryDateStr})`
    };
  } else if (daysLeft <= 90) {
    return {
      hasExpiry: true,
      daysLeft,
      status: 'warning',
      isExpiringSoon: true,
      label: currentLang === 'my' ? `သက်တမ်းကုန်ခါနီး (${daysLeft}ရက်)` : `${t('expiringBadge')} (${daysLeft}d left)`,
      badgeClass: 'bg-amber-500 text-white font-bold',
      desc: currentLang === 'my' ? `${daysLeft} ရက် လိုသေး (${expiryDateStr})` : `${daysLeft} days left (${expiryDateStr})`
    };
  } else {
    return {
      hasExpiry: true,
      daysLeft,
      status: 'safe',
      isExpiringSoon: false,
      label: `Exp: ${expiryDateStr}`,
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
      desc: `Safe: ${expiryDateStr}`
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
    showToast(currentLang === 'my' ? 'ဒေတာ သိမ်းဆည်းရန် မအောင်မြင်ပါ!' : 'Failed to save data!', 'error');
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

  const itemName = currentLang === 'my' && item.aliasBurmese ? item.aliasBurmese : item.name;

  if (current === 'in_stock') {
    next = 'low_stock';
    soundType = 'cycle_yellow';
    toastMsg = currentLang === 'my' ? `🟡 ${itemName}: ${t('lowStock')}` : `🟡 ${itemName}: LOW STOCK`;
  } else if (current === 'low_stock') {
    next = 'out_of_stock';
    soundType = 'cycle_red';
    toastMsg = currentLang === 'my' ? `🔴 ${itemName}: ${t('outOfStock')}` : `🔴 ${itemName}: OUT OF STOCK`;
  } else {
    next = 'in_stock';
    soundType = 'cycle_green';
    toastMsg = currentLang === 'my' ? `🟢 ${itemName}: ${t('inStock')}` : `🟢 ${itemName}: IN STOCK`;
  }

  item.stockStatus = next;
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

  const itemName = currentLang === 'my' && item.aliasBurmese ? item.aliasBurmese : item.name;

  if (item.priceTagChecked) {
    showToast(currentLang === 'my' ? `🏷️ "${itemName}" ဈေးနှုန်းကတ်ပြား ရှိပါသည်` : `🏷️ Price tag for "${item.name}" verified OK`, 'success');
  } else {
    showToast(currentLang === 'my' ? `⚠️ "${itemName}" ဈေးနှုန်းကတ် မရှိပါ` : `⚠️ Price tag for "${item.name}" marked MISSING`, 'warning');
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

  const itemName = currentLang === 'my' && item.aliasBurmese ? item.aliasBurmese : item.name;
  if (item.checkedToday) {
    showToast(currentLang === 'my' ? `✓ စစ်ဆေးပြီး: ${itemName}` : `✓ Audited: ${item.name}`, 'info');
  } else {
    showToast(currentLang === 'my' ? `စစ်ဆေးမှု ပယ်ဖျက်သည်: ${itemName}` : `Unmarked: ${item.name}`, 'info');
  }
}

// Reset Daily Check for all items
export function resetDailyCheck() {
  items.forEach(i => {
    i.checkedToday = false;
  });
  saveData();
  renderApp();
  showToast(t('toastResetShift'), 'info');
}

// Filter and Sort Items
function getFilteredItems() {
  return items.filter(item => {
    // 1. Section Filter
    if (activeSection !== 'ALL' && item.section !== activeSection) {
      return false;
    }

    // 2. Search Query (name, burmese alias, english alias, category, shelfLocation, notes)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const match =
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.aliasBurmese && item.aliasBurmese.toLowerCase().includes(q)) ||
        (item.aliasEnglish && item.aliasEnglish.toLowerCase().includes(q)) ||
        (item.aliasMalay && item.aliasMalay.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.categoryBurmese && item.categoryBurmese.toLowerCase().includes(q)) ||
        (item.shelfLocation && item.shelfLocation.toLowerCase().includes(q)) ||
        (item.shelfLocationBurmese && item.shelfLocationBurmese.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        (item.notesBurmese && item.notesBurmese.toLowerCase().includes(q));
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
      const locA = currentLang === 'my' ? (a.shelfLocationBurmese || a.shelfLocation || '') : (a.shelfLocation || '');
      const locB = currentLang === 'my' ? (b.shelfLocationBurmese || b.shelfLocation || '') : (b.shelfLocation || '');
      return locA.localeCompare(locB, undefined, { numeric: true, sensitivity: 'base' });
    } else if (sortBy === 'name') {
      const nameA = currentLang === 'my' && a.aliasBurmese ? a.aliasBurmese : a.name;
      const nameB = currentLang === 'my' && b.aliasBurmese ? b.aliasBurmese : b.name;
      return nameA.localeCompare(nameB);
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

// Generate Boss WhatsApp Report in English or Burmese
export function generateWhatsAppReport() {
  const now = new Date();
  const dateStr = now.toLocaleDateString(currentLang === 'my' ? 'my-MM' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString(currentLang === 'my' ? 'my-MM' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  const total = items.length;
  const checked = items.filter(i => i.checkedToday).length;
  const outOfStockList = items.filter(i => i.stockStatus === 'out_of_stock');
  const lowStockList = items.filter(i => i.stockStatus === 'low_stock');
  const expiringSoonList = items.filter(i => {
    const exp = getExpiryInfo(i.expiryDate);
    return exp.hasExpiry && exp.daysLeft <= 90;
  });
  const missingTagList = items.filter(i => !i.priceTagChecked);

  let text = `${t('waReportHeader')}\n`;
  text += `${t('waStore')}\n`;
  text += `📅 *Date/Time*: ${dateStr} | ${timeStr}\n`;
  text += `${t('waAuditProgress')}: ${checked}/${total} (${Math.round((checked / total) * 100)}% ${t('waCompleted')})\n`;
  text += `--------------------------------------\n\n`;

  // 1. Out of stock
  text += `${t('waOutOfStockTitle')} (${outOfStockList.length} items):\n`;
  if (outOfStockList.length === 0) {
    text += `  ${t('waNoOutOfStock')}\n`;
  } else {
    outOfStockList.forEach((it, idx) => {
      const alias = currentLang === 'my' && it.aliasBurmese ? it.aliasBurmese : (it.aliasEnglish || it.aliasMalay || '');
      const shelf = currentLang === 'my' && it.shelfLocationBurmese ? it.shelfLocationBurmese : it.shelfLocation;
      text += `  ${idx + 1}. *${it.name}*${alias ? ` (${alias})` : ''}\n`;
      text += `     📍 ${shelf} | ${formatRM(it.price)}\n`;
    });
  }
  text += `\n`;

  // 2. Low stock
  text += `${t('waLowStockTitle')} (${lowStockList.length} items):\n`;
  if (lowStockList.length === 0) {
    text += `  ${t('waNoLowStock')}\n`;
  } else {
    lowStockList.forEach((it, idx) => {
      const shelf = currentLang === 'my' && it.shelfLocationBurmese ? it.shelfLocationBurmese : it.shelfLocation;
      const qtyLabel = currentLang === 'my' ? `လက်ကျန်: ${it.stockQty || 'နည်း'}` : `Qty: ${it.stockQty || 'Low'}`;
      text += `  ${idx + 1}. *${it.name}* (${qtyLabel})\n`;
      text += `     📍 ${shelf}\n`;
    });
  }
  text += `\n`;

  // 3. Expiring Soon
  text += `${t('waExpiringTitle')} (${expiringSoonList.length} items):\n`;
  if (expiringSoonList.length === 0) {
    text += `  ${t('waNoExpiring')}\n`;
  } else {
    expiringSoonList.forEach((it, idx) => {
      const exp = getExpiryInfo(it.expiryDate);
      const alertEmoji = exp.daysLeft <= 30 ? '🚨' : '⏳';
      const shelf = currentLang === 'my' && it.shelfLocationBurmese ? it.shelfLocationBurmese : it.shelfLocation;
      const daysText = currentLang === 'my' 
        ? (exp.daysLeft < 0 ? 'သက်တမ်းကုန်ပြီ' : `${exp.daysLeft} ရက် လိုသေး`)
        : (exp.daysLeft < 0 ? 'EXPIRED' : `${exp.daysLeft}d left`);
      text += `  ${idx + 1}. ${alertEmoji} *${it.name}*\n`;
      text += `     Exp: ${it.expiryDate} (${daysText})\n`;
      text += `     📍 ${shelf}\n`;
    });
  }
  text += `\n`;

  // 4. Missing Price Tags
  text += `${t('waMissingTagsTitle')} (${missingTagList.length} items):\n`;
  if (missingTagList.length === 0) {
    text += `  ${t('waNoMissingTags')}\n`;
  } else {
    missingTagList.forEach((it, idx) => {
      const shelf = currentLang === 'my' && it.shelfLocationBurmese ? it.shelfLocationBurmese : it.shelfLocation;
      text += `  ${idx + 1}. *${it.name}* -> *${formatRM(it.price)}*\n`;
      text += `     📍 ${shelf}\n`;
    });
  }

  text += `\n--------------------------------------\n`;
  text += `${t('waFooter')}`;

  return text;
}

// Update Static HTML Elements on language toggle
function updateStaticTexts() {
  // App Title & Subtitle
  const titleEl = document.getElementById('header-app-title');
  const subEl = document.getElementById('header-app-subtitle');
  const badgeEl = document.getElementById('header-badge-country');
  const addBtnText = document.getElementById('btn-add-item-text');
  const langPillText = document.getElementById('current-lang-text');
  const searchInput = document.getElementById('search-input');
  const quickReportBtnText = document.getElementById('btn-quick-report-text');

  if (titleEl) titleEl.textContent = t('appTitle');
  if (subEl) subEl.textContent = t('appSubtitle');
  if (badgeEl) badgeEl.textContent = t('badgeCountry');
  if (addBtnText) addBtnText.textContent = t('addItemBtn');
  if (quickReportBtnText) quickReportBtnText.textContent = t('copyReportBoss');
  if (langPillText) langPillText.textContent = currentLang === 'my' ? '🇲🇲 မြန်မာ' : '🇬🇧 EN';
  if (searchInput) searchInput.placeholder = t('searchPlaceholder');

  // Sort dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.innerHTML = `
      <option value="location">${t('sortLocation')}</option>
      <option value="expiry">${t('sortExpiry')}</option>
      <option value="status">${t('sortStatus')}</option>
      <option value="name">${t('sortName')}</option>
      <option value="default">${t('sortDefault')}</option>
    `;
    sortSelect.value = sortBy;
  }

  // Update Settings Modal Texts
  const settingsTitleEl = document.getElementById('settings-modal-title');
  const settingsSubEl = document.getElementById('settings-modal-sub');
  const labelSoundEl = document.getElementById('label-sound');
  const descSoundEl = document.getElementById('desc-sound');
  const btnToggleSound = document.getElementById('btn-toggle-sound');
  const labelBackupEl = document.getElementById('label-backup-title');
  const descBackupEl = document.getElementById('desc-backup-desc');
  const btnExportJsonText = document.getElementById('btn-export-json-text');
  const btnImportJsonText = document.getElementById('btn-import-json-text');
  const labelResetSampleEl = document.getElementById('label-reset-sample');
  const descResetSampleEl = document.getElementById('desc-reset-sample');
  const btnResetSampleText = document.getElementById('btn-reset-sample-text');
  const btnCloseSettings = document.getElementById('btn-close-settings');

  if (settingsTitleEl) settingsTitleEl.textContent = t('settingsTitle');
  if (settingsSubEl) settingsSubEl.textContent = t('settingsSubtitle');
  if (labelSoundEl) labelSoundEl.textContent = t('labelSound');
  if (descSoundEl) descSoundEl.textContent = t('soundDesc');
  if (btnToggleSound) btnToggleSound.textContent = soundEnabled ? t('soundOn') : t('soundOff');
  if (labelBackupEl) labelBackupEl.textContent = t('backupTitle');
  if (descBackupEl) descBackupEl.textContent = t('backupDesc');
  if (btnExportJsonText) btnExportJsonText.textContent = t('btnExportJson');
  if (btnImportJsonText) btnImportJsonText.textContent = t('btnImportJson');
  if (labelResetSampleEl) labelResetSampleEl.textContent = t('resetSampleTitle');
  if (descResetSampleEl) descResetSampleEl.textContent = t('resetSampleDesc');
  if (btnResetSampleText) btnResetSampleText.textContent = t('btnResetSample');
  if (btnCloseSettings) btnCloseSettings.textContent = t('btnClose');

  // Update WhatsApp Modal Texts
  const reportModalTitle = document.getElementById('report-modal-title');
  const reportModalSub = document.getElementById('report-modal-sub');
  const reportModalDesc = document.getElementById('report-modal-desc');
  const btnCopyReportText = document.getElementById('btn-copy-report-text');
  const btnShareWhatsappText = document.getElementById('btn-share-whatsapp-text');

  if (reportModalTitle) reportModalTitle.textContent = t('reportTitle');
  if (reportModalSub) reportModalSub.textContent = t('reportSubtitle');
  if (reportModalDesc) reportModalDesc.textContent = t('reportDesc');
  if (btnCopyReportText) btnCopyReportText.textContent = t('btnCopyReport');
  if (btnShareWhatsappText) btnShareWhatsappText.textContent = t('btnShareWhatsapp');
}

// Render Summary & KPI Cards
function renderSummary() {
  const stats = getStats();
  const summaryEl = document.getElementById('daily-summary-container');
  if (!summaryEl) return;

  summaryEl.innerHTML = `
    <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-4 shadow-lg border border-slate-700/60 relative overflow-hidden">
      <!-- Background glow -->
      <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <!-- Top Header Row -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2.5">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm border border-emerald-500/30">
            ✓
          </span>
          <div>
            <h2 class="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">${t('dailyCheckTitle')}</h2>
            <div class="text-sm font-extrabold flex items-center gap-2">
              <span>${stats.checked} / ${stats.total} ${t('itemsChecked')}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${stats.percent === 100 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}">
                ${stats.percent}%
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <button id="btn-open-report" class="active-press inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
            <span>${t('sendToBossBtn')}</span>
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
          <span class="text-[10px] uppercase font-bold tracking-tight text-slate-400 mt-0.5">${t('kpiOutOfStock')}</span>
        </button>

        <!-- Low stock -->
        <button data-filter-kpi="low_or_out" class="active-press flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border ${activeFilter === 'low_or_out' ? 'border-amber-500 bg-amber-950/40 text-amber-300' : 'border-slate-700/80 text-slate-300'} transition-all">
          <span class="text-sm font-black text-amber-400">${stats.lowStock}</span>
          <span class="text-[10px] uppercase font-bold tracking-tight text-slate-400 mt-0.5">${t('kpiLowStock')}</span>
        </button>

        <!-- Expiring Soon -->
        <button data-filter-kpi="expiring" class="active-press flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border ${activeFilter === 'expiring' ? 'border-orange-500 bg-orange-950/40 text-orange-300 ring-2 ring-orange-500/30' : 'border-slate-700/80 text-slate-300'} transition-all">
          <span class="text-sm font-black text-orange-400">${stats.expiringSoon}</span>
          <span class="text-[10px] uppercase font-bold tracking-tight text-slate-400 mt-0.5">${t('kpiExpiringSoon')}</span>
        </button>

        <!-- Missing Tag -->
        <button data-filter-kpi="missing_tag" class="active-press flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border ${activeFilter === 'missing_tag' ? 'border-yellow-400 bg-yellow-950/40 text-yellow-300 ring-2 ring-yellow-400/30' : 'border-slate-700/80 text-slate-300'} transition-all">
          <span class="text-sm font-black text-yellow-300">${stats.missingPriceTag}</span>
          <span class="text-[10px] uppercase font-bold tracking-tight text-slate-400 mt-0.5">${t('kpiMissingTag')}</span>
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
    { id: 'all', label: t('chipAll') },
    { id: 'low_or_out', label: t('chipLowOrOut') },
    { id: 'expiring', label: t('chipExpiring') },
    { id: 'missing_tag', label: t('chipMissingTag') },
    { id: 'unchecked', label: t('chipUnchecked') }
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
  const hintText = document.getElementById('search-result-hint');
  if (!container) return;

  const filtered = getFilteredItems();
  if (countBadge) {
    countBadge.textContent = `${filtered.length} ${t('itemsFound')}`;
  }
  if (hintText) {
    hintText.textContent = t('tapToCycleHint');
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
        <div class="text-4xl mb-3">🔍</div>
        <h3 class="text-sm font-bold text-slate-800">${t('noItemsTitle')}</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          ${t('noItemsDesc')}
        </p>
        <button id="btn-reset-filters-empty" class="active-press mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow">
          ${t('resetFilterBtn')}
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
    let statusText = `🟢 ${t('inStock')}`;
    let statusBorderClass = '';

    if (item.stockStatus === 'low_stock') {
      statusBadgeClass = 'bg-amber-50 text-amber-900 border-amber-300';
      statusText = `🟡 ${t('lowStock')}`;
    } else if (item.stockStatus === 'out_of_stock') {
      statusBadgeClass = 'bg-rose-50 text-rose-800 border-rose-300';
      statusText = `🔴 ${t('outOfStock')}`;
      statusBorderClass = 'card-out-of-stock';
    }

    if (exp.status === 'critical' || exp.status === 'expired') {
      statusBorderClass = 'card-critical-expiry';
    } else if (exp.status === 'warning') {
      statusBorderClass = statusBorderClass || 'card-warning-expiry';
    }

    // Checked Today pill styling
    const checkedPill = item.checkedToday
      ? `<span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">✓ ${t('checkedToday')}</span>`
      : `<span class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">${t('notChecked')}</span>`;

    // Localized fields based on current language
    const displayedAlias = currentLang === 'my'
      ? (item.aliasBurmese || item.aliasEnglish || item.aliasMalay || '')
      : (item.aliasEnglish || item.aliasBurmese || item.aliasMalay || '');

    const displayedCategory = currentLang === 'my' && item.categoryBurmese ? item.categoryBurmese : item.category;
    const displayedShelf = currentLang === 'my' && item.shelfLocationBurmese ? item.shelfLocationBurmese : item.shelfLocation;
    const displayedNotes = currentLang === 'my' && item.notesBurmese ? item.notesBurmese : item.notes;

    // Visual thumbnail
    const svgIllustration = getProductSvg(item.svgIcon, item.section);

    return `
      <div data-item-id="${item.id}" class="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/90 relative transition-all ${statusBorderClass} ${item.checkedToday ? 'card-checked bg-slate-50/40' : ''}">
        
        <!-- Top Metadata Row: Section + Shelf Location + Checked Pill -->
        <div class="flex items-center justify-between gap-1.5 mb-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <!-- Section Badge -->
            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${item.section === 'DIY' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-rose-100 text-rose-900 border border-rose-200'}">
              ${item.section === 'DIY' ? (currentLang === 'my' ? '🔧 DIY' : '🔧 DIY') : (currentLang === 'my' ? '💊 ဆေးဝါး' : '💊 Med')}
            </span>

            <!-- Shelf Location Badge (Prominent for aisle walking) -->
            <span class="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-800 text-slate-100 px-2.5 py-0.5 rounded-md shadow-xs">
              <svg class="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
              ${displayedShelf}
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
            
            ${displayedAlias ? `
              <p class="text-[11px] font-semibold text-emerald-800 mt-0.5 line-clamp-1 italic">
                "${displayedAlias}"
              </p>
            ` : ''}

            <div class="flex items-center gap-2 mt-1">
              <span class="text-[11px] text-slate-500 font-medium">${displayedCategory}</span>
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
        ${displayedNotes ? `
          <div class="mt-2 text-[11px] text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-150 flex items-start gap-1.5">
            <span class="text-slate-400">📝</span>
            <span class="line-clamp-2">${displayedNotes}</span>
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
              <span class="truncate">${item.priceTagChecked ? t('tagOk') : t('tagMissing')}</span>
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
            <span>${item.checkedToday ? t('checkedToday') : t('markChecked')}</span>
          </button>

          <span class="text-[10px] text-slate-400">
            ${item.lastCheckedTime ? `${t('checkedTime')}: ${new Date(item.lastCheckedTime).toLocaleTimeString(currentLang === 'my' ? 'my-MM' : 'en-US', { hour: '2-digit', minute: '2-digit' })}` : ''}
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
    { id: 'ALL', label: t('tabAll') },
    { id: 'DIY', label: t('tabDiy') },
    { id: 'Medicine', label: t('tabMed') }
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
  const displayedAlias = currentLang === 'my' && item.aliasBurmese ? item.aliasBurmese : (item.aliasEnglish || item.aliasMalay || '');
  const displayedShelf = currentLang === 'my' && item.shelfLocationBurmese ? item.shelfLocationBurmese : item.shelfLocation;
  const displayedCategory = currentLang === 'my' && item.categoryBurmese ? item.categoryBurmese : item.category;

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
          📍 ${displayedShelf}
        </span>
      </div>

      <div class="p-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[10px] uppercase font-black px-2 py-0.5 rounded ${item.section === 'DIY' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}">
            ${item.section}
          </span>
          <span class="text-xs font-bold text-slate-500">${displayedCategory}</span>
        </div>
        <h3 class="text-sm font-extrabold text-slate-900">${item.name}</h3>
        ${displayedAlias ? `<p class="text-xs font-semibold text-emerald-800 mt-0.5">"${displayedAlias}"</p>` : ''}

        <div class="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span class="price-tag text-base font-black text-slate-900">${formatRM(item.price)}</span>
          <span class="text-xs font-bold px-2.5 py-1 rounded-lg ${item.stockStatus === 'in_stock' ? 'bg-emerald-100 text-emerald-800' : (item.stockStatus === 'low_stock' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')}">
            ${item.stockStatus === 'in_stock' ? `🟢 ${t('inStock')}` : (item.stockStatus === 'low_stock' ? `🟡 ${t('lowStock')}` : `🔴 ${t('outOfStock')}`)}
          </span>
        </div>

        <button id="btn-edit-from-photo" class="active-press mt-3 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow">
          ${t('editTitle')}
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
  document.getElementById('form-modal-title').textContent = t('addTitle');
  document.getElementById('form-modal-subtitle').textContent = t('formSubtitle');
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}

export function openEditModal(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  editingItemId = id;
  populateItemForm(item);
  const modal = document.getElementById('item-form-modal');
  document.getElementById('form-modal-title').textContent = t('editTitle');
  document.getElementById('form-modal-subtitle').textContent = t('formSubtitle');
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}

function populateItemForm(item) {
  const form = document.getElementById('item-form');
  if (!form) return;

  // Localized form labels
  document.getElementById('lbl-form-section').textContent = t('labelSection');
  document.getElementById('lbl-form-diy').textContent = t('sectionDiy');
  document.getElementById('lbl-form-med').textContent = t('sectionMed');
  document.getElementById('lbl-form-name').textContent = t('labelOfficialName');
  document.getElementById('lbl-form-alias').textContent = t('labelAlias');
  document.getElementById('lbl-form-category').textContent = t('labelCategory');
  document.getElementById('lbl-form-shelf').textContent = t('labelShelf');
  document.getElementById('lbl-form-price').textContent = t('labelPrice');
  document.getElementById('lbl-form-expiry').textContent = t('labelExpiry');
  document.getElementById('lbl-form-stock-status').textContent = t('labelStockStatus');
  document.getElementById('lbl-status-in-stock').textContent = t('inStock');
  document.getElementById('lbl-status-low-stock').textContent = t('lowStock');
  document.getElementById('lbl-status-out-stock').textContent = t('outOfStock');
  document.getElementById('lbl-form-tag-check').textContent = t('labelTagCheck');
  document.getElementById('desc-form-tag-check').textContent = t('tagCheckDesc');
  document.getElementById('lbl-form-photo-ref').textContent = t('labelPhotoRef');
  document.getElementById('btn-photo-upload-text').textContent = t('photoUploadBtn');
  document.getElementById('lbl-form-notes').textContent = t('labelNotes');
  document.getElementById('btn-cancel-item').textContent = t('btnCancel');
  document.getElementById('btn-save-item').textContent = t('btnSave');
  document.getElementById('btn-delete-item').textContent = t('btnDelete');

  if (item) {
    form.name.value = item.name || '';
    form.alias.value = currentLang === 'my' && item.aliasBurmese ? item.aliasBurmese : (item.aliasEnglish || item.aliasMalay || '');
    form.section.value = item.section || 'DIY';
    form.category.value = currentLang === 'my' && item.categoryBurmese ? item.categoryBurmese : (item.category || '');
    form.shelfLocation.value = currentLang === 'my' && item.shelfLocationBurmese ? item.shelfLocationBurmese : (item.shelfLocation || '');
    form.price.value = item.price || '';
    form.expiryDate.value = item.expiryDate || '';
    form.stockStatus.value = item.stockStatus || 'in_stock';
    form.priceTagChecked.checked = item.priceTagChecked ?? true;
    form.notes.value = currentLang === 'my' && item.notesBurmese ? item.notesBurmese : (item.notes || '');
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
  // Language Switch Pill in Header
  const langToggleBtn = document.getElementById('btn-toggle-lang');
  langToggleBtn?.addEventListener('click', () => {
    const nextLang = currentLang === 'en' ? 'my' : 'en';
    setLanguage(nextLang);
  });

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
    if (confirm(t('confirmResetShift'))) {
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
      alert(currentLang === 'my' ? 'ပစ္စည်းအမည် ထည့်သွင်းပေးပါ!' : 'Please enter item name!');
      return;
    }

    const aliasVal = formData.get('alias')?.toString().trim() || '';

    const newItemData = {
      name,
      aliasBurmese: currentLang === 'my' ? aliasVal : '',
      aliasEnglish: currentLang === 'en' ? aliasVal : '',
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
        items[idx] = { 
          ...items[idx], 
          ...newItemData,
          aliasBurmese: currentLang === 'my' ? aliasVal : (items[idx].aliasBurmese || ''),
          aliasEnglish: currentLang === 'en' ? aliasVal : (items[idx].aliasEnglish || '')
        };
        showToast(t('toastItemSaved'), 'success');
      }
    } else {
      // Create new
      const newId = `${newItemData.section.toLowerCase()}-${Date.now().toString(36)}`;
      items.unshift({
        id: newId,
        ...newItemData,
        stockQty: newItemData.stockStatus === 'in_stock' ? 10 : (newItemData.stockStatus === 'low_stock' ? 2 : 0)
      });
      showToast(t('toastItemSaved'), 'success');
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

    if (confirm(t('confirmDelete'))) {
      items = items.filter(i => i.id !== editingItemId);
      saveData();
      closeAllModals();
      renderApp();
      showToast(t('toastItemDeleted'), 'info');
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
        alert(currentLang === 'my' ? 'ဖိုင်ဆိုဒ် 2MB ထက် ကြီးနေပါသည်!' : 'Image file too large (max 2MB)!');
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
        showToast(t('toastReportCopied'), 'success');
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
    showToast(t('toastReportCopied'), 'success');
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
    downloadAnchor.setAttribute("download", `stock-ranger-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(t('toastBackupSuccess'), 'success');
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
          if (confirm(t('confirmRestore'))) {
            items = parsed;
            saveData();
            closeAllModals();
            renderApp();
            showToast(t('toastRestoreSuccess'), 'success');
          }
        } else {
          alert('Invalid JSON file format!');
        }
      } catch (err) {
        alert('Failed to read JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  // Reset to default sample data button
  document.getElementById('btn-reset-sample-data')?.addEventListener('click', () => {
    if (confirm(t('confirmResetSample'))) {
      items = getInitialItems();
      saveData();
      closeAllModals();
      renderApp();
      showToast(currentLang === 'my' ? 'နမူနာဒေတာများကို ပြန်လည်ရယူပြီးပါပြီ!' : 'Sample data has been restored!', 'success');
    }
  });

  // Sound toggle button
  const soundToggleBtn = document.getElementById('btn-toggle-sound');
  soundToggleBtn?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? t('soundOn') : t('soundOff');
    showToast(soundEnabled ? 'Audio ON' : 'Audio OFF', 'info');
  });

  // Language buttons in Settings Modal
  document.getElementById('btn-lang-en')?.addEventListener('click', () => setLanguage('en'));
  document.getElementById('btn-lang-my')?.addEventListener('click', () => setLanguage('my'));
}

// Main Render Function
export function renderApp() {
  updateStaticTexts();
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
