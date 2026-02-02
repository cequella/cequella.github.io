export interface Sketch {
    setup(canvas: HTMLCanvasElement): void;
    destroy(): void;
    resize(width: number, height: number): void;
}
