/* ═══════════════════════════════════════════════════════════════
   WORKALÓGICO WOOS DIAGRAM COMPONENT
   Sistema Ascendente - Diagrama de 4 fases para Growth/Metodología
   Versión: 1.0.0
   
   Uso:
   const diagram = new WoWoosDiagram('container-id', {
     preset: 'growth',  // o 'methodology', 'custom'
     autoPlay: true,
     animationSpeed: 600
   });
   ═══════════════════════════════════════════════════════════════ */

// IIFE para evitar conflicto de nombres globales con otros componentes
(function() {
  'use strict';

  // Función para leer tokens CSS del DOM (evita valores hardcodeados)
  const getTokens = () => {
    if (typeof document === 'undefined' || !document.documentElement) {
      return {
        blue: '#5968EA',
        yellow: '#FFCB00',
        dark: '#1a1a1e',
        surface: '#333333',
        text: '#FFFFFF',
        textMuted: '#dadada'
      };
    }
    const style = getComputedStyle(document.documentElement);
    return {
      blue: style.getPropertyValue('--wo-blue-lab').trim() || '#5968EA',
      yellow: style.getPropertyValue('--wo-yellow-spark').trim() || '#FFCB00',
      dark: style.getPropertyValue('--wo-dark').trim() || '#1a1a1e',
      surface: style.getPropertyValue('--wo-dark-surface').trim() || '#333333',
      text: style.getPropertyValue('--wo-text').trim() || '#FFFFFF',
      textMuted: style.getPropertyValue('--wo-text-secondary').trim() || '#dadada'
    };
  };

  // Colores de marca (usando tokens CSS dinámicos)
  const WOOS_COLORS = getTokens();

  // Configuraciones predefinidas
  const WOOS_PRESETS = {
    // Sistema Ascendente estándar (Growth Tesis)
    growth: {
      title: 'Sistema Ascendente WoOS',
      phases: [
        { id: 'nucleo', label: 'NÚCLEO', sublabel: 'Claridad', icon: '🎯', color: 'blue' },
        { id: 'espiral', label: 'ESPIRAL', sublabel: 'Hoja de ruta viva', icon: '🌀', color: 'blue' },
        { id: 'elevacion', label: 'ELEVACIÓN', sublabel: 'Producto tangible', icon: '🚀', color: 'yellow' },
        { id: 'expansion', label: 'EXPANSIÓN', sublabel: 'Escala sostenida', icon: '🌐', color: 'yellow' }
      ]
    },
    
    // Metodología de proyecto
    methodology: {
      title: 'Metodología de Desarrollo',
      phases: [
        { id: 'discovery', label: 'DISCOVERY', sublabel: 'Diagnóstico', icon: '🔍', color: 'blue' },
        { id: 'architecture', label: 'ARCHITECTURE', sublabel: 'Roadmap', icon: '📐', color: 'blue' },
        { id: 'execution', label: 'EXECUTION', sublabel: 'Build & Deploy', icon: '⚡', color: 'yellow' },
        { id: 'scale', label: 'SCALE', sublabel: 'Amplificación', icon: '📈', color: 'yellow' }
      ]
    },
    
    // Ciclo de vida de producto
    product: {
      title: 'Ciclo de Producto',
      phases: [
        { id: 'research', label: 'RESEARCH', sublabel: 'Investigación', icon: '🔬', color: 'blue' },
        { id: 'design', label: 'DESIGN', sublabel: 'Prototipo', icon: '✏️', color: 'blue' },
        { id: 'build', label: 'BUILD', sublabel: 'Desarrollo', icon: '🔨', color: 'yellow' },
        { id: 'launch', label: 'LAUNCH', sublabel: 'Go-to-market', icon: '🚀', color: 'yellow' }
      ]
    }
  };

  /**
   * Clase principal del componente WoOS Diagram
   */
  class WoWoosDiagram {
    constructor(containerId, options = {}) {
      this.containerId = containerId;
      this.container = document.getElementById(containerId);
      
      if (!this.container) {
        console.error('[WoWoosDiagram] Container not found:', containerId);
        return;
      }
      
      // Configuración
      this.preset = options.preset || 'growth';
      this.config = options.phases ? { phases: options.phases } : (WOOS_PRESETS[this.preset] || WOOS_PRESETS.growth);
      
      this.options = {
        width: options.width || 900,
        height: options.height || 300,
        nodeRadius: options.nodeRadius || 42,
        pulseRadius: options.pulseRadius || 48,
        autoPlay: options.autoPlay !== false,
        animationSpeed: options.animationSpeed || 600,
        staggerDelay: options.staggerDelay || 350,
        pathAnimationDuration: options.pathAnimationDuration || 2000,
        variant: options.variant || 'standard', // 'standard' | 'compact'
        ...options
      };
      
      // Estado
      this.isAnimated = false;
      this.svg = null;
      this.path = null;
      this.phases = [];
      
      this.init();
    }
    
    /**
     * Inicializa el diagrama
     */
    init() {
      this.container.classList.add('wo-woos-container', `wo-woos--${this.options.variant}`);
      this.createSVG();
      this.createGradients();
      this.createPath();
      this.createPhases();
      
      // Mostrar inmediatamente (sin animación inicial)
      this.showAll();
      
      // Si autoPlay está activo, animar al entrar en viewport
      if (this.options.autoPlay) {
        this.setupIntersectionObserver();
      }
    }
    
    /**
     * Calcula las posiciones de los nodos en arco ascendente
     */
    getPositions() {
      const { width, height, nodeRadius } = this.options;
      const count = this.config.phases.length;
      const padding = nodeRadius + 30;
      const usableWidth = width - (padding * 2);
      const stepX = usableWidth / (count - 1);
      
      // Crear arco ascendente
      const positions = [];
      const baseY = height - 100; // Y base (abajo)
      const peakY = 80; // Y más alto
      
      for (let i = 0; i < count; i++) {
        const x = padding + (stepX * i);
        // Curva ascendente progresiva
        const progress = i / (count - 1);
        const y = baseY - (progress * (baseY - peakY));
        positions.push({ x, y });
      }
      
      return positions;
    }
    
    /**
     * Crea el elemento SVG principal
     */
    createSVG() {
      const { width, height } = this.options;
      const svgNS = 'http://www.w3.org/2000/svg';
      
      this.svg = document.createElementNS(svgNS, 'svg');
      this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      this.svg.setAttribute('class', 'wo-woos-svg');
      this.svg.setAttribute('aria-label', this.config.title || 'Sistema Ascendente WoOS');
      
      this.container.appendChild(this.svg);
    }
    
    /**
     * Crea los gradientes para el path
     */
    createGradients() {
      const svgNS = 'http://www.w3.org/2000/svg';
      const defs = document.createElementNS(svgNS, 'defs');
      
      defs.innerHTML = `
        <linearGradient id="woosGradient-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${WOOS_COLORS.blue}"/>
          <stop offset="45%" stop-color="${WOOS_COLORS.blue}"/>
          <stop offset="55%" stop-color="${WOOS_COLORS.yellow}"/>
          <stop offset="100%" stop-color="${WOOS_COLORS.yellow}"/>
        </linearGradient>
        <filter id="woosGlow-${this.containerId}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      `;
      
      this.svg.appendChild(defs);
    }
    
    /**
     * Crea el path curvo que conecta los nodos
     */
    createPath() {
      const svgNS = 'http://www.w3.org/2000/svg';
      const positions = this.getPositions();
      
      // Crear path con curvas Bézier suaves
      let pathD = `M ${positions[0].x} ${positions[0].y}`;
      
      for (let i = 0; i < positions.length - 1; i++) {
        const curr = positions[i];
        const next = positions[i + 1];
        
        // Puntos de control para curva suave
        const cpX1 = curr.x + (next.x - curr.x) * 0.5;
        const cpY1 = curr.y;
        const cpX2 = curr.x + (next.x - curr.x) * 0.5;
        const cpY2 = next.y;
        
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
      }
      
      this.path = document.createElementNS(svgNS, 'path');
      this.path.setAttribute('d', pathD);
      this.path.setAttribute('class', 'wo-woos-path');
      this.path.setAttribute('stroke', `url(#woosGradient-${this.containerId})`);
      this.path.setAttribute('fill', 'none');
      
      this.svg.appendChild(this.path);
      
      // Guardar longitud del path para animación
      const pathLength = this.path.getTotalLength();
      this.path.style.setProperty('--path-length', pathLength);
      this.pathLength = pathLength;
    }
    
    /**
     * Crea los nodos de las fases
     */
    createPhases() {
      const svgNS = 'http://www.w3.org/2000/svg';
      const positions = this.getPositions();
      const { nodeRadius, pulseRadius } = this.options;
      
      this.config.phases.forEach((phase, i) => {
        const pos = positions[i];
        const colorClass = phase.color === 'yellow' ? 'wo-woos-phase--yellow' : 'wo-woos-phase--blue';
        
        const g = document.createElementNS(svgNS, 'g');
        g.setAttribute('class', `wo-woos-phase ${colorClass}`);
        g.setAttribute('data-id', phase.id);
        g.setAttribute('data-index', i);
        g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
        
        // Círculo de pulso (exterior)
        const pulse = document.createElementNS(svgNS, 'circle');
        pulse.setAttribute('class', 'wo-woos-phase__pulse');
        pulse.setAttribute('r', pulseRadius);
        pulse.setAttribute('cx', 0);
        pulse.setAttribute('cy', 0);
        g.appendChild(pulse);
        
        // Círculo principal
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('class', 'wo-woos-phase__circle');
        circle.setAttribute('r', nodeRadius);
        circle.setAttribute('cx', 0);
        circle.setAttribute('cy', 0);
        g.appendChild(circle);
        
        // Icono emoji
        const icon = document.createElementNS(svgNS, 'text');
        icon.setAttribute('class', 'wo-woos-phase__icon');
        icon.setAttribute('x', 0);
        icon.setAttribute('y', 8);
        icon.textContent = phase.icon;
        g.appendChild(icon);
        
        // Label principal
        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('class', 'wo-woos-phase__label');
        label.setAttribute('x', 0);
        label.setAttribute('y', nodeRadius + 22);
        label.textContent = phase.label;
        g.appendChild(label);
        
        // Sublabel
        const sublabel = document.createElementNS(svgNS, 'text');
        sublabel.setAttribute('class', 'wo-woos-phase__sublabel');
        sublabel.setAttribute('x', 0);
        sublabel.setAttribute('y', nodeRadius + 38);
        sublabel.textContent = phase.sublabel;
        g.appendChild(sublabel);
        
        this.svg.appendChild(g);
        this.phases.push(g);
      });
    }
    
    /**
     * Muestra todos los elementos inmediatamente (sin animación)
     */
    showAll() {
      // Mostrar path
      this.path.style.strokeDashoffset = '0';
      this.path.classList.remove('wo-woos-path--animated');
      
      // Mostrar todas las fases
      this.phases.forEach(phase => {
        phase.classList.add('wo-woos-phase--visible');
      });
    }
    
    /**
     * Configura animación al entrar en viewport
     */
    setupIntersectionObserver() {
      if (!('IntersectionObserver' in window)) {
        return;
      }
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isAnimated) {
            this.animate();
            this.isAnimated = true;
          }
        });
      }, { threshold: 0.3 });
      
      observer.observe(this.container);
    }
    
    /**
     * Ejecuta la animación completa
     */
    animate() {
      // Reiniciar estado
      this.reset();
      
      // Usar Anime.js si está disponible
      if (typeof anime !== 'undefined') {
        this.animateWithAnime();
      } else {
        this.animateWithCSS();
      }
    }
    
    /**
     * Animación con Anime.js (preferida)
     */
    animateWithAnime() {
      const { animationSpeed, staggerDelay, pathAnimationDuration } = this.options;
      
      const tl = anime.timeline({
        easing: 'easeOutExpo'
      });
      
      // 1. Animar el path
      tl.add({
        targets: this.path,
        strokeDashoffset: [this.pathLength, 0],
        duration: pathAnimationDuration,
        easing: 'easeInOutCubic'
      });
      
      // 2. Animar cada fase con stagger
      this.phases.forEach((phase, i) => {
        tl.add({
          targets: phase,
          opacity: [0, 1],
          duration: animationSpeed,
          easing: 'easeOutQuad',
          begin: () => {
            phase.classList.add('wo-woos-phase--visible');
          }
        }, 400 + (i * staggerDelay));
        
        // Animar el círculo (scale effect via radius)
        const circle = phase.querySelector('.wo-woos-phase__circle');
        if (circle) {
          tl.add({
            targets: circle,
            r: [0, this.options.nodeRadius],
            duration: animationSpeed * 0.8,
            easing: 'easeOutBack'
          }, 400 + (i * staggerDelay));
        }
      });
    }
    
    /**
     * Animación CSS fallback
     */
    animateWithCSS() {
      const { staggerDelay } = this.options;
      
      // Animar path
      this.path.classList.add('wo-woos-path--animated', 'wo-woos-path--draw');
      
      // Animar fases con delay
      this.phases.forEach((phase, i) => {
        setTimeout(() => {
          phase.classList.add('wo-woos-phase--visible');
        }, 400 + (i * staggerDelay));
      });
    }
    
    /**
     * Reinicia el estado para re-animar
     */
    reset() {
      // Ocultar path
      this.path.style.strokeDashoffset = this.pathLength;
      this.path.classList.add('wo-woos-path--animated');
      this.path.classList.remove('wo-woos-path--draw');
      
      // Ocultar fases
      this.phases.forEach(phase => {
        phase.classList.remove('wo-woos-phase--visible');
        phase.style.opacity = '0';
      });
    }
    
    /**
     * Cambia el preset dinámicamente
     */
    setPreset(presetName) {
      if (!WOOS_PRESETS[presetName]) {
        console.warn('[WoWoosDiagram] Unknown preset:', presetName);
        return;
      }
      
      this.preset = presetName;
      this.config = WOOS_PRESETS[presetName];
      this.isAnimated = false;
      
      // Re-renderizar
      this.container.innerHTML = '';
      this.phases = [];
      this.init();
    }
    
    /**
     * Destruye el componente
     */
    destroy() {
      this.container.innerHTML = '';
      this.container.classList.remove('wo-woos-container', `wo-woos--${this.options.variant}`);
      this.phases = [];
      this.svg = null;
      this.path = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // INTEGRACIÓN CON REVEAL.JS
  // ═══════════════════════════════════════════════════════════════

  let woWoosInstance = null;

  /**
   * Inicializa un diagrama WoOS
   * @param {string} containerId - ID del contenedor
   * @param {object} options - Opciones de configuración
   * @returns {WoWoosDiagram}
   */
  function initWoWoosDiagram(containerId, options = {}) {
    // Destruir instancia anterior si existe
    if (woWoosInstance && woWoosInstance.containerId === containerId) {
      woWoosInstance.destroy();
    }
    
    woWoosInstance = new WoWoosDiagram(containerId, options);
    return woWoosInstance;
  }

  /**
   * Destruye el diagrama WoOS actual
   */
  function destroyWoWoosDiagram() {
    if (woWoosInstance) {
      woWoosInstance.destroy();
      woWoosInstance = null;
    }
  }

  /**
   * Handler para integración con Reveal.js data-state
   * @param {string} stateName - Nombre del estado del slide
   * @param {string} containerId - ID del contenedor
   * @param {object} options - Opciones
   */
  function registerWoWoosSlideHandler(stateName, containerId, options = {}) {
    if (typeof Reveal !== 'undefined') {
      Reveal.on('slidechanged', (event) => {
        if (event.currentSlide.dataset.state === stateName) {
          setTimeout(() => {
            initWoWoosDiagram(containerId, {
              autoPlay: true,
              ...options
            });
          }, 300);
        }
      });
    }
  }

  // Exportar para uso global
  if (typeof window !== 'undefined') {
    window.WoWoosDiagram = WoWoosDiagram;
    window.WOOS_PRESETS = WOOS_PRESETS;
    window.WOOS_COLORS = WOOS_COLORS;
    window.initWoWoosDiagram = initWoWoosDiagram;
    window.destroyWoWoosDiagram = destroyWoWoosDiagram;
    window.registerWoWoosSlideHandler = registerWoWoosSlideHandler;
  }

})();
