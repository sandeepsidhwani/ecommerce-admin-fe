"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";

type Category = { id: number; name: string };
type Subcategory = { id: number; name: string };

type AlertType = {
  variant: "success" | "error" | "info";
  title: string;
  message: string;
};

export default function AddSubcategoryTypePage() {
  const router = useRouter();
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const [form, setForm] = useState({
    category_id: "",
    subcategory_id: "",
    name: "",
    is_active: true,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
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
          setCategories(catData.data || []);
          setSubcategories(subData.data || []);
        } else {
          setAlert({
            variant: "error",
            title: "Error",
            message: "Failed to load categories or subcategories.",
          });
        }
      } catch {
        setAlert({
          variant: "error",
          title: "Error",
          message: "Something went wrong while loading options.",
        });
      } finally {
        setLoadingOptions(false);
      }
    };

    if (token) fetchOptions();
  }, [token]);

  // ✅ Fixed handleChange (removed unused variable + correct checkbox handling)
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    const newValue =
      type === "checkbox" && "checked" in e.target
        ? (e.target as HTMLInputElement).checked
        : value;

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.category_id || !form.subcategory_id || !form.name.trim()) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "All fields are required.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload = { ...form, is_active: form.is_active ? 1 : 0 };
      const res = await fetch(
        "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory-type",
        {
          method: "POST",
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
          message: "Subcategory Type added successfully!",
        });
        setTimeout(() => router.push("/subcategories-types"), 1000);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to add subcategory type.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Network Error",
        message: "Something went wrong while adding subcategory type.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Subcategory Type" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="Add New Subcategory Type">
        {loadingOptions ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : (
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
                  borderRadius: "6px",
                  border: "1px solid #ddd",
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
                  borderRadius: "6px",
                  border: "1px solid #ddd",
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
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                }}
              />
            </div>

            {/* Active checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              <label>Active</label>
            </div>

            <div style={{ marginTop: "12px", display: "flex", gap: "8px", gridColumn: "1 / -1", }}>
              <Button
                type="submit"
                disabled={submitting}
                variant="primary"
              >
                {submitting ? "Submitting..." : "Add Subcategory Type"}
              </Button>
               <Button
                  color="primary"
                  variant="outline"
                  onClick={() => router.push("/subcategories-types")}
                >
                  Cancel
                </Button>
            </div>
          </form>
        )}
      </ComponentCard>
    </div>
  );
}
