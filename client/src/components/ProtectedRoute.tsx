import { Navigate, Outlet } from "react-router-dom";
import { getToken, getUser } from "../utils/authStorage";

interface Props {
    allowedRoles: string[];
}

const ProtectedRoute = ({allowedRoles}: Props) => {
    const token = getToken();
    const user = getUser();

    if (!token && !user) {
        return <Navigate to="/auth/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        if (user.role === 'Admin') {
            return <Navigate to="/admin" replace />;
        }
        if (user.role === 'Partner') {
            return <Navigate to="/partner" replace />;
        }
        if (user.role === 'Buyer') {
            return <Navigate to="/" replace />;
        }
        return <Navigate to="/" replace />;
    }

  return <Outlet />;
}

export default ProtectedRoute