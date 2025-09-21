// src/layouts/Layout.jsx
import React, { useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import MainNav from "../components/MainNav";
import { Info } from "lucide-react";

// ================= Footer =================
const Footer = () => {
  // Use client-side Link for internal navigation to preserve state and let route components load their data
  const links = [
    { label: "หน้าแรก", href: "/" },
    { label: "ร้านค้า", href: "/shop" },
    { label: "บทความน่ารู้", href: "/articles" },
    { label: "เกี่ยวกับ", href: "#" },
    { label: "ติดต่อเรา", href: "#" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 mt-16">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {/* Left: Logo & About */}
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide">
            PetShop
          </h2>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            เราใส่ใจสัตว์เลี้ยงของคุณเหมือนคนในครอบครัว
            มั่นใจได้ในคุณภาพสินค้าและบริการของเรา
          </p>
          <p className="text-xs text-gray-500 mt-5">
            &copy; {new Date().getFullYear()} PetShopOnline. All rights
            reserved.
          </p>
        </div>

        {/* Center: Important Links */}
        <div className="text-center md:text-left">
          <h4 className="text-lg font-semibold text-white mb-4">ลิงก์สำคัญ</h4>
          <ul className="space-y-2 text-sm">
            {links.map((link, i) => (
              <li key={i}>
                {link.href.startsWith("/") ? (
                  <Link
                    to={link.href}
                    className="flex items-center gap-2 hover:text-pink-400 transition-colors duration-200 justify-center md:justify-start"
                  >
                    <Info size={16} /> {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="flex items-center gap-2 hover:text-pink-400 transition-colors duration-200 justify-center md:justify-start"
                  >
                    <Info size={16} /> {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Contact Info */}
        <div className="text-center md:text-right">
          <h4 className="text-lg font-semibold text-white mb-4">
            ช่องทางการติดต่อ
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              Email:{" "}
              <span className="text-gray-300">support@petshoponline.com</span>
            </li>
            <li>
              โทร: <span className="text-gray-300">02-123-4567</span>
            </li>
            <li>
              LINE: <span className="text-gray-300">@petshop</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

// ================= Layout =================
const Layout = () => {
  const location = useLocation();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <MainNav />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
