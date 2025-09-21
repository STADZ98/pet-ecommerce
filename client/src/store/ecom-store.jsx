import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { listCategory } from "../api/category";
import { listProductBy, searchFilters } from "../api/product";
import { listBrand } from "../api/brand";

const API = import.meta.env.VITE_API || "http://localhost:5005/api";

// 🎯 initial state
const initialState = {
  user: null,
  token: null,
  profile: null,
  loadingProfile: false,
  profileRequestInFlight: false,

  categories: [],
  subcategories: [],
  subsubcategories: [],
  brands: [],
  products: [],

  carts: [],
  orders: [],
  isCartSidebarOpen: false,

  filters: {
    query: "",
    category: [],
    subcategory: [],
    subsubcategory: [],
    price: [0, 172000],
    brand: null,
  },
};

// 🎯 Store
const ecomStore = (set, get) => ({
  ...initialState,

  // -------------------- AUTH --------------------
  actionLogin: async (form) => {
    try {
      const res = await axios.post(`${API}/login`, form);
      const payload = res.data.payload;
      const token = res.data.token;
      const profile = res.data.profile || payload; // ใช้ profile จาก backend

      set({ user: payload, token, profile });
      return res;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  },

  logout: () => set(initialState),

  fetchProfile: async () => {
    if (get().profileRequestInFlight || !get().token) return;
    set({ loadingProfile: true, profileRequestInFlight: true });

    try {
      const res = await axios.get(`${API}/admin/profile`, {
        headers: { Authorization: `Bearer ${get().token}` },
      });
      set({
        profile: res.data,
        loadingProfile: false,
        profileRequestInFlight: false,
      });
    } catch (err) {
      set({ loadingProfile: false, profileRequestInFlight: false });
      console.error("Error fetching profile:", err);
    }
  },

  // -------------------- ORDER --------------------
  fetchOrders: async () => {
    try {
      const token = get().token;
      if (!token) return set({ orders: [] });

      const res = await axios.get(`${API}/user/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ orders: res.data });
    } catch (err) {
      console.error("Error fetching orders:", err);
      set({ orders: [] });
    }
  },

  // -------------------- PRODUCT & FILTER --------------------
  // Flexible getProduct: callers sometimes call getProduct(), getProduct(token),
  // or getProduct(token, limit). Normalize arguments and call listProductBy(sort/order/limit).
  getProduct: async (...args) => {
    try {
      // Default params
      let token = null;
      let sort = "createdAt";
      let order = "desc";
      let limit = 50;

      // Handle common call patterns:
      // getProduct() => no args
      // getProduct(token) => token provided
      // getProduct(token, limit) => token and limit
      // getProduct(sort, order, limit) => legacy usage in some places
      if (args.length === 1) {
        // single arg could be token (string) or limit (number)
        if (typeof args[0] === "string") token = args[0];
        else if (typeof args[0] === "number") limit = args[0];
      } else if (args.length === 2) {
        // (token, limit) or (sort, order)
        if (typeof args[0] === "string" && typeof args[1] === "number") {
          token = args[0];
          limit = args[1];
        } else if (typeof args[0] === "string" && typeof args[1] === "string") {
          sort = args[0];
          order = args[1];
        }
      } else if (args.length >= 3) {
        // (sort, order, limit)
        sort = args[0] ?? sort;
        order = args[1] ?? order;
        limit = args[2] ?? limit;
      }

      const res = await listProductBy(token, sort, order, limit);
      set({ products: res.data });
    } catch (err) {
      console.error("Error fetching products:", err);
      set({ products: [] });
    }
  },

  actionSearchFilters: async (args) => {
    try {
      const filters = {
        ...get().filters,
        ...args,
        subsubcategory: args?.subsubcategory ?? [],
      };
      set({ filters });
      const res = await searchFilters(filters);
      set({ products: res.data });
    } catch (err) {
      console.error("Error applying filters:", err);
    }
  },

  // -------------------- CATEGORY / BRAND --------------------
  getCategory: async () => {
    try {
      const res = await listCategory();
      set({ categories: res.data });
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  },

  getBrands: async () => {
    try {
      const res = await listBrand();
      set({ brands: res.data });
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  },

  getSubcategories: async () => {
    try {
      const res = await axios.get(`${API}/subcategory`);
      set({ subcategories: res.data });
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      set({ subcategories: [] });
    }
  },

  getSubsubcategories: async () => {
    try {
      const res = await axios.get(`${API}/subsubcategory`);
      set({ subsubcategories: res.data });
    } catch (err) {
      console.error("Error fetching subsubcategories:", err);
      set({ subsubcategories: [] });
    }
  },

  // -------------------- CART --------------------
  actionAddtoCart: (product, quantity = 1) => {
    const carts = get().carts || [];
    const variantId = product.variantId ?? null;

    let itemPrice = product.price;
    let images = [];
    let variantTitle = product.variantTitle ?? null;

    if (variantId && Array.isArray(product.variants)) {
      const found = product.variants.find(
        (v) => String(v.id) === String(variantId)
      );
      if (found) {
        itemPrice = found.price ?? itemPrice;
        images =
          found.images?.length > 0
            ? found.images
                .map((img) => (typeof img === "string" ? img : img.url))
                .filter(Boolean)
            : (product.images || [])
                .map((img) => (typeof img === "string" ? img : img.url))
                .filter(Boolean);
        variantTitle = found.title || variantTitle;
      }
    } else {
      images = (product.images || [])
        .map((img) => (typeof img === "string" ? img : img.url))
        .filter(Boolean);
    }

    const exist = carts.find(
      (item) => item.id === product.id && (item.variantId ?? null) === variantId
    );

    if (exist) {
      set({
        carts: carts.map((item) =>
          item.id === product.id && (item.variantId ?? null) === variantId
            ? { ...item, count: (item.count || 0) + quantity }
            : item
        ),
      });
    } else {
      const cartItem = {
        id: product.id,
        title: variantTitle
          ? `${product.title} - ${variantTitle}`
          : product.title,
        price: itemPrice,
        count: quantity,
        variantId,
        variantTitle: variantTitle ?? null,
        images,
        product,
      };
      set({ carts: [...carts, cartItem] });
    }
  },

  setCartSidebarOpen: (val) => set({ isCartSidebarOpen: !!val }),
  actionOpenCartSidebar: () => set({ isCartSidebarOpen: true }),
  actionCloseCartSidebar: () => set({ isCartSidebarOpen: false }),

  actionUpdateQuantity: (productId, newQuantity, variantId = null) => {
    set((state) => ({
      carts: state.carts.map((item) => {
        const itemVariant = item.variantId ?? null;
        if (
          item.id === productId &&
          (variantId === null || itemVariant === variantId)
        ) {
          return { ...item, count: Math.max(1, newQuantity) };
        }
        return item;
      }),
    }));
  },

  actionRemoveProduct: (productId, variantId = null) => {
    set((state) => ({
      carts: state.carts.filter((item) => {
        const itemVariant = item.variantId ?? null;
        if (item.id !== productId) return true;
        if (variantId === null) return false;
        return itemVariant !== variantId;
      }),
    }));
  },

  clearCart: () => set({ carts: [] }),

  getTotalPrice: () =>
    get().carts.reduce(
      (total, item) => total + (item.price || 0) * (item.count || 0),
      0
    ),
});

// -------------------- Persist --------------------
const usePersist = {
  name: "PetShopOnline",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    user: state.user,
    token: state.token,
    profile: state.profile,
    carts: (state.carts || []).map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      count: item.count,
      variantId: item.variantId,
      variantTitle: item.variantTitle,
      images: item.images,
    })),
    filters: state.filters,
  }),
};

const useEcomStore = create(persist(ecomStore, usePersist));
export default useEcomStore;
