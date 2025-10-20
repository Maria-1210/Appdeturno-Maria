import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePage } from './home.page';
import { IonicModule } from '@ionic/angular';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), HomePage],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the home page', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate when goTo() is called', () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const page = new HomePage(routerSpy);
    page.goTo('/tabs/sucursal');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/sucursal']);
  });
});
