/* ------------------------------------------------------------------
   LOUD BUN — content & product data
   All sections render from these arrays, so the menu, copy and imagery
   can be changed without touching component code.
------------------------------------------------------------------- */

/* Unsplash photo ids. Every <Img> also has a category fallback, so a
   missing photo degrades to another burger shot, never a broken icon. */
export const PHOTO = {
  hero: '1568901346375-23c9450c58cd',
  classic: '1571091718767-18b5b1457add',
  double: '1553979459-d2229ba7433b',
  smokehouse: '1550547660-d9450f859349',
  hotHoney: '1586190848861-99aa4a171e90',
  bbq: '1594212699903-ec8a3eca50f5',
  triple: '1572802419224-296b0aeee0d9',
  chicken: '1606755962773-d324e0a13086',
  greens: '1520072959219-c595dc870360',
  closeup: '1561758033-d89a9ad46330',
  burgerAlt: '1565299507177-b0ac66763828',
  fries: '1573080496219-bb080dd4f877',
  friesCone: '1630384060421-cb20d0e0649d',
  friesAlt: '1541592106381-b31e9677c0e5',
  rings: '1639024471283-03518883512d',
  shake: '1572490122747-3968b75cc699',
  shakeAlt: '1579954115545-a95591f28bfc',
  shakeDark: '1577805947697-89e18249d767',
  lemonade: '1437418747212-8d9709afab22',
  cola: '1581006852262-e4307cf6283a',
  drinks: '1513558161293-cdaf765ed2fd',
  beef: '1603048297172-c92544798d5a',
  tomatoes: '1592924357228-91a4daadcfea',
  buns: '1509440159596-0249088772ff',
  cheese: '1486297678162-eb2a19b0a32d',
  sauce: '1472476443507-c7a5948772fc',
  grill: '1555939594-58d7cb561ad1',
  interior: '1555396273-367ea4eb4db5',
  avatar1: '1494790108377-be9c29b29330',
  avatar2: '1507003211169-0a1dd7228f2d',
  avatar3: '1500648767791-00dcc994a43e',
  avatar4: '1438761681033-6461ffad8d80',
};

export const FALLBACK = {
  burger: PHOTO.hero,
  fries: PHOTO.fries,
  shake: PHOTO.shake,
  drink: PHOTO.lemonade,
  produce: PHOTO.tomatoes,
  person: PHOTO.avatar3,
};

/* ---------- Product catalogue (single source for cart + menus) ---------- */
export const products = {
  classic: { name: 'The Classic', price: 9.5, category: 'burgers', img: PHOTO.classic, fb: 'burger',
    desc: 'One smashed patty, American cheese, pickles, white onion, Loud sauce.' },
  double: { name: 'Double Stack', price: 13, category: 'burgers', img: PHOTO.double, fb: 'burger',
    desc: 'Two smashed patties, double cheddar, caramelised onion, Loud sauce.' },
  smokehouse: { name: 'Smokehouse', price: 14, category: 'burgers', img: PHOTO.smokehouse, fb: 'burger',
    desc: 'Smoked cheddar, thick-cut bacon, charred onion, chipotle mayo.' },
  hotHoney: { name: 'Hot Honey', price: 13.5, category: 'burgers', img: PHOTO.hotHoney, fb: 'burger',
    desc: 'Pepper jack, crispy jalapeño, hot honey drizzle, lime slaw.' },
  bbq: { name: 'BBQ Crunch', price: 13.5, category: 'burgers', img: PHOTO.bbq, fb: 'burger',
    desc: 'Bourbon BBQ, onion straws, sharp cheddar, bread & butter pickles.' },
  triple: { name: 'Triple Cheese', price: 16, category: 'burgers', img: PHOTO.triple, fb: 'burger',
    desc: 'Three patties. Three cheeses. Zero regrets. Napkins strongly advised.' },
  chicken: { name: 'Cluck Norris', price: 12.5, category: 'burgers', img: PHOTO.chicken, fb: 'burger',
    desc: 'Buttermilk fried thigh, pickles, hot mayo, shredded iceberg.' },
  greens: { name: 'Green Machine', price: 12, category: 'burgers', img: PHOTO.greens, fb: 'burger',
    desc: 'Smashed black-bean patty, avocado, pickled red onion, herb mayo.' },

  loudFries: { name: 'Loud Fries', price: 4.5, category: 'fries', img: PHOTO.fries, fb: 'fries',
    desc: 'Skin-on, double-fried, dusted with our seasoning salt.' },
  truffleFries: { name: 'Truffle Parm Fries', price: 6.5, category: 'fries', img: PHOTO.friesCone, fb: 'fries',
    desc: 'Truffle oil, aged parmesan, cracked pepper.' },
  chiliFries: { name: 'Chili Cheese Fries', price: 7, category: 'fries', img: PHOTO.friesAlt, fb: 'fries',
    desc: 'Beef & bean chili, cheese sauce, jalapeño.' },

  rings: { name: 'Beer-Batter Rings', price: 5.5, category: 'sides', img: PHOTO.rings, fb: 'fries',
    desc: 'Sweet onion, crackling lager batter, ranch.' },
  pickles: { name: 'Fried Pickle Chips', price: 5, category: 'sides', img: PHOTO.burgerAlt, fb: 'fries',
    desc: 'Dill chips in cornmeal crust, comeback sauce.' },
  slaw: { name: 'Lime Slaw', price: 3.5, category: 'sides', img: PHOTO.tomatoes, fb: 'produce',
    desc: 'Crunchy cabbage, lime, coriander. The fresh one.' },

  caramelShake: { name: 'Burnt Caramel Shake', price: 6.5, category: 'shakes', img: PHOTO.shakeDark, fb: 'shake',
    desc: 'Vanilla soft-serve, burnt caramel, sea salt.' },
  strawberryShake: { name: 'Strawberry Field', price: 6.5, category: 'shakes', img: PHOTO.shake, fb: 'shake',
    desc: 'Real strawberries, vanilla custard, whipped cream.' },
  cookieShake: { name: 'Black & White', price: 7, category: 'shakes', img: PHOTO.shakeAlt, fb: 'shake',
    desc: 'Chocolate fudge, vanilla, crushed cookie.' },

  lemonade: { name: 'House Lemonade', price: 4, category: 'drinks', img: PHOTO.lemonade, fb: 'drink',
    desc: 'Squeezed every morning. Mint on request.' },
  cola: { name: 'Cherry Cola', price: 3.5, category: 'drinks', img: PHOTO.cola, fb: 'drink',
    desc: 'Small-batch cola, black cherry, lots of ice.' },
  icedTea: { name: 'Peach Iced Tea', price: 3.5, category: 'drinks', img: PHOTO.drinks, fb: 'drink',
    desc: 'Black tea brewed cold, white peach.' },

  combo: { name: 'The Loud Combo', price: 19, category: 'combos', img: PHOTO.classic, fb: 'burger',
    desc: 'Any signature burger, Loud Fries and a drink.' },
};

export const formatPrice = (n) => `$${n % 1 === 0 ? n : n.toFixed(2)}`;

/* ---------- 02 · Signature burgers ---------- */
export const signatureBurgers = [
  { id: 'double', num: '01', tag: 'Best seller', variant: 'feature', note: 'Our most-ordered burger, 9 years running in our heads.' },
  { id: 'classic', num: '02', tag: 'Since day one', variant: 'tall' },
  { id: 'smokehouse', num: '03', tag: 'Smoky', variant: 'default' },
  { id: 'hotHoney', num: '04', tag: 'Spicy', variant: 'dark' },
  { id: 'bbq', num: '05', tag: 'Crunchy', variant: 'default' },
  { id: 'triple', num: '06', tag: 'Limited run', variant: 'wide' },
];

/* ---------- 04 · Categories ---------- */
export const categories = [
  { key: 'burgers', name: 'Burgers', blurb: 'Smashed to order', theme: 'burgundy', img: PHOTO.closeup, fb: 'burger' },
  { key: 'fries', name: 'Fries', blurb: 'Double-fried, always', theme: 'orange', img: PHOTO.fries, fb: 'fries' },
  { key: 'sides', name: 'Sides', blurb: 'Crunch on the side', theme: 'green', img: PHOTO.rings, fb: 'fries' },
  { key: 'shakes', name: 'Shakes', blurb: 'Thick enough to argue', theme: 'lime', img: PHOTO.shake, fb: 'shake' },
  { key: 'drinks', name: 'Drinks', blurb: 'Cold, fizzy, fresh', theme: 'cream', img: PHOTO.lemonade, fb: 'drink' },
];

/* ---------- 05 · Full Stack menu grid ----------
   size: 'lg' = 2×2 tile, 'wide' = 2×1 tile, default = 1×1 */
export const menuHighlights = [
  { id: 'double', size: 'lg' },
  { id: 'classic' },
  { id: 'loudFries' },
  { id: 'smokehouse' },
  { id: 'caramelShake' },
  { id: 'hotHoney', size: 'wide' },
  { id: 'chicken' },
  { id: 'triple' },
];

export const menuByCategory = {
  burgers: [
    { id: 'double', size: 'lg' }, { id: 'classic' }, { id: 'smokehouse' }, { id: 'bbq' },
    { id: 'triple' }, { id: 'hotHoney', size: 'wide' }, { id: 'chicken' }, { id: 'greens' },
  ],
  fries: [{ id: 'loudFries', size: 'wide' }, { id: 'truffleFries' }, { id: 'chiliFries' }],
  sides: [{ id: 'rings', size: 'wide' }, { id: 'pickles' }, { id: 'slaw' }],
  shakes: [{ id: 'caramelShake', size: 'wide' }, { id: 'strawberryShake' }, { id: 'cookieShake' }],
  drinks: [{ id: 'lemonade', size: 'wide' }, { id: 'cola' }, { id: 'icedTea' }],
};

export const menuTabs = [
  { key: 'highlights', label: 'Highlights' },
  { key: 'burgers', label: 'Burgers' },
  { key: 'fries', label: 'Fries' },
  { key: 'sides', label: 'Sides' },
  { key: 'shakes', label: 'Shakes' },
  { key: 'drinks', label: 'Drinks' },
  { key: 'all', label: 'Everything' },
];

/* ---------- 06 · Ingredients ---------- */
export const ingredients = [
  { num: '01', title: '100% Beef', note: 'Chuck and brisket, 80/20, ground in-house every morning. Never frozen.', label: 'Ground daily', img: PHOTO.beef, fb: 'burger' },
  { num: '02', title: 'Fresh Produce', note: 'Tomatoes, onions and iceberg from Hudson Valley farms, delivered at dawn.', label: '< 24h old', img: PHOTO.tomatoes, fb: 'produce' },
  { num: '03', title: 'Baked Buns', note: 'Buttery brioche, proofed overnight and baked at 5am. Toasted to order.', label: 'Baked 5am', img: PHOTO.buns, fb: 'burger' },
  { num: '04', title: 'Aged Cheese', note: 'Nine-month aged cheddar that melts like it means it.', label: '9 months', img: PHOTO.cheese, fb: 'burger' },
  { num: '05', title: 'House Sauce', note: 'Eleven ingredients. One secret. Made in small batches, twice a day.', label: 'Top secret', img: PHOTO.sauce, fb: 'burger' },
];

export const specSheet = [
  ['Beef', 'Chuck + brisket, 80/20'],
  ['Bun', 'Brioche, baked 5am'],
  ['Cheese', 'Cheddar, aged 9 months'],
  ['Sauce', '11 ingredients, 1 secret'],
  ['Freezers', 'Zero. Not one.'],
];

/* ---------- 08 · Testimonials ---------- */
export const testimonials = [
  { quote: 'That first bite was ridiculous. I went back the next day. And the day after.', name: 'Maya R.', meta: 'Ordered: Double Stack', avatar: PHOTO.avatar1, theme: 'white' },
  { quote: 'Crispy edges, melty middle. This is the smash burger everyone else is pretending to make.', name: 'Daniel K.', meta: 'Ordered: Smokehouse', avatar: PHOTO.avatar2, theme: 'lime' },
  { quote: 'Hot Honey changed my personality.', name: 'Jonah P.', meta: 'Ordered: Hot Honey', avatar: PHOTO.avatar3, theme: 'red' },
  { quote: 'Ruined my shirt. Worth it. Ten out of ten, would ruin again.', name: 'Priya S.', meta: 'Ordered: Triple Cheese', avatar: PHOTO.avatar4, theme: 'white' },
];

/* ---------- 09 · Locations ---------- */
export const locations = [
  {
    key: 'williamsburg',
    name: 'Williamsburg',
    badge: 'Flagship',
    address: ['214 Wythe Ave', 'Brooklyn, NY 11249'],
    phone: '(718) 555-0142',
    hours: [['Mon – Thu', '11:00 – 23:00'], ['Fri – Sat', '11:00 – 02:00'], ['Sunday', '12:00 – 22:00']],
    pin: { x: 58, y: 44 },
  },
  {
    key: 'les',
    name: 'Lower East Side',
    badge: 'Late night',
    address: ['88 Orchard St', 'New York, NY 10002'],
    phone: '(212) 555-0178',
    hours: [['Mon – Thu', '12:00 – 00:00'], ['Fri – Sat', '12:00 – 03:00'], ['Sunday', '12:00 – 23:00']],
    pin: { x: 30, y: 62 },
  },
];

export const faqs = [
  { q: 'Do you deliver?', a: 'Yes — order online for pickup, or get us through your usual delivery app within 2 miles of each shop.' },
  { q: 'Anything for non-beef eaters?', a: 'The Cluck Norris (fried chicken) and the Green Machine (black-bean patty) are built with the same love.' },
  { q: 'Gluten-free?', a: 'Any burger can come lettuce-wrapped. Fries are cooked in a dedicated fryer.' },
];

/* ---------- Navigation ---------- */
export const navLinks = [
  { label: 'Menu', href: '#menu' },
  { label: 'Burgers', href: '#burgers' },
  { label: 'Our Story', href: '#story' },
  { label: 'Locations', href: '#locations' },
];
