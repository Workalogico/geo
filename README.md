# Workalógico Decks

Portafolio de presentaciones comerciales de Workalógico.

## Estructura

```
site/
├── index.html                    # Landing page principal
├── wo-design-system.css          # Sistema de diseño
├── .nojekyll                     # Config para GitHub Pages
├── LOGOS/                        # Assets de marca
│   ├── logo dark@3x.png
│   ├── logo light @3x.png
│   └── ...
├── deck-wo-geoanalisis-onepager/ # Inteligencia Geoestadística
├── deck-wo-analisis-vocacion/    # Análisis de Vocación
├── deck-wo-marketing-digital/    # Marketing Digital PyMEs
├── deck-wo-crm/                  # CRM Estructurado
├── deck-wo-automatizacion/       # Automatización Sistémica
└── deck-wo-ai-experts/           # AI Experts
```

## Despliegue en GitHub Pages

### Opción A: Desde esta carpeta

1. Inicializa Git en esta carpeta:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Workalógico Decks"
   ```

2. Crea un repositorio en GitHub y conecta:
   ```bash
   git remote add origin https://github.com/TU-USUARIO/wo-decks.git
   git branch -M main
   git push -u origin main
   ```

3. Activa GitHub Pages:
   - Settings → Pages
   - Source: `Deploy from a branch`
   - Branch: `main` / `/ (root)`
   - Save

4. Accede en: `https://TU-USUARIO.github.io/wo-decks/`

### Opción B: Netlify Drop

1. Ve a [netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra la carpeta `site/` completa
3. Obtén URL inmediata

### Opción C: Vercel

```bash
npx vercel --prod
```

## Uso de las presentaciones

- **F**: Pantalla completa
- **S**: Notas del presentador (nueva ventana)
- **ESC**: Vista general de slides
- **←/→**: Navegar entre slides
- **?**: Ayuda de atajos

## Tecnologías

- [Reveal.js 4.x](https://revealjs.com/) - Framework de presentaciones
- [tsParticles](https://particles.js.org/) - Fondos animados
- Design System Workalógico (Atomic Design)

## Contacto

- Email: contacto@workalogico.mx
- Web: www.workalogico.mx

---

© 2026 Workalógico • Growth Studio
