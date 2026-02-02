import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SKETCHES } from '../sketches';
import { LanguageService } from '../language.service';
import { SketchMetadata } from '../sketches/types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  public readonly langService = inject(LanguageService);
  sketches: SketchMetadata[] = SKETCHES.map(s => s.metadata);
}
