import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  HiOutlineSearch,
  HiOutlineAdjustments,
  HiX,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import { FaSeedling } from "react-icons/fa";
import { MdOutlineStorefront } from "react-icons/md";
import { fetchCrops } from "../../services/cropService";
import CropCard from "../../components/crops/CropCard";
import Spinner from "../../components/common/Spinner";
import { capitalise, getErrorMessage } from "../../utils/helpers";

/**
 * MarketplacePage — server-side search, filter, sort, and pagination.
 *
 * Data flow:
 *   filters + page change → useEffect fires → fetchCrops(params) → API call
 *   Search input is debounced 400 ms to avoid a request on every keystroke.
 *   All filter state lives in one `filters` object for easy serialisation.
 *
 * Filter state shape:
 *   { keyword, category, state, district, minPrice, maxPrice, sort }
 *
 * Pagination state: separate `page` number (resets to 1 on any filter change).
 *
 * API response shape:
 *   { success, count, pagination: { currentPage, totalPages, totalResults,
 *     hasNextPage, hasPreviousPage, limit }, data: { crops } }
 */

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "all", "vegetables", "fruits", "grains", "pulses",
  "spices", "oilseeds", "dairy", "poultry", "other",
];

const SORT_OPTIONS = [
  { value: "latest",     label: "Latest First" },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "harvest",    label: "Harvest Date" },
];

const DEFAULT_FILTERS = {
  keyword:  "",
  category: "",
  state:    "",
  district: "",
  minPrice: "",
  maxPrice: "",
  sort:     "latest",
};

const LIMIT = 12; // results per page

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-44 bg-gray-200" />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="border-t border-gray-50 my-0.5" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-10 bg-gray-100 rounded-xl mt-2" />
    </div>
  </div>
);

// ── Pagination component ──────────────────────────────────────────────────────
const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, totalResults, limit } = pagination;
  const from = (currentPage - 1) * limit + 1;
  const to   = Math.min(currentPage * limit, totalResults);

  // Build visible page numbers (max 5, with ellipsis gaps)
  const buildPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
      {/* Result range */}
      <p className="text-sm text-gray-500 shrink-0">
        Showing <span className="font-semibold text-gray-700">{from}–{to}</span> of{" "}
        <span className="font-semibold text-gray-700">{totalResults}</span> results
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
          className="w-9 h-9 rounded-lg flex items-center justify-center
                     text-gray-500 hover:bg-gray-100 disabled:opacity-40
                     disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <HiChevronLeft className="text-lg" />
        </button>

        {/* Page numbers */}
        {buildPages().map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                          ${p === currentPage
                            ? "bg-primary-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                          }`}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="w-9 h-9 rounded-lg flex items-center justify-center
                     text-gray-500 hover:bg-gray-100 disabled:opacity-40
                     disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <HiChevronRight className="text-lg" />
        </button>
      </div>
    </div>
  );
};

// ── Select helper ─────────────────────────────────────────────────────────────
const FilterSelect = ({ value, onChange, children, ariaLabel, className = "" }) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      className="input-field appearance-none cursor-pointer bg-white pr-8 text-sm"
    >
      {children}
    </select>
    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
      ▾
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const VALID_CATS = [
  "vegetables","fruits","grains","pulses",
  "spices","oilseeds","dairy","poultry","other",
];

const MarketplacePage = () => {
  const location = useLocation();

  // ── Seed initial filters from URL query params ─────────────────────────────
  // e.g. /crops?category=grains  (linked from homepage category tiles)
  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    const cat = (params.get("category") || "").toLowerCase();
    return {
      ...DEFAULT_FILTERS,
      category: VALID_CATS.includes(cat) ? cat : "",
    };
  };

  const [crops,       setCrops]       = useState([]);
  const [pagination,  setPagination]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [filters,     setFilters]     = useState(getInitialFilters);
  const [page,        setPage]        = useState(1);
  const [showFilters, setShowFilters] = useState(() => {
    // Auto-open the filter panel when a category was pre-selected
    const params = new URLSearchParams(location.search);
    return VALID_CATS.includes((params.get("category") || "").toLowerCase());
  });

  // Debounce ref for keyword
  const debounceRef = useRef(null);
  // Track committed keyword (what's actually been sent to API)
  const [committedKeyword, setCommittedKeyword] = useState("");
  // Local keyword input (shown immediately, debounced before API)
  const [keywordInput, setKeywordInput] = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const loadCrops = useCallback(async (activeFilters, activePage) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...activeFilters,
        keyword: activeFilters.keyword || undefined,
        page:    activePage,
        limit:   LIMIT,
      };
      const res = await fetchCrops(params);
      setCrops(res.data.crops);
      setPagination(res.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever filters or page change
  useEffect(() => {
    loadCrops(filters, page);
  }, [filters, page, loadCrops]);

  // ── Keyword debounce ───────────────────────────────────────────────────────
  const handleKeywordChange = (e) => {
    const val = e.target.value;
    setKeywordInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCommittedKeyword(val);
      setFilters((prev) => ({ ...prev, keyword: val }));
      setPage(1);
    }, 400);
  };

  // ── Filter change helpers ──────────────────────────────────────────────────
  const handleFilterChange = (field) => (e) => {
    const val = e.target.value;
    setFilters((prev) => ({ ...prev, [field]: val }));
    setPage(1); // reset to page 1 on any filter change
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setKeywordInput("");
    setCommittedKeyword("");
    setPage(1);
  };

  // ── Active filter detection ────────────────────────────────────────────────
  const activeFilterCount = [
    filters.keyword,
    filters.category,
    filters.state,
    filters.district,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0 || filters.sort !== "latest";

  // ── Active filter tags data ────────────────────────────────────────────────
  const filterTags = [
    filters.keyword  && { key: "keyword",  label: `Search: "${filters.keyword}"`,     color: "bg-blue-50 text-blue-700 border-blue-100" },
    filters.category && { key: "category", label: `Category: ${capitalise(filters.category)}`, color: "bg-primary-50 text-primary-700 border-primary-100" },
    filters.state    && { key: "state",    label: `State: ${filters.state}`,           color: "bg-purple-50 text-purple-700 border-purple-100" },
    filters.district && { key: "district", label: `District: ${filters.district}`,     color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
    (filters.minPrice || filters.maxPrice) && {
      key: "price",
      label: `Price: ₹${filters.minPrice || "0"} – ₹${filters.maxPrice || "∞"}`,
      color: "bg-amber-50 text-amber-700 border-amber-100",
    },
  ].filter(Boolean);

  const removeTag = (key) => {
    if (key === "price") {
      setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "" }));
    } else if (key === "keyword") {
      setFilters((prev) => ({ ...prev, keyword: "" }));
      setKeywordInput("");
      setCommittedKeyword("");
    } else {
      setFilters((prev) => ({ ...prev, [key]: "" }));
    }
    setPage(1);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <MdOutlineStorefront className="text-2xl text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          </div>
          <p className="text-sm text-gray-500">
            {loading
              ? "Searching listings…"
              : pagination
                ? `${pagination.totalResults.toLocaleString()} listing${pagination.totalResults !== 1 ? "s" : ""} found`
                : ""}
          </p>
        </div>

        {/* Sort + toggle filters button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <FilterSelect
            value={filters.sort}
            onChange={handleFilterChange("sort")}
            ariaLabel="Sort listings"
            className="w-48"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </FilterSelect>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                        rounded-lg border transition-colors relative
                        ${showFilters || activeFilterCount > 0
                          ? "bg-primary-50 border-primary-200 text-primary-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
            aria-expanded={showFilters}
          >
            <HiOutlineAdjustments className="text-base" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary-600 text-white
                               text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Search bar ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <HiOutlineSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400
                       text-lg pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={keywordInput}
            onChange={handleKeywordChange}
            placeholder="Search crops by name…"
            aria-label="Search crops"
            className="input-field pl-10 pr-4"
          />
          {keywordInput && (
            <button
              type="button"
              onClick={() => {
                setKeywordInput("");
                setFilters((prev) => ({ ...prev, keyword: "" }));
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                         hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <HiX className="text-base" />
            </button>
          )}
        </div>
      </div>

      {/* ── Expandable filter panel ───────────────────────────────────── */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                        p-5 flex flex-col gap-5 animate-slide-down">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">Filter Listings</h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-red-500 font-medium hover:text-red-700
                           transition-colors flex items-center gap-1"
              >
                <HiX className="text-xs" /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Category
              </label>
              <FilterSelect
                value={filters.category}
                onChange={handleFilterChange("category")}
                ariaLabel="Filter by category"
              >
                <option value="">All Categories</option>
                {CATEGORIES.filter((c) => c !== "all").map((c) => (
                  <option key={c} value={c}>{capitalise(c)}</option>
                ))}
              </FilterSelect>
            </div>

            {/* State */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                State
              </label>
              <input
                type="text"
                placeholder="e.g. Punjab"
                value={filters.state}
                onChange={handleFilterChange("state")}
                className="input-field text-sm"
                aria-label="Filter by state"
              />
            </div>

            {/* District */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                District
              </label>
              <input
                type="text"
                placeholder="e.g. Amritsar"
                value={filters.district}
                onChange={handleFilterChange("district")}
                className="input-field text-sm"
                aria-label="Filter by district"
              />
            </div>

            {/* Sort (duplicate here for convenience inside panel) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Sort By
              </label>
              <FilterSelect
                value={filters.sort}
                onChange={handleFilterChange("sort")}
                ariaLabel="Sort listings"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </FilterSelect>
            </div>
          </div>

          {/* Price range */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Price Range (₹ per unit)
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  step="1"
                  value={filters.minPrice}
                  onChange={handleFilterChange("minPrice")}
                  className="input-field pl-7 text-sm"
                  aria-label="Minimum price"
                />
              </div>
              <span className="text-gray-400 text-sm shrink-0">to</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  step="1"
                  value={filters.maxPrice}
                  onChange={handleFilterChange("maxPrice")}
                  className="input-field pl-7 text-sm"
                  aria-label="Maximum price"
                />
              </div>
              {(filters.minPrice || filters.maxPrice) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "" }));
                    setPage(1);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  aria-label="Clear price range"
                >
                  <HiX className="text-base" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Active filter tags ────────────────────────────────────────── */}
      {filterTags.length > 0 && (
        <div className="flex flex-wrap gap-2 -mt-2">
          {filterTags.map((tag) => (
            <span
              key={tag.key}
              className={`inline-flex items-center gap-1.5 text-xs font-medium
                          px-3 py-1.5 rounded-full border ${tag.color}`}
            >
              {tag.label}
              <button
                type="button"
                onClick={() => removeTag(tag.key)}
                className="hover:opacity-70 ml-0.5"
                aria-label={`Remove ${tag.key} filter`}
              >
                <HiX className="text-xs" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          CONTENT AREA
      ══════════════════════════════════════════════════════════════ */}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div role="alert" className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <FaSeedling className="text-3xl text-red-300" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Failed to load listings</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => loadCrops(filters, page)}
            className="btn-primary text-sm px-6"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && crops.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <FaSeedling className="text-3xl text-gray-300" />
          </div>
          <div>
            {hasActiveFilters ? (
              <>
                <p className="font-semibold text-gray-700">No crops match your filters</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search or removing some filters.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-4 btn-secondary text-sm"
                >
                  Clear All Filters
                </button>
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-700">No listings yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Farmers haven't added any crops yet. Check back soon.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Crop grid */}
      {!loading && !error && crops.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <CropCard key={crop._id} crop={crop} />
            ))}
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </div>
        </>
      )}
    </div>
  );
};

export default MarketplacePage;
