import { X } from "lucide-react";
import { formatRupiah } from "../utils/function";
import type { MiniCart } from "../services/cart.service";

type Props = {
    open: boolean;
    onClose: () => void;
    onGoToCart: () => void;
    product?: {
        name?: string | null;
        image?: string | null;
        qty?: number;
        price?: number;
    };
    miniCart?: MiniCart | null;
    isLoadingMini?: boolean;
};

export default function AddToCartModal({
    open,
    onClose,
    onGoToCart,
    product,
    miniCart,
    isLoadingMini,
}: Props) {
    if (!open) return null;

    const items = miniCart?.items ?? [];
    const subtotal = Number(miniCart?.subtotal ?? 0);
    const totalQty = Number(miniCart?.total_qty ?? 0);

    return (
        <div className="fixed inset-0 z-999 bg-black/40 flex items-center justify-center p-4">
            <div className="w-230 max-w-full bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="text-lg font-bold text-gray-900">Berhasil Ditambahkan ke Keranjang</div>

                    <button
                        type="button"
                        className="p-2 rounded-md hover:bg-gray-100"
                        aria-label="Tutup"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Row produk yang baru ditambah */}
                    <div className="flex items-center justify-between gap-4 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-14 h-14 rounded bg-gray-100 overflow-hidden shrink-0">
                                {product?.image ? (
                                    <img src={product.image} alt={product?.name ?? "produk"} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <div className="font-semibold text-gray-900 line-clamp-1">
                                    {product?.name ?? "-"}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Qty: <span className="font-semibold">{product?.qty ?? 1}</span>{" "}
                                    {typeof product?.price === "number" ? (
                                        <>
                                            • <span className="font-semibold">{formatRupiah(product.price)}</span>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onGoToCart}
                            className="shrink-0 h-10 px-4 rounded-md bg-[#F26A24] text-white font-semibold hover:brightness-95 cursor-pointer"
                        >
                            Lihat Keranjang Saya
                        </button>
                    </div>

                    {/* Mini cart (3 item terbaru) */}
                    <div className="mt-6">
                        {/* <div className="text-base font-bold text-gray-900">Keranjang Kamu</div>
                        <div className="text-xs text-gray-500 mt-1">
                            Menampilkan {items.length} item terbaru • Total item: {totalQty}
                        </div>

                        <div className="mt-4">
                            {isLoadingMini ? (
                                <div className="text-sm text-gray-500">Memuat keranjang...</div>
                            ) : items.length === 0 ? (
                                <div className="text-sm text-gray-500">Keranjang masih kosong.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {items.map((it) => (
                                        <div
                                            key={it.id}
                                            className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition"
                                        >
                                            <div className="w-full aspect-square bg-gray-100 rounded-md overflow-hidden">
                                                {it.product?.thumbnail?.image ? (
                                                    <img
                                                        src={it.product.thumbnail.image}
                                                        alt={it.product?.name ?? "produk"}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3">
                                                <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                                                    {it.product?.name ?? "-"}
                                                </div>
                                                <div className="mt-1 text-xs text-gray-500">
                                                    Qty: <span className="font-semibold">{it.qty}</span>
                                                </div>
                                                <div className="mt-2 text-sm font-bold text-gray-900">
                                                    {formatRupiah(Number(it.price ?? 0))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div> */}

                        {/* Footer summary */}
                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                            <div className="text-sm text-gray-600">
                                Subtotal Keranjang
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                                {formatRupiah(subtotal)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}