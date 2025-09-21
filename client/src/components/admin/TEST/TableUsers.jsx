import React, { useEffect, useState, useCallback } from "react";
import {
  getListAllUsers,
  changeUserStatus,
  changeUserRole,
  deleteUser,
  updateUserEmail,
} from "../../api/admin";
import useEcomStore from "../../store/ecom-store";
import { toast } from "react-toastify";
import { UserPen, UserCog, UserCheck, UserRoundX, Trash2 } from "lucide-react";

const TableUsers = () => {
  const token = useEcomStore((state) => state.token);
  const [users, setUsers] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    handleGetUsers(token);
    // eslint-disable-next-line
  }, []);

  const handleGetUsers = useCallback((token) => {
    getListAllUsers(token)
      .then((res) => setUsers(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleChangeUsersStatus = (userId, userStatus) => {
    changeUserStatus(token, { id: userId, enabled: !userStatus })
      .then(() => {
        handleGetUsers(token);
        toast.success("อัปเดตสถานะสำเร็จ!");
      })
      .catch((err) => console.log(err));
  };

  const handleChangeUsersRole = (userId, userRole) => {
    changeUserRole(token, { id: userId, role: userRole })
      .then(() => {
        handleGetUsers(token);
        toast.success("อัปเดตสิทธิ์สำเร็จ!");
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?")) {
      deleteUser(token, userId)
        .then(() => {
          handleGetUsers(token);
          toast.success("ลบผู้ใช้งานสำเร็จ!");
        })
        .catch((err) => {
          console.log(err);
          toast.error("ลบผู้ใช้งานไม่สำเร็จ");
        });
    }
  };

  const handleEditUser = async () => {
    if (!editUser) return;
    try {
      await updateUserEmail(token, editUser.id, {
        email: newEmail,
        name: newName,
      });
      toast.success("แก้ไขข้อมูลสำเร็จ!");
      setEditModal(false);
      handleGetUsers(token);
    } catch (err) {
      toast.error("แก้ไขข้อมูลไม่สำเร็จ");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 px-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">👥 จัดการผู้ใช้</h2>

      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3">ลำดับ</th>
              <th className="px-4 py-3">ชื่อ</th>
              <th className="px-4 py-3">อีเมล</th>
              <th className="px-4 py-3">เบอร์โทรศัพท์</th>
              <th className="px-4 py-3">ที่อยู่</th>
              <th className="px-4 py-3">สิทธิ์</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.email}</td>
                <td className="px-4 py-2">{item.telephone}</td>
                <td className="px-4 py-2">{item.address}</td>
                <td className="px-4 py-2">
                  <select
                    value={item.role}
                    onChange={(e) =>
                      handleChangeUsersRole(item.id, e.target.value)
                    }
                    className="bg-white border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="user">สมาชิก</option>
                    <option value="admin">ผู้ดูแล</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.enabled
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.enabled ? "กำลังใช้งาน" : "ไม่ได้ใช้งาน"}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() =>
                        handleChangeUsersStatus(item.id, item.enabled)
                      }
                      className={`px-3 py-1 rounded text-white text-sm font-semibold transition ${
                        item.enabled
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {item.enabled ? <UserRoundX /> : <UserCheck />}
                    </button>
                    <button
                      onClick={() => {
                        setEditUser(item);
                        setNewEmail(item.email);
                        setNewName(item.name || "");
                        setEditModal(true);
                      }}
                      className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold"
                    >
                      <UserPen />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(item.id)}
                      className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  ไม่มีข้อมูลผู้ใช้งาน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              แก้ไขข้อมูลผู้ใช้
            </h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="ชื่อ"
              className="mb-3 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="อีเมล"
              className="mb-4 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleEditUser}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableUsers;
