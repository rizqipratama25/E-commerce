import toast from "react-hot-toast";
import type { NavigateFunction } from "react-router-dom";

type OnSuccessCb = () => void;

export const buildHandleAddToCart =
    (addToCartMutate: any, navigate: NavigateFunction, onSuccessCb?: OnSuccessCb) =>
        (productId: number, qty: number) => {
            const toastId = toast.loading("Menambahkan ke keranjang...");

            addToCartMutate(
                { product_id: productId, qty },
                {
                    onSuccess: () => {
                        toast.success("Ditambahkan ke keranjang", { id: toastId });
                        onSuccessCb?.();
                    },
                    onError: (error: any) => {
                        const message =
                            error.response?.data?.errors ||
                            error.response?.data?.message ||
                            "Terjadi kesalahan saat menambahkan ke keranjang.";

                        if (message === "Unauthenticated") {
                            navigate("/auth/login");
                            return;
                        }

                        toast.error(message, { id: toastId });
                    },
                }
            );
        };