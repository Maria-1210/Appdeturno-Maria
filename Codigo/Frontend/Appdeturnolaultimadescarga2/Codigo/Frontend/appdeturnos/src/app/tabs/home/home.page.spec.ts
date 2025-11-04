

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HomePage } from './home.page';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// IMPORTANTE: Se importa la variable supabase para poder espiar su método 'from'
import { supabase } from '../../supabase'; 

// ===============================================
// 1. DEFINICIÓN DE MOCKS (Objetos Espía)
// Se declaran las variables globales que contendrán los mocks de Supabase
// ===============================================
let supabaseQueryMock: jasmine.SpyObj<any>;
let supabaseClientMock: jasmine.SpyObj<any>;


describe('HomePage (Servicios CRUD)', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(waitForAsync(() => {
    
    // --- CREACIÓN DEL MOCK DE CONSULTA (Query Builder) ---
    // Simula los métodos encadenados que usa el componente: .select().insert().delete().update().eq().order()
    supabaseQueryMock = jasmine.createSpyObj('QueryBuilder', [
        'select', 'insert', 'delete', 'update', 'eq', 'order'
    ]);
    
    // Configurar los métodos terminales para que devuelvan promesas simuladas
    supabaseQueryMock.select.and.returnValue(Promise.resolve({ data: [], error: null }));
    supabaseQueryMock.insert.and.returnValue(Promise.resolve({ error: null }));
    supabaseQueryMock.delete.and.returnValue(Promise.resolve({ error: null }));
    supabaseQueryMock.update.and.returnValue(Promise.resolve({ error: null }));
    
    // Los métodos encadenados deben devolver el propio mock para que la cadena funcione
    supabaseQueryMock.eq.and.returnValue(supabaseQueryMock);
    supabaseQueryMock.order.and.returnValue(supabaseQueryMock);


    // --- CREACIÓN DEL MOCK DEL CLIENTE PRINCIPAL ---
    supabaseClientMock = jasmine.createSpyObj('SupabaseClient', ['from']);
    
    // Configurar 'from' para que devuelva el mock de consulta (la cadena)
    supabaseClientMock.from.and.returnValue(supabaseQueryMock);


    // ===============================================
    // 2. ESPIONAJE (SPY) DE LA FUNCIÓN 'FROM'
    // Reemplaza la función 'from' del objeto importado con la función del mock.
    // ===============================================
    spyOn(supabase, 'from').and.callFake(supabaseClientMock.from);

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), CommonModule, FormsModule, HomePage], 
      providers: [] 
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    
    // CORRECCIÓN FINAL: Usamos 'async () => {}' para que el spy coincida con la firma async del método original
    spyOn(component, 'obtenerServicios').and.callFake(async () => {}); 
    
    fixture.detectChanges(); // Esto dispara ngOnInit
  }));

  // ===============================================
  // PRUEBAS DE ESTADO
  // ===============================================

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar nuevoServicio con valores por defecto', () => {
    expect(component.nuevoServicio).toEqual({
      nombre: '',
      descripcion: '',
      precio: 0.00,
      duracion_min: 0
    });
  });

  it('debería llamar a obtenerServicios en la inicialización', () => {
      expect(component.obtenerServicios).toHaveBeenCalledTimes(1);
  });
  
  // ===============================================
  // PRUEBAS CRUD
  // ===============================================

  it('debería llamar a insert, limpiar formulario y refrescar lista al agregar', async () => {
    component.nuevoServicio.nombre = 'Test Service';
    component.nuevoServicio.precio = 10;
    
    await component.agregarServicio();
    
    expect(supabaseClientMock.from).toHaveBeenCalledWith('servicio');
    expect(supabaseQueryMock.insert).toHaveBeenCalled();
    expect(component.obtenerServicios).toHaveBeenCalledTimes(2); 
    expect(component.nuevoServicio.nombre).toEqual('');
  });
  
  it('debería llamar a delete al eliminar un servicio', async () => {
    const ID_A_ELIMINAR = 99;
    await component.eliminarServicio(ID_A_ELIMINAR);
    
    expect(supabaseClientMock.from).toHaveBeenCalledWith('servicio');
    expect(supabaseQueryMock.delete).toHaveBeenCalled();
    expect(supabaseQueryMock.eq).toHaveBeenCalledWith('id_servicio', ID_A_ELIMINAR);
  });
  
  it('debería llamar a update y salir del modo edición al guardar', async () => {
    component.editarServicio({ id_servicio: 5, nombre: 'Viejo', precio: 10 });

    await component.guardarEdicion();
    
    expect(supabaseQueryMock.update).toHaveBeenCalled();
    expect(component.editando).toBeFalse();
    expect(component.obtenerServicios).toHaveBeenCalledTimes(2);
  });
});