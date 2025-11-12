"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";

type Category = { id: number; name: string };

interface AlertType {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export default function AddSubcategoryPage() {
  const router = useRouter();
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/category",
          {
            headers: { Authorization: `Bearer ${token}`, apiKey },
          }
        );
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch {
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed to load categories.",
        });
      }
    };
    if (token) fetchCategories();
  }, [token]); // ✅ added token as dependency

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || !image) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "All fields are required.",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", image);
      formData.append("category_id", categoryId);
      formData.append("is_active", String(isActive));

      const res = await fetch(
        "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, apiKey },
          body: formData,
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        setAlert({
          variant: "success",
          title: "Success",
          message: "Subcategory added successfully!",
        });
        setTimeout(() => router.push("/subcategories"), 1000);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to add subcategory.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Network Error",
        message: "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Subcategory" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="Add New Subcategory">
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: "16px", maxWidth: "500px" }}
        >
          <div>
            <label style={{ fontWeight: 600 }}>Subcategory Name</label>
            <input
              type="text"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="Enter subcategory name"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 600 }}>Select Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            >
              <option value="">Select</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 600 }}>Subcategory Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setImage(e.target.files ? e.target.files[0] : null)
              }
              style={{
                width: "100%",
                border: "1px solid #ddd",
                borderRadius: "6px",
                padding: "6px",
              }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ marginRight: "6px" }}
              />
              Active
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Add Subcategory"}
          </button>
        </form>
      </ComponentCard>
    </div>
  );
}
