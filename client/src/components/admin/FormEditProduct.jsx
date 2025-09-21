import React, { useEffect, useState, useMemo, useCallback } from "react";
import useEcomStore from "../../store/ecom-store";
import { readProduct, updateProduct, deleteVariant } from "../../api/product";
// import createBrand removed (unused)
import { toast } from "react-toastify";
import Uploadfile from "./Uploadfile";
import VariantUploadfile from "./VariantUploadfile";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftCircle,
  Save,
  Package,
  DollarSign,
  Boxes,
  Clipboard,
  Tag,
  Image as ImageIcon,
  Loader2,
  X,
} from "lucide-react";

// initial empty product shape
const initialState = {
  title: "",
  description: "",
  brand: "",
  brandId: "",
  price: 0,
  quantity: 0,
  categoryId: "",
  subcategoryId: "",
  subSubcategoryId: "",
  images: [],
  variants: [],
};

const FormEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useEcomStore((state) => state.token);
  const getCategory = useEcomStore((state) => state.getCategory);
  const getSubcategories = useEcomStore((state) => state.getSubcategories);
  const getSubsubcategories = useEcomStore(
    (state) => state.getSubsubcategories
  );
  const categories = useEcomStore((state) => state.categories);
  const subcategoriesStore = useEcomStore((state) => state.subcategories);
  const subsubcategoriesStore = useEcomStore((state) => state.subsubcategories);
  const getBrands = useEcomStore((state) => state.getBrands);
  const brands = useEcomStore((state) => state.brands || []);

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [brandLoadError, setBrandLoadError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [previewIndex, setPreviewIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  const subcategories = useMemo(() => {
    if (!form.categoryId) return [];
    return subcategoriesStore.filter(
      (sub) => String(sub.categoryId) === String(form.categoryId)
    );
  }, [subcategoriesStore, form.categoryId]);

  const subSubcategories = useMemo(() => {
    if (!form.subcategoryId) return [];
    return subsubcategoriesStore.filter(
      (subSub) => String(subSub.subcategoryId) === String(form.subcategoryId)
    );
  }, [subsubcategoriesStore, form.subcategoryId]);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res = await readProduct(token, id);
      // Normalize variants for editing: convert attributes object -> array of {key,value}
      const normalize = (data) => {
        if (!data) return data;
        const variants = Array.isArray(data.variants)
          ? data.variants.map((v) => {
              const attrArray = [];
              if (
                v &&
                v.attributes &&
                typeof v.attributes === "object" &&
                !Array.isArray(v.attributes)
              ) {
                Object.keys(v.attributes).forEach((k) => {
                  attrArray.push({ key: k, value: v.attributes[k] });
                });
              } else if (Array.isArray(v.attributes)) {
                // already in array form
                attrArray.push(...v.attributes);
              }
              return {
                ...v,
                tempId:
                  v._id ||
                  v.id ||
                  `v_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                attributes: attrArray.length
                  ? attrArray
                  : [{ key: "", value: "" }],
                images: Array.isArray(v.images) ? v.images : [],
              };
            })
          : [];
        return { ...data, variants };
      };

      setForm(normalize(res.data));
    } catch {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า");
      navigate("/admin/product");
    } finally {
      setLoading(false);
    }
  }, [token, id, navigate]);

  useEffect(() => {
    getCategory();
    getSubcategories();
    getSubsubcategories();
    getBrands?.(token).catch(() => setBrandLoadError(true));
    fetchProduct();
  }, [
    id,
    token,
    getCategory,
    getSubcategories,
    getSubsubcategories,
    getBrands,
    fetchProduct,
  ]);

  const handleOnChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      };
      if (name === "brandId") {
        const selectedBrand = brands.find((b) => String(b.id) === value);
        updated.brand = selectedBrand?.name || "";
      }
      if (name === "categoryId") {
        updated.subcategoryId = "";
        updated.subSubcategoryId = "";
      }
      if (name === "subcategoryId") {
        updated.subSubcategoryId = "";
      }
      return updated;
    });
  };

  // Removed: handleAddBrand

  const validateForm = () => {
    const errs = {};
    if (!form.title || String(form.title).trim() === "")
      errs.title = "กรุณาระบุชื่อสินค้า";
    if (form.price === undefined || form.price === "" || Number(form.price) < 0)
      errs.price = "ราคาต้องไม่เป็นค่าติดลบ";
    if (
      form.quantity === undefined ||
      form.quantity === "" ||
      Number(form.quantity) < 0
    )
      errs.quantity = "จำนวนต้องไม่เป็นค่าติดลบ";
    if (!form.categoryId) errs.categoryId = "กรุณาเลือกรายการหมวดหมู่";
    if (!form.brandId) errs.brandId = "กรุณาเลือกแบรนด์";
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitEnhanced = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("กรุณาตรวจสอบข้อมูลให้ครบถ้วน");
      return;
    }
    try {
      setLoading(true);
      // Prepare variants for API: convert attributes array -> object
      const preparedVariants = (form.variants || []).map((v) => {
        const attrObj = Array.isArray(v.attributes)
          ? v.attributes.reduce((acc, a) => {
              if (a && a.key) acc[a.key] = a.value;
              return acc;
            }, {})
          : {};
        return {
          // keep server-side id if exists
          id: v.id || v._id || undefined,
          title: v.title || null,
          sku: v.sku || null,
          price:
            v.price !== undefined && v.price !== ""
              ? parseFloat(v.price)
              : null,
          quantity: v.quantity !== undefined ? parseInt(v.quantity || 0) : 0,
          attributes: Object.keys(attrObj).length ? attrObj : null,
          images: Array.isArray(v.images) ? v.images.filter(Boolean) : [],
        };
      });
      // Client-side preflight: detect duplicate SKUs in the prepared variants
      const skuList = preparedVariants
        .map((v) => (v.sku ? String(v.sku).trim() : null))
        .filter((s) => s && s.length);
      const dupSet = skuList.filter((s, i) => skuList.indexOf(s) !== i);
      if (dupSet.length) {
        const dup = dupSet[0];
        toast.error(`พบ SKU ซ้ำในรายการ: ${dup}`);
        setLoading(false);
        return;
      }

      // Server-side preflight: ensure no SKU conflicts with other variants
      for (const v of preparedVariants) {
        if (v.sku) {
          try {
            const qs = new URLSearchParams({ sku: v.sku });
            // if editing existing variant, exclude it from the check
            if (v.id) qs.set("excludeId", String(v.id));
            const checkRes = await fetch(
              `/api/variant/sku-exists?${qs.toString()}`
            );
            const body = await checkRes.json();
            if (body && body.exists) {
              toast.error(
                `SKU '${v.sku}' ซ้ำกับ variant id=${body.variant?.id || "?"}`
              );
              setLoading(false);
              return;
            }
          } catch (err) {
            // ignore preflight network errors and proceed to submit (server will still validate)
            console.warn("SKU preflight failed", err);
          }
        }
      }

      const payload = { ...form, variants: preparedVariants };
      const res = await updateProduct(token, id, payload);
      toast.success(`แก้ไข ${res.data.title} สำเร็จ!`);
      navigate("/admin/product");
    } catch (err) {
      // Show server-provided error message if available (helps diagnose 400 responses)
      try {
        console.error(
          err && err.response ? err.response.data || err.response : err
        );
      } catch {
        console.error(err);
      }
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- Variant helpers (allow editing sub-products) ---
  const addVariant = () => {
    const tempId = `v_${Date.now()}`;
    const newVariant = {
      tempId,
      title: "",
      sku: "",
      price: "",
      quantity: "0",
      attributes: [{ key: "", value: "" }],
      images: [],
    };
    setForm((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant],
    }));
  };

  const updateVariantField = (idx, field, value) => {
    setForm((prev) => {
      const variants = Array.isArray(prev.variants) ? [...prev.variants] : [];
      variants[idx] = { ...variants[idx], [field]: value };
      return { ...prev, variants };
    });
  };

  const removeVariant = (idx) => {
    const variant = (form.variants || [])[idx];
    // If variant has a persisted id, call API to delete on server first
    if (variant && (variant.id || variant._id)) {
      const idToDelete = variant.id || variant._id;
      if (!token) {
        toast.error("คุณไม่มีสิทธิ์ลบสินค้าย่อย (ไม่ได้ล็อกอิน)");
        return;
      }
      // Call server first, then remove locally on success
      deleteVariant(token, idToDelete)
        .then((res) => {
          toast.info(res.data?.message || "ลบสินค้าย่อยสำเร็จ");
          setForm((prev) => ({
            ...prev,
            variants: (prev.variants || []).filter((_, i) => i !== idx),
          }));
        })
        .catch((err) => {
          console.error("Error deleting variant:", err?.response || err);
          toast.error(
            err?.response?.data?.message || "ไม่สามารถลบสินค้าย่อยได้"
          );
        });
      return;
    }

    // Otherwise just remove locally
    setForm((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== idx),
    }));
  };

  const updateVariantAttribute = (vIdx, aIdx, key, value) => {
    setForm((prev) => {
      const variants = [...(prev.variants || [])];
      const attributes = variants[vIdx].attributes
        ? [...variants[vIdx].attributes]
        : [];
      attributes[aIdx] = { ...attributes[aIdx], key, value };
      variants[vIdx] = { ...variants[vIdx], attributes };
      return { ...prev, variants };
    });
  };

  const addVariantAttribute = (vIdx) => {
    setForm((prev) => {
      const variants = [...(prev.variants || [])];
      const attributes = variants[vIdx].attributes
        ? [...variants[vIdx].attributes]
        : [];
      attributes.push({ key: "", value: "" });
      variants[vIdx] = { ...variants[vIdx], attributes };
      return { ...prev, variants };
    });
  };

  const removeVariantAttribute = (vIdx, aIdx) => {
    setForm((prev) => {
      const variants = [...(prev.variants || [])];
      const attributes = variants[vIdx].attributes
        ? [...variants[vIdx].attributes]
        : [];
      attributes.splice(aIdx, 1);
      variants[vIdx] = { ...variants[vIdx], attributes };
      return { ...prev, variants };
    });
  };

  const updateVariantImages = (vIdx, imgs) => {
    setForm((prev) => {
      const variants = [...(prev.variants || [])];
      variants[vIdx] = { ...variants[vIdx], images: imgs };
      return { ...prev, variants };
    });
  };

  // Duplicate a variant (insert a shallow copy after the original)
  const duplicateVariant = (idx) => {
    setForm((prev) => {
      const variants = [...(prev.variants || [])];
      const original = variants[idx];
      if (!original) return prev;
      const copy = {
        ...original,
        // ensure unique temp id and drop persisted id to avoid accidental server-side overwrite
        tempId: `v_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        id: undefined,
        _id: undefined,
      };
      variants.splice(idx + 1, 0, copy);
      return { ...prev, variants };
    });
  };

  // Small UI subcomponent for presenting a variant as a polished card with collapse
  const VariantCard = ({ v, idx }) => {
    const [expanded, setExpanded] = useState(false);
    const thumb =
      (Array.isArray(v.images) && (v.images[0]?.url || v.images[0])) ||
      "/no-image.png";

    return (
      <div className="border border-gray-100 p-3 rounded-lg bg-white shadow-sm">
        <div className="flex items-start gap-3">
          <img
            src={thumb}
            alt={`variant-${idx}`}
            className="w-16 h-16 rounded-md object-cover flex-shrink-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/no-image.png";
            }}
          />

          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <input
                  placeholder="ชื่อสินค้าย่อย"
                  value={v.title}
                  onChange={(e) =>
                    updateVariantField(idx, "title", e.target.value)
                  }
                  className="w-full border p-2 rounded text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {v.id ? `ID: ${v.id}` : `ชั่วคราว: ${v.tempId}`}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right text-sm">
                  <div className="text-xs text-gray-500">SKU</div>
                  <div className="font-medium">{v.sku || "-"}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-xs text-gray-500">ราคา</div>
                  <div className="font-medium">
                    {v.price !== undefined && v.price !== ""
                      ? `${v.price} ฿`
                      : "-"}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-xs text-gray-500">จำนวน</div>
                  <div className="font-medium">{v.quantity ?? 0}</div>
                </div>

                <button
                  type="button"
                  onClick={() => duplicateVariant(idx)}
                  className="px-2 py-1 bg-gray-100 rounded text-sm"
                  title="คัดลอกสินค้าย่อย"
                >
                  คัดลอก
                </button>

                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  className="px-2 py-1 bg-red-50 text-red-600 rounded text-sm"
                  title="ลบสินค้าย่อย"
                >
                  ลบ
                </button>

                <button
                  type="button"
                  onClick={() => setExpanded((s) => !s)}
                  className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm"
                >
                  {expanded ? "ซ่อน" : "แก้ไข"}
                </button>
              </div>
            </div>

            {expanded && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex gap-2">
                    <input
                      placeholder="รหัสสินค้า"
                      value={v.sku}
                      onChange={(e) =>
                        updateVariantField(idx, "sku", e.target.value)
                      }
                      className="border p-2 rounded flex-1"
                    />
                    <input
                      placeholder="ราคา"
                      type="number"
                      min="0"
                      step="0.01"
                      value={v.price}
                      onChange={(e) =>
                        updateVariantField(idx, "price", e.target.value)
                      }
                      className="border p-2 rounded w-36"
                    />
                    <input
                      placeholder="จำนวน"
                      type="number"
                      min="0"
                      value={v.quantity}
                      onChange={(e) =>
                        updateVariantField(idx, "quantity", e.target.value)
                      }
                      className="border p-2 rounded w-24"
                    />
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      คุณสมบัติ
                    </div>
                    {(v.attributes || []).map((a, aIdx) => (
                      <div key={aIdx} className="flex gap-2 items-center mb-2">
                        <input
                          placeholder="key"
                          value={a.key}
                          onChange={(e) =>
                            updateVariantAttribute(
                              idx,
                              aIdx,
                              e.target.value,
                              a.value
                            )
                          }
                          className="border p-2 rounded w-1/3"
                        />
                        <input
                          placeholder="value"
                          value={a.value}
                          onChange={(e) =>
                            updateVariantAttribute(
                              idx,
                              aIdx,
                              a.key,
                              e.target.value
                            )
                          }
                          className="border p-2 rounded flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantAttribute(idx, aIdx)}
                          className="text-sm text-red-500"
                        >
                          ลบ
                        </button>
                      </div>
                    ))}
                    <div>
                      <button
                        type="button"
                        onClick={() => addVariantAttribute(idx)}
                        className="text-sm text-blue-600"
                      >
                        + เพิ่ม attribute
                      </button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <VariantUploadfile
                    images={v.images || []}
                    onChange={(newImages) =>
                      updateVariantImages(idx, newImages)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Removed: Modal component for add brand

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mr-2" />
        กำลังโหลดข้อมูลสินค้า...
      </div>
    );
  }

  const imageList = Array.isArray(form.images)
    ? form.images.map(
        (img) => img?.url || (typeof img === "string" ? img : img)
      )
    : [];

  const openImageModal = (index = 0) => {
    setPreviewIndex(index);
    setShowImageModal(true);
  };
  const closeImageModal = () => setShowImageModal(false);

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 pb-24 font-sarabun">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-blue-800 flex items-center gap-3">
          <Package className="w-6 h-6 text-blue-500" /> แก้ไขสินค้า
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/product")}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <ArrowLeftCircle className="w-5 h-5" /> กลับ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left: Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
              <div className="relative h-64 bg-gray-100">
                {imageList.length > 0 ? (
                  <img
                    src={imageList[previewIndex]}
                    alt={form.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/no-image.png";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <ImageIcon className="w-12 h-12" />
                    <div className="text-sm font-medium">ยังไม่มีรูปภาพ</div>
                    <div className="text-xs text-gray-500">
                      อัปโหลดรูปภาพในส่วนด้านขวา
                    </div>
                  </div>
                )}

                {imageList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => openImageModal(previewIndex)}
                    className="absolute top-3 right-3 bg-white/80 text-gray-700 rounded-full p-2 shadow hover:bg-white"
                    title="ดูรูปเต็ม"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {imageList.length > 0 && (
                <div className="p-3 grid grid-cols-5 gap-2">
                  {imageList.map((src, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewIndex(idx)}
                      className={`h-16 rounded-md overflow-hidden border ${
                        previewIndex === idx
                          ? "ring-2 ring-blue-400"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={src}
                        alt={`thumb-${idx}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/no-image.png";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border border-gray-100 rounded-lg bg-white">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                สรุปสินค้า
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  ชื่อ:{" "}
                  <span className="font-medium text-gray-800">
                    {form.title || "-"}
                  </span>
                </li>
                <li>
                  แบรนด์:{" "}
                  <span className="font-medium text-gray-800">
                    {typeof form.brand === "object"
                      ? form.brand?.name || "-"
                      : form.brand || "-"}
                  </span>
                </li>
                <li>
                  ราคา:{" "}
                  <span className="font-medium text-gray-800">
                    {form.price !== undefined
                      ? Number(form.price).toLocaleString() + " ฿"
                      : "-"}
                  </span>
                </li>
                <li>
                  จำนวน:{" "}
                  <span className="font-medium text-gray-800">
                    {form.quantity ?? "-"}
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-4 border border-gray-100 rounded-lg bg-white">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                เมตาดาต้า
              </h3>
              <div className="text-xs text-gray-500 space-y-1">
                <div>
                  ID:{" "}
                  <span className="font-medium text-gray-800">
                    {form.id || form._id || "-"}
                  </span>
                </div>
                <div>
                  สร้างเมื่อ:{" "}
                  <span className="font-medium text-gray-800">
                    {form.createdAt
                      ? new Date(form.createdAt).toLocaleString("th-TH")
                      : "-"}
                  </span>
                </div>
                <div>
                  อัปเดตล่าสุด:{" "}
                  <span className="font-medium text-gray-800">
                    {form.updatedAt
                      ? new Date(form.updatedAt).toLocaleString("th-TH")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmitEnhanced} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    ชื่อสินค้า
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleOnChange}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                      validationErrors.title
                        ? "border-red-400 focus:ring-red-300"
                        : "border-blue-200 focus:ring-blue-300"
                    }`}
                    placeholder="ระบุชื่อสินค้า"
                    required
                  />
                  {validationErrors.title && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    แบรนด์
                  </label>
                  <select
                    name="brandId"
                    value={form.brandId || ""}
                    onChange={handleOnChange}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                      validationErrors.brandId
                        ? "border-red-400 focus:ring-red-300"
                        : "border-blue-200 focus:ring-blue-300"
                    }`}
                    required
                  >
                    <option value="">-- เลือกแบรนด์ --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.brandId && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.brandId}
                    </p>
                  )}
                  {brandLoadError && (
                    <p className="text-xs text-red-500 mt-1">
                      ไม่สามารถโหลดแบรนด์ได้
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  รายละเอียดสินค้า
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleOnChange}
                  className="mt-1 w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                  placeholder="เขียนรายละเอียดสินค้า"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    ราคา (บาท)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleOnChange}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                      validationErrors.price
                        ? "border-red-400 focus:ring-red-300"
                        : "border-blue-200 focus:ring-blue-300"
                    }`}
                    placeholder="0.00"
                    required
                  />
                  {validationErrors.price && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.price}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    จำนวนในคลัง
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleOnChange}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                      validationErrors.quantity
                        ? "border-red-400 focus:ring-red-300"
                        : "border-blue-200 focus:ring-blue-300"
                    }`}
                    placeholder="0"
                    required
                  />
                  {validationErrors.quantity && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.quantity}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    หมวดหมู่หลัก
                  </label>
                  <select
                    name="categoryId"
                    value={form.categoryId || ""}
                    onChange={handleOnChange}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                      validationErrors.categoryId
                        ? "border-red-400 focus:ring-red-300"
                        : "border-blue-200 focus:ring-blue-300"
                    }`}
                    required
                  >
                    <option value="">-- เลือก --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.categoryId && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.categoryId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    หมวดหมู่ย่อย
                  </label>
                  <select
                    name="subcategoryId"
                    value={form.subcategoryId || ""}
                    onChange={handleOnChange}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition border-blue-200 focus:ring-blue-300"
                  >
                    <option value="">-- เลือก --</option>
                    {subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    หมวดหมู่ย่อยรอง
                  </label>
                  <select
                    name="subSubcategoryId"
                    value={form.subSubcategoryId || ""}
                    onChange={handleOnChange}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition border-blue-200 focus:ring-blue-300"
                  >
                    <option value="">-- เลือก --</option>
                    {subSubcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  อัปโหลดรูปภาพ
                </label>
                <div className="mt-2">
                  <Uploadfile form={form} setForm={setForm} />
                </div>
              </div>

              {/* Variants Manager */}
              <div className="rounded-xl border border-gray-100 p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-gray-700">
                    สินค้าย่อย
                  </h5>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addVariant}
                      className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                    >
                      เพิ่ม สินค้าย่อย
                    </button>
                  </div>
                </div>

                {(form.variants || []).length === 0 ? (
                  <div className="text-sm text-gray-500">
                    ยังไม่มีสินค้าย่อย สร้างเพื่อระบุขนาด สี หรือ รหัสสินค้า
                    พิเศษ
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(form.variants || []).map((v, idx) => (
                      <div
                        key={v.tempId || idx}
                        className="border border-gray-100 p-3 rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                              placeholder="ชื่อสินค้าย่อย"
                              value={v.title}
                              onChange={(e) =>
                                updateVariantField(idx, "title", e.target.value)
                              }
                              className="border p-2 rounded"
                            />
                            <input
                              placeholder="รหัสสินค้า"
                              value={v.sku}
                              onChange={(e) =>
                                updateVariantField(idx, "sku", e.target.value)
                              }
                              className="border p-2 rounded"
                            />
                            <input
                              placeholder="ราคา"
                              type="number"
                              min="0"
                              step="0.01"
                              value={v.price}
                              onChange={(e) =>
                                updateVariantField(idx, "price", e.target.value)
                              }
                              className="border p-2 rounded"
                            />
                            <input
                              placeholder="จำนวน"
                              type="number"
                              min="0"
                              value={v.quantity}
                              onChange={(e) =>
                                updateVariantField(
                                  idx,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              className="border p-2 rounded"
                            />
                          </div>
                          {/* Show server id for debugging */}
                          {v.id && (
                            <div className="text-xs text-gray-400 mt-1 col-span-full">
                              ID: {v.id}
                            </div>
                          )}

                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              onClick={() => removeVariant(idx)}
                              className="text-red-600"
                            >
                              ลบ
                            </button>
                          </div>
                        </div>

                        {/* <div className="mt-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            คุณสมบัติ
                          </div>
                          {(v.attributes || []).map((a, aIdx) => (
                            <div
                              key={aIdx}
                              className="flex gap-2 items-center mb-2"
                            >
                              <input
                                placeholder="key"
                                value={a.key}
                                onChange={(e) =>
                                  updateVariantAttribute(
                                    idx,
                                    aIdx,
                                    e.target.value,
                                    a.value
                                  )
                                }
                                className="border p-2 rounded w-1/3"
                              />
                              <input
                                placeholder="value"
                                value={a.value}
                                onChange={(e) =>
                                  updateVariantAttribute(
                                    idx,
                                    aIdx,
                                    a.key,
                                    e.target.value
                                  )
                                }
                                className="border p-2 rounded flex-1"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeVariantAttribute(idx, aIdx)
                                }
                                className="text-sm text-red-500"
                              >
                                ลบ
                              </button>
                            </div>
                          ))}
                          <div>
                            <button
                              type="button"
                              onClick={() => addVariantAttribute(idx)}
                              className="text-sm text-blue-600"
                            >
                              + เพิ่ม attribute
                            </button>
                          </div>
                        </div> */}

                        <div className="mt-3">
                          <VariantUploadfile
                            images={v.images || []}
                            onChange={(newImages) =>
                              updateVariantImages(idx, newImages)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/admin/product")}
                  className="px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Image full screen modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden">
            <button
              onClick={closeImageModal}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={imageList[previewIndex]}
              alt="preview"
              className="w-full h-[80vh] object-contain bg-gray-100"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/no-image.png";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FormEditProduct;
