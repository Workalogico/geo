/* ═══════════════════════════════════════════════════════════════
   WORKALÓGICO TESERACTO ANIMATION v2.0 - wo-teseracto.js
   Animación del isotipo (teseracto/hipercubo 4D)
   
   Usa el path ORIGINAL del logo para apariencia idéntica.
   Animaciones dramáticas y visualmente impactantes.
   
   Variantes:
   1. "The Architect" - Reveal con máscara + glow espectacular
   2. "The Pulse" - Respiración con glow intenso y rotación 3D
   3. "The Energy" - Partículas de datos fluyendo
   
   Requiere: Anime.js v3.2.2
   ═══════════════════════════════════════════════════════════════ */

const WoTeseracto = (function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // PATH ORIGINAL DEL TESERACTO (idéntico a WoLogos_2026-08.svg)
  // ═══════════════════════════════════════════════════════════════
  
  const TESERACTO_PATH = "m77.54,18.33c1.37,1.33,3.33,4.25,4.52,5.85,1.43,1.92,2.85,3.85,4.27,5.77l10.7,14.49c.69.93,1.72,2.09,2.21,3.11l.03.06,7.76,23.01c2.59,7.69,5.31,15.34,7.81,23.06.62,1.89,1.8,3.64-.54,4.63-1.28.54-2.58,1.01-3.89,1.48-10.29,3.66-20.57,7.32-30.85,11-5.15,1.84-10.36,3.57-15.45,5.57-.91.36-1.53.75-2.56.48-1.45-.39-2.97-1.17-4.38-1.72-1.89-.74-3.79-1.45-5.68-2.17l-20.12-7.69c-1.87-.79-2.15-.11-2.62-2.77-.41-2.35-.63-4.72-.96-7.07l-2.94-21.05c-1.3-9.33-2.8-18.65-3.94-28l-.08-.67.57-.35c2.24-1.37,4.68-2.35,7.03-3.52l34.18-17.06c2.24-1.12,4.46-2.25,6.7-3.36,1.66-.83,5.59-2.96,7.27-3.34l.55-.13.41.39h0Zm19.29,32.35c-1.13.86-2.39,1.97-3.32,2.73-1.17.96-2.89,2.23-4.03,3.33.15.84.58,2.15.77,2.82.57,1.99,1.18,3.98,1.78,5.96.92,3,1.88,5.99,2.79,9,.83,2.75,1.02,2.46,3,4.32,2.62,2.48,5.27,4.92,7.84,7.45,1.25,1.23,2.51,2.46,3.78,3.67.28.27.66.64,1.07,1.05l-13.69-40.34h0Zm7.83,39.12c-1.07-1.04-2.16-2.06-3.24-3.1-1.34-1.29-2.65-2.62-3.98-3.92-.72-.7-2.67-2.7-3.71-3.47l-2.11.89c.48,2.73.37,2.64,2.99,4.06,1.8.98,3.61,1.94,5.39,2.96,1.54.88,3.11,1.73,4.67,2.57h0Zm5.6,6.51c-1.1-.6-2.43-1.25-3.08-1.6l-14.55-7.89c-.2-.11-1.35-.81-1.51-.83-.23-.03-3.39,1.34-3.7,1.46-6.88,2.75-13.89,5.28-20.68,8.23-.05,1.36-.44,3.18-.62,4.36-.37,2.38-.77,4.76-1.14,7.14-.19,1.24-.7,3.9-.89,5.75l46.18-16.62h0Zm-15.09-48.99l-14.25-19.04,6.01,19.88c.24.79.45,1.67.72,2.49l7.52-3.33h0Zm-18.05-20.14c-.35,2.2-.68,4.4-1.01,6.6-.51,3.45-1,6.91-1.52,10.36-.34,2.24-.79,1.74.66,3.28l4.77,5.08c.23.24.64.77.97,1.09l3.69-1.62-7.56-24.78h0Zm-51.07,19.44c.12.06.22.11.29.15l5.88,3.18c2.62,1.41,5.23,2.82,7.84,4.26,1.3.72,2.61,1.42,3.91,2.13.27.15,1.53.95,1.76,1,.25-.03,1.62-.75,1.89-.87,3.68-1.71,7.37-3.38,11.08-5.04,3.75-1.68,7.51-3.36,11.25-5.08.22-.1.99-.37,1.14-.5.04-.08.05-.26.06-.34.1-.76.22-1.51.34-2.27.58-3.74,1.16-7.47,1.72-11.21.37-2.45.73-4.9,1.06-7.36.07-.55.21-1.4.32-2.2l-48.54,24.15h0Zm65.69,28.66c-.19-.66-.42-1.35-.58-1.91-.62-2.11-1.26-4.22-1.9-6.32-.8-2.62-1.58-5.48-2.48-8.13l-.95.78,3.35,11.6c.26.89.62,2.61,1.01,3.57.4.13,1,.28,1.54.41h0Zm-7.56-18.38c.56-.4,1.14-.96,1.61-1.32,0-.03-.02-.05-.03-.08-.05-.14-.09-.29-.13-.43l-2.26,1,.8.83h0Zm2.46,17.12c-.22-.8-.53-1.68-.71-2.31-.51-1.84-.99-3.68-1.5-5.52-.39-1.44-.87-3.39-1.43-4.95l-4.52,1.95,2.54,9.47c1.3.4,3.9,1.03,5.61,1.36h0Zm1.19,4.23c-.06-.29-.14-.57-.23-.69l-2.07-.46c.1.09.2.17.28.24.19.17,1.08,1.11,1.26,1.19.13,0,.45-.13.76-.28h0Zm-9.92-23.33c-.63-.73-1.53-1.7-2.39-2.58.3,1.14.66,2.36.94,3.23l1.44-.65h0Zm3.34,3.55c-.32-.35-.68-.72-.99-1.03l-2.85,1.31.31,1.25,3.53-1.53h0Zm-7.73-1.56l-2.08-7.72-22.7,10.3c1.56,1.28,4.12,3,5.27,3.89.58.45,1.17.87,1.77,1.28.93-.33,1.99-.82,2.85-1.19,2.04-.86,4.07-1.74,6.09-2.63,2.06-.9,4.11-1.81,6.16-2.74.73-.33,1.82-.77,2.64-1.2h0Zm14.58,26.74l-1.57-1.42-20.47,8.37.42,1.71,21.61-8.66h0Zm-4.41-3.81l-4.42-3.9-15.15,6.45c.1.74.45,1.92.57,2.45.11.5.34,1.68.6,2.49l18.41-7.49h0Zm-24.84-12.96l.98.75,14.85-6.33c-.05-.42-.16-.87-.3-1.3l-15.54,6.87h0Zm16.58-2.41l-13.98,5.97,2.02,8.71,14.25-6.11-2.29-8.57h0Zm-18.81,17.64c1.22-.46,2.82-1.08,3.81-1.6l-2.22-9.63c-.99-.26-2.88-.61-4.16-.8.25,1.72,1.01,4.56,1.27,5.81.42,2.06.76,4.18,1.31,6.22h0Zm-4.19-15.95c-1.23-1.03-3.07-2.47-4.44-3.45.01.06.02.11.04.15.13.56.69.83,1.12,1.15,1.02.76,2.06,1.48,3.07,2.25l.22-.09h0Zm9.88,22.37c-.17-1.2-.72-3.42-1.14-4.91l-3.83,1.64c.14.67.25,1.34.38,2.01.34,1.68.61,1.4,2.01,2.24.04.02.08.05.12.07.05-.02.1-.05.15-.07l2.31-.98h0Zm-10.28-4.5l1.68-.72c-.05-.48-.3-1.15-.38-1.47-.22-.88-.38-1.78-.55-2.67-.4-2.04-1.57-8.77-2.3-10.15-.26-.33-.82-.73-1.44-1.14l1.39,7.42c.31,1.63.58,3.27.88,4.9.16.85.42,2.6.72,3.82h0Zm-8.15-23.68c-.03-.13-.05-.25-.08-.34-.13-.06-.26-.13-.39-.19l-1.04-.57c.5.37,1,.73,1.5,1.1,0,0,0,0,0,0h0Zm18.02,45.99c.21-1.41.43-2.83.63-4.24.29-1.96.83-4.64.98-6.7l-3.82-2.27c-.14,0-.4.1-.64.22.14,1.18.65,3.14.85,4.04.35,1.55.72,3.1,1.06,4.65l.93,4.31h0Zm-22.44-8.52l15.91-6.47c-.1-.36-.21-.73-.29-.85-.31-.25-1.01-.54-1.39-.76-.53-.3-1.07-.58-1.6-.88-.34-.19-.68-.43-1.03-.64-1.16.76-2.95,2.37-3.81,3.1-1.38,1.16-2.74,2.36-4.13,3.5-1.22,1.01-2.45,2-3.66,3h0Zm20.5,15.03l-3.89-18.23-21.14,8.57c2.13,1,4.71,1.87,6.88,2.69,2.36.88,4.75,1.74,7.1,2.66.6.24,1.19.52,1.82.74l7.25,2.74c.43.16,1.24.53,1.98.82h0Zm-28.19-12.72c.45-.37.9-.76,1.26-1.05,1.61-1.32,3.21-2.65,4.81-3.98,2.45-2.04,4.88-4.14,7.35-6.15,1.21-.99,2.51-1.92,3.66-2.98.59-.55-.21-2.94-.35-3.67l-2.81-14.77c-.44-2.29.09-2.03-1.76-3.35-2.37-1.7-4.72-3.43-7.06-5.17-2.3-1.72-4.61-3.42-6.93-5.12-1.51-1.1-3.02-2.2-4.54-3.29-.2-.14-.44-.32-.7-.51l7.06,50.04h0Z";

  // ═══════════════════════════════════════════════════════════════
  // CONFIGURACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  const config = {
    colors: {
      yellow: '#FFCB00',
      yellowGlow: 'rgba(255, 203, 0, 0.8)',
      yellowDim: 'rgba(255, 203, 0, 0.2)',
      blue: '#5968EA',
      blueGlow: 'rgba(89, 104, 234, 0.8)',
      white: '#F7F7F7',
      dark: '#0F0F1A'
    },
    
    timing: {
      // The Architect
      revealDuration: 2500,
      glowBuildDuration: 800,
      
      // The Pulse
      pulseDuration: 2000,
      breatheScale: { min: 0.96, max: 1.04 },
      glowIntensity: { min: 0, max: 25 },
      
      // The Energy
      particleSpeed: 1500,
      particleCount: 8
    },
    
    easing: {
      reveal: 'easeInOutQuart',
      glow: 'easeInOutSine',
      pulse: 'easeInOutQuad',
      dramatic: 'easeOutExpo'
    }
  };

  // Estado interno
  let instances = new Map();
  let idCounter = 0;

  // ═══════════════════════════════════════════════════════════════
  // CREACIÓN DEL SVG
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Crea el elemento SVG con el teseracto original + capas de efectos
   */
  function createSVGElement(options = {}) {
    const {
      color = config.colors.yellow,
      size = 140,
      withGlow = true,
      withParticles = true
    } = options;

    // Crear SVG principal
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 140 140');
    svg.setAttribute('class', 'wo-teseracto');
    svg.style.cssText = `
      width: 100%;
      height: 100%;
      overflow: visible;
      transform-origin: center center;
    `;

    // ─────────────────────────────────────────────────────────────
    // DEFINICIONES (filtros, gradientes, máscaras)
    // ─────────────────────────────────────────────────────────────
    
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // ID único para esta instancia
    const uid = `teseracto-${++idCounter}`;
    
    // Filtro de Glow intenso
    defs.innerHTML = `
      <!-- Glow Filter (dramático) -->
      <filter id="${uid}-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="blur1">
          <animate attributeName="stdDeviation" 
                   values="0;4;8;4;0" 
                   dur="2s" 
                   repeatCount="indefinite"/>
        </feGaussianBlur>
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2"/>
        <feMerge>
          <feMergeNode in="blur1"/>
          <feMergeNode in="blur2"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <!-- Glow estático para estado base -->
      <filter id="${uid}-glow-static" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <!-- Glow de energía (más intenso) -->
      <filter id="${uid}-energy-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1"/>
        <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2"/>
        <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur3"/>
        <feMerge>
          <feMergeNode in="blur3"/>
          <feMergeNode in="blur2"/>
          <feMergeNode in="blur1"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <!-- Gradiente radial para reveal -->
      <radialGradient id="${uid}-reveal-gradient" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="white" stop-opacity="1"/>
        <stop offset="100%" stop-color="white" stop-opacity="0"/>
      </radialGradient>
      
      <!-- Máscara circular para reveal -->
      <mask id="${uid}-reveal-mask">
        <circle cx="70" cy="70" r="0" fill="url(#${uid}-reveal-gradient)" class="reveal-circle"/>
      </mask>
      
      <!-- Máscara de clip para el logo -->
      <clipPath id="${uid}-clip">
        <path d="${TESERACTO_PATH}"/>
      </clipPath>
    `;
    
    svg.appendChild(defs);

    // ─────────────────────────────────────────────────────────────
    // CAPA 1: Glow de fondo (siempre visible, pulsante)
    // ─────────────────────────────────────────────────────────────
    
    const glowLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    glowLayer.setAttribute('class', 'wo-teseracto__glow-layer');
    glowLayer.style.opacity = '0';
    
    const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    glowPath.setAttribute('d', TESERACTO_PATH);
    glowPath.setAttribute('fill', color);
    glowPath.setAttribute('filter', `url(#${uid}-energy-glow)`);
    glowPath.setAttribute('class', 'wo-teseracto__glow');
    glowLayer.appendChild(glowPath);
    
    svg.appendChild(glowLayer);

    // ─────────────────────────────────────────────────────────────
    // CAPA 2: Teseracto principal (path original exacto)
    // ─────────────────────────────────────────────────────────────
    
    const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mainGroup.setAttribute('class', 'wo-teseracto__main');
    mainGroup.style.transformOrigin = 'center center';
    
    const mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    mainPath.setAttribute('d', TESERACTO_PATH);
    mainPath.setAttribute('fill', color);
    mainPath.setAttribute('class', 'wo-teseracto__shape');
    mainGroup.appendChild(mainPath);
    
    svg.appendChild(mainGroup);

    // ─────────────────────────────────────────────────────────────
    // CAPA 3: Contorno de energía (stroke sobre el path)
    // ─────────────────────────────────────────────────────────────
    
    const strokeLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    strokeLayer.setAttribute('class', 'wo-teseracto__stroke-layer');
    strokeLayer.style.opacity = '0';
    
    const strokePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    strokePath.setAttribute('d', TESERACTO_PATH);
    strokePath.setAttribute('fill', 'none');
    strokePath.setAttribute('stroke', color);
    strokePath.setAttribute('stroke-width', '1');
    strokePath.setAttribute('filter', `url(#${uid}-glow-static)`);
    strokePath.setAttribute('class', 'wo-teseracto__stroke');
    
    // Preparar para line drawing
    const pathLength = 2500; // Aproximado del path complejo
    strokePath.style.strokeDasharray = pathLength;
    strokePath.style.strokeDashoffset = pathLength;
    
    strokeLayer.appendChild(strokePath);
    svg.appendChild(strokeLayer);

    // ─────────────────────────────────────────────────────────────
    // CAPA 4: Partículas de energía (opcional)
    // ─────────────────────────────────────────────────────────────
    
    if (withParticles) {
      const particlesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      particlesGroup.setAttribute('class', 'wo-teseracto__particles');
      particlesGroup.style.opacity = '0';
      
      // Crear partículas orbitando
      for (let i = 0; i < config.timing.particleCount; i++) {
        const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const angle = (i / config.timing.particleCount) * Math.PI * 2;
        const radius = 55 + Math.random() * 15;
        
        particle.setAttribute('cx', 70 + Math.cos(angle) * radius);
        particle.setAttribute('cy', 70 + Math.sin(angle) * radius);
        particle.setAttribute('r', 1.5 + Math.random() * 1.5);
        particle.setAttribute('fill', color);
        particle.setAttribute('filter', `url(#${uid}-glow-static)`);
        particle.setAttribute('class', 'wo-teseracto__particle');
        particle.setAttribute('data-angle', angle);
        particle.setAttribute('data-radius', radius);
        particle.setAttribute('data-speed', 0.5 + Math.random() * 0.5);
        
        particlesGroup.appendChild(particle);
      }
      
      svg.appendChild(particlesGroup);
    }

    // Guardar referencias
    svg._uid = uid;
    svg._color = color;
    
    return svg;
  }

  // ═══════════════════════════════════════════════════════════════
  // ANIMACIÓN: THE ARCHITECT (Reveal Espectacular)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Animación de entrada dramática:
   * 1. Glow inicial que se expande
   * 2. Forma que aparece desde el centro
   * 3. Línea de energía que recorre el contorno
   * 4. Flash final de completado
   */
  function animateArchitect(svg, options = {}) {
    const {
      duration = config.timing.revealDuration,
      onComplete = null
    } = options;

    if (typeof anime === 'undefined') {
      console.error('WoTeseracto: Anime.js is required');
      return null;
    }

    const uid = svg._uid;
    const color = svg._color;
    const mainGroup = svg.querySelector('.wo-teseracto__main');
    const mainPath = svg.querySelector('.wo-teseracto__shape');
    const glowLayer = svg.querySelector('.wo-teseracto__glow-layer');
    const strokeLayer = svg.querySelector('.wo-teseracto__stroke-layer');
    const strokePath = svg.querySelector('.wo-teseracto__stroke');
    const particlesGroup = svg.querySelector('.wo-teseracto__particles');

    // Reset inicial
    mainGroup.style.transform = 'scale(0.3) rotate(-15deg)';
    mainGroup.style.opacity = '0';
    glowLayer.style.opacity = '0';
    strokeLayer.style.opacity = '0';

    const tl = anime.timeline({
      easing: config.easing.dramatic,
      complete: () => {
        if (onComplete) onComplete();
      }
    });

    // ═══ FASE 1: Glow inicial emerge (explosión de energía) ═══
    tl.add({
      targets: glowLayer,
      opacity: [0, 0.6, 0.3],
      duration: duration * 0.3,
      easing: 'easeOutExpo'
    }, 0);

    // ═══ FASE 2: Forma principal aparece con rotación ═══
    tl.add({
      targets: mainGroup,
      scale: [0.3, 1.08, 1],
      rotate: [-15, 5, 0],
      opacity: [0, 1],
      duration: duration * 0.5,
      easing: 'easeOutBack'
    }, duration * 0.1);

    // ═══ FASE 3: Línea de energía recorre el contorno ═══
    tl.add({
      targets: strokeLayer,
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutQuad'
    }, duration * 0.4);

    tl.add({
      targets: strokePath,
      strokeDashoffset: [2500, 0],
      duration: duration * 0.5,
      easing: 'easeInOutQuart'
    }, duration * 0.4);

    // ═══ FASE 4: Flash de completado ═══
    tl.add({
      targets: glowLayer,
      opacity: [0.3, 0.8, 0.15],
      duration: 600,
      easing: 'easeInOutSine'
    }, duration * 0.85);

    // ═══ FASE 5: Partículas aparecen ═══
    if (particlesGroup) {
      tl.add({
        targets: particlesGroup,
        opacity: [0, 0.8],
        duration: 500,
        easing: 'easeOutQuad'
      }, duration * 0.7);

      tl.add({
        targets: svg.querySelectorAll('.wo-teseracto__particle'),
        scale: [0, 1],
        duration: 400,
        delay: anime.stagger(50, { from: 'center' }),
        easing: 'easeOutBack'
      }, duration * 0.75);
    }

    // ═══ FASE 6: Fade out del stroke ═══
    tl.add({
      targets: strokeLayer,
      opacity: [1, 0],
      duration: 400,
      easing: 'easeInQuad'
    }, duration * 0.95);

    return tl;
  }

  // ═══════════════════════════════════════════════════════════════
  // ANIMACIÓN: THE PULSE (Respiración Dramática)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Animación de bucle continuo:
   * - Scale suave (respiración)
   * - Glow pulsante intenso
   * - Rotación 3D sutil
   * - Partículas orbitando
   */
  function animatePulse(svg, options = {}) {
    const {
      duration = config.timing.pulseDuration,
      intensity = 1 // Multiplicador de intensidad (0.5 = sutil, 2 = muy intenso)
    } = options;

    if (typeof anime === 'undefined') {
      console.error('WoTeseracto: Anime.js is required');
      return null;
    }

    const mainGroup = svg.querySelector('.wo-teseracto__main');
    const glowLayer = svg.querySelector('.wo-teseracto__glow-layer');
    const particlesGroup = svg.querySelector('.wo-teseracto__particles');
    const particles = svg.querySelectorAll('.wo-teseracto__particle');

    // Calcular valores según intensidad
    const scaleRange = {
      min: 1 - (0.04 * intensity),
      max: 1 + (0.04 * intensity)
    };
    const glowOpacity = {
      min: 0.1 * intensity,
      max: 0.4 * intensity
    };

    // Timeline principal (loop)
    const mainTl = anime.timeline({
      loop: true,
      direction: 'alternate',
      easing: config.easing.pulse
    });

    // ═══ Respiración (scale + rotación 3D sutil) ═══
    mainTl.add({
      targets: mainGroup,
      scale: [scaleRange.min, scaleRange.max],
      rotateY: [-3 * intensity, 3 * intensity],
      rotateX: [-2 * intensity, 2 * intensity],
      duration,
      easing: 'easeInOutSine'
    }, 0);

    // ═══ Glow pulsante ═══
    mainTl.add({
      targets: glowLayer,
      opacity: [glowOpacity.min, glowOpacity.max],
      duration,
      easing: 'easeInOutSine'
    }, 0);

    // ═══ Partículas orbitando (animación separada) ═══
    let particleAnimation = null;
    if (particles.length > 0 && particlesGroup) {
      particlesGroup.style.opacity = '0.8';
      
      // Animación continua de órbita
      particleAnimation = anime({
        targets: particles,
        translateX: (el) => {
          const angle = parseFloat(el.getAttribute('data-angle'));
          const radius = parseFloat(el.getAttribute('data-radius'));
          const speed = parseFloat(el.getAttribute('data-speed'));
          return [0, Math.cos(angle + Math.PI) * radius * 0.3];
        },
        translateY: (el) => {
          const angle = parseFloat(el.getAttribute('data-angle'));
          const radius = parseFloat(el.getAttribute('data-radius'));
          return [0, Math.sin(angle + Math.PI) * radius * 0.3];
        },
        opacity: [0.4, 1, 0.4],
        scale: [0.8, 1.2, 0.8],
        duration: duration * 1.5,
        delay: anime.stagger(100),
        loop: true,
        easing: 'easeInOutSine'
      });
    }

    return {
      main: mainTl,
      particles: particleAnimation,
      pause: () => {
        mainTl.pause();
        if (particleAnimation) particleAnimation.pause();
      },
      play: () => {
        mainTl.play();
        if (particleAnimation) particleAnimation.play();
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // ANIMACIÓN: THE ENERGY (Efecto Continuo de Energía)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Efecto de "energía fluyendo" más dramático
   * Combina múltiples capas de animación
   */
  function animateEnergy(svg, options = {}) {
    const {
      duration = 3000,
      intensity = 1.5
    } = options;

    const mainGroup = svg.querySelector('.wo-teseracto__main');
    const glowLayer = svg.querySelector('.wo-teseracto__glow-layer');
    const strokeLayer = svg.querySelector('.wo-teseracto__stroke-layer');
    const strokePath = svg.querySelector('.wo-teseracto__stroke');

    // Mostrar capas
    strokeLayer.style.opacity = '0.6';
    glowLayer.style.opacity = '0.2';

    // Animación de línea de energía continua
    const strokeAnim = anime({
      targets: strokePath,
      strokeDashoffset: [2500, -2500],
      duration: duration * 2,
      loop: true,
      easing: 'linear'
    });

    // Pulso del glow
    const glowAnim = anime({
      targets: glowLayer,
      opacity: [0.15, 0.5 * intensity, 0.15],
      duration: duration,
      loop: true,
      easing: 'easeInOutSine'
    });

    // Rotación sutil continua
    const rotateAnim = anime({
      targets: mainGroup,
      rotateY: [0, 360],
      duration: duration * 8,
      loop: true,
      easing: 'linear'
    });

    // Scale breathing
    const scaleAnim = anime({
      targets: mainGroup,
      scale: [0.98, 1.02],
      duration: duration * 0.7,
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutSine'
    });

    return {
      stroke: strokeAnim,
      glow: glowAnim,
      rotate: rotateAnim,
      scale: scaleAnim,
      pause: () => {
        strokeAnim.pause();
        glowAnim.pause();
        rotateAnim.pause();
        scaleAnim.pause();
      },
      play: () => {
        strokeAnim.play();
        glowAnim.play();
        rotateAnim.play();
        scaleAnim.play();
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // VARIANTE COMBINADA: ARCHITECT → PULSE
  // ═══════════════════════════════════════════════════════════════
  
  function animateArchitectThenPulse(svg, options = {}) {
    const {
      revealDuration = config.timing.revealDuration,
      pulseDuration = config.timing.pulseDuration,
      pulseIntensity = 1,
      pauseBetween = 500,
      onRevealComplete = null,
      onPulseStart = null
    } = options;

    let pulseAnimation = null;

    const revealAnimation = animateArchitect(svg, {
      duration: revealDuration,
      onComplete: () => {
        if (onRevealComplete) onRevealComplete();

        setTimeout(() => {
          if (onPulseStart) onPulseStart();
          pulseAnimation = animatePulse(svg, {
            duration: pulseDuration,
            intensity: pulseIntensity
          });
        }, pauseBetween);
      }
    });

    return {
      reveal: revealAnimation,
      getPulse: () => pulseAnimation,
      pause: () => {
        if (revealAnimation) revealAnimation.pause();
        if (pulseAnimation) {
          if (pulseAnimation.pause) pulseAnimation.pause();
        }
      },
      stop: () => {
        if (revealAnimation) revealAnimation.pause();
        if (pulseAnimation) {
          if (pulseAnimation.pause) pulseAnimation.pause();
        }
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // COMPONENTE COMPLETO
  // ═══════════════════════════════════════════════════════════════
  
  function create(container, options = {}) {
    const {
      color = config.colors.yellow,
      variant = 'architect-pulse',
      autoPlay = true,
      intensity = 1,
      withParticles = true,
      ...animationOptions
    } = options;

    const containerEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!containerEl) {
      console.error('WoTeseracto: Container not found');
      return null;
    }

    // Crear SVG
    const svg = createSVGElement({
      color,
      withParticles
    });

    // Estilizar contenedor
    containerEl.style.cssText += `
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 1000px;
    `;

    containerEl.appendChild(svg);

    const instanceId = `teseracto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    svg.setAttribute('data-instance', instanceId);

    let animation = null;

    if (autoPlay) {
      switch (variant) {
        case 'architect':
          animation = animateArchitect(svg, { ...animationOptions, intensity });
          break;
        case 'pulse':
          // Mostrar inmediatamente, luego pulsar
          const mainGroup = svg.querySelector('.wo-teseracto__main');
          const glowLayer = svg.querySelector('.wo-teseracto__glow-layer');
          mainGroup.style.opacity = '1';
          mainGroup.style.transform = 'none';
          glowLayer.style.opacity = '0.2';
          animation = animatePulse(svg, { ...animationOptions, intensity });
          break;
        case 'energy':
          // Mostrar inmediatamente, luego energía
          const mainG = svg.querySelector('.wo-teseracto__main');
          const glowL = svg.querySelector('.wo-teseracto__glow-layer');
          mainG.style.opacity = '1';
          mainG.style.transform = 'none';
          glowL.style.opacity = '0.2';
          animation = animateEnergy(svg, { ...animationOptions, intensity });
          break;
        case 'architect-pulse':
        default:
          animation = animateArchitectThenPulse(svg, { 
            ...animationOptions, 
            pulseIntensity: intensity 
          });
          break;
      }
    }

    const instance = {
      id: instanceId,
      svg,
      container: containerEl,
      animation,

      play: () => {
        if (animation && animation.play) animation.play();
        else if (!animation) {
          animation = animateArchitectThenPulse(svg, { 
            ...animationOptions, 
            pulseIntensity: intensity 
          });
        }
        return animation;
      },

      pause: () => {
        if (animation) {
          if (animation.pause) animation.pause();
          else if (animation.stop) animation.stop();
        }
      },

      restart: () => {
        // Detener animación actual
        if (animation) {
          if (animation.pause) animation.pause();
          else if (animation.stop) animation.stop();
        }

        // Reset visual
        const mainGroup = svg.querySelector('.wo-teseracto__main');
        const glowLayer = svg.querySelector('.wo-teseracto__glow-layer');
        const strokeLayer = svg.querySelector('.wo-teseracto__stroke-layer');
        const strokePath = svg.querySelector('.wo-teseracto__stroke');
        const particlesGroup = svg.querySelector('.wo-teseracto__particles');

        mainGroup.style.transform = 'scale(0.3) rotate(-15deg)';
        mainGroup.style.opacity = '0';
        glowLayer.style.opacity = '0';
        strokeLayer.style.opacity = '0';
        strokePath.style.strokeDashoffset = '2500';
        if (particlesGroup) particlesGroup.style.opacity = '0';

        // Reiniciar
        animation = animateArchitectThenPulse(svg, { 
          ...animationOptions, 
          pulseIntensity: intensity 
        });
        return animation;
      },

      setIntensity: (newIntensity) => {
        // Reiniciar con nueva intensidad
        if (animation) {
          if (animation.pause) animation.pause();
        }
        animation = animatePulse(svg, { 
          duration: config.timing.pulseDuration,
          intensity: newIntensity 
        });
      },

      destroy: () => {
        if (animation) {
          if (animation.pause) animation.pause();
          else if (animation.stop) animation.stop();
        }
        svg.remove();
        instances.delete(instanceId);
      },

      // Acceso directo a animaciones
      animateArchitect: (opts) => animateArchitect(svg, opts),
      animatePulse: (opts) => animatePulse(svg, opts),
      animateEnergy: (opts) => animateEnergy(svg, opts)
    };

    instances.set(instanceId, instance);
    return instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════
  
  function getInstance(id) {
    return instances.get(id);
  }

  function destroyAll() {
    instances.forEach(instance => instance.destroy());
    instances.clear();
  }

  function pauseAll() {
    instances.forEach(instance => instance.pause());
  }

  // ═══════════════════════════════════════════════════════════════
  // API PÚBLICA
  // ═══════════════════════════════════════════════════════════════
  
  return {
    config,
    TESERACTO_PATH,
    
    create,
    createSVGElement,
    
    animateArchitect,
    animatePulse,
    animateEnergy,
    animateArchitectThenPulse,
    
    getInstance,
    destroyAll,
    pauseAll
  };
})();

// Exportar
if (typeof window !== 'undefined') {
  window.WoTeseracto = WoTeseracto;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WoTeseracto;
}
