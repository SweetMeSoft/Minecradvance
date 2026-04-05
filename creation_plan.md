🗺️ Arquitectura de Software: Minecraft Progress Tracker
Rol: Arquitecto de Software & Diseñador UI/UX Stack Tecnológico: Angular 21 (Standalone, Signals, Control Flow), Tailwind CSS, TypeScript. Licencia Sugerida: MIT (Open Source)
1. 📖 Visión y Descripción Detallada del Proyecto
El Problema: Actualmente, los jugadores de Minecraft que intentan completar todos los logros (especialmente "Tiempo de Aventuras" o "Monstruos Cazados") se enfrentan a un gran obstáculo: el juego no te dice exactamente qué te falta. Las herramientas web existentes cumplen su función básica, pero sufren de interfaces anticuadas (estilo 2012), tipografías difíciles de leer, falta de persistencia de datos (obligando a subir el archivo cada vez) y nula integración con mapas de semillas.
La Solución: Crear Minecraft Progress Tracker, una aplicación web moderna, ultrarrápida y centrada en la experiencia del usuario (UX). Esta herramienta permitirá a los jugadores:
Rastrear su progreso sin esfuerzo: Simplemente arrastrando su archivo de guardado local (advancements.json).
Mantener su estado: La aplicación recordará su progreso localmente para futuras sesiones sin necesidad de crear cuentas ni usar bases de datos (100% privacidad del lado del cliente).
Planificar su ruta: Al integrar la semilla (seed) del mundo, los jugadores podrán saltar rápidamente a mapas interactivos externos para encontrar los biomas o estructuras que les faltan.
Disfrutar del proceso: A través de una interfaz "Modern Craft" que respeta la paleta del juego pero utiliza estándares de diseño web modernos.
2. 🎨 Sistema de Diseño y UI/UX (El enfoque "Modern Craft")
El objetivo es alejarse de la tipografía pixelada ilegible y crear una interfaz limpia que recuerde al juego mediante la paleta de colores y la iconografía oficial.
Paleta de Colores (Tailwind)
Fondo Base (Deepslate): bg-slate-950
Superficies/Tarjetas (Cobblestone/Stone): bg-slate-800 / bg-slate-900
Acentos (Esmeralda/Experiencia): text-emerald-400, bg-emerald-500
Alertas/Errores (Redstone): text-rose-500
Tipografía: Inter o Montserrat (Google Fonts). Limpia, sans-serif, excelente legibilidad.
Principios de UI
Drag & Drop Intuitivo: Una zona central enorme y punteada en la pantalla de inicio para soltar el archivo.
Feedback Visual: Barras de progreso fluidas y tarjetas que se iluminan (hover:ring-2 hover:ring-emerald-400) cuando se completa un logro.
Carga Cognitiva Baja: Agrupar logros por pestañas (Nether, End, Aventura, Biomas) en lugar de una lista infinita.
3. 🏗️ Arquitectura Técnica (Angular 21)
La aplicación será estrictamente Client-Side (sin backend) para garantizar la privacidad y velocidad, utilizando el poder de Angular Signals.
Estructura de Directorios Sugerida
src/
 ┣ app/
 ┃ ┣ core/                 # Servicios globales (Parser, LocalStorage, ExtLinkManager)
 ┃ ┣ shared/               # Componentes reutilizables (Botones, Barras de progreso)
 ┃ ┣ features/             
 ┃ ┃ ┣ dashboard/          # Resumen general y estadísticas
 ┃ ┃ ┣ biomes/             # Checklist interactivo de biomas
 ┃ ┃ ┣ advancements/       # Árbol de logros clásico
 ┃ ┃ ┗ seed-manager/       # Gestión de semilla y redirección a Chunkbase
 ┃ ┗ app.routes.ts         # Enrutamiento perezoso (Lazy loading)
 ┣ assets/
 ┃ ┣ icons/                # PNGs oficiales extraídos del .jar
 ┃ ┗ data/
 ┃   ┗ master-advancements.json # Nuestra DB estática con descripciones y datos


Gestión del Estado (Signals)
Servicio central ProgressStateService:
gameState: Signal que contiene el JSON crudo del usuario.
visitedBiomes: Computed Signal derivado de gameState.
missingBiomes: Computed Signal comparando visitedBiomes con nuestro JSON maestro.
userSeed: Signal que almacena la semilla del mundo. Persistida automáticamente en el localStorage.
4. 🚀 Flujo de Usuario (User Journey)
Onboarding: Pantalla de bienvenida que explica cómo encontrar el archivo UUID.json. Zona de Drag & Drop.
Dashboard Principal: Al soltar el archivo, se parsea, se guarda en localStorage y se muestran estadísticas generales.
Navegación Táctica: El usuario entra a "Biomas" y ve tarjetas con imágenes de los biomas faltantes.
Gestión de Mapa y Semilla (Seed): Panel donde se escribe la Seed. Al guardar, un botón prominente redirige al usuario en una nueva pestaña (https://www.chunkbase.com/apps/seed-map#seed=[SEMILLA]).
5. 🤝 Comunidad y Open Source
Este proyecto nace de la comunidad y para la comunidad. Estará alojado en GitHub de forma pública.
Contribuciones: Cualquier desarrollador podrá hacer un Fork del repositorio, proponer mejoras en la UI, agregar traducciones a otros idiomas o actualizar la base de datos de logros ante nuevas versiones de Minecraft.
Issues y Features: Los usuarios podrán reportar bugs o solicitar nuevas funcionalidades directamente en la pestaña de Issues del repositorio.
Transparencia: Al ser de código abierto y no requerir backend, los usuarios tienen la garantía de que sus archivos de guardado no se están enviando a ningún servidor externo.
6. ☕ Apoyo y Donaciones
Mantener el dominio, el hosting (aunque sea estático en Vercel/Netlify o GitHub Pages) y dedicar horas al desarrollo es un esfuerzo voluntario. Para asegurar la longevidad del proyecto, se integrarán opciones de apoyo discretas pero accesibles:
Ko-fi / Buy Me a Coffee: Un pequeño botón en el pie de página ("Invítame a una poción de velocidad ☕") para donaciones únicas.
Patreon / Sponsors: Para aquellos que deseen apoyar el mantenimiento mensual del proyecto.
Menciones Especiales: Una sección en la página de "Acerca de" donde se listarán y agradecerán los nombres de los colaboradores de código y los donantes (si así lo desean).
7. 📅 Fases de Desarrollo (Roadmap)
Fase 1: Core y Extracción de Datos
[ ] Extraer iconos del archivo .jar de Minecraft.
[ ] Crear master-advancements.json.
[ ] Configurar repositorio en GitHub, README.md para contribuidores, y proyecto Angular 21 + Tailwind.
Fase 2: Motor de Lectura y Estado
[ ] Crear FileParserService y lógica de matching.
[ ] Implementar persistencia en localStorage.
Fase 3: Interfaces y UI
[ ] Componente Drag & Drop.
[ ] Diseñar ProgressCard y Control Flow de listas.
[ ] Añadir secciones de "Apoyo" y links al repositorio.
Fase 4: Semilla y Redirección
[ ] Componente SeedManager y validación.
[ ] Enlace dinámico a Chunkbase.
