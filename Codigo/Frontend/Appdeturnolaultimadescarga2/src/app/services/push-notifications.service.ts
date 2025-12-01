import { Injectable } from '@angular/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {
  constructor(private platform: Platform) {}

  async initPushNotifications(): Promise<void> {
    // Solo en dispositivos móviles (no web)
    if (!this.platform.is('capacitor')) {
      console.log('Push notifications solo disponibles en dispositivos móviles');
      return;
    }

    // Solicitar permisos
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('Permisos de notificaciones denegados');
      return;
    }

    // Registrar para notificaciones push
    await PushNotifications.register();

    // Listener cuando se recibe un token (para FCM/APNS)
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      // Aquí deberías enviar el token a tu backend
      this.sendTokenToServer(token.value);
    });

    // Listener cuando falla el registro
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Listener cuando se recibe una notificación mientras la app está abierta
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received: ' + JSON.stringify(notification));
      // Aquí puedes mostrar una alerta o toast personalizado
    });

    // Listener cuando el usuario toca una notificación
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
      // Aquí puedes navegar a una página específica según el contenido de la notificación
      const data = notification.notification.data;
      if (data.page) {
        // Navegar a la página especificada
        console.log('Navegar a:', data.page);
      }
    });
  }

  private sendTokenToServer(token: string): void {
    // TODO: Implementar llamada a tu backend para guardar el token
    // Por ejemplo: this.http.post('https://tu-api.com/save-token', { token, userId: ... })
    console.log('Token a enviar al servidor:', token);
  }

  async getDeliveredNotifications(): Promise<any> {
    const notificationList = await PushNotifications.getDeliveredNotifications();
    console.log('Notificaciones entregadas:', notificationList);
    return notificationList;
  }

  async removeAllNotifications(): Promise<void> {
    await PushNotifications.removeAllDeliveredNotifications();
  }
}
