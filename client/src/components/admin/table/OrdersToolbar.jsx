import React from "react";
import { FileText } from "lucide-react";

export default function OrdersToolbar({
  filterStart,
  filterEnd,
  setFilterStart,
  setFilterEnd,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  resetFilters,
  pageSize,
  setPageSize,
}) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-extrabold text-blue-800 flex items-center gap-3">
            <span className="inline-block bg-blue-600 text-white rounded-full p-3 shadow-lg">
              <FileText className="w-7 h-7" />
            </span>
            ระบบจัดการคำสั่งซื้อ
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
            <label className="text-xs text-gray-500 mr-2">จาก</label>
            <input
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              className="text-sm p-1 border rounded-md"
            />
            <label className="text-xs text-gray-500 mx-2">ถึง</label>
            <input
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
              className="text-sm p-1 border rounded-md"
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
            <input
              type="search"
              placeholder="ค้นหาโดย รหัส/อีเมล/ชื่อลูกค้า/รหัสชำระเงิน"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm p-1 border rounded-md w-64"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm p-1 rounded-md border"
              aria-label="กรองตามสถานะ"
            >
              <option value="ALL">ทั้งหมด</option>
              <option value="รอดำเนินการ">รอดำเนินการ</option>
              <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
              <option value="จัดส่งสำเร็จ">จัดส่งสำเร็จ</option>
              <option value="ยกเลิก">ยกเลิก</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-md text-sm"
            >
              รีเซ็ต
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end mb-2">
        <div className="text-sm text-gray-600 mr-2">แสดงต่อหน้า:</div>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="text-sm p-1 border rounded-md"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
    </>
  );
}
