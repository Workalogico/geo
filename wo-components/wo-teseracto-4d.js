/* ═══════════════════════════════════════════════════════════════
   WORKALÓGICO TESERACTO 4D - wo-teseracto-4d.js
   Animación matemáticamente correcta de rotación 4D (hipercubo)
   
   Implementa:
   - 16 vértices del teseracto
   - 32 aristas conectoras
   - Rotación en 6 planos 4D (XY, XZ, XW, YZ, YW, ZW)
   - Proyección estereográfica 4D → 3D → 2D
   
   El efecto característico donde el cubo interno "atraviesa"
   el cubo externo es REAL, no simulado.
   
   Usa: Matemáticas puras + Anime.js para timing
   ═══════════════════════════════════════════════════════════════ */

const WoTeseracto4D = (function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // GEOMETRÍA DEL TESERACTO
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Genera los 16 vértices de un teseracto unitario centrado en el origen
   * Cada vértice tiene coordenadas (x, y, z, w) con valores ±1
   */
  function generateVertices(scale = 1) {
    const vertices = [];
    for (let i = 0; i < 16; i++) {
      vertices.push({
        x: ((i & 1) ? 1 : -1) * scale,
        y: ((i & 2) ? 1 : -1) * scale,
        z: ((i & 4) ? 1 : -1) * scale,
        w: ((i & 8) ? 1 : -1) * scale
      });
    }
    return vertices;
  }

  /**
   * Genera las 32 aristas del teseracto
   * Conecta vértices que difieren en exactamente una coordenada
   */
  function generateEdges() {
    const edges = [];
    
    // Método: dos vértices están conectados si difieren en exactamente un bit
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const xor = i ^ j;
        // Si xor es potencia de 2, difieren en exactamente un bit
        if (xor && !(xor & (xor - 1))) {
          edges.push([i, j]);
        }
      }
    }
    
    return edges; // Exactamente 32 aristas
  }

  // ═══════════════════════════════════════════════════════════════
  // MATRICES DE ROTACIÓN 4D
  // Hay 6 planos de rotación en 4D: XY, XZ, XW, YZ, YW, ZW
  // ═══════════════════════════════════════════════════════════════
  
  /** Rotación en el plano XY (como rotación 3D normal en Z) */
  function rotationMatrixXY(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [
      [c, -s, 0, 0],
      [s,  c, 0, 0],
      [0,  0, 1, 0],
      [0,  0, 0, 1]
    ];
  }

  /** Rotación en el plano XZ */
  function rotationMatrixXZ(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [
      [c, 0, -s, 0],
      [0, 1,  0, 0],
      [s, 0,  c, 0],
      [0, 0,  0, 1]
    ];
  }

  /** Rotación en el plano XW - ¡Esta es la rotación 4D característica! */
  function rotationMatrixXW(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [
      [c, 0, 0, -s],
      [0, 1, 0,  0],
      [0, 0, 1,  0],
      [s, 0, 0,  c]
    ];
  }

  /** Rotación en el plano YZ */
  function rotationMatrixYZ(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [
      [1, 0,  0, 0],
      [0, c, -s, 0],
      [0, s,  c, 0],
      [0, 0,  0, 1]
    ];
  }

  /** Rotación en el plano YW */
  function rotationMatrixYW(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [
      [1, 0, 0,  0],
      [0, c, 0, -s],
      [0, 0, 1,  0],
      [0, s, 0,  c]
    ];
  }

  /** Rotación en el plano ZW */
  function rotationMatrixZW(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [
      [1, 0, 0,  0],
      [0, 1, 0,  0],
      [0, 0, c, -s],
      [0, 0, s,  c]
    ];
  }

  // ═══════════════════════════════════════════════════════════════
  // OPERACIONES MATRICIALES
  // ═══════════════════════════════════════════════════════════════
  
  /** Multiplica una matriz 4x4 por un vector 4D */
  function multiplyMatrixVector(matrix, v) {
    return {
      x: matrix[0][0] * v.x + matrix[0][1] * v.y + matrix[0][2] * v.z + matrix[0][3] * v.w,
      y: matrix[1][0] * v.x + matrix[1][1] * v.y + matrix[1][2] * v.z + matrix[1][3] * v.w,
      z: matrix[2][0] * v.x + matrix[2][1] * v.y + matrix[2][2] * v.z + matrix[2][3] * v.w,
      w: matrix[3][0] * v.x + matrix[3][1] * v.y + matrix[3][2] * v.z + matrix[3][3] * v.w
    };
  }

  /** Multiplica dos matrices 4x4 */
  function multiplyMatrices(m1, m2) {
    const result = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          result[i][j] += m1[i][k] * m2[k][j];
        }
      }
    }
    return result;
  }

  /** Matriz identidad 4x4 */
  function identityMatrix() {
    return [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
  }

  // ═══════════════════════════════════════════════════════════════
  // PROYECCIÓN 4D → 2D
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Proyección estereográfica de 4D a 3D
   * Simula una "cámara" en la 4ta dimensión
   */
  function project4Dto3D(point, distance = 2) {
    const scale = distance / (distance - point.w);
    return {
      x: point.x * scale,
      y: point.y * scale,
      z: point.z * scale,
      scale: scale // Guardamos para efectos de profundidad
    };
  }

  /**
   * Proyección de 3D a 2D (perspectiva o isométrica)
   */
  function project3Dto2D(point3D, config = {}) {
    const {
      scale = 50,
      perspective = true,
      cameraDistance = 5,
      rotateX = -0.3,  // Inclinación para mejor visualización
      rotateY = 0.5
    } = config;

    let { x, y, z } = point3D;

    // Rotación en Y (para ver el teseracto desde un ángulo)
    const cosY = Math.cos(rotateY), sinY = Math.sin(rotateY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    // Rotación en X (inclinación)
    const cosX = Math.cos(rotateX), sinX = Math.sin(rotateX);
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    if (perspective) {
      const perspScale = cameraDistance / (cameraDistance - z2);
      return {
        x: x1 * perspScale * scale,
        y: y1 * perspScale * scale,
        depth: z2,
        scale: perspScale * (point3D.scale || 1)
      };
    }

    return {
      x: x1 * scale,
      y: y1 * scale,
      depth: z2,
      scale: point3D.scale || 1
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // CONFIGURACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  const config = {
    colors: {
      yellow: '#FFCB00',
      blue: '#5968EA',
      white: '#F7F7F7',
      dark: '#0F0F1A'
    },
    
    // Presets de rotación
    rotationPresets: {
      // Rotación clásica XW - el efecto más reconocible
      classic: {
        XW: 1.0,
        YW: 0,
        ZW: 0,
        XY: 0,
        XZ: 0,
        YZ: 0
      },
      // Rotación dual - más compleja
      dual: {
        XW: 0.7,
        YW: 0.5,
        ZW: 0,
        XY: 0,
        XZ: 0,
        YZ: 0
      },
      // Rotación completa - todos los planos
      complex: {
        XW: 0.5,
        YW: 0.3,
        ZW: 0.7,
        XY: 0.2,
        XZ: 0.1,
        YZ: 0.15
      },
      // Suave - para uso continuo
      gentle: {
        XW: 0.3,
        YW: 0.2,
        ZW: 0,
        XY: 0.1,
        XZ: 0,
        YZ: 0.1
      }
    }
  };

  // Estado global
  let instances = new Map();
  let idCounter = 0;

  // ═══════════════════════════════════════════════════════════════
  // RENDERIZADO SVG
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Crea el elemento SVG base
   */
  function createSVGElement(options = {}) {
    const {
      viewBoxSize = 200,
      color = config.colors.yellow,
      strokeWidth = 1.5,
      showVertices = true,
      vertexRadius = 2
    } = options;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${viewBoxSize} ${viewBoxSize}`);
    svg.setAttribute('class', 'wo-teseracto-4d');
    svg.style.cssText = `
      width: 100%;
      height: 100%;
      overflow: visible;
    `;

    // Definiciones (filtros de glow)
    const uid = `t4d-${++idCounter}`;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <filter id="${uid}-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="${uid}-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1"/>
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2"/>
        <feMerge>
          <feMergeNode in="blur2"/>
          <feMergeNode in="blur1"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `;
    svg.appendChild(defs);

    // Grupo para las aristas
    const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgesGroup.setAttribute('class', 'wo-teseracto-4d__edges');
    edgesGroup.setAttribute('filter', `url(#${uid}-glow)`);
    svg.appendChild(edgesGroup);

    // Grupo para los vértices
    if (showVertices) {
      const verticesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      verticesGroup.setAttribute('class', 'wo-teseracto-4d__vertices');
      verticesGroup.setAttribute('filter', `url(#${uid}-glow-strong)`);
      svg.appendChild(verticesGroup);
    }

    svg._uid = uid;
    svg._config = {
      viewBoxSize,
      color,
      strokeWidth,
      showVertices,
      vertexRadius
    };

    return svg;
  }

  /**
   * Renderiza un frame del teseracto
   */
  function renderFrame(svg, rotationAngles, projectionConfig = {}) {
    const cfg = svg._config;
    const center = cfg.viewBoxSize / 2;

    // Generar geometría
    const vertices = generateVertices(1);
    const edges = generateEdges();

    // Construir matriz de rotación combinada
    let rotMatrix = identityMatrix();

    if (rotationAngles.XY) rotMatrix = multiplyMatrices(rotMatrix, rotationMatrixXY(rotationAngles.XY));
    if (rotationAngles.XZ) rotMatrix = multiplyMatrices(rotMatrix, rotationMatrixXZ(rotationAngles.XZ));
    if (rotationAngles.XW) rotMatrix = multiplyMatrices(rotMatrix, rotationMatrixXW(rotationAngles.XW));
    if (rotationAngles.YZ) rotMatrix = multiplyMatrices(rotMatrix, rotationMatrixYZ(rotationAngles.YZ));
    if (rotationAngles.YW) rotMatrix = multiplyMatrices(rotMatrix, rotationMatrixYW(rotationAngles.YW));
    if (rotationAngles.ZW) rotMatrix = multiplyMatrices(rotMatrix, rotationMatrixZW(rotationAngles.ZW));

    // Transformar vértices
    const rotatedVertices = vertices.map(v => multiplyMatrixVector(rotMatrix, v));

    // Proyectar a 2D
    const projectedVertices = rotatedVertices.map(v => {
      const v3d = project4Dto3D(v, projectionConfig.distance4D || 2.5);
      const v2d = project3Dto2D(v3d, {
        scale: projectionConfig.scale || 40,
        perspective: projectionConfig.perspective !== false,
        cameraDistance: projectionConfig.cameraDistance || 5,
        rotateX: projectionConfig.rotateX || -0.3,
        rotateY: projectionConfig.rotateY || 0.5
      });
      return {
        x: center + v2d.x,
        y: center + v2d.y,
        depth: v2d.depth,
        scale: v2d.scale
      };
    });

    // Limpiar grupos
    const edgesGroup = svg.querySelector('.wo-teseracto-4d__edges');
    const verticesGroup = svg.querySelector('.wo-teseracto-4d__vertices');
    edgesGroup.innerHTML = '';
    if (verticesGroup) verticesGroup.innerHTML = '';

    // Ordenar aristas por profundidad promedio (para renderizado correcto)
    const sortedEdges = edges.map(([i, j]) => ({
      i, j,
      depth: (projectedVertices[i].depth + projectedVertices[j].depth) / 2
    })).sort((a, b) => a.depth - b.depth);

    // Dibujar aristas
    sortedEdges.forEach(({ i, j, depth }) => {
      const p1 = projectedVertices[i];
      const p2 = projectedVertices[j];

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('stroke', cfg.color);
      
      // Variar opacidad y grosor según profundidad para efecto 3D
      const avgScale = (p1.scale + p2.scale) / 2;
      const opacity = Math.max(0.2, Math.min(1, avgScale * 0.5));
      const strokeW = cfg.strokeWidth * Math.max(0.5, avgScale * 0.7);
      
      line.setAttribute('stroke-width', strokeW);
      line.setAttribute('stroke-opacity', opacity);
      line.setAttribute('stroke-linecap', 'round');
      
      edgesGroup.appendChild(line);
    });

    // Dibujar vértices
    if (verticesGroup && cfg.showVertices) {
      // Ordenar por profundidad
      const sortedVertices = projectedVertices.map((v, i) => ({ ...v, i }))
        .sort((a, b) => a.depth - b.depth);

      sortedVertices.forEach(v => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', v.x);
        circle.setAttribute('cy', v.y);
        
        const radius = cfg.vertexRadius * Math.max(0.5, v.scale * 0.8);
        const opacity = Math.max(0.3, Math.min(1, v.scale * 0.6));
        
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', cfg.color);
        circle.setAttribute('fill-opacity', opacity);
        
        verticesGroup.appendChild(circle);
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ANIMACIONES
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Animación de rotación 4D continua
   */
  function animateRotation(svg, options = {}) {
    const {
      preset = 'classic',
      speed = 1,
      projectionConfig = {},
      useAnime = true
    } = options;

    const rotationSpeeds = config.rotationPresets[preset] || config.rotationPresets.classic;
    let animationId = null;
    let startTime = null;
    let isPaused = false;
    let pausedTime = 0;

    function tick(timestamp) {
      if (!startTime) startTime = timestamp;
      if (isPaused) return;

      const elapsed = ((timestamp - startTime) / 1000) * speed;

      const angles = {
        XW: elapsed * rotationSpeeds.XW,
        YW: elapsed * rotationSpeeds.YW,
        ZW: elapsed * rotationSpeeds.ZW,
        XY: elapsed * rotationSpeeds.XY,
        XZ: elapsed * rotationSpeeds.XZ,
        YZ: elapsed * rotationSpeeds.YZ
      };

      renderFrame(svg, angles, projectionConfig);
      animationId = requestAnimationFrame(tick);
    }

    animationId = requestAnimationFrame(tick);

    return {
      pause: () => {
        isPaused = true;
        if (animationId) cancelAnimationFrame(animationId);
      },
      play: () => {
        if (isPaused) {
          isPaused = false;
          animationId = requestAnimationFrame(tick);
        }
      },
      stop: () => {
        isPaused = true;
        if (animationId) cancelAnimationFrame(animationId);
        startTime = null;
      },
      setSpeed: (newSpeed) => {
        speed = newSpeed;
      },
      setPreset: (newPreset) => {
        Object.assign(rotationSpeeds, config.rotationPresets[newPreset] || {});
      }
    };
  }

  /**
   * Animación con Anime.js para control de timing más preciso
   */
  function animateWithAnime(svg, options = {}) {
    if (typeof anime === 'undefined') {
      console.warn('WoTeseracto4D: Anime.js not found, falling back to requestAnimationFrame');
      return animateRotation(svg, options);
    }

    const {
      preset = 'classic',
      duration = 10000,  // Duración de un ciclo completo
      loop = true,
      easing = 'linear',
      projectionConfig = {}
    } = options;

    const rotationSpeeds = config.rotationPresets[preset] || config.rotationPresets.classic;
    
    const state = { progress: 0 };

    const anim = anime({
      targets: state,
      progress: Math.PI * 2,  // Una rotación completa
      duration,
      loop,
      easing,
      update: () => {
        const t = state.progress;
        const angles = {
          XW: t * rotationSpeeds.XW,
          YW: t * rotationSpeeds.YW,
          ZW: t * rotationSpeeds.ZW,
          XY: t * rotationSpeeds.XY,
          XZ: t * rotationSpeeds.XZ,
          YZ: t * rotationSpeeds.YZ
        };
        renderFrame(svg, angles, projectionConfig);
      }
    });

    return anim;
  }

  /**
   * Animación de "respiración" - el teseracto parece expandirse y contraerse
   */
  function animateBreathe(svg, options = {}) {
    const {
      duration = 3000,
      minScale = 0.8,
      maxScale = 1.2,
      rotationPreset = 'gentle',
      projectionConfig = {}
    } = options;

    if (typeof anime === 'undefined') {
      console.error('WoTeseracto4D: Anime.js required for breathe animation');
      return null;
    }

    const rotationSpeeds = config.rotationPresets[rotationPreset];
    const state = { scale: 1, rotation: 0 };

    const tl = anime.timeline({
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutSine'
    });

    tl.add({
      targets: state,
      scale: [minScale, maxScale],
      rotation: [0, Math.PI],
      duration,
      update: () => {
        const angles = {
          XW: state.rotation * rotationSpeeds.XW,
          YW: state.rotation * rotationSpeeds.YW,
          ZW: state.rotation * rotationSpeeds.ZW,
          XY: state.rotation * rotationSpeeds.XY,
          XZ: state.rotation * rotationSpeeds.XZ,
          YZ: state.rotation * rotationSpeeds.YZ
        };
        renderFrame(svg, angles, {
          ...projectionConfig,
          scale: (projectionConfig.scale || 40) * state.scale
        });
      }
    });

    return tl;
  }

  /**
   * Animación de "explosión" - entrada dramática
   */
  function animateExplode(svg, options = {}) {
    const {
      duration = 2000,
      projectionConfig = {},
      onComplete = null
    } = options;

    if (typeof anime === 'undefined') {
      console.error('WoTeseracto4D: Anime.js required for explode animation');
      return null;
    }

    const state = { 
      scale: 0.01, 
      rotation: -Math.PI,
      opacity: 0,
      distance4D: 5  // Empieza muy lejos en 4D
    };

    const anim = anime({
      targets: state,
      scale: [0.01, 1.1, 1],
      rotation: [-Math.PI, 0],
      opacity: [0, 1],
      distance4D: [5, 2.5],
      duration,
      easing: 'easeOutExpo',
      update: () => {
        // Cambiar opacidad del SVG
        svg.style.opacity = state.opacity;

        const angles = {
          XW: state.rotation,
          YW: state.rotation * 0.5,
          ZW: 0,
          XY: state.rotation * 0.3,
          XZ: 0,
          YZ: 0
        };
        renderFrame(svg, angles, {
          ...projectionConfig,
          scale: (projectionConfig.scale || 40) * state.scale,
          distance4D: state.distance4D
        });
      },
      complete: onComplete
    });

    return anim;
  }

  // ═══════════════════════════════════════════════════════════════
  // COMPONENTE PRINCIPAL
  // ═══════════════════════════════════════════════════════════════
  
  function create(container, options = {}) {
    const {
      color = config.colors.yellow,
      strokeWidth = 1.5,
      showVertices = true,
      vertexRadius = 2,
      viewBoxSize = 200,
      variant = 'rotation',  // 'rotation', 'breathe', 'explode', 'static'
      rotationPreset = 'classic',
      speed = 1,
      autoPlay = true,
      projectionConfig = {}
    } = options;

    const containerEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!containerEl) {
      console.error('WoTeseracto4D: Container not found');
      return null;
    }

    // Crear SVG
    const svg = createSVGElement({
      viewBoxSize,
      color,
      strokeWidth,
      showVertices,
      vertexRadius
    });

    containerEl.style.cssText += `
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    containerEl.appendChild(svg);

    const instanceId = `teseracto4d-${Date.now()}`;
    svg.setAttribute('data-instance', instanceId);

    let animation = null;

    // Renderizar frame inicial
    renderFrame(svg, { XW: 0, YW: 0, ZW: 0, XY: 0, XZ: 0, YZ: 0 }, projectionConfig);

    if (autoPlay) {
      switch (variant) {
        case 'rotation':
          animation = animateWithAnime(svg, { 
            preset: rotationPreset, 
            projectionConfig,
            duration: 10000 / speed
          });
          break;
        case 'breathe':
          animation = animateBreathe(svg, { 
            rotationPreset, 
            projectionConfig 
          });
          break;
        case 'explode':
          animation = animateExplode(svg, { 
            projectionConfig,
            onComplete: () => {
              // Después de explotar, iniciar rotación suave
              animation = animateWithAnime(svg, { 
                preset: 'gentle', 
                projectionConfig 
              });
            }
          });
          break;
        case 'static':
          // No animation
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
      },

      pause: () => {
        if (animation) {
          if (animation.pause) animation.pause();
        }
      },

      restart: () => {
        if (animation) {
          if (animation.restart) animation.restart();
          else if (animation.stop) {
            animation.stop();
            animation = animateWithAnime(svg, { preset: rotationPreset, projectionConfig });
          }
        }
      },

      setPreset: (preset) => {
        if (animation && animation.setPreset) {
          animation.setPreset(preset);
        }
      },

      renderStatic: (angles) => {
        renderFrame(svg, angles, projectionConfig);
      },

      destroy: () => {
        if (animation) {
          if (animation.pause) animation.pause();
          else if (animation.stop) animation.stop();
        }
        svg.remove();
        instances.delete(instanceId);
      },

      // Acceso a animaciones específicas
      animateRotation: (opts) => animateRotation(svg, { ...opts, projectionConfig }),
      animateWithAnime: (opts) => animateWithAnime(svg, { ...opts, projectionConfig }),
      animateBreathe: (opts) => animateBreathe(svg, { ...opts, projectionConfig }),
      animateExplode: (opts) => animateExplode(svg, { ...opts, projectionConfig })
    };

    instances.set(instanceId, instance);
    return instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // API PÚBLICA
  // ═══════════════════════════════════════════════════════════════
  
  return {
    config,
    
    // Geometría
    generateVertices,
    generateEdges,
    
    // Matrices de rotación
    rotationMatrixXY,
    rotationMatrixXZ,
    rotationMatrixXW,
    rotationMatrixYZ,
    rotationMatrixYW,
    rotationMatrixZW,
    
    // Proyección
    project4Dto3D,
    project3Dto2D,
    
    // Renderizado
    createSVGElement,
    renderFrame,
    
    // Animaciones
    animateRotation,
    animateWithAnime,
    animateBreathe,
    animateExplode,
    
    // Componente
    create,
    
    // Utilidades
    getInstance: (id) => instances.get(id),
    destroyAll: () => {
      instances.forEach(inst => inst.destroy());
      instances.clear();
    }
  };
})();

// Exportar
if (typeof window !== 'undefined') {
  window.WoTeseracto4D = WoTeseracto4D;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WoTeseracto4D;
}
