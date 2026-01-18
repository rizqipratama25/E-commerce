import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, MapPin } from "lucide-react";

import { usePartnerAddress } from "../../hooks/partnerAddress/usePartnerAddress";
import { useUpdatePartnerAddress } from "../../hooks/partnerAddress/useUpdatePartnerAddress";

import { useProvinces } from "../../hooks/province/UseProvinces";
import { useCities } from "../../hooks/city/useCities";
import { useDistricts } from "../../hooks/district/useDistricts";
import { useUrbanVillages } from "../../hooks/urbanVillage/useUrbanVillages";

import type { Province } from "../../services/province.service";
import type { City } from "../../services/city.service";
import type { District } from "../../services/district.service";
import type { UrbanVillage } from "../../services/urbanVillage.service";

import {
    buildHandlePartnerAddressChange,
    buildHandleSubmitPartnerAddress,
    type PartnerAddressFormState,
} from "../../handlers/partnerAddress.handler";
import TitleRoutesAdminPartner from "../../components/TitleRoutesAdminPartner";

export default function AddressPartnerPage() {
    const { data: address, isLoading: isLoadingAddress } = usePartnerAddress();
    const { mutate: updateAddress, isPending } = useUpdatePartnerAddress();

    const { data: provinces, isLoading: isProvinceLoading } = useProvinces();

    const [form, setForm] = useState<PartnerAddressFormState>({
        province_id: "",
        city_id: "",
        district_id: "",
        urban_village_id: "",
        detail: "",
    });

    // parent ids for cascading queries
    const provinceId = useMemo(() => Number(form.province_id || 0), [form.province_id]);
    const cityId = useMemo(() => Number(form.city_id || 0), [form.city_id]);
    const districtId = useMemo(() => Number(form.district_id || 0), [form.district_id]);

    const { data: cities, isLoading: isCityLoading } = useCities(provinceId);
    const { data: districts, isLoading: isDistrictLoading } = useDistricts(cityId);
    const { data: urbanVillages, isLoading: isUrbanVillageLoading } = useUrbanVillages(districtId);

    // hydrate form from existing address
    useEffect(() => {
        if (!address) return;

        setForm({
            province_id: String(address.province_id ?? ""),
            city_id: String(address.city_id ?? ""),
            district_id: String(address.district_id ?? ""),
            urban_village_id: String(address.urban_village_id ?? ""),
            detail: address.detail ?? "",
        });
    }, [address]);

    const handleChange = buildHandlePartnerAddressChange(setForm);
    const handleSubmit = buildHandleSubmitPartnerAddress(form, updateAddress as any);

    // label preview address string
    const previewText = useMemo(() => {
        if (!address) return "-";
        const uv = address.urban_village;
        const dist = address.district;
        const city = address.city;
        const prov = address.province;
        const post = address.post_code;

        // kalau backend kamu ngirim stringnya beda-beda, ini fallback saja
        return [uv, dist, city, prov, post].filter(Boolean).join(", ");
    }, [address]);

    if (isLoadingAddress) return <div className="p-6">Memuat alamat...</div>;

    return (
        <div>
            <TitleRoutesAdminPartner title="Alamat saat ini" description="Kelola alamat"/>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* LEFT: PREVIEW */}
                <div className="lg:col-span-1">
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-[#F26A24]" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Alamat Saat Ini</p>
                                <p className="mt-1 text-sm text-gray-600">{previewText}</p>
                                {address?.detail ? (
                                    <p className="mt-1 text-xs text-gray-500">{address.detail}</p>
                                ) : null}
                            </div>
                        </div>

                        <div className="mt-4 text-xs text-gray-500">
                            Pastikan provinsi/kota/kecamatan/kelurahan sesuai agar pengiriman akurat.
                        </div>
                    </div>
                </div>

                {/* RIGHT: FORM */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Provinsi */}
                            <div>
                                <label className="text-sm text-gray-600">Provinsi</label>
                                <div className="relative mt-1">
                                    <select
                                        name="province_id"
                                        value={form.province_id}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg p-2 pr-10 appearance-none"
                                        disabled={isProvinceLoading}
                                        required
                                    >
                                        <option value="">
                                            {isProvinceLoading ? "Memuat Provinsi..." : "Pilih Provinsi"}
                                        </option>
                                        {(provinces ?? []).map((p: Province) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    </span>
                                </div>
                            </div>

                            {/* Kota */}
                            <div>
                                <label className="text-sm text-gray-600">Kota</label>
                                <div className="relative mt-1">
                                    <select
                                        name="city_id"
                                        value={form.city_id}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg p-2 pr-10 appearance-none"
                                        disabled={!form.province_id || isCityLoading}
                                        required
                                    >
                                        <option value="">
                                            {!form.province_id
                                                ? "Pilih provinsi dulu"
                                                : isCityLoading
                                                    ? "Memuat Kota..."
                                                    : "Pilih Kota"}
                                        </option>
                                        {(cities ?? []).map((c: City) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    </span>
                                </div>
                            </div>

                            {/* Kecamatan */}
                            <div>
                                <label className="text-sm text-gray-600">Kecamatan</label>
                                <div className="relative mt-1">
                                    <select
                                        name="district_id"
                                        value={form.district_id}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg p-2 pr-10 appearance-none"
                                        disabled={!form.city_id || isDistrictLoading}
                                        required
                                    >
                                        <option value="">
                                            {!form.city_id
                                                ? "Pilih kota dulu"
                                                : isDistrictLoading
                                                    ? "Memuat Kecamatan..."
                                                    : "Pilih Kecamatan"}
                                        </option>
                                        {(districts ?? []).map((d: District) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    </span>
                                </div>
                            </div>

                            {/* Kelurahan */}
                            <div>
                                <label className="text-sm text-gray-600">Kelurahan - Kode Pos</label>
                                <div className="relative mt-1">
                                    <select
                                        name="urban_village_id"
                                        value={form.urban_village_id}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg p-2 pr-10 appearance-none"
                                        disabled={!form.district_id || isUrbanVillageLoading}
                                        required
                                    >
                                        <option value="">
                                            {!form.district_id
                                                ? "Pilih kecamatan dulu"
                                                : isUrbanVillageLoading
                                                    ? "Memuat Kelurahan..."
                                                    : "Pilih Kelurahan"}
                                        </option>
                                        {(urbanVillages ?? []).map((u: UrbanVillage) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} - {u.post_code}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    </span>
                                </div>
                            </div>

                            {/* Detail */}
                            <div>
                                <label className="text-sm text-gray-600">Detail Alamat</label>
                                <input
                                    name="detail"
                                    value={form.detail}
                                    onChange={handleChange}
                                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
                                    placeholder="Contoh: Jl. Pendidikan No. 2, RT 01/RW 02"
                                    required
                                />
                            </div>

                            {/* Submit */}
                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="bg-[#F26A24] text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60"
                                    onClick={() => {
                                        if (!form.province_id) toast.dismiss(); // optional no-op
                                    }}
                                >
                                    {isPending ? "Menyimpan..." : "Simpan Alamat"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
