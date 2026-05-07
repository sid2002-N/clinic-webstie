import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to={role === 'superadmin' ? '/admin/overview' : '/dashboard/overview'} replace />;
  }
  return <>{children}</>;
}
