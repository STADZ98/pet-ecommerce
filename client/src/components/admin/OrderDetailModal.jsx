import React, { useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  ShoppingCart,
  X,
  User,
  MapPin,
  Phone,
  ShoppingBag,
  ImageIcon,
} from "lucide-react";
import { numberFormat } from "../../utils/number";
import {
  normalizePaymentMethod,
  paymentMethodMap,
  statusMap,
  getProductImage,
  getProductTitle,
  getQuantity,
  getUnitPrice,
} from "./adminHelpers";

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-md text-sm font-medium ${
      active ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

const OrderDetailModal = ({
  selectedOrder,
  setSelectedOrder,
  setSelectedProduct,
}) => {
  const [tab, setTab] = useState("summary");

  if (!selectedOrder) return null;

  const {
    orderedBy,
    products,
    cartTotal,
    shippingFee,
    orderStatus,
    address,
    telephone,
    createdAt,
    paymentMethod,
    _id,
  } = selectedOrder;

  const pmRaw =
    paymentMethod ||
    selectedOrder.payment ||
    selectedOrder.payment_method ||
    null;
  const orderDate = createdAt
    ? new Date(createdAt).toLocaleString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "N/A";
  const totalAmount = (cartTotal || 0) + (shippingFee || 0);

  // Pie chart data
  const labels = (products || []).map(
    (p, i) => getProductTitle(p) || `สินค้า ${i + 1}`
  );
  const counts = (products || []).map((p) => getQuantity(p) || 0);
  const pieData = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: [
          "#60A5FA",
          "#34D399",
          "#F59E0B",
          "#F97316",
          "#A78BFA",
          "#FCA5A5",
          "#FBF08A",
          "#93C5FD",
        ],
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <ShoppingCart size={22} className="text-indigo-600" />
            <div>
              <div className="text-lg font-semibold text-gray-900">
                รายละเอียดคำสั่งซื้อ
              </div>
              <div className="text-sm text-gray-500">
                หมายเลข: <span className="font-mono text-gray-700">{_id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-500">ยอดชำระ</div>
              <div className="text-lg font-bold text-indigo-600">
                {numberFormat(totalAmount)} บาท
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 border rounded-md text-sm"
            >
              พิมพ์
            </button>
            <button
              onClick={() => setSelectedOrder(null)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 flex items-center gap-3 border-b">
          <TabButton
            active={tab === "summary"}
            onClick={() => setTab("summary")}
          >
            สรุป
          </TabButton>
          <TabButton active={tab === "items"} onClick={() => setTab("items")}>
            รายการสินค้า
          </TabButton>
          <TabButton
            active={tab === "timeline"}
            onClick={() => setTab("timeline")}
          >
            สถานะ
          </TabButton>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
          <div className="lg:col-span-8">
            {tab === "summary" && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">ลูกค้า</div>
                  <div className="mt-2 text-base font-medium text-gray-800">
                    {address?.name || orderedBy?.name || "ไม่ระบุ"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {orderedBy?.email || "-"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Phone size={14} />
                    {address?.telephone || telephone || "-"}
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-gray-700">
                      ที่อยู่จัดส่ง
                    </div>
                    <div className="text-xs text-gray-500">{orderDate}</div>
                  </div>
                  <div className="text-gray-700">
                    {address?.address || address || "ไม่ระบุ"}
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium">วิธีการชำระเงิน</div>
                    <div className="text-sm text-gray-500">
                      {pmRaw ? normalizePaymentMethod(pmRaw) : "ไม่ระบุ"}
                    </div>
                  </div>
                  {pmRaw && (
                    <div className="mt-2">
                      {(() => {
                        const key = normalizePaymentMethod(pmRaw);
                        const cfg =
                          paymentMethodMap[key] || paymentMethodMap.other;
                        return (
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${cfg.color}`}>
                              {cfg.icon}
                            </div>
                            <div>
                              <div className="font-medium">{cfg.label}</div>
                              <div className="text-xs text-gray-500">
                                {key === "promptpay"
                                  ? "สแกนเพื่อชำระเงิน (QR)"
                                  : ""}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "items" && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ShoppingBag size={16} className="text-orange-500" />{" "}
                  รายการสินค้า
                </h4>
                {products?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="text-left text-xs text-gray-500 uppercase tracking-wider border-b">
                        <tr>
                          <th className="px-3 py-2">สินค้า</th>
                          <th className="px-3 py-2">ราคา/ชิ้น</th>
                          <th className="px-3 py-2">จำนวน</th>
                          <th className="px-3 py-2 text-right">ราคารวม</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {products.map((p, i) => {
                          const img = getProductImage(p);
                          const title = getProductTitle(p);
                          const qty = getQuantity(p) || 0;
                          const price = getUnitPrice(p) || 0;
                          return (
                            <tr key={i} className="align-top">
                              <td className="px-3 py-3 flex items-center gap-3">
                                <div className="w-14 h-14 rounded-md overflow-hidden border bg-gray-50">
                                  {img ? (
                                    <img
                                      src={img}
                                      alt={title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://placehold.co/56x56?text=No+Image";
                                      }}
                                    />
                                  ) : (
                                    <ImageIcon
                                      size={18}
                                      className="text-gray-400 m-3"
                                    />
                                  )}
                                </div>
                                <div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (setSelectedProduct)
                                        setSelectedProduct({
                                          image: img,
                                          title,
                                          price,
                                          count: qty,
                                          raw: p,
                                        });
                                    }}
                                    className="text-left font-medium text-gray-800 hover:underline"
                                  >
                                    {title}
                                  </button>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-gray-700">
                                {numberFormat(price)} บาท
                              </td>
                              <td className="px-3 py-3 text-gray-700">
                                x{qty}
                              </td>
                              <td className="px-3 py-3 text-right font-semibold text-gray-900">
                                {numberFormat(price * qty)} บาท
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">ไม่มีสินค้า</p>
                )}
              </div>
            )}

            {tab === "timeline" && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">
                  สถานะคำสั่งซื้อ
                </h4>
                <div className="flex items-center gap-4">
                  {[
                    "NOT_PROCESSED",
                    "PROCESSING",
                    "DELIVERED",
                    "CANCELLED",
                  ].map((s, i) => {
                    const active =
                      [
                        "NOT_PROCESSED",
                        "PROCESSING",
                        "DELIVERED",
                        "CANCELLED",
                      ].indexOf(orderStatus) >= i;
                    return (
                      <div key={s} className="flex-1 text-center">
                        <div
                          className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                            active
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <div className="text-xs mt-2 text-gray-600">
                          {statusMap[s]?.label || s}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="space-y-4 sticky top-6">
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500">สรุปยอด</div>
                <div className="mt-2 text-base font-medium text-gray-800">
                  รวมสินค้า: {numberFormat(cartTotal)} บาท
                </div>
                <div className="text-sm text-gray-500">
                  ค่าจัดส่ง: {numberFormat(shippingFee)} บาท
                </div>
                <div className="mt-3 text-lg font-bold text-indigo-600">
                  ยอดชำระรวม: {numberFormat(totalAmount)} บาท
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  สัดส่วนสินค้าในคำสั่งซื้อ
                </h4>
                <div className="min-h-[220px]">
                  <Pie
                    data={pieData}
                    options={{ plugins: { legend: { position: "bottom" } } }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
