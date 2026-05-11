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
    private minThreshold = 20; // 0 - 100
    private maxThreshold = 80; // 0 - 100
    private segments = 10; // 1 - 100
    private randomness = 20; // 0 - 100

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
                <label id="lbl-min-thresh" style="display: block; margin-bottom: 0.5rem;">MIN THRESHOLD (${this.minThreshold}):</label>
                <input type="range" id="ps-min-thresh" min="0" max="100" value="${this.minThreshold}" style="width: 100%;">
            </div>

            <div style="margin-bottom: 1rem;">
                <label id="lbl-max-thresh" style="display: block; margin-bottom: 0.5rem;">MAX THRESHOLD (${this.maxThreshold}):</label>
                <input type="range" id="ps-max-thresh" min="0" max="100" value="${this.maxThreshold}" style="width: 100%;">
            </div>

            <div style="margin-bottom: 1rem;">
                <label id="lbl-segments" style="display: block; margin-bottom: 0.5rem;">SEGMENTS (${this.segments}):</label>
                <input type="range" id="ps-segments" min="1" max="100" value="${this.segments}" style="width: 100%;">
            </div>

            <div style="margin-bottom: 1rem;">
                <label id="lbl-randomness" style="display: block; margin-bottom: 0.5rem;">RANDOMNESS (${this.randomness}):</label>
                <input type="range" id="ps-randomness" min="0" max="100" value="${this.randomness}" style="width: 100%;">
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

        const minThreshSlider = this.uiContainer.querySelector('#ps-min-thresh') as HTMLInputElement;
        const minThreshLabel = this.uiContainer.querySelector('#lbl-min-thresh') as HTMLLabelElement;
        minThreshSlider.addEventListener('input', (e) => {
            this.minThreshold = parseInt((e.target as HTMLInputElement).value);
            minThreshLabel.innerText = `MIN THRESHOLD (${this.minThreshold}):`;
        });
        minThreshSlider.addEventListener('change', () => this.processAndDraw());

        const maxThreshSlider = this.uiContainer.querySelector('#ps-max-thresh') as HTMLInputElement;
        const maxThreshLabel = this.uiContainer.querySelector('#lbl-max-thresh') as HTMLLabelElement;
        maxThreshSlider.addEventListener('input', (e) => {
            this.maxThreshold = parseInt((e.target as HTMLInputElement).value);
            maxThreshLabel.innerText = `MAX THRESHOLD (${this.maxThreshold}):`;
        });
        maxThreshSlider.addEventListener('change', () => this.processAndDraw());

        const segmentsSlider = this.uiContainer.querySelector('#ps-segments') as HTMLInputElement;
        const segmentsLabel = this.uiContainer.querySelector('#lbl-segments') as HTMLLabelElement;
        segmentsSlider.addEventListener('input', (e) => {
            this.segments = parseInt((e.target as HTMLInputElement).value);
            segmentsLabel.innerText = `SEGMENTS (${this.segments}):`;
        });
        segmentsSlider.addEventListener('change', () => this.processAndDraw());

        const randomnessSlider = this.uiContainer.querySelector('#ps-randomness') as HTMLInputElement;
        const randomnessLabel = this.uiContainer.querySelector('#lbl-randomness') as HTMLLabelElement;
        randomnessSlider.addEventListener('input', (e) => {
            this.randomness = parseInt((e.target as HTMLInputElement).value);
            randomnessLabel.innerText = `RANDOMNESS (${this.randomness}):`;
        });
        randomnessSlider.addEventListener('change', () => this.processAndDraw());

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
        
        const minT = (this.minThreshold / 100) * 255;
        const maxT = (this.maxThreshold / 100) * 255;

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

        const isInRange = (val: number) => val >= minT && val <= maxT;

        if (this.direction === 'right' || this.direction === 'left') {
            for (let y = 0; y < height; y++) {
                let x = 0;
                while (x < width) {
                    while (x < width && !isInRange(getVal(x, y))) {
                        x++;
                    }
                    const start = x;
                    while (x < width && isInRange(getVal(x, y))) {
                        x++;
                    }
                    const end = x;

                    if (start < end) {
                        let current = start;
                        while (current < end) {
                            let segSize = Math.floor(width / this.segments);
                            if (this.randomness > 0) {
                                const maxVariation = segSize * (this.randomness / 100);
                                segSize += Math.floor((Math.random() - 0.5) * 2 * maxVariation);
                            }
                            segSize = Math.max(1, segSize);
                            
                            let segEnd = Math.min(current + segSize, end);
                            
                            const segment: number[][] = [];
                            for (let i = current; i < segEnd; i++) {
                                const idx = (y * width + i) * 4;
                                segment.push([data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]);
                            }

                            sortSegment(segment);

                            if (this.direction === 'left') {
                                segment.reverse();
                            }

                            for (let i = current; i < segEnd; i++) {
                                const idx = (y * width + i) * 4;
                                const pix = segment[i - current];
                                data[idx] = pix[0];
                                data[idx + 1] = pix[1];
                                data[idx + 2] = pix[2];
                                data[idx + 3] = pix[3];
                            }
                            
                            current = segEnd;
                        }
                    }
                }
            }
        } else {
            // Up or Down
            for (let x = 0; x < width; x++) {
                let y = 0;
                while (y < height) {
                    while (y < height && !isInRange(getVal(x, y))) {
                        y++;
                    }
                    const start = y;
                    while (y < height && isInRange(getVal(x, y))) {
                        y++;
                    }
                    const end = y;

                    if (start < end) {
                        let current = start;
                        while (current < end) {
                            let segSize = Math.floor(height / this.segments);
                            if (this.randomness > 0) {
                                const maxVariation = segSize * (this.randomness / 100);
                                segSize += Math.floor((Math.random() - 0.5) * 2 * maxVariation);
                            }
                            segSize = Math.max(1, segSize);
                            
                            let segEnd = Math.min(current + segSize, end);
                            
                            const segment: number[][] = [];
                            for (let i = current; i < segEnd; i++) {
                                const idx = (i * width + x) * 4;
                                segment.push([data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]);
                            }

                            sortSegment(segment);

                            if (this.direction === 'up') {
                                segment.reverse();
                            }

                            for (let i = current; i < segEnd; i++) {
                                const idx = (i * width + x) * 4;
                                const pix = segment[i - current];
                                data[idx] = pix[0];
                                data[idx + 1] = pix[1];
                                data[idx + 2] = pix[2];
                                data[idx + 3] = pix[3];
                            }
                            current = segEnd;
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
