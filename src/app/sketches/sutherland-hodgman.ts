import { Sketch, SketchMetadata } from './types';

interface Point {
    x: number;
    y: number;
}

export class SutherlandHodgmanSketch implements Sketch {
    readonly metadata: SketchMetadata = {
        id: 'sutherland-hodgman',
        title: {
            pt: 'Sutherland–Hodgman',
            en: 'Sutherland–Hodgman'
        },
        description: {
            pt: 'Um algoritmo fundamental para recorte de polígonos, amplamente utilizado em computação gráfica para renderização eficiente.',
            en: 'A fundamental algorithm for polygon clipping, widely used in computer graphics for efficient rendering.'
        },
        image: '/sutherland-hodgman.svg'
    };

    private ctx: CanvasRenderingContext2D | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private width = 0;
    private height = 0;
    private animationId = 0;

    private polygon: Point[] = [];
    private clipWindow = { x: 0, y: 0, w: 0, h: 0 };

    private draggingPoint: number | null = null;
    private draggingWindow = false;
    private mouseX = 0;
    private mouseY = 0;

    private palette = {
        bg: "#0d0d0d",
        polygon: "#444444",
        clip: "#cc2222",
        result: "#FAFAFA",
        accent: "#0000FF",
        text: "#B4B4B4"
    };

    setup(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize(canvas.width, canvas.height);

        // Initial polygon
        this.polygon = [
            { x: this.width * 0.3, y: this.height * 0.3 },
            { x: this.width * 0.7, y: this.height * 0.2 },
            { x: this.width * 0.8, y: this.height * 0.6 },
            { x: this.width * 0.5, y: this.height * 0.8 },
            { x: this.width * 0.2, y: this.height * 0.6 }
        ];

        // Initial clip window
        this.clipWindow = {
            x: this.width * 0.25,
            y: this.height * 0.25,
            w: this.width * 0.5,
            h: this.height * 0.5
        };

        canvas.addEventListener('mousedown', this.onMouseDown);
        canvas.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);

        this.animate();
    }

    resize(w: number, h: number) {
        const oldW = this.width;
        const oldH = this.height;
        this.width = w;
        this.height = h;

        if (oldW > 0 && oldH > 0) {
            const scaleX = w / oldW;
            const scaleY = h / oldH;
            this.polygon.forEach(p => {
                p.x *= scaleX;
                p.y *= scaleY;
            });
            this.clipWindow.x *= scaleX;
            this.clipWindow.y *= scaleY;
            this.clipWindow.w *= scaleX;
            this.clipWindow.h *= scaleY;
        }
    }

    private onMouseDown = (e: MouseEvent) => {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        // Check for polygon vertices
        for (let i = 0; i < this.polygon.length; i++) {
            const p = this.polygon[i];
            const dist = Math.hypot(p.x - mx, p.y - my);
            if (dist < 15) {
                this.draggingPoint = i;
                return;
            }
        }

        // Check for clip window (edges or center)
        if (mx >= this.clipWindow.x && mx <= this.clipWindow.x + this.clipWindow.w &&
            my >= this.clipWindow.y && my <= this.clipWindow.y + this.clipWindow.h) {
            this.draggingWindow = true;
            this.mouseX = mx;
            this.mouseY = my;
        }
    };

    private onMouseMove = (e: MouseEvent) => {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        if (this.draggingPoint !== null) {
            this.polygon[this.draggingPoint].x = mx;
            this.polygon[this.draggingPoint].y = my;
        } else if (this.draggingWindow) {
            const dx = mx - this.mouseX;
            const dy = my - this.mouseY;
            this.clipWindow.x += dx;
            this.clipWindow.y += dy;
            this.mouseX = mx;
            this.mouseY = my;
        }
    };

    private onMouseUp = () => {
        this.draggingPoint = null;
        this.draggingWindow = false;
    };

    private clip(subjectPolygon: Point[], clipEdge: (p: Point) => boolean, intersect: (a: Point, b: Point) => Point): Point[] {
        let outputList = subjectPolygon;
        let inputList = outputList;
        outputList = [];

        if (inputList.length === 0) return [];

        let s = inputList[inputList.length - 1];

        for (const e of inputList) {
            if (clipEdge(e)) {
                if (!clipEdge(s)) {
                    outputList.push(intersect(s, e));
                }
                outputList.push(e);
            } else if (clipEdge(s)) {
                outputList.push(intersect(s, e));
            }
            s = e;
        }
        return outputList;
    }

    private getClippedPolygon(): Point[] {
        let result = [...this.polygon];
        const { x, y, w, h } = this.clipWindow;

        // Left
        result = this.clip(result, p => p.x >= x, (a, b) => ({
            x: x,
            y: a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x)
        }));

        // Right
        result = this.clip(result, p => p.x <= x + w, (a, b) => ({
            x: x + w,
            y: a.y + (b.y - a.y) * (x + w - a.x) / (b.x - a.x)
        }));

        // Top
        result = this.clip(result, p => p.y >= y, (a, b) => ({
            x: a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y),
            y: y
        }));

        // Bottom
        result = this.clip(result, p => p.y <= y + h, (a, b) => ({
            x: a.x + (b.x - a.x) * (y + h - a.y) / (b.y - a.y),
            y: y + h
        }));

        return result;
    }

    animate = () => {
        if (!this.ctx) return;

        this.ctx.fillStyle = this.palette.bg;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.drawGrid();

        const clipped = this.getClippedPolygon();

        // Draw original polygon
        this.drawPolygon(this.polygon, this.palette.polygon, true);

        // Draw clip window
        this.ctx.strokeStyle = this.palette.clip;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(this.clipWindow.x, this.clipWindow.y, this.clipWindow.w, this.clipWindow.h);
        this.ctx.setLineDash([]);

        // Draw clipped polygon
        this.drawPolygon(clipped, this.palette.result, false, true);

        // Draw handles
        this.polygon.forEach((p, i) => {
            this.ctx!.fillStyle = i === this.draggingPoint ? this.palette.accent : this.palette.text;
            this.ctx!.beginPath();
            this.ctx!.arc(p.x, p.y, 5, 0, Math.PI * 2);
            this.ctx!.fill();
        });

        this.drawInfo();

        this.animationId = requestAnimationFrame(this.animate);
    }

    private drawGrid() {
        if (!this.ctx) return;
        this.ctx.strokeStyle = "#1a1a1a";
        this.ctx.lineWidth = 1;
        const step = 40;
        for (let x = 0; x < this.width; x += step) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.height; y += step) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    private drawPolygon(pts: Point[], color: string, dashed = false, filled = false) {
        if (!this.ctx || pts.length < 2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
            this.ctx.lineTo(pts[i].x, pts[i].y);
        }
        this.ctx.closePath();

        if (dashed) this.ctx.setLineDash([5, 5]);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        if (dashed) this.ctx.setLineDash([]);

        if (filled) {
            this.ctx.fillStyle = color + "33"; // 20% opacity
            this.ctx.fill();
        }
    }

    private drawInfo() {
        if (!this.ctx) return;
        this.ctx.font = "14px 'JetBrains Mono', monospace";
        this.ctx.fillStyle = this.palette.text;
        this.ctx.fillText("Arraste os pontos para modificar o polígono", 20, 30);
        this.ctx.fillText("Arraste o retângulo para mover a janela de clip", 20, 50);
    }

    destroy() {
        this.canvas?.removeEventListener('mousedown', this.onMouseDown);
        this.canvas?.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        cancelAnimationFrame(this.animationId);
    }
}
