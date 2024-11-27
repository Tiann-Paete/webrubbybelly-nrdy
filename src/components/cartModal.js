import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import CustomAlert from './CustomAlert';

const Modal = ({ showModal, selectedViand, closeModal, addToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [tossAnimation, setTossAnimation] = useState({ isAnimating: false, itemId: null });
  const [showAlert, setShowAlert] = useState(false);

  // Reset quantity to 1 whenever modal opens with a new viand or closes
  useEffect(() => {
    if (showModal) {
      setQuantity(1); // Reset quantity when modal is opened
      setShowAlert(false); // Ensure alert is hidden when modal is opened
    }
  }, [showModal]);

  if (!showModal || !selectedViand) return null;

  const handleAddToCart = async () => {
    if (quantity === 0) {
      alert('Please select a quantity first');
      return;
    }

    const cartItem = {
      ...selectedViand,
      quantity,
      productType: 'viands',
      imageSrc: selectedViand.imageSrc,
      priceid: selectedViand.id,
      name: selectedViand.name
    };

    const success = await addToCart(cartItem);

    if (success) {
      setTossAnimation({ isAnimating: true, itemId: selectedViand.id });
      setShowAlert(true);  // Only show the alert when the item is added successfully

      setTimeout(() => {
        setTossAnimation({ isAnimating: false, itemId: null });
        closeModal();
        setTimeout(() => setShowAlert(false), 3000);  // Hide alert after 3 seconds
      }, 800);
    }
  };

  const increaseQuantity = () => {
    if (quantity < selectedViand.quantity) {
      setQuantity((prev) => prev + 1);
    } else {
      alert(`Cannot add more than ${selectedViand.quantity} items from available stock`);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    setQuantity(1);
    closeModal();
  };

  return (
    <>
      {showAlert && (
        <CustomAlert
          isVisible={showAlert}
          message={`Added ${quantity} ${selectedViand?.name} to cart!`}
          onClose={() => setShowAlert(false)}
        />
      )}

      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative flex flex-col">
          <button
            className="absolute top-4 right-4 text-gray-600 text-3xl font-bold hover:text-red-500 transition duration-200"
            onClick={handleClose}
          >
            &times;
          </button>

          <div className="flex flex-col items-center">
            <Image
              src={selectedViand.imageSrc}
              alt={selectedViand.name}
              width={300}
              height={200}
              className={`object-cover rounded-lg mb-4 shadow-md border-4 border-orange-300 ${
                tossAnimation.isAnimating && tossAnimation.itemId === selectedViand.id
                  ? 'animate-toss'
                  : ''
              }`}
            />
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">{selectedViand.name}</h2>
            <p className="text-md text-gray-600 text-center mb-1">{selectedViand.description}</p>
            <p className="text-md text-gray-600 text-center mb-4">
              <strong>Serves:</strong> <span className="text-orange-500">{selectedViand.servings}</span>
            </p>
            <p className={`text-sm ${selectedViand.quantity <= 5 ? 'text-red-500' : 'text-gray-500'} mb-4`}>
              {selectedViand.quantity <= 5
                ? `Only ${selectedViand.quantity} left in stock!`
                : `Available: ${selectedViand.quantity}`}
            </p>
            <div className="flex justify-between items-center w-full">
              <p className="text-lg font-bold text-gray-800">₱{selectedViand.price}</p>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={decreaseQuantity}
                  className="px-3 py-1 text-gray-600 transition duration-150 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 text-gray-800">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className={`px-3 py-1 text-gray-600 transition duration-150 ${
                    quantity >= selectedViand.quantity ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'
                  }`}
                  disabled={quantity >= selectedViand.quantity}
                >
                  +
                </button>
              </div>
              <button
                className="ml-4 px-6 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition shadow-md"
                onClick={handleAddToCart}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
