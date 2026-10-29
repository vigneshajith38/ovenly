export const products = [
  {
    id: '5',
    name: 'Customize Your Own Assorted Tin (Pick Any 3 Flavours)',
    price: 1350,
    category: 'cookie-tins',
    pieceCount: '12 Cookies (Tin)',
    pieces: 12,
    isCustomAssorted: true,
    assortedCapacity: 3,
    assortedFlavours: [
      'Signature Chocolate Chip',
      'Double Chocolate Fudge',
      'Red Velvet White Choc',
      'Biscoff Lotus Swirl',
      'Nutty Walnut Crunch',
      'Salted Caramel Crisp'
    ],
    description: 'Pick any 3 flavours from our Cookie Tin collection to create your personalized assorted keepsake tin!',
    longDescription: 'Choose any combination of 3 flavours from our handcrafted cookie tins. Beautifully packed in our signature golden-rimmed keepsake tin with luxury parchment and a satin ribbon. Perfect for gifting or sampling our best bakes!',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800',
    available: true,
    customisationOptions: []
  },
  {
    id: '1',
    name: 'Signature Chocolate Chip Cookie Tin',
    price: 1200,
    category: 'cookie-tins',
    pieceCount: '12 Cookies (Tin)',
    pieces: 12,
    description: 'Our classic, gooey, melt-in-your-mouth chocolate chip cookies packed in our beautiful signature tin. Perfect for gifting or treating yourself.',
    longDescription: 'Each tin contains 12 freshly baked cookies made with premium Belgian chocolate, browned butter, and a sprinkle of sea salt. Baked to order to ensure they arrive perfectly crisp on the edges and soft in the middle.',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=800',
    available: true,
    customisationOptions: ['Extra Choc Chips', 'Walnut Addition']
  },
  {
    id: '2',
    name: 'Double Chocolate Fudge Cookie Tin',
    price: 1300,
    category: 'cookie-tins',
    pieceCount: '10 Cookies (Tin)',
    pieces: 10,
    description: 'Rich, dark, and intensely chocolatey fudge cookies packed in our signature tin. For serious chocolate lovers.',
    longDescription: 'Made with 70% dark cocoa and chunks of white and milk chocolate, these cookies are essentially brownies in cookie form. Comes in our keepsake tin of 10.',
    image: 'https://images.unsplash.com/photo-1605666807758-39e144426dd3?auto=format&fit=crop&q=80&w=800',
    available: true,
    customisationOptions: []
  },
  {
    id: '6',
    name: 'Red Velvet White Choc Cookie Tin',
    price: 1250,
    category: 'cookie-tins',
    pieceCount: '10 Cookies (Tin)',
    pieces: 10,
    description: 'Crimson cocoa cookies packed with silky Belgian white chocolate chunks and a touch of vanilla in a gift tin.',
    longDescription: 'Rich crimson cocoa dough studded with melty Belgian white chocolate chunks. Crisp edges, gooey center, and breathtaking color.',
    image: 'https://images.unsplash.com/photo-1618923834413-2770b904ee10?auto=format&fit=crop&q=80&w=800',
    available: true,
    customisationOptions: []
  },
  {
    id: '7',
    name: 'Biscoff Lotus Swirl Cookie Tin',
    price: 1350,
    category: 'cookie-tins',
    pieceCount: '10 Cookies (Tin)',
    pieces: 10,
    description: 'Spiced caramel Lotus Biscoff cookies stuffed with molten Biscoff spread and biscuit crumb in a keepsake tin.',
    longDescription: 'Brown sugar dough laced with speculoos spices, filled with molten Lotus spread, and topped with crunchy Biscoff biscuit chunks.',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=800',
    available: true,
    customisationOptions: []
  },
  {
    id: '10',
    name: 'Customize Your Own Brownie Box (Box of 4)',
    price: 650,
    category: 'brownies',
    pieceCount: '4 Pieces (Box of 4)',
    pieces: 4,
    isCustomAssorted: true,
    assortedCapacity: 4,
    assortedFlavours: [
      'Signature Classic Fudge',
      'Toasted Walnut Brownie',
      'Salted Caramel Swirl Brownie'
    ],
    hasFlourChoice: true,
    flourOptions: ['Classic Maida', 'Healthy Ragi'],
    description: 'Pick any combination from our 3 signature brownie flavours to fill your 4-piece box. Choose your base: Classic Maida or Healthy Ragi!',
    longDescription: 'Create your personalized brownie box! Choose 4 pieces from our 3 signature flavours: Signature Classic Fudge, Toasted Walnut Brownie, and Salted Caramel Swirl Brownie. Handcrafted to order with 70% dark Belgian chocolate. Customize with your preferred flour base: Classic Maida or wholesome Healthy Ragi.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800',
    available: true,
    customisationOptions: []
  },
  {
    id: '11',
    name: 'Classic Fudgy Brownie Slab 500g (9 Pieces)',
    price: 850,
    category: 'brownies',
    pieceCount: '9 Pieces (500g Slab)',
    pieces: 9,
    weight: '500g',
    hasFlourChoice: true,
    flourOptions: ['Classic Maida', 'Healthy Ragi'],
    description: 'Thick, gooey 500g chocolate brownie slab pre-portioned into 9 generous fudgy squares. Choose Classic Maida or Healthy Ragi!',
    longDescription: 'A heavenly half-kilo (500g) slab of ultra-dense, fudgy dark chocolate brownies with our signature glossy crinkle top. Pre-cut into 9 sharing-size squares. Crafted with 70% dark Belgian cocoa and pure butter. Customize with your choice of Classic Maida or gluten-conscious Healthy Ragi flour base.',
    image: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?auto=format&fit=crop&q=80&w=800',
    available: true,
    customisationOptions: ['Warm & Fudgy', 'Extra Dark Chocolate Drizzle']
  },
  {
    id: '9',
    name: 'Fudge Walnut Brownie Box (6 Pieces)',
    price: 750,
    category: 'brownies',
    pieceCount: '6 Pieces',
    pieces: 6,
    hasFlourChoice: true,
    flourOptions: ['Classic Maida', 'Healthy Ragi'],
    description: 'Decadent, crackly-topped fudgy chocolate brownies loaded with toasted walnuts (Box of 6). Choose Classic Maida or Healthy Ragi!',
    longDescription: 'Made with 70% dark Belgian cocoa, roasted California walnuts, and browned butter. Intensely chocolatey with a melt-in-your-mouth chewy center and signature paper-thin crinkly crust. Comes in a gift box of 6 pieces. Select your flour base: Classic Maida or Healthy Ragi.',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&q=80&w=800',
    available: true,
    customisationOptions: ['Extra Choc Drizzle', 'Walnut Addition']
  },
  {
    id: '3',
    name: 'Assorted Cupcake Box (Set of 6)',
    price: 900,
    category: 'cupcakes',
    pieceCount: '6 Cupcakes',
    pieces: 6,
    description: 'A delightful assortment of our most popular cupcake flavours, beautifully boxed.',
    longDescription: 'Includes two Classic Vanilla, two Rich Chocolate, and two Red Velvet cupcakes, all topped with our signature silky buttercream frosting.',
    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=800',
    available: true,
    customisationOptions: []
  },
  {
    id: '4',
    name: 'Caramel Crunch Cupcakes (Set of 4)',
    price: 750,
    category: 'cupcakes',
    pieceCount: '4 Cupcakes',
    pieces: 4,
    description: 'Vanilla cupcakes with a hidden caramel centre, topped with salted caramel buttercream and crunchy brittle.',
    longDescription: 'The perfect balance of sweet and salty. These cupcakes feature a gooey handmade caramel filling that oozes out with every bite.',
    image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&q=80&w=800',
    available: true,
    customisationOptions: []
  }
];

// Configuration
export const config = {
  whatsappNumber: '919916693919',
  businessName: 'Ovenly'
};
