import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import TitleRoutesAdminPartner from "../../components/TitleRoutesAdminPartner";
import { useSummaryAdmin } from "../../hooks/dashboard/Admin/useSummaryAdmin";
import { formatRupiah } from "../../utils/function";
import { useNavigate } from "react-router-dom";


// const recentOrders = [
//     { id: '#12345', customer: 'Ahmad Wijaya', product: 'Laptop Gaming', status: 'Selesai', amount: 'Rp 15.000.000' },
//     { id: '#12346', customer: 'Siti Nurhaliza', product: 'Smartphone', status: 'Proses', amount: 'Rp 8.500.000' },
//     { id: '#12347', customer: 'Budi Santoso', product: 'Headphone', status: 'Pending', amount: 'Rp 2.500.000' },
//     { id: '#12348', customer: 'Dewi Lestari', product: 'Tablet', status: 'Selesai', amount: 'Rp 6.000.000' },
// ];

const DashboardAdminPage = () => {
    const { data: summaryData } = useSummaryAdmin();
    const navigate = useNavigate();

    const stats = [
        { label: 'Total Partner', value: summaryData?.total_partner, change: '+12%', icon: Users, color: 'bg-blue-500', link: '/admin/partner' },
        { label: 'Total Pesanan Dikirim', value: summaryData?.order, change: '+8%', icon: ShoppingCart, color: 'bg-green-500', link: '/admin/pesanan' },
        { label: 'Dompet', value: formatRupiah(summaryData?.wallet ?? 0), change: '+23%', icon: DollarSign, color: 'bg-[#F26A24]', link: '' },
        { label: 'Produk Aktif', value: summaryData?.product_active, change: '+5%', icon: Package, color: 'bg-purple-500', link: '' },
    ];


    return (
        <>
            <TitleRoutesAdminPartner title="Dashboard" description="Selamat datang kembali! Berikut ringkasan hari ini." />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer" onClick={() => navigate(stat.link)}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon size={24} className="text-white" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm mb-1">{stat.label}</h3>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Recent Orders
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Pesanan Terbaru</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pesanan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.customer}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.product}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Proses' ? 'bg-[#F26A24] bg-opacity-10 text-[#F26A24]' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div> */}
        </>
    )
}

export default DashboardAdminPage