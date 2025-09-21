import React from "react";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import useEcomStore from "../../store/ecom-store";
import { Link } from "react-router-dom";
import { numberFormat } from "../../utils/number";

const CartCard = () => {
  const carts = useEcomStore((state) => state.carts);
  const actionUpdateQuantity = useEcomStore(
    (state) => state.actionUpdateQuantity
  );
  const actionRemoveProduct = useEcomStore(
    (state) => state.actionRemoveProduct
  );
  const getTotalPrice = useEcomStore((state) => state.getTotalPrice);
  const actionCloseCartSidebar = useEcomStore(
    (state) => state.actionCloseCartSidebar
  );

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <header className="flex items-center gap-3 mb-6">
        <ShoppingCart className="w-8 h-8 text-orange-500" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
          ตะกร้าสินค้า
        </h1>
      </header>

      <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
        {!carts || carts.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <div className="text-lg font-medium mb-2">ตะกร้าว่างเปล่า</div>
            <p className="text-sm text-gray-500 mb-4">
              ยังไม่มีสินค้าในตะกร้า ลองไปเลือกสินค้าที่คุณชอบได้เลย
            </p>
            <Link to="/shop">
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full shadow hover:from-orange-600 hover:to-orange-700 transition">
                เริ่มช้อปเลย
              </button>
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {carts.map((item, index) => {
                const imgCandidate =
                  item.images && item.images.length > 0 ? item.images[0] : null;
                const imgSrc =
                  typeof imgCandidate === "string"
                    ? imgCandidate
                    : imgCandidate?.url ||
                      imgCandidate?.secure_url ||
                      "/no-image.png";

                // Fallbacks for description and variant title (some carts store minimal fields and keep full product)
                const variantLabel =
                  item.variantTitle ||
                  item.variant ||
                  item.product?.variantTitle ||
                  null;
                const description =
                  item.description ||
                  item.product?.description ||
                  item.product?.shortDescription ||
                  "";

                return (
                  <li key={item.id || index} className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      {imgCandidate ? (
                        <img
                          src={imgSrc}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/no-image.png";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          ไม่มีรูป
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {item.title}
                          </p>

                          {variantLabel && (
                            <p className="text-sm text-gray-500">
                              ตัวเลือก: {variantLabel}
                            </p>
                          )}

                          {description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => actionRemoveProduct(item.id)}
                          aria-label={`ลบ ${item.title}`}
                          className="text-red-500 p-2 rounded-full hover:bg-red-50 transition"
                        >
                          {" "}
                          <Trash2 />{" "}
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1">
                          <button
                            onClick={() =>
                              item.count > 1 &&
                              actionUpdateQuantity(item.id, item.count - 1)
                            }
                            disabled={item.count <= 1}
                            aria-label={`ลดจำนวน ${item.title}`}
                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 font-medium text-gray-700">
                            {item.count}
                          </span>
                          <button
                            onClick={() =>
                              actionUpdateQuantity(item.id, item.count + 1)
                            }
                            aria-label={`เพิ่มจำนวน ${item.title}`}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-500">หน่วยละ</div>
                          <div className="font-extrabold text-lg text-gray-800">
                            {numberFormat(item.price)} ฿
                          </div>
                          <div className="text-sm text-gray-500">
                            รวม {numberFormat(item.price * item.count)} ฿
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 border-t pt-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="text-sm text-gray-600">รวมทั้งหมด</div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="text-md font-extrabold text-gray-800 bg-gray-50 px-4 py-2 rounded-lg shadow-sm">
                  {numberFormat(getTotalPrice())} ฿
                </div>
                <Link to="/cart" className="w-full sm:w-auto">
                  <button
                    onClick={() =>
                      actionCloseCartSidebar && actionCloseCartSidebar()
                    }
                    className="w-full sm:w-auto inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl shadow hover:from-orange-600 hover:to-orange-700 transition"
                  >
                    ดำเนินการชำระเงิน
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartCard;
