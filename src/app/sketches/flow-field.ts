import { createNoise3D } from 'simplex-noise';
import { Sketch } from './types';

export class FlowFieldSketch implements Sketch {
    private ctx: CanvasRenderingContext2D | null = null;
    private width = 0;
    private height = 0;
    private animationId = 0;
    private particles: { x: number, y: number, hue: number }[] = [];
    private noise3D = createNoise3D();
    private zOff = 0;

    setup(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d');
        this.resize(canvas.width, canvas.height);
        this.animate();
    }

    resize(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.initParticles();
        if (this.ctx) {
            this.ctx.fillStyle = '#050505';
            this.ctx.fillRect(0, 0, w, h);
        }
    }

    initParticles() {
        this.particles = [];
        const count = 1500;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                hue: Math.random() * 80 + 200 // Blue -> Purple -> Pink
            });
        }
    }

    animate = () => {
        if (!this.ctx) return;

        // Trail effect (fading previous frames)
        this.ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.zOff += 0.002;

        this.particles.forEach(p => {
            // Noise scale 0.002
            const angle = this.noise3D(p.x * 0.002, p.y * 0.002, this.zOff) * Math.PI * 2;

            p.x += Math.cos(angle) * 1.5;
            p.y += Math.sin(angle) * 1.5;

            // Wrap around
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;

            this.ctx!.fillStyle = `hsla(${p.hue}, 80%, 60%, 0.8)`;
            this.ctx!.fillRect(p.x, p.y, 2, 2);
        });

        this.animationId = requestAnimationFrame(this.animate);
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
    }
}
