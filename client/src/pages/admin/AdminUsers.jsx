import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  HiOutlineSearch, HiX, HiOutlineTrash,
  HiOutlineLockClosed, HiOutlineLockOpen, HiOutlineEye,
  HiChevronLeft, HiChevronRight,
} from "react-icons/hi";
import { MdOutlinePeople } from "react-icons/md";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import { fetchAdminUsers, toggleUserStatus, deleteAdminUser } from "../../services/adminService";
import { formatDate, capitalise, getErrorMessage } from "../../utils/helpers";

/**
 * AdminUsers — view, search, filter, block/unblock, delete users.
 * Route: /admin/users
 */

const ROLE_PILL = {
  farmer:      "bg-primary-100 text-primary-700",
  buyer:       "bg-blue-100   text-blue-700",
  transporter: "bg-orange-100 text-orange-700",
  admin:       "bg-purple-100 text-purple-700",
};

const UserDetailModal = ({ user, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900 text-base">User Details</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><HiX /></button>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                        flex items-center justify-center text-white text-xl font-bold shrink-0">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_PILL[user.role] || "bg-gray-100 text-gray-600"}`}>
            {capitalise(user.role)}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          ["Phone",    user.phone || "—"],
          ["Status",   user.isActive ? "Active" : "Blocked"],
          ["Joined",   formatDate(user.createdAt)],
          ["Last Login", formatDate(user.lastLogin)],
          ["City",     user.address?.city || "—"],
          ["State",    user.address?.state || "—"],
        ].map(([k, v]) => (
          <div key={k} className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 font-medium">{k}</p>
            <p className="font-semibold text-gray-800 truncate">{v}</p>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="btn-secondary text-sm w-full">Close</button>
    </div>
  </div>
);

const AdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [users,       setUsers]       = useState([]);
  const [pagination,  setPagination]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState(searchParams.get("search") || "");
  const [role,        setRole]        = useState(searchParams.get("role")   || "");
  const [status,      setStatus]      = useState(searchParams.get("status") || "");
  const [page,        setPage]        = useState(1);
  const [actionId,    setActionId]    = useState(null);
  const [detailUser,  setDetailUser]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminUsers({ search, role, status, page, limit: 15 });
      setUsers(res.data.users);
      setPagination(res.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, role, status, page]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (user) => {
    setActionId(user._id);
    try {
      const res = await toggleUserStatus(user._id);
      setUsers((prev) => prev.map((u) => u._id === user._id ? res.data.user : u));
      toast.success(res.message);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setActionId(null); }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete "${user.name}"? This cannot be undone.`)) return;
    setActionId(user._id);
    try {
      await deleteAdminUser(user._id);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      toast.success("User deleted");
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setActionId(null); }
  };

  const FilterSelect = ({ value, onChange, children, label }) => (
    <div className="relative">
      <select value={value} onChange={onChange} aria-label={label}
        className="input-field appearance-none bg-white pr-8 text-sm cursor-pointer">
        {children}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</div>
    </div>
  );

  return (
    <>
      {detailUser && <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />}

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <MdOutlinePeople className="text-2xl text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500">
              {pagination ? `${pagination.totalResults} total users` : ""}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="search" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name or email…" className="input-field pl-9 text-sm" />
          </div>
          <FilterSelect value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} label="Filter by role">
            <option value="">All Roles</option>
            {["farmer","buyer","transporter","admin"].map((r) => (
              <option key={r} value={r}>{capitalise(r)}</option>
            ))}
          </FilterSelect>
          <FilterSelect value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} label="Filter by status">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Blocked</option>
          </FilterSelect>
          {(search || role || status) && (
            <button onClick={() => { setSearch(""); setRole(""); setStatus(""); setPage(1); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 border border-gray-200 px-3 rounded-lg transition-colors">
              <HiX className="text-base" /> Clear
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16"><Spinner size="w-9 h-9" /></div>
        )}

        {/* Error */}
        {!loading && error && (
          <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["User","Role","Status","Joined","Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">No users found</td></tr>
                  ) : users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                                          flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_PILL[user.role] || "bg-gray-100 text-gray-600"}`}>
                          {capitalise(user.role)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                          ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {user.isActive ? "Active" : "Blocked"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {/* View */}
                          <button onClick={() => setDetailUser(user)} title="View details"
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                            <HiOutlineEye className="text-gray-600" />
                          </button>
                          {/* Block / Unblock */}
                          {user.role !== "admin" && (
                            <button
                              onClick={() => handleToggle(user)}
                              disabled={actionId === user._id}
                              title={user.isActive ? "Block user" : "Unblock user"}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                ${user.isActive
                                  ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                                  : "bg-green-100 hover:bg-green-200 text-green-700"
                                }`}>
                              {actionId === user._id
                                ? <Spinner size="w-3.5 h-3.5" color="border-current" />
                                : user.isActive
                                  ? <HiOutlineLockClosed className="text-sm" />
                                  : <HiOutlineLockOpen className="text-sm" />
                              }
                            </button>
                          )}
                          {/* Delete */}
                          {user.role !== "admin" && (
                            <button
                              onClick={() => handleDelete(user)}
                              disabled={actionId === user._id}
                              title="Delete user"
                              className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors">
                              <HiOutlineTrash className="text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
                <p className="text-xs text-gray-500">
                  Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalResults} results
                </p>
                <div className="flex gap-1">
                  <button onClick={() => setPage((p) => p - 1)} disabled={!pagination.hasPreviousPage}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
                               hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <HiChevronLeft />
                  </button>
                  <button onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
                               hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <HiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminUsers;
