import React from "react";
import {
  Loader2,
  FileText,
  Trash2,
  Printer,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { numberFormat } from "../../../utils/number";

export default function OrdersTableBody({
  paginatedOrders = [],
  startIndex = 0,
  filteredOrders = [],
  pageSize = 10,
  current = 1,
  totalPages = 1,
  setCurrentPage,
  dateFormat,
  setViewOrder,
  handleChangeOrderStatus,
  handleDeleteOrder,
  handlePrintOrder,
}) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white shadow-lg">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col style={{ width: "48px" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "120px" }} />
          <col style={{ width: "28%" }} />
          <col style={{ width: "110px" }} />
          <col style={{ width: "120px" }} />
          <col style={{ width: "80px" }} />
        </colgroup>
        <thead>
          <tr>
            <th className="bg-blue-50 text-blue-900 px-2 py-3 rounded-tl-xl text-center font-semibold shadow-sm border-b border-blue-100">
              #
            </th>
            <th className="bg-blue-50 text-blue-900 px-2 py-3 text-left font-semibold shadow-sm border-b border-blue-100">
              ลูกค้า / Order ID
            </th>
            <th className="bg-blue-50 text-blue-900 px-2 py-3 text-center font-semibold shadow-sm border-b border-blue-100">
              วันที่
            </th>
            <th className="bg-blue-50 text-blue-900 px-2 py-3 text-left font-semibold shadow-sm border-b border-blue-100">
              สินค้า
            </th>
            <th className="bg-blue-50 text-blue-900 px-2 py-3 text-right font-semibold shadow-sm border-b border-blue-100">
              ยอดรวม
            </th>
            <th className="bg-blue-50 text-blue-900 px-2 py-3 text-center font-semibold shadow-sm border-b border-blue-100">
              สถานะ
            </th>
            <th className="bg-blue-50 text-blue-900 px-2 py-3 rounded-tr-xl text-center font-semibold shadow-sm border-b border-blue-100">
              การกระทำ
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((item, index) => (
            <tr
              key={item.id}
              className="bg-white hover:bg-blue-50 transition rounded-xl shadow border border-blue-100"
            >
              <td className="px-4 py-3 text-center font-bold text-blue-700 rounded-l-xl align-middle">
                {startIndex + index + 1}
              </td>
              <td className="px-4 py-3 min-w-[220px] align-middle flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {item.orderedBy?.picture ? (
                    <img
                      src={item.orderedBy.picture}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-sm text-gray-400">👤</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div
                    className="font-semibold text-blue-900 cursor-pointer hover:underline"
                    onClick={() => setViewOrder(item)}
                    title="ดูรายละเอียดคำสั่งซื้อ"
                  >
                    {item.name ||
                      item.address?.name ||
                      item.orderedBy?.email ||
                      "ไม่ระบุ"}
                  </div>
                  <div className="text-xs text-gray-400">
                    ID: <span className="font-mono">{item.id}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-center min-w-[120px] align-middle">
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                  {dateFormat(item.createdAt)}
                </span>
              </td>
              <td className="px-4 py-3 min-w-[200px] align-middle">
                <ul className="space-y-2">
                  {item.products.map((p, i) => (
                    <ul
                      key={i}
                      className="flex items-start gap-2 bg-blue-50/60 rounded-lg px-3 py-2"
                    >
                      <span className="font-bold text-blue-600 mr-2">
                        {i + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-medium text-gray-900 truncate"
                          title={p.product.title}
                        >
                          {p.product.title}
                          {p.variant?.title && (
                            <span className="text-xs text-gray-500 ml-2">
                              — {p.variant.title}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {p.product.category?.name
                            ? `หมวดหมู่: ${p.product.category.name}`
                            : ""}
                          {p.variant?.sku && (
                            <div className="text-xs text-gray-400 mt-1">
                              SKU: {p.variant.sku}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end min-w-[70px]">
                        <span className="text-xs text-gray-700 font-semibold">
                          {p.count} x{" "}
                          {numberFormat(
                            p.price || p.variant?.price || p.product?.price
                          )}
                        </span>
                        <span className="text-xs text-gray-400">
                          รวม{" "}
                          {numberFormat(
                            p.count *
                              (p.price || p.variant?.price || p.product?.price)
                          )}
                        </span>
                      </div>
                    </ul>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-3 text-right align-middle font-semibold text-gray-800">
                {numberFormat(item.cartTotal)}
              </td>
              <td className="px-4 py-3 text-center align-middle">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${getStatusColorForRow(
                    item.orderStatus
                  )}`}
                >
                  {translateStatusForRow(item.orderStatus)}
                </span>
              </td>
              <td className="px-4 py-3 text-center rounded-r-xl align-middle">
                {item.orderStatus === "CANCELLED" && (
                  <button
                    onClick={() => handleDeleteOrder(item.id)}
                    className="inline-flex items-center justify-center text-red-500 hover:text-red-700"
                    title="ลบคำสั่งซื้อ"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                {item.orderStatus === "DELIVERED" && (
                  <button
                    onClick={() => handlePrintOrder(item)}
                    className="inline-flex items-center justify-center text-blue-500 hover:text-blue-700 ml-2"
                    title="พิมพ์ใบสั่งซื้อ"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                )}
                <div className="mt-2">
                  <select
                    className="border rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-300 bg-white"
                    value={translateStatusSelectValue(item.orderStatus)}
                    onChange={(e) =>
                      handleChangeOrderStatus(item.id, e.target.value)
                    }
                  >
                    <option value="รอดำเนินการ">รอดำเนินการ</option>
                    <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                    <option value="จัดส่งสำเร็จ">จัดส่งสำเร็จ</option>
                    <option value="ยกเลิก">ยกเลิก</option>
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
        <div className="text-sm text-gray-600">
          แสดง {startIndex + 1} -{" "}
          {Math.min(startIndex + pageSize, filteredOrders.length)} จาก{" "}
          {filteredOrders.length} รายการ
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-white border rounded text-sm"
            disabled={current <= 1}
          >
            ก่อนหน้า
          </button>
          <span className="text-sm text-gray-700">
            หน้า {current} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 bg-white border rounded text-sm"
            disabled={current >= totalPages}
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper translations localized for the table body
function getStatusColorForRow(status) {
  switch (status) {
    case "NOT_PROCESSED":
    case "รอดำเนินการ":
      return "bg-gray-100 text-gray-700 ring-gray-200";
    case "PROCESSING":
    case "กำลังดำเนินการ":
      return "bg-yellow-100 text-yellow-700 ring-yellow-200";
    case "DELIVERED":
    case "จัดส่งสำเร็จ":
      return "bg-green-100 text-green-700 ring-green-200";
    case "CANCELLED":
    case "ยกเลิก":
      return "bg-red-100 text-red-700 ring-red-200";
    default:
      return "bg-gray-100 text-gray-600 ring-gray-200";
  }
}

function translateStatusForRow(status) {
  switch (status) {
    case "NOT_PROCESSED":
    case "รอดำเนินการ":
      return (
        <>
          <Clock className="inline w-4 h-4 mr-1 text-gray-400" />
          รอดำเนินการ
        </>
      );
    case "PROCESSING":
    case "กำลังดำเนินการ":
      return (
        <>
          <Loader2 className="inline w-4 h-4 mr-1 text-blue-500 animate-spin" />
          กำลังดำเนินการดกดิ
        </>
      );
    case "DELIVERED":
    case "จัดส่งสำเร็จ":
      return (
        <>
          <CheckCircle2 className="inline w-4 h-4 mr-1 text-green-600" />
          จัดส่งสำเร็จ
        </>
      );
    case "CANCELLED":
    case "ยกเลิก":
      return (
        <>
          <XCircle className="inline w-4 h-4 mr-1 text-red-500" />
          ยกเลิก
        </>
      );
    default:
      return status;
  }
}

function translateStatusSelectValue(status) {
  switch (status) {
    case "NOT_PROCESSED":
      return "รอดำเนินการ";
    case "PROCESSING":
      return "กำลังดำเนินการ";
    case "DELIVERED":
      return "จัดส่งสำเร็จ";
    case "CANCELLED":
      return "ยกเลิก";
    default:
      return "รอดำเนินการ";
  }
}
