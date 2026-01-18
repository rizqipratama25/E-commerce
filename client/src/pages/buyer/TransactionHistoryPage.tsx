// TransactionHistoryPage.tsx
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Hourglass,
  Package,
  Search,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import NotFoundTransaction from "../../assets/not_found_transaction.png";
import type { OrderStatus } from "../../services/order.service";
import { useOrders } from "../../hooks/order/useOrders";
import { formatRupiah } from "../../utils/function";
import dayjs from "dayjs";
import { useOrderStatusFilters } from "../../hooks/order/useOrderStatusFilters";
import { useOrderDateFilter } from "../../hooks/order/useOrderDateFilter";
import OrderDateFilterDropdown from "../../components/OrderDateFilterDropdown";
import { useOrderBrandIdFilters } from "../../hooks/order/useOrderBrandIdFilters";
import { useSearchParams } from "react-router-dom";
import { usePartners } from "../../hooks/partner/usePartners";
import toast from "react-hot-toast";
import { useReceiveOrderItemByBuyer } from "../../hooks/order/useReceiveOrderItemByBuyer";

const statusOptions: { label: string; value: OrderStatus }[] = [
  { label: "Sedang Diproses", value: "process" },
  { label: "Pengiriman", value: "shipping" },
  { label: "Pesanan Telah Diterima", value: "completed" },
  { label: "Menunggu Konfirmasi Kamu", value: "delivered" },
];

type ShipmentStatus = "draft" | "process" | "shipping" | "delivered" | "completed" | "cancelled";

const renderShipmentStatusBadge = (status: ShipmentStatus) => {
  if (status === "delivered") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <Hourglass className="w-4 h-4" />
        Menunggu Konfirmasi Kamu
      </div>
    );
  }
  if (status === "completed") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle className="w-4 h-4" />
        Pesanan Selesai
      </div>
    );
  }
  if (status === "shipping") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
        <Truck className="w-4 h-4" />
        Sedang Dikirim
      </div>
    );
  }
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        ✕ Dibatalkan
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
      <Clock className="w-4 h-4" />
      Sedang Diproses
    </div>
  );
};

// helper: baca status received dari backend (support 2 model)
const isItemReceived = (it: any): boolean => {
  if (typeof it?.is_received === "boolean") return it.is_received;
  if (it?.received_at) return true;
  return false;
};

export default function TransactionHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isOpenStatus, setIsOpenStatus] = useState(false);
  const [isOpenCalendar, setIsOpenCalendar] = useState(false);
  const [isOpenOfficialStore, setIsOpenOfficialStore] = useState(false);

  const { selectedStatuses, toggleStatus, clearStatuses } = useOrderStatusFilters();
  const { applied, openDraftFromApplied } = useOrderDateFilter();
  const { selectedBrandId, toogleBrandId, clearBrandId } = useOrderBrandIdFilters();

  const { data: partnersResponse, isLoading: partnersLoading } = usePartners();
  const partners = partnersResponse ?? [];

  // ✅ receive per item
  const { mutate: receiveItemMutate, isPending: isReceiving } = useReceiveOrderItemByBuyer();
  const [receivingItemId, setReceivingItemId] = useState<number | string | null>(null);

  // ✅ SEARCH state + debounce
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchInput.trim()), 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  const params = useMemo(() => {
    return {
      statuses: selectedStatuses,
      brand_id: selectedBrandId,
      date: applied.preset || undefined,
      start_date: applied.start_date || undefined,
      end_date: applied.end_date || undefined,
      q: debouncedQ || undefined,
    };
  }, [selectedStatuses, selectedBrandId, applied.preset, applied.start_date, applied.end_date, debouncedQ]);

  const { data: orders } = useOrders(params);

  const handleOpenStatusFilter = () => {
    setIsOpenStatus((v) => !v);
    setIsOpenCalendar(false);
    setIsOpenOfficialStore(false);
  };

  const handleOpenCalendarFilter = () => {
    openDraftFromApplied();
    setIsOpenCalendar((v) => !v);
    setIsOpenStatus(false);
    setIsOpenOfficialStore(false);
  };

  const handleOpenOfficialStoreFilter = () => {
    setIsOpenOfficialStore((v) => !v);
    setIsOpenStatus(false);
    setIsOpenCalendar(false);
  };

  const handleResetFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("status[]");
    next.delete("brand_id[]");
    next.delete("date");
    next.delete("start_date");
    next.delete("end_date");
    setSearchParams(next, { replace: true });

    setSearchInput("");
    setDebouncedQ("");

    setIsOpenStatus(false);
    setIsOpenCalendar(false);
    setIsOpenOfficialStore(false);
  };

  const onReceiveItem = (orderItemId: number | string) => {
    const toastId = toast.loading("Mengonfirmasi barang diterima...");
    setReceivingItemId(orderItemId);

    receiveItemMutate(orderItemId, {
      onSuccess: () => {
        toast.success("Barang berhasil dikonfirmasi diterima!", { id: toastId });
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? "Gagal mengonfirmasi barang", { id: toastId });
      },
      onSettled: () => {
        setReceivingItemId(null);
      },
    });
  };

  return (
    <div className="bg-white rounded px-8 pt-6 pb-8 border border-gray-300">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Transaksi</h2>

        {/* SEARCH */}
        <div className="mt-2">
          <div className="flex items-center w-full border border-gray-300 rounded-md px-2">
            <Search className="w-5 h-5 text-[#F26A24]" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              placeholder="Cari Nama Produk/No. Transaksi"
              className="w-full px-2 py-1 focus:outline-none focus:border-[#F26A24]"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="clear search"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            ) : null}
          </div>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-3 gap-2 py-3">
          {/* STATUS */}
          <div className="relative">
            <button
              onClick={handleOpenStatusFilter}
              className="flex items-center justify-between border border-gray-300 rounded-lg transition-colors w-full"
            >
              <div className="w-full">
                <div className="w-full flex items-center justify-between border-gray-300 py-2 px-3">
                  <span className="font-semibold text-sm">Semua Status Pesanan</span>
                  <ChevronDown className={`w-5 h-5 transition-transform font-semibold ${isOpenStatus ? "rotate-180" : ""}`} />
                </div>
              </div>
            </button>

            {isOpenStatus && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden px-4">
                <div className="flex items-center justify-end w-full pt-2 text-gray-300 font-semibold">
                  <button className="cursor-pointer" onClick={() => clearStatuses()}>
                    Hapus
                  </button>
                </div>

                {statusOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                    <div className="flex items-center justify-between w-full py-2">
                      <span className="text-base font-semibold">{opt.label}</span>
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(opt.value)}
                        onChange={() => toggleStatus(opt.value)}
                        className="w-5 h-5"
                      />
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* DATE */}
          <div className="relative">
            <button
              onClick={handleOpenCalendarFilter}
              className="flex items-center justify-between border border-gray-300 rounded-lg transition-colors w-full"
            >
              <div className="w-full">
                <div className="w-full flex items-center justify-between border-gray-300 py-2 px-3">
                  <span className="font-semibold text-sm">Tanggal Transaksi</span>
                  <Calendar className="w-5 h-5 transition-transform font-semibold" />
                </div>
              </div>
            </button>

            {isOpenCalendar && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden p-3 w-205">
                <OrderDateFilterDropdown />
              </div>
            )}
          </div>

          {/* BRAND */}
          <div className="relative">
            <div className="flex items-center justify-between">
              <button
                onClick={handleOpenOfficialStoreFilter}
                className="flex items-center justify-between border border-gray-300 rounded-lg transition-colors w-full"
              >
                <div className="w-full">
                  <div className="w-full flex items-center justify-between border-gray-300 py-2 px-3">
                    <span className="font-semibold text-sm">Official Store</span>
                    <ChevronDown className={`w-5 h-5 transition-transform font-semibold ${isOpenOfficialStore ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </button>

              {isOpenOfficialStore && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden px-4">
                  <div className="flex items-center justify-end w-full pt-2 text-gray-300 font-semibold">
                    <button className="cursor-pointer" onClick={() => clearBrandId()}>
                      Hapus
                    </button>
                  </div>

                  {partnersLoading ? (
                    <div className="py-3 text-sm text-gray-500">Memuat partner...</div>
                  ) : partners.length === 0 ? (
                    <div className="py-3 text-sm text-gray-500">Partner kosong.</div>
                  ) : (
                    partners.map((p) => {
                      const idStr = String(p.id);
                      const checked = selectedBrandId.includes(idStr);

                      return (
                        <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                          <div className="flex items-center justify-between w-full py-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                {p.photo_profile ? (
                                  <img src={p.photo_profile} alt={p.fullname} className="w-full h-full object-cover" />
                                ) : null}
                              </div>
                              <span className="text-base font-semibold truncate">{p.fullname}</span>
                            </div>

                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toogleBrandId(idStr)}
                              className="w-5 h-5"
                            />
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              )}

              <button
                className="w-35 text-center text-[#F26A24] cursor-pointer font-semibold"
                onClick={handleResetFilters}
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* LIST ORDERS */}
        {orders && orders.length > 0 ? (
          <div className="">
            {orders.map((order: any) => {
              const paidAtText = order.paid_at ? dayjs(order.paid_at).locale("id").format("DD MMM YYYY") : "-";
              const shipments = order.shipments ?? [];

              return (
                <div key={order.order_id} className="border border-gray-200 mb-3 rounded">
                  {/* HEADER ORDER */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500">{paidAtText}</p>
                        <p className="text-xs text-gray-500">Order #{order.order_id}</p>
                      </div>

                      <div className="text-xs text-gray-600">
                        {order.payment_status === "unpaid" ? "Belum Dibayar" : null}
                      </div>
                    </div>
                  </div>

                  {/* SHIPMENTS */}
                  <div className="p-4 space-y-4">
                    {shipments.map((sh: any) => (
                      <div key={sh.shipment_id} className="border border-gray-200 rounded">
                        {/* header shipment */}
                        <div className="p-3 bg-gray-50 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700 truncate">
                                {sh.partner_name ?? "-"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{sh.shipping_service ?? "-"}</div>
                          </div>

                          {renderShipmentStatusBadge((sh.status ?? "process") as ShipmentStatus)}
                        </div>

                        {/* items shipment */}
                        <div className="p-3 space-y-3">
                          {(sh.items ?? []).map((it: any) => {
                            const received = isItemReceived(it);
                            const canReceive = (sh.status as ShipmentStatus) === "delivered" && !received;

                            return (
                              <div key={it.order_item_id} className="flex gap-3">
                                <img
                                  src={it.product?.image ?? ""}
                                  alt={it.product?.name ?? "Product"}
                                  className="w-16 h-16 object-cover rounded border border-gray-200 bg-gray-50"
                                />

                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                                    {it.product?.name ?? "-"}
                                  </h3>
                                  <p className="text-xs text-gray-500 mt-1">Qty: {it.qty}</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-1">
                                    {formatRupiah(Number(it.price ?? 0))}
                                  </p>

                                  {/* ✅ BUTTON PER ITEM */}
                                  {canReceive ? (
                                    <button
                                      type="button"
                                      onClick={() => onReceiveItem(it.order_item_id)}
                                      disabled={isReceiving && receivingItemId === it.order_item_id}
                                      className={[
                                        "mt-2 inline-flex items-center justify-center rounded text-xs font-semibold transition p-2 cursor-pointer",
                                        isReceiving && receivingItemId === it.order_item_id
                                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                          : "bg-orange-600 text-white hover:bg-orange-700",
                                      ].join(" ")}
                                    >
                                      {isReceiving && receivingItemId === it.order_item_id
                                        ? "Memproses..."
                                        : "Barang Sudah Diterima"}
                                    </button>
                                  ) : received ? (
                                    <div className="mt-2 text-xs font-semibold text-green-700">
                                      ✓ Sudah diterima
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* footer shipment */}
                        <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-xs text-gray-600">Ongkir</span>
                          <span className="text-xs font-semibold text-gray-800">
                            {formatRupiah(Number(sh.shipping_cost ?? 0))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FOOTER ORDER */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Belanja</span>
                      <span className="text-lg font-bold text-orange-600">
                        {formatRupiah(Number(order.grand_total ?? 0))}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // EMPTY
          <div className="p-4">
            <div className="flex justify-center h-50 p-4">
              <img src={NotFoundTransaction} alt="" />
            </div>
            <div className="font-bold text-center text-lg">Belum Ada Pesanan</div>
            <div className="text-center text-base text-gray-600 mt-2">
              Pesanan yang sudah kamu buat akan muncul di sini
            </div>
          </div>
        )}
      </div>
    </div>
  );
}