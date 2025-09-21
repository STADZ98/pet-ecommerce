import { Ban, X, AlertCircle, ShoppingCart } from "lucide-react";
import { numberFormat } from "../utils/number";

// Modal component - ยกเลิกคำสั่งซื้อ
const CancelOrderModal = ({
  isOpen,
  closeModal,
  handleCancelSubmit,
  cancelReason,
  setCancelReason,
  customCancelReason,
  setCustomCancelReason,
  cancelLoading,
  orderDetail, // เพิ่ม prop สำหรับแสดงข้อมูลคำสั่งซื้อ
  cancelOrderDetail, // รองรับ prop ชื่อจาก HistoryCard
}) => {
  if (!isOpen) return null;

  const detail = orderDetail || cancelOrderDetail || null;

  // Normalize display fields to support either a summary object or full order object
  const displayOrderId =
    detail && (detail.orderId || detail._id || detail.id)
      ? detail.orderId || detail._id || detail.id
      : null;
  const displayItemCount = detail
    ? detail.itemCount ||
      (Array.isArray(detail.products) ? detail.products.length : 0)
    : 0;
  const displayTotal = detail ? detail.total || detail.cartTotal || 0 : 0;

  const reasons = [
    "สินค้ารอนานเกินไป",
    "ต้องการเปลี่ยนแปลงที่อยู่จัดส่ง",
    "ต้องการเปลี่ยนวิธีการชำระเงิน",
    "พบราคาที่ถูกกว่า",
    "สั่งซื้อผิดสินค้า/จำนวน",
    "เปลี่ยนใจ",
    "อื่น ๆ",
  ];

  const isSubmitDisabled =
    !cancelReason || (cancelReason === "อื่น ๆ" && !customCancelReason);

  return (
    <div className="relative z-[1000]">
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-sm"
        aria-hidden="true"
        onClick={closeModal}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl max-h-[95vh] overflow-y-auto rounded-3xl bg-white p-0 shadow-2xl border border-gray-200 animate-fade-in">
          {detail ? (
            <>
              {/* Header */}
              <div className="sticky top-0 z-10 flex justify-between items-center px-8 py-7 border-b bg-gradient-to-r from-red-50 to-white rounded-t-3xl">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Ban className="text-red-500" size={36} />
                    <AlertCircle
                      className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full"
                      size={20}
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                      ยกเลิกคำสั่งซื้อ
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      กรุณาระบุเหตุผลในการยกเลิกคำสั่งซื้อเพื่อช่วยให้เราปรับปรุงบริการ
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                  aria-label="ปิด"
                >
                  <X size={26} />
                </button>
              </div>

              <div className="px-8 py-8">
                {/* Order Summary (Optional) */}
                <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                    <ShoppingCart size={16} /> ข้อมูลคำสั่งซื้อ
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-500">เลขที่คำสั่งซื้อ:</span>
                      <span className="font-medium text-gray-900">
                        {displayOrderId || "-"}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">จำนวนสินค้า:</span>
                      <span className="font-medium text-gray-900">
                        {displayItemCount || 0} รายการ
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">ยอดรวม:</span>
                      <span className="font-medium text-gray-900">
                        {numberFormat(displayTotal || 0)} ฿
                      </span>
                    </p>
                  </div>
                </div>

                {/* Reasons */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-800">
                    เลือกเหตุผลการยกเลิก:
                  </h3>
                  <div className="space-y-3">
                    {reasons.map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          cancelReason === reason
                            ? "bg-red-50 border-red-300 shadow-md"
                            : "bg-white border-gray-200 hover:border-red-200 hover:bg-red-50/30"
                        }`}
                      >
                        <div className="relative">
                          <input
                            type="radio"
                            name="cancelReason"
                            checked={cancelReason === reason}
                            onChange={() => {
                              setCancelReason(reason);
                              if (reason !== "อื่น ๆ")
                                setCustomCancelReason("");
                            }}
                            className="h-5 w-5 rounded-full text-red-500 focus:ring-red-400 focus:ring-offset-2"
                          />
                          {cancelReason === reason && (
                            <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20" />
                          )}
                        </div>
                        <span className="flex-1 font-medium text-gray-800">
                          {reason}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Custom Reason Textarea */}
                  {cancelReason === "อื่น ๆ" && (
                    <div className="mt-4 space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        โปรดระบุเหตุผลเพิ่มเติม:
                      </label>
                      <textarea
                        value={customCancelReason}
                        onChange={(e) => setCustomCancelReason(e.target.value)}
                        placeholder="ระบุรายละเอียดเพิ่มเติมที่นี่..."
                        className="w-full border-2 rounded-xl p-4 resize-none min-h-[120px] focus:ring-2 focus:ring-red-400 focus:border-red-300 transition-all text-gray-700 placeholder-gray-400"
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 text-right">
                        {customCancelReason.length}/500 ตัวอักษร
                      </p>
                    </div>
                  )}
                </div>

                {/* Warning Message */}
                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3">
                  <AlertCircle
                    className="text-amber-500 flex-shrink-0"
                    size={20}
                  />
                  <p className="text-sm text-amber-700">
                    การยกเลิกคำสั่งซื้อไม่สามารถย้อนกลับได้
                    กรุณาตรวจสอบข้อมูลให้แน่ใจก่อนดำเนินการ
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                    disabled={cancelLoading}
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleCancelSubmit}
                    disabled={isSubmitDisabled || cancelLoading}
                    className={`px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-semibold transition-all duration-200 flex items-center gap-2 ${
                      cancelLoading
                        ? "opacity-70 cursor-wait"
                        : "hover:scale-[1.02] hover:shadow-lg shadow-red-200"
                    } ${
                      isSubmitDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {cancelLoading ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        กำลังดำเนินการ...
                      </>
                    ) : (
                      <>
                        <Ban size={18} />
                        ยืนยันการยกเลิกคำสั่งซื้อ
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 flex flex-col items-center">
              <p className="text-gray-500 mb-4">กำลังโหลดข้อมูล...</p>
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold"
              >
                ปิด
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
