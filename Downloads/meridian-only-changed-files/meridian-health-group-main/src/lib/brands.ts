import novavit from "@/assets/brand-novavit.jpg";
import pureskin from "@/assets/brand-pureskin.jpg";
import dentapro from "@/assets/brand-dentapro.jpg";
import calmrest from "@/assets/brand-calmrest.jpg";
import kidsglow from "@/assets/brand-kidsglow.jpg";

export type Product = {
  name: string;
  tagline: string;
  description: string;
  price: number;
  currency: string;
  sku: string;
  packSize: string;
  details: string[];
};

export type Brand = {
  slug: string;
  name: string;
  monogram: string;
  category: string;
  tagline: string;
  short: string;
  description: string;
  image: string;
  accent: string; // hex used for brand accent
  heroVideo: string;
  story: string;
  categories: string[];
  products: Product[];
  keywords: string[];
};

export const BRANDS: Brand[] = [
  {
    slug: "novavit",
    name: "NovaVit",
    monogram: "Nv",
    category: "Vitamins & Supplements",
    tagline: "Everyday energy, scientifically dosed.",
    short: "Daily vitamins and mineral complexes formulated by clinicians.",
    description:
      "NovaVit blends pharmaceutical-grade actives with rigorously tested bioavailability — built for people who refuse to compromise on what they put in their body.",
    image: novavit,
    accent: "#61C7BE",
    heroVideo:
      "https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4",
    story:
      "Born inside a Geneva pharmacy in 2012, NovaVit pioneered single-dose blister vitamins for travellers. A decade later, the brand serves 38 markets with a portfolio engineered for performance, immunity, and longevity.",
    categories: ["Daily Wellness", "Immunity", "Performance", "Longevity"],
    products: [
      {
        name: "NovaVit Multi 50+",
        price: 18,
        currency: "USD",
        sku: "NV-M50",
        packSize: "60 tablets",
        tagline: "Comprehensive daily complex",
        description: "23 essential micronutrients calibrated for adults over 50.",
        details: [
          "Methylated B-complex for cognitive support",
          "Vitamin K2 (MK-7) for bone and arterial health",
          "Chelated minerals for superior absorption",
        ],
      },
      {
        name: "NovaVit Immuno Shield",
        price: 22,
        currency: "USD",
        sku: "NV-IMS",
        packSize: "30 capsules",
        tagline: "Year-round immune defence",
        description: "Vitamin C, D3, zinc and elderberry in a fast-release capsule.",
        details: [
          "Clinically dosed 1000mg buffered Vitamin C",
          "2000 IU Vitamin D3 from lichen (vegan)",
          "Standardised elderberry extract 17%",
        ],
      },
      {
        name: "NovaVit Endurance",
        price: 26,
        currency: "USD",
        sku: "NV-END",
        packSize: "20 sachets",
        tagline: "Sport performance complex",
        description: "Electrolytes, adaptogens and B-vitamins for athletes.",
        details: [
          "Rhodiola Rosea 3% rosavins",
          "Magnesium bisglycinate 400mg",
          "NSF Certified for Sport",
        ],
      },
    ],
    keywords: ["vitamins", "supplements", "immunity", "multivitamin", "wellness"],
  },
  {
    slug: "pureskin",
    name: "Pureskin",
    monogram: "Ps",
    category: "Dermaceutical Skincare",
    tagline: "Clinical care, sensorial finish.",
    short: "Dermatologist-developed serums, cleansers and barrier creams.",
    description:
      "Pureskin sits at the intersection of dermatology and luxury — minimal formulas, maximal evidence, designed for sensitive and reactive skin.",
    image: pureskin,
    accent: "#E7D7C9",
    heroVideo:
      "https://videos.pexels.com/video-files/3997798/3997798-uhd_2560_1440_25fps.mp4",
    story:
      "Founded by a São Paulo dermatologist tired of compromise, Pureskin formulates without fragrance, dyes or unnecessary actives. Every product is tested on reactive panels before launch.",
    categories: ["Cleansers", "Serums", "Moisturisers", "Sun Protection"],
    products: [
      {
        name: "Pureskin Barrier Serum",
        price: 34,
        currency: "USD",
        sku: "PS-BAR",
        packSize: "30 ml",
        tagline: "Ceramide repair concentrate",
        description: "5% ceramide complex with niacinamide and panthenol.",
        details: [
          "Restores compromised skin barrier in 14 days",
          "Fragrance-free, allergen-free",
          "Suitable post-procedure",
        ],
      },
      {
        name: "Pureskin Mineral SPF 50",
        price: 29,
        currency: "USD",
        sku: "PS-SPF50",
        packSize: "50 ml",
        tagline: "Daily broad-spectrum shield",
        description: "100% mineral filter, invisible on all skin tones.",
        details: [
          "Non-nano zinc oxide 20%",
          "Reef-safe, biodegradable",
          "Tested across Fitzpatrick I–VI",
        ],
      },
      {
        name: "Pureskin Calm Cleanser",
        price: 21,
        currency: "USD",
        sku: "PS-CLC",
        packSize: "150 ml",
        tagline: "Gentle daily wash",
        description: "Sulfate-free milk cleanser for reactive skin.",
        details: [
          "pH 5.5 to match skin",
          "Removes SPF and makeup in one pass",
          "Dermatologically tested",
        ],
      },
    ],
    keywords: ["skincare", "dermatology", "serum", "spf", "barrier cream"],
  },
  {
    slug: "dentapro",
    name: "Dentapro",
    monogram: "Dp",
    category: "Oral Health",
    tagline: "Clinical clean. Every day.",
    short: "Toothpastes, rinses and interdental care developed with dentists.",
    description:
      "Dentapro pairs enamel-safe abrasives with active fluoride chemistry, formulated alongside a network of 400 practising dentists across Europe and Asia.",
    image: dentapro,
    accent: "#8FC8E8",
    heroVideo:
      "https://videos.pexels.com/video-files/4124482/4124482-uhd_2560_1440_25fps.mp4",
    story:
      "Dentapro began as a clinic-only line in Seoul in 2008. Today it is the third most-recommended oral care brand by general dentists in five OECD markets.",
    categories: ["Toothpaste", "Mouthwash", "Interdental", "Sensitivity"],
    products: [
      {
        name: "Dentapro Enamel Pro",
        price: 8,
        currency: "USD",
        sku: "DP-ENP",
        packSize: "100 ml",
        tagline: "Daily fluoride toothpaste",
        description: "1450ppm fluoride with hydroxyapatite for enamel resilience.",
        details: [
          "Low-abrasion RDA 70",
          "Mint-free option available",
          "Clinically proven 23% reduction in caries risk",
        ],
      },
      {
        name: "Dentapro Sensitive Relief",
        price: 9,
        currency: "USD",
        sku: "DP-SEN",
        packSize: "100 ml",
        tagline: "Fast-acting comfort",
        description: "Potassium nitrate and arginine for exposed dentine.",
        details: [
          "Relief from sensitivity in 60 seconds",
          "Dentist-recommended formula",
          "Gentle whitening polish",
        ],
      },
      {
        name: "Dentapro Clinical Rinse",
        price: 12,
        currency: "USD",
        sku: "DP-RIN",
        packSize: "500 ml",
        tagline: "Alcohol-free daily mouthwash",
        description: "Chlorhexidine-free antibacterial wash for daily use.",
        details: [
          "Reduces plaque by 41% in 4 weeks",
          "Suitable for orthodontic patients",
          "Cool mint, no burn",
        ],
      },
    ],
    keywords: ["toothpaste", "oral care", "dental", "mouthwash", "sensitivity"],
  },
  {
    slug: "calmrest",
    name: "Calmrest",
    monogram: "Cr",
    category: "Sleep & Wellness",
    tagline: "The night, redesigned.",
    short: "Sleep aids, magnesium and mindful evening rituals.",
    description:
      "Calmrest formulates non-habit-forming sleep support — botanical extracts, micronised magnesium and quiet rituals that work with the body, not against it.",
    image: calmrest,
    accent: "#C9B6E4",
    heroVideo:
      "https://videos.pexels.com/video-files/3199284/3199284-uhd_2560_1440_25fps.mp4",
    story:
      "Calmrest was developed with sleep scientists at the Copenhagen Centre for Circadian Health. Every product is built around chronobiology, not just sedation.",
    categories: ["Sleep Support", "Stress & Mood", "Relaxation", "Recovery"],
    products: [
      {
        name: "Calmrest Night Complex",
        price: 24,
        currency: "USD",
        sku: "CR-NGT",
        packSize: "30 capsules",
        tagline: "Botanical sleep formula",
        description: "Valerian, passionflower and L-theanine for deeper sleep.",
        details: [
          "Non-habit-forming, melatonin-free option",
          "Awarded best-in-class by EU sleep panel 2024",
          "Suitable for nightly use",
        ],
      },
      {
        name: "Calmrest Magnesium Glycinate",
        price: 19,
        currency: "USD",
        sku: "CR-MAG",
        packSize: "60 tablets",
        tagline: "Evening mineral",
        description: "Chelated magnesium for muscle and nervous system recovery.",
        details: [
          "400mg elemental magnesium",
          "Gentle on digestion",
          "Third-party purity tested",
        ],
      },
      {
        name: "Calmrest Pillow Mist",
        price: 16,
        currency: "USD",
        sku: "CR-PIL",
        packSize: "100 ml",
        tagline: "Bedtime ritual",
        description: "Lavender, vetiver and chamomile essential oil blend.",
        details: [
          "Cold-pressed essential oils",
          "Recycled glass, refillable",
          "Made in small batches",
        ],
      },
    ],
    keywords: ["sleep", "magnesium", "wellness", "stress", "relaxation"],
  },
  {
    slug: "kidsglow",
    name: "KidsGlow",
    monogram: "Kg",
    category: "Children Nutrition",
    tagline: "Growing up, properly fed.",
    short: "Pediatrician-developed vitamins and nutrition for kids 3–12.",
    description:
      "KidsGlow makes the daily essentials children actually need — built with paediatricians, made for parents who read labels.",
    image: kidsglow,
    accent: "#F4B6A6",
    heroVideo:
      "https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4",
    story:
      "KidsGlow was founded by two paediatricians who couldn't find a children's vitamin they'd give their own kids. Today, KidsGlow is the leading clean-label children's nutrition brand across Southeast Asia.",
    categories: ["Multivitamins", "Immunity", "Brain & Focus", "Bone Growth"],
    products: [
      {
        name: "KidsGlow Daily Gummies",
        price: 15,
        currency: "USD",
        sku: "KG-GUM",
        packSize: "60 gummies",
        tagline: "Multivitamin gummies (3+)",
        description: "12 essential vitamins, no added sugar, real fruit flavour.",
        details: [
          "Sugar-free, sweetened with stevia",
          "No artificial colours",
          "Pectin-based (vegetarian)",
        ],
      },
      {
        name: "KidsGlow Omega-3 Drops",
        price: 17,
        currency: "USD",
        sku: "KG-OMG",
        packSize: "30 ml",
        tagline: "Brain & vision support",
        description: "Algal omega-3 DHA drops with natural orange flavour.",
        details: [
          "Sustainably sourced from algae",
          "Heavy-metal tested",
          "Ages 1+",
        ],
      },
      {
        name: "KidsGlow Bone Builder",
        price: 14,
        currency: "USD",
        sku: "KG-BON",
        packSize: "30 chews",
        tagline: "Calcium & Vitamin D3 chews",
        description: "Daily calcium and Vitamin D3 for healthy growth.",
        details: [
          "Highly bioavailable calcium citrate",
          "Lactose-free",
          "Tropical fruit flavour",
        ],
      },
    ],
    keywords: ["kids vitamins", "children nutrition", "omega 3", "calcium", "immunity"],
  },
];

export const getBrand = (slug: string) => BRANDS.find((b) => b.slug === slug);
