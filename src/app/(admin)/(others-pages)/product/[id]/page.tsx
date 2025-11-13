"use client";

import React, {
  useEffect,
  useState,
  ChangeEvent,
  FormEvent,
  useCallback,
} from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { parseCookies } from "nookies";
import Image from "next/image";

type Category = {
  id: number | string;
  name: string;
  _id?: string;
};

type Subcategory = {
  id: number | string;
  name: string;
  _id?: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category_id: string;
  subcategory_id: string;
  is_active: boolean;
  images?: string[];
};

type AlertType = {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
};

export default function EditProductPage() {
  const { id } = useParams() as { id?: string };
  const router = useRouter();
  const apiKey = "ecommerceapp";
  const { adminToken: token } = parseCookies();

  const [form, setForm] = useState<Product>({
    id: 0,
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    category_id: "",
    subcategory_id: "",
    is_active: true,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);

  // ✅ Fetch Product Details
  const fetchProduct = useCallback(async () => {
    if (!id || !token) return;
    try {
      const res = await fetch(
        `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/product/${id}`,
        {
          headers: { Authorization: `Bearer ${token}`, apiKey },
        }
      );

      const data = await res.json();
      if (data.success && data.data) {
        const p = data.data;
        setForm({
          id: p.id,
          name: p.name ?? "",
          description: p.description ?? "",
          price: Number(p.price ?? 0),
          quantity: Number(p.quantity ?? 0),
          category_id: p.category_id ?? "",
          subcategory_id: p.subcategory_id ?? "",
          is_active: Boolean(p.is_active),
          images: p.images ?? [],
        });
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: "Product not found.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed to load product.",
      });
    }
  }, [id, token]);

  // ✅ Fetch Categories & Subcategories
  const fetchOptions = useCallback(async () => {
    if (!token) return;
    try {
      const [catRes, subRes] = await Promise.all([
        fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/category", {
          headers: { Authorization: `Bearer ${token}`, apiKey },
        }),
        fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory", {
          headers: { Authorization: `Bearer ${token}`, apiKey },
        }),
      ]);

      const catData = await catRes.json();
      const subData = await subRes.json();

      if (catData?.success) setCategories(catData.data || []);
      if (subData?.success) setSubcategories(subData.data || []);
    } catch {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed to load dropdown data.",
      });
    }
  }, [token]);

  // ✅ Run both fetchers safely
  useEffect(() => {
    Promise.all([fetchProduct(), fetchOptions()]).finally(() => setLoading(false));
  }, [fetchProduct, fetchOptions]);

  // ✅ Handlers
  const handleChange = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value, type } = e.target;

  // Determine checked value only if it's an input checkbox
  const fieldValue =
    type === "checkbox" && "checked" in e.target ? e.target.checked : value;

  setForm((prev) => ({
    ...prev,
    [name]: fieldValue,
  }));
};

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setNewImages(files);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", String(form.price));
      formData.append("quantity", String(form.quantity));
      formData.append("category_id", form.category_id);
      formData.append("subcategory_id", form.subcategory_id);
      formData.append("is_active", form.is_active ? "1" : "0");

      newImages.forEach((file) => formData.append("images", file));

      const res = await fetch(
        `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/product/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            apiKey,
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (data.success) {
        setAlert({
          variant: "success",
          title: "Success",
          message: "Product updated successfully!",
        });
        setTimeout(() => router.push("/products"), 1000);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to update product.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Request failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Loading state
  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  // ✅ Render form
  return (
    <div>
      <PageBreadcrumb pageTitle={`Edit Product #${id}`} />

      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          showLink={false}
        />
      )}

      <ComponentCard title="Edit Product Details">
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
          <label style={{ fontWeight: 600 }}>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
          />

          <label style={{ fontWeight: 600 }}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
          />

          {/* Price and Quantity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontWeight: 600 }}>Price</label>
              <input
                type="number"
                name="price"
                value={String(form.price)}
                onChange={handleChange}
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  width: "100%",
                }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 600 }}>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={String(form.quantity)}
                onChange={handleChange}
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  width: "100%",
                }}
              />
            </div>
          </div>

          {/* Category and Subcategory */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontWeight: 600 }}>Category</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  width: "100%",
                }}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id ?? cat._id} value={String(cat.id ?? cat._id)}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 600 }}>Subcategory</label>
              <select
                name="subcategory_id"
                value={form.subcategory_id}
                onChange={handleChange}
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  width: "100%",
                }}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub.id ?? sub._id} value={String(sub.id ?? sub._id)}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Images */}
          <label style={{ fontWeight: 600 }}>Upload New Images</label>
          <input type="file" multiple onChange={handleImageChange} />

          {form.images && form.images.length > 0 && (
            <div>
              <p style={{ margin: "8px 0" }}>Existing Images:</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {form.images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    alt="product"
                    width={80}
                    height={80}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      objectFit: "cover",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Active Status */}
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              name="is_active"
              checked={!!form.is_active}
              onChange={handleChange}
            />
            <span>Active Status</span>
          </label>

          <div>
            <Badge color={form.is_active ? "success" : "error"} variant="solid">
              {form.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Buttons */}
          <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
            <Button color="primary" variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Update Product"}
            </Button>

            <Button
              color="primary"
              variant="outline"
              onClick={() => router.push("/products")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
