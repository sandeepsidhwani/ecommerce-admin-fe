"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/button/Button";

export default function AddCategoryPage() {
  const router = useRouter();
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const [form, setForm] = useState({
    name: "",
    image: null as File | null,
  });

  const [alert, setAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.[0]) {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!form.name.trim() || !form.image) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Both category name and image are required.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.image) formData.append("image", form.image);

      const res = await fetch(
        "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/category",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            apiKey,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setAlert({
          variant: "success",
          title: "Success",
          message: "Category added successfully!",
        });
        setTimeout(() => router.push("/categories"), 1000);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data?.message || "Failed to add category.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Network Error",
        message: "Something went wrong while adding the category.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Category" />

      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          showLink={false}
        />
      )}

      <ComponentCard title="Add New Category">
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
            <label
              style={{
                fontWeight: 500,
                marginBottom: "6px",
                display: "block",
              }}
            >
              Category Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
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

          <div>
            <label
              style={{
                fontWeight: 500,
                marginBottom: "6px",
                display: "block",
              }}
            >
              Category Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              required
              style={{
                width: "100%",
                border: "1px solid #ddd",
                padding: "6px",
                borderRadius: "6px",
              }}
            />
          </div>

          {form.image && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center" }}>
              <Image
                src={URL.createObjectURL(form.image)}
                alt="Preview"
                width={120}
                height={120}
                style={{
                  borderRadius: "8px",
                  objectFit: "cover",
                  marginTop: "10px",
                  border: "1px solid #ccc",
                }}
                unoptimized
              />
            </div>
          )}
          
           <br/>

          <div  
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "16px",
            }}>
            <Button type="submit" disabled={submitting} variant="primary">
              {submitting ? "Submitting..." : "Add Category"}
            </Button>
             <Button
              type="button"
              color="primary"
              variant="outline"
              onClick={() => router.push("/categories")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
