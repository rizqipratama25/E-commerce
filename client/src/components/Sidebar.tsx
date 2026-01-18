import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLogout } from "../hooks/auth/useLogout";
import { buildHandleLogout } from "../handlers/logout.handler";

interface MenuItem {
    label: string;
    to: string;
    icon: LucideIcon;
}

interface Props {
    menuItems: MenuItem[];
    role: string;
}

const Sidebar = ({ menuItems, role }: Props) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { mutate: logout, isPending: isLogout } = useLogout();
    const navigate = useNavigate();

    const handleLogout = buildHandleLogout(logout, navigate);

    return (
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
            <div className="p-4.5 border-b border-gray-200 flex items-center justify-between">
                {sidebarOpen && <h1 className="text-xl font-bold text-[#F26A24]">{role} Panel</h1>}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/admin' || item.to === '/partner'}
                        className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                            ? 'bg-[#F26A24] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <item.icon size={20} />
                        {sidebarOpen && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="py-4 px-4">
                <button
                    onClick={handleLogout}
                    disabled={isLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                    <LogOut size={20} />
                    {sidebarOpen && <span>{isLogout ? "Keluar..." : "Logout"}</span>}
                </button>
            </div>
        </div>
    )
}

export default Sidebar