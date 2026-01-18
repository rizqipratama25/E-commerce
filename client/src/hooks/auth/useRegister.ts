import { useMutation } from "@tanstack/react-query"
import { register, type RegisterPayload } from "../../services/auth.service"
import { saveAuth } from "../../utils/authStorage";
import api from "../../lib/axios";

export const useRegister = () => {
    return useMutation({
        mutationFn: (payload: RegisterPayload) => register(payload),
        onSuccess: (res) => {
            const user = res;
            
            // simpan token user
            saveAuth(user);

            // set header default axios
            api.defaults.headers.common.Authorization = `Bearer ${user.token}`;
        }
    })
}