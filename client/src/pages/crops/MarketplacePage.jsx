import { useState, useEffect, useMemo } from "react";
import { HiOutlineSearch, HiOutlineFilter, HiX } from "react-icons/hi";
import { FaSeedling } from "react-icons/fa";
import { MdOutlineStorefront } from "react-icons/md";
import { fetchAllCrops } from "../../services/cropService";
import CropCard from "../../components/crops/CropCard";
import Spinner from "../../components/common/Spinner";
import { capitalise, getErrorMessage } from "../../utils/helpers";

/**
 * MarketplacePage — GET /api/v1/crops → display + client-side filter/search.
 *
 * Data flow:
 *   Mount → fetchAllCrops() → store in `allCrops`
 *   Search/Category change → useMemo derives `filteredCrops` from `allCrops`
 *   No re-fetch on filter — fast, zero network overhead for filtering.
 *
 * States:
 *   loading  — true while fetch is in-flight → skeleton / spinner
 *   error    — non-null when fetch fails       → error banner + retry
 *   allCrops — full dataset from API           → never mutated after fetch
 *
 * Filtering (client-side only):
 *   search   — case-insensitive substring match on cropName
 *   category — exact match on crop.category, "all" means no filter
 *
 * Note: Server-side search, filters, and pagination are coming in
 * a dedicated backend phase. The UI controls are intentionally kept
 * in a shape that makes that migration zero-friction — just swap
 * the useMemo derivation for an API call with query params.
 */

// ── All categories from the Crop model enum ───────────────────────────────────
const CROP_CATEGORIES = [
  "all",
  "vegetables",
  "fruits",
  "grains",
  "pulses",
  "spices",
  "oilseeds",
  "dairy",
  "poultry",
  "other",
];

// ── Skeleton card — shown while loading ──────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────

const MarketplacePage = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [allCrops,  setAllCrops]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("all");

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  const loadCrops = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAllCrops();
      setAllCrops(res.data.crops);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrops();
  }, []);

  // ── Client-side filtering ──────────────────────────────────────────────────
  // useMemo so derived list only recomputes when allCrops / search / category change.
  const filteredCrops = useMemo(() => {
    let crops = allCrops;

    // Category filter
    if (category !== "all") {
      crops = crops.filter((c) => c.category === category);
    }

    // Search filter — case-insensitive substring on cropName
    const term = search.trim().toLowerCase();
    if (term) {
      crops = crops.filter((c) =>
        c.cropName.toLowerCase().includes(term)
      );
    }

    return crops;
  }, [allCrops, search, category]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clearFilters = () => {
    setSearch("");
    setCategory("all");
  };

  const hasActiveFilter = search.trim() !== "" || category !== "all";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8">

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MdOutlineStorefront className="text-2xl text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          </div>
          <p className="text-sm text-gray-500">
            {loading
              ? "Loading fresh listings…"
              : `${filteredCrops.length} listing${filteredCrops.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* Total from API — gives a sense of scale */}
        {!loading && !error && (
          <p className="text-xs text-gray-400 shrink-0">
            {allCrops.length} total crops on platform
          </p>
        )}
      </div>

      {/* ── Search + Filter Bar ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4
                      flex flex-col sm:flex-row gap-3">

        {/* Search box */}
        <div className="relative flex-1">
          <HiOutlineSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crops by name…"
            aria-label="Search crops"
            className="input-field pl-10 pr-4"
          />
        </div>

        {/* Category dropdown */}
        <div className="relative sm:w-52">
          <HiOutlineFilter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none"
            aria-hidden="true"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="input-field pl-9 pr-8 appearance-none cursor-pointer bg-white"
          >
            {CROP_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : capitalise(cat)}
              </option>
            ))}
          </select>
          {/* Custom chevron — needed because appearance-none removes the native arrow */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
            ▾
          </div>
        </div>

        {/* Clear filters button — only shown when a filter is active */}
        {hasActiveFilter && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500
                       hover:text-red-500 border border-gray-200 rounded-lg
                       hover:border-red-200 transition-colors shrink-0"
            aria-label="Clear all filters"
          >
            <HiX className="text-base" />
            Clear
          </button>
        )}
      </div>

      {/* ── Active filter tags ────────────────────────────────────────── */}
      {hasActiveFilter && (
        <div className="flex flex-wrap gap-2 -mt-4">
          {category !== "all" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium
                             bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full
                             border border-primary-100">
              Category: {capitalise(category)}
              <button
                type="button"
                onClick={() => setCategory("all")}
                className="hover:text-primary-900 ml-0.5"
                aria-label={`Remove category filter: ${category}`}
              >
                <HiX className="text-xs" />
              </button>
            </span>
          )}
          {search.trim() && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium
                             bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full
                             border border-blue-100">
              Search: "{search.trim()}"
              <button
                type="button"
                onClick={() => setSearch("")}
                className="hover:text-blue-900 ml-0.5"
                aria-label="Remove search filter"
              >
                <HiX className="text-xs" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          CONTENT AREA — loading / error / empty / grid
      ══════════════════════════════════════════════════════════════ */}

      {/* ── Loading state ────────────────────────────────────────────── */}
      {loading && (
        <div>
          {/* Skeleton grid — same dimensions as real cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Error state ──────────────────────────────────────────────── */}
      {!loading && error && (
        <div
          role="alert"
          className="flex flex-col items-center gap-4 py-16 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <FaSeedling className="text-3xl text-red-300" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-base">
              Failed to load listings
            </p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">{error}</p>
          </div>
          <button
            type="button"
            onClick={loadCrops}
            className="btn-primary text-sm px-6"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Empty state (no results after filtering) ─────────────────── */}
      {!loading && !error && filteredCrops.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <FaSeedling className="text-3xl text-gray-300" />
          </div>
          <div>
            {allCrops.length === 0 ? (
              <>
                <p className="font-semibold text-gray-700 text-base">
                  No listings yet
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Farmers haven't added any crops yet. Check back soon.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-700 text-base">
                  No crops match your filters
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try a different search term or category.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 btn-secondary text-sm"
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Crop grid ────────────────────────────────────────────────── */}
      {!loading && !error && filteredCrops.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <CropCard key={crop._id} crop={crop} />
          ))}
        </div>
      )}

    </div>
  );
};

export default MarketplacePage;
