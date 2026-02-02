import { Sketch, SketchMetadata } from './types';

export class FractalTreeSketch implements Sketch {
    readonly metadata: SketchMetadata = {
        id: 'fractal-tree',
        title: {
            pt: 'Flores Recursivas',
            en: 'Recursive Blooms'
        },
        description: {
            pt: 'Padrões geométricos emergindo de regras recursivas simples, criando estruturas arquitetônicas complexas.',
            en: 'Geometric patterns emerging from simple recursive rules, creating complex architectural structures.'
        },
        image: '/fractal-tree.png'
    };

    private ctx: CanvasRenderingContext2D | null = null;
    private width = 0;
    private height = 0;
    private animationId = 0;
    private time = 0;

    setup(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d');
        this.resize(canvas.width, canvas.height);
        this.animate();
    }

    resize(w: number, h: number) {
        this.width = w;
        this.height = h;
    }

    animate = () => {
        if (!this.ctx) return;

        this.time += 0.015; // Slightly faster for smoother perception

        // Optimization: Don't use shadowBlur as it's very expensive
        this.ctx.fillStyle = '#0d0d0d';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.save();
        this.ctx.translate(this.width / 2, this.height * 0.9);

        const baseAngle = Math.sin(this.time * 0.5) * 0.4 + 0.45;
        const wiggle = Math.sin(this.time * 2) * 0.02;

        // Depth reduced to 9 for better performance on limited hardware 
        // (still looks complex enough)
        this.drawBranch(this.height * 0.25, baseAngle + wiggle, 0);
        this.ctx.restore();

        this.animationId = requestAnimationFrame(this.animate);
    }

    drawBranch(len: number, angle: number, depth: number) {
        if (!this.ctx) return;

        // Optimized color selection
        let color = '#cc2222';
        if (depth > 4) color = '#ff3333';
        if (depth > 7) color = '#e6e2d3';

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = Math.max(1, 10 - depth); // Simpler math

        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -len);
        this.ctx.stroke();

        this.ctx.translate(0, -len);

        if (depth < 9) { // Capped at 9 levels
            const nextLen = len * 0.72;

            this.ctx.save();
            this.ctx.rotate(angle);
            this.drawBranch(nextLen, angle, depth + 1);
            this.ctx.restore();

            this.ctx.save();
            this.ctx.rotate(-angle * 0.85);
            this.drawBranch(nextLen, angle, depth + 1);
            this.ctx.restore();
        }
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
    }
}
