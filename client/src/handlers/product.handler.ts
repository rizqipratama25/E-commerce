// product.handler.ts
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import toast from "react-hot-toast";
import type { CreateProductPayload, Data } from "../services/product.service";

export type ProductFormState = {
    name: string;
    price: string;
    stock: string;
    product_specification: string;
    product_information: string;
    category_id: string; // select string
    height: string;
    width: string;
    length: string;
    weight: string;
};

export const emptyProductForm: ProductFormState = {
    name: "",
    price: "",
    stock: "",
    product_specification: "",
    product_information: "",
    category_id: "",
    height: "",
    width: "",
    length: "",
    weight: "",
};

export type CreateProductWithImagesPayload = {
    product: CreateProductPayload;
    images: File[];
};

const MAX_IMAGE_SIZE_MB = 2;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

/* ======================
  FORM CHANGE
====================== */
export const buildHandleProductFormChange =
    (setForm: Dispatch<SetStateAction<ProductFormState>>) =>
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.currentTarget;
            setForm((prev) => ({ ...prev, [name]: value }));
        };

/* ======================
  IMAGE HELPERS
====================== */
export const validateProductImages = (files: File[]) => {
    const valid: File[] = [];

    for (const file of files) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error(`Format "${file.name}" tidak didukung.`);
            continue;
        }

        const sizeInMB = file.size / 1024 / 1024;
        if (sizeInMB > MAX_IMAGE_SIZE_MB) {
            toast.error(`Ukuran "${file.name}" ${sizeInMB.toFixed(2)}MB (max ${MAX_IMAGE_SIZE_MB}MB).`);
            continue;
        }

        valid.push(file);
    }

    return valid;
};

export const buildHandleProductImagesChange =
    (setNewImages: Dispatch<SetStateAction<File[]>>) =>
        (e: ChangeEvent<HTMLInputElement>) => {
            const files = e.currentTarget.files ? Array.from(e.currentTarget.files) : [];
            if (!files.length) return;

            const valid = validateProductImages(files);

            if (!valid.length) {
                e.currentTarget.value = "";
                return;
            }

            setNewImages((prev) => [...prev, ...valid]);
            e.currentTarget.value = "";
        };

export const buildHandleRemoveNewProductImage =
    (setNewImages: Dispatch<SetStateAction<File[]>>) =>
        (idx: number) => {
            setNewImages((prev) => prev.filter((_, i) => i !== idx));
        };

/* ======================
  BUILD PAYLOAD
====================== */
export const buildCreateProductPayload = (form: ProductFormState): CreateProductPayload => {
    return {
        name: form.name.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        product_specification: form.product_specification,
        product_information: form.product_information,
        category_id: Number(form.category_id),

        height: form.height ? Number(form.height) : 0,
        width: form.width ? Number(form.width) : 0,
        length: form.length ? Number(form.length) : 0,
        weight: form.weight ? Number(form.weight) : 0,

        is_active: true,
    };
};

/* ======================
  SUBMIT CREATE
====================== */
export const buildHandleSubmitNewProduct =
    (
        form: ProductFormState,
        newImages: File[],
        createProduct: (
            payload: CreateProductWithImagesPayload,
            options?: { onSuccess?: () => void; onError?: (error: any) => void }
        ) => void,
        helpers: {
            closeAdd: () => void;
        }
    ) =>
        (e: FormEvent) => {
            e.preventDefault();


            if (!form.name || !form.price || !form.stock || !form.product_specification || !form.product_information || !form.category_id || !form.height || !form.width || !form.length || !form.weight) {
                toast.error("Harap isi semua input");
                return;
            }

            const toastId = toast.loading("Menambah produk...");

            createProduct(
                {
                    product: buildCreateProductPayload(form),
                    images: newImages,
                },
                {
                    onSuccess: () => {
                        toast.success("Produk berhasil dibuat!", { id: toastId });
                        helpers.closeAdd();
                    },
                    onError: (err: any) => {
                        const created = err?.created;

                        if (created) {
                            toast.success("Produk berhasil dibuat!");
                            toast.error(err?.message ?? "Sebagian gambar gagal diupload");
                            helpers.closeAdd();
                            return;
                        }

                        toast.error(err?.response?.data?.message ?? "Gagal membuat produk", { id: toastId });
                    },
                }
            );
        };

/* ======================
  SUBMIT UPDATE
====================== */
export const buildHandleSubmitEditProduct =
    (
        selectedSlug: string,
        form: ProductFormState,
        newImages: File[],
        updateProduct: (
            payload: { slug: string; product: CreateProductPayload; images: File[] },
            options?: { onSuccess?: () => void; onError?: (error: any) => void }
        ) => void,
        helpers: {
            setShowEditModal: Dispatch<SetStateAction<boolean>>;
            setSelectedSlug: Dispatch<SetStateAction<string>>;
            resetAllState: () => void;
        }
    ) =>
        (e: FormEvent) => {
            e.preventDefault();

            if (!selectedSlug) return;

            if (!form.name || !form.price || !form.stock || !form.product_specification || !form.product_information || !form.category_id || !form.height || !form.width || !form.length || !form.weight) {
                toast.error("Harap isi semua input");
                return;
            }

            const toastId = toast.loading("Mengubah produk...");

            updateProduct(
                { slug: selectedSlug, product: buildCreateProductPayload(form), images: newImages },
                {
                    onSuccess: () => {
                        toast.success("Produk berhasil diubah!", { id: toastId });
                        helpers.setShowEditModal(false);
                        helpers.setSelectedSlug("");
                        helpers.resetAllState();
                    },
                    onError: (err: any) => {
                        toast.error(err?.response?.data?.message ?? "Gagal update produk", { id: toastId });
                    },
                }
            );
        };

/* ======================
  DELETE
====================== */
export const buildHandleDeleteProduct =
    (deleteProduct: (slug: string, options?: any) => void) =>
        (product: Data) => {
            const toastId = toast.loading("Menghapus produk...");
            deleteProduct(product.slug, {
                onSuccess: () => toast.success("Produk dihapus", { id: toastId }),
                onError: (err: any) =>
                    toast.error(err?.response?.data?.message ?? "Gagal hapus produk", { id: toastId }),
            });
        };
