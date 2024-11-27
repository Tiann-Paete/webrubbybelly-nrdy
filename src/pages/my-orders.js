import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import Image from 'next/image';
import axios from 'axios';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      try {
        // Check authentication
        const authResponse = await axios.get('/api/check-auth');
        if (!authResponse.data.isAuthenticated) {
          router.push('/login?redirect=/my-orders');
          return;
        }

        // Fetch orders
        const response = await axios.get('/api/orders');
        const processedOrders = response.data.map(order => ({
          ...order,
          total_amount: parseFloat(order.total_amount) || 0
        }));
        setOrders(processedOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchOrders();
  }, [router]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const getStatusColor = (status) => {
    const colors = {
      order_placed: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      out_for_delivery: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDisplay = (status) => {
    const display = {
      order_placed: 'Order Placed',
      processing: 'Processing',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return display[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8C794]">
        <div className="text-2xl font-semibold">Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8C794]">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8C794] py-10 px-4">
      <Head>
        <title>My Orders | Lechon Shop</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => router.push('/letchon')}
              className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition duration-200"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.orderid}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">
                        Order #{order.orderid}
                      </h2>
                      <p className="text-gray-600">{formatDate(order.date)}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusDisplay(order.status)}
                    </span>
                  </div>

                  {/* Preview of items */}
                  <div className="mb-4">
                    <p className="text-gray-600 mb-2">
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 min-w-fit">
                          {item.imageUrl && (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="rounded-md"
                            />
                          )}
                          <span className="text-sm">{item.name} x{item.quantity}</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="flex items-center px-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">+{order.items.length - 3} more</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t pt-4">
                    <div className="text-lg">
                      <span className="font-semibold">Total:</span>{' '}
                      <span className="text-red-600 font-bold">₱{formatCurrency(order.total_amount)}</span>
                    </div>
                    <button
                      onClick={() => router.push(`/order-record?orderId=${order.orderid}`)}
                      className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition duration-200"
                    >
                      View Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;