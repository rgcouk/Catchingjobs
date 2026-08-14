import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { HelmetProvider } from 'react-helmet-async';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import App from './App';
import { SSRDataProvider } from './context/SSRDataContext';
import './index.css';

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_ZXZvbHZlZC1jYW1lbC01OS5jbGVyay5hY2NvdW50cy5kZXYk';

// Read pre-rendered initial data from serialized script tag
let initialData = null;
const scriptEl = document.getElementById('__INITIAL_DATA__');
if (scriptEl && scriptEl.textContent) {
  try {
    initialData = JSON.parse(scriptEl.textContent);
  } catch (e) {
    console.error('Failed to parse __INITIAL_DATA__:', e);
  }
}

const rootElement = document.getElementById('root')!;

const app = (
  <StrictMode>
    <SSRDataProvider initialData={initialData}>
      <HelmetProvider>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          <BrowserRouter>
            <App />
            <Toaster position="top-center" richColors />
          </BrowserRouter>
        </ClerkProvider>
      </HelmetProvider>
    </SSRDataProvider>
  </StrictMode>
);

if (rootElement.hasChildNodes() && rootElement.innerHTML.trim() !== '<!--app-html-->') {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
