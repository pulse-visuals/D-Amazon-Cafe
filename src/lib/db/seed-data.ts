// Central source of truth for the D'Amazon Cafe menu.
// Prices are written here in RM for readability; the seed script converts to sen (RM * 100).

export type SeedVariant = { name: string; price: number };
export type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  price?: number; // used when no variants
  variants?: SeedVariant[];
  addOns?: boolean; // true = allow the standard nasi-lemak add-on set
  featured?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  soldOut?: boolean;
  image?: string; // path under /public, e.g. "/images/products/foo.jpg"
};

export type SeedCategory = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  subgroups?: { key: string; label: string; products: SeedProduct[] }[];
  products?: SeedProduct[];
};

export const STANDARD_ADDONS = [
  { slug: "extra-sambal", name: "Extra Sambal", price: 1.5 },
  { slug: "extra-rice", name: "Extra Rice", price: 2.0 },
  { slug: "extra-egg", name: "Extra Egg", price: 1.5 },
  { slug: "extra-chicken", name: "Extra Chicken", price: 5.0 },
  { slug: "extra-beef", name: "Extra Beef", price: 6.0 },
];

export const CATEGORIES: SeedCategory[] = [
  {
    slug: "nasi-lemak",
    name: "Nasi Lemak",
    description: "Malaysia's beloved coconut rice, served the D'Amazon way with sambal, egg, anchovies and peanuts.",
    icon: "🍚",
    products: [
      { slug: "nasi-lemak-biasa", name: "Nasi Lemak Biasa", description: "Fragrant coconut rice with sambal, fried anchovies, peanuts, cucumber and a boiled egg.", price: 7.9, addOns: true, bestSeller: true },
      { slug: "nasi-lemak-ayam-berempah", name: "Nasi Lemak Ayam Berempah", description: "Coconut rice with crispy spiced fried chicken, sambal and traditional accompaniments.", price: 14.9, addOns: true, image: "/images/products/nasi-lemak-ayam-berempah.jpg" },
      { slug: "nasi-lemak-ayam-rendang", name: "Nasi Lemak Ayam Rendang", description: "Coconut rice paired with slow-cooked rendang chicken in rich spiced coconut gravy.", price: 14.9, addOns: true, bestSeller: true, featured: true, image: "/images/products/ayam-rendang.jpg" },
      { slug: "nasi-lemak-daging-rendang", name: "Nasi Lemak Daging Rendang", description: "Coconut rice with tender beef rendang simmered in aromatic spices.", price: 14.9, addOns: true, image: "/images/products/daging-rendang.jpg" },
      { slug: "nasi-ayam-rendang", name: "Nasi Ayam Rendang", description: "Steamed rice served with rich, slow-cooked rendang chicken.", price: 14.9, addOns: true, image: "/images/products/ayam-rendang.jpg" },
      { slug: "nasi-ayam-masak-merah", name: "Nasi Ayam Masak Merah", description: "Steamed rice with chicken braised in a sweet and spicy tomato-chilli sauce.", price: 14.9, addOns: true, image: "/images/products/nasi-ayam-masak-merah.jpg" },
      { slug: "nasi-ayam-masak-lemak-cili-padi", name: "Nasi Ayam Masak Lemak Cili Padi", description: "Steamed rice with chicken in creamy coconut gravy and fiery bird's eye chilli.", price: 14.9, addOns: true, image: "/images/products/nasi-ayam-masak-lemak-cili-padi.jpg" },
      { slug: "nasi-kari-ayam", name: "Nasi Kari Ayam", description: "Steamed rice with chicken curry simmered in a fragrant spiced coconut sauce.", price: 14.9, addOns: true, image: "/images/products/nasi-kari-ayam.jpg" },
      { slug: "nasi-daging-rendang", name: "Nasi Daging Rendang", description: "Steamed rice with tender beef rendang, slow-cooked in traditional spices.", price: 14.9, addOns: true, image: "/images/products/daging-rendang.jpg" },
      { slug: "nasi-daging-masak-hitam", name: "Nasi Daging Masak Hitam", description: "Steamed rice with beef braised in a dark, savoury soy-spice sauce.", price: 14.9, addOns: true, image: "/images/products/nasi-daging-masak-hitam.jpg" },
      { slug: "nasi-daging-masak-lemak-cili-padi", name: "Nasi Daging Masak Lemak Cili Padi", description: "Steamed rice with beef in creamy coconut gravy and bird's eye chilli.", price: 14.9, addOns: true, image: "/images/products/nasi-daging-masak-lemak-cili-padi.jpg" },
      { slug: "nasi-ikan-tenggiri-asam-pedas", name: "Nasi Ikan Tenggiri Asam Pedas", description: "Steamed rice with Spanish mackerel in a tangy, spicy tamarind-chilli broth.", price: 14.9, addOns: true, image: "/images/products/nasi-ikan-tenggiri-asam-pedas.jpg" },
    ],
  },
  {
    slug: "coffee-drinks",
    name: "Coffee & Drinks",
    description: "Freshly brewed coffee, tropical refreshers and comforting local favourites.",
    icon: "☕",
    subgroups: [
      {
        key: "coffee",
        label: "Coffee",
        products: [
          { slug: "single-espresso", name: "Single Espresso", description: "A concentrated shot of rich, aromatic espresso.", variants: [{ name: "Hot", price: 9.0 }, { name: "Iced", price: 10.9 }] },
          { slug: "espresso-lemon-spritz", name: "Espresso Lemon Spritz", description: "Espresso shaken with fresh lemon and soda for a bright, zesty lift.", price: 16.9, isNew: true },
          { slug: "espresso-doppio", name: "Espresso Doppio", description: "A double shot of espresso for a bolder coffee experience.", variants: [{ name: "Hot", price: 16.9 }, { name: "Iced", price: 18.9 }] },
          { slug: "americano", name: "Americano", description: "Espresso lengthened with hot or cold water for a smooth, clean finish.", variants: [{ name: "Hot", price: 12.9 }, { name: "Iced", price: 13.9 }] },
          { slug: "latte", name: "Latte", description: "Espresso with silky steamed milk.", variants: [{ name: "Hot", price: 12.9 }, { name: "Iced", price: 14.0 }] },
          { slug: "spanish-latte", name: "Spanish Latte", description: "Espresso with condensed and steamed milk for a sweet, creamy cup.", variants: [{ name: "Hot", price: 13.9 }, { name: "Iced", price: 15.0 }], bestSeller: true },
          { slug: "hazelnut-latte", name: "Hazelnut Latte", description: "Latte infused with roasted hazelnut syrup.", variants: [{ name: "Hot", price: 13.9 }, { name: "Iced", price: 15.0 }] },
          { slug: "cappuccino", name: "Cappuccino", description: "Espresso topped with a thick layer of velvety milk foam.", variants: [{ name: "Hot", price: 12.9 }, { name: "Iced", price: 14.0 }] },
          { slug: "flat-white", name: "Flat White", description: "Espresso with a thinner layer of micro-foamed milk for a stronger coffee taste.", variants: [{ name: "Hot", price: 13.9 }, { name: "Iced", price: 15.0 }] },
          { slug: "mocha", name: "Mocha", description: "Espresso, chocolate and steamed milk — the best of both worlds.", variants: [{ name: "Hot", price: 15.9 }, { name: "Iced", price: 16.5 }] },
          { slug: "hot-chocolate", name: "Hot Chocolate", description: "Rich, comforting chocolate made with steamed milk.", variants: [{ name: "Hot", price: 12.0 }, { name: "Iced", price: 14.0 }] },
          { slug: "milo", name: "Milo", description: "The Malaysian classic malt chocolate drink, served hot or iced.", variants: [{ name: "Hot", price: 5.5 }, { name: "Iced", price: 5.5 }] },
          { slug: "ipoh-white-coffee", name: "Ipoh White Coffee", description: "Smooth, mellow white coffee inspired by the Ipoh tradition.", variants: [{ name: "Hot", price: 4.5 }, { name: "Iced", price: 5.0 }] },
          { slug: "cameron-tea-tarik", name: "Cameron Tea Tarik", description: "Frothy pulled milk tea brewed with Cameron Highlands tea leaves.", variants: [{ name: "Hot", price: 4.5 }, { name: "Iced", price: 5.0 }] },
          { slug: "iced-lemon-tea", name: "Iced Lemon Tea", description: "Refreshing black tea with fresh lemon, served over ice.", price: 6.9 },
        ],
      },
      {
        key: "refreshing-drinks",
        label: "Refreshing Drinks",
        products: [
          { slug: "fresh-lemonade", name: "Fresh Lemonade", description: "Freshly squeezed lemonade, choose it still or with a sparkling fizz.", variants: [{ name: "Normal", price: 4.0 }, { name: "Sparkling", price: 6.9 }] },
          { slug: "vinto-lemon", name: "Vinto Lemon", description: "A vibrant lemon refresher with a hint of berry.", variants: [{ name: "Normal", price: 6.9 }, { name: "Sparkling", price: 8.0 }] },
          { slug: "syrup-limau", name: "Syrup Limau", description: "Classic Malaysian lime syrup drink — sweet, sour and cooling.", variants: [{ name: "Normal", price: 6.9 }, { name: "Sparkling", price: 7.9 }] },
        ],
      },
    ],
  },
  {
    slug: "combo-deals",
    name: "Combo Deals",
    description: "Great value combos, made to share (or not).",
    icon: "🍟",
    products: [
      { slug: "combo-special", name: "Combo Special", description: "French Fries + Lemonade Drink. Crispy • Refreshing • Perfect Combo.", price: 12.9, featured: true, bestSeller: true, image: "/images/products/combo-special.jpg" },
    ],
  },
  {
    slug: "desserts",
    name: "Desserts",
    description: "Indulgent pastries, cakes and sweet treats baked for the perfect ending.",
    icon: "🥐",
    products: [
      { slug: "butter-croissant", name: "Butter Croissant", description: "Flaky, buttery, all-day classic French croissant.", price: 8.0, image: "/images/products/butter-croissant.jpg" },
      { slug: "chocolate-croissant", name: "Chocolate Croissant", description: "Buttery croissant filled with rich dark chocolate.", price: 10.0, bestSeller: true },
      { slug: "pistachio-croissant", name: "Pistachio Croissant", description: "Croissant filled and topped with silky pistachio cream.", price: 10.0 },
      { slug: "biscoff-croissant", name: "Biscoff Croissant", description: "Croissant filled with creamy Biscoff spread and crumbs.", price: 12.0, isNew: true },
      { slug: "chocolate-roll-danish", name: "Chocolate Roll Danish", description: "Flaky Danish pastry rolled with layers of chocolate.", price: 13.9, image: "/images/products/chocolate-roll-danish.jpg" },
      { slug: "banana-chocolate-chip-muffin", name: "Banana Chocolate Chip Muffin", description: "Moist banana muffin studded with chocolate chips.", price: 12.9 },
      { slug: "double-chocolate-muffin", name: "Double Chocolate Muffin", description: "Rich chocolate muffin loaded with chocolate chips.", price: 12.9, image: "/images/products/double-chocolate-muffin.jpg" },
      { slug: "butter-scotch-muffin", name: "Butter Scotch Muffin", description: "Soft muffin swirled with buttery scotch caramel.", price: 10.9, image: "/images/products/butter-scotch-muffin.jpg" },
      { slug: "chocolate-hazelnut-tart", name: "Chocolate Hazelnut Tart", description: "Crisp tart shell filled with silky chocolate hazelnut ganache.", price: 15.9, soldOut: true },
      { slug: "chocolate-donut", name: "Chocolate Donut", description: "Soft donut glazed with rich chocolate.", price: 12.9, image: "/images/products/chocolate-donut.jpg" },
      { slug: "dark-chocolate-kunafa-donut", name: "Dark Chocolate Kunafa Donut", description: "Donut filled with crispy kunafa and dark chocolate.", price: 12.9, isNew: true },
      { slug: "strawberry-donut", name: "Strawberry Donut", description: "Soft donut glazed with sweet strawberry icing.", price: 11.9 },
      { slug: "strawberry-cheese-cake", name: "Strawberry Cheese Cake", description: "Creamy baked cheesecake topped with fresh strawberry compote.", price: 17.9 },
      { slug: "biscoff-cheese-cake-slice", name: "Biscoff Cheese Cake Slice", description: "Creamy cheesecake layered with Biscoff biscuit and spread.", price: 17.9 },
      { slug: "chocolate-indulgence-cake-slice", name: "Chocolate Indulgence Cake Slice", description: "Decadent layered chocolate cake for true chocolate lovers.", price: 17.9, bestSeller: true },
      { slug: "red-velvet-cake-slice", name: "Red Velvet Cake Slice", description: "Classic red velvet layered with cream cheese frosting.", price: 17.9 },
      { slug: "tiramisu-cake-slice", name: "Tiramisu Cake Slice", description: "Espresso-soaked layers with mascarpone cream, dusted with cocoa.", price: 17.9, bestSeller: true },
    ],
  },
  {
    slug: "appetizers",
    name: "Appetizers & Western",
    description: "Comforting Western favourites — pies, pasta, sandwiches and bakes.",
    icon: "🥪",
    products: [
      { slug: "steak-cheese-sandwich", name: "Steak & Cheese Sandwich", description: "Grilled steak and melted cheese stacked in toasted artisan bread.", price: 16.9, featured: true },
      { slug: "black-pepper-chicken-pie", name: "Black Pepper Chicken Pie", description: "Flaky puff pastry filled with black pepper chicken.", price: 12.0 },
      { slug: "chicken-mushroom-pie", name: "Chicken Mushroom Pie", description: "Golden pastry filled with creamy chicken and mushroom.", price: 12.0 },
      { slug: "lamb-pie", name: "Lamb Pie", description: "Rich, slow-cooked lamb encased in buttery pastry.", price: 14.0 },
      { slug: "beef-stew-pie", name: "Beef Stew Pie", description: "Hearty beef stew baked in a flaky golden crust.", price: 12.0 },
      { slug: "baked-mac-cheese", name: "Baked Mac & Cheese", description: "Creamy baked macaroni loaded with melted cheese.", price: 14.0 },
      { slug: "korean-mac-cheese", name: "Korean Mac & Cheese", description: "Baked mac & cheese with a spicy Korean-inspired kick.", price: 15.0, isNew: true },
      { slug: "spaghetti-carbonara", name: "Spaghetti Carbonara", description: "Classic creamy carbonara with smoky bits and parmesan.", price: 14.0 },
      { slug: "spaghetti-bolognese", name: "Spaghetti Bolognese", description: "Spaghetti tossed in a rich, slow-simmered meat sauce.", price: 14.0 },
      { slug: "beef-lasagna", name: "Beef Lasagna", description: "Layered pasta baked with beef ragu, cheese and béchamel.", price: 14.0, bestSeller: true },
      { slug: "chicken-lasagna", name: "Chicken Lasagna", description: "Layered pasta baked with creamy chicken and cheese.", price: 14.0 },
    ],
  },
];
