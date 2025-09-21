import { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import { createProduct, deleteProduct } from "../../api/product";
import {
  createBrand,
  updateBrand,
  removeBrand as deleteBrand,
} from "../../api/brand";
import { toast } from "react-toastify";
import Uploadfile from "./Uploadfile"; // Assuming this component is robust enough
import VariantUploadfile from "./VariantUploadfile";

// Importing icons from lucide-react
import {
  Pencil,
  Trash2,
  PackageMinus,
  PlusCircle,
  ListFilter,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Tag,
  Building2,
  Boxes,
  CircleDollarSign,
  UploadCloud,
  X, // Added for close button consistency
  Eye, // Added for view detail
} from "lucide-react";
import { Link } from "react-router-dom";
import { numberFormat } from "../../utils/number";
import { dateFormat } from "../../utils/dateformat";

// Initial state for the product form
const initialState = {
  title: "",
  description: "",
  brand: "",
  brandId: "",
  price: "0",
  quantity: "0",
  categoryId: "",
  subcategoryId: "",
  subSubcategoryId: "",
  images: [],
  brandLoadError: false,

  // New: support for product variants (product ย่อย)
  variants: [], // each variant: { tempId, title, sku, price, quantity, attributes: [{key,value}], images: [url] }
};

// ---
// แสดงรายละเอียดสินค้า (ProductDetailModal)
// ---
const ProductDetailModal = ({ product, onClose }) => {
  const brands = useEcomStore((state) => state.brands || []);
  const [imgIndex, setImgIndex] = useState(0);
  if (!product) return null;

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
          .map((img) => img?.url || (typeof img === "string" ? img : undefined))
          .filter(Boolean)
      : ["/no-image.png"];

  const handlePrev = () =>
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () =>
    setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  // Modern modal design with improved detail readability
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-backdrop">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-auto max-h-[95vh] overflow-hidden flex flex-col animate-scale-in border border-gray-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-blue-600 transition-all duration-300 rounded-full p-2 hover:bg-gray-100 focus:ring-2 focus:ring-blue-300"
          title="ปิด"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 px-8 py-6 border-b bg-gradient-to-r from-blue-50 to-white">
          <Eye className="w-8 h-8 text-blue-500" />
          <h3 className="text-2xl font-bold text-gray-900">รายละเอียดสินค้า</h3>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row gap-8 p-8 flex-grow overflow-y-auto">
          {/* Left: Image Gallery */}
          <div className="flex flex-col items-center gap-3 md:w-1/2 w-full">
            <div className="relative w-full aspect-square max-w-md rounded-2xl overflow-hidden border bg-gray-50 shadow-sm">
              <img
                src={images[imgIndex]}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/no-image.png";
                }}
              />
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 text-blue-600 rounded-full p-2 shadow hover:bg-blue-100"
                    onClick={handlePrev}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 text-blue-600 rounded-full p-2 shadow hover:bg-blue-100"
                    onClick={handleNext}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-full ${
                          imgIndex === idx ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-2 flex-wrap justify-center">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`thumb-${idx}`}
                    className={`w-16 h-16 object-cover rounded-lg border cursor-pointer transition-all duration-200 ${
                      imgIndex === idx
                        ? "border-blue-500 scale-105"
                        : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setImgIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Title & Brand */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {product.title}
              </h1>
              <p className="text-gray-600 mt-1">
                {typeof product.brand === "object"
                  ? product.brand?.name || "ไม่ระบุ"
                  : product.brand || "ไม่ระบุ"}
              </p>
            </div>

            {/* Category */}
            <div className="flex flex-wrap gap-2">
              {product.category?.name && (
                <span className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {product.category.name}
                </span>
              )}
              {product.subcategory?.name && (
                <span className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {product.subcategory.name}
                </span>
              )}
              {product.subSubcategory?.name && (
                <span className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {product.subSubcategory.name}
                </span>
              )}
            </div>

            {/* Price / Quantity / Sold */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-4 bg-green-50 border border-green-200 rounded-xl">
                <span className="text-lg font-bold text-green-700">
                  {numberFormat(product.price)} บาท
                </span>
                <span className="text-xs text-gray-500">ราคา</span>
              </div>
              <div
                className={`flex flex-col items-center p-4 rounded-xl border ${
                  product.quantity <= 10
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <span
                  className={`text-lg font-bold ${
                    product.quantity <= 10 ? "text-red-600" : "text-yellow-600"
                  }`}
                >
                  {product.quantity}
                </span>
                <span className="text-xs text-gray-500">ชิ้น</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <span className="text-lg font-bold text-indigo-700">
                  {product.sold || 0}
                </span>
                <span className="text-xs text-gray-500">ขายแล้ว</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-gray-800 font-semibold mb-2">
                รายละเอียดสินค้า
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 text-sm leading-relaxed max-h-48 overflow-y-auto">
                {product.description && product.description.trim() !== "" ? (
                  product.description
                ) : (
                  <span className="italic text-gray-400">
                    ไม่มีรายละเอียดสินค้า
                  </span>
                )}
              </div>
            </div>

            {/* Last Updated */}
            <div className="w-full text-right pt-2 text-xs text-gray-400 mt-auto">
              อัปเดตล่าสุด:{" "}
              {product.updatedAt ? dateFormat(product.updatedAt) : "ไม่ระบุ"}
            </div>
          </div>
        </div>

        {/* Animation */}
        <style>{`
      .animate-fade-in-backdrop {
        animation: fadeInBackdrop 0.25s ease-out forwards;
      }
      .animate-scale-in {
        animation: scaleInModal 0.3s cubic-bezier(.17,.84,.44,1) forwards;
      }
      @keyframes fadeInBackdrop {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleInModal {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    `}</style>
      </div>
    </div>
  );
};

// ---
// Modal ดูรูปแบรนด์เต็ม (BrandImagePreviewModal)
// ---
const BrandImagePreviewModal = ({ image, name, onClose }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-backdrop">
    <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-lg w-full flex flex-col items-center animate-scale-in">
      <button
        onClick={onClose}
        className="self-end text-gray-500 hover:text-blue-500 mb-2"
        title="ปิด"
      >
        <X className="w-8 h-8" />
      </button>
      <img
        src={image}
        alt={name}
        className="w-full max-h-[60vh] object-contain rounded-xl border shadow-lg mb-4"
      />
      <div className="text-lg font-bold text-gray-800 text-center">{name}</div>
    </div>
  </div>
);

// ---
// Modal สำหรับเพิ่มชื่อแบรนด์ (AddBrandModal) - UI ใหม่
// ---
const AddBrandModal = ({ onClose, onSave, loading }) => {
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandImage, setNewBrandImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newBrandName.trim() === "") {
      toast.error("ชื่อแบรนด์ห้ามว่าง!");
      return;
    }
    if (typeof newBrandImage === "object" && newBrandImage instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSave({ name: newBrandName, images: reader.result });
      };
      reader.readAsDataURL(newBrandImage);
      return;
    }
    onSave({ name: newBrandName, images: newBrandImage });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-green-500" /> เพิ่มแบรนด์ใหม่
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            title="ปิด"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="newBrandName" className="font-medium text-gray-700">
              ชื่อแบรนด์
            </label>
            <input
              id="newBrandName"
              type="text"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="กรอกชื่อแบรนด์ใหม่"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">รูปแบรนด์</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setNewBrandImage(file);
                  const reader = new FileReader();
                  reader.onloadend = () => setImagePreview(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
              disabled={loading}
            />
            {(typeof newBrandImage === "string" && newBrandImage) ||
            imagePreview ? (
              <img
                src={imagePreview || newBrandImage}
                alt="preview"
                className="mt-2 w-24 h-24 object-cover rounded-xl border shadow"
              />
            ) : null}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              onClick={onClose}
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> กำลังเพิ่ม...
                </>
              ) : (
                "เพิ่ม"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---
// Modal สำหรับแก้ไขชื่อแบรนด์ (EditBrandModal) - UI ใหม่
// ---
const EditBrandModal = ({ brand, onClose, onSave, loading }) => {
  const [editedBrandName, setEditedBrandName] = useState(brand.name);
  const [editedBrandImage, setEditedBrandImage] = useState(brand.images || "");
  const [imagePreview, setImagePreview] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editedBrandName.trim() === "") {
      toast.error("ชื่อแบรนด์ห้ามว่าง!");
      return;
    }
    let imageBase64 = editedBrandImage;
    if (
      typeof editedBrandImage === "object" &&
      editedBrandImage instanceof File
    ) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSave(brand.id, { name: editedBrandName, images: reader.result });
      };
      reader.readAsDataURL(editedBrandImage);
      return;
    }
    onSave(brand.id, { name: editedBrandName, images: imageBase64 });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Pencil className="w-6 h-6 text-yellow-500" /> แก้ไขชื่อแบรนด์
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            title="ปิด"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="brandName" className="font-medium text-gray-700">
              ชื่อแบรนด์ใหม่
            </label>
            <input
              id="brandName"
              type="text"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="กรอกชื่อแบรนด์"
              value={editedBrandName}
              onChange={(e) => setEditedBrandName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">รูปแบรนด์</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setEditedBrandImage(file);
                  const reader = new FileReader();
                  reader.onloadend = () => setImagePreview(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
              disabled={loading}
            />
            {(typeof editedBrandImage === "string" && editedBrandImage) ||
            imagePreview ? (
              <img
                src={imagePreview || editedBrandImage}
                alt="edit"
                className="mt-2 w-24 h-24 object-cover rounded-xl border shadow"
              />
            ) : null}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              onClick={onClose}
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> กำลังบันทึก...
                </>
              ) : (
                "บันทึก"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---
// Modal สำหรับจัดการแบรนด์ (BrandManagerModal) - UI ใหม่
// ---
const BrandManagerModal = ({
  brands,
  onClose,
  onAddBrand,
  onEditBrand,
  onDeleteBrand,
  loading,
}) => {
  const [showAddBrandForm, setShowAddBrandForm] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewName, setPreviewName] = useState("");
  const [query, setQuery] = useState("");

  const handleEditClick = (brand) => {
    setBrandToEdit(brand);
  };

  const handleAddSubmit = async (newBrandData) => {
    await onAddBrand(newBrandData);
    setShowAddBrandForm(false);
  };

  const handleEditSubmit = async (brandId, updatedData) => {
    await onEditBrand(brandId, updatedData);
    setBrandToEdit(null);
  };

  const handlePreview = (image, name) => {
    setPreviewImage(image);
    setPreviewName(name);
  };

  const closePreview = () => {
    setPreviewImage(null);
    setPreviewName("");
  };

  const filtered = Array.isArray(brands)
    ? brands.filter((b) =>
        String(b.name || "")
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-auto max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-blue-100 to-blue-50 border-b">
          <div className="flex items-center gap-3">
            <Building2 className="w-7 h-7 text-blue-600" />
            <div>
              <h2 className="text-xl font-extrabold text-blue-800">
                จัดการแบรนด์สินค้า
              </h2>
              <p className="text-sm text-gray-500">
                เพิ่ม แก้ไข หรือลบแบรนด์อย่างรวดเร็ว
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาแบรนด์..."
                className="w-56 pl-3 pr-8 py-2 rounded-lg border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <button
              onClick={() => setShowAddBrandForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> เพิ่มแบรนด์ใหม่
            </button>

            <button
              onClick={onClose}
              className="text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              title="ปิด"
            >
              ปิด
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {showAddBrandForm && (
            <AddBrandModal
              onClose={() => setShowAddBrandForm(false)}
              onSave={handleAddSubmit}
              loading={loading}
            />
          )}

          {brandToEdit && (
            <EditBrandModal
              brand={brandToEdit}
              onClose={() => setBrandToEdit(null)}
              onSave={handleEditSubmit}
              loading={loading}
            />
          )}

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filtered.map((brand) => (
                <div
                  key={brand.id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col items-center gap-3 hover:shadow-lg transition-transform transform hover:-translate-y-1"
                >
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-blue-50 bg-gray-50">
                    {brand.images ? (
                      <img
                        src={brand.images}
                        alt={brand.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/no-image.png";
                        }}
                        onClick={() => handlePreview(brand.images, brand.name)}
                        style={{ cursor: "pointer" }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="text-blue-800 font-bold text-lg break-words">
                      {brand.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {brand.createdAt
                        ? new Date(brand.createdAt).toLocaleDateString("th-TH")
                        : ""}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEditClick(brand)}
                      className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
                      title="แก้ไข"
                      disabled={loading}
                    >
                      <Pencil className="w-4 h-4" /> แก้ไข
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(`ลบแบรนด์ "${brand.name}" หรือไม่?`)
                        ) {
                          onDeleteBrand(brand.id, brand.name);
                        }
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                      title="ลบ"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" /> ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <div className="text-lg font-medium">
                ยังไม่มีแบรนด์ที่ตรงกับการค้นหา
              </div>
              <div className="text-sm mt-2">
                ลองเพิ่มแบรนด์ใหม่หรือเคลียร์ช่องค้นหา
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-4 text-blue-600 font-semibold flex items-center justify-center gap-2 mt-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              กำลังดำเนินการ...
            </div>
          )}
        </div>
      </div>

      {previewImage && (
        <BrandImagePreviewModal
          image={previewImage}
          name={previewName}
          onClose={closePreview}
        />
      )}
    </div>
  );
};

// ---
// Modal สำหรับเพิ่มสินค้าใหม่ (AddProductModal) - ออกแบบใหม่ให้เป็นมืออาชีพ
// ---
const AddProductModal = ({
  onClose,
  onSave,
  form,
  setForm,
  handleonChange,
  categories,
  subcategories,
  subSubcategories,
  brands,
  subcategoryLoading,
  subSubcategoryLoading,
  brandLoadError,
  loading,
}) => {
  // เตรียม URL รูปภาพจาก state
  const imageUrls = Array.isArray(form.images)
    ? form.images
        .map((img) => img?.url || (typeof img === "string" ? img : undefined))
        .filter(Boolean)
    : [];
  const hasImages = imageUrls.length > 0;
  const previewImg = hasImages ? imageUrls[0] : null;

  // --- Variant helpers ---
  const addVariant = () => {
    const tempId = `v_${Date.now()}`;
    const newVariant = {
      tempId,
      title: "",
      sku: "",
      price: "",
      quantity: "0",
      attributes: [{ key: "", value: "" }],
      images: [], // simple array of URLs
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
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
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

  const updateVariantImages = (vIdx, urls) => {
    // urls: array of strings
    setForm((prev) => {
      const variants = [...(prev.variants || [])];
      variants[vIdx] = { ...variants[vIdx], images: urls };
      return { ...prev, variants };
    });
  };

  // Local submit: convert attributes array into object for each variant
  const handleSubmitLocal = (e) => {
    e.preventDefault();
    // Basic validation
    if (
      !form.title ||
      !form.price ||
      !form.quantity ||
      !form.categoryId ||
      !form.brandId ||
      form.images.length === 0
    ) {
      toast.error(
        "กรุณากรอกข้อมูลสินค้าให้ครบถ้วนและอัปโหลดรูปภาพอย่างน้อย 1 รูป"
      );
      return;
    }

    // Prepare variants: attributes -> object
    const prepared = (form.variants || []).map((v) => {
      const attrObj = Array.isArray(v.attributes)
        ? v.attributes.reduce((acc, a) => {
            if (a && a.key) acc[a.key] = a.value;
            return acc;
          }, {})
        : {};
      return {
        title: v.title || null,
        sku: v.sku || null,
        price: v.price ? parseFloat(v.price) : null,
        quantity: v.quantity !== undefined ? parseInt(v.quantity || 0) : 0,
        attributes: Object.keys(attrObj).length ? attrObj : null,
        images: Array.isArray(v.images) ? v.images.filter(Boolean) : [],
      };
    });

    const payload = { ...form, variants: prepared };
    onSave(e, payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-auto max-h-[92vh] overflow-hidden flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <PlusCircle className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-bold">เพิ่มข้อมูลสินค้าใหม่</h3>
              <div className="text-sm opacity-90">
                สร้างรายการสินค้าใหม่อย่างรวดเร็วและมีข้อมูลครบถ้วน
              </div>
            </div>
          </div>
          {/* <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setForm(initialState);
                onClose();
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/25 rounded-lg text-white text-sm font-medium transition"
            >
              ปิด
            </button>
            <button
              onClick={handleSubmitLocal}
              className="px-4 py-2 bg-black/10 hover:bg-black/20 rounded-lg text-white text-sm font-semibold transition"
            >
              บันทึกและปิด
            </button>
          </div> */}
        </div>

        <form
          onSubmit={handleSubmitLocal}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto"
        >
          {/* Left: Live Preview Card */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-xl border border-gray-100 p-4 bg-gradient-to-b from-white to-gray-50 shadow-sm">
              <div className="relative h-56 rounded-lg overflow-hidden bg-gray-100 border border-dashed border-gray-200">
                {hasImages ? (
                  <img
                    src={previewImg}
                    alt={form.title || "preview"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/no-image.png";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                    <ImageIcon className="w-12 h-12" />
                    <div className="text-sm font-medium">
                      ยังไม่มีรูปตัวอย่าง
                    </div>
                    <div className="text-xs text-gray-500">
                      อัปโหลดรูปที่ช่องด้านขวาเพื่อดูพรีวิว
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="text-lg font-bold text-gray-900 truncate">
                    {form.title || "ตัวอย่างชื่อสินค้า"}
                  </h4>
                  <div className="text-sm text-gray-500 mt-1 truncate">
                    {form.brand || "แบรนด์"}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.categoryId && (
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                        {(
                          categories.find(
                            (c) => String(c.id) === String(form.categoryId)
                          ) || {}
                        ).name || "หมวดหมู่"}
                      </span>
                    )}
                    {form.subcategoryId && (
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                        {(
                          subcategories.find(
                            (s) => String(s.id) === String(form.subcategoryId)
                          ) || {}
                        ).name || "หมวดย่อย"}
                      </span>
                    )}
                    {form.subSubcategoryId && (
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                        {(
                          subSubcategories.find(
                            (s) =>
                              String(s.id) === String(form.subSubcategoryId)
                          ) || {}
                        ).name || "sub"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-green-600">
                    {form.price ? numberFormat(form.price) : "0.00"} ฿
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    คงเหลือ{" "}
                    <span className="font-semibold text-gray-800">
                      {form.quantity || 0}
                    </span>
                  </div>
                </div>
              </div>

              {imageUrls.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {imageUrls.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, _previewIndex: idx }))
                      }
                      className="w-full h-16 overflow-hidden rounded-md border border-gray-200 bg-white"
                    >
                      <img
                        src={s}
                        className="w-full h-full object-cover"
                        alt={`thumb-${idx}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 p-4 bg-white shadow-sm">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">
                สรุปข้อมูล
              </h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  ชื่อ:{" "}
                  <span className="font-medium text-gray-800">
                    {form.title || "-"}
                  </span>
                </li>
                <li>
                  ราคา:{" "}
                  <span className="font-medium text-gray-800">
                    {form.price ? numberFormat(form.price) + " ฿" : "-"}
                  </span>
                </li>
                <li>
                  จำนวน:{" "}
                  <span className="font-medium text-gray-800">
                    {form.quantity || "-"}
                  </span>
                </li>
                <li>
                  แบรนด์:{" "}
                  <span className="font-medium text-gray-800">
                    {form.brand || "-"}
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-100 p-4 bg-white shadow-sm">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">
                ตัวช่วย
              </h5>
              <p className="text-xs text-gray-500">
                คุณสามารถจัดการรูปภาพแบทช์ได้จากแถบอัปโหลดด้านขวา
                และตรวจสอบพรีวิวสินค้าทันที
              </p>
            </div>
          </div>

          {/* Right: Input Form */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ชื่อสินค้า <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleonChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="ชื่อสินค้า"
                  required
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  แบรนด์ <span className="text-red-500">*</span>
                </label>
                <select
                  name="brandId"
                  value={form.brandId}
                  onChange={handleonChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                >
                  <option value="">เลือกแบรนด์</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {brandLoadError && (
                  <p className="text-xs text-red-500 mt-1">
                    ไม่สามารถโหลดแบรนด์ได้
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  หมวดหมู่หลัก <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleonChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  หมวดหมู่ย่อย
                </label>
                <select
                  name="subcategoryId"
                  value={form.subcategoryId}
                  onChange={handleonChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  disabled={!form.categoryId}
                >
                  <option value="">เลือกหมวดหมู่ย่อย</option>
                  {subcategories
                    .filter(
                      (s) => String(s.categoryId) === String(form.categoryId)
                    )
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
                {subcategoryLoading && (
                  <p className="text-xs text-gray-500 mt-1">
                    กำลังโหลดหมวดหมู่ย่อย...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  หมวดหมู่ย่อยระดับ 2
                </label>
                <select
                  name="subSubcategoryId"
                  value={form.subSubcategoryId}
                  onChange={handleonChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  disabled={!form.subcategoryId}
                >
                  <option value="">เลือกหมวดหมู่ย่อย</option>
                  {Array.isArray(subSubcategories) &&
                    subSubcategories
                      .filter(
                        (s) =>
                          String(s.subcategoryId) === String(form.subcategoryId)
                      )
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                </select>
                {subSubcategoryLoading && (
                  <p className="text-xs text-gray-500 mt-1">
                    กำลังโหลดหมวดหมู่ย่อย...
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ราคา (บาท) <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleonChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    บาท
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  จำนวน (ชิ้น) <span className="text-red-500">*</span>
                </label>
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={handleonChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                รายละเอียดสินค้า
              </label>
              <textarea
                name="description"
                rows="5"
                value={form.description}
                onChange={handleonChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 resize-y"
                placeholder="รายละเอียดสินค้า..."
              ></textarea>
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
                    เพิ่มสินค้าย่อย
                  </button>
                </div>
              </div>

              {(form.variants || []).length === 0 ? (
                <div className="text-sm text-gray-500">
                  ยังไม่มีสินค้าย่อย สร้างเพื่อระบุขนาด สี หรือ SKU พิเศษ
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
                            placeholder="ชื่อ variant (เช่น Red / M)"
                            value={v.title}
                            onChange={(e) =>
                              updateVariantField(idx, "title", e.target.value)
                            }
                            className="border p-2 rounded"
                          />
                          <input
                            placeholder="SKU"
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

                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Attributes
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

                      <div className="mt-3">
                        <label className="text-sm font-medium text-gray-700">
                          รูปภาพ variant
                        </label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รูปภาพสินค้า <span className="text-red-500">*</span>
              </label>
              <div className="rounded-lg border border-dashed border-gray-200 p-4 bg-gray-50">
                <Uploadfile form={form} setForm={setForm} />
                <p className="text-xs text-gray-500 mt-2">
                  รองรับภาพหลายรูป (ลาก/วางได้) ขนาดแนะนำ 800x800 px - PNG/JPG
                </p>
                {form.images.length === 0 && (
                  <p className="text-red-500 text-xs mt-2">
                    กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  setForm(initialState);
                  onClose();
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold"
                disabled={loading}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 font-semibold flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> กำลังเพิ่ม...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" /> เพิ่มสินค้า
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormProduct = () => {
  const token = useEcomStore((state) => state.token);
  const getCategory = useEcomStore((state) => state.getCategory);
  const categories = useEcomStore((state) => state.categories);
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoryLoading, setSubcategoryLoading] = useState(false);
  const [subSubcategories, setSubSubcategories] = useState([]);
  const [subSubcategoryLoading, setSubSubcategoryLoading] = useState(false);

  const getProduct = useEcomStore((state) => state.getProduct);
  const products = useEcomStore((state) => state.products);
  const getBrands = useEcomStore((state) => state.getBrands);
  const brands = useEcomStore((state) => state.brands || []);
  const [brandLoadError, setBrandLoadError] = useState(false);

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [brandLoading, setBrandLoading] = useState(false);
  const [showBrandManagerModal, setShowBrandManagerModal] = useState(false); // State สำหรับเปิด/ปิด modal จัดการแบรนด์

  const [form, setForm] = useState(initialState);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // State สำหรับเก็บสินค้าที่ถูกเลือกเพื่อแสดงใน Modal
  const [searchTerm, setSearchTerm] = useState(""); // State สำหรับช่องค้นหา
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered and paginated products (derive from global products state)
  const filteredProducts = Array.isArray(products)
    ? products
        .slice()
        .reverse()
        .filter(
          (item) =>
            searchTerm.trim() === "" ||
            (item.title &&
              item.title
                .toLowerCase()
                .includes(searchTerm.trim().toLowerCase()))
        )
    : [];
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when search or products change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, products]);

  // Safe modal handlers (use unique names to avoid duplicate-declare issues when file was edited)
  const showProductDetail = (item) => setSelectedProduct(item);
  const hideProductDetail = () => setSelectedProduct(null);

  // ฟังก์ชันเพิ่มแบรนด์ใหม่
  const handleAddBrand = async (newBrandData) => {
    setBrandLoading(true);
    try {
      await createBrand(token, newBrandData);
      setBrandLoadError(false);
      await getBrands(token);
      toast.success("เพิ่มแบรนด์สำเร็จ");
    } catch (err) {
      toast.error("เพิ่มแบรนด์ไม่สำเร็จ");
      console.error("Error adding brand:", err);
    } finally {
      setBrandLoading(false);
    }
  };

  // ฟังก์ชันแก้ไขแบรนด์
  const handleEditBrand = async (brandId, updatedData) => {
    setBrandLoading(true);
    try {
      await updateBrand(token, brandId, updatedData);
      await getBrands(token);
      toast.success("แก้ไขแบรนด์สำเร็จ");
    } catch (err) {
      toast.error("แก้ไขแบรนด์ไม่สำเร็จ");
      console.error("Error editing brand:", err);
    } finally {
      setBrandLoading(false);
    }
  };

  // ฟังก์ชันลบแบรนด์
  const handleDeleteBrand = async (brandId, brandName) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบแบรนด์: "${brandName}"?`)) {
      setBrandLoading(true);
      try {
        await deleteBrand(token, brandId);
        await getBrands(token);
        toast.success(`ลบแบรนด์ **${brandName}** สำเร็จ!`);
      } catch (err) {
        console.error(err);
        toast.error("เกิดข้อผิดพลาดในการลบแบรนด์");
      } finally {
        setBrandLoading(false);
      }
    }
  };

  // ฟังก์ชันโหลดแบรนด์และสินค้าเมื่อเริ่มต้น (single, cleaned-up block)
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      await getProduct(token);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า");
    } finally {
      setLoadingProducts(false);
    }
  };

  // โหลด subSubcategory ตาม subcategory ที่เลือก (single implementation)
  const fetchSubSubcategories = async (subcategoryId) => {
    setSubSubcategoryLoading(true);
    try {
      let data = [];
      try {
        const API = import.meta.env.VITE_API || "http://localhost:5005/api";
        const res = await fetch(
          `${API}/subsubcategory?subcategoryId=${subcategoryId}`
        );
        if (res.ok) data = await res.json();
      } catch (e) {
        // ignore and try fallback
      }
      if (!data.length) {
        try {
          const res2 = await fetch(
            `/api/subsubcategory?subcategoryId=${subcategoryId}`
          );
          if (res2.ok) data = await res2.json();
        } catch (e) {
          // ignore
        }
      }
      setSubSubcategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setSubSubcategories([]);
    } finally {
      setSubSubcategoryLoading(false);
    }
  };

  // ฟังก์ชันโหลดแบรนด์และสินค้าเมื่อเริ่มต้น
  useEffect(() => {
    getCategory();
    if (getBrands) {
      getBrands(token).catch(() => setBrandLoadError(true));
    }
    if (token) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, getBrands, getCategory]);

  // โหลด subcategory ทันทีถ้ามี categoryId (เช่นตอนแก้ไข/รีเฟรช)
  useEffect(() => {
    if (form.categoryId) {
      fetchSubcategories(form.categoryId);
    } else {
      setSubcategories([]);
      setForm((prev) => ({ ...prev, subcategoryId: "", subSubcategoryId: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.categoryId]);

  // โหลด subSubcategory เมื่อเลือก subcategory (single effect)
  useEffect(() => {
    if (form.subcategoryId) {
      fetchSubSubcategories(form.subcategoryId);
    } else {
      setSubSubcategories([]);
      setForm((prev) => ({ ...prev, subSubcategoryId: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.subcategoryId]);

  // Delete product handler
  const handleDelete = async (id, title) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบสินค้า: "${title}"?`)) return;
    setLoadingProducts(true);
    try {
      await deleteProduct(token, id);
      toast.success(`ลบสินค้า **${title}** สำเร็จ!`);
      await fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("ไม่สามารถลบสินค้าได้ กรุณาลองอีกครั้ง");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleonChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      };
      // ถ้าเลือกแบรนด์จาก dropdown ให้เซ็ตชื่อแบรนด์ด้วย
      if (name === "brandId") {
        const selectedBrand = brands.find((b) => String(b.id) === value);
        updated.brand = selectedBrand ? selectedBrand.name : "";
      }
      // ถ้าเลือกหมวดหมู่ใหม่ ให้รีเซ็ตหมวดหมู่ย่อยและ subsubcategory
      if (name === "categoryId") {
        updated.subcategoryId = "";
        updated.subSubcategoryId = "";
      }
      // ถ้าเลือก subcategory ใหม่ ให้รีเซ็ต subsubcategory
      if (name === "subcategoryId") {
        updated.subSubcategoryId = "";
      }
      return updated;
    });
  };

  // โหลด subcategory ตาม category ที่เลือก (รองรับ backend ทั้ง 2 port)
  const fetchSubcategories = async (categoryId) => {
    setSubcategoryLoading(true);
    try {
      let data = [];
      try {
        // กรณี backend หลัก
        const API = import.meta.env.VITE_API || "http://localhost:5005/api";
        const res = await fetch(`${API}/subcategory?categoryId=${categoryId}`);
        if (res.ok) {
          data = await res.json();
        }
      } catch {}
      if (!data.length) {
        try {
          // กรณี backend อีกตัว (เช่น proxy หรือ dev)
          const res2 = await fetch(`/api/subcategory?categoryId=${categoryId}`);
          if (res2.ok) {
            data = await res2.json();
          }
        } catch {}
      }
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setSubcategories([]);
    } finally {
      setSubcategoryLoading(false);
    }
  };

  const handleSubmit = async (...args) => {
    // Support multiple call signatures:
    // 1) handleSubmit(event)
    // 2) handleSubmit(event, payload)
    // 3) handleSubmit({ event, payload })
    let evt = null;
    let suppliedPayload = null;

    if (args.length === 1) {
      const a = args[0];
      if (a && typeof a.preventDefault === "function") {
        // called with event
        evt = a;
      } else if (a && a.event && typeof a.event.preventDefault === "function") {
        // called with object { event, payload }
        evt = a.event;
        suppliedPayload = a.payload || null;
      } else if (a && a.payload) {
        suppliedPayload = a.payload;
      }
    } else if (args.length >= 2) {
      const [a, b] = args;
      if (a && typeof a.preventDefault === "function") evt = a;
      suppliedPayload = b || null;
    }

    if (evt) evt.preventDefault();
    setLoadingProducts(true);
    try {
      let payload;
      if (suppliedPayload) {
        payload = { ...suppliedPayload };
      } else {
        payload = {
          ...form,
          price:
            form.price !== undefined && form.price !== null && form.price !== ""
              ? Number(form.price)
              : 0,
          quantity:
            form.quantity !== undefined &&
            form.quantity !== null &&
            form.quantity !== ""
              ? Number(form.quantity)
              : 0,
          categoryId:
            form.categoryId !== undefined &&
            form.categoryId !== null &&
            form.categoryId !== ""
              ? Number(form.categoryId)
              : undefined,
          subcategoryId:
            form.subcategoryId !== undefined &&
            form.subcategoryId !== null &&
            form.subcategoryId !== ""
              ? Number(form.subcategoryId)
              : undefined,
          subSubcategoryId:
            form.subSubcategoryId !== undefined &&
            form.subSubcategoryId !== null &&
            form.subSubcategoryId !== ""
              ? Number(form.subSubcategoryId)
              : undefined,
        };
      }

      // cleanup undefined
      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key]
      );

      const res = await createProduct(token, payload);
      toast.success(`เพิ่มข้อมูล **${res.data.title}** สำเร็จ!`);
      await fetchProducts();
      setForm(initialState);
      setShowAddProductModal(false);
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการเพิ่มสินค้า กรุณาลองอีกครั้ง");
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 to-white min-h-screen">
      {/* Header & Add Product Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-blue-800 flex items-center gap-3">
          <PackageMinus className="w-10 h-10 text-blue-500" /> จัดการสินค้า
        </h1>
        <div className="flex gap-4">
          <button
            className="px-6 py-3  text-black font-bold rounded-xl shadow-lg hover:scale-105 transition flex items-center gap-2"
            onClick={() => setShowBrandManagerModal(true)} // Open Brand Manager Modal
          >
            <h2 className="h-3" /> จัดการแบรนด์
          </button>
          <button
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition flex items-center gap-2"
            onClick={() => setShowAddProductModal(true)}
          >
            <PlusCircle className="w-6 h-6" /> เพิ่มข้อมูลสินค้าใหม่
          </button>
        </div>
      </div>

      {/* Product List Section */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ListFilter className="w-7 h-7 text-gray-400" /> รายการสินค้าทั้งหมด
          </h2>
          {/* Search box */}
          <div className="w-full md:w-80 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
              placeholder="ค้นหาชื่อสินค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {loadingProducts ? (
          <div className="text-center py-10 text-gray-500 font-semibold text-lg animate-pulse bg-gray-50 rounded-lg shadow-inner">
            <Loader2 className="inline w-8 h-8 mr-3 text-gray-400 animate-spin" />
            กำลังโหลดข้อมูลสินค้า...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg">
            <table className="min-w-full text-sm bg-white rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-white text-gray-700 uppercase text-xs font-bold tracking-wider border-b border-gray-200">
                  <th className="py-3 px-2 text-center rounded-tl-2xl">
                    ลำดับ
                  </th>
                  <th className="py-3 px-2 text-center">รูป</th>
                  <th className="py-3 px-2 text-left">ชื่อสินค้า</th>
                  <th className="py-3 px-2 text-left">แบรนด์</th>
                  <th className="py-3 px-2 text-right">ราคา</th>
                  <th className="py-3 px-2 text-center">คงเหลือ</th>
                  <th className="py-3 px-2 text-center">ขายแล้ว</th>
                  <th className="py-3 px-2 text-center">อัปเดต</th>
                  <th className="py-3 px-2 text-center rounded-tr-2xl">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((item, index) => (
                    <tr
                      key={item.id || item._id}
                      className="hover:bg-gray-50 transition group cursor-pointer"
                      onClick={() => showProductDetail(item)}
                    >
                      <td className="py-2 px-2 text-center font-bold text-gray-700">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={
                              item.images[0]?.url ||
                              item.images[0]?.secure_url ||
                              (typeof item.images[0] === "string"
                                ? item.images[0]
                                : undefined) ||
                              "/no-image.png"
                            }
                            alt={item.title}
                            className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow mx-auto bg-white"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/no-image.png";
                            }}
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border-4 border-dashed border-gray-300 mx-auto">
                            <ImageIcon className="w-7 h-7" />
                          </div>
                        )}
                      </td>
                      <td
                        className="py-2 px-2 text-left font-semibold text-gray-900 max-w-[160px] truncate"
                        title={item.title}
                      >
                        {item.title}
                        {item.category?.name && (
                          <div
                            className="text-xs text-gray-400 mt-1 truncate"
                            title={item.category.name}
                          >
                            หมวด: {item.category.name}
                            {item.subcategory?.name
                              ? `/${item.subcategory.name}`
                              : ""}
                            {/* รองรับทั้ง subsubcategory และ subSubcategory */}
                            {item.subsubcategory?.name
                              ? `/${item.subsubcategory.name}`
                              : item.subSubcategory?.name
                              ? `/${item.subSubcategory.name}`
                              : ""}
                          </div>
                        )}
                      </td>
                      <td
                        className="py-2 px-2 text-left font-medium text-gray-700 max-w-[120px] truncate"
                        title={
                          typeof item.brand === "object"
                            ? item.brand?.name || "ไม่ระบุ"
                            : item.brand || "ไม่ระบุ"
                        }
                      >
                        {typeof item.brand === "object"
                          ? item.brand?.name || "ไม่ระบุ"
                          : item.brand || "ไม่ระบุ"}
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-green-600 whitespace-nowrap">
                        {numberFormat(item.price)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.quantity <= 10
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center text-gray-700">
                        {item.sold || 0}
                      </td>
                      <td className="py-2 px-2 text-center text-xs text-gray-400 whitespace-nowrap">
                        {dateFormat(item.updatedAt)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <div className="flex gap-2 justify-center">
                          {/* ปุ่มแก้ไขสินค้า */}
                          <Link
                            to={`/admin/product/${item.id || item._id}`}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-full shadow transition hover:scale-110"
                            title="แก้ไขสินค้า"
                            onClick={(e) => e.stopPropagation()} // ป้องกัน modal เด้งตอนกดแก้ไข
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          {/* ปุ่มลบสินค้า */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent detail modal from opening
                              handleDelete(item.id || item._id, item.title);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow transition hover:scale-110"
                            title="ลบสินค้า"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="py-8 text-center text-gray-400 italic"
                    >
                      ไม่พบข้อมูลสินค้า
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 rounded-lg font-semibold border ${
                  currentPage === idx + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border-blue-300"
                } hover:bg-blue-100 transition`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={hideProductDetail}
        />
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <AddProductModal
          onClose={() => {
            setShowAddProductModal(false);
            setForm(initialState); // Reset form when closing
          }}
          onSave={handleSubmit}
          form={form}
          setForm={setForm}
          handleonChange={handleonChange}
          categories={categories}
          subcategories={subcategories}
          subSubcategories={subSubcategories}
          brands={brands}
          subcategoryLoading={subcategoryLoading}
          subSubcategoryLoading={subSubcategoryLoading}
          brandLoadError={brandLoadError}
          loading={loadingProducts} // Use loadingProducts for product submission state
        />
      )}

      {/* Brand Manager Modal */}
      {showBrandManagerModal && (
        <BrandManagerModal
          brands={brands}
          onClose={() => setShowBrandManagerModal(false)}
          onAddBrand={handleAddBrand}
          onEditBrand={handleEditBrand}
          onDeleteBrand={handleDeleteBrand}
          loading={brandLoading}
        />
      )}
    </div>
  );
};

export default FormProduct;
