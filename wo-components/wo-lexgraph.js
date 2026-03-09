class WoLexGraph {
    constructor(containerId, options = {}) {
        this.container = document.querySelector(containerId);
        if (!this.container) return;

        this.options = Object.assign({
            nodes: [],
            links: [],
            width: this.container.clientWidth,
            height: this.container.clientHeight || 400
        }, options);

        this.init();
    }

    init() {
        const { width, height, nodes, links } = this.options;

        // Create SVG
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.style.overflow = "visible";
        this.container.appendChild(svg);

        // Simple force-directed-like layout (static for now for performance/simplicity in presentation)
        // or a simple dynamic one if D3 is available. 
        // Let's use a simple SVG implementation with CSS animations for the "pulse".

        const gLinks = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const gNodes = document.createElementNS("http://www.w3.org/2000/svg", "g");
        svg.appendChild(gLinks);
        svg.appendChild(gNodes);

        nodes.forEach(node => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", node.x);
            circle.setAttribute("cy", node.y);
            circle.setAttribute("r", node.size || 8);
            circle.setAttribute("fill", "var(--wo-blue-lab, #5968EA)");
            circle.setAttribute("class", "wo-lexgraph__node");

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", node.x);
            text.setAttribute("y", node.y + (node.size || 8) + 15);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("fill", "#ffffff");
            text.setAttribute("style", "font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; pointer-events: none;");
            text.textContent = node.label;

            gNodes.appendChild(circle);
            gNodes.appendChild(text);

            // Interaction
            circle.addEventListener('mouseenter', () => {
                circle.setAttribute("r", (node.size || 8) * 1.5);
                circle.style.filter = "drop-shadow(0 0 8px var(--wo-blue-lab))";
            });
            circle.addEventListener('mouseleave', () => {
                circle.setAttribute("r", node.size || 8);
                circle.style.filter = "none";
            });
        });

        links.forEach(link => {
            const source = nodes.find(n => n.id === link.source);
            const target = nodes.find(n => n.id === link.target);
            if (source && target) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", source.x);
                line.setAttribute("y1", source.y);
                line.setAttribute("x2", target.x);
                line.setAttribute("y2", target.y);
                line.setAttribute("stroke", "var(--wo-blue-lab, #5968EA)");
                line.setAttribute("stroke-width", link.weight || 1);
                line.setAttribute("stroke-opacity", 0.3);
                gLinks.appendChild(line);
            }
        });
    }

    static create(containerId, options) {
        return new WoLexGraph(containerId, options);
    }
}

window.WoLexGraph = WoLexGraph;
