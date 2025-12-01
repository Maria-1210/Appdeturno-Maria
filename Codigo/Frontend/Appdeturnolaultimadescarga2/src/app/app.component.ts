import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { PushNotificationsService } from './services/push-notifications.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [IonApp, IonRouterOutlet, RouterModule]
})
export class AppComponent implements OnInit {
  constructor(
    private pushNotifications: PushNotificationsService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Inicializar tema
    this.themeService.applyTheme();
    
    // Inicializar notificaciones push
    this.pushNotifications.initPushNotifications();
  }
}
