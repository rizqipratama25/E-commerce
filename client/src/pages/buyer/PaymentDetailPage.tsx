import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Clock, Copy, RefreshCw } from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { usePaymentInfo } from "../../hooks/order/usePaymentInfo";
import { formatRupiah } from "../../utils/function";

function copyText(text: string) {
    return navigator.clipboard.writeText(text);
}

// logo (pakai punya kamu)
const BANK_LOGO: Record<string, string> = {
    bca: "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768725270/bca-logo_gzu1ie.svg",
    bni: "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768725270/bni-logo_gs6b3f.svg",
    bri: "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768725272/bri-logo_qfrgu5.svg",
};

const QRIS_LOGO =
    "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768725625/qris-logo_kay3ss.svg";

export default function PaymentDetailPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const orderId = params.get("order_id") ?? "";

    const { data, isLoading, isError, refetch, isFetching } = usePaymentInfo(orderId);

    const total = useMemo(() => Number(data?.grand_total ?? 0), [data?.grand_total]);

    const payment = data?.payment;
    const va = (payment?.va_number as string | null) ?? null;
    const qrUrl = (payment?.qr_url as string | null) ?? null;
    const trxStatus = (payment?.transaction_status as string | null) ?? null;

    const method = (payment?.method ?? "") as string; // bca|bni|bri|qris
    const type = (payment?.type ?? "") as string; // bank_transfer | qris
    const paid = data?.payment_status === "paid";

    const redirectedRef = useRef(false);

    useEffect(() => {
        const isPaid =
            paid || trxStatus === "settlement" || trxStatus === "capture";

        if (isPaid && !redirectedRef.current) {
            redirectedRef.current = true;
            toast.success("Pembayaran berhasil!");
            navigate("/menu/riwayat-transaksi", { replace: true });
        }
    }, [paid, trxStatus, navigate]);

    const expiryText = useMemo(() => {
        const raw = (data as any)?.raw_midtrans?.expiry_time || (data as any)?.payment?.expiry_time;
        if (raw) return dayjs(raw).locale("id").format("dddd, DD MMM YYYY HH:mm [WIB]");
        return dayjs().add(15, "minute").locale("id").format("dddd, DD MMM YYYY HH:mm [WIB]");
    }, [data]);

    const statusLabel = useMemo(() => {
        if (paid) return "Pembayaran Berhasil";
        if (trxStatus === "pending") return "Menunggu Pembayaran";
        if (trxStatus === "settlement") return "Pembayaran Berhasil";
        if (trxStatus === "expire") return "Pembayaran Kedaluwarsa";
        if (trxStatus === "cancel") return "Pembayaran Dibatalkan";
        if (trxStatus === "deny") return "Pembayaran Ditolak";
        return trxStatus ?? "-";
    }, [trxStatus, paid]);

    const isQRIS = type === "qris" || method === "qris";
    const isVA = !!va && !isQRIS;

    const bankName = useMemo(() => {
        if (!isVA) return null;
        const m = (method || "").toLowerCase();
        if (m === "bca") return "BCA";
        if (m === "bni") return "BNI";
        if (m === "bri") return "BRI";
        return (method || "").toUpperCase();
    }, [isVA, method]);

    const bankLogo = useMemo(() => {
        if (!isVA) return null;
        return BANK_LOGO[(method || "").toLowerCase()] ?? null;
    }, [isVA, method]);

    const onCheckStatus = async () => {
        try {
            const res = await refetch();

            const nextPaid =
                res.data?.payment_status === "paid" ||
                res.data?.payment?.transaction_status === "settlement" ||
                res.data?.payment?.transaction_status === "capture";

            if (!nextPaid) toast.success("Status pembayaran diperbarui");
        } catch {
            toast.error("Gagal cek status");
        }
    };

    if (!orderId) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
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

            <main className="flex-1 pt-40">
                <div className="max-w-lg mx-auto pb-5 bg-white shadow">

                    {/* Badge deadline (pink) */}
                    <div className="flex justify-center mb-6 w-full">
                        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-100 text-red-700 text-sm font-semibold w-full justify-center">
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-red-600" />
                                <div className="text-center">
                                    Selesaikan transaksi sebelum <div className="font-bold">{expiryText}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Utama */}
                    <div className="rounded-xl overflow-hidden">
                        {/* body */}
                        <div className="p-6">
                            {isLoading ? (
                                <div className="text-sm text-gray-500">Memuat data pembayaran...</div>
                            ) : isError ? (
                                <div className="text-sm text-red-600">Gagal memuat payment info.</div>
                            ) : !payment ? (
                                <div className="text-sm text-gray-600">
                                    Pembayaran belum dibuat. Balik ke halaman metode.
                                    <button
                                        className="ml-2 text-[#F26A24] font-semibold hover:underline"
                                        onClick={() => navigate(`/payment/method?order_id=${orderId}`)}
                                    >
                                        Pilih Metode
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    {/* Logo bank / QRIS */}
                                    <div className="w-full flex justify-center">
                                        <div className="rounded-xl bg-white flex items-center justify-center">
                                            {isVA && bankLogo ? (
                                                <img src={bankLogo} alt={bankName ?? "Bank"} className="h-13 object-contain" />
                                            ) : (
                                                <img src={QRIS_LOGO} alt="QRIS" className="h-10 object-contain" />
                                            )}
                                        </div>
                                    </div>

                                    {/* VA section (rupArupa style) */}
                                    {isVA ? (
                                        <>
                                            <div className="mt-6 text-sm text-gray-600">
                                                Nomor Virtual Account Bank {bankName}
                                            </div>

                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="text-xl md:text-2xl font-bold tracking-wider text-gray-900">
                                                    {va}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        try {
                                                            await copyText(va);
                                                            toast.success("Nomor VA disalin");
                                                        } catch {
                                                            toast.error("Gagal menyalin");
                                                        }
                                                    }}
                                                    className="text-[#F26A24] font-semibold text-sm cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-1"><Copy className="w-4 h-4 text-[#F26A24]" /> Salin</div>
                                                </button>
                                            </div>
                                        </>
                                    ) : null}

                                    {/* QRIS section (rupArupa style) */}
                                    {isQRIS ? (
                                        <div className="mt-6 w-full flex flex-col items-center">
                                            {qrUrl ? (
                                                <div className="w-65 md:w-[320px] rounded-xl border border-gray-200 bg-white p-4">
                                                    <img
                                                        src={qrUrl}
                                                        alt="QRIS"
                                                        className="w-full aspect-square object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-600">
                                                    QR belum tersedia, coba refresh status.
                                                </div>
                                            )}
                                        </div>
                                    ) : null}

                                    {/* Cek status pembayaran */}
                                    <button
                                        type="button"
                                        onClick={onCheckStatus}
                                        className="mt-5 inline-flex items-center gap-2 text-[#1d71b8] font-semibold hover:underline"
                                        disabled={isFetching}
                                    >
                                        Cek Status Pembayaran
                                        <RefreshCw className={["w-4 h-4", isFetching ? "animate-spin" : ""].join(" ")} />
                                    </button>

                                    {/* Card total + detail pembayaran (mirip rupArupa) */}
                                    <div className="mt-5 w-full rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-3 bg-white">
                                            <div>
                                                <div className="text-xs text-gray-500">Total Pembayaran</div>
                                                <div className="text-base font-bold text-gray-900">{formatRupiah(total)}</div>
                                            </div>

                                            {/* <button
                                                type="button"
                                                onClick={() => toast("Nanti bisa dibuat modal detail tagihan")}
                                                className="h-9 px-4 rounded-lg border border-[#F26A24] text-[#F26A24] font-semibold hover:bg-[#F26A24] hover:text-white cursor-pointer"
                                            >
                                                Detail Pembayaran
                                            </button> */}
                                        </div>

                                        {/* info biru */}
                                        <div className="px-4 py-3 bg-sky-50 text-sky-900 text-sm">
                                            {isVA ? (
                                                <div className="flex gap-2">
                                                    <span className="font-bold">i</span>
                                                    <div>
                                                        Khusus untuk transaksi dengan menggunakan kode voucher, pembayaran harus dilakukan maksimal{" "}
                                                        <span className="font-semibold">4 (empat) jam</span> setelah pesanan kamu kami terima.
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <span className="font-bold">i</span>
                                                    <div>
                                                        Apabila terdapat gangguan pada sistem pembayaran kami, dana akan dikembalikan maksimal{" "}
                                                        <span className="font-semibold">15 hari</span> kedepan.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 w-full grid grid-cols-1 gap-3">
                                        {/* <button
                                            type="button"
                                            onClick={() => toast("Nanti bikin halaman / modal instruksi cara bayar")}
                                            className="h-12 rounded-lg bg-[#F26A24] text-white font-bold hover:brightness-95 cursor-pointer"
                                        >
                                            Lihat Cara Bayar
                                        </button> */}

                                        <button
                                            type="button"
                                            onClick={() => navigate(`/payment/method?order_id=${orderId}`)}
                                            className="h-12 rounded-lg border border-[#F26A24] hover:bg-[#F26A24] text-[#F26A24] hover:text-white cursor-pointer font-bold"
                                        >
                                            Ubah Metode Pembayaran
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}