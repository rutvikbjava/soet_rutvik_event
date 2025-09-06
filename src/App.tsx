import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { SimpleVideoBackground } from "./components/SimpleVideoBackground";
// Alternative: Use AnimatedGalaxyBackground for more sophisticated effects
// import { AnimatedGalaxyBackground } from "./components/AnimatedGalaxyBackground";

// Lazy load components for better performance
const AuthWrapper = lazy(() => import("./components/AuthWrapper").then(module => ({ default: module.AuthWrapper })));
const ParticipantLandingPage = lazy(() => import("./components/ParticipantLandingPage").then(module => ({ default: module.ParticipantLandingPage })));
const SuperAdminLogin = lazy(() => import("./components/SuperAdminLogin").then(module => ({ default: module.SuperAdminLogin })));
const SuperAdminDashboard = lazy(() => import("./components/SuperAdminDashboard").then(module => ({ default: module.SuperAdminDashboard })));
const EventPage = lazy(() => import("./components/EventPage").then(module => ({ default: module.EventPage })));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-supernova-gold"></div>
  </div>
);

// Watermark Component
const Watermark = () => (
  <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
    <p className="text-xs text-white/30 font-light tracking-wide select-none">
      rutvik burra devs
    </p>
  </div>
);

export default function App() {
  const [viewMode, setViewMode] = useState<"participant" | "organizer">("participant");
  const [showSuperAdminLogin, setShowSuperAdminLogin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check for super admin access via URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'super') {
      setShowSuperAdminLogin(true);
    }
  }, []);

  const handleSuperAdminSuccess = () => {
    setIsSuperAdmin(true);
    setShowSuperAdminLogin(false);
  };

  const handleSuperAdminSignOut = () => {
    setIsSuperAdmin(false);
    setViewMode("participant");
  };

  // If super admin is authenticated, show super admin dashboard (NO video background)
  if (isSuperAdmin) {
    return (
      <>
        <Suspense fallback={<LoadingSpinner />}>
          <SuperAdminDashboard onSignOut={handleSuperAdminSignOut} />
        </Suspense>
        <Toaster position="bottom-right" />
        <Watermark />
      </>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen relative overflow-hidden">
            <SimpleVideoBackground />
            <main className="relative z-10">
              <Suspense fallback={<LoadingSpinner />}>
                {viewMode === "participant" ? (
                  <ParticipantLandingPage onSwitchToOrganizer={() => setViewMode("organizer")} />
                ) : (
                  <AuthWrapper />
                )}
              </Suspense>
            </main>

            {/* Super Admin Login Modal */}
            {showSuperAdminLogin && (
              <Suspense fallback={<LoadingSpinner />}>
                <SuperAdminLogin
                  onSuccess={handleSuperAdminSuccess}
                  onCancel={() => setShowSuperAdminLogin(false)}
                />
              </Suspense>
            )}

            <Toaster
              theme="dark"
              toastOptions={{
                style: {
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  color: '#F1F5F9',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)'
                }
              }}
            />

            {/* Watermark */}
            <Watermark />
          </div>
        }
      />
      <Route path="/events/:eventId" element={
        <div className="min-h-screen relative overflow-hidden">
          <SimpleVideoBackground />
          <main className="relative z-10">
            <Suspense fallback={<LoadingSpinner />}>
              <EventPage />
            </Suspense>
          </main>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: '#F1F5F9',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)'
              }
            }}
          />
          <Watermark />
        </div>
      } />
    </Routes>
  );
}
