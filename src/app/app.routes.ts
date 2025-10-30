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
        path: 'agenda',
        loadComponent: () => import('./tabs/agenda/agenda.page').then(m => m.AgendaPage)
      },
      {
        path: 'sucursal',
        loadComponent: () => import('./tabs/sucursal/sucursal.page').then(m => m.SucursalPage)
      },
      {
        path: 'prestador',
        loadComponent: () => import('./tabs/prestador/prestador.page').then(m => m.PrestadorPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./tabs/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];
