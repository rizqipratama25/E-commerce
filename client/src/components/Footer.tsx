import { Facebook, Instagram, Youtube } from "lucide-react"
import urbanmartLogo from "../assets/urbanmart_logo.png";

const Footer = () => {
    return (
        <div>
            {/* Footer */}
            <footer className="bg-white border-t border-gray-300 mt-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <img src={urbanmartLogo} alt="Urban Mart Logo" className="w-20 h-20" />
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <p className="text-gray-700">
                                Solusi Omnichannel Kebutuhan Rumah Tangga, Gaya Hidup, dan Hobi Terlengkap dan Berkualitas
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <a href="#" className="text-gray-600 hover:text-orange-500">
                                <Instagram className="w-6 h-6" />
                            </a>
                            <a href="#" className="text-gray-600 hover:text-orange-500">
                                <Youtube className="w-6 h-6" />
                            </a>
                            <a href="#" className="text-gray-600 hover:text-orange-500">
                                <Facebook className="w-6 h-6" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Footer