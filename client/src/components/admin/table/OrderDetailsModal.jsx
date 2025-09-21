import React, { useEffect, useState } from "react";
import TrackModal from "../TrackModal";
import {
  Package,
  User,
  MapPin,
  Phone,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { numberFormat } from "../../../utils/number";
import {
  changeOrderStatus,
  updateOrderShipping,
  generateAdminTracking,
} from "../../../api/admin";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

export default function OrderDetailsModal({
  viewOrder,
  setViewOrder,
  dateFormatTH,
  shippingEdits = {},
  setShippingEdits,
  copyToClipboard,
  validateTracking,
  handleSaveShippingInfo,
  token,
}) {
  // Hooks must be declared unconditionally
  const [activeTab, setActiveTab] = useState("summary");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedStatus, _setSelectedStatus] = useState(
    statusLabel(viewOrder?.orderStatus)
  );
  const [_statusChanging, _setStatusChanging] = useState(false);
  const [localCarrier, setLocalCarrier] = useState("");
  // Compute orderId and tracking helpers before any early return so hooks order is stable
  const orderId = viewOrder?.id || viewOrder?._id || null;

  const carrierFromProps =
    (orderId &&
      (shippingEdits[orderId]?.carrier || viewOrder?.shipping?.carrier)) ||
    "";
  const carrier = carrierFromProps || localCarrier;

  useEffect(() => {
    // If neither external setter is provided, initialize localCarrier from props
    if (!setShippingEdits && !setViewOrder) {
      const initial =
        (orderId &&
          (shippingEdits[orderId]?.carrier || viewOrder?.shipping?.carrier)) ||
        "";
      setLocalCarrier(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, shippingEdits, viewOrder]);
  const tracking =
    (orderId &&
      (shippingEdits[orderId]?.tracking ||
        viewOrder?.shipping?.tracking ||
        viewOrder?.trackingCode)) ||
    "";

  const pad9 = (n) => String(n).slice(-9).padStart(9, "0");
  const generateThaiTracking = (seed = "EG") => {
    const s = `${orderId || ""}|${Date.now()}`;
    let h = 0;
    for (let i = 0; i < s.length; i++)
      h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
    return `${seed}${pad9(Math.abs(h) % 1000000000)}TH`;
  };

  const CARRIERS = [
    "Kerry",
    "Flash Express",
    "SCG Express",
    "J&T",
    "ไปรษณีย์ไทย",
    "Ninja Van",
    "DHL",
    "FedEx",
  ];

  const setGeneratedTracking = (code) => {
    const finalCode = code || generateThaiTracking();
    if (setShippingEdits) {
      setShippingEdits((prev) => ({
        ...(prev || {}),
        [orderId]: { ...(prev?.[orderId] || {}), tracking: finalCode },
      }));
      return;
    }
    // Fallback: update modal's viewOrder so tracking shows even without setShippingEdits
    if (setViewOrder) {
      setViewOrder((prev) => ({
        ...(prev || {}),
        shipping: { ...(prev?.shipping || {}), tracking: finalCode },
        trackingCode: finalCode,
      }));
    }
  };

  useEffect(() => {
    if (!orderId) return;
    const existing =
      shippingEdits[orderId]?.tracking ||
      viewOrder?.shipping?.tracking ||
      viewOrder?.trackingCode;
    if (!existing) {
      // Prefer server-generated tracking when admin token is available
      (async () => {
        if (token && generateAdminTracking) {
          try {
            const resp = await generateAdminTracking(token, { format: "ORD" });
            const code = resp?.data?.code || resp?.code;
            if (code) return setGeneratedTracking(code);
          } catch (e) {
            console.warn("generateAdminTracking failed", e?.message || e);
          }
        }
        // fallback to client-side generator
        setGeneratedTracking(generateThaiTracking());
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (!viewOrder) return null;

  // status change handler inside modal

  async function _changeStatusFromModal() {
    if (!selectedStatus) return;
    if (!token) return alert("ต้องมีสิทธิ์ผู้ดูแลเพื่อเปลี่ยนสถานะ");
    try {
      _setStatusChanging(true);
      const resp = await changeOrderStatus(token, orderId, selectedStatus);
      const data = resp?.data || resp;
      // update modal view
      setViewOrder((prev) => ({ ...(prev || {}), ...data }));
      // notify list to refresh/patch
      if (typeof window !== "undefined")
        window.dispatchEvent(
          new CustomEvent("order:statusChanged", { detail: data })
        );
    } catch (err) {
      console.error("changeStatusFromModal error", err);
      alert(
        "ไม่สามารถเปลี่ยนสถานะได้: " +
          (err?.response?.data?.message || err.message || err)
      );
    } finally {
      _setStatusChanging(false);
    }
  }

  async function checkTracking() {
    const t =
      shippingEdits[orderId]?.tracking ||
      viewOrder.shipping?.tracking ||
      viewOrder.trackingCode ||
      "";
    if (!carrier || !t) return;
    setTrackingLoading(true);
    setTrackingResult(null);
    try {
      const resp = await fetch(`/api/shipping/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrier, tracking: t }),
      });
      const data = await resp.json();
      setTrackingResult({ ok: resp.ok, data });
    } catch (err) {
      setTrackingResult({ ok: false, error: String(err) });
    } finally {
      setTrackingLoading(false);
      setActiveTab("tracking");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl border overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <Package className="w-6 h-6 text-blue-600" />
            <div>
              <div className="text-lg font-semibold">รายละเอียดคำสั่งซื้อ</div>
              <div className="text-xs text-gray-500">
                คำสั่งซื้อที่ {orderId} •{" "}
                {dateFormatTH
                  ? dateFormatTH(viewOrder.createdAt)
                  : viewOrder.createdAt}
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={() => setViewOrder(null)}
              className="text-sm text-gray-600 px-3 py-1 rounded hover:bg-gray-100"
            >
              ปิด
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-h-[80vh] overflow-y-auto">
          <main className="lg:col-span-8 space-y-4">
            <div className="flex gap-3">
              <TabButton
                active={activeTab === "summary"}
                onClick={() => setActiveTab("summary")}
              >
                สรุป
              </TabButton>
              <TabButton
                active={activeTab === "shipping"}
                onClick={() => setActiveTab("shipping")}
              >
                ข้อมูลการจัดส่ง
              </TabButton>
            </div>

            {activeTab === "summary" && (
              <>
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard
                    icon={<User className="w-4 h-4 text-green-500" />}
                    title="ข้อมูลลูกค้า"
                  >
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">
                        {viewOrder.name ||
                          viewOrder.address?.name ||
                          viewOrder.orderedBy?.name ||
                          "ไม่ระบุ"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {viewOrder.orderedBy?.email || viewOrder.email || "-"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <Phone className="w-4 h-4" />
                        {viewOrder.address?.telephone ||
                          viewOrder.orderedBy?.telephone ||
                          viewOrder.telephone ||
                          "-"}
                      </div>
                    </div>
                  </InfoCard>

                  <InfoCard
                    icon={<MapPin className="w-4 h-4 text-blue-500" />}
                    title="ที่อยู่จัดส่ง"
                  >
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">
                        {viewOrder.address?.name ||
                          viewOrder.orderedBy?.name ||
                          "ไม่ระบุ"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {viewOrder.address?.address ||
                          viewOrder.orderedBy?.address ||
                          "-"}
                      </div>
                    </div>
                  </InfoCard>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">รายการสินค้า</h3>
                    <div className="text-xs text-gray-500">
                      {(viewOrder.products || []).length} รายการ
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="text-left text-xs text-gray-500 uppercase tracking-wider border-b">
                          <tr>
                            <th className="px-3 py-2 w-10">#</th>
                            <th className="px-3 py-2">สินค้า</th>
                            <th className="px-3 py-2">ราคา</th>
                            <th className="px-3 py-2">จำนวน</th>
                            <th className="px-3 py-2 text-right">รวม</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(viewOrder.products || []).map((p, i) => (
                            <tr key={i}>
                              <td className="px-3 py-3 font-medium">{i + 1}</td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-14 h-14 rounded overflow-hidden bg-gray-50 border flex-shrink-0">
                                    <img
                                      src={productImageUrl(p)}
                                      className="w-full h-full object-cover"
                                      alt=""
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://placehold.co/56x56";
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {p.product?.title}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {p.variant?.title || ""}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                {numberFormat(
                                  p.price ||
                                    p.variant?.price ||
                                    p.product?.price ||
                                    0
                                )}{" "}
                                บาท
                              </td>
                              <td className="px-3 py-3">x{p.count}</td>
                              <td className="px-3 py-3 text-right font-semibold">
                                {numberFormat(
                                  (p.price ||
                                    p.variant?.price ||
                                    p.product?.price ||
                                    0) * (p.count || 0)
                                )}{" "}
                                บาท
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-4">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-2">
                    ข้อมูลการจัดส่ง
                  </h3>
                  <div className="text-sm text-gray-700">
                    <div className="mb-2">
                      <div className="text-xs text-gray-500">ผู้ให้บริการ</div>
                      <div>
                        <select
                          className="w-full border rounded px-2 py-1 text-sm"
                          value={carrier}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (setShippingEdits) {
                              setShippingEdits((prev) => ({
                                ...(prev || {}),
                                [orderId]: {
                                  ...(prev?.[orderId] || {}),
                                  carrier: val,
                                },
                              }));
                              return;
                            }
                            // fallback: update viewOrder directly so select remains editable
                            if (setViewOrder) {
                              setViewOrder((prev) => ({
                                ...(prev || {}),
                                shipping: {
                                  ...(prev?.shipping || {}),
                                  carrier: val,
                                },
                                trackingCarrier: val,
                              }));
                              return;
                            }
                            // final fallback: update local state so select is editable even without external setters
                            setLocalCarrier(val);
                          }}
                        >
                          <option value="">เลือกผู้ให้บริการ</option>
                          {CARRIERS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <div className="text-xs text-gray-500 mt-1">
                          ผู้ให้บริการที่เลือก:{" "}
                          <span className="font-medium">
                            {carrier || viewOrder?.trackingCarrier || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="text-xs text-gray-500">รหัสติดตาม</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="flex-1 border rounded px-3 py-2 font-mono text-sm"
                          value={tracking}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!setShippingEdits) return;
                            setShippingEdits((prev) => ({
                              ...(prev || {}),
                              [orderId]: {
                                ...(prev?.[orderId] || {}),
                                tracking: val,
                              },
                            }));
                          }}
                          placeholder="รหัสติดตาม (สร้างอัตโนมัติ)"
                        />
                        <button
                          onClick={() =>
                            copyToClipboard && copyToClipboard(tracking)
                          }
                          className="p-2 rounded hover:bg-gray-100"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={checkTracking}
                          className="px-3 py-2 bg-indigo-600 text-white rounded"
                        >
                          {trackingLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "ตรวจสอบ"
                          )}
                        </button>
                        <button
                          onClick={() => setShowTrackModal(true)}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded"
                        >
                          เปิด
                        </button>
                        <button
                          onClick={async () => {
                            setGenerating(true);
                            try {
                              // Prefer server-generated when admin token available
                              if (token && generateAdminTracking) {
                                try {
                                  const resp = await generateAdminTracking(
                                    token,
                                    { format: "ORD" }
                                  );
                                  const code = resp?.data?.code || resp?.code;
                                  if (code) {
                                    setGeneratedTracking(code);
                                    // persist
                                    if (token && updateOrderShipping) {
                                      try {
                                        await updateOrderShipping(
                                          token,
                                          orderId,
                                          {
                                            carrier: carrier || undefined,
                                            tracking: code,
                                          }
                                        );
                                        toast.success(
                                          "สร้างและบันทึกรหัสติดตามเรียบร้อย"
                                        );
                                      } catch (e) {
                                        console.warn(
                                          "Failed to persist generated tracking",
                                          e?.message || e
                                        );
                                        toast.error(
                                          "สร้างรหัสสำเร็จ แต่บันทึกลง DB ล้มเหลว"
                                        );
                                      }
                                    } else {
                                      toast.success("สร้างรหัสติดตามเรียบร้อย");
                                    }
                                    return;
                                  }
                                } catch (e) {
                                  console.warn(
                                    "generateAdminTracking failed",
                                    e?.message || e
                                  );
                                }
                              }

                              // fallback
                              const local = generateThaiTracking();
                              setGeneratedTracking(local);
                              if (token && updateOrderShipping) {
                                try {
                                  await updateOrderShipping(token, orderId, {
                                    carrier: carrier || undefined,
                                    tracking: local,
                                  });
                                  toast.success(
                                    "สร้างและบันทึกรหัสติดตามเรียบร้อย"
                                  );
                                } catch (e) {
                                  console.warn(
                                    "Failed to persist local generated tracking",
                                    e?.message || e
                                  );
                                  toast.error(
                                    "สร้างรหัสสำเร็จ แต่บันทึกลง DB ล้มเหลว"
                                  );
                                }
                              } else {
                                toast.success("สร้างรหัสติดตามเรียบร้อย");
                              }
                            } finally {
                              setGenerating(false);
                            }
                          }}
                          title="สร้างใหม่"
                          className="px-2 py-2 bg-white border rounded text-xs"
                        >
                          {generating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "สร้างใหม่"
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-2">
                      {validateTracking ? (
                        validateTracking(carrier, tracking) ? (
                          <div className="text-green-600 flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4" /> รหัสถูกต้อง
                          </div>
                        ) : (
                          <div className="text-red-500 flex items-center gap-2 text-sm">
                            <XCircle className="w-4 h-4" /> รหัสไม่ถูกต้อง
                          </div>
                        )
                      ) : null}
                    </div>

                    <div className="flex gap-2 justify-end mt-3">
                      <button
                        onClick={async () => {
                          if (token && updateOrderShipping) {
                            try {
                              await updateOrderShipping(token, orderId, {
                                carrier: carrier || undefined,
                                tracking: tracking || undefined,
                              });
                            } catch (e) {
                              console.error("updateOrderShipping", e);
                            }
                          }
                          if (handleSaveShippingInfo)
                            handleSaveShippingInfo(orderId);
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded"
                      >
                        บันทึก
                      </button>
                      <button
                        onClick={() =>
                          setShippingEdits((prev) => {
                            const c = { ...prev };
                            delete c[orderId];
                            return c;
                          })
                        }
                        className="px-3 py-2 bg-white border rounded"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-2">
                    รายละเอียดการจัดส่ง
                  </h3>
                  <div className="text-sm text-gray-700">
                    <div className="mb-1">
                      ผู้รับ:{" "}
                      {viewOrder.address?.name ||
                        viewOrder.orderedBy?.name ||
                        "-"}
                    </div>
                    <div className="mb-1">
                      ที่อยู่:{" "}
                      {viewOrder.address?.address ||
                        viewOrder.orderedBy?.address ||
                        "-"}
                    </div>
                    <div className="mb-1">
                      โทรศัพท์:{" "}
                      {viewOrder.address?.telephone ||
                        viewOrder.telephone ||
                        "-"}
                    </div>
                    <div className="mb-1">
                      ค่าจัดส่ง: {numberFormat(viewOrder.shippingFee || 0)} บาท
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tracking" && (
              <div className="space-y-4">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-2">
                    สถานะติดตามพัสดุ
                  </h3>
                  <div className="min-h-[120px]">
                    {trackingLoading && (
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> กำลังเรียกดูข้อมูล...
                      </div>
                    )}
                    {!trackingLoading &&
                      trackingResult &&
                      trackingResult.ok && (
                        <TrackingResultView result={trackingResult.data} />
                      )}
                    {!trackingLoading &&
                      trackingResult &&
                      !trackingResult.ok && (
                        <div className="text-sm text-red-500">
                          Error:{" "}
                          {trackingResult.error ||
                            trackingResult.data?.message ||
                            "ไม่สามารถตรวจสอบได้"}
                        </div>
                      )}
                    {!trackingLoading && !trackingResult && (
                      <div className="text-sm text-gray-500">
                        คลิก "ตรวจสอบ" เพื่อเรียกดูสถานะพัสดุจากผู้ให้บริการ
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>

          <aside className="lg:col-span-4">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white border rounded-xl p-5 shadow-sm">
                <h4 className="text-sm font-semibold mb-3">สรุปยอด</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex justify-between">
                    <span>ราคา</span>
                    <span>{numberFormat(viewOrder.cartTotal)} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าจัดส่ง</span>
                    <span>{numberFormat(viewOrder.shippingFee || 0)} บาท</span>
                  </div>
                  <div className="border-t mt-3 pt-3 text-lg font-bold text-blue-700 flex justify-between">
                    <span>รวม</span>
                    <span>
                      {numberFormat(
                        (viewOrder.cartTotal || 0) +
                          (viewOrder.shippingFee || 0)
                      )}{" "}
                      บาท
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {showTrackModal && (
          <TrackModal
            isOpen={showTrackModal}
            onClose={() => setShowTrackModal(false)}
            initialCarrier={carrier}
            initialTracking={tracking}
          />
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, icon, children }) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <div className="text-sm font-semibold">{title}</div>
      </div>
      {children}
    </div>
  );
}

function statusLabel(s) {
  switch (s) {
    case "NOT_PROCESSED":
      return "รอดำเนินการ";
    case "PROCESSING":
      return "กำลังดำเนินการ";
    case "DELIVERED":
      return "จัดส่งสำเร็จ";
    case "CANCELLED":
      return "ยกเลิก";
    default:
      return s || "Unknown";
  }
}

function productImageUrl(p) {
  return (
    p.variant?.image ||
    (p.variant?.images && (p.variant.images[0]?.url || p.variant.images[0])) ||
    (p.product?.images && (p.product.images[0]?.url || p.product.images[0])) ||
    p.product?.image ||
    p.product?.imageUrl ||
    "https://placehold.co/56x56"
  );
}

function TrackingResultView({ result }) {
  if (!result) return <div className="text-sm text-gray-500">ไม่มีข้อมูล</div>;
  const events = result.events || (result.raw && result.raw.events) || null;
  return (
    <div>
      {result.provider && (
        <div className="text-xs text-gray-500 mb-2">
          Provider: {result.provider}
        </div>
      )}
      {events ? (
        <ol className="space-y-2">
          {events.map((e, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-1" />
              <div className="text-sm">
                <div className="text-xs text-gray-600">
                  {e.time || e.datetime || e.timestamp}
                </div>
                <div className="text-sm text-gray-800">
                  {e.status || e.message || JSON.stringify(e)}
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <pre className="text-xs whitespace-pre-wrap">
          {JSON.stringify(result.raw || result, null, 2)}
        </pre>
      )}
    </div>
  );
}

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded ${
        active ? "bg-blue-600 text-white" : "bg-white border"
      }`}
    >
      {children}
    </button>
  );
}
