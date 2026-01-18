import { useMemo } from "react";
import { X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatRupiah } from "../utils/function";
import type { MiniCart } from "../services/cart.service";

type Props = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  data?: MiniCart;
};

export default function MiniCartDropdown({ open, onClose, loading, data }: Props) {
  const navigate = useNavigate();

  const total = useMemo(() => Number(data?.subtotal ?? 0), [data?.subtotal]);
  const totalQty = useMemo(() => Number(data?.total_qty ?? 0), [data?.total_qty]);
  const items = data?.items ?? [];

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-3 w-105 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="font-semibold text-gray-900">Keranjang Belanja</div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
          aria-label="Tutup"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* body */}
      <div className="max-h-90 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Memuat keranjang...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">Keranjang kamu masih kosong.</div>
        ) : (
          <div className="">
            {items.map((it) => {
              const p = it.product;
              const thumb = p?.thumbnail?.image;

              return (
                <div key={it.id} className="p-4 flex gap-3 border-b border-gray-200">
                  {/* image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                    {thumb ? (
                      <img src={thumb} alt={p?.name ?? "Product"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {p?.name ?? "-"}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <div className="font-semibold text-gray-900">{formatRupiah(Number(it.price ?? 0))}</div>
                    </div>

                    <div className="mt-1 text-xs text-gray-600">Jumlah: {it.qty}</div>
                  </div>

                  {/* right icon (dummy, optional delete) */}
                  <button
                    type="button"
                    className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center shrink-0"
                    title="Hapus (opsional)"
                    onClick={() => {
                      // optional: kalau kamu mau hapus dari sini, perlu hook delete mini-cart item
                      // untuk sekarang biar mirip ruparupa ikon aja (no action)
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* footer */}
      <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-800">
          Total ({totalQty}):{" "}
          <span className="font-bold text-gray-900">{formatRupiah(total)}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            navigate("/cart");
          }}
          className="text-sm font-semibold text-[#F26A24] hover:underline"
        >
          Lihat Keranjang
        </button>
      </div>
    </div>
  );
}