import dayjs from "dayjs";
import "dayjs/locale/id";
import DataTable from "../../components/DataTable";
import TitleRoutesAdminPartner from "../../components/TitleRoutesAdminPartner";
import { formatRupiah } from "../../utils/function";
import { Truck } from "lucide-react";
import toast from "react-hot-toast";
import type { Order, OrderShipment } from "../../services/order.service";
import { useOrdersPartner } from "../../hooks/order/useOrdersPartner";
import { useShipOrderShipmentByPartner } from "../../hooks/order/useShipOrderShipmentByPartner";

const ShipmentStatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; cls: string }> = {
        process: { label: "Sedang Diproses", cls: "bg-orange-100 text-orange-700" },
        shipping: { label: "Sedang Dikirim", cls: "bg-blue-100 text-blue-700" },
        delivered: { label: "Terkirim", cls: "bg-purple-100 text-purple-700" },
        completed: { label: "Selesai", cls: "bg-green-100 text-green-700" },
        cancelled: { label: "Dibatalkan", cls: "bg-red-100 text-red-700" },
        draft: { label: "Draft", cls: "bg-gray-100 text-gray-700" },
    };

    const v = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-700" };

    return (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${v.cls}`}>
            {v.label}
        </span>
    );
};

const OrderPagePartner = () => {
    const { data: ordersResponse, isLoading } = useOrdersPartner();
    const orders: Order[] = (ordersResponse ?? []) as any;

    const { mutate: shipShipment, isPending: isShipping } = useShipOrderShipmentByPartner();

    // Endpoint partner seharusnya sudah filter shipments yang milik partner yang login,
    // jadi shipments[0] adalah shipment partner tsb.
    const pickPartnerShipment = (row: Order): OrderShipment | null => {
        const s = row.shipments?.[0];
        return s ?? null;
    };

    const orderColumns = [
        {
            header: "Order",
            accessor: "order_id",
            render: (row: Order) => {
                const shipment = pickPartnerShipment(row);

                return (
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900">#{row.order_id}</div>
                        <div className="text-xs text-gray-500">
                            Dibayar: {row.paid_at ? dayjs(row.paid_at).locale("id").format("DD MMM YYYY") : "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                            Shipment: {shipment ? `#${shipment.shipment_id}` : "-"}
                        </div>
                    </div>
                );
            },
        },

        {
            header: "Produk",
            accessor: "shipments",
            render: (row: Order) => {
                const shipment = pickPartnerShipment(row);
                const items = shipment?.items ?? [];

                if (!items.length) return <span className="text-sm text-gray-500">-</span>;

                const show = items.slice(0, 2);
                const remaining = items.length - show.length;

                return (
                    <div className="space-y-2 min-w-65">
                        {show.map((it) => {
                            const p = it.product;
                            const img = p?.image;
                            const name = p?.name ?? "-";

                            return (
                                <div key={it.order_item_id} className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                        {img ? (
                                            <img src={img} alt={name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                                No Img
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-gray-900 truncate">{name}</div>
                                        <div className="text-xs text-gray-500">
                                            Qty: {it.qty} • {formatRupiah(Number(it.line_total ?? 0))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {remaining > 0 && (
                            <div className="text-xs text-gray-500 pl-13">+{remaining} produk lainnya</div>
                        )}
                    </div>
                );
            },
        },

        {
            header: "Kurir",
            accessor: "shipping_service",
            render: (row: Order) => {
                const shipment = pickPartnerShipment(row);
                return <span className="text-sm text-gray-800">{shipment?.shipping_service ?? "-"}</span>;
            },
        },

        {
            header: "Ongkir",
            accessor: "shipping_cost",
            render: (row: Order) => {
                const shipment = pickPartnerShipment(row);
                return <span className="text-sm text-gray-800">{formatRupiah(Number(shipment?.shipping_cost ?? 0))}</span>;
            },
        },

        {
            header: "Pemesan",
            accessor: "customer",
            render: (row: Order) => <span className="text-sm text-gray-800">{row.customer}</span>,
        },

        // ✅ INI YANG DIUBAH: bukan grand_total buyer, tapi subtotal item untuk shipment partner
        {
            header: "Total (Produk)",
            accessor: "items_subtotal",
            render: (row: Order) => {
                const shipment = pickPartnerShipment(row);

                // dari backend (wajib kamu tambahkan di resource)
                const itemsSubtotal = Number((shipment as any)?.items_subtotal ?? 0);

                return (
                    <span className="text-sm font-semibold text-gray-900">
                        {formatRupiah(itemsSubtotal)}
                    </span>
                );
            },
        },

        // opsional: kalau kamu ingin partner lihat total + ongkir
        // {
        //   header: "Total (Produk+Ongkir)",
        //   accessor: "shipment_total",
        //   render: (row: Order) => {
        //     const shipment = pickPartnerShipment(row);
        //     const shipmentTotal = Number((shipment as any)?.shipment_total ?? 0);
        //     return <span className="text-sm font-semibold text-gray-900">{formatRupiah(shipmentTotal)}</span>;
        //   },
        // },

        {
            header: "Status Shipment",
            accessor: "status",
            render: (row: Order) => {
                const shipment = pickPartnerShipment(row);
                return <ShipmentStatusBadge status={shipment?.status ?? "process"} />;
            },
        },
    ];

    const orderActions = [
        {
            label: "Kirim",
            icon: Truck,
            color: "text-orange-600",
            hoverColor: "bg-orange-50",
            onClick: (row: Order) => {
                const shipment = pickPartnerShipment(row);
                if (!shipment) return toast.error("Shipment tidak ditemukan.");

                if (shipment.status !== "process") {
                    toast.error("Shipment ini tidak bisa dikirim (status bukan process).");
                    return;
                }

                const toastId = toast.loading("Mengubah status shipment jadi shipping...");

                shipShipment(shipment.shipment_id, {
                    onSuccess: () => toast.success("Shipment berhasil dikirim!", { id: toastId }),
                    onError: (err: any) =>
                        toast.error(err?.response?.data?.message ?? "Gagal mengubah status shipment", { id: toastId }),
                });
            },
        },
    ];

    if (isLoading) return <span>Loading...</span>;
    if (!orders.length) return <span className="text-center">Tidak ada pesanan</span>;

    return (
        <div>
            <TitleRoutesAdminPartner title="Pesanan" description="Kelola pesanan yang diterima" />
            <DataTable columns={orderColumns} data={orders} actions={orderActions} />

            {isShipping && <p className="text-xs text-gray-500 mt-2">Memproses perubahan status...</p>}
        </div>
    );
};

export default OrderPagePartner;