"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import { parseCookies } from "nookies";

type AlertType = {
  variant: "success" | "error" | "info";
  title: string;
  message: string;
};

type SubcategoryForm = {
  name: string;
  category_id: string;
  is_active: boolean;
  image_url: string;
};

export default function EditSubcategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const [form, setForm] = useState<SubcategoryForm>({
    name: "",
    category_id: "",
    is_active: false,
    image_url: "",
  });

  const [alert, setAlert] = useState<AlertType | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async (subcategoryId: string, authToken: string) => {
    try {
      const res = await fetch(
        `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory/${subcategoryId}`,
        {
          headers: { Authorization: `Bearer ${authToken}`, apiKey },
        }
      );
      const data = await res.json();
      if (data.success && data.data) {
        setForm({
          name: data.data.name ?? "",
          category_id: String(data.data.category_id ?? ""),
          is_active: Boolean(data.data.is_active),
          image_url: data.data.image_url ?? "",
        });
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to load subcategory.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Network Error",
        message: "Failed to load subcategory.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) {
      fetchData(id, token);
    }
  }, [id, token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apiKey,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (data.success) {
        setAlert({
          variant: "success",
          title: "Success",
          message: "Subcategory updated successfully!",
        });
        setTimeout(() => router.push("/subcategories"), 1000);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to update subcategory.",
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

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div>
      <PageBreadcrumb pageTitle={`Edit Subcategory #${id}`} />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="Edit Subcategory Details">
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: "16px", maxWidth: "500px" }}
        >
          <div>
            <label style={{ fontWeight: 600 }}>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontWeight: 600 }}>Category ID</label>
            <input
              type="text"
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                style={{ marginRight: "6px" }}
              />
              Active
            </label>
          </div>

          <div>
            <label style={{ fontWeight: 600 }}>Image URL</label>
            <input
              type="text"
              value={form.image_url}
              onChange={(e) =>
                setForm({ ...form, image_url: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Button type="submit" color="primary" disabled={saving}>
              {saving ? "Updating..." : "Update Subcategory"}
            </Button>
             <Button
              color="dark"
              variant="outline"
              type="button"
              onClick={() => router.push("/subcategories")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
