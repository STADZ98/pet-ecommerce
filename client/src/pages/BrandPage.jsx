// src/pages/BrandPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useEcomStore from "../store/ecom-store";
import ProductCard from "../components/card/ProductCard";
import SidebarFilter from "../components/card/SidebarFilter";
import { FaChevronRight, FaSort, FaStore } from "react-icons/fa";

// Skeleton Loading Card Component (more detailed)
const LoadingSkeleton = ({ cols = 3 }) => (
  <div
    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-6 animate-pulse`}
  >
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl shadow-sm p-4 flex flex-col space-y-3 border border-gray-100"
      >
        <div className="bg-gray-200 rounded-md h-40 w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex items-center justify-between mt-auto">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    ))}
  </div>
);

const BrandPage = () => {
  const [searchParams] = useSearchParams();
  const brandName = searchParams.get("brand");

  const { products, brands, getProduct, getBrands } = useEcomStore((state) => ({
    products: state.products,
    brands: state.brands,
    getProduct: state.getProduct,
    getBrands: state.getBrands,
  }));

  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("newest");

  // Fetch data only once when the component mounts.
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([getProduct(), getBrands()]);
      } catch (error) {
        console.error("Failed to fetch products or brands:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!products.length || !brands.length) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [getProduct, getBrands, products.length, brands.length]);

  const { brandObj, filteredProducts } = useMemo(() => {
    const normalizeString = (str) =>
      str ? String(str).trim().toLowerCase() : "";
    const foundBrand = brands?.find(
      (b) => normalizeString(b.name) === normalizeString(brandName)
    );
    const productsByBrand = products.filter((p) => {
      if (!brandName) return true;
      const pBrandId = p.brand?._id || p.brand?.id || p.brand;
      const brandId = foundBrand?._id || foundBrand?.id;
      return (
        normalizeString(p.brand?.name) === normalizeString(brandName) ||
        pBrandId === brandId
      );
    });

    return { brandObj: foundBrand, filteredProducts: productsByBrand };
  }, [brandName, products, brands]);

  // Apply client-side sorting (safe guards if fields missing)
  const finalProducts = useMemo(() => {
    const list = [...(filteredProducts || [])];
    switch (sortOption) {
      case "price-asc":
        return list.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-desc":
        return list.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "best-selling":
        return list.sort((a, b) => (b.sold || 0) - (a.sold || 0));
      case "newest":
      default:
        return list.sort((a, b) => {
          const ta = new Date(a.createdAt || a.created || 0).getTime() || 0;
          const tb = new Date(b.createdAt || b.created || 0).getTime() || 0;
          return tb - ta;
        });
    }
  }, [filteredProducts, sortOption]);

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {brandObj?.image || brandObj?.logo ? (
                <img
                  src={brandObj.image || brandObj.logo}
                  alt={brandObj?.name || brandName}
                  className="h-20 w-20 rounded-full object-cover border border-gray-100 shadow"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl border border-gray-100">
                  <FaStore className="h-8 w-8" />
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                {brandObj?.name || brandName || "สินค้าทั้งหมด"}
              </h1>
              <p className="mt-1 text-gray-500">
                สินค้าคุณภาพจากแบรนด์ที่คุณวางใจ — คัดสรรมาอย่างพิถีพิถัน
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav
          className="flex items-center text-sm text-gray-500 mb-6 flex-wrap"
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center space-x-2">
            <li>
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                หน้าหลัก
              </Link>
            </li>
            <FaChevronRight className="w-3 h-3 text-gray-400" />
            <li>
              <Link
                to="/shop"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                ร้านค้า
              </Link>
            </li>
            <FaChevronRight className="w-3 h-3 text-gray-400" />
            <li aria-current="page" className="text-gray-900 font-medium">
              {brandObj?.name || brandName || "ไม่พบแบรนด์"}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-72">
            <div className="sticky top-24">
              <SidebarFilter />
            </div>
          </aside>

          {/* Products */}
          <main className="flex-1">
            {/* Toolbar: count + sort */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                แสดง{" "}
                <span className="font-medium text-gray-900">
                  {finalProducts.length}
                </span>{" "}
                ผลลัพธ์
                {brandObj?.name ? (
                  <span className="ml-2 text-gray-500">
                    จากแบรนด์ "{brandObj.name}"
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-500 flex items-center gap-2">
                  <FaSort className="text-gray-400" />
                  <span className="sr-only">Sort</span>
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border-gray-200 bg-white text-sm rounded-md py-2 px-3 shadow-sm"
                >
                  <option value="newest">ใหม่ล่าสุด</option>
                  <option value="price-asc">ราคาต่ำ ➜ สูง</option>
                  <option value="price-desc">ราคาสูง ➜ ต่ำ</option>
                  <option value="best-selling">ขายดี</option>
                </select>
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton cols={3} />
            ) : finalProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {finalProducts.map((product) => (
                  <ProductCard key={product.id || product._id} item={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-20 w-20 text-gray-300 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  ยังไม่มีสินค้าที่ตรงกับเงื่อนไข
                </h3>
                <p className="text-gray-500 text-center max-w-md mb-4">
                  ขณะนี้ยังไม่มีสินค้าในแบรนด์ "
                  <span className="font-medium">
                    {brandObj?.name || brandName}
                  </span>
                  " หรือ ตามตัวกรองที่เลือก
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
                >
                  ดูสินค้าทั้งหมด
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BrandPage;
