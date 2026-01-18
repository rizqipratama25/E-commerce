import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { usePayVA } from "../../hooks/order/usePayVA";
import { usePayQRIS } from "../../hooks/order/usePayQRIS";
import { useOrderSummary } from "../../hooks/order/useOrderSummary";
import { formatRupiah } from "../../utils/function";
import type { BankCode } from "../../services/order.service";

type PaymentMode = "va" | "qris" | "";

const banks: BankCode[] = ["bca", "bni", "bri"];

const bankLabel: Record<BankCode, string> = {
    bca: "BCA",
    bni: "BNI",
    bri: "BRI",
};

function Radio({ checked }: { checked: boolean }) {
    return (
        <span
            className={[
                "inline-flex w-5 h-5 rounded-full border items-center justify-center",
                checked ? "border-[#F26A24]" : "border-gray-300",
            ].join(" ")}
        >
            {checked ? <span className="w-2.5 h-2.5 rounded-full bg-[#F26A24]" /> : null}
        </span>
    );
}


export default function PaymentMethodPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const orderId = params.get("order_id") ?? "";

    const { data: summary, isLoading: summaryLoading, isError: summaryError } =
        useOrderSummary(orderId);

    const total = useMemo(() => Number(summary?.grand_total ?? 0), [summary?.grand_total]);

    const { mutateAsync: payVA, isPending: isPayVaPending } = usePayVA();
    const { mutateAsync: payQRIS, isPending: isPayQrisPending } = usePayQRIS();

    const isPaying = isPayVaPending || isPayQrisPending;

    // ✅ ruperupa: default belum pilih
    const [mode, setMode] = useState<PaymentMode>("");

    // ✅ dropdown bank: default kosong sampai pilih VA
    const [selectedBank, setSelectedBank] = useState<BankCode | "">("");

    const canPay = useMemo(() => {
        if (!orderId) return false;
        if (summaryLoading) return false;
        if (isPaying) return false;
        if (mode === "qris") return true;
        if (mode === "va") return !!selectedBank;
        return false;
    }, [orderId, summaryLoading, isPaying, mode, selectedBank]);

    const onContinue = async () => {
        if (!orderId) return toast.error("order_id tidak ada");
        if (!canPay) return toast.error("Pilih metode pembayaran dulu");

        const toastId = toast.loading("Membuat instruksi pembayaran...");

        try {
            if (mode === "qris") {
                await payQRIS(orderId);
            } else if (mode === "va") {
                await payVA({ orderId, bank: selectedBank as BankCode });
            }

            toast.success("Metode pembayaran dipilih!", { id: toastId });
            navigate(`/payment/detail?order_id=${orderId}`);
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? "Gagal membuat pembayaran", { id: toastId });
        }
    };

    if (!orderId) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="flex-1">
                    <div className="max-w-4xl mx-auto px-4 pt-32">
                        <div className="bg-white border rounded p-4">order_id tidak ada</div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1">
                <div className="mx-auto px-30 pt-40 pb-10 ">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT: metode */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="text-lg font-bold text-gray-900 mb-2">Pilih Metode Pembayaran</div>
                            {/* Card Metode */}
                            <div className="space-y-6">
                                {/* (dummy) Uang Elektronik (nonaktif, biar mirip ruperupa) */}
                                {/* <div className="rounded-xl border border-gray-200 bg-white">
                                    <div className="px-5 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Radio checked={false} />
                                            <div className="font-semibold text-gray-900">Uang Elektronik</div>
                                        </div>
                                        <div className="text-xs text-gray-400">Belum tersedia</div>
                                    </div>
                                    <div className="px-5 pb-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-400 text-sm">
                                            gopay
                                        </div>
                                    </div>
                                </div> */}

                                {/* (dummy) Kartu Kredit/Debit (nonaktif) */}
                                {/* <div className="rounded-xl border border-gray-200 bg-white">
                                    <div className="px-5 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Radio checked={false} />
                                            <div className="font-semibold text-gray-900">Kartu Kredit / Debit Online</div>
                                        </div>
                                        <div className="text-xs text-gray-400">Belum tersedia</div>
                                    </div>
                                    <div className="px-5 pb-4 flex items-center gap-2">
                                        {["VISA", "Mastercard", "JCB", "AMEX"].map((x) => (
                                            <span
                                                key={x}
                                                className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-gray-400 text-xs font-semibold"
                                            >
                                                {x}
                                            </span>
                                        ))}
                                    </div>
                                </div> */}

                                {/* (dummy) Cicilan (nonaktif) */}
                                {/* <div className="rounded-xl border border-gray-200 bg-white">
                                    <div className="px-5 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Radio checked={false} />
                                            <div className="font-semibold text-gray-900">Cicilan Tanpa Kartu</div>
                                        </div>
                                        <div className="text-xs text-gray-400">Belum tersedia</div>
                                    </div>
                                    <div className="px-5 pb-4 flex items-center gap-2">
                                        {["Kredivo", "Indodana"].map((x) => (
                                            <span
                                                key={x}
                                                className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-gray-400 text-xs font-semibold"
                                            >
                                                {x}
                                            </span>
                                        ))}
                                    </div>
                                </div> */}

                                {/* ✅ VA (aktif) */}
                                <div className="rounded-xl border border-gray-200 bg-white">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode("va");
                                            // kalau baru pilih VA, set default bank biar mirip ruperupa (BCA)
                                            setSelectedBank((prev) => (prev ? prev : "bca"));
                                        }}
                                        className="w-full text-left px-5 py-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Radio checked={mode === "va"} />
                                            <div className="font-semibold text-gray-900">Transfer Virtual Account</div>
                                        </div>
                                    </button>

                                    <div className="px-5 pb-4">
                                        <div className="flex items-center gap-2">
                                            <img src="https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768725270/bca-logo_gzu1ie.svg" alt="BCA" />
                                            <img src="https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768725270/bni-logo_gs6b3f.svg" alt="BNI" />
                                            <img src="https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768725272/bri-logo_qfrgu5.svg" alt="BRI" />
                                        </div>

                                        {/* dropdown muncul kalau mode VA */}
                                        {mode === "va" ? (
                                            <div className="mt-4">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    Pilih Bank Yang Ingin Kamu Gunakan
                                                </div>

                                                <select
                                                    value={selectedBank}
                                                    onChange={(e) => setSelectedBank(e.target.value as BankCode)}
                                                    className="mt-2 w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-200"
                                                >
                                                    <option value="" disabled>
                                                        Pilih Bank Penyedia
                                                    </option>
                                                    {banks.map((b) => (
                                                        <option key={b} value={b}>
                                                            {bankLabel[b]}
                                                        </option>
                                                    ))}
                                                </select>

                                                <div className="mt-3 text-xs text-gray-500 space-y-1">
                                                    <div>• Lakukan pembayaran sesuai bank yang dipilih untuk kelancaran transaksi</div>
                                                    <div>• Jika terjadi kendala teknis, bank dapat membutuhkan waktu verifikasi</div>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* ✅ QRIS (aktif) */}
                                <div className="rounded-xl border border-gray-200 bg-white">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode("qris");
                                            // optional: kalau pindah ke QRIS, biarkan selectedBank tetap (ga masalah)
                                        }}
                                        className="w-full text-left px-5 py-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Radio checked={mode === "qris"} />
                                            <div className="font-semibold text-gray-900">QRIS</div>
                                        </div>
                                    </button>

                                    <div className="px-5 pb-4">
                                        {/* <div className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold">
                                            QRIS
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            Scan QR dari aplikasi pembayaran kamu.
                                        </div> */}
                                        <img src="https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768725625/qris-logo_kay3ss.svg" alt="BRI" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: ringkasan */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-32 space-y-4">
                                <div className="bg-white border border-gray-200 rounded-xl p-5">
                                    <div className="flex items-center mb-3 justify-between">
                                        <div className="font-bold text-gray-900">Ringkasan Pembayaran</div>
                                        {/* <button className="text-[#F26A24] font-bold cursor-pointer">Detail Tagihan</button> */}
                                    </div>

                                    {summaryLoading ? (
                                        <div className="text-sm text-gray-500">Memuat ringkasan...</div>
                                    ) : summaryError ? (
                                        <div className="text-sm text-red-600">Gagal memuat ringkasan.</div>
                                    ) : (
                                        <div className="space-y-2 text-sm text-gray-700">
                                            <div className="flex justify-between">
                                                <span>Total Tagihan</span>
                                                <span className="font-semibold">{formatRupiah(total)}</span>
                                            </div>

                                            <div className="flex justify-between pt-2 border-t text-base">
                                                <span className="font-bold text-gray-900">Total Pembayaran</span>
                                                <span className="font-bold text-gray-900">{formatRupiah(total)}</span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={onContinue}
                                        disabled={!canPay}
                                        className={[
                                            "mt-4 w-full h-12 rounded-lg font-bold transition",
                                            !canPay
                                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                : "bg-[#F26A24] text-white hover:brightness-95",
                                        ].join(" ")}
                                    >
                                        {isPaying ? "Memproses..." : "Bayar Sekarang"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => navigate(`/menu/riwayat-transaksi`)}
                                        className="mt-3 w-full h-10 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                                    >
                                        Kembali
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}