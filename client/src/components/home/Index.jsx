import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SwiperSlide } from "swiper/react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Truck,
  Tag,
  ShieldCheck,
  Phone,
  Package,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import useEcomStore from "../../store/ecom-store";
import { listProductBy } from "../../api/product";
import ProductTabs from "./ProductTabs";
import SwiperShowProduct from "../../utils/SwiperShowProduct";
import CartCard from "../card/CartCard";

// -----------------------------------------------------------------------------
// Constants (dummy content that you can later source from CMS)
// -----------------------------------------------------------------------------

import Constants1 from "./images/Constants1.jpg";
import Constants3 from "./images/Constants3.jpg";
const CAROUSEL_IMAGES = [
  {
    url: Constants1,
    title: "ช้อปสินค้าใหม่ล่าสุด",
    desc: "พบกับสินค้าสัตว์เลี้ยงคุณภาพดี ราคาพิเศษทุกวัน",
  },
  {
    url: "https://petchef.gr/cdn/shop/files/Hero_Horizontal_2025_2_1500x.webp?v=1737390779",
    title: "โปรโมชั่นสุดคุ้ม",
    desc: "ลดราคาสินค้าสำหรับสัตว์เลี้ยงสูงสุด 50%",
  },
  {
    url: Constants3,
    title: "บริการส่งฟรี",
    desc: "ลูกค้าใหม่ ส่งฟรีทั่วประเทศ",
  },
];

const ARTICLES = [
  {
    id: 1,
    image:
      "https://www.purina.co.th/sites/default/files/2020-12/Feeding%20Your%20Indoor%20CatHERO.jpg",
    date: "15 ส.ค.",
    title: "วิธีให้อาหารแมวที่เลี้ยงในบ้าน",
    summary:
      "รู้หรือไม่ว่าพืชบางชนิดอาจเป็นอันตรายต่อสัตว์เลี้ยงของคุณได้ มาดูวิธีเลือกพืชที่ปลอดภัยสำหรับบ้านที่มีสัตว์เลี้ยงกัน!",
  },
  {
    id: 2,
    image:
      "https://www.purina.co.th/sites/default/files/2023-04/Dog-run-with-food-bowl-HERO.jpg",
    date: "16. ส.ค.",
    title: "น้ำหนักและรูปร่างที่เหมาะสมของสุนัข",
    summary:
      "ความแตกต่างของสุนัขแต่ละสายพันธุ์ ทำให้เป็นเรื่องยากว่ารูปร่างแบบไหนถึงจะเหมาะกับสุนัขของคุณ",
  },
  {
    id: 3,
    image:
      "https://www.purina.co.th/sites/default/files/2022-05/healthy-puppies-training-guide.jpg",
    date: "16 ส.ค.",
    title: "มือใหม่ต้องรู้ไว้ ดูแลลูกหมาตัวใหม่ อย่างไรให้แข็งแรง",
    summary:
      "กว่าที่ลูกหมาแรกเกิดจะเติบโตเป็นสุนัขโตเต็มวัยได้อย่างมีสุขภาพกายและสุขภาพใจที่แข็งแรงนั้น ต้องอาศัยการพื้นฐานจากการเลี้ยงลูกหมาตั้งแต่วัยเด็ก ",
  },
  {
    id: 4,
    image:
      "https://www.purina.co.th/sites/default/files/2020-12/Unusual%20Cat%20Illness%20Symptoms%20To%20Watch%20Out%20ForHERO.jpg",
    date: "17 ส.ค.",
    title: "สัญญาณแปลก ๆ ที่เตือนว่าแมวกำลังป่วย",
    summary:
      "ในฐานะคนรักแมว เราเข้าใจดีว่า เจ้าของทุกคนอยากให้สัตว์เลี้ยงของเรามีความสุขและแข็งแรงทั้งกายและจิตใจอยู่เสมอ ",
  },
  {
    id: 5,
    image:
      "https://kingkongpetshop.com/wp-content/uploads/2022/07/cat-licking-fur-1024x538.jpg",
    date: "18 ส.ค.",
    title: "แมวเลียขนบ่อยมากเกินไป ทำไมแมวถึงมีพฤติกรรมเช่นนั้น แก้ไขอย่างไรดี",
    summary:
      "แมวบางตัวนั้นจุกจิก และพิถีพิถันกว่าแมวตัวอื่น แต่การแจ่งขนตัวเองมากเกินไป อาจเป็นสัญญานของปัญหาบางอย่าง",
  },
  {
    id: 6,
    image:
      "https://www.purina.co.th/sites/default/files/2020-12/Preparing%20for%20a%20New%20Puppy%20Here%20is%20what%20to%20ExpectHERO.jpg",
    date: "18 ส.ค.",
    title: "เตรียมความพร้อมก่อนรับเลี้ยงสุนัข ฉบับมือโปร",
    summary:
      "การรับเลี้ยงลูกสุนัขหรือมีสุนัขตัวใหม่ในบ้านเป็นเรื่องน่าตื่นเต้น คุณควรเตรียมตัวให้พร้อม ด้วยคู่มือการดูแลลูกสุนัขของเรา",
  },
];

// -----------------------------------------------------------------------------
// Data Hook (fetch + global store hydration)
// -----------------------------------------------------------------------------
const useProductData = () => {
  const [bestSeller, setBestSeller] = useState([]);
  const [loadingBestSeller, setLoadingBestSeller] = useState(true);
  const [newProduct, setNewProduct] = useState([]);
  const [loadingNewProduct, setLoadingNewProduct] = useState(true);

  // Global stores
  const categories = useEcomStore((s) => s.categories || []);
  const subcategories = useEcomStore((s) => s.subcategories || []);
  const brands = useEcomStore((s) => s.brands || []);
  const getCategory = useEcomStore((s) => s.getCategory);
  const getSubcategories = useEcomStore((s) => s.getSubcategories);
  const getBrands = useEcomStore((s) => s.getBrands);

  // Load best sellers
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await listProductBy("sold", "desc", 4);
        if (!ignore) setBestSeller(res?.data || []);
      } catch (err) {
        if (!ignore) setBestSeller([]);
        console.error("Failed to load best sellers:", err);
      } finally {
        if (!ignore) setLoadingBestSeller(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // Load new products (by update time)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await listProductBy("updatedAt", "desc", 3);
        if (!ignore) setNewProduct(res?.data || []);
      } catch (err) {
        if (!ignore) setNewProduct([]);
        console.error("Failed to load new products:", err);
      } finally {
        if (!ignore) setLoadingNewProduct(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // Hydrate taxonomy lists
  useEffect(() => {
    getCategory?.();
    getSubcategories?.();
    getBrands?.();
  }, [getCategory, getSubcategories, getBrands]);

  return {
    bestSeller,
    loadingBestSeller,
    newProduct,
    loadingNewProduct,
    categories,
    subcategories,
    brands,
  };
};

// -----------------------------------------------------------------------------
// UI Components
// -----------------------------------------------------------------------------
const HeroCarousel = ({ images }) => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % images.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [images.length]);

  const goPrev = () =>
    setCurrent((c) => (c - 1 + images.length) % images.length);
  const goNext = () => setCurrent((c) => (c + 1) % images.length);

  return (
    <section className="relative w-full max-w-7xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/5 group">
        <AnimatePresence mode="wait">
          <Motion.img
            key={current}
            src={images[current].url}
            alt={images[current].title}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.2, scale: 1.01 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full h-[360px] sm:h-[460px] object-cover"
          />
        </AnimatePresence>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-16">
          <Motion.h1
            key={`title-${current}`}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow mb-3 leading-tight"
          >
            {images[current].title}
          </Motion.h1>
          <Motion.p
            key={`desc-${current}`}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-base sm:text-lg text-white/90 mb-6 max-w-2xl"
          >
            {images[current].desc}
          </Motion.p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-full shadow-md transition-transform hover:-translate-y-0.5"
              aria-label="ช้อปเลย"
            >
              <ShoppingCart className="w-4 h-4" /> ช้อปเลย
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-full font-medium border border-white/15 backdrop-blur-sm"
              aria-label="ติดต่อเรา"
            >
              ติดต่อเรา
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute inset-y-0 left-0 flex items-center px-3 sm:px-6">
          <button
            aria-label="Previous slide"
            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 shadow-lg transition"
            onClick={goPrev}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 sm:px-6">
          <button
            aria-label="Next slide"
            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 shadow-lg transition"
            onClick={goNext}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${
                i === current ? "bg-yellow-400 scale-125" : "bg-white/60"
              }`}
              onClick={() => setCurrent(i)}
              aria-label={`slide-${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureGrid = () => (
  <section className="w-full bg-gray-50 py-16 px-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
      {[
        {
          icon: <Package className="w-7 h-7" />,
          title: "สินค้าหลากหลายคุณภาพ",
          desc: "เลือกซื้อสินค้าคุณภาพจากแบรนด์ชั้นนำหลากหลายประเภท",
        },
        {
          icon: <Truck className="w-7 h-7" />,
          title: "ส่งเร็วทันใจ",
          desc: "จัดส่งสินค้าถึงมือคุณอย่างรวดเร็วและตรงเวลา",
        },
        {
          icon: <HeartHandshake className="w-7 h-7" />,
          title: "บริการลูกค้าเป็นเลิศ",
          desc: "ทีมงานพร้อมช่วยเหลือ ตอบทุกคำถาม และให้คำแนะนำอย่างมืออาชีพ",
        },
        {
          icon: <ShieldCheck className="w-7 h-7" />,
          title: "ชำระเงินปลอดภัย",
          desc: "ระบบชำระเงินมาตรฐาน ปลอดภัย ไว้ใจได้",
        },
        {
          icon: <Tag className="w-7 h-7" />,
          title: "โปรโมชั่นพิเศษ",
          desc: "ข้อเสนอพิเศษและโปรโมชั่นสุดคุ้ม ที่คุณไม่ควรพลาด",
        },
      ].map((f, i) => (
        <Motion.div
          key={f.title}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="flex flex-col items-center text-center bg-white rounded-2xl shadow-sm p-6 transition-transform hover:-translate-y-1 hover:shadow-lg border border-gray-100 min-h-[160px]"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-yellow-50 text-orange-600 mb-4 flex items-center justify-center rounded-full shadow-inner">
            {f.icon}
          </div>
          <h3 className="text-gray-800 font-semibold text-lg md:text-xl">
            {f.title}
          </h3>
          <p className="text-gray-500 text-sm mt-2">{f.desc}</p>
        </Motion.div>
      ))}
    </div>
  </section>
);

const CategorySwiperSection = ({ categories, subcategories }) => {
  const navigate = useNavigate();
  if (!categories?.length) {
    return (
      <section className="mb-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-8 text-center">
          เลือกซื้อตามหมวดหมู่
        </h2>
        <div className="text-center text-gray-400 py-8 text-lg">
          ไม่พบหมวดหมู่
        </div>
      </section>
    );
  }
  //หมวดหมู่
  return (
    <section className="mb-20">
      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-8 text-center">
        เลือกซื้อตามหมวดหมู่
      </h2>
      {categories.map((cat) => {
        const catId = cat._id || cat.id;
        const filteredSubs = (subcategories || []).filter(
          (sub) => String(sub.categoryId) === String(catId)
        );
        if (!filteredSubs?.length) return null;

        const title = `หมวดหมู่ ${cat.name}`;
        return (
          <div key={catId} className="mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-700 mb-6 text-left">
              {title}
            </h3>
            <div className="relative">
              <SwiperShowProduct
                slidesPerView={"auto"}
                gap={18}
                showNavigation
                showPagination={false}
                breakpoints={{
                  320: { slidesPerView: 1 },
                  480: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                  1280: { slidesPerView: 5 },
                }}
              >
                {filteredSubs.map((sub) => (
                  <SwiperSlide key={sub._id || sub.id}>
                    <div
                      className="bg-white border-2 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col items-center p-4 relative w-full mx-auto"
                      style={{
                        boxSizing: "border-box",
                        display: "flex",
                        justifyContent: "center",
                      }}
                      onClick={() =>
                        navigate(
                          `/shop/subsubcategory?subcategory=${encodeURIComponent(
                            sub.name
                          )}`
                        )
                      }
                    >
                      <div className="relative w-24 h-24 sm:w-36 sm:h-36 mb-2 flex items-center justify-center rounded-2xl overflow-hidden">
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white"
                          aria-hidden
                        />
                        <div className="absolute inset-1 rounded-2xl bg-white/90 overflow-hidden shadow-inner">
                          <img
                            src={sub.images || "/img/placeholder-category.jpg"}
                            alt={sub.name}
                            className="w-full h-full object-cover transform transition duration-300 hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "/img/placeholder-category.jpg";
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-gray-800 font-semibold text-sm sm:text-base text-center w-full">
                        {sub.name}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </SwiperShowProduct>
            </div>
          </div>
        );
      })}
    </section>
  );
};

const BrandGrid = ({ brands }) => {
  const navigate = useNavigate();
  if (!brands?.length)
    return (
      <section className="mb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">
            แบรนด์ยอดนิยม
          </h2>
          <button className="text-orange-600 hover:text-yellow-800 font-semibold text-base flex items-center gap-1 transition">
            ดูทั้งหมด <span className="text-lg">&rarr;</span>
          </button>
        </div>
        <div className="text-center text-gray-400 py-8 text-lg">
          ไม่พบแบรนด์
        </div>
      </section>
    );

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">
            แบรนด์ยอดนิยม
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            แบรนด์ที่ลูกค้ามั่นใจและเป็นที่นิยม
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/shop")}
            className="inline-flex items-center gap-2 bg-white border border-orange-100 text-orange-600 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition"
            aria-label="ดูสินค้าทั้งหมด"
          >
            ดูทั้งหมด
            <span className="text-orange-500">→</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {brands.slice(0, 12).map((brand) => {
          const brandImg = brand.images || brand.logo || brand.img;
          const imgSrc =
            !brandImg || brandImg === "null" || brandImg === "undefined"
              ? "/img/logo/placeholder-brand.png"
              : brandImg.startsWith("http") ||
                brandImg.startsWith("data:image/")
              ? brandImg
              : `/img/logo/${brandImg}`;

          return (
            <Motion.button
              key={brand._id || brand.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.32 }}
              onClick={() =>
                navigate(`/shop/brand?brand=${encodeURIComponent(brand.name)}`)
              }
              aria-label={`ไปที่แบรนด์ ${brand.name}`}
              className="group relative bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-xl border border-orange-50"
            >
              <div className="w-28 h-20 mb-3 flex items-center justify-center">
                <div className="relative w-20 h-14 rounded-md overflow-hidden bg-gradient-to-br from-orange-50 to-white flex items-center justify-center shadow-inner">
                  <img
                    src={imgSrc}
                    alt={brand.name}
                    className="max-h-12 object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/img/logo/placeholder-brand.png";
                    }}
                  />
                </div>
              </div>

              <div className="text-sm font-semibold text-gray-800 truncate w-full group-hover:text-orange-600">
                {brand.name}
              </div>

              {/* subtle ribbon for featured brands */}
              {brand.featured && (
                <span className="absolute -top-2 right-3 bg-orange-50 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                  แบรนด์แนะนำ
                </span>
              )}
            </Motion.button>
          );
        })}
      </div>
    </section>
  );
};

const ArticlesGrid = () => {
  const navigate = useNavigate();
  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
            บทความน่ารู้
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            บทความแนะนำเพื่อช่วยดูแลและเลี้ยงสัตว์เลี้ยงของคุณ
          </p>
        </div>

        <button
          className="text-sm text-orange-600 font-semibold hover:underline"
          onClick={() => navigate("/articles")}
        >
          ดูบทความทั้งหมด
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ARTICLES.map((article, idx) => (
          <Motion.article
            key={article.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.36, delay: idx * 0.04 }}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
          >
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/img/placeholder-article.jpg";
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              <div className="absolute left-4 bottom-4 z-20 flex items-center gap-3">
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {article.date}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article.summary}
              </p>

              <div className="mt-auto flex items-center  gap-4 justify-center">
                <button
                  onClick={() => navigate(`/article/${article.id}`)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:from-orange-600 hover:to-orange-700 transition"
                  aria-label={`อ่านบทความ ${article.title}`}
                >
                  อ่านต่อ
                  <span className="text-white/90">→</span>
                </button>
              </div>
            </div>
          </Motion.article>
        ))}
      </div>
    </section>
  );
};

const FAQSection = () => {
  const sections = [
    {
      key: "order",
      title: "การสั่งซื้อ",
      icon: ShoppingCart,
      faqs: [
        {
          q: "สั่งซื้อสินค้าอย่างไร?",
          a: "เลือกสินค้าที่ต้องการ กด 'เพิ่มลงตะกร้า' จากนั้นไปที่หน้าตะกร้าและดำเนินการชำระเงินตามขั้นตอน",
        },
        {
          q: "สามารถชำระเงินแบบเก็บเงินปลายทางได้หรือไม่?",
          a: "ปัจจุบันร้านค้าของเราไม่รองรับการชำระเงินแบบเก็บเงินปลายทาง",
        },
      ],
    },
    {
      key: "delivery",
      title: "การจัดส่ง",
      icon: Truck,
      faqs: [
        {
          q: "มีบริการจัดส่งถึงบ้านหรือไม่?",
          a: "ร้านค้าของเรามีบริการจัดส่งทั่วประเทศ โดยจัดส่งผ่านขนส่งเอกชนที่ได้มาตรฐาน",
        },
        {
          q: "ต้องการเปลี่ยนหรือคืนสินค้า ต้องทำอย่างไร?",
          a: "ติดต่อฝ่ายบริการลูกค้าผ่านช่องทางที่ระบุในเว็บไซต์ ภายใน 7 วันหลังได้รับสินค้า",
        },
      ],
    },
    {
      key: "support",
      title: "ติดต่อเรา",
      icon: ShieldCheck,
      faqs: [
        {
          q: "มีช่องทางติดต่อร้านค้าอย่างไรบ้าง?",
          a: "สามารถติดต่อผ่าน Line, Facebook, หรือเบอร์โทรศัพท์ที่แสดงในหน้าเว็บไซต์",
        },
      ],
    },
  ];

  return (
    <section className="mb-24 bg-gradient-to-b from-orange-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-800">
            ทุกคำถาม มีคำตอบ
          </h2>
          <p className="text-gray-500 mt-3">
            รวมคำถามที่พบบ่อย
            เพื่อช่วยให้ลูกค้าตัดสินใจและใช้งานบริการได้ง่ายขึ้น
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.key}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {section.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  {section.faqs.map((item) => (
                    <details key={item.q} className="group">
                      <summary className="flex items-center justify-between cursor-pointer rounded-xl px-4 py-3 hover:bg-orange-50 transition font-medium text-gray-800">
                        <span>{item.q}</span>
                        <span className="ml-4 transform transition-transform duration-200 group-open:rotate-45 text-orange-500 text-xl">
                          ▾
                        </span>
                      </summary>
                      <div className="mt-2 px-4 text-gray-600 text-sm">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const CategoryOverview = ({ categories, subcategories }) => {
  const navigate = useNavigate();
  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">
            หมวดหมู่สินค้า
          </h2>
          <p className="text-gray-500 mt-1 max-w-xl">
            เรียกดูตามประเภท
            เพื่อค้นหาสินค้าที่ต้องการได้รวดเร็วและสะดวกยิ่งขึ้น —
            เลือกกรองดูตามหมวดหมู่ที่ตรงใจ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition"
            onClick={() => navigate("/shop")}
          >
            ดูทั้งหมดหมวดหมู่
            <span className="text-orange-600 ml-1">→</span>
          </button>
        </div>
      </div>

      <ul
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
        role="list"
      >
        {!categories?.length
          ? Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="animate-pulse" aria-hidden>
                <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-4 shadow-sm border border-orange-100 h-52 w-full" />
              </li>
            ))
          : categories.slice(0, 12).map((cat, idx) => {
              const catId = cat._id || cat.id;
              const subCount = (subcategories || []).filter(
                (s) => String(s.categoryId) === String(catId)
              ).length;
              const img =
                cat.image ||
                cat.cover ||
                (cat.images && cat.images[0]) ||
                "/img/placeholder-category.jpg";
              const imgUrl =
                typeof img === "string"
                  ? img
                  : img?.url || "/img/placeholder-category.jpg";
              const featured = !!cat.featured || idx < 3;

              return (
                <li key={catId} role="listitem">
                  <Motion.div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      navigate(`/shop?category=${encodeURIComponent(cat.name)}`)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(
                          `/shop?category=${encodeURIComponent(cat.name)}`
                        );
                      }
                    }}
                    aria-label={`เข้าสู่หมวดหมู่ ${cat.name}`}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.28 }}
                    className="group bg-gradient-to-br from-white to-orange-50 rounded-2xl p-4 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition border border-orange-100 cursor-pointer flex flex-col items-center text-center h-52 relative overflow-hidden"
                  >
                    {/* Decorative background accent */}
                    <div
                      className="absolute -top-6 -left-6 w-36 h-36 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 opacity-70 blur-2xl pointer-events-none"
                      aria-hidden
                    />

                    <div className="relative z-10 w-full flex flex-col items-center">
                      <div className="relative w-28 h-28 rounded-full overflow-hidden mb-3 flex items-center justify-center">
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white"
                          aria-hidden
                        />
                        <div className="absolute inset-0 flex items-center justify-center p-1">
                          <div className="w-full h-full rounded-full bg-white/90 shadow-inner overflow-hidden flex items-center justify-center">
                            <img
                              src={imgUrl}
                              alt={cat.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transform transition duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                  "/img/placeholder-category.jpg";
                              }}
                            />
                          </div>
                        </div>

                        <div className="absolute -bottom-1 right-0 z-20">
                          <div className="bg-white/90 text-orange-600 rounded-full p-1 shadow-sm border border-white">
                            <Package className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-tight mb-1 truncate w-full">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-400 mb-3 w-full">
                        {cat.description
                          ? cat.description.substring(0, 60)
                          : `${subCount} หมวดย่อย`}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/shop?category=${encodeURIComponent(cat.name)}`
                            );
                          }}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-sm shadow-sm hover:from-orange-600 hover:to-orange-700 transition"
                          aria-label={`ดูสินค้าในหมวด ${cat.name}`}
                        >
                          ดูสินค้า
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/shop/subsubcategory?subcategory=${encodeURIComponent(
                                cat.name
                              )}`
                            );
                          }}
                          className="text-sm text-orange-600 hover:text-orange-700 px-2 py-1 rounded-md border border-transparent hover:border-orange-100 transition"
                          aria-label={`ดูหมวดย่อยของ ${cat.name}`}
                        >
                          ดูหมวดย่อย
                        </button>
                      </div>
                    </div>

                    {featured && (
                      <div className="absolute top-3 left-3 z-20">
                        <span className="inline-flex items-center gap-2 px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold shadow-sm">
                          แนะนำ
                        </span>
                      </div>
                    )}
                  </Motion.div>
                </li>
              );
            })}
      </ul>
    </section>
  );
};

const ConsultationSection = () => {
  const navigate = useNavigate();
  return (
    <section className="mb-20">
      <div className="bg-white rounded-2xl shadow-md p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <div className="relative rounded-xl overflow-hidden h-64 lg:h-full">
            <img
              src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=1200&q=80"
              alt="consultation"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-4 left-4 bg-white/90 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
              ยินดีให้คำปรึกษา
            </div>
            <div className="absolute bottom-4 left-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white px-3 py-1 rounded-md text-sm shadow">
              ฟรีสำหรับคำถามทั่วไป
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">
              ยินดีให้คำปรึกษา
            </h2>
            <p className="text-gray-600 mt-2 max-w-2xl">
              ทีมผู้เชี่ยวชาญพร้อมช่วยเหลือเรื่องอาหาร ดูแลสุขภาพ การฝึกพฤติกรรม
              และการเลือกผลิตภัณฑ์ที่เหมาะสมกับสัตว์เลี้ยงของคุณ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">โทรศัพท์</div>
                <div className="text-sm text-gray-600">02-123-4567</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">แชทผ่าน Line</div>
                <div className="text-sm text-gray-600">@petshop_support</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">อีเมล</div>
                <div className="text-sm text-gray-600">
                  support@petshop.example
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">บริการหลังการขาย</div>
                <div className="text-sm text-gray-600">
                  คำแนะนำและติดตามผลหลังการซื้อ
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => navigate("/contact")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-3 rounded-full font-semibold shadow-md hover:from-orange-600 hover:to-orange-700 transition"
            >
              ติดต่อสอบถาม
            </button>

            <button
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 bg-white border border-orange-100 text-orange-600 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition"
            >
              ดูสินค้าแนะนำ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const CartOverlay = ({ open, onClose }) => (
  <AnimatePresence>
    {open && (
      <Motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Motion.div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl bg-white h-full md:h-[90vh] md:rounded-2xl p-6 shadow-2xl overflow-y-auto"
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-800">
              ตะกร้าสินค้าของคุณ
            </h4>
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={onClose}
              aria-label="ปิดตะกร้าสินค้า"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <CartCard />
        </Motion.div>
      </Motion.div>
    )}
  </AnimatePresence>
);

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const {
    bestSeller,
    loadingBestSeller,
    newProduct,
    loadingNewProduct,
    categories,
    subcategories,
    brands,
  } = useProductData();

  return (
    <div className="bg-gray-50 min-h-screen relative">
      {/* Hero */}
      <HeroCarousel images={CAROUSEL_IMAGES} />

      {/* Features */}
      <FeatureGrid />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs: Best Seller & New */}
        <ProductTabs
          bestSeller={bestSeller}
          loadingBestSeller={loadingBestSeller}
          newProduct={newProduct}
          loadingNewProduct={loadingNewProduct}
        />

        {/* Category Swiper by Category */}
        <CategorySwiperSection
          categories={categories}
          subcategories={subcategories}
        />

        {/* Brands */}
        <BrandGrid brands={brands} />

        {/* Articles */}
        <ArticlesGrid />

        {/* FAQ */}
        <FAQSection />

        {/* Consultation */}
        <ConsultationSection />
      </main>

      {/* Cart Overlay (toggle when integrated with cart button elsewhere) */}
      <CartOverlay open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Index;
