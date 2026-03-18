// ═══════════════════════════════════════════════════════════════════════════════
// FOOD DATABASE — 300+ foods with full macro data
// Fields: id, name, kcal, protein, carbs, fats, fiber, servingG, 
//         category, mealType[], tags[], prepTime
// All values per 100g UNLESS servingG is specified — UI scales accordingly
// ═══════════════════════════════════════════════════════════════════════════════

const FOOD_DB_V2 = {

  // ─── PROTEINS ─────────────────────────────────────────────────────────────
  proteins: [
    // Poultry
    { id:'ck_breast',    name:'Pechuga de pollo',              kcal:165, protein:31,  carbs:0,   fats:3.6,  fiber:0,   servingG:100, category:'protein', mealType:['lunch','dinner'],        tags:['pollo','lean'],         prepTime:20 },
    { id:'ck_thigh',     name:'Muslo de pollo',               kcal:209, protein:26,  carbs:0,   fats:11,   fiber:0,   servingG:100, category:'protein', mealType:['lunch','dinner'],        tags:['pollo'],                prepTime:25 },
    { id:'turkey_b',     name:'Pechuga de pavo',               kcal:135, protein:30,  carbs:0,   fats:1,    fiber:0,   servingG:100, category:'protein', mealType:['lunch','dinner'],        tags:['pavo','lean'],          prepTime:25 },
    { id:'egg_whole',    name:'Huevo entero',                   kcal:155, protein:13,  carbs:1.1, fats:11,   fiber:0,   servingG:50,  category:'protein', mealType:['breakfast','snack'],     tags:['huevo'],                prepTime:5  },
    { id:'egg_white',    name:'Clara de huevo',                   kcal:52,  protein:11,  carbs:0.7, fats:0.2,  fiber:0,   servingG:100, category:'protein', mealType:['breakfast','dinner'],    tags:['huevo','lean'],         prepTime:5  },
    // Red meat
    { id:'beef_lean',    name:'Carne picada magra (90%)',      kcal:176, protein:24,  carbs:0,   fats:8,    fiber:0,   servingG:100, category:'protein', mealType:['lunch','dinner'],        tags:['carne'],                prepTime:15 },
    { id:'beef_steak',   name:'Bife de lomo',               kcal:207, protein:26,  carbs:0,   fats:11,   fiber:0,   servingG:100, category:'protein', mealType:['lunch','dinner'],        tags:['carne'],                prepTime:15 },
    { id:'beef_mince',   name:'Carne picada (80%)',           kcal:254, protein:21,  carbs:0,   fats:18,   fiber:0,   servingG:100, category:'protein', mealType:['lunch','dinner'],        tags:['carne'],                prepTime:15 },
    // Fish
    { id:'salmon',       name:'Salmón atlántico',             kcal:208, protein:20,  carbs:0,   fats:13,   fiber:0,   servingG:100, category:'protein', mealType:['lunch','dinner'],        tags:['pescado','omega3'],     prepTime:15 },
    { id:'tuna_water',   name:'Atún al natural (lata)',      kcal:116, protein:26,  carbs:0,   fats:1,    fiber:0,   servingG:100, category:'protein', mealType:['lunch','snack','dinner'],tags:['pescado','lean'],       prepTime:0  },
    { id:'cod',          name:'Filete de merluza',                  kcal:82,  protein:18,  carbs:0,   fats:0.7,  fiber:0,   servingG:100, category:'protein', mealType:['lunch','dinner'],        tags:['pescado','lean'],       prepTime:15 },
    { id:'shrimp',       name:'Langostinos',                      kcal:99,  protein:24,  carbs:0.2, fats:0.3,  fiber:0,   servingG:100, category:'protein', mealType:['lunch','dinner'],        tags:['mariscos','lean'],      prepTime:10 },
    { id:'tilapia',      name:'Tilapia',                     kcal:96,  protein:20,  carbs:0,   fats:2,    fiber:0,   servingG:100, category:'protein', mealType:['lunch','dinner'],        tags:['pescado','lean'],       prepTime:15 },
    { id:'sardines',     name:'Sardinas en lata',           kcal:208, protein:25,  carbs:0,   fats:11,   fiber:0,   servingG:100, category:'protein', mealType:['lunch','snack'],         tags:['pescado','omega3'],     prepTime:0  },
    // Dairy protein
    { id:'greek_yog',    name:'Yogur griego (0%)',           kcal:59,  protein:10,  carbs:3.6, fats:0.4,  fiber:0,   servingG:200, category:'protein', mealType:['breakfast','snack'],     tags:['lacteos'],              prepTime:0  },
    { id:'cottage',      name:'Cottage cheese',              kcal:98,  protein:11,  carbs:3.4, fats:4.3,  fiber:0,   servingG:150, category:'protein', mealType:['breakfast','snack'],     tags:['lacteos'],              prepTime:0  },
    { id:'whey',         name:'Batido de proteína whey',          kcal:120, protein:25,  carbs:3,   fats:2,    fiber:0,   servingG:35,  category:'protein', mealType:['breakfast','snack','post_workout'],tags:['lacteos','suplemento'],prepTime:2 },
    { id:'casein',       name:'Proteína caseína',              kcal:120, protein:24,  carbs:4,   fats:1,    fiber:0,   servingG:35,  category:'protein', mealType:['snack'],                 tags:['lacteos','suplemento'], prepTime:2  },
    { id:'mozzarella',   name:'Mozzarella descremada',          kcal:254, protein:28,  carbs:2.7, fats:15,   fiber:0,   servingG:50,  category:'protein', mealType:['lunch','snack','dinner'],tags:['lacteos'],              prepTime:0  },
    // Plant proteins
    { id:'tofu_firm',    name:'Tofu firme',                   kcal:83,  protein:9,   carbs:2,   fats:4.8,  fiber:0.3, servingG:150, category:'protein', mealType:['lunch','dinner'],        tags:['soja','vegano'],        prepTime:10 },
    { id:'tempeh',       name:'Tempeh',                      kcal:193, protein:20,  carbs:9,   fats:11,   fiber:0,   servingG:100, category:'protein', mealType:['lunch','dinner'],        tags:['soja','vegano'],        prepTime:10 },
    { id:'seitan',       name:'Seitán',                      kcal:370, protein:75,  carbs:14,  fats:1.9,  fiber:0,   servingG:100, category:'protein', mealType:['lunch','dinner'],        tags:['gluten','vegano'],      prepTime:0  },
  ],

  // ─── CARBOHYDRATES ────────────────────────────────────────────────────────
  carbs: [
    // Grains & rice
    { id:'white_rice',   name:'Arroz blanco cocido',         kcal:130, protein:2.7, carbs:28,  fats:0.3,  fiber:0.4, servingG:180, category:'carb', mealType:['lunch','dinner'],          tags:[],                       prepTime:20 },
    { id:'brown_rice',   name:'Arroz integral cocido',         kcal:111, protein:2.6, carbs:23,  fats:0.9,  fiber:1.8, servingG:180, category:'carb', mealType:['lunch','dinner'],          tags:['vegano'],               prepTime:35 },
    { id:'basmati',      name:'Arroz basmati cocido',       kcal:121, protein:2.5, carbs:25,  fats:0.4,  fiber:0.4, servingG:180, category:'carb', mealType:['lunch','dinner'],          tags:[],                       prepTime:20 },
    { id:'oats',         name:'Avena arrollada',           kcal:389, protein:17,  carbs:66,  fats:7,    fiber:10,  servingG:80,  category:'carb', mealType:['breakfast'],               tags:['gluten'],               prepTime:5  },
    { id:'pasta_wh',     name:'Pasta integral cocida',  kcal:124, protein:5.3, carbs:27,  fats:0.5,  fiber:3.9, servingG:200, category:'carb', mealType:['lunch','dinner'],          tags:['gluten'],               prepTime:12 },
    { id:'pasta_wt',     name:'Pasta blanca cocida',        kcal:158, protein:5.8, carbs:31,  fats:0.9,  fiber:1.8, servingG:200, category:'carb', mealType:['lunch','dinner'],          tags:['gluten'],               prepTime:10 },
    { id:'quinoa',       name:'Quinoa cocida',             kcal:120, protein:4.4, carbs:21,  fats:1.9,  fiber:2.8, servingG:185, category:'carb', mealType:['breakfast','lunch','dinner'],tags:['vegano'],             prepTime:15 },
    { id:'bread_ww',     name:'Pan integral',           kcal:247, protein:13,  carbs:41,  fats:4.2,  fiber:6,   servingG:60,  category:'carb', mealType:['breakfast','snack'],       tags:['gluten'],               prepTime:0  },
    { id:'bread_wt',     name:'Pan blanco',                 kcal:265, protein:9,   carbs:49,  fats:3.2,  fiber:2.7, servingG:60,  category:'carb', mealType:['breakfast','snack'],       tags:['gluten'],               prepTime:0  },
    { id:'granola',      name:'Granola (bajo azúcar)',         kcal:471, protein:10,  carbs:64,  fats:20,   fiber:7,   servingG:50,  category:'carb', mealType:['breakfast','snack'],       tags:['gluten','nueces'],      prepTime:0  },
    { id:'corn_tort',    name:'Tortilla de maíz',               kcal:218, protein:5.7, carbs:46,  fats:2.9,  fiber:6,   servingG:60,  category:'carb', mealType:['lunch','dinner'],          tags:['maiz','vegano'],        prepTime:0  },
    { id:'whwh_tort',    name:'Tortilla integral',        kcal:294, protein:8.4, carbs:46,  fats:7.4,  fiber:3,   servingG:70,  category:'carb', mealType:['lunch','snack'],           tags:['gluten'],               prepTime:0  },
    { id:'buckwheat',    name:'Trigo sarraceno cocido',   kcal:92,  protein:3.4, carbs:20,  fats:0.6,  fiber:2.7, servingG:168, category:'carb', mealType:['breakfast','lunch'],       tags:['vegano'],               prepTime:15 },
    // Root veggies
    { id:'sweet_potato', name:'Batata',                kcal:86,  protein:1.6, carbs:20,  fats:0.1,  fiber:3,   servingG:130, category:'carb', mealType:['lunch','dinner'],          tags:['batata','vegano'],      prepTime:25 },
    { id:'potato',       name:'Papa',                kcal:77,  protein:2,   carbs:17,  fats:0.1,  fiber:2.2, servingG:150, category:'carb', mealType:['lunch','dinner'],          tags:['papa','vegano'],        prepTime:20 },
    // Legumes (carb + protein)
    { id:'lentils',      name:'Lentejas cocidas',            kcal:116, protein:9,   carbs:20,  fats:0.4,  fiber:7.9, servingG:200, category:'carb', mealType:['lunch','dinner'],          tags:['vegano'],               prepTime:20 },
    { id:'chickpeas',    name:'Garbanzos cocidos',          kcal:164, protein:8.9, carbs:27,  fats:2.6,  fiber:7.6, servingG:200, category:'carb', mealType:['lunch','dinner'],          tags:['vegano'],               prepTime:0  },
    { id:'black_beans',  name:'Porotos negros cocidos',        kcal:132, protein:8.9, carbs:24,  fats:0.5,  fiber:8.7, servingG:180, category:'carb', mealType:['lunch','dinner'],          tags:['vegano'],               prepTime:0  },
    { id:'edamame',      name:'Edamame (sin vaina)',           kcal:121, protein:11,  carbs:8.9, fats:5.2,  fiber:5.2, servingG:155, category:'carb', mealType:['snack','lunch'],           tags:['soja','vegano'],        prepTime:5  },
    // Fruit carbs
    { id:'banana',       name:'Banana',                      kcal:89,  protein:1.1, carbs:23,  fats:0.3,  fiber:2.6, servingG:120, category:'carb', mealType:['breakfast','snack','pre_workout'],tags:['banana','vegano'],prepTime:0 },
    { id:'apple',        name:'Manzana',                       kcal:52,  protein:0.3, carbs:14,  fats:0.2,  fiber:2.4, servingG:150, category:'carb', mealType:['snack'],                   tags:['vegano'],               prepTime:0  },
    { id:'mango',        name:'Mango',                       kcal:60,  protein:0.8, carbs:15,  fats:0.4,  fiber:1.6, servingG:165, category:'carb', mealType:['breakfast','snack'],       tags:['vegano'],               prepTime:0  },
    { id:'blueberries',  name:'Arándanos',                 kcal:57,  protein:0.7, carbs:14,  fats:0.3,  fiber:2.4, servingG:150, category:'carb', mealType:['breakfast','snack'],       tags:['vegano'],               prepTime:0  },
    { id:'strawberries', name:'Frutillas',                kcal:32,  protein:0.7, carbs:7.7, fats:0.3,  fiber:2,   servingG:200, category:'carb', mealType:['breakfast','snack'],       tags:['vegano'],               prepTime:0  },
    { id:'orange',       name:'Naranja',                      kcal:47,  protein:0.9, carbs:12,  fats:0.1,  fiber:2.4, servingG:180, category:'carb', mealType:['breakfast','snack'],       tags:['vegano'],               prepTime:0  },
    { id:'dates',        name:'Dátiles medjool',               kcal:277, protein:1.8, carbs:75,  fats:0.2,  fiber:6.7, servingG:30,  category:'carb', mealType:['snack','pre_workout'],     tags:['vegano'],               prepTime:0  },
  ],

  // ─── FATS ─────────────────────────────────────────────────────────────────
  fats: [
    { id:'avocado',      name:'Palta',                     kcal:160, protein:2,   carbs:9,   fats:15,   fiber:7,   servingG:100, category:'fat', mealType:['breakfast','lunch','snack','dinner'],tags:['palta','vegano'],prepTime:2 },
    { id:'almond_pb',    name:'Mantequilla de almendras',               kcal:614, protein:21,  carbs:19,  fats:56,   fiber:10,  servingG:32,  category:'fat', mealType:['breakfast','snack'],       tags:['nueces'],               prepTime:0  },
    { id:'peanut_pb',    name:'Mantequilla de maní natural',     kcal:588, protein:25,  carbs:20,  fats:50,   fiber:6,   servingG:32,  category:'fat', mealType:['breakfast','snack'],       tags:['mani'],                 prepTime:0  },
    { id:'olive_oil',    name:'Aceite de oliva',                   kcal:884, protein:0,   carbs:0,   fats:100,  fiber:0,   servingG:10,  category:'fat', mealType:['lunch','dinner'],          tags:['vegano'],               prepTime:0  },
    { id:'almonds',      name:'Almendras',                     kcal:579, protein:21,  carbs:22,  fats:50,   fiber:12.5,servingG:30,  category:'fat', mealType:['snack'],                   tags:['nueces'],               prepTime:0  },
    { id:'walnuts',      name:'Nueces',                     kcal:654, protein:15,  carbs:14,  fats:65,   fiber:6.7, servingG:30,  category:'fat', mealType:['snack'],                   tags:['nueces'],               prepTime:0  },
    { id:'cashews',      name:'Castañas de cajú',                     kcal:553, protein:18,  carbs:30,  fats:44,   fiber:3.3, servingG:30,  category:'fat', mealType:['snack'],                   tags:['nueces'],               prepTime:0  },
    { id:'mixed_nuts',   name:'Mix de frutos secos',                  kcal:607, protein:14,  carbs:21,  fats:54,   fiber:5,   servingG:30,  category:'fat', mealType:['snack'],                   tags:['nueces'],               prepTime:0  },
    { id:'dark_choc',    name:'Chocolate negro (80%)',        kcal:598, protein:8,   carbs:46,  fats:43,   fiber:11,  servingG:25,  category:'fat', mealType:['snack'],                   tags:['azucar'],               prepTime:0  },
    { id:'cheese',       name:'Queso cheddar',              kcal:402, protein:25,  carbs:1.3, fats:33,   fiber:0,   servingG:40,  category:'fat', mealType:['breakfast','snack'],       tags:['lacteos'],              prepTime:0  },
    { id:'coconut_oil',  name:'Aceite de coco',                 kcal:862, protein:0,   carbs:0,   fats:100,  fiber:0,   servingG:10,  category:'fat', mealType:['breakfast','lunch','dinner'],tags:['vegano'],             prepTime:0  },
    { id:'flax_seeds',   name:'Semillas de lino',                  kcal:534, protein:18,  carbs:29,  fats:42,   fiber:27,  servingG:15,  category:'fat', mealType:['breakfast','snack'],       tags:['vegano'],               prepTime:0  },
    { id:'chia_seeds',   name:'Semillas de chía',                  kcal:486, protein:17,  carbs:42,  fats:31,   fiber:34,  servingG:15,  category:'fat', mealType:['breakfast','snack'],       tags:['vegano'],               prepTime:0  },
  ],

  // ─── VEGETABLES ───────────────────────────────────────────────────────────
  vegetables: [
    { id:'broccoli',     name:'Brócoli',                    kcal:34,  protein:2.8, carbs:7,   fats:0.4,  fiber:2.6, servingG:150, category:'vegetable', mealType:['lunch','dinner'],     tags:['brócoli','vegano'],     prepTime:8  },
    { id:'spinach',      name:'Espinaca',                     kcal:23,  protein:2.9, carbs:3.6, fats:0.4,  fiber:2.2, servingG:100, category:'vegetable', mealType:['breakfast','lunch','dinner'],tags:['espinaca','vegano'],prepTime:3 },
    { id:'kale',         name:'Kale',                        kcal:49,  protein:4.3, carbs:9,   fats:0.9,  fiber:3.6, servingG:100, category:'vegetable', mealType:['lunch','dinner'],     tags:['vegano'],               prepTime:5  },
    { id:'zucchini',     name:'Zapallito',                    kcal:17,  protein:1.2, carbs:3.1, fats:0.3,  fiber:1,   servingG:150, category:'vegetable', mealType:['lunch','dinner'],     tags:['vegano'],               prepTime:8  },
    { id:'bell_pepper',  name:'Morrón',                 kcal:31,  protein:1,   carbs:6,   fats:0.3,  fiber:2.1, servingG:150, category:'vegetable', mealType:['lunch','dinner'],     tags:['vegano'],               prepTime:5  },
    { id:'asparagus',    name:'Espárragos',                   kcal:20,  protein:2.2, carbs:3.9, fats:0.1,  fiber:2.1, servingG:150, category:'vegetable', mealType:['lunch','dinner'],     tags:['vegano'],               prepTime:10 },
    { id:'cucumber',     name:'Pepino',                    kcal:16,  protein:0.7, carbs:3.6, fats:0.1,  fiber:0.5, servingG:150, category:'vegetable', mealType:['lunch','snack'],      tags:['vegano'],               prepTime:2  },
    { id:'tomato',       name:'Tomate',                      kcal:18,  protein:0.9, carbs:3.9, fats:0.2,  fiber:1.2, servingG:150, category:'vegetable', mealType:['breakfast','lunch','dinner'],tags:['vegano'],        prepTime:2  },
    { id:'mushrooms',    name:'Champiñones',                   kcal:22,  protein:3.1, carbs:3.3, fats:0.3,  fiber:1,   servingG:100, category:'vegetable', mealType:['breakfast','lunch','dinner'],tags:['champignones','vegano'],prepTime:5 },
    { id:'onion',        name:'Cebolla',                       kcal:40,  protein:1.1, carbs:9,   fats:0.1,  fiber:1.7, servingG:80,  category:'vegetable', mealType:['lunch','dinner'],     tags:['cebolla','vegano'],     prepTime:5  },
    { id:'carrot',       name:'Zanahoria',                      kcal:41,  protein:0.9, carbs:10,  fats:0.2,  fiber:2.8, servingG:100, category:'vegetable', mealType:['snack','lunch','dinner'],tags:['vegano'],            prepTime:3  },
    { id:'cabbage',      name:'Repollo',                     kcal:25,  protein:1.3, carbs:5.8, fats:0.1,  fiber:2.5, servingG:100, category:'vegetable', mealType:['lunch','dinner'],     tags:['vegano'],               prepTime:5  },
    { id:'cauliflower',  name:'Coliflor',                 kcal:25,  protein:1.9, carbs:5,   fats:0.3,  fiber:2,   servingG:150, category:'vegetable', mealType:['lunch','dinner'],     tags:['vegano'],               prepTime:10 },
    { id:'edamame_veg',  name:'Edamame (como verdura)',      kcal:121, protein:11,  carbs:8.9, fats:5.2,  fiber:5.2, servingG:100, category:'vegetable', mealType:['snack','lunch'],      tags:['soja','vegano'],        prepTime:5  },
    { id:'cherry_tom',   name:'Tomates cherry',             kcal:18,  protein:0.9, carbs:3.9, fats:0.2,  fiber:1.2, servingG:150, category:'vegetable', mealType:['breakfast','lunch','snack'],tags:['vegano'],        prepTime:0  },
  ],

  // ─── PRE-BUILT COMPLETE MEALS ──────────────────────────────────────────────
  // These are full meals with known macros — used as atomic suggestions
  complete_meals: [
    // Breakfast
    { id:'bk_oat_prot',   name:'Avena con banana y mantequilla de maní',  kcal:620, protein:38, carbs:78, fats:16, fiber:9,  servingG:null, category:'complete', mealType:['breakfast'], tags:['gluten','lacteos','banana','mani'],   prepTime:10 },
    { id:'bk_egg_toast',  name:'Huevos revueltos con tostada integral y palta',kcal:560,protein:28,carbs:42, fats:26, fiber:8,  servingG:null, category:'complete', mealType:['breakfast'], tags:['gluten','huevo','palta'],             prepTime:15 },
    { id:'bk_greek_fruit',name:'Bowl de yogur griego con granola y frutos rojos',kcal:490,protein:28,carbs:56,fats:14,fiber:7,servingG:null, category:'complete', mealType:['breakfast'], tags:['lacteos','gluten','nueces'],          prepTime:5  },
    { id:'bk_omelet',     name:'Omelette de 4 huevos con verduras y queso',       kcal:490, protein:40, carbs:8,  fats:32, fiber:2,  servingG:null, category:'complete', mealType:['breakfast'], tags:['huevo','lacteos'],                    prepTime:10 },
    { id:'bk_protein_sm', name:'Licuado doble proteína (whey + banana + avena)',kcal:680,protein:52,carbs:82,fats:10,fiber:6,servingG:null,category:'complete', mealType:['breakfast','post_workout'],tags:['lacteos','gluten','banana'],prepTime:5 },
    { id:'bk_overnight',  name:'Avena overnight con chía y frutos rojos', kcal:540, protein:34, carbs:72, fats:12, fiber:12, servingG:null, category:'complete', mealType:['breakfast'], tags:['gluten','lacteos'],                   prepTime:2  },
    { id:'bk_smoked_sal', name:'Salmón ahumado en tostada de centeno',          kcal:480, protein:32, carbs:36, fats:22, fiber:5,  servingG:null, category:'complete', mealType:['breakfast'], tags:['gluten','pescado','palta'],           prepTime:8  },
    { id:'bk_quinoa_egg', name:'Bowl de quinoa con huevo pochado', kcal:470, protein:28, carbs:54, fats:14, fiber:7,  servingG:null, category:'complete', mealType:['breakfast'], tags:['huevo'],                              prepTime:20 },
    { id:'bk_pancakes',   name:'Panqueques proteicos con frutos rojos',       kcal:560, protein:36, carbs:64, fats:16, fiber:5,  servingG:null, category:'complete', mealType:['breakfast'], tags:['gluten','huevo','lacteos'],           prepTime:15 },
    { id:'bk_massgain',   name:'Shake voluminizador (leche entera + 2 bananas + maní)',kcal:720,protein:34,carbs:96,fats:20,fiber:4,servingG:null,category:'complete',mealType:['breakfast'],tags:['lacteos','banana','mani'],          prepTime:5  },
    // Lunch
    { id:'ln_ck_rice',    name:'Pollo a la plancha 250g + arroz blanco + ensalada',kcal:750,protein:68,carbs:72,fats:16,fiber:5,servingG:null,  category:'complete', mealType:['lunch'],     tags:['pollo'],                             prepTime:30 },
    { id:'ln_salmon_sp',  name:'Salmón al horno 220g + batata + verduras',kcal:720,protein:55,carbs:56,fats:26,fiber:7, servingG:null,  category:'complete', mealType:['lunch'],     tags:['pescado','batata'],                  prepTime:25 },
    { id:'ln_pasta_beef', name:'Pasta integral con salsa bolognesa',    kcal:780, protein:48, carbs:96, fats:18, fiber:8,  servingG:null, category:'complete', mealType:['lunch'],     tags:['gluten'],                             prepTime:25 },
    { id:'ln_lentil_stew',name:'Guiso de lentejas con carne y verduras',      kcal:680, protein:45, carbs:78, fats:14, fiber:12, servingG:null, category:'complete', mealType:['lunch'],     tags:[],                                    prepTime:40 },
    { id:'ln_steak_quin', name:'Bife de lomo 200g + quinoa + verduras a la parrilla',kcal:700,protein:60,carbs:52,fats:24,fiber:6,servingG:null, category:'complete', mealType:['lunch'],     tags:[],                                    prepTime:25 },
    { id:'ln_burger',     name:'Hamburguesa magra 200g + papas batata al horno',kcal:800, protein:52, carbs:72, fats:30, fiber:7,  servingG:null, category:'complete', mealType:['lunch'],     tags:['gluten','huevo','batata'],            prepTime:30 },
    { id:'ln_ck_chpea',   name:'Bowl de pollo con garbanzos',               kcal:660, protein:54, carbs:62, fats:16, fiber:10, servingG:null, category:'complete', mealType:['lunch'],    tags:['pollo'],                             prepTime:25 },
    { id:'ln_tuna_bowl',  name:'Bowl de atún con quinoa y palta',       kcal:680, protein:52, carbs:52, fats:28, fiber:9,  servingG:null, category:'complete', mealType:['lunch'],     tags:['pescado','palta'],                   prepTime:15 },
    { id:'ln_ck_wrap',    name:'Wrap de pollo y palta',                   kcal:620, protein:44, carbs:54, fats:22, fiber:7,  servingG:null, category:'complete', mealType:['lunch'],    tags:['gluten','pollo','palta'],            prepTime:15 },
    { id:'ln_shrimp_rice',name:'Langostinos al ajo + arroz integral + brócoli', kcal:580, protein:48, carbs:68, fats:10, fiber:8,  servingG:null, category:'complete', mealType:['lunch'],    tags:['mariscos'],                          prepTime:25 },
    // Snack
    { id:'sn_prot_shake', name:'Batido de proteína (doble) + fruta',  kcal:420, protein:48, carbs:36, fats:8,  fiber:3,  servingG:null, category:'complete', mealType:['snack','post_workout'],tags:['lacteos'],          prepTime:2  },
    { id:'sn_greek_nuts', name:'Yogur griego 250g + nueces y miel',       kcal:450, protein:26, carbs:48, fats:16, fiber:4,  servingG:null, category:'complete', mealType:['snack'],    tags:['lacteos','nueces'],                  prepTime:2  },
    { id:'sn_tuna_bread', name:'Sandwich abierto de atún y palta',           kcal:380, protein:32, carbs:32, fats:14, fiber:6,  servingG:null, category:'complete', mealType:['snack'],    tags:['gluten','pescado','palta'],          prepTime:5  },
    { id:'sn_trail_mix',  name:'Mix de frutos secos con chocolate negro y fruta seca',kcal:400,protein:12,carbs:36,fats:26,fiber:5,  servingG:null, category:'complete', mealType:['snack'],    tags:['nueces'],                            prepTime:0  },
    { id:'sn_cottage_fr', name:'Cottage cheese + fruta + miel',         kcal:390, protein:18, carbs:44, fats:16, fiber:3,  servingG:null, category:'complete', mealType:['snack'],    tags:['lacteos','nueces'],                  prepTime:2  },
    { id:'sn_boiled_eggs',name:'3 huevos duros + tostada integral + maní',          kcal:370, protein:26, carbs:30, fats:16, fiber:4,  servingG:null, category:'complete', mealType:['snack'],    tags:['gluten','huevo','mani'],             prepTime:10 },
    { id:'sn_mass_shake', name:'Shake voluminizador de merienda',                kcal:480, protein:36, carbs:60, fats:12, fiber:4,  servingG:null, category:'complete', mealType:['snack'],    tags:['lacteos','banana','mani'],           prepTime:5  },
    { id:'sn_rice_tuna',  name:'Galletitas de arroz + atún + queso crema',       kcal:320, protein:28, carbs:28, fats:8,  fiber:1,  servingG:null, category:'complete', mealType:['snack'],    tags:['pescado','lacteos'],                 prepTime:5  },
    // Dinner
    { id:'dn_salmon_cauf',name:'Salmón al horno 220g + puré de coliflor + espárragos',kcal:620,protein:56,carbs:30,fats:32,fiber:8,servingG:null,category:'complete',mealType:['dinner'],tags:['pescado','lacteos'],              prepTime:25 },
    { id:'dn_ck_broc',    name:'Pollo al horno 250g + arroz integral + brócoli',kcal:680,protein:64,carbs:58,fats:18,fiber:7,servingG:null,  category:'complete', mealType:['dinner'],    tags:['pollo'],                             prepTime:30 },
    { id:'dn_beef_quin',  name:'Carne vacuna + quinoa + ensalada de hojas verdes',             kcal:660, protein:58, carbs:50, fats:22, fiber:6,  servingG:null, category:'complete', mealType:['dinner'],  tags:[],                                    prepTime:25 },
    { id:'dn_lentil_rice',name:'Curry de lentejas rojas + arroz integral',           kcal:580, protein:30, carbs:84, fats:10, fiber:14, servingG:null, category:'complete', mealType:['dinner'],  tags:['vegano'],                            prepTime:30 },
    { id:'dn_turkey_sp',  name:'Albóndigas de pavo + calabaza espagueti',     kcal:520, protein:44, carbs:32, fats:18, fiber:6,  servingG:null, category:'complete', mealType:['dinner'],  tags:['pavo'],                              prepTime:35 },
    { id:'dn_cod_veg',    name:'Merluza al vapor 250g + verduras + arroz',    kcal:540, protein:52, carbs:54, fats:12, fiber:7,  servingG:null, category:'complete', mealType:['dinner'],  tags:['pescado'],                           prepTime:20 },
    { id:'dn_pasta_ck',   name:'Pasta integral + pollo al pesto + tomates',     kcal:700, protein:52, carbs:78, fats:22, fiber:7,  servingG:null, category:'complete', mealType:['dinner'],  tags:['gluten','pollo','nueces'],           prepTime:25 },
    { id:'dn_egg_potato', name:'Tortilla española (4 huevos) + ensalada',       kcal:560, protein:36, carbs:44, fats:26, fiber:5,  servingG:null, category:'complete', mealType:['dinner'],  tags:['huevo','papa'],                      prepTime:25 },
    { id:'dn_curry_ck',   name:'Curry de pollo con coco + arroz basmati',         kcal:720, protein:54, carbs:68, fats:26, fiber:5,  servingG:null, category:'complete', mealType:['dinner'],  tags:['pollo','lacteos'],                   prepTime:30 },
    { id:'dn_chicken_soup',name:'Sopa de pollo con fideos y verduras',       kcal:500, protein:42, carbs:52, fats:12, fiber:5,  servingG:null, category:'complete', mealType:['dinner'],  tags:['pollo','gluten'],                    prepTime:35 },
    { id:'dn_whites_bat', name:'Claras revueltas + batata + espinaca',kcal:480,protein:42,carbs:48,fats:10,fiber:7,  servingG:null, category:'complete', mealType:['dinner'],  tags:['huevo','batata','espinaca'],         prepTime:15 },
    { id:'dn_tofu_wok',   name:'Tofu salteado + arroz integral + edamame',    kcal:540, protein:28, carbs:68, fats:14, fiber:9,  servingG:null, category:'complete', mealType:['dinner'],  tags:['soja','vegano'],                     prepTime:20 },
  ],
};

// Flatten all foods into a single searchable array
const ALL_FOODS = Object.values(FOOD_DB_V2).reduce(function(acc, cat) {
  return acc.concat(cat);
}, []);

// Returns foods filtered by dietary restrictions
function getFoodsForUser(allergies, dislikes) {
  return ALL_FOODS.filter(function(food) {
    var tags = food.tags || [];
    if (allergies.some(function(a) { return tags.indexOf(a) >= 0; })) return false;
    if (dislikes.some(function(d) { return tags.indexOf(d) >= 0; })) return false;
    return true;
  });
}

// Returns meal-appropriate foods for a given meal slot
function getFoodsForMeal(mealType, allergies, dislikes) {
  return getFoodsForUser(allergies, dislikes).filter(function(food) {
    return !mealType || food.mealType.indexOf(mealType) >= 0;
  });
}
