import { LayoutDashboard, MapPin, Package, ShoppingCart, } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import HeaderAdminPartner from '../components/HeaderAdminPartner';
import { Outlet } from 'react-router-dom';

const menuItems = [
  { label: "Dashboard", to: "/partner", icon: LayoutDashboard },
  { label: "Produk", to: "/partner/produk", icon: Package },
  { label: "Pesanan", to: "/partner/pesanan", icon: ShoppingCart },
  { label: "Alamat", to: "/partner/alamat", icon: MapPin },
];

const Partner = () => {
  const {role, fullname, email} = JSON.parse(localStorage.getItem('auth_user') ?? '{}');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar menuItems={menuItems} role={role}/>

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
  );
}

export default Partner