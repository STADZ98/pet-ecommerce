import React, { useEffect, useState } from "react";
import { listProductBy } from "../../api/product";
import ProductCard from "../card/ProductCard";
import SwiperShowProduct from "../../utils/SwiperShowProduct";
import { SwiperSlide } from "swiper/react";

const BestSeller = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await listProductBy("sold", "desc", 10);
      setData(res.data || []);
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการโหลดสินค้าขายดี", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="my-12" aria-labelledby="bestseller-heading">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            id="bestseller-heading"
            className="text-3xl font-extrabold text-gray-800"
          >
            🌟 สินค้าขายดีประจำสัปดาห์
          </h2>
          <p className="text-gray-500 mt-1">
            รวมสินค้ายอดนิยมที่ลูกค้าสั่งซื้อมากที่สุด
          </p>
        </div>
        <button
          className="text-orange-600 hover:text-yellow-800 font-semibold text-sm"
          onClick={() => (window.location.href = "/shop")}
        >
          ดูทั้งหมดสินค้าแนะนำ &rarr;
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
      ) : data.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          ไม่พบสินค้าขายดีในขณะนี้
        </div>
      ) : (
        <div>
          <SwiperShowProduct
            slidesPerView={4}
            gap={18}
            showNavigation
            showPagination={false}
          >
            {data.slice(0, 12).map((item, idx) => (
              <SwiperSlide key={item._id || idx}>
                <div className="relative group">
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      อันดับ #{idx + 1}
                    </span>
                  </div>
                  <ProductCard item={item} />
                </div>
              </SwiperSlide>
            ))}
          </SwiperShowProduct>
        </div>
      )}
    </section>
  );
};

export default BestSeller;
