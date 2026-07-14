"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  Calendar,
  FolderKanban,
  Search,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface UserType {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  _count: {
    projects: number;
  };
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  // Lấy danh sách users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể tải danh sách người dùng");
      }

      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Thay đổi quyền (Role)
  const handleToggleRole = async (user: UserType) => {
    const targetRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const confirmChange = window.confirm(
      `Bạn có chắc chắn muốn đổi quyền của "${user.name || user.email}" thành ${targetRole}?`
    );
    if (!confirmChange) return;

    setActionUserId(user.id);
    setSuccessMsg("");
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role: targetRole }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể cập nhật vai trò");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: targetRole } : u))
      );
      setSuccessMsg(`Đã đổi quyền của "${user.name || user.email}" thành ${targetRole} thành công.`);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setActionUserId(null);
    }
  };

  // Thay đổi trạng thái khóa/mở khóa (Status)
  const handleToggleStatus = async (user: UserType) => {
    const targetStatus = user.status === "BANNED" ? "ACTIVE" : "BANNED";
    const confirmChange = window.confirm(
      `Bạn có chắc chắn muốn ${targetStatus === "BANNED" ? "KHÓA" : "MỞ KHÓA"} tài khoản của "${user.name || user.email}"?`
    );
    if (!confirmChange) return;

    setActionUserId(user.id);
    setSuccessMsg("");
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, status: targetStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể cập nhật trạng thái");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: targetStatus } : u))
      );
      setSuccessMsg(
        `Đã ${targetStatus === "BANNED" ? "khóa" : "mở khóa"} tài khoản "${user.name || user.email}" thành công.`
      );
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setActionUserId(null);
    }
  };

  // Xóa tài khoản
  const handleDeleteUser = async (user: UserType) => {
    const confirmDelete = window.confirm(
      `CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${user.name || user.email}"? Hành động này sẽ xóa toàn bộ truyện và chương truyện liên quan của họ.`
    );
    if (!confirmDelete) return;

    setActionUserId(user.id);
    setSuccessMsg("");
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể xóa người dùng");
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setSuccessMsg(`Đã xóa tài khoản "${user.name || user.email}" thành công.`);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setActionUserId(null);
    }
  };

  // Thống kê nhanh
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const totalBanned = users.filter((u) => u.status === "BANNED").length;

  // Lọc tìm kiếm
  const filteredUsers = users.filter(
    (u) =>
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", spaceY: "1.5rem" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "var(--color-text-primary)", fontFamily: "var(--font-heading)" }}>
          Quản lý thành viên
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Xem danh sách, cập nhật quyền hạn và khóa/mở khóa tài khoản người dùng trong hệ thống.
        </p>
      </div>

      {/* Thông báo */}
      {successMsg && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "1rem",
          borderRadius: "var(--radius-md)",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          color: "#10b981",
          marginBottom: "1.5rem",
          fontSize: "0.875rem"
        }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "1rem",
          borderRadius: "var(--radius-md)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          color: "#ef4444",
          marginBottom: "1.5rem",
          fontSize: "0.875rem"
        }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Cards thống kê */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.25rem",
        marginBottom: "2rem"
      }}>
        {/* Card 1: Tổng */}
        <div style={{
          padding: "1.5rem",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          <div style={{
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            color: "#3b82f6"
          }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 500, uppercase: "true" }}>
              TỔNG THÀNH VIÊN
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "0.25rem" }}>
              {loading ? "..." : totalUsers}
            </div>
          </div>
        </div>

        {/* Card 2: Admin */}
        <div style={{
          padding: "1.5rem",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          <div style={{
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(124, 58, 237, 0.1)",
            color: "var(--color-accent-light)"
          }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
              QUẢN TRỊ VIÊN
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "0.25rem" }}>
              {loading ? "..." : totalAdmins}
            </div>
          </div>
        </div>

        {/* Card 3: Banned */}
        <div style={{
          padding: "1.5rem",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          <div style={{
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444"
          }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
              BỊ KHÓA
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "0.25rem" }}>
              {loading ? "..." : totalBanned}
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc Tìm kiếm */}
      <div style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "0.5rem 1rem",
        marginBottom: "1.5rem",
        maxWidth: "400px"
      }}>
        <Search size={18} style={{ color: "var(--color-text-muted)", marginRight: "0.75rem" }} />
        <input
          type="text"
          placeholder="Tìm tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            color: "var(--color-text-primary)",
            fontSize: "0.875rem",
            width: "100%"
          }}
        />
      </div>

      {/* Bảng danh sách */}
      <div style={{
        backgroundColor: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "var(--shadow-card)"
      }}>
        {loading ? (
          <div style={{ padding: "4rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-accent)" }} />
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Đang tải danh sách thành viên...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "var(--color-text-muted)" }}>
            Không tìm thấy thành viên nào phù hợp.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.15)" }}>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--color-text-primary)" }}>Thành viên</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--color-text-primary)" }}>Vai trò</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--color-text-primary)" }}>Trạng thái</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--color-text-primary)", textAlign: "center" }}>Dự án</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--color-text-primary)" }}>Ngày tham gia</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--color-text-primary)", textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isCurrent = user.id === (session?.user as any)?.id;
                  const isActionLoading = actionUserId === user.id;

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: "1px solid var(--color-border)",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {/* Cột 1: Tên & Email */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                          {user.name || "Chưa đặt tên"} {isCurrent && <span style={{ fontSize: "0.75rem", color: "var(--color-accent-light)", marginLeft: "0.25rem", fontStyle: "italic" }}>(Bạn)</span>}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.125rem" }}>
                          {user.email}
                        </div>
                      </td>

                      {/* Cột 2: Role Badge */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          backgroundColor: user.role === "ADMIN" ? "rgba(124, 58, 237, 0.15)" : "rgba(255,255,255,0.05)",
                          color: user.role === "ADMIN" ? "var(--color-accent-light)" : "var(--color-text-secondary)",
                          border: user.role === "ADMIN" ? "1px solid rgba(124, 58, 237, 0.3)" : "1px solid rgba(255,255,255,0.1)"
                        }}>
                          {user.role === "ADMIN" ? <Shield size={12} /> : null}
                          {user.role}
                        </span>
                      </td>

                      {/* Cột 3: Status Badge */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          backgroundColor: user.status === "ACTIVE" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: user.status === "ACTIVE" ? "#10b981" : "#ef4444",
                          border: user.status === "ACTIVE" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)"
                        }}>
                          {user.status === "ACTIVE" ? <UserCheck size={12} /> : <UserX size={12} />}
                          {user.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>

                      {/* Cột 4: Dự án */}
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", color: "var(--color-text-secondary)" }}>
                          <FolderKanban size={14} />
                          <span>{user._count.projects}</span>
                        </div>
                      </td>

                      {/* Cột 5: Ngày tham gia */}
                      <td style={{ padding: "1rem 1.5rem", color: "var(--color-text-secondary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          <Calendar size={14} style={{ color: "var(--color-text-muted)" }} />
                          <span>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </td>

                      {/* Cột 6: Thao tác */}
                      <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                          
                          {/* Nút Đổi Role */}
                          <button
                            title="Thay đổi vai trò (Role)"
                            disabled={isCurrent || isActionLoading}
                            onClick={() => handleToggleRole(user)}
                            className="btn btn-sm btn-ghost"
                            style={{
                              padding: "0.375rem",
                              borderRadius: "var(--radius-sm)",
                              color: "var(--color-text-secondary)",
                              cursor: isCurrent ? "not-allowed" : "pointer",
                              opacity: isCurrent ? 0.3 : 1
                            }}
                          >
                            <Shield size={16} />
                          </button>

                          {/* Nút Ban / Unban */}
                          <button
                            title={user.status === "BANNED" ? "Mở khóa tài khoản" : "Khóa tài khoản (Ban)"}
                            disabled={isCurrent || isActionLoading}
                            onClick={() => handleToggleStatus(user)}
                            className="btn btn-sm btn-ghost"
                            style={{
                              padding: "0.375rem",
                              borderRadius: "var(--radius-sm)",
                              color: user.status === "BANNED" ? "#10b981" : "#ef4444",
                              cursor: isCurrent ? "not-allowed" : "pointer",
                              opacity: isCurrent ? 0.3 : 1
                            }}
                          >
                            {user.status === "BANNED" ? <UserCheck size={16} /> : <UserX size={16} />}
                          </button>

                          {/* Nút Xóa */}
                          <button
                            title="Xóa vĩnh viễn người dùng"
                            disabled={isCurrent || isActionLoading}
                            onClick={() => handleDeleteUser(user)}
                            className="btn btn-sm btn-ghost"
                            style={{
                              padding: "0.375rem",
                              borderRadius: "var(--radius-sm)",
                              color: "#ef4444",
                              cursor: isCurrent ? "not-allowed" : "pointer",
                              opacity: isCurrent ? 0.3 : 1
                            }}
                          >
                            {isActionLoading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
