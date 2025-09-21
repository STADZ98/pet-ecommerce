import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useEcomStore from "../store/ecom-store";
import SidebarFilter from "../components/card/SidebarFilter";
import { getCategoryName } from "../utils/categoryUtils";

// Helper for images with fallback
const getCategoryOrSubCategoryImage = (item) =>
  item.images || item.image || "/img/default-category.png";

// Loading Skeleton (card style)
const LoadingSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
    <div className="h-40 bg-gray-200 rounded-xl mb-4 w-full" />
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-1/3" />
  </div>
);

// Sub-subcategory Card
const Card = ({ name, image, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
  >
    <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/img/default-category.png";
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="inline-flex items-center gap-2 bg-yellow-400/95 text-yellow-900 font-semibold text-sm px-4 py-2 rounded-full shadow-md">
            ดูสินค้า
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </span>
      </div>
    </div>
    <div className="p-4 text-center">
      <h3 className="text-lg font-semibold text-gray-800 truncate">{name}</h3>
    </div>
  </button>
);

const SubSubCategory = () => {
  const categories = useEcomStore((state) => state.categories || []);
  const subcategories = useEcomStore((state) => state.subcategories || []);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  // query params (use distinct local names to avoid collisions)
  const subcategoryParam = searchParams.get("subcategory") || "";

  // หา subcategory ที่เลือก (object)
  const subcategory = useMemo(() => {
    return (
      subcategories.find((s) => {
        const name = getCategoryName(s) || "";
        return (
          name === subcategoryParam ||
          String(s.id) === subcategoryParam ||
          String(s._id) === subcategoryParam
        );
      }) || null
    );
  }, [subcategories, subcategoryParam]);

  // รวม subsubcategories ทั้งหมด (ต้องสร้างก่อนใช้เพื่อค้นหา)
  const allSubSubcategories = useMemo(
    () => subcategories.flatMap((s) => s.subsubcategories || []),
    [subcategories]
  );

  // (subsubcategory lookup removed because it's not used in this component)

  // หา category หลักของ subcategory (display name)
  const categoryName = useMemo(() => {
    if (!subcategory || categories.length === 0) return "";
    const cat = categories.find(
      (c) => String(c._id || c.id) === String(subcategory.categoryId)
    );
    return (
      cat &&
      (typeof cat.name === "object" ? cat.name.th || cat.name.en : cat.name)
    );
  }, [subcategory, categories]);

  // ชื่อที่จะแสดงของ subcategory (display)
  const subcategoryDisplayName = useMemo(() => {
    if (!subcategory) return subcategoryParam || "";
    const name = getCategoryName(subcategory);
    return (
      name ||
      (typeof subcategory.name === "object"
        ? subcategory.name.th || subcategory.name.en
        : subcategory.name)
    );
  }, [subcategory, subcategoryParam]);

  // (allSubSubcategories already defined above and used)

  // filter subsubcategories ตาม subcategory
  const filteredSubSubcategories = useMemo(() => {
    if (!subcategory) return [];
    return allSubSubcategories.filter(
      (subsub) =>
        String(subsub.subcategoryId) === String(subcategory.id) ||
        String(subsub.subcategoryId) === String(subcategory._id)
    );
  }, [allSubSubcategories, subcategory]);

  // Visible (search + sort)
  const visibleSubSubcategories = useMemo(() => {
    const list = (filteredSubSubcategories || []).map((s) => ({
      ...s,
      __image: getCategoryOrSubCategoryImage(s),
    }));

    let filtered = list.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === "alpha") {
      filtered.sort((a, b) =>
        a.name.localeCompare(b.name, "th", { sensitivity: "base" })
      );
    }

    return filtered;
  }, [filteredSubSubcategories, searchTerm, sortBy]);

  // hero stats
  const subsubCount = filteredSubSubcategories.length;
  const subsubProductsTotal = filteredSubSubcategories.reduce(
    (s, cur) => s + (Number(cur.productCount) || 0),
    0
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen font-sarabun flex flex-col">
      {/* Hero Section */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-md">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                {subcategoryDisplayName
                  ? `หมวดหมู่ ${subcategoryDisplayName}`
                  : "สำรวจหมวดหมู่ย่อย"}
              </h1>
              <p className="text-gray-600 text-base md:text-lg mb-6">
                {subcategoryDisplayName
                  ? `ดูรายการหมวดหมู่ย่อยระดับ 2 ภายใต้ "${subcategoryDisplayName}"`
                  : `เรียกดูหมวดหมู่ย่อยระดับ 2 ที่มีให้เลือก`}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full shadow-sm">
                  <span className="text-sm font-medium text-gray-700">
                    รายการย่อยทั้งหมด
                  </span>
                  <span className="text-yellow-600 font-semibold">
                    {subsubCount}
                  </span>
                </div>

                
              </div>

            </div>

            <div className="md:col-span-1">
              <div className="rounded-xl overflow-hidden shadow-lg bg-white">
                <div className="h-48 md:h-56 w-full bg-gray-100 flex items-center justify-center">
                  {subcategory && getCategoryOrSubCategoryImage(subcategory) ? (
                    <img
                      src={getCategoryOrSubCategoryImage(subcategory)}
                      alt={getCategoryName(subcategory)}
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
                      <p className="text-sm text-gray-500 mt-2">รูปตัวอย่าง</p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-sm text-gray-600">คำอธิบาย</h4>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {subcategory && subcategory.description
                      ? subcategory.description
                      : "รวมรายการย่อยระดับ 2 ที่หลากหลาย"}
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
            {subcategoryDisplayName && (
              <>
                <li className="text-gray-300">/</li>
                <li
                  aria-current="page"
                  className="text-gray-900 font-semibold truncate max-w-xs"
                >
                  {subcategoryDisplayName}
                </li>
              </>
            )}
          </ol>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 py-10 px-4 md:px-6 flex-1 w-full">
        {/* Sidebar */}
        <aside className="w-full md:w-72 mb-8 md:mb-0">
          <div className="sticky top-28">
            <SidebarFilter />
          </div>
        </aside>

        {/* Grid */}
        <main className="flex-1 flex flex-col">
          <div className="w-full max-w-5xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
              {/* Search */}
              <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 w-full md:w-80 shadow-sm">
                <svg
                  className="w-5 h-5 text-gray-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
                <input
                  aria-label="ค้นหาหมวดหมู่ย่อย"
                  placeholder="ค้นหาหมวดหมู่ย่อย..."
                  className="bg-transparent outline-none text-sm text-gray-700 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="sr-only">
                  เรียงลำดับ
                </label>
                <select
                  id="sort"
                  className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 shadow-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">ยอดนิยม</option>
                  <option value="alpha">ชื่อ (A–Z)</option>
                </select>
              </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleSubSubcategories.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <LoadingSkeleton key={i} />
                  ))
                : visibleSubSubcategories.map((subsub) => (
                    <Card
                      key={subsub._id || subsub.id}
                      name={subsub.name}
                      image={subsub.__image}
                      onClick={() =>
                        navigate(
                          `/shop/productListingPage?subsubcategory=${encodeURIComponent(
                            subsub.name
                          )}`
                        )
                      }
                    />
                  ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SubSubCategory;
