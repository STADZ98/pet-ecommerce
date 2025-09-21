// src/utils/SwiperShowProduct.jsx
import React from "react";
import { Swiper } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const SwiperShowProduct = ({
  children,
  slidesPerView = "auto",
  gap = 12,
  showNavigation = true,
  showPagination = false,
  loop = true,
  className = "",
  autoplayDelay = 3500,
  breakpoints = {
    480: { slidesPerView: 2 },
    768: { slidesPerView: 3 },
    1024: { slidesPerView: 4 },
    1280: { slidesPerView: 5 },
  },
}) => {
  const childCount = React.Children.count(children) || 0;
  // If slidesPerView is numeric, enable loop only when we have more children than visible slides
  const effectiveLoop =
    Boolean(loop) &&
    typeof slidesPerView === "number" &&
    childCount > slidesPerView;

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={gap}
      slidesPerView={slidesPerView}
      navigation={showNavigation}
      pagination={
        showPagination
          ? { clickable: true, dynamicBullets: true, dynamicMainBullets: 3 }
          : false
      }
      autoplay={{
        delay: autoplayDelay,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      loop={effectiveLoop}
      keyboard={{ enabled: true }}
      watchSlidesProgress={true}
      breakpoints={breakpoints}
      className={`product-swiper custom-swiper-container ${className}`}
      style={{ paddingBottom: showPagination ? "2.5rem" : "1rem" }}
      aria-live="polite"
    >
      {children}
    </Swiper>
  );
};

export default SwiperShowProduct;
