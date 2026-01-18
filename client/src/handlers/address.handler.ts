import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import toast from "react-hot-toast";
import type { Address, CreateAddressPayload, UpdateAddressPayload } from "../services/address.service";

export interface AddressFormState {
    label: string;
    receiver: string;
    phone: string;
    city_id: string;
    district_id: string;
    province_id: string;
    urban_village_id: string;
    detail: string;
}

// Form Change
export const buildHandleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, setForm: Dispatch<SetStateAction<AddressFormState>>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
}

// Add Submit
export const buildHandleSubmitNewAddress =
    (
        form: AddressFormState,
        createAddress: (
            payload: CreateAddressPayload,
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

        createAddress(
            {
                label: form.label,
                receiver: form.receiver,
                phone: form.phone,
                province_id: form.province_id ? Number(form.province_id) : 0,
                city_id: form.city_id ? Number(form.city_id) : 0,
                district_id: form.district_id ? Number(form.district_id) : 0,
                urban_village_id: form.urban_village_id ? Number(form.urban_village_id) : 0,
                detail: form.detail,
            },
            {
                onSuccess: () => {
                    toast.success("Alamat berhasil ditambahkan!");
                    helpers.setShowAddModal(false);
                    helpers.resetForm();
                },
                onError: (error: any) => {
                    const message = error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat menambahkan alamat.";

                    toast.error(message);
                }
            },
        )
    }

// Edit Submit
export const buildHandleSubmitEditAddress =
    (
        editingId: number | null,
        form: AddressFormState,
        updateAddress: (
            payload: {
                id: number;
                data: UpdateAddressPayload;
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

        updateAddress(
            {
                id: editingId,
                data: {
                    label: form.label,
                    receiver: form.receiver,
                    phone: form.phone,
                    province_id: form.province_id ? Number(form.province_id) : 0,
                    city_id: form.city_id ? Number(form.city_id) : 0,
                    district_id: form.district_id ? Number(form.district_id) : 0,
                    urban_village_id: form.urban_village_id ? Number(form.urban_village_id) : 0,
                    detail: form.detail,
                },
            },
            {
                onSuccess: () => {
                    toast.success("Alamat berhasil diupdate!");
                    helpers.setShowEditModal(false);
                    helpers.setEditingId(null);
                    helpers.resetForm();
                },
                onError: (error: any) => {
                    const message = error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat mengupdate alamat.";

                    toast.error(message);
                }
            },
        )
    }

// Delete
export const buildHandleDeleteAddress = (deleteAddress: (id: number, options?: any) => void) => (address: Address) => {
    const toastId = toast.loading("Menghapus alamat...");

    deleteAddress(address.id, {
        onSuccess: () => {
            toast.success("Alamat berhasil dihapus!", { id: toastId });
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat menghapus alamat.", { id: toastId }
            )
        }
    })
}