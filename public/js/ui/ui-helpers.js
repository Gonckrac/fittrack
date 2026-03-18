// ─── TOAST ───────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  if (t._undoTimer) clearTimeout(t._undoTimer);
  t._undoTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

function showUndoToast(msg, undoFn) {
  const t = document.getElementById('toast');
  t.innerHTML = '<span>' + msg + '</span>' +
    '<button onclick="_undoToastAction()" style="margin-left:12px;background:var(--accent);border:none;border-radius:8px;padding:3px 10px;font-size:12px;font-weight:700;color:#fff;cursor:pointer">Deshacer</button>';
  t.classList.add('show');
  window._currentUndoFn = undoFn;
  if (t._undoTimer) clearTimeout(t._undoTimer);
  t._undoTimer = setTimeout(function() {
    t.classList.remove('show');
    window._currentUndoFn = null;
  }, 4500);
}

function _undoToastAction() {
  const t = document.getElementById('toast');
  t.classList.remove('show');
  if (typeof window._currentUndoFn === 'function') {
    window._currentUndoFn();
    window._currentUndoFn = null;
  }
}

// ─── THEME SYSTEM ─────────────────────────────────────────────────
const THEME_NAMES = {
  dark:'Noche', rose:'Rosa', lavender:'Lavanda', emerald:'Esmeralda',
  sunset:'Atardecer', ocean:'Océano', crimson:'Carmesí', gold:'Dorado',
  steel:'Acero', mint:'Menta', violet:'Violeta'
};
let currentTheme = localStorage.getItem('fittrack_theme') || 'dark';
let currentLayout = localStorage.getItem('fittrack_layout') || 'terra';

function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('fittrack_theme', theme);
  // Solo aplicar color-theme si el layout es el oscuro clásico
  if (currentLayout === 'dark') {
    document.body.className = theme === 'dark' ? '' : 'theme-' + theme;
  }
  const dot = document.getElementById('themePickerDot');
  if (dot) { setTimeout(() => { dot.style.background = 'var(--accent)'; }, 50); }
  document.querySelectorAll('.theme-card').forEach(c => {
    c.classList.toggle('active', c.dataset.theme === theme);
  });
  closeThemePicker();
  showToast('🎨 ' + (THEME_NAMES[theme] || theme));
}

function applyLayout(layout) {
  currentLayout = layout;
  localStorage.setItem('fittrack_layout', layout);
  // Limpiar clases de html (early-apply) y body
  document.documentElement.classList.remove('layout-linen', 'layout-terra');
  document.body.classList.remove('layout-linen', 'layout-terra');
  // Sincronizar html con body para que el CSS funcione durante el wizard
  if (layout === 'linen') document.documentElement.classList.add('layout-linen');
  else if (layout === 'terra') document.documentElement.classList.add('layout-terra');
  if (layout === 'linen') {
    document.body.className = 'layout-linen';
  } else if (layout === 'terra') {
    document.body.className = 'layout-terra';
  } else {
    // Volver al tema de color oscuro activo
    document.body.className = currentTheme === 'dark' ? '' : 'theme-' + currentTheme;
  }
  // Actualizar selección visual en settings
  document.querySelectorAll('.layout-card').forEach(c => {
    c.classList.toggle('active', c.dataset.layout === layout);
  });
  // Cargar fuentes si es necesario
  ensureLayoutFonts(layout);
  if (state && state.config) state.config.layout = layout;
  saveState(state);
  showToast('✨ Layout ' + {dark:'Clásico', linen:'Linen', terra:'Terra'}[layout]);
}

function ensureLayoutFonts(layout) {
  // Las fuentes ahora se cargan todas en el <head> del HTML — no se necesita nada aquí
  if (false) {
    document.head.appendChild(l);
  }
}

function toggleThemePicker(e) {
  e.stopPropagation();
  const dd = document.getElementById('themePickerDropdown');
  const ov = document.getElementById('themePickerOverlay');
  const isOpen = dd.classList.contains('open');
  if (isOpen) { closeThemePicker(); } else { dd.classList.add('open'); ov.classList.add('open'); }
}

function closeThemePicker() {
  document.getElementById('themePickerDropdown').classList.remove('open');
  document.getElementById('themePickerOverlay').classList.remove('open');
}
// ─── SISTEMA DE TIPOGRAFÍAS ────────────────────────────────────────
const FONT_NAMES = {
  default: 'Por defecto',
  inter:   'Inter',
  nunito:  'Nunito',
  outfit:  'Outfit',
  jakarta: 'Jakarta',
  mono:    'Mono'
};
let currentFont = localStorage.getItem('fittrack_font') || 'default';

function applyFont(font) {
  currentFont = font;
  localStorage.setItem('fittrack_font', font);
  // Quitar clase font-* anterior
  document.body.classList.forEach(function(cls) {
    if (cls.startsWith('font-')) document.body.classList.remove(cls);
  });
  if (font !== 'default') document.body.classList.add('font-' + font);
  // Marcar selección visual
  document.querySelectorAll('.font-option').forEach(function(el) {
    el.classList.toggle('font-option-active', el.dataset.font === font);
  });
  showToast('Aa ' + (FONT_NAMES[font] || font));
  if (state && state.config) { state.config.font = font; saveState(state); }
}

function initFont() {
  var saved = (state && state.config && state.config.font) || localStorage.getItem('fittrack_font') || 'default';
  currentFont = saved;
  if (saved !== 'default') document.body.classList.add('font-' + saved);
}
