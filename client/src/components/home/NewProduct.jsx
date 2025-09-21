import React, { useEffect, useState } from "react";
import { listProductBy } from "../../api/product";
import ProductCard from "../card/ProductCard";
import SwiperShowProduct from "../../utils/SwiperShowProduct";
import { SwiperSlide } from "swiper/react";

const NewProduct = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await listProductBy("updatedAt", "desc", 10);
      setData(res.data || []);
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการโหลดสินค้าใหม่", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="my-10" aria-labelledby="new-products-heading">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            id="new-products-heading"
            className="text-2xl font-extrabold text-gray-800"
          >
            สินค้าใหม่
          </h2>
          <p className="text-gray-500">สินค้าอัปเดตล่าสุด เพิ่มทุกสัปดาห์</p>
        </div>
        <button
          className="text-orange-600 hover:text-yellow-800 font-semibold text-sm"
          onClick={() => (window.location.href = "/shop")}
        >
          ดูทั้งหมดสินค้าใหม่ &rarr;
        </button>
      </div>

      {loading ? (
        <div className="py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-64 rounded-lg"
              />
            ))}
          </div>
        </div>
      ) : (
        <SwiperShowProduct
          slidesPerView={4}
          gap={18}
          showNavigation
          showPagination={false}
        >
          {data.slice(0, 12).map((item) => (
            <SwiperSlide key={item._id || item.id}>
              <ProductCard item={item} />
            </SwiperSlide>
          ))}
        </SwiperShowProduct>
      )}
    </section>
  );
};

export default NewProduct;
