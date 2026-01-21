/* ═══════════════════════════════════════════════════════════════
   WORKALÓGICO ANIMATION SYSTEM - wo-anime.js
   Sistema de animaciones basado en Anime.js para Reveal.js
   
   Requiere: Anime.js v3.2.2
   CDN: https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js
   
   Uso:
   1. Incluir Anime.js antes de este archivo
   2. Incluir este archivo después de Reveal.js
   3. Llamar WoAnime.init() después de Reveal.initialize()
   ═══════════════════════════════════════════════════════════════ */

const WoAnime = (function() {
  'use strict';
  
  // ═══════════════════════════════════════════════════════════════
  // CONFIGURACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  const config = {
    // Duraciones base (ms)
    duration: {
      fast: 300,
      normal: 600,
      slow: 1000,
      counter: 1500,
      cover: 800
    },
    // Easings predefinidos
    easing: {
      smooth: 'easeOutQuad',
      bounce: 'easeOutElastic(1, 0.5)',
      spring: 'spring(1, 80, 10, 0)',
      expo: 'easeOutExpo',
      back: 'easeOutBack'
    },
    // Colores de marca
    colors: {
      yellow: '#FFCB00',
      blue: '#5968EA',
      dark: '#0F0F1A'
    },
    // Detectar tema actual
    getTheme: () => document.body.dataset.woTheme || 'yellow',
    getPrimaryColor: () => {
      const theme = document.body.dataset.woTheme || 'yellow';
      return theme === 'yellow' ? '#FFCB00' : '#5968EA';
    }
  };
  
  // Estado interno
  let initialized = false;
  let currentSlide = null;
  let runningAnimations = [];
  
  // ═══════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Formatea números grandes (1000 → 1K, 1000000 → 1M)
   */
  function formatNumber(num, options = {}) {
    const { suffix = '', prefix = '', decimals = 0 } = options;
    
    if (num >= 1000000) {
      return prefix + (num / 1000000).toFixed(decimals) + 'M' + suffix;
    }
    if (num >= 1000) {
      return prefix + (num / 1000).toFixed(decimals) + 'K' + suffix;
    }
    return prefix + num.toFixed(decimals) + suffix;
  }
  
  /**
   * Parsea un valor con formato ($2.5M, 70%, 500K)
   */
  function parseFormattedValue(str) {
    const clean = str.replace(/[^0-9.KMB%+-]/gi, '');
    let num = parseFloat(clean) || 0;
    
    if (clean.includes('M') || clean.includes('m')) num *= 1000000;
    else if (clean.includes('K') || clean.includes('k')) num *= 1000;
    else if (clean.includes('B') || clean.includes('b')) num *= 1000000000;
    
    return {
      value: num,
      hasPercent: str.includes('%'),
      hasPlus: str.includes('+'),
      hasPrefix: str.match(/^[$€£]/)?.[0] || '',
      hasSuffix: str.match(/[KMB%+]+$/i)?.[0] || ''
    };
  }
  
  /**
   * Detiene todas las animaciones en ejecución
   */
  function stopAllAnimations() {
    runningAnimations.forEach(anim => {
      if (anim && typeof anim.pause === 'function') {
        anim.pause();
      }
    });
    runningAnimations = [];
  }
  
  /**
   * Registra una animación para tracking
   */
  function trackAnimation(anim) {
    runningAnimations.push(anim);
    return anim;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENTE: COUNTER (Contador Animado)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Anima un contador numérico
   * @param {string|Element} target - Selector o elemento
   * @param {Object} options - Configuración
   */
  function counter(target, options = {}) {
    const elements = typeof target === 'string' 
      ? document.querySelectorAll(target) 
      : [target];
    
    const {
      from = 0,
      to = null, // Si es null, usa el contenido del elemento
      duration = config.duration.counter,
      easing = config.easing.expo,
      prefix = '',
      suffix = '',
      decimals = 0,
      format = true, // Formatear K, M, etc.
      onComplete = null
    } = options;
    
    elements.forEach(el => {
      // Obtener valor destino del elemento si no se especifica
      let targetValue = to;
      if (targetValue === null) {
        const parsed = parseFormattedValue(el.textContent || el.dataset.value || '0');
        targetValue = parsed.value;
      }
      
      // Guardar valor original para reset
      el.dataset.originalValue = el.textContent;
      
      const anim = anime({
        targets: { value: from },
        value: targetValue,
        duration,
        easing,
        round: decimals === 0 ? 1 : Math.pow(10, decimals),
        update: (a) => {
          const current = a.animations[0].currentValue;
          if (format && current >= 1000) {
            el.textContent = formatNumber(current, { prefix, suffix, decimals });
          } else {
            el.textContent = prefix + current.toFixed(decimals) + suffix;
          }
        },
        complete: () => {
          if (onComplete) onComplete(el);
        }
      });
      
      trackAnimation(anim);
    });
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENTE: STAGGER (Animación en Cascada)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Anima múltiples elementos con efecto cascada
   * @param {string|NodeList} targets - Selectores o elementos
   * @param {Object} options - Configuración
   */
  function stagger(targets, options = {}) {
    const {
      from = 'first', // 'first', 'last', 'center', index number
      delay = 80,
      translateY = [30, 0],
      translateX = null,
      opacity = [0, 1],
      scale = null,
      rotate = null,
      duration = config.duration.normal,
      easing = config.easing.spring,
      onComplete = null
    } = options;
    
    const animProps = {
      targets,
      duration,
      easing,
      delay: anime.stagger(delay, { from }),
      complete: onComplete
    };
    
    if (translateY) animProps.translateY = translateY;
    if (translateX) animProps.translateX = translateX;
    if (opacity) animProps.opacity = opacity;
    if (scale) animProps.scale = scale;
    if (rotate) animProps.rotate = rotate;
    
    return trackAnimation(anime(animProps));
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENTE: COVER (Entrada de Portada)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Animación cinematográfica para portadas
   * @param {Element} slideElement - El slide de portada
   */
  function cover(slideElement) {
    const logo = slideElement.querySelector('.wo-cover__logo');
    const badge = slideElement.querySelector('.wo-badge');
    const title = slideElement.querySelector('.wo-cover__title');
    const subtitle = slideElement.querySelector('.wo-cover__subtitle');
    const stats = slideElement.querySelectorAll('.wo-stat');
    const author = slideElement.querySelector('.wo-cover__author');
    
    // Ocultar elementos inicialmente
    const elements = [logo, badge, title, subtitle, author, ...stats].filter(Boolean);
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
    });
    
    const tl = anime.timeline({
      easing: config.easing.expo
    });
    
    // Logo con scale
    if (logo) {
      tl.add({
        targets: logo,
        scale: [0.8, 1],
        opacity: [0, 1],
        translateY: [20, 0],
        duration: config.duration.cover
      });
    }
    
    // Badge
    if (badge) {
      tl.add({
        targets: badge,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 400
      }, '-=400');
    }
    
    // Título
    if (title) {
      tl.add({
        targets: title,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600
      }, '-=300');
    }
    
    // Subtítulo
    if (subtitle) {
      tl.add({
        targets: subtitle,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500
      }, '-=400');
    }
    
    // Stats con stagger
    if (stats.length > 0) {
      tl.add({
        targets: stats,
        scale: [0.8, 1],
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        duration: 500
      }, '-=200');
    }
    
    // Author
    if (author) {
      tl.add({
        targets: author,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 400
      }, '-=200');
    }
    
    return trackAnimation(tl);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENTE: CTA GLOW (Efecto de Brillo Pulsante)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Aplica efecto de glow pulsante a elementos CTA
   * @param {string|Element} target - Selector o elemento
   */
  function ctaGlow(target, options = {}) {
    const {
      color = config.getPrimaryColor(),
      intensity = 20,
      duration = 2000
    } = options;
    
    return trackAnimation(anime({
      targets: target,
      textShadow: [
        `0 0 0px ${color}`,
        `0 0 ${intensity}px ${color}`,
        `0 0 0px ${color}`
      ],
      duration,
      loop: true,
      easing: 'easeInOutSine'
    }));
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENTE: STEPS TIMELINE (Pasos Animados)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Anima una lista de pasos con línea de progreso
   * @param {Element} container - Contenedor de los pasos
   */
  function stepsTimeline(container, options = {}) {
    const {
      duration = 2000,
      staggerDelay = 400
    } = options;
    
    const items = container.querySelectorAll('li');
    const progressLine = container.querySelector('.wo-steps__progress-line');
    
    // Ocultar items inicialmente
    items.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
    });
    
    const tl = anime.timeline({ easing: config.easing.expo });
    
    // Línea de progreso (si existe)
    if (progressLine) {
      tl.add({
        targets: progressLine,
        scaleY: [0, 1],
        duration,
        easing: 'easeInOutQuad'
      });
    }
    
    // Items con stagger
    tl.add({
      targets: items,
      translateX: [-20, 0],
      opacity: [0, 1],
      delay: anime.stagger(staggerDelay),
      duration: 600
    }, progressLine ? '-=1500' : 0);
    
    return trackAnimation(tl);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENTE: CARDS ENTRANCE (Entrada de Cards)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Anima entrada de cards con efecto spring
   * @param {NodeList|Array} cards - Cards a animar
   */
  function cardsEntrance(cards, options = {}) {
    const {
      from = 'center',
      delay = 80,
      duration = 600
    } = options;
    
    // Reset estado
    const cardArray = Array.from(cards);
    cardArray.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px) scale(0.95)';
    });
    
    return trackAnimation(anime({
      targets: cardArray,
      translateY: [40, 0],
      scale: [0.95, 1],
      opacity: [0, 1],
      delay: anime.stagger(delay, { from }),
      duration,
      easing: config.easing.spring
    }));
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENTE: SVG PATH DRAW (Dibujar SVG)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Anima el dibujo de paths SVG
   * @param {string|NodeList} paths - Selectores o elementos path
   */
  function pathDraw(paths, options = {}) {
    const {
      duration = 1500,
      staggerDelay = 300,
      easing = 'easeInOutSine'
    } = options;
    
    return trackAnimation(anime({
      targets: paths,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing,
      duration,
      delay: anime.stagger(staggerDelay)
    }));
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENTE: GAUGE ANIMATION (Animación de Gauge)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Anima un gauge circular con valor y mini-gauges
   * @param {Element} container - Contenedor del gauge
   */
  function gauge(container, options = {}) {
    const {
      score = 0,
      duration = 1500
    } = options;
    
    const progress = container.querySelector('.wo-gauge__progress');
    const scoreEl = container.querySelector('.wo-gauge__score');
    const miniBars = container.querySelectorAll('.wo-mini-gauge__bar');
    
    const circumference = parseFloat(progress?.dataset.circumference) || 471;
    const targetOffset = circumference * (1 - score / 100);
    
    const tl = anime.timeline({ easing: config.easing.expo });
    
    // Arco de progreso
    if (progress) {
      tl.add({
        targets: progress,
        strokeDashoffset: [circumference, targetOffset],
        duration
      });
    }
    
    // Número contador
    if (scoreEl) {
      tl.add({
        targets: { value: 0 },
        value: score,
        round: 1,
        duration: duration * 0.8,
        easing: config.easing.expo,
        update: (a) => {
          scoreEl.textContent = Math.round(a.animations[0].currentValue);
        }
      }, '-=1200');
    }
    
    // Mini barras con stagger
    if (miniBars.length > 0) {
      tl.add({
        targets: miniBars,
        width: (el) => el.dataset.width + '%',
        delay: anime.stagger(100),
        duration: 600,
        easing: config.easing.expo
      }, '-=800');
    }
    
    return trackAnimation(tl);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENTE: FLIP CARD (Voltear Card)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Efecto flip 3D para cards
   * @param {Element} card - Card a voltear
   */
  function flipCard(card, options = {}) {
    const {
      duration = 800,
      direction = 'Y' // 'X' o 'Y'
    } = options;
    
    const prop = direction === 'Y' ? 'rotateY' : 'rotateX';
    
    return trackAnimation(anime({
      targets: card,
      [prop]: [0, 180],
      scale: [1, 1.05, 1],
      duration,
      easing: 'easeInOutSine'
    }));
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENTE: PARTICLE FLOW (Partículas en Movimiento)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Anima partículas a lo largo de un path
   * @param {Element} particle - Partícula a animar
   * @param {string} pathD - Atributo d del path SVG
   */
  function particleFlow(particle, pathD, options = {}) {
    const {
      duration = 1500,
      easing = 'easeInOutQuad'
    } = options;
    
    // Crear path temporal para motion path
    particle.style.offsetPath = `path('${pathD}')`;
    
    return trackAnimation(anime({
      targets: particle,
      offsetDistance: ['0%', '100%'],
      scale: [0.5, 1.2, 0.5],
      opacity: [0, 1, 0],
      duration,
      easing
    }));
  }
  
  // ═══════════════════════════════════════════════════════════════
  // INTEGRACIÓN CON REVEAL.JS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Handler para cambio de slide
   */
  function onSlideChange(event) {
    // Detener animaciones del slide anterior
    stopAllAnimations();
    
    const slide = event.currentSlide;
    currentSlide = slide;
    
    // Detectar tipo de slide y aplicar animación
    if (slide.classList.contains('wo-cover') || slide.querySelector('.wo-cover')) {
      // Portada - animación cinematográfica
      setTimeout(() => cover(slide), 100);
    }
    
    // Animar contadores si hay métricas
    const metrics = slide.querySelectorAll('.wo-metric__value[data-animate="counter"]');
    if (metrics.length > 0) {
      setTimeout(() => {
        metrics.forEach(m => counter(m));
      }, 300);
    }
    
    // Animar stats si hay
    const stats = slide.querySelectorAll('.wo-stat__value[data-animate="counter"]');
    if (stats.length > 0) {
      setTimeout(() => {
        stats.forEach(s => counter(s));
      }, 500);
    }
    
    // CTA glow
    if (slide.querySelector('.wo-cta')) {
      const ctaAccent = slide.querySelector('.wo-cta__title .accent');
      if (ctaAccent) {
        setTimeout(() => ctaGlow(ctaAccent), 500);
      }
    }
    
    // Steps timeline
    const steps = slide.querySelector('.wo-steps[data-animate="timeline"]');
    if (steps) {
      setTimeout(() => stepsTimeline(steps), 300);
    }
  }
  
  /**
   * Handler para fragment mostrado
   */
  function onFragmentShown(event) {
    const fragment = event.fragment;
    
    // Cards con animación especial
    if (fragment.classList.contains('wo-card') && fragment.dataset.animate === 'stagger') {
      // Buscar siblings visibles para stagger
      const parent = fragment.parentElement;
      const visibleCards = parent.querySelectorAll('.wo-card.visible');
      if (visibleCards.length > 0) {
        cardsEntrance(visibleCards);
      }
    }
    
    // Contador en fragment
    if (fragment.dataset.animate === 'counter') {
      const valueEl = fragment.querySelector('.wo-metric__value, .wo-stat__value') || fragment;
      counter(valueEl);
    }
  }
  
  /**
   * Handler para fragment oculto
   */
  function onFragmentHidden(event) {
    // Reset de elementos si es necesario
    const fragment = event.fragment;
    
    if (fragment.dataset.originalValue) {
      fragment.textContent = fragment.dataset.originalValue;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Inicializa el sistema de animaciones
   * Debe llamarse después de Reveal.initialize()
   */
  function init(options = {}) {
    if (initialized) {
      console.warn('WoAnime: Already initialized');
      return;
    }
    
    // Verificar dependencias
    if (typeof anime === 'undefined') {
      console.error('WoAnime: Anime.js is required but not loaded');
      return;
    }
    
    if (typeof Reveal === 'undefined') {
      console.warn('WoAnime: Reveal.js not found, running in standalone mode');
    } else {
      // Registrar eventos de Reveal.js
      Reveal.on('slidechanged', onSlideChange);
      Reveal.on('fragmentshown', onFragmentShown);
      Reveal.on('fragmenthidden', onFragmentHidden);
      
      // Animar slide inicial si es portada
      Reveal.on('ready', (event) => {
        if (event.currentSlide) {
          onSlideChange({ currentSlide: event.currentSlide });
        }
      });
    }
    
    initialized = true;
    console.log('WoAnime: Initialized successfully');
  }
  
  /**
   * Destruye el sistema de animaciones
   */
  function destroy() {
    stopAllAnimations();
    
    if (typeof Reveal !== 'undefined') {
      Reveal.off('slidechanged', onSlideChange);
      Reveal.off('fragmentshown', onFragmentShown);
      Reveal.off('fragmenthidden', onFragmentHidden);
    }
    
    initialized = false;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // API PÚBLICA
  // ═══════════════════════════════════════════════════════════════
  
  return {
    // Inicialización
    init,
    destroy,
    
    // Configuración
    config,
    
    // Componentes de animación
    counter,
    stagger,
    cover,
    ctaGlow,
    stepsTimeline,
    cardsEntrance,
    pathDraw,
    gauge,
    flipCard,
    particleFlow,
    
    // Utilidades
    formatNumber,
    parseFormattedValue,
    stopAllAnimations,
    
    // Estado
    isInitialized: () => initialized,
    getCurrentSlide: () => currentSlide
  };
})();

// Auto-inicializar si Reveal.js está listo
if (typeof Reveal !== 'undefined') {
  if (Reveal.isReady()) {
    WoAnime.init();
  } else {
    Reveal.on('ready', () => WoAnime.init());
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.WoAnime = WoAnime;
}
