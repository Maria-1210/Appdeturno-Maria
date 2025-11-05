import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [

      {
        path: 'health',
        loadComponent: () => import('./tabs/health/health.page').then(m => m.HealthPage)
      },
      {
        path: 'home',
        loadComponent: () => import('./tabs/home/home.page').then(m => m.HomePage)
      },

      {
        path: 'capture',
        loadComponent: () => import('./tabs/capture/capture.page').then(m => m.CapturePage)
      },
     {
        path: 'servicios',
        loadComponent: () => import('./tabs/servicios/servicios.page').then( m => m.ServiciosPage)
      },
      {
       path: 'mis-turnos',
       loadComponent: () => import('./tabs/mis-turnos/mis-turnos.page').then( m => m.MisTurnosPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./tabs/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: 'servicios',
        pathMatch: 'full'
      }
    ]
  },

];
