// src/pages/Shop.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import useEcomStore from "../store/ecom-store";
import SidebarFilter from "../components/card/SidebarFilter";
import { getCategoryName, getCategoryImage } from "../utils/categoryUtils";

// ================= Loading Skeleton =================
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
      >
        <div className="bg-gray-200 rounded-lg h-44 w-full animate-pulse mb-4" />
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
      </div>
    ))}
  </div>
);

const Shop = () => {
  const getProduct = useEcomStore((state) => state.getProduct);
  const products = useEcomStore((state) => state.products);
  const categories = useEcomStore((state) => state.categories || []);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  // no local searchParams needed in this view
  const navigate = useNavigate();

  // Fetch products on mount
  useEffect(() => {
    getProduct();
  }, [getProduct]);

  // Compute product count per category
  const productCountMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const name =
        typeof p.category?.name === "object"
          ? p.category.name.th || p.category.name.en
          : p.category?.name;
      if (name) map[name] = (map[name] || 0) + 1;
    });
    return map;
  }, [products]);

  // Filter and sort categories locally for nicer UX
  const visibleCategories = useMemo(() => {
    const list = (categories || []).map((cat) => {
      const name = getCategoryName(cat);
      return { ...cat, __displayName: name, __image: getCategoryImage(cat) };
    });

    const filtered = list.filter((c) =>
      c.__displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === "alpha") {
      filtered.sort((a, b) =>
        a.__displayName.localeCompare(b.__displayName, "th", {
          sensitivity: "base",
        })
      );
    } else if (sortBy === "count") {
      filtered.sort(
        (a, b) =>
          (productCountMap[b.__displayName] || 0) -
          (productCountMap[a.__displayName] || 0)
      );
    }

    return filtered;
  }, [categories, searchTerm, sortBy, productCountMap]);

  return (
    <div className="bg-gray-50 min-h-screen font-sarabun">
      {/* Breadcrumb */}
      <nav
        className="text-sm px-6 py-5 bg-white shadow-sm"
        aria-label="Breadcrumb"
      >
        <ol className="list-reset flex space-x-2">
          <li>
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              หน้าหลัก
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link
              to="/shop"
              className="text-blue-600 font-medium hover:underline"
              aria-current="page"
            >
              สินค้า
            </Link>
          </li>
        </ol>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero / Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="md:flex md:items-center md:justify-between gap-4">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                ร้านค้า
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                เรียกดูตามหมวดหมู่สินค้าและตัวกรองเพื่อค้นหาสิ่งที่ต้องการ
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-72">
                <svg
                  className="w-5 h-5 text-gray-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  ></path>
                </svg>
                <input
                  aria-label="ค้นหาหมวดหมู่"
                  placeholder="ค้นหาหมวดหมู่"
                  className="bg-transparent outline-none text-sm text-gray-700 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="sr-only">เรียงลำดับ</label>
                <select
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">ยอดนิยม</option>
                  <option value="alpha">ชื่อ (A–Z)</option>
                  <option value="count">จำนวนสินค้า</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="sticky top-28 bg-white p-4 rounded-xl shadow-md border border-gray-100">
              <SidebarFilter />
            </div>
          </aside>

          {/* Categories Grid */}
          <section className="md:col-span-3">
            {categories.length === 0 ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleCategories.map((cat) => {
                  const name = cat.__displayName;
                  const image = cat.__image;
                  const count = productCountMap[name] || 0;

                  return (
                    <button
                      key={cat._id || cat.id}
                      onClick={() =>
                        navigate(
                          `/shop/subcategory?category=${encodeURIComponent(
                            name
                          )}`
                        )
                      }
                      className="group relative cursor-pointer bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 overflow-hidden"
                    >
                      <div className="relative h-64 w-full bg-gray-100">
                        <img
                          src={image}
                          alt={`หมวดหมู่ ${name}`}
                          className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/img/default-category.png";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-3 right-3 bg-white/90 text-xs text-gray-700 px-2 py-1 rounded-full font-medium shadow">
                          {count} สินค้า
                        </div>
                      </div>

                      <div className="p-4 text-left">
                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                          {name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          คลิกเพื่อดูสินค้าทั้งหมดในหมวดหมู่นี้
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Shop;
