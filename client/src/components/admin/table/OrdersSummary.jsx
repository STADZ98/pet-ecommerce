import React from "react";
import { Package, Clock, Loader2, CheckCircle2 } from "lucide-react";

export default function OrdersSummary({ filteredOrders = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-2xl shadow p-4 border border-gray-100 flex items-center gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <Package className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <div className="text-sm text-gray-500">คำสั่งซื้อทั้งหมด</div>
          <div className="text-2xl font-bold text-gray-900">
            {filteredOrders.length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 border border-gray-100 flex items-center gap-4">
        <div className="bg-yellow-50 p-3 rounded-lg">
          <Clock className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <div className="text-sm text-gray-500">รอดำเนินการ</div>
          <div className="text-2xl font-bold text-gray-900">
            {
              filteredOrders.filter((o) =>
                ["NOT_PROCESSED", "รอดำเนินการ"].includes(o.orderStatus)
              ).length
            }
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 border border-gray-100 flex items-center gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <Loader2 className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <div className="text-sm text-gray-500">กำลังดำเนินการ</div>
          <div className="text-2xl font-bold text-gray-900">
            {
              filteredOrders.filter((o) =>
                ["PROCESSING", "กำลังดำเนินการ"].includes(o.orderStatus)
              ).length
            }
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 border border-gray-100 flex items-center gap-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <div className="text-sm text-gray-500">จัดส่งสำเร็จ</div>
          <div className="text-2xl font-bold text-gray-900">
            {
              filteredOrders.filter((o) =>
                ["DELIVERED", "จัดส่งสำเร็จ"].includes(o.orderStatus)
              ).length
            }
          </div>
        </div>
      </div>
    </div>
  );
}
