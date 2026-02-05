import type { NavigateFunction } from "react-router-dom";
import toast from "react-hot-toast";
import type { BuyNow } from "../../services/checkout.service";

export const buildHandleBuyNow = ( buyNowMutate: any, navigate: NavigateFunction,) => (productId: number, qty: number) => {
    const toastId = toast.loading("Membuat checkout...");

    buyNowMutate(
        {
            product_id: productId,
            qty: qty,
        },
        {
            onSuccess: (data: BuyNow) => {
                toast.success("Checkout berhasil dibuat!", { id: toastId});
                navigate(`/checkout?checkout_id=${data.checkout_id}`);
            },
            onError: (error: any) => {
                const message = error.response?.data?.errors || error.response?.data?.message || "Terjadi kesalahan saat checkout.";

                if (message == "Unauthenticated") {
                    navigate("/auth/login");
                    toast.error("Silahkan login terlebih dahulu", {id: toastId});
                }

                toast.error(message, {id: toastId});
            }
        }
    )
}