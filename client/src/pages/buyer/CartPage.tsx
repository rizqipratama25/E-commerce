import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { formatRupiah } from "../../utils/function";

import { useCart } from "../../hooks/cart/useCart";
import { useUpdateCartItem } from "../../hooks/cart/useUpdateCartItem";
import { useDeleteCartItem } from "../../hooks/cart/useDeleteCartItem";
import { useCheckoutFromCart } from "../../hooks/checkout/useCheckoutFromCart";

import type { CartItem } from "../../services/cart.service";

const NOTE_MAX = 140;

export default function CartPage() {
  const navigate = useNavigate();

  const { data: cart, isLoading } = useCart();
  const { mutate: updateCartItem, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: deleteCartItem, isPending: isDeleting } = useDeleteCartItem();
  const { mutate: checkoutFromCart, isPending: isCheckoutLoading } = useCheckoutFromCart();

  const items: CartItem[] = cart?.items ?? [];

  // selected item ids
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // ===== inline note state
  const [openNoteFor, setOpenNoteFor] = useState<number | null>(null); // cart_item_id
  const [noteDraftById, setNoteDraftById] = useState<Record<number, string>>({});

  // auto select all first load
  useEffect(() => {
    if (!items.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds((prev) => (prev.length ? prev : items.map((it) => it.id)));
  }, [items]);

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(items.map((it) => it.id));
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedItems = useMemo(() => {
    const set = new Set(selectedIds);
    return items.filter((it) => set.has(it.id));
  }, [items, selectedIds]);

  const subtotalSelected = useMemo(() => {
    return selectedItems.reduce((sum, it) => sum + Number(it.line_total ?? 0), 0);
  }, [selectedItems]);

  const selectedCount = selectedItems.length;

  const handleIncrease = (item: CartItem) => {
    const productStock = item.product?.stock ?? 0;
    const nextQty = (item.qty ?? 1) + 1;

    if (productStock && nextQty > productStock) return toast.error("Qty melebihi stok");

    updateCartItem(
      { cartItemId: item.id, payload: { qty: nextQty } },
      { onError: (e: any) => toast.error(e?.response?.data?.message ?? "Gagal update qty") }
    );
  };

  const handleDecrease = (item: CartItem) => {
    const nextQty = Math.max(1, (item.qty ?? 1) - 1);

    updateCartItem(
      { cartItemId: item.id, payload: { qty: nextQty } },
      { onError: (e: any) => toast.error(e?.response?.data?.message ?? "Gagal update qty") }
    );
  };

  const handleDelete = (item: CartItem) => {
    const ok = window.confirm("Hapus produk dari keranjang?");
    if (!ok) return;

    deleteCartItem(item.id, {
      onSuccess: () => {
        setSelectedIds((prev) => prev.filter((x) => x !== item.id));
        // kalau note panel sedang kebuka, tutup
        if (openNoteFor === item.id) setOpenNoteFor(null);
        toast.success("Produk dihapus");
      },
      onError: (e: any) => toast.error(e?.response?.data?.message ?? "Gagal hapus"),
    });
  };

  const handleCheckout = () => {
    if (!selectedIds.length) return toast.error("Pilih minimal 1 produk untuk checkout");

    checkoutFromCart(selectedIds, {
      onSuccess: (data) => navigate(`/checkout?checkout_id=${data.checkout_id}`),
      onError: (e: any) => toast.error(e?.response?.data?.message ?? "Gagal membuat checkout"),
    });
  };

  // ===== inline note handlers
  const openInlineNote = (item: CartItem) => {
    setOpenNoteFor(item.id);

    setNoteDraftById((prev) => {
      // kalau sudah ada draft, jangan overwrite
      if (typeof prev[item.id] === "string") return prev;
      return {
        ...prev,
        [item.id]: (item.note ?? "").slice(0, NOTE_MAX),
      };
    });
  };

  const closeInlineNote = (itemId: number) => {
    setOpenNoteFor((cur) => (cur === itemId ? null : cur));
  };

  const onChangeNote = (itemId: number, value: string) => {
    const clipped = value.slice(0, NOTE_MAX);
    setNoteDraftById((prev) => ({ ...prev, [itemId]: clipped }));
  };

  const saveNote = (itemId: number) => {
    const note = (noteDraftById[itemId] ?? "").trim();

    updateCartItem(
      { cartItemId: itemId, payload: { note } },
      {
        onSuccess: () => {
          toast.success("Catatan disimpan");
          setOpenNoteFor(null);
        },
        onError: (e: any) => toast.error(e?.response?.data?.message ?? "Gagal simpan catatan"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-32">
          <div className="text-sm text-gray-500">Memuat keranjang...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto px-30 pt-35">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Keranjang Belanja</h1>
              {/* Header pilih semua */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-[#F26A24]"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                  <span className="text-sm font-semibold text-gray-800">Pilih Semua</span>
                </label>

                <div className="text-sm text-[#F26A24] font-semibold flex items-center gap-4">
                  <button
                    type="button"
                    className="hover:underline cursor-pointer"
                    onClick={() => {
                      if (!selectedIds.length) return toast.error("Pilih produk yang mau dihapus");
                      const ok = window.confirm("Hapus semua produk yang dicentang?");
                      if (!ok) return;
                      selectedItems.forEach((it) => handleDelete(it));
                    }}
                  >
                    Hapus Produk
                  </button>
                </div>
              </div>

              {/* Section title */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-5 h-5 opacity-0 pointer-events-none" />
                  <div className="text-sm font-semibold text-gray-800">
                    Diproses dari <span className="font-bold">Toko Terdekat</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white rounded-lg border border-gray-200">
                {items.length === 0 && (
                  <div className="p-6 text-sm text-gray-500">Keranjang kamu masih kosong.</div>
                )}

                {items.map((item) => {
                  const p = item.product;
                  const isChecked = selectedIds.includes(item.id);
                  const noteOpen = openNoteFor === item.id;
                  const noteValue = noteDraftById[item.id] ?? (item.note ?? "");
                  const hasSavedNote = (item.note ?? "").trim().length > 0;

                  return (
                    <div key={item.id} className="border-b border-gray-200 p-4">
                      <div className="flex gap-4">
                        {/* checkbox */}
                        <div className="pt-2 self-center">
                          <input
                            type="checkbox"
                            className="w-5 h-5 accent-[#F26A24]"
                            checked={isChecked}
                            onChange={() => toggleSelectOne(item.id)}
                          />
                        </div>

                        {/* image */}
                        <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden">
                          {p?.thumbnail?.image ? (
                            <img src={p.thumbnail.image} alt={p?.name ?? "Product"} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 leading-snug truncate">
                                {p?.name ?? "-"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {formatRupiah(Number(item.price))}
                              </div>

                              {!p?.is_active && (
                                <div className="text-xs text-red-500 mt-1">
                                  Produk nonaktif (tidak bisa checkout)
                                </div>
                              )}
                              {p?.stock === 0 && <div className="text-xs text-red-500 mt-1">Stok habis</div>}
                            </div>

                            {/* actions */}
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                title="Hapus"
                              >
                                <Trash2 className="w-5 h-5 text-gray-700" />
                              </button>

                              {/* qty */}
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => handleDecrease(item)}
                                  disabled={isUpdating || item.qty <= 1}
                                  className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-60"
                                >
                                  –
                                </button>
                                <div className="w-12 h-10 flex items-center justify-center text-sm font-semibold">
                                  {item.qty}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleIncrease(item)}
                                  disabled={isUpdating}
                                  className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-60"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* ===== note section (ruparupa style) ===== */}
                          {!noteOpen && (
                            <button
                              type="button"
                              className="mt-3 text-sm text-[#F26A24] font-semibold hover:underline"
                              onClick={() => openInlineNote(item)}
                            >
                              {hasSavedNote ? "Ubah Catatan" : "Tambah Catatan"}
                            </button>
                          )}

                          {noteOpen && (
                            <div className="mt-3">
                              <div className="text-xs text-gray-600 mb-2">Tulis Catatan Di Sini</div>

                              <textarea
                                rows={2}
                                value={noteValue}
                                onChange={(e) => onChangeNote(item.id, e.target.value)}
                                placeholder="Contoh: Tolong bungkus rapi ya..."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#F26A24]"
                              />

                              <div className="flex items-center justify-between mt-1">
                                <button
                                  type="button"
                                  className="text-sm text-[#F26A24] font-semibold hover:underline"
                                  onClick={() => saveNote(item.id)}
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? "Menyimpan..." : "Simpan Catatan"}
                                </button>

                                <div className="text-xs text-gray-400">
                                  {(noteValue?.length ?? 0)}/{NOTE_MAX}
                                </div>
                              </div>

                              <button
                                type="button"
                                className="mt-2 text-xs text-gray-400 hover:text-gray-600"
                                onClick={() => closeInlineNote(item.id)}
                                disabled={isUpdating}
                              >
                                Batal
                              </button>
                            </div>
                          )}

                          {/* preview catatan kalau sudah tersimpan */}
                          {!noteOpen && hasSavedNote && (
                            <div className="mt-2 text-xs text-gray-600">
                              <span className="font-semibold">Catatan:</span>{" "}
                              <span className="wrap-break-word">{item.note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(isDeleting || isUpdating) && (
                <div className="text-xs text-gray-500">
                  {isDeleting ? "Menghapus item..." : "Memproses perubahan..."}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-32">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Detail Rincian Pembayaran</h2>

                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Subtotal Harga ({selectedCount} produk)</span>
                    <span className="font-semibold">{formatRupiah(subtotalSelected)}</span>
                  </div>

                  <div className="flex justify-between text-gray-400">
                    <span>Promo Produk</span>
                    <span>-</span>
                  </div>

                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-semibold">Total Pembayaran</span>
                    <span className="text-lg font-bold">{formatRupiah(subtotalSelected)}</span>
                  </div>

                  <div className="text-xs text-gray-400">Belum termasuk ongkos kirim</div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={
                    isCheckoutLoading ||
                    selectedCount === 0 ||
                    selectedItems.some((it) => !it.product?.is_active)
                  }
                  className="mt-5 w-full bg-[#F26A24] text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60"
                >
                  {isCheckoutLoading ? "Memproses..." : "Lanjut Bayar"}
                </button>

                {selectedItems.some((it) => !it.product?.is_active) && (
                  <div className="text-xs text-red-500 mt-2">
                    Ada produk nonaktif di pilihan kamu. Hapus/ubah pilihan dulu.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}