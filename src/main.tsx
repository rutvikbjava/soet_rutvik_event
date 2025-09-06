import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";
import App from "./App";


const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

if (!convexUrl) {
  console.error("VITE_CONVEX_URL is not set. Please check your environment variables.");
}

const convex = new ConvexReactClient(convexUrl);

// Register service worker for better caching on Vercel
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('New service worker version available');
        });
      })
      .catch((registrationError) => {
        console.warn('SW registration failed: ', registrationError);
        
        // Don't let service worker errors break the app
        // The app should work fine without the service worker
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <ConvexAuthProvider client={convex}>
        <App />
        <Analytics />
        <SpeedInsights />
      </ConvexAuthProvider>
    </BrowserRouter>
  </ErrorBoundary>,
);
