import { useState } from "react";
import { toast } from "react-toastify";
import Resize from "react-image-file-resizer";
import { removeFiles, uploadFiles } from "../../api/product";
import useEcomStore from "../../store/ecom-store";
import { Loader, X } from "lucide-react";

const Uploadfile = ({ form, setForm }) => {
  const token = useEcomStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);

  // Fallback for form and form.images
  const safeForm = form || {};
  const safeImages = Array.isArray(safeForm.images) ? safeForm.images : [];

  const handleOnchange = (e) => {
    setIsLoading(true);
    const files = e.target.files;
    if (files) {
      let allFiles = [...safeImages];
      let uploadCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          toast.error(`ไฟล์ ${file.name} ไม่ใช่รูปภาพ`);
          uploadCount++;
          continue;
        }
        Resize.imageFileResizer(
          file,
          720,
          720,
          "JPEG",
          100,
          0,
          (data) => {
            uploadFiles(token, data)
              .then((res) => {
                // รองรับทั้งกรณี backend คืน url เดี่ยว หรือ object ที่มี url/public_id
                let imgObj = {};
                if (typeof res.data === "string") {
                  imgObj = { url: res.data };
                } else if (res.data && res.data.url) {
                  imgObj = res.data;
                } else {
                  imgObj = { url: data };
                }
                allFiles.push(imgObj);
                setForm({
                  ...safeForm,
                  images: allFiles,
                });
                toast.success("อัปโหลดรูปภาพสำเร็จ");
              })
              .catch((err) => {
                toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
              })
              .finally(() => {
                uploadCount++;
                if (uploadCount === files.length) setIsLoading(false);
              });
          },
          "base64"
        );
      }
    } else {
      setIsLoading(false);
    }
  };

  const handleDelete = (public_id) => {
    const images = safeImages;
    // ถ้า public_id ไม่มี (เช่นเป็น base64 หรือ url ธรรมดา) ให้ลบด้วย index แทน
    if (!public_id) {
      // ลบรูปแรกที่ไม่มี public_id
      const idx = images.findIndex((img) => !img.public_id);
      if (idx !== -1) {
        const filterimages = images.filter((_, i) => i !== idx);
        setForm({
          ...safeForm,
          images: filterimages,
        });
        toast.info("ลบรูปภาพแล้ว");
      }
      return;
    }
    removeFiles(token, public_id)
      .then(() => {
        const filterimages = images.filter(
          (item) => item.public_id !== public_id
        );
        setForm({
          ...safeForm,
          images: filterimages,
        });
        toast.info("ลบรูปภาพแล้ว");
      })
      .catch(() => {
        toast.error("เกิดข้อผิดพลาดในการลบ");
      });
  };

  return (
    <div className="my-4">
      <div className="flex flex-wrap gap-4 my-4">
        {isLoading && (
          <div className="flex items-center justify-center w-24 h-24 bg-blue-50 rounded-lg shadow-inner">
            <Loader className="w-10 h-10 text-blue-400 animate-spin" />
          </div>
        )}

        {/* Images Preview */}
        {safeImages.map((item, index) => (
          <div
            className="relative group w-24 h-24 rounded-lg overflow-hidden shadow-md border border-blue-100 bg-white"
            key={index}
          >
            <img
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              src={
                item.url ||
                item.secure_url ||
                (typeof item === "string" ? item : undefined) ||
                "/no-image.png"
              }
              alt={`product-img-${index}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/no-image.png";
              }}
            />
            <button
              type="button"
              onClick={() => handleDelete(item.public_id)}
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-700 text-white rounded-full p-1 shadow-lg opacity-80 group-hover:opacity-100 transition"
              title="ลบรูปภาพ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div>
        <label className="block mb-2 font-semibold text-blue-700">
          อัปโหลดรูปภาพสินค้า
        </label>
        <input
          onChange={handleOnchange}
          type="file"
          name="images"
          multiple
          className="block w-full text-sm text-blue-900 border border-blue-200 rounded-lg cursor-pointer bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        />
        <p className="text-xs text-gray-400 mt-1">
          รองรับไฟล์รูปภาพเท่านั้น (JPEG, PNG ฯลฯ)
        </p>
      </div>
    </div>
  );
};

export default Uploadfile;
