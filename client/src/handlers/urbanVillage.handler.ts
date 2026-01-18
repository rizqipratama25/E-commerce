import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";
import type { CreateUrbanVillagePayload, UpdateUrbanVillagePayload } from "../services/urbanVillage.service";

export interface UrbanVillageFormState {
    name: string;
    post_code: string;
    province_id: string;
    city_id: string;
    district_id: string;
}

export const buildHandleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, setForm: Dispatch<SetStateAction<UrbanVillageFormState>>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
}

export const buildHandleSubmitNewUrbanVillage =
    (
        form: UrbanVillageFormState,
        createUrbanVillage:
            (
                payload: CreateUrbanVillagePayload,
                options?: {
                    onSuccess?: () => void;
                    onError?: (error: any) => void;
                }
            ) => void, helpers: {
                setShowAddModal: Dispatch<SetStateAction<boolean>>;
                resetForm: () => void;
            }
    ) => (e: any) => {
        e.preventDefault();

        createUrbanVillage(
            {
                name: form.name,
                post_code: form.post_code,
                province_id: form.province_id ? Number(form.province_id) : 0,
                city_id: form.city_id ? Number(form.city_id) : 0,
                district_id: form.district_id ? Number(form.district_id) : 0,
            },
            {
                onSuccess: () => {
                    helpers.setShowAddModal(false);
                    helpers.resetForm();
                },
            }
        )
    }

export const buildHandleSubmitEditUrbanVillage =
    (
        editingId: number | null,
        form: UrbanVillageFormState,
        updateUrbanVillage:
            (
                payload: {
                    id: number;
                    data: UpdateUrbanVillagePayload;
                },
                options?: {
                    onSuccess?: () => void;
                    onError?: (error: any) => void;
                }
            ) => void, helpers: {
                setShowEditModal: Dispatch<SetStateAction<boolean>>;
                setEditingId: Dispatch<SetStateAction<number | null>>;
                resetForm: () => void;
            }
    ) => (e: any) => {
        e.preventDefault();
        if (!editingId) return;

        updateUrbanVillage(
            {
                id: editingId,
                data: {
                    name: form.name,
                    post_code: form.post_code,
                    province_id: form.province_id ? Number(form.province_id) : 0,
                    city_id: form.city_id ? Number(form.city_id) : 0,
                    district_id: form.district_id ? Number(form.district_id) : 0,
                },
            },
            {
                onSuccess: () => {
                    helpers.setShowEditModal(false);
                    helpers.setEditingId(null);
                    helpers.resetForm();
                },
            }
        )
    }

export const buildHandleDeleteUrbanVillage = (deleteUrbanVillage: (id: number, options?: any) => void) => (urbanVillage: any) => {
    const toastId = toast.loading("Menghapus kelurahan...");

    deleteUrbanVillage(urbanVillage.id, {
        onSuccess: () => {
            toast.success("Kelurahan berhasil dihapus!", { id: toastId });
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat menghapus kelurahan.", { id: toastId }
            )
        }
    })
}