import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useEcomStore from "../store/ecom-store";
import {
  ChevronDown,
  ShoppingCart,
  Search,
  LogOut,
  History,
  PawPrint,
} from "lucide-react";
import { numberFormat } from "../utils/number";

const MainNav = () => {
  const carts = useEcomStore((s) => s.carts);
  const user = useEcomStore((s) => s.user);
  const logout = useEcomStore((s) => s.logout);
  const actionSearchFilters = useEcomStore((s) => s.actionSearchFilters);
  const categories = useEcomStore((s) => s.categories);
  const getCategory = useEcomStore((s) => s.getCategory);
  const products = useEcomStore((s) => s.products);
  const getProduct = useEcomStore((s) => s.getProduct);

  const [isOpen, setIsOpen] = useState(false);
  const [productDropdown, setProductDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filtered, setFiltered] = useState([]);

  const searchRef = useRef(null);
  const userDropdownRef = useRef(null);
  const productDropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCategory();
    getProduct();
  }, [getCategory, getProduct]);

  useEffect(() => {
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      setFiltered(
        products.filter(
          (p) =>
            (p.title && p.title.toLowerCase().includes(s)) ||
            (p.brand && p.brand.toLowerCase().includes(s))
        )
      );
      setShowDropdown(true);
    } else {
      setFiltered([]);
      setShowDropdown(false);
    }
  }, [search, products]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target)
      ) {
        setProductDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      actionSearchFilters({ query: search });
      navigate("/shop");
      setShowDropdown(false);
      setSearch("");
    }
  };

  // แก้ตรงนี้: navigate พร้อม query category เลย
  const handleCategory = (categoryName) => {
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
    setProductDropdown(false);
  };

  const handleSelectProduct = useCallback(
    (item) => {
      navigate(`/product/${item.id}`);
      setShowDropdown(false);
      setSearch("");
    },
    [navigate]
  );

  return (
    <nav className="bg-white/90 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo & Main Navigation */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-3xl font-extrabold text-gray-800 tracking-wider flex items-center gap-2 transform hover:scale-105 transition-transform duration-200"
            >
              <span className="text-yellow-500 text-4xl">
                <PawPrint className="inline-block" size={32} />
              </span>
              <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-transparent bg-clip-text">
                PETSHOP
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gray-100 text-white-800 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                หน้าแรก
              </NavLink>

              <div className="relative" ref={productDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProductDropdown((prev) => !prev)}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  สินค้าทั้งหมด
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${
                      productDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {productDropdown && categories.length > 0 && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in-up origin-top overflow-hidden">
                    {categories.map((cat, index) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategory(cat.name)}
                        className={`block w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-50 transition duration-150 font-medium ${
                          index === 0 ? "rounded-t-xl" : ""
                        } ${
                          index === categories.length - 1 ? "rounded-b-xl" : ""
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 flex justify-center px-4">
            <div className="relative w-full max-w-sm" ref={searchRef}>
              <form
                onSubmit={handleSearch}
                autoComplete="off"
                className="flex items-center bg-gray-50 rounded-full pl-5 pr-2 py-2 shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-yellow-300 transition-all duration-200"
              >
                <input
                  type="text"
                  placeholder="ค้นหาสินค้า..."
                  className="bg-transparent outline-none flex-grow text-gray-700 placeholder-gray-400 text-sm font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() =>
                    search && products.length > 0 && setShowDropdown(true)
                  }
                />
                <button
                  type="submit"
                  className="bg-yellow-400 text-white rounded-full p-2 ml-2 hover:bg-yellow-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  aria-label="Search"
                >
                  <Search size={18} strokeWidth={2.5} />
                </button>
              </form>
              {showDropdown && filtered.length > 0 && (
                <div className="absolute top-full mt-3 w-full max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-fade-in-down origin-top">
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectProduct(item)}
                      className="flex items-center w-full px-4 py-3 hover:bg-gray-50 transition text-left gap-3 border-b border-gray-100 last:border-b-0"
                    >
                      {item.images && item.images[0]?.url && (
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-md border border-gray-100 shadow-sm flex-shrink-0"
                        />
                      )}
                      <div className="flex flex-col items-start min-w-0 flex-grow">
                        <span className="text-base text-gray-900 truncate w-full font-semibold">
                          {item.brand ? item.brand : item.title}
                        </span>
                        <span className="text-xs text-gray-500 truncate w-full mt-0.5">
                          {item.title && item.brand
                            ? item.title
                            : item.description}
                        </span>
                        {item.price && (
                          <span className="text-sm text-green-600 font-bold mt-1">
                            {numberFormat(item.price)} ฿
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showDropdown && filtered.length === 0 && search.trim() && (
                <div className="absolute top-full mt-3 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-fade-in-down origin-top p-4 text-center text-gray-500">
                  ไม่พบสินค้าที่ค้นหา
                </div>
              )}
            </div>
          </div>

          {/* User & Cart */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div
                className="flex items-center space-x-4 relative"
                ref={userDropdownRef}
              >
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-full transition shadow-sm border border-gray-200 group"
                >
                  <img
                    className="w-9 h-9 rounded-full border-2 border-yellow-300 shadow-sm object-cover"
                    src="https://cdn-icons-png.flaticon.com/128/1326/1326377.png"
                    alt="user avatar"
                  />
                  <span className="font-semibold text-gray-700 hidden sm:block">
                    {user.email || "User"}
                  </span>
                  <ChevronDown
                    className={`text-gray-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in-down origin-top">
                    <Link
                      to="/user/history"
                      className="flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-gray-50 rounded-t-xl transition duration-150 font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      <History size={20} className="text-gray-500" />
                      ประวัติการสั่งซื้อ
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-6 py-4 text-red-600 hover:bg-red-50 rounded-b-xl transition duration-150 font-medium"
                    >
                      <LogOut size={20} className="text-red-500" />
                      ออกจากระบบ
                    </button>
                  </div>
                )}
                <NavLink
                  to="/cart"
                  className="relative flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-white rounded-full p-3 transition shadow-md border border-yellow-300"
                  title="ตะกร้าสินค้า"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {carts.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-md border-2 border-white">
                      {carts.length}
                    </span>
                  )}
                </NavLink>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-yellow-100 text-yellow-800 shadow-sm"
                        : "text-gray-600 hover:bg-yellow-50 hover:text-gray-900"
                    }`
                  }
                >
                  ลงทะเบียน
                </NavLink>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-yellow-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  เข้าสู่ระบบ
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
