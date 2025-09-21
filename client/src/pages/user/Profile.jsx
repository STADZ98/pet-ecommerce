import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import {
  updateUserInfo as apiUpdateUserInfo,
  getUserAddress,
} from "../../api/user";
import store from "../../store/ecom-store";
import ProfileAvatarUpload from "../../components/user/ProfileAvatarUpload";

const Profile = () => {
  const profile = useEcomStore((s) => s.profile);
  const fetchProfile = useEcomStore((s) => s.fetchProfile);
  const token = useEcomStore((s) => s.token);

  const [form, setForm] = useState({
    name: "",
    email: "",
    telephone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // load profile when page mounts
    fetchProfile();
  }, [fetchProfile]);

  // load saved address/telephone from user API so form shows existing values
  useEffect(() => {
    const loadAddress = async () => {
      if (!token) return;
      // console.log("[Profile] loadAddress called, token present");
      try {
        const res = await getUserAddress(token);
        // console.log("[Profile] getUserAddress response:", res?.data);
        // Normalize possible response shapes
        let addresses = [];
        const data = res?.data;
        if (Array.isArray(data)) {
          addresses = data;
        } else if (Array.isArray(data?.addresses)) {
          addresses = data.addresses;
        } else if (data && (data.telephone || data.address)) {
          addresses = [data];
        }

        // console.log("[Profile] parsed addresses:", addresses);
        if (addresses.length > 0) {
          const a = addresses[0];
          setForm((prev) => ({
            ...prev,
            telephone: a.telephone || prev.telephone,
            address: a.address || prev.address,
            name: prev.name || a.name || prev.name,
          }));
          // console.log("[Profile] applied address:", a);
        } else {
          // console.log("[Profile] no address data returned after parsing");
        }
      } catch (err) {
        console.error("Error loading user address:", err);
      }
    };
    loadAddress();
  }, [token]);

  useEffect(() => {
    if (profile) {
      // console.log("[Profile] profile effect, profile:", profile);
      // merge profile fields but do not overwrite telephone/address if already loaded
      setForm((prev) => ({
        ...prev,
        name: profile.name || prev.name || "",
        email: profile.email || prev.email || "",
        telephone: profile.telephone || prev.telephone || prev.telephone || "",
        address: profile.address || prev.address || prev.address || "",
      }));
      // console.log("[Profile] merged profile into form");
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (!profile || !profile.id) {
      alert("ไม่พบข้อมูลผู้ใช้");
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      telephone: form.telephone,
      address: form.address,
    };
    if (form.password) payload.password = form.password;

    try {
      setLoading(true);
      await apiUpdateUserInfo(token, profile.id, payload);
      // update user email in store so navbar reflects change
      if (store.getState().user) {
        store.setState({
          user: { ...(store.getState().user || {}), email: form.email },
        });
      }
      await fetchProfile();
      alert("อัปเดตข้อมูลเรียบร้อย");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปเดต");
    } finally {
      setLoading(false);
      setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">ตั้งค่าบัญชี</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={
                  profile?.picture ||
                  "https://cdn-icons-png.flaticon.com/128/1326/1326377.png"
                }
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-semibold">
                {profile?.name || profile?.email}
              </div>
              <div className="text-xs text-gray-500">แก้ไขรูปโปรไฟล์</div>
            </div>
          </div>
          <ProfileAvatarUpload
            onUploaded={async (url) => {
              // update store profile and user picture
              const s = store.getState();
              if (s.user) store.setState({ user: { ...s.user, picture: url } });
              await fetchProfile();
            }}
          />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                ชื่อ - นามสกุล
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-md p-2"
                placeholder="ชื่อ"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">อีเมล</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-md p-2"
                placeholder="example@mail.com"
                type="email"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                เบอร์โทรศัพท์
              </label>
              <input
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-md p-2"
                placeholder="08x-xxx-xxxx"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                ที่อยู่
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-md p-2"
                placeholder="ที่อยู่จัดส่ง"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                รหัสผ่านใหม่
              </label>
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-md p-2"
                type="password"
                placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                ยืนยันรหัสผ่าน
              </label>
              <input
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-md p-2"
                type="password"
                placeholder="ยืนยันรหัสผ่าน"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                if (profile)
                  setForm({
                    ...form,
                    name: profile.name || "",
                    email: profile.email || "",
                    telephone: profile.telephone || "",
                    address: profile.address || "",
                    password: "",
                    confirmPassword: "",
                  });
              }}
              className="px-4 py-2 rounded-md border border-gray-200 text-gray-700"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-md bg-yellow-500 text-white font-medium hover:bg-yellow-600 disabled:opacity-60"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
