"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { parseCookies } from "nookies";
import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";

type Subcategory = {
  id: number;
  name: string;
  category_id: number;
  is_active: boolean;
  image_url?: string;
};

export default function SubcategoriesPage() {
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubcategories = async () => {
    try {
      const res = await fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory", {
        headers: { Authorization: `Bearer ${token}`, apiKey },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSubcategories(data.data);
      } else {
        setAlert({ variant: "error", title: "Error", message: "Failed to load subcategories." });
      }
    } catch {
      setAlert({ variant: "error", title: "Error", message: "Network error while loading subcategories." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      const res = await fetch(`https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, apiKey },
      });
      const data = await res.json();
      if (data.success) {
        setSubcategories((prev) => prev.filter((s) => s.id !== id));
        setAlert({ variant: "success", title: "Deleted", message: "Subcategory deleted successfully!" });
      } else {
        setAlert({ variant: "error", title: "Error", message: "Delete failed." });
      }
    } catch {
      setAlert({ variant: "error", title: "Error", message: "Request failed." });
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Subcategories" />

      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          showLink={false}
        />
      )}

      <ComponentCard title="Subcategory List">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
          <Link href="/add-subcategories">
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
              <Plus style={{ width: "16px", height: "16px" }} /> Add Subcategory
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
            }}
          >
            <thead>
              <tr style={{ background: "#f9fafb", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "10px" }}>#</th>
                <th style={{ padding: "10px" }}>Name</th>
                <th style={{ padding: "10px" }}>Category ID</th>
                <th style={{ padding: "10px" }}>Active</th>
                <th style={{ padding: "10px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map((sub, i) => (
                <tr key={sub.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>{i + 1}</td>
                  <td style={{ padding: "10px", fontWeight: 500 }}>{sub.name}</td>
                  <td style={{ padding: "10px" }}>{sub.category_id}</td>
                  <td style={{ padding: "10px" }}>
                    <Badge
                      color={sub.is_active ? "success" : "error"}
                      variant="solid"
                    >
                      {sub.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                      <Link href={`/subcategory/${sub.id}`}>
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
                        onClick={() => handleDelete(sub.id)}
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
