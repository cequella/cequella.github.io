import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit, inject, ViewEncapsulation, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Sketch } from '../sketches/types';
import { getSketchById } from '../sketches';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';

// Register language
hljs.registerLanguage('typescript', typescript);

@Component({
  selector: 'app-art-viewer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './art-viewer.html',
  styleUrl: './art-viewer.css',
  encapsulation: ViewEncapsulation.None
})
export class ArtViewerComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private http = inject(HttpClient);

  currentSketch: Sketch | null = null;
  sketchId = signal<string>('');
  currentInfo = signal({ title: '', desc: '' });

  showingCode = signal(false);
  sourceCode = signal('');
  highlightedCode = signal('');

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const newId = params['id'];
      if (newId !== this.sketchId()) {
        this.sketchId.set(newId);
        this.sourceCode.set('');
        this.highlightedCode.set('');
        this.showingCode.set(false);

        if (this.canvasRef) {
          this.loadSketch();
        }
      }
    });
  }

  ngAfterViewInit() {
    window.addEventListener('resize', this.onResize);
    if (this.sketchId() && !this.currentSketch) {
      this.loadSketch();
    }
  }

  loadSketch() {
    if (this.currentSketch) {
      this.currentSketch.destroy();
      this.currentSketch = null;
    }

    const sketch = getSketchById(this.sketchId());
    if (sketch) {
      this.currentSketch = sketch;
      this.currentInfo.set({
        title: sketch.metadata.title,
        desc: sketch.metadata.description
      });

      setTimeout(() => {
        if (this.canvasRef) {
          const canvas = this.canvasRef.nativeElement;
          this.resizeCanvas();
          sketch.setup(canvas);
        }
      }, 0);
    } else {
      this.currentInfo.set({ title: 'Unknown Sketch', desc: '' });
    }
  }

  toggleCode() {
    const isShowing = this.showingCode();
    this.showingCode.set(!isShowing);
    if (!isShowing && !this.sourceCode()) {
      this.fetchSource();
    }
  }

  fetchSource() {
    const srcPath = `/sketches/${this.sketchId()}.ts.txt`;
    this.http.get(srcPath, { responseType: 'text' }).subscribe({
      next: (code) => {
        this.sourceCode.set(code);
        const highlighted = hljs.highlight(code, { language: 'typescript' }).value;
        this.highlightedCode.set(highlighted);
      },
      error: (err) => {
        console.error('Failed to fetch source:', err);
        const msg = 'Failed to load source code.';
        this.sourceCode.set(msg);
        this.highlightedCode.set(msg);
      }
    });
  }

  resizeCanvas() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  onResize = () => {
    this.resizeCanvas();
    if (this.currentSketch && this.canvasRef) {
      this.currentSketch.resize(this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    }
  }

  ngOnDestroy() {
    if (this.currentSketch) {
      this.currentSketch.destroy();
    }
    window.removeEventListener('resize', this.onResize);
  }
}
