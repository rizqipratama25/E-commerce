import { Edit, Plus, Trash2, X } from "lucide-react"
import TitleRoutesAdminPartner from "../../components/TitleRoutesAdminPartner"
import { useDistricts } from "../../hooks/district/useDistricts";
import { useMemo, useState, type ChangeEvent } from "react";
import { useCreateDistrict } from "../../hooks/district/useCreateDistrict";
import { buildHandleDeleteDistrict, buildHandleFormChange, buildHandleSubmitEditDistrict, buildHandleSubmitNewDistrict } from "../../handlers/district.handler";
import { useDeleteDistrict } from "../../hooks/district/useDeleteDistrict";
import { useUpdateDistrict } from "../../hooks/district/useUpdateDistrict";
import type { District } from "../../services/district.service";
import DataTable from "../../components/DataTable";
import { useProvinces } from "../../hooks/province/UseProvinces";
import { useCities } from "../../hooks/city/useCities";
import type { Province } from "../../services/province.service";
import type { City } from "../../services/city.service";
import ConfirmDialog from "../../components/ConfirmDialog";

const DistrictPage = () => {
  // Get District
  const { data: districtsResponse, isLoading: isDistrictsLoading } = useDistricts();
  const districts = districtsResponse ?? [];

  // Post District
  const { mutate: createDistrict, isPending: isCreatingDistrict } = useCreateDistrict();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city_id: "",
    province_id: "",
  });

  // Edit District
  const { mutate: updateDistrict, isPending: isUpdatingDistrict } = useUpdateDistrict();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Delete District
  const { mutate: deleteDistrict } = useDeleteDistrict();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<District | null>(null);
  const handleDeleteDistrict = buildHandleDeleteDistrict(deleteDistrict);
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    handleDeleteDistrict(deleteTarget);
    setShowConfirm(false);
    setDeleteTarget(null);
  }

  const provinceId = useMemo(() => Number(form.province_id || 0), [form.province_id]);

  // Get Province
  const { data: provincesResponse, isLoading: isProvinceLoading } = useProvinces();
  const provinces = provincesResponse ?? [];

  // Get City
  const { data: citiesResponse, isLoading: isCityLoading } = useCities(provinceId);
  const cities = citiesResponse ?? [];

  // Reset Form
  const resetForm = () => setForm({ name: "", city_id: "", province_id: "" });
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => buildHandleFormChange(e, setForm);
  const handleSubmitNewDistrict = buildHandleSubmitNewDistrict(form, createDistrict, { setShowAddModal, resetForm });
  const handleSubmitEditDistrict = buildHandleSubmitEditDistrict(editingId, form, updateDistrict, { setShowEditModal, setEditingId, resetForm });

  const districtColumns = [
    {
      header: 'ID',
      accessor: 'id',
      render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.id}</span>,
    },
    {
      header: 'Kecamatan',
      accessor: 'district',
      render: (row: any) => <span className="text-sm font-medium text-gray-900">{row.name}</span>,
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

  const districtActions = [
    {
      label: 'Edit',
      icon: Edit,
      color: 'text-[#F26A24]',
      hoverColor: 'bg-orange-50',
      onClick: (row: District) => {
        setEditingId(row.id);
        setForm({
          name: row.name,
          city_id: row.city_id ? String(row.city_id) : '',
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
      onClick: (row: District) => {
        setDeleteTarget(row);
        setShowConfirm(true);
      },
    },
  ];

  if (isDistrictsLoading) return <div>Loading...</div>;

  return (
    <>
      <TitleRoutesAdminPartner title="Kecamatan" description="Kelola seluruh kecamatan yang tersedia.">
        <button className="flex items-center gap-2 bg-[#F26A24] text-white mt-3 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Tambah Kecamatan
        </button>
      </TitleRoutesAdminPartner>

      <DataTable columns={districtColumns} data={districts} actions={districtActions} />

      {/* Modal Add */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Tambah Kecamatan</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmitNewDistrict} className="space-y-4">
              {/* Nama */}
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Nama Kecamatan"
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

              <button
                type="submit"
                disabled={isCreatingDistrict}
                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60"
              >
                {isCreatingDistrict ? "Menyimpan..." : "Simpan Kecamatan"}
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
              <h2 className="text-xl font-bold">Edit Kecamatan</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmitEditDistrict} className="space-y-4">
              {/* Nama */}
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Nama Kecamatan"
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

              <button
                type="submit"
                disabled={isUpdatingDistrict}
                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60"
              >
                {isUpdatingDistrict ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {showConfirm && (
        <ConfirmDialog
          title="Hapus Kecamatan"
          description={`Yakin ingin menghapus Kecamatan "${deleteTarget?.name}"?`}
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

export default DistrictPage