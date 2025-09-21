import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getOrders, cancelOrder } from "../../api/user";
import useEcomStore from "../../store/ecom-store";
import { numberFormat } from "../../utils/number";
import { dateFormat } from "../../utils/dateformat";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  MapPin,
  Phone,
  User,
  CalendarDays,
  Tag,
  ShoppingBag,
} from "lucide-react";

const Success = () => {
  const token = useEcomStore((state) => state.token);
  const navigate = useNavigate();
  const location = useLocation();
  const passedOrder = location.state?.order || null;
  const [latestOrder, setLatestOrder] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(true);

  // normalize order returned by saveOrder (prisma include) to the UI shape
  const normalizeOrder = (o) => {
    if (!o) return null;
    return {
      id: o.id,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      cartTotal: o.cartTotal,
      orderStatus: o.orderStatus || o.status || null,
      stripePaymentId: o.stripePaymentId || null,
      amount: o.amount || null,
      currency: o.currency || null,
      address: o.address
        ? {
            id: o.address.id,
            name: o.address.name || null,
            address: o.address.address || null,
            telephone: o.address.telephone || null,
          }
        : o.address || null,
      products: Array.isArray(o.products)
        ? o.products.map((p) => ({
            id: p.id,
            productId: p.productId,
            variantId: p.variantId || null,
            count: p.count,
            price: p.price,
            product: p.product
              ? {
                  id: p.product.id,
                  title: p.product.title,
                  image:
                    Array.isArray(p.product.images) &&
                    p.product.images.length > 0
                      ? p.product.images[0].url || p.product.images[0]
                      : p.product.image || null,
                }
              : null,
            variant: p.variant
              ? {
                  id: p.variant.id,
                  title: p.variant.title,
                  price: p.variant.price,
                  quantity: p.variant.quantity,
                  image:
                    Array.isArray(p.variant.images) &&
                    p.variant.images.length > 0
                      ? p.variant.images[0].url || p.variant.images[0]
                      : null,
                }
              : null,
          }))
        : [],
    };
  };

  useEffect(() => {
    // If order was passed from CheckoutForm (createdOrder), use it directly
    if (passedOrder) {
      setLatestOrder(normalizeOrder(passedOrder));
      setLoadingOrder(false);
      return;
    }

    async function fetchLatestOrder() {
      try {
        setLoadingOrder(true);
        const res = await getOrders(token);
        if (res.data.ok && res.data.orders.length > 0) {
          const sortedOrders = res.data.orders.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setLatestOrder(sortedOrders[0]);
        } else {
          setLatestOrder(null);
        }
      } catch (error) {
        console.error("Failed to load orders", error);
        setLatestOrder(null);
      } finally {
        setLoadingOrder(false);
      }
    }
    if (token) fetchLatestOrder();
  }, [token, passedOrder]);

  const handleCancelOrder = async () => {
    if (!window.confirm("คุณต้องการยกเลิกคำสั่งซื้อนี้หรือไม่?")) return;
    setCancelLoading(true);
    try {
      const res = await cancelOrder(token, latestOrder.id);
      if (res.data.ok) {
        setLatestOrder((prev) => ({ ...prev, orderStatus: "Cancelled" }));
      } else {
        alert(res.data.message || "ไม่สามารถยกเลิกคำสั่งซื้อได้");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ");
    }
    setCancelLoading(false);
  };

  if (loadingOrder) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!latestOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ไม่พบข้อมูลคำสั่งซื้อ
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          กรุณาลองใหม่อีกครั้ง หรือติดต่อฝ่ายบริการลูกค้า
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const {
    id,
    createdAt,
    cartTotal,
    name,
    telephone,
    address,
    products,
    orderStatus,
  } = latestOrder;

  const isCancelled = orderStatus === "Cancelled";

  const addressName = address?.name || name;
  const addressTel = address?.telephone || telephone;
  const addressDisplay =
    typeof address === "object" ? address.address : address;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-th-sarabun">
      {/* Header */}
      <div className="text-center mb-10">
        {isCancelled ? (
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        ) : (
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        )}
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
          {isCancelled ? "คำสั่งซื้อถูกยกเลิก" : "สั่งซื้อสำเร็จ!"}
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          {isCancelled
            ? "คำสั่งซื้อของคุณถูกยกเลิกแล้ว หากมีข้อสงสัยโปรดติดต่อเรา"
            : "ขอบคุณสำหรับการสั่งซื้อ! ระบบได้รับคำสั่งซื้อของคุณแล้ว สามารถตรวจสอบสถานะได้ที่หน้าประวัติการสั่งซื้อ"}
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Order Summary */}
        <Card title="สรุปคำสั่งซื้อ">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Info label="รหัสคำสั่งซื้อ" value={id} icon={Tag} />
            <Info
              label="วันที่สั่งซื้อ"
              value={`${dateFormat(createdAt)} ${new Date(
                createdAt
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`}
              icon={CalendarDays}
            />
            <Info
              label="ยอดรวม"
              value={`${numberFormat(cartTotal)} บาท`}
              icon={ShoppingBag}
              valueClass="text-green-600 font-bold"
            />
            <Info
              label="สถานะ"
              value={isCancelled ? "ยกเลิกแล้ว" : "ยืนยันแล้ว"}
              icon={isCancelled ? XCircle : CheckCircle}
              valueClass={
                isCancelled
                  ? "text-red-600 font-bold"
                  : "text-green-600 font-bold"
              }
            />
          </div>
        </Card>

        {/* Buyer Info */}
        <Card title="ข้อมูลผู้ซื้อและการจัดส่ง">
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <span className="font-semibold">ชื่อผู้รับ:</span> {addressName}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-500" />
              <span className="font-semibold">เบอร์โทรศัพท์:</span> {addressTel}
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-500 mt-1" />
              <span className="font-semibold">ที่อยู่จัดส่ง:</span>{" "}
              {addressDisplay}
            </li>
          </ul>
        </Card>

        {/* Product List */}
        <Card title="รายการสินค้า">
          <ul className="divide-y divide-gray-200">
            {products.map((item) => {
              // prefer variant image/title when available
              const displayImage =
                item.variant?.image || item.product?.image || null;
              const displayTitle = item.variant?.title
                ? `${item.product?.title || ""} - ${item.variant.title}`
                : item.product?.title || "สินค้าที่ไม่มีชื่อ";
              const productId = item.product?.id || item.productId;
              const variantQuery = item.variant?.id
                ? `?variant=${item.variant.id}`
                : "";

              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 rounded-md px-2"
                  onClick={() =>
                    navigate(`/product/${productId}${variantQuery}`)
                  }
                >
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={displayTitle}
                      className="w-14 h-14 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                      ไม่มีรูป
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {displayTitle}
                    </p>
                    <p className="text-xs text-gray-500">
                      จำนวน {item.count} • {numberFormat(item.price)} บาท
                    </p>
                  </div>
                  <p className="font-semibold text-blue-600">
                    {numberFormat(item.count * item.price)} บาท
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => navigate("/user/history")}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
          >
            ดูคำสั่งซื้อของฉัน
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow"
          >
            ไปหน้าหลัก
          </button>
          {!isCancelled && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelLoading}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow disabled:opacity-50"
            >
              {cancelLoading ? "กำลังยกเลิก..." : "ยกเลิกคำสั่งซื้อ"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
    <h2 className="text-lg font-bold text-gray-800 mb-3">{title}</h2>
    {children}
  </div>
);

const Info = ({ icon: Icon, label, value, valueClass = "" }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-5 h-5 text-blue-500" />}
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  </div>
);

export default Success;
