import { useMutation } from "@tanstack/react-query"
import { logout } from "../../services/auth.service"
import { clearAuth } from "../../utils/authStorage"
import api from "../../lib/axios"

export const useLogout = () => {
    return useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            clearAuth();
            delete api.defaults.headers.common.Authorization;
        }
    })
}