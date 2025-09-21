import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";
import { listUserCart, getUserAddress } from "../../api/user";
import axios from "axios";
import useEcomeStore from "../../store/ecom-store";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { numberFormat } from "../../utils/number";
import {
  Home,
  ShoppingBag,
  Edit2,
  Phone,
  User,
  CheckCircle,
  Save,
  XCircle,
} from "lucide-react";
// motion not needed here

const SummaryCard = () => {
  const token = useEcomeStore((state) => state.token);
  const [products, setProducts] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  // addresses: [{ address, telephone, name }]
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null); // null = add, number = edit
  const [formAddress, setFormAddress] = useState("");
  const [formTelephone, setFormTelephone] = useState("");
  const [formName, setFormName] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingCart, setLoadingCart] = useState(true);

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API || "http://localhost:5005/api";

  // --- Fetch User Address ---
  useEffect(() => {
    if (token) {
      setLoadingAddress(true);
      getUserAddress(token)
        .then((res) => {
          const data = res.data;
          let newAddresses = [];
          if (Array.isArray(data?.addresses)) {
            newAddresses = data.addresses;
          } else if (data?.address) {
            newAddresses = [
              {
                address: data.address,
                telephone: data.telephone,
                name: data.name,
              },
            ];
          }
          setAddresses(newAddresses);
          // ป้องกัน selectedAddressIdx เกิน index
          setSelectedAddressIdx((prev) => {
            if (newAddresses.length === 0) return 0;
            if (prev >= newAddresses.length) return 0;
            return prev;
          });
        })
        .catch((err) => {
          console.error("Failed to fetch address:", err);
          toast.error("ไม่สามารถโหลดที่อยู่ได้ ลองใหม่อีกครั้ง");
          setAddresses([]);
          setSelectedAddressIdx(0);
        })
        .finally(() => {
          setLoadingAddress(false);
        });
    }
  }, [token]);

  // --- Fetch User Cart ---
  const hdlGetUserCart = useCallback((token) => {
    setLoadingCart(true);
    listUserCart(token)
      .then((res) => {
        setProducts(Array.isArray(res.data.products) ? res.data.products : []);
        setCartTotal(
          typeof res.data.cartTotal === "number" ? res.data.cartTotal : 0
        );
      })
      .catch((err) => {
        console.error("Failed to fetch cart:", err);
        toast.error("ไม่สามารถโหลดตะกร้าสินค้าได้ ลองใหม่อีกครั้ง");
        setProducts([]);
        setCartTotal(0);
      })
      .finally(() => {
        setLoadingCart(false);
      });
  }, []);

  useEffect(() => {
    if (token) hdlGetUserCart(token);
  }, [hdlGetUserCart, token]);

  // --- Save Address Handler ---
  // --- Save/Add/Edit Address Handler ---
  const hdlSaveAddress = async () => {
    if (!formAddress.trim()) return toast.warning("กรุณากรอกที่อยู่จัดส่ง");
    if (!formTelephone.trim()) return toast.warning("กรุณากรอกเบอร์โทรศัพท์");
    if (!formName.trim()) return toast.warning("กรุณากรอกชื่อผู้รับ");

    // validate telephone: must be exactly 10 digits
    const tel = formTelephone.trim();
    if (!/^\d{10}$/.test(tel)) {
      return toast.warning("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก");
    }

    try {
      if (editingIdx === null) {
        // เพิ่มใหม่
        const res = await axios.post(
          `${API}/user/address`,
          {
            address: formAddress.trim(),
            telephone: tel,
            name: formName.trim(),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(res.data.message || "บันทึกที่อยู่เรียบร้อยแล้ว!");
        const newAddresses = [...addresses, res.data.address];
        setAddresses(newAddresses);
        setSelectedAddressIdx(newAddresses.length - 1);
      } else {
        // แก้ไข
        const addressId = addresses[editingIdx].id;
        const res = await axios.put(
          `${API}/user/address/${addressId}`,
          {
            address: formAddress.trim(),
            telephone: tel,
            name: formName.trim(),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newAddresses = [...addresses];
        newAddresses[editingIdx] = res.data.address;
        setAddresses(newAddresses);
        setSelectedAddressIdx(editingIdx);
        toast.success(res.data.message || "บันทึกการแก้ไขเรียบร้อยแล้ว!");
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save address:", err);
      toast.error("ไม่สามารถบันทึกที่อยู่ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // --- Delete Address ---
  const hdlDeleteAddress = async (idx) => {
    try {
      const addressId = addresses[idx].id;
      await axios.delete(`${API}/user/address/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newAddresses = addresses.filter((_, i) => i !== idx);
      setAddresses(newAddresses);
      // ป้องกัน selectedAddressIdx เกิน index
      setSelectedAddressIdx((prev) => {
        if (newAddresses.length === 0) return 0;
        if (prev >= newAddresses.length) return newAddresses.length - 1;
        return prev;
      });
      toast.success("ลบที่อยู่เรียบร้อยแล้ว!");
    } catch (err) {
      console.error("Failed to delete address:", err);
      toast.error("ไม่สามารถลบที่อยู่ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // --- Go To Payment Handler ---
  const hdlGoToPayment = () => {
    const addr = addresses[selectedAddressIdx];
    if (
      !addr ||
      !addr.address.trim() ||
      !addr.telephone.trim() ||
      !addr.name.trim()
    ) {
      return toast.warning(
        "กรุณากรอกข้อมูลที่อยู่จัดส่งและผู้รับให้ครบถ้วนก่อนดำเนินการชำระเงิน"
      );
    }
    if (products.length === 0) {
      return toast.warning(
        "ไม่พบสินค้าในตะกร้า กรุณาเพิ่มสินค้าก่อนดำเนินการชำระเงิน"
      );
    }
    // ส่ง addressId, address, telephone, name ไปยัง CheckoutForm.jsx ผ่าน state
    navigate("/user/payment", {
      state: {
        addressId: addr.id,
        address: addr.address,
        telephone: addr.telephone,
        name: addr.name,
      },
    });
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm text-base";
  const buttonPrimaryClass =
    "w-full bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 text-base font-semibold flex items-center justify-center gap-2";
  const buttonSecondaryClass =
    "w-full bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 text-base font-semibold flex items-center justify-center gap-2";

  // helper: flexible image resolver (copied from CheckoutForm to avoid duplication)
  const fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="100%" height="100%" fill="%23F3F4F6"/><g fill="%23E5E7EB"><rect x="30" y="60" width="140" height="20" rx="4"/><rect x="30" y="90" width="90" height="12" rx="3"/></g><text x="50%" y="85%" font-size="12" text-anchor="middle" fill="%239CA3AF">ไม่มีรูปสินค้า</text></svg>';

  const resolveImageSrc = (image) => {
    if (!image) return fallbackImage;

    let src = image;

    if (Array.isArray(image)) {
      src = image.length > 0 ? image[0] : null;
    }

    if (src && typeof src === "object") {
      src =
        src.url ||
        src.secure_url ||
        src.path ||
        src.filename ||
        src.file ||
        null;
    }

    if (!src || typeof src !== "string") return fallbackImage;

    src = src.trim();

    if (
      /^(https?:)?\/\//i.test(src) ||
      src.startsWith("data:") ||
      src.startsWith("blob:")
    ) {
      return src;
    }

    let apiBase = null;
    try {
      apiBase =
        (typeof import.meta !== "undefined" &&
          import.meta.env &&
          (import.meta.env.VITE_API ||
            import.meta.env.VITE_API_URL ||
            import.meta.env.REACT_APP_API_URL)) ||
        null;
    } catch {
      apiBase = null;
    }
    if (!apiBase) apiBase = "http://localhost:5005/api";
    // remove trailing /api if present, then trim trailing slashes so we get the server root
    const cleanedBase = apiBase.replace(/\/api\/?$/i, "").replace(/\/+$/, "");

    if (src.startsWith("/")) {
      return cleanedBase + src;
    }

    return cleanedBase + "/" + src;
  };

  const getFirstImageFromProduct = (product) => {
    if (!product) return null;
    const imgs = product.images;
    if (Array.isArray(imgs) && imgs.length > 0) {
      const first = imgs[0];
      if (!first) return null;
      if (typeof first === "string") return first;
      return (
        first.secure_url ||
        first.secureUrl ||
        first.url ||
        first.path ||
        first.filename ||
        first.file ||
        null
      );
    }
    if (typeof product.image === "string" && product.image)
      return product.image;
    if (typeof product.picture === "string" && product.picture)
      return product.picture;
    return null;
  };

  return (
    <div className="relative">
      {/* Modal สำหรับเพิ่ม/แก้ไขที่อยู่ */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-30"
          aria-hidden="true"
        />
        <div className="flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto p-8 z-50"
          >
            <Dialog.Title className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Home className="w-6 h-6 text-amber-700" />
              {editingIdx === null ? "เพิ่มที่อยู่ใหม่" : "แก้ไขที่อยู่"}
            </Dialog.Title>
            <div className="space-y-4">
              <label className="block text-gray-700 font-medium text-sm">
                ที่อยู่จัดส่ง:
              </label>
              <textarea
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="เช่น บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
                className={`${inputClass} min-h-[80px]`}
                rows={3}
              />
              <label className="block text-gray-700 font-medium text-sm">
                เบอร์โทรศัพท์:
              </label>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  value={formTelephone}
                  onChange={(e) =>
                    // allow only digits and max 10 chars
                    setFormTelephone(
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  maxLength={10}
                  placeholder="เบอร์โทรศัพท์มือถือ"
                  className={inputClass}
                />
              </div>
              <label className="block text-gray-700 font-medium text-sm">
                ชื่อผู้รับ:
              </label>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ชื่อ-นามสกุล ผู้รับ"
                  className={inputClass}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={hdlSaveAddress}
                  className={buttonPrimaryClass}
                >
                  <Save className="w-5 h-5" />
                  {editingIdx === null ? "บันทึกที่อยู่" : "บันทึกการแก้ไข"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModalOpen(false)}
                  className={buttonSecondaryClass}
                >
                  <XCircle className="w-5 h-5" />
                  ยกเลิก
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </Dialog>
      <div className="max-w-6xl mx-auto py-12 px-4 md:px-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-4 justify-center">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                  1
                </div>
                <span className="text-xs text-gray-500 mt-2">ตะกร้าสินค้า</span>
              </div>
              <div className="w-14 h-0.5 bg-yellow-400" />
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold">
                  2
                </div>
                <span className="text-xs text-gray-500 mt-2">
                  ที่อยู่จัดส่ง
                </span>
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
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- Address Card --- */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6 transform hover:scale-[1.005] transition-transform duration-300">
          <div className="flex items-center gap-3 border-b pb-4 mb-4 border-gray-100">
            <Home className="text-amber-700 w-7 h-7" />
            <h2 className="font-extrabold text-2xl text-gray-800">
              ที่อยู่ในการจัดส่ง
            </h2>
            <div className="ml-auto">
              {!loadingAddress && (
                <button
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  onClick={() => {
                    setModalOpen(true);
                    setEditingIdx(null);
                    setFormAddress("");
                    setFormTelephone("");
                    setFormName("");
                  }}
                  title="เพิ่มที่อยู่ใหม่"
                >
                  <Save size={18} /> เพิ่มที่อยู่ใหม่
                </button>
              )}
            </div>
          </div>
          {loadingAddress ? (
            <div className="animate-pulse space-y-4">
              <div className="h-24 bg-gray-100 rounded-lg"></div>
              <div className="h-10 bg-gray-100 rounded-lg"></div>
              <div className="h-10 bg-gray-100 rounded-lg"></div>
              <div className="h-12 bg-gray-100 rounded-lg"></div>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-gray-400 text-center py-10 text-lg font-medium">
              <XCircle size={40} className="mx-auto mb-3 text-gray-300" />
              ยังไม่มีที่อยู่ กรุณาเพิ่มที่อยู่ใหม่
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((addr, idx) => (
                <div
                  key={idx}
                  className={`bg-blue-50 rounded-xl p-4 text-gray-800 min-h-[100px] whitespace-pre-line text-lg font-medium border border-blue-100 shadow-sm relative ${
                    selectedAddressIdx === idx ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      className="text-amber-600 hover:text-yellow-700 text-xs font-medium p-1 rounded hover:bg-blue-100"
                      onClick={() => {
                        setModalOpen(true);
                        setEditingIdx(idx);
                        setFormAddress(addr.address);
                        // sanitize telephone when loading into form
                        setFormTelephone(
                          String(addr.telephone || "")
                            .replace(/\D/g, "")
                            .slice(0, 10)
                        );
                        setFormName(addr.name);
                      }}
                      title="แก้ไขที่อยู่"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 text-xs font-medium p-1 rounded hover:bg-red-100"
                      onClick={() => hdlDeleteAddress(idx)}
                      title="ลบที่อยู่"
                      disabled={addresses.length === 1}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      checked={selectedAddressIdx === idx}
                      onChange={() => setSelectedAddressIdx(idx)}
                      className="accent-yellow-500 w-5 h-5"
                      title="เลือกที่อยู่นี้"
                    />
                    <span className="font-bold text-yellow-700">
                      ที่อยู่ #{idx + 1}
                    </span>
                  </div>
                  <p className="flex items-start gap-2 mb-2">
                    <Home className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                    <span className="leading-relaxed">{addr.address}</span>
                  </p>
                  <p className="flex items-center gap-2 mb-2">
                    <Phone className="w-5 h-5 text-yellow-600" />
                    <span>{addr.telephone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <User className="w-5 h-5 text-yellow-600" />
                    <span>{addr.name}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Summary Card --- */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6 transform hover:scale-[1.005] transition-transform duration-300">
          <div className="flex items-center gap-3 border-b pb-4 mb-4 border-gray-100">
            <ShoppingBag className="text-amber-600 w-7 h-7" />
            <h2 className="text-2xl font-extrabold text-gray-800">
              สรุปรายการสั่งซื้อ
            </h2>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {loadingCart && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-end bg-gray-100 rounded-xl px-4 py-3 shadow-sm animate-pulse h-20"
                  >
                    <div className="w-3/4 h-full space-y-2">
                      <div className="h-5 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </>
            )}

            {!loadingCart && products.length === 0 && (
              <div className="text-gray-400 text-center py-10 text-lg font-medium">
                <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
                ยังไม่มีสินค้าในตะกร้า
              </div>
            )}

            {!loadingCart &&
              products.length > 0 &&
              products.map((item) => {
                const variant = item.variant || null;
                const displayTitle = variant
                  ? `${item.product?.title || ""} - ${
                      variant.title || variant.sku || ""
                    }`
                  : item.product?.title || "สินค้า";

                const pricePerUnit =
                  variant &&
                  variant.price !== undefined &&
                  variant.price !== null
                    ? variant.price
                    : item.product?.price || 0;

                let imgCandidate = null;
                if (
                  variant &&
                  Array.isArray(variant.images) &&
                  variant.images.length > 0
                ) {
                  imgCandidate = variant.images[0];
                } else {
                  imgCandidate = getFirstImageFromProduct(item.product);
                }
                const imgSrc = resolveImageSrc(imgCandidate);

                return (
                  <li
                    key={
                      item.product?._id ||
                      item._id ||
                      `${item.product?.title || "product"}-${
                        item.product?.id || ""
                      }-${item.product?.sku || ""}`
                    }
                    className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={imgSrc}
                        alt={item.product?.title || "สินค้า"}
                        className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                        onError={(e) => {
                          e.target.src = "/images/default-product.png";
                          e.target.classList.add("animate-pulse");
                        }}
                      />
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-800 text-lg">
                          {displayTitle}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          จำนวน: {item.count} ชิ้น
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          ราคาต่อชิ้น: {numberFormat(pricePerUnit)} ฿
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 text-xl whitespace-nowrap">
                      {numberFormat(item.count * pricePerUnit)} ฿
                    </p>
                  </li>
                );
              })}
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 space-y-4 shadow-inner border border-gray-100">
            <div className="flex justify-between text-gray-700 text-base font-medium">
              <span>ค่าจัดส่ง</span>
              <span>฿ 0.00</span>
            </div>
            <div className="flex justify-between text-gray-700 text-base font-medium">
              <span>ส่วนลด</span>
              <span>฿ 0.00</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-gray-900 text-xl">
                ยอดรวมสุทธิ
              </span>
              <span className="text-yellow-400 font-extrabold text-4xl">
                {numberFormat(cartTotal)} ฿
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={hdlGoToPayment}
              className={`${buttonPrimaryClass} mt-4 !bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-800`}
            >
              <CheckCircle className="w-6 h-6" />
              ดำเนินการชำระเงิน
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
