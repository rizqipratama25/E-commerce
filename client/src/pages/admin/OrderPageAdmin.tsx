import dayjs from "dayjs";
import "dayjs/locale/id";
import DataTable from "../../components/DataTable";
import TitleRoutesAdminPartner from "../../components/TitleRoutesAdminPartner";
import { formatRupiah } from "../../utils/function";
import { SquareCheckBig } from "lucide-react";
import toast from "react-hot-toast";

import { useOrdersAdmin } from "../../hooks/order/useOrdersAdmin";
import { useDeliveredShipmentByAdmin } from "../../hooks/order/useDeliveredShipmentByAdmin";
import type { Order, OrderShipment, OrderItem } from "../../services/order.service";

type AdminRow = {
  order_id: number;
  customer: string;
  paid_at: string | null;
  completed_at: string | null;

  shipment: OrderShipment; // shipment yang ditampilkan
};

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

const OrderPageAdmin = () => {
  const { data: ordersResponse, isLoading } = useOrdersAdmin();
  const orders: Order[] = (ordersResponse ?? []) as any;

  const { mutate: deliveredShipment, isPending: isConfirming } = useDeliveredShipmentByAdmin();

  // flatten: 1 shipment = 1 row
  const rows: AdminRow[] = (orders ?? []).flatMap((o) => {
    const shipments = o.shipments ?? [];
    return shipments.map((s) => ({
      order_id: o.order_id,
      customer: o.customer,
      paid_at: o.paid_at ?? null,
      completed_at: o.completed_at ?? null,
      shipment: s,
    }));
  });

  const orderColumns = [
    {
      header: "Order / Shipment",
      accessor: "order_id",
      render: (row: AdminRow) => (
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900">Order #{row.order_id}</div>
          <div className="text-xs text-gray-500">Shipment #{row.shipment.shipment_id}</div>
          <div className="text-xs text-gray-500">
            Dibayar: {row.paid_at ? dayjs(row.paid_at).locale("id").format("DD MMM YYYY") : "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Toko",
      accessor: "partner_name",
      render: (row: AdminRow) => (
        <span className="text-sm text-gray-800 font-semibold">{row.shipment.partner_name ?? "-"}</span>
      ),
    },
    {
      header: "Pemesan",
      accessor: "customer",
      render: (row: AdminRow) => <span className="text-sm text-gray-800">{row.customer ?? "-"}</span>,
    },
    {
      header: "Produk",
      accessor: "items",
      render: (row: AdminRow) => {
        const items: OrderItem[] = row.shipment.items ?? [];
        if (!items.length) return <span className="text-sm text-gray-500">-</span>;

        const show = items.slice(0, 2);
        const remaining = items.length - show.length;

        return (
          <div className="space-y-2 min-w-70">
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

            {remaining > 0 && <div className="text-xs text-gray-500 pl-13">+{remaining} produk lainnya</div>}
          </div>
        );
      },
    },
    {
      header: "Kurir",
      accessor: "shipping_service",
      render: (row: AdminRow) => <span className="text-sm text-gray-800">{row.shipment.shipping_service ?? "-"}</span>,
    },
    {
      header: "Ongkir",
      accessor: "shipping_cost",
      render: (row: AdminRow) => (
        <span className="text-sm text-gray-900">{formatRupiah(Number(row.shipment.shipping_cost ?? 0))}</span>
      ),
    },
    {
      header: "Total Produk",
      accessor: "items_subtotal",
      render: (row: AdminRow) => (
        <span className="text-sm font-semibold text-gray-900">
          {formatRupiah(Number((row.shipment as any).items_subtotal ?? 0))}
        </span>
      ),
    },
    {
      header: "Total Shipment",
      accessor: "shipment_total",
      render: (row: AdminRow) => (
        <span className="text-sm font-semibold text-gray-900">
          {formatRupiah(Number((row.shipment as any).shipment_total ?? 0))}
        </span>
      ),
    },
    {
      header: "Status Shipment",
      accessor: "status",
      render: (row: AdminRow) => <ShipmentStatusBadge status={row.shipment.status ?? "process"} />,
    },
  ];

  const orderActions = [
    {
      label: "Barang Sudah Sampai",
      icon: SquareCheckBig,
      color: "text-blue-600",
      hoverColor: "bg-blue-50",
      onClick: (row: AdminRow) => {
        if (row.shipment.status !== "shipping") {
          toast.error("Shipment ini belum dalam status shipping.");
          return;
        }

        const toastId = toast.loading("Mengonfirmasi shipment sampai...");
        deliveredShipment(row.shipment.shipment_id, {
          onSuccess: () => toast.success("Shipment dikonfirmasi sampai!", { id: toastId }),
          onError: (err: any) =>
            toast.error(err?.response?.data?.message ?? "Gagal mengonfirmasi shipment", { id: toastId }),
        });
      },
    },
  ];

  if (isLoading) return <span>Loading...</span>;
  if (!rows.length) return <span className="text-center">Tidak ada shipment yang dikirim</span>;

  return (
    <div>
      <TitleRoutesAdminPartner title="Pesanan" description="Kelola shipment yang sedang dikirim" />
      <DataTable columns={orderColumns} data={rows} actions={orderActions} />

      {isConfirming && <p className="text-xs text-gray-500 mt-2">Memproses konfirmasi shipment...</p>}
    </div>
  );
};

export default OrderPageAdmin;