import { Link } from "react-router-dom";
import {
  FaSeedling,
  FaShoppingBasket,
  FaTruck,
  FaShieldAlt,
  FaStar,
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
import { ROUTES, ROLE_DASHBOARD } from "../../utils/constants";

// ─────────────────────────────────────────────────────────────────────────────
// Static data — replaced with API responses in later phases
// ─────────────────────────────────────────────────────────────────────────────

const STATS = [
  { icon: <FaUsers className="text-3xl" />,      value: "12,000+", label: "Farmers" },
  { icon: <FaShoppingBasket className="text-3xl" />, value: "45,000+", label: "Buyers" },
  { icon: <FaTruck className="text-3xl" />,       value: "8,500+",  label: "Deliveries" },
  { icon: <FaGlobeAsia className="text-3xl" />,   value: "22",      label: "States" },
];

const CATEGORIES = [
  {
    icon:  <GiWheat className="text-4xl text-amber-500" />,
    label: "Grains",
    bg:    "bg-amber-50",
    border:"border-amber-100",
    hover: "hover:bg-amber-100",
    count: "340+ listings",
  },
  {
    icon:  <GiCarrot className="text-4xl text-orange-500" />,
    label: "Vegetables",
    bg:    "bg-orange-50",
    border:"border-orange-100",
    hover: "hover:bg-orange-100",
    count: "520+ listings",
  },
  {
    icon:  <GiGrapes className="text-4xl text-purple-500" />,
    label: "Fruits",
    bg:    "bg-purple-50",
    border:"border-purple-100",
    hover: "hover:bg-purple-100",
    count: "280+ listings",
  },
  {
    icon:  <MdOutlineLocalFlorist className="text-4xl text-pink-500" />,
    label: "Flowers",
    bg:    "bg-pink-50",
    border:"border-pink-100",
    hover: "hover:bg-pink-100",
    count: "95+ listings",
  },
  {
    icon:  <GiMilkCarton className="text-4xl text-blue-500" />,
    label: "Dairy",
    bg:    "bg-blue-50",
    border:"border-blue-100",
    hover: "hover:bg-blue-100",
    count: "160+ listings",
  },
];

const FEATURED_CROPS = [
  {
    id:       1,
    name:     "Basmati Rice",
    category: "Grains",
    price:    45,
    unit:     "kg",
    farmer:   "Harpreet Singh",
    location: "Amritsar, Punjab",
    image:    "https://placehold.co/400x260/f0fdf4/16a34a?text=Basmati+Rice",
    rating:   4.8,
    badge:    "Organic",
  },
  {
    id:       2,
    name:     "Fresh Tomatoes",
    category: "Vegetables",
    price:    22,
    unit:     "kg",
    farmer:   "Ravi Kumar",
    location: "Nashik, Maharashtra",
    image:    "https://placehold.co/400x260/fff7ed/ea580c?text=Fresh+Tomatoes",
    rating:   4.6,
    badge:    "Farm Fresh",
  },
  {
    id:       3,
    name:     "Alphonso Mango",
    category: "Fruits",
    price:    180,
    unit:     "dozen",
    farmer:   "Suresh Patil",
    location: "Ratnagiri, Maharashtra",
    image:    "https://placehold.co/400x260/fefce8/ca8a04?text=Alphonso+Mango",
    rating:   4.9,
    badge:    "Premium",
  },
  {
    id:       4,
    name:     "Yellow Mustard",
    category: "Oilseeds",
    price:    55,
    unit:     "kg",
    farmer:   "Mohan Lal",
    location: "Bharatpur, Rajasthan",
    image:    "https://placehold.co/400x260/fefce8/854d0e?text=Yellow+Mustard",
    rating:   4.5,
    badge:    null,
  },
  {
    id:       5,
    name:     "Red Onion",
    category: "Vegetables",
    price:    18,
    unit:     "kg",
    farmer:   "Anita Desai",
    location: "Lasalgaon, Maharashtra",
    image:    "https://placehold.co/400x260/fdf2f8/9d174d?text=Red+Onion",
    rating:   4.7,
    badge:    "Best Value",
  },
  {
    id:       6,
    name:     "Turmeric",
    category: "Spices",
    price:    120,
    unit:     "kg",
    farmer:   "Lakshmi Reddy",
    location: "Nizamabad, Telangana",
    image:    "https://placehold.co/400x260/fffbeb/92400e?text=Turmeric",
    rating:   4.8,
    badge:    "Organic",
  },
];

const WHY_FEATURES = [
  {
    icon:  <HiOutlineCurrencyRupee className="text-3xl text-primary-600" />,
    bg:    "bg-primary-50",
    title: "Fair Pricing",
    desc:  "Farmers set their own prices. No commission. No hidden fees. Buyers always get market-competitive rates directly from the source.",
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

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components — each section is a small focused component
// ─────────────────────────────────────────────────────────────────────────────

/** Reusable section container with max-width and consistent padding */
const Section = ({ children, className = "" }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

/** Reusable section heading block */
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

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-col">

      {/* ══════════════════════════════════════════════════════════════
          1. HERO SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500"
        aria-labelledby="hero-heading"
      >
        {/* Decorative background blobs */}
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
              India's #1 Crop Marketplace
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
            >
              Farm Fresh Crops,{" "}
              <span className="text-primary-200">
                Direct to You
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-primary-100 max-w-2xl leading-relaxed">
              Connecting farmers, buyers, and transporters across India.
              No middlemen. Fair prices. Fresh produce delivered to your door.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <Link
                to={ROUTES.CROPS}
                className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl text-base"
              >
                <FaShoppingBasket className="text-base" />
                Explore Marketplace
              </Link>

              {isAuthenticated && user?.role === "farmer" ? (
                <Link
                  to={ROUTES.CROP_CREATE}
                  className="inline-flex items-center gap-2 bg-primary-800 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-primary-900 transition-colors border border-white/20 text-base"
                >
                  <FaSeedling className="text-base" />
                  List Your Crops
                </Link>
              ) : (
                <Link
                  to={ROUTES.REGISTER}
                  className="inline-flex items-center gap-2 bg-primary-800 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-primary-900 transition-colors border border-white/20 text-base"
                >
                  <FaSeedling className="text-base" />
                  Sell Your Crops
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
          2. STATISTICS SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-50 py-16" aria-labelledby="stats-heading">
        <Section>
          <h2 id="stats-heading" className="sr-only">Platform statistics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ icon, value, label }) => (
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
            ))}
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
            {CATEGORIES.map(({ icon, label, bg, border, hover, count }) => (
              <Link
                key={label}
                to={ROUTES.CROPS}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${bg} ${border} ${hover} transition-all duration-200 hover:-translate-y-1 hover:shadow-md group cursor-pointer`}
                aria-label={`Browse ${label}`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                  {icon}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800 text-sm">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{count}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. FEATURED CROPS SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-50 py-20" aria-labelledby="featured-heading">
        <Section>
          <SectionHeader
            eyebrow="Featured Listings"
            title="Fresh from the farm"
            subtitle="Hand-picked listings from verified farmers. All produce is quality-checked before listing."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_CROPS.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-250 group"
              >
                {/* Crop image */}
                <div className="relative overflow-hidden h-44 bg-gray-100">
                  <img
                    src={crop.image}
                    alt={crop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Category pill */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-100">
                    {crop.category}
                  </span>
                  {/* Badge */}
                  {crop.badge && (
                    <span className="absolute top-3 right-3 bg-primary-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {crop.badge}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col gap-3">

                  {/* Name + rating */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-base leading-snug">
                      {crop.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <FaStar className="text-amber-400 text-xs" />
                      <span className="text-xs font-medium text-gray-600">
                        {crop.rating}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary-600">
                      ₹{crop.price}
                    </span>
                    <span className="text-sm text-gray-400">/ {crop.unit}</span>
                  </div>

                  {/* Farmer + location */}
                  <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <FaLeaf className="text-primary-400 shrink-0" />
                      <span className="truncate">{crop.farmer}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-gray-400 shrink-0" />
                      <span className="truncate">{crop.location}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    to={ROUTES.CROPS}
                    className="mt-1 w-full inline-flex items-center justify-center gap-2 bg-primary-50 text-primary-700 font-medium text-sm py-2.5 rounded-xl hover:bg-primary-600 hover:text-white transition-colors duration-200 group/btn"
                    aria-label={`View details for ${crop.name}`}
                  >
                    View Details
                    <FaArrowRight className="text-xs group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* View all button */}
          <div className="flex justify-center mt-10">
            <Link
              to={ROUTES.CROPS}
              className="inline-flex items-center gap-2 btn-secondary px-8 py-3 text-base"
            >
              Browse All Listings
              <FaArrowRight className="text-sm" />
            </Link>
          </div>
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
              Ready to join 12,000+ farmers?
            </h2>

            <p className="text-primary-100 text-base max-w-lg leading-relaxed">
              Create your free account today. Start listing crops, browsing the
              marketplace, or accepting deliveries — all in one platform.
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

            {/* Fine print */}
            <p className="text-primary-200 text-xs mt-2">
              Free forever for farmers. No credit card required.
            </p>
          </div>
        </Section>
      </section>

    </div>
  );
};

export default HomePage;
