import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  title: string;
  price: string;
  image: string;
  quantity: number;
  size: string;
}

export interface FavItem {
  id: string;
  title: string;
  price: string;
  image: string;
}

interface StoreState {
  cart: CartItem[];
  favorites: FavItem[];
  favoriteStates: Record<string, boolean>;
  addToCart: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateSize: (id: string, size: string) => void;
  clearCart: () => void;
  toggleFavorite: (item: FavItem) => void;
  removeFavorite: (id: string) => void;
}

function genId() {
  return Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9);
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      favorites: [],
      favoriteStates: {},

      addToCart: (item) => {
        const cart = get().cart;
        const existing = cart.find(
          (p) => p.title === item.title && p.size === item.size
        );
        if (existing) {
          set({
            cart: cart.map((p) =>
              p.id === existing.id ? { ...p, quantity: p.quantity + 1 } : p
            ),
          });
        } else {
          set({ cart: [...cart, { ...item, id: genId(), quantity: 1 }] });
        }
      },

      removeFromCart: (id) =>
        set({ cart: get().cart.filter((p) => p.id !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ cart: get().cart.filter((p) => p.id !== id) });
        } else {
          set({
            cart: get().cart.map((p) =>
              p.id === id ? { ...p, quantity } : p
            ),
          });
        }
      },

      updateSize: (id, size) =>
        set({
          cart: get().cart.map((p) => (p.id === id ? { ...p, size } : p)),
        }),

      clearCart: () => set({ cart: [] }),

      toggleFavorite: (item) => {
        const favs = get().favorites;
        const states = get().favoriteStates;
        const exists = favs.find((f) => f.id === item.id);
        if (exists) {
          const newStates = { ...states };
          delete newStates[item.id];
          set({
            favorites: favs.filter((f) => f.id !== item.id),
            favoriteStates: newStates,
          });
        } else {
          set({
            favorites: [...favs, item],
            favoriteStates: { ...states, [item.id]: true },
          });
        }
      },

      removeFavorite: (id) => {
        const newStates = { ...get().favoriteStates };
        delete newStates[id];
        set({
          favorites: get().favorites.filter((f) => f.id !== id),
          favoriteStates: newStates,
        });
      },
    }),
    { name: "anubix-store" }
  )
);
