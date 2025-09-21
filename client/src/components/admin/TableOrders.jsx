import React, { useEffect, useState } from "react";
import OrdersSummary from "./table/OrdersSummary";
import OrdersToolbar from "./table/OrdersToolbar";
import OrdersTableBody from "./table/OrdersTableBody";
import OrderDetailsModal from "./table/OrderDetailsModal";
import ProductDetailModal from "./table/ProductDetailModal";
import { FileText } from "lucide-react";
import { getOrdersAdmin, deleteOrder } from "../../api/admin";
import useEcomStore from "../../store/ecom-store";
import { dateFormatTH } from "../../utils/dateformat";

export default function TableOrders() {
  const token = useEcomStore((s) => s.token);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orders, setOrders] = useState([]); // full list from server
  const [loading, setLoading] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [current, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      if (!token) {
        setFilteredOrders([]);
        return;
      }
      setLoading(true);
      try {
        const resp = await getOrdersAdmin(token);
        if (!mounted) return;
        const payload = resp?.data;
        // API returns { page, perPage, orders: [...] } — support both shapes
        const dataArray = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.orders)
          ? payload.orders
          : [];
        const normalized = dataArray.map((o) => ({
          ...o,
          id: o.id || o._id || o.orderId || o.id,
        }));
        setOrders(normalized);
        setFilteredOrders(normalized);
      } catch (err) {
        console.error("Failed to load admin orders:", err);
        setFilteredOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      mounted = false;
    };
  }, [token]);

  // Recompute filteredOrders when any filter/search/pageSize/orders change
  useEffect(() => {
    const st = searchTerm?.trim().toLowerCase();
    const startDate = filterStart ? new Date(filterStart) : null;
    const endDate = filterEnd ? new Date(filterEnd) : null;

    const filtered = (orders || []).filter((o) => {
      // date filter (order createdAt)
      if (startDate || endDate) {
        const created = o.createdAt ? new Date(o.createdAt) : null;
        if (created) {
          if (startDate && created < startDate) return false;
          if (endDate) {
            // include the whole end day
            const dayEnd = new Date(endDate);
            dayEnd.setHours(23, 59, 59, 999);
            if (created > dayEnd) return false;
          }
        }
      }

      // status filter
      if (filterStatus && filterStatus !== "ALL") {
        const statusText = o.orderStatusText || o.orderStatus || "";
        if ((statusText || "").toString() !== filterStatus) return false;
      }

      // search term across id, email, name, paymentId
      if (st) {
        const hay = [
          o.id,
          o._id,
          o.orderId,
          o.email,
          o.orderedBy?.email,
          o.name,
          o.orderedBy?.name,
          o.paymentId,
          o.trackingCode,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase())
          .join(" ");
        if (!hay.includes(st)) return false;
      }

      return true;
    });

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, searchTerm, filterStart, filterEnd, filterStatus, pageSize]);

  // Listen for status changes dispatched by modal and update list
  useEffect(() => {
    function onStatusChanged(e) {
      const updated = e?.detail;
      if (!updated) return;
      setFilteredOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
      );
      if (viewOrder && (viewOrder.id || viewOrder._id) === updated.id) {
        setViewOrder((prev) => ({ ...(prev || {}), ...updated }));
      }
    }
    if (typeof window !== "undefined")
      window.addEventListener("order:statusChanged", onStatusChanged);
    return () => {
      if (typeof window !== "undefined")
        window.removeEventListener("order:statusChanged", onStatusChanged);
    };
  }, [viewOrder]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStart("");
    setFilterEnd("");
    setFilterStatus("ALL");
    setPageSize(10);
    setCurrentPage(1);
  };

  // handle change order status from table or modal
  const handleChangeOrderStatus = async (orderId, thaiStatus) => {
    if (!token) return alert("ต้องมีสิทธิ์ผู้ดูแล");
    try {
      // optimistic update: update local state while calling API
      setFilteredOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, orderStatusText: thaiStatus } : o
        )
      );
      const resp = await import("../../api/admin").then((m) =>
        m.changeOrderStatus(token, orderId, thaiStatus)
      );
      const updated = resp?.data || resp;
      // reconcile updated order in list
      setFilteredOrders((prev) =>
        prev.map((o) =>
          o.id === (updated.id || orderId) ? { ...o, ...updated } : o
        )
      );
      // if modal open for same order, refresh it
      if (
        viewOrder &&
        (viewOrder.id || viewOrder._id) === (updated.id || orderId)
      ) {
        setViewOrder((prev) => ({ ...(prev || {}), ...updated }));
      }
    } catch (err) {
      console.error("Failed to change order status", err);
      alert(
        "ไม่สามารถเปลี่ยนสถานะได้: " +
          (err?.response?.data?.message || err.message || err)
      );
    }
  };

  const handlePrintOrder = (order) => {
    try {
      const w = window.open("", "_blank");
      if (!w) return alert("ไม่สามารถเปิดหน้าต่างพิมพ์ได้");
      const html = `
      <html>
      <head>
        <title>ใบสั่งซื้อ ${order.id}</title>
        <style>
          body{font-family: Arial, Helvetica, sans-serif; padding:20px}
          table{width:100%; border-collapse:collapse}
          th,td{border:1px solid #ddd;padding:8px;text-align:left}
          th{background:#f3f4f6}
        </style>
      </head>
      <body>
        <h2>ใบสั่งซื้อ: ${order.id}</h2>
        <div>วันที่: ${dateFormatTH(order.createdAt)}</div>
        <div>ลูกค้า: ${order.name || order.orderedBy?.name || "-"}</div>
        <div>อีเมล: ${order.email || order.orderedBy?.email || "-"}</div>
        <h3>รายการสินค้า</h3>
        <table>
          <thead><tr><th>#</th><th>สินค้า</th><th>ราคา</th><th>จำนวน</th><th>รวม</th></tr></thead>
          <tbody>
            ${order.products
              .map(
                (p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${(p.product?.title || "").replace(/</g, "&lt;")}${
                  p.variant?.title ? " — " + p.variant.title : ""
                }</td>
                  <td>${(
                    p.price ||
                    p.variant?.price ||
                    p.product?.price ||
                    0
                  ).toLocaleString()}</td>
                  <td>${p.count}</td>
                  <td>${(
                    (p.price || p.variant?.price || p.product?.price || 0) *
                    (p.count || 0)
                  ).toLocaleString()}</td>
                </tr>
              `
              )
              .join("")}
          </tbody>
        </table>
        <h3>สรุปยอด</h3>
        <div>รวม: ${Number(order.cartTotal || 0).toLocaleString()} บาท</div>
      </body>
      </html>
      `;
      w.document.open();
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 300);
    } catch (err) {
      console.error("print error", err);
      alert("เกิดข้อผิดพลาดขณะพิมพ์");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!token) return alert("ต้องมีสิทธิ์ผู้ดูแล");
    if (
      !confirm("ยืนยันการลบคำสั่งซื้อ? นี่คือการกระทำที่ไม่สามารถย้อนกลับได้")
    )
      return;
    try {
      await deleteOrder(token, orderId);
      // remove from local lists
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setFilteredOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error("deleteOrder error", err);
      alert(
        "ลบคำสั่งซื้อไม่สำเร็จ: " +
          (err?.response?.data?.message || err.message || err)
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 bg-white min-h-screen">
      <OrdersSummary filteredOrders={filteredOrders} />

      <OrdersToolbar
        filterStart={filterStart}
        filterEnd={filterEnd}
        setFilterStart={setFilterStart}
        setFilterEnd={setFilterEnd}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        resetFilters={resetFilters}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />

      {loading ? (
        <div className="text-center py-20 text-blue-600 font-semibold text-lg">
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500 text-lg flex flex-col items-center">
          <FileText className="w-10 h-10 text-gray-300 mb-2" />
          ไม่มีข้อมูลคำสั่งซื้อในขณะนี้
        </div>
      ) : (
        <OrdersTableBody
          paginatedOrders={filteredOrders}
          startIndex={0}
          filteredOrders={filteredOrders}
          pageSize={pageSize}
          current={current}
          totalPages={Math.max(1, Math.ceil(filteredOrders.length / pageSize))}
          setCurrentPage={setCurrentPage}
          dateFormat={(d) => dateFormatTH(d)}
          setViewOrder={setViewOrder}
          handleChangeOrderStatus={handleChangeOrderStatus}
          handleDeleteOrder={handleDeleteOrder}
          handlePrintOrder={handlePrintOrder}
        />
      )}

      <OrderDetailsModal
        viewOrder={viewOrder}
        setViewOrder={setViewOrder}
        dateFormatTH={dateFormatTH}
        shippingEdits={{}}
        setShippingEdits={() => {}}
        shippingSaving={{}}
        shippingSaved={{}}
        copyToClipboard={() => {}}
        carrierTrackingUrl={() => null}
        validateTracking={() => true}
        generateAdminTracking={() => {}}
        token={token}
        generateTrackingCode={() => "TRK-XXXXX"}
        trackingPlaceholder={() => "TRK-XXXXX"}
        handleSaveShippingInfo={() => {}}
      />

      <ProductDetailModal
        viewProduct={viewProduct}
        setViewProduct={setViewProduct}
      />
    </div>
  );
}
