import React, { useState } from "react";
import { uploadProfilePicture } from "../../api/user";
import useEcomStore from "../../store/ecom-store";

const ProfileAvatarUpload = ({ onUploaded }) => {
  const token = useEcomStore((s) => s.token);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFile(file);
  };

  const handleUpload = async () => {
    if (!preview) return alert("กรุณาเลือกภาพก่อน");
    try {
      setLoading(true);
      const res = await uploadProfilePicture(token, preview);
      if (onUploaded) onUploaded(res.data.url);
      alert("อัปโหลดรูปโปรไฟล์สำเร็จ");
    } catch (err) {
      console.error(err);
      alert("อัปโหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            ไม่มีรูป
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer text-sm">
          เลือกรูป
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </label>

        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={!preview || loading}
            className="px-3 py-2 bg-yellow-500 text-white rounded-md text-sm disabled:opacity-60"
          >
            {loading ? "กำลังอัปโหลด..." : "อัปโหลด"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileAvatarUpload;
