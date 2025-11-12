"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Image from "next/image";

type AlertType = {
  variant: "success" | "error" | "info";
  title: string;
  message: string;
};

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const apiKey = "ecommerceapp";
  const { adminToken: token } = parseCookies();

  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState("");
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch category details
  useEffect(() => {
    if (!id || !token) return;

    const fetchCategory = async () => {
      try {
        const res = await fetch(
          `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/category/${id}`,
          {
            headers: { Authorization: `Bearer ${token}`, apiKey },
          }
        );

        const data = await res.json();

        if (res.ok && data.success && data.data) {
          setName(data.data.name || "");
          setExistingImage(data.data.image_url || "");
        } else {
          setAlert({
            variant: "error",
            title: "Error",
            message: data.message || "Failed to fetch category.",
          });
        }
      } catch {
        setAlert({
          variant: "error",
          title: "Error",
          message: "Something went wrong while loading category.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, token]); // ✅ Added token to dependency array

  // ✅ Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    if (!name.trim()) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Category name is required.",
      });
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);

      const res = await fetch(
        `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/category/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, apiKey },
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setAlert({
          variant: "success",
          title: "Success",
          message: "Category updated successfully!",
        });
        setTimeout(() => router.push("/categories"), 1000);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to update category.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Network Error",
        message: "Something went wrong while updating the category.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  // ✅ Render Page
  return (
    <div>
      <PageBreadcrumb pageTitle={`Edit Category #${id}`} />

      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          showLink={false}
        />
      )}

      <ComponentCard title="Edit Category Details">
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "16px",
            maxWidth: "500px",
          }}
        >
          {/* Category Name */}
          <div>
            <label
              style={{
                fontWeight: 600,
                marginBottom: "6px",
                display: "block",
              }}
            >
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="Enter category name"
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* Upload Image */}
          <div>
            <label
              style={{
                fontWeight: 600,
                marginBottom: "6px",
                display: "block",
              }}
            >
              Category Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setImage(e.target.files?.[0] ?? null)
              }
              style={{
                width: "100%",
                border: "1px solid #ddd",
                borderRadius: "6px",
                padding: "6px",
              }}
            />
          </div>

          {/* Existing Image */}
          {existingImage && (
            <div>
              <p style={{ fontWeight: 500, marginBottom: "6px" }}>
                Current Image:
              </p>
              <Image
                src={existingImage}
                alt="Current Category"
                width={120}
                height={120}
                style={{
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "16px",
            }}
          >
            <button
              type="button"
              color="dark"
              onClick={() => router.push("/categories")}
            >
              Cancel
            </button>

            <button
              type="submit"
              color="primary"
              disabled={saving}
            >
              {saving ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
