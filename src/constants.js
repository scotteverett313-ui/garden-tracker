// ─── Asset URLs ───────────────────────────────────────────────────────────────
const ASSET = (f) => `/icons/${f}`;

export const ICONS = {
  logo:           ASSET("Logo-dirtrich.png"),
  garden:         ASSET("Icon-seedling.png"),
  seeds:          ASSET("Icon-seed.png"),
  calendar:       ASSET("Icon-Calender.png"),
  harvest:        ASSET("Icon-Harvest.png"),
  favorite:       ASSET("Icon-Favorite.png"),
  favActive:      ASSET("icon-favorites-2.png"),
  exit:           ASSET("Icon-Exit.png"),
  back:           ASSET("Icon-Back.png"),
  menu:           ASSET("Icon-Menu.png"),
  grid:           ASSET("Icon-Toggle-Grid.png"),
  list:           ASSET("Icon-Toggle-Row.png"),
  sun:            ASSET("Icon-Sun.png"),
  water:          ASSET("Icon-Water.png"),
  house:          ASSET("Icon-House.png"),
  profile:        ASSET("Icon-Profile.png"),
  settings:       ASSET("Icon-Settings.png"),
  edit:           ASSET("Icon-Edit.png"),
  trash:          ASSET("Icon-Trash Delete.png"),
  camera:         ASSET("Icon-Camera.png"),
  backup:         ASSET("Icon-Backup.png"),
  save:           ASSET("Icon-Save.png"),
  database:       ASSET("Icon-Database.png"),
  transplantShop: ASSET("Icon-Transplant Shop.png"),
  zone:           ASSET("Icon-Zone.png"),
  streak:         ASSET("Icon-Streak.png"),
  dollar:         ASSET("Icon-Dollarsign.png"),
  seedlingGreen:  ASSET("Icon-seedlinggreen.png"),
  germinating:    ASSET("Icon-germinating.png"),
  growing:        ASSET("Icon-growing.png"),
  flowering:      ASSET("Icon-flowering.png"),
  fruiting:       ASSET("Icon-fruiting.png"),
  harvesting:     ASSET("Icon- harvesting.png"),
  harvested:      ASSET("Icon-Harvested.png"),
  transplanted:   ASSET("Icon-transplanted.png"),
  dormant:        ASSET("Icon-dormant.png"),
  overwintering:  ASSET("Icon-Overwintering.png"),
  dead:           ASSET("Icon-Dead.png"),
};

// ─── Shared styles ────────────────────────────────────────────────────────────
export const lbl = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#444" };
export const sel = { width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, background: "#fff", fontFamily: "inherit", cursor: "pointer", boxSizing: "border-box" };

// ─── Zones ────────────────────────────────────────────────────────────────────
export const ZONES = ["Basement Grow Station", "Greenhouse", "Raised Beds", "In-Ground Beds"];
export const DEFAULT_ZONES = [
  { id: "zone_basement",   name: "Basement Grow Station", icon: "💡", img: ASSET("Icon-Sun.png") },
  { id: "zone_greenhouse", name: "Greenhouse",            icon: "🏠", img: ASSET("Icon-House.png") },
  { id: "zone_raised",     name: "Raised Beds",           icon: "🟫", img: ASSET("Icon-Zone.png") },
  { id: "zone_inground",   name: "In-Ground Beds",        icon: "🌱", img: ASSET("Icon-seedling.png") },
];

// ─── Statuses ─────────────────────────────────────────────────────────────────
export const STATUSES = [
  { label: "Seed",         icon: "🌰", img: ASSET("Icon-seed.png") },
  { label: "Germinating",  icon: "🌱", img: ASSET("Icon-germinating.png") },
  { label: "Seedling",     icon: "🌿", img: ASSET("Icon-seedling.png") },
  { label: "Transplanted", icon: "🪴", img: ASSET("Icon-Transplanted.png") },
  { label: "Growing",      icon: "🌾", img: ASSET("Icon-growing.png") },
  { label: "Flowering",    icon: "🌸", img: ASSET("Icon-flowering.png") },
  { label: "Fruiting",     icon: "🍅", img: ASSET("Icon-Fruiting.png") },
  { label: "Harvesting",   icon: "🧺", img: ASSET("Icon- Harvesting.png") },
  { label: "Dormant",      icon: "💤", img: ASSET("Icon-dormant.png") },
  { label: "Harvested",    icon: "✅", img: ASSET("Icon-harvested.png") },
  { label: "Dead",         icon: "🪦", img: ASSET("Icon-Dead.png") },
];

export const STATUS_COLORS = {
  "Seed": "#f5e6c8", "Germinating": "#e8f0d8", "Seedling": "#d6e8d0",
  "Transplanted": "#fde8c8", "Growing": "#d8ecd8", "Flowering": "#f0d8e8",
  "Fruiting": "#fcd8d8", "Harvesting": "#d8e8c8", "Dormant": "#e8e8e8",
  "Harvested": "#d4edda", "Dead": "#e8e8e8",
};

export const CARE_TYPES = ["Watering", "Fertilizing", "Pruning", "Pest Treatment", "Observation"];
export const CARE_ICONS = { Watering: "💧", Fertilizing: "🌿", Pruning: "✂️", "Pest Treatment": "🐛", Observation: "👁" };

// ─── Pixel Art Icon Library ───────────────────────────────────────────────────
export const ICON_LIBRARY = [
  { name: "Alyssum",     url: ASSET("Alyssum.png"),      tags: ["alyssum", "flower"] },
  { name: "Artichoke",   url: ASSET("Artichoke.png"),    tags: ["artichoke"] },
  { name: "Arugula",     url: ASSET("Arugula.png"),      tags: ["arugula", "rocket", "greens"] },
  { name: "Basil",       url: ASSET("Basil.png"),        tags: ["basil", "herb"] },
  { name: "Bell Pepper", url: ASSET("Bell Pepper.png"),  tags: ["pepper", "bell pepper", "capsicum"] },
  { name: "Broccoli",    url: ASSET("Broccoli.png"),     tags: ["broccoli"] },
  { name: "Calendula",   url: ASSET("Calendula.png"),    tags: ["calendula", "flower"] },
  { name: "Carrot",      url: ASSET("Carrot.png"),       tags: ["carrot"] },
  { name: "Cauliflower", url: ASSET("Cauliflower.png"),  tags: ["cauliflower"] },
  { name: "Chives",      url: ASSET("Chives.png"),       tags: ["chives", "herb"] },
  { name: "Cilantro",    url: ASSET("Cilantro.png"),     tags: ["cilantro", "coriander", "herb"] },
  { name: "Cosmos",      url: ASSET("Cosmos.png"),       tags: ["cosmos", "flower"] },
  { name: "Eggplant",    url: ASSET("Eggplant.png"),     tags: ["eggplant", "aubergine"] },
  { name: "Hot Pepper",  url: ASSET("Hot Pepper.png"),   tags: ["pepper", "hot pepper", "chili"] },
  { name: "Kohlrabi",    url: ASSET("Kohlrabi.png"),     tags: ["kohlrabi"] },
  { name: "Lettuce",     url: ASSET("Lettuce.png"),      tags: ["lettuce", "salad", "greens"] },
  { name: "Okra",        url: ASSET("Okra.png"),         tags: ["okra"] },
  { name: "Spinach",     url: ASSET("Spinach.png"),      tags: ["spinach", "greens"] },
  { name: "Sunflower",   url: ASSET("Sunflower.png"),    tags: ["sunflower", "flower"] },
  { name: "Tomato",      url: ASSET("Tomato.png"),       tags: ["tomato"] },
  { name: "Zinna",       url: ASSET("Zinna.png"),        tags: ["zinnia", "zinna", "flower"] },
];

// ─── Plant Database ───────────────────────────────────────────────────────────
export const PLANT_DB = [
  { name: "Tomato",      dtm: 75,  water: "Regular",  sun: "Full Sun",      about: "Warm-season crop. Start indoors 6-8 weeks before last frost. Needs consistent moisture and support." },
  { name: "Pepper",      dtm: 80,  water: "Regular",  sun: "Full Sun",      about: "Slow starter. Begin indoors 8-10 weeks before last frost. Loves heat and well-drained soil." },
  { name: "Basil",       dtm: 60,  water: "Moderate", sun: "Full Sun",      about: "Aromatic herb. Start indoors after last frost. Pinch flowers to extend harvest." },
  { name: "Lettuce",     dtm: 45,  water: "Regular",  sun: "Partial Shade", about: "Cool-season crop. Direct sow or transplant. Bolt-resistant varieties last longer." },
  { name: "Cucumber",    dtm: 55,  water: "High",     sun: "Full Sun",      about: "Warm-season vine. Direct sow after frost. Needs trellis or ample space." },
  { name: "Zucchini",    dtm: 50,  water: "Regular",  sun: "Full Sun",      about: "Prolific producer. Direct sow after last frost. One or two plants go a long way." },
  { name: "Kale",        dtm: 55,  water: "Regular",  sun: "Full Sun",      about: "Cold-hardy green. Can be started indoors or direct sown. Flavor improves after frost." },
  { name: "Spinach",     dtm: 40,  water: "Regular",  sun: "Partial Shade", about: "Fast-growing cool-season green. Direct sow in early spring or fall." },
  { name: "Broccoli",    dtm: 70,  water: "Regular",  sun: "Full Sun",      about: "Start indoors 6-8 weeks before transplant. Cool-season crop that tolerates light frost." },
  { name: "Carrot",      dtm: 70,  water: "Moderate", sun: "Full Sun",      about: "Direct sow only. Loose, deep soil produces best roots. Thin to 3 inches apart." },
  { name: "Radish",      dtm: 25,  water: "Moderate", sun: "Full Sun",      about: "Fastest garden crop. Direct sow every 2 weeks for continuous harvest." },
  { name: "Beet",        dtm: 55,  water: "Moderate", sun: "Full Sun",      about: "Direct sow in cool weather. Thin seedlings — each seed is a cluster." },
  { name: "Peas",        dtm: 60,  water: "Moderate", sun: "Full Sun",      about: "Cool-season climber. Direct sow as soon as soil can be worked. Needs trellis." },
  { name: "Beans",       dtm: 55,  water: "Moderate", sun: "Full Sun",      about: "Direct sow after last frost. No thinning needed. Bush types need no support." },
  { name: "Squash",      dtm: 50,  water: "Regular",  sun: "Full Sun",      about: "Vigorous grower. Start indoors or direct sow after last frost. Needs space." },
  { name: "Pumpkin",     dtm: 100, water: "Regular",  sun: "Full Sun",      about: "Long season crop. Start indoors 3-4 weeks before last frost. Needs lots of room." },
  { name: "Eggplant",    dtm: 80,  water: "Regular",  sun: "Full Sun",      about: "Heat-loving. Start indoors 8-10 weeks before last frost. Needs warm soil to thrive." },
  { name: "Cilantro",    dtm: 50,  water: "Moderate", sun: "Partial Shade", about: "Bolt-resistant varieties recommended. Direct sow succession plantings every 3-4 weeks." },
  { name: "Parsley",     dtm: 70,  water: "Moderate", sun: "Full Sun",      about: "Slow germinator. Soak seeds overnight before planting. Biennial but grown as annual." },
  { name: "Dill",        dtm: 40,  water: "Low",      sun: "Full Sun",      about: "Direct sow only — doesn't transplant well. Self-seeds readily." },
  { name: "Thyme",       dtm: 85,  water: "Low",      sun: "Full Sun",      about: "Drought-tolerant perennial herb. Start indoors or from division." },
  { name: "Mint",        dtm: 90,  water: "Regular",  sun: "Partial Shade", about: "Vigorous spreader. Grow in containers to prevent it taking over the garden." },
  { name: "Cosmos",      dtm: 60,  water: "Low",      sun: "Full Sun",      about: "Easy annual flower. Direct sow after last frost. Attracts pollinators all season." },
  { name: "Marigold",    dtm: 50,  water: "Low",      sun: "Full Sun",      about: "Companion planting staple. Deters pests. Direct sow or start indoors 4-6 weeks early." },
  { name: "Sunflower",   dtm: 70,  water: "Low",      sun: "Full Sun",      about: "Direct sow after last frost. Tall varieties need staking. Great for pollinators." },
  { name: "Borage",      dtm: 55,  water: "Low",      sun: "Full Sun",      about: "Edible flowers, great companion plant. Direct sow. Self-seeds aggressively." },
  { name: "Cabbage",     dtm: 70,  water: "Regular",  sun: "Full Sun",      about: "Cool-season crop. Start indoors 6-8 weeks before transplant. Tolerates frost." },
  { name: "Cauliflower", dtm: 75,  water: "Regular",  sun: "Full Sun",      about: "Finicky cool-season crop. Blanch heads by tying leaves over forming heads." },
  { name: "Onion",       dtm: 100, water: "Regular",  sun: "Full Sun",      about: "Start from sets, transplants, or seed. Long season. Stop watering when tops fall over." },
  { name: "Garlic",      dtm: 240, water: "Moderate", sun: "Full Sun",      about: "Plant cloves in fall for summer harvest. One of the easiest crops to grow." },
];

export const COMPANION_DB = {
  "Tomato":   { good: ["Basil", "Marigold", "Parsley", "Carrot", "Borage"],    bad: ["Fennel", "Cabbage", "Corn"] },
  "Pepper":   { good: ["Basil", "Marigold", "Carrot", "Tomato"],               bad: ["Fennel", "Beans"] },
  "Basil":    { good: ["Tomato", "Pepper", "Marigold"],                         bad: ["Sage", "Mint"] },
  "Lettuce":  { good: ["Carrot", "Radish", "Strawberry", "Chives"],             bad: ["Celery", "Parsley"] },
  "Cucumber": { good: ["Beans", "Peas", "Marigold", "Sunflower"],               bad: ["Potato", "Sage"] },
  "Zucchini": { good: ["Beans", "Marigold", "Nasturtium"],                      bad: ["Potato"] },
  "Carrot":   { good: ["Tomato", "Lettuce", "Rosemary", "Chives"],              bad: ["Dill", "Parsnip"] },
  "Marigold": { good: ["Tomato", "Pepper", "Cucumber", "Squash"],               bad: [] },
  "Beans":    { good: ["Cucumber", "Carrot", "Squash", "Marigold"],             bad: ["Onion", "Garlic"] },
  "Kale":     { good: ["Beet", "Celery", "Cucumber", "Marigold"],               bad: ["Tomato", "Beans"] },
  "Borage":   { good: ["Tomato", "Squash", "Strawberry"],                       bad: [] },
};

export const CALENDAR_DATA = [
  { name: "Tomato",     type: "Vegetable", indoors: [2,3,4],   transplant: [5,6],   direct: [] },
  { name: "Pepper",     type: "Vegetable", indoors: [1,2,3],   transplant: [5,6],   direct: [] },
  { name: "Eggplant",   type: "Vegetable", indoors: [2,3],     transplant: [5,6],   direct: [] },
  { name: "Basil",      type: "Herb",      indoors: [3,4],     transplant: [5,6],   direct: [] },
  { name: "Lettuce",    type: "Vegetable", indoors: [2,3],     transplant: [4,5],   direct: [8,9] },
  { name: "Spinach",    type: "Vegetable", indoors: [],         transplant: [],      direct: [3,4,8,9] },
  { name: "Kale",       type: "Vegetable", indoors: [2,3],     transplant: [4,5],   direct: [7,8] },
  { name: "Broccoli",   type: "Vegetable", indoors: [2,3],     transplant: [4,5],   direct: [6,7] },
  { name: "Cabbage",    type: "Vegetable", indoors: [2,3],     transplant: [4,5],   direct: [6,7] },
  { name: "Cucumber",   type: "Vegetable", indoors: [4,5],     transplant: [6],     direct: [] },
  { name: "Squash",     type: "Vegetable", indoors: [4,5],     transplant: [6],     direct: [] },
  { name: "Zucchini",   type: "Vegetable", indoors: [4,5],     transplant: [6],     direct: [] },
  { name: "Pumpkin",    type: "Vegetable", indoors: [4,5],     transplant: [6],     direct: [] },
  { name: "Beans",      type: "Vegetable", indoors: [],         transplant: [],      direct: [5,6,7] },
  { name: "Peas",       type: "Vegetable", indoors: [],         transplant: [],      direct: [3,4,8,9] },
  { name: "Carrot",     type: "Vegetable", indoors: [],         transplant: [],      direct: [3,4,5,8] },
  { name: "Radish",     type: "Vegetable", indoors: [],         transplant: [],      direct: [3,4,5,8,9] },
  { name: "Beet",       type: "Vegetable", indoors: [],         transplant: [],      direct: [3,4,5,8] },
  { name: "Onion",      type: "Vegetable", indoors: [1,2],     transplant: [3,4],   direct: [] },
  { name: "Garlic",     type: "Vegetable", indoors: [],         transplant: [],      direct: [9,10] },
  { name: "Cilantro",   type: "Herb",      indoors: [3,4],     transplant: [4,5],   direct: [5,6] },
  { name: "Parsley",    type: "Herb",      indoors: [2,3],     transplant: [4,5],   direct: [] },
  { name: "Dill",       type: "Herb",      indoors: [],         transplant: [],      direct: [4,5,6] },
  { name: "Thyme",      type: "Herb",      indoors: [2,3],     transplant: [4,5],   direct: [] },
  { name: "Marigold",   type: "Flower",    indoors: [3,4],     transplant: [5],     direct: [5,6] },
  { name: "Cosmos",     type: "Flower",    indoors: [],         transplant: [],      direct: [5,6] },
  { name: "Sunflower",  type: "Flower",    indoors: [],         transplant: [],      direct: [5,6] },
  { name: "Borage",     type: "Flower",    indoors: [],         transplant: [],      direct: [4,5,6] },
];

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
