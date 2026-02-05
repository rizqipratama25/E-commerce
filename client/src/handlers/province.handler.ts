import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import toast from "react-hot-toast";

export type ProvinceFormState = {
    name: string;
}

// Form change
export const buildHandleFormChange = (e: ChangeEvent<HTMLInputElement>, setForm: Dispatch<SetStateAction<ProvinceFormState>>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
}

// Add submit
export const buildHandleSubmitNewProvince =
    (
        form: ProvinceFormState,
        createProvince: (
            payload: {
                name: string;
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

        const toastId = toast.loading("Menambah provinsi...");

        createProvince(
            {
                name: form.name,
            },
            {
                onSuccess: () => {
                    toast.success("Provinsi berhasil ditambahkan!", { id: toastId });
                    helpers.setShowAddModal(false);
                    helpers.resetForm();
                },
                onError: (error: any) => {
                    const message = error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat mengupdate provinsi.";

                    toast.error(message, { id: toastId });
                }
            },
        )
    }

// Edit submit
export const buildHandleSubmitEditProvince =
    (
        editingId: number | null,
        form: ProvinceFormState,
        updateProvince: (
            payload: {
                id: number;
                data: {
                    name: string;
                };
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

        const toastId = toast.loading("Mengubah provinsi...");

        updateProvince(
            {
                id: editingId!,
                data: {
                    name: form.name,
                },
            },
            {
                onSuccess: () => {
                    toast.success("Provinsi berhasil diubah!", { id: toastId });
                    helpers.setShowEditModal(false);
                    helpers.setEditingId(null);
                    helpers.resetForm();
                },
            onError: (error: any) => {
                    const message = error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat mengupdate provinsi.";

                    toast.error(message, { id: toastId });
                }
            },
        )
    }

// Delete
export const buildHandleDeleteProvince = (deleteProvince: (id: number, options?: any) => void) => (province: any) => {
    const toastId = toast.loading("Menghapus provinsi...");

    deleteProvince(province.id, {
        onSuccess: () => {
            toast.success("Provinsi berhasil dihapus!", { id: toastId });
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat menghapus provinsi.", { id: toastId }
            )
        }
    })
}