import { House, MapPin, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useCheckout } from "../../hooks/checkout/useCheckout";
import { useCreateOrderFromCheckout } from "../../hooks/order/useCreateOrderFromCheckout";
import { buildHandleCreateOrder } from "../../handlers/checkout/order.handler";

import { useAddresses } from "../../hooks/address/useAddresses";
import { formatRupiah } from "../../utils/function";
import ChooseShippingDropdown from "../../components/ChooseShippingDropdown";

type ShippingChoice = {
  shipping_service_id: number;
  shipping_cost: number;
};

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [params] = useSearchParams();
  const checkoutId = params.get("checkout_id") ?? "";

  const { data: checkoutData, isLoading: isCheckoutLoading, isError: isCheckoutError } = useCheckout(checkoutId);

  const { mutate: createOrderMutate, isPending: isOrderPending } = useCreateOrderFromCheckout();
  const handleCreateOrder = buildHandleCreateOrder(createOrderMutate, navigate);

  const { data: addressesResponse, isLoading: isAddressesLoading } = useAddresses();
  const addresses = addressesResponse ?? [];
  const lastAddress = addresses[addresses.length - 1];

  const [isOpenChooseAddress, setIsOpenChooseAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(lastAddress?.id ?? null);
  const [tempAddressId, setTempAddressId] = useState<number | null>(selectedAddressId);

  const [hasUserSelected, setHasUserSelected] = useState(false);

  useEffect(() => {
    if (hasUserSelected) return;
    if (lastAddress?.id) {
      setSelectedAddressId(lastAddress.id);
      setTempAddressId(lastAddress.id);
    }
  }, [lastAddress?.id, hasUserSelected]);

  const selectedAddress = useMemo(
    () => addresses.find((a: any) => a.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId]
  );

  const [shippingMap, setShippingMap] = useState<Record<number, ShippingChoice>>({});

  const shipments = checkoutData?.shipments ?? [];

  const allShippingSelected = useMemo(() => {
    if (!shipments.length) return false;
    return shipments.every((s) => !!shippingMap[s.partner_id]?.shipping_service_id);
  }, [shipments, shippingMap]);

  const totalShippingCost = useMemo(() => {
    return Object.values(shippingMap).reduce((sum, s) => sum + (Number(s.shipping_cost) || 0), 0);
  }, [shippingMap]);

  const subtotal = Number(checkoutData?.subtotal ?? 0);
  const totalPayment = subtotal + totalShippingCost;

  const totalItemsCount = useMemo(() => {
    return shipments.reduce((acc, s) => acc + (s.items?.length ?? 0), 0);
  }, [shipments]);

  const onPay = () => {
    if (!checkoutId) return;
    if (!selectedAddressId) return;
    if (!allShippingSelected) return;

    const payloadShipments = shipments.map((s) => ({
      partner_id: s.partner_id,
      shipping_service_id: shippingMap[s.partner_id].shipping_service_id,
    }));

    handleCreateOrder(checkoutId, selectedAddressId, payloadShipments);
  };

  if (!checkoutId) return <div>checkout_id tidak ada</div>;
  if (isCheckoutLoading) return <div>Loading checkout...</div>;
  if (isCheckoutError) return <div>Gagal load checkout</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 mt-30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-4">
              {/* Address */}
              <div>
                <div className="py-2 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Alamat Pengiriman</h3>
                  <button
                    className="text-[#F26A24] font-semibold text-sm"
                    onClick={() => setIsOpenChooseAddress(true)}
                  >
                    Pilih Alamat Lain
                  </button>
                </div>

                {isOpenChooseAddress && (
                  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-130 max-w-full bg-white rounded-xl shadow-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-6 py-4 shadow">
                        <h2 className="text-[22px] font-bold text-gray-900">Alamat Tersimpan</h2>

                        <div className="flex items-center gap-4">
                          <button type="button" className="text-[#F26A24] font-semibold hover:opacity-90">
                            Tambah Alamat
                          </button>

                          <button
                            type="button"
                            className="p-2 rounded-md hover:bg-gray-100"
                            aria-label="Tutup"
                            onClick={() => {
                              setIsOpenChooseAddress(false);
                              setTempAddressId(selectedAddressId);
                            }}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="h-130 flex flex-col">
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                          {isAddressesLoading ? (
                            <div className="text-sm text-gray-500">Loading alamat...</div>
                          ) : addresses.length === 0 ? (
                            <div className="text-sm text-gray-500">Belum ada alamat.</div>
                          ) : (
                            addresses.map((a: any) => {
                              const selected = tempAddressId === a.id;

                              return (
                                <button
                                  key={a.id}
                                  type="button"
                                  onClick={() => setTempAddressId(a.id)}
                                  className="w-full text-left rounded-xl border border-gray-300 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.10)] transition"
                                >
                                  <div className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="min-w-0">
                                        <div className="text-[18px] font-bold text-gray-900">
                                          {a.label ?? "Rumah"}
                                        </div>
                                        <div className="mt-1 text-[15px] font-semibold text-gray-700">
                                          {a.receiver} ({a.phone})
                                        </div>
                                        <div className="mt-2 text-[15px] leading-6 text-gray-500">
                                          {a.detail}
                                        </div>
                                      </div>

                                      <div className="pt-1">
                                        <span
                                          className={[
                                            "inline-flex w-7 h-7 rounded-full border items-center justify-center",
                                            selected ? "border-[#F26A24]" : "border-gray-300",
                                          ].join(" ")}
                                        >
                                          {selected ? <span className="w-3.5 h-3.5 rounded-full bg-[#F26A24]" /> : null}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>

                        <div className="sticky bottom-0 bg-white shadow px-6 py-5">
                          <button
                            type="button"
                            className="w-full h-12 rounded-lg bg-[#F26A24] text-white text-[16px] font-bold hover:brightness-95 disabled:bg-gray-200 disabled:text-gray-500"
                            disabled={!tempAddressId}
                            onClick={() => {
                              setSelectedAddressId(tempAddressId);
                              setHasUserSelected(true);
                              setIsOpenChooseAddress(false);
                            }}
                          >
                            Pilih Alamat
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-white border border-gray-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-600 shrink-0 mt-1" />
                    {isAddressesLoading && <p>Memuat alamat...</p>}
                    {!isAddressesLoading && (
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 mb-1">{selectedAddress?.label}</div>
                        <div className="text-sm text-gray-600 mb-1">
                          {selectedAddress?.receiver} ({selectedAddress?.phone})
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedAddress?.detail}, {selectedAddress?.urban_village}, {selectedAddress?.district}, Kota.{" "}
                          {selectedAddress?.city}, {selectedAddress?.province}, {selectedAddress?.post_code}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SHIPPING GROUPS (per partner) */}
              <div className="">
                <div className="py-2">
                  <h3 className="font-semibold text-gray-800">
                    Dikirim ke Alamat ({shipments.length} Toko)
                  </h3>
                </div>

                <div className="space-y-4">
                  {shipments.map((s, idx) => {
                    const partnerName = s.partner_name ?? `Toko ${idx + 1}`;

                    return (
                      <div key={s.partner_id} className="py-4 bg-white border border-gray-300 rounded-lg">
                        {/* header shipment */}
                        <div className="flex items-center gap-2 px-4 pb-3 border-b border-gray-300">
                          <div className="p-2 bg-gray-200 rounded-full">
                            <House className="w-5 h-5" />
                          </div>

                          <div className="flex-1">
                            <div className="text-xs font-semibold text-blue-600">Pengiriman {idx + 1}</div>
                            <div className="text-xs text-gray-700">
                              {partnerName}
                            </div>
                          </div>
                        </div>

                        {/* items */}
                        <div className="grid grid-cols-2">
                          <div>
                            {s.items.map((item, itemIdx) => (
                              <div
                                key={`${s.partner_id}-${item.product_id}-${itemIdx}`}
                                className="flex items-start justify-between gap-6 p-4 bg-white"
                              >
                                <div className="flex gap-4">
                                  <img
                                    src={item.image ?? ""}
                                    alt={item.name}
                                    className="w-20 h-20 object-contain rounded bg-gray-50"
                                  />

                                  <div className="min-w-0">
                                    <h4 className="font-semibold text-sm mb-1 line-clamp-2">{item.name}</h4>

                                    <div className="flex items-center gap-4">
                                      <span className="font-bold text-orange-600">
                                        {formatRupiah(Number(item.price ?? 0))}
                                      </span>
                                      <span className="text-sm text-gray-600">x {item.qty}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* choose shipping for this shipment */}
                          <div className="p-4">
                            <div className="max-w-105 ml-auto">
                              <ChooseShippingDropdown
                                data={s.shipping_options}
                                onSelect={(opt) => {
                                  setShippingMap((prev) => ({
                                    ...prev,
                                    [s.partner_id]: {
                                      shipping_service_id: opt.id,
                                      shipping_cost: Number(opt.shipping_cost ?? 0)
                                    },
                                  }));
                                }}
                              />

                              {!shippingMap[s.partner_id]?.shipping_service_id && (
                                <p className="text-xs text-red-500 mt-2">
                                  Pilih jenis pengiriman untuk Pengiriman {idx + 1}.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {shipments.length === 0 && (
                    <div className="text-sm text-gray-500 bg-white border border-gray-300 rounded-lg p-4">
                      Checkout kosong / data belum ter-load.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-300 sticky top-6">
                <div className="p-4 border-b border-gray-300">
                  <h3 className="font-semibold text-gray-800 mb-4">Detail Rincian Pembayaran</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal Harga ({totalItemsCount} produk)</span>
                      <span className="font-semibold">{formatRupiah(subtotal)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Ongkir</span>
                      <span className="font-semibold">{formatRupiah(totalShippingCost)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-lg">Total Pembayaran</span>
                    <span className="font-bold text-xl">{formatRupiah(totalPayment)}</span>
                  </div>

                  <button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    onClick={onPay}
                    disabled={!selectedAddressId || !allShippingSelected || isOrderPending}
                  >
                    {!selectedAddressId
                      ? "Pilih alamat"
                      : !allShippingSelected
                        ? "Pilih jenis pengiriman"
                        : isOrderPending
                          ? "Loading..."
                          : "Pilih Metode Pembayaran"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;