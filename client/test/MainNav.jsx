import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useEcomStore from "../store/ecom-store";
import { ChevronDown, ShoppingCart, Search, User, LogOut, History, PawPrint } from "lucide-react";
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
  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  const toggleDropdown = () => setIsOpen((prev) => !prev);
  // ฟังก์ชันค้นหา
  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      actionSearchFilters({ query: search });
      navigate("/shop");
      setShowDropdown(false);
      setSearch("");
    }
  };
  // ฟังก์ชันเลือกประเภท
  const handleCategory = (categoryName) => {
    const cat = categories.find((c) => c.name === categoryName);
    if (cat) {
      actionSearchFilters({ category: [cat.id] });
      navigate("/shop");
      setProductDropdown(false);
    }
  };
  // ฟังก์ชันเมื่อคลิกผลลัพธ์ dropdown ให้ไปหน้ารายละเอียดสินค้า
  const handleSelectProduct = useCallback(
    (item) => {
      navigate(`/product/${item.id}`);
      setShowDropdown(false);
      setSearch("");
    },
    [navigate]
  );

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-200 transition-all">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-20 items-center">
          {/* Logo & Menu */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-2xl font-extrabold text-gray-700 tracking-widest flex items-center gap-2 drop-shadow hover:scale-105 transition-transform"
            >
              <span className="text-yellow-300 text-3xl">
                <PawPrint className="inline-block" size={30} />
              </span>
              PETSHOP
            </Link>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition-all ${
                  isActive
                    ? "bg-gray-100 text-gray-800 shadow"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              หน้าแรก
            </NavLink>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  actionSearchFilters({}); // เคลียร์ filter, แสดงสินค้าทั้งหมด
                  navigate("/shop");
                  setProductDropdown(false); // ปิด dropdown เผื่อเปิดค้างไว้
                }}
                className="px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                สินค้าทั้งหมด
                <ChevronDown
                  size={18}
                  onClick={(e) => {
                    e.stopPropagation(); // ป้องกัน event ซ้อนกัน
                    setProductDropdown((prev) => !prev);
                  }}
                  className="cursor-pointer"
                />
              </button>

              {productDropdown && (
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-fade-in">
                  <button
                    className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-50 rounded-t-xl transition font-medium"
                    onClick={() => handleCategory("อาหารสุนัข")}
                  >
                    อาหารสุนัข
                  </button>
                  <button
                    className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-50 transition font-medium"
                    onClick={() => handleCategory("อาหารแมว")}
                  >
                    อาหารแมว
                  </button>
                  <button
                    className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-50 transition font-medium"
                    onClick={() => handleCategory("ผลิตภัณฑ์สินค้า ฯ")}
                  >
                    ผลิตภัณฑ์อื่น ๆ
                  </button>
                </div>
              )}
            </div>

            {/* ช่องค้นหา + dropdown */}
            <div className="ml-6 relative" ref={searchRef}>
              <form
                onSubmit={handleSearch}
                autoComplete="off"
                className="flex items-center bg-gray-50 rounded-lg px-4 py-2 shadow border border-gray-200 focus-within:ring-2 focus-within:ring-gray-200 transition"
              >
                <input
                  type="text"
                  placeholder="ค้นหาสินค้า..."
                  className="bg-transparent outline-none px-2 py-1 text-gray-700 placeholder-gray-400 w-36 md:w-56 font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => search && setShowDropdown(true)}
                />
                <button
                  type="submit"
                  className="text-gray-400 hover:text-gray-700 p-1"
                >
                  <Search size={20} />
                </button>
              </form>
              {/* Dropdown ผลลัพธ์ */}
              {showDropdown && filtered.length > 0 && (
                <div className="absolute left-0 mt-2 w-full max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in">
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectProduct(item)}
                      className="flex items-center w-full px-3 py-3 hover:bg-gray-50 transition text-left gap-3"
                    >
                      {item.images && item.images[0]?.url && (
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200 shadow"
                        />
                      )}
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-base text-gray-900 truncate max-w-[180px] font-semibold">
                          {item.brand
                            ? `แบรนด์: ${item.brand}`
                            : `สินค้า: ${item.title}`}
                        </span>
                        <span className="text-xs text-gray-500 truncate max-w-[180px]">
                          {item.title && !item.brand
                            ? item.title
                            : item.description}
                        </span>
                        {item.price && (
                          <span className="text-xs text-green-600 font-bold mt-0.5">
                            {numberFormat(item.price)} ฿
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User & Cart */}
          {user ? (
            <div className="flex items-center gap-5 relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition shadow border border-gray-200"
              >
                <img
                  className="w-9 h-9 rounded-full border-2 border-yellow-200 shadow"
                  src="https://cdn-icons-png.flaticon.com/128/1326/1326377.png"
                  alt="user"
                />
                <span className="font-semibold text-gray-700">
                  {user.email || "User"}
                </span>
                <ChevronDown className="text-gray-400" />
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-16 w-52 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-fade-in">
                  <Link
                    to="/user/history"
                    className="flex items-center gap-2 px-6 py-4 text-gray-700 hover:bg-gray-50 rounded-t-xl transition font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <History size={18} /> ประวัติการสั่งซื้อ
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-6 py-4 text-red-600 hover:bg-red-50 rounded-b-xl transition font-medium"
                  >
                    <LogOut size={18} /> ออกจากระบบ
                  </button>
                </div>
              )}
              <NavLink
                to="/cart"
                className="relative flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full p-3 transition shadow border border-gray-200"
                title="ตะกร้าสินค้า"
              >
                <ShoppingCart className="w-6 h-6" />
                {carts.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow border-2 border-white">
                    {carts.length}
                  </span>
                )}
              </NavLink>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-semibold transition-all ${
                    isActive
                      ? "bg-gray-100 text-gray-900 shadow"
                      : "text-gray-600 hover:bg-yellow-50 hover:text-gray-900"
                  }`
                }
              >
                ลงทะเบียน
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-semibold transition-all ${
                    isActive
                      ? "bg-gray-100 text-gray-800 shadow"
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
    </nav>
  );
};

export default MainNav;
