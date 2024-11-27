import React from 'react';
import Image from 'next/image';

const GcashModal = ({ isOpen, onClose, onConfirm }) => {
  const [fullName, setFullName] = React.useState('');
  const [gcashNumber, setGcashNumber] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm();
    onClose();
  };

  return (
    // Modal Background (only visible when isOpen is true)
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${isOpen ? 'block' : 'hidden'}`}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="bg-white rounded-lg p-8 w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing when clicking inside modal
      >
        <div className="flex justify-center mb-6">
          {/* Enlarged GCash Logo */}
          <Image
            src="/imagelogo/Gcash2.png"
            alt="GCash Logo"
            width={150}  // Increased size
            height={100} // Increased size
          />
        </div>

        

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GCash Number
            </label>
            <input
              type="text"
              value={gcashNumber}
              onChange={(e) => setGcashNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your GCash number"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Confirm Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default GcashModal;
