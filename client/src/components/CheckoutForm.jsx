import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { saveOrder, listUserCart } from "../api/user";
import useEcomStore from "../store/ecom-store";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { numberFormat } from "../utils/number";
import {
  ShoppingBag,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  User,
} from "lucide-react"; // Import additional icons for better UI

export default function CheckoutPage({ clientSecret }) {
  const token = useEcomStore((state) => state.token);
  const clearCart = useEcomStore((state) => state.clearCart);
  const navigate = useNavigate();
  const location = useLocation();
  const { addressId, address, telephone, name } = location.state || {};

  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true); // Add loading state for cart

  useEffect(() => {
    if (token) {
      setLoadingCart(true); // Set loading true when fetching cart
      listUserCart(token)
        .then((res) => {
          const raw = Array.isArray(res.data.products) ? res.data.products : [];

          // Normalize items so each has { product, count, price }
          const normalized = raw.map((it) => {
            // possible shapes:
            // 1) { product: {...}, count: N, variant: {...} }
            // 2) { _id, title, price, count, images } (local cart saved as product-like)
            // 3) { product: productObject, quantity: N }
            const hasProduct =
              it && typeof it === "object" && "product" in it && it.product;
            if (hasProduct) {
              const product = it.product;
              const count = it.count ?? it.quantity ?? 1;
              const price = it.price ?? product?.price ?? 0;
              const variant = it.variant ?? null;
              const variantId = it.variantId ?? null;
              return { product, variant, variantId, count, price };
            }

            // fallback: treat the item itself as product-like
            const product = it;
            const count = it?.count ?? it?.quantity ?? 1;
            const price = it?.price ?? product?.price ?? 0;
            return { product, variant: null, variantId: null, count, price };
          });

          setProducts(normalized);

          // cartTotal may be returned by API; if not, compute from normalized items
          if (typeof res.data.cartTotal === "number") {
            setCartTotal(res.data.cartTotal);
          } else {
            const calc = normalized.reduce(
              (s, it) => s + (it.count || 0) * (it.price || 0),
              0
            );
            setCartTotal(calc);
          }
        })
        .catch((err) => {
          console.error("โหลดตะกร้าล้มเหลว:", err);
          toast.error("ไม่สามารถโหลดตะกร้าสินค้าได้");
          setProducts([]);
          setCartTotal(0);
        })
        .finally(() => {
          setLoadingCart(false); // Set loading false after fetch
        });
    } else {
      // Handle case where token is not available, maybe redirect to login or show a message
      toast.info("กรุณาเข้าสู่ระบบเพื่อดำเนินการชำระเงิน");
      navigate("/login"); // Example: redirect to login
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {},
      });

      if (result.error) {
        console.error("Stripe confirmPayment error:", result.error);
        setMessage(result.error.message || "เกิดข้อผิดพลาดในการชำระเงิน");
        toast.error(result.error.message || "เกิดข้อผิดพลาดในการชำระเงิน");
        return;
      }

      let paymentIntent = result.paymentIntent;

      // Fallback: some flows may not return paymentIntent immediately — try retrieve if clientSecret provided
      if (
        !paymentIntent &&
        clientSecret &&
        typeof stripe.retrievePaymentIntent === "function"
      ) {
        try {
          const retrieved = await stripe.retrievePaymentIntent(clientSecret);
          paymentIntent = retrieved?.paymentIntent || null;
        } catch (e) {
          console.warn("retrievePaymentIntent failed:", e);
        }
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // แนบ addressId, address, telephone, name ไปกับ paymentIntent
        const res = await saveOrder(token, {
          paymentIntent: {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            status: paymentIntent.status,
            currency: paymentIntent.currency,
            addressId,
            address,
            telephone,
            name,
          },
        });
        clearCart();
        toast.success(
          "การชำระเงินเสร็จสมบูรณ์! คำสั่งซื้อของคุณได้รับการยืนยันแล้ว"
        );

        // If server returned the created order, pass it to Success page to avoid refetch
        const createdOrder = res?.data?.order || null;
        if (createdOrder) {
          navigate("/user/success", { state: { order: createdOrder } });
        } else {
          navigate("/user/success");
        }
      } else {
        console.warn("Payment not completed yet", paymentIntent);
        toast.warning("การชำระเงินยังไม่สมบูรณ์ หรือรอการยืนยันเพิ่มเติม");
        setMessage(
          "การชำระเงินยังไม่สมบูรณ์ กรุณาติดตามสถานะหรือลองใหม่อีกครั้ง"
        );
      }
    } catch (apiError) {
      console.error("API error during order save:", apiError);
      toast.error(
        apiError?.message ||
          "ไม่สามารถบันทึกคำสั่งซื้อได้ กรุณาติดต่อผู้ดูแลระบบ"
      );
      setMessage(apiError?.message || "ไม่สามารถบันทึกคำสั่งซื้อได้");
    } finally {
      setIsLoading(false);
    }
  };

  const paymentElementOptions = {
    layout: "tabs",
    // Optional: Customize appearance if needed
  };

  // เพิ่ม helper สำหรับรองรับการแสดงรูปภาพหลายรูปแบบ (URL, relative path, array, object)
  const fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="100%" height="100%" fill="%23F3F4F6"/><g fill="%23E5E7EB"><rect x="30" y="60" width="140" height="20" rx="4"/><rect x="30" y="90" width="90" height="12" rx="3"/></g><text x="50%" y="85%" font-size="12" text-anchor="middle" fill="%239CA3AF">ไม่มีรูปสินค้า</text></svg>';

  const resolveImageSrc = (image) => {
    if (!image) return fallbackImage;

    let src = image;

    // กรณีที่เป็น array ให้เอาตัวแรก
    if (Array.isArray(image)) {
      src = image.length > 0 ? image[0] : null;
    }

    // กรณีที่เป็น object เช่น { url: '...' } หรือ { filename: '...' }
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

    // ถ้าเป็น absolute URL หรือ protocol-relative URL, ให้ใช้ตรง ๆ
    if (
      /^(https?:)?\/\//i.test(src) ||
      src.startsWith("data:") ||
      src.startsWith("blob:")
    ) {
      return src;
    }

    // Determine API base from Vite env (VITE_API) or fallbacks
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
    const cleanedBase = apiBase.replace(/\/api\/?$/i, "").replace(/\/+$/, "");

    // ถ้าเริ่มด้วย / ให้เติมฐานของ API (รักษา /)
    if (src.startsWith("/")) {
      return cleanedBase + src;
    }

    // หากเป็นชื่อไฟล์หรือ relative path ให้เติมฐานของ API
    return cleanedBase + "/" + src;
  };

  // helper: ดึงรูปแรกจาก product โดยรองรับหลายรูปแบบของข้อมูล (object, string, field ชื่ออื่น ๆ)
  const getFirstImageFromProduct = (product) => {
    if (!product) return null;

    // หากมี images และเป็น array
    const imgs = product.images;
    if (Array.isArray(imgs) && imgs.length > 0) {
      const first = imgs[0];
      if (!first) return null;
      if (typeof first === "string") return first;
      // ตรวจสอบฟิลด์ที่มักใช้เก็บ URL
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

    // บาง model อาจเก็บเป็นฟิลด์เดียว เช่น product.image / product.picture
    if (typeof product.image === "string" && product.image)
      return product.image;
    if (typeof product.picture === "string" && product.picture)
      return product.picture;

    return null;
  };

  return (
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
            <div className="w-14 h-0.5 bg-gray-200" />
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                2
              </div>
              <span className="text-xs text-gray-500 mt-2">ที่อยู่จัดส่ง</span>
            </div>
            <div className="w-14 h-0.5 bg-yellow-400" />
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold">
                3
              </div>
              <span className="text-xs text-gray-700 mt-2">ชำระเงิน</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* --- Order Summary Card --- */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 min-h-[400px]">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-amber-600" />
            สรุปรายการสินค้า
          </h2>

          {loadingCart ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-start bg-gray-100 p-4 rounded-lg animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-md" />
                    <div className="w-40 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-1/4 ml-4"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium">ไม่มีสินค้าในตะกร้า</p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
              >
                เลือกซื้อสินค้า
              </button>
            </div>
          ) : (
            <ul className="space-y-4 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
              {products.map((item, index) => {
                // normalize item local vars for rendering
                const product = item.product;
                const variant = item.variant || null;
                const count = item.count ?? 1;
                const unitPrice =
                  item.price ?? variant?.price ?? product?.price ?? 0;

                // Prefer an image from the variant, then item-level images, then product images
                let imgCandidate = null;
                if (variant && variant.images && variant.images.length > 0) {
                  imgCandidate = variant.images[0];
                } else if (
                  item.images &&
                  Array.isArray(item.images) &&
                  item.images.length > 0
                ) {
                  imgCandidate = item.images[0];
                } else {
                  imgCandidate = getFirstImageFromProduct(product);
                }
                const imgSrc = resolveImageSrc(imgCandidate);

                // Determine display title and include variant info if available
                const baseTitle = product?.title || item?.title || "สินค้า";
                const displayTitle =
                  variant && variant.title
                    ? `${baseTitle} - ${variant.title}`
                    : baseTitle;

                // show debug if query param present: ?debugImages=true
                const showDebug =
                  typeof window !== "undefined" &&
                  new URLSearchParams(window.location.search).get(
                    "debugImages"
                  ) === "true";

                return (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex items-center justify-center border">
                        {/* thumbnail if available */}
                        {imgCandidate ? (
                          <div className="w-full h-full relative">
                            <img
                              src={imgSrc}
                              alt={product?.title || "สินค้า"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                if (
                                  !e.target.src.includes("data:image/svg+xml")
                                ) {
                                  e.target.src = fallbackImage;
                                }
                              }}
                            />
                            {showDebug && (
                              <div className="absolute left-0 bottom-0 bg-black/60 text-white text-[10px] px-1 py-0.5 break-words max-w-full">
                                <div className="whitespace-normal">
                                  {imgSrc}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-300 text-sm">รูปสินค้า</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-lg">
                          {displayTitle}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          จำนวน: {count} ชิ้น
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          ราคาต่อชิ้น: {numberFormat(unitPrice)} ฿
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 text-xl whitespace-nowrap">
                      {numberFormat(count * unitPrice)} ฿
                    </p>
                  </li>
                );
              })}
            </ul>
          )}

          <hr className="my-6 border-gray-200" />
          <div className="flex justify-between items-center text-xl font-bold text-gray-800">
            <span>ยอดรวมทั้งหมด</span>
            <span className="text-yellow-500 text-3xl font-extrabold">
              {numberFormat(cartTotal)} ฿
            </span>
          </div>
        </div>

        {/* --- Payment Form Card --- */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 min-h-[400px]">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-indigo-500" />
              <span>ดำเนินการชำระเงิน</span>
            </div>
          </h2>

          {/* Shipping summary (compact) */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-md bg-white flex items-center justify-center border">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {name || "ผู้รับ: -"}
                </p>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {address || "-"}
                </p>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {telephone || "-"}
                </p>
              </div>
              <div>
                <button
                  onClick={() => navigate("/checkout")}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  แก้ไข
                </button>
              </div>
            </div>
          </div>

          <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <PaymentElement
                id="payment-element"
                options={paymentElementOptions}
              />
            </div>

            <button
              disabled={isLoading || !stripe || !elements}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                isLoading || !stripe || !elements
                  ? "bg-yellow-300 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 focus:outline-none focus:ring-4 focus:ring-yellow-200"
              }`}
              id="submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-6 h-6" />
                  <span>กำลังดำเนินการ...</span>
                </>
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  ยืนยันและชำระเงิน
                </span>
              )}
            </button>

            {message && (
              <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
