export interface SketchMetadata {
    id: string;
    title: { pt: string, en: string };
    description: { pt: string, en: string };
    image: string;
}

export interface Sketch {
    readonly metadata: SketchMetadata;
    setup(canvas: HTMLCanvasElement): void;
    destroy(): void;
    resize(width: number, height: number): void;
}
