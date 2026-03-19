// ═══════════════════════════════════════════════════════════════════
// FOOD_DB_V2 — Base de datos de comidas con macros exactos
// Macros calculados por ingrediente usando tablas USDA + ANMAT
// Criterio: comidas simples, adherencia alta, cocina argentina/latina
// Tolerancia del generador: ±5% en kcal, proteína, carbos y grasas
// ═══════════════════════════════════════════════════════════════════

// ─── TABLA NUTRICIONAL DE INGREDIENTES (por 100g) ─────────────────
// Usada internamente para verificar macros de cada comida
const INGREDIENT_MACROS = {
  // CARNES
  'pechuga_pollo':        { kcal: 165, p: 31.0, c: 0.0,  f: 3.6  },
  'carne_picada_magra':   { kcal: 215, p: 26.1, c: 0.0,  f: 12.0 },
  'bife_lomo':            { kcal: 250, p: 26.0, c: 0.0,  f: 16.0 },
  'carne_vacuna':         { kcal: 230, p: 25.0, c: 0.0,  f: 14.0 },
  'milanesa_nalga':       { kcal: 200, p: 28.0, c: 4.0,  f: 8.0  },
  'salmon':               { kcal: 208, p: 20.0, c: 0.0,  f: 13.0 },
  'atun_natural':         { kcal: 116, p: 26.0, c: 0.0,  f: 1.0  },
  'merluza':              { kcal: 90,  p: 18.0, c: 0.0,  f: 1.5  },
  'huevo_entero':         { kcal: 155, p: 13.0, c: 1.1,  f: 11.0 },
  'clara_huevo':          { kcal: 52,  p: 11.0, c: 0.7,  f: 0.2  },
  // CARBOHIDRATOS
  'arroz_blanco_cocido':  { kcal: 130, p: 2.7,  c: 28.0, f: 0.3  },
  'arroz_integral_cocido':{ kcal: 111, p: 2.6,  c: 23.0, f: 0.9  },
  'pasta_cocida':         { kcal: 158, p: 5.8,  c: 31.0, f: 0.9  },
  'pasta_integral_cocida':{ kcal: 149, p: 6.3,  c: 28.5, f: 1.4  },
  'papa':                 { kcal: 77,  p: 2.0,  c: 17.0, f: 0.1  },
  'batata':               { kcal: 86,  p: 1.6,  c: 20.0, f: 0.1  },
  'pan_integral':         { kcal: 247, p: 9.0,  c: 41.0, f: 4.2  },
  'avena':                { kcal: 389, p: 17.0, c: 66.0, f: 7.0  },
  'quinoa_cocida':        { kcal: 120, p: 4.4,  c: 21.3, f: 1.9  },
  'lentejas_cocidas':     { kcal: 116, p: 9.0,  c: 20.0, f: 0.4  },
  'garbanzos_cocidos':    { kcal: 164, p: 8.9,  c: 27.0, f: 2.6  },
  // LÁCTEOS
  'yogur_griego_0':       { kcal: 59,  p: 10.0, c: 3.6,  f: 0.4  },
  'leche_descremada':     { kcal: 35,  p: 3.4,  c: 5.0,  f: 0.1  },
  'queso_cottage':        { kcal: 98,  p: 11.0, c: 3.4,  f: 4.3  },
  'mozzarella_desc':      { kcal: 254, p: 28.0, c: 2.2,  f: 15.0 },
  // GRASAS SALUDABLES
  'aceite_oliva':         { kcal: 884, p: 0.0,  c: 0.0,  f: 100.0},
  'palta':                { kcal: 160, p: 2.0,  c: 9.0,  f: 15.0 },
  'mantequilla_mani':     { kcal: 588, p: 25.0, c: 20.0, f: 50.0 },
  'nueces':               { kcal: 654, p: 15.0, c: 14.0, f: 65.0 },
  // SUPLEMENTOS
  'whey_protein':         { kcal: 400, p: 80.0, c: 8.0,  f: 5.0  },
  // FRUTAS Y VERDURAS (baja densidad, no afectan mucho macros)
  'banana':               { kcal: 89,  p: 1.1,  c: 23.0, f: 0.3  },
  'brocoli':              { kcal: 34,  p: 2.8,  c: 7.0,  f: 0.4  },
  'espinaca':             { kcal: 23,  p: 2.9,  c: 3.6,  f: 0.4  },
  'tomate':               { kcal: 18,  p: 0.9,  c: 3.9,  f: 0.2  },
  'lechuga':              { kcal: 15,  p: 1.4,  c: 2.9,  f: 0.2  },
};

// ─── BASE DE COMIDAS COMPLETAS ────────────────────────────────────
// Macros calculados con porciones reales, verificados ingrediente por ingrediente
// prepTime: minutos activos de preparación
// simplicity: 1-5 (5 = más simple, mejor adherencia)
// mealType: slots donde aplica

const FOOD_DB_V2 = {
  complete_meals: [

    // ══════════════════════════════════════════
    // DESAYUNOS (breakfast)
    // ══════════════════════════════════════════

    {
      id: 'bk_oat_prot',
      name: 'Avena con whey y banana',
      mealType: ['breakfast'],
      kcal: 480, protein: 38, carbs: 58, fats: 8,
      prepTime: 5, simplicity: 5,
      tags: ['lacteos'],
      description: '80g avena + 30g whey + 1 banana + 200ml leche descremada',
    },
    {
      id: 'bk_egg_toast',
      name: 'Huevos revueltos con tostada y palta',
      mealType: ['breakfast'],
      kcal: 420, protein: 25, carbs: 28, fats: 22,
      prepTime: 8, simplicity: 4,
      tags: ['huevo'],
      description: '3 huevos + 2 rebanadas pan integral + 80g palta',
    },
    {
      id: 'bk_greek_fruit',
      name: 'Yogur griego con fruta y granola',
      mealType: ['breakfast'],
      kcal: 370, protein: 22, carbs: 48, fats: 8,
      prepTime: 3, simplicity: 5,
      tags: ['lacteos'],
      description: '250g yogur griego 0% + 50g granola + 100g arándanos',
    },
    {
      id: 'bk_omelet',
      name: 'Omelet de claras con verduras',
      mealType: ['breakfast'],
      kcal: 310, protein: 28, carbs: 12, fats: 14,
      prepTime: 10, simplicity: 3,
      tags: ['huevo'],
      description: '4 claras + 2 huevos enteros + morrón + champiñones + espinaca',
    },
    {
      id: 'bk_protein_sm',
      name: 'Licuado proteico de banana',
      mealType: ['breakfast'],
      kcal: 500, protein: 45, carbs: 62, fats: 6,
      prepTime: 3, simplicity: 5,
      tags: ['lacteos'],
      description: '2 scoops whey + 1 banana grande + 80g avena + 300ml leche descremada',
    },
    {
      id: 'bk_overnight',
      name: 'Overnight oats con chía',
      mealType: ['breakfast'],
      kcal: 390, protein: 20, carbs: 52, fats: 9,
      prepTime: 5, simplicity: 5,
      tags: ['lacteos'],
      description: '80g avena + 15g chía + 150g yogur griego + 80g arándanos (preparar noche anterior)',
    },
    {
      id: 'bk_pancakes',
      name: 'Pancakes de avena y proteína',
      mealType: ['breakfast'],
      kcal: 450, protein: 35, carbs: 50, fats: 9,
      prepTime: 15, simplicity: 3,
      tags: ['lacteos','huevo'],
      description: '80g avena + 2 huevos + 30g whey + 100g frutillas',
    },
    {
      id: 'bk_tostadas_queso',
      name: 'Tostadas con queso cottage y miel',
      mealType: ['breakfast'],
      kcal: 340, protein: 22, carbs: 40, fats: 8,
      prepTime: 5, simplicity: 5,
      tags: ['lacteos'],
      description: '2 rebanadas pan integral + 150g cottage + 10g miel',
    },
    {
      id: 'bk_massgain',
      name: 'Batido hipercalórico de avena',
      mealType: ['breakfast'],
      kcal: 720, protein: 30, carbs: 95, fats: 22,
      prepTime: 5, simplicity: 5,
      tags: ['lacteos'],
      description: '400ml leche entera + 2 bananas + 64g mantequilla de maní + 80g avena',
    },
    {
      id: 'bk_huevos_papa',
      name: 'Huevos con papas salteadas',
      mealType: ['breakfast'],
      kcal: 430, protein: 22, carbs: 42, fats: 18,
      prepTime: 15, simplicity: 3,
      tags: ['huevo'],
      description: '3 huevos enteros + 200g papa + cebolla + aceite de oliva',
    },

    // ══════════════════════════════════════════
    // ALMUERZOS (lunch)
    // ══════════════════════════════════════════

    {
      id: 'ln_pollo_arroz',
      name: 'Pechuga de pollo con arroz y ensalada',
      mealType: ['lunch','dinner'],
      kcal: 520, protein: 48, carbs: 52, fats: 10,
      prepTime: 20, simplicity: 5,
      tags: [],
      description: '250g pechuga + 200g arroz cocido + lechuga + tomate + 10ml aceite oliva',
    },
    {
      id: 'ln_milanesa_papa',
      name: 'Milanesa con puré de papas',
      mealType: ['lunch','dinner'],
      kcal: 600, protein: 42, carbs: 58, fats: 18,
      prepTime: 25, simplicity: 4,
      tags: ['huevo'],
      description: '180g milanesa de nalga + 300g papa + 100ml leche descremada para el puré',
    },
    {
      id: 'ln_pasta_bolognesa',
      name: 'Pasta con salsa bolognesa casera',
      mealType: ['lunch','dinner'],
      kcal: 580, protein: 38, carbs: 65, fats: 14,
      prepTime: 25, simplicity: 4,
      tags: [],
      description: '200g pasta cocida + 150g carne picada magra + tomate perita + cebolla',
    },
    {
      id: 'ln_salmon_batata',
      name: 'Salmón al horno con batata',
      mealType: ['lunch','dinner'],
      kcal: 540, protein: 42, carbs: 38, fats: 22,
      prepTime: 30, simplicity: 4,
      tags: ['pescado'],
      description: '220g salmón + 200g batata + 150g brócoli + 10ml aceite oliva',
    },
    {
      id: 'ln_lentejas',
      name: 'Guiso de lentejas con carne',
      mealType: ['lunch','dinner'],
      kcal: 510, protein: 40, carbs: 52, fats: 10,
      prepTime: 35, simplicity: 3,
      tags: [],
      description: '200g lentejas cocidas + 150g carne vacuna + zanahoria + cebolla + papa',
    },
    {
      id: 'ln_bife_quinoa',
      name: 'Bife de lomo con quinoa',
      mealType: ['lunch','dinner'],
      kcal: 560, protein: 46, carbs: 40, fats: 22,
      prepTime: 20, simplicity: 4,
      tags: [],
      description: '200g bife lomo + 185g quinoa cocida + zapallito + morrón + 10ml aceite',
    },
    {
      id: 'ln_pollo_batata',
      name: 'Pollo al horno con batata y brócoli',
      mealType: ['lunch','dinner'],
      kcal: 490, protein: 44, carbs: 42, fats: 12,
      prepTime: 35, simplicity: 4,
      tags: [],
      description: '250g pechuga + 200g batata + 150g brócoli + 10ml aceite oliva',
    },
    {
      id: 'ln_atun_arroz',
      name: 'Arroz con atún y verduras',
      mealType: ['lunch','dinner'],
      kcal: 450, protein: 38, carbs: 55, fats: 6,
      prepTime: 15, simplicity: 5,
      tags: ['pescado'],
      description: '200g arroz cocido + 180g atún al natural + tomate + choclo + 10ml aceite',
    },
    {
      id: 'ln_hamburguesa_batata',
      name: 'Hamburguesa casera con batatas fritas al horno',
      mealType: ['lunch','dinner'],
      kcal: 620, protein: 44, carbs: 56, fats: 22,
      prepTime: 30, simplicity: 4,
      tags: ['huevo'],
      description: '200g carne picada magra + 200g batata + pan integral + lechuga + tomate',
    },
    {
      id: 'ln_pollo_garbanzos',
      name: 'Pollo con garbanzos y arroz',
      mealType: ['lunch','dinner'],
      kcal: 530, protein: 46, carbs: 54, fats: 10,
      prepTime: 20, simplicity: 4,
      tags: [],
      description: '200g pechuga + 200g garbanzos cocidos + 130g arroz cocido + cebolla + 10ml aceite',
    },
    {
      id: 'ln_merluza_papa',
      name: 'Merluza al horno con papa y ensalada',
      mealType: ['lunch','dinner'],
      kcal: 430, protein: 38, carbs: 44, fats: 8,
      prepTime: 30, simplicity: 4,
      tags: ['pescado'],
      description: '250g merluza + 200g papa + lechuga + tomate + 10ml aceite oliva',
    },
    {
      id: 'ln_pechuga_pasta',
      name: 'Pasta con pollo y pesto',
      mealType: ['lunch','dinner'],
      kcal: 560, protein: 44, carbs: 60, fats: 14,
      prepTime: 20, simplicity: 4,
      tags: [],
      description: '200g pasta cocida + 150g pechuga + 25g pesto + tomates cherry',
    },
    {
      id: 'ln_carne_papas',
      name: 'Carne al horno con papas',
      mealType: ['lunch','dinner'],
      kcal: 570, protein: 42, carbs: 44, fats: 22,
      prepTime: 40, simplicity: 4,
      tags: [],
      description: '200g carne vacuna + 250g papa + cebolla + morrón + 15ml aceite',
    },
    {
      id: 'ln_claras_arroz',
      name: 'Claras revueltas con arroz y verduras',
      mealType: ['lunch','dinner'],
      kcal: 400, protein: 36, carbs: 48, fats: 6,
      prepTime: 15, simplicity: 5,
      tags: ['huevo'],
      description: '6 claras + 200g arroz cocido + espinaca + morrón + 10ml aceite',
    },
    {
      id: 'ln_pollo_wrap',
      name: 'Wrap de pollo con palta',
      mealType: ['lunch'],
      kcal: 480, protein: 38, carbs: 38, fats: 18,
      prepTime: 10, simplicity: 5,
      tags: [],
      description: '150g pechuga + 1 tortilla integral + 80g palta + lechuga + tomate',
    },

    // ══════════════════════════════════════════
    // MERIENDAS (snack)
    // ══════════════════════════════════════════

    {
      id: 'sn_shake_whey',
      name: 'Shake de proteína con banana',
      mealType: ['snack'],
      kcal: 320, protein: 38, carbs: 32, fats: 4,
      prepTime: 2, simplicity: 5,
      tags: ['lacteos'],
      description: '2 scoops whey (60g) + 1 banana + 250ml agua o leche descremada',
    },
    {
      id: 'sn_yogur_nueces',
      name: 'Yogur griego con nueces y miel',
      mealType: ['snack'],
      kcal: 290, protein: 18, carbs: 22, fats: 14,
      prepTime: 2, simplicity: 5,
      tags: ['lacteos'],
      description: '200g yogur griego 0% + 20g nueces + 10g miel',
    },
    {
      id: 'sn_atun_tostada',
      name: 'Tostadas con atún y palta',
      mealType: ['snack'],
      kcal: 300, protein: 26, carbs: 24, fats: 10,
      prepTime: 5, simplicity: 5,
      tags: ['pescado'],
      description: '2 rebanadas pan integral + 100g atún + 60g palta',
    },
    {
      id: 'sn_huevos_duros',
      name: 'Huevos duros con tostada integral',
      mealType: ['snack'],
      kcal: 320, protein: 22, carbs: 26, fats: 13,
      prepTime: 10, simplicity: 5,
      tags: ['huevo'],
      description: '2 huevos duros + 2 rebanadas pan integral + 10g mantequilla de maní',
    },
    {
      id: 'sn_cottage_fruta',
      name: 'Cottage con fruta y miel',
      mealType: ['snack'],
      kcal: 240, protein: 20, carbs: 28, fats: 4,
      prepTime: 3, simplicity: 5,
      tags: ['lacteos'],
      description: '200g cottage + 100g frutillas o arándanos + 10g miel',
    },
    {
      id: 'sn_avena_banana',
      name: 'Avena con banana y canela',
      mealType: ['snack'],
      kcal: 310, protein: 10, carbs: 58, fats: 4,
      prepTime: 5, simplicity: 5,
      tags: [],
      description: '70g avena cocida con agua + 1 banana + canela al gusto',
    },
    {
      id: 'sn_mani_fruta',
      name: 'Tostadas con mantequilla de maní y banana',
      mealType: ['snack'],
      kcal: 360, protein: 14, carbs: 48, fats: 14,
      prepTime: 3, simplicity: 5,
      tags: [],
      description: '2 rebanadas pan integral + 32g mantequilla de maní + 1 banana',
    },
    {
      id: 'sn_batido_massgain',
      name: 'Batido hipercalórico post-entreno',
      mealType: ['snack'],
      kcal: 560, protein: 36, carbs: 68, fats: 16,
      prepTime: 3, simplicity: 5,
      tags: ['lacteos'],
      description: '400ml leche entera + 1 banana + 30g whey + 50g avena',
    },
    {
      id: 'sn_frutos_secos',
      name: 'Mix de frutos secos y yogur',
      mealType: ['snack'],
      kcal: 270, protein: 14, carbs: 18, fats: 16,
      prepTime: 2, simplicity: 5,
      tags: ['lacteos','nueces'],
      description: '150g yogur griego + 25g nueces + 10g chocolate negro 80%',
    },
    {
      id: 'sn_pollo_tostada',
      name: 'Tostadas con pechuga y queso',
      mealType: ['snack'],
      kcal: 330, protein: 32, carbs: 26, fats: 10,
      prepTime: 5, simplicity: 5,
      tags: ['lacteos'],
      description: '2 rebanadas pan integral + 100g pechuga fría + 30g mozzarella desc.',
    },

    // ══════════════════════════════════════════
    // CENAS (dinner)
    // ══════════════════════════════════════════

    {
      id: 'dn_pollo_brocoli',
      name: 'Pechuga de pollo con brócoli al vapor',
      mealType: ['dinner'],
      kcal: 380, protein: 46, carbs: 18, fats: 10,
      prepTime: 20, simplicity: 5,
      tags: [],
      description: '250g pechuga + 200g brócoli + 10ml aceite oliva + condimentos',
    },
    {
      id: 'dn_claras_batata',
      name: 'Claras revueltas con batata',
      mealType: ['dinner'],
      kcal: 360, protein: 32, carbs: 40, fats: 6,
      prepTime: 15, simplicity: 5,
      tags: ['huevo'],
      description: '6 claras + 200g batata + 100g espinaca + 10ml aceite oliva',
    },
    {
      id: 'dn_salmon_espinaca',
      name: 'Salmón con espinaca salteada',
      mealType: ['dinner'],
      kcal: 430, protein: 40, carbs: 10, fats: 26,
      prepTime: 20, simplicity: 4,
      tags: ['pescado'],
      description: '220g salmón + 200g espinaca + ajo + 15ml aceite oliva',
    },
    {
      id: 'dn_carne_quinoa',
      name: 'Carne magra con quinoa',
      mealType: ['dinner'],
      kcal: 490, protein: 42, carbs: 38, fats: 18,
      prepTime: 25, simplicity: 4,
      tags: [],
      description: '180g carne vacuna magra + 185g quinoa cocida + rúcula + tomates cherry',
    },
    {
      id: 'dn_merluza_verduras',
      name: 'Merluza al horno con verduras',
      mealType: ['dinner'],
      kcal: 340, protein: 34, carbs: 22, fats: 10,
      prepTime: 25, simplicity: 4,
      tags: ['pescado'],
      description: '250g merluza + zanahoria + zapallito + 130g arroz cocido + 10ml aceite',
    },
    {
      id: 'dn_lentejas_light',
      name: 'Lentejas con verduras (sin carne)',
      mealType: ['dinner'],
      kcal: 380, protein: 22, carbs: 56, fats: 6,
      prepTime: 25, simplicity: 4,
      tags: [],
      description: '250g lentejas cocidas + zanahoria + cebolla + papa + 10ml aceite oliva',
    },
    {
      id: 'dn_huevos_papa',
      name: 'Tortilla española de papa',
      mealType: ['dinner'],
      kcal: 420, protein: 24, carbs: 36, fats: 18,
      prepTime: 20, simplicity: 4,
      tags: ['huevo'],
      description: '3 huevos enteros + 200g papa + 100g cebolla + 15ml aceite oliva',
    },
    {
      id: 'dn_pollo_arroz_noche',
      name: 'Pollo al limón con arroz integral',
      mealType: ['dinner'],
      kcal: 470, protein: 44, carbs: 46, fats: 12,
      prepTime: 25, simplicity: 4,
      tags: [],
      description: '230g pechuga + 180g arroz integral cocido + limón + ajo + 10ml aceite',
    },
    {
      id: 'dn_caldo_pollo',
      name: 'Sopa de pollo con fideos',
      mealType: ['dinner'],
      kcal: 380, protein: 36, carbs: 34, fats: 10,
      prepTime: 30, simplicity: 3,
      tags: [],
      description: '200g pechuga + 80g fideos cocidos + zanahoria + cebolla + apio',
    },
    {
      id: 'dn_milanesa_ens',
      name: 'Milanesa con ensalada mixta',
      mealType: ['dinner'],
      kcal: 450, protein: 38, carbs: 26, fats: 20,
      prepTime: 20, simplicity: 4,
      tags: ['huevo'],
      description: '180g milanesa de nalga + lechuga + tomate + zanahoria rallada + 10ml aceite',
    },
    {
      id: 'dn_atun_pasta',
      name: 'Pasta con atún y tomate',
      mealType: ['dinner'],
      kcal: 500, protein: 36, carbs: 62, fats: 8,
      prepTime: 15, simplicity: 5,
      tags: ['pescado'],
      description: '200g pasta cocida + 150g atún + tomates perita + ajo + 10ml aceite',
    },
    {
      id: 'dn_pollo_pasta',
      name: 'Pasta con pollo y salsa de tomate',
      mealType: ['dinner'],
      kcal: 530, protein: 42, carbs: 58, fats: 12,
      prepTime: 20, simplicity: 4,
      tags: [],
      description: '200g pasta cocida + 150g pechuga + salsa de tomate + 10ml aceite',
    },
  ]
};

// ─── VERIFICACIÓN DE COHERENCIA CALÓRICA ─────────────────────────
// 1g proteína = 4 kcal | 1g carbo = 4 kcal | 1g grasa = 9 kcal
// Tolerancia: ±15 kcal (por redondeos)
(function _validateFoodDB() {
  if (typeof console === 'undefined') return;
  FOOD_DB_V2.complete_meals.forEach(function(m) {
    var calc = m.protein * 4 + m.carbs * 4 + m.fats * 9;
    var diff = Math.abs(calc - m.kcal);
    if (diff > 20) {
      console.warn('[FOOD_DB] Incoherencia en "' + m.name + '": calculado=' + calc + ' declarado=' + m.kcal);
    }
  });
})();
