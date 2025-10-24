import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilePage } from './profile.page';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, IonicModule.forRoot()],
      declarations: [ProfilePage],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería activar y desactivar el modo edición', () => {
    component.editarPerfil();
    expect(component.editarActivo).toBeTrue();
    component.cancelarEdicion();
    expect(component.editarActivo).toBeFalse();
  });

  it('debería tener avatar por defecto', () => {
    expect(component.selectedAvatarPath).toContain('avatar-default.svg');
  });

  it('debería tener los campos principales definidos', () => {
    expect(component.nombre_usuario).toBeDefined();
    expect(component.email).toBeDefined();
    expect(component.ubicacion).toBeDefined();
    expect(component.dni).toBeDefined();
  });

  it('debería aceptar DNI solo numérico si se ingresa', () => {
    component.dni = '12345678';
    const dniValido = /^[0-9]{7,8}$/.test(component.dni);
    expect(dniValido).toBeTrue();

    component.dni = '12.345.678';
    const dniInvalido = /^[0-9]{7,8}$/.test(component.dni);
    expect(dniInvalido).toBeFalse();
  });
});
