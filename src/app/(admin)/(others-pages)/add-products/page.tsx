"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  category_id?: number;
}

interface AlertType {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const apiKey = "ecommerceapp";
  const { adminToken: token } = parseCookies();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category_id: "",
    subcategory_id: "",
    is_active: true,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
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

        if (catData.success && subData.success) {
          setCategories(catData.data as Category[]);
          setSubcategories(subData.data as Subcategory[]);
        } else throw new Error("Failed to fetch options.");
      } catch {
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed to load categories.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [token, apiKey]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    const isChecked =
      type === "checkbox" && "checked" in e.target ? (e.target as HTMLInputElement).checked : false;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? isChecked : value,
    }));
  };


  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImages(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
    images.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/product", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, apiKey },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setAlert({
          variant: "success",
          title: "Success",
          message: "Product created successfully!",
        });
        setTimeout(() => router.push("/products"), 1000);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Creation failed.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Network request failed.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Product" />
      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          showLink={false}
        />
      )}

      <ComponentCard title="Add New Product">
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <div>
              <label style={{ fontWeight: "500", marginBottom: "4px", display: "block" }}>
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              />
            </div>

            <div>
              <label style={{ fontWeight: "500", marginBottom: "4px", display: "block" }}>
                Price
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              />
            </div>

            <div>
              <label style={{ fontWeight: "500", marginBottom: "4px", display: "block" }}>
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              />
            </div>

            <div>
              <label style={{ fontWeight: "500", marginBottom: "4px", display: "block" }}>
                Category
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontWeight: "500", marginBottom: "4px", display: "block" }}>
                Subcategory
              </label>
              <select
                name="subcategory_id"
                value={form.subcategory_id}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontWeight: "500", marginBottom: "4px", display: "block" }}>
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              />
            </div>

            <div>
              <label style={{ fontWeight: "500", marginBottom: "4px", display: "block" }}>
                Images
              </label>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                style={{
                  width: "100%",
                  border: "1px solid #ddd",
                  padding: "6px",
                  borderRadius: "6px",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              <label>Active</label>
            </div>

            <div style={{ gridColumn: "1 / -1", textAlign: "left" }}>
              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Create Product"}
              </button>
            </div>
          </form>
        )}
      </ComponentCard>
    </div>
  );
}
