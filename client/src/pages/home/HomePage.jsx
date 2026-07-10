import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaSeedling,
  FaShoppingBasket,
  FaTruck,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaLeaf,
  FaArrowRight,
  FaUsers,
  FaBoxOpen,
  FaGlobeAsia,
} from "react-icons/fa";
import {
  MdOutlineAgriculture,
  MdOutlineLocalFlorist,
  MdOutlineStorefront,
  MdDashboard,
} from "react-icons/md";
import { GiWheat, GiCarrot, GiGrapes, GiMilkCarton } from "react-icons/gi";
import { HiOutlineBadgeCheck, HiOutlineCurrencyRupee } from "react-icons/hi";
import useAuth from "../../hooks/useAuth";
import { fetchFeaturedCrops, fetchPlatformStats } from "../../services/cropService";
import { ROUTES, ROLE_DASHBOARD } from "../../utils/constants";
import { capitalise, formatCurrency } from "../../utils/helpers";

// ─── Static category browse tiles ────────────────────────────────────────────
// Category counts are intentionally omitted — they were hardcoded and misleading.
const CATEGORIES = [
  {
    icon:   <GiWheat className="text-4xl text-amber-500" />,
    label:  "Grains",
    value:  "grains",
    bg:     "bg-amber-50",
    border: "border-amber-100",
    hover:  "hover:bg-amber-100",
  },
  {
    icon:   <GiCarrot className="text-4xl text-orange-500" />,
    label:  "Vegetables",
    value:  "vegetables",
    bg:     "bg-orange-50",
    border: "border-orange-100",
    hover:  "hover:bg-orange-100",
  },
  {
    icon:   <GiGrapes className="text-4xl text-purple-500" />,
    label:  "Fruits",
    value:  "fruits",
    bg:     "bg-purple-50",
    border: "border-purple-100",
    hover:  "hover:bg-purple-100",
  },
  {
    icon:   <MdOutlineLocalFlorist className="text-4xl text-pink-500" />,
    label:  "Pulses",
    value:  "pulses",
    bg:     "bg-pink-50",
    border: "border-pink-100",
    hover:  "hover:bg-pink-100",
  },
  {
    icon:   <GiMilkCarton className="text-4xl text-blue-500" />,
    label:  "Dairy",
    value:  "dairy",
    bg:     "bg-blue-50",
    border: "border-blue-100",
    hover:  "hover:bg-blue-100",
  },
];

const WHY_FEATURES = [
  {
    icon:  <HiOutlineCurrencyRupee className="text-3xl text-primary-600" />,
    bg:    "bg-primary-50",
    title: "Fair Pricing",
    desc:  "Farmers set their own prices. No commission, no hidden fees. Buyers always get market-competitive rates directly from the source.",
  },
  {
    icon:  <HiOutlineBadgeCheck className="text-3xl text-blue-600" />,
    bg:    "bg-blue-50",
    title: "Verified Farmers",
    desc:  "Every farmer on the platform is identity-verified. Browse with confidence knowing you're buying from a real, trusted source.",
  },
  {
    icon:  <FaTruck className="text-3xl text-amber-600" />,
    bg:    "bg-amber-50",
    title: "Fast Delivery",
    desc:  "Our transporter network ensures crops reach buyers fresh. Real-time tracking available for every active delivery.",
  },
  {
    icon:  <FaShieldAlt className="text-3xl text-purple-600" />,
    bg:    "bg-purple-50",
    title: "Secure Transactions",
    desc:  "End-to-end encrypted payments and dispute resolution. Your money is protected at every step of the transaction.",
  },
];

// ── Placeholder image ─────────────────────────────────────────────────────────
const PLACEHOLDER = "https://placehold.co/400x260/f0fdf4/16a34a?text=No+Image";

// ── Category colour pill ──────────────────────────────────────────────────────
const CATEGORY_COLOURS = {
  vegetables: "bg-green-100  text-green-700",
  fruits:     "bg-purple-100 text-purple-700",
  grains:     "bg-amber-100  text-amber-700",
  pulses:     "bg-orange-100 text-orange-700",
  spices:     "bg-red-100    text-red-700",
  oilseeds:   "bg-yellow-100 text-yellow-700",
  dairy:      "bg-blue-100   text-blue-700",
  poultry:    "bg-rose-100   text-rose-700",
  other:      "bg-gray-100   text-gray-600",
};

// ─── Reusable layout helpers ──────────────────────────────────────────────────
const Section = ({ children, className = "" }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ eyebrow, title, subtitle }) => (
  <div className="text-center mb-12">
    {eyebrow && (
      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-3">
        {eyebrow}
      </span>
    )}
    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
);

// ── Skeleton for stat cards ───────────────────────────────────────────────────
const StatSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-3 animate-pulse">
    <div className="w-14 h-14 rounded-2xl bg-gray-200" />
    <div className="h-8 w-20 bg-gray-200 rounded" />
    <div className="h-4 w-16 bg-gray-100 rounded" />
  </div>
);

// ── Skeleton for featured crop cards ─────────────────────────────────────────
const FeaturedSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-44 bg-gray-200" />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-10 bg-gray-100 rounded-xl mt-2" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  // ── Live stats ────────────────────────────────────────────────────────────
  const [stats,        setStats]        = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Live featured crops ───────────────────────────────────────────────────
  const [featuredCrops,        setFeaturedCrops]        = useState([]);
  const [featuredLoading,      setFeaturedLoading]      = useState(true);
  const [featuredError,        setFeaturedError]        = useState(false);

  useEffect(() => {
    // Fetch both in parallel — public endpoints, no auth needed
    Promise.all([
      fetchPlatformStats().catch(() => null),
      fetchFeaturedCrops().catch(() => null),
    ]).then(([statsRes, featuredRes]) => {
      if (statsRes?.data) setStats(statsRes.data);
      setStatsLoading(false);

      if (featuredRes?.data?.crops) {
        setFeaturedCrops(featuredRes.data.crops);
      } else {
        setFeaturedError(true);
      }
      setFeaturedLoading(false);
    });
  }, []);

  // ── Stat cards definition — populated from API when available ─────────────
  const STAT_CARDS = [
    {
      icon:  <FaUsers className="text-3xl" />,
      value: stats ? `${stats.farmers.toLocaleString()}+` : "—",
      label: "Farmers",
    },
    {
      icon:  <FaShoppingBasket className="text-3xl" />,
      value: stats ? `${stats.buyers.toLocaleString()}+` : "—",
      label: "Buyers",
    },
    {
      icon:  <FaBoxOpen className="text-3xl" />,
      value: stats ? `${stats.listings.toLocaleString()}+` : "—",
      label: "Active Listings",
    },
    {
      icon:  <FaGlobeAsia className="text-3xl" />,
      value: stats ? String(stats.states) : "—",
      label: "States Covered",
    },
  ];

  return (
    <div className="flex flex-col">

      {/* ══════════════════════════════════════════════════════════════
          1. HERO SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500"
        aria-labelledby="hero-heading"
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-400 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-primary-800 rounded-full opacity-30 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full opacity-5" />
        </div>

        <Section className="relative py-24 sm:py-32">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">

            {/* Eyebrow badge */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full">
              <MdOutlineAgriculture className="text-lg" />
              India's Crop Marketplace
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
            >
              Farm Fresh Crops,{" "}
              <span className="text-primary-200">Direct to You</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-primary-100 max-w-2xl leading-relaxed">
              Connecting farmers, buyers, and transporters across India.
              No middlemen. Fair prices. Fresh produce delivered to your door.
            </p>

            {/* CTA Buttons — role-aware */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <Link
                to={ROUTES.CROPS}
                className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl text-base"
              >
                <FaShoppingBasket className="text-base" />
                Explore Marketplace
              </Link>

              {/* Show "List Your Crops" only for farmers; hide for all other roles and guests */}
              {(!isAuthenticated || user?.role === "farmer") && (
                <Link
                  to={isAuthenticated ? ROUTES.CROP_CREATE : ROUTES.REGISTER}
                  className="inline-flex items-center gap-2 bg-primary-800 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-primary-900 transition-colors border border-white/20 text-base"
                >
                  <FaSeedling className="text-base" />
                  {isAuthenticated ? "List Your Crops" : "Sell Your Crops"}
                </Link>
              )}
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-primary-100 text-sm">
              <span className="flex items-center gap-1.5">
                <HiOutlineBadgeCheck className="text-base text-primary-200" />
                Verified Farmers
              </span>
              <span className="flex items-center gap-1.5">
                <FaShieldAlt className="text-base text-primary-200" />
                Secure Payments
              </span>
              <span className="flex items-center gap-1.5">
                <FaTruck className="text-base text-primary-200" />
                Fast Delivery
              </span>
            </div>
          </div>
        </Section>

        {/* Wave divider */}
        <div className="relative h-12 overflow-hidden" aria-hidden="true">
          <svg
            viewBox="0 0 1440 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 w-full"
            preserveAspectRatio="none"
          >
            <path d="M0 48L60 42C120 36 240 24 360 18C480 12 600 12 720 16C840 20 960 28 1080 32C1200 36 1320 36 1380 36L1440 36V48H0Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. STATISTICS SECTION — live from /api/v1/stats
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-50 py-16" aria-labelledby="stats-heading">
        <Section>
          <h2 id="stats-heading" className="sr-only">Platform statistics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statsLoading
              ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
              : STAT_CARDS.map(({ icon, value, label }) => (
                  <div
                    key={label}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
                      {icon}
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 tabular-nums">
                      {value}
                    </p>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                  </div>
                ))
            }
          </div>
        </Section>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. CATEGORIES SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20" aria-labelledby="categories-heading">
        <Section>
          <SectionHeader
            eyebrow="Browse by Category"
            title="What are you looking for?"
            subtitle="Explore fresh produce across categories, sourced directly from farms across India."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map(({ icon, label, value, bg, border, hover }) => (
              <Link
                key={label}
                to={`${ROUTES.CROPS}?category=${value}`}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${bg} ${border} ${hover} transition-all duration-200 hover:-translate-y-1 hover:shadow-md group cursor-pointer`}
                aria-label={`Browse ${label}`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                  {icon}
                </div>
                <p className="font-semibold text-gray-800 text-sm text-center">{label}</p>
              </Link>
            ))}
          </div>
        </Section>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. FEATURED CROPS SECTION — live from /api/v1/crops/featured
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-50 py-20" aria-labelledby="featured-heading">
        <Section>
          <SectionHeader
            eyebrow="Featured Listings"
            title="Fresh from the farm"
            subtitle="Recently added crops from verified farmers across India."
          />

          {/* Loading skeletons */}
          {featuredLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <FeaturedSkeleton key={i} />)}
            </div>
          )}

          {/* Error / empty — fall back gracefully */}
          {!featuredLoading && (featuredError || featuredCrops.length === 0) && (
            <div className="text-center py-12 text-gray-400">
              <FaBoxOpen className="text-5xl mx-auto mb-4 opacity-30" />
              <p className="text-sm">
                No listings yet.{" "}
                <Link to={ROUTES.CROPS} className="text-primary-600 underline">
                  Browse the marketplace
                </Link>
                {" "}to see all available crops.
              </p>
            </div>
          )}

          {/* Live crop cards */}
          {!featuredLoading && featuredCrops.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCrops.map((crop) => {
                  const imageUrl   = crop.images?.[0]?.url || PLACEHOLDER;
                  const catColour  = CATEGORY_COLOURS[crop.category] || CATEGORY_COLOURS.other;
                  const sellerName = crop.owner?.name || "Unknown Farmer";
                  const location   = [crop.location?.district, crop.location?.state]
                                       .filter(Boolean).join(", ");

                  return (
                    <Link
                      key={crop._id}
                      to={`/crops/${crop._id}`}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group flex flex-col"
                      aria-label={`View details for ${crop.cropName}`}
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden h-44 bg-gray-100 shrink-0">
                        <img
                          src={imageUrl}
                          alt={crop.cropName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                        />
                        {/* Category pill */}
                        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-gray-100 ${catColour}`}>
                          {capitalise(crop.category)}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-1">
                          {crop.cropName}
                        </h3>

                        {/* Price */}
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-primary-600 tabular-nums">
                            {formatCurrency(crop.price)}
                          </span>
                          <span className="text-sm text-gray-400">
                            / {crop.priceUnit || crop.unit}
                          </span>
                        </div>

                        {/* Farmer + location */}
                        <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <FaLeaf className="text-primary-400 shrink-0" />
                            <span className="truncate font-medium text-gray-700">{sellerName}</span>
                          </div>
                          {location && (
                            <div className="flex items-center gap-1.5">
                              <FaMapMarkerAlt className="text-gray-400 shrink-0" />
                              <span className="truncate">{location}</span>
                            </div>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="mt-auto pt-3">
                          <div className="w-full inline-flex items-center justify-center gap-2 bg-primary-50 text-primary-700 font-medium text-sm py-2.5 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-colors duration-200">
                            View Details
                            <FaArrowRight className="text-xs" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* View all */}
              <div className="flex justify-center mt-10">
                <Link
                  to={ROUTES.CROPS}
                  className="inline-flex items-center gap-2 btn-secondary px-8 py-3 text-base"
                >
                  Browse All Listings
                  <FaArrowRight className="text-sm" />
                </Link>
              </div>
            </>
          )}
        </Section>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          5. WHY AGRICONNECT SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20" aria-labelledby="why-heading">
        <Section>
          <SectionHeader
            eyebrow="Why AgriConnect"
            title="Built for India's farmers"
            subtitle="We designed every feature with the farmer's needs in mind. Here's what makes us different."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_FEATURES.map(({ icon, bg, title, desc }) => (
              <div
                key={title}
                className="flex flex-col gap-4 p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center`}>
                  {icon}
                </div>
                <h3 className="font-bold text-gray-900 text-base">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          6. CALL TO ACTION SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-gradient-to-r from-primary-800 to-primary-600 py-20"
        aria-labelledby="cta-heading"
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary-500 rounded-full opacity-30 blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-primary-900 rounded-full opacity-40 blur-2xl" />
        </div>

        <Section className="relative text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">

            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <MdOutlineStorefront className="text-3xl text-white" />
            </div>

            <h2
              id="cta-heading"
              className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
            >
              {isAuthenticated
                ? `Welcome back, ${user?.name?.split(" ")[0]}!`
                : "Ready to get started?"}
            </h2>

            <p className="text-primary-100 text-base max-w-lg leading-relaxed">
              {isAuthenticated
                ? "Head to your dashboard to manage your activity on AgriConnect."
                : "Create your free account today. Start listing crops, browsing the marketplace, or accepting deliveries — all in one platform."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to={ROLE_DASHBOARD[user?.role] || ROUTES.HOME}
                  className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg text-base"
                >
                  <MdDashboard className="text-lg" />
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to={ROUTES.REGISTER}
                    className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg text-base"
                  >
                    Create Free Account
                    <FaArrowRight className="text-sm" />
                  </Link>
                  <Link
                    to={ROUTES.LOGIN}
                    className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-base"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {!isAuthenticated && (
              <p className="text-primary-200 text-xs mt-2">
                Free forever for farmers. No credit card required.
              </p>
            )}
          </div>
        </Section>
      </section>

    </div>
  );
};

export default HomePage;
