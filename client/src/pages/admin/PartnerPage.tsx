import { ChevronDown, Plus, Trash2, User, X } from "lucide-react"
import TitleRoutesAdminPartner from "../../components/TitleRoutesAdminPartner"
import DataTable from "../../components/DataTable"
import { usePartners } from "../../hooks/partner/usePartners"
import { useMemo, useRef, useState, type ChangeEvent } from "react"
import { useCreatePartner } from "../../hooks/partner/useCreatePartner"
import { useDeletePartner } from "../../hooks/partner/useDeletePartner"
import { buildHandleDeletePartner, buildHandlePartnerFormChange, buildHandlePartnerPhotoChange, buildHandleSubmitNewPartner, buildResetPartnerForm, type PartnerFormState } from "../../handlers/partner.handler"
import type { UrbanVillage } from "../../services/urbanVillage.service"
import type { District } from "../../services/district.service"
import type { City } from "../../services/city.service"
import type { Province } from "../../services/province.service"
import { useProvinces } from "../../hooks/province/UseProvinces"
import { useCities } from "../../hooks/city/useCities"
import { useDistricts } from "../../hooks/district/useDistricts"
import { useUrbanVillages } from "../../hooks/urbanVillage/useUrbanVillages"
import type { Partner } from "../../services/partner.service"
import ConfirmDialog from "../../components/ConfirmDialog"

const PartnerPage = () => {
    const { data: partnerSResponse, isLoading: isPartnerLoading } = usePartners();
    const partners = partnerSResponse ?? [];

    const [showAddModal, setShowAddModal] = useState(false);

    const { mutate: createPartner, isPending: isPendingCreate } = useCreatePartner();
    const { mutate: deletePartner } = useDeletePartner();

    const [form, setForm] = useState<PartnerFormState>({
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

    const provinceId = useMemo(() => Number(form.address_province_id || 0), [form.address_province_id]);
    const cityId = useMemo(() => Number(form.address_city_id || 0), [form.address_city_id]);
    const districtId = useMemo(() => Number(form.address_district_id || 0), [form.address_district_id]);

    const { data: provinces, isLoading: isProvinceLoading } = useProvinces();
    const { data: cities, isLoading: isCityLoading } = useCities(provinceId);
    const { data: districts, isLoading: isDistrictLoading } = useDistricts(cityId);
    const { data: urbanVillages, isLoading: isUrbanVillageLoading } = useUrbanVillages(districtId);

    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const clearPreview = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const resetForm = buildResetPartnerForm(setForm);

    const handleChange = buildHandlePartnerFormChange(setForm);
    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        // update form.photo_profile
        buildHandlePartnerPhotoChange(setForm)(e);

        // update preview
        const file = e.target.files?.[0];
        if (!file) return;

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = buildHandleSubmitNewPartner(
        form,
        createPartner as any,
        { setShowAddModal, resetForm }
    );

    const handleDelete = buildHandleDeletePartner(deletePartner);

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        handleDelete(deleteTarget);
        setShowConfirm(false);
        setDeleteTarget(null);
    }

    const closeModal = () => {
        setShowAddModal(false);
        resetForm();
        clearPreview();
    };


    const partnerColumns = [
        {
            header: 'ID',
            accessor: 'id',
            render: (row: Partner) => <span className="text-sm font-medium text-gray-900">{row.id}</span>,
        },
        {
            header: 'Nama',
            accessor: 'fullname',
            render: (row: Partner) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                        <img src={`${row.photo_profile}`} alt="" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{row.fullname}</span>
                </div>
            ),
        },
        {
            header: 'Username',
            accessor: 'username',
            render: (row: Partner) => <span className="text-sm font-medium text-gray-900">{row.username}</span>,
        },
        {
            header: 'No. Telp',
            accessor: 'phone',
            render: (row: Partner) => <span className="text-sm font-medium text-gray-900">{row.phone}</span>,
        },
        {
            header: 'Email',
            accessor: 'email',
            render: (row: Partner) => <span className="text-sm font-medium text-gray-900">{row.email}</span>,
        },
        {
            header: 'Alamat',
            accessor: 'address',
            render: (row: Partner) => <span className="text-sm font-medium text-gray-900">{row.address}</span>,
        },
    ];

    const partnerActions = [
        {
            label: 'Hapus',
            icon: Trash2,
            color: 'text-red-600',
            hoverColor: 'bg-red-50',
            onClick: (row: Partner) => {
                setDeleteTarget(row);
                setShowConfirm(true);
            },
        },
    ];

    if (isPartnerLoading) return <p>Loading...</p>;

    return (
        <div>
            <TitleRoutesAdminPartner title="Partner" description="Kelola seluruh partner yang terdaftar.">
                <button
                    className="flex items-center gap-2 bg-[#F26A24] text-white mt-3 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                    onClick={() => setShowAddModal(true)}
                >
                    <Plus size={20} />
                    Tambah Partner
                </button>
            </TitleRoutesAdminPartner>

            <DataTable columns={partnerColumns} data={partners} actions={partnerActions} />

            {/* MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-xl overflow-hidden relative">
                        {/* close */}
                        <button
                            onClick={closeModal}
                            className="absolute right-4 top-4 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <X size={18} />
                        </button>

                        <div className="p-8">
                            {/* AVATAR */}
                            <div className="flex flex-col items-center mb-6">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden shadow-sm"
                                    title="Klik untuk pilih foto"
                                >
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-[#F26A24]" />
                                    )}
                                    <span className="absolute inset-0 rounded-full ring-2 ring-orange-200" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-3 font-semibold text-[#F26A24] hover:underline cursor-pointer"
                                >
                                    {previewUrl ? "Ubah foto" : "Tambah foto"}
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                    required
                                />
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div>
                                            <label className="text-sm text-gray-600">Username</label>
                                            <input
                                                name="username"
                                                type="text"
                                                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
                                                value={form.username}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm text-gray-600">Nama Lengkap</label>
                                            <input
                                                name="fullname"
                                                type="text"
                                                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
                                                value={form.fullname}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm text-gray-600">Nomor Telepon</label>
                                            <input
                                                name="phone"
                                                type="text"
                                                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
                                                value={form.phone}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm text-gray-600">Email</label>
                                            <input
                                                name="email"
                                                type="email"
                                                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm text-gray-600">Password</label>
                                            <input
                                                name="password"
                                                type="password"
                                                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
                                                value={form.password}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Provinsi</label>
                                        <div className="relative mt-1">
                                            <select
                                                name="address_province_id"
                                                value={form.address_province_id}
                                                onChange={handleChange}
                                                className="w-full border border-gray-200 rounded p-2 pr-10 appearance-none"
                                                disabled={isProvinceLoading}
                                                required
                                            >
                                                <option value="">
                                                    {isProvinceLoading ? "Memuat Provinsi..." : "Pilih Provinsi"}
                                                </option>

                                                {(provinces ?? []).map((province: Province) => (
                                                    <option key={province.id} value={province.id}>
                                                        {province.name}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* custom arrow */}
                                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                <ChevronDown className="w-4 h-4" />
                                            </span>
                                        </div>

                                        <label className="text-sm text-gray-600">Kota</label>
                                        <div className="relative mt-1">
                                            <select
                                                name="address_city_id"
                                                value={form.address_city_id}
                                                onChange={handleChange}
                                                className="w-full border border-gray-200 rounded p-2 pr-10 appearance-none"
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

                                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                <ChevronDown className="w-4 h-4" />
                                            </span>
                                        </div>

                                        <label className="text-sm text-gray-600">Kabupaten</label>
                                        <div className="relative mt-1">
                                            <select
                                                name="address_district_id"
                                                value={form.address_district_id}
                                                onChange={handleChange}
                                                className="w-full border border-gray-200 rounded p-2 pr-3 appearance-none"
                                                disabled={isDistrictLoading}
                                                required
                                            >
                                                <option value="">
                                                    {isDistrictLoading
                                                        ? "Memuat Kecamatan..."
                                                        : "Pilih Kecamatan"}
                                                </option>

                                                {(districts ?? []).map((district: District) => (
                                                    <option key={district.id} value={district.id}>
                                                        {district.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                <ChevronDown className="w-4 h-4" />
                                            </span>
                                        </div>

                                        <label className="text-sm text-gray-600">Kelurahan - Kode pos</label>
                                        <div className="relative mt-1">
                                            <select
                                                name="address_urban_village_id"
                                                value={form.address_urban_village_id}
                                                onChange={handleChange}
                                                className="w-full border border-gray-200 rounded p-2 pr-3 appearance-none"
                                                disabled={isUrbanVillageLoading}
                                                required
                                            >
                                                <option value="">
                                                    {isUrbanVillageLoading
                                                        ? "Memuat Kelurahan..."
                                                        : "Pilih Kelurahan"}
                                                </option>

                                                {(urbanVillages ?? []).map((urbanVillage: UrbanVillage) => (
                                                    <option key={urbanVillage.id} value={urbanVillage.id}>
                                                        {urbanVillage.name} - {urbanVillage.post_code}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                <ChevronDown className="w-4 h-4" />
                                            </span>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Detail Alamat</label>
                                            <input
                                                name="address_detail"
                                                type="text"
                                                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
                                                value={form.address_detail}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPendingCreate}
                                    className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60"
                                >
                                    {isPendingCreate ? "Membuat..." : "Buat Akun Partner"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showConfirm && (
                <ConfirmDialog
                    title="Hapus Kategori"
                    description={`Yakin ingin menghapus partner "${deleteTarget?.fullname}"?`}
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => {
                        setShowConfirm(false);
                        setDeleteTarget(null);
                    }}
                />
            )}

        </div>
    )
}

export default PartnerPage