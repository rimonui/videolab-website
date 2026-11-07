// Each look is one model photo plus the pieces they wear.
// pin: where the tap-dot sits on the photo, in % of width/height.
// zoom: how far to zoom into the photo for the product thumbnail.
window.LOOKS = [
  {
    name: "Off-Duty White",
    photo: "images/look-1.jpg",
    items: [
      { id: "l1-tee", type: "Heavyweight Tee", name: "Boxy Tee 240", color: "Optic White", price: 38, pin: [48, 31], zoom: 3.2 },
      { id: "l1-jean", type: "Denim", name: "Carpenter Jean", color: "Mid Wash", price: 110, pin: [52, 70], zoom: 2.6 },
    ],
  },
  {
    name: "Indigo Hour",
    photo: "images/look-2.jpg",
    items: [
      { id: "l2-jacket", type: "Outerwear", name: "Trucker Jacket", color: "Raw Indigo", price: 145, pin: [41, 41], zoom: 3 },
      { id: "l2-tank", type: "Top", name: "Rib Tank", color: "Bone", price: 28, pin: [54, 37], zoom: 4 },
      { id: "l2-jean", type: "Denim", name: "Long Wide Jean", color: "Rinse", price: 120, pin: [55, 66], zoom: 2.6 },
      { id: "l2-heel", type: "Footwear", name: "Strap Sandal", color: "Black", price: 95, pin: [35, 83], zoom: 4 },
    ],
  },
  {
    name: "Concrete Weekend",
    photo: "images/look-3.jpg",
    items: [
      { id: "l3-shades", type: "Eyewear", name: "Slit Shades", color: "Smoke", price: 60, pin: [47, 12], zoom: 5 },
      { id: "l3-hood", type: "Fleece", name: "Script Hoodie", color: "Washed Black", price: 95, pin: [53, 37], zoom: 2.6 },
      { id: "l3-cargo", type: "Denim", name: "Cargo Jean", color: "Stone Grey", price: 125, pin: [56, 69], zoom: 2.4 },
      { id: "l3-sneak", type: "Footwear", name: "Court Low", color: "Chalk", price: 130, pin: [50, 94], zoom: 4.5 },
    ],
  },
  {
    name: "Light Commute",
    photo: "images/look-4.jpg",
    items: [
      { id: "l4-tee", type: "Top", name: "Easy Crew Tee", color: "White", price: 32, pin: [72, 33], zoom: 3.6 },
      { id: "l4-jean", type: "Denim", name: "Mom Jean", color: "Bleach Blue", price: 98, pin: [68, 56], zoom: 2.6 },
      { id: "l4-sneak", type: "Footwear", name: "Runner 01", color: "Cloud", price: 120, pin: [84, 81], zoom: 4 },
    ],
  },
  {
    name: "Cold Front",
    photo: "images/look-5.jpg",
    items: [
      { id: "l5-puffer", type: "Outerwear", name: "Quilted Liner", color: "Oat", price: 165, pin: [25, 37], zoom: 2.8 },
      { id: "l5-knit", type: "Knitwear", name: "Merino Roll Neck", color: "Moss", price: 110, pin: [56, 31], zoom: 2.8 },
      { id: "l5-jean", type: "Denim", name: "Slim Tapered Jean", color: "Ink", price: 105, pin: [53, 68], zoom: 2.6 },
      { id: "l5-boot", type: "Footwear", name: "Trail Boot", color: "Olive", price: 175, pin: [64, 90], zoom: 4 },
    ],
  },
  {
    name: "Bare Basics",
    photo: "images/look-6.jpg",
    items: [
      { id: "l6-tank", type: "Top", name: "Racer Tank", color: "White", price: 26, pin: [49, 34], zoom: 4 },
      { id: "l6-jean", type: "Denim", name: "Straight Ankle Jean", color: "Vintage Blue", price: 115, pin: [43, 69], zoom: 2.6 },
    ],
  },
];
