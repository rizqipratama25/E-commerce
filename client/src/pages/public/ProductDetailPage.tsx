import { ChevronDown, ChevronLeft, ChevronRight, Package, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { useProductDetail } from "../../hooks/product/useProductDetails";
import { useNavigate, useParams } from "react-router-dom";
import { formatRupiah } from "../../utils/function";
import { useBuyNowChekout } from "../../hooks/checkout/useBuyNowChekout";
import { buildHandleBuyNow } from "../../handlers/checkout/buyNow.handler";
import { CategoryBreadcrumb } from "../../components/Breadcrumb";
import { useAddToCart } from "../../hooks/cart/useAddToCart";
import { buildHandleAddToCart } from "../../handlers/cart.handler";
import { useCart } from "../../hooks/cart/useCart";
import { setCartTotalQty } from "../../utils/cartStorage";
import AddToCartModal from "../../components/AddToCartModal";
import { useMiniCart } from "../../hooks/cart/useMiniCart";
import Footer from "../../components/Footer";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const { data: productDetailResponse, isLoading } = useProductDetail(slug ?? "", true);
  const productDetail = productDetailResponse?.data ?? null;

  const allImages = productDetail?.images ?? [];
  const MAX_THUMBNAILS = 4;
  const thumbnails = allImages.slice(0, MAX_THUMBNAILS);
  const remainingCount = allImages.length - thumbnails.length;

  // gallery
  const [activeImage, setActiveImage] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const openGallery = (index: number) => { setModalIndex(index); setIsGalleryOpen(true); };
  const closeGallery = () => setIsGalleryOpen(false);
  const showPrev = () => setModalIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  const showNext = () => setModalIndex((prev) => (prev + 1) % allImages.length);

  // tabs
  const [activeTab, setActiveTab] = useState<"spec" | "info">("spec");
  const [showFullSpec, setShowFullSpec] = useState(false);

  // checkout actions
  const { mutate: buyNowMutate } = useBuyNowChekout();
  const handleBuyNow = buildHandleBuyNow(buyNowMutate, navigate);

  // cart actions
  const { mutate: addToCartMutate } = useAddToCart();

  // popup state
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<{ name?: string; image?: string; qty?: number; price?: number } | null>(null);

  // mini cart fetch (only when modal open)
  const {
    data: miniCart,
    isFetching: isMiniFetching,
    refetch: refetchMini,
  } = useMiniCart(3, isCartModalOpen);

  const onAddToCartSuccess = () => {
    setJustAdded({
      name: productDetail?.name ?? "",
      image: allImages?.[0]?.image ?? "",
      qty: quantity,
      price: Number(productDetail?.price ?? 0),
    });

    setIsCartModalOpen(true);

    // refresh mini cart segera (biar item baru kebaca)
    setTimeout(() => {
      refetchMini();
    }, 50);
  };

  const handleAddToCart = buildHandleAddToCart(addToCartMutate, navigate, onAddToCartSuccess);

  // update badge qty cart (jangan di render langsung!)
  const { data: cart } = useCart();
  const totalQty = useMemo(() => {
    return cart?.items?.reduce((acc, item) => acc + (item.qty ?? 0), 0) ?? 0;
  }, [cart]);

  useEffect(() => {
    setCartTotalQty(totalQty);
  }, [totalQty]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {isLoading && <p className="text-xs text-gray-500 mt-2">Memuat detail produk...</p>}

      {/* POPUP ADD TO CART */}
      <AddToCartModal
        open={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        onGoToCart={() => navigate("/cart")}
        product={justAdded ?? undefined}
        miniCart={miniCart ?? null}
        isLoadingMini={isMiniFetching}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 mt-30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm grid grid-cols-2 gap-2 p-3">
              {/* Main Image */}
              <div className="w-full">
                <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-50" onClick={() => openGallery(activeImage)}>
                  <img
                    src={`${allImages[0]?.image ?? ""}`}
                    alt="Product"
                    className="w-full h-full object-cover bg-gray-50 rounded-lg"
                  />
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-2 gap-2">
                {thumbnails?.map((img, idx) => {
                  const isLastVisible = idx === thumbnails.length - 1 && remainingCount > 0;
                  return (
                    <div
                      key={idx}
                      className="cursor-pointer rounded-lg overflow-hidden"
                      onClick={() => {
                        setActiveImage(idx);
                        openGallery(idx);
                      }}
                    >
                      <div className="relative w-full aspect-square overflow-hidden">
                        <img src={`${img.image}`} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />

                        {isLastVisible && (
                          <div
                            className="absolute inset-0 bg-black/50 flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              openGallery(idx);
                            }}
                          >
                            <span className="text-white font-semibold text-lg">+{remainingCount} Lainnya</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <div className="mb-6">
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">{productDetail?.name}</h2>
                    </div>

                    <div className="text-3xl font-bold text-gray-900">
                      {formatRupiah(productDetail?.price ?? 0)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">S&K Berlaku</div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="text-sm font-semibold mb-2">Penyedia produk ini</div>
                    <div className="flex items-center space-x-2">
                      <img src={`${productDetail?.partner.photo_profile}`} alt="Store" className="w-10 h-10 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Package className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-sm font-semibold">Cek Lokasi Ketersediaan</span>
                  </div>
                  <p className="text-xs text-gray-600">Produk dapat diambil atau dikirim dari <span className="font-semibold">159 lokasi</span></p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Truck className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-sm font-semibold">Lokasi Pengiriman</span>
                  </div>
                  <p className="text-xs text-gray-600">Cek pilihan pengiriman ke <span className="font-semibold text-[#F26A24]">alamatmu</span></p>
                  <div className="mt-2 bg-linear-to-r from-[#F26A24] to-red-500 text-white text-xs px-2 py-1 rounded inline-block">
                    Gratis Ongkir
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab("spec")}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "spec"
                        ? "border-[#F26A24] text-[#F26A24]"
                        : "border-transparent text-gray-600 hover:text-[#F26A24]"
                      }`}
                  >
                    Spesifikasi Produk
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("info")}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "info"
                        ? "border-[#F26A24] text-[#F26A24]"
                        : "border-transparent text-gray-600 hover:text-[#F26A24]"
                      }`}
                  >
                    Informasi Produk
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "spec" ? (
                <div>
                  <div className="mb-4">
                    <button className="flex items-center text-[#F26A24] text-sm font-semibold">
                      <span className="mr-2">🛡️</span>
                      Jaminan pengembalian
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className={`text-sm text-gray-600 leading-relaxed ${!showFullSpec ? "line-clamp-3" : ""}`}>
                      {productDetail?.product_specification || "Belum ada spesifikasi produk."}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowFullSpec(!showFullSpec)}
                    className="mt-4 text-[#F26A24] text-sm font-semibold flex items-center cursor-pointer"
                  >
                    {showFullSpec ? "Tutup" : "Baca Selengkapnya"}
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFullSpec ? "rotate-180" : ""}`} />
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {productDetail?.product_information || "Belum ada informasi tambahan untuk produk ini."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Purchase Box */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
              <div className="mb-4">
                <CategoryBreadcrumb items={productDetail?.category_breadcrumb ?? []} />
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Atur Jumlah</label>
                <div className="flex items-center border border-gray-300 rounded-lg w-35 justify-between">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 border-r border-gray-300 rounded-l-lg"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center py-2 focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 border-l border-gray-300 rounded-r-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtotal Pembelian:</span>
                  <span className="text-xl font-bold">
                    {formatRupiah((productDetail?.price ?? 0) * quantity)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-4">
                <button
                  className="w-full border-2 border-[#F26A24] text-[#F26A24] py-3 rounded-lg font-semibold hover:bg-[#F26A24] hover:text-white transition cursor-pointer"
                  onClick={() => handleBuyNow(productDetail?.id ?? 0, quantity)}
                >
                  Beli Sekarang
                </button>

                <button
                  className="w-full bg-[#F26A24] text-white py-3 rounded-lg font-semibold hover:bg-[#d45a1a] transition cursor-pointer"
                  onClick={() => handleAddToCart(productDetail?.id ?? 0, quantity)}
                >
                  + Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {isGalleryOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center pt-5" onClick={closeGallery}>
          <div
            className="relative max-w-7xl w-full mx-4 bg-transparent flex flex-col items-center justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-10 left-0 text-black text-xl sm:text-base p-3">
              {modalIndex + 1}/{allImages.length}
            </div>

            <button
              onClick={closeGallery}
              className="absolute -top-10 right-0 text-black text-xl leading-none cursor-pointer bg-white shadow p-3 rounded-full"
            >
              ✕
            </button>

            <div className="relative w-full max-h-[80vh] flex items-center justify-center">
              <button
                onClick={showPrev}
                className="absolute left-0 sm:-left-10 top-1/2 -translate-y-1/2 bg-white text-black shadow rounded-full flex items-center justify-center p-2"
              >
                <ChevronLeft />
              </button>

              <img
                src={`${allImages[modalIndex]?.image}`}
                alt={`Gallery ${modalIndex + 1}`}
                className="max-h-[80vh] max-w-full object-contain rounded-lg bg-black"
              />

              <button
                onClick={showNext}
                className="absolute right-0 sm:-right-10 top-1/2 -translate-y-1/2 bg-white text-black shadow rounded-full flex items-center justify-center p-2"
              >
                <ChevronRight />
              </button>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto w-full justify-center px-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setModalIndex(idx)}
                  className={`relative shrink-0 w-16 h-16 rounded-md overflow-hidden border ${idx === modalIndex ? "border-[#F26A24]" : "border-transparent"
                    }`}
                >
                  <img src={`${img.image}`} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetailPage;