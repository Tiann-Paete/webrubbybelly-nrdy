import React, { Fragment, useState, useEffect } from "react";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { useCart } from '@/context/CartContext';
import Modal from "../components/cartModal"; 
import { useRouter } from 'next/router';
import axios from 'axios';

const Viands = () => {
  const [selectedViand, setSelectedViand] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viandsData, setViandsData] = useState([]);
  const { addToCart, cartItems } = useCart();
  const router = useRouter();

  // Calculate number of unique items in cart instead of total quantity
  const cartItemCount = cartItems.length;  // Changed to match Lechon logic

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/check-auth');
        if (!response.data.isAuthenticated) {
          router.push('/login?redirect=/viands');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login?redirect=/viands');
      }
    };

    const fetchViands = async () => {
      try {
        const response = await axios.get('/api/viands-products');
        setViandsData(response.data);
      } catch (error) {
        console.error('Error fetching viands:', error);
      }
    };

    checkAuth();
    fetchViands();
  }, [router]);

  const handleViandClick = (viand) => {
    // Check if the viand is available (has quantity > 0)
    if (viand.quantity <= 0) {
      alert('This item is currently out of stock');
      return;
    }
    setSelectedViand(viand);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedViand(null);
  };

  return (
    <Fragment>
      <div>
        <Head>
          <title>Viands Page</title>
        </Head>
        <div className="w-full max-w-full mx-auto flex items-center justify-between border-b-2 px-2 py-7 h-16 bg-black shadow-md">
          <div className="flex items-center space-x-10">
            <Image src="/Vector.png" alt="Letchon Logo" width={40} height={35} className="object-contain" />
          </div>
          <div className="flex-grow flex justify-center">
            <div className="flex space-x-10">
              <Link href="/letchon"><button className="text-white font-bold hover:text-orange-500 transition bg-transparent border-none cursor-pointer">Lechon</button></Link>
              <Link href="/viands"><button className="text-white font-bold hover:text-orange-500 transition bg-transparent border-none cursor-pointer">Viands</button></Link>
              <Link href="/aboutus"><button className="text-white font-bold hover:text-orange-500 transition bg-transparent border-none cursor-pointer">About Us</button></Link>
            </div>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/profile">
              <button className="flex items-center justify-center p-2 bg-transparent hover:bg-gray-800 rounded">
                <Image src="/profile.png" alt="Profile" width={24} height={24} />
              </button>
            </Link>
            <Link href="/cart">
              <div className="relative">
                <button className="flex items-center justify-center p-2 bg-transparent hover:bg-gray-800 rounded">
                  <Image src="/cart.png" alt="Cart" width={24} height={24} />
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

        <div className="flex flex-col items-center justify-center py-10" style={{ backgroundColor: '#F8C794' }}>
          <main className="flex flex-col justify-center items-center w-full flex-1 px-4 text-center">
            <h1 className="text-5xl font-bold mb-6 text-orange-700 drop-shadow-lg">Viands</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {viandsData.map((viand) => (
                <div
                  key={viand.id}
                  className="bg-white shadow-lg rounded-lg p-4 cursor-pointer hover:shadow-2xl hover:scale-105 transform transition-all duration-300 ease-in-out"
                  onClick={() => handleViandClick(viand)}
                >
                  <Image 
                    src={viand.imageSrc} 
                    alt={viand.name} 
                    width={300} 
                    height={200} 
                    className="object-cover rounded-lg h-64 w-full mb-2" 
                    style={{ objectFit: "cover" }} 
                  />
                  <h3 className="text-lg font-semibold mt-2 text-gray-800">{viand.name}</h3>
                  <p className="text-lg font-bold text-gray-800">₱{viand.price}</p>
                  
                  <button
                    className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViandClick(viand);
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </main>
        </div>

        <Modal 
          showModal={showModal} 
          selectedViand={selectedViand} 
          closeModal={closeModal} 
          addToCart={addToCart} 
        />

        <footer className="bg-black text-white py-6">
          <div className="container mx-auto flex justify-center space-x-8">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg"
            >
              <FaTwitter className="text-2xl text-gray-600 group-hover:text-white" />
              <span className="ml-2 text-gray-600 group-hover:text-white">Twitter</span>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg"
            >
              <FaFacebook className="text-2xl text-gray-600 group-hover:text-white" />
              <span className="ml-2 text-gray-600 group-hover:text-white">Facebook</span>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg"
            >
              <FaInstagram className="text-2xl text-gray-600 group-hover:text-white" />
              <span className="ml-2 text-gray-600 group-hover:text-white">Instagram</span>
            </a>
          </div>
        </footer>
      </div>
    </Fragment>
  );
};

export default Viands;