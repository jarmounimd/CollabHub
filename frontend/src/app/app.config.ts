import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { CreateProjectDialogComponent } from './pages/projects/create-project-dialog/create-project-dialog.component';
import { ConfirmDialogComponent } from './pages/projects/project-details/confirm-dialog/confirm-dialog.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimations(),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    {
      provide: 'DIALOG_COMPONENTS',
      useValue: [CreateProjectDialogComponent, ConfirmDialogComponent],
    },
  ],
};
