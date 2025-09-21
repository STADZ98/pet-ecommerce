import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import useEcomStore from "../../store/ecom-store";
import CartCard from "../card/CartCard";
import BestSeller from "../home/BestSeller";
import NewProduct from "../home/NewProduct";

const carouselImages = [
  {
    url: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80",
    title: "ช้อปสินค้าใหม่ล่าสุด",
    desc: "พบกับสินค้าสัตว์เลี้ยงคุณภาพดี ราคาพิเศษทุกวัน",
  },
  {
    url: "https://petchef.gr/cdn/shop/files/Hero_Horizontal_2025_2_1500x.webp?v=1737390779",
    title: "โปรโมชั่นสุดคุ้ม",
    desc: "ลดราคาสินค้าสำหรับสัตว์เลี้ยงสูงสุด 50%",
  },
  {
    url: "https://ga-petfoodpartners.co.uk/content/uploads/2021/11/Pet-Food-Trends-Main-Banner.png",
    title: "บริการส่งฟรี",
    desc: "ลูกค้าใหม่ ส่งฟรีทั่วประเทศ",
  },
];

const Index = () => {
  const [current, setCurrent] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const carts = useEcomStore((s) => s.carts);

  // Carousel auto slide
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen relative">
      {/* ปุ่มตะกร้าสินค้า (ลอยขวาล่าง) */}
      

      {/* Hero Section: Carousel */}
      <section className="relative w-full max-w-7xl mx-auto pt-8">
        <div className="rounded-2xl overflow-hidden shadow-2xl relative group">
          <img
            src={carouselImages[current].url}
            alt={carouselImages[current].title}
            className="w-full h-[340px] sm:h-[420px] object-cover transition-all duration-700 scale-100 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-8 sm:px-16">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow-lg mb-4 animate-fade-in-up">
              {carouselImages[current].title}
            </h1>
            <p className="text-lg sm:text-2xl text-white/90 mb-8 animate-fade-in-up delay-100">
              {carouselImages[current].desc}
            </p>
            <button className="w-max bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-8 py-3 rounded-full shadow-lg transition duration-300 animate-fade-in-up delay-200">
              ช้อปเลย
            </button>
          </div>
          {/* Carousel Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${
                  current === idx ? "bg-yellow-400 scale-125" : "bg-white/60"
                }`}
                onClick={() => setCurrent(idx)}
                aria-label={`slide-${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Promotion Card */}
        <section className="grid md:grid-cols-2 gap-8 mb-16 animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center items-center hover:shadow-2xl transition duration-300">
            <img
              src="https://www.jerhigh.com/data/uploads/2024/05/img_about_quality_mv.webp"
              alt="Special Promotion"
              className="rounded-xl shadow-lg w-full h-56 object-cover mb-6"
            />
            <h3 className="text-2xl font-extrabold text-gray-800 mb-2">
              โปรโมชั่นพิเศษ{" "}
              <span className="text-yellow-500">ประจำเดือน!</span>
            </h3>
            <p className="text-gray-600 mb-4 text-center">
              ช้อปสินค้าแบรนด์ชั้นนำสำหรับสัตว์เลี้ยงที่คุณรักในราคาพิเศษสุดๆ
              พร้อมรับของแถมมากมายเมื่อซื้อสินค้าครบตามเงื่อนไขที่กำหนด
            </p>
            <button className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition duration-300">
              ดูรายละเอียดเพิ่มเติม
            </button>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-100 rounded-2xl shadow-xl p-8 flex flex-col justify-center items-center hover:shadow-2xl transition duration-300">
            {/* <img
              // src=""
              alt="Deal of the Week"
              className="rounded-xl shadow-lg w-full h-56 object-cover mb-6"
            /> */}
            <h3 className="text-2xl font-extrabold text-gray-800 mb-2">
              ดีลสุดคุ้ม <span className="text-blue-500">ประจำสัปดาห์</span>
            </h3>
            <p className="text-gray-600 mb-4 text-center">
              ห้ามพลาดกับสินค้าราคาพิเศษที่คัดสรรมาเพื่อคุณ!
              เฉพาะสัปดาห์นี้เท่านั้น มีจำนวนจำกัด
            </p>
            <button className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition duration-300">
              สั่งซื้อตอนนี้เลย!
            </button>
          </div>
        </section>

        {/* Best Seller */}
        <section className="mb-16">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-10 text-center animate-fade-in-down">
            สินค้า<span className="text-red-500">ขายดี</span>ประจำร้าน
          </h2>
          <BestSeller />
        </section>

        {/* New Product */}
        <section className="mb-16">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-10 text-center animate-fade-in-down">
            สินค้า<span className="text-green-500">มาใหม่</span>ล่าสุด
          </h2>
          <NewProduct />
        </section>

        {/* Call to Action */}
        <div
          className="w-full h-80 sm:h-96 bg-cover bg-center rounded-2xl shadow-xl flex items-center justify-center relative overflow-hidden group animate-fade-in-up"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1509205477818-bcacd23f25d3?auto=format&fit=crop&q=80&w=1200)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 transition-opacity duration-300 group-hover:bg-black/50 rounded-2xl"></div>
          <div className="relative z-10 text-center p-6">
            <h2 className="text-white text-3xl sm:text-5xl font-extrabold leading-tight drop-shadow-md mb-4">
              พบกับสินค้าลดราคา
              <br />
              มากมายวันนี้!
            </h2>
            <button className="mt-6 bg-white text-gray-800 font-bold px-10 py-4 rounded-full shadow-2xl hover:bg-gray-100 transform hover:scale-105 transition duration-300 focus:outline-none focus:ring-4 focus:ring-white/50">
              ดูสินค้าลดราคา
            </button>
          </div>
        </div>
      </main>

      {/* ตะกร้าสินค้าแบบ overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-white h-full md:h-auto md:rounded-2xl p-6 shadow-2xl overflow-y-auto"
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
    </div>
  );
};

export default Index;
