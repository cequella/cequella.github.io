import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtViewer } from './art-viewer';

describe('ArtViewer', () => {
  let component: ArtViewer;
  let fixture: ComponentFixture<ArtViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
