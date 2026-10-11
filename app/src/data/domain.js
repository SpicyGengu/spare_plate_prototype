const MINUTE = 60 * 1000;

export const ALLERGENS = [
  { id: "peanuts", label: "Peanuts" },
  { id: "tree_nuts", label: "Tree nuts" },
  { id: "milk", label: "Milk" },
  { id: "gluten", label: "Gluten" },
  { id: "eggs", label: "Eggs" },
  { id: "soy", label: "Soy" },
  { id: "sesame", label: "Sesame" },
  { id: "fish", label: "Fish" },
  { id: "crustaceans", label: "Crustaceans" },
  { id: "molluscs", label: "Molluscs" },
  { id: "lupin", label: "Lupin" },
  { id: "sulphites", label: "Sulphites" },
];

export const DIETARY_FILTERS = ["Vegetarian", "Gluten-Free", "Nut-Free", "Halal"];

export const DIETARY_TAGS = [...DIETARY_FILTERS, "Vegan", "Dairy-Free"];

export const CATEGORIES = ["Bakery", "Japanese", "Deli", "Cafe", "Thai", "Other"];

function photo(id) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;
}

export const CATEGORY_IMAGES = {
  Bakery: photo("photo-1509440159596-0249088772ff"),
  Japanese: photo("photo-1579871494447-9811cf80d66c"),
  Deli: photo("photo-1553909489-cd47e0907980"),
  Cafe: photo("photo-1512621776951-a57141f2eefd"),
  Thai: photo("photo-1559314809-0d155014e29e"),
  Other: photo("photo-1498837167922-ddd27525d352"),
};

function fromNow(minutes) {
  return new Date(Date.now() + minutes * MINUTE).toISOString();
}

export function allergenLabel(id) {
  return ALLERGENS.find((item) => item.id === id)?.label || id;
}

export function formatAud(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "$0.00";
  return `$${amount.toFixed(2)}`;
}

export function discountPercent(original, price) {
  const base = Number(original);
  const next = Number(price);
  if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(next)) return 0;
  return Math.max(0, Math.round((1 - next / base) * 100));
}

export function formatClock(iso) {
  return new Date(iso).toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatWindow(startIso, endIso, now = Date.now()) {
  const start = new Date(startIso);
  const today = new Date(now);
  const sameDay = start.toDateString() === today.toDateString();
  const day = sameDay
    ? "Today"
    : start.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
  return `${day} ${formatClock(startIso)} – ${formatClock(endIso)}`;
}

export function windowState(startIso, endIso, now = Date.now()) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (now < start) return "upcoming";
  if (now > end) return "closed";
  return "open";
}

export function windowChip(startIso, endIso, now = Date.now()) {
  const state = windowState(startIso, endIso, now);
  if (state === "closed") return { state, label: "Closed", urgent: false };
  if (state === "upcoming") {
    const mins = Math.max(1, Math.ceil((new Date(startIso).getTime() - now) / MINUTE));
    return {
      state,
      label: mins < 90 ? `Opens in ${mins}m` : `Opens ${formatClock(startIso)}`,
      urgent: false,
    };
  }
  const mins = Math.max(0, Math.ceil((new Date(endIso).getTime() - now) / MINUTE));
  return {
    state,
    label: mins <= 90 ? `Closes in ${mins}m` : `Closes ${formatClock(endIso)}`,
    urgent: mins <= 45,
  };
}

export function countdownParts(endIso, now = Date.now()) {
  const diff = Math.max(0, new Date(endIso).getTime() - now);
  const total = Math.floor(diff / 1000);
  const pad = (value) => String(value).padStart(2, "0");
  return {
    hours: pad(Math.floor(total / 3600)),
    minutes: pad(Math.floor((total % 3600) / 60)),
    seconds: pad(total % 60),
    expired: diff <= 0,
  };
}

export function listingImage(listing) {
  return listing?.photoBase64 || listing?.imageUrl || null;
}

export function paymentLabel(method) {
  if (method === "card") return "Card · mock provider";
  return "Pay at collection · cash or EFTPOS";
}

export function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

export function makeCode(existing) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const used = new Set(existing.map((item) => item.code));
  for (let attempt = 0; attempt < 24; attempt += 1) {
    let code = "SP-";
    for (let index = 0; index < 4; index += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    if (!used.has(code)) return code;
  }
  return `SP-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

export function assertListingInput(input) {
  const name = String(input.name || "").trim();
  if (name.length < 2) throw new Error("Add an item name.");
  const description = String(input.description || "").trim();
  if (description.length < 4) throw new Error("Add a short description.");
  const ingredients = String(input.ingredients || "").trim();
  if (ingredients.length < 3) throw new Error("List the ingredients so diners can check allergens.");
  const originalPrice = Number(input.originalPrice);
  const discountedPrice = Number(input.discountedPrice);
  if (!Number.isFinite(originalPrice) || originalPrice <= 0) throw new Error("Enter the original price in AUD.");
  if (!Number.isFinite(discountedPrice) || discountedPrice <= 0) throw new Error("Enter the surplus price in AUD.");
  if (discountedPrice >= originalPrice) throw new Error("The surplus price has to be lower than the original price.");
  const quantity = Number(input.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new Error("Stock needs to be a whole number from 1 to 99.");
  }
  const start = new Date(input.collectStart).getTime();
  const end = new Date(input.collectEnd).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) throw new Error("Set a collection window.");
  if (end <= start) throw new Error("Collection has to end after it starts.");
  if (end - start < 15 * MINUTE) throw new Error("Give diners at least 15 minutes to collect.");
  if (end - start > 8 * 60 * MINUTE) throw new Error("Keep the collection window under 8 hours.");
  const allergens = Array.isArray(input.allergens) ? input.allergens : [];
  const known = new Set(ALLERGENS.map((item) => item.id));
  if (allergens.some((id) => !known.has(id))) throw new Error("Unknown allergen.");
  if (!input.noAllergens && allergens.length === 0) {
    throw new Error("Select every allergen that applies, or confirm that none of them are present.");
  }
  const dietaryTags = (input.dietaryTags || []).filter((tag) => DIETARY_TAGS.includes(tag));
  const category = CATEGORIES.includes(input.category) ? input.category : "Other";
  return {
    name,
    description,
    ingredients,
    originalPrice: roundMoney(originalPrice),
    discountedPrice: roundMoney(discountedPrice),
    quantity,
    collectStart: new Date(start).toISOString(),
    collectEnd: new Date(end).toISOString(),
    allergens: input.noAllergens ? [] : allergens,
    dietaryTags,
    category,
  };
}

export function publishListing(state, input) {
  const clean = assertListingInput(input);
  const merchant = state.merchants.find((item) => item.id === input.merchantId);
  if (!merchant) throw new Error("Choose a venue.");
  const listing = {
    id: uid("lst"),
    merchantId: merchant.id,
    merchantName: merchant.name,
    ...clean,
    imageUrl: CATEGORY_IMAGES[clean.category] || CATEGORY_IMAGES.Other,
    photoBase64: input.photoBase64 || null,
    createdAt: new Date().toISOString(),
  };
  return { listings: [listing, ...state.listings], listing };
}

export function reserveListing(state, input) {
  const paymentMethod = input.paymentMethod === "card" || input.paymentMethod === "collection"
    ? input.paymentMethod
    : null;
  if (!paymentMethod) throw new Error("Choose how you will pay.");
  const listing = state.listings.find((item) => item.id === input.listingId);
  if (!listing) throw new Error("Listing not found.");
  if (listing.quantity < 1) throw new Error("This item is sold out.");
  if (windowState(listing.collectStart, listing.collectEnd) === "closed") {
    throw new Error("The collection window has closed.");
  }
  const reservation = {
    id: uid("res"),
    code: makeCode(state.reservations),
    listingId: listing.id,
    listingName: listing.name,
    merchantId: listing.merchantId,
    merchantName: listing.merchantName,
    imageUrl: listing.imageUrl,
    photoBase64: listing.photoBase64 || null,
    discountedPrice: listing.discountedPrice,
    originalPrice: listing.originalPrice,
    paymentMethod,
    quantity: 1,
    status: "reserved",
    collectStart: listing.collectStart,
    collectEnd: listing.collectEnd,
    createdAt: new Date().toISOString(),
    collectedAt: null,
    cancelledAt: null,
  };
  const listings = state.listings.map((item) =>
    item.id === listing.id ? { ...item, quantity: item.quantity - 1 } : item
  );
  return {
    listings,
    reservations: [reservation, ...state.reservations],
    listing: listings.find((item) => item.id === listing.id),
    reservation,
  };
}

export function collectReservation(state, { id, code } = {}) {
  const needle = String(code || "").trim().toUpperCase();
  const current = state.reservations.find((item) => (id ? item.id === id : item.code.toUpperCase() === needle));
  if (!current) throw new Error(id ? "Voucher not found." : "No voucher matches that code.");
  if (current.status === "collected") throw new Error("Already marked as collected.");
  if (current.status === "cancelled") throw new Error("This reservation was cancelled.");
  const reservation = {
    ...current,
    status: "collected",
    collectedAt: new Date().toISOString(),
  };
  return {
    reservations: state.reservations.map((item) => (item.id === reservation.id ? reservation : item)),
    reservation,
  };
}

export function cancelReservation(state, id) {
  const current = state.reservations.find((item) => item.id === id);
  if (!current) throw new Error("Voucher not found.");
  if (current.status !== "reserved") throw new Error("Only active reservations can be cancelled.");
  const reservation = {
    ...current,
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
  };
  const listings = state.listings.map((item) =>
    item.id === current.listingId
      ? { ...item, quantity: Math.min(99, item.quantity + current.quantity) }
      : item
  );
  return {
    reservations: state.reservations.map((item) => (item.id === id ? reservation : item)),
    listings,
    reservation,
    listing: listings.find((item) => item.id === current.listingId) || null,
  };
}

export function filterListings(listings, merchants, { query = "", diets = [] } = {}) {
  const needle = query.trim().toLowerCase();
  return listings.filter((listing) => {
    if (diets.length > 0 && !diets.every((diet) => listing.dietaryTags.includes(diet))) return false;
    if (!needle) return true;
    const merchant = merchants.find((item) => item.id === listing.merchantId);
    const haystack = [
      listing.name,
      listing.description,
      listing.ingredients,
      listing.category,
      listing.merchantName,
      merchant?.address,
      merchant?.area,
      ...(listing.dietaryTags || []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export function sortListings(listings, now = Date.now()) {
  const rank = { open: 0, upcoming: 1, closed: 2 };
  return [...listings].sort((a, b) => {
    const left = rank[windowState(a.collectStart, a.collectEnd, now)];
    const right = rank[windowState(b.collectStart, b.collectEnd, now)];
    if (left !== right) return left - right;
    return new Date(a.collectEnd) - new Date(b.collectEnd);
  });
}

export function merchantStats(merchantId, listings, reservations, now = Date.now()) {
  const mine = listings.filter((item) => item.merchantId === merchantId);
  const activeListings = mine.filter(
    (item) => item.quantity > 0 && windowState(item.collectStart, item.collectEnd, now) !== "closed"
  ).length;
  const claimed = reservations.filter((item) => item.merchantId === merchantId && item.status !== "cancelled");
  const portions = claimed.reduce((sum, item) => sum + item.quantity, 0);
  const revenue = claimed.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);
  return { activeListings, portions, revenue: roundMoney(revenue) };
}

function snapshotReservation(listing, extra) {
  return {
    id: extra.id,
    code: extra.code,
    listingId: listing.id,
    listingName: listing.name,
    merchantId: listing.merchantId,
    merchantName: listing.merchantName,
    imageUrl: listing.imageUrl,
    photoBase64: null,
    discountedPrice: listing.discountedPrice,
    originalPrice: listing.originalPrice,
    paymentMethod: extra.paymentMethod,
    quantity: 1,
    status: extra.status,
    collectStart: listing.collectStart,
    collectEnd: listing.collectEnd,
    createdAt: new Date(Date.now() - extra.ageMin * MINUTE).toISOString(),
    collectedAt: extra.status === "collected" ? new Date(Date.now() - 12 * MINUTE).toISOString() : null,
    cancelledAt: null,
  };
}

export function createSeed() {
  const merchants = [
    {
      id: "m_bakery",
      name: "Parramatta Square Bakery",
      short: "PSQ Bakery",
      address: "Shop 12, 12 Darcy Street, Parramatta NSW 2150",
      area: "Parramatta Square",
      mapX: 46,
      mapY: 47,
    },
    {
      id: "m_sushi",
      name: "Church St Sushi",
      short: "Church St Sushi",
      address: "89 Church Street, Parramatta NSW 2150",
      area: "Church Street",
      mapX: 68,
      mapY: 40,
    },
    {
      id: "m_deli",
      name: "Macquarie Deli",
      short: "Macquarie Deli",
      address: "45 Macquarie Street, Parramatta NSW 2150",
      area: "Macquarie Street",
      mapX: 38,
      mapY: 64,
    },
    {
      id: "m_wsu",
      name: "WSU Parramatta City Cafe",
      short: "WSU Cafe",
      address: "169 Macquarie Street, Parramatta NSW 2150",
      area: "Western Sydney University",
      mapX: 20,
      mapY: 73,
    },
    {
      id: "m_thai",
      name: "Eat Street Thai",
      short: "Eat Street Thai",
      address: "Church Street Mall, Parramatta NSW 2150",
      area: "Eat Street",
      mapX: 73,
      mapY: 24,
    },
  ];

  const merchantName = (id) => merchants.find((item) => item.id === id).name;

  const listings = [
    {
      id: "lst_sourdough",
      merchantId: "m_bakery",
      merchantName: merchantName("m_bakery"),
      name: "Country sourdough loaf",
      description: "Unsold morning loaves from the Darcy Street oven. Best toasted tonight.",
      ingredients: "Wheat flour, wholemeal rye flour, water, salt, olive oil, sesame seeds",
      category: "Bakery",
      originalPrice: 9.5,
      discountedPrice: 3.9,
      quantity: 6,
      collectStart: fromNow(-25),
      collectEnd: fromNow(95),
      allergens: ["gluten", "sesame"],
      dietaryTags: ["Vegetarian", "Nut-Free"],
      imageUrl: photo("photo-1509440159596-0249088772ff"),
      photoBase64: null,
      createdAt: new Date(Date.now() - 30 * MINUTE).toISOString(),
    },
    {
      id: "lst_croissant",
      merchantId: "m_bakery",
      merchantName: merchantName("m_bakery"),
      name: "Almond croissant box",
      description: "Two almond croissants boxed at close, filled with frangipane.",
      ingredients: "Wheat flour, butter, milk, eggs, almond meal, sugar, apricot jam",
      category: "Bakery",
      originalPrice: 16,
      discountedPrice: 6,
      quantity: 3,
      collectStart: fromNow(-15),
      collectEnd: fromNow(32),
      allergens: ["gluten", "milk", "eggs", "tree_nuts"],
      dietaryTags: ["Vegetarian"],
      imageUrl: photo("photo-1555507036-ab1f4038808a"),
      photoBase64: null,
      createdAt: new Date(Date.now() - 28 * MINUTE).toISOString(),
    },
    {
      id: "lst_salmon",
      merchantId: "m_sushi",
      merchantName: merchantName("m_sushi"),
      name: "Salmon avocado box",
      description: "Eight pieces of salmon and avocado sushi, packed this afternoon.",
      ingredients: "Sushi rice, salmon, avocado, nori, soy sauce (wheat), sesame seeds, rice vinegar",
      category: "Japanese",
      originalPrice: 22,
      discountedPrice: 8.5,
      quantity: 5,
      collectStart: fromNow(25),
      collectEnd: fromNow(145),
      allergens: ["fish", "soy", "sesame", "gluten"],
      dietaryTags: ["Nut-Free"],
      imageUrl: photo("photo-1579871494447-9811cf80d66c"),
      photoBase64: null,
      createdAt: new Date(Date.now() - 20 * MINUTE).toISOString(),
    },
    {
      id: "lst_maki",
      merchantId: "m_sushi",
      merchantName: merchantName("m_sushi"),
      name: "Vegetable maki platter",
      description: "Cucumber, carrot and avocado rolls with gluten-free tamari.",
      ingredients: "Sushi rice, cucumber, carrot, avocado, nori, gluten-free tamari (soy), sesame seeds",
      category: "Japanese",
      originalPrice: 18,
      discountedPrice: 7,
      quantity: 4,
      collectStart: fromNow(-40),
      collectEnd: fromNow(80),
      allergens: ["soy", "sesame"],
      dietaryTags: ["Vegetarian", "Vegan", "Gluten-Free", "Nut-Free", "Halal"],
      imageUrl: photo("photo-1617196034796-73dfa7b1fd56"),
      photoBase64: null,
      createdAt: new Date(Date.now() - 18 * MINUTE).toISOString(),
    },
    {
      id: "lst_focaccia",
      merchantId: "m_deli",
      merchantName: merchantName("m_deli"),
      name: "Roast vegetable focaccia",
      description: "Pumpkin, capsicum and feta on house focaccia from the lunch service.",
      ingredients: "Wheat flour, olive oil, yeast, salt, roasted pumpkin, capsicum, feta (milk), rosemary",
      category: "Deli",
      originalPrice: 15,
      discountedPrice: 6,
      quantity: 4,
      collectStart: fromNow(-10),
      collectEnd: fromNow(70),
      allergens: ["gluten", "milk"],
      dietaryTags: ["Vegetarian", "Nut-Free"],
      imageUrl: photo("photo-1509722747041-616f39b57569"),
      photoBase64: null,
      createdAt: new Date(Date.now() - 16 * MINUTE).toISOString(),
    },
    {
      id: "lst_schnitzel",
      merchantId: "m_deli",
      merchantName: merchantName("m_deli"),
      name: "Chicken schnitzel roll",
      description: "Halal chicken schnitzel, lettuce and mayonnaise on a white roll.",
      ingredients: "Wheat roll, halal chicken, wheat breadcrumbs, eggs, mayonnaise (egg), lettuce, salt",
      category: "Deli",
      originalPrice: 16.5,
      discountedPrice: 7,
      quantity: 5,
      collectStart: fromNow(70),
      collectEnd: fromNow(190),
      allergens: ["gluten", "eggs"],
      dietaryTags: ["Halal", "Nut-Free"],
      imageUrl: photo("photo-1553909489-cd47e0907980"),
      photoBase64: null,
      createdAt: new Date(Date.now() - 14 * MINUTE).toISOString(),
    },
    {
      id: "lst_lamb",
      merchantId: "m_wsu",
      merchantName: merchantName("m_wsu"),
      name: "Halal lamb wrap",
      description: "Campus cafe special. Slow-cooked lamb, salad and garlic sauce.",
      ingredients: "Wheat flatbread, halal lamb, lettuce, tomato, onion, garlic sauce (milk), paprika",
      category: "Cafe",
      originalPrice: 14,
      discountedPrice: 5.5,
      quantity: 8,
      collectStart: fromNow(-8),
      collectEnd: fromNow(48),
      allergens: ["gluten", "milk"],
      dietaryTags: ["Halal", "Nut-Free"],
      imageUrl: photo("photo-1626700051175-6818013e1d4f"),
      photoBase64: null,
      createdAt: new Date(Date.now() - 12 * MINUTE).toISOString(),
    },
    {
      id: "lst_bowl",
      merchantId: "m_wsu",
      merchantName: merchantName("m_wsu"),
      name: "Vegan buddha bowl",
      description: "Brown rice, chickpeas, kale and tahini. Fully plant based.",
      ingredients: "Brown rice, chickpeas, kale, tahini (sesame), edamame (soy), lemon, olive oil",
      category: "Cafe",
      originalPrice: 16,
      discountedPrice: 6.5,
      quantity: 6,
      collectStart: fromNow(-35),
      collectEnd: fromNow(110),
      allergens: ["sesame", "soy"],
      dietaryTags: ["Vegan", "Vegetarian", "Gluten-Free", "Nut-Free", "Halal"],
      imageUrl: photo("photo-1512621776951-a57141f2eefd"),
      photoBase64: null,
      createdAt: new Date(Date.now() - 10 * MINUTE).toISOString(),
    },
    {
      id: "lst_curry",
      merchantId: "m_thai",
      merchantName: merchantName("m_thai"),
      name: "Green curry and rice",
      description: "Halal chicken green curry with jasmine rice and Thai basil.",
      ingredients: "Jasmine rice, halal chicken, coconut milk, green curry paste (shrimp paste), fish sauce, Thai basil, bamboo shoots",
      category: "Thai",
      originalPrice: 19,
      discountedPrice: 8,
      quantity: 4,
      collectStart: fromNow(15),
      collectEnd: fromNow(130),
      allergens: ["crustaceans", "fish"],
      dietaryTags: ["Gluten-Free", "Nut-Free", "Halal"],
      imageUrl: photo("photo-1455619452474-d2be8b1e70cd"),
      photoBase64: null,
      createdAt: new Date(Date.now() - 8 * MINUTE).toISOString(),
    },
    {
      id: "lst_padthai",
      merchantId: "m_thai",
      merchantName: merchantName("m_thai"),
      name: "Prawn pad Thai",
      description: "Rice noodles tossed with prawns, egg, tofu and crushed peanuts.",
      ingredients: "Rice noodles, prawns, eggs, tofu (soy), peanuts, fish sauce, soy sauce (wheat), bean sprouts, lime",
      category: "Thai",
      originalPrice: 18,
      discountedPrice: 7.5,
      quantity: 3,
      collectStart: fromNow(-20),
      collectEnd: fromNow(55),
      allergens: ["crustaceans", "eggs", "soy", "peanuts", "fish", "gluten"],
      dietaryTags: [],
      imageUrl: photo("photo-1559314809-0d155014e29e"),
      photoBase64: null,
      createdAt: new Date(Date.now() - 6 * MINUTE).toISOString(),
    },
  ];

  const byId = Object.fromEntries(listings.map((listing) => [listing.id, listing]));
  const reservations = [
    snapshotReservation(byId.lst_croissant, {
      id: "res_seed_croissant",
      code: "SP-4K2M",
      status: "collected",
      paymentMethod: "card",
      ageMin: 50,
    }),
    snapshotReservation(byId.lst_focaccia, {
      id: "res_seed_focaccia",
      code: "SP-9Q1C",
      status: "reserved",
      paymentMethod: "collection",
      ageMin: 18,
    }),
    snapshotReservation(byId.lst_bowl, {
      id: "res_seed_bowl",
      code: "SP-7H8D",
      status: "collected",
      paymentMethod: "collection",
      ageMin: 40,
    }),
    snapshotReservation(byId.lst_lamb, {
      id: "res_seed_lamb",
      code: "SP-2M6P",
      status: "reserved",
      paymentMethod: "collection",
      ageMin: 8,
    }),
  ];

  return { merchants, listings, reservations };
}
