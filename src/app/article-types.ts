import { Sketch } from './sketches/types';

export interface ArticleContent {
    type: 'text' | 'image' | 'sketch' | 'heading';
    content?: { pt: string, en: string }; // For text, heading (HTML or plain)
    imageUrl?: string; // For image
    caption?: { pt: string, en: string }; // For image/sketch
    sketchId?: string; // For sketch
}

export interface ArticleMetadata {
    id: string;
    title: { pt: string, en: string };
    author: string;
    date: string;
    thumbnail: string;
    headerLayers?: { back: string, front: string, icons: string };
    sections: ArticleContent[];
}
