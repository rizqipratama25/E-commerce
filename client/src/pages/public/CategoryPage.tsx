import Navbar from "../../components/Navbar";
import { FilterSection } from "../../components/FilterSection";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

import { useCategoryResolve } from "../../hooks/category/useCategoryResolve";
import { useCategoryProducts } from "../../hooks/product/useCategoryProducts";
import Footer from "../../components/Footer";

import SortDropdown, { type SortValue } from "../../components/SortDropdown";

const toNumberOrUndef = (v: string | null) => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const toPriceInput = (v?: number) =>
  typeof v === "number" && Number.isFinite(v) ? String(v) : "";

export default function CategoryPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const path = useMemo(() => {
    return location.pathname.replace(/^\/c\/?/, "").replace(/\/$/, "");
  }, [location.pathname]);

  const page = toNumberOrUndef(searchParams.get("page")) ?? 1;
  const per_page = toNumberOrUndef(searchParams.get("per_page")) ?? 12;

  // ✅ sort UI (include relevance)
  const sortUI = (searchParams.get("sort") as SortValue) ?? "newest";

  // ✅ backend hanya punya newest/price_asc/price_desc
  const sortForApi = useMemo(() => {
    return sortUI === "relevance" ? "newest" : sortUI;
  }, [sortUI]);

  const min_price = toNumberOrUndef(searchParams.get("min_price"));
  const max_price = toNumberOrUndef(searchParams.get("max_price"));

  const [draftMin, setDraftMin] = useState<string>(toPriceInput(min_price));
  const [draftMax, setDraftMax] = useState<string>(toPriceInput(max_price));

  useEffect(() => {
    setDraftMin(toPriceInput(min_price));
    setDraftMax(toPriceInput(max_price));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min_price, max_price]);

  const resolveQ = useCategoryResolve(path);

  const productsQ = useCategoryProducts(path, {
    page,
    per_page,
    sort: sortForApi as any, // "newest" | "price_asc" | "price_desc"
    min_price,
    max_price,
  });

  const setParam = (key: string, value: string | number | undefined) => {
    const sp = new URLSearchParams(searchParams);
    if (value === undefined || value === "" || value === null) sp.delete(key);
    else sp.set(key, String(value));

    if (key !== "page") sp.set("page", "1");
    setSearchParams(sp, { replace: true });
  };

  const applyPriceFilter = () => {
    const rawMin = draftMin.trim() === "" ? undefined : Number(draftMin);
    const rawMax = draftMax.trim() === "" ? undefined : Number(draftMax);

    const parsedMin = Number.isFinite(rawMin) ? rawMin : undefined;
    const parsedMax = Number.isFinite(rawMax) ? rawMax : undefined;

    let finalMin = parsedMin;
    let finalMax = parsedMax;
    if (finalMin !== undefined && finalMax !== undefined && finalMin > finalMax) {
      [finalMin, finalMax] = [finalMax, finalMin];
    }

    const sp = new URLSearchParams(searchParams);

    if (finalMin === undefined) sp.delete("min_price");
    else sp.set("min_price", String(finalMin));

    if (finalMax === undefined) sp.delete("max_price");
    else sp.set("max_price", String(finalMax));

    sp.set("page", "1");
    setSearchParams(sp, { replace: true });
  };

  const resetFilters = () => {
    const sp = new URLSearchParams(searchParams);
    sp.delete("min_price");
    sp.delete("max_price");
    sp.delete("sort");
    sp.delete("page");
    setSearchParams(sp, { replace: true });

    setDraftMin("");
    setDraftMax("");
  };

  if (resolveQ.isLoading) return <div>Loading category...</div>;
  if (resolveQ.isError || !resolveQ.data) return <div>Category not found.</div>;

  const { breadcrumb, category } = resolveQ.data;

  const products = productsQ.data?.products;
  const items = products?.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto pt-30 py-2 px-30">
          <div className="flex items-center justify-between mt-6">
            <h1 className="text-2xl font-bold">{category.name}</h1>

            <div className="text-sm text-gray-600 flex items-center">
              {breadcrumb.map((b, idx) => (
                <div key={b.id} className="flex items-center">
                  <Link className="hover:underline" to={`/c/${b.path}`}>
                    {b.name}
                  </Link>
                  {idx < breadcrumb.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-500 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 mt-6">
            {/* Filters */}
            <aside className="bg-white border border-gray-200 rounded-lg h-fit lg:sticky lg:top-32">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
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
                      value={draftMin}
                      onChange={(e) => setDraftMin(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#F26A24]"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="Max"
                      value={draftMax}
                      onChange={(e) => setDraftMax(e.target.value)}
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

            {/* Products */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-700">
                  Menampilkan <b>{products?.total ?? items.length} produk</b> dalam kategori{" "}
                  <b>{category.name}</b>
                </div>

                {/* ✅ ruparupa-like dropdown */}
                <SortDropdown
                  value={sortUI}
                  onChange={(v) => setParam("sort", v)}
                />
              </div>

              {productsQ.isLoading ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-500">
                  Memuat produk...
                </div>
              ) : items.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-500">
                  Produk kosong.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {items.map((p: any) => {
                      const thumb =
                        p.thumbnail?.image ??
                        (p.images && p.images.length > 0 ? p.images[0].image : null);

                      return (
                        <Link
                          key={p.id}
                          to={`/produk/${p.slug}`}
                          className="bg-white rounded-xl overflow-hidden hover:shadow-lg shadow transition-shadow"
                        >
                          <div className="aspect-square bg-gray-100">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>

                          <div className="p-3">
                            <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                              {p.name}
                            </div>
                            <div className="text-base font-bold text-gray-900 mt-2">
                              Rp {Number(p.price).toLocaleString("id-ID")}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {products && products.last_page > 1 && (
                    <div className="flex items-center gap-2 mt-6">
                      <button
                        className="px-3 py-2 border rounded-lg disabled:opacity-50"
                        disabled={products.current_page <= 1}
                        onClick={() => setParam("page", products.current_page - 1)}
                      >
                        Prev
                      </button>

                      <div className="text-sm text-gray-600">
                        Page {products.current_page} / {products.last_page}
                      </div>

                      <button
                        className="px-3 py-2 border rounded-lg disabled:opacity-50"
                        disabled={products.current_page >= products.last_page}
                        onClick={() => setParam("page", products.current_page + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}