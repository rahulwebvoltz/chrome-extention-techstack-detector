import {
  Accessibility,
  Activity,
  Atom,
  BadgeDollarSign,
  BookOpen,
  Bot,
  Boxes,
  Briefcase,
  Bug,
  CalendarClock,
  ChartLine,
  ClipboardList,
  Cloud,
  Code2,
  Compass,
  Container,
  Cookie,
  CreditCard,
  Database,
  FileText,
  Fingerprint,
  FlaskConical,
  Gauge,
  Gift,
  Globe,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Images,
  Languages,
  Layers,
  LayoutTemplate,
  Mail,
  Map,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Network,
  Newspaper,
  Package,
  Paintbrush,
  Palette,
  PenLine,
  Plug,
  Puzzle,
  Radio,
  RotateCcw,
  Search,
  Server,
  Shapes,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Tags,
  Ticket,
  ToggleRight,
  Truck,
  Type,
  UserCog,
  Users,
  Utensils,
  Video,
  Wrench
} from "lucide-react";

const ICONS = {
  cms: Newspaper,
  pageBuilder: LayoutTemplate,
  ecommerce: ShoppingCart,
  payments: CreditCard,
  framework: Atom,
  library: Package,
  ui: Palette,
  fonts: Type,
  wpTheme: Paintbrush,
  wpPlugin: Plug,
  seo: Search,
  caching: Gauge,
  analytics: ChartLine,
  tagManager: Tags,
  marketing: Mail,
  advertising: BadgeDollarSign,
  video: Video,
  maps: Map,
  geolocation: MapPin,
  chat: MessageCircle,
  widgets: Puzzle,
  consent: Cookie,
  security: ShieldCheck,
  monitoring: Activity,
  cdn: Globe,
  hosting: Cloud,
  baas: Database,
  server: Server,
  backend: Boxes,
  language: Code2,
  database: Database,
  build: Wrench,
  misc: Sparkles
};

// Categories that only exist in the imported Wappalyzer pack ("wa-<id>").
const PACK_ICONS = {
  "wa-2": MessagesSquare, // Message boards
  "wa-4": BookOpen, // Documentation
  "wa-7": Images, // Photo galleries
  "wa-13": Bug, // Issue trackers
  "wa-20": PenLine, // Editors
  "wa-21": GraduationCap, // LMS
  "wa-24": Type, // Rich text editors
  "wa-25": Shapes, // JavaScript graphics
  "wa-26": Smartphone, // Mobile frameworks
  "wa-29": Search, // Search engines
  "wa-53": Users, // CRM
  "wa-58": Compass, // User onboarding
  "wa-60": Container, // Containers
  "wa-65": Network, // Load balancers
  "wa-68": Accessibility, // Accessibility
  "wa-71": Handshake, // Affiliate programs
  "wa-72": CalendarClock, // Appointment scheduling
  "wa-73": ClipboardList, // Surveys
  "wa-74": FlaskConical, // A/B Testing
  "wa-76": UserCog, // Personalisation
  "wa-83": Fingerprint, // Browser fingerprinting
  "wa-84": Gift, // Loyalty & rewards
  "wa-85": ToggleRight, // Feature management
  "wa-89": Languages, // Translation
  "wa-90": Star, // Reviews
  "wa-93": Utensils, // Reservations & delivery
  "wa-94": Gift, // Referral marketing
  "wa-97": Database, // Customer data platform
  "wa-99": Truck, // Shipping carriers
  "wa-100": ShoppingBag, // Shopify apps
  "wa-101": Briefcase, // Recruitment & staffing
  "wa-102": RotateCcw, // Returns
  "wa-103": Radio, // Livestreaming
  "wa-104": Ticket, // Ticket booking
  "wa-108": Store, // Ecommerce frontends
  "wa-110": FileText, // Form builders
  "wa-111": HeartHandshake, // Fundraising & donations
  "wa-112": Bot // Artificial Intelligence
};

// Keep this map in sync with CATEGORIES (checked by tests/regression.test.js).
export const CATEGORY_ICON_IDS = Object.keys(ICONS);
export const categoryIcon = (id) => ICONS[id] ?? PACK_ICONS[id] ?? Layers;
