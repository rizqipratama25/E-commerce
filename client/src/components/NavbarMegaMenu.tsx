import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Category } from "../services/category.service";
import { useMegaMenuCategories } from "../hooks/category/useMegaMenuCategories";

type Props = {
  headerHeight: number;
};

export default function NavbarMegaMenu({ headerHeight }: Props) {
  const { data: categories = [], isLoading, isError } = useMegaMenuCategories();
  const location = useLocation();

  const [openId, setOpenId] = useState<number | null>(null);

  // wrapper yang mencakup nav + dropdown
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const openCategory = useMemo<Category | null>(() => {
    return categories.find((c) => c.id === openId) ?? null;
  }, [categories, openId]);

  const close = () => setOpenId(null);

  // Close kalau pindah halaman (klik Link)
  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /**
   * Close kalau mouse bener-bener keluar dari area nav+dropdown.
   * Trick: gunakan onMouseLeave dengan relatedTarget check.
   * Kalau mouse pindah ke elemen yang masih di dalam wrapper -> jangan close.
   */
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && wrapperRef.current?.contains(next)) return; // masih di area
    close();
  };

  return (
    <div ref={wrapperRef} className="relative" onMouseLeave={handleMouseLeave}>
      {/* BACKDROP: hover/klik backdrop => close */}
      {openCategory && (
        <div
          className="fixed left-0 right-0 bottom-0 bg-black/40 z-40"
          style={{ top: headerHeight }}
          onMouseEnter={close}
          onClick={close}
        />
      )}

      {/* Top nav items */}
      <div className="relative z-50 flex items-center gap-10 overflow-x-auto pt-2 pb-5 px-10">
        {/* statis */}
        <a className="text-gray-700 hover:text-[#F26A24] whitespace-nowrap" href="#">
          UrbanMart Bisnis
        </a>
        <a className="text-gray-700 hover:text-[#F26A24] whitespace-nowrap" href="#">
          Official Partners
        </a>
        <a className="text-gray-700 hover:text-[#F26A24] whitespace-nowrap" href="#">
          Best Deals
        </a>

        {isLoading && (
          <span className="text-gray-500 text-sm whitespace-nowrap">Memuat kategori...</span>
        )}

        {isError && (
          <span className="text-red-500 text-sm whitespace-nowrap">Gagal memuat kategori</span>
        )}

        {/* dynamic level 1 */}
        {!isLoading &&
          !isError &&
          categories.map((lvl1) => (
            <div key={lvl1.id} className="relative" onMouseEnter={() => setOpenId(lvl1.id)}>
              <Link
                to={`/c/${lvl1.path}`}
                className={`whitespace-nowrap ${
                  openId === lvl1.id ? "text-[#F26A24]" : "text-gray-700"
                } hover:text-[#F26A24]`}
              >
                {lvl1.name}
              </Link>
            </div>
          ))}
      </div>

      {/* Dropdown panel */}
      {openCategory && (
        <div className="absolute left-0 top-full w-full z-[60]">
          <div className="bg-white shadow-lg overflow-hidden">
            <div className="p-6 max-h-[420px] overflow-auto">
              <div className="grid grid-cols-3 gap-8">
                {(openCategory.children ?? []).map((lvl2) => (
                  <div key={lvl2.id} className="min-w-0">
                    <Link
                      to={`/c/${lvl2.path}`}
                      className="block font-semibold text-gray-900 hover:text-[#F26A24]"
                    >
                      {lvl2.name}
                    </Link>

                    <div className="mt-3 space-y-2">
                      {(lvl2.children ?? []).map((lvl3) => (
                        <Link
                          key={lvl3.id}
                          to={`/c/${lvl3.path}`}
                          className="block text-gray-700 hover:text-[#F26A24] truncate"
                        >
                          {lvl3.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
