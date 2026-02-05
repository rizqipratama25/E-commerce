import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import type { CreateShippingServicePayload, ShippingService, UpdateShippingServicePayload } from "../services/shippingService.service";
import toast from "react-hot-toast";

export interface ShippingServiceFormState {
    courier_code: string;
    courier_name: string;
    service_code: string;
    service_name: string;
    estimation: string;
    base_price: string;
    price_per_kg: string;
    is_active: boolean;
}

// Form change
export const buildHandleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, setForm: Dispatch<SetStateAction<ShippingServiceFormState>>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
}

// Add submit
export const buildHandleSubmitNewShippingService =
    (
        form: ShippingServiceFormState,
        createShippingService: (
            payload: CreateShippingServicePayload,
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

        const toastId = toast.loading("Menambah jasa pengiriman...");

        createShippingService(
            {
                courier_code: form.courier_code,
                courier_name: form.courier_name,
                service_code: form.service_code,
                service_name: form.service_name,
                estimation: form.estimation,
                base_price: Number(form.base_price),
                price_per_kg: Number(form.price_per_kg),
                is_active: form.is_active,
            },
            {
                onSuccess: () => {
                    toast.success("Jasa pengiriman berhasil ditambahkan!", { id: toastId });
                    helpers.setShowAddModal(false);
                    helpers.resetForm();
                },
                onError: (error: any) => {
                    const message = error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat menambahkan jasa pengiriman.";

                    toast.error(message, {id: toastId});
                }
            },            
        )
    }        

// Edit submit
export const buildHandleSubmitEditShippingService =
    (
        editingId: number | null,
        form: ShippingServiceFormState,
        updateShippingService: (
            payload: {
                id: number;
                data: UpdateShippingServicePayload;
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

        const toastId = toast.loading("Mengubah jasa pengiriman...");

        updateShippingService(
            {
                id: editingId,
                data: {
                    courier_code: form.courier_code,
                    courier_name: form.courier_name,
                    service_code: form.service_code,
                    service_name: form.service_name,
                    estimation: form.estimation,
                    base_price: Number(form.base_price),
                    price_per_kg: Number(form.price_per_kg),
                    is_active: form.is_active,
                },
            },
            {
                onSuccess: () => {
                    toast.success("Jasa pengiriman berhasil diupdate!", {id: toastId});
                    helpers.setShowEditModal(false);
                    helpers.setEditingId(null);
                    helpers.resetForm();
                },
                onError: (error: any) => {
                    const message = error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat mengupdate jasa pengiriman.";

                    toast.error(message, {id: toastId});
                }
            },
        )
    }

// Delete
export const buildHandleDeleteShippingService = (deleteShippingService: (id: number, options?: any) => void) => (shippingService: ShippingService) => {
    const toastId = toast.loading("Menghapus jasa pengiriman...");

    deleteShippingService(shippingService.id, {
        onSuccess: () => {
            toast.success("Jasa pengiriman berhasil dihapus!", { id: toastId });
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat menghapus jasa pengiriman.", { id: toastId }
            )
        }
    })
}