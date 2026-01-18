import { ArrowLeft, ChevronDown, ChevronRight, Plus, Search, X } from "lucide-react"
import { useAddresses } from "../../hooks/address/useAddresses";
import { useState, type ChangeEvent } from "react";
import { buildHandleDeleteAddress, buildHandleFormChange, buildHandleSubmitEditAddress, buildHandleSubmitNewAddress } from "../../handlers/address.handler";
import { useDeleteAddress } from "../../hooks/address/useDeleteAddress";
import { type Address } from "../../services/address.service";
import { useCreateAddress } from "../../hooks/address/useCreateAddress";
import { useUpdateAddress } from "../../hooks/address/useUpdateAddress";
import { useProvinces } from "../../hooks/province/UseProvinces";
import { useCities } from "../../hooks/city/useCities";
import { useDistricts } from "../../hooks/district/useDistricts";
import { useUrbanVillages } from "../../hooks/urbanVillage/useUrbanVillages";
import type { Province } from "../../services/province.service";
import type { City } from "../../services/city.service";
import type { District } from "../../services/district.service";
import type { UrbanVillage } from "../../services/urbanVillage.service";
import ConfirmDialog from "../../components/ConfirmDialog";

const addressOptions = [
    { value: "Rumah", label: "Rumah" },
    { value: "Apartemen", label: "Apartemen" },
    { value: "Kantor", label: "Kantor" },
    { value: "Kost", label: "Kost" }
];

const AddressPage = () => {
    // Get Address
    const { data: addressResponse, isLoading: isAddressLoading } = useAddresses();
    const addresses = addressResponse ?? [];

    // Post Address
    const { mutate: createAddress, isPending: isCreatingAddress } = useCreateAddress();
    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState({
        label: "",
        receiver: "",
        phone: "",
        city_id: "",
        district_id: "",
        province_id: "",
        urban_village_id: "",
        detail: "",
    });

    // Reset Form
    const resetForm = () => setForm({
        label: "",
        receiver: "",
        phone: "",
        city_id: "",
        district_id: "",
        province_id: "",
        urban_village_id: "",
        detail: "",
    });

    // Edit Address
    const { mutate: updateAddress, isPending: isUpdatingAddress } = useUpdateAddress();
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Delete Address
    const { mutate: deleteAddress } = useDeleteAddress();
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
    const handleDeleteAddress = buildHandleDeleteAddress(deleteAddress);
    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        handleDeleteAddress(deleteTarget);
        setShowConfirm(false);
        setDeleteTarget(null);
    }

    // Get Province
    const { data: provincesResponse, isLoading: isProvinceLoading } = useProvinces();
    const provinces = provincesResponse ?? [];

    // Get City
    const { data: citiesResponse, isLoading: isCityLoading } = useCities();
    const cities = citiesResponse ?? [];

    // Get District
    const { data: districtsResponse, isLoading: isDistrictLoading } = useDistricts();
    const districts = districtsResponse ?? [];

    // Get Urban Village
    const { data: urbanVillagesResponse, isLoading: isUrbanVillageLoading } = useUrbanVillages();
    const urbanVillages = urbanVillagesResponse ?? [];

    // Show Modal Area
    const [showAreaModal, setShowAreaModal] = useState(false);

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => buildHandleFormChange(e, setForm);
    const handleSubmitNewAddress = buildHandleSubmitNewAddress(form, createAddress, { setShowAddModal, resetForm });
    const handleSubmitEditAddress = buildHandleSubmitEditAddress(editingId, form, updateAddress, { setShowEditModal, setEditingId, resetForm });

    const handleEdit = (row: Address) => {
        setEditingId(row.id);
        setForm({
            label: row.label,
            receiver: row.receiver,
            phone: row.phone,
            city_id: row.city_id ? String(row.city_id) : '',
            district_id: row.district_id ? String(row.district_id) : '',
            province_id: row.province_id ? String(row.province_id) : '',
            urban_village_id: row.urban_village_id ? String(row.urban_village_id) : '',
            detail: row.detail,
        });
        setShowEditModal(true);
    }

    const handleDelete = (row: Address) => {
        setDeleteTarget(row);
        setShowConfirm(true);
    }

    // Ambil object yang sedang dipilih berdasarkan ID di form
    const selectedProvince = provinces.find(
        (p: Province) => String(p.id) === form.province_id
    );
    const selectedCity = cities.find(
        (c: City) => String(c.id) === form.city_id
    );
    const selectedDistrict = districts.find(
        (d: District) => String(d.id) === form.district_id
    );
    const selectedUrbanVillage = urbanVillages.find(
        (u: UrbanVillage) => String(u.id) === form.urban_village_id
    );

    // Teks yang akan ditampilkan di kotak "Pilih Wilayah Administratif"
    const areaSummary =
        selectedProvince || selectedCity || selectedDistrict || selectedUrbanVillage
            ? `${selectedProvince?.name ?? ""}${selectedCity ? `, ${selectedCity.name}` : ""
            }${selectedDistrict ? `, ${selectedDistrict.name}` : ""}${selectedUrbanVillage
                ? `, ${selectedUrbanVillage.name}${
                // kalau kamu punya post_code di urban village:
                //  selectedUrbanVillage.post_code ? ` - ${selectedUrbanVillage.post_code}` : ""
                ""
                }`
                : ""
            }`
            : ""; // kosong kalau belum ada yang dipilih

    const hasArea = areaSummary !== "";


    return (
        <div className="bg-white rounded px-8 pt-6 pb-8 border border-gray-300">
            {/* Header Daftar Alamat */}
            <div className="mb-5">
                <h2 className="text-lg font-semibold">Daftar Alamat</h2>

            </div>

            {/* Search */}
            <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center w-full border border-gray-200 rounded-lg px-4 py-2 gap-3">
                    <Search className="w-5 h-5 text-[#F26A24]" />
                    <input
                        type="text"
                        placeholder="Cari alamat atau nama penerima"
                        className="flex-1 bg-transparent outline-none text-md"
                    />
                </div>
                <button className="flex items-center gap-2 rounded-md bg-[#F26A24] w-50 text-white text-sm font-semibold px-4 py-2 hover:bg-[#ff7e26]" onClick={() => setShowAddModal(true)}>
                    <Plus className="w-5 h-5" />
                    Tambah Alamat
                </button>
            </div>

            {/* Card alamat */}
            <div className="border-t border-x border-gray-300 rounded-md">
                {/* Header tabel */}
                <div className="grid grid-cols-2 text-sm font-semibold border-b border-gray-200 px-6 py-3 rounded-t-md">
                    <span className="w-lg">Informasi Penerima</span>
                    <span>Detail Alamat</span>
                </div>

                {/* Isi */}
                <div className="text-sm rounded-b-lg">
                {isAddressLoading && <p>Memuat alamat...</p>}
                {!isAddressLoading && addresses.length === 0 && <p>Tidak ada alamat yang ditemukan.</p>}
                    {addresses.map((address, index) => (
                        <div className={`grid grid-cols-2 py-4 px-6 border-b border-gray-300 rounded-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`} key={index}>
                            {/* Info penerima */}
                            <div className="w-lg">
                                <p className="font-semibold mb-1">{address.receiver}</p>
                                <p className="text-xs">{address.phone}</p>
                            </div>

                            {/* Detail alamat */}
                            <div className="text-xs">
                                <p className="font-semibold">{address.label}</p>
                                <p className="mt-1 text-gray-600 leading-snug">
                                    {address.detail}, {address.urban_village}, {address.district}, {address.city}, {address.province}, {address.post_code}
                                </p>

                                {/* <div className="mt-3">
                      <span className="inline-block rounded-full border border-[#ff6a00] bg-[#ffe8d8] text-[11px] text-[#ff6a00] px-3 py-1">
                        Koordinat Sudah Diatur
                      </span>
                    </div> */}

                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button className="px-4 py-2 text-xs border rounded-md hover:bg-gray-600 hover:text-white cursor-pointer" onClick={() => handleEdit(address)}>
                                        Ubah
                                    </button>
                                    <button className="px-4 py-1.5 text-xs border rounded-md hover:bg-gray-600 hover:text-white cursor-pointer" onClick={() => handleDelete(address)}>
                                        Hapus
                                    </button>
                                    {/* <button className="px-4 py-1.5 text-xs border rounded-md bg-[#ff6a00] text-white hover:bg-[#ff7e26]">
                        Jadikan Alamat Utama
                      </button> */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Add */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Tambah Alamat</h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowAreaModal(false);
                                    resetForm();
                                }}
                                className="p-2 rounded hover:bg-gray-100"
                            >
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitNewAddress} className="space-y-4">
                            {/* Nama */}
                            <p className="text-sm text-gray-800">Simpan Alamat Sebagai</p>

                            <div className="flex flex-wrap gap-2">
                                {addressOptions.map((opt) => {
                                    const isActive = form.label === opt.value;

                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setForm((prev) => ({ ...prev, label: opt.value }))}
                                            className={[
                                                "px-4 py-1 rounded-full text-sm border transition-colors",
                                                isActive
                                                    ? "bg-orange-100 text-black border-[#F26A24]"
                                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
                                            ].join(" ")}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* kalau mau ikut ke payload form */}
                            <div className="space-y-1">
                                <input
                                    name="label"
                                    value={form.label}
                                    type={form.label === "" ? "hidden" : "text"}
                                    onChange={handleFormChange}
                                    placeholder="Rumah"
                                    maxLength={35}
                                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F26A24]"
                                    required
                                />

                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Cth: Rumah, Kantor, Apartemen, Kost</span>
                                    <span>{form.label.length}/35</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-gray-800">Nama Penerima</p>
                                <input
                                    name="receiver"
                                    value={form.receiver}
                                    onChange={handleFormChange}
                                    placeholder=""
                                    maxLength={60}
                                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F26A24]"
                                    required
                                />

                                <div className="flex items-center justify-end text-xs text-gray-400">
                                    <span>{form.receiver.length}/60</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-gray-800">Nomor Handphone Penerima</p>

                                <div className="flex items-center">
                                    <div className="h-full p-2 bg-gray-200 border border-gray-200 rounded-l-lg font-medium">
                                        +62
                                    </div>
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleFormChange}
                                        placeholder="Tidak perlu menggunakan 0, cth: 812xxx"
                                        maxLength={13}
                                        className="w-full border border-gray-200 rounded-r-lg p-2 focus:outline-none focus:border-[#F26A24]"
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Hanya menerima nomor handphone Indonesia</span>
                                    <span>{form.phone.length}/13</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-gray-800">Alamat Lengkap dan Catatan untuk Kurir</p>
                                <textarea
                                    name="detail"
                                    value={form.detail}
                                    onChange={handleFormChange}
                                    placeholder="Masukkan nama jalan, gedung, lantai, nomor, RT/RW, dan catatan untuk kurir"
                                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F26A24]"
                                    rows={3}
                                    maxLength={350}
                                />
                                <div className="flex items-center justify-end text-xs text-gray-400">
                                    <span>{form.detail.length}/350</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-gray-800">Pilih Wilayah Administratif</p>

                                <button
                                    type="button"
                                    className="p-2 border border-gray-200 w-full rounded-lg text-start flex items-center justify-between cursor-pointer"
                                    onClick={() => setShowAreaModal(true)}
                                >
                                    <span
                                        className={`text-sm truncate ${hasArea ? "text-gray-900" : "text-gray-400"
                                            }`}
                                    >
                                        {hasArea
                                            ? areaSummary
                                            : "Pilih provinsi, kota, kecamatan dan kelurahan"}
                                    </span>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>


                            {showAreaModal && (
                                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => {
                                                        setShowAreaModal(false);
                                                    }}
                                                    className="p-2 rounded hover:bg-gray-100"
                                                >
                                                    <ArrowLeft />
                                                </button>
                                                <h2 className="text-xl font-bold">Provinsi, Kota, Kecamatan, Kelurahan</h2>
                                            </div>
                                            <h2
                                                className="text-lg text-gray-400 font-medium cursor-pointer"
                                                onClick={() => {
                                                    setForm(prev => ({
                                                        ...prev,
                                                        province_id: "",
                                                        city_id: "",
                                                        district_id: "",
                                                        urban_village_id: "",
                                                    }))
                                                }}>Reset</h2>
                                        </div>

                                        <div className="relative mb-3">
                                            <select
                                                name="province_id"
                                                value={form.province_id}
                                                onChange={handleFormChange}
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

                                        <div className="relative mb-3">
                                            <select
                                                name="city_id"
                                                value={form.city_id}
                                                onChange={handleFormChange}
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

                                        <div className="relative mb-3">
                                            <select
                                                name="district_id"
                                                value={form.district_id}
                                                onChange={handleFormChange}
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

                                        <div className="relative mb-3">
                                            <select
                                                name="urban_village_id"
                                                value={form.urban_village_id}
                                                onChange={handleFormChange}
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
                                    </div>
                                </div>
                            )}


                            <button
                                type="submit"
                                disabled={isCreatingAddress}
                                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60"
                            >
                                {isCreatingAddress ? "Menyimpan..." : "Simpan Alamat"}
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
                            <h2 className="text-xl font-bold">Edit Alamat</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setShowAreaModal(false);
                                    setEditingId(null);
                                    resetForm();
                                }}
                                className="p-2 rounded hover:bg-gray-100"
                            >
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitEditAddress} className="space-y-4">
                            {/* Nama */}
                            <p className="text-sm text-gray-800">Simpan Alamat Sebagai</p>

                            <div className="flex flex-wrap gap-2">
                                {addressOptions.map((opt) => {
                                    const isActive = form.label === opt.value;

                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setForm((prev) => ({ ...prev, label: opt.value }))}
                                            className={[
                                                "px-4 py-1 rounded-full text-sm border transition-colors",
                                                isActive
                                                    ? "bg-orange-100 text-black border-[#F26A24]"
                                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
                                            ].join(" ")}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* kalau mau ikut ke payload form */}
                            <div className="space-y-1">
                                <input
                                    name="label"
                                    value={form.label}
                                    type={form.label === "" ? "hidden" : "text"}
                                    onChange={handleFormChange}
                                    placeholder="Rumah"
                                    maxLength={35}
                                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F26A24]"
                                    required
                                />

                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Cth: Rumah, Kantor, Apartemen, Kost</span>
                                    <span>{form.label.length}/35</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-gray-800">Nama Penerima</p>
                                <input
                                    name="receiver"
                                    value={form.receiver}
                                    onChange={handleFormChange}
                                    placeholder=""
                                    maxLength={60}
                                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F26A24]"
                                    required
                                />

                                <div className="flex items-center justify-end text-xs text-gray-400">
                                    <span>{form.receiver.length}/60</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-gray-800">Nomor Handphone Penerima</p>

                                <div className="flex items-center">
                                    <div className="h-full p-2 bg-gray-200 border border-gray-200 rounded-l-lg font-medium">
                                        +62
                                    </div>
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleFormChange}
                                        placeholder="Tidak perlu menggunakan 0, cth: 812xxx"
                                        maxLength={13}
                                        className="w-full border border-gray-200 rounded-r-lg p-2 focus:outline-none focus:border-[#F26A24]"
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Hanya menerima nomor handphone Indonesia</span>
                                    <span>{form.phone.length}/13</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-gray-800">Alamat Lengkap dan Catatan untuk Kurir</p>
                                <textarea
                                    name="detail"
                                    value={form.detail}
                                    onChange={handleFormChange}
                                    placeholder="Masukkan nama jalan, gedung, lantai, nomor, RT/RW, dan catatan untuk kurir"
                                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F26A24]"
                                    rows={3}
                                    maxLength={350}
                                />
                                <div className="flex items-center justify-end text-xs text-gray-400">
                                    <span>{form.detail.length}/350</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-gray-800">Pilih Wilayah Administratif</p>

                                <button
                                    type="button"
                                    className="p-2 border border-gray-200 w-full rounded-lg text-start flex items-center justify-between cursor-pointer"
                                    onClick={() => setShowAreaModal(true)}
                                >
                                    <span
                                        className={`text-sm truncate ${hasArea ? "text-gray-900" : "text-gray-400"
                                            }`}
                                    >
                                        {hasArea
                                            ? areaSummary
                                            : "Pilih provinsi, kota, kecamatan dan kelurahan"}
                                    </span>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>


                            {showAreaModal && (
                                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => {
                                                        setShowAreaModal(false);
                                                    }}
                                                    className="p-2 rounded hover:bg-gray-100"
                                                >
                                                    <ArrowLeft />
                                                </button>
                                                <h2 className="text-xl font-bold">Provinsi, Kota, Kecamatan, Kelurahan</h2>
                                            </div>
                                            <h2
                                                className="text-lg text-gray-400 font-medium cursor-pointer"
                                                onClick={() => {
                                                    setForm(prev => ({
                                                        ...prev,
                                                        province_id: "",
                                                        city_id: "",
                                                        district_id: "",
                                                        urban_village_id: "",
                                                    }))
                                                }}>Reset</h2>
                                        </div>

                                        <div className="relative mb-3">
                                            <select
                                                name="province_id"
                                                value={form.province_id}
                                                onChange={handleFormChange}
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

                                        <div className="relative mb-3">
                                            <select
                                                name="city_id"
                                                value={form.city_id}
                                                onChange={handleFormChange}
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

                                        <div className="relative mb-3">
                                            <select
                                                name="district_id"
                                                value={form.district_id}
                                                onChange={handleFormChange}
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

                                        <div className="relative mb-3">
                                            <select
                                                name="urban_village_id"
                                                value={form.urban_village_id}
                                                onChange={handleFormChange}
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
                                    </div>
                                </div>
                            )}


                            <button
                                type="submit"
                                disabled={isUpdatingAddress}
                                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60"
                            >
                                {isUpdatingAddress ? "Menyimpan..." : "Simpan Alamat"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete */}
            {showConfirm && (
                <ConfirmDialog
                    title="Hapus Alamat"
                    description={`Yakin ingin menghapus alamat dengan nama penerima "${deleteTarget?.receiver}, nomor handphone ${deleteTarget?.phone} di alamat ${deleteTarget?.province}, ${deleteTarget?.city}, ${deleteTarget?.district}, ${deleteTarget?.urban_village}"?`}
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

export default AddressPage