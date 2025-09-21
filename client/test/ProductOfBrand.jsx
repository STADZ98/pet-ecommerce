// src/pages/CategoryPage.jsx
import React, { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useEcomStore from "../src/store/ecom-store";
import ProductCard from "../src/components/card/ProductCard";
import SidebarFilter from "../src/components/card/SidebarFilter";
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4 w-full">
    <div className="h-48 bg-gray-300 rounded-xl" />
    <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto" />
  </div>
);

const ProductOfBrand = () => {
  const [searchParams] = useSearchParams();
  const brandName = searchParams.get("brand");
  const navigate = useNavigate();

  const products = useEcomStore((s) => s.products || []);
  const brands = useEcomStore((s) => s.brands || []);
  const getProduct = useEcomStore((s) => s.getProduct);
  const getBrands = useEcomStore((s) => s.getBrands);

  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    Promise.all([getProduct(), getBrands()]).finally(() => setLoading(false));
  }, [getProduct, getBrands]);

  // normalize ชื่อแบรนด์เพื่อเทียบแบบ insensitive
  const norm = (str) => (str ? String(str).trim().toLowerCase() : "");
  const brandObj = Array.isArray(brands)
    ? brands.find((b) => norm(b.name) === norm(brandName))
    : undefined;
  const filteredProducts = products.filter((p) => {
    if (!brandName) return true;
    if (p.brand && typeof p.brand === "object") {
      return norm(p.brand.name) === norm(brandName);
    }
    if (typeof p.brand === "string" || typeof p.brand === "number") {
      return (
        norm(brandObj?.name) === norm(brandName) &&
        (p.brand === brandObj?._id || p.brand === brandObj?.id)
      );
    }
    return false;
  });

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen font-sarabun flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-white py-16 text-center shadow-md">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 animate-fade-in-up">
          {brandObj?.name || brandName || "ไม่พบแบรนด์"}
        </h1>
        <p className="mt-2 text-white text-lg">สินค้าทั้งหมดในแบรนด์นี้</p>
      </section>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 px-6 py-4" aria-label="Breadcrumb">
        <ol className="list-reset flex space-x-2">
          <li>
            <Link to="/" className="text-blue-600 hover:underline">
              หน้าหลัก
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/shop" className="text-blue-600 hover:underline">
              ร้านค้า
            </Link>
          </li>
          <li>/</li>
          <li aria-current="page" className="text-gray-500">
            {brandObj?.name || brandName || "ไม่พบแบรนด์"}
          </li>
        </ol>
      </nav>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 py-10 px-4 md:px-6 flex-1 w-full">
        {/* Sidebar Filter */}
        <aside className="w-full md:w-72 mb-8 md:mb-0">
          <div className="sticky top-24">
            <SidebarFilter />
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  tabIndex={0}
                  role="button"
                  onClick={() =>
                    navigate(
                      `/shop/productListingPage?product=${encodeURIComponent(
                        product.title
                      )}`
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(
                        `/shop/productListingPage?product=${encodeURIComponent(
                          product.title
                        )}`
                      );
                    }
                  }}
                  className="group relative bg-white border border-blue-200 rounded-2xl shadow-md p-0 flex flex-col items-center justify-center min-h-[180px] transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.title}
                      className="w-full h-48 object-cover object-center"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/img/logo/placeholder-brand.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-blue-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-12 h-12 text-blue-200"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 w-full bg-yellow-500 text-white text-base md:text-lg font-bold py-2 px-3 text-center rounded-b-2xl z-20 backdrop-blur-sm">
                    {product.title}
                  </div>
                  {product.description && (
                    <div className="mt-3 text-gray-500 text-sm line-clamp-2 px-4 text-center">
                      {product.description}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 w-full col-span-full">
                <img
                  src="/img/logo/placeholder-brand.png"
                  alt="empty"
                  className="w-24 h-24 mb-4 opacity-60"
                />
                <p className="text-center text-gray-500 text-lg">
                  ยังไม่มีสินค้าสำหรับแบรนด์นี้
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductOfBrand;
