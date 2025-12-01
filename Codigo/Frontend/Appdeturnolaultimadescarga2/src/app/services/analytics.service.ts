import { Injectable } from '@angular/core';
import { supabase } from '../supabase';

export interface AnalyticsEvent {
  event_name: string;
  event_data?: any;
  user_id?: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private enabled = true;

  constructor() {}

  // Track page view
  async trackPageView(pageName: string, additionalData?: any) {
    await this.trackEvent('page_view', {
      page: pageName,
      ...additionalData
    });
  }

  // Track custom event
  async trackEvent(eventName: string, eventData?: any) {
    if (!this.enabled) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const event: AnalyticsEvent = {
        event_name: eventName,
        event_data: eventData,
        user_id: user?.id,
        timestamp: new Date().toISOString()
      };

      // Log to console in development
      if (!this.isProduction()) {
        console.log('📊 Analytics Event:', event);
      }

      // Guardar en Supabase (opcional, si tienes tabla analytics)
      // await supabase.from('analytics_events').insert([event]);

      // También puedes enviar a Google Analytics, Mixpanel, etc.
      this.sendToGoogleAnalytics(eventName, eventData);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Eventos específicos
  async trackTurnoCreated(turnoData: any) {
    await this.trackEvent('turno_created', turnoData);
  }

  async trackComentarioCreated(comentarioData: any) {
    await this.trackEvent('comentario_created', comentarioData);
  }

  // Alias para compatibilidad
  async logEvent(eventName: string, eventData?: any) {
    await this.trackEvent(eventName, eventData);
  }

  async trackServicioCreated(servicioData: any) {
    await this.trackEvent('servicio_created', servicioData);
  }

  async trackLogin(method: string = 'email') {
    await this.trackEvent('user_login', { method });
  }

  async trackLogout() {
    await this.trackEvent('user_logout');
  }

  async trackError(errorMessage: string, context?: any) {
    await this.trackEvent('error_occurred', {
      error: errorMessage,
      context
    });
  }

  // Deshabilitar/habilitar analytics
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private isProduction(): boolean {
    return false; // Cambiar según environment
  }

  private sendToGoogleAnalytics(eventName: string, eventData?: any) {
    // Si usas Google Analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', eventName, eventData);
    }
  }
}
