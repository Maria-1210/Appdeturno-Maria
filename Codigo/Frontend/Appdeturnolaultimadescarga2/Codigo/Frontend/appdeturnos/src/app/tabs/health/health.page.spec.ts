import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HealthPage } from './health.page';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

describe('HealthPage', () => {
  let component: HealthPage;
  let fixture: ComponentFixture<HealthPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), CommonModule],
      declarations: [HealthPage]
    }).compileComponents();

    fixture = TestBed.createComponent(HealthPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

