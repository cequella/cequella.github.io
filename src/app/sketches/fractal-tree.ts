import { Sketch } from './types';

export class FractalTreeSketch implements Sketch {
    private ctx: CanvasRenderingContext2D | null = null;
    private width = 0;
    private height = 0;
    private animationId = 0;
    private angleOffset = 0;

    setup(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d');
        this.resize(canvas.width, canvas.height);
        this.animate();
    }

    resize(w: number, h: number) {
        this.width = w;
        this.height = h;
    }

    drawTree(x: number, y: number, len: number, angle: number, depth: number) {
        if (!this.ctx) return;
        if (depth === 0) return;

        const endX = x + len * Math.cos(angle);
        const endY = y + len * Math.sin(angle);

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        // Gold to Pink gradient based on depth
        this.ctx.strokeStyle = `hsla(${40 + depth * 30}, 80%, 60%, ${depth / 12 + 0.2})`;
        this.ctx.lineWidth = depth * 0.8;
        this.ctx.stroke();

        const newLen = len * 0.75;
        this.drawTree(endX, endY, newLen, angle - this.angleOffset, depth - 1);
        this.drawTree(endX, endY, newLen, angle + this.angleOffset, depth - 1);
    }

    animate = () => {
        if (!this.ctx) return;
        this.ctx.fillStyle = 'rgba(5, 5, 5, 1)'; // Clear fully
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Oscillate angle slowly
        const time = Date.now() * 0.0005;
        this.angleOffset = Math.PI / 4 + Math.sin(time) * 0.2;

        this.drawTree(this.width / 2, this.height, this.height * 0.25, -Math.PI / 2, 10);

        this.animationId = requestAnimationFrame(this.animate);
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
    }
}
