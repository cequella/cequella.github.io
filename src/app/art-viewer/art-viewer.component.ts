import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Sketch } from '../sketches/types';
import { FlowFieldSketch } from '../sketches/flow-field';
import { FractalTreeSketch } from '../sketches/fractal-tree';

@Component({
  selector: 'app-art-viewer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './art-viewer.html',
  styleUrl: './art-viewer.css'
})
export class ArtViewerComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  currentSketch: Sketch | null = null;
  sketchId: string = '';

  sketchInfo: Record<string, { title: string, desc: string }> = {
    'flow-field': {
      title: 'Neon Flow Field',
      desc: 'Simulated particles interacting with a 3D Simplex noise vector field. The z-axis of the noise moves over time, creating shifting patterns.'
    },
    'fractal-tree': {
      title: 'Recursive Blooms',
      desc: 'A visualization of a recursive branching fractals. The branching angle oscillates sinusoidally over time, mimicking a "breathing" or "blooming" motion.'
    }
  };

  currentInfo = { title: '', desc: '' };

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.sketchId = params['id'];
      this.currentInfo = this.sketchInfo[this.sketchId] || { title: 'Unknown Sketch', desc: '' };
      // If the view is already initialized, reload the sketch can happen here, 
      // or in the setter if we used logic there. 
      // For simplicity, we just trigger load if canvas is ready.
      if (this.canvasRef) {
        this.loadSketch();
      }
    });
  }

  ngAfterViewInit() {
    window.addEventListener('resize', this.onResize);
    // Determine initial load
    if (this.sketchId) {
      this.loadSketch();
    }
  }

  loadSketch() {
    if (this.currentSketch) {
      this.currentSketch.destroy();
    }

    const canvas = this.canvasRef.nativeElement;
    // Set canvas to full window size (ignoring parent layout flow, effectively fullscreen)
    // Note: We might want headers to be overlayed.
    this.resizeCanvas();

    if (this.sketchId === 'flow-field') {
      this.currentSketch = new FlowFieldSketch();
    } else if (this.sketchId === 'fractal-tree') {
      this.currentSketch = new FractalTreeSketch();
    }

    if (this.currentSketch) {
      this.currentSketch.setup(canvas);
    }
  }

  resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  onResize = () => {
    this.resizeCanvas();
    if (this.currentSketch && this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      this.currentSketch.resize(canvas.width, canvas.height);
    }
  }

  ngOnDestroy() {
    if (this.currentSketch) {
      this.currentSketch.destroy();
    }
    window.removeEventListener('resize', this.onResize);
  }
}
