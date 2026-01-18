/* ═══════════════════════════════════════════════════════════════
   WORKALÓGICO DASHBOARD COMPONENT
   Dashboard de métricas animado para Marketing Digital
   ═══════════════════════════════════════════════════════════════ */

// Configuración de datos de demo
const DASHBOARD_DATA = {
  marketing: {
    metrics: [
      { id: 'revenue', label: 'Revenue', value: 247500, prefix: '$', suffix: '', change: '+23%', changeType: 'up' },
      { id: 'roas', label: 'ROAS', value: 4.2, prefix: '', suffix: 'x', change: '+0.8', changeType: 'up' },
      { id: 'leads', label: 'Leads', value: 89, prefix: '', suffix: '', change: '+12', changeType: 'up' }
    ],
    chart: {
      title: 'Rendimiento Mensual',
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        { label: 'Leads', data: [45, 52, 61, 58, 72, 89], color: 'primary' },
        { label: 'Conversiones', data: [12, 15, 18, 16, 22, 28], color: 'secondary' }
      ]
    },
    funnel: {
      title: 'Embudo de Conversión',
      stages: [
        { label: 'Impresiones', value: 125000, rate: '100%' },
        { label: 'Clics', value: 3750, rate: '3%' },
        { label: 'Leads', value: 300, rate: '8%' },
        { label: 'Ventas', value: 75, rate: '25%' }
      ]
    }
  }
};

// Colores de marca
const WO_COLORS = {
  blue: '#5968EA',
  yellow: '#FFCB00',
  success: '#10B981',
  danger: '#FF6B6B'
};

// Clase principal
class WoDashboard {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.data = options.data || DASHBOARD_DATA.marketing;
    this.animated = false;
    
    this.options = {
      animateOnInit: options.animateOnInit !== false,
      countDuration: options.countDuration || 2000,
      chartAnimationDuration: options.chartAnimationDuration || 1500,
      ...options
    };
    
    this.init();
  }

  init() {
    this.createStructure();
    
    if (this.options.animateOnInit) {
      setTimeout(() => this.animate(), 300);
    }
  }

  createStructure() {
    this.container.innerHTML = `
      <div class="wo-dashboard">
        ${this.data.metrics.map(m => this.createMetricCard(m)).join('')}
        ${this.createChartCard()}
        ${this.createFunnelCard()}
      </div>
    `;
  }

  createMetricCard(metric) {
    return `
      <div class="wo-metric-card" data-metric="${metric.id}">
        <div class="wo-metric-card__header">
          <span class="wo-metric-card__label">${metric.label}</span>
          <span class="wo-metric-card__badge wo-metric-card__badge--${metric.changeType}">${metric.change}</span>
        </div>
        <div class="wo-metric-card__value" data-target="${metric.value}" data-prefix="${metric.prefix}" data-suffix="${metric.suffix}">
          ${metric.prefix}0${metric.suffix}
        </div>
        <div class="wo-metric-card__subtext">vs. mes anterior</div>
        <svg class="wo-metric-card__sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
          <path d="M0,25 Q20,20 40,22 T60,18 T80,15 T100,10" fill="none" stroke="${WO_COLORS.blue}" stroke-width="2" opacity="0.5"/>
          <path d="M0,25 Q20,20 40,22 T60,18 T80,15 T100,10 V30 H0 Z" fill="${WO_COLORS.blue}" opacity="0.1"/>
        </svg>
      </div>
    `;
  }

  createChartCard() {
    const { chart } = this.data;
    return `
      <div class="wo-chart-card">
        <div class="wo-chart-card__header">
          <span class="wo-chart-card__title">${chart.title}</span>
          <div class="wo-chart-card__legend">
            ${chart.datasets.map(ds => `
              <div class="wo-chart-card__legend-item">
                <span class="wo-chart-card__legend-dot" style="background: ${ds.color === 'primary' ? WO_COLORS.blue : WO_COLORS.yellow}"></span>
                ${ds.label}
              </div>
            `).join('')}
          </div>
        </div>
        <div class="wo-chart-container">
          <svg class="wo-line-chart" viewBox="0 0 500 160" preserveAspectRatio="none">
            <!-- Grid lines -->
            <g class="wo-line-chart__grid">
              ${[0, 40, 80, 120, 160].map(y => `<line x1="0" y1="${y}" x2="500" y2="${y}"/>`).join('')}
              ${chart.labels.map((_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="160"/>`).join('')}
            </g>
            
            <!-- Area fill for primary -->
            <path class="wo-line-chart__area wo-line-chart__area--primary" d="${this.generateAreaPath(chart.datasets[0].data)}" />
            
            <!-- Lines -->
            ${chart.datasets.map((ds, i) => `
              <path 
                class="wo-line-chart__line wo-line-chart__line--${ds.color}" 
                d="${this.generateLinePath(ds.data)}"
                data-dataset="${i}"
              />
            `).join('')}
            
            <!-- Points -->
            ${chart.datasets.map((ds, di) => 
              ds.data.map((v, i) => `
                <circle 
                  class="wo-line-chart__point wo-line-chart__point--${ds.color}"
                  cx="${i * 100}" 
                  cy="${160 - (v / Math.max(...ds.data) * 140)}"
                  r="4"
                  opacity="0"
                  data-value="${v}"
                />
              `).join('')
            ).join('')}
          </svg>
          
          <!-- X-axis labels -->
          <div style="display: flex; justify-content: space-between; padding: 8px 0 0; font-size: 0.65rem; color: #64748B;">
            ${chart.labels.map(l => `<span>${l}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  createFunnelCard() {
    const { funnel } = this.data;
    const maxValue = funnel.stages[0].value;
    
    return `
      <div class="wo-funnel-card">
        <div class="wo-funnel-card__title">${funnel.title}</div>
        <div class="wo-funnel">
          ${funnel.stages.map((stage, i) => {
            const widthPercent = (stage.value / maxValue * 100);
            return `
              <div class="wo-funnel__stage" style="width: ${90 - i * 15}%;">
                <div class="wo-funnel__stage-bg" data-width="${widthPercent}" style="width: 0%;"></div>
                <div class="wo-funnel__stage-content">
                  <span class="wo-funnel__stage-label">${stage.label}</span>
                  <span class="wo-funnel__stage-value" data-target="${stage.value}">0</span>
                </div>
                ${i > 0 ? `<span class="wo-funnel__stage-rate">${stage.rate} conv.</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  generateLinePath(data) {
    const max = Math.max(...data);
    const points = data.map((v, i) => {
      const x = i * 100;
      const y = 160 - (v / max * 140);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }

  generateAreaPath(data) {
    const max = Math.max(...data);
    const points = data.map((v, i) => {
      const x = i * 100;
      const y = 160 - (v / max * 140);
      return `${x},${y}`;
    });
    return `M 0,160 L ${points.join(' L ')} L ${(data.length - 1) * 100},160 Z`;
  }

  // ═══════════════════════════════════════════════════════════════
  // ANIMACIONES
  // ═══════════════════════════════════════════════════════════════

  animate() {
    if (this.animated) return;
    this.animated = true;

    // Animar métricas
    this.animateMetrics();
    
    // Animar gráfica
    this.animateChart();
    
    // Animar funnel
    this.animateFunnel();
  }

  animateMetrics() {
    const valueElements = this.container.querySelectorAll('.wo-metric-card__value');
    
    valueElements.forEach(el => {
      const target = parseFloat(el.dataset.target);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const isDecimal = target % 1 !== 0;
      
      el.classList.add('counting');
      this.countUp(el, 0, target, this.options.countDuration, prefix, suffix, isDecimal);
    });
  }

  countUp(element, start, end, duration, prefix, suffix, isDecimal) {
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = this.easeOutQuart(progress);
      const current = start + (end - start) * easeProgress;
      
      let displayValue;
      if (isDecimal) {
        displayValue = current.toFixed(1);
      } else if (end >= 1000) {
        displayValue = this.formatNumber(Math.round(current));
      } else {
        displayValue = Math.round(current);
      }
      
      element.textContent = `${prefix}${displayValue}${suffix}`;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.classList.remove('counting');
        element.classList.add('pulse');
        setTimeout(() => element.classList.remove('pulse'), 300);
      }
    };
    
    requestAnimationFrame(update);
  }

  animateChart() {
    const lines = this.container.querySelectorAll('.wo-line-chart__line');
    const points = this.container.querySelectorAll('.wo-line-chart__point');
    
    lines.forEach(line => {
      line.classList.add('animate');
    });
    
    // Mostrar puntos después de que la línea se dibuje
    setTimeout(() => {
      points.forEach((point, i) => {
        setTimeout(() => {
          point.style.transition = 'opacity 0.3s ease';
          point.style.opacity = '1';
        }, i * 100);
      });
    }, this.options.chartAnimationDuration);
  }

  animateFunnel() {
    const stages = this.container.querySelectorAll('.wo-funnel__stage-bg');
    const values = this.container.querySelectorAll('.wo-funnel__stage-value');
    
    stages.forEach((stage, i) => {
      setTimeout(() => {
        const targetWidth = stage.dataset.width;
        stage.style.transition = 'width 0.8s ease';
        stage.style.width = targetWidth + '%';
      }, i * 200);
    });
    
    values.forEach((el, i) => {
      setTimeout(() => {
        const target = parseInt(el.dataset.target);
        this.countUp(el, 0, target, 800, '', '', false);
      }, i * 200);
    });
  }

  // Easing function
  easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString();
  }

  // Reset para re-animar
  reset() {
    this.animated = false;
    this.createStructure();
  }

  // Destruir
  destroy() {
    this.container.innerHTML = '';
  }
}

// ═══════════════════════════════════════════════════════════════
// INTEGRACIÓN CON REVEAL.JS
// ═══════════════════════════════════════════════════════════════

let woDashboardInstance = null;

function initWoDashboard(containerId, options = {}) {
  if (woDashboardInstance) {
    woDashboardInstance.destroy();
  }
  
  woDashboardInstance = new WoDashboard(containerId, options);
  return woDashboardInstance;
}

function destroyWoDashboard() {
  if (woDashboardInstance) {
    woDashboardInstance.destroy();
    woDashboardInstance = null;
  }
}

// Exportar
if (typeof window !== 'undefined') {
  window.WoDashboard = WoDashboard;
  window.initWoDashboard = initWoDashboard;
  window.destroyWoDashboard = destroyWoDashboard;
}
