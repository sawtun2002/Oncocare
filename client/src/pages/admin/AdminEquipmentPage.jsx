import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEquipment, deleteEquipment, listEquipment, updateEquipment } from "../../api/equipment";
import { Badge } from "../../components/Badge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EquipmentCard } from "../../components/EquipmentCard";
import { EquipmentFormDialog } from "../../components/EquipmentFormDialog";
import { StatCard } from "../../components/StatCard";
import { TableSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  btnPrimary,
  dangerAction,
  inputClass,
  pageTitle,
  tableBase,
  tableHead,
  tableRow,
  tableWrap,
} from "../../lib/ui";

export function AdminEquipmentPage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Fetch all equipment posts (including inactive for admin)
  const { data: equipmentList = [], isLoading, isError } = useQuery({
    queryKey: ["admin-equipment"],
    queryFn: () => listEquipment({ actor: user, active: undefined }),
  });

  const categories = ["All", ...new Set(equipmentList.map((e) => e.category))];

  // Stats calculation
  const totalCount = equipmentList.length;
  const activeCount = equipmentList.filter((e) => e.isActive).length;
  const featuredCount = equipmentList.filter((e) => e.isFeatured).length;
  const categoryCount = new Set(equipmentList.map((e) => e.category)).size;

  // Filter items
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

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createEquipment(data, user),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["admin-equipment"] });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success(`Created "${created.title}" successfully.`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create equipment.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateEquipment(id, data, user),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-equipment"] });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success(`Updated "${updated.title}" successfully.`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update equipment.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteEquipment(id, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-equipment"] });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success("Equipment post deleted successfully.");
      setDeleteItem(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete equipment.");
    },
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleToggleStatus = (item, changes) => {
    updateMutation.mutate({ id: item.id, data: changes });
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={pageTitle}>Equipment management</h1>
          <p className="mt-1 text-sm text-ink-400">
            Create, update, and manage hospital medical technology, radiotherapy systems, and diagnostic equipment.
          </p>
        </div>
        <button onClick={handleOpenCreate} className={btnPrimary}>
          + Add equipment
        </button>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total equipment" value={totalCount} loading={isLoading} />
        <StatCard label="Active systems" value={activeCount} loading={isLoading} />
        <StatCard label="Featured posts" value={featuredCount} loading={isLoading} />
        <StatCard label="Categories" value={categoryCount} loading={isLoading} />
      </div>

      {/* Controls: Search, Category Filter, and View Switcher */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-frost-500 to-aqua-400 text-white shadow-sm"
                  : "bg-surface/70 text-ink-700 hover:bg-surface"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-xs pointer-events-none"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter equipment..."
              className={`${inputClass} pl-9 py-1.5 text-xs`}
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-hairline/80 bg-surface/70 p-0.5">
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                viewMode === "table" ? "bg-surface text-ink-900 shadow-sm" : "text-ink-400 hover:text-ink-700"
              }`}
            >
              <i className="fas fa-list"></i>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                viewMode === "grid" ? "bg-surface text-ink-900 shadow-sm" : "text-ink-400 hover:text-ink-700"
              }`}
            >
              <i className="fas fa-th-large"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <TableSkeleton columns={6} />
      ) : isError ? (
        <div className="glass-panel p-8 text-center rounded-xl">
          <p className="text-sm font-semibold text-rose-600">Failed to load equipment list.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl">
          <p className="text-sm font-medium text-ink-400">No equipment posts match your criteria.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              isAdmin={true}
              onEdit={handleOpenEdit}
              onDelete={setDeleteItem}
              onToggle={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className={tableWrap}>
          <table className={tableBase}>
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-2.5">System / Title</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Manufacturer & Model</th>
                <th className="px-4 py-2.5">Featured</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className={tableRow}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl || "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"}
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
                    {[item.manufacturer, item.model].filter(Boolean).join(" • ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item, { isFeatured: !item.isFeatured })}
                      className="cursor-pointer"
                    >
                      {item.isFeatured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-400/20 dark:text-amber-300">
                          <i className="fas fa-star text-[10px]"></i> Featured
                        </span>
                      ) : (
                        <span className="text-xs text-ink-400 hover:text-amber-500">Standard</span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item, { isActive: !item.isActive })}
                      className="cursor-pointer"
                    >
                      <Badge status={item.isActive ? "ACTIVE" : "INACTIVE"} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-xs font-semibold text-frost-500 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteItem(item)}
                        className={`text-xs font-semibold ${dangerAction} cursor-pointer`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal for Create & Edit */}
      {formOpen && (
        <EquipmentFormDialog
          equipment={editingItem}
          existingCategories={categories}
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <ConfirmDialog
          isOpen={Boolean(deleteItem)}
          title="Delete Equipment Post"
          message={`Are you sure you want to delete "${deleteItem.title}"? This cannot be undone.`}
          confirmLabel="Delete Equipment"
          confirmTone="danger"
          onClose={() => setDeleteItem(null)}
          onConfirm={() => deleteMutation.mutate(deleteItem.id)}
        />
      )}
    </div>
  );
}
