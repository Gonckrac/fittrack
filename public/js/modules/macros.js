// ─── FOOD CATALOG — macros per 100g ─────────────────────────────
var FOOD_CATALOG = [
  // Carnes
  { name:'Pechuga de pollo',    prot:31, carb:0,  fat:3.6, emoji:'🍗' },
  { name:'Muslo de pollo',      prot:26, carb:0,  fat:8,   emoji:'🍗' },
  { name:'Carne picada magra',  prot:26, carb:0,  fat:8,   emoji:'🥩' },
  { name:'Bife de lomo',        prot:26, carb:0,  fat:5,   emoji:'🥩' },
  { name:'Pechuga de pavo',     prot:29, carb:0,  fat:2,   emoji:'🦃' },
  { name:'Carne vacuna',        prot:26, carb:0,  fat:10,  emoji:'🥩' },
  { name:'Churrasco',           prot:27, carb:0,  fat:8,   emoji:'🥩' },
  { name:'Asado de tira',       prot:24, carb:0,  fat:18,  emoji:'🥩' },
  { name:'Vacío',               prot:25, carb:0,  fat:14,  emoji:'🥩' },
  { name:'Milanesa de carne',   prot:22, carb:12, fat:10,  emoji:'🥩' },
  { name:'Milanesa de pollo',   prot:24, carb:10, fat:7,   emoji:'🍗' },
  { name:'Chorizo',             prot:14, carb:1,  fat:30,  emoji:'🌭' },
  { name:'Morcilla',            prot:13, carb:2,  fat:28,  emoji:'🌭' },
  { name:'Salchicha de Viena',  prot:12, carb:2,  fat:20,  emoji:'🌭' },
  { name:'Jamón cocido',        prot:17, carb:1,  fat:5,   emoji:'🥩' },
  { name:'Jamón crudo',         prot:20, carb:0,  fat:9,   emoji:'🥩' },
  // Pescados
  { name:'Atún al natural',     prot:29, carb:0,  fat:1,   emoji:'🐟' },
  { name:'Salmón atlántico',    prot:25, carb:0,  fat:13,  emoji:'🐟' },
  { name:'Merluza',             prot:20, carb:0,  fat:2,   emoji:'🐟' },
  { name:'Langostinos',         prot:20, carb:0,  fat:1,   emoji:'🦐' },
  { name:'Caballa en aceite',   prot:24, carb:0,  fat:12,  emoji:'🐟' },
  // Lácteos y huevos
  { name:'Huevo entero',        prot:13, carb:1,  fat:11,  emoji:'🥚' },
  { name:'Clara de huevo',      prot:11, carb:0,  fat:0,   emoji:'🥚' },
  { name:'Yogur griego 0%',     prot:10, carb:4,  fat:0,   emoji:'🥛' },
  { name:'Yogur entero',        prot:4,  carb:6,  fat:3,   emoji:'🥛' },
  { name:'Queso cottage',       prot:11, carb:3,  fat:4,   emoji:'🧀' },
  { name:'Leche descremada',    prot:3,  carb:5,  fat:0,   emoji:'🥛' },
  { name:'Leche entera',        prot:3,  carb:5,  fat:3,   emoji:'🥛' },
  { name:'Mozzarella',          prot:22, carb:2,  fat:17,  emoji:'🧀' },
  { name:'Queso cremoso',       prot:18, carb:2,  fat:22,  emoji:'🧀' },
  { name:'Queso port salut',    prot:22, carb:1,  fat:26,  emoji:'🧀' },
  { name:'Ricota',              prot:11, carb:3,  fat:10,  emoji:'🧀' },
  // Cereales y harinas
  { name:'Arroz blanco',        prot:7,  carb:77, fat:1,   emoji:'🍚' },
  { name:'Arroz integral',      prot:7,  carb:73, fat:2,   emoji:'🍚' },
  { name:'Avena arrollada',     prot:13, carb:67, fat:7,   emoji:'🌾' },
  { name:'Pasta integral',      prot:13, carb:68, fat:2,   emoji:'🍝' },
  { name:'Pasta',               prot:12, carb:73, fat:1,   emoji:'🍝' },
  { name:'Fideos cocidos',      prot:5,  carb:31, fat:1,   emoji:'🍝' },
  { name:'Quinoa',              prot:14, carb:64, fat:6,   emoji:'🌾' },
  { name:'Pan integral',        prot:9,  carb:48, fat:4,   emoji:'🍞' },
  { name:'Pan blanco',          prot:8,  carb:53, fat:3,   emoji:'🍞' },
  { name:'Pan de molde',        prot:8,  carb:48, fat:4,   emoji:'🍞' },
  { name:'Polenta',             prot:2,  carb:15, fat:0,   emoji:'🌽' },
  // Legumbres
  { name:'Lentejas cocidas',    prot:9,  carb:20, fat:0,   emoji:'🫘' },
  { name:'Garbanzos cocidos',   prot:9,  carb:27, fat:3,   emoji:'🫘' },
  { name:'Porotos negros',      prot:9,  carb:23, fat:0,   emoji:'🫘' },
  { name:'Porotos pallares',    prot:7,  carb:20, fat:0,   emoji:'🫘' },
  // Verduras y frutas
  { name:'Batata',              prot:2,  carb:20, fat:0,   emoji:'🍠' },
  { name:'Papa',                prot:2,  carb:17, fat:0,   emoji:'🥔' },
  { name:'Brócoli',             prot:3,  carb:7,  fat:0,   emoji:'🥦' },
  { name:'Espinaca',            prot:3,  carb:4,  fat:0,   emoji:'🥬' },
  { name:'Zanahoria',           prot:1,  carb:10, fat:0,   emoji:'🥕' },
  { name:'Zapallo',             prot:1,  carb:8,  fat:0,   emoji:'🎃' },
  { name:'Tomate',              prot:1,  carb:4,  fat:0,   emoji:'🍅' },
  { name:'Lechuga',             prot:1,  carb:2,  fat:0,   emoji:'🥬' },
  { name:'Choclo',              prot:3,  carb:19, fat:1,   emoji:'🌽' },
  { name:'Banana',              prot:1,  carb:23, fat:0,   emoji:'🍌' },
  { name:'Manzana',             prot:0,  carb:14, fat:0,   emoji:'🍎' },
  { name:'Naranja',             prot:1,  carb:12, fat:0,   emoji:'🍊' },
  { name:'Mandarina',           prot:1,  carb:13, fat:0,   emoji:'🍊' },
  { name:'Pera',                prot:0,  carb:15, fat:0,   emoji:'🍐' },
  { name:'Durazno',             prot:1,  carb:10, fat:0,   emoji:'🍑' },
  { name:'Palta',               prot:2,  carb:9,  fat:15,  emoji:'🥑' },
  { name:'Frutillas',           prot:1,  carb:8,  fat:0,   emoji:'🍓' },
  { name:'Uvas',                prot:1,  carb:17, fat:0,   emoji:'🍇' },
  // Comidas argentinas típicas
  { name:'Empanada de carne',   prot:10, carb:22, fat:12,  emoji:'🥟' },
  { name:'Empanada de pollo',   prot:12, carb:20, fat:8,   emoji:'🥟' },
  { name:'Empanada de humita',  prot:5,  carb:28, fat:7,   emoji:'🥟' },
  { name:'Medialuna',           prot:5,  carb:28, fat:10,  emoji:'🥐' },
  { name:'Facturas',            prot:4,  carb:35, fat:12,  emoji:'🥐' },
  { name:'Tostada con manteca', prot:3,  carb:18, fat:6,   emoji:'🍞' },
  { name:'Mate cocido',         prot:0,  carb:1,  fat:0,   emoji:'🧉' },
  { name:'Dulce de leche',      prot:4,  carb:55, fat:5,   emoji:'🍯' },
  { name:'Alfajor simple',      prot:4,  carb:45, fat:10,  emoji:'🍪' },
  { name:'Alfajor triple',      prot:5,  carb:55, fat:16,  emoji:'🍪' },
  { name:'Locro',               prot:12, carb:22, fat:10,  emoji:'🍲' },
  { name:'Guiso de lentejas',   prot:11, carb:25, fat:5,   emoji:'🍲' },
  { name:'Asado (costilla)',     prot:22, carb:0,  fat:20,  emoji:'🥩' },
  { name:'Provoleta',           prot:20, carb:2,  fat:28,  emoji:'🧀' },
  { name:'Choripán',            prot:15, carb:26, fat:22,  emoji:'🌭' },
  { name:'Pizza muzzarella',    prot:11, carb:30, fat:10,  emoji:'🍕' },
  { name:'Tarta de verdura',    prot:7,  carb:22, fat:12,  emoji:'🥧' },
  { name:'Milanesa napolitana', prot:22, carb:12, fat:16,  emoji:'🥩' },
  { name:'Revuelto gramajo',    prot:14, carb:18, fat:16,  emoji:'🍳' },
  // Suplementos
  { name:'Proteína whey',       prot:80, carb:5,  fat:2,   emoji:'💊' },
  { name:'Caseína',             prot:80, carb:6,  fat:2,   emoji:'💊' },
  { name:'Creatina',            prot:0,  carb:0,  fat:0,   emoji:'💊' },
  // Grasas y varios
  { name:'Aceite de oliva',     prot:0,  carb:0,  fat:100, emoji:'🫒' },
  { name:'Mantequilla de maní', prot:25, carb:20, fat:50,  emoji:'🥜' },
  { name:'Nueces',              prot:15, carb:14, fat:65,  emoji:'🥜' },
  { name:'Almendras',           prot:21, carb:22, fat:50,  emoji:'🥜' },
  { name:'Maní tostado',        prot:26, carb:16, fat:49,  emoji:'🥜' },
  { name:'Aceite de girasol',   prot:0,  carb:0,  fat:100, emoji:'🫒' },
  { name:'Galletitas de arroz', prot:7,  carb:79, fat:3,   emoji:'🍘' },
  { name:'Granola',             prot:8,  carb:62, fat:10,  emoji:'🌾' },
];
// Buscar en el catálogo (fuzzy por inicio y por contains)
function _searchFoodCatalog(query) {
  if (!query || query.length < 2) return [];
  var q = query.toLowerCase().trim();
  var results = FOOD_CATALOG.filter(function(f) {
    return f.name.toLowerCase().indexOf(q) >= 0;
  });
  results.sort(function(a, b) {
    var aStart = a.name.toLowerCase().indexOf(q) === 0;
    var bStart = b.name.toLowerCase().indexOf(q) === 0;
    if (aStart && !bStart) return -1;
    if (!aStart && bStart) return 1;
    return a.name.localeCompare(b.name);
  });
  return results.slice(0, 8);
}

// Estado del alimento seleccionado desde el catálogo
_selectedCatalogFood = null;

var _offSearchTimer = null;

function onFoodSearchInput(val) {
  var dd = document.getElementById('foodSearchDropdown');
  if (!dd) return;
  if (!val || val.length < 2) { dd.style.display = 'none'; clearTimeout(_offSearchTimer); return; }

  // Resultados locales inmediatos
  var localResults = _searchFoodCatalog(val);
  _renderFoodDropdown(dd, localResults, false);

  // Búsqueda remota OFF con debounce 600ms
  clearTimeout(_offSearchTimer);
  _offSearchTimer = setTimeout(function() {
    _searchOpenFoodFacts(val, function(remoteResults) {
      // Deduplicar contra catálogo local por nombre normalizado
      var localNames = localResults.map(function(f){ return f.name.toLowerCase(); });
      var deduped = remoteResults.filter(function(f){
        return localNames.indexOf(f.name.toLowerCase()) < 0;
      });
      _renderFoodDropdown(dd, localResults.concat(deduped), true);
    });
  }, 600);
}

function _renderFoodDropdown(dd, results, showBadge) {
  if (!results.length) { dd.style.display = 'none'; return; }
  dd.style.display = 'block';
  dd.innerHTML = results.map(function(f) {
    var kcal100 = Math.round(f.prot*4 + f.carb*4 + f.fat*9);
    var badge = f._fromOFF ? '<span style="font-size:9px;background:rgba(77,138,255,0.15);color:var(--accent);border-radius:4px;padding:1px 5px;margin-left:4px">OFF</span>' : '';
    return '<div onclick="_selectCatalogFood(' + JSON.stringify(f).replace(/"/g,"'") + ')" ' +
      'style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--bg4)">' +
      '<span style="font-size:18px">' + (f.emoji || '📦') + '</span>' +
      '<div style="flex:1">' +
        '<div style="font-size:13px;font-weight:600;color:var(--text)">' + f.name + badge + '</div>' +
        '<div style="font-size:11px;color:var(--text3)">' + f.prot + 'p · ' + f.carb + 'c · ' + f.fat + 'g · ' + kcal100 + 'kcal /100g</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function _searchOpenFoodFacts(query, callback) {
  var url = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' +
    encodeURIComponent(query) +
    '&search_simple=1&action=process&json=1&page_size=6&fields=product_name,nutriments,image_small_url';
  fetch(url, { signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.products) return callback([]);
      var results = data.products
        .filter(function(p) {
          var n = p.nutriments || {};
          return p.product_name &&
            (n['proteins_100g'] !== undefined || n['energy-kcal_100g'] !== undefined);
        })
        .slice(0, 5)
        .map(function(p) {
          var n = p.nutriments || {};
          return {
            name:  p.product_name.trim(),
            prot:  Math.round((n['proteins_100g']      || 0) * 10) / 10,
            carb:  Math.round((n['carbohydrates_100g'] || 0) * 10) / 10,
            fat:   Math.round((n['fat_100g']           || 0) * 10) / 10,
            emoji: '📦',
            _fromOFF: true,
          };
        });
      callback(results);
    })
    .catch(function() { callback([]); }); // falla silenciosamente
}

function _selectCatalogFood(food) {
  _selectedCatalogFood = food;
  var dd = document.getElementById('foodSearchDropdown');
  if (dd) dd.style.display = 'none';
  var searchInp = document.getElementById('foodSearch');
  if (searchInp) searchInp.value = food.name;
  // Show grams row
  var gramsRow = document.getElementById('foodGramsRow');
  if (gramsRow) gramsRow.style.display = 'block';
  var nameEl = document.getElementById('selectedFoodName');
  if (nameEl) nameEl.textContent = food.emoji + ' ' + food.name;
  var per100El = document.getElementById('selectedFoodPer100');
  if (per100El) per100El.textContent = 'Por 100g: ' + food.prot + 'g prot · ' + food.carb + 'g carbos · ' + food.fat + 'g grasas';
  // Trigger preview with default 100g
  document.getElementById('foodGrams').value = '100';
  onGramsInput('100');
  // Pre-fill hidden fields
  _calcAndFillFromGrams(100);
}

function onGramsInput(val) {
  var g = parseFloat(val) || 0;
  _calcAndFillFromGrams(g);
}

function _calcAndFillFromGrams(g) {
  if (!_selectedCatalogFood) return;
  var f = _selectedCatalogFood;
  var prot = Math.round(f.prot * g / 100 * 10) / 10;
  var carb = Math.round(f.carb * g / 100 * 10) / 10;
  var fat  = Math.round(f.fat  * g / 100 * 10) / 10;
  var kcal = Math.round(prot*4 + carb*4 + fat*9);
  // Update preview pills
  var preview = document.getElementById('gramsPreview');
  if (preview) {
    preview.innerHTML =
      '<div style="flex:1;background:var(--bg3);border-radius:8px;padding:6px 4px">' +
        '<div style="font-size:14px;font-weight:700;color:#3b82f6">' + prot + 'g</div>' +
        '<div style="font-size:10px;color:var(--text3)">Prot</div></div>' +
      '<div style="flex:1;background:var(--bg3);border-radius:8px;padding:6px 4px">' +
        '<div style="font-size:14px;font-weight:700;color:#f59e0b">' + carb + 'g</div>' +
        '<div style="font-size:10px;color:var(--text3)">Carbos</div></div>' +
      '<div style="flex:1;background:var(--bg3);border-radius:8px;padding:6px 4px">' +
        '<div style="font-size:14px;font-weight:700;color:#ef4444">' + fat + 'g</div>' +
        '<div style="font-size:10px;color:var(--text3)">Grasas</div></div>' +
      '<div style="flex:1;background:var(--bg3);border-radius:8px;padding:6px 4px">' +
        '<div style="font-size:14px;font-weight:700;color:var(--text)">' + kcal + '</div>' +
        '<div style="font-size:10px;color:var(--text3)">Kcal</div></div>';
  }
  // Store calculated values for addFood()
  _selectedCatalogFood._calcProt = prot;
  _selectedCatalogFood._calcCarb = carb;
  _selectedCatalogFood._calcFat  = fat;
}

function toggleManualEntry() {
  var sec = document.getElementById('manualEntrySection');
  var btn = document.getElementById('manualToggleBtn');
  if (!sec) return;
  var isHidden = sec.style.display === 'none';
  sec.style.display = isHidden ? 'block' : 'none';
  btn.textContent = isHidden ? '− Ocultar entrada manual' : '+ Ingresar macros manualmente';
  if (isHidden) { _selectedCatalogFood = null; }
}

// ─── BARCODE SCANNER ─────────────────────────────────────────────
function _uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

var _barcodeStream = null;var _barcodeInterval = null;

function openBarcodeScanner() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('Tu dispositivo no soporta la cámara'); return;
  }
  var overlay = document.getElementById('barcodeScannerOverlay');
  overlay.style.display = 'flex';
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(function(stream) {
      _barcodeStream = stream;
      var video = document.getElementById('barcodeVideo');
      video.srcObject = stream;
      video.play();
      _startBarcodeDetection(video);
    })
    .catch(function(err) {
      closeBarcodeScanner();
      showToast('No se pudo acceder a la cámara: ' + err.message);
    });
}

function closeBarcodeScanner() {
  if (_barcodeInterval) { clearInterval(_barcodeInterval); _barcodeInterval = null; }
  if (_barcodeStream) { _barcodeStream.getTracks().forEach(function(t){ t.stop(); }); _barcodeStream = null; }
  var overlay = document.getElementById('barcodeScannerOverlay');
  if (overlay) overlay.style.display = 'none';
}

function _startBarcodeDetection(video) {
  if (!('BarcodeDetector' in window)) {
    document.getElementById('barcodeScanStatus').textContent = 'Ingresá el código manualmente ↓';
    setTimeout(function() {
      closeBarcodeScanner();
      toggleManualEntry();
    }, 2000);
    return;
  }
  var detector = new BarcodeDetector({ formats: ['ean_13','ean_8','upc_a','upc_e'] });
  _barcodeInterval = setInterval(function() {
    if (video.readyState < 2) return;
    detector.detect(video).then(function(codes) {
      if (codes.length > 0) {
        clearInterval(_barcodeInterval);
        _barcodeInterval = null;
        closeBarcodeScanner();
        _lookupBarcode(codes[0].rawValue);
      }
    }).catch(function(){});
  }, 600);
}

function _lookupBarcode(barcode) {
  showToast('🔍 Buscando producto...');
  fetch('https://world.openfoodfacts.org/api/v0/product/' + barcode + '.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.status !== 1 || !data.product) {
        showToast('⚠ Producto no encontrado');
        return;
      }
      var p = data.product;
      var n = p.nutriments || {};
      var servingG = Math.round(p.serving_quantity) || 100;
      var servingLabel = p.serving_size || (servingG + 'g');
      var food = {
        name:  p.product_name || p.product_name_es || 'Producto escaneado',
        prot:  Math.round((n['proteins_100g'] || 0) * 10) / 10,
        carb:  Math.round((n['carbohydrates_100g'] || 0) * 10) / 10,
        fat:   Math.round((n['fat_100g'] || 0) * 10) / 10,
        emoji: '📦',
      };
      _openBarcodePortionSheet(food, servingG, servingLabel);
    })
    .catch(function() {
      showToast('⚠ Error al buscar el producto');
    });
}

function _openBarcodePortionSheet(food, servingG, servingLabel) {
  var existing = document.getElementById('barcodePortionSheet');
  if (existing) existing.remove();

  var kcal100 = Math.round(food.prot * 4 + food.carb * 4 + food.fat * 9);

  var sheet = document.createElement('div');
  sheet.id = 'barcodePortionSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10001;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 36px;width:100%;max-width:480px">' +
      '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
        '<span style="font-size:28px">📦</span>' +
        '<div>' +
          '<div style="font-size:14px;font-weight:700;color:var(--text)">' + food.name + '</div>' +
          '<div style="font-size:11px;color:var(--text3);margin-top:2px">' + food.prot + 'p · ' + food.carb + 'c · ' + food.fat + 'g · ' + kcal100 + ' kcal por 100g</div>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px">¿Cuánto consumiste?</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">' +
        [servingG, servingG * 2, 50, 100, 150, 200].filter(function(v,i,a){ return a.indexOf(v)===i && v > 0; }).slice(0,5).map(function(g) {
          var label = g === servingG ? servingLabel : g + 'g';
          return '<button onclick="document.getElementById(\'barcodeGrams\').value=' + g + ';_updateBarcodePreview(' + JSON.stringify(food).replace(/"/g,"'") + ')" style="padding:8px 14px;border-radius:10px;border:1px solid var(--border);background:var(--bg3);font-size:12px;font-weight:600;color:var(--text2);cursor:pointer">' + label + '</button>';
        }).join('') +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
        '<input id="barcodeGrams" type="number" value="' + servingG + '" min="1" max="2000" oninput="_updateBarcodePreview(' + JSON.stringify(food).replace(/"/g,"'") + ')" class="inp" style="width:90px;text-align:center;font-size:16px;font-weight:700">' +
        '<span style="font-size:13px;color:var(--text3)">gramos</span>' +
      '</div>' +
      '<div id="barcodePortionPreview" style="display:flex;gap:8px;margin-bottom:16px;text-align:center"></div>' +
      '<div style="display:flex;gap:8px">' +
        '<button onclick="document.getElementById(\'barcodePortionSheet\').remove()" class="btn btn-ghost" style="flex:1">Cancelar</button>' +
        '<button onclick="_confirmBarcodeFood(' + JSON.stringify(food).replace(/"/g,"'") + ')" class="btn btn-primary" style="flex:2">Agregar →</button>' +
      '</div>' +
    '</div>';
  sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
  _updateBarcodePreview(food);
}

function _updateBarcodePreview(food) {
  var g = parseFloat(document.getElementById('barcodeGrams') && document.getElementById('barcodeGrams').value) || 100;
  var factor = g / 100;
  var prot = Math.round(food.prot * factor * 10) / 10;
  var carb = Math.round(food.carb * factor * 10) / 10;
  var fat  = Math.round(food.fat  * factor * 10) / 10;
  var kcal = Math.round((prot * 4 + carb * 4 + fat * 9));
  var el = document.getElementById('barcodePortionPreview');
  if (!el) return;
  el.innerHTML = [
    ['💪', prot + 'g', 'Proteína'],
    ['⚡', carb + 'g', 'Carbos'],
    ['🫒', fat + 'g', 'Grasas'],
    ['🔥', kcal + ' kcal', 'Calorías'],
  ].map(function(item) {
    return '<div style="flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:8px 4px">' +
      '<div style="font-size:16px">' + item[0] + '</div>' +
      '<div style="font-size:13px;font-weight:700;color:var(--text);margin-top:2px">' + item[1] + '</div>' +
      '<div style="font-size:10px;color:var(--text3)">' + item[2] + '</div>' +
    '</div>';
  }).join('');
}

function _confirmBarcodeFood(food) {
  var g = parseFloat(document.getElementById('barcodeGrams') && document.getElementById('barcodeGrams').value) || 100;
  var factor = g / 100;
  var enriched = Object.assign({}, food, {
    _calcProt: Math.round(food.prot * factor * 10) / 10,
    _calcCarb: Math.round(food.carb * factor * 10) / 10,
    _calcFat:  Math.round(food.fat  * factor * 10) / 10,
    name: food.name + ' (' + g + 'g)',
  });
  var sheet = document.getElementById('barcodePortionSheet');
  if (sheet) sheet.remove();
  openAddFood();
  setTimeout(function() {
    _selectCatalogFood(enriched);
    var gramsEl = document.getElementById('foodGrams');
    if (gramsEl) gramsEl.value = g;
  }, 50);
}

// ─── ELIMINAR COMIDA FRECUENTE ────────────────────────────────────
function deleteFreqFood(key) {
  if (!state.freqFoods || !state.freqFoods[key]) return;
  delete state.freqFoods[key];
  saveState(state);
  renderFreqChips();
  renderQuickFoods();
}

// ─── MACROS ──────────────────────────────────────────────────────
const TARGETS = { prot:190, carb:240, fat:70, kcal:2400 }; // legacy — usar getDynamicTargets()
const MEALS_ORDER = ['Desayuno','Almuerzo','Merienda','Cena','Extra'];

// ─── CONSTANTES GLOBALES DEL SCORE ───────────────────────────────
// Pesos iguales para todos los objetivos.
// La lógica de kcal se adapta al objetivo (ver _calcKcalScore).
// steps solo cuenta si hay wearable con datos reales.
const SCORE_WEIGHTS_BASE = { macros:0.28, training:0.27, sleep:0.10, supps:0.10, kcal:0.10, water:0.10, steps:0.05 };
const SCORE_WEIGHTS_WITH_STEPS = { macros:0.25, training:0.25, sleep:0.10, supps:0.10, kcal:0.10, water:0.10, steps:0.10 };

function _getGoalWeights() {
  return SCORE_WEIGHTS_BASE;
}

function _hasWearableSteps(snap) {
  var hasOura = snap.sleep && snap.sleep.readiness;
  var hasSteps = (snap.steps || 0) > 0;
  return hasOura || hasSteps;
}

// ─── SCORE KCAL SEGÚN OBJETIVO ────────────────────────────────────
// cut/cut_aggressive: penaliza pasarse Y quedarse corto
// maintain:          penaliza cualquier desvío simétrico
// lean_bulk/bulk:    penaliza quedarse corto, pasarse es neutro o positivo
function _calcKcalScore(kcalEaten, tgtKcal, goal) {
  var diff = kcalEaten - tgtKcal;
  var pct = diff / tgtKcal;
  if (goal === 'bulk' || goal === 'lean_bulk') {
    // Quedarse corto penaliza fuerte; pasarse hasta +20% es perfecto, más de eso penaliza leve
    if (diff >= 0 && pct <= 0.20) return 100;                          // en objetivo o superávit moderado
    if (diff > 0) return Math.max(60, Math.round(100 - (pct - 0.20) * 200)); // superávit excesivo: leve penalidad
    return Math.max(0, Math.round(100 + pct * 200));                   // déficit en bulk: penaliza fuerte
  }
  if (goal === 'cut' || goal === 'cut_aggressive') {
    // Quedarse corto es perfecto hasta -20%; pasarse penaliza fuerte
    if (diff <= 0 && pct >= -0.20) return 100;                         // déficit moderado o exacto
    if (diff < 0) return Math.max(70, Math.round(100 + (pct + 0.20) * 150)); // déficit excesivo: leve penalidad
    return Math.max(0, Math.round(100 - pct * 200));                   // superávit en cut: penaliza fuerte
  }
  // maintain: desvío simétrico, tolerancia ±5%
  var absPct = Math.abs(pct);
  if (absPct <= 0.05) return 100;
  return Math.max(0, Math.round(100 - (absPct - 0.05) * 300));
}

// SCORE_WEIGHTS alias para compatibilidad con código existente
const SCORE_WEIGHTS = SCORE_WEIGHTS_BASE;
const foodKcal = f => (+f.prot||0)*4 + (+f.carb||0)*4 + (+f.fat||0)*9;

function calcTotals() {
  const foods = state[TODAY].foods || [];
  const t = { prot:0, carb:0, fat:0, kcal:0 };
  foods.forEach(f => {
    t.prot += +f.prot||0; t.carb += +f.carb||0; t.fat += +f.fat||0;
    t.kcal += foodKcal(f);
  });
  return t;
}

// ─── HOME PAGE ────────────────────────────────────────────────────
// Wrapper: toma el estado actual como snapshot y delega en _calcScoreFromSnapshot.
// Fuente única de verdad — no duplicar lógica aquí.
function calculateDayScore() {
  return _calcScoreFromSnapshot(_deepCopyDaySnap());
}

// ── Insight concreto para el label del score ──────────────────────
function _calcDayInsight(scores) {
  var tgt = getDynamicTargets();
  var t = calcTotals();
var _tdow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
  var _tcycle = state.config && state.config.cycle && state.config.cycle[_tdow];
  var isRestDay = state[TODAY].trainDay === 0 && (_tcycle === undefined || _tcycle === null || _tcycle === -1 || _tcycle === '-1' || _tcycle === 'rest');  if (!isRestDay && scores.training < 30 && state[TODAY].trainDay > 0) {
    return { label: '💪 Pendiente el entreno', msg: 'Completarlo es lo que más sube tu score hoy' };
  }
if (scores.macros < 50) {
    return { label: '🥗 Macros lejos del objetivo', msg: 'Completar comidas' };
  }
  if (scores.water < 40) {
    return { label: '💧 Hidratación baja', msg: 'Tomar agua' };
  }
  if (scores.supps !== undefined && scores.supps !== null && scores.supps < 60 && getDynamicSupps().length > 0) {
    return { label: '💊 Suplementos pendientes', msg: 'Tomar suplementos' };
  }
  if (scores.macros < 75) {
    return { label: '🍽 Macros casi completos', msg: 'Completar comidas' };
  }
  if (scores.macros >= 80 && (isRestDay || scores.training >= 80)) {
    return { label: '🏆 ¡Día excelente!', msg: 'Todos los objetivos bajo control' };
  }
  return { label: '📈 Buen ritmo', msg: 'Seguí completando los objetivos del día' };
}

// ── Tarjeta de peso en la grilla ──────────────────────────────────
function _renderWeightCard() {
  var card = document.getElementById('homeWeightCard');
  var valEl = document.getElementById('homeWeightVal');
  var statusEl = document.getElementById('homeWeightStatus');
  if (!valEl) return;
  var hist = state.metricsHistory || [];
  var cfg = state.config || {};
  var startWeight = cfg.weight || null;
  var latest = hist[0] && hist[0].weight ? hist[0].weight : startWeight;
  if (!latest) {
    valEl.textContent = '—'; valEl.style.color = 'var(--text3)'; valEl.style.fontSize = '';
    if (statusEl) { statusEl.textContent = 'Sin datos'; statusEl.style.color = 'var(--text3)'; }
    return;
  }
  valEl.textContent = latest.toFixed(1) + ' kg';
  valEl.style.fontSize = '13px';
  if (startWeight && Math.abs(startWeight - latest) > 0.05) {
    var pctChange = ((latest - startWeight) / startWeight * 100);
    var goal = cfg.goal || 'cut';
    var isGoodChange = (goal === 'cut' || goal === 'cut_aggressive') ? pctChange <= 0 : pctChange >= 0;
    var sign = pctChange > 0 ? '+' : '';
    var changeColor = Math.abs(pctChange) < 0.3 ? 'var(--text3)' : isGoodChange ? 'var(--green)' : 'var(--red)';
    if (statusEl) { statusEl.textContent = sign + pctChange.toFixed(1) + '% desde inicio'; statusEl.style.color = changeColor; }
    valEl.style.color = changeColor;
  } else {
    if (statusEl) { statusEl.textContent = 'Peso inicial'; statusEl.style.color = 'var(--text3)'; }
    valEl.style.color = 'var(--text2)';
  }
}

// ── Tips concretos que reemplazan la motivación genérica ──────────
function _renderHomeTips(scores, totals, targets) {
  var motivCard = document.querySelector('.daily-motiv-card');
  if (!motivCard) return;
  var tips = [];
var _tdow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
  var _tcycle = state.config && state.config.cycle && state.config.cycle[_tdow];
  var isRestDay = state[TODAY].trainDay === 0 && (_tcycle === undefined || _tcycle === null || _tcycle === -1 || _tcycle === '-1' || _tcycle === 'rest');  if (!isRestDay && state[TODAY].trainDay > 0) {
    if (scores.training === 0) {
      tips.push({ icon: '💪', msg: 'Todavía no empezaste el entreno — es el mayor impacto en tu score' });
    } else if (scores.training < 100) {
      var td = state[TODAY].trainDay;
      var sets = state[TODAY]['trainSets_' + td] || {};
      var total = 0, done = 0;
      Object.values(sets).forEach(function(ex){ ex.forEach(function(s){ total++; if(s.done) done++; }); });
      var pending = total - done;
      if (pending > 0) tips.push({ icon: '💪', msg: pending + ' serie' + (pending>1?'s':'') + ' pendiente' + (pending>1?'s':'') + ' del entreno' });
    }
  }
  var protFalta = Math.max(0, Math.round(targets.prot - totals.prot));
if (protFalta > 10) tips.push({ icon: '🥩', msg: 'Completar comidas' });
  var waterGoal = typeof getWaterGoal === 'function' ? getWaterGoal() : 2500;
  var waterFalta = Math.max(0, waterGoal - (state[TODAY].water || 0));
  if (waterFalta > 500) tips.push({ icon: '💧', msg: 'Tomar agua' });
  var dynSupps = getDynamicSupps();
  if (dynSupps.length > 0 && scores.supps < 100) {
    var suppsTaken = Object.values(state[TODAY].supps || {}).filter(Boolean).length;
    var suppsPending = dynSupps.length - suppsTaken;
    if (suppsPending > 0) tips.push({ icon: '💊', msg: 'Tomar suplementos' });
  }
  if (scores.sleep === null || scores.sleep === undefined) {
    tips.push({ icon: '🌙', msg: 'Registrá cómo dormiste para completar el score del día' });
  }
  if (tips.length === 0) {
    tips.push({ icon: '⭐', msg: '¡Todo bajo control! Seguí con esta disciplina.' });
  }
  motivCard.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;padding:2px 0">' +
    '<div style="font-size:22px;flex-shrink:0">' + tips[0].icon + '</div>' +
    '<div style="flex:1">' +
      '<div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:1px">Acción del día</div>' +
      '<div style="font-size:12px;color:var(--text2);line-height:1.4">' + tips[0].msg + '</div>' +
    '</div>' +
    (tips.length > 1 ? '<div style="font-size:10px;color:var(--text3);font-weight:600;background:var(--bg4);border-radius:10px;padding:2px 7px;flex-shrink:0">+' + (tips.length-1) + ' más</div>' : '') +
    '</div>' +
    (tips.length > 1 ? '<div style="margin-top:8px;display:flex;flex-direction:column;gap:4px">' +
      tips.slice(1).map(function(tip){
        return '<div style="display:flex;gap:8px;align-items:center">' +
          '<span style="font-size:13px">' + tip.icon + '</span>' +
          '<span style="font-size:11px;color:var(--text3)">' + tip.msg + '</span></div>';
      }).join('') + '</div>' : '');
}

// ── Bottom sheet: breakdown del score al tocar el círculo ─────────
function openScoreBreakdown() {
  var dayData = calculateDayScore();
  var scores = dayData.scores;
  var overall = dayData.overall;
  var weights = _getGoalWeights();
  var goal = (state.config && state.config.goal) || 'cut';
  var GOAL_LABELS = { cut_aggressive:'Bajando agresivo', cut:'Déficit', maintain:'Mantenimiento', lean_bulk:'Lean Bulk', bulk:'Volumen' };
  var hasSleep = scores.sleep !== null && scores.sleep !== undefined;
  var hasWearable = scores.stepsFromWearable;
  var rows = [
    { icon:'🍽', label:'Macros',        val: scores.macros,   weight: weights.macros,   active: true },
    { icon:'💪', label:'Entrenamiento', val: scores.training, weight: weights.training, active: true },
    { icon:'🌙', label:'Sueño',         val: scores.sleep,    weight: weights.sleep,    active: true },
    { icon:'💊', label:'Suplementos',   val: scores.supps,    weight: weights.supps,    active: getDynamicSupps().length > 0 },
    { icon:'🔥', label:'Balance kcal',  val: scores.kcal,     weight: weights.kcal,     active: true },
    { icon:'💧', label:'Hidratación',   val: scores.water,    weight: weights.water,    active: true },
    { icon:'🚶', label:'Pasos',         val: scores.steps,    weight: weights.steps,    active: hasWearable },
  ];
  var rowsHtml = rows.filter(function(r){ return r.active; }).map(function(r) {
    var valDisplay = (r.val !== null && r.val !== undefined) ? Math.round(r.val) + '%' : '—';
    var valColor = (r.val === null || r.val === undefined) ? 'var(--text3)' : r.val >= 80 ? 'var(--green)' : r.val >= 60 ? 'var(--yellow)' : 'var(--red)';
    var contrib = (r.val !== null && r.val !== undefined) ? Math.round(r.val * r.weight) : 0;
    var barW = (r.val !== null && r.val !== undefined) ? Math.round(r.val) : 0;
    return '<div style="margin-bottom:12px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<span style="font-size:16px">' + r.icon + '</span>' +
          '<span style="font-size:13px;font-weight:600;color:var(--text)">' + r.label + '</span>' +
          '<span style="font-size:10px;color:var(--text3);background:var(--bg4);border-radius:8px;padding:1px 6px">' + Math.round(r.weight * 100) + '%</span>' +
        '</div>' +
        '<div style="text-align:right">' +
          '<span style="font-size:14px;font-weight:700;color:' + valColor + '">' + valDisplay + '</span>' +
          '<span style="font-size:10px;color:var(--text3);margin-left:4px">+' + contrib + ' pts</span>' +
        '</div>' +
      '</div>' +
      '<div style="height:6px;background:var(--bg4);border-radius:3px;overflow:hidden">' +
        '<div style="height:6px;background:' + valColor + ';border-radius:3px;width:' + barW + '%;transition:width 0.4s ease"></div>' +
      '</div>' +
      ((r.val === null || r.val === undefined) ? '<div style="font-size:10px;color:var(--text3);margin-top:3px">Sin dato — no afecta el score</div>' : '') +
    '</div>';
  }).join('');
  var existing = document.getElementById('scoreBreakdownSheet');
  if (existing) { existing.remove(); return; }
  var sheet = document.createElement('div');
  sheet.id = 'scoreBreakdownSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 32px;width:100%;max-width:480px;margin:0 auto;max-height:88vh;overflow-y:auto">' +
      '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
        '<div style="font-size:15px;font-weight:700;color:var(--text)">📊 Composición del score</div>' +
        '<div style="font-size:26px;font-weight:800;color:var(--accent)">' + overall + '</div>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--text3);margin-bottom:20px">Objetivo: <strong style="color:var(--text2)">' + (GOAL_LABELS[goal]||goal) + '</strong> — los pesos se ajustan según tu meta</div>' +
      rowsHtml +
      '<button onclick="document.getElementById(\'scoreBreakdownSheet\').remove()" class="btn btn-primary" style="width:100%;margin-top:8px">Cerrar</button>' +
    '</div>';
  sheet.addEventListener('click', function(e){ if(e.target===sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}

function renderHome() {
  try {
  const dayData = calculateDayScore();
  const overall = dayData.overall;
  const scores = dayData.scores;

  // ── Círculo principal ────────────────────────────────────────────
  document.getElementById('dayScore').textContent = overall;
  let color = overall >= 85 ? 'var(--green)' : overall >= 70 ? 'var(--accent)' : overall >= 50 ? 'var(--yellow)' : 'var(--red)';
  const dash = document.getElementById('dayScoreDash');
  if (dash) { dash.style.stroke = color; dash.style.strokeDashoffset = 471 - (471 * overall / 100); }
  document.getElementById('dayScore').style.color = color;

  // ── Delta histórico (vs ayer) ────────────────────────────────────


  // ── Tarjeta de Peso ──────────────────────────────────────────────
  _renderWeightCard();

  // ── Tile de Pasos: solo visible con wearable ─────────────────────
  var stepsCard = document.getElementById('homeStepsCard');
  if (stepsCard) stepsCard.style.display = scores.stepsFromWearable ? '' : 'none';
  if (scores.stepsFromWearable) {
    var stepsEl = document.getElementById('dayStepsScore');
    var stepsStatus = document.getElementById('dayStepsStatus');
    var stepsVal = state[TODAY].steps || 0;
    if (stepsEl) { stepsEl.textContent = stepsVal.toLocaleString('es-AR'); stepsEl.style.color = scores.steps >= 80 ? 'var(--green)' : scores.steps >= 50 ? 'var(--yellow)' : 'var(--red)'; stepsEl.style.fontSize = '13px'; }
    if (stepsStatus) { stepsStatus.textContent = scores.steps >= 80 ? '✓ Bien' : '⚠ Bajo'; stepsStatus.style.color = stepsEl ? stepsEl.style.color : ''; }
  }

  // ── Tarjetas de métricas ─────────────────────────────────────────
  var dynSuppsForUI = getDynamicSupps();
var _tdow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
  var _tcycle = state.config && state.config.cycle && state.config.cycle[_tdow];
  var isRestDay = state[TODAY].trainDay === 0 && (_tcycle === undefined || _tcycle === null || _tcycle === -1 || _tcycle === '-1' || _tcycle === 'rest');  var tDaily = calcTotals();
  var tgtD = getDynamicTargets();

  var metricsData = [
{ id: 'dayMacroScore', val: scores.macros, status: scores.macros >= 80 ? '✓ Al día' : scores.macros >= 60 ? 'Falta poco' : scores.macros >= 40 ? 'A medias' : scores.macros > 0 ? 'Poco registrado' : 'Sin registrar' },   { id: 'dayTrainScore', val: scores.training, status: null },
    { id: 'daySleepScore', val: scores.sleep,    status: null, isSleep: true },
    { id: 'daySuppScore',  val: scores.supps,    status: null, isSupp: true },
{ id: 'dayKcalScore',  val: scores.kcal,     status: null },   
 { id: 'dayWaterScore', val: scores.water,    status: null },
  ];

var kcalCard = document.getElementById('dayKcalCard');
  if (kcalCard) kcalCard.style.display = 'none';

  var suppCardItem = document.getElementById('homeSuppCard');
  if (suppCardItem) suppCardItem.style.display = dynSuppsForUI.length > 0 ? '' : 'none';
  metricsData.forEach(function(m) {
    // Balance Kcal: saltar render si hay suplementos (card oculto)
if (m.id === 'dayKcalScore' && dynSuppsForUI.length > 0) return;
    // Suplementos: card único con progreso "2 / 4 tomados"
    if (m.isSupp) {
      var suppCard = document.getElementById('homeSuppCard');
      if (dynSuppsForUI.length === 0) {
        if (suppCard) suppCard.style.display = 'none';
        return;
      }
      var todaySupps = dynSuppsForUI.filter(function(s) { return isSuppActiveToday(s); });
      var takenSupps = state[TODAY].supps || {};
      var suppDone   = todaySupps.filter(function(s) { return takenSupps[s.id]; }).length;
      var suppTotal  = todaySupps.length;
      var allDone    = suppTotal > 0 && suppDone === suppTotal;

      var suppScoreEl  = document.getElementById('daySuppScore');
      var suppStatusEl = document.getElementById('daySuppStatus');

      if (suppCard) suppCard.style.display = '';
      if (suppScoreEl) {
        if (allDone) {
          suppScoreEl.textContent  = '\u2713';
          suppScoreEl.style.color  = 'var(--green)';
          suppScoreEl.style.fontSize = '22px';
        } else {
          suppScoreEl.textContent  = suppDone + ' / ' + suppTotal;
          suppScoreEl.style.color  = suppDone > 0 ? 'var(--yellow)' : 'var(--text3)';
          suppScoreEl.style.fontSize = '13px';
        }
      }
      if (suppStatusEl) {
        suppStatusEl.textContent = allDone ? 'completado' : 'tomados';
        suppStatusEl.style.color = allDone ? 'var(--green)' : 'var(--text3)';
      }
      return;
    }

    var el = document.getElementById(m.id);
    var statusEl = document.getElementById(m.id.replace('Score', 'Status'));

    // Sueño sin dato: mostrar CTA en lugar de porcentaje
    if (m.isSleep && (m.val === null || m.val === undefined)) {
      if (el) { el.textContent = '+'; el.style.color = 'var(--text3)'; el.style.fontSize = '20px'; }
      if (statusEl) { statusEl.textContent = 'Agregar'; statusEl.style.color = 'var(--text3)'; }
      return;
    }

    // Entrenamiento: día de descanso
// Entrenamiento: día de descanso
   if (m.id === 'dayTrainScore' && isRestDay) {
      if (el) { el.textContent = '🛋'; el.style.color = 'var(--text2)'; el.style.fontSize = '18px'; }
      if (statusEl) { statusEl.textContent = 'Descansando'; statusEl.style.color = 'var(--text2)'; }
      return;
    }
    // Entrenamiento: día de deporte completado
    var _td = state[TODAY].trainDay;
    var _tdCfg = _td && state.config && state.config.training && state.config.training[_td - 1];
    if (m.id === 'dayTrainScore' && _tdCfg && _tdCfg.isSport) {
      var _sk = _tdCfg.sportName || _tdCfg.name || 'sport';
      var _done = state[TODAY]['sportDone_' + _sk];
      if (el) { el.textContent = _done ? '100%' : '0%'; el.style.color = _done ? 'var(--green)' : 'var(--red)'; el.style.fontSize = ''; }
      if (statusEl) { statusEl.textContent = _done ? 'Completado' : 'Deporte'; statusEl.style.color = _done ? 'var(--green)' : 'var(--text3)'; }
      return;
    }

var val = m.val !== null && m.val !== undefined ? m.val : 0;
    var metricColor = val >= 80 ? 'var(--green)' : val >= 60 ? 'var(--yellow)' : 'var(--red)';
    if (m.id === 'dayTrainScore' && val === 0 && !isRestDay) {
      if (el) { el.textContent = '—'; el.style.color = 'var(--text3)'; el.style.fontSize = ''; }
      if (statusEl) { statusEl.textContent = 'Sin entrenar'; statusEl.style.color = 'var(--text3)'; }
    } else {
      if (el) { el.textContent = Math.round(val) + '%'; el.style.color = metricColor; el.style.fontSize = ''; }
      if (statusEl) {
        statusEl.textContent = m.status || (val >= 80 ? '✓ Bien' : val >= 60 ? '⚠ Regular' : '✕ Bajo');
        statusEl.style.color = m.status ? 'var(--text3)' : metricColor;
      }
    }
  });
  // ── Predicción del día (primer bloque relevante) ─────────────────
  renderDayPrediction(dayData.overall, scores);
  } catch(e) {
    // Error silenciado en producción — renderHome() falla gracefully
    // Garantizar que el DOM nunca quede en "Cargando..."
    var scoreEl = document.getElementById('dayScore');
    var labelEl = document.getElementById('dayScoreLabel');
    var dashEl  = document.getElementById('dayScoreDash');
    if (scoreEl) { scoreEl.textContent = '0'; scoreEl.style.color = 'var(--text3)'; }
    if (labelEl) { labelEl.textContent = 'Sin datos'; labelEl.style.color = 'var(--text3)'; }
    if (dashEl)  { dashEl.style.stroke = 'var(--bg4)'; dashEl.style.strokeDashoffset = '471'; }
    var msgEl = document.getElementById('dayScoreMsg');
    if (msgEl) msgEl.textContent = 'Completá el setup para ver tu score diario';
  }
}

// ─── PREDICCIÓN DEL DÍA ──────────────────────────────────────────
// Fuente única de verdad para el score. Recibe un snapshot del estado
// (nunca el state real) y devuelve { overall, scores }.
// calculateDayScore() es un wrapper que llama a esta función.
function _calcScoreFromSnapshot(snap) {
  var tgt = getDynamicTargets();
  var foods = snap.foods || [];
  var prot = 0, carb = 0, fat = 0, kcalEaten = 0;
  foods.forEach(function(f) {
    prot += +f.prot||0; carb += +f.carb||0; fat += +f.fat||0;
    kcalEaten += foodKcal(f);
  });
  var scores = {};

  scores.macros = Math.round(
    (Math.min(100, (prot/tgt.prot)*100) +
     Math.min(100, (carb/tgt.carb)*100) +
     Math.min(100, (fat/tgt.fat)*100)) / 3
  );

var trainDay = snap.trainDay;
if (trainDay === 0) {
    // Verificar si hoy es día de sport (trainDay=0 pero hay actividad asignada)
    var _todayDow0 = (function(){ var keys=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']; return keys[new Date().getDay()]; })();
    var _cycleVal0 = state.config && state.config.cycle && state.config.cycle[_todayDow0];
    if (_cycleVal0 === 'sport') {
      var _sName0 = state.config.sportNames && state.config.sportNames[_todayDow0];
      var _sportDone0 = _sName0 ? snap['sportDone_' + _sName0] : false;
      scores.training = _sportDone0 ? 100 : 0;
    } else {
      scores.training = 100; // descanso real
    }
  } else {
    // Detectar qué hay asignado hoy: gym, deporte, o combinado
    var _todayDow = (function() {
      var d = new Date(); var keys = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      return keys[d.getDay()];
    })();
    var _cycle = state.config && state.config.cycle;
    var _cycleVal = _cycle && _cycle[_todayDow];
    var _sportNames = state.config && state.config.sportNames;

    // Detectar si es día de deporte puro o gym puro
    var _trainCfg = state.config && state.config.training && state.config.training[trainDay - 1];
    var _isSportOnly = _trainCfg && _trainCfg.isSport;

    // Detectar actividades combinadas (sportNames puede tener "Pilates+Gym" o similar)
var _combinedSports = (_sportNames && _sportNames[_todayDow])
      ? _sportNames[_todayDow].split('+').filter(Boolean)
      : [];
    var _hasGymToday = _cycleVal !== 'sport' && _cycleVal !== 'rest' && trainDay > 0 && !_isSportOnly;
    var _hasSportToday = _isSportOnly || _combinedSports.length > 0;
    // Si hay gym hoy Y además hay sports extra en sportNames, sumarlos
    if (_hasGymToday && _combinedSports.length > 0) _hasSportToday = true;

    // Contar componentes del día
    var _components = 0;
    if (_hasGymToday) _components++;
    _components += _combinedSports.length;
    if (_components === 0) _components = 1; // fallback

    var _scoreSum = 0;

    // Componente gym: % de sets completados
    if (_hasGymToday) {
      var sets = snap['trainSets_'+trainDay] || {};
      var total = 0, done = 0;
      Object.values(sets).forEach(function(ex) {
        ex.forEach(function(s) { total++; if (s.done) done++; });
      });
      _scoreSum += total > 0 ? Math.round((done/total)*100) : 0;
    }

    // Componentes deporte: 100 si completado, 0 si no
    if (_isSportOnly) {
      var _sk = (_trainCfg.sportName || _trainCfg.name || 'sport');
      _scoreSum += snap['sportDone_' + _sk] ? 100 : 0;
    } else {
      _combinedSports.forEach(function(sName) {
        _scoreSum += snap['sportDone_' + sName] ? 100 : 0;
      });
    }

    scores.training = Math.round(_scoreSum / _components);
  }
  

  // Sleep: Oura readiness → calidad manual (×10) → horas manuales → null si no hay dato
  var sleep = snap.sleep || {};
  var hasSleepData = !!(sleep.readiness || sleep.manQuality || sleep.manHours);
  if (sleep.readiness)       scores.sleep = sleep.readiness;
  else if (sleep.manQuality) scores.sleep = sleep.manQuality * 10;
  else if (sleep.manHours)   scores.sleep = Math.min(100, Math.round(sleep.manHours/8*100));
  else                       scores.sleep = null; // sin dato: excluido del cálculo

  var dynSupps = getDynamicSupps();
  var suppsDone = Object.values(snap.supps || {}).filter(function(v){ return v; }).length;
  scores.supps = dynSupps.length > 0 ? Math.round((suppsDone/dynSupps.length)*100) : 100;

  var tgtKcal = (state.config && (state.config.kcal || state.config.tdee)) || 2000;
  var kcalGoal = (state.config && state.config.goal) || 'cut';
  scores.kcal = _calcKcalScore(kcalEaten, tgtKcal, kcalGoal);

  scores.steps = Math.min(100, Math.round(((snap.steps||0)/10000)*100));

  // Agua: porcentaje del objetivo diario
  var waterGoalSnap = (typeof getWaterGoal === 'function') ? getWaterGoal() : 2500;
  scores.water = Math.min(100, Math.round(((snap.water||0) / waterGoalSnap) * 100));

  // Pesos según objetivo del usuario
  var goalWeights = _getGoalWeights();
  // Si no hay wearable, steps no cuenta — su peso se redistribuye proporcionalmente
  var hasWearable = _hasWearableSteps(snap);
  scores.stepsFromWearable = hasWearable;
  var weights = Object.assign({}, goalWeights);
  if (!hasWearable && weights.steps > 0) {
    var stepWeight = weights.steps;
    var nonStepTotal = 1 - stepWeight;
    Object.keys(weights).forEach(function(k) {
      if (k !== 'steps') weights[k] = weights[k] / nonStepTotal * (1 - 0);
    });
    weights.steps = 0;
  }
  // Si no hay dato de sueño, excluir sleep del cálculo y redistribuir su peso
  if (!hasSleepData && weights.sleep > 0) {
    var sleepWeight = weights.sleep;
    var nonSleepTotal = Object.keys(weights).reduce(function(s,k){ return k!=='sleep' ? s+weights[k] : s; }, 0);
    Object.keys(weights).forEach(function(k) {
      if (k !== 'sleep') weights[k] = weights[k] / nonSleepTotal * (nonSleepTotal + sleepWeight);
    });
    weights.sleep = 0;
  }

  var sleepContrib = (scores.sleep !== null && weights.sleep > 0) ? scores.sleep * weights.sleep : 0;
  var overall = Math.round(
    scores.macros    * weights.macros +
    scores.training  * weights.training +
    sleepContrib +
    scores.supps     * weights.supps +
    scores.kcal      * weights.kcal +
    scores.water     * weights.water +
    scores.steps     * weights.steps
  );
  return { overall: overall, scores: scores };}

function _deepCopyDaySnap() {
  // Copia solo los campos relevantes del día actual — nunca el objeto completo
  var src = state[TODAY];
  var copy = {
    foods: (src.foods || []).map(function(f){ return Object.assign({}, f); }),
    water: src.water || 0,
    trainDay: src.trainDay,
    sleep: Object.assign({}, src.sleep || {}),
    supps: Object.assign({}, src.supps || {}),
    kcal: Object.assign({}, src.kcal || {}),
    steps: src.steps || 0
  };
  // Copiar sportDone_* para que el score de deporte se calcule correctamente
// Copiar sportDone_* para que el score de deporte se calcule correctamente
  Object.keys(src).forEach(function(k) {
    if (k.startsWith('sportDone_')) copy[k] = src[k];
  });
  // Copiar los sets del día de entrenamiento actual
// Copiar los sets del día de entrenamiento actual
  var td = src.trainDay;
  if (td && td > 0) {
    var key = 'trainSets_' + td;
    var origSets = src[key];
    if (origSets) {
      copy[key] = {};
      Object.keys(origSets).forEach(function(exIdx) {
        copy[key][exIdx] = origSets[exIdx].map(function(s){ return Object.assign({}, s); });
      });
    }
  }
  return copy;
}

function renderDayPrediction(currentScore, scores) {
  var el = document.getElementById('dayPrediction');
  if (!el) return;

  var tgt = getDynamicTargets();
  var td = state[TODAY].trainDay;
  var waterGoal = getWaterGoal();
  var currentWater = state[TODAY].water || 0;
  var dynSupps = getDynamicSupps();
  var totals = calcTotals();

  // ─── Calcular exactamente qué falta en cada categoría ───────────
  var protFalta  = Math.max(0, Math.round(tgt.prot - totals.prot));
  var carbFalta  = Math.max(0, Math.round(tgt.carb - totals.carb));
  var fatFalta   = Math.max(0, Math.round(tgt.fat  - totals.fat));
  var kcalFalta  = Math.max(0, Math.round(tgt.kcal - totals.kcal));
  var waterFalta = Math.max(0, waterGoal - currentWater);

  // ─── Construir acciones con etiqueta específica y detalle ────────
  var actions = [];

  // MACROS
  if (scores.macros < 90) {
    var protPct = tgt.prot > 0 ? totals.prot / tgt.prot : 1;
    var carbPct = tgt.carb > 0 ? totals.carb / tgt.carb : 1;
    var fatPct  = tgt.fat  > 0 ? totals.fat  / tgt.fat  : 1;
    var macroLabel, macroDetail, macroSimulate;

    if (protFalta >= 20 && protPct <= carbPct && protPct <= fatPct) {
      macroLabel  = 'Completar comidas del día';
      macroDetail = _getSuggestionForMacro('prot', protFalta, kcalFalta);
      macroSimulate = function(snap) {
        snap.foods.push({ prot: protFalta, carb: Math.round(carbFalta * 0.5), fat: Math.round(fatFalta * 0.5) });
      };
    } else if (carbFalta >= 30 && carbPct < fatPct) {
      macroLabel  = '+' + carbFalta + 'g de carbos';
      macroDetail = _getSuggestionForMacro('carb', carbFalta, kcalFalta);
      macroSimulate = function(snap) {
        snap.foods.push({ prot: Math.round(protFalta * 0.5), carb: carbFalta, fat: Math.round(fatFalta * 0.3) });
      };
    } else if (kcalFalta >= 200) {
macroLabel  = 'Completar comidas del día';
      macroDetail = null;
      macroSimulate = function(snap) {
        snap.foods.push({ prot: Math.round(protFalta * 0.6), carb: Math.round(carbFalta * 0.6), fat: Math.round(fatFalta * 0.6) });
      };
    } else {
      macroLabel  = 'Completar comidas del día';
      macroDetail = null;
      macroSimulate = function(snap) {
        snap.foods.push({ prot: protFalta, carb: carbFalta, fat: fatFalta });
      };
    }

    actions.push({
      icon: '🍽',
      label: macroLabel,
      detail: macroDetail,
      page: 'macros',
      simulate: macroSimulate
    });
  }

  // AGUA
  if (currentWater < waterGoal - 149) {
    var waterLabel, waterDetail;
waterLabel  = 'Tomar ' + waterFalta + 'ml de agua';
    waterDetail = null;
    actions.push({
      icon: '💧',
      label: waterLabel,
      detail: waterDetail,
      page: 'water',
      simulate: function(snap) { snap.water = waterGoal; }
    });
  }

  // ENTRENAMIENTO
  if (td > 0 && scores.training < 100) {
    var trainLabel, trainDetail;
    var trainCfg = state.config && state.config.training && state.config.training[td - 1];
    var dayName  = trainCfg ? trainCfg.name : 'Día ' + td;
    var savedSets = state[TODAY]['trainSets_' + td] || {};
    var totalSets = 0, doneSets = 0, pendingExNames = [];

    if (trainCfg && trainCfg.exercises) {
      trainCfg.exercises.forEach(function(ex, exIdx) {
        var numSets = parseInt(ex.sets) || 3;
        var exSets  = savedSets[exIdx] || [];
        totalSets  += numSets;
        var exDone  = exSets.filter(function(s){ return s.done; }).length;
        doneSets   += exDone;
        if (exDone < numSets) pendingExNames.push(ex.name);
      });
    }

if (scores.training === 0) {
      trainLabel  = 'Entrenar';
      trainDetail = null;
    } else {
      trainLabel  = 'Entrenar';
      trainDetail = null;
    }

    actions.push({
      icon: '💪',
      label: trainLabel,
      detail: trainDetail,
      page: 'training',
      simulate: function(snap) {
        var key = 'trainSets_' + td;
        if (snap[key]) {
          Object.keys(snap[key]).forEach(function(exIdx) {
            snap[key][exIdx].forEach(function(s){ s.done = true; });
          });
        } else {
          snap._trainingOverride = 100;
        }
      }
    });
  }

  // SUPLEMENTOS
  if (dynSupps.length > 0 && scores.supps < 100) {
    var taken = state[TODAY].supps || {};
    var suppsPendientes = dynSupps.filter(function(s){ return !taken[s.id]; });
    var suppLabel, suppDetail;
    if (suppsPendientes.length === 1) {
      suppLabel  = suppsPendientes[0].name;
      suppDetail = suppsPendientes[0].dose ? suppsPendientes[0].dose + ' · ' + suppsPendientes[0].time : suppsPendientes[0].time;
    } else if (suppsPendientes.length === 2) {
      suppLabel  = suppsPendientes.map(function(s){ return s.name; }).join(' y ');
      suppDetail = '2 suplementos pendientes hoy';
    } else {
      suppLabel  = suppsPendientes.length + ' suplementos pendientes';
      suppDetail = suppsPendientes.slice(0, 2).map(function(s){ return s.name; }).join(', ') + (suppsPendientes.length > 2 ? '...' : '');
    }
    actions.push({
      icon: '💊',
      label: suppLabel,
      detail: suppDetail,
      page: 'supps',
      simulate: function(snap) {
        dynSupps.forEach(function(s){ snap.supps[s.id] = true; });
      }
    });
  }

  // Día perfecto
  if (actions.length === 0) {
    el.innerHTML =
      '<div class="prediction-card" style="text-align:center;padding:16px">' +
        '<div style="font-size:22px;margin-bottom:6px">🏆</div>' +
        '<div style="font-size:13px;font-weight:700;color:var(--green)">¡Día completo!</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-top:4px">Cumpliste todos los objetivos del día.</div>' +
      '</div>';
    return;
  }

  // ─── Calcular ganancia acumulativa por acción ────────────────────
  var rows = '';
  var snap = _deepCopyDaySnap();
  var runningScore = currentScore;

  actions.forEach(function(action) {
    action.simulate(snap);

    var scoreAfter;
    if (snap._trainingOverride !== undefined) {
      var baseResult = _calcScoreFromSnapshot(snap);
      scoreAfter = Math.round(
        baseResult.overall
        - scores.training * SCORE_WEIGHTS.training
        + 100             * SCORE_WEIGHTS.training
      );
    } else {
      scoreAfter = _calcScoreFromSnapshot(snap).overall;
    }

    var gain      = scoreAfter - runningScore;
    var gainStr   = gain > 0 ? '+' + gain : (gain === 0 ? '±0' : '' + gain);
    var gainColor = gain > 0 ? 'var(--green)' : 'var(--text3)';
    var gainBg    = gain >= 10 ? 'rgba(77,255,180,0.10)' : gain >= 5 ? 'rgba(77,255,180,0.06)' : 'transparent';

    rows +=
      '<div class="prediction-row" style="background:' + gainBg + ';border-radius:8px;margin:0 -4px;padding:8px 4px;border-bottom:1px solid var(--bg4)">' +
        '<div style="display:flex;flex-direction:column;gap:2px;flex:1;min-width:0">' +
          '<div class="prediction-action">' +
            '<span style="font-size:15px;flex-shrink:0">' + action.icon + '</span>' +
            '<span style="font-size:13px;font-weight:600;color:var(--text)">' + action.label + '</span>' +
          '</div>' +
          (action.detail ? '<div style="font-size:11px;color:var(--text3);padding-left:22px;line-height:1.4">' + action.detail + '</div>' : '') +
        '</div>' +
        '<div class="prediction-scores" style="margin-left:12px;flex-shrink:0">' +
          '<span style="color:var(--text3);font-size:11px">' + runningScore + '</span>' +
          '<span class="prediction-arrow" style="font-size:10px;margin:0 3px">→</span>' +
          '<span class="prediction-new" style="font-size:13px">' + scoreAfter + '</span>' +
          '<span style="font-size:10px;color:' + gainColor + ';font-weight:700;margin-left:3px">(' + gainStr + ')</span>' +
        '</div>' +
      '</div>';

    runningScore = scoreAfter;
  });

  // Score máximo real
  var snapFinal = _deepCopyDaySnap();
  actions.forEach(function(a){ a.simulate(snapFinal); });

  var tgtFull = getDynamicTargets();
  var protAct = 0, carbAct = 0, fatAct = 0;
  snapFinal.foods.forEach(function(f){ protAct += +f.prot||0; carbAct += +f.carb||0; fatAct += +f.fat||0; });
  snapFinal.foods.push({
    prot: Math.max(0, tgtFull.prot - protAct),
    carb: Math.max(0, tgtFull.carb - carbAct),
    fat:  Math.max(0, tgtFull.fat  - fatAct)
  });
  snapFinal.water = (typeof getWaterGoal === 'function') ? getWaterGoal() : 2500;
  if (!(snapFinal.sleep && (snapFinal.sleep.readiness || snapFinal.sleep.manQuality || snapFinal.sleep.manHours))) {
    snapFinal.sleep = { manQuality: 7 };
  }
  getDynamicSupps().forEach(function(s){ snapFinal.supps[s.id] = true; });
  if (td > 0) {
    var keyF = 'trainSets_' + td;
    if (snapFinal[keyF]) {
      Object.keys(snapFinal[keyF]).forEach(function(i) {
        snapFinal[keyF][i].forEach(function(s){ s.done = true; });
      });
    } else { snapFinal._trainingOverride = 100; }
  }

  var maxResult = _calcScoreFromSnapshot(snapFinal);
  var maxScore  = maxResult.overall;
  if (snapFinal._trainingOverride !== undefined) {
    maxScore = Math.round(
      maxResult.overall
      - (maxResult.scores ? maxResult.scores.training : 0) * SCORE_WEIGHTS.training
      + 100 * SCORE_WEIGHTS.training
    );
  }
  maxScore = Math.min(100, maxScore);

  var maxColor  = maxScore >= 85 ? 'var(--green)' : maxScore >= 70 ? 'var(--accent)' : 'var(--yellow)';
  var totalGain = maxScore - currentScore;
  var predSubline = 'Completando ' + actions.map(function(a){ return a.icon; }).join(' ') + ' todo lo de arriba';

  el.innerHTML =
    '<div class="prediction-card">' +
      '<div class="prediction-title">⚡ Si completás esto hoy:</div>' +
      rows +
      '<div class="prediction-potential" style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border)">' +
        '<div style="display:flex;flex-direction:column;gap:1px">' +
          '<div style="font-size:12px;font-weight:600;color:var(--text)">Score máximo posible</div>' +
          '<div style="font-size:10px;color:var(--text3)">' + predSubline + '</div>' +
        '</div>' +
        '<div style="text-align:right;flex-shrink:0;margin-left:12px">' +
          '<div style="font-family:\'Space Mono\',monospace;font-size:22px;font-weight:700;color:' + maxColor + ';line-height:1">' +
            maxScore + '<span style="font-size:11px;color:var(--text3)">/100</span>' +
          '</div>' +
          '<div style="font-size:11px;font-weight:700;color:' + maxColor + '">+' + totalGain + ' pts</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

// ─── HELPER: sugerencia de alimento según macro faltante ─────────
function _getSuggestionForMacro(tipo, cantidad, kcalFalta) {
  if (tipo === 'prot') {
    if (cantidad >= 60) return 'Ej: 200g pechuga + 200g arroz + 1 huevo';
    if (cantidad >= 40) return 'Ej: 150g pechuga de pollo o 200g atún';
    if (cantidad >= 20) return 'Ej: 3 huevos o 100g de queso cottage';
    return 'Ej: 1 yogur griego o 2 claras de huevo';
  }
  if (tipo === 'carb') {
    if (cantidad >= 100) return 'Ej: 200g arroz cocido + 1 banana + pan';
    if (cantidad >= 60)  return 'Ej: 150g arroz cocido o 2 tostadas con avena';
    return 'Ej: 1 banana o 40g avena cocida';
  }
  if (tipo === 'kcal') {
    if (kcalFalta >= 600) return 'Falta una comida completa (almuerzo o cena)';
    if (kcalFalta >= 300) return 'Falta media comida — merienda o postre proteico';
    return 'Falta un snack pequeño para cerrar el día';
  }
  return '';
}

function renderMeals() {
  // Fix: asignar id a alimentos viejos sin id
  (state[TODAY].foods || []).forEach(function(f) {
    if (!f.id) f.id = _uid();
  });
  const foods = state[TODAY].foods || [];
  const t = calcTotals();
  const tgt = getDynamicTargets();

  // Update target labels
  const pl = document.getElementById('targetProtLbl'); if (pl) pl.textContent = '/ ' + tgt.prot + 'g';
  const cl = document.getElementById('targetCarbLbl'); if (cl) cl.textContent = '/ ' + tgt.carb + 'g';
  const fl = document.getElementById('targetFatLbl');  if (fl) fl.textContent = '/ ' + tgt.fat  + 'g';

  // Update summary
  document.getElementById('totalProt').textContent = Math.round(t.prot) + 'g';
  document.getElementById('totalCarb').textContent = Math.round(t.carb) + 'g';
  document.getElementById('totalFat').textContent = Math.round(t.fat) + 'g';

  const pPct = Math.min(100, Math.round(t.prot/getDynamicTargets().prot*100));
  const cPct = Math.min(100, Math.round(t.carb/getDynamicTargets().carb*100));
  const fPct = Math.min(100, Math.round(t.fat/getDynamicTargets().fat*100));
  const kPct = Math.min(100, Math.round(t.kcal/getDynamicTargets().kcal*100));

 var _prevProt = parseInt(document.getElementById('protBar').style.width) || 0;
  var _prevCarb = parseInt(document.getElementById('carbBar').style.width) || 0;
  var _prevFat  = parseInt(document.getElementById('fatBar').style.width)  || 0;
  var _prevKcal = parseInt(document.getElementById('kcalBar').style.width) || 0;

  document.getElementById('protBar').style.width = pPct + '%';
  document.getElementById('carbBar').style.width = cPct + '%';
  document.getElementById('fatBar').style.width = fPct + '%';
  document.getElementById('kcalBar').style.width = kPct + '%';
  document.getElementById('protPct').textContent = pPct + '%';
  document.getElementById('carbPct').textContent = cPct + '%';
  document.getElementById('fatPct').textContent = fPct + '%';
  document.getElementById('kcalPct').textContent = Math.round(t.kcal) + ' / ' + getDynamicTargets().kcal + ' kcal';

  // Feedback al llegar al 100%
  if (pPct >= 100 && _prevProt < 100) showToast('💪 ¡Proteína completada!');
  else if (kPct >= 100 && _prevKcal < 100) showToast('🔥 ¡Calorías del día completadas!');
  else if (cPct >= 100 && _prevCarb < 100) showToast('⚡ ¡Carbohidratos completados!');
  // Update kcal page consumed
  document.getElementById('kcalConsumed').textContent = Math.round(t.kcal);
  updateKcalBalance();

  // Meals — always render all 5 slots; empty ones show a placeholder
  // Slots con comida: card completa. Slots vacíos: chips compactos en una fila.
  const MEAL_ICONS = { Desayuno:'🌅', Almuerzo:'☀️', Merienda:'🍎', Cena:'🌙', Extra:'⚡' };
  const container = document.getElementById('mealsContainer');
  container.innerHTML = '';

  const filledMeals = MEALS_ORDER.filter(meal => foods.some(f => f.meal === meal));
  const emptyMeals  = MEALS_ORDER.filter(meal => !foods.some(f => f.meal === meal));

  // Cards solo para slots con comida
  filledMeals.forEach(meal => {
    const mFoods = foods.filter(f => f.meal === meal);
    const mKcal  = mFoods.reduce((s,f) => s + foodKcal(f), 0);
    const div = document.createElement('div');
    div.className = 'card meal-card';
    div.innerHTML =
      '<div class="meal-header">' +
        '<div class="meal-name">' + (MEAL_ICONS[meal] || '') + ' ' + meal + '</div>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<div class="meal-kcal">' + Math.round(mKcal) + ' kcal</div>' +
          '<button onclick="openAddFood(\'' + meal + '\')" class="meal-add-btn">+</button>' +
        '</div>' +
      '</div>' +
      '<div class="meal-items">' +
        mFoods.map(f =>
          '<div class="meal-item">' +
            '<div class="meal-item-name">' + f.name + '</div>' +
            '<div style="display:flex;align-items:center;gap:8px">' +
              '<div class="meal-item-macros">' + f.prot + 'p · ' + f.carb + 'c · ' + f.fat + 'g</div>' +
              '<button onclick="removeFood(\'' + f.id + '\')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;line-height:1;padding:0 2px">✕</button>' +
            '</div>' +
          '</div>'
        ).join('') +
      '</div>';
    container.appendChild(div);
  });


}

function openAddFood(preselectedMeal) {
  // Reset search state
  _selectedCatalogFood = null;
  var searchInp = document.getElementById('foodSearch');
  if (searchInp) searchInp.value = '';
  var dd = document.getElementById('foodSearchDropdown');
  if (dd) dd.style.display = 'none';
  var gramsRow = document.getElementById('foodGramsRow');
  if (gramsRow) gramsRow.style.display = 'none';
  var gramsPreview = document.getElementById('gramsPreview');
  if (gramsPreview) gramsPreview.innerHTML = '';
  var manualSec = document.getElementById('manualEntrySection');
  if (manualSec) manualSec.style.display = 'none';
  var manualBtn = document.getElementById('manualToggleBtn');
  if (manualBtn) manualBtn.textContent = '+ Ingresar macros manualmente';
  // Reset manual fields
  var nameEl = document.getElementById('foodName'); if (nameEl) nameEl.value = '';
  var protEl = document.getElementById('foodProt'); if (protEl) protEl.value = '';
  var carbEl = document.getElementById('foodCarb'); if (carbEl) carbEl.value = '';
  var fatEl  = document.getElementById('foodFat');  if (fatEl)  fatEl.value  = '';
  // Preselect meal
  if (preselectedMeal) {
    var sel = document.getElementById('foodMeal');
    if (sel) sel.value = preselectedMeal;
  }
  renderFreqChips();
  renderPresetsList();
  document.getElementById('addFoodModal').classList.add('open');
}

function fillPreset(name, prot, carb, fat) {
  document.getElementById('foodName').value = name;
  document.getElementById('foodProt').value = prot;
  document.getElementById('foodCarb').value = carb;
  document.getElementById('foodFat').value = fat;
}

// ── FOOD PRESETS ───────────────────────────────────────────────────
function getPresets() {
  return state.foodPresets || [];
}

function saveAsPreset() {
  const name = document.getElementById('foodName').value.trim();
  const prot = parseFloat(document.getElementById('foodProt').value) || 0;
  const carb = parseFloat(document.getElementById('foodCarb').value) || 0;
  const fat  = parseFloat(document.getElementById('foodFat').value)  || 0;
  if (!name) { showToast('⚠ Ingresá un nombre primero'); return; }
  if (!state.foodPresets) state.foodPresets = [];
  // Avoid duplicates by name
  if (state.foodPresets.find(function(p){return p.name===name;})) {
    showToast('Ya existe ese preset'); return;
  }
  state.foodPresets.push({ name, prot, carb, fat });
  saveState(state);
  renderPresetsList();
  showToast('💾 Preset guardado: ' + name);
}

function deletePreset(idx) {
  if (!state.foodPresets) return;
  state.foodPresets.splice(idx, 1);
  saveState(state);
  renderPresetsList();
}

function renderPresetsList() {
  const container = document.getElementById('presetsList');
  const section = document.getElementById('presetsSection');
  if (!container) return;
  const presets = getPresets();
  if (presets.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';
  container.innerHTML = presets.map(function(p, i) {
    const kcal = Math.round(foodKcal(p));
    return '<div style="display:flex;align-items:center;gap:6px">' +
      '<button class="btn btn-ghost" style="flex:1;text-align:left;font-size:12px;padding:8px 12px" onclick="fillPreset(\''+p.name.replace(/'/g,"\\'")+'\',' + p.prot + ',' + p.carb + ',' + p.fat + ')">' +
        '🍽 ' + p.name + ' — ' + p.prot + 'p · ' + p.carb + 'c · ' + p.fat + 'g · ' + kcal + 'kcal' +
      '</button>' +
      '<button onclick="deletePreset('+i+')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:14px;padding:4px 6px;flex-shrink:0">✕</button>' +
    '</div>';
  }).join('');
}

// ── METRICS TOGGLES ───────────────────────────────────────────────
function toggleExtraMetrics() {
  const sec = document.getElementById('extraMetricsSection');
  const btn = document.getElementById('extraMetricsToggle');
  const hidden = sec.style.display === 'none';
  sec.style.display = hidden ? 'block' : 'none';
  btn.textContent = hidden ? '− Ocultar % Grasa y % Muscular' : '+ Mostrar % Grasa y % Muscular';
}

function toggleExtraInputs() {
  const sec = document.getElementById('extraInputs');
  const btn = document.getElementById('extraInputsToggle');
  const hidden = sec.style.display === 'none';
  sec.style.display = hidden ? 'block' : 'none';
  btn.textContent = hidden ? '− Ocultar campos extras' : '+ Agregar % grasa y muscular';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
function addFood() {
  var name, prot, carb, fat;

  // Source 1: food selected from catalog with grams
  if (_selectedCatalogFood && _selectedCatalogFood._calcProt !== undefined) {
    var g = Math.max(0, parseFloat(document.getElementById('foodGrams').value) || 100);
    name = _selectedCatalogFood.name + ' (' + g + 'g)';
    prot = _selectedCatalogFood._calcProt;
    carb = _selectedCatalogFood._calcCarb;
    fat  = _selectedCatalogFood._calcFat;
  } else {
    // Source 2: manual entry fallback
    name = (document.getElementById('foodName') && document.getElementById('foodName').value.trim()) || '';
    if (!name) { showToast('⚠ Buscá un alimento o ingresá un nombre'); return; }
prot = Math.max(0, +(document.getElementById('foodProt') && document.getElementById('foodProt').value) || 0);
    carb = Math.max(0, +(document.getElementById('foodCarb') && document.getElementById('foodCarb').value) || 0);
    fat  = Math.max(0, +(document.getElementById('foodFat')  && document.getElementById('foodFat').value)  || 0);
  }

var food = {
    id: _uid(),
    name: name,
    meal: document.getElementById('foodMeal').value,
    prot: prot, carb: carb, fat: fat,
  };
  if (!state[TODAY].foods) state[TODAY].foods = [];
  state[TODAY].foods.push(food);

  // Auto-track frequent foods
  if (!state.freqFoods) state.freqFoods = {};
  var key = ((_selectedCatalogFood && _selectedCatalogFood.name) || name).toLowerCase().trim();
  if (!state.freqFoods[key]) {
    state.freqFoods[key] = { name: (_selectedCatalogFood && _selectedCatalogFood.name) || name, prot: prot, carb: carb, fat: fat, count: 0 };
  }
  state.freqFoods[key].count++;
  state.freqFoods[key].prot = prot;
  state.freqFoods[key].carb = carb;
  state.freqFoods[key].fat  = fat;

saveState(state);
  closeModal('addFoodModal');
  _selectedCatalogFood = null;
  renderMeals();
  renderHome();
  showToast(name + ' agregado ✓');
  if (typeof showActionFeedback === 'function') showActionFeedback('food');
}

// Returns top frequent foods sorted by count
function getFreqFoods(limit) {
  if (!state.freqFoods) return [];
  return Object.values(state.freqFoods)
    .sort(function(a,b){ return b.count - a.count; })
    .slice(0, limit || 8);
}

// Render frequent foods chips in the modal — scroll horizontal compacto
function renderFreqChips() {
  var wrap = document.getElementById('freqFoodsWrap');
  if (!wrap) return;
  var foods = getFreqFoods(10);
  if (foods.length === 0) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  window._freqFoodsCache = foods;
  var chips = foods.map(function(f, i) {
    var kcal = Math.round(foodKcal(f));
    var keyEsc = f.name.toLowerCase().trim().replace(/'/g, "\\'");
    return '<div style="display:inline-flex;align-items:stretch;margin:0 3px 3px 0">' +
      '<button onclick="_fillFreqIdx(' + i + ')" class="freq-chip" style="border-radius:20px 0 0 20px;margin:0;padding-right:8px">' +
        '<span class="freq-chip-name">' + f.name + '</span>' +
        '<span class="freq-chip-macros">' + f.prot + 'p · ' + f.carb + 'c · ' + kcal + 'k</span>' +
      '</button>' +
      '<button onclick="deleteFreqFood(\'' + keyEsc + '\')" ' +
        'style="background:var(--bg3);border:1px solid var(--border);border-left:none;border-radius:0 20px 20px 0;padding:0 8px;cursor:pointer;font-size:11px;color:var(--text3)">✕</button>' +
    '</div>';
  }).join('');
  wrap.innerHTML =
    '<div style="font-size:10px;color:var(--text3);margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">🔁 Frecuentes</div>' +
    '<div style="display:flex;flex-wrap:nowrap;gap:6px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none">' + chips + '</div>';
}

// Render frequent foods directly on the macros page (not inside modal)
function renderQuickFoods() {
  var section = document.getElementById('quickFoodsSection');
  var list = document.getElementById('quickFoodsList');
  if (!section || !list) return;
  var foods = getFreqFoods(10);
  if (foods.length === 0) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  window._quickFoodsCache = foods;
  list.innerHTML = foods.map(function(f, i) {
    var kcal = Math.round(foodKcal(f));
    return '<button onclick="_quickAddFood(' + i + ')" style="background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:7px 14px;font-size:12px;color:var(--text2);cursor:pointer;display:flex;flex-direction:column;align-items:flex-start;gap:1px;min-width:0">'
      + '<span style="font-weight:600;color:var(--text);white-space:nowrap">' + f.name + '</span>'
      + '<span style="font-size:10px;color:var(--text3)">' + f.prot + 'p · ' + f.carb + 'c · ' + kcal + ' kcal</span>'
      + '</button>';
  }).join('');
}

function _quickAddFood(i) {
  var f = window._quickFoodsCache && window._quickFoodsCache[i];
  if (!f) return;
  // Ask which meal via a simple toast-style selector
  var meal = 'Almuerzo'; // default
  var mealOpts = ['Desayuno','Almuerzo','Merienda','Cena','Extra'];
  var chosen = window.prompt ? null : null;
  // Use a small inline selector instead of prompt
  _showMealPicker(f);
}

function _closeMealPicker(){var el=document.getElementById('quickMealPicker');if(el)el.remove();}

function _showMealPicker(f) {
  var existing = document.getElementById('quickMealPicker');
  if (existing) existing.remove();
  window._pickerFood = f; // store reference

  var meals = ['Desayuno','Almuerzo','Merienda','Cena','Extra'];
  var picker = document.createElement('div');
  picker.id = 'quickMealPicker';
  picker.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:300;display:flex;align-items:flex-end;justify-content:center';
  var kcal = Math.round(foodKcal(f));
  picker.innerHTML = '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px;width:100%;max-width:430px">'
    + '<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px">' + f.name + '</div>'
    + '<div style="font-size:11px;color:var(--text3);margin-bottom:16px">' + f.prot + 'p · ' + f.carb + 'c · ' + f.fat + 'g · ' + kcal + ' kcal</div>'
    + '<div style="font-size:12px;color:var(--text2);margin-bottom:10px;font-weight:600">¿A qué comida lo agregás?</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">'
    + meals.map(function(m) {
        return '<button data-meal="' + m + '" onclick="_quickAddConfirm(this.dataset.meal)" style="background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:8px 16px;font-size:13px;color:var(--text2);cursor:pointer">' + m + '</button>';
      }).join('')
    + '</div>'
    + '<button onclick="_closeMealPicker()" style="width:100%;background:none;border:none;color:var(--text3);font-size:13px;padding:8px;cursor:pointer">Cancelar</button>'
    + '</div>';
  document.body.appendChild(picker);
}

function _quickAddConfirm(meal) {
  var f = window._pickerFood;
  document.getElementById('quickMealPicker').remove();
  if (!f) return;
  var item = { id: Date.now().toString(), name: f.name, meal: meal, prot: f.prot, carb: f.carb, fat: f.fat };
  if (!state[TODAY].foods) state[TODAY].foods = [];
  state[TODAY].foods.push(item);
  if (!state.freqFoods) state.freqFoods = {};
  var key = f.name.toLowerCase().trim();
  if (!state.freqFoods[key]) state.freqFoods[key] = { name: f.name, prot: f.prot, carb: f.carb, fat: f.fat, count: 0 };
  state.freqFoods[key].count++;
saveState(state);
  renderMeals();
  renderHome();
  showToast(f.name + ' agregado a ' + meal + ' ✓');
  if (typeof showActionFeedback === 'function') showActionFeedback('food');
}

function _fillFreqIdx(i) {
  var f = window._freqFoodsCache && window._freqFoodsCache[i];
  if (!f) return;
  document.getElementById('foodName').value = f.name;
  document.getElementById('foodProt').value = f.prot;
  document.getElementById('foodCarb').value = f.carb;
  document.getElementById('foodFat').value  = f.fat;
}
// ─── REPETIR AYER ────────────────────────────────────────────────
function _getYesterday() {
  var d = new Date(TODAY + 'T12:00:00'); // mediodía para evitar DST edge
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
}

function openRepeatYesterday() {
  var yesterday = _getYesterday();
  var yFoods = (state[yesterday] && state[yesterday].foods) || [];
  var todayFoods = state[TODAY].foods || [];

  // Agrupar comidas de ayer que tienen alimentos
  var MEAL_ICONS = { Desayuno:'🌅', Almuerzo:'☀️', Merienda:'🍎', Cena:'🌙', Extra:'⚡' };
  var mealsWithFood = MEALS_ORDER.filter(function(m) {
    return yFoods.some(function(f){ return f.meal === m; });
  });

  if (mealsWithFood.length === 0) {
    showToast('Sin comidas registradas ayer');
    return;
  }

  // Construir bottom sheet con checkboxes por comida
  var existing = document.getElementById('repeatYesterdaySheet');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'repeatYesterdaySheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:300;display:flex;align-items:flex-end;justify-content:center';

  var rows = mealsWithFood.map(function(meal) {
    var mFoods = yFoods.filter(function(f){ return f.meal === meal; });
    var mKcal = Math.round(mFoods.reduce(function(s,f){ return s + foodKcal(f); }, 0));
    // Resaltar si ya hay alimentos en esa comida hoy
    var alreadyHas = todayFoods.some(function(f){ return f.meal === meal; });
    var note = alreadyHas ? ' <span style="font-size:10px;color:var(--yellow)">(ya tenés algo)</span>' : '';
    return '<label style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--bg4);cursor:pointer">' +
      '<input type="checkbox" data-meal="' + meal + '" checked style="width:18px;height:18px;accent-color:var(--accent);flex-shrink:0">' +
      '<div style="flex:1">' +
        '<div style="font-size:13px;font-weight:600;color:var(--text)">' + (MEAL_ICONS[meal]||'') + ' ' + meal + note + '</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-top:2px">' +
          mFoods.length + ' alimento' + (mFoods.length!==1?'s':'') + ' · ' + mKcal + ' kcal' +
        '</div>' +
      '</div>' +
    '</label>';
  }).join('');

  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px;width:100%;max-width:430px;max-height:80vh;overflow-y:auto">' +
      '<div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px">↩ Repetir de ayer</div>' +
      '<div style="font-size:11px;color:var(--text3);margin-bottom:16px">Seleccioná las comidas que querés copiar</div>' +
      '<div id="repeatYesterdayRows">' + rows + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:16px">' +
        '<button onclick="_confirmRepeatYesterday()" class="btn btn-primary" style="flex:1">Copiar seleccionadas</button>' +
        '<button onclick="document.getElementById(\'repeatYesterdaySheet\').remove()" class="btn btn-ghost" style="flex:0 0 auto">Cancelar</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(sheet);
  // Cerrar al tocar fondo
  sheet.addEventListener('click', function(e){ if(e.target===sheet) sheet.remove(); });
}

function _confirmRepeatYesterday() {
  var yesterday = _getYesterday();
  var yFoods = (state[yesterday] && state[yesterday].foods) || [];
  var sheet = document.getElementById('repeatYesterdaySheet');
  var checked = sheet.querySelectorAll('input[type=checkbox]:checked');
  var selectedMeals = Array.from(checked).map(function(cb){ return cb.dataset.meal; });

  if (selectedMeals.length === 0) { showToast('⚠ No seleccionaste ninguna comida'); return; }

  var copied = 0;
  selectedMeals.forEach(function(meal) {
    yFoods.filter(function(f){ return f.meal === meal; }).forEach(function(f, i) {
      // Deep copy con nuevo id — state[YESTERDAY] nunca se modifica
      state[TODAY].foods.push({
        id: Date.now().toString() + '_' + meal + '_' + i,
        name: f.name, meal: f.meal,
        prot: f.prot, carb: f.carb, fat: f.fat
      });
      copied++;
    });
  });

saveState(state);
  sheet.remove();
  renderMeals();
  renderHome();
  showToast('✓ ' + copied + ' alimento' + (copied!==1?'s':'') + ' copiado' + (copied!==1?'s':''));
  if (typeof showActionFeedback === 'function') showActionFeedback('food');
}
function removeFood(id) {
  if (!state[TODAY].foods) return;
  var removed = state[TODAY].foods.find(function(f) { return String(f.id) === String(id); });
  if (!removed) return;
  state[TODAY].foods = state[TODAY].foods.filter(function(f) { return String(f.id) !== String(id); });
  saveState(state);
  var addModal = document.getElementById('addFoodModal');
  if (addModal && addModal.classList.contains('open')) addModal.classList.remove('open');
  renderMeals();
  renderHome();
  showUndoToast('🗑 ' + removed.name + ' eliminado', function() {
    removed.id = _uid();
    if (!state[TODAY].foods) state[TODAY].foods = [];
    state[TODAY].foods.push(removed);
    saveState(state);
    renderMeals();
    renderHome();
  });
}


// ─── STEPS WEARABLE ALERT ────────────────────────────────────────
function showStepsWearableAlert(e) {
  // Solo mostrar si no hay wearable conectado
  var hasWearable = (state[TODAY] && state[TODAY].sleep && state[TODAY].sleep.readiness) || (state[TODAY] && (state[TODAY].steps || 0) > 0);
  if (hasWearable) return;
  if (e) e.stopPropagation();

  var existing = document.getElementById('stepsWearableSheet');
  if (existing) { existing.remove(); return; }

  var sheet = document.createElement('div');
  sheet.id = 'stepsWearableSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:24px 20px 32px;width:100%;max-width:480px;margin:0 auto">' +
      '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 20px"></div>' +
      '<div style="font-size:36px;text-align:center;margin-bottom:12px">🚶</div>' +
      '<div style="font-size:16px;font-weight:700;color:var(--text);text-align:center;margin-bottom:8px">Conteo de pasos</div>' +
      '<div style="font-size:13px;color:var(--text2);text-align:center;line-height:1.6;margin-bottom:20px">' +
        'Los pasos se trackean automáticamente si conectás un wearable.<br>' +
        'Sin wearable, esta categoría <strong style="color:var(--accent)">no afecta tu score diario</strong> — podés llegar a 100 sin ella.' +
      '</div>' +
      '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:16px">' +
        '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Dispositivos compatibles</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px">' +
          '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:20px">💍</span><div><div style="font-size:13px;font-weight:600;color:var(--accent)">Oura Ring</div><div style="font-size:11px;color:var(--text3)">Conectado desde la tab Sueño</div></div></div>' +
          '<div style="display:flex;align-items:center;gap:10px;opacity:0.5"><span style="font-size:20px">🍎</span><div><div style="font-size:12px;font-weight:600;color:var(--text)">Apple Health</div><div style="font-size:11px;color:var(--text3)">Próximamente</div></div></div>' +
          '<div style="display:flex;align-items:center;gap:10px;opacity:0.5"><span style="font-size:20px">🏃</span><div><div style="font-size:12px;font-weight:600;color:var(--text)">Garmin</div><div style="font-size:11px;color:var(--text3)">Próximamente</div></div></div>' +
        '</div>' +
      '</div>' +
      '<button onclick="document.getElementById(\'stepsWearableSheet\').remove()" class="btn btn-primary" style="width:100%">Entendido</button>' +
    '</div>';
  sheet.addEventListener('click', function(ev){ if(ev.target===sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}
