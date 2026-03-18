# FitTrack

App de fitness — PWA lista para publicar en Google Play y App Store via Capacitor.

---

## 📁 Estructura del proyecto

```
fittrack/
│
├── index.html              ← HTML limpio (sin CSS ni JS inline)
├── package.json
├── vite.config.js
│
├── public/                 ← Archivos servidos estáticos (sin procesar)
│   ├── manifest.json       ← (copiá tu manifest.json acá)
│   ├── icon-192.png        ← (copiá tu ícono acá)
│   ├── sw.js               ← (copiá tu service worker acá)
│   └── js/                 ← Todo el JavaScript de la app
│       ├── utils/
│       │   ├── storage.js      ← IndexedDB + localStorage helpers
│       │   ├── debug.js        ← dbLog, dbCheckAll
│       │   └── bootstrap.js    ← bootstrap() — arranca la app
│       ├── modules/
│       │   ├── training-data.js    ← TRAINING config + CYCLE
│       │   ├── supplements-data.js ← SUPPS config + Oura sync
│       │   ├── macros.js           ← Macros, comidas, food tracking
│       │   ├── training.js         ← Sets, progresión, render
│       │   ├── supplements.js      ← Suplementos, toggles
│       │   ├── metrics.js          ← Métricas, historial, charts
│       │   ├── sleep.js            ← Sleep tracking, Oura
│       │   ├── hydration.js        ← Water tracking
│       │   ├── calendar.js         ← Calendario, deload week
│       │   ├── routine-editor.js   ← Editor de rutinas
│       │   └── setup.js            ← Wizard de onboarding
│       ├── ui/
│       │   ├── navigation.js   ← init(), showPage()
│       │   ├── ui-helpers.js   ← showToast(), applyTheme()
│       │   ├── timers.js       ← Rest timer, superset timer
│       │   ├── settings.js     ← openSettings()
│       │   ├── celebration.js  ← Confetti system
│       │   └── motivation.js   ← Daily cards, weight goal bar
│       └── ai/
│           ├── food-suggest.js ← Food suggestion (IA)
│           └── ai-routine.js   ← AI routine generator
│
└── src/
    └── styles/             ← CSS procesado por Vite
        ├── base.css        ← Variables :root + reset
        ├── layout.css      ← App shell, header, tabs
        ├── components.css  ← Cards, botones, modales
        ├── pages.css       ← Estilos por sección
        └── themes.css      ← Temas de color
```

---

## 🚀 Cómo correr el proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Copiar archivos públicos

Copiá estos archivos a la carpeta `/public/`:
- `manifest.json`
- `icon-192.png`
- `sw.js` (service worker)

### 3. Correr en desarrollo

```bash
npm run dev
```

Abrí: http://localhost:5173

### 4. Build para producción

```bash
npm run build
```

---

## 📱 Convertir a app nativa (Capacitor)

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "FitTrack" "com.tuempresa.fittrack"
npx cap add android
npx cap add ios
npm run build
npx cap sync
npx cap open android   # abre Android Studio
npx cap open ios       # abre Xcode (solo Mac)
```

---

## 🗺️ Próximos pasos

1. **Fase actual**: Monolito separado en archivos por módulo ✅
2. **Siguiente**: Pulir features, agregar las que faltan
3. **Después**: Capacitor → build nativo
4. **Publicar**: Google Play ($25 USD) + App Store ($99 USD/año)

---

## ⚠️ Por qué los JS están en /public/

Los archivos JS usan strings de HTML generado dinámicamente con comillas
que confunden a esbuild (el bundler de Vite). Al ponerlos en `/public/`,
Vite los sirve como archivos estáticos sin procesarlos, igual que el
browser original hacía con el monolito. Funciona perfecto para desarrollo
y para Capacitor.
