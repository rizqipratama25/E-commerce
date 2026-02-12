import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
// import ChatWidget from "../../components/ChatWidget";
import slider1 from "../../assets/slider/slider-1.webp";
import { useProducts } from "../../hooks/product/useProducts";
import { NavLink } from "react-router-dom";
import { formatRupiah } from "../../utils/function";

const HomePage = () => {
    const { data: productsResponse, isLoading } = useProducts();
    const products = productsResponse?.data ?? [];

    return (
        <div className="min-h-screen bg-gray-50 pt-30">
            <Navbar />

            {/* Main Content */}
            <main className="mx-auto px-30 py-6">
                {/* Hero Banner */}
                <div className="py-5">
                    <img src={slider1} alt="slider" className="w-full h-auto" />
                </div>

                {isLoading && <p className="text-xs text-gray-500 mt-2">Memuat produk...</p>}

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
                    {products.map((product, index) => (
                        <NavLink key={index} to={`/produk/${product.slug}`}>
                            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                                <img
                                    src={`${product.thumbnail.image}`}
                                    alt={product.name}
                                    className="w-full h-45 object-cover"
                                />
                                <div className="p-3">
                                    <h3 className="text-gray-800 mb-2 line-clamp-2 h-15">
                                        {product.name}
                                    </h3>
                                    <div className="text-lg font-bold text-gray-900">
                                        {formatRupiah(product.price)}
                                    </div>
                                </div>
                            </div>
                        </NavLink>
                    ))}
                </div>
            </main>

            <Footer />
            
            {/* <ChatWidget /> */}
        </div>
    );
}

export default HomePage;