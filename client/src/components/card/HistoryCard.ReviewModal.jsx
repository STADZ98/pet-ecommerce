import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import useEcomStore from "../../store/ecom-store";
import { numberFormat } from "../../utils/number";
import { Star, X } from "lucide-react";
import { toast } from "react-toastify";

const StarRating = ({ value, setValue, size = 24, readonly = false }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className="focus:outline-none transition-transform hover:scale-110"
        onClick={() => !readonly && setValue(star)}
        disabled={readonly}
      >
        <Star
          size={size}
          className={
            value >= star
              ? "text-orange-400 fill-orange-400"
              : "text-gray-300 fill-gray-200"
          }
        />
      </button>
    ))}
  </div>
);

const ReviewModal = ({
  isOpen,
  closeModal,
  product,
  token,
  reviewOrderId,
  reviewOrderUpdatedAt,
  onReviewSubmitted,
  onReviewDeleted,
}) => {
  const user = useEcomStore((state) => state.user);
  const userId = user?._id || user?.id;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [editReview, setEditReview] = useState({
    id: null,
    rating: 5,
    comment: "",
  });

  const textareaRef = useRef(null);

  const getProductId = (p) => p?.id ?? p?._id ?? p?.productId ?? null;
  const getVariantId = (p) =>
    p?.variantId ?? p?.variant?._id ?? p?.variant?.id ?? null;

  const fetchReviews = useCallback(async () => {
    if (!product || !token) return;
    try {
      const prodId = String(product._id || product.id);
      const params = new URLSearchParams();
      const variantId = getVariantId(product);
      if (variantId) params.set("variantId", String(variantId));
      if (reviewOrderId) params.set("orderId", String(reviewOrderId));

      const url = `/api/review/${prodId}${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      let arr = Array.isArray(data) ? data : data.reviews || [];

      if (userId) {
        arr = arr.filter((r) => {
          const reviewUserId =
            typeof r.user === "string" ? r.user : r.user._id || r.user.id;
          if (reviewUserId !== userId) return false;
          if (reviewOrderId) {
            const rid = String(r.orderId || r.order?.id || r.order?._id || "");
            return rid === String(reviewOrderId);
          }
          return true;
        });
      }

      setReviews(arr);

      // Notify parent if no review exists
      if ((arr || []).length === 0 && typeof onReviewDeleted === "function") {
        const pid = String(getProductId(product) || "");
        const vid = variantId ? String(variantId) : null;
        onReviewDeleted(pid, vid);
      }

      if (arr.length > 0) {
        setEditReview({
          id: arr[0]._id || arr[0].id,
          rating: arr[0].rating || 5,
          comment: arr[0].comment || "",
        });
      }
    } catch (err) {
      console.debug(err);
      setReviews([]);
    }
  }, [product, token, userId, reviewOrderId, onReviewDeleted]);

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
      setEditReview({ id: null, rating: 5, comment: "" });
    }
  }, [isOpen, fetchReviews]);

  const currentPid = useMemo(
    () => String(getProductId(product) || ""),
    [product]
  );
  const currentVarId = useMemo(() => {
    const vid = getVariantId(product);
    return vid ? String(vid) : null;
  }, [product]);

  const groupedByOrder = useMemo(() => {
    const map = new Map();
    reviews.forEach((r) => {
      const reviewProdId = String(
        r.productId || r.product?._id || r.product?.id || ""
      );
      const reviewVarId =
        r.variantId || r.variant?._id || r.variant?.id || null;
      const reviewVarIdStr = reviewVarId ? String(reviewVarId) : null;
      const matchesCurrent = currentVarId
        ? reviewVarIdStr === currentVarId
        : reviewProdId === currentPid;
      if (!matchesCurrent) return;
      const oid = String(r.orderId || r.order?.id || r.order?._id || "single");
      if (!map.has(oid)) map.set(oid, []);
      map.get(oid).push(r);
    });
    return Array.from(map.entries()).sort((a, b) => {
      const aDate = new Date(
        a[1][0]?.updatedAt || a[1][0]?.createdAt || 0
      ).getTime();
      const bDate = new Date(
        b[1][0]?.updatedAt || b[1][0]?.createdAt || 0
      ).getTime();
      return bDate - aDate;
    });
  }, [reviews, currentPid, currentVarId]);

  if (!product) return null;

  const displayTitle = product?.variant?.title
    ? `${product?.title || ""} - ${product.variant.title}`
    : product?.title || "ไม่ระบุชื่อสินค้า";
  const displayPrice = product?.variant?.price ?? product?.price ?? 0;
  const displaySKU =
    product?.variant?.sku ?? product?.sku ?? product?._id ?? product?.id ?? "-";
  const displayImage =
    (product?.variant?.images && product.variant.images.length > 0
      ? typeof product.variant.images[0] === "string"
        ? product.variant.images[0]
        : product.variant.images[0]?.url
      : product?.images && product.images.length > 0
      ? typeof product.images[0] === "string"
        ? product.images[0]
        : product.images[0]?.url
      : product?.image || product?.thumbnail) ||
    "https://placehold.co/64x64?text=No+Image";

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const body = {
        productId: getProductId(product),
        rating: newReview.rating,
        comment: newReview.comment,
      };
      const variantId = getVariantId(product);
      if (variantId) body.variantId = variantId;
      if (reviewOrderId) body.orderId = reviewOrderId;

      const res = await fetch(`/api/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      setLoading(false);

      const pid = String(getProductId(product));
      const ts = reviewOrderUpdatedAt || Date.now();
      const vid = variantId ? String(variantId) : null;
      onReviewSubmitted?.(pid, ts, vid);

      closeModal();
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert(err.message || "Error submitting review");
    }
  };

  const handleEditSubmit = async () => {
    if (!editReview.id) return;
    try {
      setLoading(true);
      const payload = {
        rating: editReview.rating,
        comment: editReview.comment,
      };
      const res = await fetch(`/api/review/${editReview.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to edit review");
      setLoading(false);

      const pid = String(getProductId(product));
      const ts = reviewOrderUpdatedAt || Date.now();
      const vid = getVariantId(product) ? String(getVariantId(product)) : null;
      onReviewSubmitted?.(pid, ts, vid);

      setEditReview({ id: null, rating: 5, comment: "" });
      fetchReviews();
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert(err.message || "Error editing review");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/review/${String(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("ลบรีวิวเรียบร้อยแล้ว!");
        onReviewDeleted?.(String(getProductId(product)), currentVarId);
        fetchReviews();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "เกิดข้อผิดพลาดในการลบรีวิว");
      }
    } catch (err) {
      console.debug(err);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
    setLoading(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      open={isOpen}
      onClose={closeModal}
      className="fixed z-[1001] inset-0 flex items-center justify-center"
    >
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg mx-auto my-8">
        <div className="rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
          <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-orange-50 via-white to-pink-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Star className="text-orange-500" size={22} />
              </div>
              <div className="text-lg font-bold text-gray-900">
                รีวิวสินค้า{displayTitle ? `: ${displayTitle}` : ""}
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              aria-label="ปิด"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Product Info */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border">
              <img
                src={displayImage}
                alt={displayTitle}
                className="w-16 h-16 object-cover rounded-lg border"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://placehold.co/64x64?text=No+Image";
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-800 truncate">
                  {displayTitle}
                </p>
                <p className="text-sm text-gray-500">
                  ราคา: {numberFormat(displayPrice)} ฿
                </p>
                <p className="text-xs text-gray-400">SKU: {displaySKU}</p>
              </div>
            </div>

            {/* Existing Reviews */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                รีวิวของคุณ
              </h3>
              {groupedByOrder.length === 0 ? (
                <div className="flex items-center justify-center h-12 bg-gray-50 rounded-lg text-gray-400 border border-dashed text-sm">
                  ยังไม่มีรีวิวสำหรับสินค้านี้
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {groupedByOrder.map(([orderId, revs]) => (
                    <div
                      key={orderId}
                      className="border rounded-lg bg-gray-50 p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-600">
                          คำสั่งซื้อ:{" "}
                          <span className="font-medium text-gray-800">
                            {orderId === "single" ? "-" : `#${orderId}`}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {revs[0]?.order?.createdAt
                            ? new Date(
                                revs[0].order.createdAt
                              ).toLocaleDateString("th-TH")
                            : revs[0]?.createdAt
                            ? new Date(revs[0].createdAt).toLocaleDateString(
                                "th-TH"
                              )
                            : ""}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {revs.map((r) => {
                          const reviewId = r._id || r.id;
                          const isEditing = editReview.id === reviewId;
                          return (
                            <div
                              key={reviewId}
                              className="rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition"
                            >
                              <div className="flex items-center justify-between">
                                <StarRating
                                  value={r.rating}
                                  readonly
                                  size={16}
                                />
                                <div className="text-xs text-gray-400">
                                  {r.updatedAt
                                    ? new Date(r.updatedAt).toLocaleString(
                                        "th-TH"
                                      )
                                    : r.createdAt
                                    ? new Date(r.createdAt).toLocaleString(
                                        "th-TH"
                                      )
                                    : ""}
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm break-words mt-2">
                                {r.comment}
                              </p>
                              <div className="flex gap-2 justify-end mt-2">
                                <button
                                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-orange-600 rounded-md font-medium hover:bg-orange-100"
                                  onClick={() => {
                                    setEditReview({
                                      id: reviewId,
                                      rating: r.rating,
                                      comment: r.comment,
                                    });
                                    setTimeout(
                                      () => textareaRef.current?.focus(),
                                      50
                                    );
                                  }}
                                >
                                  แก้ไข
                                </button>
                                <button
                                  className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-600 rounded-md font-medium hover:bg-red-200"
                                  onClick={() => handleDelete(reviewId)}
                                >
                                  ลบ
                                </button>
                              </div>

                              {isEditing && (
                                <div className="mt-3 p-3 border-t pt-3 bg-gray-50 rounded">
                                  <div className="flex items-center gap-3">
                                    <StarRating
                                      value={editReview.rating}
                                      setValue={(val) =>
                                        setEditReview((prev) => ({
                                          ...prev,
                                          rating: val,
                                        }))
                                      }
                                      size={18}
                                    />
                                    <span className="text-sm text-gray-600">
                                      {editReview.rating} ดาว
                                    </span>
                                  </div>
                                  <textarea
                                    ref={textareaRef}
                                    value={editReview.comment}
                                    onChange={(e) =>
                                      setEditReview((prev) => ({
                                        ...prev,
                                        comment: e.target.value,
                                      }))
                                    }
                                    className="w-full mt-2 border rounded px-3 py-2 text-sm"
                                    rows={3}
                                  />
                                  <div className="flex justify-end gap-2 mt-2">
                                    <button
                                      onClick={() =>
                                        setEditReview({
                                          id: null,
                                          rating: 5,
                                          comment: "",
                                        })
                                      }
                                      className="px-3 py-1 bg-gray-100 rounded text-sm"
                                    >
                                      ยกเลิก
                                    </button>
                                    <button
                                      onClick={handleEditSubmit}
                                      disabled={loading || !editReview.comment}
                                      className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                                    >
                                      บันทึก
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New Review */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h3 className="text-base font-semibold text-gray-800">
                เพิ่มรีวิวใหม่
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    ให้คะแนน
                  </label>
                  <div className="flex items-center gap-2">
                    <StarRating
                      value={newReview.rating}
                      setValue={(val) =>
                        setNewReview((prev) => ({ ...prev, rating: val }))
                      }
                      size={20}
                    />
                    <span className="ml-2 text-xs font-medium text-gray-700">
                      {newReview.rating} ดาว
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    ความคิดเห็น
                  </label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 min-h-[60px] focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-sm resize-none"
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    placeholder="เขียนรีวิวและแบ่งปันประสบการณ์ของคุณ..."
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-1 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 text-sm"
                  onClick={closeModal}
                  disabled={loading}
                >
                  ปิด
                </button>
                <button
                  className="px-4 py-1 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition text-sm"
                  onClick={handleSubmit}
                  disabled={loading || !newReview.comment}
                >
                  {loading ? "กำลังส่ง..." : "ส่งรีวิว"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
