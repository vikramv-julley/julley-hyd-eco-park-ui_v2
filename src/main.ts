import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Import PrimeNG v20 Aura theme
import '@primeuix/themes/aura';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
