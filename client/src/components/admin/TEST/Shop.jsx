import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../components/card/ProductCard";
import useEcomStore from "../store/ecom-store";
import CartCard from "../components/card/CartCard";
import SearchCard from "../components/card/สำรอง/SearchCard";

const Shop = () => {
  const getProduct = useEcomStore((state) => state.getProduct);
  const products = useEcomStore((state) => state.products);
  const carts = useEcomStore((state) => state.carts);

  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // ฟังก์ชันช่วยแปลง query string
  const getQueryParams = (search) => {
    return new URLSearchParams(search);
  };

  useEffect(() => {
    getProduct();
  }, [getProduct]);

  useEffect(() => {
    // อ่าน category จาก query string
    const params = getQueryParams(location.search);
    const categoryName = params.get("category");

    if (categoryName) {
      // กรองสินค้าตาม category
      const filtered = products.filter(
        (p) => p.category && p.category.name === categoryName
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [location.search, products]);

  // เปิด popup ถ้า location.state มีคำสั่ง
  useEffect(() => {
    if (location.state?.openCartPopup) {
      setIsCartOpen(true);
      // ล้าง state ทิ้งเพื่อไม่ให้ popup เปิดซ้ำตอน back navigation
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleAddToCart = () => {
    setIsCartOpen(true);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row bg-white-to-br from-blue-50 via-yellow-50 to-emerald-50">
        {/* Sidebar Search */}
        <aside className="w-full md:w-72 p-6 bg-white/90 border-b md:border-b-0 md:border-r border-blue-100 min-h-[250px] md:min-h-screen flex flex-col items-center sticky top-0">
          <div className="w-full max-w-xs">
            <SearchCard />
          </div>
        </aside>

        {/* Product List */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
          <h2 className="text-3xl font-extrabold text-blue-800 mb-8 text-center drop-shadow">
            {location.search.includes("category=")
              ? `หมวดหมู่: ${new URLSearchParams(location.search).get(
                  "category"
                )}`
              : "สินค้าทั้งหมด"}
          </h2>
          <div
            className="
              grid 
              grid-cols-1 
              sm:grid-cols-2 
              md:grid-cols-3 
              lg:grid-cols-4 
              gap-6
              max-w-screen-xl
              mx-auto
            "
          >
            {(filteredProducts.length > 0 ? filteredProducts : products).map(
              (item, index) => (
                <ProductCard
                  key={item.id || index}
                  item={item}
                  onAddToCart={() => {
                    handleAddToCart();
                  }}
                />
              )
            )}
          </div>
        </main>
      </div>

      {/* ตะกร้าสินค้าแบบ overlay */}
      {isCartOpen && carts.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-end z-50"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white h-full p-6 shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="mb-4 text-gray-600 hover:text-gray-900"
              onClick={() => setIsCartOpen(false)}
              aria-label="ปิดตะกร้าสินค้า"
            >
              ✕ ปิด
            </button>
            <CartCard />
          </div>
        </div>
      )}
    </>
  );
};

export default Shop;
