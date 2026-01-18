import api from "../lib/axios";
import { type ApiResponse } from "./apiResponse.type";

export type Role = 'Buyer' | 'Partner' | 'Admin';

export interface AuthUser {
    id: number;
    username: string;
    fullname: string;
    photo_profile: string;
    phone: string;
    role: Role;
    email: string;
    token: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    username: string;
    fullname: string;
    phone: string;
    role?: Role;
    email: string;
    password: string;
    password_confirmation: string;
}

export const login = async (payload: LoginPayload): Promise<AuthUser> => {
    const res = await api.post<ApiResponse<AuthUser>>("/auth/login", payload);
    return res.data.data;
};

export const register = async (payload: RegisterPayload): Promise<AuthUser> => {
    const res = await api.post<ApiResponse<AuthUser>>("/auth/register", payload);
    return res.data.data;
};

export const me = async (): Promise<AuthUser> => {
    const res = await api.get<ApiResponse<AuthUser>>("/auth/me");
    return res.data.data;
}

export const logout = async (): Promise<{success: boolean; message: string}> => {
    const res = await api.post("/auth/logout");
    return res.data;
}
