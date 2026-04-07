import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ArtViewerComponent } from './art-viewer/art-viewer.component';
import { ArticleViewerComponent } from './article-viewer/article-viewer.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'art/:id', component: ArtViewerComponent },
    { path: 'article/:id', component: ArticleViewerComponent },
    { path: '**', redirectTo: '' }
];
