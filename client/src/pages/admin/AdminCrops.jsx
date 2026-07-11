import { useState, useEffect, useCallback } from "react";
import {
  HiOutlineSearch, HiX, HiOutlineTrash,
  HiOutlineEye, HiChevronLeft, HiChevronRight,
} from "react-icons/hi";
import { MdOutlineAgriculture, MdToggleOn, MdToggleOff } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import { fetchAdminCrops, toggleCropAvailability, deleteAdminCrop } from "../../services/adminService";
import { formatDate, formatCurrency, capitalise, getErrorMessage } from "../../utils/helpers";

/**
 * AdminCrops — view all crops, toggle availability, delete any crop.
 * Route: /admin/crops
 */

const PLACEHOLDER = "https://placehold.co/48x48/f0fdf4/16a34a?text=🌾";

const CATEGORY_PILL = {
  vegetables: "bg-green-100 text-green-700",
  fruits:     "bg-purple-100 text-purple-700",
  grains:     "bg-amber-100 text-amber-700",
  pulses:     "bg-orange-100 text-orange-700",
  spices:     "bg-red-100 text-red-700",
  oilseeds:   "bg-yellow-100 text-yellow-700",
  dairy:      "bg-blue-100 text-blue-700",
  poultry:    "bg-rose-100 text-rose-700",
  other:      "bg-gray-100 text-gray-600",
};

const AdminCrops = () => {
  const navigate = useNavigate();
  const [crops,      setCrops]      = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("");
  const [available,  setAvailable]  = useState("");
  const [page,       setPage]       = useState(1);
  const [actionId,   setActionId]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchAdminCrops({ search, category, available, page, limit: 15 });
      setCrops(res.data.crops);
      setPagination(res.pagination);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, [search, category, available, page]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (crop) => {
    setActionId(crop._id);
    try {
      const res = await toggleCropAvailability(crop._id);
      setCrops((prev) => prev.map((c) => c._id === crop._id ? res.data.crop : c));
      toast.success(res.message);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setActionId(null); }
  };

  const handleDelete = async (crop) => {
    if (!window.confirm(`Delete "${crop.cropName}"? This cannot be undone.`)) return;
    setActionId(crop._id);
    try {
      await deleteAdminCrop(crop._id);
      setCrops((prev) => prev.filter((c) => c._id !== crop._id));
      toast.success("Crop deleted");
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <MdOutlineAgriculture className="text-2xl text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crops</h1>
          <p className="text-sm text-gray-500">{pagination ? `${pagination.totalResults} total crops` : ""}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="search" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by crop name…" className="input-field pl-9 text-sm" />
        </div>
        <FilterSelect value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} label="Category">
          <option value="">All Categories</option>
          {["vegetables","fruits","grains","pulses","spices","oilseeds","dairy","poultry","other"].map((c) => (
            <option key={c} value={c}>{capitalise(c)}</option>
          ))}
        </FilterSelect>
        <FilterSelect value={available} onChange={(e) => { setAvailable(e.target.value); setPage(1); }} label="Availability">
          <option value="">All</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </FilterSelect>
        {(search || category || available) && (
          <button onClick={() => { setSearch(""); setCategory(""); setAvailable(""); setPage(1); }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 border border-gray-200 px-3 rounded-lg transition-colors">
            <HiX className="text-base" /> Clear
          </button>
        )}
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Crop","Category","Price","Farmer","Status","Listed","Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                        <div className="flex flex-col gap-1.5">
                          <div className="h-3.5 bg-gray-200 rounded w-24" />
                          <div className="h-3 bg-gray-100 rounded w-16" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><div className="h-5 bg-gray-100 rounded-full w-18" /></td>
                    <td className="px-5 py-3.5"><div className="h-3.5 bg-gray-200 rounded w-16" /></td>
                    <td className="px-5 py-3.5"><div className="h-3.5 bg-gray-100 rounded w-20" /></td>
                    <td className="px-5 py-3.5"><div className="h-5 bg-gray-100 rounded-full w-20" /></td>
                    <td className="px-5 py-3.5"><div className="h-3.5 bg-gray-100 rounded w-16" /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-100" />
                        <div className="w-8 h-8 rounded-lg bg-gray-100" />
                        <div className="w-8 h-8 rounded-lg bg-gray-100" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!loading && error && <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Crop","Category","Price","Farmer","Status","Listed","Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {crops.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                          <MdOutlineAgriculture className="text-3xl text-gray-300" />
                        </div>
                        <p className="font-semibold text-gray-600">No crops found</p>
                        <p className="text-sm text-gray-400">
                          {(search || category || available)
                            ? "Try adjusting your search or filters."
                            : "No crop listings have been added yet."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : crops.map((crop) => (
                  <tr key={crop._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={crop.images?.[0]?.url || PLACEHOLDER} alt={crop.cropName}
                          className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0"
                          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
                        <div>
                          <p className="font-semibold text-gray-800">{crop.cropName}</p>
                          <p className="text-xs text-gray-400">{crop.location?.state}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_PILL[crop.category] || "bg-gray-100 text-gray-600"}`}>
                        {capitalise(crop.category)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-primary-700 tabular-nums">
                      {formatCurrency(crop.price)}<span className="text-gray-400 font-normal">/{crop.unit}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{crop.owner?.name || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                        ${crop.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {crop.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{formatDate(crop.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => navigate(`/crops/${crop._id}`)} title="View listing"
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                          <HiOutlineEye className="text-gray-600 text-sm" />
                        </button>
                        <button onClick={() => handleToggle(crop)} disabled={actionId === crop._id} title="Toggle availability"
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                            ${crop.isAvailable ? "bg-green-100 hover:bg-green-200 text-green-700" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}>
                          {actionId === crop._id
                            ? <Spinner size="w-3.5 h-3.5" color="border-current" />
                            : crop.isAvailable ? <MdToggleOn className="text-lg" /> : <MdToggleOff className="text-lg" />
                          }
                        </button>
                        <button onClick={() => handleDelete(crop)} disabled={actionId === crop._id} title="Delete crop"
                          className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors">
                          <HiOutlineTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
              <p className="text-xs text-gray-500">Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalResults} crops</p>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => p - 1)} disabled={!pagination.hasPreviousPage}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <HiChevronLeft />
                </button>
                <button onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <HiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCrops;
