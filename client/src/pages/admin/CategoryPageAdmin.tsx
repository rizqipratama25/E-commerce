import { Edit, Plus, Trash2, X } from "lucide-react";
import TitleRoutesAdminPartner from "../../components/TitleRoutesAdminPartner";
import DataTable from "../../components/DataTable";
import { useState, useMemo, type FormEvent } from "react";
import { useCreateCategory } from "../../hooks/category/useCreateCategory";
import { useUpdateCategory } from "../../hooks/category/useUpdateCategory";
import { useDeleteCategory } from "../../hooks/category/useDeleteCategory";
import {
    buildHandleDeleteCategory,
    buildHandleFormChange,
    buildHandleSubmitEditCategory,
    buildHandleSubmitNewCategory,
    type CategoryFormState,
} from "../../handlers/category.handler";
import ConfirmDialog from "../../components/ConfirmDialog";

// ✅ pakai hook admin
import { useAdminCategories } from "../../hooks/category/useAdminCategories";
import {
    flattenCategories,
    buildParentOptionsAdvanced,
    isInvalidParentSelection,
    type FlatCategoryRow,
} from "../../utils/category.utils";

const CategoryPageAdmin = () => {
    const { data: categoriesResponse, isLoading: isCategoriesLoading } = useAdminCategories();
    const categories = categoriesResponse ?? [];

    const flatRows: FlatCategoryRow[] = useMemo(() => flattenCategories(categories), [categories]);

    const { mutate: createCategory, isPending: isCreatingCategory } = useCreateCategory();
    const { mutate: updateCategory, isPending: isUpdatingCategory } = useUpdateCategory();
    const { mutate: deleteCategory } = useDeleteCategory();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<FlatCategoryRow | null>(null);

    const [form, setForm] = useState<CategoryFormState>({
        name: "",
        parent_id: "",
        is_active: true,
        show_in_menu: true,
    });

    const resetForm = () =>
        setForm({
            name: "",
            parent_id: "",
            is_active: true,
            show_in_menu: true,
        });

    const parentOptions = useMemo(
        () => buildParentOptionsAdvanced(categories, flatRows, editingId),
        [categories, flatRows, editingId]
    );

    const handleDeleteCategory = buildHandleDeleteCategory(deleteCategory);

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        handleDeleteCategory(deleteTarget);
        setShowConfirm(false);
        setDeleteTarget(null);
    };

    const categoryColumns = [
        {
            header: "ID",
            accessor: "id",
            render: (row: FlatCategoryRow) => (
                <span className="text-sm font-medium text-gray-900">{row.id}</span>
            ),
        },
        {
            header: "Kategori",
            accessor: "name",
            render: (row: FlatCategoryRow) => (
                <span className="text-sm font-medium text-gray-900">{row.level_label}</span>
            ),
        },
        {
            header: "Parent",
            accessor: "parent_name",
            render: (row: FlatCategoryRow) => (
                <span className="text-sm font-medium text-gray-900">{row.parent_name ?? "-"}</span>
            ),
        },
        {
            header: "Aktif",
            accessor: "is_active",
            render: (row: FlatCategoryRow) => (
                <span className={`text-xs font-semibold ${row.is_active ? "text-green-600" : "text-gray-400"}`}>
                    {row.is_active ? "Aktif" : "Nonaktif"}
                </span>
            ),
        },
        {
            header: "Tampil Menu",
            accessor: "show_in_menu",
            render: (row: FlatCategoryRow) => (
                <span className={`text-xs font-semibold ${row.show_in_menu ? "text-blue-600" : "text-gray-400"}`}>
                    {row.show_in_menu ? "Ya" : "Tidak"}
                </span>
            ),
        },
    ];

    const categoryActions = [
        {
            label: "Edit",
            icon: Edit,
            color: "text-[#F26A24]",
            hoverColor: "bg-orange-50",
            onClick: (row: FlatCategoryRow) => {
                setEditingId(row.id);
                setForm({
                    name: row.name,
                    parent_id: row.parent_id ? String(row.parent_id) : "",
                    is_active: !!row.is_active,
                    show_in_menu: !!row.show_in_menu,
                });
                setShowEditModal(true);
            },
        },
        {
            label: "Hapus",
            icon: Trash2,
            color: "text-red-600",
            hoverColor: "bg-red-50",
            onClick: (row: FlatCategoryRow) => {
                setDeleteTarget(row);
                setShowConfirm(true);
            },
        },
    ];

    const handleFormChange = buildHandleFormChange(setForm);

    const handleSubmitNewCategory = buildHandleSubmitNewCategory(form, createCategory as any, {
        setShowAddModal,
        resetForm,
        setEditingId,
    });

    const handleSubmitEditCategory = buildHandleSubmitEditCategory(editingId, form, updateCategory as any, {
        setShowEditModal,
        setEditingId,
        resetForm,
    });

    const handleSubmitEditCategorySafe = (e: FormEvent) => {
        e.preventDefault();

        const parentId = form.parent_id ? Number(form.parent_id) : null;

        if (isInvalidParentSelection(categories, editingId, parentId)) {
            alert("Parent tidak valid. Kamu tidak boleh memilih kategori anak/keturunan sebagai parent.");
            return;
        }

        handleSubmitEditCategory(e);
    };

    if (isCategoriesLoading) return <div>Loading...</div>;

    return (
        <>
            <TitleRoutesAdminPartner title="Kategori" description="Kelola seluruh kategori produk yang tersedia.">
                <button
                    className="flex items-center gap-2 bg-[#F26A24] text-white mt-3 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                    onClick={() => {
                        resetForm();
                        setEditingId(null);
                        setShowAddModal(true);
                    }}
                >
                    <Plus size={20} />
                    Tambah Kategori
                </button>
            </TitleRoutesAdminPartner>

            <DataTable columns={categoryColumns} data={flatRows} actions={categoryActions} />

            {/* Modal Add */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Tambah Kategori</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 rounded hover:bg-gray-100">
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitNewCategory} className="space-y-4">
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleFormChange}
                                placeholder="Nama kategori"
                                className="w-full border rounded-lg p-2"
                                required
                            />

                            <select name="parent_id" value={form.parent_id} onChange={handleFormChange} className="w-full border rounded-lg p-2">
                                <option value="">Tidak ada (kategori utama)</option>
                                {parentOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id} disabled={opt.disabled}>
                                        {opt.level_label}
                                        {opt.disabled ? " (tidak bisa dipilih)" : ""}
                                    </option>
                                ))}
                            </select>

                            {/* ✅ flags */}
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={form.is_active}
                                        onChange={handleFormChange}
                                    />
                                    Aktif
                                </label>

                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="show_in_menu"
                                        checked={form.show_in_menu}
                                        onChange={handleFormChange}
                                    />
                                    Tampilkan di menu
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isCreatingCategory}
                                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60"
                            >
                                {isCreatingCategory ? "Menyimpan..." : "Simpan Kategori"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Edit Kategori</h2>
                            <button onClick={() => setShowEditModal(false)} className="p-2 rounded hover:bg-gray-100">
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitEditCategorySafe} className="space-y-4">
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleFormChange}
                                placeholder="Nama kategori"
                                className="w-full border rounded-lg p-2"
                                required
                            />

                            <select name="parent_id" value={form.parent_id} onChange={handleFormChange} className="w-full border rounded-lg p-2">
                                <option value="">Tidak ada (kategori utama)</option>
                                {parentOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id} disabled={opt.disabled}>
                                        {opt.level_label}
                                        {opt.disabled ? " (tidak bisa dipilih)" : ""}
                                    </option>
                                ))}
                            </select>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={form.is_active}
                                        onChange={handleFormChange}
                                    />
                                    Aktif
                                </label>

                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="show_in_menu"
                                        checked={form.show_in_menu}
                                        onChange={handleFormChange}
                                    />
                                    Tampilkan di menu
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingCategory}
                                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60"
                            >
                                {isUpdatingCategory ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showConfirm && (
                <ConfirmDialog
                    title="Hapus Kategori"
                    description={`Yakin ingin menghapus kategori "${deleteTarget?.name}"?`}
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => {
                        setShowConfirm(false);
                        setDeleteTarget(null);
                    }}
                />
            )}
        </>
    );
};

export default CategoryPageAdmin;
