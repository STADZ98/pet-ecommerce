import React, { Suspense } from "react";
import useProductData from "../hooks/useProductData";

const HeroCarousel = React.lazy(() =>
  import("../components/home/HeroCarousel")
);
const FeatureGrid = React.lazy(() => import("../components/home/FeatureGrid"));
const CategoryOverview = React.lazy(() =>
  import("../components/home/CategoryOverview")
);
const CategorySwiperSection = React.lazy(() =>
  import("../components/home/CategorySwiperSection")
);
const BrandGrid = React.lazy(() => import("../components/home/BrandGrid"));
const ArticlesGrid = React.lazy(() =>
  import("../components/home/ArticlesGrid")
);
const FAQSection = React.lazy(() => import("../components/home/FAQSection"));
const ConsultationSection = React.lazy(() =>
  import("../components/home/ConsultationSection")
);

const CAROUSEL_IMAGES = [
  {
    url: "/images/Constants1.jpg",
    title: "ช้อปสินค้าใหม่ล่าสุด",
    desc: "พบกับสินค้าสัตว์เลี้ยงคุณภาพดี ราคาพิเศษทุกวัน",
  },
  {
    url: "/images/Constants2.jpg",
    title: "โปรโมชั่นสุดคุ้ม",
    desc: "ลดราคาสินค้าสำหรับสัตว์เลี้ยงสูงสุด 50%",
  },
  {
    url: "/images/Constants3.jpg",
    title: "บริการส่งฟรี",
    desc: "ลูกค้าใหม่ ส่งฟรีทั่วประเทศ",
  },
];

const HomePage = () => {
  const { categories, subcategories, brands } = useProductData();

  return (
    <main className="overflow-x-hidden">
      <Suspense
        fallback={<div className="text-center py-20">Loading Hero...</div>}
      >
        <HeroCarousel images={CAROUSEL_IMAGES} />
      </Suspense>

      <Suspense
        fallback={<div className="text-center py-10">Loading Features...</div>}
      >
        <FeatureGrid />
      </Suspense>

      <Suspense
        fallback={
          <div className="text-center py-10">Loading Categories...</div>
        }
      >
        <CategoryOverview
          categories={categories}
          subcategories={subcategories}
        />
      </Suspense>

      <Suspense
        fallback={
          <div className="text-center py-10">Loading Category Swiper...</div>
        }
      >
        <CategorySwiperSection
          categories={categories}
          subcategories={subcategories}
        />
      </Suspense>

      <Suspense
        fallback={<div className="text-center py-10">Loading Brands...</div>}
      >
        <BrandGrid brands={brands} />
      </Suspense>

      <Suspense
        fallback={<div className="text-center py-10">Loading Articles...</div>}
      >
        <ArticlesGrid />
      </Suspense>

      <Suspense
        fallback={<div className="text-center py-10">Loading FAQ...</div>}
      >
        <FAQSection />
      </Suspense>

      <Suspense
        fallback={
          <div className="text-center py-10">Loading Consultation...</div>
        }
      >
        <ConsultationSection />
      </Suspense>
    </main>
  );
};

export default HomePage;
