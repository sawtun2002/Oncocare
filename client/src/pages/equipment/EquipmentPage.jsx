import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listEquipment } from "../../api/equipment";
import { EquipmentCard } from "../../components/EquipmentCard";
import { CardSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { btnPrimary, inputClass } from "../../lib/ui";

export function EquipmentPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch active equipment list for public view
  const { data: equipmentList = [], isLoading, isError } = useQuery({
    queryKey: ["public-equipment"],
    queryFn: () => listEquipment({ active: true }),
  });

  // Extract unique categories from active items
  const categories = ["All", ...new Set(equipmentList.map((e) => e.category))];

  // Filtering
  const filteredItems = equipmentList.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.manufacturer && item.manufacturer.toLowerCase().includes(q)) ||
      (item.model && item.model.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Quick Banner */}
      {isAdmin && (
        <div className="rounded-xl border border-frost-400/40 bg-frost-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-frost-500 text-white shrink-0">
              <i className="fas fa-user-shield text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">Administrator Notice</p>
              <p className="text-xs text-ink-600">
                You are viewing the public read-only catalog. Manage and CRUD equipment posts in the Admin Panel.
              </p>
            </div>
          </div>
          <Link to="/admin/equipment" className={btnPrimary}>
            Open Equipment CRUD <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-frost-500/10 px-3 py-1 text-xs font-semibold text-frost-500 mb-3">
              <i className="fas fa-microscope text-xs"></i> Advanced Medical Technology
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
              Hospital Equipment & Technology
            </h1>
            <p className="mt-2 text-sm sm:text-base text-ink-600 max-w-2xl">
              Explore our state-of-the-art radiation therapy, diagnostic imaging, and robotic surgical systems empowering high-precision cancer care.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-frost-500 to-aqua-400 text-white shadow-sm"
                    : "glass-panel text-ink-700 hover:bg-surface/70"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:max-w-xs">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-xs pointer-events-none"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment, brand, model..."
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {/* Equipment Cards Grid (Read-Only) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : isError ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <i className="fas fa-exclamation-triangle text-3xl text-rose-500 mb-3"></i>
          <p className="text-base font-semibold text-ink-900">Failed to load equipment catalog</p>
          <p className="text-xs text-ink-400 mt-1">Please refresh or try again later.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ice-100 mx-auto text-ink-400">
            <i className="fas fa-search text-xl"></i>
          </div>
          <h3 className="text-lg font-bold text-ink-900">No equipment found</h3>
          <p className="text-sm text-ink-500 max-w-sm mx-auto">
            {search || selectedCategory !== "All"
              ? "No equipment matches your active search or category filter."
              : "No active equipment is currently listed in the catalog."}
          </p>
          {(search || selectedCategory !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-frost-500 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              isAdmin={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
