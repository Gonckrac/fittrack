// ─── FOOD DATABASE & SUGGESTIONS ─────────────────────────────────
// Porciones realistas para objetivos de 2000-3500 kcal/día
// Desayunos: 400-700 kcal | Almuerzos: 600-900 kcal | Meriendas: 250-450 kcal | Cenas: 500-800 kcal
// ─── FOOD DATABASE & SUGGESTIONS ─────────────────────────────────
// Porciones realistas — ingredientes accesibles en Argentina
// Rangos cubiertos intencionalmente para cada macro objetivo posible
// Desayunos: 300-720 kcal | Almuerzos: 500-850 kcal | Meriendas: 200-480 kcal | Cenas: 380-720 kcal
// ─── FOOD DATABASE & SUGGESTIONS ─────────────────────────────────
// Comidas argentinas reales — sin dependencia de suplementos
// Ingredientes accesibles en cualquier super/verdulería de Argentina
const FOOD_DB = [

  // ══ DESAYUNO ══════════════════════════════════════════════════════

  {name:'Huevos revueltos con jamón y tostadas',meal:'Desayuno',kcal:420,p:30,c:32,f:20,tags:['gluten','huevo','cerdo'],
   ing:'3 huevos enteros | 80g jamón cocido | 2 rebanadas pan integral (60g) | 10ml aceite | sal y pimienta',
   recipe:'1. Batir huevos con sal.\n2. Cocinar revueltos con aceite a fuego medio.\n3. Tostar el pan.\n4. Servir junto con el jamón.',tip:'Proteína completa lista en 10 minutos.'},

  {name:'Omelet de huevos con queso y vegetales',meal:'Desayuno',kcal:380,p:28,c:6,f:26,tags:['huevo','lacteos'],
   ing:'4 huevos enteros | 40g queso mozzarella | 80g espinaca | 60g tomate | 10ml aceite | sal y pimienta',
   recipe:'1. Batir huevos.\n2. Saltear espinaca y tomate 2 min.\n3. Verter huevos, agregar queso y vegetales.\n4. Doblar y cocinar 1 min más.',tip:'Casi sin carbos, ideal para corte.'},

  {name:'Tostadas con huevo frito y tomate',meal:'Desayuno',kcal:390,p:22,c:36,f:18,tags:['gluten','huevo'],
   ing:'3 huevos enteros | 2 rebanadas pan integral (60g) | 150g tomate | 10ml aceite | sal y orégano',
   recipe:'1. Freír huevos en aceite.\n2. Tostar el pan.\n3. Servir con rodajas de tomate y orégano.',tip:'El desayuno clásico de siempre.'},

  {name:'Tostadas con palta y huevo pochado',meal:'Desayuno',kcal:440,p:20,c:34,f:26,tags:['gluten','huevo','palta'],
   ing:'2 huevos | 2 rebanadas pan integral (60g) | 100g palta | sal, limón y pimienta',
   recipe:'1. Pochar huevos en agua con vinagre 3 min.\n2. Tostar el pan.\n3. Machacar palta con sal y limón.\n4. Armar.',tip:'Grasas buenas + proteína completa.'},

  {name:'Yogur natural con avena y banana',meal:'Desayuno',kcal:380,p:16,c:58,f:8,tags:['lacteos','gluten','banana'],
   ing:'200g yogur natural entero | 40g avena arrollada | 1 banana (120g) | 10g miel',
   recipe:'1. Colocar yogur en bowl.\n2. Agregar avena, banana en rodajas y miel.',tip:'Prebióticos + energía sostenida sin cocinar.'},

  {name:'Avena cocida con leche y fruta',meal:'Desayuno',kcal:350,p:14,c:56,f:8,tags:['lacteos','gluten'],
   ing:'60g avena arrollada | 250ml leche entera | 1 banana o manzana (100g) | canela | 5g miel',
   recipe:'1. Hervir leche, agregar avena y cocinar 4 min revolviendo.\n2. Servir con fruta y canela.',tip:'Fibra soluble + calcio para empezar bien.'},

  {name:'Tostadas con ricota y dulce de leche',meal:'Desayuno',kcal:400,p:18,c:52,f:12,tags:['gluten','lacteos'],
   ing:'3 rebanadas pan integral (90g) | 100g ricota | 20g dulce de leche | canela opcional',
   recipe:'1. Tostar el pan.\n2. Untar ricota.\n3. Agregar una cucharadita de dulce de leche encima.',tip:'Proteína de caseína + carbos para arrancar.'},

  {name:'Claras revueltas con verduras y tostada',meal:'Desayuno',kcal:300,p:28,c:24,f:10,tags:['gluten','huevo'],
   ing:'5 claras de huevo | 80g espinaca | 60g tomate | 60g cebolla | 1 rebanada pan integral (30g) | 10ml aceite',
   recipe:'1. Saltear cebolla, espinaca y tomate.\n2. Verter claras batidas y revolver.\n3. Servir con tostada.',tip:'Muy bajo en grasa, alto en proteína.'},

  {name:'Licuado de banana con leche y avena',meal:'Desayuno',kcal:360,p:14,c:60,f:8,tags:['lacteos','gluten','banana'],
   ing:'1 banana grande (150g) | 300ml leche entera | 40g avena | 5g miel | hielo opcional',
   recipe:'1. Licuar todo junto.\n2. Tomar inmediatamente.',tip:'Rápido y energizante para salir corriendo.'},

  {name:'Huevos duros con pan y queso',meal:'Desayuno',kcal:390,p:26,c:28,f:18,tags:['gluten','huevo','lacteos'],
   ing:'3 huevos duros | 2 rebanadas pan integral (60g) | 40g queso en lonchas | sal y pimienta',
   recipe:'1. Hervir huevos 10 min.\n2. Tostar pan con queso.\n3. Servir juntos.',tip:'Sin aceite, proteína muy limpia.'},

  {name:'Yogur griego con nueces y miel',meal:'Desayuno',kcal:360,p:22,c:28,f:16,tags:['lacteos','nueces'],
   ing:'200g yogur griego natural | 30g nueces | 15g miel | canela opcional',
   recipe:'1. Colocar yogur.\n2. Agregar nueces partidas y miel.',tip:'Proteína lenta + grasas saludables.'},

  {name:'Tostadas con mantequilla de maní y banana',meal:'Desayuno',kcal:420,p:14,c:54,f:16,tags:['gluten','mani','banana'],
   ing:'2 rebanadas pan integral (60g) | 30g mantequilla de maní | 1 banana (100g)',
   recipe:'1. Tostar el pan.\n2. Untar mantequilla de maní.\n3. Poner rodajas de banana encima.',tip:'Grasas buenas + carbos sostenidos.'},

  {name:'Revuelto de huevos con papa y cebolla',meal:'Desayuno',kcal:460,p:24,c:48,f:18,tags:['huevo','papa'],
   ing:'3 huevos enteros | 200g papa cocida | 80g cebolla | 10ml aceite | pimentón y sal',
   recipe:'1. Dorar papa en cubos con cebolla.\n2. Batir huevos y verter.\n3. Revolver hasta cuajar.',tip:'Desayuno contundente para días de mucho gasto.'},

  {name:'Tostadas con salmón y queso crema',meal:'Desayuno',kcal:400,p:28,c:28,f:18,tags:['gluten','pescado','lacteos'],
   ing:'2 rebanadas pan integral (60g) | 80g salmón ahumado | 40g queso crema | eneldo y limón',
   recipe:'1. Tostar el pan.\n2. Untar queso crema.\n3. Poner salmón y condimentar.',tip:'Omega-3 + proteína de calidad.'},

  {name:'Bowl de avena overnight con frutos rojos',meal:'Desayuno',kcal:340,p:12,c:54,f:8,tags:['gluten','lacteos'],
   ing:'60g avena | 15g chía | 200ml leche | 100g frutillas o arándanos | 10g miel',
   recipe:'1. Mezclar avena, chía y leche en frasco.\n2. Refrigerar toda la noche.\n3. Agregar frutos rojos y miel al servir.',tip:'Se prepara la noche anterior.'},

  // ══ ALMUERZO ═══════════════════════════════════════════════════════

  {name:'Milanesa de ternera al horno con puré',meal:'Almuerzo',kcal:720,p:52,c:72,f:22,tags:['gluten','huevo','papa'],
   ing:'240g nalga o peceto | 1 huevo | 50g pan rallado | 400g papa | 10g manteca | leche, sal',
   recipe:'1. Golpear la carne. Pasar por huevo y pan rallado.\n2. Hornear 22 min a 200°C.\n3. Hacer puré con papa, manteca y leche.',tip:'El clásico argentino de todos los domingos.'},

  {name:'Pechuga de pollo con arroz y ensalada',meal:'Almuerzo',kcal:580,p:58,c:52,f:12,tags:['pollo'],
   ing:'230g pechuga de pollo | 70g arroz seco | 150g lechuga + tomate + pepino | 10ml aceite | ajo, limón, pimentón',
   recipe:'1. Condimentar pechuga y hornear 28 min a 180°C.\n2. Cocinar arroz.\n3. Armar ensalada con aceite y limón.',tip:'El clásico fitness que nunca falla.'},

  {name:'Bife de cuadril con papas y ensalada',meal:'Almuerzo',kcal:650,p:54,c:48,f:24,tags:['papa'],
   ing:'220g bife de cuadril | 250g papa | 150g ensalada mixta | 15ml aceite | sal, pimienta, romero',
   recipe:'1. Cocinar bife 4 min por lado en plancha.\n2. Hornear papas en gajos 30 min.\n3. Servir con ensalada.',tip:'Hierro + zinc + carbos en un plato.'},

  {name:'Guiso de lentejas con carne y zanahoria',meal:'Almuerzo',kcal:620,p:42,c:68,f:12,tags:[],
   ing:'130g lentejas secas | 150g carne picada magra | 120g zanahoria | 80g cebolla | 80g tomate triturado | caldo, comino, laurel',
   recipe:'1. Dorar carne con cebolla.\n2. Agregar lentejas, zanahoria, tomate y caldo.\n3. Cocinar 30 min a fuego lento.',tip:'Económico, proteico y muy saciante.'},

  {name:'Pollo al horno con batata y brócoli',meal:'Almuerzo',kcal:600,p:56,c:48,f:16,tags:['pollo','batata'],
   ing:'230g pechuga o muslo de pollo | 220g batata | 200g brócoli | 15ml aceite | ajo, pimentón, romero',
   recipe:'1. Salpimentar pollo.\n2. Cortar batata en cubos.\n3. Hornear todo junto 35 min a 200°C.',tip:'Carbos complejos de batata + alta proteína.'},

  {name:'Fideos con tuco de carne casero',meal:'Almuerzo',kcal:680,p:42,c:84,f:16,tags:['gluten'],
   ing:'100g fideos secos | 180g carne picada magra | 200g tomate triturado | 60g cebolla | ajo, orégano, albahaca | 10ml aceite',
   recipe:'1. Dorar carne con ajo y cebolla.\n2. Agregar tomate y cocinar 15 min.\n3. Hervir fideos al dente.\n4. Mezclar y servir.',tip:'El plato que hace toda la Argentina.'},

  {name:'Merluza al horno con arroz y limón',meal:'Almuerzo',kcal:480,p:50,c:48,f:8,tags:['pescado'],
   ing:'250g filete de merluza | 70g arroz seco | 150g zapallito | 10ml aceite | ajo, limón, perejil',
   recipe:'1. Condimentar merluza con ajo y limón.\n2. Hornear 18 min a 180°C.\n3. Cocinar arroz y saltear zapallito.',tip:'Muy liviana, ideal para corte.'},

  {name:'Estofado de carne con papa y zanahoria',meal:'Almuerzo',kcal:640,p:46,c:60,f:20,tags:['papa'],
   ing:'220g roast beef o paleta | 280g papa | 150g zanahoria | 80g cebolla | 200ml caldo | romero, laurel',
   recipe:'1. Dorar carne. Sofreír cebolla.\n2. Agregar papa, zanahoria y caldo.\n3. Cocinar tapado 45 min a fuego suave.',tip:'Plato de olla tradicional, colágeno y proteína.'},

  {name:'Hamburguesa casera con papas al horno',meal:'Almuerzo',kcal:720,p:48,c:60,f:28,tags:['gluten'],
   ing:'200g carne picada magra | 1 pan burger integral | 250g papa | 100g lechuga y tomate | 10g mostaza',
   recipe:'1. Formar hamburguesa con sal, pimienta y ajo en polvo.\n2. Cocinar 4 min por lado.\n3. Hornear papas en bastones 25 min.',tip:'Mejor que el delivery y sabés lo que comés.'},

  {name:'Pollo saltado con arroz y vegetales',meal:'Almuerzo',kcal:580,p:50,c:60,f:14,tags:['pollo','soja'],
   ing:'200g pechuga de pollo | 80g arroz seco | 100g morrón | 80g cebolla | 80g zanahoria | 15ml salsa de soja | 10ml aceite',
   recipe:'1. Cocinar arroz.\n2. Cortar pollo en tiras y saltear a fuego fuerte.\n3. Agregar vegetales y soja.\n4. Servir sobre arroz.',tip:'Rápido, colorido y muy completo.'},

  {name:'Cazuela de garbanzos con pollo',meal:'Almuerzo',kcal:580,p:50,c:52,f:14,tags:['pollo'],
   ing:'200g pechuga de pollo | 150g garbanzos cocidos | 150g espinaca | 100g tomate triturado | 80g cebolla | comino, cúrcuma',
   recipe:'1. Dorar pollo en cubos.\n2. Sofreír cebolla con especias.\n3. Agregar tomate, garbanzos, espinaca y caldo.\n4. Cocinar 15 min.',tip:'Hierro vegetal + animal, muy nutritivo.'},

  {name:'Milanesa de pollo al horno con ensalada',meal:'Almuerzo',kcal:500,p:50,c:28,f:16,tags:['gluten','huevo','pollo'],
   ing:'230g pechuga de pollo | 1 huevo | 40g pan rallado | 200g ensalada mixta | 10ml aceite',
   recipe:'1. Empanar pechuga con huevo y pan rallado.\n2. Hornear 20 min a 200°C.\n3. Servir con ensalada.',tip:'Clásico argentino más saludable.'},

  {name:'Arroz con leche de coco y pollo',meal:'Almuerzo',kcal:640,p:48,c:72,f:16,tags:['pollo'],
   ing:'200g pechuga de pollo | 80g arroz seco | 100g morrón rojo | 80g cebolla | 80ml leche de coco | cúrcuma, ajo',
   recipe:'1. Dorar pollo y cebolla.\n2. Agregar arroz, morrón, coco y agua.\n3. Cocinar tapado 18 min.',tip:'Sabor diferente con ingredientes simples.'},

  {name:'Lomo saltado de carne con papas',meal:'Almuerzo',kcal:660,p:50,c:56,f:22,tags:['papa','soja'],
   ing:'200g lomo o cuadril | 250g papa | 100g tomate | 80g cebolla | 15ml soja | ajo, pimentón | 10ml aceite',
   recipe:'1. Freír papas en bastones.\n2. Saltear carne en tiras a fuego muy alto.\n3. Agregar tomate, cebolla y soja.\n4. Servir con papas.',tip:'Técnica de wok con ingredientes locales.'},

  {name:'Tarta de atún y huevo con ensalada',meal:'Almuerzo',kcal:540,p:36,c:44,f:22,tags:['gluten','huevo','pescado'],
   ing:'1 tapa de tarta (80g) | 2 latas atún en agua (240g) | 3 huevos | 80g cebolla | 80g morrón | sal y orégano',
   recipe:'1. Picar y saltear cebolla y morrón.\n2. Mezclar con atún y huevos batidos.\n3. Volcar sobre la tapa.\n4. Hornear 30 min a 180°C.',tip:'Clásica tarta argentina, fácil de porcionar.'},

  // ══ MERIENDA ═══════════════════════════════════════════════════════

  {name:'Pan con jamón y queso',meal:'Merienda',kcal:310,p:20,c:30,f:12,tags:['gluten','lacteos','cerdo'],
   ing:'2 rebanadas pan integral (60g) | 80g jamón cocido | 40g queso en lonchas',
   recipe:'1. Tostar el pan si se quiere.\n2. Poner jamón y queso.',tip:'El sándwich de siempre, fácil y proteico.'},

  {name:'Yogur natural con fruta y nueces',meal:'Merienda',kcal:280,p:12,c:34,f:12,tags:['lacteos','nueces'],
   ing:'200g yogur natural | 1 fruta (banana, durazno o manzana) | 25g nueces | 5g miel',
   recipe:'1. Colocar yogur.\n2. Agregar fruta picada, nueces y miel.',tip:'Rápido, saciante y sin cocinar.'},

  {name:'Huevos duros con sal y pimienta',meal:'Merienda',kcal:210,p:18,c:2,f:14,tags:['huevo'],
   ing:'3 huevos enteros | sal y pimienta | pimentón opcional',
   recipe:'1. Hervir huevos 10 min en agua.\n2. Enfriar y pelar.\n3. Condimentar.',tip:'La merienda más barata y proteica.'},

  {name:'Tostadas con queso crema y tomate',meal:'Merienda',kcal:260,p:10,c:30,f:10,tags:['gluten','lacteos'],
   ing:'2 rebanadas pan integral (60g) | 40g queso crema | 120g tomate | orégano',
   recipe:'1. Tostar el pan.\n2. Untar queso crema.\n3. Poner tomate y orégano.',tip:'Liviana y sabrosa.'},

  {name:'Ricota con miel y fruta',meal:'Merienda',kcal:260,p:16,c:32,f:8,tags:['lacteos'],
   ing:'150g ricota | 1 fruta (banana o durazno) | 10g miel | canela',
   recipe:'1. Colocar ricota en bowl.\n2. Agregar fruta y miel.',tip:'Caseína natural para saciar entre comidas.'},

  {name:'Pan con mantequilla de maní',meal:'Merienda',kcal:320,p:10,c:38,f:14,tags:['gluten','mani'],
   ing:'2 rebanadas pan integral (60g) | 30g mantequilla de maní | banana opcional',
   recipe:'1. Tostar el pan.\n2. Untar mantequilla de maní.',tip:'Energía sostenida con grasas buenas.'},

  {name:'Atún con galletitas de arroz',meal:'Merienda',kcal:240,p:28,c:18,f:6,tags:['pescado'],
   ing:'1 lata atún en agua (120g escurrido) | 6 galletitas de arroz | limón y pimienta',
   recipe:'1. Escurrir y condimentar el atún.\n2. Servir sobre las galletitas.',tip:'Proteína casi pura, muy poca grasa.'},

  {name:'Frutos secos y chocolate negro',meal:'Merienda',kcal:320,p:8,c:22,f:24,tags:['nueces'],
   ing:'30g almendras | 20g nueces | 20g maní | 20g chocolate negro 70%',
   recipe:'1. Mezclar todo en un recipiente.\n2. Comer despacio para saciarse mejor.',tip:'Magnesio, grasas buenas y antioxidantes.'},

  {name:'Licuado de leche con banana y avena',meal:'Merienda',kcal:340,p:12,c:56,f:8,tags:['lacteos','banana','gluten'],
   ing:'250ml leche | 1 banana (120g) | 30g avena | 5g miel | canela',
   recipe:'1. Licuar todo junto.\n2. Tomar frío.',tip:'Pre-entreno natural sin suplementos.'},

  {name:'Tostadas con palta y tomate',meal:'Merienda',kcal:290,p:6,c:32,f:16,tags:['gluten','palta'],
   ing:'2 rebanadas pan integral (60g) | 80g palta | 100g tomate | sal, limón y pimienta',
   recipe:'1. Tostar el pan.\n2. Machacar palta con sal y limón.\n3. Poner tomate encima.',tip:'Grasas saludables + fibra.'},

  {name:'Queso port salut con fiambres',meal:'Merienda',kcal:300,p:20,c:2,f:24,tags:['lacteos','cerdo'],
   ing:'60g queso port salut | 80g jamón serrano o cocido | tomate opcional',
   recipe:'1. Cortar queso en cubos.\n2. Servir con jamón.',tip:'Sin carbos, ideal para corte.'},

  {name:'Bowl de yogur griego con granola',meal:'Merienda',kcal:350,p:20,c:42,f:10,tags:['lacteos','gluten'],
   ing:'180g yogur griego natural | 35g granola | 80g frutillas | 5g miel',
   recipe:'1. Colocar yogur.\n2. Agregar granola, frutillas y miel.',tip:'Proteína + fibra + antioxidantes.'},

  // ══ CENA ═══════════════════════════════════════════════════════════

  {name:'Merluza al vapor con vegetales',meal:'Cena',kcal:360,p:46,c:14,f:10,tags:['pescado'],
   ing:'250g filete de merluza | 200g brócoli | 100g zanahoria | 15ml aceite de oliva | limón, ajo, perejil',
   recipe:'1. Cocinar merluza al vapor 12 min.\n2. Hervir o vapear brócoli y zanahoria.\n3. Condimentar con aceite, ajo y limón.',tip:'Muy liviana, ideal antes de dormir.'},

  {name:'Pechuga de pollo grillada con ensalada',meal:'Cena',kcal:380,p:54,c:8,f:14,tags:['pollo'],
   ing:'240g pechuga de pollo | 200g hojas verdes | 100g tomate | 80g pepino | 15ml aceite | limón',
   recipe:'1. Grillar pechuga 6 min por lado.\n2. Armar ensalada con vinagreta.',tip:'Máxima proteína, mínimos carbos para la noche.'},

  {name:'Revuelto de claras con verduras',meal:'Cena',kcal:280,p:30,c:12,f:10,tags:['huevo'],
   ing:'5 claras de huevo | 1 huevo entero | 100g espinaca | 80g tomate | 60g cebolla | 10ml aceite | cúrcuma',
   recipe:'1. Saltear cebolla, tomate y espinaca.\n2. Batir claras con el huevo.\n3. Verter y revolver hasta cuajar.',tip:'Proteína casi pura para la noche.'},

  {name:'Sopa de pollo con fideos y vegetales',meal:'Cena',kcal:420,p:40,c:40,f:10,tags:['pollo','gluten'],
   ing:'200g pechuga de pollo cocida | 50g fideos finos | 100g zanahoria | 80g apio | 80g cebolla | 1L caldo | perejil',
   recipe:'1. Hervir caldo con vegetales y pollo desmenuzado.\n2. Agregar fideos y cocinar 10 min.',tip:'Reconfortante, digestiva y baja en grasa.'},

  {name:'Bife a la plancha con ensalada verde',meal:'Cena',kcal:420,p:50,c:6,f:22,tags:[],
   ing:'200g bife de cuadril o nalga | 200g hojas verdes | 100g tomate cherry | 15ml aceite | sal, pimienta, limón',
   recipe:'1. Cocinar bife en plancha caliente 3-4 min por lado.\n2. Servir con ensalada y vinagreta.',tip:'Hierro + zinc sin carbos, perfecto para noche.'},

  {name:'Atún con pasta integral y tomate',meal:'Cena',kcal:520,p:46,c:58,f:8,tags:['gluten','pescado'],
   ing:'2 latas atún en agua (240g escurrido) | 80g pasta integral | 200g tomate triturado | ajo, orégano | 10ml aceite',
   recipe:'1. Sofreír ajo y tomate 10 min.\n2. Hervir pasta.\n3. Mezclar con atún y servir.',tip:'Económico, rápido y muy proteico.'},

  {name:'Pollo al horno con batata',meal:'Cena',kcal:520,p:52,c:44,f:14,tags:['pollo','batata'],
   ing:'220g pechuga o muslo de pollo | 200g batata | 200g brócoli | 15ml aceite | ajo, pimentón, romero',
   recipe:'1. Hornear todo junto 35 min a 200°C.\n2. Condimentar generosamente.',tip:'Carbos complejos de batata, nada de azúcares.'},

  {name:'Tortilla española con ensalada',meal:'Cena',kcal:480,p:28,c:36,f:24,tags:['huevo','papa'],
   ing:'4 huevos enteros | 250g papa | 80g cebolla | 15ml aceite | sal | 200g ensalada',
   recipe:'1. Cocinar papa y cebolla en aceite.\n2. Mezclar con huevos batidos.\n3. Cocinar a fuego bajo tapado, dar vuelta a los 8 min.',tip:'La tortilla española de siempre.'},

  {name:'Carne al horno con quinoa y ensalada',meal:'Cena',kcal:540,p:52,c:42,f:20,tags:[],
   ing:'200g lomo o peceto | 70g quinoa seca | 150g hojas verdes | 15ml aceite | vinagre y mostaza',
   recipe:'1. Condimentar carne con sal y romero.\n2. Hornear 25 min a 180°C.\n3. Cocinar quinoa 15 min.\n4. Servir con ensalada.',tip:'Aminoácidos completos de la quinoa.'},

  {name:'Cazuela de pollo con garbanzos',meal:'Cena',kcal:500,p:48,c:44,f:14,tags:['pollo'],
   ing:'200g pechuga de pollo | 120g garbanzos cocidos | 100g zanahoria | 80g zapallito | 80g tomate triturado | comino',
   recipe:'1. Dorar pollo.\n2. Agregar zanahoria, zapallito, tomate y caldo.\n3. Incorporar garbanzos.\n4. Cocinar 20 min.',tip:'Fibra + proteína en un solo plato.'},

  {name:'Wok de carne con vegetales',meal:'Cena',kcal:480,p:42,c:30,f:22,tags:['soja'],
   ing:'200g carne magra | 150g repollo + zanahoria + morrón | 80g cebolla | 20ml salsa de soja | ajo, jengibre | 10ml aceite',
   recipe:'1. Saltear carne a fuego muy alto 3 min.\n2. Agregar vegetales y revolver.\n3. Incorporar soja, ajo y jengibre.',tip:'Alto en hierro y muy sabroso.'},

  {name:'Salmón al horno con espárragos',meal:'Cena',kcal:440,p:46,c:6,f:26,tags:['pescado'],
   ing:'200g filete de salmón | 250g espárragos | 20ml aceite de oliva | ajo, limón, eneldo',
   recipe:'1. Condimentar salmón con ajo, limón y eneldo.\n2. Hornear 18 min a 180°C.\n3. Saltear espárragos con aceite.',tip:'Omega-3 casi sin carbos.'},

  {name:'Guiso de lentejas con arroz',meal:'Cena',kcal:460,p:24,c:72,f:6,tags:[],
   ing:'120g lentejas secas | 60g arroz seco | 80g cebolla | 2 dientes ajo | cúrcuma, comino | 600ml caldo',
   recipe:'1. Sofreír cebolla y ajo con especias.\n2. Agregar lentejas y caldo.\n3. Hervir 20 min.\n4. Servir con arroz cocido.',tip:'Anti-inflamatoria, saciante y económica.'},

];

const FS_ALLERGY_OPTS = [
  {id:'gluten',   label:'Gluten',       emoji:'🌾'},
  {id:'lacteos',  label:'Lácteos',      emoji:'🥛'},
  {id:'huevo',    label:'Huevo',        emoji:'🥚'},
  {id:'pescado',  label:'Pescado',      emoji:'🐟'},
  {id:'mani',     label:'Maní',         emoji:'🥜'},
  {id:'nueces',   label:'Frutos secos', emoji:'🌰'},
  {id:'soja',     label:'Soja/Tofu',    emoji:'🫘'},
  {id:'maiz',     label:'Maíz',         emoji:'🌽'},
  {id:'mariscos', label:'Mariscos',     emoji:'🦐'},
  {id:'cerdo',    label:'Cerdo',        emoji:'🐷'},
  {id:'azucar',   label:'Azúcar añadida',emoji:'🍬'},
  {id:'alcohol',  label:'Alcohol',      emoji:'🍷'},
];
const FS_DISLIKE_OPTS = [
  {id:'batata',   label:'Batata',       emoji:'🍠'},
  {id:'palta',    label:'Palta',        emoji:'🥑'},
  {id:'papa',     label:'Papa',         emoji:'🥔'},
  {id:'banana',   label:'Banana',       emoji:'🍌'},
  {id:'pavo',     label:'Pavo',         emoji:'🦃'},
  {id:'pollo',    label:'Pollo',        emoji:'🍗'},
  {id:'pescado',  label:'Pescado',      emoji:'🐟'},
  {id:'vegano',   label:'Solo vegano',  emoji:'🥦'},
  {id:'carne',    label:'Carne roja',   emoji:'🥩'},
  {id:'cebolla',  label:'Cebolla/Ajo',  emoji:'🧅'},
  {id:'brócoli',  label:'Brócoli',      emoji:'🥦'},
  {id:'espinaca', label:'Espinaca',     emoji:'🌿'},
  {id:'tofu',     label:'Tofu',         emoji:'🫘'},
  {id:'picante',  label:'Picante',      emoji:'🌶️'},
  {id:'champignones',label:'Hongos',    emoji:'🍄'},
];

var _fsMeal='all', _fsAllergies=new Set(), _fsDislikes=new Set(), _fsPrefsOpen=false, _fsOpenIdx=null;

function openFoodSuggest(){
  _fsMeal='all'; _fsOpenIdx=null;
  var prefs=(state.config&&state.config.foodPrefs)||{};
  _fsAllergies=new Set(prefs.allergies||[]);
  _fsDislikes=new Set(prefs.dislikes||[]);
  _fsPrefsOpen=false;
  document.getElementById('fsPrefsPanel').style.display='none';
  document.querySelectorAll('.fs-filter').forEach(function(b){b.classList.toggle('active',b.dataset.meal==='all');});
  _renderFsPrefs();
  _renderFoodSuggest();
  document.getElementById('foodSuggestModal').classList.add('open');
}
function fsSwitchMeal(meal,btn){
  _fsMeal=meal; _fsOpenIdx=null;
  document.querySelectorAll('.fs-filter').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  _renderFoodSuggest();
}
function fsTogglePrefs(){
  _fsPrefsOpen=!_fsPrefsOpen;
  var panel = document.getElementById('fsPrefsPanel');
  panel.style.display=_fsPrefsOpen?'':'none';
  if(_fsPrefsOpen) _renderFsPrefs();
}
function fsToggleAllergy(id){
  if(_fsAllergies.has(id))_fsAllergies.delete(id); else _fsAllergies.add(id);
  _saveFsPrefs(); _renderFsPrefs(); _fsOpenIdx=null; _renderFoodSuggest();
}
function fsToggleDislike(id){
  if(_fsDislikes.has(id))_fsDislikes.delete(id); else _fsDislikes.add(id);
  _saveFsPrefs(); _renderFsPrefs(); _fsOpenIdx=null; _renderFoodSuggest();
}
function _saveFsPrefs(){
  if(!state.config)state.config={};
  state.config.foodPrefs={allergies:[..._fsAllergies],dislikes:[..._fsDislikes]};
  saveState(state);
}
function _renderFsPrefs(){
  var total=_fsAllergies.size+_fsDislikes.size;
  var btn=document.getElementById('fsPrefsBtn');
  if(btn)btn.innerHTML='⚙ Preferencias'+(total>0?' ('+total+')':'');
  var al=FS_ALLERGY_OPTS.map(function(o){return '<button onclick="fsToggleAllergy(\''+o.id+'\')" class="fs-pref-btn'+(_fsAllergies.has(o.id)?' active-allergy':'')+'">' +o.emoji+' '+o.label+'</button>';}).join('');
var dl=FS_DISLIKE_OPTS.map(function(o){return '<button onclick="fsToggleDislike(\''+o.id+'\')" class="fs-pref-btn'+(_fsDislikes.has(o.id)?' active-dislike':'')+'">' +o.emoji+' '+o.label+'</button>';}).join('');
  var panel=document.getElementById('fsPrefsPanel');
  if(panel)panel.innerHTML=
    '<div style="font-size:10px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">🚫 Alergias / intolerancias</div>'+
    '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px">'+al+'</div>'+
    '<div style="font-size:10px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">😶 No me gusta</div>'+
    '<div style="display:flex;flex-wrap:wrap;gap:5px">'+dl+'</div>';
}
function fsTapCard(i){
  _fsOpenIdx=(_fsOpenIdx===i)?null:i;
  _renderFoodSuggest();
}

function _renderFoodSuggest(){
  var tgt=getDynamicTargets(), t=calcTotals();
  var remP=Math.max(0,tgt.prot-t.prot), remC=Math.max(0,tgt.carb-t.carb);
  var remF=Math.max(0,tgt.fat-t.fat),   remK=Math.max(0,tgt.kcal-t.kcal);

  // ── Mostrar macros restantes ──────────────────────────────────────
  var ms=document.getElementById('fsMacroStatus');
  if(ms)ms.innerHTML=
    '<div style="background:rgba(77,255,180,0.1);border:1px solid var(--green);border-radius:8px;padding:6px;text-align:center"><div style="font-size:15px;font-weight:700;color:var(--green);font-family:\'Space Mono\',monospace">'+Math.round(remP)+'g</div><div style="font-size:9px;color:var(--text3);text-transform:uppercase">Prot falta</div></div>'+
    '<div style="background:rgba(77,138,255,0.1);border:1px solid var(--accent);border-radius:8px;padding:6px;text-align:center"><div style="font-size:15px;font-weight:700;color:var(--accent);font-family:\'Space Mono\',monospace">'+Math.round(remC)+'g</div><div style="font-size:9px;color:var(--text3);text-transform:uppercase">Carbs falta</div></div>'+
    '<div style="background:rgba(255,212,77,0.1);border:1px solid var(--yellow);border-radius:8px;padding:6px;text-align:center"><div style="font-size:15px;font-weight:700;color:var(--yellow);font-family:\'Space Mono\',monospace">'+Math.round(remF)+'g</div><div style="font-size:9px;color:var(--text3);text-transform:uppercase">Grasas falta</div></div>'+
    '<div style="background:rgba(255,107,77,0.1);border:1px solid var(--red);border-radius:8px;padding:6px;text-align:center"><div style="font-size:15px;font-weight:700;color:var(--red);font-family:\'Space Mono\',monospace">'+Math.round(remK)+'</div><div style="font-size:9px;color:var(--text3);text-transform:uppercase">Kcal falta</div></div>';

  // ── Filtrar por comida y preferencias ────────────────────────────
  var pool=(_fsMeal==='all'?FOOD_DB:FOOD_DB.filter(function(f){return f.meal===_fsMeal;}))
    .filter(function(f){
      var tags=f.tags||[];
      if([..._fsAllergies].some(function(a){return tags.indexOf(a)>=0;}))return false;
      if([..._fsDislikes].some(function(d){return tags.indexOf(d)>=0;}))return false;
      return true;
    });

  // ── Límites de escala por tipo de comida (para que tenga sentido) ─
  // Cada comida puede escalar entre MIN y MAX — nunca sale de rango humano
var SCALE_LIMITS = {
    Desayuno: { min: 0.9, max: 1.1 },
    Almuerzo: { min: 0.9, max: 1.1 },
    Merienda: { min: 0.9, max: 1.1 },
    Cena:     { min: 0.9, max: 1.1 },
    Extra:    { min: 0.9, max: 1.1 }
  };

  // ── Target: si queda mucho del día, usar lo que falta / comidas restantes
  // Si queda poco, usar directamente lo que falta
  var comidasyaHechas = ['Desayuno','Almuerzo','Merienda','Cena'].filter(function(m){
    return (state[TODAY].foods||[]).some(function(f){ return f.meal===m; });
  }).length;
  var comidasRestantes = Math.max(1, 4 - comidasyaHechas);

  // Si el usuario filtra por comida específica, el target ES lo que falta total
  // Si es "all", dividimos por comidas restantes
  var targetP, targetC, targetF, targetK;
  if(_fsMeal !== 'all'){
    // Para una comida específica: target = lo que falta total
    // pero acotado a que una sola comida no puede cubrir todo si falta mucho
    var maxOneMeal = 0.65; // una comida puede cubrir máximo el 65% de lo que falta
    targetP = remP > 0 ? Math.min(remP, remP * maxOneMeal + (tgt.prot/4)*(1-maxOneMeal)) : tgt.prot/4;
    targetC = remC > 0 ? Math.min(remC, remC * maxOneMeal + (tgt.carb/4)*(1-maxOneMeal)) : tgt.carb/4;
    targetF = remF > 0 ? Math.min(remF, remF * maxOneMeal + (tgt.fat/4)*(1-maxOneMeal))  : tgt.fat/4;
    targetK = remK > 0 ? Math.min(remK, remK * maxOneMeal + (tgt.kcal/4)*(1-maxOneMeal)) : tgt.kcal/4;
  } else {
    // Vista general: target por comida = lo que falta / comidas restantes
    targetP = remP > 0 ? remP / comidasRestantes : tgt.prot / 4;
    targetC = remC > 0 ? remC / comidasRestantes : tgt.carb / 4;
    targetF = remF > 0 ? remF / comidasRestantes : tgt.fat  / 4;
    targetK = remK > 0 ? remK / comidasRestantes : tgt.kcal / 4;
  }

  // ── Scoring con escala dinámica ───────────────────────────────────
  var scored = pool.map(function(f){
    var limits = SCALE_LIMITS[f.meal] || { min:0.7, max:1.4 };

    // Encontrar el factor de escala óptimo que minimiza el error en macros
    // Prioridad: proteína (peso 3) > carbos (peso 2) > grasas (peso 1)
    // Buscamos el factor que minimiza: 3*(P*k-targetP)² + 2*(C*k-targetC)² + 1*(F*k-targetF)²
    // Solución analítica: k = (3*P*targetP + 2*C*targetC + F*targetF) / (3*P² + 2*C² + F²)
    var num = 3*f.p*targetP + 2*f.c*targetC + f.f*targetF;
    var den = 3*f.p*f.p    + 2*f.c*f.c    + f.f*f.f;
    var kOptimal = den > 0 ? num/den : 1.0;

    // Acotar al rango humano
    var k = Math.max(limits.min, Math.min(limits.max, kOptimal));

    // Macros escalados (redondeados)
    var sP = Math.round(f.p * k);
    var sC = Math.round(f.c * k);
    var sF = Math.round(f.f * k);
    var sK = Math.round(f.kcal * k);

    // Score: error relativo ponderado (más bajo = mejor match)
    var errP = targetP > 0 ? Math.abs(sP - targetP) / targetP : 0;
    var errC = targetC > 0 ? Math.abs(sC - targetC) / targetC : 0;
    var errF = targetF > 0 ? Math.abs(sF - targetF) / targetF : 0;
    var totalErr = (errP*3 + errC*2 + errF*1) / 6; // 0=perfecto, >1=muy lejos

    var score = Math.max(0, 100 - totalErr * 120);

    // Penalización si supera lo que queda del día (no tiene sentido pasarse)
    if(remK > 0 && sK > remK * 1.1) score -= 20;

    // Bonus horario leve
    var hour = new Date().getHours();
    if(f.meal==='Desayuno'&&hour>=6&&hour<11)  score += 5;
    if(f.meal==='Almuerzo'&&hour>=11&&hour<15) score += 5;
    if(f.meal==='Merienda'&&hour>=15&&hour<19) score += 5;
    if(f.meal==='Cena'&&(hour>=19||hour<3))    score += 5;

    // Generar ingredientes escalados para mostrar
    var scaledIng = _scaleIngredients(f.ing, k);

    return {
      name:f.name, meal:f.meal,
      kcal:sK, p:sP, c:sC, f:sF,
      kcalBase:f.kcal, pBase:f.p, cBase:f.c, fBase:f.f,
      tip:f.tip, ing:scaledIng, ingBase:f.ing, recipe:f.recipe,
      score:score, k:k, kOptimal:kOptimal
    };
  }).sort(function(a,b){ return b.score - a.score; }).slice(0, 10);

  var sugg = document.getElementById('fsSuggestions');
  if(!sugg) return;
  if(!scored.length){
    sugg.innerHTML='<div style="color:var(--text3);text-align:center;padding:24px">Sin resultados con tus preferencias actuales.</div>';
    return;
  }

  // ── Banner contextual ────────────────────────────────────────────
  var bannerHtml='';
  var goalLabels={cut_aggressive:'bajar peso rápido',cut:'bajar peso',maintain:'mantener peso',lean_bulk:'ganar músculo limpio',bulk:'volumen'};
  var userGoalLabel=(state.config&&state.config.goal)?(goalLabels[state.config.goal]||'tu objetivo'):'tu objetivo';
  if(remK > 50){
    var mealLabel = _fsMeal !== 'all' ? 'para esta comida' : 'por comida (~'+comidasRestantes+' restante'+(comidasRestantes!==1?'s':'')+')';
    bannerHtml='<div style="background:rgba(77,138,255,0.08);border:1px solid rgba(77,138,255,0.25);border-radius:10px;padding:10px 12px;margin-bottom:10px;font-size:11px;color:var(--text2);line-height:1.8">'+
      '🎯 <strong>'+userGoalLabel+'</strong>: '+tgt.kcal+' kcal · '+tgt.prot+'g P · '+tgt.carb+'g C · '+tgt.fat+'g G<br>'+
      '📊 Te faltan hoy: <strong style="color:var(--green)">'+Math.round(remP)+'g P</strong> · <strong style="color:var(--accent)">'+Math.round(remC)+'g C</strong> · <strong style="color:var(--yellow)">'+Math.round(remF)+'g G</strong><br>'+
      '⚡ Las porciones se ajustaron '+mealLabel+' para acercarse a lo que falta.</div>';
  } else if(remK <= 0){
    bannerHtml='<div style="background:rgba(77,255,180,0.08);border:1px solid rgba(77,255,180,0.25);border-radius:10px;padding:10px 12px;margin-bottom:10px;font-size:11px;color:var(--green)">✅ Ya alcanzaste tu objetivo calórico del día ('+tgt.kcal+' kcal). ¡Bien hecho!</div>';
  }

  var mealEmoji={Desayuno:'🌅',Almuerzo:'☀️',Merienda:'🍎',Cena:'🌙',Extra:'⚡'};

  sugg.innerHTML = bannerHtml + scored.map(function(f, i){
    var open = (_fsOpenIdx === i);
    var recipeSafe = (f.recipe||'').replace(/\n/g,'<br>');

    // Mostrar badge de ajuste si la porción cambió significativamente
    var scalePct = Math.round((f.k - 1) * 100);
    var scaleBadge = '';
    if(Math.abs(scalePct) >= 8){
      var scaleColor = scalePct > 0 ? 'var(--green)' : 'var(--yellow)';
      var scaleLabel = scalePct > 0 ? '↑ porción +'+scalePct+'%' : '↓ porción '+scalePct+'%';
      scaleBadge = '<span style="font-size:9px;color:'+scaleColor+';background:rgba(255,255,255,0.06);border-radius:4px;padding:1px 5px;margin-left:4px">'+scaleLabel+'</span>';
    }

    var ingLines = (f.ing||'').split('|')
      .map(function(x){return x.trim();})
      .filter(function(x){return x.length>0;})
      .map(function(x){return '• '+x;})
      .join('<br>');

    return '<div class="fs-card" style="'+(open?'border-color:var(--accent);':'')+'">' +
      '<div onclick="fsTapCard('+i+')" style="display:flex;justify-content:space-between;align-items:flex-start;cursor:pointer">' +
        '<div style="flex:1">' +
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">' +
            '<span style="font-size:10px;color:var(--text3)">'+(mealEmoji[f.meal]||'🍽')+' '+f.meal+'</span>' +
            scaleBadge +
          '</div>' +
          '<div class="fs-card-name">'+f.name+'</div>' +
          '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:4px">' +
            '<span class="fs-macro-pill" style="background:rgba(77,255,180,0.12);color:var(--green)">P '+f.p+'g</span>' +
            '<span class="fs-macro-pill" style="background:rgba(77,138,255,0.12);color:var(--accent)">C '+f.c+'g</span>' +
            '<span class="fs-macro-pill" style="background:rgba(255,212,77,0.12);color:var(--yellow)">G '+f.f+'g</span>' +
            '<span class="fs-macro-pill" style="background:rgba(255,107,77,0.12);color:var(--red)">'+f.kcal+' kcal</span>' +
          '</div>' +
        '</div>' +
        '<div style="margin-left:8px;color:var(--text3);font-size:16px;flex-shrink:0;padding-top:2px">'+(open?'▴':'▾')+'</div>' +
      '</div>' +
      (open ?
        '<div style="margin-top:10px;border-top:1px solid var(--border);padding-top:10px">' +
          '<div style="font-size:11px;color:var(--accent);margin-bottom:6px">💡 '+f.tip+'</div>' +
          '<div style="font-size:10px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">🧂 Ingredientes (porción ajustada):</div>' +
          '<div style="background:var(--bg4);border-radius:8px;padding:8px;margin-bottom:8px;font-size:11px;color:var(--text2);line-height:1.8">'+ingLines+'</div>' +
          '<div style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:5px">📋 Preparación:</div>' +
          '<div style="font-size:11px;color:var(--text2);line-height:1.8">'+recipeSafe+'</div>' +
          '<button class="btn btn-primary" style="width:100%;margin-top:10px;font-size:12px" ' +
            'onclick="fsAddFood(\''+f.name.replace(/'/g,"\\'")+'_MEAL_'+f.meal+'_MACRO_'+f.p+'_'+f.c+'_'+f.f+'_'+f.kcal+'_END\')">+ Agregar a mi día</button>' +
        '</div>'
      : '') +
    '</div>';
  }).join('');
}

// ── Escalar ingredientes con cantidades numéricas ─────────────────
function _scaleIngredients(ing, k){
  if(!ing) return ing;
  if(Math.abs(k - 1) < 0.08) return ing; // si el cambio es < 8%, no tocar
  return ing.replace(/(\d+(?:\.\d+)?)\s*(g|ml|kg|l|cdas?|cda|cdita|scoops?|unidades?)/gi, function(match, num, unit){
    var scaled = Math.round(parseFloat(num) * k);
    // Redondear a múltiplos sensatos según la unidad
    if(unit.toLowerCase().startsWith('g') && scaled > 20){
      scaled = Math.round(scaled / 5) * 5; // múltiplo de 5g
    } else if(unit.toLowerCase().startsWith('ml') && scaled > 50){
      scaled = Math.round(scaled / 25) * 25; // múltiplo de 25ml
    }
    return scaled + unit;
  });
}

function fsAddFood(packed){
  var m=packed.match(/^(.+)_MEAL_(.+)_MACRO_(\d+)_(\d+)_(\d+)_(\d+)_END$/);
  if(!m){showToast('Error al agregar');return;}
  var name=m[1],meal=m[2],p=+m[3],c=+m[4],f=+m[5],kcal=+m[6];
  if(!state[TODAY].foods)state[TODAY].foods=[];
  state[TODAY].foods.push({id:Date.now().toString(), name:name, meal:meal, prot:p, carb:c, fat:f});
  saveState(state); renderMeals(); renderHome();
  closeModal('foodSuggestModal');
  showToast('✓ '+name+' agregado');
}