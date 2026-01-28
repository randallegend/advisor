import type { StrategistUI } from "@/lib/types";

export const STRATEGISTS: StrategistUI[] = [
  {
    id: "ian",
    name: "Ian",
    title: "Performance Strategist",
    description: "Data-obsessed, conversion-focused. Optimizes every dollar for ROI.",
    gradient: "from-[#0891B2] to-[#06B6D4]",
    bgColor: "bg-[#0891B2]",
    lightBg: "bg-[#ECFEFF]",
    textColor: "text-[#0891B2]",
    primaryHex: "#0891B2",
    secondaryHex: "#06B6D4",
    icon: "📊",
    avatar: "/assets/images/ian_avatar.png",
  },
  {
    id: "mart",
    name: "Mart",
    title: "Brand Growth Strategist",
    description: "Creative storyteller. Builds awareness and emotional connections.",
    gradient: "from-[#701AC0] to-[#8A2BE2]",
    bgColor: "bg-[#701AC0]",
    lightBg: "bg-[#F0E5FC]",
    textColor: "text-[#701AC0]",
    primaryHex: "#701AC0",
    secondaryHex: "#8A2BE2",
    icon: "🎨",
    avatar: "/assets/images/mart_avatar.png",
  },
  {
    id: "randall",
    name: "Randall",
    title: "Data-Driven Strategist",
    description: "Analytics wizard. Finds insights in numbers and trends.",
    gradient: "from-[#10B981] to-[#34D399]",
    bgColor: "bg-[#10B981]",
    lightBg: "bg-[#ECFDF5]",
    textColor: "text-[#10B981]",
    primaryHex: "#10B981",
    secondaryHex: "#34D399",
    icon: "🔬",
    avatar: "/assets/images/randall_avatar.png",
  },
];

export const EXAMPLE_PROMPTS = [
  "Create campaign for Mother's Day sales for local flower shop in Seattle",
  "Launch awareness campaign for eco-friendly skincare brand targeting Gen Z",
  "Drive app downloads for fitness app during New Year resolution season",
];

export function getStrategistById(id: string): StrategistUI | undefined {
  return STRATEGISTS.find((s) => s.id === id);
}
