import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Verificamos si existe un token de sesión en el localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}