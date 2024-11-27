import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import LetchonModal from "../components/letchonModal"; 
import { Fragment, useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from 'next/router';
import axios from 'axios';

const Letchon = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const { addToCart, cartItems } = useCart();
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('/api/check-auth');
                if (!response.data.isAuthenticated) {
                    router.push('/login?redirect=/letchon');
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                router.push('/login?redirect=/letchon');
            }
        };
    
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/lechon-products');
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
    
        checkAuth();
        fetchProducts();
    }, [router]);

    const handleOrder = (orderData) => {
        addToCart(orderData);
        setShowModal(false);
        setSelectedProduct(null);
    };

    const cartItemCount = cartItems.length;

    // Group products by type (e.g., Lechon Belly, Lechon Baboy, Lechon Manok)
    const groupedProducts = products.reduce((acc, product) => {
        const type = product.name;
        if (!acc[type]) acc[type] = [];
        acc[type].push(product);
        return acc;
    }, {});

    const lechonTypes = Object.keys(groupedProducts);
    const currentSection = lechonTypes[currentSectionIndex];

    const handleNextSection = () => {
        if (currentSectionIndex < lechonTypes.length - 1) {
            setCurrentSectionIndex(prev => prev + 1);
        }
    };

    const handlePreviousSection = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1);
        }
    };

    return (
        <Fragment>
            <div>
                <div className="w-full max-w-1xl mx-auto flex items-center justify-between border-b-2 px-2 py-7 h-16 bg-black shadow-md">
                    <div className="flex items-center space-x-8">
                        <Image
                            src="/Vector.png"
                            alt="Letchon Logo"
                            width={40}
                            height={35}
                            className="object-contain"
                        />
                    </div>
                    <div className="flex-grow flex justify-center">
                        <div className="flex space-x-10">
                            <Link href="/letchon">
                                <button className="text-white font-bold hover:text-orange-500 transition bg-transparent border-none cursor-pointer">
                                    Lechon
                                </button>
                            </Link>
                            <Link href="/viands">
                                <button className="text-white font-bold hover:text-orange-500 transition bg-transparent border-none cursor-pointer">
                                    Viands
                                </button>
                            </Link>
                            <Link href="/aboutus">
                                <button className="text-white font-bold hover:text-orange-500 transition bg-transparent border-none cursor-pointer">
                                    About Us
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-8">
                        <Link href="/profile">
                            <button className="flex items-center justify-center p-2 bg-transparent hover:bg-gray-800 rounded">
                                <Image
                                    src="/profile.png"
                                    alt="Profile"
                                    width={24}
                                    height={24}
                                    className="cursor-pointer"
                                />
                            </button>
                        </Link>
                        <Link href="/cart">
                            <div className="relative">
                                <button className="flex items-center justify-center p-2 bg-transparent hover:bg-gray-800 rounded">
                                    <Image
                                        src="/cart.png"
                                        alt="Cart"
                                        width={24}
                                        height={24}
                                        className="cursor-pointer"
                                    />
                                </button>
                                {cartItemCount > 0 && (
                                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                        {cartItemCount}
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="relative bg-[#f7c18e] w-full min-h-[85vh] flex items-center justify-center">
                <div className="absolute inset-0">
                    <Image
                        src="/hehe.png" 
                        alt="Lechon Background"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="relative flex flex-col w-full px-8 py-8">
                    <div className="text-center text-3xl font-bold text-white mb-8 bg-black/50 py-2 rounded-lg">
                        <h2>{currentSection}</h2>
                    </div>

                    {groupedProducts[currentSection] && groupedProducts[currentSection].length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {groupedProducts[currentSection].map((lechon) => (
                                <div key={lechon.productid} 
                                     className="bg-[#ff6b35] text-white rounded-xl shadow-xl overflow-hidden transform transition duration-300 hover:scale-105">
                                    <div className="w-full h-64 relative">
                                        <Image
                                            src={lechon.imageUrl}
                                            alt={lechon.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="p-6 flex flex-col items-center">
                                        <h2 className="text-2xl font-bold mb-2 text-center">{lechon.name}</h2>
                                        <p className="text-lg mb-2">{lechon.weight}</p>
                                        <p className="text-sm text-center mb-4 text-white/90">{lechon.description}</p>
                                        <p className="font-bold text-2xl mb-3">₱{lechon.price.toFixed(2)}</p>
                                        <p className="mb-4 text-white/90">Available: {lechon.quantity} pcs</p>
                                        <button 
                                            className="bg-[#2d3436] hover:bg-[#636e72] text-white px-6 py-2.5 rounded-lg font-semibold transition duration-300 w-full"
                                            onClick={() => {
                                                setSelectedProduct(lechon);
                                                setShowModal(true);
                                            }}>
                                            Order Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-lg text-gray-800">No products available in this category.</p>
                    )}
                    
                    {/* Navigation Arrows */}
                    <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                        {currentSectionIndex < lechonTypes.length - 1 && (
                            <button
                                className="bg-black/75 hover:bg-black text-white p-4 rounded-full shadow-lg transition duration-300"
                                onClick={handleNextSection}
                            >
                                <FaArrowRight className="text-xl" />
                            </button>
                        )}
                    </div>
                    {currentSectionIndex > 0 && (
                        <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                            <button
                                className="bg-black/75 hover:bg-black text-white p-4 rounded-full shadow-lg transition duration-300"
                                onClick={handlePreviousSection}
                            >
                                <FaArrowLeft className="text-xl" />
                            </button>
                        </div>
                    )}
                </div>
            </div>


                <footer className="bg-black text-white py-6">
                    <div className="container mx-auto flex justify-center space-x-8">
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg">
                            <FaTwitter className="text-2xl text-gray-600 group-hover:text-white" />
                            <span className="ml-2 text-gray-600 group-hover:text-white">Twitter</span>
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg">
                            <FaFacebook className="text-2xl text-gray-600 group-hover:text-white" />
                            <span className="ml-2 text-gray-600 group-hover:text-white">Facebook</span>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg">
                            <FaInstagram className="text-2xl text-gray-600 group-hover:text-white" />
                            <span className="ml-2 text-gray-600 group-hover:text-white">Instagram</span>
                        </a>
                    </div>
                </footer>
            </div>

            {/* Modal */}
            <LetchonModal
                isVisible={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedProduct(null);
                }}
                type={currentSection}
                selectedProduct={selectedProduct}
                handleOrder={handleOrder}
            />
        </Fragment>
    );
};

export default Letchon;
