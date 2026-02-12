import { LayoutDashboard, MapPin, MapPinHouse, MapPinned, MessageCircleMore, Navigation, ShoppingCart, Tags, Truck, User } from "lucide-react"
import HeaderAdminPartner from "../components/HeaderAdminPartner"
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { getUser } from "../utils/authStorage";

const menuItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Pesanan", to: "/admin/pesanan", icon: ShoppingCart },
  { label: "Partner", to: "/admin/partner", icon: User },
  { label: "Kategori", to: "/admin/kategori", icon: Tags },
  { label: "Provinsi", to: "/admin/provinsi", icon: MapPinned },
  { label: "Kota", to: "/admin/kota", icon: MapPin },
  { label: "Kecamatan", to: "/admin/kecamatan", icon: Navigation },
  { label: "Kelurahan", to: "/admin/kelurahan", icon: MapPinHouse },
  { label: "Jasa Pengiriman", to: "/admin/jasa-pengiriman", icon: Truck },
//   { label: "Daftar Pesan", to: "/admin/daftar-pesan", icon: MessageCircleMore },
];

const Admin = () => {
    const {role, fullname, email} = getUser();

    return (
        <div>
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar */}
                <Sidebar menuItems={menuItems} role={role} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <HeaderAdminPartner fullname={fullname} email={email} />

                    {/* Dashboard Content */}
                    <main className="flex-1 overflow-y-auto p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    )
}

export default Admin