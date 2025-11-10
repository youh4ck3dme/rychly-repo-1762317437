export type Screen =
  | "welcome"
  | "upload"
  | "analysis"
  | "results"
  | "virtual-try-on";

export type Tab = "home" | "virtual-try-on" | "explore" | "services" | "about";

export type ConsultationStyle =
  | "classic"
  | "trendy"
  | "bold"
  | "lowMaintenance"
  | "glamorous"
  | "bohemian"
  | "artDeco"
  | "futuristic";

export type HairstylePreference =
  | "keep"
  | "bob"
  | "longLayers"
  | "pixie"
  | "wavyLob"
  | "shaggyBob"
  | "butterflyCut"
  | "wolfCut"
  | "italianBob"
  | "bixieCut"
  | "octopusCut"
  | "curveCut"
  | "modernMullet"
  | "birkinBangs"
  | "hushCut";

export interface HairSuggestion {
  name: string;
  hairstyle: string;
  hex: string;
  description: string;
  services: string[];
}

export interface HairAnalysisResult {
  currentHair: {
    color: string;
    condition: string;
    type: string;
  };
  suggestions: HairSuggestion[];
}

export interface ServiceItem {
  name: string;
  price: string;
}

export interface ServiceSubcategory {
  name: string;
  items: ServiceItem[];
}

export interface ServiceCategory {
  nameKey: string;
  subcategories: ServiceSubcategory[];
}

export interface HairColorTrend {
  name: string;
  description: string;
  imageUrl: string;
}

export interface HairstyleTrend {
  name: string;
  description: string;
  gender: "Male" | "Female";
  imageUrl: string;
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  distance: string;
  image: string;
  phone: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface BlogPost {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  imageUrl: string;
}

// Hair Analysis API Types
export interface HairAnalysisRecommendation {
  type: "strih" | "farba" | "styling" | "starostlivost";
  title: string;
  description: string;
  difficulty?: "easy" | "medium" | "hard";
  maintenance?: "low" | "medium" | "high";
}

export interface HairAnalysisResponse {
  hairType: string;
  condition: string;
  faceShape?: string;
  recommendations: HairAnalysisRecommendation[];
  confidence: number;
  language: string;
  note?: string;
}

export interface HairAnalysisRequest {
  imageUrl: string;
  locale?: "sk" | "en";
}

export interface VirtualTryOnRequest {
  userImage: string;
  suggestion: HairSuggestion;
}

export interface VirtualTryOnResponse {
  image: string;
  confidence?: number;
  method: "ai" | "fallback";
  processingTime?: number;
  note?: string;
}

export interface HairPreviewRequest {
  imageUrl: string;
  style?: string;
  color?: string;
}

export interface HairPreviewResponse {
  previewImage: string;
  confidence: number;
  method: "ai" | "fallback";
  processingTime?: number;
  suggestions?: string[];
  note?: string;
}

export interface HairSuggestRequest {
  hairType?: string;
  faceShape?: string;
  preferences?: {
    length?: string;
    colorPreference?: "natural" | "bold" | "warm" | "cool";
    condition?: string;
  };
  occasion?: string;
}

export interface HairSuggestResponse {
  suggestions: Array<{
    type: "style" | "color" | "care";
    content: string;
  }>;
  confidence: number;
  method: "ai" | "fallback";
  personalized: boolean;
  totalSuggestions: number;
  note?: string;
}
