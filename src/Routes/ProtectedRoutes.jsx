import { useAuth } from "../Context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { User, fetchedUser } = useAuth();

  if (!fetchedUser) return <div className="text-white text-center py-20">Loading...</div>;

  return User ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
