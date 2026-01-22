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
      softLanding: 'cubicBezier(0.23, 1, 0.32, 1)', // Fluidity overhaul - aterrizaje suave
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
   * Anima un contador numérico con soporte para formatos especiales
   * Soporta: $2.5M, 70%, 500M+, 15+, $40K - $60K, 2-6, etc.
   * 
   * @param {string|Element} target - Selector o elemento
   * @param {Object} options - Configuración
   */
  function counter(target, options = {}) {
    const elements = typeof target === 'string' 
      ? document.querySelectorAll(target) 
      : (target instanceof NodeList ? Array.from(target) : [target]);
    
    const {
      from = 0,
      to = null, // Si es null, usa el contenido del elemento
      duration = config.duration.counter,
      easing = config.easing.expo,
      prefix = null, // Auto-detecta si es null
      suffix = null, // Auto-detecta si es null
      decimals = null, // Auto-detecta si es null
      format = true, // Formatear K, M, etc.
      preserveFormat = true, // Mantener el formato original del texto
      onComplete = null
    } = options;
    
    elements.forEach(el => {
      if (!el) return;
      
      const originalText = el.textContent?.trim() || el.dataset.value || '0';
      
      // Guardar valor original para reset
      el.dataset.originalValue = originalText;
      
      // Detectar si es un rango (ej: "$40K - $60K" o "2-6")
      const rangeMatch = originalText.match(/^([^\d]*)([\d.,]+)([KMB%+]*)\s*[-–]\s*([^\d]*)([\d.,]+)([KMB%+]*)(.*)$/i);
      
      if (rangeMatch && preserveFormat) {
        // Es un rango - animar ambos valores
        animateRange(el, rangeMatch, { duration, easing, from });
        return;
      }
      
      // Parsear valor único
      const parsed = parseFormattedValue(originalText);
      let targetValue = to !== null ? to : parsed.value;
      
      // Auto-detectar configuración del formato
      const autoPrefix = prefix !== null ? prefix : parsed.hasPrefix;
      const autoSuffix = suffix !== null ? suffix : parsed.hasSuffix;
      const autoDecimals = decimals !== null ? decimals : detectDecimals(originalText);
      
      // Agregar clase para animación visual
      el.classList.add('wo-counter--animating');
      
      const anim = anime({
        targets: { value: from },
        value: targetValue,
        duration,
        easing,
        round: autoDecimals === 0 ? 1 : Math.pow(10, autoDecimals),
        update: (a) => {
          const current = a.animations[0].currentValue;
          el.textContent = formatCounterValue(current, {
            prefix: autoPrefix,
            suffix: autoSuffix,
            decimals: autoDecimals,
            format,
            hasPlus: parsed.hasPlus
          });
        },
        complete: () => {
          el.classList.remove('wo-counter--animating');
          el.classList.add('wo-counter--complete');
          // Restaurar texto original exacto para evitar diferencias de formato
          if (preserveFormat) {
            el.textContent = originalText;
          }
          if (onComplete) onComplete(el);
        }
      });
      
      trackAnimation(anim);
    });
  }
  
  /**
   * Anima un rango de valores (ej: "$40K - $60K")
   */
  function animateRange(el, match, options) {
    const [_, prefix1, val1, suffix1, prefix2, val2, suffix2, extra] = match;
    const { duration, easing, from } = options;
    
    const parsed1 = parseFormattedValue(prefix1 + val1 + suffix1);
    const parsed2 = parseFormattedValue(prefix2 + val2 + suffix2);
    
    const decimals1 = detectDecimals(val1);
    const decimals2 = detectDecimals(val2);
    
    el.classList.add('wo-counter--animating');
    
    const anim = anime({
      targets: { v1: from, v2: from },
      v1: parsed1.value,
      v2: parsed2.value,
      duration,
      easing,
      update: (a) => {
        const c1 = a.animations[0].currentValue;
        const c2 = a.animations[1].currentValue;
        
        const text1 = formatCounterValue(c1, {
          prefix: parsed1.hasPrefix,
          suffix: suffix1.replace(/[%+]/g, ''),
          decimals: decimals1,
          format: true
        });
        
        const text2 = formatCounterValue(c2, {
          prefix: parsed2.hasPrefix || parsed1.hasPrefix,
          suffix: suffix2.replace(/[%+]/g, ''),
          decimals: decimals2,
          format: true
        });
        
        el.textContent = `${text1} - ${text2}${extra}`;
      },
      complete: () => {
        el.classList.remove('wo-counter--animating');
        el.classList.add('wo-counter--complete');
        el.textContent = el.dataset.originalValue;
      }
    });
    
    trackAnimation(anim);
  }
  
  /**
   * Detecta el número de decimales en un string
   */
  function detectDecimals(str) {
    const match = str.match(/\.(\d+)/);
    return match ? match[1].length : 0;
  }
  
  /**
   * Formatea el valor del contador con prefijo y sufijo
   */
  function formatCounterValue(value, options) {
    const { prefix = '', suffix = '', decimals = 0, format = true, hasPlus = false } = options;
    
    let result = '';
    
    // Prefijo ($, €, etc.)
    if (prefix) result += prefix;
    
    // Número formateado
    if (format && Math.abs(value) >= 1000000) {
      result += (value / 1000000).toFixed(decimals > 0 ? decimals : 1) + 'M';
    } else if (format && Math.abs(value) >= 1000) {
      result += (value / 1000).toFixed(decimals) + 'K';
    } else {
      result += decimals > 0 ? value.toFixed(decimals) : Math.round(value);
    }
    
    // Sufijo (%, +, etc.)
    if (suffix && !result.includes(suffix)) {
      result += suffix;
    }
    
    // Plus al final
    if (hasPlus && !result.includes('+')) {
      result += '+';
    }
    
    return result;
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
      complete: () => {
        // Fluidity Overhaul: Cleanup will-change para rendimiento
        const targetEls = typeof targets === 'string' 
          ? document.querySelectorAll(targets) 
          : targets;
        if (targetEls.forEach) {
          targetEls.forEach(el => {
            if (el && el.style) el.style.willChange = 'auto';
          });
        }
        if (onComplete) onComplete();
      }
    };
    
    if (translateY) animProps.translateY = translateY;
    if (translateX) animProps.translateX = translateX;
    if (opacity) animProps.opacity = opacity;
    if (scale) animProps.scale = scale;
    if (rotate) animProps.rotate = rotate;
    
    return trackAnimation(anime(animProps));
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENTE: COVER (Entrada de Portada Cinematográfica)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Animación cinematográfica para portadas con múltiples efectos
   * Secuencia: Logo → Badge → Título (con accent highlight) → Subtítulo → Stats → Author
   * 
   * @param {Element} slideElement - El slide de portada
   * @param {Object} options - Configuración opcional
   */
  function cover(slideElement, options = {}) {
    const {
      duration = config.duration.cover,
      staggerStats = 120,
      highlightAccent = true,
      animateCounters = true
    } = options;
    
    // Seleccionar elementos
    const container = slideElement.querySelector('.wo-cover') || slideElement;
    const logo = container.querySelector('.wo-cover__logo');
    const badge = container.querySelector('.wo-badge');
    const title = container.querySelector('.wo-cover__title');
    const titleAccent = title?.querySelector('.accent, .accent-yellow');
    const subtitle = container.querySelector('.wo-cover__subtitle');
    const statsRow = container.querySelector('.wo-stats-row');
    const stats = container.querySelectorAll('.wo-stat');
    const statValues = container.querySelectorAll('.wo-stat__value');
    const author = container.querySelector('.wo-cover__author');
    const gridBg = container.querySelector('.grid-background');
    
    // Reset: Ocultar todos los elementos
    const elements = [logo, badge, title, subtitle, author, ...stats].filter(Boolean);
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
    });
    
    // Ocultar accent del título para animación separada
    if (titleAccent && highlightAccent) {
      titleAccent.style.opacity = '0';
      titleAccent.style.display = 'inline-block';
    }
    
    // Grid background fade
    if (gridBg) {
      gridBg.style.opacity = '0';
    }
    
    // Crear timeline cinematográfico
    const tl = anime.timeline({
      easing: config.easing.expo
    });
    
    // 1. Grid background fade in (muy sutil)
    if (gridBg) {
      tl.add({
        targets: gridBg,
        opacity: [0, 0.4],
        duration: 1200,
        easing: 'easeOutQuad'
      }, 0);
    }
    
    // 2. Logo - entrada con scale y glow sutil
    if (logo) {
      tl.add({
        targets: logo,
        scale: [0.7, 1],
        opacity: [0, 0.9],
        translateY: [40, 0],
        filter: ['blur(4px)', 'blur(0px)'],
        duration: duration,
        easing: config.easing.expo
      }, 100);
    }
    
    // 3. Badge - slide desde arriba
    if (badge) {
      tl.add({
        targets: badge,
        opacity: [0, 1],
        translateY: [-15, 0],
        scale: [0.9, 1],
        duration: 450,
        easing: config.easing.back
      }, '-=400');
    }
    
    // 4. Título - entrada dramática
    if (title) {
      tl.add({
        targets: title,
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 700,
        easing: config.easing.expo
      }, '-=250');
      
      // 4b. Accent del título - highlight con glow
      if (titleAccent && highlightAccent) {
        tl.add({
          targets: titleAccent,
          opacity: [0, 1],
          scale: [0.95, 1],
          textShadow: [
            `0 0 0px ${config.getPrimaryColor()}`,
            `0 0 20px ${config.getPrimaryColor()}`,
            `0 0 0px ${config.getPrimaryColor()}`
          ],
          duration: 600,
          easing: 'easeOutQuad'
        }, '-=400');
      }
    }
    
    // 5. Subtítulo - fade suave
    if (subtitle) {
      tl.add({
        targets: subtitle,
        opacity: [0, 1],
        translateY: [25, 0],
        duration: 550,
        easing: config.easing.smooth
      }, '-=350');
    }
    
    // 6. Stats - entrada con stagger desde el centro
    if (stats.length > 0) {
      tl.add({
        targets: Array.from(stats),
        scale: [0.85, 1],
        opacity: [0, 1],
        translateY: [25, 0],
        delay: anime.stagger(staggerStats, { from: 'center' }),
        duration: 500,
        easing: config.easing.spring
      }, '-=200');
      
      // 6b. Animar contadores de stats si está habilitado
      if (animateCounters && statValues.length > 0) {
        // Delay para que los stats ya estén visibles
        setTimeout(() => {
          statValues.forEach(val => {
            if (val.textContent.match(/[\d.,]+[KMB%+]*/)) {
              counter(val, { duration: 1200, easing: config.easing.expo });
            }
          });
        }, 600);
      }
    }
    
    // 7. Author - fade final
    if (author) {
      tl.add({
        targets: author,
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 400,
        easing: config.easing.smooth,
        complete: () => {
          // Fluidity Overhaul: Cleanup will-change para rendimiento
          elements.forEach(el => {
            if (el) el.style.willChange = 'auto';
          });
        }
      }, '-=150');
    }
    
    return trackAnimation(tl);
  }
  
  /**
   * Animación de sección (título + subtítulo)
   * @param {Element} slideElement - El slide de sección
   */
  function section(slideElement, options = {}) {
    const {
      duration = 600
    } = options;
    
    const title = slideElement.querySelector('.wo-section__title');
    const titleAccent = title?.querySelector('.accent, .accent-yellow');
    const subtitle = slideElement.querySelector('.wo-section__subtitle');
    
    const elements = [title, subtitle].filter(Boolean);
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
    });
    
    if (titleAccent) {
      titleAccent.style.opacity = '0';
      titleAccent.style.display = 'inline-block';
    }
    
    const tl = anime.timeline({ easing: config.easing.expo });
    
    if (title) {
      tl.add({
        targets: title,
        opacity: [0, 1],
        translateY: [40, 0],
        duration
      });
      
      if (titleAccent) {
        tl.add({
          targets: titleAccent,
          opacity: [0, 1],
          textShadow: [
            `0 0 0px ${config.getPrimaryColor()}`,
            `0 0 15px ${config.getPrimaryColor()}`,
            `0 0 0px ${config.getPrimaryColor()}`
          ],
          duration: 500
        }, '-=400');
      }
    }
    
    if (subtitle) {
      tl.add({
        targets: subtitle,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 450
      }, '-=300');
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
  // COMPONENTE: STEPS TIMELINE (Pasos Animados con Línea de Progreso)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Anima una lista de pasos con línea de progreso vertical
   * La línea crece conforme aparecen los items
   * 
   * @param {Element} container - Contenedor de los pasos (.wo-steps)
   * @param {Object} options - Configuración
   */
  function stepsTimeline(container, options = {}) {
    const {
      duration = 2500,
      staggerDelay = 350,
      lineColor = config.getPrimaryColor(),
      showNumbers = true,
      pulseOnComplete = true
    } = options;
    
    const items = container.querySelectorAll('li');
    let progressLine = container.querySelector('.wo-steps__progress-line');
    
    // Crear línea de progreso si no existe
    if (!progressLine) {
      progressLine = document.createElement('div');
      progressLine.className = 'wo-steps__progress-line';
      progressLine.style.cssText = `
        position: absolute;
        left: 0.8em;
        top: 1.2em;
        bottom: 1em;
        width: 2px;
        background: linear-gradient(to bottom, ${lineColor}, ${lineColor}88);
        transform-origin: top;
        transform: scaleY(0);
        z-index: 0;
        border-radius: 2px;
      `;
      container.style.position = 'relative';
      container.insertBefore(progressLine, container.firstChild);
    }
    
    // Obtener los números de cada step (::before elements)
    const stepNumbers = [];
    items.forEach(item => {
      item.style.position = 'relative';
      item.style.zIndex = '1';
    });
    
    // Reset: Ocultar items y sus números
    items.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-25px)';
      
      // Crear indicador de número si showNumbers
      if (showNumbers) {
        const numberEl = item.querySelector('.wo-step-number');
        if (!numberEl) {
          // El número viene del CSS ::before, lo resaltamos con un pseudo-glow
          item.style.setProperty('--step-glow', '0');
        }
      }
    });
    
    const itemCount = items.length;
    const tl = anime.timeline({ easing: config.easing.expo });
    
    // 1. Línea de progreso - crece gradualmente
    tl.add({
      targets: progressLine,
      scaleY: [0, 1],
      duration: duration,
      easing: 'easeInOutCubic'
    }, 0);
    
    // 2. Items aparecen en cascada sincronizados con la línea
    items.forEach((item, index) => {
      const itemDelay = (index / itemCount) * duration * 0.6;
      
      tl.add({
        targets: item,
        translateX: [-25, 0],
        opacity: [0, 1],
        duration: 500,
        easing: config.easing.spring,
        begin: () => {
          // Pulso en el número al aparecer
          if (pulseOnComplete) {
            anime({
              targets: item,
              boxShadow: [
                '0 0 0px rgba(89, 104, 234, 0)',
                '0 0 15px rgba(89, 104, 234, 0.3)',
                '0 0 0px rgba(89, 104, 234, 0)'
              ],
              duration: 600,
              easing: 'easeOutQuad'
            });
          }
        }
      }, itemDelay + 200);
    });
    
    // 3. Efecto final de completado
    if (pulseOnComplete) {
      tl.add({
        targets: progressLine,
        boxShadow: [
          `0 0 0px ${lineColor}00`,
          `0 0 12px ${lineColor}66`,
          `0 0 0px ${lineColor}00`
        ],
        duration: 800,
        easing: 'easeInOutSine'
      }, `-=${400}`);
    }
    
    return trackAnimation(tl);
  }
  
  /**
   * Crea una línea de conexión animada entre dos elementos
   * Útil para mostrar flujos o relaciones
   * 
   * @param {Element} fromEl - Elemento de origen
   * @param {Element} toEl - Elemento de destino
   * @param {Object} options - Configuración
   */
  function connectElements(fromEl, toEl, options = {}) {
    const {
      container = fromEl.parentElement,
      color = config.getPrimaryColor(),
      strokeWidth = 2,
      curved = true,
      duration = 1000,
      dashArray = null // e.g., '5 3' para línea punteada
    } = options;
    
    // Obtener posiciones relativas al contenedor
    const containerRect = container.getBoundingClientRect();
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    
    const startX = fromRect.right - containerRect.left;
    const startY = fromRect.top + fromRect.height / 2 - containerRect.top;
    const endX = toRect.left - containerRect.left;
    const endY = toRect.top + toRect.height / 2 - containerRect.top;
    
    // Crear SVG para la línea
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: visible;
    `;
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Crear path (curvo o recto)
    let d;
    if (curved) {
      const midX = (startX + endX) / 2;
      d = `M ${startX} ${startY} Q ${midX} ${startY} ${midX} ${(startY + endY) / 2} T ${endX} ${endY}`;
    } else {
      d = `M ${startX} ${startY} L ${endX} ${endY}`;
    }
    
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', strokeWidth);
    if (dashArray) path.setAttribute('stroke-dasharray', dashArray);
    
    svg.appendChild(path);
    container.style.position = 'relative';
    container.appendChild(svg);
    
    // Animar el dibujo del path
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;
    
    return trackAnimation(anime({
      targets: path,
      strokeDashoffset: [pathLength, 0],
      duration,
      easing: 'easeInOutQuad'
    }));
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENTE: CARDS ENTRANCE (Entrada de Cards con Stagger Orgánico)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Anima entrada de cards con efecto spring orgánico
   * Reemplaza fragment fade-up con animaciones más fluidas
   * 
   * @param {NodeList|Array|string} cards - Cards a animar
   * @param {Object} options - Configuración
   */
  function cardsEntrance(cards, options = {}) {
    const cardArray = typeof cards === 'string' 
      ? Array.from(document.querySelectorAll(cards))
      : Array.from(cards);
    
    if (cardArray.length === 0) return null;
    
    const {
      from = 'center',     // 'first', 'last', 'center', o índice numérico
      delay = 100,         // Delay entre cards
      duration = 650,      // Duración de cada animación
      staggerGrid = null,  // { cols: 2, rows: 3 } para stagger 2D
      effect = 'spring',   // 'spring', 'slide', 'scale', 'flip'
      direction = 'up',    // 'up', 'down', 'left', 'right'
      reset = true         // Resetear estado inicial
    } = options;
    
    // Configuración de efectos
    const effects = {
      spring: {
        translateY: direction === 'up' ? [40, 0] : direction === 'down' ? [-40, 0] : [0, 0],
        translateX: direction === 'left' ? [40, 0] : direction === 'right' ? [-40, 0] : [0, 0],
        scale: [0.92, 1],
        opacity: [0, 1],
        easing: config.easing.spring
      },
      slide: {
        translateY: direction === 'up' ? [60, 0] : direction === 'down' ? [-60, 0] : [0, 0],
        translateX: direction === 'left' ? [60, 0] : direction === 'right' ? [-60, 0] : [0, 0],
        opacity: [0, 1],
        easing: config.easing.expo
      },
      scale: {
        scale: [0.8, 1],
        opacity: [0, 1],
        easing: config.easing.back
      },
      flip: {
        rotateX: [-15, 0],
        translateY: [30, 0],
        opacity: [0, 1],
        easing: config.easing.expo
      }
    };
    
    const effectConfig = effects[effect] || effects.spring;
    
    // Reset estado inicial si está habilitado
    if (reset) {
      cardArray.forEach(card => {
        card.style.opacity = '0';
        card.style.willChange = 'transform, opacity';
        
        if (effect === 'flip') {
          card.style.transformStyle = 'preserve-3d';
          card.style.perspective = '1000px';
        }
      });
    }
    
    // Configurar stagger
    let staggerConfig;
    if (staggerGrid) {
      // Stagger 2D para grids
      staggerConfig = anime.stagger(delay, {
        grid: [staggerGrid.cols, staggerGrid.rows],
        from: from
      });
    } else {
      staggerConfig = anime.stagger(delay, { from });
    }
    
    const anim = anime({
      targets: cardArray,
      ...effectConfig,
      delay: staggerConfig,
      duration,
      complete: () => {
        // Limpiar will-change para rendimiento
        cardArray.forEach(card => {
          card.style.willChange = 'auto';
        });
      }
    });
    
    return trackAnimation(anim);
  }
  
  /**
   * Anima cards de pricing con highlight especial para el card recomendado
   * @param {Element} container - Contenedor de los cards de pricing
   */
  function pricingCards(container, options = {}) {
    const {
      highlightClass = 'wo-card--highlight',
      delay = 150,
      highlightDelay = 300
    } = options;
    
    const cards = container.querySelectorAll('.wo-card');
    const highlightCard = container.querySelector(`.${highlightClass}`);
    const regularCards = Array.from(cards).filter(c => !c.classList.contains(highlightClass));
    
    // Reset
    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px) scale(0.95)';
    });
    
    const tl = anime.timeline({ easing: config.easing.spring });
    
    // Primero los cards regulares
    if (regularCards.length > 0) {
      tl.add({
        targets: regularCards,
        translateY: [40, 0],
        scale: [0.95, 1],
        opacity: [0, 1],
        delay: anime.stagger(delay, { from: 'first' }),
        duration: 600
      });
    }
    
    // Luego el card destacado con efecto especial
    if (highlightCard) {
      tl.add({
        targets: highlightCard,
        translateY: [60, 0],
        scale: [0.85, 1.02, 1],
        opacity: [0, 1],
        boxShadow: [
          '0 0 0px rgba(255, 203, 0, 0)',
          '0 0 30px rgba(255, 203, 0, 0.4)',
          '0 8px 30px rgba(255, 203, 0, 0.2)'
        ],
        duration: 800,
        easing: config.easing.back
      }, `-=${highlightDelay}`);
    }
    
    return trackAnimation(tl);
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
  
  /**
   * Crea y anima líneas de conexión entre cards de metodología
   * Las líneas se dibujan progresivamente para mostrar el flujo del proceso
   * 
   * @param {Element} container - Contenedor de los cards (usualmente .wo-grid)
   * @param {Object} options - Configuración
   */
  function methodologyConnections(container, options = {}) {
    const {
      cardSelector = '.wo-card',
      direction = 'horizontal', // 'horizontal', 'vertical', 'grid'
      lineColor = config.getPrimaryColor(),
      lineWidth = 2,
      dashPattern = null, // e.g., '5 3' para línea punteada
      arrowHead = true,
      duration = 1200,
      staggerDelay = 400,
      curved = false
    } = options;
    
    const cards = container.querySelectorAll(cardSelector);
    if (cards.length < 2) return null;
    
    // Crear SVG overlay
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'wo-methodology-connector');
    svg.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: visible;
      z-index: 0;
    `;
    
    // Definiciones (flecha)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    if (arrowHead) {
      defs.innerHTML = `
        <marker id="methodology-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="${lineColor}" opacity="0.8"/>
        </marker>
      `;
    }
    svg.appendChild(defs);
    
    // Asegurar que el contenedor tenga position relative
    const containerStyle = window.getComputedStyle(container);
    if (containerStyle.position === 'static') {
      container.style.position = 'relative';
    }
    
    // Calcular posiciones de cards
    const containerRect = container.getBoundingClientRect();
    const paths = [];
    
    const cardArray = Array.from(cards);
    for (let i = 0; i < cardArray.length - 1; i++) {
      const fromCard = cardArray[i];
      const toCard = cardArray[i + 1];
      
      const fromRect = fromCard.getBoundingClientRect();
      const toRect = toCard.getBoundingClientRect();
      
      // Calcular puntos de conexión
      let startX, startY, endX, endY;
      
      if (direction === 'horizontal') {
        // Conectar derecha a izquierda
        startX = fromRect.right - containerRect.left;
        startY = fromRect.top + fromRect.height / 2 - containerRect.top;
        endX = toRect.left - containerRect.left;
        endY = toRect.top + toRect.height / 2 - containerRect.top;
      } else if (direction === 'vertical') {
        // Conectar abajo a arriba
        startX = fromRect.left + fromRect.width / 2 - containerRect.left;
        startY = fromRect.bottom - containerRect.top;
        endX = toRect.left + toRect.width / 2 - containerRect.left;
        endY = toRect.top - containerRect.top;
      } else if (direction === 'grid') {
        // Detectar si está en la misma fila o diferente
        const sameRow = Math.abs(fromRect.top - toRect.top) < fromRect.height / 2;
        
        if (sameRow) {
          startX = fromRect.right - containerRect.left;
          startY = fromRect.top + fromRect.height / 2 - containerRect.top;
          endX = toRect.left - containerRect.left;
          endY = toRect.top + toRect.height / 2 - containerRect.top;
        } else {
          startX = fromRect.left + fromRect.width / 2 - containerRect.left;
          startY = fromRect.bottom - containerRect.top;
          endX = toRect.left + toRect.width / 2 - containerRect.left;
          endY = toRect.top - containerRect.top;
        }
      }
      
      // Crear path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      // Generar el path d
      let d;
      if (curved) {
        // Curva Bezier
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const controlOffset = 30;
        
        if (direction === 'horizontal') {
          d = `M ${startX} ${startY} Q ${midX} ${startY - controlOffset} ${endX} ${endY}`;
        } else {
          d = `M ${startX} ${startY} Q ${startX + controlOffset} ${midY} ${endX} ${endY}`;
        }
      } else {
        // Línea recta
        d = `M ${startX} ${startY} L ${endX} ${endY}`;
      }
      
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', lineColor);
      path.setAttribute('stroke-width', lineWidth);
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('opacity', '0.6');
      if (dashPattern) path.setAttribute('stroke-dasharray', dashPattern);
      if (arrowHead) path.setAttribute('marker-end', 'url(#methodology-arrow)');
      
      // Preparar para animación
      const pathLength = path.getTotalLength();
      path.style.strokeDasharray = pathLength;
      path.style.strokeDashoffset = pathLength;
      
      svg.appendChild(path);
      paths.push(path);
    }
    
    // Insertar SVG antes de los cards
    container.insertBefore(svg, container.firstChild);
    
    // Animar paths con stagger
    const tl = anime.timeline({ easing: 'easeInOutQuad' });
    
    paths.forEach((path, index) => {
      const pathLength = path.getTotalLength();
      
      tl.add({
        targets: path,
        strokeDashoffset: [pathLength, 0],
        opacity: [0.3, 0.6],
        duration: duration,
        easing: 'easeInOutCubic'
      }, index * staggerDelay);
      
      // Pulso al completar
      tl.add({
        targets: path,
        opacity: [0.6, 0.8, 0.6],
        duration: 400,
        easing: 'easeInOutSine'
      }, index * staggerDelay + duration - 200);
    });
    
    return trackAnimation(tl);
  }
  
  /**
   * Anima números de pasos en cards de metodología (01, 02, 03...)
   * @param {Element} container - Contenedor de cards
   */
  function animateStepNumbers(container, options = {}) {
    const {
      numberSelector = '.card-number',
      duration = 600,
      staggerDelay = 150
    } = options;
    
    const numbers = container.querySelectorAll(numberSelector);
    if (numbers.length === 0) return null;
    
    // Reset
    numbers.forEach(num => {
      num.style.opacity = '0';
      num.style.transform = 'scale(0.5)';
    });
    
    return trackAnimation(anime({
      targets: Array.from(numbers),
      scale: [0.5, 1.2, 1],
      opacity: [0, 1],
      delay: anime.stagger(staggerDelay),
      duration: duration,
      easing: config.easing.back
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
  // COMPONENTE: FLIP CARD (Voltear Card 3D)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Efecto flip 3D básico para cards
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
  
  /**
   * Inicializa un card de pricing con efecto flip 3D
   * Muestra info adicional en el reverso al hacer hover/click
   * 
   * @param {Element} card - El card a convertir en flip card
   * @param {Object} backContent - Contenido del reverso
   */
  function initPricingFlip(card, backContent = {}) {
    // Verificar si ya está inicializado
    if (card.classList.contains('wo-card--flip-initialized')) return;
    
    const {
      title = 'Incluye',
      features = [],
      cta = 'Cotizar',
      ctaAction = null
    } = backContent;
    
    // Guardar contenido original
    const originalContent = card.innerHTML;
    
    // Crear estructura de flip card
    card.classList.add('wo-card--flip', 'wo-card--flip-initialized');
    card.style.perspective = '1000px';
    
    // Crear inner container
    const inner = document.createElement('div');
    inner.className = 'wo-card--flip-inner';
    inner.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    `;
    
    // Front (contenido original)
    const front = document.createElement('div');
    front.className = 'wo-card--flip-front';
    front.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0.6em 0.8em;
    `;
    front.innerHTML = originalContent;
    
    // Back (contenido adicional)
    const back = document.createElement('div');
    back.className = 'wo-card--flip-back';
    back.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      transform: rotateY(180deg);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0.6em 0.8em;
      background: var(--wo-accent-dim);
      border-radius: var(--radius-md);
    `;
    
    // Contenido del back
    back.innerHTML = `
      <h4 style="margin: 0 0 0.5em; font-size: 0.75em; color: var(--wo-text);">${title}</h4>
      <ul style="list-style: none; padding: 0; margin: 0 0 0.5em; font-size: 0.6em;">
        ${features.map(f => `<li style="padding: 0.15em 0; color: var(--wo-text-secondary);">✓ ${f}</li>`).join('')}
      </ul>
      ${cta ? `<button class="wo-flip-cta" style="
        background: var(--wo-blue-lab);
        border: none;
        padding: 0.4em 0.8em;
        border-radius: var(--radius-sm);
        color: white;
        font-size: 0.6em;
        cursor: pointer;
        transition: all 0.2s ease;
      ">${cta}</button>` : ''}
    `;
    
    // Limpiar y reconstruir
    card.innerHTML = '';
    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    
    // Estado de flip
    let isFlipped = false;
    
    // Event handlers
    const flip = () => {
      isFlipped = !isFlipped;
      
      if (typeof anime !== 'undefined') {
        anime({
          targets: inner,
          rotateY: isFlipped ? 180 : 0,
          duration: 800,
          easing: 'easeInOutQuad'
        });
        
        // Efecto de sombra durante el flip
        anime({
          targets: card,
          boxShadow: [
            '0 8px 30px rgba(89, 104, 234, 0.15)',
            '0 15px 40px rgba(89, 104, 234, 0.3)',
            '0 8px 30px rgba(89, 104, 234, 0.15)'
          ],
          duration: 800,
          easing: 'easeInOutQuad'
        });
      } else {
        inner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0)';
      }
    };
    
    // Flip on click
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('wo-flip-cta')) {
        if (ctaAction) ctaAction();
        return;
      }
      flip();
    });
    
    // Flip on keyboard
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flip();
      }
    });
    
    return {
      flip,
      isFlipped: () => isFlipped,
      destroy: () => {
        card.innerHTML = originalContent;
        card.classList.remove('wo-card--flip', 'wo-card--flip-initialized');
      }
    };
  }
  
  /**
   * Anima el card de pricing destacado con efecto especial
   * @param {Element} card - Card con clase wo-card--highlight
   */
  function highlightPricingCard(card, options = {}) {
    const {
      duration = 1000,
      pulseCount = 2
    } = options;
    
    // Badge "RECOMENDADO" animation
    const badge = card.querySelector('::before') || card;
    
    const tl = anime.timeline({ easing: 'easeOutQuad' });
    
    // Entrada con scale y glow
    tl.add({
      targets: card,
      scale: [0.9, 1.03, 1],
      opacity: [0, 1],
      boxShadow: [
        '0 0 0px rgba(255, 203, 0, 0)',
        '0 0 40px rgba(255, 203, 0, 0.5)',
        '0 8px 30px rgba(255, 203, 0, 0.2)'
      ],
      duration: duration,
      easing: 'easeOutBack'
    });
    
    // Pulso sutil continuo
    for (let i = 0; i < pulseCount; i++) {
      tl.add({
        targets: card,
        boxShadow: [
          '0 8px 30px rgba(255, 203, 0, 0.2)',
          '0 8px 40px rgba(255, 203, 0, 0.4)',
          '0 8px 30px rgba(255, 203, 0, 0.2)'
        ],
        duration: 800,
        easing: 'easeInOutSine'
      }, `+=${i * 200}`);
    }
    
    return trackAnimation(tl);
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
  // COMPONENTE: ASCENDING REVEAL (Para Growth Tesis / WoOS)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Animación de revelación ascendente para elementos de Growth Tesis
   * Simula el Sistema Ascendente de WoOS visualmente
   * 
   * @param {Element} container - Contenedor con elementos a animar
   * @param {Object} options - Configuración
   */
  function ascendingReveal(container, options = {}) {
    const {
      selector = '.ascending-item',
      duration = 800,
      staggerDelay = 200,
      direction = 'up', // 'up', 'spiral', 'diagonal'
      glowColor = config.getPrimaryColor()
    } = options;
    
    const items = container.querySelectorAll(selector);
    if (items.length === 0) return null;
    
    // Reset: Ocultar todos los elementos
    items.forEach((item, i) => {
      item.style.opacity = '0';
      const baseY = direction === 'spiral' ? 60 - (i * 10) : 60;
      const baseX = direction === 'diagonal' ? 30 : 0;
      item.style.transform = `translateY(${baseY}px) translateX(${baseX}px) scale(0.9)`;
    });
    
    const tl = anime.timeline({ easing: config.easing.expo });
    
    items.forEach((item, i) => {
      const baseY = direction === 'spiral' ? 60 - (i * 10) : 60;
      const baseX = direction === 'diagonal' ? 30 : 0;
      const rotation = direction === 'spiral' ? 5 - i : 0;
      
      tl.add({
        targets: item,
        opacity: [0, 1],
        translateY: [baseY, 0],
        translateX: [baseX, 0],
        scale: [0.9, 1],
        rotate: [rotation, 0],
        duration,
        easing: 'easeOutBack',
        complete: () => {
          item.style.willChange = 'auto';
        }
      }, i * staggerDelay);
      
      // Efecto de glow al aparecer
      tl.add({
        targets: item,
        boxShadow: [
          `0 0 0px ${glowColor}00`,
          `0 0 20px ${glowColor}44`,
          `0 0 0px ${glowColor}00`
        ],
        duration: 600,
        easing: 'easeOutQuad'
      }, i * staggerDelay + 200);
    });
    
    return trackAnimation(tl);
  }
  
  /**
   * Efecto de pulso de sistema para elementos destacados
   * Útil para stats, métricas y cards importantes
   * 
   * @param {string|Element} targets - Elementos a animar
   * @param {Object} options - Configuración
   */
  function systemPulse(targets, options = {}) {
    const {
      color = config.getPrimaryColor(),
      intensity = 15,
      duration = 1500,
      loop = true
    } = options;
    
    return trackAnimation(anime({
      targets,
      boxShadow: [
        `0 0 0px ${color}00`,
        `0 0 ${intensity}px ${color}66`,
        `0 0 0px ${color}00`
      ],
      duration,
      loop,
      easing: 'easeInOutSine'
    }));
  }
  
  /**
   * Animación de pilares (cards de metodología/pilares)
   * Con números decorativos que pulsan
   * 
   * @param {Element} container - Contenedor de los cards
   * @param {Object} options - Configuración
   */
  function pilarsAnimation(container, options = {}) {
    const {
      cardSelector = '.wo-card',
      numberSelector = '.card-number',
      delay = 150,
      duration = 600
    } = options;
    
    const cards = container.querySelectorAll(cardSelector);
    const numbers = container.querySelectorAll(numberSelector);
    
    if (cards.length === 0) return null;
    
    // Reset
    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px) scale(0.95)';
    });
    
    numbers.forEach(num => {
      num.style.opacity = '0';
      num.style.transform = 'scale(0.5)';
    });
    
    const tl = anime.timeline({ easing: config.easing.spring });
    
    // Cards con stagger
    tl.add({
      targets: Array.from(cards),
      opacity: [0, 1],
      translateY: [40, 0],
      scale: [0.95, 1],
      delay: anime.stagger(delay, { from: 'center' }),
      duration,
      complete: () => {
        cards.forEach(card => {
          card.style.willChange = 'auto';
        });
      }
    });
    
    // Números con efecto de rebote
    tl.add({
      targets: Array.from(numbers),
      opacity: [0, 0.25],
      scale: [0.5, 1.2, 1],
      delay: anime.stagger(delay / 2, { from: 'first' }),
      duration: 500,
      easing: 'easeOutBack'
    }, '-=400');
    
    // Pulso en números al final
    tl.add({
      targets: Array.from(numbers),
      textShadow: [
        `0 0 0px ${config.getPrimaryColor()}00`,
        `0 0 15px ${config.getPrimaryColor()}66`,
        `0 0 0px ${config.getPrimaryColor()}00`
      ],
      delay: anime.stagger(100),
      duration: 800,
      easing: 'easeInOutSine'
    }, '-=200');
    
    return trackAnimation(tl);
  }
  
  /**
   * Animación de comparación lado a lado
   * Para slides de "antes/después" o "Proveedor vs Socio"
   * 
   * @param {Element} container - Contenedor con las dos columnas
   * @param {Object} options - Configuración
   */
  function comparisonAnimation(container, options = {}) {
    const {
      negativeSelector = '.wo-comparison__col--negative',
      positiveSelector = '.wo-comparison__col--positive',
      duration = 600
    } = options;
    
    const negative = container.querySelector(negativeSelector);
    const positive = container.querySelector(positiveSelector);
    
    if (!negative && !positive) return null;
    
    const elements = [negative, positive].filter(Boolean);
    
    // Reset
    elements.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = i === 0 ? 'translateX(-40px)' : 'translateX(40px)';
    });
    
    const tl = anime.timeline({ easing: config.easing.expo });
    
    // Entradas desde lados opuestos
    if (negative) {
      tl.add({
        targets: negative,
        opacity: [0, 1],
        translateX: [-40, 0],
        duration
      });
      
      // Items de la lista con stagger
      const negativeItems = negative.querySelectorAll('li');
      if (negativeItems.length > 0) {
        tl.add({
          targets: Array.from(negativeItems),
          opacity: [0, 1],
          translateX: [-20, 0],
          delay: anime.stagger(60),
          duration: 300,
          easing: 'easeOutQuad'
        }, '-=300');
      }
    }
    
    if (positive) {
      tl.add({
        targets: positive,
        opacity: [0, 1],
        translateX: [40, 0],
        duration
      }, negative ? '-=400' : 0);
      
      // Items de la lista con stagger
      const positiveItems = positive.querySelectorAll('li');
      if (positiveItems.length > 0) {
        tl.add({
          targets: Array.from(positiveItems),
          opacity: [0, 1],
          translateX: [20, 0],
          delay: anime.stagger(60),
          duration: 300,
          easing: 'easeOutQuad'
        }, '-=300');
      }
      
      // Glow en el lado positivo
      tl.add({
        targets: positive,
        boxShadow: [
          `0 0 0px ${config.getPrimaryColor()}00`,
          `0 0 20px ${config.getPrimaryColor()}33`,
          `0 0 10px ${config.getPrimaryColor()}22`
        ],
        duration: 500,
        easing: 'easeOutQuad'
      }, '-=200');
    }
    
    return trackAnimation(tl);
  }
  
  /**
   * Animación de casos de éxito con métricas
   * 
   * @param {NodeList|Array} cases - Cards de casos de éxito
   * @param {Object} options - Configuración
   */
  function casesAnimation(cases, options = {}) {
    const {
      delay = 150,
      duration = 500
    } = options;
    
    const caseArray = Array.from(cases);
    if (caseArray.length === 0) return null;
    
    // Reset
    caseArray.forEach(caseEl => {
      caseEl.style.opacity = '0';
      caseEl.style.transform = 'translateY(30px) scale(0.95)';
    });
    
    const tl = anime.timeline({ easing: config.easing.spring });
    
    // Entrada con stagger
    tl.add({
      targets: caseArray,
      opacity: [0, 1],
      translateY: [30, 0],
      scale: [0.95, 1],
      delay: anime.stagger(delay),
      duration
    });
    
    // Animar métricas dentro de cada caso
    caseArray.forEach((caseEl, i) => {
      const metrics = caseEl.querySelectorAll('.wo-case__metric-value');
      if (metrics.length > 0) {
        tl.add({
          targets: Array.from(metrics),
          color: ['#94A3B8', config.getPrimaryColor()],
          duration: 400,
          delay: anime.stagger(80),
          easing: 'easeOutQuad'
        }, (i * delay) + 300);
      }
    });
    
    return trackAnimation(tl);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // INTEGRACIÓN CON REVEAL.JS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Animación de salida para el slide anterior (Fluidity Overhaul)
   * Crea overlap visual suavizando la transición entre slides
   */
  function animateSlideExit(slide) {
    if (!slide) return;
    
    const elements = slide.querySelectorAll('.wo-card, .wo-stat, .wo-metric, .wo-column');
    if (elements.length === 0) return;
    
    anime({
      targets: elements,
      opacity: [1, 0],
      translateX: [-20, 0], // Dirección contraria al flujo de entrada
      duration: 250,
      easing: 'easeInQuad',
      complete: () => {
        // Cleanup will-change después de salida
        elements.forEach(el => {
          if (el && el.style) el.style.willChange = 'auto';
        });
      }
    });
  }
  
  /**
   * Handler para cambio de slide
   * REFACTORIZADO: Sin delays artificiales para transiciones más fluidas
   */
  function onSlideChange(event) {
    const slide = event.currentSlide;
    const previousSlide = event.previousSlide;
    
    // Animar salida del slide anterior (overlap visual)
    if (previousSlide) {
      animateSlideExit(previousSlide);
    }
    
    // Detener animaciones después del exit
    stopAllAnimations();
    currentSlide = slide;
    
    // Detectar tipo de slide y aplicar animación apropiada
    // NOTA: Animaciones sin setTimeout para inicio inmediato
    
    // 1. Portada - animación cinematográfica completa
    if (slide.classList.contains('wo-cover') || slide.querySelector('.wo-cover')) {
      cover(slide, { animateCounters: true });
      return; // Cover maneja todo internamente
    }
    
    // 2. Sección - título con accent glow
    if (slide.querySelector('.wo-section__title')) {
      section(slide);
    }
    
    // 3. CTA - glow pulsante en accent
    if (slide.querySelector('.wo-cta')) {
      const ctaTitle = slide.querySelector('.wo-cta__title');
      const ctaAccent = slide.querySelector('.wo-cta__title .accent, .wo-cta__title .accent-yellow');
      const ctaSubtitle = slide.querySelector('.wo-cta__subtitle');
      const ctaContact = slide.querySelector('.wo-cta__contact');
      
      // Animación de entrada para CTA
      const ctaElements = [ctaTitle, ctaSubtitle, ctaContact].filter(Boolean);
      ctaElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
      });
      
      const ctaTl = anime.timeline({ easing: config.easing.softLanding });
      
      if (ctaTitle) {
        ctaTl.add({
          targets: ctaTitle,
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 600
        }, 0); // Sin delay inicial
      }
      
      if (ctaSubtitle) {
        ctaTl.add({
          targets: ctaSubtitle,
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 450
        }, '-=400'); // Mayor overlap
      }
      
      if (ctaContact) {
        ctaTl.add({
          targets: ctaContact,
          opacity: [0, 1],
          translateY: [15, 0],
          duration: 400
        }, '-=300'); // Mayor overlap
      }
      
      // Glow pulsante en accent después de la entrada (este delay sí es intencional)
      if (ctaAccent) {
        setTimeout(() => ctaGlow(ctaAccent, { duration: 2500, intensity: 25 }), 600);
      }
      
      trackAnimation(ctaTl);
      return;
    }
    
    // 4. Animar contadores si hay métricas con data-animate
    const metrics = slide.querySelectorAll('.wo-metric__value[data-animate="counter"]');
    if (metrics.length > 0) {
      metrics.forEach(m => counter(m));
    }
    
    // 5. Animar stats con data-animate
    const stats = slide.querySelectorAll('.wo-stat__value[data-animate="counter"]');
    if (stats.length > 0) {
      stats.forEach(s => counter(s));
    }
    
    // 6. Steps timeline con línea de progreso
    const steps = slide.querySelector('.wo-steps[data-animate="timeline"]');
    if (steps) {
      stepsTimeline(steps);
    }
    
    // 7. Cards con stagger (si no son fragments)
    const cardsWithStagger = slide.querySelectorAll('.wo-card[data-animate="stagger"]:not(.fragment)');
    if (cardsWithStagger.length > 0) {
      cardsEntrance(cardsWithStagger);
    }
    
    // 8. Gauge animation
    const gauges = slide.querySelectorAll('.wo-gauge[data-animate="gauge"]');
    gauges.forEach(g => {
      const score = parseFloat(g.dataset.score) || 0;
      gauge(g, { score });
    });
  }
  
  /**
   * Handler para fragment mostrado
   * Mejora los fragments de Reveal.js con animaciones más fluidas
   */
  function onFragmentShown(event) {
    const fragment = event.fragment;
    
    // Cards con animación especial de stagger
    if (fragment.classList.contains('wo-card')) {
      const parent = fragment.parentElement;
      
      // Animar con spring si tiene data-animate="stagger"
      if (fragment.dataset.animate === 'stagger') {
        const visibleCards = parent.querySelectorAll('.wo-card.visible');
        if (visibleCards.length > 0) {
          cardsEntrance(visibleCards, { reset: false });
        }
      } else {
        // Animación individual para cards sin stagger grupal
        anime({
          targets: fragment,
          translateY: [30, 0],
          scale: [0.95, 1],
          opacity: [0, 1],
          duration: 500,
          easing: config.easing.spring
        });
      }
    }
    
    // Stats con animación de contador
    if (fragment.classList.contains('wo-stat')) {
      const valueEl = fragment.querySelector('.wo-stat__value');
      if (valueEl && valueEl.textContent.match(/[\d.,]+[KMB%+]*/)) {
        // Pequeño delay para que se vea el stat primero
        setTimeout(() => counter(valueEl, { duration: 1000 }), 150);
      }
      
      // Animación de entrada con spring
      anime({
        targets: fragment,
        scale: [0.85, 1],
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 450,
        easing: config.easing.spring
      });
    }
    
    // Contador en fragment genérico
    if (fragment.dataset.animate === 'counter') {
      const valueEl = fragment.querySelector('.wo-metric__value, .wo-stat__value') || fragment;
      counter(valueEl);
    }
    
    // Métricas grandes
    if (fragment.classList.contains('wo-metric')) {
      anime({
        targets: fragment,
        translateY: [40, 0],
        opacity: [0, 1],
        duration: 550,
        easing: config.easing.expo
      });
      
      const valueEl = fragment.querySelector('.wo-metric__value');
      if (valueEl && valueEl.dataset.animate === 'counter') {
        setTimeout(() => counter(valueEl), 200);
      }
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
    section,
    ctaGlow,
    stepsTimeline,
    connectElements,
    cardsEntrance,
    pricingCards,
    pathDraw,
    methodologyConnections,
    animateStepNumbers,
    gauge,
    flipCard,
    initPricingFlip,
    highlightPricingCard,
    particleFlow,
    
    // Growth Tesis / WoOS animations
    ascendingReveal,
    systemPulse,
    pilarsAnimation,
    comparisonAnimation,
    casesAnimation,
    
    // Utilidades
    formatNumber,
    parseFormattedValue,
    formatCounterValue,
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
