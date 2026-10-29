import React from "react";
import {
  Lightbulb,
  House,
  Megaphone,
  Trees,
  Trash,
  OctagonMinus,
  Droplets,
  HelpCircle
} from "lucide-react";

/**
 * Official Lucide Faucet icon SVG (from lucide.dev/icons/faucet)
 */
export function Faucet({ size = 24, className = "", strokeWidth = 2, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M10.083 5.428 5.57 4.083a2 2 0 1 0 .001 3.834l4.513-1.345" />
      <path d="M16 11h-5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2Z" />
      <path d="M13.5 11V6.5a2.5 2.5 0 0 0-5 0V11" />
      <path d="M13.5 17v3.5a1.5 1.5 0 0 1-3 0V17" />
    </svg>
  );
}

/**
 * Official Lucide Road icon SVG (from lucide.dev/icons/road)
 */
export function Road({ size = 24, className = "", strokeWidth = 2, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 17v4" />
      <path d="M12 3v2" />
      <path d="M12 9v3" />
      <path d="M2.077 19.449A2 2 0 0 0 4 21h16a2 2 0 0 0 1.924-2.55l-4-14A2 2 0 0 0 16 3H8a2 2 0 0 0-1.924 1.45z" />
    </svg>
  );
}

// Re-export Lucide components
export {
  Lightbulb,
  House,
  Megaphone,
  Trees,
  Trash,
  OctagonMinus,
  Droplets
};

/**
 * Maps category name or emoji to the user-specified Lucide icon:
 * - <Faucet /> for drainage
 * - <Lightbulb /> for electricity
 * - <House /> for encroachment
 * - <Megaphone /> for noise/pollution
 * - <Trees /> for park
 * - <Road /> for roads
 * - <Trash /> for sanitation
 * - <OctagonMinus /> for traffic
 * - <Droplets /> for water
 */
export function getCategoryIconComponent(nameOrIcon) {
  const normalized = (nameOrIcon || "").toLowerCase().trim();

  if (normalized.includes("drain") || normalized.includes("🚰")) {
    return Faucet;
  }
  if (normalized.includes("electr") || normalized.includes("power") || normalized.includes("light") || normalized.includes("💡")) {
    return Lightbulb;
  }
  if (normalized.includes("encroach") || normalized.includes("house") || normalized.includes("🏗️")) {
    return House;
  }
  if (normalized.includes("noise") || normalized.includes("pollut") || normalized.includes("sound") || normalized.includes("🔊")) {
    return Megaphone;
  }
  if (normalized.includes("park") || normalized.includes("tree") || normalized.includes("garden") || normalized.includes("horticulture") || normalized.includes("🌳")) {
    return Trees;
  }
  if (normalized.includes("road") || normalized.includes("street") || normalized.includes("pothole") || normalized.includes("highway") || normalized.includes("🛣️")) {
    return Road;
  }
  if (normalized.includes("sanitat") || normalized.includes("waste") || normalized.includes("garbage") || normalized.includes("trash") || normalized.includes("🗑️")) {
    return Trash;
  }
  if (normalized.includes("traffic") || normalized.includes("transport") || normalized.includes("signal") || normalized.includes("transit") || normalized.includes("🚦")) {
    return OctagonMinus;
  }
  if (normalized.includes("water") || normalized.includes("supply") || normalized.includes("leak") || normalized.includes("💧")) {
    return Droplets;
  }

  return HelpCircle;
}

export function CategoryIcon({ name, icon, size = 20, className = "", strokeWidth = 2 }) {
  const IconComponent = getCategoryIconComponent(name || icon);
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
}

export default CategoryIcon;
