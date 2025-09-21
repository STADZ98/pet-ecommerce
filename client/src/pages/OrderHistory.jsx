import React, { useEffect, useState } from "react";
import useEcomStore from "../store/ecom-store";
import { getOrders } from "../api/user";

const OrderHistory = () => {
  const token = useEcomStore((state) => state.token);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (token) {
      getOrders(token)
        .then((res) => {
          setOrders(res.data);
        })
        .catch((err) => {
          console.error("โหลดคำสั่งซื้อล้มเหลว", err);
        });
    }
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">
        รายการสั่งซื้อของคุณ
      </h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-500">ไม่มีคำสั่งซื้อในระบบ</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition"
            >
              <p className="font-semibold text-lg mb-2">
                รหัสคำสั่งซื้อ:{" "}
                <span className="text-blue-600">{order.id}</span>
              </p>
              <p>
                วันที่สั่งซื้อ: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p>
                ยอดรวม:{" "}
                {order.total
                  ? order.total.toLocaleString("th-TH", {
                      style: "currency",
                      currency: "THB",
                    })
                  : "-"}
              </p>
              <p>
                สถานะ:{" "}
                <span className="capitalize">
                  {order.status || "รอดำเนินการ"}
                </span>
              </p>
              {/* แสดงสินค้าภายในคำสั่งซื้อ */}
              <div className="mt-3 space-y-1">
                <p className="font-semibold">สินค้า:</p>
                <ul className="list-disc list-inside">
                  {order.products?.map((prod, idx) => (
                    <li key={idx}>
                      {prod.product?.title || "สินค้า"} x {prod.count}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
