import { useMutation } from "@tanstack/react-query"
import { login, type LoginPayload } from "../../services/auth.service"
import { saveAuth } from "../../utils/authStorage";
import api from "../../lib/axios";

export const useLogin = () => {
    return useMutation({
        mutationFn: (payload: LoginPayload) => login(payload),
        onSuccess: (res) => {
            const user = res;
            
            // simpan token user
            saveAuth(user);

            // set header default axios
            api.defaults.headers.common.Authorization = `Bearer ${user.token}`;
        }
    })
}