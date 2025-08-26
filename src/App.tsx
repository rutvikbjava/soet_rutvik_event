import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { AuthWrapper } from "./components/AuthWrapper";
import { ParticipantLandingPage } from "./components/ParticipantLandingPage";
import { SuperAdminLogin } from "./components/SuperAdminLogin";
import { SuperAdminDashboard } from "./components/SuperAdminDashboard";

export default function App() {
  const [viewMode, setViewMode] = useState<"participant" | "organizer">("participant");
  const [showSuperAdminLogin, setShowSuperAdminLogin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check for super admin access via URL parameter or keyboard shortcut
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'super') {
      console.log("Super admin URL parameter detected");
      setShowSuperAdminLogin(true);
    }

    // Secret keyboard shortcut: Ctrl+Shift+Alt+S
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'S') {
        e.preventDefault();
        console.log("Super admin keyboard shortcut activated");
        setShowSuperAdminLogin(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSuperAdminSuccess = () => {
    setIsSuperAdmin(true);
    setShowSuperAdminLogin(false);
  };

  const handleSuperAdminSignOut = () => {
    setIsSuperAdmin(false);
    setViewMode("participant");
  };

  // If super admin is authenticated, show super admin dashboard
  if (isSuperAdmin) {
    return (
      <main className="container max-w-2xl flex flex-col gap-8">
        <SuperAdminDashboard onSignOut={handleSuperAdminSignOut} />
        <Toaster position="bottom-right" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-blue via-dark-blue to-medium-blue relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%2247%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent-blue rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-electric-blue rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-neon-blue rounded-full animate-ping delay-500"></div>
      </div>



      <main className="relative z-10">
        {viewMode === "participant" ? (
          <ParticipantLandingPage onSwitchToOrganizer={() => setViewMode("organizer")} />
        ) : (
          <AuthWrapper />
        )}
      </main>

      {/* Super Admin Login Modal */}
      {showSuperAdminLogin && (
        <SuperAdminLogin
          onSuccess={handleSuperAdminSuccess}
          onCancel={() => setShowSuperAdminLogin(false)}
        />
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
    </div>
  );
}
