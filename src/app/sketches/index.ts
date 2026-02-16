import { FlowFieldSketch } from './flow-field';
import { FractalTreeSketch } from './fractal-tree';
import { PseudoangleSketch } from './pseudoangle';
import { SutherlandHodgmanSketch } from './sutherland-hodgman';
import { DijkstraSketch } from './dijkstra';
import { Sketch } from './types';

export const SKETCHES = [
    new FlowFieldSketch(),
    new FractalTreeSketch(),
    new PseudoangleSketch(),
    new SutherlandHodgmanSketch(),
    new DijkstraSketch()
];

export function getSketchById(id: string): Sketch | undefined {
    if (id === 'flow-field') return new FlowFieldSketch();
    if (id === 'fractal-tree') return new FractalTreeSketch();
    if (id === 'pseudoangle') return new PseudoangleSketch();
    if (id === 'sutherland-hodgman') return new SutherlandHodgmanSketch();
    if (id === 'dijkstra') return new DijkstraSketch();
    return undefined;
}
