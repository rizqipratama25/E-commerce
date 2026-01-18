import { ChevronRight, MapPinned, ShoppingCart } from "lucide-react";
import Navbar from "../../components/Navbar"
import { NavLink, Outlet } from "react-router-dom";
import Footer from "../../components/Footer";

const activityMenuItems = [
  { label: "Riwayat Transaksi", to: "/menu/riwayat-transaksi", icon: ShoppingCart },
];

const accountMenuItems = [
  { label: "Daftar Alamat", to: "/menu/alamat", icon: MapPinned },
];

const MenuPage = () => {
  return (
    <div className="min-h-screen flex flex-col pt-40 bg-gray-50">
      <Navbar />

      <main className="flex-1">
        <div className="flex justify-center">
          <div className="relative w-full flex gap-6 px-30">

            {/* Kartu kiri */}
            <div className="w-85 bg-white rounded border border-gray-300">
              {/* <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b">
            <div className="flex items-center gap-1">
              <span className="text-3xl font-semibold leading-none">
                rewards
              </span>
              <span className="text-[#ff6a00] text-3xl leading-none">★</span>
            </div>
            <button className="flex items-center gap-1 text-sm font-semibold">
              <span className="">Silver</span>
              <span className="text-[#0076d6]">●</span>
            </button>
          </div> */}

              <div className="divide-y text-sm px-4">
                <div className="font-semibold border-0 text-base mt-4">Aktivitas</div>
                {activityMenuItems.map((item, index) => (
                  <NavLink to={item.to} key={index}>
                    <div className="flex pt-2 pb-4 cursor-pointer border-b border-gray-300 justify-between">
                      <div className="flex items-center gap-5">
                        <item.icon />
                        <span className="text-base font-semibold">{item.label}</span>
                      </div>
                      <ChevronRight className="" />
                    </div>
                  </NavLink>
                ))}

                <div className="font-semibold border-0 text-base mt-4">Akun</div>
                {accountMenuItems.map((item, index) => (
                  <NavLink to={item.to} key={index}>
                    <div className="flex pt-2 pb-4 cursor-pointer border-b border-gray-300 justify-between">
                      <div className="flex items-center gap-5">
                        <item.icon />
                        <span className="text-base font-semibold">{item.label}</span>
                      </div>
                      <ChevronRight className="" />
                    </div>
                  </NavLink>
                ))}
                {/* 0 Koin */}
                {/* <div className="flex items-start gap-3 px-8 py-4 cursor-pointer hover:bg-gray-50">
              <div>
                <p className="font-semibold">0 Koin</p>
                <p className="text-xs text-gray-500">Senilai Rp0</p>
              </div>
            </div> */}

                {/* Voucher Saya */}
                {/* <div className="flex items-start gap-3 px-8 py-4 cursor-pointer hover:bg-gray-50">
              <div>
                <p className="font-semibold">Voucher Saya</p>
                <p className="text-xs text-gray-500">
                  Lihat dan tukarkan Vouchermu
                </p>
              </div>
            </div> */}

                {/* Gabungkan Rewards */}
                {/* <div className="flex items-start gap-3 px-8 py-4 cursor-pointer hover:bg-gray-50">
              <div>
                <p className="font-semibold">Gabungkan Rewards</p>
                <p className="text-xs text-gray-500">
                  Segera gabungkan akun ruparupa, AZKO, SELMA Rewards, dan
                  Smile Club untuk menyatukan Koin dan riwayat belanja kamu
                </p>
              </div>
            </div> */}

                {/* Aktivitas header */}
                {/* <div className="px-8 py-3 text-xs font-semibold text-gray-500">
              Aktivitas
            </div> */}

                {/* affiliate */}
                {/* <div className="flex items-center gap-3 px-8 py-3 cursor-pointer hover:bg-gray-50">
              <span>👥</span>
              <span className="text-sm font-semibold">affiliate</span>
            </div> */}
              </div>
            </div>

            {/* Kartu kanan */}
            <div className="flex-1">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MenuPage