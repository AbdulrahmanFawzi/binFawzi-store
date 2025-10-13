import { Routes } from '@angular/router';

export const routes: Routes = [
  // 🔐 Authentication Routes
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/components/login/login').then(m => m.LoginComponent),
    title: 'Login - BinFawzi Store'
  },
  
  // 🏠 Default redirect to login for now
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  
  // 🚫 Wildcard route (404 page) - should be last
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
