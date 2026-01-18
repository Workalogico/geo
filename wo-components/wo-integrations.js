/* ═══════════════════════════════════════════════════════════════
   WORKALÓGICO INTEGRATIONS COMPONENT
   Visualización de integraciones hub-spoke para CRM
   ═══════════════════════════════════════════════════════════════ */

// Configuración de integraciones
const INTEGRATIONS_DATA = {
  hub: {
    label: 'CRM',
    sublabel: 'HubSpot / Salesforce',
    icon: '💼'
  },
  spokes: [
    { id: 'whatsapp', icon: '💬', label: 'WhatsApp', category: 'communication', direction: 'bidirectional' },
    { id: 'email', icon: '📧', label: 'Email', category: 'communication', direction: 'bidirectional' },
    { id: 'calendar', icon: '📅', label: 'Calendario', category: 'communication', direction: 'to-hub' },
    { id: 'erp', icon: '📊', label: 'ERP', category: 'erp', direction: 'bidirectional' },
    { id: 'facturacion', icon: '🧾', label: 'Facturación', category: 'erp', direction: 'from-hub' },
    { id: 'telefonia', icon: '📞', label: 'Telefonía', category: 'communication', direction: 'to-hub' },
    { id: 'bi', icon: '📈', label: 'BI', category: 'analytics', direction: 'from-hub' },
    { id: 'forms', icon: '📝', label: 'Forms', category: 'communication', direction: 'to-hub' }
  ],
  stats: [
    { value: '12+', label: 'Integraciones' },
    { value: '85%', label: 'Adopción' },
    { value: '2hrs', label: 'Sync time' }
  ]
};

// Colores
const WO_COLORS = {
  blue: '#5968EA',
  yellow: '#FFCB00',
  success: '#10B981',
  purple: '#8B5CF6'
};

// Clase principal
class WoIntegrations {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.data = options.data || INTEGRATIONS_DATA;
    this.isAnimating = false;
    this.particles = [];
    
    this.options = {
      width: options.width || 800,
      height: options.height || 420,
      hubRadius: options.hubRadius || 55,
      spokeRadius: options.spokeRadius || 35,
      orbitRadius: options.orbitRadius || 160,
      animateParticles: options.animateParticles !== false,
      ...options
    };
    
    this.init();
  }

  init() {
    this.createStructure();
    this.bindEvents();
    
    // Iniciar animación de partículas
    if (this.options.animateParticles) {
      setTimeout(() => this.startParticleAnimation(), 1000);
    }
  }

  createStructure() {
    const { width, height, hubRadius, spokeRadius, orbitRadius } = this.options;
    const centerX = width / 2;
    const centerY = height / 2 - 20;
    
    this.container.innerHTML = `
      <div class="wo-integrations">
        <svg class="wo-integrations-svg" viewBox="0 0 ${width} ${height}">
          <defs>
            <!-- Gradiente para conexiones activas -->
            <linearGradient id="intConnectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="${WO_COLORS.blue}" />
              <stop offset="100%" stop-color="${WO_COLORS.yellow}" />
            </linearGradient>
            
            <!-- Filtro glow -->
            <filter id="intGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <!-- Capa de conexiones -->
          <g class="wo-connections-layer">
            ${this.data.spokes.map((spoke, i) => {
              const angle = (i / this.data.spokes.length) * 2 * Math.PI - Math.PI / 2;
              const spokeX = centerX + orbitRadius * Math.cos(angle);
              const spokeY = centerY + orbitRadius * Math.sin(angle);
              return `
                <path 
                  class="wo-connection animate-in" 
                  id="conn-${spoke.id}"
                  d="M ${centerX} ${centerY} L ${spokeX} ${spokeY}"
                  style="animation-delay: ${i * 0.1}s"
                />
              `;
            }).join('')}
          </g>
          
          <!-- Capa de partículas -->
          <g class="wo-particles-layer"></g>
          
          <!-- Hub central -->
          <g class="wo-hub" transform="translate(${centerX}, ${centerY})">
            <circle class="wo-hub__pulse animate" r="${hubRadius}" />
            <circle class="wo-hub__pulse animate" r="${hubRadius}" style="animation-delay: 1s" />
            <circle class="wo-hub__circle" r="${hubRadius}" />
            <text class="wo-hub__icon" y="-8">${this.data.hub.icon}</text>
            <text class="wo-hub__label" y="${hubRadius / 2 + 5}">${this.data.hub.label}</text>
            <text class="wo-hub__sublabel" y="${hubRadius / 2 + 18}">${this.data.hub.sublabel}</text>
          </g>
          
          <!-- Spokes -->
          ${this.data.spokes.map((spoke, i) => {
            const angle = (i / this.data.spokes.length) * 2 * Math.PI - Math.PI / 2;
            const spokeX = centerX + orbitRadius * Math.cos(angle);
            const spokeY = centerY + orbitRadius * Math.sin(angle);
            return `
              <g class="wo-spoke animate-in" 
                 data-id="${spoke.id}" 
                 data-category="${spoke.category}"
                 data-direction="${spoke.direction}"
                 transform="translate(${spokeX}, ${spokeY})"
                 style="animation-delay: ${0.3 + i * 0.1}s">
                <circle class="wo-spoke__circle" r="${spokeRadius}" />
                <text class="wo-spoke__icon" y="-3">${spoke.icon}</text>
                <text class="wo-spoke__label" y="${spokeRadius + 14}">${spoke.label}</text>
              </g>
            `;
          }).join('')}
        </svg>
        
        <!-- Info panel -->
        <div class="wo-integration-info">
          ${this.data.stats.map(stat => `
            <div class="wo-integration-stat">
              <div class="wo-integration-stat__value">${stat.value}</div>
              <div class="wo-integration-stat__label">${stat.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    this.svg = this.container.querySelector('.wo-integrations-svg');
    this.particlesLayer = this.svg.querySelector('.wo-particles-layer');
  }

  bindEvents() {
    const spokes = this.container.querySelectorAll('.wo-spoke');
    
    spokes.forEach(spoke => {
      spoke.addEventListener('mouseenter', () => {
        this.activateSpoke(spoke.dataset.id);
      });
      
      spoke.addEventListener('mouseleave', () => {
        this.deactivateSpoke(spoke.dataset.id);
      });
    });
  }

  activateSpoke(spokeId) {
    const spoke = this.container.querySelector(`[data-id="${spokeId}"]`);
    const connection = this.container.querySelector(`#conn-${spokeId}`);
    
    if (spoke) spoke.classList.add('active');
    if (connection) connection.classList.add('active');
  }

  deactivateSpoke(spokeId) {
    const spoke = this.container.querySelector(`[data-id="${spokeId}"]`);
    const connection = this.container.querySelector(`#conn-${spokeId}`);
    
    if (spoke) spoke.classList.remove('active');
    if (connection) connection.classList.remove('active');
  }

  // ═══════════════════════════════════════════════════════════════
  // ANIMACIÓN DE PARTÍCULAS
  // ═══════════════════════════════════════════════════════════════

  startParticleAnimation() {
    this.isAnimating = true;
    this.animateParticles();
  }

  stopParticleAnimation() {
    this.isAnimating = false;
  }

  animateParticles() {
    if (!this.isAnimating) return;
    
    // Crear partículas aleatorias
    const randomSpoke = this.data.spokes[Math.floor(Math.random() * this.data.spokes.length)];
    this.createParticle(randomSpoke);
    
    // Siguiente partícula
    setTimeout(() => {
      if (this.isAnimating) {
        this.animateParticles();
      }
    }, 800 + Math.random() * 400);
  }

  createParticle(spoke) {
    const connection = this.container.querySelector(`#conn-${spoke.id}`);
    if (!connection) return;
    
    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particle.setAttribute('class', `wo-data-particle ${spoke.direction === 'from-hub' ? 'from-hub' : 'to-hub'}`);
    particle.setAttribute('r', '4');
    
    // Usar offset-path para animar a lo largo del path
    const pathD = connection.getAttribute('d');
    particle.style.offsetPath = `path('${pathD}')`;
    particle.style.animationDelay = `${Math.random() * 0.5}s`;
    
    this.particlesLayer.appendChild(particle);
    
    // Eliminar después de la animación
    setTimeout(() => {
      particle.remove();
    }, 2500);
  }

  // Destruir
  destroy() {
    this.isAnimating = false;
    this.container.innerHTML = '';
  }
}

// ═══════════════════════════════════════════════════════════════
// INTEGRACIÓN CON REVEAL.JS
// ═══════════════════════════════════════════════════════════════

let woIntegrationsInstance = null;

function initWoIntegrations(containerId, options = {}) {
  if (woIntegrationsInstance) {
    woIntegrationsInstance.destroy();
  }
  
  woIntegrationsInstance = new WoIntegrations(containerId, options);
  return woIntegrationsInstance;
}

function destroyWoIntegrations() {
  if (woIntegrationsInstance) {
    woIntegrationsInstance.destroy();
    woIntegrationsInstance = null;
  }
}

// Exportar
if (typeof window !== 'undefined') {
  window.WoIntegrations = WoIntegrations;
  window.initWoIntegrations = initWoIntegrations;
  window.destroyWoIntegrations = destroyWoIntegrations;
}
