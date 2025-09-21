
import React, { useState, useRef, useEffect } from "react";
import { Search } from "react-feather";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useEcomStore from "../../store/ecom-store";

const SidebarFilter = () => {
  const navigate = useNavigate();
  const products = useEcomStore((state) => state.products || []);
  const categories = useEcomStore((state) => state.categories || []);
  const subcategories = useEcomStore((state) => state.subcategories || []);
  const brands = useEcomStore((state) => state.brands || [])
    .slice()
    .sort((a, b) => {
      const getName = (brand) => {
        if (typeof brand.name === "object" && brand.name !== null) {
          return brand.name.th || brand.name.en || "";
        }
        return brand.name || "";
      };
      return getName(a).localeCompare(getName(b), "th", {
        sensitivity: "base",
      });
    });
  const actionSearchFilters = useEcomStore(
    (state) => state.actionSearchFilters
  );

  // --- State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  const [expandedCategoryIds, setExpandedCategoryIds] = useState([]);
  const [expandedSubcategoryIds, setExpandedSubcategoryIds] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
  const [selectedBrandId, setSelectedBrandId] = useState("");

  // --- Search ---
  const filteredProducts = searchQuery
    ? products.filter((item) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const numberFormat = (num) =>
    num?.toLocaleString("th-TH", { minimumFractionDigits: 0 });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Show results immediately on submit (accessibility/keyboard users)
    setShowSearchResults(!!searchQuery && filteredProducts.length > 0);
  };

  // Debounced real-time search: show results while typing but debounce to reduce work
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery && products.length > 0) {
        setShowSearchResults(
          products.some((item) =>
            item.title?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } else {
        setShowSearchResults(false);
      }
    }, 250); // 250ms debounce

    return () => clearTimeout(handler);
  }, [searchQuery, products]);

  const handleProductSelect = (item) => {
    setShowSearchResults(false);
    setSearchQuery("");
    const prodId = item._id || item.id;
    if (prodId) {
      navigate(`/product/${encodeURIComponent(prodId)}`);
    } else {
      // fallback to search listing if no id available
      navigate(
        `/shop/productListingPage?product=${encodeURIComponent(item.title)}`
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Category & Subcategory ---
  const toggleCategory = (catId) => {
    setExpandedCategoryIds((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId]
    );
  };

  const toggleSubcategory = (subId) => {
    setExpandedSubcategoryIds((prev) =>
      prev.includes(subId)
        ? prev.filter((id) => id !== subId)
        : [...prev, subId]
    );
  };

  const getSubcategoriesByCategory = (catId) =>
    subcategories.filter(
      (sub) =>
        String(sub.categoryId) === String(catId) ||
        String(sub.categoryId) === String(catId._id)
    );

  const getSubsubcategoriesBySubcategory = (subId) => {
    const sub = subcategories.find(
      (sc) => String(sc._id || sc.id) === String(subId)
    );
    return sub?.subsubcategories || [];
  };

  const handleSelectCategory = (catId) => {
    if (selectedCategoryId === catId) return;
    setSelectedCategoryId(catId);
    setSelectedSubcategoryId(null);
    actionSearchFilters({ category: [Number(catId)] });

    const catObj = categories.find(
      (c) => String(c._id || c.id) === String(catId)
    );
    const catName =
      catObj &&
      (typeof catObj.name === "object"
        ? catObj.name.th || catObj.name.en
        : catObj.name);
    navigate({
      pathname: "/shop/subcategory",
      search: new URLSearchParams({ category: catName || catId }).toString(),
    });
  };

  const handleSelectSubcategory = (subId) => {
    setSelectedSubcategoryId(subId);
    actionSearchFilters({
      category: selectedCategoryId ? [Number(selectedCategoryId)] : [],
      subcategory: [Number(subId)],
    });

    const subObj = subcategories.find(
      (s) => String(s._id || s.id) === String(subId)
    );
    const subName =
      subObj &&
      (typeof subObj.name === "object"
        ? subObj.name.th || subObj.name.en
        : subObj.name);
    const catObj = categories.find(
      (c) => String(c._id || c.id) === String(selectedCategoryId)
    );
    const catName =
      catObj &&
      (typeof catObj.name === "object"
        ? catObj.name.th || catObj.name.en
        : catObj.name);
    navigate({
      pathname: "/shop/subsubcategory",
      search: new URLSearchParams({
        category: catName || selectedCategoryId,
        subcategory: subName || subId,
      }).toString(),
    });
  };

  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    setSelectedBrandId(brandId);

    const brandObj = brands.find(
      (b) => String(b._id || b.id) === String(brandId)
    );
    const brandName = brandObj
      ? typeof brandObj.name === "object"
        ? brandObj.name.th || brandObj.name.en || brandId
        : brandObj.name
      : brandId;

    navigate({
      pathname: "/shop/brand",
      search: new URLSearchParams({ brand: brandName }).toString(),
    });
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-md sticky top-24 space-y-6">
      {/* Search */}
      <div ref={searchRef}>
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center bg-gray-100 rounded-xl px-4 py-2 shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-yellow-400 transition"
          autoComplete="off"
        >
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            className="flex-grow outline-none bg-transparent text-gray-700 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() =>
              searchQuery && products.length > 0 && setShowSearchResults(true)
            }
          />
          <button
            type="submit"
            aria-label="ค้นหา"
            className="ml-2 p-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white transition"
          >
            <Search size={18} strokeWidth={2.5} />
          </button>
        </form>

        {showSearchResults && filteredProducts.length > 0 && (
          <div className="absolute mt-2 w-full max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50">
            {filteredProducts.map((item) => (
              <button
                key={item.id}
                onClick={() => handleProductSelect(item)}
                className="flex items-center w-full px-4 py-3 hover:bg-gray-50 gap-3 border-b border-gray-100 last:border-b-0 transition"
              >
                {item.images?.[0]?.url && (
                  <img
                    src={item.images[0].url}
                    alt={item.title}
                    className="w-14 h-14 object-cover rounded-md border border-gray-200 flex-shrink-0"
                  />
                )}
                <div className="text-left flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 line-clamp-1">
                    {item.title}
                  </div>
                  {item.brand && (
                    <div className="text-xs text-gray-500 truncate">
                      แบรนด์:{" "}
                      {typeof item.brand === "object"
                        ? item.brand.name
                        : item.brand}
                    </div>
                  )}
                  <div className="text-base text-green-600 font-bold mt-1">
                    {numberFormat(item.price)} ฿
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-800">หมวดหมู่สินค้า</h3>
        <ul className="space-y-1">
          {categories.map((cat) => {
            const catId = cat._id || cat.id;
            const isExpanded = expandedCategoryIds.includes(catId);
            const catName =
              typeof cat.name === "object"
                ? cat.name.th || cat.name.en || "ไม่ระบุชื่อ"
                : cat.name;
            const catSubcategories = getSubcategoriesByCategory(catId);

            return (
              <li key={catId}>
                <button
                  type="button"
                  onClick={() => handleSelectCategory(catId)}
                  className={`flex justify-between items-center w-full px-3 py-2 rounded hover:bg-gray-100 transition ${
                    selectedCategoryId === catId
                      ? "bg-blue-100 text-blue-700 font-bold"
                      : "text-gray-700"
                  }`}
                >
                  <span>{catName}</span>
                  {catSubcategories.length > 0 && (
                    <span
                      className="cursor-pointer ml-2 transition-transform duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(catId);
                      }}
                    >
                      {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                  )}
                </button>

                {/* Subcategories */}
                {isExpanded && catSubcategories.length > 0 && (
                  <ul className="pl-5 mt-1 space-y-1">
                    {catSubcategories.map((sub) => {
                      const subId = sub._id || sub.id;
                      const isSubExpanded =
                        expandedSubcategoryIds.includes(subId);
                      const subName =
                        typeof sub.name === "object"
                          ? sub.name.th || sub.name.en || "ไม่ระบุชื่อ"
                          : sub.name;
                      const subsubcategories =
                        getSubsubcategoriesBySubcategory(subId);

                      return (
                        <li key={subId}>
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleSelectSubcategory(subId)}
                              className="text-left flex-1 hover:text-blue-600 transition"
                            >
                              {subName}
                            </button>
                            {subsubcategories.length > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleSubcategory(subId)}
                                className="ml-1 transition-transform duration-200"
                              >
                                {isSubExpanded ? (
                                  <FiChevronUp />
                                ) : (
                                  <FiChevronDown />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Subsubcategory */}
                          {isSubExpanded && subsubcategories.length > 0 && (
                            <ul className="pl-4 mt-1 space-y-1">
                              {subsubcategories.map((subsub) => {
                                const subsubId = subsub._id || subsub.id;
                                const subsubName =
                                  typeof subsub.name === "object"
                                    ? subsub.name.th ||
                                      subsub.name.en ||
                                      "ไม่ระบุชื่อ"
                                    : subsub.name;
                                return (
                                  <li key={subsubId}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        actionSearchFilters({
                                          category: selectedCategoryId
                                            ? [Number(selectedCategoryId)]
                                            : [],
                                          subcategory: subId
                                            ? [Number(subId)]
                                            : [],
                                          subsubcategory: subsubId
                                            ? [Number(subsubId)]
                                            : [],
                                        });

                                        const subObj = subcategories.find(
                                          (s) =>
                                            String(s._id || s.id) ===
                                            String(subId)
                                        );
                                        const subName =
                                          subObj &&
                                          (typeof subObj.name === "object"
                                            ? subObj.name.th || subObj.name.en
                                            : subObj.name);
                                        const catObj = categories.find(
                                          (c) =>
                                            String(c._id || c.id) ===
                                            String(selectedCategoryId)
                                        );
                                        const catName =
                                          catObj &&
                                          (typeof catObj.name === "object"
                                            ? catObj.name.th || catObj.name.en
                                            : catObj.name);

                                        navigate({
                                          pathname: "/shop/productListingPage",
                                          search: new URLSearchParams({
                                            category:
                                              catName || selectedCategoryId,
                                            subcategory: subName || subId,
                                            subsubcategory:
                                              subsubName || subsubId,
                                          }).toString(),
                                        });
                                      }}
                                      className="text-left hover:text-blue-600 transition"
                                    >
                                      {subsubName}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Brand Filter */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-800">
          ค้นหาสินค้าด้วยแบรนด์
        </h3>
        <select
          className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-yellow-400 transition"
          value={selectedBrandId}
          onChange={handleBrandChange}
        >
          <option value="">-- เลือกแบรนด์ --</option>
          {brands.map((brand) => {
            const brandName =
              typeof brand.name === "object"
                ? brand.name.th || brand.name.en || "ไม่ระบุชื่อ"
                : brand.name;
            return (
              <option key={brand._id || brand.id} value={brand._id || brand.id}>
                {brandName}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default SidebarFilter;
