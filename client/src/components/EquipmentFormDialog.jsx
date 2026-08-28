import { useRef, useState } from "react";
import { Modal } from "./Modal";
import { btnGhost, btnPrimary, errorText, inputClass, labelClass } from "../lib/ui";

const DEFAULT_PRESETS = [
  "Radiotherapy",
  "Diagnostic Imaging",
  "Surgical Robotics",
  "Genomics & Laboratory",
  "Chemotherapy & Infusion",
  "Patient Monitoring",
  "Oncology ICU",
];

const PRESET_IMAGES = [
  {
    label: "Linac Radiotherapy",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "CT Scanner",
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "MR-Linac / MRI",
    url: "https://images.unsplash.com/photo-1581595220892-6e8e893d6db4?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Surgical Robot",
    url: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Genomics Lab",
    url: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
  },
];

/**
 * Enhanced Modal dialog for creating or editing equipment posts (ADMIN only).
 *
 * Handles category selection dynamically via string presets or custom entry
 * without requiring a separate categories database table.
 *
 * @param {Object} props
 * @param {import("../types").EquipmentPost} [props.equipment] Equipment to edit (null/undefined for create)
 * @param {string[]} [props.existingCategories] List of existing category strings in DB
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {(data: Partial<import("../types").EquipmentPost>) => Promise<void>} props.onSubmit
 */
export function EquipmentFormDialog({
  equipment,
  existingCategories = [],
  isOpen,
  onClose,
  onSubmit,
}) {
  const modalRef = useRef(null);
  const isEditing = Boolean(equipment);

  // Combine default presets with existing DB categories (minus 'All')
  const allCategories = Array.from(
    new Set([
      ...DEFAULT_PRESETS,
      ...existingCategories.filter((c) => c && c !== "All"),
    ])
  );

  const initialCat = equipment?.category || allCategories[0];
  const isPreset = allCategories.includes(initialCat);

  const [title, setTitle] = useState(equipment?.title || "");
  const [selectedCategory, setSelectedCategory] = useState(isPreset ? initialCat : "Custom");
  const [customCategory, setCustomCategory] = useState(isPreset ? "" : initialCat);
  const [manufacturer, setManufacturer] = useState(equipment?.manufacturer || "");
  const [model, setModel] = useState(equipment?.model || "");
  const [imageUrl, setImageUrl] = useState(equipment?.imageUrl || "");
  const [description, setDescription] = useState(equipment?.description || "");
  const [isFeatured, setIsFeatured] = useState(equipment?.isFeatured || false);
  const [isActive, setIsActive] = useState(equipment?.isActive !== undefined ? equipment.isActive : true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imgPreviewError, setImgPreviewError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const finalCategory =
      selectedCategory === "Custom" ? customCategory.trim() : selectedCategory;

    if (!title.trim()) {
      setError("Please enter an equipment title.");
      return;
    }
    if (!finalCategory) {
      setError("Please select or specify an equipment category.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        category: finalCategory,
        manufacturer: manufacturer.trim(),
        model: model.trim(),
        imageUrl: imageUrl.trim() || PRESET_IMAGES[0].url,
        description: description.trim(),
        isFeatured,
        isActive,
      });
      modalRef.current?.close();
    } catch (err) {
      setError(err.message || "Failed to save equipment post.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    modalRef.current?.close();
  };

  const previewImage =
    imgPreviewError || !imageUrl
      ? "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
      : imageUrl;

  return (
    <Modal
      ref={modalRef}
      title={isEditing ? "Edit Equipment Post" : "Add New Hospital Equipment"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-400/30 dark:bg-rose-400/10">
            <p className={errorText}>{error}</p>
          </div>
        )}

        {/* Section 1: Basic Information & Category */}
        <div className="space-y-4 rounded-xl border border-hairline/60 bg-surface/60 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-frost-600">
            1. Equipment Overview & Category
          </h4>

          {/* Title */}
          <div>
            <label htmlFor="equipment-title" className={labelClass}>
              Equipment Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="equipment-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Varian TrueBeam Radiotherapy System"
              className={inputClass}
            />
          </div>

          {/* Category Chip Selector */}
          <div>
            <label className={labelClass}>
              Category <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-ink-400 mb-2">
              Select an existing category or click "+ Custom" to define a new one.
            </p>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCustomCategory("");
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-frost-500 to-aqua-400 text-white shadow-sm"
                      : "border border-hairline/80 bg-surface text-ink-700 hover:bg-surface/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedCategory("Custom")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === "Custom"
                    ? "bg-gradient-to-r from-frost-500 to-aqua-400 text-white shadow-sm"
                    : "border border-hairline/80 bg-surface text-ink-700 hover:bg-surface/80"
                }`}
              >
                + Custom Category
              </button>
            </div>

            {selectedCategory === "Custom" && (
              <div className="mt-3">
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter new custom category name..."
                  className={inputClass}
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Manufacturer & Model */}
        <div className="space-y-4 rounded-xl border border-hairline/60 bg-surface/60 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-frost-600">
            2. Manufacturer & Model Specs
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="equipment-manufacturer" className={labelClass}>
                Manufacturer
              </label>
              <input
                id="equipment-manufacturer"
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. GE Healthcare, Varian, Elekta"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="equipment-model" className={labelClass}>
                Model Designation
              </label>
              <input
                id="equipment-model"
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. TrueBeam v2.7, Apex 256"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Media & Description */}
        <div className="space-y-4 rounded-xl border border-hairline/60 bg-surface/60 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-frost-600">
            3. Image Media & Description
          </h4>

          {/* Live Preview & URL */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Live Image Preview */}
            <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-xl border border-hairline bg-slate-950/20">
              <img
                src={previewImage}
                alt="Preview"
                onError={() => setImgPreviewError(true)}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                Live Preview
              </span>
            </div>

            <div className="flex-1 w-full space-y-2">
              <label htmlFor="equipment-image" className={labelClass}>
                Image URL
              </label>
              <input
                id="equipment-image"
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImgPreviewError(false);
                }}
                placeholder="https://images.unsplash.com/..."
                className={inputClass}
              />
              {/* Preset Sample Photos */}
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-ink-400 block mb-1">
                  Sample Medical Stock Photos:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => {
                        setImageUrl(img.url);
                        setImgPreviewError(false);
                      }}
                      className="rounded bg-ice-100 px-2 py-0.5 text-[10px] font-medium text-ink-700 hover:bg-frost-500 hover:text-white transition cursor-pointer"
                    >
                      + {img.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="equipment-description" className={labelClass}>
              Description & Clinical Details
            </label>
            <textarea
              id="equipment-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe clinical features, radiation precision, slice resolution, or surgical capabilities..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Section 4: Visibility & Status Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${
            isFeatured ? "border-amber-400/60 bg-amber-400/10" : "border-hairline/60 bg-surface/60"
          }`}>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-hairline text-amber-500 focus:ring-amber-400"
            />
            <div>
              <span className="text-sm font-bold text-ink-900 block flex items-center gap-1.5">
                <i className="fas fa-star text-amber-500 text-xs"></i> Showcase Featured
              </span>
              <span className="text-xs text-ink-400 block mt-0.5">
                Display on the public Home page equipment showcase grid.
              </span>
            </div>
          </label>

          <label className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${
            isActive ? "border-emerald-400/60 bg-emerald-400/10" : "border-hairline/60 bg-surface/60"
          }`}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-hairline text-emerald-500 focus:ring-emerald-400"
            />
            <div>
              <span className="text-sm font-bold text-ink-900 block flex items-center gap-1.5">
                <i className="fas fa-eye text-emerald-600 text-xs"></i> Active Status
              </span>
              <span className="text-xs text-ink-400 block mt-0.5">
                Visible to patients & public visitors in the equipment catalog.
              </span>
            </div>
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline/80">
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className={btnGhost}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={btnPrimary}
          >
            {submitting ? (
              <>
                <i className="fas fa-spinner animate-spin text-xs"></i> Saving...
              </>
            ) : isEditing ? (
              "Update Equipment"
            ) : (
              "Save Equipment"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
