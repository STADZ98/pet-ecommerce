import React, { useCallback, useMemo } from "react";
import { ShoppingCart, ArrowLeft, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion as m } from "framer-motion";

import useEcomeStore from "../../store/ecom-store";
import { createUserCart } from "../../api/user";
import { numberFormat } from "../../utils/number";

const ListCart = () => {
  // 1. Destructuring state from store for cleaner code
  const { carts, user, token, getTotalPrice } = useEcomeStore((state) => ({
    carts: state.carts,
    user: state.user,
    token: state.token,
    getTotalPrice: state.getTotalPrice,
  }));

  const navigate = useNavigate();

  // 2. Use useCallback to memoize functions and prevent unnecessary re-creations
  const handleSaveCart = useCallback(async () => {
    if (!token) {
      toast.warn("กรุณาเข้าสู่ระบบก่อนดำเนินการสั่งซื้อ");
      navigate("/login");
      return;
    }
    if (carts.length === 0) {
      toast.warn("ไม่พบสินค้าในตะกร้า กรุณาเพิ่มสินค้าก่อน");
      return;
    }

    try {
      await createUserCart(token, { cart: carts });
      navigate("/checkout");
    } catch (err) {
      console.error("Save cart failed:", err);
      toast.error(
        err?.response?.data?.message ||
          "ไม่สามารถบันทึกตะกร้าสินค้าได้ กรุณาลองใหม่อีกครั้ง"
      );
    }
  }, [token, carts, navigate]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 3. Use useMemo to cache computed values and optimize performance
  const totalItems = useMemo(() => carts.length, [carts]);
  const totalPrice = useMemo(() => getTotalPrice(), [getTotalPrice]);

  // 4. Define common button styles in one place for consistency and maintainability
  const buttonClass =
    "w-full px-5 py-3 rounded-lg shadow-md flex items-center justify-center gap-2 font-semibold transition-colors";

  return (
    <div className="container mx-auto max-w-6xl my-12 px-4">
      {/* --- Progress Steps --- */}
      <div className="mb-8">
        <div className="flex items-center gap-4 justify-center">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold">
                1
              </div>
              <span className="text-xs text-gray-500 mt-2">ตะกร้าสินค้า</span>
            </div>
            <div className="w-14 h-0.5 bg-gray-200" />
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                2
              </div>
              <span className="text-xs text-gray-500 mt-2">ที่อยู่จัดส่ง</span>
            </div>
            <div className="w-14 h-0.5 bg-gray-200" />
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                3
              </div>
              <span className="text-xs text-gray-700 mt-2">ชำระเงิน</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl max-w-5xl mx-auto my-12 border border-gray-100">
        {/* --- Header Section --- */}
        <header className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
          <div className="bg-yellow-500 p-3 rounded-full shadow-md">
            <ShoppingCart size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-stone-800">
            ตะกร้าสินค้าของคุณ{" "}
            <span className="text-amber-600 font-bold">
              ({totalItems} รายการ)
            </span>
          </h1>
        </header>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Left: Cart Items List --- */}
          <section className="lg:col-span-2 space-y-6">
            {/* 5. Clean up conditional rendering logic */}
            {totalItems === 0 ? (
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-50 rounded-2xl shadow-inner p-12 text-center text-stone-400 text-xl font-medium border border-stone-100 flex flex-col items-center justify-center min-h-[200px]"
              >
                <ShoppingCart size={64} className="mb-4 text-stone-300" />
                <p>ไม่มีสินค้าในตะกร้า</p>
                <Link to="/" className="mt-6">
                  <m.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft size={20} /> กลับไปเลือกซื้อสินค้า
                  </m.button>
                </Link>
              </m.div>
            ) : (
              <ul className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {carts.map((item, index) => (
                  <m.li
                    key={item._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-stone-50 p-5 rounded-xl shadow flex flex-col sm:flex-row items-center sm:items-start gap-5 hover:shadow-md transition border border-stone-100"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-28 h-28 rounded-lg shadow-md object-cover border border-stone-200"
                        />
                      ) : item.product &&
                        item.product.images &&
                        item.product.images.length > 0 ? (
                        <img
                          src={
                            typeof item.product.images[0] === "string"
                              ? item.product.images[0]
                              : item.product.images[0].url
                          }
                          alt={item.title}
                          className="w-28 h-28 rounded-lg shadow-md object-cover border border-stone-200"
                        />
                      ) : (
                        <div className="w-28 h-28 bg-stone-200 rounded-lg flex items-center justify-center text-stone-400 text-xs border border-stone-300">
                          ไม่มีรูปภาพ
                        </div>
                      )}
                    </div>
                    {/* Product Info */}
                    <div className="flex-1 flex flex-col gap-1 text-center sm:text-left">
                      <p className="font-bold text-stone-800 text-xl">
                        {item.title}
                      </p>
                      {item.variantTitle && (
                        <p className="text-sm text-gray-500">
                          ตัวเลือก: {item.variantTitle}
                        </p>
                      )}
                      <p className="text-base text-stone-600">
                        ราคา: {numberFormat(item.price)} ฿
                      </p>
                      <p className="text-base text-stone-600">
                        จำนวน: {item.count} ชิ้น
                      </p>
                    </div>
                    {/* Item Total Price */}
                    <div className="font-extrabold text-2xl text-yellow-500 ml-auto whitespace-nowrap pt-2 sm:pt-0">
                      {numberFormat(item.price * item.count)} ฿
                    </div>
                  </m.li>
                ))}
              </ul>
            )}
          </section>

          {/* --- Right: Summary & Actions --- */}
          <aside className="lg:col-span-1 bg-stone-50 p-7 rounded-2xl shadow-lg space-y-8 flex flex-col justify-between min-h-[260px] border border-stone-100">
            <div>
              <h2 className="text-2xl font-bold text-stone-700 mb-4 pb-2 border-b border-stone-200">
                สรุปยอดคำสั่งซื้อ
              </h2>
              <div className="flex justify-between items-center text-xl font-semibold text-stone-700">
                <span>ยอดรวมสุทธิ:</span>
                <span className="text-3xl text-yellow-500 font-extrabold whitespace-nowrap">
                  {numberFormat(totalPrice)} ฿
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {user ? (
                <m.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={totalItems < 1}
                  onClick={handleSaveCart}
                  className={`${buttonClass}
                    ${
                      totalItems < 1
                        ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                        : "bg-yellow-400 hover:bg-amber-700 text-white"
                    }`}
                  aria-disabled={totalItems < 1}
                >
                  ดำเนินการชำระเงิน
                </m.button>
              ) : (
                <Link to="/login" className="w-full">
                  <m.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${buttonClass} bg-amber-500 hover:bg-amber-600 text-white`}
                  >
                    <LogIn size={20} />
                    เข้าสู่ระบบเพื่อสั่งซื้อ
                  </m.button>
                </Link>
              )}
              <m.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoBack}
                className={`${buttonClass} bg-stone-200 hover:bg-stone-300 text-stone-800`}
              >
                <ArrowLeft size={20} />
                กลับไปเลือกสินค้า
              </m.button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ListCart;
