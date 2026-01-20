import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import Achievements from "./pages/Achievements";
import { useEffect } from "react";
import { applyColorPalette, getPaletteById } from "./lib/colorPalettes";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return <Component />;
}

function Router() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path={"/"} component={user ? () => <ProtectedRoute component={Home} /> : Landing} />
      <Route path={"/chat"} component={() => <ProtectedRoute component={Home} />} />
      <Route path={"/perfil"} component={() => <ProtectedRoute component={Profile} />} />
      <Route path={"/analytics"} component={() => <ProtectedRoute component={Analytics} />} />
      <Route path={"/logros"} component={() => <ProtectedRoute component={Achievements} />} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  // Apply default color palette on mount
  useEffect(() => {
    const savedPaletteId = localStorage.getItem('selectedPalette');
    const paletteId = savedPaletteId || 'beige-cream';
    const palette = getPaletteById(paletteId);
    if (palette) {
      applyColorPalette(palette);
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
