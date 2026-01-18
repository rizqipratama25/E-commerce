import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import toast from "react-hot-toast";
import type { PartnerAddressPayload } from "../services/partnerAddress.service";

export type PartnerAddressFormState = {
    province_id: string;
    city_id: string;
    district_id: string;
    urban_village_id: string;
    detail: string;
};

export const buildResetPartnerAddressForm =
    (setForm: Dispatch<SetStateAction<PartnerAddressFormState>>) => () => {
        setForm({
            province_id: "",
            city_id: "",
            district_id: "",
            urban_village_id: "",
            detail: "",
        });
    };

export const buildHandlePartnerAddressChange =
    (setForm: Dispatch<SetStateAction<PartnerAddressFormState>>) =>
        (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;

            setForm((prev) => {
                // cascading reset
                if (name === "province_id") {
                    return { ...prev, province_id: value, city_id: "", district_id: "", urban_village_id: "" };
                }
                if (name === "city_id") {
                    return { ...prev, city_id: value, district_id: "", urban_village_id: "" };
                }
                if (name === "district_id") {
                    return { ...prev, district_id: value, urban_village_id: "" };
                }
                return { ...prev, [name]: value };
            });
        };

export const buildHandleSubmitPartnerAddress =
    (
        form: PartnerAddressFormState,
        updateAddress: (
            payload: PartnerAddressPayload,
            options?: { onSuccess?: () => void; onError?: (error: any) => void }
        ) => void
    ) =>
        (e: FormEvent) => {
            e.preventDefault();

            if (!form.province_id || !form.city_id || !form.district_id || !form.urban_village_id) {
                toast.error("Lengkapi data wilayah dulu.");
                return;
            }

            const payload: PartnerAddressPayload = {
                province_id: Number(form.province_id),
                city_id: Number(form.city_id),
                district_id: Number(form.district_id),
                urban_village_id: Number(form.urban_village_id),
                detail: form.detail,
            };

            const toastId = toast.loading("Menyimpan alamat...");

            updateAddress(payload, {
                onSuccess: () => {
                    toast.success("Alamat berhasil disimpan!", { id: toastId });
                },
                onError: (error: any) => {
                    const msg =
                        error?.response?.data?.errors ||
                        error?.response?.data?.message ||
                        error?.message ||
                        "Gagal menyimpan alamat.";
                    toast.error(msg, { id: toastId });
                },
            });
        };
