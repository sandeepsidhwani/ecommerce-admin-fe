"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { parseCookies } from "nookies";
import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
};

export default function CategoriesPage() {
  const apiKey = "ecommerceapp";
  const { adminToken: token } = parseCookies();
  const [categories, setCategories] = useState<Category[]>([]);
  const [alert, setAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/category", {
        headers: { Authorization: `Bearer ${token}`, apiKey },
      });
      const data = await res.json();
      if (data.success && data.data) setCategories(data.data);
      else setAlert({ variant: "error", title: "Error", message: "Failed to load categories." });
    } catch {
      setAlert({ variant: "error", title: "Error", message: "Network error while loading categories." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(
        `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/category/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}`, apiKey },
        }
      );
      const data = await res.json();
      if (data.success) {
        setCategories(categories.filter((c) => c.id !== id));
        setAlert({ variant: "success", title: "Deleted", message: "Category deleted successfully!" });
      } else {
        setAlert({ variant: "error", title: "Error", message: "Delete failed." });
      }
    } catch {
      setAlert({ variant: "error", title: "Error", message: "Request failed." });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Categories" />

      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          showLink={false}
        />
      )}

      <ComponentCard title="Category List">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
          <Link href="/add-category">
            <Button
              color="primary"
              variant="outline"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                fontWeight: 600,
                borderRadius: "6px",
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} /> Add Category
            </Button>
          </Link>
        </div>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f9fafb",
                  textAlign: "left",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                <th style={{ padding: "12px 10px", fontWeight: 600 }}>#</th>
                <th style={{ padding: "12px 10px", fontWeight: 600 }}>Category Name</th>
                <th style={{ padding: "12px 10px", fontWeight: 600 }}>Image</th>
                <th style={{ padding: "12px 10px", fontWeight: 600, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr
                  key={cat.id}
                  style={{
                    borderTop: "1px solid #e5e7eb",
                    background: index % 2 === 0 ? "#fff" : "#fdfdfd",
                  }}
                >
                  <td style={{ padding: "10px" }}>{index + 1}</td>
                  <td style={{ padding: "10px", fontWeight: 500 }}>
                    {cat.name}
                    {cat.slug && (
                      <Badge
                        color="secondary"
                        variant="solid"
                        style={{ marginLeft: "6px" }}
                      >
                        {cat.slug}
                      </Badge>
                    )}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        style={{ width: "60px", height: "60px", borderRadius: "6px" }}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Link href={`/edit-category/${cat.id}`}>
                        <Button
                          color="info"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "36px",
                            height: "36px",
                            borderRadius: "6px",
                          }}
                        >
                          <Pencil style={{ width: "16px", height: "16px" }} />
                        </Button>
                      </Link>

                      <Button
                        color="error"
                        onClick={() => handleDelete(cat.id)}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "36px",
                          height: "36px",
                          borderRadius: "6px",
                        }}
                      >
                        <Trash2 style={{ width: "16px", height: "16px" }} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ComponentCard>
    </div>
  );
}
