import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleViewer } from './article-viewer';

describe('ArticleViewer', () => {
  let component: ArticleViewer;
  let fixture: ComponentFixture<ArticleViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
