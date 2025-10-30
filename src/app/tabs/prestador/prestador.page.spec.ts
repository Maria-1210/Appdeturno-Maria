import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrestadorPage } from './prestador.page';

describe('PrestadorPage', () => {
  let component: PrestadorPage;
  let fixture: ComponentFixture<PrestadorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrestadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
