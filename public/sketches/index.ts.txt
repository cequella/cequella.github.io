import { FlowFieldSketch } from './flow-field';
import { FractalTreeSketch } from './fractal-tree';
import { Sketch } from './types';

export const SKETCHES = [
    new FlowFieldSketch(),
    new FractalTreeSketch()
];

export function getSketchById(id: string): Sketch | undefined {
    // We create new instances to ensure state is fresh, 
    // though here we just return from the pre-instantiated list if we wanted static access.
    // To satisfy the user's request for easier maintenance, 
    // we use the metadata from these instances.
    if (id === 'flow-field') return new FlowFieldSketch();
    if (id === 'fractal-tree') return new FractalTreeSketch();
    return undefined;
}
