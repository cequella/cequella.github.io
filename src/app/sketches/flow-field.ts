import { createNoise3D } from 'simplex-noise';
import { Sketch, SketchMetadata } from './types';

export class FlowFieldSketch implements Sketch {
    private ctx: CanvasRenderingContext2D | null = null;
    private width = 0;
    private height = 0;
    private animationId = 0;
    private particles: { x: number, y: number, hue: number }[] = [];
    private noise3D = createNoise3D();
    private zOff = 0;

    readonly metadata: SketchMetadata = {
        image: '/flow-field.png',
        id: 'flow-field',
        title: {
            pt: 'Campo de Fluxo Neon',
            en: 'Neon Flow Field'
        },
        description: {
            pt: 'Milhares de partículas seguindo vetores de ruído Perlin em uma dança fluida.',
            en: 'Thousands of particles following Perlin noise vectors in a fluid dance.'
        },
    }

    setup(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d', { alpha: false }); // Optimization: hints the browser the canvas has no alpha
        this.resize(canvas.width, canvas.height);
        this.animate();
    }

    resize(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.initParticles();
        if (this.ctx) {
            this.ctx.fillStyle = '#111111';
            this.ctx.fillRect(0, 0, w, h);
        }
    }

    initParticles() {
        this.particles = [];
        // Optimized: Reduced particle count for better performance
        const count = 1000;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                hue: Math.random() > 0.8 ? 0 : 40
            });
        }
    }

    animate = () => {
        if (!this.ctx) return;

        // Optimization: trail effect
        this.ctx.fillStyle = 'rgba(17, 17, 17, 0.08)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.zOff += 0.0015; // Slowed down slightly for smoother look

        const redParticles: { x: number, y: number }[] = [];
        const whiteParticles: { x: number, y: number }[] = [];

        this.particles.forEach(p => {
            const angle = this.noise3D(p.x * 0.0015, p.y * 0.0015, this.zOff) * Math.PI * 2;

            p.x += Math.cos(angle) * 1.2;
            p.y += Math.sin(angle) * 1.2;

            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;

            if (p.hue === 0) redParticles.push({ x: p.x, y: p.y });
            else whiteParticles.push({ x: p.x, y: p.y });
        });

        // Batch drawing by color
        this.ctx.fillStyle = '#cc2222';
        redParticles.forEach(p => this.ctx!.fillRect(p.x, p.y, 1.5, 1.5));

        this.ctx.fillStyle = 'rgba(230, 226, 211, 0.6)';
        whiteParticles.forEach(p => this.ctx!.fillRect(p.x, p.y, 1.5, 1.5));

        this.animationId = requestAnimationFrame(this.animate);
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
    }
}
