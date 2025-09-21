import React, { useEffect, useState, useMemo, useRef } from "react";
// import { useNavigate } from "react-router-dom";
import { getOrdersAdmin, getSalesSummary } from "../../api/admin";
import useEcomeStore from "../../store/ecom-store";
import { numberFormat } from "../../utils/number";
import { Bar, Line, Pie } from "react-chartjs-2";
import SummaryCard from "./SummaryCard";
import ChartCard from "./ChartCard";
import ProductDetailModal from "./ProductDetailModal";
import OrderDetailModal from "./OrderDetailModal";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
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
  Package,
  Coins,
  Award,
  ClipboardList,
  DollarSign,
  ImageIcon,
  User,
  MapPin,
  Phone,
  Calendar,
  Tag,
  Hash,
  ShoppingBag,
  Info,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  Wallet,
  Search,
} from "lucide-react";
// Shared helpers and maps are moved to adminHelpers for reuse

import {
  statusMap,
  getProductImage,
  getProductTitle,
  getUnitPrice,
  toNumber,
} from "./adminHelpers";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// helpers imported above

const AdminDashboard = () => {
  const token = useEcomeStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // State for Order Detail Modal
  const [selectedProduct, setSelectedProduct] = useState(null); // State for Product Detail Modal
  const [dailySales, setDailySales] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [topProducts, setTopProducts] = useState([]);
  const [search, setSearch] = useState("");
  // New filters: date range and status
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [_showToast, setShowToast] = useState(false);
  const prevOrdersCount = useRef(0);
  // const navigate = useNavigate(); // unused - removed

  useEffect(() => {
    if (!token) {
      setLoading(false); // If no token, stop loading
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersRes, summaryRes] = await Promise.all([
          getOrdersAdmin(token),
          getSalesSummary(token),
        ]);

        // API returns { page, perPage, orders: [...] } — normalize to an array
        const ordersArray = Array.isArray(ordersRes.data)
          ? ordersRes.data
          : Array.isArray(ordersRes.data?.orders)
          ? ordersRes.data.orders
          : [];

        setOrders(ordersArray);
        // Initialize filteredOrders so Recent Orders table shows results before filters applied
        setFilteredOrders(ordersArray);
        setSummary(
          summaryRes.data || { totalSales: 0, totalOrders: 0, totalUsers: 0 }
        );

        // --- Daily Sales Calculation ---
        const salesByDay = {};
        if (Array.isArray(ordersArray)) {
          ordersArray.forEach((order) => {
            if (order && order.createdAt) {
              const ct =
                typeof order.cartTotal === "number"
                  ? order.cartTotal
                  : toNumber(order.cartTotal) || 0;
              // skip zero amounts to avoid noisy dates
              if (ct === 0) return;
              const date = new Date(order.createdAt).toLocaleDateString(
                "th-TH",
                {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }
              );
              salesByDay[date] = (salesByDay[date] || 0) + ct;
            }
          });
        }

        const sortedDates = Object.keys(salesByDay).sort((a, b) => {
          const [dayA, monthA, yearA] = a.split("/").map(Number);
          const [dayB, monthB, yearB] = b.split("/").map(Number);
          const dateA = new Date(yearA, monthA - 1, dayA);
          const dateB = new Date(yearB, monthB - 1, dayB);
          return dateA.getTime() - dateB.getTime();
        });

        setDailySales(
          sortedDates.map((date) => ({
            date,
            total: salesByDay[date],
          }))
        );

        // --- Category Chart Data Calculation ---
        const categoryCountMap = {};
        if (Array.isArray(ordersArray)) {
          ordersArray.forEach((order) => {
            if (Array.isArray(order.products)) {
              order.products.forEach((p) => {
                if (
                  p &&
                  p.product &&
                  p.product.category &&
                  typeof p.count === "number"
                ) {
                  const cat = p.product.category.name || "ไม่ระบุ";
                  if (!categoryCountMap[cat]) categoryCountMap[cat] = 0;
                  categoryCountMap[cat] += p.count;
                }
              });
            }
          });
        }

        const categoryLabels = Object.keys(categoryCountMap);
        const categoryCounts = Object.values(categoryCountMap);

        const backgroundColors = [
          "#93C5FD", // Light Blue
          "#A7F3D0", // Light Green
          "#FDE68A", // Light Yellow
          "#FCA5A5", // Light Red
          "#D8B4FE", // Light Purple
          "#FED7AA", // Light Orange
          "#BFDBFE", // Lighter Blue
          "#D1FAE5", // Lighter Green
          "#FEF3C7", // Lighter Yellow
          "#FEE2E2", // Lighter Red
          "#E9D5FF", // Lighter Purple
          "#FFEDD5", // Lighter Orange
        ];

        const borderColors = backgroundColors.map((color) =>
          color.replace("0.9", "1")
        );

        setCategoryChartData({
          labels: categoryLabels,
          datasets: [
            {
              label: "จำนวนสินค้าตามหมวดหมู่",
              data: categoryCounts,
              backgroundColor: backgroundColors.slice(0, categoryLabels.length),
              borderColor: borderColors.slice(0, categoryLabels.length),
              borderWidth: 1,
              hoverOffset: 8,
            },
          ],
        });

        // --- Top Products Calculation ---
        const productCountMap = {};
        if (Array.isArray(ordersArray)) {
          ordersArray.forEach((order) => {
            if (Array.isArray(order.products)) {
              order.products.forEach((p) => {
                if (p && p.product && typeof p.count === "number") {
                  // Determine variant id and product id safely (p.product may be string or object)
                  const variantId = p.variant?.id || p.variant?._id || null;
                  const productId =
                    typeof p.product === "string"
                      ? p.product
                      : p.product?._id || p.product?.id || null;
                  // Prefix non-variant keys to avoid collision with variant_ keys
                  const key = variantId
                    ? `variant_${variantId}`
                    : productId
                    ? `product_${productId}`
                    : null;
                  if (!key) return;

                  if (!productCountMap[key]) {
                    // Determine display values, prefer variant fields
                    const title = getProductTitle(p);
                    const image = getProductImage(p);
                    const price = getUnitPrice(p);

                    productCountMap[key] = {
                      id: key,
                      title,
                      image,
                      count: 0,
                      price,
                    };
                  }
                  productCountMap[key].count += p.count;
                }
              });
            }
          });
        }

        const sortedProducts = Object.values(productCountMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        setTopProducts(sortedProducts);
      } catch {
        // console.error("Error fetching admin dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Filter orders (supports text search, date range and status filter)
  useEffect(() => {
    const q = (search || "").trim().toLowerCase();

    let result = Array.isArray(orders) ? [...orders] : [];

    // Text search
    if (q) {
      result = result.filter((order) => {
        const name = (
          order.name ||
          order.address?.name ||
          order.orderedBy?.name ||
          ""
        ).toString();
        const email = (order.orderedBy?.email || order.email || "").toString();
        const status = (order.orderStatus || "").toString();
        const addressStr = order.address
          ? [order.address.address, order.address.name, order.address.telephone]
              .filter(Boolean)
              .join(" ")
          : "";
        const telephone = (
          order.address?.telephone ||
          order.orderedBy?.telephone ||
          order.telephone ||
          ""
        ).toString();
        const createdAt = (order.createdAt || "").toString();

        return (
          name.toLowerCase().includes(q) ||
          email.toLowerCase().includes(q) ||
          status.toLowerCase().includes(q) ||
          addressStr.toLowerCase().includes(q) ||
          telephone.toLowerCase().includes(q) ||
          createdAt.toLowerCase().includes(q)
        );
      });
    }

    // Status filter (exact match of orderStatus key)
    if (statusFilter) {
      result = result.filter((o) => (o.orderStatus || "") === statusFilter);
    }

    // Date range filters (inclusive)
    if (startDate) {
      const start = new Date(startDate + "T00:00:00");
      result = result.filter((o) => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return d >= start;
      });
    }
    if (endDate) {
      const end = new Date(endDate + "T23:59:59");
      result = result.filter((o) => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return d <= end;
      });
    }

    setFilteredOrders(result);
  }, [orders, search, startDate, endDate, statusFilter]);

  // Notification for new orders
  useEffect(() => {
    if (orders.length > prevOrdersCount.current) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    }
    prevOrdersCount.current = orders.length;
  }, [orders]);

  // Daily Sales Chart Data and Options (Adjusted colors for muted theme)
  const dailySalesChartData = useMemo(
    () => ({
      labels: dailySales.map((d) => d.date),
      datasets: [
        {
          label: "ยอดขายรายวัน (บาท)",
          data: dailySales.map((d) => d.total),
          fill: true,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, "rgba(147,197,253,0.4)"); // Light blue, more subtle
            gradient.addColorStop(0.5, "rgba(96,165,250,0.2)"); // Muted blue
            gradient.addColorStop(1, "rgba(255,255,255,0.05)");
            return gradient;
          },
          borderColor: "#60A5FA", // Muted blue
          tension: 0.4, // Slightly smoother curve
          pointBackgroundColor: "#3B82F6", // Primary blue for points
          pointBorderColor: "#fff",
          pointRadius: 5,
          pointHoverRadius: 8,
          pointStyle: "circle",
          borderWidth: 2,
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
        },
      ],
    }),
    [dailySales]
  );

  const dailySalesChartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#4B5563", // Muted gray for legend
            font: { weight: "bold", size: 13 },
            boxWidth: 18,
          },
        },
        title: {
          display: true,

          font: { size: 20, weight: "bold", family: "Kanit, sans-serif" },
          color: "#374151", // Darker gray for title
          padding: { top: 15, bottom: 25 },
        },
        tooltip: {
          backgroundColor: "rgba(255,255,255,0.9)",
          titleColor: "#374151",
          bodyColor: "#4B5563",
          borderColor: "#D1D5DB", // Light gray border
          borderWidth: 1,
          padding: 12,
          caretSize: 8,
          cornerRadius: 8,
          displayColors: true,
          bodyFont: { size: 13 },
          titleFont: { size: 15, weight: "bold" },
          callbacks: {
            label: (ctx) => `${numberFormat(ctx.parsed.y)} บาท`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#6B7280", font: { size: 12 } }, // Muted gray for axis labels
        },
        y: {
          beginAtZero: true,
          grid: { color: "#E5E7EB", borderDash: [4, 4] }, // Lighter grid lines
          ticks: {
            color: "#6B7280",
            font: { size: 12 },
            callback: (v) => numberFormat(v),
          },
        },
      },
      animation: {
        duration: 1200, // Slightly faster animation
        easing: "easeOutQuart", // Smoother easing
      },
    }),
    []
  );

  // Category Chart Options (Adjusted for muted theme)
  const categoryChartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "right",
          labels: {
            color: "#4B5563", // Muted gray for legend
            font: { weight: "bold", size: 13 },
            boxWidth: 18,
          },
        },
        title: {
          display: true,

          font: { size: 20, weight: "bold", family: "Kanit, sans-serif" },
          color: "#374151", // Darker gray for title
          padding: { top: 15, bottom: 25 },
        },
        tooltip: {
          backgroundColor: "rgba(255,255,255,0.9)",
          titleColor: "#374151",
          bodyColor: "#4B5563",
          borderColor: "#D1D5DB",
          borderWidth: 1,
          padding: 12,
          caretSize: 8,
          cornerRadius: 8,
          displayColors: true,
          bodyFont: { size: 13 },
          titleFont: { size: 15, weight: "bold" },
          callbacks: {
            label: (ctx) => {
              const label = ctx.label || "";
              const value = ctx.parsed || 0;
              const total = ctx.dataset.data.reduce(
                (acc, current) => acc + current,
                0
              );
              const percentage =
                total === 0 ? 0 : ((value / total) * 100).toFixed(2);
              return `${label}: ${value} ชิ้น (${percentage}%)`;
            },
          },
        },
      },
      animation: {
        duration: 1200,
        easing: "easeOutQuart",
      },
    }),
    []
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 rounded-3xl shadow-2xl dark:bg-gray-900 dark:text-gray-100 animate-fade-in">
        <Loader2 className="animate-spin text-blue-400 mb-6" size={72} />
        <p className="text-center text-3xl text-blue-700 font-extrabold drop-shadow-lg dark:text-blue-200 mb-2">
          ⏳ กำลังโหลดข้อมูลสำหรับ Admin Dashboard...
        </p>
        <p className="text-center text-lg text-gray-500 mt-2 dark:text-gray-400">
          กรุณารอสักครู่ กำลังเตรียมข้อมูลเชิงลึกให้คุณ
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-12 transition-colors animate-fade-in">
      {/* {showToast && (
        <div className="fixed top-6 right-6 z-[100] bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce-in text-base font-semibold flex items-center gap-2">
          <Sparkles size={20} className="mr-2 text-yellow-300 animate-pulse" />
          📦 มีคำสั่งซื้อใหม่เข้ามา!
        </div>
      )} */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                ภาพรวมแดชบอร์ด
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                สรุปภาพรวมธุรกิจ — ยอดขาย, คำสั่งซื้อ และสถิติสินค้าขายดี
              </p>
            </div>
            <div className="text-sm text-gray-400">
              อัปเดตล่าสุด: {new Date().toLocaleString("th-TH")}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <SummaryCard
            icon={<Coins size={44} className="text-green-500" />}
            title="ยอดขายรวม"
            value={`${numberFormat(summary.totalSales)} บาท`}
            description="รายได้ทั้งหมดจากคำสั่งซื้อที่เสร็จสมบูรณ์"
          />
          <SummaryCard
            icon={<ShoppingCart size={44} className="text-blue-500" />}
            title="จำนวนคำสั่งซื้อ"
            value={numberFormat(summary.totalOrders)}
            description="จำนวนคำสั่งซื้อทั้งหมดในระบบ"
          />
          <SummaryCard
            icon={<Users size={44} className="text-purple-500" />}
            title="จำนวนผู้ใช้"
            value={numberFormat(summary.totalUsers)}
            description="จำนวนผู้ใช้ที่ลงทะเบียนทั้งหมด"
          />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <ChartCard
            title="จำนวนสินค้าตามหมวดหมู่"
            className="col-span-1 min-h-[400px] flex flex-col justify-center"
          >
            {categoryChartData.labels.length > 0 ? (
              <Pie data={categoryChartData} options={categoryChartOptions} />
            ) : (
              <div className="text-center text-gray-400 py-12 text-lg">
                ไม่มีข้อมูลหมวดหมู่สินค้า
              </div>
            )}
          </ChartCard>
          <ChartCard
            title="กราฟยอดขายรายวัน"
            className="lg:col-span-2 min-h-[400px] flex flex-col justify-center"
          >
            {dailySales.length > 0 ? (
              <Line
                data={dailySalesChartData}
                options={dailySalesChartOptions}
              />
            ) : (
              <div className="text-center text-gray-400 py-12 text-lg">
                ไม่มีข้อมูลยอดขายรายวัน
              </div>
            )}
          </ChartCard>
        </section>

        {/* Top Products Section (เปลี่ยนเป็น Bar chart แสดง 10 อันดับ) */}
        <section className="space-y-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3 mb-4">
            <Award size={28} className="text-yellow-500" /> สินค้าขายดี 10
            อันดับ
          </h2>

          {topProducts.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-10 text-center border border-gray-200">
              <p className="text-gray-400 italic text-xl">
                ✨ ยังไม่มีข้อมูลสินค้าขายดีในตอนนี้
              </p>
              <p className="text-gray-300 mt-2">รอการขายสินค้าชิ้นแรกของคุณ!</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Chart area */}
                <div className="lg:col-span-2">
                  <ChartCard
                    title="เปรียบเทียบ จำนวนชิ้นที่ขายได้ และ ยอดขาย (บาท)"
                    className="min-h-[420px]"
                  >
                    {topProducts.length > 0 ? (
                      (() => {
                        // Prepare chart data
                        const labels = topProducts.map((p) =>
                          p.title?.length > 30
                            ? p.title.slice(0, 28) + "…"
                            : p.title
                        );
                        const units = topProducts.map((p) =>
                          Number.isFinite(p.count)
                            ? p.count
                            : toNumber(p.count) || 0
                        );
                        const revenues = topProducts.map((p, idx) => {
                          const price = Number.isFinite(p.price)
                            ? p.price
                            : toNumber(p.price) || 0;
                          return (Number(units[idx]) || 0) * price;
                        });

                        const productChartData = {
                          labels,
                          datasets: [
                            {
                              type: "bar",
                              label: "จำนวนชิ้น (ชิ้น)",
                              data: units,
                              yAxisID: "y",
                              backgroundColor: "rgba(96,165,250,0.9)",
                              borderColor: "rgba(96,165,250,1)",
                              borderWidth: 1,
                              borderRadius: 6,
                              barThickness: 20,
                            },
                            {
                              type: "bar",
                              label: "ยอดขาย (บาท)",
                              data: revenues,
                              yAxisID: "y1",
                              backgroundColor: "rgba(253,186,116,0.95)",
                              borderColor: "rgba(249,115,22,1)",
                              borderWidth: 1,
                              borderRadius: 6,
                              barThickness: 20,
                            },
                          ],
                        };

                        const productChartOptions = {
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: {
                            mode: "index",
                            intersect: false,
                          },
                          plugins: {
                            legend: {
                              position: "top",
                              labels: {
                                color: "#374151",
                                boxWidth: 14,
                                padding: 12,
                                usePointStyle: true,
                              },
                            },
                            title: { display: false },
                            tooltip: {
                              backgroundColor: "rgba(255,255,255,0.95)",
                              titleColor: "#111827",
                              bodyColor: "#374151",
                              borderColor: "#E5E7EB",
                              borderWidth: 1,
                              padding: 10,
                              cornerRadius: 8,
                              displayColors: false,
                              callbacks: {
                                label: (ctx) => {
                                  const label = ctx.dataset.label || "";
                                  const val = ctx.parsed.y ?? ctx.parsed;
                                  if (label.includes("ยอดขาย")) {
                                    return `${label}: ${numberFormat(val)} บาท`;
                                  }
                                  return `${label}: ${numberFormat(val)} ชิ้น`;
                                },
                                title: (ctx) => {
                                  const index = ctx[0]?.dataIndex ?? 0;
                                  return (
                                    topProducts[index]?.title || labels[index]
                                  );
                                },
                              },
                            },
                          },
                          scales: {
                            x: {
                              ticks: {
                                color: "#6B7280",
                                maxRotation: 45,
                                minRotation: 0,
                                autoSkip: false,
                                callback: function (val, idx) {
                                  return this.getLabelForValue(idx);
                                },
                              },
                              grid: { display: false },
                            },
                            y: {
                              type: "linear",
                              display: true,
                              position: "left",
                              beginAtZero: true,
                              ticks: {
                                color: "#6B7280",
                                callback: (v) => numberFormat(v),
                              },
                              title: {
                                display: true,
                                text: "จำนวน (ชิ้น)",
                                color: "#6B7280",
                              },
                            },
                            y1: {
                              type: "linear",
                              display: true,
                              position: "right",
                              beginAtZero: true,
                              grid: { drawOnChartArea: false },
                              ticks: {
                                color: "#6B7280",
                                callback: (v) => numberFormat(v),
                              },
                              title: {
                                display: true,
                                text: "ยอดขาย (บาท)",
                                color: "#6B7280",
                              },
                            },
                          },
                          animation: { duration: 900, easing: "easeOutQuart" },
                        };

                        return (
                          <div style={{ height: 360 }}>
                            <Bar
                              data={productChartData}
                              options={productChartOptions}
                            />
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-center text-gray-400 py-12 text-lg">
                        ไม่มีข้อมูลสินค้าขายดี
                      </div>
                    )}
                  </ChartCard>
                </div>

                {/* Right-side concise list */}
                <div className="lg:col-span-1">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 h-full">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                      สรุป 10 อันดับ (เรียงจากมากไปน้อย)
                    </h4>
                    <ul className="space-y-3">
                      {topProducts.map((p, i) => {
                        const units = Number.isFinite(p.count)
                          ? p.count
                          : toNumber(p.count) || 0;
                        const price = Number.isFinite(p.price)
                          ? p.price
                          : toNumber(p.price) || 0;
                        const revenue = units * price;
                        return (
                          <li
                            key={p.id || i}
                            className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border hover:shadow-sm transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center border">
                                {p.image ? (
                                  <img
                                    src={p.image}
                                    alt={p.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        "https://placehold.co/40x40?text=No";
                                    }}
                                  />
                                ) : (
                                  <ImageIcon
                                    size={18}
                                    className="text-gray-400"
                                  />
                                )}
                              </div>
                              <div className="text-sm">
                                <div className="font-medium text-gray-800 line-clamp-1">
                                  {p.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  #{i + 1} — {numberFormat(units)} ชิ้น
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-blue-700">
                                {numberFormat(revenue)} ฿
                              </div>
                              <div className="text-xs text-gray-400">
                                ยอดรวม
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="mt-4 text-xs text-gray-500">
                      คลิกที่แถบกราฟเพื่อดูรายละเอียดสินค้า (ชื่อเต็มแสดงใน
                      tooltip)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Recent Orders Section */}
        <section className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3 mb-4">
            <ClipboardList size={28} className="text-indigo-500" />{" "}
            คำสั่งซื้อล่าสุด
          </h2>

          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
            {/* Filters: date range, status and search */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">จาก</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <label className="text-sm text-gray-600 ml-3">ถึง</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none"
                >
                  <option value="">สถานะทั้งหมด</option>
                  {Object.keys(statusMap).map((key) => (
                    <option key={key} value={key}>
                      {statusMap[key].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="ค้นหาคำสั่งซื้อ (ชื่อลูกค้า, อีเมล, เบอร์โทร)"
                    className="w-full p-4 pl-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-lg shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Search
                    size={22}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>

                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setStatusFilter("");
                    setSearch("");
                  }}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  รีเซ็ต
                </button>
              </div>
            </div>

            {/* No results / Empty */}
            {filteredOrders.length === 0 ? (
              <div className="text-center text-gray-400 italic py-12 text-lg">
                {search
                  ? `ไม่พบคำสั่งซื้อที่ตรงกับ "${search}"`
                  : "ยังไม่มีคำสั่งซื้อในระบบ"}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-inner">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-50">
                    <tr>
                      {["ลูกค้า", "ยอดรวม", "สถานะ", "วันที่", ""].map(
                        (col) => (
                          <th
                            key={col}
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider"
                          >
                            {col}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredOrders.map((order, idx) => (
                      <tr
                        key={order._id || order.id || idx}
                        className={`transition-all cursor-pointer ${
                          idx % 2 === 0
                            ? "bg-white hover:shadow-md"
                            : "bg-gray-50/30 hover:shadow-md"
                        }`}
                        onClick={() => setSelectedOrder(order)}
                        tabIndex={0}
                        aria-label={`ดูรายละเอียดคำสั่งซื้อของ ${
                          order.address?.name || "N/A"
                        }`}
                      >
                        <td className="px-6 py-4 text-base font-medium text-gray-800 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border">
                            {order.orderedBy?.picture ? (
                              <img
                                src={order.orderedBy.picture}
                                alt={order.address?.name || "avatar"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-sm text-gray-500">
                                {(
                                  order.address?.name ||
                                  order.orderedBy?.email ||
                                  "N/A"
                                ).slice(0, 1)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {order.address?.name ||
                                order.orderedBy?.email ||
                                "N/A"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {order.address?.telephone ||
                                order.orderedBy?.telephone ||
                                ""}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-base text-gray-700">
                          {numberFormat(
                            (order.cartTotal || 0) + (order.shippingFee || 0)
                          )}{" "}
                          บาท
                        </td>
                        <td className="px-6 py-4 text-base">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                              statusMap[order.orderStatus]?.color ||
                              "bg-gray-100 text-gray-700 border-gray-300"
                            }`}
                          >
                            {statusMap[order.orderStatus]?.icon}
                            <span className="ml-1">
                              {statusMap[order.orderStatus]?.label ||
                                order.orderStatus}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-base text-gray-500">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                "th-TH"
                              )
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                          >
                            ดู
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      <ProductDetailModal
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
      />
      <OrderDetailModal
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        setSelectedProduct={setSelectedProduct}
      />
    </div>
  );
};

export default AdminDashboard;
