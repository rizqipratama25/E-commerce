const TOTAL_QTY = "cart_total_qty";

export const setCartTotalQty = (totalQty?: number) => {
    let total = totalQty ?? 0;
    localStorage.setItem(TOTAL_QTY, total.toString());
};

export const getCartTotalQty = () => {
    const raw = localStorage.getItem(TOTAL_QTY);
    if (!raw) return 0;

    return parseInt(raw);
}