"use client";

import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";

type Category = { id: number; name: string };
type Subcategory = { id: number; name: string };
type AlertType = {
  variant: "success" | "error" | "info";
  title: string;
  message: string;
};

type FormDataType = {
  category_id: string;
  subcategory_id: string;
  name: string;
  is_active: boolean;
};

export default function EditSubcategoryTypePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const apiKey = "ecommerceapp";
  const { adminToken: token } = parseCookies();

  const [form, setForm] = useState<FormDataType>({
    category_id: "",
    subcategory_id: "",
    name: "",
    is_active: true,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch categories, subcategories, and type details
  useEffect(() => {
    if (!id || !token) return;

    const fetchData = async () => {
      try {
        const [catRes, subRes, typeRes] = await Promise.all([
          fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/category", {
            headers: { Authorization: `Bearer ${token}`, apiKey },
          }),
          fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory", {
            headers: { Authorization: `Bearer ${token}`, apiKey },
          }),
          fetch(
            `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory-type/${id}`,
            { headers: { Authorization: `Bearer ${token}`, apiKey } }
          ),
        ]);

        const catData = await catRes.json();
        const subData = await subRes.json();
        const typeData = await typeRes.json();

        if (catData.success && subData.success && typeData.success) {
          setCategories(catData.data || []);
          setSubcategories(subData.data || []);
          const t = typeData.data;
          setForm({
            category_id: String(t.category_id || ""),
            subcategory_id: String(t.subcategory_id || ""),
            name: t.name || "",
            is_active: !!t.is_active,
          });
        } else {
          setAlert({
            variant: "error",
            title: "Error",
            message: "Failed to load subcategory type details.",
          });
        }
      } catch {
        setAlert({
          variant: "error",
          title: "Network Error",
          message: "Network error while fetching details.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]); // ✅ fixed: added token to dependency array

  // ✅ Handle form change
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value, type } = target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" && target instanceof HTMLInputElement ? target.checked : value,
    }));
  };


  // ✅ Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const payload = { ...form, is_active: form.is_active ? 1 : 0 };
      const res = await fetch(
        `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory-type/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apiKey,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        setAlert({
          variant: "success",
          title: "Success",
          message: "Subcategory Type updated successfully!",
        });
        setTimeout(() => router.push("/subcategories-types"), 1000);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to update subcategory type.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Network Error",
        message: "Something went wrong while updating.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div>
      <PageBreadcrumb pageTitle={`Edit Subcategory Type #${id}`} />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="Edit Subcategory Type">
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
            alignItems: "center",
          }}
        >
          {/* Category */}
          <div>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
              Category
            </label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
              Subcategory
            </label>
            <select
              name="subcategory_id"
              value={form.subcategory_id}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            >
              <option value="">Select Subcategory</option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
              Type Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter type name"
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* Active */}
          <div style={{ marginTop: "10px" }}>
            <label style={{ fontWeight: 600 }}>
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                style={{ marginRight: "6px" }}
              />
              Active
            </label>
          </div>

          {/* Buttons */}
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              gap: "10px",
              marginTop: "16px",
            }}
          >
            <button
              type="button"
              color="dark"
              onClick={() => router.push("/subcategories-types")}
            >
              Cancel
            </button>

            <button type="submit" disabled={saving}>
              {saving ? "Updating..." : "Update Subcategory Type"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
