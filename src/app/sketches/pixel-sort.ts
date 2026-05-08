import { Sketch, SketchMetadata } from './types';

export class PixelSortSketch implements Sketch {
    private ctx: CanvasRenderingContext2D | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private width = 0;
    private height = 0;
    private img: HTMLImageElement | null = null;
    private uiContainer: HTMLDivElement | null = null;
    private originalImageData: ImageData | null = null;

    // Controls
    private channel: 'red' | 'green' | 'blue' | 'saturation' | 'brightness' | 'hue' = 'brightness';
    private direction: 'up' | 'down' | 'left' | 'right' = 'down';
    private intensity = 50; // 0 - 100

    readonly metadata: SketchMetadata = {
        id: 'pixel-sort',
        title: {
            pt: 'Pixel Sort Interativo',
            en: 'Interactive Pixel Sort'
        },
        description: {
            pt: 'Envie uma imagem e aplique efeitos de pixel sort customizados.',
            en: 'Upload an image and apply custom pixel sort effects.'
        },
        image: '/pixel-sort-thumb.png'
    };

    setup(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize(canvas.width, canvas.height);
        this.createUI();
        this.drawPlaceholder();
    }

    resize(w: number, h: number) {
        this.width = w;
        this.height = h;
        if (this.img) {
            this.drawImageAndProcess();
        } else {
            this.drawPlaceholder();
        }
    }

    private drawPlaceholder() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.fillStyle = '#cc2222';
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ENVIE UMA IMAGEM PARA COMEÇAR', this.width / 2, this.height / 2);
        ctx.fillText('UPLOAD AN IMAGE TO START', this.width / 2, this.height / 2 + 30);
    }

    private createUI() {
        if (!this.canvas) return;
        
        const wrapper = this.canvas.parentElement;
        if (!wrapper) return;

        this.uiContainer = document.createElement('div');
        this.uiContainer.className = 'pixel-sort-ui';
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '2rem';
        this.uiContainer.style.left = '2rem';
        this.uiContainer.style.backgroundColor = 'rgba(13, 13, 13, 0.9)';
        this.uiContainer.style.border = '2px solid #cc2222';
        this.uiContainer.style.padding = '1.5rem';
        this.uiContainer.style.color = '#fff';
        this.uiContainer.style.fontFamily = 'monospace';
        this.uiContainer.style.zIndex = '100';
        this.uiContainer.style.maxWidth = '300px';
        this.uiContainer.style.boxShadow = '0 0 20px rgba(204, 34, 34, 0.3)';

        this.uiContainer.innerHTML = `
            <div style="margin-bottom: 1rem; font-weight: bold; border-bottom: 1px solid #cc2222; padding-bottom: 0.5rem;">CONTROL PANEL</div>
            
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem;">IMAGE:</label>
                <input type="file" id="ps-file" accept="image/*" style="width: 100%; background: #222; color: #fff; border: 1px solid #555; padding: 0.25rem;">
            </div>

            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem;">CHANNEL:</label>
                <select id="ps-channel" style="width: 100%; background: #222; color: #fff; border: 1px solid #555; padding: 0.25rem;">
                    <option value="brightness">Brightness</option>
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="saturation">Saturation</option>
                    <option value="hue">Hue</option>
                </select>
            </div>

            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem;">DIRECTION:</label>
                <select id="ps-direction" style="width: 100%; background: #222; color: #fff; border: 1px solid #555; padding: 0.25rem;">
                    <option value="down">Down</option>
                    <option value="up">Up</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                </select>
            </div>

            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem;">INTENSITY (${this.intensity}):</label>
                <input type="range" id="ps-intensity" min="0" max="100" value="${this.intensity}" style="width: 100%;">
            </div>

            <button id="ps-process" style="width: 100%; background: #cc2222; color: #fff; border: none; padding: 0.5rem; cursor: pointer; font-weight: bold;">PROCESS</button>
        `;

        wrapper.appendChild(this.uiContainer);

        // Event Listeners
        const fileInput = this.uiContainer.querySelector('#ps-file') as HTMLInputElement;
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        const channelSelect = this.uiContainer.querySelector('#ps-channel') as HTMLSelectElement;
        channelSelect.addEventListener('change', (e) => {
            this.channel = (e.target as HTMLSelectElement).value as any;
            this.processAndDraw();
        });

        const directionSelect = this.uiContainer.querySelector('#ps-direction') as HTMLSelectElement;
        directionSelect.addEventListener('change', (e) => {
            this.direction = (e.target as HTMLSelectElement).value as any;
            this.processAndDraw();
        });

        const intensitySlider = this.uiContainer.querySelector('#ps-intensity') as HTMLInputElement;
        const intensityLabel = this.uiContainer.querySelector('label[style*="INTENSITY"]') as HTMLLabelElement;
        intensitySlider.addEventListener('input', (e) => {
            this.intensity = parseInt((e.target as HTMLInputElement).value);
            intensityLabel.innerText = `INTENSITY (${this.intensity}):`;
        });
        intensitySlider.addEventListener('change', () => {
            this.processAndDraw();
        });

        const processBtn = this.uiContainer.querySelector('#ps-process') as HTMLButtonElement;
        processBtn.addEventListener('click', () => {
            this.processAndDraw();
        });
    }

    private handleFileUpload(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            this.img = new Image();
            this.img.onload = () => {
                this.drawImageAndProcess();
            };
            this.img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    private drawImageAndProcess() {
        if (!this.ctx || !this.img || !this.canvas) return;

        // Scale image to fit canvas while maintaining aspect ratio
        const scale = Math.min(this.width / this.img.width, this.height / this.img.height);
        const w = this.img.width * scale;
        const h = this.img.height * scale;
        const x = (this.width - w) / 2;
        const y = (this.height - h) / 2;

        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.drawImage(this.img, x, y, w, h);

        this.originalImageData = this.ctx.getImageData(0, 0, this.width, this.height);
        this.processAndDraw();
    }

    private processAndDraw() {
        if (!this.ctx || !this.originalImageData) return;

        // Restore original image data first
        const imageData = new ImageData(
            new Uint8ClampedArray(this.originalImageData.data),
            this.originalImageData.width,
            this.originalImageData.height
        );

        this.applyPixelSort(imageData);
        this.ctx.putImageData(imageData, 0, 0);
    }

    private applyPixelSort(imageData: ImageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const threshold = (this.intensity / 100) * 255;

        const getVal = (x: number, y: number) => {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            switch (this.channel) {
                case 'red': return r;
                case 'green': return g;
                case 'blue': return b;
                case 'brightness': return (r + g + b) / 3;
                case 'saturation': return this.rgbToHsv(r, g, b)[1] * 255;
                case 'hue': return this.rgbToHsv(r, g, b)[0] * 255;
                default: return 0;
            }
        };

        const sortSegment = (pixels: number[][]) => {
            pixels.sort((a, b) => {
                const valA = getValFromPixel(a);
                const valB = getValFromPixel(b);
                return valA - valB;
            });
        };

        const getValFromPixel = (pixel: number[]) => {
            const [r, g, b] = pixel;
            switch (this.channel) {
                case 'red': return r;
                case 'green': return g;
                case 'blue': return b;
                case 'brightness': return (r + g + b) / 3;
                case 'saturation': return this.rgbToHsv(r, g, b)[1] * 255;
                case 'hue': return this.rgbToHsv(r, g, b)[0] * 255;
                default: return 0;
            }
        };

        if (this.direction === 'right' || this.direction === 'left') {
            for (let y = 0; y < height; y++) {
                let x = 0;
                while (x < width) {
                    while (x < width && getVal(x, y) < threshold) {
                        x++;
                    }
                    const start = x;
                    while (x < width && getVal(x, y) >= threshold) {
                        x++;
                    }
                    const end = x;

                    if (start < end) {
                        const segment: number[][] = [];
                        for (let i = start; i < end; i++) {
                            const idx = (y * width + i) * 4;
                            segment.push([data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]);
                        }

                        sortSegment(segment);

                        if (this.direction === 'left') {
                            segment.reverse();
                        }

                        for (let i = start; i < end; i++) {
                            const idx = (y * width + i) * 4;
                            const pix = segment[i - start];
                            data[idx] = pix[0];
                            data[idx + 1] = pix[1];
                            data[idx + 2] = pix[2];
                            data[idx + 3] = pix[3];
                        }
                    }
                }
            }
        } else {
            // Up or Down
            for (let x = 0; x < width; x++) {
                let y = 0;
                while (y < height) {
                    while (y < height && getVal(x, y) < threshold) {
                        y++;
                    }
                    const start = y;
                    while (y < height && getVal(x, y) >= threshold) {
                        y++;
                    }
                    const end = y;

                    if (start < end) {
                        const segment: number[][] = [];
                        for (let i = start; i < end; i++) {
                            const idx = (i * width + x) * 4;
                            segment.push([data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]);
                        }

                        sortSegment(segment);

                        if (this.direction === 'up') {
                            segment.reverse();
                        }

                        for (let i = start; i < end; i++) {
                            const idx = (i * width + x) * 4;
                            const pix = segment[i - start];
                            data[idx] = pix[0];
                            data[idx + 1] = pix[1];
                            data[idx + 2] = pix[2];
                            data[idx + 3] = pix[3];
                        }
                    }
                }
            }
        }
    }

    private rgbToHsv(r: number, g: number, b: number): [number, number, number] {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, v = max;

        const d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max !== min) {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h, s, v];
    }

    destroy() {
        if (this.uiContainer && this.uiContainer.parentElement) {
            this.uiContainer.parentElement.removeChild(this.uiContainer);
        }
    }
}
