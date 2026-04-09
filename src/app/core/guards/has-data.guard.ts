import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ProgressStateService } from '../services/progress-state.service';

export const hasDataGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const progressState = inject(ProgressStateService);

  // If trying to access welcome page
  if (state.url === '/welcome') {
    // If they already have data, skip welcome and go to dashboard
    if (progressState.isLoaded() || progressState.hasSavedData()) {
      return router.parseUrl('/dashboard');
    }
    return true;
  }

  // If trying to access any other page (like dashboard, biomes, etc.)
  // and they DON'T have data, redirect to welcome
  if (!progressState.isLoaded() && !progressState.hasSavedData()) {
    return router.parseUrl('/welcome');
  }

  return true;
};
