import { ChevronDown, LogOut, MapPinned } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLogout } from "../hooks/auth/useLogout";
import { buildHandleLogout } from "../handlers/logout.handler";

interface Props {
    fullname?: string;
    email?: string;
}

const UserMenu = ({fullname, email} : Props) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { mutate: logout, isPending: isLogout } = useLogout();
  const navigate = useNavigate();

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogout = buildHandleLogout(logout, navigate);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 cursor-pointer"
      >
        <div className="hidden md:flex flex-col items-start">
          <span className="text-gray-900 max-w-35 truncate">
            Hi, {fullname}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          {/* header user */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-500">Masuk sebagai</p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {fullname}
            </p>
            {email && (
              <p className="text-xs text-gray-500 truncate">
                {email}
              </p>
            )}
          </div>

          {/* menu list */}
          <nav className="py-1 text-sm">
            <NavLink
              to="/menu/alamat"
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
            >
              <MapPinned className="w-4 h-4 text-gray-500" />
              <span>Daftar Alamat</span>
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLogout ? "Keluar..." : "Logout"}</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default UserMenu