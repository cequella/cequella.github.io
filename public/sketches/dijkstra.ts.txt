import { Sketch, SketchMetadata } from './types';

interface Node {
    id: number;
    x: number;
    y: number;
    neighbors: { node: number; weight: number; edge: Edge }[];
}

interface Edge {
    u: number;
    v: number;
    weight: number;
}

interface AnimationStep {
    type: 'visit' | 'relax';
    node?: number;
    edge?: Edge;
    from?: number;
    to?: number;
    dist?: number;
}

export class DijkstraSketch implements Sketch {
    private ctx: CanvasRenderingContext2D | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private width = 0;
    private height = 0;
    private animationId = 0;

    private nodes: Node[] = [];
    private edges: Edge[] = [];
    private animationSteps: AnimationStep[] = [];
    private currentStep = 0;
    private isAnimating = false;
    private isFinished = false;
    private resultPath: number[] = [];
    private finalPath: number[] = [];
    private visitedNodes = new Set<number>();
    private activeEdges: Edge[] = [];

    private startNodeId: number | null = null;
    private endNodeId: number | null = null;

    // Config
    private seed = 12345;
    private nodeCount = 20;

    readonly metadata: SketchMetadata = {
        image: '/dijkstra.png',
        id: 'dijkstra',
        title: {
            pt: 'Algoritmo de Dijkstra',
            en: 'Dijkstra Algorithm'
        },
        description: {
            pt: 'Selecione dois pontos para encontrar o caminho mais curto usando o algoritmo de Dijkstra.',
            en: 'Select two points to find the shortest path using Dijkstra algorithm.'
        },
    }

    private mouseX = -1;
    private mouseY = -1;

    setup(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize(canvas.width, canvas.height);

        canvas.addEventListener('click', this.handleClick);
        canvas.addEventListener('mousemove', this.handleMouseMove);

        this.generateGraph();
        this.animate();
    }

    private handleMouseMove = (e: MouseEvent) => {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        this.mouseX = (e.clientX - rect.left) * scaleX;
        this.mouseY = (e.clientY - rect.top) * scaleY;

        // Check if hovering over a node to change cursor
        let overNode = false;
        const hoverDist = 30 * (scaleX || 1);
        for (const node of this.nodes) {
            if (Math.hypot(node.x - this.mouseX, node.y - this.mouseY) < hoverDist) {
                overNode = true;
                break;
            }
        }
        this.canvas.style.cursor = overNode ? 'pointer' : 'default';
    }

    private handleClick = (e: MouseEvent) => {
        if (this.isAnimating) return;

        // If finished, next click generates a new graph
        if (this.isFinished) {
            this.seed = Math.floor(Math.random() * 99999);
            this.generateGraph();
            return;
        }

        if (!this.canvas) return;

        // Get mouse position relative to canvas
        const rect = this.canvas.getBoundingClientRect();

        // Scale mouse coordinates to match canvas internal resolution
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        // Find nearest node
        let nearestNode: Node | null = null;
        let minDist = 40 * (scaleX || 1); // Increase detection radius, adjusted for scale

        for (const node of this.nodes) {
            const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
            if (dist < minDist) {
                minDist = dist;
                nearestNode = node;
            }
        }

        if (!nearestNode) return;

        if (this.startNodeId === null) {
            this.startNodeId = nearestNode.id;
        } else if (this.endNodeId === null && nearestNode.id !== this.startNodeId) {
            this.endNodeId = nearestNode.id;
            this.runDijkstra();
        }
    }

    resize(w: number, h: number) {
        this.width = w;
        this.height = h;
        if (this.canvas) {
            this.generateGraph();
        }
    }

    private createRandom(seed: number) {
        // Pseudo-random number generator
        let s = seed;
        return function () {
            s |= 0; s = s + 0x6D2B79F5 | 0;
            let t = Math.imul(s ^ s >>> 15, 1 | s);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    private generateGraph() {
        this.stopAnimation();
        const rng = this.createRandom(this.seed);

        this.nodes = [];
        this.edges = [];
        this.visitedNodes.clear();
        this.activeEdges = [];
        this.resultPath = [];
        this.finalPath = [];
        this.startNodeId = null;
        this.endNodeId = null;
        this.isFinished = false;

        const padding = Math.min(this.width, this.height) * 0.15;

        for (let i = 0; i < this.nodeCount; i++) {
            this.nodes.push({
                id: i,
                x: padding + rng() * (this.width - padding * 2),
                y: padding + rng() * (this.height - padding * 2),
                neighbors: []
            });
        }

        for (let i = 0; i < this.nodes.length; i++) {
            let candidates: { index: number, dist: number }[] = [];
            for (let j = 0; j < this.nodes.length; j++) {
                if (i === j) continue;
                const dist = Math.hypot(this.nodes[i].x - this.nodes[j].x, this.nodes[i].y - this.nodes[j].y);
                candidates.push({ index: j, dist });
            }

            candidates.sort((a, b) => a.dist - b.dist);
            for (let k = 0; k < Math.min(3, candidates.length); k++) {
                const targetIdx = candidates[k].index;
                if (!this.edges.some(e => (e.u === i && e.v === targetIdx) || (e.v === i && e.u === targetIdx))) {
                    const weight = Math.round(candidates[k].dist / 10);
                    const edge: Edge = { u: i, v: targetIdx, weight };
                    this.edges.push(edge);
                    this.nodes[i].neighbors.push({ node: targetIdx, weight, edge });
                    this.nodes[targetIdx].neighbors.push({ node: i, weight, edge });
                }
            }
        }
    }

    private runDijkstra() {
        if (this.isAnimating || this.startNodeId === null || this.endNodeId === null) return;

        this.visitedNodes.clear();
        this.activeEdges = [];
        this.resultPath = [];
        this.animationSteps = [];
        this.currentStep = 0;

        const startNodeId = this.startNodeId;
        const endNodeId = this.endNodeId;

        const distances: { [key: number]: number } = {};
        const prev: { [key: number]: number | null } = {};
        const pq: { id: number, dist: number }[] = [];

        this.nodes.forEach(n => {
            distances[n.id] = Infinity;
            prev[n.id] = null;
        });

        distances[startNodeId] = 0;
        pq.push({ id: startNodeId, dist: 0 });

        while (pq.length > 0) {
            pq.sort((a, b) => a.dist - b.dist);
            const entry = pq.shift();
            if (!entry) break;
            const { id, dist } = entry;

            if (dist > distances[id]) continue;

            this.animationSteps.push({ type: 'visit', node: id });

            if (id === endNodeId) break;

            const nodeObj = this.nodes[id];
            for (const neighbor of nodeObj.neighbors) {
                const alt = distances[id] + neighbor.weight;
                if (alt < distances[neighbor.node]) {
                    distances[neighbor.node] = alt;
                    prev[neighbor.node] = id;
                    pq.push({ id: neighbor.node, dist: alt });
                    this.animationSteps.push({
                        type: 'relax',
                        edge: neighbor.edge,
                        from: id,
                        to: neighbor.node,
                        dist: alt
                    });
                }
            }
        }

        let curr: number | null = endNodeId;
        const path: number[] = [];
        while (curr !== null) {
            path.unshift(curr);
            curr = prev[curr];
        }

        if (distances[endNodeId] !== Infinity) {
            this.finalPath = path;
            this.startAnimation();
        } else {
            // No path found
            this.isFinished = true;
        }
    }

    private startAnimation() {
        this.isAnimating = true;
        this.currentStep = 0;

        const step = () => {
            if (!this.isAnimating || this.currentStep >= this.animationSteps.length) {
                this.isAnimating = false;
                this.isFinished = true;
                this.resultPath = [...this.finalPath];
                return;
            }

            const s = this.animationSteps[this.currentStep];
            if (s.type === 'visit') {
                this.visitedNodes.add(s.node!);
            } else if (s.type === 'relax') {
                this.activeEdges.push(s.edge!);
            }

            this.currentStep++;
            setTimeout(step, 80);
        };

        step();
    }

    private stopAnimation() {
        this.isAnimating = false;
    }

    private animate = () => {
        if (!this.ctx) return;
        this.draw();
        this.animationId = requestAnimationFrame(this.animate);
    }

    private draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;

        // Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, this.width, this.height);

        // Edges
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        this.edges.forEach(edge => {
            const u = this.nodes[edge.u];
            const v = this.nodes[edge.v];

            ctx.beginPath();
            ctx.moveTo(u.x, u.y);
            ctx.lineTo(v.x, v.y);

            if (this.isInResultPath(edge)) {
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 4;
            } else if (this.activeEdges.includes(edge)) {
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;
            } else {
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 1;
            }
            ctx.stroke();

            // Weight text
            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;
            ctx.fillStyle = "#64748b";
            ctx.font = "10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(edge.weight.toString(), midX, midY - 5);
        });

        // Nodes
        this.nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 16, 0, Math.PI * 2);

            let strokeColor = '#64748b';

            if (node.id === this.startNodeId) {
                ctx.fillStyle = '#10b981'; // Start
                strokeColor = '#34d399';
            } else if (node.id === this.endNodeId) {
                ctx.fillStyle = '#ef4444'; // End
                strokeColor = '#f87171';
            } else if (this.resultPath.includes(node.id)) {
                ctx.fillStyle = '#fbbf24'; // Result path
                strokeColor = '#fcd34d';
            } else if (this.visitedNodes.has(node.id)) {
                ctx.fillStyle = '#3b82f6'; // Visited
                strokeColor = '#60a5fa';
            } else {
                ctx.fillStyle = '#1e293b'; // Normal
                strokeColor = '#475569';
            }

            if (this.visitedNodes.has(node.id) || node.id === this.startNodeId || node.id === this.endNodeId) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = ctx.fillStyle;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Node ID
            ctx.fillStyle = "white";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(node.id.toString(), node.x, node.y);
        });

        // Helper text overlay
        ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
        ctx.fillRect(10, 10, 240, 40);
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'left';

        let message = 'Clique em um nó inicial';
        if (this.isFinished) {
            message = 'Clique em qualquer lugar para reiniciar';
        } else if (this.isAnimating) {
            message = 'Calculando...';
        } else if (this.startNodeId !== null && this.endNodeId === null) {
            message = 'Selecione o nó de destino';
        } else if (this.startNodeId !== null && this.endNodeId !== null) {
            message = 'Executando Dijkstra';
        }

        ctx.fillText(message, 30, 36);
    }

    private isInResultPath(edge: Edge) {
        if (this.resultPath.length < 2) return false;
        for (let i = 0; i < this.resultPath.length - 1; i++) {
            if ((this.resultPath[i] === edge.u && this.resultPath[i + 1] === edge.v) ||
                (this.resultPath[i] === edge.v && this.resultPath[i + 1] === edge.u)) {
                return true;
            }
        }
        return false;
    }

    destroy() {
        this.stopAnimation();
        cancelAnimationFrame(this.animationId);
        if (this.canvas) {
            this.canvas.removeEventListener('click', this.handleClick);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        }
    }
}


