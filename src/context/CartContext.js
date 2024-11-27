import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [availableQuantities, setAvailableQuantities] = useState({});

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    calculateTotal();
    updateAvailableQuantities();
  }, [cartItems]);

  const calculateTotal = () => {
    const newTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  };

  // Generate a unique key for each product
  const generateProductKey = (product) => {
    return `${product.productType}-${product.priceid}-${product.weight || ''}`;
  };

  const updateAvailableQuantities = async () => {
    try {
      const lechonProducts = cartItems.filter(item => item.productType === 'lechon');
      const viandsProducts = cartItems.filter(item => item.productType === 'viands');

      const quantities = {};

      // Fetch lechon quantities
      if (lechonProducts.length > 0) {
        const lechonResponse = await axios.get('/api/lechon-products');
        const lechonData = lechonResponse.data;
        lechonProducts.forEach(product => {
          const dbProduct = lechonData.find(p => p.productlechon_id === product.priceid);
          if (dbProduct) {
            quantities[generateProductKey(product)] = dbProduct.quantity;
          }
        });
      }

      // Fetch viands quantities
      if (viandsProducts.length > 0) {
        const viandsResponse = await axios.get('/api/viands-products');
        const viandsData = viandsResponse.data;
        viandsProducts.forEach(product => {
          const dbProduct = viandsData.find(p => p.productviands_id === product.priceid);
          if (dbProduct) {
            quantities[generateProductKey(product)] = dbProduct.quantity;
          }
        });
      }

      setAvailableQuantities(quantities);
    } catch (error) {
      console.error('Error fetching available quantities:', error);
    }
  };

  const addToCart = (product) => {
    return new Promise((resolve) => {
      setCartItems(prevItems => {
        const productKey = generateProductKey(product);
        const existingItem = prevItems.find(item => generateProductKey(item) === productKey);
        
        if (existingItem) {
          resolve(true);
          return prevItems.map(item =>
            generateProductKey(item) === productKey
              ? { 
                  ...item, 
                  quantity: existingItem.quantity + (product.quantity || 1)
                }
              : item
          );
        }

        resolve(true);
        return [...prevItems, {
          ...product,
          quantity: product.quantity || 1,
          productType: product.productType || (product.weight ? 'lechon' : 'viands'),
          imageUrl: product.imageSrc || product.imageUrl
        }];
      });
    });
  };

  const updateQuantity = async (product, newQuantity) => {
    if (newQuantity < 1) return false;

    const productKey = generateProductKey(product);
    const item = cartItems.find(item => generateProductKey(item) === productKey);
    if (!item) return false;

    try {
      const endpoint = item.productType === 'lechon' 
        ? `/api/lechon-products/${product.priceid}`
        : `/api/viands-products/${product.priceid}`;
      
      const response = await axios.get(endpoint);
      const availableQty = response.data.quantity;

      if (newQuantity > availableQty) {
        return false;
      }

      setCartItems(prevItems =>
        prevItems.map(i =>
          generateProductKey(i) === productKey
            ? { ...i, quantity: newQuantity }
            : i
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error checking quantity:', error);
      return false;
    }
  };

  const removeFromCart = (product) => {
    const productKey = generateProductKey(product);
    setCartItems(prevItems => prevItems.filter(item => generateProductKey(item) !== productKey));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      total,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      availableQuantities,
      generateProductKey
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}