import { db, delay, nextId, persist } from "../mocks/db";
import { ApiError } from "./errors";

/**
 * List equipment posts.
 * Optional filters: category, featured (boolean), active (boolean), search (string).
 * Public/patient callers by default receive only active posts unless actor is ADMIN.
 *
 * @param {Object} [params]
 * @param {string} [params.category]
 * @param {boolean} [params.featured]
 * @param {boolean} [params.active]
 * @param {string} [params.search]
 * @param {import("../types").User} [params.actor]
 * @returns {Promise<import("../types").EquipmentPost[]>}
 */
export async function listEquipment(params = {}) {
  const { category, featured, active, search, actor } = params;
  let items = [...(db.equipmentPosts || [])];

  // Non-admin viewers only see active equipment by default unless explicitly specified
  if (actor?.role !== "ADMIN" && active === undefined) {
    items = items.filter((item) => item.isActive);
  } else if (active !== undefined) {
    items = items.filter((item) => item.isActive === active);
  }

  if (category) {
    items = items.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (featured !== undefined) {
    items = items.filter((item) => item.isFeatured === featured);
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.manufacturer && item.manufacturer.toLowerCase().includes(q)) ||
        (item.model && item.model.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    );
  }

  // Sort newest first
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return delay(items);
}

/**
 * Get a single equipment post by ID.
 *
 * @param {number} id
 * @returns {Promise<import("../types").EquipmentPost>}
 */
export async function getEquipment(id) {
  const numId = Number(id);
  const item = (db.equipmentPosts || []).find((e) => e.id === numId);
  if (!item) {
    throw new Error("Equipment not found");
  }
  return delay({ ...item });
}

/**
 * Create a new equipment post. ADMIN only.
 *
 * @param {Object} input
 * @param {string} input.title
 * @param {string} [input.description]
 * @param {string} input.category
 * @param {string} [input.manufacturer]
 * @param {string} [input.model]
 * @param {string} [input.imageUrl]
 * @param {boolean} [input.isFeatured]
 * @param {boolean} [input.isActive]
 * @param {import("../types").User} actor
 * @returns {Promise<import("../types").EquipmentPost>}
 */
export async function createEquipment(input, actor) {
  if (actor?.role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can create equipment posts");
  }

  if (!input.title || !input.title.trim()) {
    throw new Error("Title is required");
  }
  if (!input.category || !input.category.trim()) {
    throw new Error("Category is required");
  }

  const now = new Date().toISOString();
  const newItem = {
    id: nextId("equipmentPost"),
    title: input.title.trim(),
    description: input.description?.trim() || "",
    category: input.category.trim(),
    manufacturer: input.manufacturer?.trim() || "",
    model: input.model?.trim() || "",
    imageUrl: input.imageUrl?.trim() || "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    isFeatured: Boolean(input.isFeatured),
    isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
    createdBy: actor.id,
    createdAt: now,
    updatedAt: now,
  };

  db.equipmentPosts.push(newItem);
  persist();
  return delay(newItem);
}

/**
 * Update an equipment post. ADMIN only.
 *
 * @param {number} id
 * @param {Partial<import("../types").EquipmentPost>} input
 * @param {import("../types").User} actor
 * @returns {Promise<import("../types").EquipmentPost>}
 */
export async function updateEquipment(id, input, actor) {
  if (actor?.role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can update equipment posts");
  }

  const numId = Number(id);
  const index = (db.equipmentPosts || []).findIndex((e) => e.id === numId);
  if (index === -1) {
    throw new Error("Equipment not found");
  }

  const existing = db.equipmentPosts[index];
  const updated = {
    ...existing,
    ...(input.title !== undefined && { title: input.title.trim() }),
    ...(input.description !== undefined && { description: input.description.trim() }),
    ...(input.category !== undefined && { category: input.category.trim() }),
    ...(input.manufacturer !== undefined && { manufacturer: input.manufacturer.trim() }),
    ...(input.model !== undefined && { model: input.model.trim() }),
    ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl.trim() }),
    ...(input.isFeatured !== undefined && { isFeatured: Boolean(input.isFeatured) }),
    ...(input.isActive !== undefined && { isActive: Boolean(input.isActive) }),
    updatedAt: new Date().toISOString(),
  };

  db.equipmentPosts[index] = updated;
  persist();
  return delay({ ...updated });
}

/**
 * Delete an equipment post. ADMIN only.
 *
 * @param {number} id
 * @param {import("../types").User} actor
 * @returns {Promise<void>}
 */
export async function deleteEquipment(id, actor) {
  if (actor?.role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can delete equipment posts");
  }

  const numId = Number(id);
  const index = (db.equipmentPosts || []).findIndex((e) => e.id === numId);
  if (index === -1) {
    throw new Error("Equipment not found");
  }

  db.equipmentPosts.splice(index, 1);
  persist();
  return delay(undefined);
}
