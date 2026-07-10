/**
 * Seed Script — AgriConnect Demo Data
 *
 * Populates the database with:
 *  - 4 demo farmer accounts
 *  - 5 Fruits, 5 Vegetables, 5 Grains, 5 Pulses = 20 crop listings
 *
 * Usage:
 *   node scripts/seed.js          — seed demo data
 *   node scripts/seed.js --clear  — wipe all crops and demo farmers, then re-seed
 *
 * IMPORTANT: Never run with --clear in production.
 * Demo farmer emails are prefixed with "demo_" to avoid collisions.
 */

const dotenv = require("dotenv");
const path   = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = require("../models/User");
const Crop     = require("../models/Crop");

// ─── Demo Farmers ─────────────────────────────────────────────────────────────
const DEMO_FARMERS = [
  {
    name:  "Harpreet Singh",
    email: "demo_harpreet@agriconnect.dev",
    password: "Demo@1234",
    role:  "farmer",
    phone: "+91-9876543210",
    address: { state: "Punjab", city: "Amritsar" },
  },
  {
    name:  "Ravi Kumar",
    email: "demo_ravi@agriconnect.dev",
    password: "Demo@1234",
    role:  "farmer",
    phone: "+91-9823456789",
    address: { state: "Maharashtra", city: "Nashik" },
  },
  {
    name:  "Sunita Devi",
    email: "demo_sunita@agriconnect.dev",
    password: "Demo@1234",
    role:  "farmer",
    phone: "+91-9712345678",
    address: { state: "Bihar", city: "Patna" },
  },
  {
    name:  "Mohan Lal",
    email: "demo_mohan@agriconnect.dev",
    password: "Demo@1234",
    role:  "farmer",
    phone: "+91-9654321098",
    address: { state: "Rajasthan", city: "Bharatpur" },
  },
];

// ─── Crop seed factory ────────────────────────────────────────────────────────
// Returns an array of crop objects given an array of farmer ObjectIds.
const buildCrops = (farmers) => {
  const [harpreet, ravi, sunita, mohan] = farmers;

  return [
    // ── FRUITS (5) ──────────────────────────────────────────────────────────
    {
      cropName:    "Alphonso Mango",
      category:    "fruits",
      description: "Premium Alphonso mangoes, known for their rich aroma, golden colour, and exceptional sweetness. Hand-picked from century-old orchards. Ideal for gifting, juicing, and desserts.",
      quantity:    200,
      unit:        "dozen",
      price:       180,
      harvestDate: new Date("2026-04-20"),
      images: [
        { url: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80", publicId: null },
      ],
      location: { state: "Maharashtra", district: "Ratnagiri", village: "Devgad" },
      isAvailable: true,
      owner: ravi,
    },
    {
      cropName:    "Shimla Apple",
      category:    "fruits",
      description: "Crisp, naturally sweet apples from the high-altitude orchards of Himachal Pradesh. No artificial ripening. Rich in fibre and antioxidants. Packed and dispatched within 24 hours of harvest.",
      quantity:    500,
      unit:        "kg",
      price:       120,
      harvestDate: new Date("2026-06-15"),
      images: [
        { url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80", publicId: null },
      ],
      location: { state: "Himachal Pradesh", district: "Shimla", village: "Theog" },
      isAvailable: true,
      owner: harpreet,
    },
    {
      cropName:    "Kesar Mango",
      category:    "fruits",
      description: "GI-tagged Kesar mangoes from Gujarat — saffron-hued flesh, low fibre, and intensely sweet. Grown organically without chemical fertilisers. Perfect for aamras and mango milkshake.",
      quantity:    150,
      unit:        "dozen",
      price:       160,
      harvestDate: new Date("2026-05-10"),
      images: [
        { url: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=600&q=80", publicId: null },
      ],
      location: { state: "Gujarat", district: "Junagadh", village: "Talala" },
      isAvailable: true,
      owner: mohan,
    },
    {
      cropName:    "Nagpur Orange",
      category:    "fruits",
      description: "Juicy mandarin oranges from the orange city of India. GI-certified produce with high vitamin C content. Thin-skinned and easy to peel. Harvested December–February for peak sweetness.",
      quantity:    800,
      unit:        "kg",
      price:       55,
      harvestDate: new Date("2026-01-10"),
      images: [
        { url: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600&q=80", publicId: null },
      ],
      location: { state: "Maharashtra", district: "Nagpur", village: "Katol" },
      isAvailable: true,
      owner: ravi,
    },
    {
      cropName:    "Muzaffarpur Litchi",
      category:    "fruits",
      description: "Famous Shahi Litchi variety from Muzaffarpur — GI-tagged, aromatic, and exceptionally juicy. Available only for a brief 3-week season. Order early to secure your batch.",
      quantity:    300,
      unit:        "kg",
      price:       95,
      harvestDate: new Date("2026-06-05"),
      images: [
        { url: "https://images.unsplash.com/photo-1621238585553-2d8f282e7793?w=600&q=80", publicId: null },
      ],
      location: { state: "Bihar", district: "Muzaffarpur", village: "Motipur" },
      isAvailable: true,
      owner: sunita,
    },

    // ── VEGETABLES (5) ──────────────────────────────────────────────────────
    {
      cropName:    "Fresh Tomato",
      category:    "vegetables",
      description: "Firm, vine-ripened tomatoes with a perfect balance of sweetness and acidity. Grown under drip irrigation with no pesticides. Ideal for curries, sauces, and fresh salads.",
      quantity:    1000,
      unit:        "kg",
      price:       22,
      harvestDate: new Date("2026-07-01"),
      images: [
        { url: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80", publicId: null },
      ],
      location: { state: "Maharashtra", district: "Nashik", village: "Dindori" },
      isAvailable: true,
      owner: ravi,
    },
    {
      cropName:    "Green Capsicum",
      category:    "vegetables",
      description: "Fresh, firm capsicums grown in protected polyhouse conditions to ensure year-round availability. Crispy texture, mild flavour. Great for stir-fries, grilling, and salads.",
      quantity:    400,
      unit:        "kg",
      price:       35,
      harvestDate: new Date("2026-07-05"),
      images: [
        { url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80", publicId: null },
      ],
      location: { state: "Karnataka", district: "Kolar", village: "Malur" },
      isAvailable: true,
      owner: sunita,
    },
    {
      cropName:    "Red Onion",
      category:    "vegetables",
      description: "Spicy, pungent red onions from Lasalgaon — Asia's largest onion trading hub. Dried to reduce moisture for longer shelf life. Essential ingredient in Indian cooking.",
      quantity:    2000,
      unit:        "kg",
      price:       18,
      harvestDate: new Date("2026-03-20"),
      images: [
        { url: "https://images.unsplash.com/photo-1508747703725-719777637510?w=600&q=80", publicId: null },
      ],
      location: { state: "Maharashtra", district: "Nashik", village: "Lasalgaon" },
      isAvailable: true,
      owner: ravi,
    },
    {
      cropName:    "Baby Potato",
      category:    "vegetables",
      description: "Small, creamy baby potatoes with thin skins — no peeling needed. Grown in the fertile soils of Agra belt. Perfect for roasting, curries, and chaat.",
      quantity:    600,
      unit:        "kg",
      price:       28,
      harvestDate: new Date("2026-02-15"),
      images: [
        { url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80", publicId: null },
      ],
      location: { state: "Uttar Pradesh", district: "Agra", village: "Fatehabad" },
      isAvailable: true,
      owner: mohan,
    },
    {
      cropName:    "Bhindi (Okra)",
      category:    "vegetables",
      description: "Tender young okra pods harvested at peak length of 6–8 cm for best texture. Cultivated without synthetic pesticides. High in fibre, folate, and vitamins C and K.",
      quantity:    300,
      unit:        "kg",
      price:       30,
      harvestDate: new Date("2026-07-10"),
      images: [
        { url: "https://images.unsplash.com/photo-1628688720714-d2c6e0a6b223?w=600&q=80", publicId: null },
      ],
      location: { state: "Bihar", district: "Vaishali", village: "Hajipur" },
      isAvailable: true,
      owner: sunita,
    },

    // ── GRAINS (5) ──────────────────────────────────────────────────────────
    {
      cropName:    "Basmati Rice",
      category:    "grains",
      description: "Long-grain, aromatic Basmati rice grown in the foothills of the Himalayas. Aged for 12 months for perfect non-sticky texture. GI-tagged origin, no artificial fragrance added.",
      quantity:    500,
      unit:        "quintal",
      price:       4500,
      harvestDate: new Date("2025-11-10"),
      images: [
        { url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80", publicId: null },
      ],
      location: { state: "Punjab", district: "Amritsar", village: "Tarn Taran" },
      isAvailable: true,
      owner: harpreet,
    },
    {
      cropName:    "Wheat (Sharbati)",
      category:    "grains",
      description: "Premium Sharbati wheat from Sehore, Madhya Pradesh — known as the 'Golden Grain' for its high protein content, golden colour, and natural sweetness. Makes excellent chapati and bread.",
      quantity:    800,
      unit:        "quintal",
      price:       2200,
      harvestDate: new Date("2026-04-05"),
      images: [
        { url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80", publicId: null },
      ],
      location: { state: "Madhya Pradesh", district: "Sehore", village: "Ichhawar" },
      isAvailable: true,
      owner: mohan,
    },
    {
      cropName:    "Maize (Yellow Corn)",
      category:    "grains",
      description: "Hybrid yellow maize with high starch content. Suitable for flour milling, animal feed, and ethanol production. Moisture level maintained below 14% for safe storage.",
      quantity:    300,
      unit:        "quintal",
      price:       1800,
      harvestDate: new Date("2026-02-28"),
      images: [
        { url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80", publicId: null },
      ],
      location: { state: "Bihar", district: "Kaimur", village: "Bhabua" },
      isAvailable: true,
      owner: sunita,
    },
    {
      cropName:    "Jowar (Sorghum)",
      category:    "grains",
      description: "White Jowar grain — gluten-free, high in iron and fibre. Grown on rain-fed land without irrigation. Increasingly popular as a healthy alternative to wheat flour for rotis.",
      quantity:    150,
      unit:        "quintal",
      price:       2400,
      harvestDate: new Date("2026-01-20"),
      images: [
        { url: "https://images.unsplash.com/photo-1599231091557-f25d6218bb7e?w=600&q=80", publicId: null },
      ],
      location: { state: "Rajasthan", district: "Jodhpur", village: "Phalodi" },
      isAvailable: true,
      owner: mohan,
    },
    {
      cropName:    "Brown Rice",
      category:    "grains",
      description: "Minimally processed brown rice with bran intact — rich in fibre, magnesium, and B vitamins. Nutty flavour and chewy texture. 30% more nutrients than polished white rice.",
      quantity:    200,
      unit:        "quintal",
      price:       3200,
      harvestDate: new Date("2025-12-01"),
      images: [
        { url: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=600&q=80", publicId: null },
      ],
      location: { state: "West Bengal", district: "Bardhaman", village: "Memari" },
      isAvailable: true,
      owner: harpreet,
    },

    // ── PULSES (5) ──────────────────────────────────────────────────────────
    {
      cropName:    "Chana Dal (Split Chickpea)",
      category:    "pulses",
      description: "Golden-yellow chana dal with excellent cooking quality. High in protein and dietary fibre. Sourced from contract farmers in MP's black-soil belt. No artificial brightening or polishing.",
      quantity:    250,
      unit:        "quintal",
      price:       5200,
      harvestDate: new Date("2026-03-01"),
      images: [
        { url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80", publicId: null },
      ],
      location: { state: "Madhya Pradesh", district: "Vidisha", village: "Ganjbasoda" },
      isAvailable: true,
      owner: mohan,
    },
    {
      cropName:    "Masoor Dal (Red Lentil)",
      category:    "pulses",
      description: "Thin-skinned red lentils that cook in 15 minutes without soaking. High protein, rich in folate and iron. Mild, earthy flavour — ideal for everyday dals and soups.",
      quantity:    180,
      unit:        "quintal",
      price:       6500,
      harvestDate: new Date("2026-04-15"),
      images: [
        { url: "https://images.unsplash.com/photo-1614961909687-1d9df1b23c37?w=600&q=80", publicId: null },
      ],
      location: { state: "Uttar Pradesh", district: "Kanpur Dehat", village: "Akbarpur" },
      isAvailable: true,
      owner: sunita,
    },
    {
      cropName:    "Moong Dal (Green Gram)",
      category:    "pulses",
      description: "Whole green moong with bright colour and fresh aroma. Organically grown with zero chemical pesticides. Excellent for sprouts, dals, khichdi, and ayurvedic preparations.",
      quantity:    120,
      unit:        "quintal",
      price:       7800,
      harvestDate: new Date("2026-06-20"),
      images: [
        { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", publicId: null },
      ],
      location: { state: "Rajasthan", district: "Bikaner", village: "Nokha" },
      isAvailable: true,
      owner: mohan,
    },
    {
      cropName:    "Toor Dal (Pigeon Pea)",
      category:    "pulses",
      description: "Lightly oiled premium toor dal from Latur — the pulse capital of India. Consistent size, minimal broken grains. Cooks to a creamy consistency — perfect for sambar and dal tadka.",
      quantity:    200,
      unit:        "quintal",
      price:       8900,
      harvestDate: new Date("2026-01-30"),
      images: [
        { url: "https://images.unsplash.com/photo-1612702009240-2b9db5a3c505?w=600&q=80", publicId: null },
      ],
      location: { state: "Maharashtra", district: "Latur", village: "Nilanga" },
      isAvailable: true,
      owner: ravi,
    },
    {
      cropName:    "Urad Dal (Black Lentil)",
      category:    "pulses",
      description: "Whole black urad dal — the key ingredient in dal makhani and idli/dosa batter. High in protein and calcium. Sundried and stored in moisture-free conditions to preserve quality.",
      quantity:    160,
      unit:        "quintal",
      price:       9200,
      harvestDate: new Date("2025-12-15"),
      images: [
        { url: "https://images.unsplash.com/photo-1632651025462-4ea98edfc7f7?w=600&q=80", publicId: null },
      ],
      location: { state: "Madhya Pradesh", district: "Chhatarpur", village: "Bijawar" },
      isAvailable: true,
      owner: sunita,
    },
  ];
};

// ─── Main Seeder ──────────────────────────────────────────────────────────────
const seed = async () => {
  const shouldClear = process.argv.includes("--clear");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    if (shouldClear) {
      console.log("🗑️  Clearing existing demo data...");
      const demoEmails = DEMO_FARMERS.map((f) => f.email);
      const demoFarmers = await User.find({ email: { $in: demoEmails } });
      const demoFarmerIds = demoFarmers.map((f) => f._id);
      await Crop.deleteMany({ owner: { $in: demoFarmerIds } });
      await User.deleteMany({ email: { $in: demoEmails } });
      console.log("✅ Demo data cleared");
    }

    // ── Create or fetch demo farmers ─────────────────────────────────────────
    console.log("👤 Creating demo farmer accounts...");
    const farmerDocs = [];
    for (const farmerData of DEMO_FARMERS) {
      let farmer = await User.findOne({ email: farmerData.email });
      if (!farmer) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(farmerData.password, salt);
        farmer = await User.create({
          ...farmerData,
          password: hashedPassword,
        });
        console.log(`  ✓ Created farmer: ${farmerData.name}`);
      } else {
        console.log(`  ↩ Farmer already exists: ${farmerData.name}`);
      }
      farmerDocs.push(farmer);
    }

    // ── Insert crops ──────────────────────────────────────────────────────────
    console.log("🌾 Seeding crop listings...");
    const crops = buildCrops(farmerDocs.map((f) => f._id));

    let created = 0;
    for (const cropData of crops) {
      const exists = await Crop.findOne({
        cropName: cropData.cropName,
        owner:    cropData.owner,
      });
      if (!exists) {
        await Crop.create(cropData);
        console.log(`  ✓ ${cropData.cropName} (${cropData.category})`);
        created++;
      } else {
        console.log(`  ↩ Already exists: ${cropData.cropName}`);
      }
    }

    console.log(`\n🎉 Seed complete! ${created} new crop(s) inserted.`);
    console.log("─────────────────────────────────────────");
    console.log("Demo farmer login credentials:");
    DEMO_FARMERS.forEach((f) => {
      console.log(`  📧 ${f.email}  🔑 ${f.password}`);
    });
    console.log("─────────────────────────────────────────");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

seed();
