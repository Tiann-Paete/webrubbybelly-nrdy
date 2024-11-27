import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import CustomAlert from './CustomAlert'; 

const LetchonModal = ({ isVisible, onClose, type, handleOrder, selectedProduct }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
    
  if (!isVisible || !selectedProduct) return null;

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, Math.min(quantity + change, selectedProduct.quantity));
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (quantity === 0) {
      alert('Please select a quantity');
      return;
    }

    const orderData = {
      productid: selectedProduct.productid,
      name: selectedProduct.name,
      price: selectedProduct.price,
      weight: selectedProduct.weight,
      quantity: quantity,
      imageUrl: selectedProduct.imageUrl
    };

    const success = await handleOrder(orderData);
    if (success) {
      setIsAdded(true);
      
      // Reset button state after animation
      setTimeout(() => {
        setIsAdded(false);
        setQuantity(1);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#ff6b35] p-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white">Order Details</h3>
          <button 
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            onClick={onClose} // Close the modal when X button is clicked
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Product Image and Details */}
          <div className="mb-6 flex gap-4">
            <div className="w-1/2 relative h-48 rounded-lg overflow-hidden">
              <Image
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="w-1/2 space-y-3">
              <h4 className="text-xl font-bold text-gray-800">{selectedProduct.name}</h4>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-semibold">Weight:</span>{' '}
                  <span className="text-gray-800">{selectedProduct.weight}</span>
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Price:</span>{' '}
                  <span className="text-gray-800">₱{selectedProduct.price.toFixed(2)}</span>
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Available:</span>{' '}
                  <span className="text-gray-800">{selectedProduct.quantity} pcs</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-700 font-medium">Select Quantity:</p>
              <p className="text-sm text-gray-500">
                Total: ₱{(selectedProduct.price * quantity).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  className="bg-[#2d3436] hover:bg-[#636e72] text-white h-10 w-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <span className="text-xl">-</span>
                </button>
                <span className="text-2xl font-medium w-12 text-center">
                  {quantity}
                </span>
                <button
                  className="bg-[#2d3436] hover:bg-[#636e72] text-white h-10 w-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= selectedProduct.quantity}
                >
                  <span className="text-xl">+</span>
                </button>
              </div>
            </div>
          </div>

          {/* Add to Cart Button with Animation */}
          <button
  className={`w-full py-3 rounded-xl font-semibold mt-6 transition-colors relative overflow-hidden
    ${isAdded ? 'bg-green-500 text-white' : 'bg-[#2d3436] hover:bg-[#636e72] text-white'}
    ${isAdded ? 'animate-bounce' : ''}`} // Add bounce effect when added
  onClick={handleAddToCart}
  disabled={isAdded}
>
  <AnimatePresence mode="wait">
    {!isAdded ? (
      <motion.span
        key="addToCart"
        initial={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="block"
      >
        Add to Cart
      </motion.span>
    ) : (
      <motion.span
        key="added"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: [1, 1.2, 1], // Bounce back effect
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 0.5,
          scale: { duration: 0.8 },
          rotate: { duration: 0.8 },
        }}
        className="block"
      >
        Added!
      </motion.span>
    )}
  </AnimatePresence>
</button>
        </div>
      </motion.div>
    </div>
  );
};

export default LetchonModal;
