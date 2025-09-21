import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useEcomStore from "../store/ecom-store";
import {
  ChevronDown,
  ShoppingCart,
  Search,
  LogOut,
  History,
  PawPrint,
  X,
} from "lucide-react";
import { numberFormat } from "../utils/number";
import CartCard from "../components/card/CartCard";
import { getOrders } from "../api/user";

const MainNav = () => {
  const carts = useEcomStore((s) => s.carts);
  const user = useEcomStore((s) => s.user);
  const logout = useEcomStore((s) => s.logout);
  const actionSearchFilters = useEcomStore((s) => s.actionSearchFilters);
  const getCategory = useEcomStore((s) => s.getCategory);
  const products = useEcomStore((s) => s.products);
  const getProduct = useEcomStore((s) => s.getProduct);
  const profile = useEcomStore((s) => s.profile);
  const fetchProfile = useEcomStore((s) => s.fetchProfile);
  const token = useEcomStore((s) => s.token);

  const cartTotal = useMemo(
    () => (carts || []).reduce((s, it) => s + (it.count || 0), 0),
    [carts]
  );

  // review badge state: count of products pending review
  const [reviewCount, setReviewCount] = useState(0);

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  // use global store for cart sidebar so other components (CartCard) can close it
  const isCartSidebarOpen = useEcomStore((s) => s.isCartSidebarOpen);
  const actionOpenCartSidebar = useEcomStore((s) => s.actionOpenCartSidebar);
  const actionCloseCartSidebar = useEcomStore((s) => s.actionCloseCartSidebar);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();
  // const location = useLocation(); // not used currently

  useEffect(() => {
    getCategory();
    getProduct();
    if (token) fetchProfile();
  }, [getCategory, getProduct, token, fetchProfile]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const s = searchQuery.trim().toLowerCase();
      setFilteredProducts(
        products.filter((p) => {
          const titleMatch =
            p.title &&
            typeof p.title === "string" &&
            p.title.toLowerCase().includes(s);
          let brandMatch = false;
          if (typeof p.brand === "string") {
            brandMatch = p.brand.toLowerCase().includes(s);
          } else if (p.brand && typeof p.brand === "object" && p.brand.name) {
            brandMatch = String(p.brand.name).toLowerCase().includes(s);
          }
          const descMatch =
            p.description &&
            typeof p.description === "string" &&
            p.description.toLowerCase().includes(s);
          return titleMatch || brandMatch || descMatch;
        })
      );
      setShowSearchResults(true);
    } else {
      setFilteredProducts([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    let mounted = true;
    const fetchReviewCount = async () => {
      if (!token) {
        if (mounted) setReviewCount(0);
        return;
      }
      try {
        const res = await getOrders(token);
        const orders = res?.data?.orders || [];
        const twoWeeks = 14 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        let dismissed = [];
        let reviewed = [];
        try {
          dismissed = JSON.parse(
            localStorage.getItem("dismissedReviewReminders") || "[]"
          );
        } catch {
          dismissed = [];
        }
        try {
          const raw = JSON.parse(
            localStorage.getItem("reviewedProducts") || "null"
          );
          if (!raw) reviewed = [];
          else if (Array.isArray(raw)) reviewed = raw.map(String);
          else if (typeof raw === "object") {
            // keys may be "<productId>" or "<productId>:<variantId>"
            reviewed = Object.keys(raw).map(String);
          } else reviewed = [];
        } catch {
          reviewed = [];
        }

        let count = 0;
        orders.forEach((o) => {
          if (o.orderStatus !== "DELIVERED") return;
          const updated = new Date(o.updatedAt).getTime();
          if (isNaN(updated)) return;
          if (now - updated > twoWeeks) return;
          const oid = o._id || o.id || o.orderId;
          if (dismissed.includes(oid)) return;
          (o.products || []).forEach((p) => {
            const pid = String(p.product?._id || p.product?.id || "");
            if (!pid) {
              count += 1;
            } else {
              const has =
                reviewed.includes(pid) ||
                reviewed.some((k) => k.startsWith(pid + ":"));
              if (!has) count += 1;
            }
          });
        });

        if (mounted) setReviewCount(count);
      } catch {
        if (mounted) setReviewCount(0);
      }
    };

    fetchReviewCount();
    return () => {
      mounted = false;
    };
  }, [token]);

  // Accessibility + focus management for cart sidebar
  const sidebarRef = useRef(null);
  useEffect(() => {
    let previousActive = null;
    const onKey = (e) => {
      if (!isCartSidebarOpen) return;
      if (e.key === "Escape") actionCloseCartSidebar();
    };

    if (isCartSidebarOpen) {
      previousActive = document.activeElement;
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden"; // lock scroll
      window.addEventListener("keydown", onKey);

      // focus close button inside sidebar if present
      setTimeout(() => {
        const closeBtn = sidebarRef.current?.querySelector(
          "button[aria-label='ปิดตะกร้าสินค้า']"
        );
        if (closeBtn) closeBtn.focus();
      }, 60);

      return () => {
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = prevOverflow;
        try {
          if (previousActive && typeof previousActive.focus === "function")
            previousActive.focus();
        } catch {
          void 0; // ignore focus restore errors
        }
      };
    }
    return () => {};
  }, [isCartSidebarOpen, actionCloseCartSidebar]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      actionSearchFilters({ query: searchQuery });
      navigate("/shop");
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  const handleProductSelect = useCallback(
    (item) => {
      navigate(`/product/${item.id}`);
      setShowSearchResults(false);
      setSearchQuery("");
    },
    [navigate]
  );

  return (
    <>
      {/* Professional Navbar */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen((s) => !s)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                aria-label={mobileMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
              >
                {mobileMenuOpen ? (
                  <X size={22} />
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>

              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-2 text-2xl font-extrabold text-gray-800 tracking-wider flex-shrink-0"
              >
                <PawPrint className="text-yellow-500" size={32} />
                <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-transparent bg-clip-text">
                  PETSHOP
                </span>
              </Link>

              {/* Desktop navigation */}
              <div className="hidden md:flex items-center gap-1 lg:gap-5 ml-6">
                {[
                  "หน้าแรก",
                  "สินค้า",
                  "บทความ",
                  "เกี่ยวกับ",
                  "ติดต่อเรา",
                  "ตรวจสอบพัสดุ",
                ].map((label, idx) => {
                  const paths = [
                    "/",
                    "/shop",
                    "/articles",
                    "/about",
                    "/contact",
                    "/track",
                  ];
                  return (
                    <NavLink
                      key={idx}
                      to={paths[idx]}
                      className={({ isActive }) =>
                        `text-base md:text-lg font-medium px-3 py-2 rounded-md transition-colors duration-200 whitespace-nowrap ${
                          isActive
                            ? "text-yellow-600 border-b-2 border-yellow-600"
                            : "text-gray-700 hover:text-yellow-600 hover:bg-gray-50"
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Search - keep existing search UI (compact on mobile) */}
            <div className="flex-1 flex justify-center px-4 md:px-6 lg:px-8">
              {/* ...existing search form and dropdown... */}
              {/* hide expanded search on small screens to avoid overlap */}
              <div
                className="relative w-full max-w-lg md:max-w-xl hidden sm:block"
                ref={searchRef}
              >
                <form
                  onSubmit={handleSearchSubmit}
                  autoComplete="off"
                  className="flex items-center bg-gray-50 rounded-xl pl-4 pr-2 shadow-inner border border-gray-200 focus-within:ring-2 focus-within:ring-yellow-300 transition-all"
                >
                  <input
                    type="text"
                    placeholder="ค้นหาสินค้า..."
                    className="bg-transparent outline-none flex-grow text-gray-700 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() =>
                      searchQuery &&
                      products.length > 0 &&
                      setShowSearchResults(true)
                    }
                  />
                  <button
                    type="submit"
                    aria-label="ค้นหา"
                    className="bg-yellow-500 text-white rounded-full p-2 ml-2 hover:bg-yellow-600 transition-shadow shadow-md"
                  >
                    <Search size={16} strokeWidth={2.5} />
                  </button>
                </form>

                {showSearchResults && filteredProducts.length > 0 && (
                  <div className="absolute top-full mt-3 w-full max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-slideDown">
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
                              {typeof item.brand === "object" && item.brand
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
            </div>

            {/* User & Cart area (keep existing actions) */}
            <div className="flex items-center gap-4 md:gap-6 ml-auto">
              {/* Cart */}
              <button
                onClick={() => actionOpenCartSidebar()}
                className="relative flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-3 transition-shadow shadow-md border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                title="ตะกร้าสินค้า"
                aria-label="ตะกร้าสินค้า"
              >
                <ShoppingCart className="w-6 h-6" />
                {/** show total quantity (sum of counts) rather than line items */}
                {cartTotal > 0 ? (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 border-2 border-white min-w-[24px] text-center animate-bounce">
                    {cartTotal > 99 ? "99+" : cartTotal}
                  </span>
                ) : null}
              </button>

              {/* User */}
              {user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-white hover:bg-gray-100 transition shadow-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    aria-label="บัญชีผู้ใช้"
                  >
                    <img
                      className="w-10 h-10 rounded-full ring-2 ring-yellow-400 object-cover"
                      src={
                        profile?.picture ||
                        user?.picture ||
                        "https://cdn-icons-png.flaticon.com/128/1326/1326377.png"
                      }
                      alt="user avatar"
                    />
                    <div className="hidden sm:flex flex-col items-start text-sm">
                      <span className="font-semibold text-gray-800 truncate max-w-[120px]">
                        {profile?.name || user?.email || "User"}
                      </span>
                      <span className="text-xs text-gray-500">บัญชีของฉัน</span>
                    </div>
                    <ChevronDown
                      className={`text-gray-500 transition-transform duration-300 ${
                        isUserDropdownOpen ? "rotate-180" : ""
                      }`}
                      size={20}
                    />
                  </button>

                  {/* User Dropdown */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-white shadow-xl rounded-xl overflow-hidden z-50 border border-gray-100 animate-slideDown divide-y divide-gray-100">
                      {/* Profile Info */}
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-yellow-400">
                            <img
                              src={
                                profile?.picture ||
                                user?.picture ||
                                "https://cdn-icons-png.flaticon.com/128/1326/1326377.png"
                              }
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-sm min-w-0">
                            <div className="font-semibold text-gray-800 truncate">
                              {profile?.name || user?.email}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-600 space-y-1">
                          {profile?.telephone && (
                            <div>📞 {profile.telephone}</div>
                          )}
                          {profile?.address && (
                            <div className="truncate">📍 {profile.address}</div>
                          )}
                        </div>
                      </div>

                      {/* Menu */}
                      <Link
                        to="/user/history"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-yellow-50 transition font-medium relative"
                      >
                        <History size={18} className="text-gray-500" />
                        <span className="flex items-center gap-2">
                          <span>ประวัติการสั่งซื้อ</span>
                          {reviewCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center bg-red-600 text-white text-xs font-bold rounded-full px-2 h-6 min-w-[24px]">
                              {reviewCount > 99 ? "99+" : reviewCount}
                            </span>
                          )}
                        </span>
                      </Link>
                      <Link
                        to="/user/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-yellow-50 transition font-medium"
                      >
                        {/* ใช้ Settings icon จะเหมาะกว่า */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.591 1.01c1.519-.88 3.392.994 2.512 2.512a1.724 1.724 0 001.01 2.591c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.01 2.591c.88 1.519-.994 3.392-2.512 2.512a1.724 1.724 0 00-2.591 1.01c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.591-1.01c-1.519.88-3.392-.994-2.512-2.512a1.724 1.724 0 00-1.01-2.591c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.01-2.591c-.88-1.519.994-3.392 2.512-2.512.99.574 2.165.166 2.591-1.01z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        ตั้งค่าบัญชี
                      </Link>

                      {/* Logout */}
                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                          navigate("/");
                        }}
                        className="flex items-center gap-3 w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition font-medium"
                      >
                        <LogOut size={18} className="text-red-500" />
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3 ml-4">
                  <NavLink
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-yellow-600 hover:bg-gray-50 rounded-lg transition whitespace-nowrap"
                  >
                    เข้าสู่ระบบ
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="px-5 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition whitespace-nowrap"
                  >
                    ลงทะเบียน
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile expanded panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-md">
            <div className="px-4 py-4 space-y-3">
              <nav className="flex flex-col space-y-1">
                {["หน้าแรก", "สินค้า", "บทความ", "เกี่ยวกับ", "ติดต่อเรา"].map(
                  (label, idx) => {
                    const paths = [
                      "/",
                      "/shop",
                      "/articles",
                      "/about",
                      "/contact",
                    ];
                    return (
                      <NavLink
                        key={idx}
                        to={paths[idx]}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 ${
                            isActive
                              ? "bg-yellow-50 text-yellow-600 font-semibold"
                              : ""
                          }`
                        }
                      >
                        {label}
                      </NavLink>
                    );
                  }
                )}
              </nav>

              {/* compact search inside mobile menu */}
              <div>
                <form
                  onSubmit={(e) => {
                    handleSearchSubmit(e);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center bg-gray-50 rounded-xl pl-3 pr-2 border border-gray-200"
                >
                  <input
                    className="bg-transparent outline-none flex-grow text-gray-700 text-sm py-2"
                    placeholder="ค้นหาสินค้า..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="p-2 text-white bg-yellow-500 rounded-full ml-2"
                  >
                    <Search size={14} />
                  </button>
                </form>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                {user ? (
                  <>
                    <Link
                      to="/user/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-gray-700"
                    >
                      โปรไฟล์
                    </Link>
                    <button
                      onClick={() => {
                        logout && logout();
                        setMobileMenuOpen(false);
                        navigate("/");
                      }}
                      className="text-sm font-medium text-white bg-red-500 px-3 py-2 rounded-md"
                    >
                      ออกจากระบบ
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-gray-700"
                    >
                      เข้าสู่ระบบ
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-white bg-yellow-500 px-3 py-2 rounded-md"
                    >
                      ลงทะเบียน
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Cart Sidebar */}
      {isCartSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-end items-start pt-20 z-[9999] animate-fadeIn p-4 md:p-6"
          onClick={() => actionCloseCartSidebar()}
          role="presentation"
          aria-hidden={isCartSidebarOpen ? "false" : "true"}
        >
          <div
            ref={sidebarRef}
            className="w-full max-w-md bg-white h-full p-6 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out translate-x-0 mr-4 md:mr-8 rounded-l-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="ตะกร้าสินค้า"
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">ตะกร้าสินค้า</h2>
              <button
                className="text-gray-500 hover:text-gray-900 transition p-2 -mr-2 rounded-full hover:scale-110"
                onClick={() => actionCloseCartSidebar()}
                aria-label="ปิดตะกร้าสินค้า"
              >
                <X size={24} />
              </button>
            </div>
            <CartCard />
          </div>
        </div>
      )}
    </>
  );
};

export default MainNav;
