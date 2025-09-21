import React, { useState, useEffect } from "react";
import { trackShipment } from "../../api/shipping";

export default function TrackModal({
  isOpen,
  onClose,
  initialCarrier = "ไปรษณีย์ไทย",
  initialTracking = "",
}) {
  const [carrier, setCarrier] = useState(initialCarrier);
  const [tracking, setTracking] = useState(initialTracking);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setCarrier(initialCarrier || "ไปรษณีย์ไทย");
      setTracking(initialTracking || "");
      setEvents(null);
      setError(null);
    }
    // only update when modal is opened or initial props change
  }, [isOpen, initialCarrier, initialTracking]);

  if (!isOpen) return null;

  const carriers = ["ไปรษณีย์ไทย", "Flash", "J&T"];

  async function handleCheck(e) {
    e.preventDefault();
    setError(null);
    setEvents(null);
    if (!carrier || !tracking) {
      setError("กรุณาระบุผู้ให้บริการและหมายเลขพัสดุ");
      return;
    }
    setLoading(true);
    try {
      const resp = await trackShipment(carrier, tracking);
      if (resp && resp.data) {
        setEvents(
          resp.data.events ||
            resp.data.track ||
            resp.data.tracking_history ||
            null
        );
      } else {
        setError("ไม่มีข้อมูลการติดตาม");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-11/12 max-w-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">ตรวจสอบสถานะพัสดุ</h3>
          <button onClick={onClose} className="text-gray-600">
            ปิด
          </button>
        </div>

        <form onSubmit={handleCheck} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">ผู้ให้บริการ</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full border rounded px-2 py-1"
            >
              {carriers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">หมายเลขพัสดุ</label>
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              {loading ? "กำลังตรวจสอบ..." : "ตรวจสอบ"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCarrier("ไปรษณีย์ไทย");
                setTracking("");
                setEvents(null);
                setError(null);
              }}
              className="px-3 py-1 border rounded"
            >
              ล้าง
            </button>
          </div>
        </form>

        <div className="mt-4">
          {error && <div className="text-red-600">{error}</div>}
          {events && (
            <div>
              <h4 className="font-medium mb-2">เหตุการณ์ติดตาม</h4>
              <ul className="space-y-2 max-h-64 overflow-auto">
                {events.length === 0 && (
                  <li className="text-sm text-gray-600">ไม่มีเหตุการณ์</li>
                )}
                {events.map((ev, idx) => (
                  <li key={idx} className="p-2 border rounded">
                    <div className="text-sm text-gray-500">
                      {ev.time || ev.datetime || ev.date || ev.timestamp}
                    </div>
                    <div className="text-sm">
                      {ev.status ||
                        ev.description ||
                        ev.message ||
                        JSON.stringify(ev)}
                    </div>
                    {ev.location && (
                      <div className="text-xs text-gray-400">{ev.location}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
