import React from "react";
import { X, Ban } from "lucide-react";

const CancelOrderModal = ({
  isOpen,
  closeModal,
  cancelLoading,
  cancelReason,
  setCancelReason,
  customCancelReason,
  setCustomCancelReason,
  handleCancelSubmit,
  cancelOrderDetail,
}) => {
  if (!isOpen) return null;

  const reasons = [
    "ต้องการเปลี่ยนแปลงคำสั่งซื้อ",
    "ชำระเงินช้า/ยกเลิกการชำระ",
    "สั่งผิดรายการ/จำนวน",
    "อื่น ๆ",
  ];

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={closeModal}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="ยกเลิกคำสั่งซื้อ"
        className="relative w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-red-50 to-white">
            <div className="flex items-center gap-3">
              <Ban className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">
                ยกเลิกคำสั่งซื้อ
              </h3>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-100"
              aria-label="ปิด"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-700">
              <div className="font-medium">คำสั่งซื้อ</div>
              <div className="text-xs text-gray-500">
                #{cancelOrderDetail?.orderId || cancelOrderDetail?._id || "-"}
              </div>
              <div className="mt-2">
                จำนวนสินค้า:{" "}
                <span className="font-medium">
                  {cancelOrderDetail?.itemCount ?? "-"}
                </span>
              </div>
              <div>
                ยอดรวม:{" "}
                <span className="font-medium text-blue-700">
                  {(cancelOrderDetail?.total || 0).toLocaleString()} ฿
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-800">
                เลือกเหตุผลในการยกเลิก
              </div>
              <div className="grid grid-cols-1 gap-2">
                {reasons.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                      cancelReason === r
                        ? "bg-red-50 border-red-200"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      checked={cancelReason === r}
                      onChange={() => {
                        setCancelReason(r);
                        if (r !== "อื่น ๆ") setCustomCancelReason("");
                      }}
                      className="h-4 w-4 text-red-600"
                    />
                    <span className="text-sm text-gray-700">{r}</span>
                  </label>
                ))}

                {cancelReason === "อื่น ๆ" && (
                  <textarea
                    value={customCancelReason}
                    onChange={(e) => setCustomCancelReason(e.target.value)}
                    placeholder="โปรดระบุเหตุผลเพิ่มเติม..."
                    className="w-full border rounded-lg p-3 resize-none min-h-[80px] focus:ring-2 focus:ring-red-400"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                disabled={cancelLoading}
              >
                ปิด
              </button>
              <button
                onClick={handleCancelSubmit}
                className={`px-4 py-2 rounded-md font-semibold ${
                  cancelLoading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
                disabled={
                  cancelLoading ||
                  !cancelReason ||
                  (cancelReason === "อื่น ๆ" && !customCancelReason)
                }
              >
                {cancelLoading ? "กำลังยกเลิก..." : "ยืนยันการยกเลิก"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
