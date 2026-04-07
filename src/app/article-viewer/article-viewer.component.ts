import { Component, ElementRef, OnInit, OnDestroy, ViewChildren, QueryList, inject, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ARTICLES } from '../articles';
import { ArticleMetadata } from '../article-types';
import { getSketchById } from '../sketches';
import { Sketch } from '../sketches/types';
import { LanguageService } from '../language.service';
import { HeaderCanvas } from './header-canvas';

@Component({
    selector: 'app-article-viewer',
    standalone: true,
    imports: [CommonModule, RouterLink, DatePipe],
    templateUrl: './article-viewer.html',
    styleUrl: './article-viewer.css'
})
export class ArticleViewerComponent implements OnInit, OnDestroy, AfterViewInit {
    private route = inject(ActivatedRoute);
    public langService = inject(LanguageService);

    article: ArticleMetadata | null = null;
    private activeSketches: Map<string, { sketch: Sketch, canvas: HTMLCanvasElement }> = new Map();
    private headerCanvas: HeaderCanvas | null = null;

    @ViewChildren('canvas') canvasRefs!: QueryList<ElementRef<HTMLCanvasElement>>;
    @ViewChildren('headerCanvas') headerCanvasRef!: QueryList<ElementRef<HTMLCanvasElement>>;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        this.article = ARTICLES.find(a => a.id === id) || null;
    }

    ngAfterViewInit() {
        if (this.canvasRefs) {
            this.canvasRefs.changes.subscribe(() => this.initAllSketches());
            this.initAllSketches();
        }

        if (this.headerCanvasRef) {
            this.headerCanvasRef.changes.subscribe(() => this.initHeaderCanvas());
            this.initHeaderCanvas();
        }
    }

    private initHeaderCanvas() {
        const canvas = this.headerCanvasRef.first?.nativeElement;
        if (canvas && this.article?.headerLayers) {
            this.headerCanvas = new HeaderCanvas();
            const rect = canvas.parentElement?.getBoundingClientRect();
            if (rect) {
                this.headerCanvas.resize(rect.width, rect.width * 0.5625);
            }
            this.headerCanvas.setup(canvas, this.article.headerLayers);
        }
    }

    private initAllSketches() {
        if (!this.article || !this.canvasRefs) return;

        this.canvasRefs.forEach((ref, index) => {
            const sketchSections = this.article?.sections.filter(s => s.type === 'sketch') || [];
            const section = sketchSections[index];

            if (section && section.sketchId && !this.activeSketches.has(section.sketchId)) {
                this.initSketch(section.sketchId, ref.nativeElement);
            }
        });
    }

    ngOnDestroy() {
        this.activeSketches.forEach(s => s.sketch.destroy());
        this.activeSketches.clear();
        this.headerCanvas?.destroy();
    }

    @HostListener('window:resize')
    onResize() {
        this.activeSketches.forEach(s => {
            const rect = s.canvas.parentElement?.getBoundingClientRect();
            if (rect) {
                s.canvas.width = rect.width;
                s.canvas.height = rect.width * 0.75;
                s.sketch.resize(s.canvas.width, s.canvas.height);
            }
        });

        if (this.headerCanvas) {
            const rect = this.headerCanvasRef.first?.nativeElement.parentElement?.getBoundingClientRect();
            if (rect) {
                this.headerCanvas.resize(rect.width, rect.width * 0.5625);
            }
        }
    }

    private initSketch(sketchId: string, canvas: HTMLCanvasElement) {
        const sketch = getSketchById(sketchId);
        if (sketch) {
            const rect = canvas.parentElement?.getBoundingClientRect();
            if (rect) {
                canvas.width = rect.width;
                canvas.height = rect.width * 0.75;
            }
            sketch.setup(canvas);
            this.activeSketches.set(sketchId, { sketch, canvas });
        }
    }
}
