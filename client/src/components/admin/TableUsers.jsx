import React, { useEffect, useState, useCallback } from "react";
import {
  getListAllUsers,
  changeUserStatus,
  deleteUser,
  changeUserRole,
} from "../../api/admin";
import { uploadProfilePicture } from "../../api/user";
import axios from "axios";
import useEcomStore from "../../store/ecom-store";
import { toast } from "react-toastify";
import {
  UserPen,
  UserCheck,
  UserRoundX,
  Trash2,
  Eye,
  EyeOff,
  XCircle,
  Info,
  User,
  Loader2,
} from "lucide-react";

// กำหนด URL ของ API
const API = import.meta.env.VITE_API || "http://localhost:5005/api";

// Helper function สำหรับการอัปเดตข้อมูลผู้ใช้
const updateUser = (token, userId, data) =>
  axios.patch(`${API}/admin/user/${userId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Helper Component สำหรับการแสดงข้อมูลใน Modal (Row)
const InfoRow = ({ label, value }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 border-b border-gray-100 last:border-b-0">
    {" "}
    <div className="col-span-1 text-sm font-medium text-gray-500 font-th-sarabun">
      {label}:{" "}
    </div>{" "}
    <div className="col-span-1 sm:col-span-2 text-sm font-normal text-gray-800 break-words font-th-sarabun">
      {typeof value === "object" ? value : value || "-"}{" "}
    </div>{" "}
  </div>
);

// Helper Component สำหรับแสดงรายละเอียดผู้ใช้ใน Modal
const UserDetail = ({ user }) => {
  const avatar =
    user.picture ||
    user.addresses?.[0]?.picture ||
    "https://cdn-icons-png.flaticon.com/128/1326/1326377.png";
  return (
    <div className="space-y-6 text-gray-700 font-th-sarabun">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
          <img
            src={avatar}
            alt={user.email}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 truncate">
                {user.addresses?.[0]?.name || user.email}
              </h3>
              <div className="text-sm text-gray-500 truncate">{user.email}</div>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  user.role === "admin"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {user.role === "admin" ? "ผู้ดูแลระบบ" : "สมาชิกทั่วไป"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  user.enabled
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {user.enabled ? "ใช้งาน" : "ไม่ใช้งาน"}
              </span>
            </div>
          </div>
          {user.addresses?.[0]?.note && (
            <p className="mt-2 text-xs text-gray-500">
              {user.addresses[0].note}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            ข้อมูลติดต่อ
          </h4>
          <InfoRow label="ชื่อ" value={user.addresses?.[0]?.name || "-"} />
          <InfoRow
            label="โทรศัพท์"
            value={user.addresses?.[0]?.telephone || "-"}
          />
          <InfoRow
            label="ที่อยู่"
            value={user.addresses?.[0]?.address || "-"}
          />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            ข้อมูลบัญชี
          </h4>
          <InfoRow label="อีเมล" value={user.email || "-"} />
          <InfoRow
            label="สร้างเมื่อ"
            value={new Date(user.createdAt).toLocaleString("th-TH")}
          />
          <InfoRow
            label="อัปเดตล่าสุด"
            value={new Date(user.updatedAt).toLocaleString("th-TH")}
          />
          <InfoRow label="ID ผู้ใช้" value={user.id} />
        </div>
      </div>

      {user.metadata && (
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            ข้อมูลเสริม
          </h4>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-auto p-2 bg-gray-50 rounded">
            {JSON.stringify(user.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// Helper Component สำหรับ Form Input
const Input = ({ label, note, ...props }) => (
  <div>
    {" "}
    <label className="text-sm font-semibold text-gray-700 mb-1 block font-th-sarabun">
      {label}{" "}
    </label>{" "}
    <input
      {...props}
      className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 text-sm"
    />
    {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}{" "}
  </div>
);

// Helper Component สำหรับ Form Textarea
const Textarea = ({ label, ...props }) => (
  <div>
    {" "}
    <label className="text-sm font-semibold text-gray-700 mb-1 block font-th-sarabun">
      {label}{" "}
    </label>{" "}
    <textarea
      {...props}
      className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm resize-y min-h-[70px] focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 text-sm"
    />{" "}
  </div>
);

// EditForm Component
const EditForm = ({ form, setForm, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [localPreview, setLocalPreview] = useState(null);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
    },
    [setForm]
  );

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalPreview(reader.result);
      setForm((prev) => ({ ...prev, pictureFile: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Client-side validation
    const errors = {};
    if (form.password && form.password.length < 6) {
      errors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }
    if (form.password !== form.confirm) {
      errors.confirm = "รหัสผ่านไม่ตรงกัน";
    }
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      await onSave();
      setForm((f) => ({ ...f, password: "", confirm: "" }));
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-th-sarabun">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
          <img
            src={
              localPreview ||
              form.picture ||
              "https://cdn-icons-png.flaticon.com/128/1326/1326377.png"
            }
            alt="preview"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <label className="px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer text-sm">
            เลือกรูปโปรไฟล์
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <div className="text-xs text-gray-500 mt-1">ขนาดแนะนำ 400x400px</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {" "}
        <Input
          label="ชื่อ"
          name="name"
          value={form.name}
          onChange={handleInputChange}
          required
          placeholder="กรอกชื่อผู้ใช้"
        />{" "}
        <Input
          label="อีเมล"
          type="email"
          name="email"
          value={form.email}
          onChange={handleInputChange}
          required
          placeholder="กรอกอีเมล"
        />{" "}
        <Input
          label="เบอร์โทรศัพท์"
          name="telephone"
          value={form.telephone}
          onChange={handleInputChange}
          placeholder="กรอกเบอร์โทรศัพท์ (ถ้ามี)"
        />{" "}
        <div className="relative">
          {" "}
          <Input
            label="รหัสผ่านใหม่"
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleInputChange}
            note="หากไม่ต้องการเปลี่ยน ให้เว้นว่าง (ขั้นต่ำ 6 ตัวอักษร)"
            minLength={6}
            autoComplete="new-password"
            placeholder="เว้นว่างหากไม่เปลี่ยน"
            className={validationErrors.password ? "border-red-500" : ""}
          />{" "}
          {validationErrors.password && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.password}
            </p>
          )}{" "}
          <button
            type="button"
            className="absolute right-3 top-8 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          >
            {" "}
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}{" "}
          </button>{" "}
        </div>{" "}
        <div className="relative">
          {" "}
          <Input
            label="ยืนยันรหัสผ่านใหม่"
            type={showConfirm ? "text" : "password"}
            name="confirm"
            value={form.confirm}
            onChange={handleInputChange}
            minLength={6}
            autoComplete="new-password"
            placeholder="ยืนยันรหัสผ่านใหม่"
            className={validationErrors.confirm ? "border-red-500" : ""}
          />{" "}
          {validationErrors.confirm && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.confirm}
            </p>
          )}{" "}
          <button
            type="button"
            className="absolute right-3 top-8 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            tabIndex={-1}
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          >
            {" "}
            {showConfirm ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="col-span-full">
        {" "}
        <Textarea
          label="ที่อยู่"
          name="address"
          value={form.address}
          onChange={handleInputChange}
          placeholder="กรอกที่อยู่ (ถ้ามี)"
          rows={3}
        />{" "}
      </div>{" "}
      <div className="flex justify-end gap-3 pt-4">
        {" "}
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          ยกเลิก{" "}
        </button>{" "}
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm shadow-md hover:from-blue-700 hover:to-blue-800 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={loading}
        >
          {" "}
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังบันทึก...{" "}
            </>
          ) : (
            <>
              <UserPen className="w-4 h-4" /> บันทึกการแก้ไข{" "}
            </>
          )}{" "}
        </button>{" "}
      </div>{" "}
    </form>
  );
};

// CustomModal Component
function CustomModal({
  open,
  onClose,
  children,
  title,
  description,
  icon: IconComponent,
  size = "md",
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      document.body.style.overflow = "hidden"; // ป้องกันการเลื่อนหน้าจอ
    } else {
      setTimeout(() => setIsMounted(false), 300); // รอ animation fade-out
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!isMounted) return null;

  const modalWidthClass = {
    sm: "max-w-sm",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  }[size];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${
        open ? "opacity-100 backdrop-blur-sm" : "opacity-0"
      }`}
      onClick={onClose}
    >
      {" "}
      <div
        className={`relative w-full ${modalWidthClass} mx-auto bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-300 ease-in-out ${
          open ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        } border border-blue-200`}
        onClick={(e) => e.stopPropagation()}
        aria-modal="true"
      >
        {" "}
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors duration-200 focus:outline-none"
          onClick={onClose}
          aria-label="ปิด"
        >
          <XCircle className="w-7 h-7" />{" "}
        </button>{" "}
        <div className="flex items-center gap-3 mb-6 border-b pb-3 border-blue-100">
          {" "}
          {IconComponent && (
            <IconComponent className="w-7 h-7 text-blue-600" />
          )}{" "}
          <h2 className="text-2xl font-extrabold text-blue-800">{title}</h2>{" "}
        </div>{" "}
        {description && (
          <p className="text-sm text-gray-600 mb-6">{description}</p>
        )}
        {children}{" "}
      </div>{" "}
    </div>
  );
}

// UserTable Component (สำหรับแสดงตารางผู้ใช้)
const UserTable = ({
  users,
  onEdit,
  onView,
  onChangeStatus,
  onDelete,
  onChangeRole,
  currentUserId,
}) => {
  // role สามารถเปลี่ยนได้โดยการเลือก (select) ยกเว้นบัญชีที่กำลังใช้งานอยู่

  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/128/1326/1326377.png";

  return (
    <table className="min-w-full divide-y divide-blue-200 font-th-sarabun">
      <thead className="bg-blue-50">
        <tr>
          <th className="px-6 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">
            ลำดับ
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
            ผู้ใช้
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
            สิทธิ์
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
            สถานะ
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
            สมัครเมื่อ
          </th>
          <th className="px-6 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">
            จัดการ
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {users.length === 0 && (
          <tr>
            <td colSpan={6} className="text-center py-8 text-gray-500 text-lg">
              ไม่พบข้อมูลผู้ใช้งาน
            </td>
          </tr>
        )}

        {users.map((u, i) => {
          const avatar =
            u.picture ||
            (u.addresses && u.addresses[0]?.picture) ||
            defaultAvatar;
          const isSelf = u.id === currentUserId;
          return (
            <tr
              key={u.id}
              className="hover:bg-blue-50 transition-colors duration-150"
            >
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                {i + 1}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                    <img
                      src={avatar}
                      alt={u.email}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {(u.addresses && u.addresses[0]?.name) || u.email}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {u.email}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {/* แสดง select เพื่อเปลี่ยนสิทธิ์ (ป้องกันตัวเอง) */}
                <select
                  value={u.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    if (isSelf) {
                      toast.warn(
                        "ไม่สามารถเปลี่ยนสิทธิ์ของบัญชีที่คุณกำลังใช้งานอยู่ได้"
                      );
                      return;
                    }
                    if (onChangeRole) onChangeRole(u.id, newRole);
                  }}
                  className={`border border-gray-300 rounded-md px-3 py-1 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                    isSelf ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  }`}
                  disabled={isSelf}
                  onClick={(e) => e.stopPropagation()}
                  title={
                    isSelf
                      ? "ไม่สามารถเปลี่ยนสิทธิ์ของบัญชีที่กำลังใช้งานอยู่ได้"
                      : undefined
                  }
                >
                  <option value="user">สมาชิก</option>
                  <option value="admin">ผู้ดูแล</option>
                </select>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      u.enabled ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      u.enabled ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {u.enabled ? "ใช้งาน" : "ไม่ใช้งาน"}
                  </span>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(u.createdAt).toLocaleDateString("th-TH")}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(u);
                    }}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-md text-blue-600 transition-transform duration-150 hover:scale-105"
                    title="ดูรายละเอียด"
                    aria-label="ดูรายละเอียด"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(u);
                    }}
                    className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-md text-yellow-700 transition-transform duration-150 hover:scale-105"
                    title="แก้ไข"
                    aria-label="แก้ไข"
                  >
                    <UserPen className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeStatus(u.id, u.enabled);
                    }}
                    className={`p-2 rounded-md transition-transform duration-150 hover:scale-105 ${
                      u.enabled
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-green-100 text-green-600 hover:bg-green-200"
                    }`}
                    title={u.enabled ? "ระงับการใช้งาน" : "เปิดใช้งาน"}
                    aria-label={u.enabled ? "ระงับการใช้งาน" : "เปิดใช้งาน"}
                  >
                    {u.enabled ? (
                      <UserRoundX className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(u.id);
                    }}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-transform duration-150 hover:scale-105"
                    title="ลบ"
                    aria-label="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

// Section Component (สำหรับแบ่งตารางผู้ดูแล/สมาชิก)
const Section = ({ title, users, ...props }) => {
  return (
    <div className="mb-10">
      {" "}
      <h2 className="text-3xl font-extrabold mb-5 text-blue-700 border-b-2 border-blue-200 pb-2 font-th-sarabun">
        {title}{" "}
      </h2>{" "}
      <div className="overflow-hidden rounded-xl shadow-lg border border-blue-100 bg-white">
        <UserTable users={users} {...props} />{" "}
      </div>{" "}
    </div>
  );
};

// Main TableUsers Component
const TableUsers = () => {
  const token = useEcomStore((s) => s.token);
  const currentUserId = useEcomStore((s) => s.user?.id);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ type: null, data: null });
  const [form, setForm] = useState({
    name: "",
    email: "",
    telephone: "",
    address: "",
    picture: "",
    pictureFile: null,
    password: "",
    confirm: "",
  }); // ฟังก์ชันดึงข้อมูลผู้ใช้ทั้งหมด

  const getUsers = useCallback(() => {
    setLoading(true);
    getListAllUsers(token)
      .then((res) => setUsers(res.data))
      .catch(() => toast.error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (token) getUsers();
  }, [token, getUsers]);

  const handleModalOpen = useCallback((type, user) => {
    const normalizedUser = {
      ...user,
      name: user.addresses?.[0]?.name || "",
      telephone: user.addresses?.[0]?.telephone || "",
      address: user.addresses?.[0]?.address || "",
      picture: user.picture || "",
    };
    if (type === "edit") {
      setForm({
        name: normalizedUser.name,
        email: normalizedUser.email,
        telephone: normalizedUser.telephone,
        address: normalizedUser.address,
        picture: normalizedUser.picture,
        pictureFile: null,
        password: "",
        confirm: "",
      });
    }
    setModal({ type, data: normalizedUser });
  }, []);

  const handleModalClose = useCallback(() => {
    setModal({ type: null, data: null });
  }, []);

  const handleUpdateUser = async () => {
    if (!modal.data) return;
    const dataToUpdate = {
      name: form.name,
      email: form.email,
      telephone: form.telephone,
      address: form.address,
    };
    if (form.password) dataToUpdate.password = form.password;

    try {
      // if admin selected a new picture file (base64), upload it first
      if (form.pictureFile) {
        try {
          // pass the target user id so admins can update other users' pictures
          const res = await uploadProfilePicture(
            token,
            form.pictureFile,
            modal.data.id
          );
          if (res?.data?.url) {
            dataToUpdate.picture = res.data.url;
          }
        } catch (err) {
          console.error("Upload picture failed", err);
          toast.error("อัปโหลดรูปไม่สำเร็จ");
          return;
        }
      }
      await updateUser(token, modal.data.id, dataToUpdate);
      toast.success("อัปเดตข้อมูลผู้ใช้สำเร็จ!");
      handleModalClose();
      getUsers();
    } catch (err) {
      console.error("Update user error:", err);
      toast.error("อัปเดตข้อมูลไม่สำเร็จ");
    }
  };

  const handleChangeStatus = useCallback(
    (id, currentStatus) => {
      changeUserStatus(token, { id, enabled: !currentStatus })
        .then(() => {
          toast.success("เปลี่ยนสถานะสำเร็จ");
          getUsers();
        })
        .catch(() => toast.error("เปลี่ยนสถานะไม่สำเร็จ"));
    },
    [token, getUsers]
  );

  const handleDeleteUser = useCallback(
    (id) => {
      if (window.confirm("คุณแน่ใจว่าต้องการลบผู้ใช้นี้?")) {
        deleteUser(token, id)
          .then(() => {
            toast.success("ลบผู้ใช้สำเร็จ");
            getUsers();
          })
          .catch(() => toast.error("ลบไม่สำเร็จ"));
      }
    },
    [token, getUsers]
  );

  const handleChangeRole = useCallback(
    (id, role) => {
      if (window.confirm("ยืนยันการเปลี่ยนสิทธิ์ผู้ใช้?")) {
        changeUserRole(token, { id, role })
          .then(() => {
            toast.success("เปลี่ยนสิทธิ์สำเร็จ");
            getUsers();
          })
          .catch(() => toast.error("เปลี่ยนสิทธิ์ไม่สำเร็จ"));
      }
    },
    [token, getUsers]
  );

  const adminUsers = users.filter((u) => u.role === "admin");
  const normalUsers = users.filter((u) => u.role !== "admin");

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4 font-th-sarabun text-gray-800">
      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}
      {!loading && (
        <>
          <Section
            title="ผู้ดูแลระบบ"
            users={adminUsers}
            onEdit={(u) => handleModalOpen("edit", u)}
            onView={(u) => handleModalOpen("view", u)}
            onChangeStatus={handleChangeStatus}
            onChangeRole={handleChangeRole}
            currentUserId={currentUserId}
            onDelete={handleDeleteUser}
          />
          <Section
            title="สมาชิกทั่วไป"
            users={normalUsers}
            onEdit={(u) => handleModalOpen("edit", u)}
            onView={(u) => handleModalOpen("view", u)}
            onChangeStatus={handleChangeStatus}
            onChangeRole={handleChangeRole}
            currentUserId={currentUserId}
            onDelete={handleDeleteUser}
          />
        </>
      )}
      {modal.type === "edit" && modal.data && (
        <CustomModal
          open={true}
          onClose={handleModalClose}
          title="แก้ไขข้อมูลผู้ใช้"
          description={`กำลังแก้ไขข้อมูลของ: ${
            modal.data.name || modal.data.email
          }`}
          icon={User}
          size="md"
        >
          {" "}
          <EditForm
            form={form}
            setForm={setForm}
            onSave={handleUpdateUser}
            onCancel={handleModalClose}
          />{" "}
        </CustomModal>
      )}{" "}
      {modal.type === "view" && modal.data && (
        <CustomModal
          open={true}
          onClose={handleModalClose}
          title="ข้อมูลผู้ใช้"
          description="รายละเอียดบัญชีผู้ใช้งาน"
          icon={Info}
          size="md"
        >
          <UserDetail user={modal.data} />
        </CustomModal>
      )}{" "}
    </div>
  );
};

export default TableUsers;
