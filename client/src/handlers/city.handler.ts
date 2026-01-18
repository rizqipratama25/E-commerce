import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import toast from "react-hot-toast";
import type { City, UpdateCityPayload } from "../services/city.service";

export type CityFormState = {
    name: string;
    province_id: string;
}

// Form change
export const buildHandleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, setForm: Dispatch<SetStateAction<CityFormState>>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
}

// Add submit
export const buildHandleSubmitNewCity =
    (
        form: CityFormState,
        createCity: (
            payload: {
                name: string;
                province_id: number;
            },
            options?: {
                onSuccess?: () => void;
                onError?: (error: any) => void;
            }
        ) => void,
        helpers: {
            setShowAddModal: Dispatch<SetStateAction<boolean>>;
            resetForm: () => void;
        }
    ) => (e: FormEvent) => {
        e.preventDefault();

        createCity(
            {
                name: form.name,
                province_id: Number(form.province_id),
            },
            {
                onSuccess: () => {
                    toast.success("Kota berhasil ditambahkan!");
                    helpers.setShowAddModal(false);
                    helpers.resetForm();
                },
                onError: (error: any) => {
                    const message = error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat menambahkan kota.";

                    toast.error(message);
                }
            },
        )
    }

// Edit submit
export const buildHandleSubmitEditCity =
    (
        editingId: number | null,
        form: CityFormState,
        updateCity: (
            payload: {
                id: number;
                data: UpdateCityPayload;
            },
            options?: {
                onSuccess?: () => void;
                onError?: (error: any) => void;
            }
        ) => void,
        helpers: {
            setShowEditModal: Dispatch<SetStateAction<boolean>>;
            setEditingId: Dispatch<SetStateAction<number | null>>;
            resetForm: () => void;
        }
    ) => (e: FormEvent) => {
        e.preventDefault();
        if (!editingId) return;

        updateCity(
            {
                id: editingId,
                data: {
                    name: form.name,
                    province_id: Number(form.province_id),
                },
            },
            {
                onSuccess: () => {
                    toast.success("Kota berhasil diupdate!");
                    helpers.setShowEditModal(false);
                    helpers.setEditingId(null);
                    helpers.resetForm();
                },
                onError: (error: any) => {
                    const message = error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat mengupdate kota.";

                    toast.error(message);
                }
            },
        )
    }

// Delete
export const buildHandleDeleteCity = (deleteCity: (id: number, options?: any) => void) => (city: City) => {
    const toastId = toast.loading("Menghapus kota...");

    deleteCity(city.id, {
        onSuccess: () => {
            toast.success("Kota berhasil dihapus!", { id: toastId });
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat menghapus kota.", { id: toastId }
            )
        }
    })
}