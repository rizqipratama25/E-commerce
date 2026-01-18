import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Search, ShoppingCart, User } from "lucide-react";
import urbanmartLogo from "../assets/urbanmart_logo.png";
import { getUser } from "../utils/authStorage";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import UserMenu from "./UserMenu";
import NavbarMegaMenu from "./NavbarMegaMenu";
import { getCartTotalQty } from "../utils/cartStorage";
import MiniCartDropdown from "./MiniCartDropdown";
import { useMiniCart } from "../hooks/cart/useMiniCart";

const Navbar = () => {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ tambah ini

  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const [keyword, setKeyword] = useState("");

  // ✅ mini cart
  const [miniOpen, setMiniOpen] = useState(false);

  // ✅ disable mini cart kalau sedang di CartPage
  const isCartPage = location.pathname === "/cart";
  const canShowMiniCart = !!user && !isCartPage;

  // kalau pindah ke /cart, pastikan dropdown ketutup
  useEffect(() => {
    if (isCartPage) setMiniOpen(false);
  }, [isCartPage]);

  // fetch hanya saat hover/open dan bukan cart page
  

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => setHeaderHeight(el.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const submitSearch = () => {
    const q = keyword.trim();
    if (!q) return;
    navigate(`/search?name=${encodeURIComponent(q)}`);
  };

  const { data: miniCart, isLoading: miniLoading } = useMiniCart(3, canShowMiniCart && miniOpen);

  return (
    <div className="fixed top-0 left-0 right-0 z-50" ref={headerRef}>
      <header className="bg-white shadow-sm">
        <div className="max-w-8xl px-10">
          <div className="flex items-center justify-between gap-10">
            <NavLink to="/">
              <div className="flex items-center gap-2">
                <img src={urbanmartLogo} alt="Urban Mart Logo" className="w-20 h-20" />
              </div>
            </NavLink>

            {/* SEARCH */}
            <form
              className="flex-1 relative"
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
            >
              <input
                type="text"
                placeholder="Cari produk..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:border-[#F26A24]"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-6 rounded-r hover:opacity-90 bg-[#F26A24]"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </form>

            {user ? (
              <div className="flex items-center gap-1 text-gray-700">
                {/* ✅ CART + MINI CART */}
                <div
                  className="relative mr-3"
                  onMouseEnter={() => {
                    if (!canShowMiniCart) return;
                    setMiniOpen(true);
                  }}
                  onMouseLeave={() => setMiniOpen(false)}
                >
                  <button
                    type="button"
                    className="relative cursor-pointer"
                    onClick={() => navigate("/cart")}
                    aria-label="Cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {getCartTotalQty()}
                    </span>
                  </button>

                  {/* render dropdown hanya kalau boleh */}
                  {canShowMiniCart && (
                    <MiniCartDropdown
                      open={miniOpen}
                      onClose={() => setMiniOpen(false)}
                      loading={miniLoading}
                      data={miniCart}
                    />
                  )}
                </div>

                <User className="w-5 h-5" />
                <span className="whitespace-nowrap">
                  <UserMenu fullname={user.fullname} email={user.email} />
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-gray-700">
                <NavLink to="/auth/login">
                  <span className="border border-[#F26A24] py-2 px-7 rounded text-[#F26A24] text-sm font-semibold cursor-pointer">
                    Masuk
                  </span>
                </NavLink>
                <NavLink to="/auth/register">
                  <span className="bg-[#F26A24] py-2 px-7 rounded text-white text-sm font-semibold cursor-pointer">
                    Daftar
                  </span>
                </NavLink>
              </div>
            )}
          </div>
      </div>

        <nav className="bg-white">
          <div className="max-w-8xl mx-auto">
            <NavbarMegaMenu headerHeight={headerHeight} />
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;