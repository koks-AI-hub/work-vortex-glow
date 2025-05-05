
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Hook to protect routes for specific roles and redirect if needed
export function useAuthRedirect(
  requiredRole?: 'employee' | 'company' | null,
  redirectPath: string = '/login'
) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only run this check once auth state is loaded
    if (!isLoading) {
      // If user is not logged in but route requires authentication
      if (!user && requiredRole !== null) {
        navigate(redirectPath);
        return;
      }

      // If user is logged in but has wrong role
      if (user && requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard
        const dashPath = user.role === 'employee' ? '/employee/dashboard' : '/company/dashboard';
        navigate(dashPath);
        return;
      }
    }
  }, [user, isLoading, requiredRole, redirectPath, navigate]);

  return { isLoading, user };
}
