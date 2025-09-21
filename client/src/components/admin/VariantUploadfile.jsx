import { useState } from "react";
import { toast } from "react-toastify";
import Resize from "react-image-file-resizer";
import { removeFiles, uploadFiles } from "../../api/product";
import useEcomStore from "../../store/ecom-store";
import { Loader, X } from "lucide-react";

// VariantUploadfile: upload images for a single variant
// props:
// - images: array (current images for variant)
// - onChange: function(newImagesArray)
const VariantUploadfile = ({ images = [], onChange }) => {
  const token = useEcomStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);

  const handleOnchange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    const imageFiles = fileList.filter(
      (f) => f.type && f.type.startsWith("image/")
    );
    const nonImageCount = fileList.length - imageFiles.length;
    if (nonImageCount > 0) {
      toast.error("มีไฟล์ที่ไม่ใช่รูปภาพ ถูกข้ามการอัปโหลด");
    }
    if (imageFiles.length === 0) return;

    setIsLoading(true);
    const uploadPromises = imageFiles.map(
      (file) =>
        new Promise((resolve) => {
          Resize.imageFileResizer(
            file,
            720,
            720,
            "JPEG",
            90,
            0,
            (data) => {
              uploadFiles(token, data)
                .then((res) => {
                  // resolve an image object (same shape as Uploadfile) so backend accepts it on update
                  let imgObj = {};
                  if (typeof res.data === "string") {
                    imgObj = { url: res.data };
                  } else if (res.data && res.data.url) {
                    imgObj = res.data;
                  } else {
                    imgObj = { url: data };
                  }
                  resolve(imgObj);
                })
                .catch(() => {
                  toast.error(`เกิดข้อผิดพลาดในการอัปโหลด ${file.name}`);
                  resolve(null);
                });
            },
            "base64"
          );
        })
    );

    Promise.all(uploadPromises)
      .then((results) => {
        const successful = results.filter(Boolean);
        const allFiles = Array.isArray(images)
          ? [...images, ...successful]
          : [...successful];
        onChange(allFiles);
        if (successful.length > 0) toast.success("อัปโหลดรูปภาพสำเร็จ");
      })
      .finally(() => {
        setIsLoading(false);
        // clear input value so same file can be reselected if needed
        if (e && e.target) e.target.value = null;
      });
  };

  const handleDelete = (public_id, idx) => {
    const current = Array.isArray(images) ? [...images] : [];
    if (typeof idx === "number") {
      current.splice(idx, 1);
      onChange(current);
      toast.info("ลบรูปภาพแล้ว");
      return;
    }
    if (!public_id) {
      const idxLocal = current.findIndex((img) => !img || !img.public_id);
      if (idxLocal !== -1) {
        current.splice(idxLocal, 1);
        onChange(current);
        toast.info("ลบรูปภาพแล้ว");
      }
      return;
    }
    removeFiles(token, public_id)
      .then(() => {
        const filtered = current.filter((item) => item.public_id !== public_id);
        onChange(filtered);
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

        {Array.isArray(images) &&
          images.map((item, index) => (
            <div
              className="relative group w-24 h-24 rounded-lg overflow-hidden shadow-md border border-blue-100 bg-white"
              key={index}
            >
              <img
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                src={
                  typeof item === "string"
                    ? item
                    : item?.url || item?.secure_url || "/no-image.png"
                }
                alt={`variant-img-${index}`}
                onError={(e) => {
                  e.target.onerror = null;
                  try {
                    const orig =
                      typeof item === "string"
                        ? item
                        : item?.url || item?.secure_url;
                    if (item?.secure_url && e.target.src !== item.secure_url) {
                      e.target.src = item.secure_url;
                      return;
                    }
                    if (typeof orig === "string" && orig.startsWith("//")) {
                      e.target.src = "https:" + orig;
                      return;
                    }
                  } catch (err) {
                    void err;
                  }
                  e.target.src = "/no-image.png";
                }}
              />
              <button
                type="button"
                onClick={() => handleDelete(item.public_id, index)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-700 text-white rounded-full p-1 shadow-lg opacity-80 group-hover:opacity-100 transition"
                title="ลบรูปภาพ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
      </div>

      <div>
        <label className="block mb-2 font-semibold text-gray-700">
          อัปโหลดรูปภาพสินค้าย่อย
        </label>
        <input
          onChange={handleOnchange}
          type="file"
          name="variantImages"
          accept="image/*"
          multiple
          className="block w-full text-sm text-blue-900 border border-blue-200 rounded-lg cursor-pointer bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        />
        <p className="text-xs text-gray-400 mt-1">
          รองรับไฟล์รูปภาพเท่านั้น (JPEG, PNG ฯลฯ) — อัปโหลดหลายรูปได้
        </p>
      </div>
    </div>
  );
};

export default VariantUploadfile;
