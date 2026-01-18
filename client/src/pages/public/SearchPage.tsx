import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { formatRupiah } from "../../utils/function";
import { useProducts } from "../../hooks/product/useProducts";
import { FilterSection } from "../../components/FilterSection";
import SortDropdown, { type SortValue } from "../../components/SortDropdown";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const name = (params.get("name") ?? "").trim();

  // --- read price filter from URL
  const minPriceParam = params.get("min_price");
  const maxPriceParam = params.get("max_price");

  const min_price = useMemo(() => {
    if (!minPriceParam) return undefined;
    const n = Number(minPriceParam);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  }, [minPriceParam]);

  const max_price = useMemo(() => {
    if (!maxPriceParam) return undefined;
    const n = Number(maxPriceParam);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  }, [maxPriceParam]);

  // --- input UI state (draft)
  const [priceMinInput, setPriceMinInput] = useState<string>(minPriceParam ?? "");
  const [priceMaxInput, setPriceMaxInput] = useState<string>(maxPriceParam ?? "");

  useEffect(() => {
    setPriceMinInput(minPriceParam ?? "");
    setPriceMaxInput(maxPriceParam ?? "");
  }, [minPriceParam, maxPriceParam]);

  // --- sort from URL (persist)
  const sort = (params.get("sort") as SortValue) ?? "relevance";

  // ✅ call API with filters
  const { data: products, isLoading } = useProducts({
    name,
    min_price,
    max_price,
  });

  const title = useMemo(() => {
    if (!name) return "Pencarian Produk";
    return `Hasil untuk "${name}"`;
  }, [name]);

  const productCount = products?.data.length ?? 0;

  // sorting frontend
  const visibleProducts = useMemo(() => {
    const arr = [...(products?.data ?? [])];

    if (sort === "price_asc") {
      arr.sort((a: any, b: any) => Number(a.price ?? 0) - Number(b.price ?? 0));
    } else if (sort === "price_desc") {
      arr.sort((a: any, b: any) => Number(b.price ?? 0) - Number(a.price ?? 0));
    } else if (sort === "newest") {
      // optional: kalau backend belum kirim created_at, skip dulu
      // atau kalau ada created_at, bisa sort disini
      // arr.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return arr;
  }, [products, sort]);

  const applyPriceFilter = () => {
    const next = new URLSearchParams(params);

    const minRaw = priceMinInput.trim();
    const maxRaw = priceMaxInput.trim();

    const minVal = minRaw === "" ? undefined : Number(minRaw);
    const maxVal = maxRaw === "" ? undefined : Number(maxRaw);

    const minOk = minVal === undefined || (Number.isFinite(minVal) && minVal >= 0);
    const maxOk = maxVal === undefined || (Number.isFinite(maxVal) && maxVal >= 0);

    if (!minOk || !maxOk) {
      alert("Min/Max harus angka valid.");
      return;
    }

    let finalMin = minVal;
    let finalMax = maxVal;

    if (finalMin !== undefined && finalMax !== undefined && finalMin > finalMax) {
      [finalMin, finalMax] = [finalMax, finalMin];
      setPriceMinInput(String(finalMin));
      setPriceMaxInput(String(finalMax));
    }

    if (finalMin === undefined) next.delete("min_price");
    else next.set("min_price", String(finalMin));

    if (finalMax === undefined) next.delete("max_price");
    else next.set("max_price", String(finalMax));

    setParams(next, { replace: true });
  };

  const resetFilters = () => {
    const next = new URLSearchParams(params);
    next.delete("min_price");
    next.delete("max_price");
    next.delete("sort");

    setPriceMinInput("");
    setPriceMaxInput("");

    setParams(next, { replace: true });
  };

  const onChangeSort = (v: SortValue) => {
    const next = new URLSearchParams(params);
    if (v === "relevance") next.delete("sort"); // biar URL bersih
    else next.set("sort", v);
    setParams(next, { replace: true });
  };

  const priceFilterLabel = useMemo(() => {
    if (min_price === undefined && max_price === undefined) return null;

    if (min_price !== undefined && max_price !== undefined) {
      return `${formatRupiah(min_price)} - ${formatRupiah(max_price)}`;
    }
    if (min_price !== undefined) return `≥ ${formatRupiah(min_price)}`;
    return `≤ ${formatRupiah(max_price ?? 0)}`;
  }, [min_price, max_price]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6 mt-30">
          <div className="mb-4">
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {name ? `${productCount} produk ditemukan` : "Ketik kata kunci untuk mencari produk."}
            </p>

            {priceFilterLabel && (
              <div className="mt-2 text-xs text-gray-600">
                Filter Harga: <span className="font-semibold">{priceFilterLabel}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* LEFT */}
            <aside className="bg-white border border-gray-300 rounded-lg h-fit lg:sticky lg:top-32">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-300">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-700" />
                  <span className="font-semibold text-gray-900">Filter</span>
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm font-semibold text-gray-400 hover:text-gray-600"
                >
                  Reset
                </button>
              </div>

              <div className="px-4 pb-4">
                <FilterSection title="Harga" defaultOpen={true}>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="Min"
                      value={priceMinInput}
                      onChange={(e) => setPriceMinInput(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#F26A24]"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="Max"
                      value={priceMaxInput}
                      onChange={(e) => setPriceMaxInput(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#F26A24]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={applyPriceFilter}
                    className="mt-3 w-full border border-gray-300 rounded-md py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Terapkan
                  </button>
                </FilterSection>
              </div>
            </aside>

            {/* RIGHT */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div />
                <SortDropdown value={sort} onChange={onChangeSort} />
              </div>

              {isLoading && (
                <div className="bg-white border border-gray-300 rounded-lg p-6 text-sm text-gray-500">
                  Memuat hasil...
                </div>
              )}

              {!isLoading && name && visibleProducts.length === 0 && (
                <div className="bg-white border border-gray-300 rounded-lg p-6 text-sm text-gray-500">
                  Produk tidak ditemukan untuk "{name}".
                </div>
              )}

              {!isLoading && visibleProducts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {visibleProducts.map((p: any) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => navigate(`/produk/${p.slug}`)}
                      className="text-left bg-white  rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer shadow"
                    >
                      <div className="w-full aspect-square bg-gray-100 overflow-hidden">
                        {p.thumbnail?.image ? (
                          <img src={p.thumbnail.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <div className="text-sm font-semibold text-gray-900 line-clamp-2">{p.name}</div>
                        <div className="mt-1 text-xs text-gray-500 line-clamp-1">{p.category?.name ?? "-"}</div>
                        <div className="mt-2 text-base font-bold text-gray-900">{formatRupiah(Number(p.price ?? 0))}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}