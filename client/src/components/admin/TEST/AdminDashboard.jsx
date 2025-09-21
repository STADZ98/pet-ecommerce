import React, { useEffect, useState } from "react";
import { getOrdersAdmin, getSalesSummary } from "../../api/admin";
import useEcomeStore from "../../store/ecom-store";
import { numberFormat } from "../../utils/number";
import { Bar, Line, Pie } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import {
  Loader2,
  TrendingUp,
  Sparkles,
  X,
  ShoppingCart,
  Users,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const statusMap = {
  "Not Process": {
    label: "ยังไม่ดำเนินการ",
    color: "bg-gray-200 text-gray-700",
    icon: <Loader2 className="inline-block mr-1 animate-spin" size={16} />,
  },
  Processing: {
    label: "กำลังดำเนินการ",
    color: "bg-yellow-100 text-yellow-700",
    icon: (
      <TrendingUp
        className="inline-block mr-1 text-yellow-400 animate-pulse"
        size={16}
      />
    ),
  },
  Completed: {
    label: "เสร็จสิ้น",
    color: "bg-green-100 text-green-700",
    icon: (
      <span className="inline-block mr-1 text-green-500 animate-pulse">
        <Sparkles size={16} className="inline-block" />
      </span>
    ),
  },
  Cancelled: {
    label: "ยกเลิก",
    color: "bg-red-100 text-red-700",
    icon: <X className="inline-block mr-1 text-red-400" size={16} />,
  },
};

const AdminDashboard = () => {
  const token = useEcomeStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [categoryBuyerData, setCategoryBuyerData] = useState([]); // เพิ่ม state สำหรับกราฟ category
  const [categoryChartData, setCategoryChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    if (!token) return;
    Promise.all([getOrdersAdmin(token), getSalesSummary(token)])
      .then(([ordersRes, summaryRes]) => {
        setOrders(ordersRes.data);
        setSummary(summaryRes.data);

        const salesByDay = {};
        ordersRes.data.forEach((order) => {
          const date = new Date(order.createdAt).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          salesByDay[date] = (salesByDay[date] || 0) + order.cartTotal;
        });

        const sortedDates = Object.keys(salesByDay).sort(
          (a, b) =>
            new Date(a.split("/").reverse().join("-")) -
            new Date(b.split("/").reverse().join("-"))
        );

        setDailySales(
          sortedDates.map((date) => ({
            date,
            total: salesByDay[date],
          }))
        );

        // --------- สร้างข้อมูลกราฟ Category ---------
        // categoryCountMap: { [categoryName]: จำนวนสินค้าทั้งหมดในหมวดหมู่นั้น }
        const categoryCountMap = {};
        ordersRes.data.forEach((order) => {
          order.products?.forEach((p) => {
            const cat = p.product?.category?.name || "ไม่ระบุ";
            if (!categoryCountMap[cat]) categoryCountMap[cat] = 0;
            categoryCountMap[cat] += p.count || 0;
          });
        });
        const categoryLabels = Object.keys(categoryCountMap);
        const categoryCounts = Object.values(categoryCountMap);

        setCategoryChartData({
          labels: categoryLabels,
          datasets: [
            {
              label: "จำนวนสินค้าตามหมวดหมู่ (รวมทุกออเดอร์)",
              data: categoryCounts,
              backgroundColor: "rgba(59,130,246,0.7)",
              borderColor: "rgba(59,130,246,1)",
              borderWidth: 2,
              borderRadius: 14,
              hoverBackgroundColor: "rgba(59,130,246,1)",
            },
          ],
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-400 mb-4" size={48} />
        <p className="text-center text-xl text-blue-700 font-bold">
          ⏳ กำลังโหลดข้อมูล...
        </p>
      </div>
    );
  }

  // Chart Data
  const chartData = {
    labels: ["จำนวนคำสั่งซื้อ", "จำนวนผู้ใช้"],
    datasets: [
      {
        label: "สถิติรวม",
        data: [summary.totalOrders, summary.totalUsers],
        backgroundColor: [
          "rgba(59, 130, 246, 0.85)",
          "rgba(234, 179, 8, 0.85)",
        ],
        borderColor: ["rgba(59, 130, 246, 1)", "rgba(234, 179, 8, 1)"],
        borderWidth: 2,
        borderRadius: 18,
        hoverBackgroundColor: ["rgba(59, 130, 246, 1)", "rgba(234, 179, 8, 1)"],
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 8,
        shadowColor: "rgba(0,0,0,0.08)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "📊 จำนวนคำสั่งซื้อและจำนวนผู้ใช้",
        font: { size: 20, weight: "bold" },
        color: "#2563eb",
        padding: { top: 10, bottom: 30 },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#2563eb",
        bodyColor: "#333",
        borderColor: "#2563eb",
        borderWidth: 1,
        padding: 12,
        caretSize: 8,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#2563eb", font: { weight: "bold" } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#e0e7ef", borderDash: [4, 4] },
        ticks: { color: "#2563eb", font: { weight: "bold" } },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutBounce",
    },
  };

  const dailySalesChartData = {
    labels: dailySales.map((d) => d.date),
    datasets: [
      {
        label: "ยอดขายรายวัน (บาท)",
        data: dailySales.map((d) => d.total),
        fill: true,
        backgroundColor: (context) => {
          // ไล่เฉดสีฟ้า-เขียว
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(59,130,246,0.25)");
          gradient.addColorStop(1, "rgba(16,185,129,0.10)");
          return gradient;
        },
        borderColor: "rgba(59,130,246,1)",
        tension: 0.4,
        pointBackgroundColor: "rgba(234,179,8,1)",
        pointBorderColor: "#fff",
        pointRadius: 7,
        pointHoverRadius: 12,
        pointStyle: "circle",
        borderWidth: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 8,
        shadowColor: "rgba(0,0,0,0.08)",
      },
    ],
  };

  const dailySalesChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: "#2563eb", font: { weight: "bold" } },
      },
      title: {
        display: true,
        text: "📈 กราฟยอดขายรายวัน",
        font: { size: 20, weight: "bold" },
        color: "#2563eb",
        padding: { top: 10, bottom: 30 },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#2563eb",
        bodyColor: "#333",
        borderColor: "#2563eb",
        borderWidth: 1,
        padding: 12,
        caretSize: 8,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (ctx) => ` ${numberFormat(ctx.parsed.y)} บาท`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#2563eb", font: { weight: "bold" } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#e0e7ef", borderDash: [4, 4] },
        ticks: {
          color: "#2563eb",
          font: { weight: "bold" },
          callback: (v) => numberFormat(v),
        },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
  };

  const categoryChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "📦 จำนวนสินค้าตามหมวดหมู่ (รวมทุกออเดอร์)",
        font: { size: 16, weight: "bold" },
        color: "#2563eb",
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#2563eb",
        bodyColor: "#333",
        borderColor: "#2563eb",
        borderWidth: 1,
        padding: 12,
        caretSize: 8,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#2563eb", font: { weight: "bold" } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#e0e7ef", borderDash: [4, 4] },
        ticks: { color: "#2563eb", font: { weight: "bold" } },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutBounce",
    },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-white via-blue-50 to-slate-50 min-h-screen rounded-3xl shadow-2xl overflow-x-hidden space-y-16">
      <h1 className="text-4xl font-extrabold text-blue-900 flex items-center gap-3 drop-shadow mb-6">
        <span className="text-5xl animate-wiggle">📋</span> Admin Dashboard
      </h1>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <SummaryCard
          color="green"
          icon={
            <TrendingUp size={36} className="text-green-700 drop-shadow-glow" />
          }
          title="ยอดขายรวม"
          value={`${numberFormat(summary.totalSales)} บาท`}
        />
        <SummaryCard
          color="blue"
          icon={
            <ShoppingCart
              size={36}
              className="text-blue-500 drop-shadow-glow"
            />
          }
          title="จำนวนคำสั่งซื้อ"
          value={summary.totalOrders}
        />
        <SummaryCard
          color="yellow"
          icon={
            <Users size={36} className="text-yellow-400 drop-shadow-glow" />
          }
          title="จำนวนผู้ใช้"
          value={summary.totalUsers}
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="📊 คำสั่งซื้อและผู้ใช้">
          <Bar data={chartData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="📦 สินค้าตามหมวดหมู่">
          <Bar data={categoryChartData} options={categoryChartOptions} />
        </ChartCard>
      </section>

      {/* Daily Sales Line Chart */}
      <ChartCard title="📈 กราฟยอดขายรายวัน">
        <Line data={dailySalesChartData} options={dailySalesChartOptions} />
      </ChartCard>

      {/* Orders Table */}
      <section className="space-y-4 max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">📦</span> คำสั่งซื้อทั้งหมด
        </h2>

        {orders.length === 0 ? (
          <p className="text-gray-500 italic text-center py-8">
            ยังไม่มีคำสั่งซื้อในระบบ
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-md border border-gray-300 bg-white">
            <table className="min-w-full text-left divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase tracking-wide">
                    ลำดับ
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-600 uppercase tracking-wide">
                    ผู้สั่งซื้อ
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    วันที่
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase tracking-wide">
                    สถานะ
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    ยอดรวม
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase tracking-wide">
                    การจัดการ
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className="hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="px-3 py-2 text-center font-medium text-gray-700 whitespace-nowrap">
                      {idx + 1}
                    </td>

                    <td className="px-3 py-2 font-medium text-gray-800 truncate max-w-[180px]">
                      {order.orderedBy?.email || order.email || "ไม่ระบุ"}
                    </td>

                    <td className="px-3 py-2 text-center text-gray-600 whitespace-nowrap text-xs">
                      {new Date(order.createdAt).toLocaleString("th-TH", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </td>

                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-[12px] font-semibold shadow-sm gap-1 ${
                          statusMap[order.orderStatus]?.color ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusMap[order.orderStatus]?.icon}
                        {statusMap[order.orderStatus]?.label ||
                          order.orderStatus}
                      </span>
                    </td>

                    <td className="px-3 py-2 text-right font-semibold text-gray-700 whitespace-nowrap">
                      {numberFormat(order.cartTotal)}{" "}
                      <span className="text-xs text-gray-400">บาท</span>
                    </td>

                    <td className="px-3 py-2 text-center">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md shadow-sm text-xs font-semibold transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onClick={() => setSelectedOrder(order)}
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 md:p-8 relative overflow-hidden">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
                onClick={() => setSelectedOrder(null)}
                title="ปิด"
                aria-label="Close modal"
              >
                ×
              </button>

              {/* Title */}
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                รายละเอียดคำสั่งซื้อ
              </h3>

              {/* Buyer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
                <div>
                  <span className="font-semibold">ผู้สั่งซื้อ:</span>{" "}
                  {selectedOrder.name ||
                    selectedOrder.orderedBy?.name ||
                    "ไม่ระบุ"}
                </div>
                <div>
                  <span className="font-semibold">ที่อยู่:</span>{" "}
                  {selectedOrder.orderedBy?.address || "ไม่ระบุ"}
                </div>
                <div>
                  <span className="font-semibold">ที่อยู่:</span>{" "}
                  {selectedOrder.orderedBy?.telephone || "ไม่ระบุ"}
                </div>
                <div>
                  <span className="font-semibold">วันที่:</span>{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("th-TH", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
                <div>
                  <span className="font-semibold">สถานะ:</span>{" "}
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow gap-1 ${
                      statusMap[selectedOrder.orderStatus]?.color ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {statusMap[selectedOrder.orderStatus]?.icon}
                    {statusMap[selectedOrder.orderStatus]?.label ||
                      selectedOrder.orderStatus}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">ยอดรวม:</span>{" "}
                  <span className="text-gray-800 font-bold text-base bg-gray-100 px-3 py-1 rounded-lg shadow-sm">
                    {numberFormat(selectedOrder.cartTotal)}{" "}
                    <span className="text-xs text-gray-500">บาท</span>
                  </span>
                </div>
              </div>

              {/* Product Table */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">
                  รายการสินค้า:
                </h4>
                <div className="overflow-x-auto rounded-xl border">
                  <table className="min-w-full bg-white text-sm text-gray-700">
                    <thead>
                      <tr className="bg-gray-100 text-gray-800 text-xs uppercase tracking-wider">
                        <th className="px-3 py-2 text-center">ลำดับ</th>
                        <th className="px-3 py-2 text-center">รูป</th>
                        <th className="px-3 py-2 text-left">ชื่อสินค้า</th>
                        <th className="px-3 py-2 text-left">หมวดหมู่</th>
                        <th className="px-3 py-2 text-center">จำนวน</th>
                        <th className="px-3 py-2 text-right">ราคา/ชิ้น</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.products?.map((p, idx) => {
                        if (!p.product) return null;

                        let imgSrc = "https://placehold.co/60x60?text=No+Image";
                        if (
                          Array.isArray(p.product.images) &&
                          p.product.images.length > 0
                        ) {
                          const img = p.product.images[0];
                          if (typeof img === "string") {
                            imgSrc = img;
                          } else if (
                            img &&
                            typeof img === "object" &&
                            img.url
                          ) {
                            imgSrc = img.url;
                          }
                        }

                        return (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50 transition-all duration-200"
                          >
                            <td className="px-3 py-2 text-center font-bold">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <img
                                src={imgSrc}
                                alt={p.product.title}
                                className="w-14 h-14 object-cover rounded-lg border mx-auto shadow-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <div className="font-semibold">
                                {p.product.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {p.product.description || "ไม่มีรายละเอียด"}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm">
                              {typeof p.product.category === "string"
                                ? p.product.category
                                : p.product.category?.name || "ไม่ระบุ"}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {p.count} {p.product.unit}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {numberFormat(p.product.price)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const SummaryCard = ({ color, icon, title, value }) => {
  const bg = {
    green:
      "from-green-100 to-green-200 text-green-900 border-green-300 shadow-green-200",
    blue: "from-sky-100 to-sky-200 text-sky-900 border-sky-300 shadow-sky-200",
    yellow:
      "from-yellow-100 to-yellow-200 text-yellow-900 border-yellow-300 shadow-yellow-200",
  }[color];

  return (
    <div
      className={`p-6 rounded-xl shadow-lg border bg-gradient-to-br ${bg} 
      flex flex-col items-center justify-center hover:scale-105 transform transition-all duration-300 relative overflow-hidden`}
    >
      <div className="text-5xl mb-2 drop-shadow">{icon}</div>
      <h2 className="text-md font-semibold mb-1">{title}</h2>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
};

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100 hover:shadow-2xl transition animate-fade-in">
    <h3 className="text-lg font-bold text-blue-700 mb-4">{title}</h3>
    {children}
  </div>
);

export default AdminDashboard;
