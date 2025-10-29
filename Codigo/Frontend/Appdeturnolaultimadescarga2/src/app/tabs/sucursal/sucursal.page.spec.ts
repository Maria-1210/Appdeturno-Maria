import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SucursalPage } from './sucursal.page';

describe('SucursalPage', () => {
  let component: SucursalPage;
  let fixture: ComponentFixture<SucursalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SucursalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
