import { Sketch, SketchMetadata } from './types';
import { ArticleMetadata } from '../article-types';

export class SacilottoSketch implements Sketch {
    readonly metadata: SketchMetadata = {
        id: 'sacilotto-gen',
        title: {
            pt: 'Gerador Sacilotto',
            en: 'Sacilotto Generator'
        },
        description: {
            pt: 'Composições algorítmicas inspiradas nas Concreções de Luiz Sacilotto.',
            en: 'Algorithmic compositions inspired by Luiz Sacilotto\'s Concretions.'
        },
        image: '/sacilotto/in_person_thumb.webp'
    };

    static readonly article: ArticleMetadata = {
        id: 'sacilotto',
        title: {
            pt: 'Audácia Concreta: Luiz Sacilotto',
            en: 'Concrete Audacity: Luiz Sacilotto'
        },
        author: 'D.Çeqüella',
        date: '2026-04-07',
        thumbnail: '/sacilotto/in_person_thumb.webp',
        headerLayers: {
            back: '/sacilotto/in_person_back.webp',
            front: '/sacilotto/in_person_front.webp',
            icons: '/sacilotto/in_person_icons.webp'
        },
        sections: [
            {
                type: 'heading',
                content: {
                    pt: 'A Audácia da Geometria',
                    en: 'The Audacity of Geometry'
                }
            },
            {
                type: 'text',
                content: {
                    pt: 'Luiz Sacilotto (1924–2003) foi um dos pilares do concretismo brasileiro. Sua obra, marcada pelo rigor matemático e pela precisão técnica, explorou a repetição de módulos e a progressão aritmética para criar composições que vibram diante do olhar.',
                    en: 'Luiz Sacilotto (1924–2003) was one of the pillars of Brazilian concretism. His work, marked by mathematical rigor and technical precision, explored the repetition of modules and arithmetic progression to create compositions that vibrate before the eye.'
                }
            },
            {
                type: 'image',
                imageUrl: '/sacilotto/litografia_sobre_papel_1978.webp',
                caption: {
                    pt: 'Litografia sobre Papel (1978) - Progressão rítmica de triangulos que desafiam a percepção visual.',
                    en: 'Litografia sobre Papel (1978) - Rhythmic progression of triangles that challenge visual perception.'
                }
            },
            {
                type: 'text',
                content: {
                    pt: 'A coleção "Audácia Concreta" revela a evolução de Sacilotto, desde suas primeiras explorações geométricas até suas colagens tardias, onde a estrutura se torna ainda mais depurada. Suas "Concreções" não são apenas formas estáticas, mas ritmos capturados no plano.',
                    en: 'The "Audácia Concreta" collection reveals the evolution of Sacilotto, from his first geometric explorations to his late collages, where the structure becomes even more refined. His "Concreções" are not just static forms, but rhythms captured on the plane.'
                }
            },
            {
                type: 'image',
                imageUrl: '/sacilotto/progressao_223_1976.jpg',
                caption: {
                    pt: 'Nº 223 (1976) - Exploração de rotação e simetria modular em preto e branco.',
                    en: 'Nº 223 (1976) - Exploration of rotation and modular symmetry in black and white.'
                }
            },
            {
                type: 'text',
                content: {
                    pt: 'Abaixo, apresentamos uma homenagem algorítmica à sua obra. Este gerador utiliza os mesmos princípios de Sacilotto — repetição, rotação e simetria — para criar novas "Concreções" que continuam seu diálogo com o espaço e a forma.',
                    en: 'Below, we present an algorithmic tribute to his work. This generator uses the same principles as Sacilotto — repetition, rotation, and symmetry — to create new "Concretions" that continue his dialogue with space and form.'
                }
            },
            {
                type: 'sketch',
                sketchId: 'sacilotto-gen',
                caption: {
                    pt: 'Gerador de Concreção: Uma interpretação algorítmica dos ritmos de Sacilotto.',
                    en: 'Concretion Generator: An algorithmic interpretation of Sacilotto\'s rhythms.'
                }
            }
        ]
    };

    private ctx: CanvasRenderingContext2D | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private width = 0;
    private height = 0;
    private margin = 0.8;
    private seed = Math.random();

    private palette = [
        ["#000000", "#FFFFFF", "#CC2222"], // Black, White, Red
        ["#000000", "#FFFFFF", "#2222CC"], // Black, White, Blue
        ["#FFFFFF", "#000000", "#CCAA00"], // White, Black, Yellow
        ["#000000", "#FFFFFF", "#228822"], // Black, White, Green
        ["#FFFFFF", "#000000", "#000000"]  // High contrast BW
    ];

    setup(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize(canvas.width, canvas.height);

        canvas.addEventListener('click', this.onClick);

        this.draw();
    }

    private onClick = () => {
        this.seed = Math.random();
        this.draw();
    };

    resize(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.draw();
    }

    private draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;

        let s = this.seed;
        const rand = () => {
            s = Math.sin(s) * 10000;
            return s - Math.floor(s);
        };

        const currentPalette = this.palette[Math.floor(rand() * this.palette.length)];
        ctx.fillStyle = currentPalette[0];
        ctx.fillRect(0, 0, this.width, this.height);

        const size = Math.min(this.width, this.height) * 0.8;
        const marginX = (this.width - size) / 2;
        const marginY = (this.height - size) / 2;

        const cols = 4 + Math.floor(rand() * 8); // More cells for more complexity
        const cellSize = size / cols;

        const drawType = Math.floor(rand() * 6); // Pick a global pattern type for the whole composition

        ctx.save();
        ctx.translate(marginX, marginY);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < cols; j++) {
                this.drawCell(ctx, i * cellSize, j * cellSize, cellSize, i, j, cols, rand, currentPalette, drawType);
            }
        }

        ctx.restore();
    }

    private drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, col: number, row: number, total: number, rand: () => number, palette: string[], globalType: number) {
        ctx.save();
        ctx.translate(x + size / 2, y + size / 2);

        // Selection of pattern
        const type = globalType % 6;
        ctx.fillStyle = palette[1];

        switch (type) {
            case 0: // Original: Triangles
                ctx.rotate([0, Math.PI / 2, Math.PI, Math.PI * 1.5][Math.floor(rand() * 4)]);
                ctx.beginPath();
                ctx.moveTo(-size / 2, -size / 2);
                ctx.lineTo(size / 2, -size / 2);
                ctx.lineTo(-size / 2, size / 2);
                ctx.closePath();
                ctx.fill();
                break;
            case 1: // Original: Stripes
                ctx.rotate(rand() < 0.5 ? 0 : Math.PI / 2);
                const stripes = 4;
                const sWidth = size / (stripes * 2);
                for (let i = 0; i < stripes; i++) {
                    ctx.fillRect(-size / 2 + i * 2 * sWidth, -size / 2, sWidth, size);
                }
                break;
            case 2: // Original: Nested squares
                ctx.fillRect(-size / 2, -size / 2, size, size);
                ctx.fillStyle = palette[0];
                ctx.fillRect(-size / 4, -size / 4, size / 2, size / 2);
                ctx.fillStyle = palette[2];
                ctx.fillRect(-size / 8, -size / 8, size / 4, size / 4);
                break;
            case 3: // Original: Triangle + Arc
                ctx.rotate([0, Math.PI / 2, Math.PI, Math.PI * 1.5][Math.floor(rand() * 4)]);
                ctx.beginPath();
                ctx.moveTo(-size / 2, -size / 2);
                ctx.lineTo(size / 2, size / 2);
                ctx.lineTo(-size / 2, size / 2);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = palette[2];
                ctx.beginPath();
                ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 4: // NEW: Variable Dots (Audácia Concreta Style)
                const diag = (col + row) / (total * 2 - 2);
                const dotSize = size * 0.1 + size * 0.8 * diag;
                ctx.beginPath();
                ctx.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 5: // NEW: Rotated "Pac-Man" shapes (Audácia Concreta Style)
                const rotation = [0, Math.PI / 2, Math.PI, Math.PI * 1.5][Math.floor(rand() * 4)];
                ctx.rotate(rotation);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, size * 0.45, 0.2, 2 * Math.PI - 0.2);
                ctx.closePath();
                ctx.fill();
                break;
        }

        ctx.restore();
    }

    destroy() {
        this.canvas?.removeEventListener('click', this.onClick);
    }
}
