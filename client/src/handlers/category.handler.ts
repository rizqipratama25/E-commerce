// category.handler.ts
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "../services/category.service";
import toast from "react-hot-toast";

export type CategoryFormState = {
  name: string;
  parent_id: string; // '' | '123'
  is_active: boolean;
  show_in_menu: boolean;
};

export const buildHandleFormChange =
  (setForm: Dispatch<SetStateAction<CategoryFormState>>) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const el = e.currentTarget;

      if (el instanceof HTMLInputElement && el.type === "checkbox") {
        setForm((prev) => ({
          ...prev,
          [el.name]: el.checked,
        }));
        return;
      }

      setForm((prev) => ({
        ...prev,
        [el.name]: el.value,
      }));
    };

// Add submit
export const buildHandleSubmitNewCategory =
  (
    form: CategoryFormState,
    createCategory: (
      payload: CreateCategoryPayload,
      options?: { onSuccess?: () => void; onError?: (error: any) => void }
    ) => void,
    helpers: {
      setShowAddModal: Dispatch<SetStateAction<boolean>>;
      resetForm: () => void;
      setEditingId: Dispatch<SetStateAction<number | null>>;
    }
  ) =>
    (e: FormEvent) => {
      e.preventDefault();
      
      const parentId = form.parent_id === "" ? null : Number(form.parent_id);
      
      const toastId = toast.loading("Menambah kategori...");

      createCategory(
        {
          name: form.name.trim(),
          parent_id: parentId,
          is_active: form.is_active,
          show_in_menu: form.show_in_menu,
        },
        {
          onSuccess: () => {
            toast.success("Kategori berhasil ditambahkan!", { id: toastId });
            helpers.setShowAddModal(false);
            helpers.resetForm();
            helpers.setEditingId(null);
          },
          onError: (error: any) => {
            const message =
              error.response?.data?.errors ||
              error.response?.data?.message ||
              "Terjadi kesalahan saat menambah kategori.";
            toast.error(message, { id: toastId });
          },
        }
      );
    };

// Edit submit
export const buildHandleSubmitEditCategory =
  (
    editingId: number | null,
    form: CategoryFormState,
    updateCategory: (
      payload: { id: number; data: UpdateCategoryPayload },
      options?: { onSuccess?: () => void; onError?: (error: any) => void }
    ) => void,
    helpers: {
      setShowEditModal: Dispatch<SetStateAction<boolean>>;
      setEditingId: Dispatch<SetStateAction<number | null>>;
      resetForm: () => void;
    }
  ) =>
    (e: FormEvent) => {
      e.preventDefault();
      if (!editingId) return;

      const parentId = form.parent_id === "" ? null : Number(form.parent_id);

      const toastId = toast.loading("Mengubah kategori...");

      updateCategory(
        {
          id: editingId,
          data: {
            name: form.name.trim(),
            parent_id: parentId,
            is_active: form.is_active,
            show_in_menu: form.show_in_menu,
          },
        },
        {
          onSuccess: () => {
            toast.success("Kategori berhasil diubah!", { id: toastId });
            helpers.setShowEditModal(false);
            helpers.setEditingId(null);
            helpers.resetForm();
          },
          onError: (error: any) => {
            const message =
              error.response?.data?.errors ||
              error.response?.data?.message ||
              "Terjadi kesalahan saat mengubah kategori.";
            toast.error(message, { id: toastId });
          },
        }
      );
    };

// Delete
export const buildHandleDeleteCategory =
  (deleteCategory: (id: number, options?: any) => void) =>
    (category: Pick<Category, "id" | "name">) => {
      const toastId = toast.loading("Menghapus kategori...");

      deleteCategory(category.id, {
        onSuccess: () => toast.success("Kategori berhasil dihapus!", { id: toastId }),
        onError: (error: any) => {
          toast.error(
            error.response?.data?.errors ||
            error.response?.data?.message ||
            "Terjadi kesalahan saat menghapus kategori.",
            { id: toastId }
          );
        },
      });
    };
