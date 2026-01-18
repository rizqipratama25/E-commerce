import { Edit, Eye, Plus, Trash2, X } from "lucide-react"
import TitleRoutesAdminPartner from "../../components/TitleRoutesAdminPartner"
import type { ShippingService } from "../../services/shippingService.service";
import { useShippingServices } from "../../hooks/shippingService/useShippingServices";
import { useCreateShippingService } from "../../hooks/shippingService/useCreateShippingService";
import { useState, type ChangeEvent } from "react";
import { useUpdateShippingService } from "../../hooks/shippingService/useUpdateShippingService";
import { useDeleteShippingService } from "../../hooks/shippingService/useDeleteShippingService";
import { buildHandleDeleteShippingService, buildHandleFormChange, buildHandleSubmitEditShippingService, buildHandleSubmitNewShippingService } from "../../handlers/shippingService.handler";
import DataTable from "../../components/DataTable";
import Switch from "../../components/Switch";
import ConfirmDialog from "../../components/ConfirmDialog";
import { formatRupiah } from "../../utils/function";

const ShippingServicePage = () => {
    // Get Shipping Service List
    const { data: shippingServicesResponse, isLoading } = useShippingServices();
    const shippingServices = shippingServicesResponse ?? [];

    // Post Shipping Service
    const { mutate: createShippingService, isPending: isCreatingShippingService } = useCreateShippingService();
    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState({
        courier_code: "",
        courier_name: "",
        service_code: "",
        service_name: "",
        estimation: "",
        base_price: "",
        price_per_kg: "",
        is_active: true,
    });

    // Edit Shipping Service
    const { mutate: updateShippingService, isPending: isUpdatingShippingService } = useUpdateShippingService();
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Delete Shipping Service
    const { mutate: deleteShippingService } = useDeleteShippingService();
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ShippingService | null>(null);
    const handleDeleteShippingService = buildHandleDeleteShippingService(deleteShippingService);
    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        handleDeleteShippingService(deleteTarget);
        setShowConfirm(false);
        setDeleteTarget(null);
    }

    // Detail Shipping Service
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedShippingService, setSelectedShippingService] = useState<ShippingService | null>(null);

    // Reset Form
    const resetForm = () => setForm({
        courier_code: "",
        courier_name: "",
        service_code: "",
        service_name: "",
        estimation: "",
        base_price: "",
        price_per_kg: "",
        is_active: true,
    });

    const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => buildHandleFormChange(e, setForm);
    const handleSubmitNewShippingService = buildHandleSubmitNewShippingService(form, createShippingService, { setShowAddModal, resetForm });
    const handleSubmitEditShippingService = buildHandleSubmitEditShippingService(editingId, form, updateShippingService, { setShowEditModal, setEditingId, resetForm });

    if (isLoading) return <p>Loading...</p>;

    const shippingServiceColumns = [
        {
            header: 'ID',
            accessor: 'id',
            render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.id}</span>,
        },
        {
            header: 'Nama Kurir',
            accessor: 'courier_name',
            render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.courier_name}</span>,
        },
        {
            header: 'Kode Layanan',
            accessor: 'service_code',
            render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.service_code}</span>,
        },
        {
            header: 'Estimasi',
            accessor: 'estimation',
            render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.estimation}</span>,
        },
        {
            header: 'Harga Dasar',
            accessor: 'base_price',
            render: (row: any) => <span className="text-sm font-medium text-gray-900">{formatRupiah(row.base_price)}</span>,
        },
        {
            header: 'Harga Per Kg',
            accessor: 'price_per_kg',
            render: (row: any) => <span className="text-sm font-medium text-gray-900">{formatRupiah(row.price_per_kg)}</span>,
        },
        {
            header: 'Status',
            accessor: 'is_active',
            render: (row: any) => <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${row.is_active === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>{row.is_active ? "Aktif" : "Tidak Aktif"}</span>,
        },
    ];

    const shippingServiceActions = [
        {
            label: 'Lihat',
            icon: Eye,
            color: 'text-blue-600',
            hoverColor: 'bg-blue-50',
            onClick: (row: ShippingService) => {
                setSelectedShippingService(row);
                setShowDetailModal(true);
            },
        },
        {
            label: 'Edit',
            icon: Edit,
            color: 'text-[#F26A24]',
            hoverColor: 'bg-orange-50',
            onClick: (row: ShippingService) => {
                setEditingId(row.id);
                setForm({
                    courier_code: row.courier_code,
                    courier_name: row.courier_name,
                    service_code: row.service_code,
                    service_name: row.service_name,
                    estimation: row.estimation,
                    base_price: row.base_price ? String(row.base_price) : '',
                    price_per_kg: row.price_per_kg ? String(row.price_per_kg) : '',
                    is_active: row.is_active ?? true,
                });
                setShowEditModal(true);
            },
        },
        {
            label: 'Hapus',
            icon: Trash2,
            color: 'text-red-600',
            hoverColor: 'bg-red-50',
            onClick: (row: ShippingService) => {
                setDeleteTarget(row);
                setShowConfirm(true);
            },
        },
    ];

    return (
        <>
            <TitleRoutesAdminPartner title="Jasa Pengiriman" description="Kelola seluruh jasa pengiriman yang tersedia.">
                <button className="flex items-center gap-2 bg-[#F26A24] text-white mt-3 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer" onClick={() => setShowAddModal(true)}>
                    <Plus size={20} />
                    Tambah Jasa Pengiriman
                </button>
            </TitleRoutesAdminPartner>

            <DataTable columns={shippingServiceColumns} data={shippingServices} actions={shippingServiceActions} />

            {/* Modal Detail */}
            {showDetailModal && selectedShippingService && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Detail Jasa Pengiriman</h2>
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedShippingService(null);
                                }}
                                className="p-2 rounded hover:bg-gray-100"
                            >
                                <X />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500">Nama Kurir</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedShippingService.courier_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Kode Kurir</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedShippingService.courier_code}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Nama Layanan</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedShippingService.service_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Kode Layanan</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedShippingService.service_code}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500">Estimasi</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedShippingService.estimation}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <span
                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedShippingService.is_active
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {selectedShippingService.is_active ? "Aktif" : "Tidak Aktif"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500">Harga Dasar</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatRupiah(selectedShippingService.base_price)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Harga per Kg</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatRupiah(selectedShippingService.price_per_kg)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedShippingService(null);
                                }}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Add */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Tambah Jasa Pengiriman</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 rounded hover:bg-gray-100"
                            >
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitNewShippingService} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    name="courier_code"
                                    value={form.courier_code}
                                    onChange={handleFormChange}
                                    placeholder="Kode Kurir"
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                                <input
                                    name="courier_name"
                                    value={form.courier_name}
                                    onChange={handleFormChange}
                                    placeholder="Nama Kurir"
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                                <input
                                    name="service_code"
                                    value={form.service_code}
                                    onChange={handleFormChange}
                                    placeholder="Kode Layanan"
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                                <input
                                    name="service_name"
                                    value={form.service_name}
                                    onChange={handleFormChange}
                                    placeholder="Nama Layanan"
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                                <input
                                    name="base_price"
                                    value={form.base_price}
                                    onChange={handleFormChange}
                                    placeholder="Harga Dasar"
                                    type="number"
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                                <input
                                    name="price_per_kg"
                                    value={form.price_per_kg}
                                    onChange={handleFormChange}
                                    placeholder="Harga Per Kg"
                                    type="number"
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                                <input
                                    name="estimation"
                                    value={form.estimation}
                                    onChange={handleFormChange}
                                    placeholder="Estimasi"
                                    className="w-full border rounded-lg p-2"
                                    required
                                />

                                <Switch
                                    label="Status"
                                    checked={form.is_active}
                                    onChange={(value) => setForm({ ...form, is_active: value })}
                                />
                            </div>


                            <button
                                type="submit"
                                disabled={isCreatingShippingService}
                                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60 cursor-pointer"
                            >
                                {isCreatingShippingService ? "Menyimpan..." : "Simpan Jasa Pengiriman"}
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
                            <h2 className="text-xl font-bold">Edit Jasa Pengiriman</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 rounded hover:bg-gray-100"
                            >
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitEditShippingService} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    name="courier_code"
                                    value={form.courier_code}
                                    onChange={handleFormChange}
                                    placeholder="Kode Kurir"
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                                <input
                                    name="courier_name"
                                    value={form.courier_name}
                                    onChange={handleFormChange}
                                    placeholder="Nama Kurir"
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                                <input
                                    name="service_code"
                                    value={form.service_code}
                                    onChange={handleFormChange}
                                    placeholder="Kode Layanan"
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                                <input
                                    name="service_name"
                                    value={form.service_name}
                                    onChange={handleFormChange}
                                    placeholder="Nama Layanan"
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                                <input
                                    name="base_price"
                                    value={form.base_price}
                                    onChange={handleFormChange}
                                    placeholder="Harga Dasar"
                                    type="number"
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                                <input
                                    name="price_per_kg"
                                    value={form.price_per_kg}
                                    onChange={handleFormChange}
                                    placeholder="Harga Per Kg"
                                    type="number"
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                                <input
                                    name="estimation"
                                    value={form.estimation}
                                    onChange={handleFormChange}
                                    placeholder="Estimasi"
                                    className="w-full border rounded-lg p-2"
                                    required
                                />

                                <Switch
                                    label="Status"
                                    checked={form.is_active}
                                    onChange={(value) => setForm({ ...form, is_active: value })}
                                />
                            </div>


                            <button
                                type="submit"
                                disabled={isUpdatingShippingService}
                                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60 cursor-pointer"
                            >
                                {isUpdatingShippingService ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete */}
            {showConfirm && (
                <ConfirmDialog
                    title="Hapus Jasa Pengiriman"
                    description={`Yakin ingin menghapus jasa pengiriman "${deleteTarget?.courier_name}" dengan layanan "${deleteTarget?.service_name}?`}
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

export default ShippingServicePage