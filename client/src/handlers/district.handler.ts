import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import type { CreateDistrictPayload, District, UpdateDistrictPayload } from "../services/district.service";
import toast from "react-hot-toast";

export type DistrictFormState = {
    name: string;
    city_id: string;
    province_id: string;
}

// Form change
export const buildHandleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, setForm: Dispatch<SetStateAction<DistrictFormState>>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
}

// Add submit
export const buildHandleSubmitNewDistrict =
    (
        form: DistrictFormState,
        createDistrict: (
            payload: CreateDistrictPayload,
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

        const toastId = toast.loading("Menambah kecamatan...");

        createDistrict(
            {
                name: form.name,
                city_id: Number(form.city_id),
                province_id: Number(form.province_id),
            },
            {
                onSuccess: () => {
                    toast.success("Kecamatan berhasil ditambahkan!", {id: toastId});
                    helpers.setShowAddModal(false);
                    helpers.resetForm();
                },
                onError: (error: any) => {
                    const message = error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat menambahkan kecamatan.";

                    toast.error(message, {id: toastId});
                }
            },
        )
    }

// Edit submit
export const buildHandleSubmitEditDistrict =
    (
        editingId: number | null,
        form: DistrictFormState,
        updateDistrict: (
            payload: {
                id: number;
                data: UpdateDistrictPayload;
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

        const toastId = toast.loading("Mengubah kecamatan...");

        updateDistrict(
            {
                id: editingId,
                data: {
                    name: form.name,
                    city_id: Number(form.city_id),
                    province_id: Number(form.province_id),
                },
            },
            {
                onSuccess: () => {
                    toast.success("Kecamatan berhasil diubah!", {id: toastId});
                    helpers.setShowEditModal(false);
                    helpers.setEditingId(null);
                    helpers.resetForm();
                },
                onError: (error: any) => {
                    const message = error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat mengupdate kecamatan.";

                    toast.error(message, {id: toastId});
                }
            },
        )
    }

// Delete
export const buildHandleDeleteDistrict = (deleteDistrict: (id: number, options?: any) => void) => (district: District) => {
    const toastId = toast.loading("Menghapus kecamatan...");

    deleteDistrict(district.id, {
        onSuccess: () => {
            toast.success("Kecamatan berhasil dihapus!", { id: toastId });
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat menghapus kecamatan.", { id: toastId }
            )
        }
    })
}