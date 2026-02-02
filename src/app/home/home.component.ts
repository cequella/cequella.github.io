import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SKETCHES } from '../sketches';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  // Now fetching metadata directly from the sketch instances
  sketches = SKETCHES.map(s => s.metadata);
}
