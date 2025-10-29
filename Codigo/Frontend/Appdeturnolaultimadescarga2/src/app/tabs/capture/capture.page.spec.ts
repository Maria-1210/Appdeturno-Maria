import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CapturePage } from './capture.page';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Simulamos un DatabaseService para que no intente conectarse realmente a Supabase
class MockDatabaseService {
  getAll = jasmine.createSpy('getAll').and.returnValue(Promise.resolve([]));
  insert = jasmine.createSpy('insert').and.returnValue(Promise.resolve());
  update = jasmine.createSpy('update').and.returnValue(Promise.resolve());
  delete = jasmine.createSpy('delete').and.returnValue(Promise.resolve());
}

describe('CapturePage', () => {
  let component: CapturePage;
  let fixture: ComponentFixture<CapturePage>;
  let mockDbService: MockDatabaseService;

  beforeEach(waitForAsync(() => {
    mockDbService = new MockDatabaseService();

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), CommonModule, FormsModule],
      declarations: [CapturePage],
      providers: [{ provide: MockDatabaseService, useValue: mockDbService }]
    }).compileComponents();

    fixture = TestBed.createComponent(CapturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('debería crearse la página correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar la lista de servicios', async () => {
    await component.cargarServicios();
    expect(mockDbService.getAll).toHaveBeenCalledWith('servicio');
  });

  it('debería agregar un nuevo servicio si los campos están completos', async () => {
    component.servicio = {
      nombre: 'Corte de Pelo',
      descripcion: 'Servicio completo',
      duracion_minutos: 30,
      precio: 1500
    };
    await component.agregarServicio();
    expect(mockDbService.insert).toHaveBeenCalledWith('servicio', component.servicio);
  });

  it('no debería agregar servicio si faltan campos', async () => {
    spyOn(window, 'alert');
    component.servicio = { nombre: '', duracion_minutos: null, precio: null };
    await component.agregarServicio();
    expect(window.alert).toHaveBeenCalled();
  });

  it('debería cancelar la edición correctamente', () => {
    component.isEditing = true;
    component.servicioEditandoId = 1;
    component.cancelarEdicion();
    expect(component.isEditing).toBeFalse();
    expect(component.servicioEditandoId).toBeNull();
  });
});
