import { Sketch, SketchMetadata } from './types';

export class PseudoangleSketch implements Sketch {
    readonly metadata: SketchMetadata = {
        id: 'pseudoangle',
        title: {
            pt: 'Pseudo-ângulo',
            en: 'Pseudoangle'
        },
        description: {
            pt: 'Uma visualização técnica de aproximação angular em octantes, explorando geometria computacional e precisão radical.',
            en: 'A technical visualization of angular approximation in octants, exploring computational geometry and radical precision.'
        },
        image: '/pseudoangle.svg'
    };

    private ctx: CanvasRenderingContext2D | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private width = 0;
    private height = 0;
    private animationId = 0;
    private mouseX = 0;
    private mouseY = 0;
    private size = 0;
    private centerX = 0;
    private centerY = 0;

    private palette = ["#FAFAFA", "#B4B4B4", "#0d0d0d", "#cc2222", "#0000FF"];

    setup(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize(canvas.width, canvas.height);

        canvas.addEventListener('mousemove', this.onMouseMove);
        this.animate();
    }

    private onMouseMove = (e: MouseEvent) => {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        this.mouseX = (e.clientX - rect.left) * scaleX;
        this.mouseY = (e.clientY - rect.top) * scaleY;
    };

    resize(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.centerX = w / 2;
        this.centerY = h / 2;
        this.size = Math.min(w, h) / 6.0;
    }

    private getPseudoangle(dx: number, dy: number): number {
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);

        let code = (adx < ady) ? 1 : 0;
        if (dx < 0) code += 2;
        if (dy < 0) code += 4;

        switch (code) {
            case 0: return (dx === 0) ? 0 : ady / adx;
            case 1: return (2.0 - (adx / ady));
            case 3: return (2.0 + (adx / ady));
            case 2: return (4.0 - (ady / adx));
            case 6: return (4.0 + (ady / adx));
            case 7: return (6.0 - (adx / ady));
            case 5: return (6.0 + (adx / ady));
            case 4: return (8.0 - (ady / adx));
            default: return 0;
        }
    }

    private getCoords(centerX: number, centerY: number, size: number, pa: number) {
        const integer = Math.floor(pa);
        const real = pa - integer;

        const pseudoarcCoords = [
            { x: centerX + size, y: centerY - size },
            { x: centerX, y: centerY - size },
            { x: centerX - size, y: centerY - size },
            { x: centerX - size, y: centerY },
            { x: centerX - size, y: centerY + size },
            { x: centerX, y: centerY + size },
            { x: centerX + size, y: centerY + size },
            { x: centerX + size, y: centerY }
        ];

        const out = [];
        out.push({ x: centerX + size, y: centerY });
        for (let i = 0; i < integer; i++) {
            out.push(pseudoarcCoords[i]);
        }

        const temp = pseudoarcCoords[integer];
        let endPoint = { x: 0, y: 0 };

        switch (integer) {
            case 0: endPoint = { x: temp.x, y: temp.y + size * (1.0 - real) }; break;
            case 1: endPoint = { x: temp.x + size * (1.0 - real), y: temp.y }; break;
            case 2: endPoint = { x: temp.x + size * (1.0 - real), y: temp.y }; break;
            case 3: endPoint = { x: temp.x, y: temp.y - size * (1.0 - real) }; break;
            case 4: endPoint = { x: temp.x, y: temp.y - size * (1.0 - real) }; break;
            case 5: endPoint = { x: temp.x - size * (1.0 - real), y: temp.y }; break;
            case 6: endPoint = { x: temp.x - size * (1.0 - real), y: temp.y }; break;
            case 7: endPoint = { x: temp.x, y: temp.y + size * (1.0 - real) }; break;
        }

        out.push(endPoint);
        return out;
    }

    animate = () => {
        if (!this.ctx) return;

        this.ctx.fillStyle = this.palette[0];
        this.ctx.fillRect(0, 0, this.width, this.height);

        const dx = this.mouseX - this.centerX;
        const dy = this.centerY - this.mouseY;
        const pa = this.getPseudoangle(dx, dy);

        this.drawSquare();
        this.drawLineToCursor();
        this.drawPseudoarc(pa);
        this.drawDelta(dx, dy);

        this.animationId = requestAnimationFrame(this.animate);
    }

    private drawSquare() {
        if (!this.ctx) return;
        this.ctx.strokeStyle = this.palette[1];
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(this.centerX - this.size, this.centerY - this.size, 2 * this.size, 2 * this.size);

        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY - this.size);
        this.ctx.lineTo(this.centerX, this.centerY + this.size);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX - this.size, this.centerY);
        this.ctx.lineTo(this.centerX + this.size, this.centerY);
        this.ctx.stroke();
    }

    private drawLineToCursor() {
        if (!this.ctx) return;
        this.ctx.strokeStyle = "#888";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(this.mouseX, this.mouseY);
        this.ctx.stroke();
    }

    private drawPseudoarc(pa: number) {
        if (!this.ctx) return;
        let normalizedPa = pa;
        if (normalizedPa >= 8.0) normalizedPa %= 8.0;
        else if (normalizedPa < 0.0) normalizedPa = 8.0 - (Math.abs(normalizedPa) % 8.0);

        const coords = this.getCoords(this.centerX, this.centerY, this.size, normalizedPa);
        const last = coords[coords.length - 1];

        this.ctx.strokeStyle = this.palette[3];
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(coords[0].x, coords[0].y);
        for (let i = 1; i < coords.length; i++) {
            this.ctx.lineTo(coords[i].x, coords[i].y);
        }
        this.ctx.stroke();

        this.ctx.strokeStyle = "#333";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(last.x, last.y);
        this.ctx.stroke();

        this.ctx.fillStyle = this.palette[3];
        this.ctx.beginPath();
        this.ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.font = "14px 'JetBrains Mono'";
        this.ctx.fillStyle = "#111";
        this.ctx.fillText(normalizedPa.toFixed(2), last.x + 10, last.y);
    }

    private drawDelta(dx: number, dy: number) {
        if (!this.ctx) return;
        const deltaX = Math.abs(dx).toFixed(0);
        const deltaY = Math.abs(dy).toFixed(0);

        this.ctx.font = "12px 'JetBrains Mono'";
        this.ctx.fillStyle = "#666";
        this.ctx.fillText(`|Δx| = ${deltaX}`, this.mouseX + 10, this.mouseY - 20);
        this.ctx.fillText(`|Δy| = ${deltaY}`, this.mouseX + 10, this.mouseY - 5);

        const mx = Math.floor(this.mouseX) + 0.5;
        const my = Math.floor(this.mouseY) + 0.5;
        const cx = Math.floor(this.centerX) + 0.5;
        const cy = Math.floor(this.centerY) + 0.5;

        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeStyle = this.palette[1];
        this.ctx.beginPath();
        this.ctx.moveTo(mx, cy);
        this.ctx.lineTo(mx, my);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(cx, my);
        this.ctx.lineTo(mx, my);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    destroy() {
        this.canvas?.removeEventListener('mousemove', this.onMouseMove);
        cancelAnimationFrame(this.animationId);
    }
}
