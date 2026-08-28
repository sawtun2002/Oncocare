import { useState } from "react";
import { Badge } from "./Badge";
import { resolveEquipmentImageUrl } from "../api/equipment";

/**
 * Card component displaying equipment photo, category, manufacturer, model,
 * description, and status badges. Includes optional Admin control actions.
 *
 * @param {Object} props
 * @param {import("../types").EquipmentPost} props.equipment
 * @param {boolean} [props.isAdmin]
 * @param {(equipment: import("../types").EquipmentPost) => void} [props.onEdit]
 * @param {(equipment: import("../types").EquipmentPost) => void} [props.onDelete]
 * @param {(equipment: import("../types").EquipmentPost, changes: Partial<import("../types").EquipmentPost>) => void} [props.onToggle]
 */
export function EquipmentCard({ equipment, isAdmin = false, onEdit, onDelete, onToggle }) {
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const defaultImage = "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80";
  const displayImage = imageError ? defaultImage : resolveEquipmentImageUrl(equipment.imageUrl);

  return (
    <div className={`glass-panel group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl ${
      !equipment.isActive ? "opacity-75 grayscale-[20%]" : ""
    }`}>
      {/* Image Banner */}
      <div className="relative h-52 w-full overflow-hidden bg-serenity-950/20">
        <img
          src={displayImage}
          alt={equipment.title}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {equipment.category}
          </span>
          <div className="flex items-center gap-1.5">
            {equipment.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-2.5 py-0.5 text-xs font-bold text-white shadow-md">
                <i className="fas fa-star text-[10px]"></i> Featured
              </span>
            )}
            {!equipment.isActive && (
              <Badge tone="muted">Inactive</Badge>
            )}
          </div>
        </div>

        {/* Manufacturer & Model overlay tag */}
        {(equipment.manufacturer || equipment.model) && (
          <div className="absolute bottom-3 left-3 right-3 text-xs font-medium text-white/90 drop-shadow-md">
            {[equipment.manufacturer, equipment.model].filter(Boolean).join(" • ")}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-ink-900 leading-snug mb-2 group-hover:text-frost-500 transition-colors">
          {equipment.title}
        </h3>

        {equipment.description && (
          <div className="mb-4 text-sm text-ink-600 leading-relaxed">
            <p className={expanded ? "" : "line-clamp-3"}>
              {equipment.description}
            </p>
            {equipment.description.length > 130 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-xs font-semibold text-frost-500 hover:underline focus:outline-none cursor-pointer"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* Specification Metadata List */}
        <div className="mt-auto pt-3 border-t border-hairline/60 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-ink-400 block font-medium">Category</span>
            <span className="text-ink-800 font-semibold truncate block">{equipment.category}</span>
          </div>
          <div>
            <span className="text-ink-400 block font-medium">Manufacturer</span>
            <span className="text-ink-800 font-semibold truncate block">{equipment.manufacturer || "N/A"}</span>
          </div>
        </div>

        {/* Admin CRUD Action Controls */}
        {isAdmin && (
          <div className="mt-4 pt-3 border-t border-hairline/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onToggle?.(equipment, { isFeatured: !equipment.isFeatured })}
                title={equipment.isFeatured ? "Unfeature" : "Mark Featured"}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition cursor-pointer ${
                  equipment.isFeatured
                    ? "border-amber-400/50 bg-amber-400/10 text-amber-500 hover:bg-amber-400/20"
                    : "border-hairline bg-surface/80 text-ink-400 hover:text-amber-500 hover:bg-surface"
                }`}
              >
                <i className="fas fa-star text-xs"></i>
              </button>
              <button
                type="button"
                onClick={() => onToggle?.(equipment, { isActive: !equipment.isActive })}
                title={equipment.isActive ? "Deactivate" : "Activate"}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition cursor-pointer ${
                  equipment.isActive
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-600 hover:bg-emerald-400/20"
                    : "border-hairline bg-surface/80 text-ink-400 hover:text-emerald-600 hover:bg-surface"
                }`}
              >
                <i className={`fas ${equipment.isActive ? "fa-eye" : "fa-eye-slash"} text-xs`}></i>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit?.(equipment)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-hairline/80 bg-surface/80 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-surface hover:text-frost-500 transition cursor-pointer"
              >
                <i className="fas fa-edit text-[11px]"></i> Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(equipment)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200/80 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition cursor-pointer dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300"
              >
                <i className="fas fa-trash-alt text-[11px]"></i> Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
