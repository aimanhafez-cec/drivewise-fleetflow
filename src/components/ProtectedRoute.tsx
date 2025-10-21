import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Phase 2: Enhanced preview token detection
  // Check multiple possible token keys in both search and hash
  const PREVIEW_BYPASS_KEY = 'lovable_preview_bypass';
  const BYPASS_DURATION_MS = 60 * 60 * 1000; // 1 hour
  
  // Parse search params
  const searchParams = new URLSearchParams(location.search);
  
  // Parse hash params (e.g., #?__lovable_token=...)
  const hashSearch = location.hash.includes('?') ? location.hash.split('?')[1] : '';
  const hashParams = new URLSearchParams(hashSearch);
  
  // Check for any of the supported token keys
  const tokenKeys = ['__lovable_token', '__lovablePreview', '__lovable'];
  const hasLovableToken = tokenKeys.some(key => 
    searchParams.has(key) || hashParams.has(key)
  );
  
  // Session-based bypass: if token found, set expiry in sessionStorage
  React.useEffect(() => {
    if (hasLovableToken) {
      const expiryTime = Date.now() + BYPASS_DURATION_MS;
      sessionStorage.setItem(PREVIEW_BYPASS_KEY, expiryTime.toString());
    }
  }, [hasLovableToken]);
  
  // Check if bypass is still active
  const bypassExpiry = sessionStorage.getItem(PREVIEW_BYPASS_KEY);
  const bypassActive = bypassExpiry ? parseInt(bypassExpiry) > Date.now() : false;
  
  // Clear expired bypass
  if (bypassExpiry && !bypassActive) {
    sessionStorage.removeItem(PREVIEW_BYPASS_KEY);
  }
  
  const hasPreviewAccess = hasLovableToken || bypassActive;
  
  // Phase 3: Diagnostic logging
  console.debug('[ProtectedRoute]', {
    path: location.pathname,
    search: location.search,
    hash: location.hash,
    tokenFound: hasLovableToken,
    bypassActive,
    hasPreviewAccess,
    user: !!user
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Allow access if user is authenticated OR if preview access is granted
  if (!user && !hasPreviewAccess) {
    // Redirect to auth page with return URL
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;