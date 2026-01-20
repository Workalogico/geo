/* ═══════════════════════════════════════════════════════════════
   WORKALÓGICO MAPBOX COMPONENT
   Mapa interactivo para presentaciones de Geointeligencia
   Integración compatible con Reveal.js
   ═══════════════════════════════════════════════════════════════ */

// Configuración de Mapbox (token público)
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmVpcG93ZXIiLCJhIjoiY21ramJnZTB0MTRhMTNpcTJnd2JqZnJweSJ9.qmANnQ95bOvYiKdQa1wFgw';

// Centro de Colima, México
const COLIMA_CENTER = [-103.7250, 19.2433];
const COLIMA_ZOOM = 12;

// Configuración de colores Workalógico
const WO_COLORS = {
  blue: '#5968EA',
  yellow: '#FFCB00',
  danger: '#FF6B6B',
  success: '#10B981',
  dark: '#0F0F1A',
  surface: '#252542'
};

// ═══════════════════════════════════════════════════════════════
// WORKALÓGICO MAPBOX STYLE v2.1 (Inline Theme)
// Tema oscuro optimizado para UI/UX y Accesibilidad
// 
// Mejoras aplicadas:
// - Contraste WCAG AA en todas las etiquetas
// - Paleta CVD-friendly (evita rojo-verde puro)
// - Jerarquía visual por luminosidad
// - Halos de texto más robustos
// - Categorización clara de POIs
// ═══════════════════════════════════════════════════════════════
const WO_MAPBOX_STYLE = {
  version: 8,
  name: "Workalógico Dark v2.1",
  metadata: {
    "wo:version": "2.1",
    "wo:description": "Tema oscuro accesible para geointeligencia",
    "wo:wcag": "AA"
  },
  sprite: "mapbox://sprites/mapbox/dark-v11",
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  sources: {
    composite: {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8"
    }
  },
  layers: [
    // ═══════════════════════════════════════════════════════════════
    // BACKGROUND & BASE LAYERS
    // ═══════════════════════════════════════════════════════════════
    { 
      id: "background", 
      type: "background", 
      paint: { "background-color": "#0F0F1A" }  // Dark pero no negro puro
    },
    
    // ═══════════════════════════════════════════════════════════════
    // LAND USE (Opacidades sutiles, CVD-safe)
    // ═══════════════════════════════════════════════════════════════
    {
      id: "landuse-park",
      type: "fill",
      source: "composite",
      "source-layer": "landuse",
      filter: ["==", ["get", "class"], "park"],
      paint: { 
        "fill-color": "rgba(52, 211, 153, 0.12)",  // Teal/esmeralda CVD-safe
        "fill-outline-color": "rgba(52, 211, 153, 0.25)" 
      }
    },
    {
      id: "landuse-commercial",
      type: "fill",
      source: "composite",
      "source-layer": "landuse",
      filter: ["==", ["get", "class"], "commercial"],
      paint: { 
        "fill-color": "rgba(99, 102, 241, 0.10)",  // Indigo
        "fill-outline-color": "rgba(99, 102, 241, 0.20)" 
      }
    },
    {
      id: "landuse-industrial",
      type: "fill",
      source: "composite",
      "source-layer": "landuse",
      filter: ["==", ["get", "class"], "industrial"],
      paint: { 
        "fill-color": "#12121F",
        "fill-outline-color": "rgba(99, 102, 241, 0.1)"
      }
    },
    
    // ═══════════════════════════════════════════════════════════════
    // WATER
    // ═══════════════════════════════════════════════════════════════
    { 
      id: "water", 
      type: "fill", 
      source: "composite", 
      "source-layer": "water", 
      paint: { "fill-color": "#0A1628" }  // Ligeramente más oscuro que fondo
    },
    {
      id: "waterway",
      type: "line",
      source: "composite",
      "source-layer": "waterway",
      paint: {
        "line-color": "#0A1628",
        "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.5, 14, 2]
      }
    },
    
    // ═══════════════════════════════════════════════════════════════
    // BUILDINGS (2D y 3D)
    // ═══════════════════════════════════════════════════════════════
    {
      id: "building-fill",
      type: "fill",
      source: "composite",
      "source-layer": "building",
      minzoom: 14,
      paint: { 
        "fill-color": "#1A1A2E", 
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 15, 0.6, 17, 0.8] 
      }
    },
    {
      id: "building-outline",
      type: "line",
      source: "composite",
      "source-layer": "building",
      minzoom: 15,
      paint: { 
        "line-color": "rgba(99, 102, 241, 0.25)",  // Más visible
        "line-width": 0.5 
      }
    },
    {
      id: "building-3d",
      type: "fill-extrusion",
      source: "composite",
      "source-layer": "building",
      minzoom: 15,
      paint: {
        "fill-extrusion-color": "#1A1A2E",
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": ["get", "min_height"],
        "fill-extrusion-opacity": 0.65,
        "fill-extrusion-ambient-occlusion-intensity": 0.3
      }
    },
    
    // ═══════════════════════════════════════════════════════════════
    // ROADS (Jerarquía por luminosidad - más importante = más brillante)
    // ═══════════════════════════════════════════════════════════════
    {
      id: "road-path",
      type: "line",
      source: "composite",
      "source-layer": "road",
      filter: ["==", ["get", "class"], "path"],
      paint: { 
        "line-color": "#1E1E35", 
        "line-width": 1,
        "line-dasharray": [2, 2]
      },
      layout: { "line-cap": "round", "line-join": "round" }
    },
    {
      id: "road-street",
      type: "line",
      source: "composite",
      "source-layer": "road",
      filter: ["match", ["get", "class"], ["street", "street_limited"], true, false],
      paint: { 
        "line-color": "#252542", 
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 12, 0.5, 14, 2, 18, 8] 
      },
      layout: { "line-cap": "round", "line-join": "round" }
    },
    {
      id: "road-secondary-tertiary",
      type: "line",
      source: "composite",
      "source-layer": "road",
      filter: ["match", ["get", "class"], ["secondary", "tertiary"], true, false],
      paint: { 
        "line-color": "#2F2F50",  // Más luminoso
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 10, 0.75, 14, 3, 18, 12] 
      },
      layout: { "line-cap": "round", "line-join": "round" }
    },
    {
      id: "road-primary",
      type: "line",
      source: "composite",
      "source-layer": "road",
      filter: ["==", ["get", "class"], "primary"],
      paint: { 
        "line-color": "#3A3A65",  // Más luminoso
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 8, 1, 14, 4, 18, 16] 
      },
      layout: { "line-cap": "round", "line-join": "round" }
    },
    {
      id: "road-trunk",
      type: "line",
      source: "composite",
      "source-layer": "road",
      filter: ["==", ["get", "class"], "trunk"],
      paint: { 
        "line-color": "rgba(99, 102, 241, 0.45)",
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 6, 0.5, 12, 3, 18, 18] 
      },
      layout: { "line-cap": "round", "line-join": "round" }
    },
    {
      id: "road-motorway-glow",
      type: "line",
      source: "composite",
      "source-layer": "road",
      filter: ["==", ["get", "class"], "motorway"],
      paint: { 
        "line-color": "rgba(99, 102, 241, 0.12)",
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 3, 12, 12, 18, 40],
        "line-blur": 4
      },
      layout: { "line-cap": "round", "line-join": "round" }
    },
    {
      id: "road-motorway",
      type: "line",
      source: "composite",
      "source-layer": "road",
      filter: ["==", ["get", "class"], "motorway"],
      paint: { 
        "line-color": "rgba(99, 102, 241, 0.55)",
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 0.75, 12, 4, 18, 20] 
      },
      layout: { "line-cap": "round", "line-join": "round" }
    },
    
    // ═══════════════════════════════════════════════════════════════
    // RAIL (Amber - más visible que yellow puro)
    // ═══════════════════════════════════════════════════════════════
    {
      id: "rail-glow",
      type: "line",
      source: "composite",
      "source-layer": "road",
      filter: ["match", ["get", "class"], ["major_rail", "minor_rail"], true, false],
      paint: { 
        "line-color": "rgba(251, 191, 36, 0.12)",
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 4, 16, 10],
        "line-blur": 3
      }
    },
    {
      id: "rail",
      type: "line",
      source: "composite",
      "source-layer": "road",
      filter: ["match", ["get", "class"], ["major_rail", "minor_rail"], true, false],
      paint: { 
        "line-color": "rgba(251, 191, 36, 0.40)",  // Amber
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.5, 16, 2], 
        "line-dasharray": [3, 3] 
      }
    },
    
    // ═══════════════════════════════════════════════════════════════
    // BOUNDARIES
    // ═══════════════════════════════════════════════════════════════
    {
      id: "admin-country",
      type: "line",
      source: "composite",
      "source-layer": "admin",
      filter: ["all", ["==", ["get", "admin_level"], 0], ["==", ["get", "maritime"], 0]],
      paint: {
        "line-color": "rgba(129, 140, 248, 0.6)",
        "line-width": 1.5,
        "line-dasharray": [2, 2]
      }
    },
    {
      id: "admin-state",
      type: "line",
      source: "composite",
      "source-layer": "admin",
      filter: ["all", ["==", ["get", "admin_level"], 1], ["==", ["get", "maritime"], 0]],
      paint: {
        "line-color": "rgba(129, 140, 248, 0.35)",
        "line-width": 1,
        "line-dasharray": [3, 2]
      }
    },
    
    // ═══════════════════════════════════════════════════════════════
    // POIs (Diferenciación clara por categoría - CVD-safe)
    // ═══════════════════════════════════════════════════════════════
    // Retail/Comercial - Indigo
    {
      id: "poi-retail",
      type: "circle",
      source: "composite",
      "source-layer": "poi_label",
      filter: ["match", ["get", "class"], ["food_and_drink", "shop", "commercial_services"], true, false],
      minzoom: 14,
      paint: { 
        "circle-color": "rgba(99, 102, 241, 0.7)",
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 14, 2, 18, 6], 
        "circle-stroke-color": "#818CF8",  // Más brillante
        "circle-stroke-width": 1.5
      }
    },
    // Servicios (hospital, escuela) - Cyan (CVD-safe vs azul)
    {
      id: "poi-services",
      type: "circle",
      source: "composite",
      "source-layer": "poi_label",
      filter: ["match", ["get", "class"], ["hospital", "school", "college"], true, false],
      minzoom: 12,
      paint: { 
        "circle-color": "rgba(34, 211, 238, 0.7)",  // Cyan
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 3, 18, 8], 
        "circle-stroke-color": "#67E8F9",
        "circle-stroke-width": 1.5
      }
    },
    // Landmarks - Amarillo brand
    {
      id: "poi-landmark",
      type: "circle",
      source: "composite",
      "source-layer": "poi_label",
      filter: ["match", ["get", "class"], ["landmark", "park", "attraction"], true, false],
      minzoom: 12,
      paint: { 
        "circle-color": "rgba(251, 191, 36, 0.8)",  // Amber
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 3, 18, 8], 
        "circle-stroke-color": "#FCD34D",
        "circle-stroke-width": 1.5
      }
    },
    
    // ═══════════════════════════════════════════════════════════════
    // LABELS (WCAG AA Compliant - mínimo 4.5:1 contraste)
    // ═══════════════════════════════════════════════════════════════
    // Ciudad - Máximo contraste
    {
      id: "place-label-city",
      type: "symbol",
      source: "composite",
      "source-layer": "place_label",
      filter: ["==", ["get", "class"], "city"],
      layout: {
        "text-field": ["coalesce", ["get", "name_es"], ["get", "name"]],
        "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 4, 12, 8, 18, 12, 26],
        "text-transform": "uppercase",
        "text-letter-spacing": 0.08,
        "text-max-width": 10
      },
      paint: { 
        "text-color": "#FFFFFF",  // 15.3:1 ratio
        "text-halo-color": "rgba(15, 15, 26, 0.9)", 
        "text-halo-width": 2,
        "text-halo-blur": 0.5
      }
    },
    // Pueblo/Town
    {
      id: "place-label-town",
      type: "symbol",
      source: "composite",
      "source-layer": "place_label",
      filter: ["==", ["get", "class"], "town"],
      layout: {
        "text-field": ["coalesce", ["get", "name_es"], ["get", "name"]],
        "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 6, 10, 10, 14, 14, 20],
        "text-transform": "uppercase",
        "text-letter-spacing": 0.05
      },
      paint: { 
        "text-color": "#E2E8F0",  // 11.7:1 ratio
        "text-halo-color": "rgba(15, 15, 26, 0.9)", 
        "text-halo-width": 1.5
      }
    },
    // Colonia/Neighborhood
    {
      id: "place-label-neighborhood",
      type: "symbol",
      source: "composite",
      "source-layer": "place_label",
      filter: ["==", ["get", "class"], "neighbourhood"],
      minzoom: 12,
      layout: {
        "text-field": ["coalesce", ["get", "name_es"], ["get", "name"]],
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 12, 10, 16, 14],
        "text-letter-spacing": 0.02
      },
      paint: { 
        "text-color": "#A5B4C8",  // 6.2:1 ratio (mejorado)
        "text-halo-color": "rgba(15, 15, 26, 0.9)", 
        "text-halo-width": 1.5
      }
    },
    // Suburb
    {
      id: "place-label-suburb",
      type: "symbol",
      source: "composite",
      "source-layer": "place_label",
      filter: ["==", ["get", "class"], "suburb"],
      minzoom: 10,
      layout: {
        "text-field": ["coalesce", ["get", "name_es"], ["get", "name"]],
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 10, 11, 14, 15]
      },
      paint: { 
        "text-color": "#A5B4C8", 
        "text-halo-color": "rgba(15, 15, 26, 0.9)", 
        "text-halo-width": 1.5
      }
    },
    // Calles
    {
      id: "road-label-primary",
      type: "symbol",
      source: "composite",
      "source-layer": "road",
      filter: ["match", ["get", "class"], ["primary", "trunk", "motorway"], true, false],
      minzoom: 12,
      layout: {
        "text-field": ["coalesce", ["get", "name_es"], ["get", "name"]],
        "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 12, 10, 16, 13],
        "symbol-placement": "line",
        "text-max-angle": 30
      },
      paint: { 
        "text-color": "#7A8A9E",  // 4.6:1 ratio (justo AA)
        "text-halo-color": "rgba(15, 15, 26, 0.9)", 
        "text-halo-width": 1.5
      }
    },
    {
      id: "road-label-secondary",
      type: "symbol",
      source: "composite",
      "source-layer": "road",
      filter: ["match", ["get", "class"], ["secondary", "tertiary"], true, false],
      minzoom: 14,
      layout: {
        "text-field": ["coalesce", ["get", "name_es"], ["get", "name"]],
        "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 14, 9, 18, 12],
        "symbol-placement": "line",
        "text-max-angle": 30
      },
      paint: { 
        "text-color": "#7A8A9E", 
        "text-halo-color": "rgba(15, 15, 26, 0.9)", 
        "text-halo-width": 1.5
      }
    },
    // POI Labels
    {
      id: "poi-label",
      type: "symbol",
      source: "composite",
      "source-layer": "poi_label",
      minzoom: 15,
      layout: {
        "text-field": ["coalesce", ["get", "name_es"], ["get", "name"]],
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
        "text-size": 11,
        "text-offset": [0, 1.2],
        "text-anchor": "top"
      },
      paint: { 
        "text-color": "#CBD5E1",  // 8.5:1 ratio
        "text-halo-color": "rgba(15, 15, 26, 0.9)", 
        "text-halo-width": 1.5
      }
    },
    // Water labels
    {
      id: "water-label",
      type: "symbol",
      source: "composite",
      "source-layer": "natural_label",
      filter: ["match", ["get", "class"], ["water", "bay", "ocean", "sea"], true, false],
      layout: {
        "text-field": ["coalesce", ["get", "name_es"], ["get", "name"]],
        "text-font": ["DIN Pro Italic", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 6, 10, 12, 14],
        "text-letter-spacing": 0.2
      },
      paint: {
        "text-color": "rgba(100, 149, 237, 0.7)",  // Cornflower blue
        "text-halo-color": "#0A1628",
        "text-halo-width": 1
      }
    }
  ],
  // ═══════════════════════════════════════════════════════════════
  // LIGHTING (Sutil, no agresivo)
  // ═══════════════════════════════════════════════════════════════
  light: { 
    anchor: "viewport", 
    color: "#6366F1",  // Indigo
    intensity: 0.12 
  },
  // ═══════════════════════════════════════════════════════════════
  // FOG (Profundidad atmosférica)
  // ═══════════════════════════════════════════════════════════════
  fog: {
    "color": "#0F0F1A",
    "high-color": "#1A1A2E",
    "horizon-blend": 0.08,
    "space-color": "#0F0F1A",
    "star-intensity": 0
  }
};

// ═══════════════════════════════════════════════════════════════
// ESCALAS DE COLOR PARA DATOS (CVD-Friendly)
// ═══════════════════════════════════════════════════════════════
const WO_MAP_SCALES = {
  // Escala secuencial: Azul oscuro → Amarillo (para densidad, población, etc.)
  sequential: [
    '#312E81',  // 0%   - Indigo muy oscuro
    '#4338CA',  // 25%  - Indigo
    '#6366F1',  // 50%  - Indigo claro
    '#FBBF24',  // 75%  - Amber
    '#FDE047'   // 100% - Yellow brillante
  ],
  
  // Escala divergente CVD-safe: Cyan ↔ Neutro ↔ Naranja (para comparaciones)
  divergent: [
    '#06B6D4',  // Negativo/bajo - Cyan
    '#64748B',  // Neutro - Slate
    '#F97316'   // Positivo/alto - Orange
  ],
  
  // Escala categórica CVD-safe (para tipos distintos)
  categorical: [
    '#6366F1',  // Indigo
    '#22D3EE',  // Cyan
    '#FBBF24',  // Amber
    '#F97316',  // Orange
    '#A78BFA',  // Violet
    '#34D399'   // Emerald
  ],
  
  // Scoring optimizado (evita rojo-verde, usa azul-amarillo)
  scoring: {
    low: '#4338CA',      // Indigo (bajo score)
    midLow: '#6366F1',   // Indigo claro
    mid: '#A5B4FC',      // Indigo muy claro
    midHigh: '#FBBF24',  // Amber
    high: '#FFCB00'      // Yellow brand (alto score)
  },
  
  // Competencia/Riesgo (naranja en lugar de rojo)
  risk: {
    low: '#6366F1',      // Azul
    medium: '#FBBF24',   // Amber
    high: '#F97316'      // Orange (no rojo)
  }
};

// Clase principal del componente
class WoMapbox {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.map = null;
    this.layers = {
      scoring: false,
      competencia: false,
      isocronas: false,
      poblacion: false
    };
    this.currentZone = null;
    this.options = {
      center: options.center || COLIMA_CENTER,
      zoom: options.zoom || COLIMA_ZOOM,
      style: options.style || 'workalogico', // 'workalogico' | 'mapbox://styles/...' | custom object
      interactive: options.interactive !== false,
      showControls: options.showControls !== false,
      showLegend: options.showLegend !== false,
      pitch: options.pitch || 0,
      bearing: options.bearing || 0,
      ...options
    };
    
    this.init();
  }

  async init() {
    // Mostrar loading
    this.showLoading();
    
    // Crear estructura HTML
    this.createStructure();
    
    // Inicializar mapa (solo si Mapbox está disponible)
    if (typeof mapboxgl !== 'undefined') {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      await this.initMap();
    } else {
      // Fallback: mostrar mapa estático simulado
      this.showStaticFallback();
    }
  }

  createStructure() {
    this.container.innerHTML = `
      <div class="wo-map-container animate-in">
        <div id="wo-mapbox-map"></div>
        
        ${this.options.showControls ? `
        <div class="wo-map-controls">
          <button class="wo-map-layer-btn" data-layer="scoring">
            <span class="indicator"></span>
            Scoring
          </button>
          <button class="wo-map-layer-btn" data-layer="competencia">
            <span class="indicator"></span>
            Competencia
          </button>
          <button class="wo-map-layer-btn" data-layer="isocronas">
            <span class="indicator"></span>
            Isócronas
          </button>
          <button class="wo-map-layer-btn" data-layer="poblacion">
            <span class="indicator"></span>
            Población
          </button>
        </div>
        ` : ''}
        
        <div class="wo-map-info-panel hidden">
          <div class="wo-map-info-panel__header">
            <h4 class="wo-map-info-panel__title">Zona Centro</h4>
            <div class="wo-map-info-panel__score">
              <div class="wo-score-gauge">
                <svg viewBox="0 0 60 60">
                  <defs>
                    <!-- Gradiente CVD-friendly: Indigo (bajo) → Amarillo (alto) -->
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#4338CA" />
                      <stop offset="50%" stop-color="#A5B4FC" />
                      <stop offset="100%" stop-color="${WO_COLORS.yellow}" />
                    </linearGradient>
                  </defs>
                  <circle class="wo-score-gauge__bg" cx="30" cy="30" r="25" />
                  <circle class="wo-score-gauge__fill" cx="30" cy="30" r="25" />
                </svg>
              </div>
              <div>
                <div class="wo-map-info-panel__score-value">87</div>
                <div class="wo-map-info-panel__score-label">Score</div>
              </div>
            </div>
          </div>
          <div class="wo-map-info-panel__metrics">
            <div class="wo-map-info-panel__metric">
              <div class="wo-map-info-panel__metric-value">45K</div>
              <div class="wo-map-info-panel__metric-label">Población</div>
            </div>
            <div class="wo-map-info-panel__metric">
              <div class="wo-map-info-panel__metric-value">$18K</div>
              <div class="wo-map-info-panel__metric-label">Ingreso prom.</div>
            </div>
            <div class="wo-map-info-panel__metric">
              <div class="wo-map-info-panel__metric-value">12</div>
              <div class="wo-map-info-panel__metric-label">Competidores</div>
            </div>
            <div class="wo-map-info-panel__metric">
              <div class="wo-map-info-panel__metric-value">0.42</div>
              <div class="wo-map-info-panel__metric-label">HHI</div>
            </div>
          </div>
        </div>
        
        ${this.options.showLegend ? `
        <div class="wo-map-legend">
          <div class="wo-map-legend__title">Scoring de Ubicación</div>
          <div class="wo-map-legend__gradient"></div>
          <div class="wo-map-legend__labels">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
        ` : ''}
        
        <div class="wo-map-loading">
          <div class="wo-map-loading__spinner"></div>
          <div class="wo-map-loading__text">Cargando mapa...</div>
        </div>
      </div>
    `;
    
    // Bind eventos de controles
    if (this.options.showControls) {
      this.bindControlEvents();
    }
  }

  async initMap() {
    try {
      // Resolve style: use Workalógico theme if 'workalogico' is specified
      const resolvedStyle = this.options.style === 'workalogico' 
        ? WO_MAPBOX_STYLE 
        : this.options.style;
      
      this.map = new mapboxgl.Map({
        container: 'wo-mapbox-map',
        style: resolvedStyle,
        center: this.options.center,
        zoom: this.options.zoom,
        pitch: this.options.pitch,
        bearing: this.options.bearing,
        interactive: this.options.interactive,
        attributionControl: false,
        antialias: true
      });

      this.map.on('load', () => {
        this.hideLoading();
        this.addDataSources();
        this.addLayers();
        this.addInteractions();
      });
    } catch (error) {
      console.error('Error inicializando Mapbox:', error);
      this.showStaticFallback();
    }
  }

  addDataSources() {
    // Fuente: Zonas de scoring (polígonos)
    this.map.addSource('zonas-scoring', {
      type: 'geojson',
      data: this.generateScoringData()
    });

    // Fuente: Competencia (puntos)
    this.map.addSource('competencia', {
      type: 'geojson',
      data: this.generateCompetenciaData()
    });

    // Fuente: Isócronas
    this.map.addSource('isocronas', {
      type: 'geojson',
      data: this.generateIsochroneData()
    });

    // Fuente: Densidad de población (heatmap)
    this.map.addSource('poblacion', {
      type: 'geojson',
      data: this.generatePoblacionData()
    });
  }

  addLayers() {
    // ═══════════════════════════════════════════════════════════════
    // CAPAS DE DATOS - CVD-Friendly (evita rojo-verde)
    // ═══════════════════════════════════════════════════════════════
    
    // Capa: Scoring de zonas (choropleth) - Escala azul→amarillo
    this.map.addLayer({
      id: 'zonas-scoring-fill',
      type: 'fill',
      source: 'zonas-scoring',
      layout: { visibility: 'none' },
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'score'],
          0,   '#4338CA',  // Indigo (bajo) - CVD-safe
          25,  '#6366F1',  // Indigo claro
          50,  '#A5B4FC',  // Indigo muy claro (neutro)
          75,  '#FBBF24',  // Amber
          100, '#FFCB00'   // Yellow brand (alto)
        ],
        'fill-opacity': 0.65
      }
    });

    // Capa: Bordes de zonas (más visibles)
    this.map.addLayer({
      id: 'zonas-scoring-line',
      type: 'line',
      source: 'zonas-scoring',
      layout: { visibility: 'none' },
      paint: {
        'line-color': '#818CF8',  // Indigo brillante
        'line-width': 1.5,
        'line-opacity': 0.9
      }
    });

    // Capa: Competencia (círculos) - Naranja en lugar de rojo (CVD-safe)
    this.map.addLayer({
      id: 'competencia-points',
      type: 'circle',
      source: 'competencia',
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': 8,
        'circle-color': '#F97316',     // Orange (CVD-safe vs rojo)
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FED7AA', // Orange claro
        'circle-opacity': 0.85
      }
    });

    // Capa: Isócronas (polígonos) - Escala secuencial CVD-safe
    this.map.addLayer({
      id: 'isocronas-fill',
      type: 'fill',
      source: 'isocronas',
      layout: { visibility: 'none' },
      paint: {
        'fill-color': [
          'match',
          ['get', 'minutes'],
          5,  '#6366F1',  // 5 min - Indigo (más cercano)
          10, '#A5B4FC',  // 10 min - Indigo claro
          15, '#FBBF24',  // 15 min - Amber (más lejano)
          '#6366F1'
        ],
        'fill-opacity': 0.25
      }
    });

    this.map.addLayer({
      id: 'isocronas-line',
      type: 'line',
      source: 'isocronas',
      layout: { visibility: 'none' },
      paint: {
        'line-color': [
          'match',
          ['get', 'minutes'],
          5,  '#818CF8',  // Indigo brillante
          10, '#C7D2FE',  // Indigo muy claro
          15, '#FCD34D',  // Amber brillante
          '#818CF8'
        ],
        'line-width': 2,
        'line-dasharray': [2, 2]
      }
    });

    // Capa: Densidad de población (heatmap) - Escala azul→amarillo
    this.map.addLayer({
      id: 'poblacion-heatmap',
      type: 'heatmap',
      source: 'poblacion',
      layout: { visibility: 'none' },
      paint: {
        'heatmap-weight': ['get', 'density'],
        'heatmap-intensity': 1,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,   'rgba(15, 15, 26, 0)',       // Transparente
          0.2, 'rgba(99, 102, 241, 0.25)',  // Indigo bajo
          0.4, 'rgba(99, 102, 241, 0.50)',  // Indigo medio
          0.6, 'rgba(251, 191, 36, 0.65)',  // Amber
          0.8, 'rgba(251, 191, 36, 0.85)',  // Amber alto
          1,   '#FFCB00'                     // Yellow brand
        ],
        'heatmap-radius': 30,
        'heatmap-opacity': 0.75
      }
    });

    // Punto central (ubicación propuesta)
    this.map.addLayer({
      id: 'centro-point',
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: this.options.center
          }
        }
      },
      paint: {
        'circle-radius': 12,
        'circle-color': WO_COLORS.yellow,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#fff'
      }
    });

    // Pulso animado en el centro
    this.addPulseAnimation();
  }

  addPulseAnimation() {
    // Añadir capa de pulso
    this.map.addLayer({
      id: 'centro-pulse',
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: this.options.center
          }
        }
      },
      paint: {
        'circle-radius': 12,
        'circle-color': WO_COLORS.yellow,
        'circle-opacity': 0.4
      }
    }, 'centro-point');

    // Animar pulso
    let radius = 12;
    let opacity = 0.4;
    let growing = true;

    const animate = () => {
      if (growing) {
        radius += 0.5;
        opacity -= 0.01;
        if (radius >= 30) growing = false;
      } else {
        radius -= 0.5;
        opacity += 0.01;
        if (radius <= 12) growing = true;
      }

      if (this.map && this.map.getLayer('centro-pulse')) {
        this.map.setPaintProperty('centro-pulse', 'circle-radius', radius);
        this.map.setPaintProperty('centro-pulse', 'circle-opacity', Math.max(0, opacity));
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  addInteractions() {
    // Click en zonas de scoring
    this.map.on('click', 'zonas-scoring-fill', (e) => {
      if (e.features.length > 0) {
        const feature = e.features[0];
        this.showZoneInfo(feature.properties);
      }
    });

    // Hover en zonas
    this.map.on('mouseenter', 'zonas-scoring-fill', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'zonas-scoring-fill', () => {
      this.map.getCanvas().style.cursor = '';
    });

    // Click en competencia
    this.map.on('click', 'competencia-points', (e) => {
      if (e.features.length > 0) {
        const feature = e.features[0];
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <strong>${feature.properties.name}</strong><br>
            <span style="color: #94A3B8">${feature.properties.type}</span>
          `)
          .addTo(this.map);
      }
    });
  }

  bindControlEvents() {
    const buttons = this.container.querySelectorAll('.wo-map-layer-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const layer = btn.dataset.layer;
        this.toggleLayer(layer);
        btn.classList.toggle('active');
      });
    });
  }

  toggleLayer(layerName) {
    this.layers[layerName] = !this.layers[layerName];
    const visibility = this.layers[layerName] ? 'visible' : 'none';

    const layerMap = {
      scoring: ['zonas-scoring-fill', 'zonas-scoring-line'],
      competencia: ['competencia-points'],
      isocronas: ['isocronas-fill', 'isocronas-line'],
      poblacion: ['poblacion-heatmap']
    };

    if (layerMap[layerName] && this.map) {
      layerMap[layerName].forEach(layer => {
        if (this.map.getLayer(layer)) {
          this.map.setLayoutProperty(layer, 'visibility', visibility);
        }
      });
    }
  }

  // Activar capa programáticamente (para animaciones de Reveal.js)
  activateLayer(layerName, delay = 0) {
    setTimeout(() => {
      if (!this.layers[layerName]) {
        this.toggleLayer(layerName);
        const btn = this.container.querySelector(`[data-layer="${layerName}"]`);
        if (btn) btn.classList.add('active');
      }
    }, delay);
  }

  showZoneInfo(properties) {
    const panel = this.container.querySelector('.wo-map-info-panel');
    if (!panel) return;

    // Actualizar contenido
    panel.querySelector('.wo-map-info-panel__title').textContent = properties.name || 'Zona';
    panel.querySelector('.wo-map-info-panel__score-value').textContent = properties.score || 0;

    const metrics = panel.querySelectorAll('.wo-map-info-panel__metric-value');
    if (metrics.length >= 4) {
      metrics[0].textContent = this.formatNumber(properties.population) || '-';
      metrics[1].textContent = '$' + this.formatNumber(properties.income) || '-';
      metrics[2].textContent = properties.competitors || '-';
      metrics[3].textContent = properties.hhi?.toFixed(2) || '-';
    }

    // Animar gauge
    const gauge = panel.querySelector('.wo-score-gauge__fill');
    if (gauge) {
      const score = properties.score || 0;
      const circumference = 157; // 2 * PI * 25
      const offset = circumference - (score / 100 * circumference);
      gauge.style.strokeDashoffset = offset;
    }

    // Mostrar panel
    panel.classList.remove('hidden');
  }

  hideZoneInfo() {
    const panel = this.container.querySelector('.wo-map-info-panel');
    if (panel) panel.classList.add('hidden');
  }

  showLoading() {
    const loading = this.container?.querySelector('.wo-map-loading');
    if (loading) loading.style.display = 'flex';
  }

  hideLoading() {
    const loading = this.container?.querySelector('.wo-map-loading');
    if (loading) loading.style.display = 'none';
  }

  showStaticFallback() {
    // Mostrar imagen estática como fallback
    const mapDiv = this.container.querySelector('#wo-mapbox-map');
    if (mapDiv) {
      mapDiv.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, ${WO_COLORS.dark} 0%, ${WO_COLORS.surface} 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #94A3B8;
          font-family: 'DM Sans', sans-serif;
        ">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          <p style="margin-top: 16px; font-size: 0.9rem;">Mapa interactivo de Colima</p>
          <p style="margin-top: 4px; font-size: 0.75rem; color: #64748B;">Datos de demostración</p>
        </div>
      `;
    }
    this.hideLoading();
  }

  formatNumber(num) {
    if (!num) return null;
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  }

  // ═══════════════════════════════════════════════════════════════
  // GENERADORES DE DATOS DE DEMOSTRACIÓN
  // ═══════════════════════════════════════════════════════════════

  generateScoringData() {
    // Polígonos simplificados de zonas en Colima
    const zones = [
      {
        name: 'Centro Histórico',
        score: 87,
        population: 45000,
        income: 18500,
        competitors: 12,
        hhi: 0.42,
        coords: [
          [-103.730, 19.248],
          [-103.720, 19.248],
          [-103.720, 19.238],
          [-103.730, 19.238],
          [-103.730, 19.248]
        ]
      },
      {
        name: 'Jardines del Sol',
        score: 72,
        population: 32000,
        income: 22000,
        competitors: 8,
        hhi: 0.35,
        coords: [
          [-103.720, 19.248],
          [-103.710, 19.248],
          [-103.710, 19.238],
          [-103.720, 19.238],
          [-103.720, 19.248]
        ]
      },
      {
        name: 'Real de Minas',
        score: 65,
        population: 28000,
        income: 15000,
        competitors: 15,
        hhi: 0.28,
        coords: [
          [-103.740, 19.248],
          [-103.730, 19.248],
          [-103.730, 19.238],
          [-103.740, 19.238],
          [-103.740, 19.248]
        ]
      },
      {
        name: 'Villa de Álvarez',
        score: 91,
        population: 52000,
        income: 24000,
        competitors: 6,
        hhi: 0.55,
        coords: [
          [-103.735, 19.258],
          [-103.720, 19.258],
          [-103.720, 19.248],
          [-103.735, 19.248],
          [-103.735, 19.258]
        ]
      },
      {
        name: 'Lomas Verdes',
        score: 78,
        population: 18000,
        income: 28000,
        competitors: 4,
        hhi: 0.62,
        coords: [
          [-103.710, 19.258],
          [-103.700, 19.258],
          [-103.700, 19.248],
          [-103.710, 19.248],
          [-103.710, 19.258]
        ]
      },
      {
        name: 'Industrial',
        score: 45,
        population: 12000,
        income: 12000,
        competitors: 3,
        hhi: 0.18,
        coords: [
          [-103.750, 19.238],
          [-103.740, 19.238],
          [-103.740, 19.228],
          [-103.750, 19.228],
          [-103.750, 19.238]
        ]
      }
    ];

    return {
      type: 'FeatureCollection',
      features: zones.map(zone => ({
        type: 'Feature',
        properties: {
          name: zone.name,
          score: zone.score,
          population: zone.population,
          income: zone.income,
          competitors: zone.competitors,
          hhi: zone.hhi
        },
        geometry: {
          type: 'Polygon',
          coordinates: [zone.coords]
        }
      }))
    };
  }

  generateCompetenciaData() {
    const competitors = [
      { name: 'Competidor A', type: 'Restaurante', coords: [-103.726, 19.244] },
      { name: 'Competidor B', type: 'Restaurante', coords: [-103.722, 19.246] },
      { name: 'Competidor C', type: 'Fast Food', coords: [-103.728, 19.241] },
      { name: 'Competidor D', type: 'Cafetería', coords: [-103.718, 19.243] },
      { name: 'Competidor E', type: 'Restaurante', coords: [-103.732, 19.245] },
      { name: 'Competidor F', type: 'Fast Food', coords: [-103.715, 19.248] },
      { name: 'Competidor G', type: 'Restaurante', coords: [-103.724, 19.252] },
      { name: 'Competidor H', type: 'Cafetería', coords: [-103.730, 19.250] }
    ];

    return {
      type: 'FeatureCollection',
      features: competitors.map(c => ({
        type: 'Feature',
        properties: { name: c.name, type: c.type },
        geometry: { type: 'Point', coordinates: c.coords }
      }))
    };
  }

  generateIsochroneData() {
    const center = this.options.center;
    
    // Generar círculos aproximados para isócronas
    const createCircle = (center, radiusKm, points = 64) => {
      const coords = [];
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        const dx = radiusKm / 111 * Math.cos(angle); // ~111km por grado
        const dy = radiusKm / 111 * Math.sin(angle);
        coords.push([center[0] + dx, center[1] + dy]);
      }
      return coords;
    };

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { minutes: 15 },
          geometry: { type: 'Polygon', coordinates: [createCircle(center, 3)] }
        },
        {
          type: 'Feature',
          properties: { minutes: 10 },
          geometry: { type: 'Polygon', coordinates: [createCircle(center, 2)] }
        },
        {
          type: 'Feature',
          properties: { minutes: 5 },
          geometry: { type: 'Polygon', coordinates: [createCircle(center, 1)] }
        }
      ]
    };
  }

  generatePoblacionData() {
    // Generar puntos aleatorios con densidad variable
    const points = [];
    const center = this.options.center;
    
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 0.03;
      const lng = center[0] + distance * Math.cos(angle);
      const lat = center[1] + distance * Math.sin(angle);
      
      // Densidad mayor en el centro
      const density = 1 - (distance / 0.03) * 0.7 + Math.random() * 0.3;
      
      points.push({
        type: 'Feature',
        properties: { density },
        geometry: { type: 'Point', coordinates: [lng, lat] }
      });
    }

    return { type: 'FeatureCollection', features: points };
  }

  // Destruir mapa (limpieza para Reveal.js)
  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// INTEGRACIÓN CON REVEAL.JS
// ═══════════════════════════════════════════════════════════════

let woMapInstance = null;

function initWoMap(containerId, options = {}) {
  // Destruir instancia anterior si existe
  if (woMapInstance) {
    woMapInstance.destroy();
  }
  
  woMapInstance = new WoMapbox(containerId, options);
  return woMapInstance;
}

function destroyWoMap() {
  if (woMapInstance) {
    woMapInstance.destroy();
    woMapInstance = null;
  }
}

// Función para activar capas secuencialmente (útil para presentaciones)
function revealMapLayers(sequence = ['scoring', 'competencia', 'isocronas'], delay = 800) {
  if (!woMapInstance) return;
  
  sequence.forEach((layer, index) => {
    woMapInstance.activateLayer(layer, index * delay);
  });
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.WoMapbox = WoMapbox;
  window.initWoMap = initWoMap;
  window.destroyWoMap = destroyWoMap;
  window.revealMapLayers = revealMapLayers;
}
