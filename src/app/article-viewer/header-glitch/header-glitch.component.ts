import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-glitch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-glitch.html',
  styleUrl: './header-glitch.css'
})
export class HeaderGlitchComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() layers!: { back: string, front: string, icons: string };
  @ViewChild('headerCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D | null = null;
  private images: { back: HTMLImageElement, front: HTMLImageElement, icons: HTMLImageElement } | null = null;
  private offscreen: { cyan: HTMLCanvasElement, magenta: HTMLCanvasElement, main: HTMLCanvasElement } | null = null;
  private animationId: number | null = null;
  private width = 0;
  private height = 0;

  ngAfterViewInit() {
    this.init();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['layers'] && !changes['layers'].firstChange) {
      this.init();
    }
  }

  @HostListener('window:resize')
  onResize() {
    const canvas = this.canvasRef?.nativeElement;
    const rect = canvas?.parentElement?.getBoundingClientRect();
    if (rect) {
      this.width = rect.width;
      this.height = rect.width * 0.5625;
      canvas.width = this.width;
      canvas.height = this.height;
    }
  }

  private async init() {
    if (!this.layers || !this.canvasRef) return;
    
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    
    this.onResize();

    // Load images
    const load = (src: string): Promise<HTMLImageElement> => new Promise(r => {
      const img = new Image();
      img.onload = () => r(img);
      img.src = src;
    });

    this.images = {
      back: await load(this.layers.back),
      front: await load(this.layers.front),
      icons: await load(this.layers.icons)
    };

    this.initOffscreen();
    if (this.animationId === null) this.animate();
  }

  private initOffscreen() {
    if (!this.images) return;
    const { front } = this.images;
    
    const createBuffer = (img: HTMLImageElement, color: string) => {
      const b = document.createElement('canvas');
      b.width = img.width;
      b.height = img.height;
      const bctx = b.getContext('2d')!;
      bctx.drawImage(img, 0, 0);
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

  private animate = () => {
    this.draw();
    this.animationId = requestAnimationFrame(this.animate);
  }

  private draw() {
    if (!this.ctx || !this.images || !this.offscreen || !this.width) return;
    const ctx = this.ctx;
    const time = Date.now() * 0.001;

    ctx.clearRect(0, 0, this.width, this.height);

    const scale = Math.max(this.width / this.images.back.width, this.height / this.images.back.height);
    const w = this.images.back.width * scale;
    const h = this.images.back.height * scale;
    const x = (this.width - w) / 2;
    const y = (this.height - h) / 2;

    ctx.globalAlpha = 1.0;
    ctx.drawImage(this.images.back, x, y, w, h);

    const flicker = (Math.sin(time * 10) + Math.sin(time * 25) + Math.sin(time * 50)) > 0 ? 0.8 : 0.1;
    ctx.globalAlpha = flicker;
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(this.images.icons, x, y, w, h);
    ctx.globalCompositeOperation = 'source-over';

    ctx.globalAlpha = 1.0;
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

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}
