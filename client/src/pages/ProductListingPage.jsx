// src/pages/ProductListingPage.jsx
import React, { useEffect, useMemo, useState, Fragment } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useEcomStore from "../store/ecom-store";
import {
  ShoppingCart,
  Star,
  Eye,
  Heart,
  Funnel,
  ChevronDown,
} from "lucide-react";
import { numberFormat } from "../utils/number";
import { Dialog, Transition } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import SidebarFilter from "../components/card/SidebarFilter";

// 🔹 Loading Skeleton Card
const LoadingCard = () => (
  <div className="animate-pulse bg-white rounded-xl shadow p-4">
    <div className="h-48 bg-gray-200 rounded mb-4" />
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
  </div>
);

const ProductListingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortOption, setSortOption] = useState("popular");

  const products = useEcomStore((state) => state.products || []);
  const subcategories = useEcomStore((state) => state.subcategories || []);
  const categories = useEcomStore((state) => state.categories || []);
  const getProduct = useEcomStore((state) => state.getProduct);
  const getCategories = useEcomStore((state) => state.getCategories);
  const getSubcategories = useEcomStore((state) => state.getSubcategories);
  const actionAddtoCart = useEcomStore(
    (state) => state.actionAddtoCart || (() => {})
  );

  // 🔹 Load data on mount
  useEffect(() => {
    if (categories.length === 0) getCategories?.();
    if (subcategories.length === 0) getSubcategories?.();
    getProduct?.("createdAt", "desc", 50);
  }, [getProduct, getCategories, getSubcategories, categories, subcategories]);

  // 🔹 Extract query
  const params = new URLSearchParams(location.search);
  const searchProduct = params.get("product") || "";
  const subsubcategoryIdentifier = params.get("subsubcategory")
    ? decodeURIComponent(params.get("subsubcategory"))
    : "";

  // 🔹 Helpers
  const allSubSubcategories = useMemo(
    () => subcategories.flatMap((sub) => sub.subsubcategories || []),
    [subcategories]
  );

  const matchedSubSubcategory = useMemo(() => {
    if (!subsubcategoryIdentifier) return null;
    return (
      allSubSubcategories.find(
        (ss) =>
          String(ss._id) === subsubcategoryIdentifier ||
          String(ss.id) === subsubcategoryIdentifier ||
          ss.name?.trim?.().toLowerCase?.() ===
            subsubcategoryIdentifier.trim().toLowerCase()
      ) || null
    );
  }, [allSubSubcategories, subsubcategoryIdentifier]);

  const matchedSubcategory = useMemo(() => {
    if (!matchedSubSubcategory?.parentSubcategory) return null;
    return (
      subcategories.find(
        (sub) =>
          String(sub._id) === String(matchedSubSubcategory.parentSubcategory)
      ) || null
    );
  }, [matchedSubSubcategory, subcategories]);

  const matchedCategory = useMemo(() => {
    if (!matchedSubcategory?.parentCategory) return null;
    return (
      categories.find(
        (cat) => String(cat._id) === String(matchedSubcategory.parentCategory)
      ) || null
    );
  }, [matchedSubcategory, categories]);

  const getCategoryName = (cat) => {
    if (!cat) return "";
    if (typeof cat.name === "string") return cat.name;
    if (typeof cat.name === "object") return cat.name.th || cat.name.en || "";
    return "";
  };

  // 🔹 Filter products
  const filteredProducts = useMemo(() => {
    if (searchProduct) {
      return products.filter((p) =>
        p.title?.toLowerCase().includes(searchProduct.toLowerCase())
      );
    }
    // If a specific sub-subcategory is matched, filter by it.
    // Otherwise (no search and no matched sub-subcategory) return all products.
    if (matchedSubSubcategory) {
      return products.filter(
        (p) =>
          String(p.subSubcategoryId || p.subsubcategoryId || "") ===
          String(matchedSubSubcategory._id || matchedSubSubcategory.id)
      );
    }
    return products;
  }, [products, matchedSubSubcategory, searchProduct]);

  // 🔹 Sort products
  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts];
    if (sortOption === "priceLowHigh")
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortOption === "priceHighLow")
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    else sorted.sort((a, b) => (b.popularScore || 0) - (a.popularScore || 0));
    return sorted;
  }, [filteredProducts, sortOption]);

  // 🔹 Actions
  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    actionAddtoCart(product, 1);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // 🔹 Hero title fallback
  const heroTitle =
    getCategoryName(matchedSubSubcategory) ||
    getCategoryName(matchedSubcategory) ||
    getCategoryName(matchedCategory) ||
    "ทั้งหมด";

  return (
    <div className="bg-gray-50 min-h-screen font-sarabun text-gray-800">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              {heroTitle}
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-2xl">
              คัดสรรสินค้าคุณภาพ เลือกซื้อได้อย่างมั่นใจ — พบ{" "}
              {sortedProducts.length} ผลลัพธ์
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hidden md:inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 rounded-md shadow-sm hover:shadow-md text-sm"
            >
              <Funnel className="w-4 h-4 text-gray-600" /> ตัวกรอง
            </button>

            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none pr-8 pl-3 py-2 rounded-md border border-gray-200 bg-white text-sm shadow-sm"
                aria-label="Sort products"
              >
                <option value="popular">ความนิยม</option>
                <option value="priceLowHigh">ราคาต่ำ-สูง</option>
                <option value="priceHighLow">ราคาสูง-ต่ำ</option>
              </select>
              <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 py-12 px-4">
        {/* Sidebar */}
        <aside className="md:col-span-3 sticky top-24 self-start">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <SidebarFilter />
          </div>
        </aside>

        {/* Main */}
        <main className="md:col-span-9">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
            <ol className="flex space-x-2 flex-wrap items-center text-xs">
              <li>
                <Link to="/" className="text-blue-600 hover:underline">
                  หน้าหลัก
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link to="/shop" className="text-blue-600 hover:underline">
                  สินค้า
                </Link>
              </li>
              {matchedCategory && (
                <>
                  <li>/</li>
                  <li>
                    <Link
                      to={`/shop/subcategory?category=${encodeURIComponent(
                        getCategoryName(matchedCategory)
                      )}`}
                      className="text-blue-600 hover:underline"
                    >
                      {getCategoryName(matchedCategory)}
                    </Link>
                  </li>
                </>
              )}
              {matchedSubcategory && (
                <>
                  <li>/</li>
                  <li>
                    <Link
                      to={`/shop/subsubcategory?subcategory=${encodeURIComponent(
                        getCategoryName(matchedSubcategory)
                      )}`}
                      className="text-blue-600 hover:underline"
                    >
                      {getCategoryName(matchedSubcategory)}
                    </Link>
                  </li>
                </>
              )}
              {matchedSubSubcategory && (
                <>
                  <li>/</li>
                  <li>
                    <Link
                      to={`/shop/subsubcategory?subsubcategory=${encodeURIComponent(
                        matchedSubSubcategory._id ||
                          matchedSubSubcategory.id ||
                          getCategoryName(matchedSubSubcategory)
                      )}`}
                      className="text-gray-900 font-semibold hover:underline"
                    >
                      {getCategoryName(matchedSubSubcategory)}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>

          {/* Product Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <article
                  key={product.id || product._id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-lg overflow-hidden transition transform hover:-translate-y-1 cursor-pointer flex flex-col"
                  onClick={() =>
                    navigate(`/product/${product.id || product._id}`)
                  }
                >
                  <div className="relative w-full h-56 bg-gray-50 flex items-center justify-center">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <span className="text-6xl text-gray-300">📦</span>
                    )}

                    {/* Badge: discount or new */}

                    {/* Quick actions overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 opacity-0 group-hover:opacity-100 transition flex items-end justify-center p-4">
                      <div className="w-full flex justify-between gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded-md flex items-center justify-center gap-2 text-sm"
                        >
                          <ShoppingCart className="w-4 h-4" /> ใส่ตะกร้า
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id || product._id}`);
                          }}
                          className="ml-2 bg-white border border-gray-200 px-3 py-2 rounded-md flex items-center gap-2 text-sm"
                        >
                          <Eye className="w-4 h-4 text-gray-600" /> ดูสินค้า
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 text-md mb-1 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="mt-auto flex items-end justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-orange-700 font-bold text-lg">
                          ฿{numberFormat(product.price)}
                        </div>
                        {product.originalPrice && (
                          <div className="text-sm text-gray-400 line-through">
                            ฿{numberFormat(product.originalPrice)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            // Empty state
            <div className="text-center py-20 text-gray-500">
              <p className="mb-4 text-xl">😔 ไม่พบสินค้า</p>
              <p>ลองเลือกหมวดหมู่อื่น หรือปรับการค้นหา</p>
              <button
                onClick={() => navigate("/shop")}
                className="mt-6 px-6 py-3 bg-yellow-600 text-white rounded-md hover:bg-orange-700 font-semibold"
              >
                กลับไปหน้าหมวดหมู่
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Add to Cart */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
                <Dialog.Title className="text-lg font-medium text-gray-900 flex items-center justify-center gap-2">
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  สินค้าถูกเพิ่มลงตะกร้า
                </Dialog.Title>

                {selectedProduct && (
                  <div className="mt-4 flex items-center gap-4 border-t border-b py-4">
                    <img
                      src={
                        selectedProduct.images?.[0]?.url ||
                        "https://via.placeholder.com/60"
                      }
                      alt={selectedProduct.title}
                      className="w-16 h-16 object-contain border rounded-md"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 line-clamp-2">
                        {selectedProduct.title}
                      </p>
                      <p className="text-orange-600 font-bold text-lg">
                        ฿{numberFormat(selectedProduct.price)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate("/cart");
                    }}
                  >
                    <ShoppingCart className="h-5 w-5" /> ไปที่ตะกร้า
                  </button>
                  <button
                    className="flex-1 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
                    onClick={() => setIsModalOpen(false)}
                  >
                    เลือกซื้อสินค้าต่อ
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ProductListingPage;
