import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useEcomStore from "../store/ecom-store";
import { numberFormat } from "../utils/number";
import axios from "axios";
import {
  ShoppingCart,
  ArrowLeft,
  Heart,
  Share2,
  Star,
  StarHalf,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast"; // เพิ่ม Toaster และ toast สำหรับการแจ้งเตือน

// Component สำหรับแสดง Rating Star
const RatingStars = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star
        key={`full-${i}`}
        size={16}
        fill="currentColor"
        className="text-yellow-400"
      />
    );
  }

  if (hasHalfStar) {
    stars.push(
      <StarHalf
        key="half"
        size={16}
        fill="currentColor"
        className="text-yellow-400"
      />
    );
  }

  const remainingStars = 5 - stars.length;
  for (let i = 0; i < remainingStars; i++) {
    stars.push(<Star key={`empty-${i}`} size={16} className="text-gray-300" />);
  }

  return <div className="flex items-center gap-1">{stars}</div>;
};

// Component สำหรับแสดงสินค้าที่เกี่ยวข้อง
const RelatedProducts = ({ products, onProductClick }) => {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        สินค้าที่คุณอาจสนใจ
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            onClick={() => onProductClick(p.id)}
            className="cursor-pointer group rounded-lg border border-gray-200 p-3 bg-white hover:shadow-lg transition-shadow duration-300"
          >
            <div className="w-full h-32 flex items-center justify-center overflow-hidden rounded-md mb-2">
              <img
                src={p.images?.[0]?.url || p.images?.[0]}
                alt={p.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-sm font-medium text-gray-700 line-clamp-2 min-h-[40px]">
              {p.title}
            </p>
            <p className="text-orange-600 font-bold text-lg mt-1">
              ฿{numberFormat(p.price)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    products,
    getProduct,
    brands,
    getBrands,
    carts,
    actionAddtoCart,
    actionUpdateQuantity,
  } = useEcomStore((state) => ({
    products: state.products || [],
    getProduct: state.getProduct,
    brands: state.brands || [],
    getBrands: state.getBrands,
    carts: state.carts || [],
    actionAddtoCart: state.actionAddtoCart,
    actionUpdateQuantity: state.actionUpdateQuantity,
  }));

  const [product, setProduct] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [tab, setTab] = useState("detail");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  // review UI states
  const [reviewFilter, setReviewFilter] = useState("all"); // 'all' | 'main' | variantId
  const [expandedReviewIds, setExpandedReviewIds] = useState(new Set());

  // New: selected variant
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  // Attribute selection state (for products with attribute-based variants)
  const [attributeSelections, setAttributeSelections] = useState({});

  // New states for enhanced gallery / lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // normalize image object/string to URL (recursive search)
  const normalizeImageUrl = useCallback((item) => {
    if (!item) return null;
    if (typeof item === "string") return item;

    const candidates = [];
    const collect = (obj, depth = 0) => {
      if (!obj || depth > 4) return;
      if (typeof obj === "string") {
        candidates.push(obj);
        return;
      }
      if (Array.isArray(obj)) {
        obj.forEach((v) => collect(v, depth + 1));
        return;
      }
      if (typeof obj === "object") {
        Object.values(obj).forEach((v) => collect(v, depth + 1));
      }
    };
    collect(item, 0);

    const url = candidates.find((s) =>
      /(^https?:\/\/)|(^\/\/)|(\.(png|jpe?g|webp|svg|gif))/i.test(s)
    );
    return url || candidates[0] || null;
  }, []);

  // Helper: normalize and merge images so product images always come first
  const mergeProductVariantImages = useCallback(
    (prod, variant) => {
      const prodImgs = (prod?.images || [])
        .map(normalizeImageUrl)
        .filter(Boolean);
      const variantImgs = (variant?.images || [])
        .map(normalizeImageUrl)
        .filter(Boolean);

      // Ensure product images come first and deduplicate
      const ordered = [];
      prodImgs.forEach((u) => {
        if (!ordered.includes(u)) ordered.push(u);
      });
      variantImgs.forEach((u) => {
        if (!ordered.includes(u)) ordered.push(u);
      });

      return ordered;
    },
    [normalizeImageUrl]
  );

  // utility to compute index for a given variant's first image based on merged order
  const indexForVariant = useCallback(
    (variant) => {
      if (!variant) return 0;
      const first = variant.images && variant.images[0];
      const firstUrl = normalizeImageUrl(first);
      const merged = mergeProductVariantImages(product, variant);
      if (firstUrl) {
        const idx = merged.indexOf(firstUrl);
        return idx >= 0 ? idx : 0;
      }
      return 0;
    },
    [product, mergeProductVariantImages, normalizeImageUrl]
  );

  // Auto-select a sensible default variant when product loads
  useEffect(() => {
    if (!product) return;
    // Do NOT auto-select a variant by default — show main product images first
    setSelectedVariantId(null);
    setImgIndex(0);
    // reset attribute selections when product changes
    setAttributeSelections({});
  }, [product]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const onKey = (e) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setLightboxIndex((s) => s + 1);
      if (e.key === "ArrowLeft") setLightboxIndex((s) => s - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  // When attribute selections change, attempt to find a matching variant
  useEffect(() => {
    if (!product || !Array.isArray(product.variants)) return;
    const keys = Object.keys(attributeSelections);
    if (!keys.length) return;
    const match = product.variants.find((v) => {
      const attrs = v.attributes || {};
      return keys.every(
        (k) => String(attrs[k]) === String(attributeSelections[k])
      );
    });
    if (match) {
      setSelectedVariantId(match.id);
      setImgIndex(indexForVariant(match));
    }
  }, [attributeSelections, product, indexForVariant]);

  const cartItem = useMemo(
    () => carts.find((c) => String(c.id) === String(id)),
    [carts, id]
  );

  // ดึงข้อมูลสินค้าและแบรนด์
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!products.length) await getProduct();
        if (!brands.length) await getBrands();
      } catch (error) {
        console.error("Error fetching product or brands:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [getProduct, getBrands, products.length, brands.length]);

  // ตั้งค่าสินค้าเมื่อโหลดเสร็จ
  useEffect(() => {
    let isMounted = true;
    const loadProductDetail = async () => {
      setLoading(true);
      try {
        // Always fetch full product detail from the API to ensure variants are included
        const res = await axios.get(`/api/product/${id}`);
        // Backend may return the product directly or wrapped; handle both
        const fetched = res?.data?.product || res?.data || null;
        if (!isMounted) return;
        setProduct(fetched);
        setImgIndex(0);
        setQuantity(cartItem?.count || 1);
        setSelectedVariantId(null);
      } catch (err) {
        console.error("Error fetching product detail:", err);
        if (isMounted) setProduct(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProductDetail();
    return () => {
      isMounted = false;
    };
  }, [id, cartItem]);

  // update reviews when product changes
  const fetchReviews = useCallback(() => {
    if (!product?.id) return;
    setLoadingReviews(true);
    const prodId = parseInt(product.id, 10);
    fetch(`/api/review/${prodId}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [product?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Build variant filter options and counts for reviews
  const variantOptions = useMemo(() => {
    const opts = [
      { id: "all", title: "ทั้งหมด" },
      { id: "main", title: "สินค้าหลัก" },
    ];
    if (product && Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        opts.push({
          id: String(v.id),
          title: v.title || v.sku || `ตัวเลือก ${v.id}`,
        });
      });
    }
    return opts;
  }, [product]);

  const reviewCounts = useMemo(() => {
    const map = { all: 0, main: 0 };
    reviews.forEach((r) => {
      map.all = (map.all || 0) + 1;
      const vid = r.variantId ? String(r.variantId) : "main";
      map[vid] = (map[vid] || 0) + 1;
    });
    return map;
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === "all") return reviews;
    return reviews.filter((r) => {
      const vid = r.variantId ? String(r.variantId) : "main";
      return vid === reviewFilter;
    });
  }, [reviews, reviewFilter]);

  const toggleExpand = (id) => {
    setExpandedReviewIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getVariantTitle = useCallback(
    (vid) => {
      if (!product || !product.variants) return null;
      const v = product.variants.find((x) => String(x.id) === String(vid));
      return v ? v.title || v.sku || `ตัวเลือก ${v.id}` : null;
    },
    [product]
  );

  // Determine images to show: variant images (if selected) fall back to product images
  const selectedVariant = useMemo(() => {
    if (!product) return null;
    if (!Array.isArray(product.variants) || product.variants.length === 0)
      return null;
    return (
      product.variants.find(
        (v) => String(v.id) === String(selectedVariantId)
      ) || null
    );
  }, [product, selectedVariantId]);

  const images = useMemo(() => {
    const merged = mergeProductVariantImages(product, selectedVariant);
    if (Array.isArray(merged) && merged.length) return merged;
    // fallback to normalized product images
    const prodImgs = (product?.images || [])
      .map(normalizeImageUrl)
      .filter(Boolean);
    if (prodImgs.length) return prodImgs;
    return ["/no-image.png"];
  }, [product, selectedVariant, mergeProductVariantImages, normalizeImageUrl]);

  // Ensure imgIndex is valid whenever images change
  useEffect(() => {
    if (!images || images.length === 0) {
      setImgIndex(0);
      return;
    }
    setImgIndex((prev) => {
      if (typeof prev !== "number" || prev < 0) return 0;
      if (prev >= images.length) return 0;
      return prev;
    });
  }, [images]);

  // Ensure when no variant is selected we display the main product's first image
  useEffect(() => {
    if (!product) return;
    if (selectedVariantId !== null) return; // only when main product is selected
    const firstProd = product.images?.[0];
    const firstUrl = normalizeImageUrl(firstProd);
    if (!firstUrl) return;
    const idx = images.indexOf(firstUrl);
    setImgIndex(idx >= 0 ? idx : 0);
  }, [product, images, selectedVariantId, normalizeImageUrl]);

  // Price and stock should reflect selected variant when present
  const displayPrice =
    selectedVariant && selectedVariant.price !== null
      ? selectedVariant.price
      : product?.price;

  const stock =
    selectedVariant && selectedVariant.quantity !== null
      ? selectedVariant.quantity
      : product?.quantity ?? product?.stock ?? 0;

  const handleUpdateQuantity = useCallback(
    (newQty) => {
      const maxStock = stock ?? 999;
      const qty = Math.min(Math.max(1, newQty), maxStock);
      setQuantity(qty);
    },
    [stock]
  );

  const handleAddToCart = useCallback(() => {
    const available = stock;
    if ((available || 0) > 0) {
      // pass variant information in product object so backend/store can record it
      const item = {
        ...product,
        variantId: selectedVariant?.id ?? null,
        variantTitle: selectedVariant?.title ?? null,
      };
      actionAddtoCart(item, quantity);
      toast.success("เพิ่มสินค้าลงในตะกร้าแล้ว!");
    } else {
      toast.error("สินค้าหมดสต็อก");
    }
  }, [product, quantity, actionAddtoCart, selectedVariant, stock]);

  const handleBuyNow = useCallback(() => {
    const available = stock;
    if ((available || 0) > 0) {
      const item = {
        ...product,
        variantId: selectedVariant?.id ?? null,
        variantTitle: selectedVariant?.title ?? null,
      };
      if (!cartItem) {
        actionAddtoCart(item, quantity);
      } else {
        actionUpdateQuantity(product.id, quantity);
      }
      navigate("/cart");
    } else {
      toast.error("สินค้าหมดสต็อก");
    }
  }, [
    product,
    quantity,
    cartItem,
    actionAddtoCart,
    actionUpdateQuantity,
    navigate,
    selectedVariant,
    stock,
  ]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const subSubcategoryId =
      product.subSubcategory?._id || product.subSubcategory?.id;
    if (!subSubcategoryId) return [];
    return products
      .filter(
        (p) =>
          String(p.id) !== String(product.id) &&
          (p.subSubcategory?._id === subSubcategoryId ||
            p.subSubcategory?.id === subSubcategoryId) &&
          p.images &&
          p.images.length > 0
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }, [product, products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
        <p className="text-orange-600 font-bold text-xl animate-pulse">
          กำลังโหลดข้อมูลสินค้า...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 space-y-4"></div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-xl">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Mobile back button - visible only on small screens */}
          <button
            onClick={() => navigate(-1)}
            className="sm:hidden inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium p-2 rounded-md"
            aria-label="ย้อนกลับ"
          >
            <ArrowLeft size={18} />
          </button>
          {/* <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
            aria-label="ย้อนกลับ"
          >
            <ArrowLeft size={18} /> กลับ
          </button> */}

          <nav className="hidden sm:flex items-center text-sm text-gray-500 gap-2">
            <span
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/")}
            >
              หน้าหลัก
            </span>
            <span>/</span>
            <span className="text-gray-700 font-medium">
              {product?.category?.name || product?.brand?.name || "สินค้า"}
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 line-clamp-1 max-w-[260px]">
              {product?.title}
            </span>
          </nav>
        </div>

        {/* quick action on desktop */}
        <div className="hidden sm:flex items-center gap-3 text-sm text-gray-500">
          <button className="flex items-center gap-2 hover:text-red-500 transition">
            <Heart size={16} /> เพิ่มในรายการโปรด
          </button>
          <button className="flex items-center gap-2 hover:text-blue-500 transition">
            <Share2 size={16} /> แชร์
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-xl shadow-md p-6 md:p-8 items-start">
        {/* Gallery Section */}
        <div className="space-y-4">
          <div className="relative rounded-xl bg-gradient-to-br from-white to-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
            <div
              className="w-full h-[min(60vh,600px)] flex items-center justify-center bg-gradient-to-br from-white to-gray-50"
              role="presentation"
            >
              {images.length > 0 ? (
                <button
                  onClick={() => {
                    setLightboxIndex(imgIndex);
                    setLightboxOpen(true);
                  }}
                  aria-label="ขยายรูป"
                  className="w-full h-full flex items-center justify-center"
                >
                  <img
                    src={normalizeImageUrl(images[imgIndex]) || "/no-image.png"}
                    loading="lazy"
                    alt={`${product.title} - รูปที่ ${imgIndex + 1}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/no-image.png";
                    }}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 ease-in-out transform hover:scale-105 cursor-zoom-in"
                  />
                </button>
              ) : (
                <div className="text-gray-400">ไม่พบรูปภาพ</div>
              )}

              {/* zoom / max icon */}
              {images.length > 0 && (
                <button
                  onClick={() => {
                    setLightboxIndex(imgIndex);
                    setLightboxOpen(true);
                  }}
                  className="absolute top-3 right-3 bg-white/80 p-2 rounded-full shadow hover:scale-105 transition"
                  aria-label="ขยายรูปภาพ"
                >
                  <Maximize2 size={18} />
                </button>
              )}
            </div>
          </div>

          {/* แสดงรูปสินค้าหลักและสินค้าย่อยทั้งหมด */}
          <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-gray-300">
            {/* รูปสินค้าหลัก */}
            {product.images && product.images.length > 0 && (
              <button
                onClick={() => {
                  setSelectedVariantId(null);
                  setImgIndex(0);
                }}
                className={`h-20 w-20 flex-shrink-0 rounded-lg p-1 transition-all duration-200 overflow-hidden ${
                  selectedVariantId === null
                    ? "ring-2 ring-orange-300"
                    : imgIndex === 0
                    ? "border border-orange-200"
                    : "border border-gray-200"
                }`}
                aria-label="ดูและเลือกสินค้าหลัก"
                aria-pressed={selectedVariantId === null}
              >
                <img
                  src={
                    normalizeImageUrl(product.images?.[0]) || "/no-image.png"
                  }
                  alt="สินค้าหลัก"
                  className="object-cover w-full h-full rounded-md hover:scale-105 transition-transform"
                  onError={(e) => (e.target.src = "/no-image.png")}
                />
              </button>
            )}

            {/* รูปสินค้าย่อย (variants) */}
            {Array.isArray(product.variants) &&
              product.variants.map((v, idx) =>
                v.images && v.images.length > 0 ? (
                  <button
                    key={v.id || v.tempId}
                    onClick={() => {
                      setSelectedVariantId(v.id);
                      // set image index to this variant's first image position
                      setImgIndex(indexForVariant(v));
                    }}
                    className={`h-20 w-20 flex-shrink-0 rounded-lg p-1 transition-all duration-200 overflow-hidden ${
                      String(selectedVariantId) === String(v.id)
                        ? "ring-2 ring-orange-300"
                        : "border border-gray-200"
                    }`}
                    aria-label={`ดูรูปสินค้าย่อย ${
                      v.title || v.sku || idx + 1
                    }`}
                    aria-pressed={String(selectedVariantId) === String(v.id)}
                  >
                    <img
                      src={normalizeImageUrl(v.images?.[0]) || "/no-image.png"}
                      alt={v.title || v.sku || `สินค้าย่อย ${idx + 1}`}
                      className="object-cover w-full h-full rounded-md hover:scale-105 transition-transform"
                      onError={(e) => (e.target.src = "/no-image.png")}
                    />
                  </button>
                ) : null
              )}
          </div>

          {/* Lightbox modal */}
          {lightboxOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
              role="dialog"
              aria-modal="true"
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow"
                aria-label="ปิด"
              >
                <X size={20} />
              </button>

              <button
                onClick={() => setLightboxIndex((s) => Math.max(0, s - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow"
                aria-label="รูปก่อนหน้า"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="max-w-[95%] max-h-[90%] flex items-center justify-center">
                <img
                  src={
                    normalizeImageUrl(
                      images[(lightboxIndex + images.length) % images.length]
                    ) || "/no-image.png"
                  }
                  loading="lazy"
                  alt={`${product.title} - ขยายรูปที่ ${
                    (lightboxIndex % images.length) + 1
                  }`}
                  className="max-h-full max-w-full object-contain rounded"
                />
              </div>

              <button
                onClick={() =>
                  setLightboxIndex((s) => Math.min(images.length - 1, s + 1))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow"
                aria-label="รูปถัดไป"
              >
                <ChevronRight size={22} />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <span className="text-white text-sm">
                  รูปที่ {(lightboxIndex % images.length) + 1} / {images.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="product-title text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                
                <span className="text-sm text-gray-500">
                  {reviews.length} รีวิว
                </span>
                <span className="hidden sm:inline-block text-sm text-gray-400">
                  •
                </span>
                <span className="text-sm text-gray-500">
                  แบรนด์:{" "}
                  <span className="font-semibold text-gray-700">
                    {product.brand?.name || "ไม่ระบุ"}
                  </span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="product-price text-2xl sm:text-3xl font-extrabold text-orange-600">
                ฿{numberFormat(displayPrice)}
              </div>
              {product.originalPrice &&
                product.originalPrice > displayPrice && (
                  <p className="line-through text-gray-400 text-sm mt-1">
                    ฿{numberFormat(product.originalPrice)}
                  </p>
                )}
              <div className="text-sm text-gray-500 mt-2">
                สต็อก:{" "}
                <span className="font-semibold text-gray-700">{stock}</span>
              </div>
            </div>
          </div>

          {/* Variant selector (detailed) */}
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700">
                  ตัวเลือก
                </div>
                {/* <div className="text-xs text-gray-400">
                  เลือกหนึ่งรายการเพื่อแสดงราคาและสต็อก
                </div> */}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.variants.map((v) => (
                  <label
                    key={v.id || v.tempId}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                      String(selectedVariantId) === String(v.id)
                        ? "ring-2 ring-orange-200 bg-orange-50"
                        : "border border-gray-100 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="variant"
                      checked={String(selectedVariantId) === String(v.id)}
                      onChange={() => {
                        setSelectedVariantId(v.id);
                        setImgIndex(indexForVariant(v));
                      }}
                      className="hidden"
                    />
                    <img
                      src={
                        normalizeImageUrl(v.images?.[0]) ||
                        normalizeImageUrl(product.images?.[0]) ||
                        "/no-image.png"
                      }
                      alt={v.title || v.sku}
                      className="w-16 h-16 object-cover rounded-md"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/no-image.png";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            {v.title || "Variant"}
                          </div>
                          {/* <div className="text-xs text-gray-500">
                            {v.sku || ""}
                          </div> */}
                        </div>
                        <div className="text-sm font-semibold text-gray-700">
                          ฿{numberFormat(v.price ?? product.price)}
                        </div>
                      </div>
                      {/* {v.attributes && Object.keys(v.attributes).length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          {Object.entries(v.attributes).map(([k, val]) => (
                            <span
                              key={k}
                              className="inline-block mr-2 px-2 py-1 rounded bg-white border text-xs"
                            >
                              {k}: {val}
                            </span>
                          ))}
                        </div>
                      )} */}
                      {/* <div className="mt-2 text-xs text-gray-500">
                        สต็อก {v.quantity ?? product.quantity}
                      </div> */}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <span className="text-sm font-medium text-gray-700">จำนวน:</span>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => handleUpdateQuantity(quantity - 1)}
                disabled={quantity <= 1}
                className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                -
              </button>
              <input
                type="text"
                value={quantity}
                readOnly
                className="w-16 text-center border-x border-gray-200 text-lg font-semibold bg-white focus:outline-none"
              />
              <button
                onClick={() => handleUpdateQuantity(quantity + 1)}
                disabled={quantity >= stock}
                className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                +
              </button>
            </div>
            <div className="text-sm text-gray-400">(สูงสุด {stock})</div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={handleAddToCart}
              disabled={stock === 0}
              className={`flex-1 flex items-center gap-2 justify-center px-6 py-3 rounded-lg font-semibold text-lg transition shadow-sm border ${
                stock > 0
                  ? "bg-white text-orange-600 border-orange-200 hover:shadow-md"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              }`}
            >
              <ShoppingCart size={18} />
              {stock === 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={stock === 0}
              className={`flex-1 flex items-center gap-2 justify-center px-6 py-3 rounded-lg font-semibold text-lg transition shadow-md ${
                stock > 0
                  ? "bg-orange-600 text-white hover:bg-orange-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              ซื้อสินค้าเลย
            </button>
          </div>

          {/* Mobile sticky action bar (safe-area aware) */}
          <div className="sm:hidden mobile-sticky-action">
            <div className="sticky-inner safe-area-padding">
              <button
                onClick={handleAddToCart}
                disabled={stock === 0}
                className={`flex-1 flex items-center gap-2 justify-center px-4 py-3 rounded-lg font-semibold text-sm transition ${
                  stock > 0
                    ? "bg-white text-orange-600 border border-orange-200"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <ShoppingCart size={16} /> ตะกร้า
              </button>
              <button
                onClick={handleBuyNow}
                disabled={stock === 0}
                className={`flex-1 flex items-center gap-2 justify-center px-4 py-3 rounded-lg font-semibold text-sm transition ${
                  stock > 0
                    ? "bg-orange-600 text-white"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                ซื้อเลย
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-4 text-sm text-gray-500">
            <button className="flex items-center hover:text-red-500 transition">
              <Heart size={18} className="mr-1" /> เพิ่มในรายการโปรด
            </button>
            <button className="flex items-center hover:text-blue-500 transition">
              <Share2 size={18} className="mr-1" /> แชร์
            </button>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab("detail")}
            className={`flex-1 py-4 text-center text-lg font-semibold transition
              ${
                tab === "detail"
                  ? "text-orange-600 border-b-2 border-orange-600 bg-indigo-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            รายละเอียดสินค้า
          </button>
          <button
            onClick={() => setTab("info")}
            className={`flex-1 py-4 text-center text-lg font-semibold transition
              ${
                tab === "info"
                  ? "text-orange-600 border-b-2 border-orange-600 bg-indigo-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            ข้อมูลเพิ่มเติม
          </button>
          <button
            onClick={() => setTab("reviews")}
            className={`flex-1 py-4 text-center text-lg font-semibold transition
              ${
                tab === "reviews"
                  ? "text-orange-600 border-b-2 border-orange-600 bg-indigo-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            รีวิว ({reviews.length})
          </button>
        </div>

        <div className="p-6 text-sm text-gray-700">
          {tab === "detail" && (
            <div className="prose max-w-none leading-relaxed whitespace-pre-line text-gray-800">
              {product.description || (
                <p className="text-gray-400">ไม่มีรายละเอียด</p>
              )}
            </div>
          )}

          {tab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-700">แบรนด์</p>
                  <p className="text-gray-800">
                    {product.brand?.name || (
                      <span className="text-gray-400">ไม่ระบุ</span>
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-700">หมวดหมู่</p>
                  <p className="text-gray-800">
                    {product.category?.name || product.categoryName || (
                      <span className="text-gray-400">ไม่ระบุ</span>
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-700">หมวดย่อย</p>
                  <p className="text-gray-800">
                    {product.subcategory?.name || product.subCategory?.name || (
                      <span className="text-gray-400">ไม่ระบุ</span>
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-700">
                    หมวดย่อย (ระดับ 2)
                  </p>
                  <p className="text-gray-800">
                    {product.subsubcategory?.name ||
                      product.subSubcategory?.name || (
                        <span className="text-gray-400">ไม่ระบุ</span>
                      )}
                  </p>
                </div>

                {/* Variant summary */}
              </div>
            </div>
          )}

          {tab === "reviews" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 mt-6">
                <h4 className="text-lg font-semibold text-gray-800">
                  รีวิว ({reviews.length})
                </h4>
                <div className="flex items-center gap-2">
                  {variantOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setReviewFilter(opt.id)}
                      className={`text-sm px-3 py-1 rounded-full border transition disabled:opacity-50 ${
                        String(reviewFilter) === String(opt.id)
                          ? "bg-orange-100 border-orange-300 text-orange-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                      title={`${opt.title} (${
                        reviewCounts[String(opt.id)] || 0
                      })`}
                    >
                      {opt.title}
                      <span className="ml-2 text-xs text-gray-500">
                        {reviewCounts[String(opt.id)] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {loadingReviews ? (
                <p className="text-gray-400 animate-pulse">กำลังโหลดรีวิว...</p>
              ) : filteredReviews.length === 0 ? (
                <p className="text-gray-400">ไม่มีรีวิวสำหรับตัวเลือกนี้</p>
              ) : (
                filteredReviews.map((r) => {
                  const rid = r.id || r._id;
                  const author = r.address?.name || r.user?.email || "ผู้ใช้";
                  const date = r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString("th-TH")
                    : "";
                  const variantTitle = r.variantId
                    ? getVariantTitle(r.variantId)
                    : null;
                  const expanded = expandedReviewIds.has(rid);
                  const comment = r.comment || "";
                  const short =
                    comment.length > 220
                      ? comment.slice(0, 220) + "..."
                      : comment;

                  return (
                    <div
                      key={rid}
                      className="bg-white rounded-lg shadow p-4 border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        {/* avatar with initials */}
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                          {String(author).slice(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">
                                {author}
                              </div>
                              <div className="text-sm text-gray-400">
                                {date}
                              </div>
                            </div>
                            <RatingStars rating={r.rating} />
                          </div>

                          <div className="mt-2 text-gray-800">
                            {variantTitle && (
                              <span className="inline-block text-xs bg-gray-100 border border-gray-200 text-gray-600 px-2 py-1 rounded mr-2">
                                {variantTitle}
                              </span>
                            )}

                            <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                              {expanded ? comment : short}
                              {comment.length > 220 && (
                                <button
                                  onClick={() => toggleExpand(rid)}
                                  className="ml-2 text-indigo-600 text-sm font-medium"
                                >
                                  {expanded ? "ย่อ" : "อ่านเพิ่มเติม"}
                                </button>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <RelatedProducts
          products={relatedProducts}
          onProductClick={(productId) => navigate(`/product/${productId}`)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
