import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listEquipment, resolveEquipmentImageUrl } from "../../api/equipment";
import { Badge } from "../../components/Badge";
import { EquipmentCard } from "../../components/EquipmentCard";
import { TableSkeleton } from "../../components/Skeleton";
import {
  inputClass,
  pageTitle,
  tableBase,
  tableHead,
  tableRow,
  tableWrap,
} from "../../lib/ui";

/**
 * Authenticated equipment catalogue. It is rendered by the protected RoleLayout
 * for doctors, nurses, receptionists, and patients, so each role keeps its
 * normal sidebar while viewing the same read-only catalogue.
 * The presentation follows the admin equipment list but has no CRUD actions.
 */
export function MedicalEquipmentPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("table");

  const { data: equipmentList = [], isLoading, isError } = useQuery({
    queryKey: ["staff-equipment"],
    queryFn: () => listEquipment({ active: true }),
  });

  const categories = ["All", ...new Set(equipmentList.map((item) => item.category))];
  const filteredItems = equipmentList.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      item.title.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.manufacturer?.toLowerCase().includes(term) ||
      item.model?.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className={pageTitle}>Equipment catalogue</h1>
        <p className="mt-1 text-sm text-ink-400">
          Review active hospital technology, radiotherapy systems, and diagnostic equipment.
        </p>
      </div>

      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-frost-500 to-aqua-400 text-white shadow-sm"
                  : "bg-surface/70 text-ink-700 hover:bg-surface"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-xs pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filter equipment..."
              className={`${inputClass} pl-9 py-1.5 text-xs`}
            />
          </div>

          <div className="flex items-center rounded-lg border border-hairline/80 bg-surface/70 p-0.5" aria-label="Equipment view">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Table view"
              aria-label="Table view"
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                viewMode === "table" ? "bg-surface text-ink-900 shadow-sm" : "text-ink-400 hover:text-ink-700"
              }`}
            >
              <i className="fas fa-list" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid view"
              aria-label="Grid view"
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                viewMode === "grid" ? "bg-surface text-ink-900 shadow-sm" : "text-ink-400 hover:text-ink-700"
              }`}
            >
              <i className="fas fa-th-large" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={5} />
      ) : isError ? (
        <div className="glass-panel p-8 text-center rounded-xl">
          <p className="text-sm font-semibold text-rose-600">Failed to load the equipment catalogue.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl">
          <p className="text-sm font-medium text-ink-400">No equipment posts match your criteria.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <EquipmentCard key={item.id} equipment={item} />
          ))}
        </div>
      ) : (
        <div className={tableWrap}>
          <table className={tableBase}>
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-2.5">System / Title</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Manufacturer & Model</th>
                <th className="px-4 py-2.5">Featured</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className={tableRow}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={resolveEquipmentImageUrl(item.imageUrl)}
                        alt=""
                        className="h-10 w-12 rounded-lg object-cover border border-hairline/80"
                      />
                      <div>
                        <p className="font-semibold text-ink-900 leading-snug">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-ink-400 line-clamp-1 max-w-xs">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-700 font-medium">{item.category}</td>
                  <td className="px-4 py-3 text-ink-600 text-xs">
                    {[item.manufacturer, item.model].filter(Boolean).join(" / ") || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {item.isFeatured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-400/20 dark:text-amber-300">
                        <i className="fas fa-star text-[10px]" /> Featured
                      </span>
                    ) : (
                      <span className="text-xs text-ink-400">Standard</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><Badge status="ACTIVE" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
