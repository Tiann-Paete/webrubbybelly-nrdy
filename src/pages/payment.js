import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/router";
import axios from "axios";
import GcashModal from "../components/gcashmodal";

export default function Billing() {
  const { cartItems, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("Gcash");
  const [customerAddress, setCustomerAddress] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  const [isGcashModalOpen, setIsGcashModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const deliveryFee = 50;
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity || 0),
    0
  );
  const total = subtotal + deliveryFee;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/check-auth");
        if (!response.data.isAuthenticated) {
          router.push("/login?redirect=/payment");
        } else {
          setCustomerAddress(response.data.customerAddress);
          setInputAddress(response.data.customerAddress);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.push("/login?redirect=/payment");
      }
    };

    checkAuth();
  }, [router]);

  const validateOrder = () => {
    if (!inputAddress.trim() && !customerAddress.trim()) {
      setError("Please provide a delivery address");
      return false;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateOrder()) return;
    
    if (paymentMethod === "Gcash") {
      setIsGcashModalOpen(true);
      return;
    }

    await processPayment();
  };

  const processPayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError("");

    try {
      const authResponse = await axios.get("/api/check-auth");
      if (!authResponse.data.customerid) {
        throw new Error("Please log in again");
      }

      // Prepare order items with correct structure
      const orderItems = cartItems.map(item => ({
        priceid: item.productType === 'lechon' ? item.productlechon_id : item.productviands_id,
        quantity: item.quantity,
        price: item.price,
        productType: item.productType
      }));

      const orderData = {
        customerid: authResponse.data.customerid,
        items: orderItems,
        total_amount: total,
        payment_method: paymentMethod,
        delivery_address: inputAddress || customerAddress,
        delivery_fee: deliveryFee
      };

      const response = await axios.put("/api/orders", orderData);

      if (response.data.orderids) {
        clearCart();
        router.push({
          pathname: "/order-record",
          query: {
            orderids: response.data.orderids.join(","),
            tracking_number: response.data.tracking_number,
            customerAddress: inputAddress || customerAddress,
            subtotal: subtotal.toFixed(2),
            deliveryFee: deliveryFee.toFixed(2),
            total: total.toFixed(2),
            paymentMethod
          }
        });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setError(error.response?.data?.error || "Error processing your order. Please try again.");
    } finally {
      setIsProcessing(false);
      setIsGcashModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
          Checkout
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Customer Information */}
          <div className="border p-6 rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Delivery Information
            </h2>
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address
                </label>
                <input
                  id="address"
                  type="text"
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
                  required
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border p-6 rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Order Summary
            </h2>
            <ul className="space-y-2">
              {cartItems.map((item) => (
                <li key={`${item.priceid}-${item.productType}`} className="flex justify-between text-gray-600">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee:</span>
                <span>₱{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total:</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mt-6 border-t border-gray-300 pt-4">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Payment Method
          </h2>
          <div className="flex flex-col md:flex-row md:space-x-6">
            <label className="flex items-center mb-4">
              <input
                type="radio"
                id="cod"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                className="mr-2"
                disabled={isProcessing}
              />
              <span className="text-gray-600">Cash on Delivery</span>
            </label>
            <label className="flex items-center mb-4">
              <input
                type="radio"
                id="gcash"
                name="paymentMethod"
                value="Gcash"
                checked={paymentMethod === "Gcash"}
                onChange={() => setPaymentMethod("Gcash")}
                className="mr-2"
                disabled={isProcessing}
              />
              <span className="text-gray-600">Gcash</span>
            </label>
          </div>
        </div>

        {/* Confirm Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full ${
            isProcessing ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
          } text-white py-3 rounded-md shadow-md transition duration-200 text-lg font-semibold mt-6`}
        >
          {isProcessing ? 'Processing...' : 'Confirm Payment'}
        </button>
      </div>

      {/* GcashModal */}
      <GcashModal
        isOpen={isGcashModalOpen}
        onClose={() => !isProcessing && setIsGcashModalOpen(false)}
        onConfirm={processPayment}
      />
    </div>
  );
}