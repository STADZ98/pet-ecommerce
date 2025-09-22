import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";

const STATUS_MAP_TH = {
  pending: "รอดำเนินการ",
  processing: "กำลังดำเนินการ",
  shipped: "จัดส่งแล้ว",
  delivered: "จัดส่งสำเร็จ",
  returned: "ส่งคืน",
  cancelled: "ยกเลิก",
  unknown: "ไม่ทราบสถานะ",
};

function fmtDate(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return iso;
  }
}

function fmtMoney(n) {
  if (n == null) return "-";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(n);
}

export default function TrackLookup({ apiBase = "/api" }) {
  const location = useLocation();
  const initialTrackingFromQuery = useMemo(() => {
    try {
      return new URLSearchParams(location.search).get("tracking") || "";
    } catch {
      return "";
    }
  }, [location.search]);

  const [tracking, setTracking] = useState(initialTrackingFromQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const trackingLabel = useMemo(() => tracking.trim(), [tracking]);

  async function doLookup() {
    if (!trackingLabel) return setError("กรุณากรอกรหัสติดตาม");
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch(
        `${apiBase}/shipping/lookup?tracking=${encodeURIComponent(
          trackingLabel
        )}`
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || JSON.stringify(data));
      setResult(data);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  // Auto-run lookup when a tracking code is provided via query param
  useEffect(() => {
    if (initialTrackingFromQuery) {
      doLookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTrackingFromQuery]);

  function clearAll() {
    setTracking("");
    setResult(null);
    setError(null);
  }

  function copyTracking() {
    if (!trackingLabel) return;
    try {
      navigator.clipboard?.writeText(trackingLabel);
    } catch {
      // ignore clipboard errors
    }
  }

  function mapStatus(raw) {
    if (!raw) return STATUS_MAP_TH.unknown;
    const key = String(raw).toLowerCase();
    return STATUS_MAP_TH[key] || raw;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">ตรวจสอบสถานะพัสดุ</h2>

      <div className="bg-gray-50 border rounded-lg p-4 mb-4">
        <div className="flex gap-2">
          <label htmlFor="tracking" className="sr-only">
            รหัสติดตาม
          </label>
          <input
            id="tracking"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="ใส่รหัสติดตาม เช่น ORD-20250920-000001"
            onKeyDown={(e) => {
              if (e.key === "Enter") doLookup();
            }}
            aria-label="รหัสติดตาม"
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            onClick={doLookup}
            disabled={loading}
          >
            {loading ? "กำลังตรวจสอบ..." : "ตรวจสอบ"}
          </button>
          <button
            className="px-3 py-2 border rounded bg-white hover:bg-gray-100"
            onClick={clearAll}
            title="ล้างผลลัพธ์และช่องกรอก"
          >
            ล้าง
          </button>
          <button
            className="px-3 py-2 border rounded bg-white hover:bg-gray-100"
            onClick={copyTracking}
            title="คัดลอกรหัสติดตาม"
          >
            คัดลอก
          </button>
        </div>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      {result && (
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500">หมายเลขคำสั่งซื้อ</div>
              <div className="text-lg font-medium">
                #{result.order?.id || "-"}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500">สถานะ</div>
              <div className="mt-1 inline-flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                  {mapStatus(result.order?.orderStatus)}
                </span>
                <div className="text-sm text-gray-600">
                  {result.trackingNumber || trackingLabel}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <div className="text-xs text-gray-500">ผู้สั่งซื้อ / ผู้รับ</div>
              <div className="mt-1">
                {result.order?.orderedBy?.name ||
                  result.order?.address?.name ||
                  "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">ยอดรวม</div>
              <div className="mt-1 font-medium">
                {fmtMoney(result.order?.cartTotal)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">วันที่สั่งซื้อ</div>
              <div className="mt-1">{fmtDate(result.order?.createdAt)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">ผู้ให้บริการขนส่ง</div>
              <div className="mt-1">{result.carrier || "-"}</div>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold mb-2 text-gray-600">
              ประวัติการขนส่ง
            </div>
            {Array.isArray(result.events) && result.events.length ? (
              <ol className="border-l-2 border-gray-200 pl-4 space-y-4">
                {result.events.map((ev, idx) => (
                  <li key={idx} className="relative">
                    <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-white border flex items-center justify-center text-xs text-gray-600">
                      {idx + 1}
                    </div>
                    <div className="text-xs text-gray-500">
                      {fmtDate(ev.time)}
                    </div>
                    <div className="mt-1 text-sm">
                      {ev.statusTranslated || ev.status || "-"}
                    </div>
                    {ev.location && (
                      <div className="text-xs text-gray-500 mt-1">
                        สถานที่: {ev.location}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-sm text-gray-500">
                ไม่มีข้อมูลเหตุการณ์จากผู้ให้บริการ
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
