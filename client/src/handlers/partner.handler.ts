// partner.handler.ts
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import toast from "react-hot-toast";
import type { CreatePartnerPayload, Partner } from "../services/partner.service";

export type PartnerFormState = {
  username: string;
  fullname: string;
  phone: string;
  email: string;
  password: string;
  role: string; // "Partner" biasanya
  photo_profile: File | null;
  address_province_id: string; // simpan string supaya gampang di input/select
  address_city_id: string;
  address_district_id: string;
  address_urban_village_id: string;
  address_detail: string;
};

// helper untuk reset form
export const buildResetPartnerForm =
  (setForm: Dispatch<SetStateAction<PartnerFormState>>) => () => {
    setForm({
      username: "",
      fullname: "",
      phone: "",
      email: "",
      password: "",
      role: "Partner",
      photo_profile: null,
      address_province_id: "",
      address_city_id: "",
      address_district_id: "",
      address_urban_village_id: "",
      address_detail: "",
    });
  };

// input text/select change
export const buildHandlePartnerFormChange =
  (
    setForm: Dispatch<SetStateAction<PartnerFormState>>
  ) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    };

// file change (photo_profile)
export const buildHandlePartnerPhotoChange =
  (
    setForm: Dispatch<SetStateAction<PartnerFormState>>
  ) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setForm((prev) => ({ ...prev, photo_profile: file }));
    };

// submit create partner
export const buildHandleSubmitNewPartner =
  (
    form: PartnerFormState,
    createPartner: (
      payload: CreatePartnerPayload | FormData,
      options?: {
        onSuccess?: () => void;
        onError?: (error: any) => void;
      }
    ) => void,
    helpers: {
      setShowAddModal: Dispatch<SetStateAction<boolean>>;
      resetForm: () => void;
    }
  ) =>
    (e: FormEvent) => {
      e.preventDefault();


      if (!form.username || !form.fullname || !form.phone || !form.email || !form.password) {
        toast.error("Semua field wajib diisi.");
        return;
      }

      const fd = new FormData();
      fd.append("username", form.username);
      fd.append("fullname", form.fullname);
      fd.append("phone", form.phone);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("role", form.role || "Partner");
      if (form.photo_profile) fd.append("photo_profile", form.photo_profile);
      fd.append("address_province_id", String(form.address_province_id));
      fd.append("address_city_id", String(form.address_city_id));
      fd.append("address_district_id", String(form.address_district_id));
      fd.append("address_urban_village_id", String(form.address_urban_village_id));
      fd.append("address_detail", form.address_detail);

      const toastId = toast.loading("Menambahkan partner...");

      createPartner(fd as unknown as FormData, {
        onSuccess: () => {
          toast.success("Partner berhasil ditambahkan!", { id: toastId });
          helpers.setShowAddModal(false);
          helpers.resetForm();
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.errors ||
            error.response?.data?.message ||
            "Terjadi kesalahan saat menambahkan partner.";
          toast.error(message, { id: toastId });
        },
      });
    };

// delete partner
export const buildHandleDeletePartner =
  (deletePartner: (id: number, options?: any) => void) =>
    (partner: Partner) => {
      const toastId = toast.loading("Menghapus partner...");

      deletePartner(partner.id, {
        onSuccess: () => {
          toast.success("Partner berhasil dihapus!", { id: toastId });
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.errors ||
            error.response?.data?.message ||
            "Terjadi kesalahan saat menghapus partner.";
          toast.error(message, { id: toastId });
        },
      });
    };
