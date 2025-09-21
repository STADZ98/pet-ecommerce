import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users2,
  Layers3,
  ReceiptText,
  LogOut,
  UserRound,
  Menu,
  X,
  PackagePlus,
  AlertTriangle, // Icon สำหรับ Modal: Warning
  CheckCircle, // Icon สำหรับ Modal: Success
  Info, // Icon สำหรับ Modal: Info
  XCircle, // Icon สำหรับ Modal: Error (เพิ่มเข้ามา)
} from "lucide-react";
import { createPortal } from "react-dom"; // Import createPortal
import useEcomStore from "../../store/ecom-store";
import { uploadProfilePicture } from "../../api/user";

// สีคลุมโทนสำหรับ Sidebar
const SIDEBAR_BG = "bg-white"; // Sidebar พื้นหลังขาว

// --- Component: ModernModal ---
// Modal ที่ทันสมัยและยืดหยุ่น พร้อม Animation และการปรับแต่งตามประเภท
const ModernModal = ({
  isOpen,
  onClose,
  title,
  children,
  type = "info", // ประเภทของ Modal: 'info', 'success', 'warning', 'error'
  primaryButtonText, // ข้อความสำหรับปุ่มหลัก (เช่น "ยืนยัน", "ตกลง")
  onPrimaryButtonClick, // Callback เมื่อคลิกปุ่มหลัก
  secondaryButtonText, // ข้อความสำหรับปุ่มรอง (เช่น "ยกเลิก")
  onSecondaryButtonClick, // Callback เมื่อคลิกปุ่มรอง
}) => {
  const modalRef = useRef(null);

  // Effect สำหรับการปิด Modal ด้วย Escape Key และ Click Outside
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (event) => {
      // ปิด Modal ถ้าคลิกนอก Modal Content (ยกเว้น Modal ตัวมันเอง)
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      // ป้องกันการ scroll ของ body เมื่อ Modal เปิดอยู่ เพื่อประสบการณ์ผู้ใช้ที่ดีขึ้น
      document.body.style.overflow = "hidden";
    } else {
      // คืนค่า overflow เมื่อ Modal ปิด
      document.body.style.overflow = "unset";
    }

    return () => {
      // Cleanup event listeners และคืนค่า overflow เมื่อ Component unmount หรือ Modal ปิด
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]); // Dependencies: isOpen และ onClose

  // ถ้า Modal ไม่เปิด ให้คืนค่า null เพื่อไม่ Render อะไรเลย
  if (!isOpen) return null;

  // กำหนด Icon, สีข้อความ Title, สีปุ่มหลัก และสีขอบบนของ Modal ตาม 'type'
  let iconComponent;
  let titleColor;
  let primaryButtonClass = "";
  let modalBorderColor = "";

  switch (type) {
    case "success":
      iconComponent = <CheckCircle className="w-8 h-8 text-green-500" />;
      titleColor = "text-green-700";
      primaryButtonClass =
        "bg-green-50 hover:bg-green-100 text-green-900 focus:ring-green-100";
      modalBorderColor = "border-t-4 border-green-200";
      break;
    case "warning":
      iconComponent = <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      titleColor = "text-yellow-700";
      primaryButtonClass =
        "bg-yellow-50 hover:bg-yellow-100 text-yellow-900 focus:ring-yellow-100";
      modalBorderColor = "border-t-4 border-yellow-200";
      break;
    case "error":
      iconComponent = <XCircle className="w-8 h-8 text-red-500" />;
      titleColor = "text-red-700";
      primaryButtonClass =
        "bg-red-50 hover:bg-red-100 text-red-900 focus:ring-red-100";
      modalBorderColor = "border-t-4 border-red-200";
      break;
    case "info":
    default:
      iconComponent = <Info className="w-8 h-8 text-blue-500" />;
      titleColor = "text-blue-700";
      primaryButtonClass =
        "bg-blue-50 hover:bg-blue-100 text-blue-900 focus:ring-blue-100";
      modalBorderColor = "border-t-4 border-blue-200";
      break;
  }

  // ใช้ createPortal เพื่อ Render Modal นอก DOM ของ Component หลัก (แนบไปที่ <body>)
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out animate-fade-in-scale">
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-xl p-6 w-full max-w-sm border border-gray-200 transform transition-all duration-300 ease-out animate-slide-in-up ${modalBorderColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {iconComponent} {/* แสดง Icon ตามประเภท */}
            <h3 className={`text-xl font-bold ${titleColor}`}>{title}</h3>{" "}
            {/* แสดง Title พร้อมสีตามประเภท */}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full p-1 -mr-1 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        {/* ส่วนเนื้อหาของ Modal */}
        <div className="text-gray-800 leading-relaxed text-center mb-6">
          {children}
        </div>
        {/* ส่วนปุ่ม Actions */}
        <div className="flex justify-end gap-3 mt-4">
          {secondaryButtonText && (
            <button
              onClick={onSecondaryButtonClick || onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white hover:bg-gray-100 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
            >
              {secondaryButtonText}
            </button>
          )}
          {primaryButtonText && (
            <button
              onClick={onPrimaryButtonClick || onClose}
              className={`px-6 py-2 rounded-lg font-medium shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${primaryButtonClass}`}
            >
              {primaryButtonText}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body // Modal จะถูก Render ไปที่ <body> element
  );
};

// --- Component: SidebarAdmin ---
// Sidebar สำหรับหน้า Admin ที่มีการเรียกใช้งาน ModernModal
const SidebarAdmin = ({ profile, loading }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // สถานะของ Modal Logout
  const token = useEcomStore((state) => state.token);
  const fetchProfile = useEcomStore((state) => state.fetchProfile);
  const logout = useEcomStore((state) => state.logout); // ดึงฟังก์ชัน logout จาก store
  // upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // handle file selection -> preview as base64
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview || !token) return alert("กรุณาเลือกภาพและล็อกอิน");
    try {
      setUploading(true);
      const res = await uploadProfilePicture(token, preview);
      console.log("[SidebarAdmin] uploadProfilePicture response", res?.data);
      // refresh profile in store
      await fetchProfile();
      // update user.picture in persisted store so navbar and other components reflect change immediately
      try {
        const newProfile = useEcomStore.getState().profile;
        if (newProfile && newProfile.picture) {
          const currentUser = useEcomStore.getState().user;
          if (currentUser) {
            useEcomStore.setState({
              user: { ...currentUser, picture: newProfile.picture },
            });
          }
        }
      } catch (e) {
        console.error("[SidebarAdmin] failed to sync user.picture", e);
      }
      setIsUploadModalOpen(false);
      setPreview(null);
      alert("อัปโหลดรูปโปรไฟล์สำเร็จ");
    } catch (err) {
      console.error(err);
      alert("อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  };

  // ฟังก์ชันสำหรับยืนยันการออกจากระบบ
  const handleLogoutConfirm = () => {
    logout(); // เรียกฟังก์ชัน logout
    localStorage.removeItem("token"); // ลบ token
    navigate("/"); // ไปยังหน้าแรก
    setIsLogoutModalOpen(false); // ปิด Modal
  };

  // Class CSS พื้นฐานสำหรับ NavLink
  const baseNavLinkClass =
    "flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all duration-200 select-none group";
  // Class CSS สำหรับ NavLink ที่ Active / Inactive (นำมาใช้ต่อ)
  const activeNavLinkClass =
    "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-900 shadow-lg scale-105";
  const inactiveNavLinkClass =
    "text-blue-100 hover:bg-blue-800/70 hover:text-blue-200";

  // สถานะ dropdown ของ category
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // รายการ Menu สำหรับ Sidebar (ยก category ออกมาแยก)
  const menuItems = [
    // รายการเมนูหลัก
    {
      to: "/admin",
      icon: (
        <LayoutGrid className="w-6 h-6 group-hover:text-blue-400 transition" />
      ),

      label: "แดชบอร์ด",
    },

    {
      to: "manage",
      icon: <Users2 className="w-6 h-6 group-hover:text-blue-400 transition" />,
      label: "จัดการผู้ใช้",
    },
    // category dropdown จะถูก render แยก
    {
      to: "product",
      icon: (
        <PackagePlus className="w-6 h-6 group-hover:text-blue-400 transition" />
      ),
      label: "สินค้า",
    },
    {
      to: "orders",
      icon: (
        <ReceiptText className="w-6 h-6 group-hover:text-blue-400 transition" />
      ),
      label: "ออเดอร์",
    },
  ];

  return (
    <>
      {/* ปุ่มเปิดปิด Sidebar สำหรับจอขนาดเล็ก */}
      <button
        className="fixed top-4 left-4 z-30 p-2 rounded-md bg-white text-gray-900 shadow-lg md:hidden border border-gray-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Component */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 ${SIDEBAR_BG} text-gray-900 flex flex-col shadow-2xl border-r border-gray-200 bg-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:flex
        `}
      >
        {/* Header ของ Sidebar */}
        <div className="h-24 bg-white flex items-center justify-center text-3xl font-extrabold tracking-wide rounded-b-3xl shadow-lg select-text cursor-default border-b border-gray-200">
          <span className="ml-2 text-gray-900">Admin Panel</span>
        </div>

        {/* ส่วนแสดง Profile ผู้ใช้ */}
        <div className="flex flex-col items-center py-4 border-b border-gray-200 mb-2 bg-white">
          {loading ? (
            <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse mb-1" />
          ) : (
            <div className="relative mb-1">
              {profile?.picture ? (
                <img
                  src={profile.picture}
                  alt="admin avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <UserRound className="w-12 h-12 text-gray-400 drop-shadow" />
              )}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                title="อัปโหลดรูปโปรไฟล์"
                className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow border border-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12v6m0 0H9m6 0l-6-6"
                  />
                </svg>
              </button>
              <span className="absolute bottom-0 left-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
            </div>
          )}
          <div className="flex flex-col items-center">
            <span className="font-bold text-sm text-gray-900 leading-tight">
              {profile?.name || "Admin"}
            </span>
            <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-0.5">
              {profile?.email || "admin@email.com"}
            </span>
          </div>
        </div>

        {/* Upload Modal */}
        <ModernModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setPreview(null);
          }}
          title="อัปโหลดรูปโปรไฟล์"
          primaryButtonText={uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
          onPrimaryButtonClick={handleUpload}
          secondaryButtonText="ยกเลิก"
          onSecondaryButtonClick={() => {
            setIsUploadModalOpen(false);
            setPreview(null);
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : profile?.picture ? (
                <img
                  src={profile.picture}
                  alt="current"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserRound className="w-full h-full text-gray-300" />
              )}
            </div>
            <label className="px-4 py-2 bg-white border border-gray-200 rounded-md cursor-pointer">
              เลือกรูป
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <div className="text-sm text-gray-500">
              ขนาดที่แนะนำ: 400x400px (jpg/png)
            </div>
          </div>
        </ModernModal>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-gray-200 bg-white">
          {/* Section: ระบบหลัก */}
          <div className="mb-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2 mb-2 border-l-4 border-blue-200">
              ระบบหลัก
            </div>
            {menuItems
              .filter(({ to }) => to !== "orders")
              .map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/admin"}
                  title={label}
                  className={({ isActive }) =>
                    [
                      baseNavLinkClass,
                      isActive
                        ? "bg-gray-100 text-gray-900 shadow scale-105"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                    ].join(" ")
                  }
                >
                  {icon}
                  <span className="tracking-wide">{label}</span>
                </NavLink>
              ))}
          </div>

          {/* Section: หมวดหมู่สินค้า */}
          <div className="mb-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2 mb-2 border-l-4 border-yellow-200">
              หมวดหมู่สินค้า
            </div>
            <div className="relative select-none">
              <button
                type="button"
                className={[
                  baseNavLinkClass,
                  "w-full flex justify-between items-center text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                  categoryDropdownOpen
                    ? "bg-gray-100 text-gray-900 shadow scale-105"
                    : "",
                ].join(" ")}
                onClick={() => setCategoryDropdownOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={categoryDropdownOpen}
              >
                <span className="flex items-center gap-3">
                  <Layers3 className="w-6 h-6 group-hover:text-blue-400 transition" />
                  <span className="tracking-wide">หมวดหมู่สินค้า</span>
                </span>
                <svg
                  className={`w-4 h-4 ml-2 transition-transform ${
                    categoryDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {categoryDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <NavLink
                    to="/admin/category"
                    className={({ isActive }) =>
                      [
                        "block px-5 py-3 text-sm rounded-t-lg transition-all",
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                      ].join(" ")
                    }
                    onClick={() => setCategoryDropdownOpen(false)}
                  >
                    จัดการหมวดหมู่หลัก
                  </NavLink>
                  <NavLink
                    to="/admin/category/sub"
                    className={({ isActive }) =>
                      [
                        "block px-5 py-3 text-sm transition-all",
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                      ].join(" ")
                    }
                    onClick={() => setCategoryDropdownOpen(false)}
                  >
                    เพิ่ม/แก้ไข ประเภทย่อย
                  </NavLink>
                  <NavLink
                    to="/admin/category/subsub"
                    className={({ isActive }) =>
                      [
                        "block px-5 py-3 text-sm rounded-b-lg transition-all",
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                      ].join(" ")
                    }
                    onClick={() => setCategoryDropdownOpen(false)}
                  >
                    เพิ่ม/แก้ไข ย่อย-ประเภทย่อย
                  </NavLink>
                </div>
              )}
            </div>
          </div>

          {/* Section: ออเดอร์ */}
          <div className="mb-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2 mb-2 border-l-4 border-green-200">
              ออเดอร์
            </div>
            <NavLink
              key="orders"
              to="orders"
              title="ออเดอร์"
              className={({ isActive }) =>
                [
                  baseNavLinkClass,
                  isActive
                    ? "bg-gray-100 text-gray-900 shadow scale-105"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                ].join(" ")
              }
            >
              <ReceiptText className="w-6 h-6 group-hover:text-blue-400 transition" />
              <span className="tracking-wide">ออเดอร์</span>
            </NavLink>
          </div>
        </nav>

        {/* ปุ่ม Logout */}
        <div className="mb-6 px-4">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-semibold shadow hover:bg-gray-200 transition-all duration-200 active:scale-95 border border-gray-200"
            aria-label="Logout"
            title="Logout"
            type="button"
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Modal สำหรับยืนยันการออกจากระบบ (ใช้ ModernModal ที่ปรับปรุงใหม่) */}
      <ModernModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)} // ฟังก์ชันปิด Modal
        title="ยืนยันการออกจากระบบ"
        type="warning" // กำหนดประเภทเป็น "warning" เพื่อแสดง icon และสีที่เหมาะสม
        primaryButtonText="ยืนยัน" // ข้อความปุ่มยืนยัน
        onPrimaryButtonClick={handleLogoutConfirm} // ฟังก์ชันเมื่อคลิก "ยืนยัน"
        secondaryButtonText="ยกเลิก" // ข้อความปุ่มยกเลิก
        onSecondaryButtonClick={() => setIsLogoutModalOpen(false)} // ฟังก์ชันเมื่อคลิก "ยกเลิก"
      >
        <p className="text-center text-gray-800">
          คุณต้องการออกจากระบบ Admin Panel ใช่หรือไม่?
          <br />
          การกระทำนี้จะสิ้นสุดเซสชันปัจจุบันของคุณ.
          <br />
          <span className="text-red-500 font-semibold">
            โปรดตรวจสอบให้แน่ใจว่าคุณได้บันทึกการเปลี่ยนแปลงใด ๆ
            ที่ทำไว้ก่อนหน้านี้
          </span>
          <br />
        </p>
      </ModernModal>
    </>
  );
};

export default SidebarAdmin;
