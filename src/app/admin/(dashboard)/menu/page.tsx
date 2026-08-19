"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { formatRM } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ProductDTO, CategoryDTO } from "@/lib/types";

type AddOn = { id: string; name: string; price: number; active: boolean };
type Tab = "products" | "addons" | "categories";

export default function AdminMenuPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | "new" | null>(null);

  async function loadAll() {
    setLoading(true);
    const [p, c, a] = await Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/addons").then((r) => r.json()),
    ]);
    setProducts(p.products || []);
    setCategories(c.categories || []);
    setAddOns(a.addOns || []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/addons").then((r) => r.json()),
    ]).then(([p, c, a]) => {
      if (cancelled) return;
      setProducts(p.products || []);
      setCategories(c.categories || []);
      setAddOns(a.addOns || []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleSoldOut(product: ProductDTO) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isSoldOut: !product.isSoldOut }),
    });
    loadAll();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    loadAll();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold text-jungle-950">Menu Management</h1>
        {tab === "products" && (
          <button
            onClick={() => setEditingProduct("new")}
            className="inline-flex items-center gap-2 rounded-full bg-jungle-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-jungle-700"
          >
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {(["products", "addons", "categories"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn("rounded-full px-4 py-2 text-sm font-bold capitalize", tab === t ? "bg-jungle-600 text-white" : "bg-white text-jungle-500 border border-jungle-100")}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader2 className="animate-spin text-jungle-400" />
      ) : tab === "products" ? (
        <div className="rounded-3xl bg-white card-shadow border border-jungle-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-jungle-50 text-jungle-500 text-xs uppercase font-bold">
                <tr>
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Flags</th>
                  <th className="text-left px-4 py-3">Sold Out</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-jungle-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-jungle-50/50">
                    <td className="px-4 py-3 font-semibold text-jungle-900">{p.name}</td>
                    <td className="px-4 py-3 text-jungle-500">{p.categoryName}</td>
                    <td className="px-4 py-3 text-jungle-700 font-semibold">
                      {p.variants.length > 0 ? `from ${formatRM(Math.min(...p.variants.map((v) => v.price)))}` : formatRM(p.basePrice)}
                    </td>
                    <td className="px-4 py-3 space-x-1">
                      {p.isBestSeller && <Badge tone="red">Best Seller</Badge>}
                      {p.isNew && <Badge tone="teal">New</Badge>}
                      {p.isFeatured && <Badge tone="gold">Featured</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSoldOut(p)}
                        className={cn("rounded-full px-3 py-1 text-xs font-bold", p.isSoldOut ? "bg-tomato-100 text-tomato-700" : "bg-jungle-100 text-jungle-600")}
                      >
                        {p.isSoldOut ? "Sold Out" : "Available"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingProduct(p)} className="text-jungle-400 hover:text-jungle-700">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="text-jungle-400 hover:text-tomato-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "addons" ? (
        <AddOnsManager addOns={addOns} onChange={loadAll} />
      ) : (
        <CategoriesManager categories={categories} onChange={loadAll} />
      )}

      {editingProduct && (
        <ProductFormModal
          product={editingProduct === "new" ? null : editingProduct}
          categories={categories}
          addOns={addOns}
          onClose={() => setEditingProduct(null)}
          onSaved={() => {
            setEditingProduct(null);
            loadAll();
          }}
        />
      )}
    </div>
  );
}

function Badge({ tone, children }: { tone: "red" | "teal" | "gold"; children: React.ReactNode }) {
  const toneClasses = { red: "bg-tomato-100 text-tomato-700", teal: "bg-teal-100 text-teal-700", gold: "bg-gold-100 text-gold-700" };
  return <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-bold", toneClasses[tone])}>{children}</span>;
}

function AddOnsManager({ addOns, onChange }: { addOns: AddOn[]; onChange: () => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  async function addAddOn() {
    if (!name.trim() || !price) return;
    await fetch("/api/admin/addons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: Math.round(parseFloat(price) * 100) }),
    });
    setName("");
    setPrice("");
    onChange();
  }

  async function updatePrice(id: string, newPrice: number) {
    await fetch(`/api/admin/addons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: Math.round(newPrice * 100) }),
    });
    onChange();
  }

  async function remove(id: string) {
    if (!confirm("Delete this add-on?")) return;
    await fetch(`/api/admin/addons/${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6">
      <div className="flex flex-wrap gap-2 mb-5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add-on name" className="rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm flex-1 min-w-[160px]" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (RM)" type="number" step="0.10" className="rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm w-32" />
        <button onClick={addAddOn} className="rounded-xl bg-jungle-600 px-4 py-2 text-sm font-bold text-white hover:bg-jungle-700">
          Add
        </button>
      </div>
      <div className="divide-y divide-jungle-50">
        {addOns.map((a) => (
          <div key={a.id} className="flex items-center justify-between py-2.5">
            <span className="text-sm font-semibold text-jungle-800">{a.name}</span>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.10"
                defaultValue={(a.price / 100).toFixed(2)}
                onBlur={(e) => updatePrice(a.id, parseFloat(e.target.value))}
                className="w-24 rounded-lg border border-jungle-100 px-2 py-1 text-sm text-right"
              />
              <button onClick={() => remove(a.id)} className="text-jungle-400 hover:text-tomato-600">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoriesManager({ categories, onChange }: { categories: CategoryDTO[]; onChange: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("🍽️");

  async function addCategory() {
    if (!name.trim() || !slug.trim()) return;
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, icon }),
    });
    setName("");
    setSlug("");
    onChange();
  }

  return (
    <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6">
      <div className="flex flex-wrap gap-2 mb-5">
        <input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-16 rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm text-center" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm flex-1 min-w-[140px]" />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-slug" className="rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm w-40" />
        <button onClick={addCategory} className="rounded-xl bg-jungle-600 px-4 py-2 text-sm font-bold text-white hover:bg-jungle-700">
          Add
        </button>
      </div>
      <div className="divide-y divide-jungle-50">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 py-2.5 text-sm">
            <span className="text-lg">{c.icon}</span>
            <span className="font-semibold text-jungle-800">{c.name}</span>
            <span className="text-jungle-400">/{c.slug}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductFormModal({
  product,
  categories,
  addOns,
  onClose,
  onSaved,
}: {
  product: ProductDTO | null;
  categories: CategoryDTO[];
  addOns: AddOn[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || categories[0]?.id || "");
  const [description, setDescription] = useState(product?.description || "");
  const [basePrice, setBasePrice] = useState(product ? (product.basePrice / 100).toFixed(2) : "");
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [variants, setVariants] = useState(product?.variants.map((v) => ({ name: v.name, price: (v.price / 100).toFixed(2) })) || []);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(product?.addOns.map((a) => a.id) || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addVariantRow() {
    setVariants([...variants, { name: "", price: "" }]);
  }

  async function save() {
    setSaving(true);
    setError("");
    const payload = {
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      categoryId,
      name,
      description,
      basePrice: Math.round(parseFloat(basePrice || "0") * 100),
      isAvailable,
      isSoldOut: product?.isSoldOut ?? false,
      isFeatured,
      isBestSeller,
      isNew,
      variants: variants.filter((v) => v.name && v.price).map((v) => ({ name: v.name, price: Math.round(parseFloat(v.price) * 100) })),
      addOnIds: selectedAddOns,
    };

    const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const res = await fetch(url, {
      method: product ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save product.");
      setSaving(false);
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-jungle-950/50" onClick={onClose} />
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-extrabold text-jungle-950">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-jungle-100">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <LabeledInput label="Name" value={name} onChange={setName} />
            <LabeledInput label="Slug" value={slug} onChange={setSlug} placeholder="auto-generated if blank" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-jungle-500 mb-1 block">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-jungle-500 mb-1 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm resize-none" />
          </div>
          <LabeledInput label="Base Price (RM)" value={basePrice} onChange={setBasePrice} type="number" step="0.10" hint={variants.length > 0 ? "Ignored when variants are set below" : undefined} />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase text-jungle-500">Variants (e.g. Hot / Iced)</label>
              <button onClick={addVariantRow} className="text-xs font-bold text-jungle-600 hover:underline">
                + Add variant
              </button>
            </div>
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={v.name}
                  onChange={(e) => setVariants(variants.map((vv, idx) => (idx === i ? { ...vv, name: e.target.value } : vv)))}
                  placeholder="Name"
                  className="flex-1 rounded-lg border border-jungle-100 px-2.5 py-1.5 text-sm"
                />
                <input
                  value={v.price}
                  onChange={(e) => setVariants(variants.map((vv, idx) => (idx === i ? { ...vv, price: e.target.value } : vv)))}
                  placeholder="Price"
                  type="number"
                  step="0.10"
                  className="w-24 rounded-lg border border-jungle-100 px-2.5 py-1.5 text-sm"
                />
                <button onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-jungle-400 hover:text-tomato-600">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-jungle-500 mb-1.5 block">Available Add-ons</label>
            <div className="flex flex-wrap gap-2">
              {addOns.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAddOns((prev) => (prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id]))}
                  className={cn(
                    "rounded-full border-2 px-3 py-1.5 text-xs font-semibold",
                    selectedAddOns.includes(a.id) ? "border-jungle-600 bg-jungle-600 text-white" : "border-jungle-100 text-jungle-500"
                  )}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Checkbox label="Available" checked={isAvailable} onChange={setIsAvailable} />
            <Checkbox label="Best Seller" checked={isBestSeller} onChange={setIsBestSeller} />
            <Checkbox label="New" checked={isNew} onChange={setIsNew} />
            <Checkbox label="Featured" checked={isFeatured} onChange={setIsFeatured} />
          </div>

          {error && <p className="text-sm font-semibold text-tomato-600">{error}</p>}

          <button
            onClick={save}
            disabled={saving || !name}
            className="w-full rounded-full bg-jungle-600 py-3 font-bold text-white hover:bg-jungle-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="animate-spin" size={16} />}
            {product ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  step,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase text-jungle-500 mb-1 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        step={step}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm"
      />
      {hint && <p className="text-[11px] text-jungle-400 mt-1">{hint}</p>}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-jungle-700 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-jungle-600" />
      {label}
    </label>
  );
}
