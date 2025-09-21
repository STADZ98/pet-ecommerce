import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useEcomStore from "../store/ecom-store";
import SidebarFilter from "../components/card/SidebarFilter";
import { getCategoryName, getCategoryImage } from "../utils/categoryUtils";

// ===== Loading Skeleton =====
const LoadingSkeleton = () => (
  <div className="animate-pulse p-4 bg-white rounded-xl shadow">
    <div className="h-40 bg-gray-200 rounded mb-4" />
    <div className="flex justify-center space-x-3">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="h-4 w-20 bg-gray-200 rounded" />
    </div>
  </div>
);

// ===== Category / Subcategory Card =====
const Card = ({ name, image, count, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={name}
    className="group w-full text-left bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
  >
    <div className="relative w-full h-48 overflow-hidden bg-gray-100">
      <img
        src={image}
        alt={`รูปหมวดหมู่ ${name}`}
        className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/img/default-category.png";
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

     

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="inline-flex items-center gap-2 bg-yellow-400/95 text-yellow-900 font-semibold text-sm px-4 py-2 rounded-full shadow-lg">
            ดูสินค้า
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </span>
        </span>
      </div>
    </div>

    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800 truncate">{name}</h3>
      <p className="text-sm text-gray-500 mt-1">คลิกเพื่อดูสินค้าทั้งหมด</p>
    </div>
  </button>
);

const SubCategory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const categories = useEcomStore((state) => state.categories || []);
  const subcategories = useEcomStore((state) => state.subcategories || []);

  const categoryName = searchParams.get("category") || "";

  // หา category ปัจจุบัน
  const category = useMemo(() => {
    return (
      categories.find((c) => {
        const name = getCategoryName(c);
        return (
          name === categoryName ||
          String(c.id) === categoryName ||
          String(c._id) === categoryName
        );
      }) || null
    );
  }, [categories, categoryName]);

  // filter subcategories ที่อยู่ใน category ปัจจุบัน
  const filteredSubcategories = useMemo(() => {
    if (!category) return [];
    return subcategories.filter(
      (sub) =>
        sub.categoryId &&
        (String(sub.categoryId) === String(category.id) ||
          String(sub.categoryId) === String(category._id))
    );
  }, [subcategories, category]);

  // Local filtered/sorted arrays for nicer UX
  const visibleCategories = useMemo(() => {
    const list = categories.map((c) => ({
      ...c,
      __name: getCategoryName(c),
      __image: getCategoryImage(c),
    }));

    const filtered = list.filter((c) =>
      c.__name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === "alpha") {
      filtered.sort((a, b) =>
        a.__name.localeCompare(b.__name, "th", { sensitivity: "base" })
      );
    }

    return filtered;
  }, [categories, searchTerm, sortBy]);

  const visibleSubcategories = useMemo(() => {
    const list = filteredSubcategories.map((s) => ({
      ...s,
      __image: getCategoryImage(s),
    }));

    const filtered = list.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === "alpha") {
      filtered.sort((a, b) =>
        a.name.localeCompare(b.name, "th", { sensitivity: "base" })
      );
    }

    return filtered;
  }, [filteredSubcategories, searchTerm, sortBy]);

  // hero stats
  const subCount = filteredSubcategories.length;
  // total products (kept for future use) - removed variable to satisfy linter

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen font-sarabun">
      {/* Hero Section */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-md">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                {categoryName ? `หมวดหมู่ ${categoryName}` : "สำรวจหมวดหมู่"}
              </h1>
              <p className="text-gray-600 text-base md:text-lg mb-6">
                {categoryName
                  ? `สำรวจซับหมวดหมู่และสินค้าภายในหมวดหมู่นี้`
                  : `เรียกดูหมวดหมู่สินค้าที่คัดสรรมาเพื่อคุณ`}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full shadow-sm">
                  <span className="text-sm font-medium text-gray-700">
                    ซับหมวดหมู่
                  </span>
                  <span className="text-yellow-600 font-semibold">
                    {subCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="rounded-xl overflow-hidden shadow-lg bg-white">
                <div className="h-48 md:h-56 w-full bg-gray-100 flex items-center justify-center">
                  {category && getCategoryImage(category) ? (
                    <img
                      src={getCategoryImage(category)}
                      alt={getCategoryName(category)}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/img/default-category.png";
                      }}
                    />
                  ) : (
                    <div className="text-center p-6">
                      <svg
                        className="mx-auto w-12 h-12 text-yellow-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 7h18M3 12h18M3 17h18"
                        ></path>
                      </svg>
                      <p className="text-sm text-gray-500 mt-2">
                        รูปตัวอย่างหมวดหมู่
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-sm text-gray-600">คำอธิบายสั้น</h4>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {category && category.description
                      ? category.description
                      : "รวมหมวดหมู่สินค้าที่หลากหลายและน่าสนใจ"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-gray-100">
          <ol className="flex items-center space-x-3 text-sm text-gray-600">
            <li>
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-800"
              >
                <svg
                  className="w-4 h-4 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 9.75L12 4l9 5.75V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.75z"
                  ></path>
                </svg>
                หน้าหลัก
              </Link>
            </li>

            <li className="text-gray-300">/</li>

            <li>
              <Link
                to="/shop"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                สินค้า
              </Link>
            </li>

            {categoryName && (
              <>
                <li className="text-gray-300">/</li>
                <li
                  aria-current="page"
                  className="text-gray-900 font-semibold truncate max-w-xs"
                >
                  {categoryName}
                </li>
              </>
            )}
          </ol>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 py-10 px-4 md:px-6">
        {/* Sidebar Filter */}
        <aside className="w-full md:w-72">
          <div className="sticky top-24">
            <SidebarFilter />
          </div>
        </aside>

        {/* Categories */}
        {!categoryName && (
          <section className="flex-1">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 w-full md:w-80">
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
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCategories.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <LoadingSkeleton key={i} />
                  ))
                : visibleCategories.map((cat) => (
                    <Card
                      key={cat._id || cat.id}
                      name={cat.__name}
                      image={cat.__image}
                      count={cat.productCount}
                      onClick={() =>
                        navigate(
                          `/shop/subcategory?category=${encodeURIComponent(
                            cat.__name
                          )}`
                        )
                      }
                    />
                  ))}
            </div>
          </section>
        )}

        {/* Subcategories */}
        {categoryName && (
          <main className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleSubcategories.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <LoadingSkeleton key={i} />
                  ))
                : visibleSubcategories.map((sub) => (
                    <Card
                      key={sub._id || sub.id}
                      name={sub.name}
                      image={sub.__image}
                      count={sub.productCount}
                      onClick={() =>
                        navigate(
                          `/shop/subsubcategory?subcategory=${encodeURIComponent(
                            getCategoryName(sub)
                          )}`
                        )
                      }
                    />
                  ))}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default SubCategory;
