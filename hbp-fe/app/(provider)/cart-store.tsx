import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "../interfaces";

interface CartStore {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
}

const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cartItems: [] as CartItem[],
      addToCart: (item: CartItem) =>
        set((state) => ({
          cartItems: [...state.cartItems, item],
        })),
      removeFromCart: (itemId: string) =>
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => item.roomCategoryUuid !== itemId,
          ),
        })),
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: "hbp-cart",
    },
  ),
);

export default useCartStore;
