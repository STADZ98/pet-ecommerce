// src/components/product/ProductTabs.jsx
import React, { useState, useEffect } from "react";
import { SwiperSlide } from "swiper/react";
import SwiperShowProduct from "../../utils/SwiperShowProduct";
import ProductCard from "../card/ProductCard";

const ProductTabs = ({
  bestSeller,
  loadingBestSeller,
  newProduct,
  loadingNewProduct,
}) => {
  const [activeTab, setActiveTab] = useState("best");
  const [prefetched, setPrefetched] = useState(false);

  useEffect(() => {
    if (!prefetched && activeTab === "best" && !loadingNewProduct)
      setPrefetched(true);
  }, [activeTab, loadingNewProduct, prefetched]);

  const renderSkeleton = (count = 5) => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-10">
      {[...Array(count)].map((_, idx) => (
        <div key={idx} className="animate-pulse bg-gray-200 h-48 rounded-lg" />
      ))}
    </div>
  );

  const renderProducts = (items) => (
    <SwiperShowProduct>
      {items.slice(0, 10).map((item, idx) => (
        <SwiperSlide key={item._id || idx}>
          <ProductCard item={item} />
        </SwiperSlide>
      ))}
    </SwiperShowProduct>
  );

  // เรียงสินค้าขายดี (ขายมาก -> ขายน้อย)
  const sortedBestSeller = bestSeller
    ? [...bestSeller].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
    : [];

  // เรียงสินค้าใหม่ (ล่าสุด -> เก่า)
  const sortedNewProduct = newProduct
    ? [...newProduct].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    : [];

  return (
    <section className="mt-16 mb-20">
      <div className="flex gap-6 mb-6 items-end border-b border-gray-200 pb-4">
        <div className="flex items-baseline gap-4">
          <button
            aria-pressed={activeTab === "best"}
            className={`text-2xl font-extrabold pb-2 transition-colors ${
              activeTab === "best"
                ? "text-orange-700 border-b-4 border-yellow-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("best")}
          >
            สินค้าขายดี
          </button>
          <span className="text-sm text-gray-400">/</span>
          <button
            aria-pressed={activeTab === "new"}
            className={`text-2xl font-extrabold pb-2 transition-colors ${
              activeTab === "new"
                ? "text-orange-700 border-b-4 border-yellow-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("new")}
          >
            สินค้าใหม่
          </button>
        </div>
        <div className="ml-auto text-sm text-gray-500">เลือกชมสินค้าแนะนำ</div>
      </div>

      <div>
        {activeTab === "best" &&
          (loadingBestSeller ? (
            renderSkeleton()
          ) : sortedBestSeller.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-lg">
              ไม่พบสินค้าขายดีในขณะนี้
            </div>
          ) : (
            renderProducts(sortedBestSeller)
          ))}

        {activeTab === "new" &&
          (loadingNewProduct ? (
            renderSkeleton()
          ) : sortedNewProduct.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-lg">
              ไม่พบสินค้าใหม่ในขณะนี้
            </div>
          ) : (
            renderProducts(sortedNewProduct)
          ))}
      </div>
    </section>
  );
};

export default ProductTabs;
