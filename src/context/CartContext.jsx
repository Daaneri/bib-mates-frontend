import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { siteConfig } from '../config/site';

const CartContext = createContext();
const CART_STORAGE_KEY = `${siteConfig.businessName.toLowerCase().replace(/\s+/g, '_')}_cart`;

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const restoreItem = (item) => {
    setCart((prevCart) => {
      const yaEsta = prevCart.some((p) => p.id === item.id);
      if (yaEsta) return prevCart;
      return [...prevCart, item];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const eliminado = prevCart.find((item) => item.id === productId);
      const next = prevCart.filter((item) => item.id !== productId);
      if (eliminado) {
        toast(`${eliminado.name} eliminado del carrito`, {
          action: {
            label: 'Deshacer',
            onClick: () => restoreItem(eliminado),
          },
        });
      }
      return next;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // El "-" nunca borra el producto: se frena en cantidad 1.
  // Para eliminar del todo hay que usar el ícono de basura (que sí ofrece "Deshacer").
  const updateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);