import React, { useState, useEffect } from "react";
import useEcomStore from "../../store/ecom-store";
import { dateFormat } from "../../utils/dateformat";
import { numberFormat } from "../../utils/number";
import {
  X,
  PackageSearch,
  Package,
  Mail,
  UserRound,
  ShoppingCart,
  Truck,
  Copy,
  ExternalLink,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateOrderShipping } from "../../api/admin";

// ---------- Carrier Badge ----------
const CarrierBadge = ({ carrier }) => {
  if (!carrier) return <span className="text-sm text-gray-500">-</span>;
  const colors = {
    ไปรษณีย์: "bg-indigo-50 text-indigo-700 border-indigo-200",
    ไปรษณีย์ไทย: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Flash: "bg-yellow-50 text-yellow-800 border-yellow-200",
    "J&T": "bg-red-50 text-red-700 border-red-200",
    Kerry: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Kerry Express": "bg-emerald-50 text-emerald-700 border-emerald-200",
    Ninjavan: "bg-pink-50 text-pink-700 border-pink-200",
    "Ninja Van": "bg-pink-50 text-pink-700 border-pink-200",
  };
  const cls = colors[carrier] || "bg-gray-50 text-gray-700 border-gray-200";
  const iconForCarrier = (c) => {
    if (!c) return <Package size={14} className="text-gray-600" />;
    if (c.includes("ไปรษณีย์"))
      return <Mail size={14} className="text-indigo-700" />;
    if (c.toLowerCase().includes("j&t"))
      return <Truck size={14} className="text-red-700" />;
    if (c.toLowerCase().includes("kerry"))
      return <Truck size={14} className="text-emerald-700" />;
    if (c.toLowerCase().includes("ninja"))
      return <Package size={14} className="text-pink-700" />;
    if (c.toLowerCase().includes("flash"))
      return <Package size={14} className="text-yellow-800" />;
    return <Package size={14} className="text-gray-600" />;
  };
  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-sm font-medium border ${cls}`}
    >
      {iconForCarrier(carrier)}
      <span className="truncate max-w-[9rem]">{carrier}</span>
    </span>
  );
};

// ---------- Helper for Order Code ----------
const formatOrderCode = (order) => {
  if (order?.orderCode) return order.orderCode; // ถ้ามีจาก backend ให้ใช้เลย

  // fallback กรณี backend ยังไม่ส่ง orderCode
  const datePart = new Date(order.createdAt || Date.now())
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const runningNumber = String(order._id || order.id || "000000")
    .slice(-6)
    .padStart(6, "0");
  return `ORD-${datePart}-${runningNumber}`;
};

// ---------- Main Modal ----------
const OrderDetailsModal = ({
  isOpen,
  closeModal,
  order,
  translateStatus,
  getStatusColor,
}) => {
  const currentUser = useEcomStore((s) => s.user);
  // Editable tracking hooks must be declared unconditionally
  const [editingShipping, setEditingShipping] = useState(false);
  const [localCarrier, setLocalCarrier] = useState("");
  const [localTracking, setLocalTracking] = useState("");
  const [savingShipping, setSavingShipping] = useState(false);

  // carrier detect (derive values from order)
  const shippingCarrierDisplay =
    order?.trackingCarrier || order?.shipping?.carrier || null;
  const trackingCodeDisplay =
    order?.trackingCode || order?.shipping?.tracking || null;
  const shippingStatusDisplay =
    order?.shipping?.status || order?.trackingStatus || "-";

  useEffect(() => {
    setLocalCarrier(shippingCarrierDisplay || "");
    setLocalTracking(trackingCodeDisplay || "");
  }, [shippingCarrierDisplay, trackingCodeDisplay]);

  if (!isOpen || !order) return null;

  // normalize customer contact info with sensible fallbacks
  const customerName =
    order.name || order.address?.name || order.orderedBy?.name || "ไม่ระบุ";
  const customerEmail = order.orderedBy?.email || order.email || "-";
  const displayEmail =
    customerEmail === "-" ? currentUser?.email || "-" : customerEmail;
  const customerTelephone =
    order.address?.telephone || order.orderedBy?.telephone || "-";

  const orderCode = formatOrderCode(order);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("คัดลอก Order Code แล้ว");
    } catch {
      toast.error("ไม่สามารถคัดลอกได้");
    }
  };

  return (
    <div className="relative z-[1100]">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeModal}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-3">
              <PackageSearch className="text-yellow-400" size={32} />
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  รายละเอียดคำสั่งซื้อ
                </h2>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="font-mono text-gray-800">
                    #{localTracking || "-"}
                  </span>
                  <button
                    onClick={() => copyToClipboard(orderCode)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Copy size={14} />
                  </button>
                  <span>อัปเดต: {dateFormat(order.updatedAt)}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  order.orderStatus
                )}`}
              >
                {translateStatus(order.orderStatus)}
              </span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
              >
                <Printer size={16} /> พิมพ์
              </button>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gray-50">
            {/* Left side */}
            <div className="lg:col-span-8 space-y-6">
              {/* Order Progress */}
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">
                  ความคืบหน้า
                </h4>
                <div className="flex items-center justify-between">
                  {[
                    {
                      key: "NOT_PROCESSED",
                      label: "รอดำเนินการ",
                      icon: <Clock size={16} />,
                    },
                    {
                      key: "PROCESSING",
                      label: "กำลังดำเนินการ",
                      icon: <Package size={16} />,
                    },
                    {
                      key: "DELIVERED",
                      label: "จัดส่งสำเร็จ",
                      icon: <CheckCircle2 size={16} />,
                    },
                    {
                      key: "CANCELLED",
                      label: "ยกเลิก",
                      icon: <XCircle size={16} />,
                    },
                  ].map((step, i, arr) => {
                    const activeIndex = arr.findIndex(
                      (s) => s.key === order.orderStatus
                    );
                    const active = i <= activeIndex;
                    return (
                      <div key={step.key} className="flex-1 text-center">
                        <div
                          className={`mx-auto w-9 h-9 flex items-center justify-center rounded-full ${
                            active
                              ? "bg-yellow-500 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {step.icon}
                        </div>
                        <div className="text-xs mt-2 text-gray-600">
                          {step.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer & Address */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                    <UserRound size={16} className="text-orange-500" /> ลูกค้า
                  </h4>
                  <p className="text-sm text-gray-700 font-medium">
                    {customerName}
                  </p>
                  <p className="text-sm text-gray-600">{displayEmail}</p>
                  <p className="text-sm text-gray-600">{customerTelephone}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                    <Truck size={16} className="text-yellow-500" />{" "}
                    ที่อยู่จัดส่ง
                  </h4>
                  <p className="text-sm font-medium">
                    {order.address?.name || "ไม่ระบุ"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.address?.address || "ไม่ระบุ"}
                  </p>
                  <p className="text-xs text-gray-500">
                    โทร: {order.address?.telephone || "-"}
                  </p>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                  <ShoppingCart size={16} className="text-orange-500" />{" "}
                  รายการสินค้า
                </h4>
                {order.products?.length ? (
                  <div className="divide-y">
                    {order.products.map((p, i) => {
                      const title = p.variant?.title
                        ? `${p.product?.title || ""} - ${p.variant.title}`
                        : p.product?.title || "ไม่ระบุ";
                      const price =
                        p.price ?? p.variant?.price ?? p.product?.price ?? 0;
                      const image =
                        p.variant?.image ||
                        p.product?.image ||
                        "https://placehold.co/56x56";

                      return (
                        <div key={i} className="flex items-center gap-4 py-3">
                          <img
                            src={image}
                            alt={title}
                            className="w-14 h-14 rounded-md border object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{title}</p>
                            <p className="text-xs text-gray-500">
                              {p.product?.category?.name || "-"}
                            </p>
                            <p className="text-xs text-gray-400">x{p.count}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-700">
                              {numberFormat(price)} บาท
                            </p>
                            <p className="font-semibold text-gray-900">
                              {numberFormat(price * (p.count || 0))} บาท
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">ไม่มีสินค้า</p>
                )}
              </div>
            </div>

            {/* Right side summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  สรุปยอด
                </h4>
                <div className="text-sm space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>สินค้า</span>
                    <span>{numberFormat(order.cartTotal)} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าจัดส่ง</span>
                    <span>{numberFormat(order.shippingFee || 0)} บาท</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-yellow-500">
                    <span>รวมทั้งสิ้น</span>
                    <span>
                      {numberFormat(
                        (order.cartTotal || 0) + (order.shippingFee || 0)
                      )}{" "}
                      บาท
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  การชำระเงิน
                </h4>
                <p className="text-sm font-medium text-red-600">
                  {order.paymentMethod || "ไม่ระบุ"}
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  รหัสติดตาม
                </h4>
                <div className="flex items-center justify-between"></div>
                <div className="mt-3">
                  {!editingShipping ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 rounded bg-blue-50 text-yellow-500 font-mono text-sm">
                            {localTracking || "-"}
                          </code>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(localTracking)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <Copy size={16} />
                          </button>
                          <a
                            href={trackingCodeDisplay
                              ? `https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(
                                  trackingCodeDisplay
                                )}`
                              : "#"
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-700 flex items-center gap-1"
                          >
                            <ExternalLink size={14} /> ติดตาม
                          </a>
                        </div>
                      </div>
                      {/* <div>
                        <button
                          onClick={() => setEditingShipping(true)}
                          className="px-3 py-2 bg-white border rounded text-sm"
                        >
                          แก้ไข
                        </button>
                      </div> */}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 w-full">
                      <select
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={localCarrier}
                        onChange={(e) => setLocalCarrier(e.target.value)}
                      >
                        <option value="">เลือกผู้ให้บริการ</option>
                        {[
                          "Kerry",
                          "Flash Express",
                          "SCG Express",
                          "J&T",
                          "ไปรษณีย์ไทย",
                          "Ninja Van",
                          "DHL",
                          "FedEx",
                        ].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 font-mono text-sm"
                        value={localTracking}
                        onChange={(e) => setLocalTracking(e.target.value)}
                        placeholder="รหัสติดตาม"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => {
                            setEditingShipping(false);
                            setLocalCarrier(shippingCarrierDisplay || "");
                            setLocalTracking(trackingCodeDisplay || "");
                          }}
                          className="px-3 py-2 bg-white border rounded"
                        >
                          ยกเลิก
                        </button>
                        <button
                          onClick={async () => {
                            if (!currentUser?.token) {
                              toast.error(
                                "ต้องมีสิทธิ์ผู้ดูแลเพื่อบันทึกข้อมูล"
                              );
                              return;
                            }
                            setSavingShipping(true);
                            try {
                              await updateOrderShipping(
                                currentUser.token,
                                order.id || order._id,
                                {
                                  carrier: localCarrier || undefined,
                                  tracking: localTracking || undefined,
                                }
                              );
                              toast.success("บันทึกรหัสติดตามเรียบร้อย");
                              setEditingShipping(false);
                              // Update local display
                              // Note: mutating prop directly is a small UX convenience here
                              try {
                                order.trackingCode = localTracking;
                                order.trackingCarrier = localCarrier;
                              } catch (e) {
                                console.warn(e);
                              }
                            } catch (err) {
                              console.error(err);
                              toast.error("ไม่สามารถบันทึกรหัสได้");
                            } finally {
                              setSavingShipping(false);
                            }
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded"
                        >
                          {savingShipping ? "กำลังบันทึก..." : "บันทึก"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
