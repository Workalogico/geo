/* ═══════════════════════════════════════════════════════════════
   WORKALÓGICO FLOW DIAGRAM COMPONENT
   Diagramas de flujo animados para presentaciones de Automatización
   ═══════════════════════════════════════════════════════════════ */

// Colores de marca
const WO_COLORS = {
  blue: '#5968EA',
  yellow: '#FFCB00',
  danger: '#FF6B6B',
  success: '#10B981',
  dark: '#0F0F1A',
  surface: '#252542',
  text: '#FFFFFF',
  textMuted: '#94A3B8'
};

// Configuraciones de diagramas predefinidos
const FLOW_PRESETS = {
  // Flujo de automatización de ventas
  sales: {
    title: 'Automatización de Ventas',
    timeSaved: '15 hrs/semana',
    nodes: [
      { id: 'lead', icon: '📧', label: 'Lead Entrante', sublabel: 'Email/Form', x: 50, y: 180 },
      { id: 'parse', icon: '🤖', label: 'Parseo IA', sublabel: 'Extrae datos', x: 200, y: 180 },
      { id: 'enrich', icon: '🔍', label: 'Enrichment', sublabel: 'LinkedIn/Clearbit', x: 350, y: 180 },
      { id: 'score', icon: '📊', label: 'Lead Score', sublabel: '0-100', x: 500, y: 180 },
      { id: 'route', icon: '🎯', label: 'Asignación', sublabel: 'Por territorio', x: 650, y: 180 },
      { id: 'crm', icon: '💾', label: 'CRM', sublabel: 'HubSpot', x: 800, y: 180 }
    ],
    connections: [
      { from: 'lead', to: 'parse' },
      { from: 'parse', to: 'enrich' },
      { from: 'enrich', to: 'score' },
      { from: 'score', to: 'route' },
      { from: 'route', to: 'crm' }
    ]
  },

  // Flujo de automatización financiera
  finance: {
    title: 'Automatización Financiera',
    timeSaved: '20 hrs/semana',
    nodes: [
      { id: 'invoice', icon: '📄', label: 'Factura', sublabel: 'PDF/Email', x: 50, y: 180 },
      { id: 'ocr', icon: '👁️', label: 'OCR + IA', sublabel: 'Extrae datos', x: 200, y: 180 },
      { id: 'validate', icon: '✅', label: 'Validación', sublabel: 'Reglas negocio', x: 350, y: 180 },
      { id: 'match', icon: '🔗', label: 'Conciliación', sublabel: 'vs Pedidos', x: 500, y: 180 },
      { id: 'approve', icon: '👤', label: 'Aprobación', sublabel: 'Si > $50K', x: 650, y: 180 },
      { id: 'erp', icon: '📚', label: 'ERP', sublabel: 'SAP/Oracle', x: 800, y: 180 }
    ],
    connections: [
      { from: 'invoice', to: 'ocr' },
      { from: 'ocr', to: 'validate' },
      { from: 'validate', to: 'match' },
      { from: 'match', to: 'approve' },
      { from: 'approve', to: 'erp' }
    ]
  },

  // Flujo de onboarding RRHH
  hr: {
    title: 'Onboarding Automatizado',
    timeSaved: '8 hrs/empleado',
    nodes: [
      { id: 'hire', icon: '🎉', label: 'Contratación', sublabel: 'Firmado', x: 50, y: 180 },
      { id: 'accounts', icon: '🔐', label: 'Cuentas', sublabel: 'Email/Slack', x: 200, y: 180 },
      { id: 'equipo', icon: '💻', label: 'Equipo', sublabel: 'IT Request', x: 350, y: 180 },
      { id: 'docs', icon: '📋', label: 'Documentos', sublabel: 'Políticas', x: 500, y: 180 },
      { id: 'calendar', icon: '📅', label: 'Agenda', sublabel: '1:1 meetings', x: 650, y: 180 },
      { id: 'check', icon: '✨', label: 'Check-in', sublabel: 'Día 7, 30, 90', x: 800, y: 180 }
    ],
    connections: [
      { from: 'hire', to: 'accounts' },
      { from: 'accounts', to: 'equipo' },
      { from: 'equipo', to: 'docs' },
      { from: 'docs', to: 'calendar' },
      { from: 'calendar', to: 'check' }
    ]
  },

  // Flujo de soporte con IA
  support: {
    title: 'Soporte con Agente IA',
    timeSaved: '25 hrs/semana',
    nodes: [
      { id: 'ticket', icon: '🎫', label: 'Ticket', sublabel: 'Email/Chat', x: 50, y: 180 },
      { id: 'classify', icon: '🏷️', label: 'Clasificación', sublabel: 'NLP', x: 200, y: 180 },
      { id: 'knowledge', icon: '📚', label: 'Knowledge', sublabel: 'RAG Search', x: 350, y: 180 },
      { id: 'response', icon: '💬', label: 'Respuesta', sublabel: 'Generada', x: 500, y: 180 },
      { id: 'review', icon: '👀', label: 'Review', sublabel: 'Si complejo', x: 650, y: 180 },
      { id: 'resolve', icon: '✅', label: 'Resuelto', sublabel: 'Actualiza CRM', x: 800, y: 180 }
    ],
    connections: [
      { from: 'ticket', to: 'classify' },
      { from: 'classify', to: 'knowledge' },
      { from: 'knowledge', to: 'response' },
      { from: 'response', to: 'review' },
      { from: 'review', to: 'resolve' }
    ]
  }
};

// Clase principal del componente
class WoFlowDiagram {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.preset = options.preset || 'sales';
    this.config = FLOW_PRESETS[this.preset] || FLOW_PRESETS.sales;
    this.isPlaying = false;
    this.currentStep = -1;
    this.animationInterval = null;
    this.particles = [];
    
    this.options = {
      width: options.width || 900,
      height: options.height || 360,
      nodeRadius: options.nodeRadius || 40,
      showControls: options.showControls !== false,
      autoPlay: options.autoPlay !== false,
      animationSpeed: options.animationSpeed || 1500,
      ...options
    };
    
    this.init();
  }

  init() {
    this.createStructure();
    this.renderDiagram();
    this.bindEvents();
    
    if (this.options.autoPlay) {
      setTimeout(() => this.play(), 500);
    }
  }

  createStructure() {
    this.container.innerHTML = `
      <div class="wo-flow-container">
        <svg class="wo-flow-svg" viewBox="0 0 ${this.options.width} ${this.options.height}">
          <defs>
            <!-- Gradiente para conexiones activas -->
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="${WO_COLORS.blue}" />
              <stop offset="100%" stop-color="${WO_COLORS.yellow}" />
            </linearGradient>
            
            <!-- Filtro de glow -->
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <!-- Marcador de flecha -->
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="${WO_COLORS.blue}" opacity="0.6"/>
            </marker>
            
            <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="${WO_COLORS.yellow}"/>
            </marker>
          </defs>
          
          <!-- Capa de conexiones -->
          <g class="wo-flow-connections"></g>
          
          <!-- Capa de partículas -->
          <g class="wo-flow-particles"></g>
          
          <!-- Capa de nodos -->
          <g class="wo-flow-nodes"></g>
        </svg>
        
        <!-- Indicador de tiempo ahorrado -->
        <div class="wo-flow-time-saved">
          <span class="wo-flow-time-saved__value">${this.config.timeSaved}</span>
          <br>ahorradas
        </div>
        
        ${this.options.showControls ? `
        <div class="wo-flow-controls">
          <button class="wo-flow-control-btn" data-action="reset" title="Reiniciar">⏮️</button>
          <button class="wo-flow-control-btn" data-action="play" title="Reproducir">▶️</button>
          <button class="wo-flow-control-btn" data-action="step" title="Paso a paso">⏭️</button>
        </div>
        ` : ''}
        
        <div class="wo-flow-tooltip"></div>
      </div>
    `;
    
    this.svg = this.container.querySelector('.wo-flow-svg');
    this.connectionsLayer = this.svg.querySelector('.wo-flow-connections');
    this.particlesLayer = this.svg.querySelector('.wo-flow-particles');
    this.nodesLayer = this.svg.querySelector('.wo-flow-nodes');
    this.tooltip = this.container.querySelector('.wo-flow-tooltip');
  }

  renderDiagram() {
    // Renderizar conexiones primero (debajo de nodos)
    this.config.connections.forEach((conn, index) => {
      this.renderConnection(conn, index);
    });
    
    // Renderizar nodos
    this.config.nodes.forEach((node, index) => {
      this.renderNode(node, index);
    });
  }

  renderNode(node, index) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'wo-flow-node animate-in');
    g.setAttribute('data-id', node.id);
    g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
    g.style.animationDelay = `${index * 0.1}s`;
    
    // Pulso de fondo (para estado activo)
    const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pulse.setAttribute('class', 'wo-flow-pulse');
    pulse.setAttribute('r', this.options.nodeRadius + 5);
    pulse.setAttribute('cx', 0);
    pulse.setAttribute('cy', 0);
    g.appendChild(pulse);
    
    // Forma principal del nodo (rectángulo redondeado)
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('class', 'wo-flow-node__shape');
    rect.setAttribute('x', -this.options.nodeRadius);
    rect.setAttribute('y', -this.options.nodeRadius);
    rect.setAttribute('width', this.options.nodeRadius * 2);
    rect.setAttribute('height', this.options.nodeRadius * 2);
    rect.setAttribute('rx', 12);
    rect.setAttribute('ry', 12);
    g.appendChild(rect);
    
    // Icono
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    icon.setAttribute('class', 'wo-flow-node__icon');
    icon.setAttribute('y', -5);
    icon.textContent = node.icon;
    g.appendChild(icon);
    
    // Label principal
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('class', 'wo-flow-node__label');
    label.setAttribute('y', this.options.nodeRadius + 18);
    label.textContent = node.label;
    g.appendChild(label);
    
    // Sublabel
    if (node.sublabel) {
      const sublabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      sublabel.setAttribute('class', 'wo-flow-node__sublabel');
      sublabel.setAttribute('y', this.options.nodeRadius + 32);
      sublabel.textContent = node.sublabel;
      g.appendChild(sublabel);
    }
    
    this.nodesLayer.appendChild(g);
  }

  renderConnection(conn, index) {
    const fromNode = this.config.nodes.find(n => n.id === conn.from);
    const toNode = this.config.nodes.find(n => n.id === conn.to);
    
    if (!fromNode || !toNode) return;
    
    const startX = fromNode.x + this.options.nodeRadius;
    const endX = toNode.x - this.options.nodeRadius;
    const y = fromNode.y;
    
    // Crear path de conexión
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'wo-flow-connection animate-in');
    path.setAttribute('data-from', conn.from);
    path.setAttribute('data-to', conn.to);
    path.setAttribute('d', `M ${startX} ${y} L ${endX} ${y}`);
    path.setAttribute('marker-end', 'url(#arrowhead)');
    path.style.animationDelay = `${index * 0.15 + 0.3}s`;
    
    // Guardar el path para referencia
    path.id = `conn-${conn.from}-${conn.to}`;
    
    this.connectionsLayer.appendChild(path);
  }

  bindEvents() {
    // Eventos de nodos
    const nodes = this.nodesLayer.querySelectorAll('.wo-flow-node');
    nodes.forEach(node => {
      node.addEventListener('mouseenter', (e) => this.showTooltip(e, node));
      node.addEventListener('mouseleave', () => this.hideTooltip());
      node.addEventListener('click', () => this.activateNode(node.dataset.id));
    });
    
    // Eventos de controles
    if (this.options.showControls) {
      const controls = this.container.querySelectorAll('.wo-flow-control-btn');
      controls.forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          if (action === 'play') this.togglePlay();
          if (action === 'reset') this.reset();
          if (action === 'step') this.nextStep();
        });
      });
    }
  }

  showTooltip(e, node) {
    const nodeData = this.config.nodes.find(n => n.id === node.dataset.id);
    if (!nodeData) return;
    
    this.tooltip.innerHTML = `
      <div class="wo-flow-tooltip__title">${nodeData.label}</div>
      <div class="wo-flow-tooltip__desc">${nodeData.sublabel || ''}</div>
    `;
    
    const rect = node.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    this.tooltip.style.left = `${rect.left - containerRect.left + rect.width / 2 - 75}px`;
    this.tooltip.style.top = `${rect.top - containerRect.top - 60}px`;
    this.tooltip.classList.add('visible');
  }

  hideTooltip() {
    this.tooltip.classList.remove('visible');
  }

  // ═══════════════════════════════════════════════════════════════
  // ANIMACIÓN
  // ═══════════════════════════════════════════════════════════════

  play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.updatePlayButton();
    
    // Iniciar animación secuencial
    this.animationInterval = setInterval(() => {
      this.nextStep();
    }, this.options.animationSpeed);
  }

  pause() {
    this.isPlaying = false;
    this.updatePlayButton();
    
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  reset() {
    this.pause();
    this.currentStep = -1;
    
    // Limpiar estados
    const nodes = this.nodesLayer.querySelectorAll('.wo-flow-node');
    nodes.forEach(node => {
      node.classList.remove('active', 'completed');
    });
    
    const connections = this.connectionsLayer.querySelectorAll('.wo-flow-connection');
    connections.forEach(conn => {
      conn.classList.remove('active');
      conn.setAttribute('marker-end', 'url(#arrowhead)');
    });
    
    // Limpiar partículas
    this.particlesLayer.innerHTML = '';
  }

  nextStep() {
    this.currentStep++;
    
    // Si llegamos al final, reiniciar o pausar
    if (this.currentStep >= this.config.nodes.length) {
      if (this.isPlaying) {
        // Reiniciar loop
        this.reset();
        setTimeout(() => this.play(), 500);
      }
      return;
    }
    
    const currentNode = this.config.nodes[this.currentStep];
    const prevNode = this.currentStep > 0 ? this.config.nodes[this.currentStep - 1] : null;
    
    // Activar nodo actual
    this.activateNode(currentNode.id);
    
    // Marcar nodo anterior como completado
    if (prevNode) {
      this.completeNode(prevNode.id);
      this.activateConnection(prevNode.id, currentNode.id);
      this.createParticle(prevNode.id, currentNode.id);
    }
  }

  activateNode(nodeId) {
    const nodes = this.nodesLayer.querySelectorAll('.wo-flow-node');
    nodes.forEach(node => {
      if (node.dataset.id === nodeId) {
        node.classList.add('active');
        node.classList.remove('completed');
      }
    });
  }

  completeNode(nodeId) {
    const nodes = this.nodesLayer.querySelectorAll('.wo-flow-node');
    nodes.forEach(node => {
      if (node.dataset.id === nodeId) {
        node.classList.remove('active');
        node.classList.add('completed');
      }
    });
  }

  activateConnection(fromId, toId) {
    const conn = this.connectionsLayer.querySelector(`#conn-${fromId}-${toId}`);
    if (conn) {
      conn.classList.add('active');
      conn.setAttribute('stroke', 'url(#connectionGradient)');
      conn.setAttribute('marker-end', 'url(#arrowhead-active)');
    }
  }

  createParticle(fromId, toId) {
    const conn = this.connectionsLayer.querySelector(`#conn-${fromId}-${toId}`);
    if (!conn) return;
    
    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particle.setAttribute('class', 'wo-flow-particle wo-flow-particle-animated');
    particle.setAttribute('r', 5);
    particle.style.offsetPath = `path('${conn.getAttribute('d')}')`;
    
    this.particlesLayer.appendChild(particle);
    
    // Eliminar partícula después de la animación
    setTimeout(() => {
      particle.remove();
    }, 2000);
  }

  updatePlayButton() {
    const playBtn = this.container.querySelector('[data-action="play"]');
    if (playBtn) {
      playBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
      playBtn.classList.toggle('active', this.isPlaying);
    }
  }

  // Cambiar preset dinámicamente
  setPreset(presetName) {
    if (!FLOW_PRESETS[presetName]) return;
    
    this.pause();
    this.preset = presetName;
    this.config = FLOW_PRESETS[presetName];
    this.currentStep = -1;
    
    // Re-renderizar
    this.connectionsLayer.innerHTML = '';
    this.particlesLayer.innerHTML = '';
    this.nodesLayer.innerHTML = '';
    
    this.renderDiagram();
    this.bindEvents();
    
    // Actualizar indicador de tiempo
    const timeSaved = this.container.querySelector('.wo-flow-time-saved__value');
    if (timeSaved) {
      timeSaved.textContent = this.config.timeSaved;
    }
  }

  // Destruir diagrama
  destroy() {
    this.pause();
    this.container.innerHTML = '';
  }
}

// ═══════════════════════════════════════════════════════════════
// INTEGRACIÓN CON REVEAL.JS
// ═══════════════════════════════════════════════════════════════

let woFlowInstance = null;

function initWoFlowDiagram(containerId, options = {}) {
  if (woFlowInstance) {
    woFlowInstance.destroy();
  }
  
  woFlowInstance = new WoFlowDiagram(containerId, options);
  return woFlowInstance;
}

function destroyWoFlowDiagram() {
  if (woFlowInstance) {
    woFlowInstance.destroy();
    woFlowInstance = null;
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.WoFlowDiagram = WoFlowDiagram;
  window.FLOW_PRESETS = FLOW_PRESETS;
  window.initWoFlowDiagram = initWoFlowDiagram;
  window.destroyWoFlowDiagram = destroyWoFlowDiagram;
}
