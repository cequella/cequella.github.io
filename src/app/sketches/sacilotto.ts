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
        image: '/sacilotto-thumb.png'
    };

    static readonly article: ArticleMetadata = {
        id: 'sacilotto',
        title: {
            pt: 'Luiz Sacilotto: A Estrutura do Concreto',
            en: 'Luiz Sacilotto: The Structure of Concrete'
        },
        author: 'D.Çeqüella',
        date: '2026-02-02',
        thumbnail: '/sacilotto-thumb.png',
        sections: [
            {
                type: 'heading',
                content: 'Um Mestre do Concretismo'
            },
            {
                type: 'text',
                content: 'Luiz Sacilotto (1924–2003) foi um pintor, escultor e desenhista brasileiro, figura central do movimento concreto no Brasil. Sua obra é marcada pela precisão geométrica e pela repetição de módulos, criando ritmos visuais que desafiam a percepção.'
            },
            {
                type: 'image',
                imageUrl: '/sacilotto-concrecao.jpg',
                caption: {
                    pt: 'Concreção 7553 (1975) - Uma exploração de ritmos e cores.',
                    en: 'Concretion 7553 (1975) - An exploration of rhythms and colors.'
                }
            },
            {
                type: 'text',
                content: 'A série "Concreção" é talvez sua contribuição mais famosa, onde ele utiliza regras matemáticas simples para gerar composições complexas. Abaixo, você pode interagir com um gerador que segue os princípios de Sacilotto para criar composições inéditas baseadas em suas regras de simetria e progressão.'
            },
            {
                type: 'sketch',
                sketchId: 'sacilotto-gen',
                caption: {
                    pt: 'Gerador de Concreção: Clique no canvas para gerar uma nova composição.',
                    en: 'Concretion Generator: Click on the canvas to generate a new composition.'
                }
            }
        ]
    };

    private ctx: CanvasRenderingContext2D | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private width = 0;
    private height = 0;
    private seed = Math.random();

    private palette = [
        ["#000000", "#FFFFFF", "#CC2222"],
        ["#000000", "#FFFFFF", "#2222CC"],
        ["#000000", "#FFFFFF", "#CCAA00"],
        ["#000000", "#FFFFFF", "#228822"]
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

        const cols = 2 + Math.floor(rand() * 3);
        const cellSize = size / cols;

        ctx.save();
        ctx.translate(marginX, marginY);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < cols; j++) {
                this.drawCell(ctx, i * cellSize, j * cellSize, cellSize, rand, currentPalette);
            }
        }

        ctx.restore();
    }

    private drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rand: () => number, palette: string[]) {
        const type = Math.floor(rand() * 4);
        ctx.fillStyle = palette[1];

        ctx.save();
        ctx.translate(x + size / 2, y + size / 2);
        const rotations = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
        ctx.rotate(rotations[Math.floor(rand() * 4)]);

        switch (type) {
            case 0:
                ctx.beginPath();
                ctx.moveTo(-size / 2, -size / 2);
                ctx.lineTo(size / 2, -size / 2);
                ctx.lineTo(-size / 2, size / 2);
                ctx.closePath();
                ctx.fill();
                break;
            case 1:
                const stripes = 4;
                const sWidth = size / (stripes * 2);
                for (let i = 0; i < stripes; i++) {
                    ctx.fillRect(-size / 2 + i * 2 * sWidth, -size / 2, sWidth, size);
                }
                break;
            case 2:
                ctx.fillRect(-size / 2, -size / 2, size, size);
                ctx.fillStyle = palette[0];
                ctx.fillRect(-size / 4, -size / 4, size / 2, size / 2);
                ctx.fillStyle = palette[2];
                ctx.fillRect(-size / 8, -size / 8, size / 4, size / 4);
                break;
            case 3:
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
        }

        ctx.restore();
    }

    destroy() {
        this.canvas?.removeEventListener('click', this.onClick);
    }
}
