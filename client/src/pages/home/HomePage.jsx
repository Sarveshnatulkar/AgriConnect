import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaSeedling, FaShoppingBasket, FaTruck, FaShieldAlt,
  FaMapMarkerAlt, FaLeaf, FaArrowRight, FaUsers,
  FaBoxOpen, FaGlobeAsia, FaCheckCircle,
} from "react-icons/fa";
import {
  MdOutlineAgriculture, MdOutlineStorefront, MdDashboard,
  MdVerified, MdSupportAgent,
} from "react-icons/md";
import {
  GiWheat, GiCarrot, GiGrapes, GiFruitBowl,
  GiCorn, GiBeanstalk,
} from "react-icons/gi";
import {
  HiOutlineBadgeCheck, HiOutlineCurrencyRupee,
  HiOutlineTrendingUp, HiOutlineLightningBolt,
} from "react-icons/hi";
import useAuth from "../../hooks/useAuth";
import { fetchFeaturedCrops, fetchPlatformStats } from "../../services/cropService";
import { ROUTES, ROLE_DASHBOARD } from "../../utils/constants";
import { capitalise, formatCurrency } from "../../utils/helpers";

// ─── Category browse tiles ────────────────────────────────────────────────────
const CATEGORIES = [
  {
    icon:    <GiWheat className="text-4xl" />,
    label:   "Grains",
    value:   "grains",
    colour:  "text-amber-500",
    bg:      "bg-gradient-to-br from-amber-50 to-yellow-50",
    border:  "border-amber-200",
    ring:    "hover:ring-2 hover:ring-amber-300",
    iconBg:  "bg-amber-100",
  },
  {
    icon:    <GiCarrot className="text-4xl" />,
    label:   "Vegetables",
    value:   "vegetables",
    colour:  "text-orange-500",
    bg:      "bg-gradient-to-br from-orange-50 to-red-50",
    border:  "border-orange-200",
    ring:    "hover:ring-2 hover:ring-orange-300",
    iconBg:  "bg-orange-100",
  },
  {
    icon:    <GiGrapes className="text-4xl" />,
    label:   "Fruits",
    value:   "fruits",
    colour:  "text-purple-500",
    bg:      "bg-gradient-to-br from-purple-50 to-pink-50",
    border:  "border-purple-200",
    ring:    "hover:ring-2 hover:ring-purple-300",
    iconBg:  "bg-purple-100",
  },
  {
    icon:    <GiBeanstalk className="text-4xl" />,
    label:   "Pulses",
    value:   "pulses",
    colour:  "text-green-600",
    bg:      "bg-gradient-to-br from-green-50 to-emerald-50",
    border:  "border-green-200",
    ring:    "hover:ring-2 hover:ring-green-300",
    iconBg:  "bg-green-100",
  },
  {
    icon:    <GiCorn className="text-4xl" />,
    label:   "Oilseeds",
    value:   "oilseeds",
    colour:  "text-yellow-600",
    bg:      "bg-gradient-to-br from-yellow-50 to-lime-50",
    border:  "border-yellow-200",
    ring:    "hover:ring-2 hover:ring-yellow-300",
    iconBg:  "bg-yellow-100",
  },
  {
    icon:    <GiFruitBowl className="text-4xl" />,
    label:   "Others",
    value:   "other",
    colour:  "text-teal-500",
    bg:      "bg-gradient-to-br from-teal-50 to-cyan-50",
    border:  "border-teal-200",
    ring:    "hover:ring-2 hover:ring-teal-300",
    iconBg:  "bg-teal-100",
  },
];

// ─── Why AgriConnect features ─────────────────────────────────────────────────
const WHY_FEATURES = [
  {
    icon:  <HiOutlineCurrencyRupee className="text-2xl" />,
    iconBg: "bg-primary-600",
    badge: "No Hidden Fees",
    title: "Fair Pricing",
    desc:  "Farmers set their own prices. Zero commission, zero middlemen. Buyers get market-competitive rates straight from the source.",
  },
  {
    icon:  <MdVerified className="text-2xl" />,
    iconBg: "bg-blue-600",
    badge: "ID Verified",
    title: "Verified Farmers",
    desc:  "Every farmer on the platform is identity-verified. Browse with confidence knowing you're buying from a trusted, real source.",
  },
  {
    icon:  <HiOutlineLightningBolt className="text-2xl" />,
    iconBg: "bg-amber-500",
    badge: "Nationwide",
    title: "Fast Delivery",
    desc:  "Our transporter network ensures crops reach buyers farm-fresh. Real-time tracking on every active delivery.",
  },
  {
    icon:  <FaShieldAlt className="text-xl" />,
    iconBg: "bg-purple-600",
    badge: "100% Secure",
    title: "Secure Transactions",
    desc:  "End-to-end encrypted payments and built-in dispute resolution. Your money is protected at every step.",
  },
  {
    icon:  <HiOutlineTrendingUp className="text-2xl" />,
    iconBg: "bg-green-600",
    badge: "Live Data",
    title: "Market Insights",
    desc:  "Browse live pricing across categories and states so you always know what the market is paying for your produce.",
  },
  {
    icon:  <MdSupportAgent className="text-2xl" />,
    iconBg: "bg-rose-500",
    badge: "Always On",
    title: "Dedicated Support",
    desc:  "Our team is available to help farmers and buyers resolve any issues quickly — from listing problems to delivery disputes.",
  },
];

// ─── Category colour pills ─────────────────────────────────────────────────────
const CATEGORY_PILL = {
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

const PLACEHOLDER = "https://placehold.co/400x260/f0fdf4/16a34a?text=No+Image";

// ─── Layout helpers ───────────────────────────────────────────────────────────
const Section = ({ children, className = "" }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ eyebrow, title, subtitle }) => (
  <div className="text-center mb-14">
    {eyebrow && (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 border border-primary-100 px-3.5 py-1.5 rounded-full mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
        {eyebrow}
      </span>
    )}
    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-4 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
);

// ── Skeletons ─────────────────────────────────────────────────────────────────
const StatSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-3 animate-pulse">
    <div className="w-14 h-14 rounded-2xl bg-gray-200" />
    <div className="h-8 w-20 bg-gray-200 rounded" />
    <div className="h-4 w-16 bg-gray-100 rounded" />
  </div>
);

const FeaturedSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-52 bg-gray-200" />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-7 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-10 bg-gray-100 rounded-xl mt-2" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// HomePage
// ─────────────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  const [stats,           setStats]          = useState(null);
  const [statsLoading,    setStatsLoading]   = useState(true);
  const [featuredCrops,   setFeaturedCrops]  = useState([]);
  const [featuredLoading, setFeaturedLoading]= useState(true);
  const [featuredEmpty,   setFeaturedEmpty]  = useState(false);

  useEffect(() => {
    Promise.all([
      fetchPlatformStats().catch(() => null),
      fetchFeaturedCrops().catch(() => null),
    ]).then(([statsRes, featuredRes]) => {
      if (statsRes?.data) setStats(statsRes.data);
      setStatsLoading(false);
      if (featuredRes?.data?.crops?.length) {
        setFeaturedCrops(featuredRes.data.crops);
      } else {
        setFeaturedEmpty(true);
      }
      setFeaturedLoading(false);
    });
  }, []);

  const STAT_CARDS = [
    {
      icon:    <FaUsers className="text-2xl" />,
      value:   stats ? `${stats.farmers.toLocaleString()}+` : "—",
      label:   "Registered Farmers",
      iconBg:  "bg-primary-600",
    },
    {
      icon:    <FaShoppingBasket className="text-2xl" />,
      value:   stats ? `${stats.buyers.toLocaleString()}+` : "—",
      label:   "Active Buyers",
      iconBg:  "bg-blue-600",
    },
    {
      icon:    <FaBoxOpen className="text-2xl" />,
      value:   stats ? `${stats.listings.toLocaleString()}+` : "—",
      label:   "Live Listings",
      iconBg:  "bg-green-600",
    },
    {
      icon:    <FaGlobeAsia className="text-2xl" />,
      value:   stats ? String(stats.states) : "—",
      label:   "States Covered",
      iconBg:  "bg-purple-600",
    },
  ];

  // Role-aware hero secondary CTA:
  // Guests → "Sell Your Crops" (→ /register)
  // Farmers → "List Your Crops" (→ /crops/new)
  // Buyers / Transporters / Admins → hidden
  const showSecondaryCTA = !isAuthenticated || user?.role === "farmer";

  return (
    <div className="flex flex-col">

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #14532d 0%, #166534 30%, #15803d 60%, #16a34a 100%)",
        }}
        aria-labelledby="hero-heading"
      >
        {/* Layered background texture */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Large radial glow top-right */}
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20"
               style={{ background: "radial-gradient(circle, #4ade80 0%, transparent 70%)" }} />
          {/* Bottom-left bleed */}
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-15"
               style={{ background: "radial-gradient(circle, #86efac 0%, transparent 70%)" }} />
          {/* Dot grid overlay */}
          <div className="absolute inset-0 opacity-5"
               style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          {/* Diagonal shine strip */}
          <div className="absolute inset-0 opacity-5"
               style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)" }} />
        </div>

        <Section className="relative py-28 sm:py-36 lg:py-40">
          <div className="flex flex-col items-center text-center gap-7 max-w-4xl mx-auto">

            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/25 text-white/90 text-sm font-semibold px-5 py-2 rounded-full shadow-inner">
              <MdOutlineAgriculture className="text-lg text-green-300" />
              India's Direct Farm-to-Market Platform
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] tracking-tight"
            >
              Connect Farms.{" "}
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text"
                    style={{ backgroundImage: "linear-gradient(90deg, #86efac, #4ade80, #bbf7d0)" }}>
                Feed India.
              </span>
            </h1>

            {/* Sub-heading */}
            <p className="text-lg sm:text-xl text-green-100/90 max-w-2xl leading-relaxed font-light">
              Buy and sell farm-fresh crops directly — no agents, no markups.
              Farmers get better prices. Buyers get fresher produce.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-1">
              <Link
                to={ROUTES.CROPS}
                className="inline-flex items-center gap-2.5 bg-white text-green-800 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-green-50 active:scale-95 transition-all duration-150 text-base"
              >
                <FaShoppingBasket className="text-base" />
                Explore Marketplace
              </Link>

              {showSecondaryCTA && (
                <Link
                  to={isAuthenticated ? ROUTES.CROP_CREATE : ROUTES.REGISTER}
                  className="inline-flex items-center gap-2.5 bg-green-500/20 hover:bg-green-500/30 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-xl border border-white/30 hover:border-white/50 active:scale-95 transition-all duration-150 text-base"
                >
                  <FaSeedling className="text-base" />
                  {isAuthenticated ? "List Your Crops" : "Sell Your Crops"}
                </Link>
              )}
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-3 text-green-200 text-sm font-medium">
              {[
                { icon: <HiOutlineBadgeCheck />, text: "Verified Farmers" },
                { icon: <FaShieldAlt />, text: "Secure Payments" },
                { icon: <FaTruck />, text: "Fast Delivery" },
                { icon: <FaCheckCircle />, text: "No Middlemen" },
              ].map(({ icon, text }) => (
                <span key={text} className="flex items-center gap-1.5">
                  <span className="text-green-400">{icon}</span>
                  {text}
                </span>
              ))}
            </div>
          </div>
        </Section>

        {/* Curved wave separator */}
        <div className="relative h-16 overflow-hidden" aria-hidden="true">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg"
               className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0 64L80 56C160 48 320 32 480 24C640 16 800 16 960 22C1120 28 1280 40 1360 46L1440 52V64H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          STATISTICS — live from /api/v1/stats
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-50 py-16" aria-label="Platform statistics">
        <Section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {statsLoading
              ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
              : STAT_CARDS.map(({ icon, value, label, iconBg }) => (
                  <div
                    key={label}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6
                               flex flex-col items-center gap-3 text-center
                               hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
                  >
                    <div className={`w-13 h-13 rounded-xl ${iconBg} flex items-center justify-center text-white shadow-sm w-12 h-12`}>
                      {icon}
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 tabular-nums tracking-tight">
                      {value}
                    </p>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                  </div>
                ))
            }
          </div>
        </Section>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-24" aria-labelledby="categories-heading">
        <Section>
          <SectionHeader
            eyebrow="Shop by Category"
            title="What are you looking for?"
            subtitle="From staple grains to seasonal fruits — explore produce sourced directly from farmers across India."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(({ icon, label, value, colour, bg, border, ring, iconBg }) => (
              <Link
                key={label}
                to={`${ROUTES.CROPS}?category=${value}`}
                className={`flex flex-col items-center gap-3.5 p-5 rounded-2xl border ${bg} ${border} ${ring}
                            transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg group cursor-pointer`}
                aria-label={`Browse ${label}`}
              >
                <div className={`w-16 h-16 rounded-2xl ${iconBg} ${colour} flex items-center justify-center
                                 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-200`}>
                  {icon}
                </div>
                <p className="font-bold text-gray-800 text-sm text-center leading-tight">{label}</p>
              </Link>
            ))}
          </div>
        </Section>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURED CROPS — live from /api/v1/crops/featured
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-50 py-20 sm:py-24" aria-labelledby="featured-heading">
        <Section>
          <SectionHeader
            eyebrow="Fresh Listings"
            title="Just in from the farm"
            subtitle="The latest crop listings from verified farmers, updated in real time."
          />

          {featuredLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <FeaturedSkeleton key={i} />)}
            </div>
          )}

          {!featuredLoading && featuredEmpty && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <FaBoxOpen className="text-4xl text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm">
                No listings yet.{" "}
                <Link to={ROUTES.CROPS} className="text-primary-600 font-semibold underline underline-offset-2">
                  Visit the marketplace
                </Link>
                {" "}to see all available crops.
              </p>
            </div>
          )}

          {!featuredLoading && featuredCrops.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCrops.map((crop) => {
                  const imageUrl   = crop.images?.[0]?.url || PLACEHOLDER;
                  const catColour  = CATEGORY_PILL[crop.category] || CATEGORY_PILL.other;
                  const sellerName = crop.owner?.name || "Unknown Farmer";
                  const location   = [crop.location?.district, crop.location?.state]
                                       .filter(Boolean).join(", ");
                  return (
                    <Link
                      key={crop._id}
                      to={`/crops/${crop._id}`}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
                                 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200
                                 group flex flex-col"
                      aria-label={`View details for ${crop.cropName}`}
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden h-52 bg-gray-100 shrink-0">
                        <img
                          src={imageUrl}
                          alt={crop.cropName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                        />
                        {/* Gradient overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full
                                          bg-white/95 backdrop-blur-sm border border-white/50 shadow-sm ${catColour}`}>
                          {capitalise(crop.category)}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex flex-col gap-2.5 flex-1">
                        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1">
                          {crop.cropName}
                        </h3>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-extrabold text-primary-600 tabular-nums">
                            {formatCurrency(crop.price)}
                          </span>
                          <span className="text-sm text-gray-400 font-normal">
                            / {crop.priceUnit || crop.unit}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs text-gray-500 mt-0.5">
                          <div className="flex items-center gap-1.5">
                            <FaLeaf className="text-primary-400 shrink-0" />
                            <span className="font-semibold text-gray-700 truncate">{sellerName}</span>
                          </div>
                          {location && (
                            <div className="flex items-center gap-1.5">
                              <FaMapMarkerAlt className="text-gray-400 shrink-0" />
                              <span className="truncate">{location}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-auto pt-3">
                          <div className="w-full inline-flex items-center justify-center gap-2
                                          bg-primary-50 text-primary-700 font-semibold text-sm py-2.5 rounded-xl
                                          group-hover:bg-primary-600 group-hover:text-white
                                          transition-colors duration-200">
                            View Details
                            <FaArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="flex justify-center mt-12">
                <Link
                  to={ROUTES.CROPS}
                  className="inline-flex items-center gap-2 btn-secondary px-10 py-3.5 text-base font-semibold rounded-xl shadow-sm hover:shadow-md transition-all"
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
          WHY AGRICONNECT
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-24" aria-labelledby="why-heading">
        <Section>
          <SectionHeader
            eyebrow="Why AgriConnect"
            title="Built differently, for India's farmers"
            subtitle="Every feature is designed around what farmers and buyers actually need — not what looks good on a slide deck."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_FEATURES.map(({ icon, iconBg, badge, title, desc }) => (
              <div
                key={title}
                className="group relative flex flex-col gap-4 p-6 rounded-2xl border border-gray-100 bg-white
                           hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              >
                {/* Subtle bg glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-primary-50/0
                                group-hover:from-primary-50/60 group-hover:to-transparent
                                transition-all duration-300 pointer-events-none rounded-2xl" />

                <div className="relative flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-white shadow-sm shrink-0`}>
                    {icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      {badge}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base mt-1.5">{title}</h3>
                  </div>
                </div>

                <p className="relative text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CALL TO ACTION
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-24 sm:py-32"
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #059669 100%)",
        }}
        aria-labelledby="cta-heading"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
               style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 65%)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
               style={{ background: "radial-gradient(circle, #34d399 0%, transparent 65%)" }} />
          <div className="absolute inset-0 opacity-[0.04]"
               style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        </div>

        <Section className="relative text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-7">

            <div className="w-18 h-18 rounded-2xl bg-white/10 border border-white/20
                            flex items-center justify-center backdrop-blur-sm w-16 h-16">
              <MdOutlineStorefront className="text-3xl text-emerald-300" />
            </div>

            <div>
              <h2
                id="cta-heading"
                className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight"
              >
                {isAuthenticated
                  ? `Welcome back, ${user?.name?.split(" ")[0]}!`
                  : "The smarter way to sell crops."}
              </h2>
              <p className="mt-4 text-emerald-100/80 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                {isAuthenticated
                  ? "Head to your dashboard to manage listings, orders, and deliveries."
                  : "Join thousands of farmers already selling direct. No commission. No hassle. Just fair prices."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to={ROLE_DASHBOARD[user?.role] || ROUTES.HOME}
                  className="inline-flex items-center gap-2.5 bg-white text-emerald-800 font-bold px-10 py-4 rounded-xl hover:bg-emerald-50 active:scale-95 transition-all duration-150 shadow-lg text-base"
                >
                  <MdDashboard className="text-lg" />
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to={ROUTES.REGISTER}
                    className="inline-flex items-center gap-2.5 bg-white text-emerald-800 font-bold px-10 py-4 rounded-xl hover:bg-emerald-50 active:scale-95 transition-all duration-150 shadow-lg text-base"
                  >
                    Get Started Free
                    <FaArrowRight className="text-sm" />
                  </Link>
                  <Link
                    to={ROUTES.LOGIN}
                    className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 active:scale-95 transition-all duration-150 text-base backdrop-blur-sm"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {!isAuthenticated && (
              <div className="flex flex-wrap items-center justify-center gap-5 text-emerald-300/80 text-xs font-semibold mt-1">
                {["Free to join", "No credit card", "Cancel anytime"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <FaCheckCircle className="text-emerald-400" />
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Section>
      </section>

    </div>
  );
};

export default HomePage;
