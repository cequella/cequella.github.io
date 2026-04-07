export class HeaderCanvas {
    private ctx: CanvasRenderingContext2D | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private images: { back: HTMLImageElement, front: HTMLImageElement, icons: HTMLImageElement } | null = null;
    private offscreen: { cyan: HTMLCanvasElement, magenta: HTMLCanvasElement, main: HTMLCanvasElement } | null = null;
    private animationId: number | null = null;
    private width = 0;
    private height = 0;

    async setup(canvas: HTMLCanvasElement, layers: { back: string, front: string, icons: string }) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Load images
        this.images = {
            back: await this.loadImage(layers.back),
            front: await this.loadImage(layers.front),
            icons: await this.loadImage(layers.icons)
        };

        this.initOffscreen();
        this.animate();
    }

    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
        });
    }

    private initOffscreen() {
        if (!this.images) return;
        const { front } = this.images;
        
        const createBuffer = (img: HTMLImageElement, color: string) => {
            const b = document.createElement('canvas');
            b.width = img.width;
            b.height = img.height;
            const bctx = b.getContext('2d')!;
            
            // Draw original
            bctx.drawImage(img, 0, 0);
            
            // Tint
            bctx.globalCompositeOperation = 'source-in';
            bctx.fillStyle = color;
            bctx.fillRect(0, 0, b.width, b.height);
            
            return b;
        };

        this.offscreen = {
            cyan: createBuffer(front, '#00ffff'),
            magenta: createBuffer(front, '#ff00ff'),
            main: (() => {
                const b = document.createElement('canvas');
                b.width = front.width;
                b.height = front.height;
                b.getContext('2d')!.drawImage(front, 0, 0);
                return b;
            })()
        };
    }

    resize(w: number, h: number) {
        this.width = w;
        this.height = h;
        if (this.canvas) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
    }

    private animate = () => {
        this.draw();
        this.animationId = requestAnimationFrame(this.animate);
    }

    private draw() {
        if (!this.ctx || !this.images || !this.offscreen || !this.width) return;
        const ctx = this.ctx;
        const time = Date.now() * 0.001;

        ctx.clearRect(0, 0, this.width, this.height);

        // Header Rect
        const scale = Math.max(this.width / this.images.back.width, this.height / this.images.back.height);
        const w = this.images.back.width * scale;
        const h = this.images.back.height * scale;
        const x = (this.width - w) / 2;
        const y = (this.height - h) / 2;

        // 1. Draw Back
        ctx.globalAlpha = 1.0;
        ctx.drawImage(this.images.back, x, y, w, h);

        // 2. Draw Icons with Flicker
        const flicker = (Math.sin(time * 10) + Math.sin(time * 25) + Math.sin(time * 50)) > 0 ? 0.8 : 0.1;
        ctx.globalAlpha = flicker;
        ctx.globalCompositeOperation = 'overlay';
        ctx.drawImage(this.images.icons, x, y, w, h);
        ctx.globalCompositeOperation = 'source-over';

        // 3. Draw Front with Glitch
        ctx.globalAlpha = 1.0;
        
        // Glitch offsets
        const jitter = Math.sin(time * 15) > 0.95 ? (Math.random() - 0.5) * 10 : 0;
        const cyanX = Math.sin(time * 2) * 3 + jitter;
        const cyanY = Math.cos(time * 1.5) * 2;
        const magX = -cyanX * 0.8;
        const magY = -cyanY * 0.8;

        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(this.offscreen.cyan, x + cyanX, y + cyanY, w, h);
        ctx.drawImage(this.offscreen.magenta, x + magX, y + magY, w, h);
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(this.offscreen.main, x, y, w, h);
    }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }
}
