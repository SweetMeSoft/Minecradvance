import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },
  { 
    path: 'advancements', 
    loadComponent: () => import('./features/advancements/advancements.component').then(m => m.AdvancementsComponent) 
  },
  { 
    path: 'biomes', 
    loadComponent: () => import('./features/biomes/biomes.component').then(m => m.BiomesComponent) 
  },
  { 
    path: 'seed-manager', 
    loadComponent: () => import('./features/seed-manager/seed-manager.component').then(m => m.SeedManagerComponent) 
  },
  { path: '**', redirectTo: 'dashboard' }
];
