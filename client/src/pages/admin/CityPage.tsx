import { Edit, Plus, Trash2, X } from "lucide-react"
import TitleRoutesAdminPartner from "../../components/TitleRoutesAdminPartner"
import DataTable from "../../components/DataTable"
import { useCities } from "../../hooks/city/useCities";
import { useCreateCity } from "../../hooks/city/useCreateCity";
import { useState, type ChangeEvent } from "react";
import { useUpdateCity } from "../../hooks/city/useUpdateCity";
import { useDeleteCity } from "../../hooks/city/useDeleteCity";
import type { City } from "../../services/city.service";
import { buildHandleDeleteCity, buildHandleFormChange, buildHandleSubmitEditCity, buildHandleSubmitNewCity } from "../../handlers/city.handler";
import { useProvinces } from "../../hooks/province/UseProvinces";
import type { Province } from "../../services/province.service";
import ConfirmDialog from "../../components/ConfirmDialog";

const CityPage = () => {
  // Get City
  const { data: citiesResponse, isLoading: isCitiesLoading } = useCities();
  const cities = citiesResponse ?? [];

  // Post City
  const { mutate: createCity, isPending: isCreatingCity } = useCreateCity();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    province_id: "",
  });

  const resetForm = () => setForm({ name: "", province_id: "" });

  // Update City
  const { mutate: updateCity, isPending: isUpdatingCity } = useUpdateCity();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Delete City
  const { mutate: deleteCity } = useDeleteCity();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<City | null>(null);
  const handleDeleteCity = buildHandleDeleteCity(deleteCity);
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    handleDeleteCity(deleteTarget);
    setShowConfirm(false);
    setDeleteTarget(null);
  }

  // Get Province
  const { data: provincesResponse, isLoading: isProvinceLoading } = useProvinces();
  const provinces = provincesResponse ?? [];

  // Reset Form
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => buildHandleFormChange(e, setForm);

  const handleSubmitNewCity = buildHandleSubmitNewCity(form, createCity, { setShowAddModal, resetForm });
  const handleSubmitEditCity = buildHandleSubmitEditCity(editingId, form, updateCity, { setShowEditModal, setEditingId, resetForm });

  const cityColumns = [
    {
      header: 'ID',
      accessor: 'id',
      render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.id}</span>,
    },
    {
      header: 'Kota',
      accessor: 'city',
      render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.name}</span>,
    },
    {
      header: 'Provinsi',
      accessor: 'province',
      render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.province}</span>,
    },
  ];

  const cityActions = [
    {
      label: 'Edit',
      icon: Edit,
      color: 'text-[#F26A24]',
      hoverColor: 'bg-orange-50',
      onClick: (row: City) => {
        setEditingId(row.id);
        setForm({
          name: row.name,
          province_id: row.province_id ? String(row.province_id) : '',
        });
        setShowEditModal(true);
      },
    },
    {
      label: 'Hapus',
      icon: Trash2,
      color: 'text-red-600',
      hoverColor: 'bg-red-50',
      onClick: (row: City) => {
        setDeleteTarget(row);
        setShowConfirm(true);
      },
    },
  ];

  if (isCitiesLoading) return <p>Loading...</p>;

  return (
    <>
      <TitleRoutesAdminPartner title="Kota" description="Kelola seluruh kota yang tersedia.">
        <button className="flex items-center gap-2 bg-[#F26A24] text-white mt-3 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Tambah Kota
        </button>
      </TitleRoutesAdminPartner>

      <DataTable columns={cityColumns} data={cities} actions={cityActions} />

      {/* Modal Add */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Tambah Kota</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmitNewCity} className="space-y-4">
              {/* Nama */}
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Nama Kota"
                className="w-full border rounded-lg p-2"
                required
              />

              {/* Parent (opsional) */}
              <select
                name="province_id"
                value={form.province_id}
                onChange={handleFormChange}
                className="w-full border rounded-lg p-2"
                disabled={isProvinceLoading}
                required
              >
                {/* opsi kosong = kategori utama */}
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

              <button
                type="submit"
                disabled={isCreatingCity}
                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60"
              >
                {isCreatingCity ? "Menyimpan..." : "Simpan Kota"}
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
              <h2 className="text-xl font-bold">Edit Kota</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmitEditCity} className="space-y-4">
              {/* Nama */}
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Nama Kota"
                className="w-full border rounded-lg p-2"
                required
              />

              {/* Parent (opsional) */}
              <select
                name="province_id"
                value={form.province_id}
                onChange={handleFormChange}
                className="w-full border rounded-lg p-2"
                disabled={isProvinceLoading}
                required
              >
                {/* opsi kosong = kategori utama */}
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

              <button
                type="submit"
                disabled={isUpdatingCity}
                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60"
              >
                {isUpdatingCity ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {showConfirm && (
        <ConfirmDialog
          title="Hapus Kota"
          description={`Yakin ingin menghapus Kota "${deleteTarget?.name}"?`}
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

export default CityPage