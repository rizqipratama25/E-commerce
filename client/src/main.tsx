import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getToken } from './utils/authStorage.ts'
import api from './lib/axios.ts'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage.tsx'
import RegisterPage from './pages/auth/RegisterPage.tsx'
import Admin from './layout/Admin.tsx'
import Partner from './layout/Partner.tsx'
import ProductPage from './pages/partner/ProductPage.tsx'
import ProvincePage from './pages/admin/ProvincePage.tsx'
import CityPage from './pages/admin/CityPage.tsx'
import DistrictPage from './pages/admin/DistrictPage.tsx'
import ShippingServicePage from './pages/admin/ShippingServicePage.tsx'
import DashboardAdminPage from './pages/admin/DashboardAdminPage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import DashboardPartnerPage from './pages/partner/DashboardPartnerPage.tsx'
import ProductDetailPage from './pages/public/ProductDetailPage.tsx'
import MenuPage from './pages/buyer/MenuPage.tsx'
import UrbanVillagePage from './pages/admin/UrbanVillagePage.tsx'
import CheckoutPage from './pages/buyer/CheckoutPage.tsx'
import TransactionHistoryPage from './pages/buyer/TransactionHistoryPage.tsx'
import PartnerPage from './pages/admin/PartnerPage.tsx'
import OrderPagePartner from './pages/partner/OrderPagePartner.tsx'
import OrderPageAdmin from './pages/admin/OrderPageAdmin.tsx'
import CategoryPageAdmin from './pages/admin/CategoryPageAdmin.tsx'
import CategoryPage from './pages/public/CategoryPage.tsx'
import CartPage from './pages/buyer/CartPage.tsx'
import SearchPage from './pages/public/SearchPage.tsx'
import AddressPartnerPage from './pages/partner/AddressPartnerPage.tsx'
import AddressPage from './pages/buyer/AddressPage.tsx'
import PaymentMethodPage from './pages/buyer/PaymentMethodPage.tsx'
import PaymentDetailPage from './pages/buyer/PaymentDetailPage.tsx'
import { Toaster } from 'react-hot-toast'
// import AdminChatListPage from './pages/admin/AdminChatListPage.tsx'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/register', element: <RegisterPage /> },
  { path: '/c/*', element: <CategoryPage /> },
  { path: '/produk/:slug', element: <ProductDetailPage /> },  
  { path: '/search', element: <SearchPage /> },
  {
    element: <ProtectedRoute allowedRoles={['Admin']} />,
    children: [
      {
        path: '/admin',
        element: <Admin />,
        children: [
          { index: true, element: <DashboardAdminPage /> },
          { path: 'partner', element: <PartnerPage /> },
          { path: 'pesanan', element: <OrderPageAdmin /> },
          { path: 'kategori', element: <CategoryPageAdmin /> },
          { path: 'provinsi', element: <ProvincePage /> },
          { path: 'kota', element: <CityPage /> },
          { path: 'kecamatan', element: <DistrictPage /> },
          { path: 'kelurahan', element: <UrbanVillagePage /> },
          { path: 'jasa-pengiriman', element: <ShippingServicePage /> },
          // { path: 'daftar-pesan', element: <AdminChatListPage /> },
        ]
      },
    ]
  },
  {
    element: <ProtectedRoute allowedRoles={['Partner']} />,
    children: [
      {
        path: '/partner',
        element: <Partner />,
        children: [
          { index: true, element: <DashboardPartnerPage /> },
          { path: 'produk', element: <ProductPage /> },
          { path: 'pesanan', element: <OrderPagePartner /> },
          { path: 'alamat', element: <AddressPartnerPage /> },
        ]
      },
    ]
  },
  {
    element: <ProtectedRoute allowedRoles={['Buyer']} />,
    children: [
      {
        path: '/menu',
        element: <MenuPage />,
        children: [
          { path: 'alamat', element: <AddressPage /> },
          { path: 'riwayat-transaksi', element: <TransactionHistoryPage /> },
        ]
      },
      {
        path: '/checkout',
        element: <CheckoutPage />,
      },
      {
        path: '/cart',
        element: <CartPage />,
      },
      {
        path: '/payment/method',
        element: <PaymentMethodPage />,
      },
      {
        path: '/payment/detail',
        element: <PaymentDetailPage />,
      },
    ]
  }
])

const token = getToken();
if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Toaster position="bottom-right" reverseOrder={false} />
    <RouterProvider router={router} />
  </QueryClientProvider>,
)
