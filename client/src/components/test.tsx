// import React, { useState } from 'react';
// import { LayoutDashboard, Users, ShoppingCart, BarChart3, Settings, Bell, Search, Menu, X, Package, TrendingUp, DollarSign, Edit, Trash2, Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

// // Reusable Table Component
// function DataTable({ columns, data, actions, itemsPerPage = 5 }) {
//   const [currentPage, setCurrentPage] = useState(1);

//   const totalPages = Math.ceil(data.length / itemsPerPage);
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               {columns.map((column, index) => (
//                 <th
//                   key={index}
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   {column.header}
//                 </th>
//               ))}
//               {actions && (
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Aksi
//                 </th>
//               )}
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {currentData.map((row, rowIndex) => (
//               <tr key={rowIndex} className="hover:bg-gray-50">
//                 {columns.map((column, colIndex) => (
//                   <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
//                     {column.render ? column.render(row) : row[column.accessor]}
//                   </td>
//                 ))}
//                 {actions && (
//                   <td className="px-6 py-4 whitespace-nowrap text-sm">
//                     <div className="flex items-center gap-2">
//                       {actions.map((action, actionIndex) => {
//                         const Icon = action.icon;
//                         return (
//                           <button
//                             key={actionIndex}
//                             onClick={() => action.onClick(row)}
//                             className={`p-2 ${action.color} hover:${action.hoverColor} rounded-lg transition-colors`}
//                             title={action.label}
//                           >
//                             <Icon size={18} />
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </td>
//                 )}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
//           <div className="text-sm text-gray-700">
//             Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> sampai{' '}
//             <span className="font-medium">{Math.min(indexOfLastItem, data.length)}</span> dari{' '}
//             <span className="font-medium">{data.length}</span> data
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={handlePrevPage}
//               disabled={currentPage === 1}
//               className={`p-2 rounded-lg border ${
//                 currentPage === 1
//                   ? 'border-gray-200 text-gray-400 cursor-not-allowed'
//                   : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//               }`}
//             >
//               <ChevronLeft size={20} />
//             </button>

//             <div className="flex gap-1">
//               {[...Array(totalPages)].map((_, index) => {
//                 const pageNumber = index + 1;
//                 return (
//                   <button
//                     key={pageNumber}
//                     onClick={() => handlePageChange(pageNumber)}
//                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                       currentPage === pageNumber
//                         ? 'bg-[#F26A24] text-white'
//                         : 'text-gray-700 hover:bg-gray-100'
//                     }`}
//                   >
//                     {pageNumber}
//                   </button>
//                 );
//               })}
//             </div>

//             <button
//               onClick={handleNextPage}
//               disabled={currentPage === totalPages}
//               className={`p-2 rounded-lg border ${
//                 currentPage === totalPages
//                   ? 'border-gray-200 text-gray-400 cursor-not-allowed'
//                   : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//               }`}
//             >
//               <ChevronRight size={20} />
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function AdminDashboard() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [activePage, setActivePage] = useState('dashboard');
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [showProductDetail, setShowProductDetail] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editedProduct, setEditedProduct] = useState(null);

//   const menuItems = [
//     { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
//     { id: 'users', name: 'Pengguna', icon: Users },
//     { id: 'products', name: 'Produk', icon: Package },
//     { id: 'orders', name: 'Pesanan', icon: ShoppingCart },
//     { id: 'analytics', name: 'Analitik', icon: BarChart3 },
//     { id: 'settings', name: 'Pengaturan', icon: Settings },
//   ];

//   const stats = [
//     { label: 'Total Pengguna', value: '2,543', change: '+12%', icon: Users, color: 'bg-blue-500' },
//     { label: 'Total Pesanan', value: '1,234', change: '+8%', icon: ShoppingCart, color: 'bg-green-500' },
//     { label: 'Pendapatan', value: 'Rp 45.2M', change: '+23%', icon: DollarSign, color: 'bg-[#F26A24]' },
//     { label: 'Produk Aktif', value: '867', change: '+5%', icon: Package, color: 'bg-purple-500' },
//   ];

//   const recentOrders = [
//     { id: '#12345', customer: 'Ahmad Wijaya', product: 'Laptop Gaming', status: 'Selesai', amount: 'Rp 15.000.000' },
//     { id: '#12346', customer: 'Siti Nurhaliza', product: 'Smartphone', status: 'Proses', amount: 'Rp 8.500.000' },
//     { id: '#12347', customer: 'Budi Santoso', product: 'Headphone', status: 'Pending', amount: 'Rp 2.500.000' },
//     { id: '#12348', customer: 'Dewi Lestari', product: 'Tablet', status: 'Selesai', amount: 'Rp 6.000.000' },
//   ];

//   const products = [
//     { id: 'PRD001', name: 'Laptop Gaming ASUS ROG', category: 'Elektronik', price: 'Rp 15.000.000', stock: 25, status: 'Aktif', image: '💻', description: 'Laptop gaming dengan performa tinggi, dilengkapi processor Intel Core i9 generasi terbaru dan GPU NVIDIA RTX 4070.', sku: 'ASUS-ROG-001', brand: 'ASUS', weight: '2.5 kg', dimensions: '35.4 x 25.9 x 2.8 cm' },
//     { id: 'PRD002', name: 'iPhone 15 Pro Max', category: 'Smartphone', price: 'Rp 18.500.000', stock: 40, status: 'Aktif', image: '📱', description: 'iPhone terbaru dengan chip A17 Pro, kamera 48MP, dan layar Super Retina XDR 6.7 inci.', sku: 'APPL-IP15PM-001', brand: 'Apple', weight: '221 g', dimensions: '15.9 x 7.7 x 0.83 cm' },
//     { id: 'PRD003', name: 'Sony WH-1000XM5', category: 'Audio', price: 'Rp 4.500.000', stock: 15, status: 'Aktif', image: '🎧', description: 'Headphone premium dengan noise cancelling terbaik di kelasnya dan kualitas audio superior.', sku: 'SONY-WH1000XM5', brand: 'Sony', weight: '250 g', dimensions: '20 x 18 x 8 cm' },
//     { id: 'PRD004', name: 'MacBook Pro M3', category: 'Laptop', price: 'Rp 32.000.000', stock: 8, status: 'Aktif', image: '💻', description: 'MacBook Pro dengan chip M3 yang revolusioner, performa luar biasa untuk creative professional.', sku: 'APPL-MBP-M3', brand: 'Apple', weight: '1.6 kg', dimensions: '31.2 x 22.1 x 1.55 cm' },
//     { id: 'PRD005', name: 'Samsung Galaxy Tab S9', category: 'Tablet', price: 'Rp 12.000.000', stock: 0, status: 'Habis', image: '📱', description: 'Tablet premium dengan layar AMOLED 11 inci dan S Pen untuk produktivitas maksimal.', sku: 'SAMS-TABS9', brand: 'Samsung', weight: '498 g', dimensions: '25.4 x 16.5 x 0.57 cm' },
//     { id: 'PRD006', name: 'Canon EOS R6', category: 'Kamera', price: 'Rp 38.000.000', stock: 5, status: 'Aktif', image: '📷', description: 'Kamera mirrorless full-frame dengan sensor 20MP dan video recording 4K 60fps.', sku: 'CANON-EOSR6', brand: 'Canon', weight: '680 g', dimensions: '13.8 x 9.8 x 8.8 cm' },
//     { id: 'PRD007', name: 'PlayStation 5', category: 'Gaming', price: 'Rp 8.500.000', stock: 12, status: 'Aktif', image: '🎮', description: 'Konsol gaming generasi terbaru dengan teknologi ray tracing dan SSD ultra-cepat.', sku: 'SONY-PS5', brand: 'Sony', weight: '4.5 kg', dimensions: '39 x 26 x 10.4 cm' },
//     { id: 'PRD008', name: 'Apple Watch Series 9', category: 'Wearable', price: 'Rp 7.500.000', stock: 30, status: 'Aktif', image: '⌚', description: 'Smartwatch dengan chip S9, layar always-on yang lebih terang, dan fitur kesehatan lengkap.', sku: 'APPL-AWS9', brand: 'Apple', weight: '38.7 g', dimensions: '4.1 x 3.5 x 1.07 cm' },
//     { id: 'PRD009', name: 'Dell XPS 15', category: 'Laptop', price: 'Rp 28.000.000', stock: 18, status: 'Aktif', image: '💻', description: 'Laptop premium dengan layar InfinityEdge 4K OLED dan performa workstation-class.', sku: 'DELL-XPS15', brand: 'Dell', weight: '1.86 kg', dimensions: '34.4 x 23 x 1.8 cm' },
//     { id: 'PRD010', name: 'Samsung Galaxy S24 Ultra', category: 'Smartphone', price: 'Rp 19.500.000', stock: 22, status: 'Aktif', image: '📱', description: 'Flagship smartphone dengan S Pen, kamera 200MP, dan layar Dynamic AMOLED 2X 6.8 inci.', sku: 'SAMS-S24U', brand: 'Samsung', weight: '232 g', dimensions: '16.2 x 7.9 x 0.86 cm' },
//     { id: 'PRD011', name: 'iPad Pro 12.9"', category: 'Tablet', price: 'Rp 17.000.000', stock: 14, status: 'Aktif', image: '📱', description: 'iPad Pro dengan chip M2, layar Liquid Retina XDR, dan support untuk Apple Pencil generasi ke-2.', sku: 'APPL-IPADPRO', brand: 'Apple', weight: '682 g', dimensions: '28 x 21.5 x 0.64 cm' },
//     { id: 'PRD012', name: 'AirPods Pro 2', category: 'Audio', price: 'Rp 3.800.000', stock: 50, status: 'Aktif', image: '🎧', description: 'Earbuds wireless dengan Active Noise Cancellation yang ditingkatkan dan audio spasial adaptif.', sku: 'APPL-APPRO2', brand: 'Apple', weight: '50.8 g', dimensions: '4.5 x 6 x 2.1 cm' },
//     { id: 'PRD013', name: 'LG OLED TV 55"', category: 'Elektronik', price: 'Rp 22.000.000', stock: 6, status: 'Aktif', image: '📺', description: 'Smart TV OLED 4K dengan teknologi self-lit pixels untuk kontras sempurna dan warna akurat.', sku: 'LG-OLED55', brand: 'LG', weight: '18.9 kg', dimensions: '122.8 x 70.6 x 4.69 cm' },
//     { id: 'PRD014', name: 'DJI Mini 3 Pro', category: 'Drone', price: 'Rp 12.500.000', stock: 0, status: 'Habis', image: '🚁', description: 'Drone compact dengan kamera 4K HDR, waktu terbang 34 menit, dan obstacle sensing 3 arah.', sku: 'DJI-MINI3P', brand: 'DJI', weight: '249 g', dimensions: '14.5 x 9 x 6.2 cm' },
//     { id: 'PRD015', name: 'Bose SoundLink', category: 'Audio', price: 'Rp 5.200.000', stock: 28, status: 'Aktif', image: '🔊', description: 'Speaker Bluetooth portabel dengan suara 360 derajat, baterai 24 jam, dan tahan air IP67.', sku: 'BOSE-SLINK', brand: 'Bose', weight: '590 g', dimensions: '10.4 x 10.4 x 10.4 cm' },
//   ];

//   const users = [
//     { id: 'USR001', name: 'Ahmad Wijaya', email: 'ahmad@email.com', role: 'Admin', status: 'Aktif', joined: '12 Jan 2024' },
//     { id: 'USR002', name: 'Siti Nurhaliza', email: 'siti@email.com', role: 'Customer', status: 'Aktif', joined: '15 Jan 2024' },
//     { id: 'USR003', name: 'Budi Santoso', email: 'budi@email.com', role: 'Customer', status: 'Aktif', joined: '18 Jan 2024' },
//     { id: 'USR004', name: 'Dewi Lestari', email: 'dewi@email.com', role: 'Manager', status: 'Aktif', joined: '20 Jan 2024' },
//     { id: 'USR005', name: 'Eko Prasetyo', email: 'eko@email.com', role: 'Customer', status: 'Nonaktif', joined: '22 Jan 2024' },
//     { id: 'USR006', name: 'Rina Kusuma', email: 'rina@email.com', role: 'Customer', status: 'Aktif', joined: '25 Jan 2024' },
//     { id: 'USR007', name: 'Agus Setiawan', email: 'agus@email.com', role: 'Customer', status: 'Aktif', joined: '28 Jan 2024' },
//     { id: 'USR008', name: 'Maya Sari', email: 'maya@email.com', role: 'Manager', status: 'Aktif', joined: '01 Feb 2024' },
//   ];

//   const handleEditProduct = () => {
//     setIsEditMode(true);
//     setEditedProduct({ ...selectedProduct });
//   };

//   const handleCancelEdit = () => {
//     setIsEditMode(false);
//     setEditedProduct(null);
//   };

//   const handleSaveEdit = () => {
//     // Di sini Anda bisa menambahkan logic untuk menyimpan data ke backend
//     console.log('Saving product:', editedProduct);
//     setSelectedProduct(editedProduct);
//     setIsEditMode(false);
//     alert('Produk berhasil diperbarui!');
//   };

//   const handleInputChange = (field, value) => {
//     setEditedProduct(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   // Column definitions for Products
//   const productColumns = [
//     {
//       header: 'Produk',
//       accessor: 'name',
//       render: (row) => (
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
//             {row.image}
//           </div>
//           <span className="text-sm font-medium text-gray-900">{row.name}</span>
//         </div>
//       ),
//     },
//     {
//       header: 'ID',
//       accessor: 'id',
//       render: (row) => <span className="text-sm text-gray-700">{row.id}</span>,
//     },
//     {
//       header: 'Kategori',
//       accessor: 'category',
//       render: (row) => <span className="text-sm text-gray-700">{row.category}</span>,
//     },
//     {
//       header: 'Harga',
//       accessor: 'price',
//       render: (row) => <span className="text-sm font-medium text-gray-900">{row.price}</span>,
//     },
//     {
//       header: 'Stok',
//       accessor: 'stock',
//       render: (row) => (
//         <span
//           className={`text-sm font-medium ${
//             row.stock === 0 ? 'text-red-600' : row.stock < 10 ? 'text-yellow-600' : 'text-gray-900'
//           }`}
//         >
//           {row.stock} unit
//         </span>
//       ),
//     },
//     {
//       header: 'Status',
//       accessor: 'status',
//       render: (row) => (
//         <span
//           className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//             row.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//           }`}
//         >
//           {row.status}
//         </span>
//       ),
//     },
//   ];

//   // Column definitions for Users
//   const userColumns = [
//     {
//       header: 'Nama',
//       accessor: 'name',
//       render: (row) => (
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-[#F26A24] rounded-full flex items-center justify-center text-white font-semibold text-sm">
//             {row.name.charAt(0)}
//           </div>
//           <div>
//             <div className="text-sm font-medium text-gray-900">{row.name}</div>
//             <div className="text-xs text-gray-500">{row.email}</div>
//           </div>
//         </div>
//       ),
//     },
//     {
//       header: 'ID',
//       accessor: 'id',
//       render: (row) => <span className="text-sm text-gray-700">{row.id}</span>,
//     },
//     {
//       header: 'Role',
//       accessor: 'role',
//       render: (row) => (
//         <span
//           className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//             row.role === 'Admin'
//               ? 'bg-purple-100 text-purple-800'
//               : row.role === 'Manager'
//               ? 'bg-blue-100 text-blue-800'
//               : 'bg-gray-100 text-gray-800'
//           }`}
//         >
//           {row.role}
//         </span>
//       ),
//     },
//     {
//       header: 'Status',
//       accessor: 'status',
//       render: (row) => (
//         <span
//           className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//             row.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//           }`}
//         >
//           {row.status}
//         </span>
//       ),
//     },
//     {
//       header: 'Bergabung',
//       accessor: 'joined',
//       render: (row) => <span className="text-sm text-gray-700">{row.joined}</span>,
//     },
//   ];

//   // Column definitions for Orders (Dashboard)
//   const orderColumns = [
//     {
//       header: 'ID Pesanan',
//       accessor: 'id',
//       render: (row) => <span className="text-sm font-medium text-gray-900">{row.id}</span>,
//     },
//     {
//       header: 'Pelanggan',
//       accessor: 'customer',
//       render: (row) => <span className="text-sm text-gray-700">{row.customer}</span>,
//     },
//     {
//       header: 'Produk',
//       accessor: 'product',
//       render: (row) => <span className="text-sm text-gray-700">{row.product}</span>,
//     },
//     {
//       header: 'Status',
//       accessor: 'status',
//       render: (row) => (
//         <span
//           className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//             row.status === 'Selesai'
//               ? 'bg-green-100 text-green-800'
//               : row.status === 'Proses'
//               ? 'bg-[#F26A24] bg-opacity-10 text-[#F26A24]'
//               : 'bg-yellow-100 text-yellow-800'
//           }`}
//         >
//           {row.status}
//         </span>
//       ),
//     },
//     {
//       header: 'Jumlah',
//       accessor: 'amount',
//       render: (row) => <span className="text-sm font-medium text-gray-900">{row.amount}</span>,
//     },
//   ];

//   // Actions for Products
//   const productActions = [
//     {
//       label: 'Lihat',
//       icon: Eye,
//       color: 'text-blue-600',
//       hoverColor: 'bg-blue-50',
//       onClick: (row) => {
//         setSelectedProduct(row);
//         setShowProductDetail(true);
//         setIsEditMode(false);
//       },
//     },
//     {
//       label: 'Edit',
//       icon: Edit,
//       color: 'text-[#F26A24]',
//       hoverColor: 'bg-orange-50',
//       onClick: (row) => {
//         setSelectedProduct(row);
//         setEditedProduct({ ...row });
//         setShowProductDetail(true);
//         setIsEditMode(true);
//       },
//     },
//     {
//       label: 'Hapus',
//       icon: Trash2,
//       color: 'text-red-600',
//       hoverColor: 'bg-red-50',
//       onClick: (row) => {
//         if (confirm(`Apakah Anda yakin ingin menghapus produk ${row.name}?`)) {
//           console.log('Delete', row);
//           alert('Produk berhasil dihapus!');
//         }
//       },
//     },
//   ];

//   // Actions for Users
//   const userActions = [
//     {
//       label: 'Edit',
//       icon: Edit,
//       color: 'text-[#F26A24]',
//       hoverColor: 'bg-orange-50',
//       onClick: (row) => console.log('Edit', row),
//     },
//     {
//       label: 'Hapus',
//       icon: Trash2,
//       color: 'text-red-600',
//       hoverColor: 'bg-red-50',
//       onClick: (row) => console.log('Delete', row),
//     },
//   ];

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Product Detail Modal */}
//       {showProductDetail && selectedProduct && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
//             {/* Modal Header */}
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//               <h2 className="text-2xl font-bold text-gray-800">
//                 {isEditMode ? 'Edit Produk' : 'Detail Produk'}
//               </h2>
//               <button
//                 onClick={() => {
//                   setShowProductDetail(false);
//                   setIsEditMode(false);
//                   setEditedProduct(null);
//                 }}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="p-6">
//               {/* Product Image & Basic Info */}
//               <div className="flex flex-col md:flex-row gap-6 mb-6">
//                 <div className="w-full md:w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
//                   <span className="text-8xl">{isEditMode ? editedProduct.image : selectedProduct.image}</span>
//                 </div>
                
//                 <div className="flex-1">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex-1">
//                       {isEditMode ? (
//                         <>
//                           <input
//                             type="text"
//                             value={editedProduct.name}
//                             onChange={(e) => handleInputChange('name', e.target.value)}
//                             className="text-2xl font-bold text-gray-900 mb-2 w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F26A24] focus:border-transparent"
//                             placeholder="Nama Produk"
//                           />
//                           <input
//                             type="text"
//                             value={editedProduct.sku}
//                             onChange={(e) => handleInputChange('sku', e.target.value)}
//                             className="text-sm text-gray-500 mb-2 w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#F26A24] focus:border-transparent"
//                             placeholder="SKU"
//                           />
//                           <select
//                             value={editedProduct.status}
//                             onChange={(e) => handleInputChange('status', e.target.value)}
//                             className="px-3 py-1 text-xs font-semibold rounded-full border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F26A24]"
//                           >
//                             <option value="Aktif">Aktif</option>
//                             <option value="Habis">Habis</option>
//                           </select>
//                         </>
//                       ) : (
//                         <>
//                           <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
//                           <p className="text-sm text-gray-500 mb-2">SKU: {selectedProduct.sku}</p>
//                           <span
//                             className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                               selectedProduct.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                             }`}
//                           >
//                             {selectedProduct.status}
//                           </span>
//                         </>
//                       )}
//                     </div>
//                     <div className="text-right ml-4">
//                       {isEditMode ? (
//                         <input
//                           type="text"
//                           value={editedProduct.price}
//                           onChange={(e) => handleInputChange('price', e.target.value)}
//                           className="text-3xl font-bold text-[#F26A24] border-2 border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#F26A24] focus:border-transparent"
//                           placeholder="Harga"
//                         />
//                       ) : (
//                         <p className="text-3xl font-bold text-[#F26A24]">{selectedProduct.price}</p>
//                       )}
//                     </div>
//                   </div>
                  
//                   {isEditMode ? (
//                     <textarea
//                       value={editedProduct.description}
//                       onChange={(e) => handleInputChange('description', e.target.value)}
//                       className="text-gray-700 leading-relaxed w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F26A24] focus:border-transparent"
//                       rows="3"
//                       placeholder="Deskripsi produk"
//                     />
//                   ) : (
//                     <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
//                   )}
//                 </div>
//               </div>

//               {/* Product Details Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Informasi Produk</h4>
//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">ID Produk:</span>
//                       <span className="font-medium text-gray-900">{isEditMode ? editedProduct.id : selectedProduct.id}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Kategori:</span>
//                       {isEditMode ? (
//                         <input
//                           type="text"
//                           value={editedProduct.category}
//                           onChange={(e) => handleInputChange('category', e.target.value)}
//                           className="font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-[#F26A24]"
//                         />
//                       ) : (
//                         <span className="font-medium text-gray-900">{selectedProduct.category}</span>
//                       )}
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Brand:</span>
//                       {isEditMode ? (
//                         <input
//                           type="text"
//                           value={editedProduct.brand}
//                           onChange={(e) => handleInputChange('brand', e.target.value)}
//                           className="font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-[#F26A24]"
//                         />
//                       ) : (
//                         <span className="font-medium text-gray-900">{selectedProduct.brand}</span>
//                       )}
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Stok:</span>
//                       {isEditMode ? (
//                         <input
//                           type="number"
//                           value={editedProduct.stock}
//                           onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
//                           className="font-medium border border-gray-300 rounded px-2 py-1 w-20 focus:outline-none focus:ring-2 focus:ring-[#F26A24]"
//                         />
//                       ) : (
//                         <span className={`font-medium ${
//                           selectedProduct.stock === 0 ? 'text-red-600' : 
//                           selectedProduct.stock < 10 ? 'text-yellow-600' : 'text-green-600'
//                         }`}>
//                           {selectedProduct.stock} unit
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Spesifikasi Fisik</h4>
//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Berat:</span>
//                       {isEditMode ? (
//                         <input
//                           type="text"
//                           value={editedProduct.weight}
//                           onChange={(e) => handleInputChange('weight', e.target.value)}
//                           className="font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-[#F26A24]"
//                         />
//                       ) : (
//                         <span className="font-medium text-gray-900">{selectedProduct.weight}</span>
//                       )}
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Dimensi:</span>
//                       {isEditMode ? (
//                         <input
//                           type="text"
//                           value={editedProduct.dimensions}
//                           onChange={(e) => handleInputChange('dimensions', e.target.value)}
//                           className="font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-[#F26A24]"
//                         />
//                       ) : (
//                         <span className="font-medium text-gray-900">{selectedProduct.dimensions}</span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Stock Status Bar */}
//               {!isEditMode && (
//                 <div className="mb-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-sm font-medium text-gray-700">Status Stok</span>
//                     <span className="text-sm text-gray-600">{selectedProduct.stock} / 100 unit</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className={`h-2 rounded-full ${
//                         selectedProduct.stock === 0 ? 'bg-red-500' :
//                         selectedProduct.stock < 10 ? 'bg-yellow-500' : 'bg-green-500'
//                       }`}
//                       style={{ width: `${Math.min((selectedProduct.stock / 100) * 100, 100)}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex gap-3">
//                 {isEditMode ? (
//                   <>
//                     <button 
//                       onClick={handleSaveEdit}
//                       className="flex-1 bg-[#F26A24] text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
//                     >
//                       <Package size={20} />
//                       Simpan Perubahan
//                     </button>
//                     <button 
//                       onClick={handleCancelEdit}
//                       className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
//                     >
//                       Batal
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <button 
//                       onClick={handleEditProduct}
//                       className="flex-1 bg-[#F26A24] text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
//                     >
//                       <Edit size={20} />
//                       Edit Produk
//                     </button>
//                     <button className="px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
//                       <Trash2 size={20} />
//                       Hapus
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Sidebar */}
//       <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
//         <div className="p-4 border-b border-gray-200 flex items-center justify-between">
//           {sidebarOpen && <h1 className="text-xl font-bold text-[#F26A24]">Admin Panel</h1>}
//           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
//             {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
//           </button>
//         </div>

//         <nav className="flex-1 p-4 space-y-2">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             return (
//               <button
//                 key={item.id}
//                 onClick={() => setActivePage(item.id)}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
//                   activePage === item.id ? 'bg-[#F26A24] text-white' : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <Icon size={20} />
//                 {sidebarOpen && <span className="font-medium">{item.name}</span>}
//               </button>
//             );
//           })}
//         </nav>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header */}
//         <header className="bg-white border-b border-gray-200 px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4 flex-1">
//               <div className="relative flex-1 max-w-md">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="text"
//                   placeholder="Cari..."
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26A24] focus:border-transparent"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center gap-4">
//               <button className="relative p-2 hover:bg-gray-100 rounded-lg">
//                 <Bell size={20} />
//                 <span className="absolute top-1 right-1 w-2 h-2 bg-[#F26A24] rounded-full"></span>
//               </button>
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-[#F26A24] rounded-full flex items-center justify-center text-white font-semibold">
//                   A
//                 </div>
//                 <div className="hidden md:block">
//                   <p className="text-sm font-semibold">Admin User</p>
//                   <p className="text-xs text-gray-500">admin@example.com</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Dashboard Content */}
//         <main className="flex-1 overflow-y-auto p-6">
//           {activePage === 'dashboard' && (
//             <>
//               <div className="mb-6">
//                 <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
//                 <p className="text-gray-600">Selamat datang kembali! Berikut ringkasan hari ini.</p>
//               </div>

//               {/* Stats Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//                 {stats.map((stat, index) => {
//                   const Icon = stat.icon;
//                   return (
//                     <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//                       <div className="flex items-center justify-between mb-4">
//                         <div className={`${stat.color} p-3 rounded-lg`}>
//                           <Icon size={24} className="text-white" />
//                         </div>
//                         <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
//                           <TrendingUp size={16} />
//                           {stat.change}
//                         </span>
//                       </div>
//                       <h3 className="text-gray-600 text-sm mb-1">{stat.label}</h3>
//                       <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Recent Orders */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Pesanan Terbaru</h3>
//                 <DataTable columns={orderColumns} data={recentOrders} itemsPerPage={5} />
//               </div>
//             </>
//           )}

//           {activePage === 'products' && (
//             <>
//               <div className="mb-6 flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-800">Produk</h2>
//                   <p className="text-gray-600">Kelola semua produk di toko Anda</p>
//                 </div>
//                 <button className="flex items-center gap-2 bg-[#F26A24] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
//                   <Plus size={20} />
//                   Tambah Produk
//                 </button>
//               </div>

//               <DataTable columns={productColumns} data={products} actions={productActions} itemsPerPage={5} />
//             </>
//           )}

//           {activePage === 'users' && (
//             <>
//               <div className="mb-6 flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-800">Pengguna</h2>
//                   <p className="text-gray-600">Kelola semua pengguna di sistem Anda</p>
//                 </div>
//                 <button className="flex items-center gap-2 bg-[#F26A24] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
//                   <Plus size={20} />
//                   Tambah Pengguna
//                 </button>
//               </div>

//               <DataTable columns={userColumns} data={users} actions={userActions} itemsPerPage={5} />
//             </>
//           )}

//           {activePage === 'orders' && (
//             <>
//               <div className="mb-6">
//                 <h2 className="text-2xl font-bold text-gray-800">Pesanan</h2>
//                 <p className="text-gray-600">Kelola semua pesanan di toko Anda</p>
//               </div>

//               <DataTable columns={orderColumns} data={recentOrders} itemsPerPage={5} />
//             </>
//           )}

//           {(activePage === 'analytics' || activePage === 'settings') && (
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">
//                 {activePage === 'analytics' ? 'Analitik' : 'Pengaturan'}
//               </h3>
//               <p className="text-gray-600">Halaman ini dalam pengembangan</p>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }