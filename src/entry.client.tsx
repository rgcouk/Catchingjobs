import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { HelmetProvider } from 'react-helmet-async';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_ZXZvbHZlZC1jYW1lbC01OS5jbGVyay5hY2NvdW50cy5kZXYk';

const rootElement = document.getElementById('root')!;

const app = (
  <StrictMode>
    <HelmetProvider>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <BrowserRouter>
          <App />
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </ClerkProvider>
    </HelmetProvider>
  </StrictMode>
);

if (rootElement.hasChildNodes() && rootElement.innerHTML.trim() !== '<!--app-html-->') {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
