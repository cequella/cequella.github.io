import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  sketches = [
    {
      id: 'flow-field',
      title: 'Neon Flow Field',
      description: 'Thousands of particles following Perlin noise vectors in a fluid dance.',
      image: '/flow-field.png'
    },
    {
      id: 'fractal-tree',
      title: 'Recursive Blooms',
      description: 'Geometric patterns emerging from simple recursive rules.',
      image: '/fractal-tree.png'
    }
  ];
}
