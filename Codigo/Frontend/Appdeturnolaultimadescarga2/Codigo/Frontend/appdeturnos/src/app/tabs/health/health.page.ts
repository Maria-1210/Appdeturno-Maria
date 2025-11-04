import { Component } from '@angular/core'; 
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './health.page.html',
  styleUrls: ['./health.page.scss'],
  
})
export class HealthPage {

  ngOnInit() {
  }

}
