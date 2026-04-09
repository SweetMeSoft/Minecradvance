import { Routes } from '@angular/router';
import { hasDataGuard } from './core/guards/has-data.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  {
    path: 'welcome',
    canActivate: [hasDataGuard],
    loadComponent: () => import('./features/welcome/welcome').then(m => m.WelcomeComponent)
  },
  { 
    path: 'dashboard', 
    canActivate: [hasDataGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },
  { 
    path: 'advancements', 
    canActivate: [hasDataGuard],
    loadComponent: () => import('./features/advancements/advancements.component').then(m => m.AdvancementsComponent) 
  },
  { 
    path: 'biomes', 
    canActivate: [hasDataGuard],
    loadComponent: () => import('./features/biomes/biomes.component').then(m => m.BiomesComponent) 
  },
  { 
    path: 'seed-manager', 
    canActivate: [hasDataGuard],
    loadComponent: () => import('./features/seed-manager/seed-manager.component').then(m => m.SeedManagerComponent) 
  },
  { 
    path: 'checklist/:id', 
    canActivate: [hasDataGuard],
    loadComponent: () => import('./features/checklist/checklist.component').then(m => m.ChecklistComponent) 
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then(m => m.AboutComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
