import { Edit, Plus, Trash2, X } from "lucide-react";
import type { UrbanVillage } from "../../services/urbanVillage.service";
import { useUrbanVillages } from "../../hooks/urbanVillage/useUrbanVillages";
import { useCreateUrbanVillage } from "../../hooks/urbanVillage/useCreateUrbanVillage";
import { useMemo, useState, type ChangeEvent } from "react";
import { useUpdateUrbanVillage } from "../../hooks/urbanVillage/useUpdateUrbanVillage";
import { useDeleteUrbanVillage } from "../../hooks/urbanVillage/useDeleteUrbanVillage";
import TitleRoutesAdminPartner from "../../components/TitleRoutesAdminPartner";
import DataTable from "../../components/DataTable";
import { buildHandleDeleteUrbanVillage, buildHandleFormChange, buildHandleSubmitEditUrbanVillage, buildHandleSubmitNewUrbanVillage } from "../../handlers/urbanVillage.handler";
import { useProvinces } from "../../hooks/province/UseProvinces";
import { useCities } from "../../hooks/city/useCities";
import type { Province } from "../../services/province.service";
import type { City } from "../../services/city.service";
import { useDistricts } from "../../hooks/district/useDistricts";
import type { District } from "../../services/district.service";
import ConfirmDialog from "../../components/ConfirmDialog";

const UrbanVillagePage = () => {
    // Get UrbanVillage
    const { data: urbanVillageResponse, isLoading: isUrbanVillageLoading } = useUrbanVillages();
    const urbanVillages = urbanVillageResponse ?? [];

    // Post UrbanVillage
    const { mutate: createUrbanVillage, isPending: isCreatingUrbanVillage } = useCreateUrbanVillage();
    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState({
        name: "",
        post_code: "",
        province_id: "",
        city_id: "",
        district_id: "",
    });

    const resetForm = () => setForm({
        name: "",
        post_code: "",
        province_id: "",
        city_id: "",
        district_id: "",
    });
    // Edit UrbanVillage
    const { mutate: updateUrbanVillage, isPending: isUpdatingUrbanVillage } = useUpdateUrbanVillage();
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Delete UrbanVillage
    const { mutate: deleteUrbanVillage } = useDeleteUrbanVillage();
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<UrbanVillage | null>(null);
    const handleDeleteUrbanVillage = buildHandleDeleteUrbanVillage(deleteUrbanVillage);
    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        handleDeleteUrbanVillage(deleteTarget);
        setShowConfirm(false);
        setDeleteTarget(null);
    }

    const provinceId = useMemo(() => Number(form.province_id || 0), [form.province_id]);
    const cityId = useMemo(() => Number(form.city_id || 0), [form.city_id]);

    // Get Province
    const { data: provincesResponse, isLoading: isProvinceLoading } = useProvinces();
    const provinces = provincesResponse ?? [];

    // Get City
    const { data: citiesResponse, isLoading: isCityLoading } = useCities(provinceId);
    const cities = citiesResponse ?? [];

    // Get District
    const { data: districtsResponse, isLoading: isDistrictLoading } = useDistricts(cityId);
    const districts = districtsResponse ?? [];

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => buildHandleFormChange(e, setForm);
    const handleSubmitNewUrbanVillage = buildHandleSubmitNewUrbanVillage(form, createUrbanVillage, { setShowAddModal, resetForm });
    const handleSubmitEditUrbanVillage = buildHandleSubmitEditUrbanVillage(editingId, form, updateUrbanVillage, { setShowEditModal, setEditingId, resetForm });

    const urbanVillageColumns = [
        {
            header: 'ID',
            accessor: 'id',
            render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.id}</span>,
        },
        {
            header: 'Kelurahan',
            accessor: 'urban_village',
            render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.name}</span>,
        },
        {
            header: 'Kode Pos',
            accessor: 'post_code',
            render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.post_code}</span>,
        },
        {
            header: 'Kecamatan',
            accessor: 'district',
            render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.district}</span>,
        },
        {
            header: 'Kota',
            accessor: 'city',
            render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.city}</span>,
        },
        {
            header: 'Provinsi',
            accessor: 'province',
            render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.province}</span>,
        },
    ];

    const urbanVillageActions = [
        {
            label: 'Edit',
            icon: Edit,
            color: 'text-[#F26A24]',
            hoverColor: 'bg-orange-50',
            onClick: (row: UrbanVillage) => {
                setEditingId(row.id);
                setForm({
                    name: row.name,
                    post_code: row.post_code,
                    province_id: row.province_id ? String(row.province_id) : '',
                    city_id: row.city_id ? String(row.city_id) : '',
                    district_id: row.district_id ? String(row.district_id) : '',
                });
                setShowEditModal(true);
            },
        },
        {
            label: 'Hapus',
            icon: Trash2,
            color: 'text-red-600',
            hoverColor: 'bg-red-50',
            onClick: (row: UrbanVillage) => {
                setDeleteTarget(row);
                setShowConfirm(true);
            },
        },
    ];

    if (isUrbanVillageLoading) return <div>Loading...</div>;

    return (
        <>
            <TitleRoutesAdminPartner title="Kelurahan" description="Kelola seluruh kelurahan yang tersedia.">
                <button className="flex items-center gap-2 bg-[#F26A24] text-white mt-3 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer" onClick={() => setShowAddModal(true)}>
                    <Plus size={20} />
                    Tambah Kelurahan
                </button>
            </TitleRoutesAdminPartner>

            <DataTable columns={urbanVillageColumns} data={urbanVillages} actions={urbanVillageActions} />

            {/* Modal Add */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Tambah Kelurahan</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 rounded hover:bg-gray-100"
                            >
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitNewUrbanVillage} className="space-y-4">
                            {/* Nama */}
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleFormChange}
                                placeholder="Nama Kelurahan"
                                className="w-full border rounded-lg p-2"
                                required
                            />

                            <input
                                name="post_code"
                                value={form.post_code}
                                onChange={handleFormChange}
                                placeholder="Kode Pos"
                                className="w-full border rounded-lg p-2"
                                maxLength={5}
                                required
                            />

                            <select
                                name="province_id"
                                value={form.province_id}
                                onChange={handleFormChange}
                                className="w-full border rounded-lg p-2"
                                disabled={isProvinceLoading}
                                required
                            >
                                <option value="">
                                    {isProvinceLoading
                                            ? "Memuat Provinsi..."
                                        : "Pilih Provinsi"}
                                </option>

                                {(provinces ?? []).map((province: Province) => (
                                    <option key={province.id} value={province.id}>
                                        {province.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="city_id"
                                value={form.city_id}
                                onChange={handleFormChange}
                                className="w-full border rounded-lg p-2"
                                disabled={isCityLoading}
                                required
                            >
                                <option value="">
                                    {isCityLoading
                                        ? "Memuat Kota..."
                                        : "Pilih Kota"}
                                </option>

                                {(cities ?? []).map((city: City) => (
                                    <option key={city.id} value={city.id}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="district_id"
                                value={form.district_id}
                                onChange={handleFormChange}
                                className="w-full border rounded-lg p-2"
                                disabled={isDistrictLoading}
                                required
                            >
                                <option value="">
                                    {isCityLoading
                                        ? "Memuat Kecamatan..."
                                        : "Pilih Kecamatan"}
                                </option>

                                {(districts ?? []).map((district: District) => (
                                    <option key={district.id} value={district.id}>
                                        {district.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                disabled={isCreatingUrbanVillage}
                                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60"
                            >
                                {isCreatingUrbanVillage ? "Menyimpan..." : "Simpan Kelurahan"}
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
                            <h2 className="text-xl font-bold">Edit Kelurahan</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 rounded hover:bg-gray-100"
                            >
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitEditUrbanVillage} className="space-y-4">
                            {/* Nama */}
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleFormChange}
                                placeholder="Nama Kelurahan"
                                className="w-full border rounded-lg p-2"
                                required
                            />

                            <input
                                name="post_code"
                                value={form.post_code}
                                onChange={handleFormChange}
                                placeholder="Kode Pos"
                                className="w-full border rounded-lg p-2"
                                required
                            />

                            <select
                                name="province_id"
                                value={form.province_id}
                                onChange={handleFormChange}
                                className="w-full border rounded-lg p-2"
                                disabled={isProvinceLoading}
                                required
                            >
                                <option value="">
                                    {isProvinceLoading
                                        ? "Memuat Provinsi..."
                                        : "Pilih Provinsi"}
                                </option>

                                {(provinces ?? []).map((province: Province) => (
                                    <option key={province.id} value={province.id}>
                                        {province.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="city_id"
                                value={form.city_id}
                                onChange={handleFormChange}
                                className="w-full border rounded-lg p-2"
                                disabled={isCityLoading}
                                required
                            >
                                <option value="">
                                    {isCityLoading
                                        ? "Memuat Kota..."
                                        : "Pilih Kota"}
                                </option>

                                {(cities ?? []).map((city: City) => (
                                    <option key={city.id} value={city.id}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="district_id"
                                value={form.district_id}
                                onChange={handleFormChange}
                                className="w-full border rounded-lg p-2"
                                disabled={isDistrictLoading}
                                required
                            >
                                <option value="">
                                    {isCityLoading
                                        ? "Memuat Kecamatan..."
                                        : "Pilih Kecamatan"}
                                </option>

                                {(districts ?? []).map((district: District) => (
                                    <option key={district.id} value={district.id}>
                                        {district.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                disabled={isUpdatingUrbanVillage}
                                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60"
                            >
                                {isUpdatingUrbanVillage ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete */}
            {showConfirm && (
                <ConfirmDialog
                    title="Hapus Kelurahan"
                    description={`Yakin ingin menghapus Kelurahan "${deleteTarget?.name}"?`}
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

export default UrbanVillagePage