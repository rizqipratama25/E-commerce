import { Edit, Plus, Trash2, X } from "lucide-react";
import TitleRoutesAdminPartner from "../../components/TitleRoutesAdminPartner";
import { useProvinces } from "../../hooks/province/UseProvinces";
import DataTable from "../../components/DataTable";
import type { Province } from "../../services/province.service";
import { useCreateProvince } from "../../hooks/province/useCreateProvince";
import { useState, type ChangeEvent, } from "react";
import { buildHandleDeleteProvince, buildHandleFormChange, buildHandleSubmitEditProvince, buildHandleSubmitNewProvince } from "../../handlers/province.handler";
import { useUpdateProvince } from "../../hooks/province/useUpdateProvince";
import { useDeleteProvince } from "../../hooks/province/useDeleteProvince";
import ConfirmDialog from "../../components/ConfirmDialog";

const ProvincePage = () => {
    // Get Province List
    const { data: provincesResponse, isLoading } = useProvinces();
    const provinces = provincesResponse ?? [];

    // Post Province
    const { mutate: createProvince, isPending: isCreatingProvince } = useCreateProvince();
    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState({
        name: "",
    });

    // Edit Province
    const { mutate: updateProvince, isPending: isUpdatingProvince } = useUpdateProvince();
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Delete Province
    const { mutate: deleteProvince } = useDeleteProvince();
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Province | null>(null);
    const handleDeleteProvince = buildHandleDeleteProvince(deleteProvince);
    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        handleDeleteProvince(deleteTarget);
        setShowConfirm(false);
        setDeleteTarget(null);
    }

    // Reset Form
    const resetForm = () => setForm({ name: "" });
    const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => buildHandleFormChange(e, setForm);

    const handleSubmitNewProvince = buildHandleSubmitNewProvince(form, createProvince, { setShowAddModal, resetForm });
    const handleSubmitEditProvince = buildHandleSubmitEditProvince(editingId, form, updateProvince, { setShowEditModal, setEditingId, resetForm });

    const provinceColumns = [
        {
            header: 'ID',
            accessor: 'id',
            render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.id}</span>,
        },
        {
            header: 'Provinsi',
            accessor: 'name',
            render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.name}</span>,
        }
    ];

    const provinceActions = [
        {
            label: 'Edit',
            icon: Edit,
            color: 'text-[#F26A24]',
            hoverColor: 'bg-orange-50',
            onClick: (row: Province) => {
                setEditingId(row.id);
                setForm({
                    name: row.name,
                });
                setShowEditModal(true);
            },
        },
        {
            label: 'Hapus',
            icon: Trash2,
            color: 'text-red-600',
            hoverColor: 'bg-red-50',
            onClick: (row: Province) => {
                setDeleteTarget(row);
                setShowConfirm(true);
            },
        },
    ];

    if (isLoading) return <div>Loading...</div>;

    return (
        <>
            <TitleRoutesAdminPartner title="Provinsi" description="Kelola seluruh provinsi yang tersedia.">
                <button className="flex items-center gap-2 bg-[#F26A24] text-white mt-3 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer" onClick={() => setShowAddModal(true)}>
                    <Plus size={20} />
                    Tambah Provinsi
                </button>
            </TitleRoutesAdminPartner>

            <DataTable columns={provinceColumns} data={provinces} actions={provinceActions} />

            {/* Modal Add */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Tambah Provinsi</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 rounded hover:bg-gray-100"
                            >
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitNewProvince} className="space-y-4">
                            {/* Nama */}
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleFormChange}
                                placeholder="Provinsi"
                                className="w-full border rounded-lg p-2"
                                required
                            />

                            <button
                                type="submit"
                                disabled={isCreatingProvince}
                                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60"
                            >
                                {isCreatingProvince ? "Menyimpan..." : "Simpan Provinsi"}
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
                            <h2 className="text-xl font-bold">Edit Provinsi</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 rounded hover:bg-gray-100"
                            >
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitEditProvince} className="space-y-4">
                            {/* Nama */}
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleFormChange}
                                placeholder="Provinsi"
                                className="w-full border rounded-lg p-2"
                                required
                            />

                            <button
                                type="submit"
                                disabled={isUpdatingProvince}
                                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60"
                            >
                                {isUpdatingProvince ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete */}
            {showConfirm && (
                <ConfirmDialog
                    title="Hapus Provinsi"
                    description={`Yakin ingin menghapus Provinsi "${deleteTarget?.name}"?`}
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
    )
}

export default ProvincePage