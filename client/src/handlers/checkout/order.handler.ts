// order.handler.ts
import toast from "react-hot-toast";
import type { NavigateFunction } from "react-router-dom";

export type ShipmentInput = {
  partner_id: number;
  shipping_service_id: number;
};

export const buildHandleCreateOrder =
  (createOrderMutate: any, navigate: NavigateFunction) =>
  (checkoutId: string, addressId: number, shipments: ShipmentInput[]) => {
    if (!checkoutId) return toast.error("Checkout ID tidak valid.");
    if (!addressId) return toast.error("Mohon pilih alamat pengiriman.");
    if (!shipments?.length) return toast.error("Tidak ada shipment yang dipilih.");

    const invalid = shipments.some((s) => !s.partner_id || !s.shipping_service_id);
    if (invalid) return toast.error("Mohon pilih jenis pengiriman untuk semua toko.");

    const toastId = toast.loading("Membuat pesanan...");

    createOrderMutate(
      { checkout_id: checkoutId, address_id: addressId, shipments },
      {
        onSuccess: (res: any) => {
          toast.success("Pesanan dibuat. Silakan pilih metode pembayaran.", { id: toastId });

          const orderId = res?.order_id ?? res?.data?.order_id;
          if (orderId) return navigate(`/payment/method?order_id=${orderId}`);

          navigate(`/menu/riwayat-transaksi`);
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.errors ||
            error.response?.data?.message ||
            "Terjadi kesalahan saat membuat pesanan.";

          toast.error(message, { id: toastId });
        },
      }
    );
  };