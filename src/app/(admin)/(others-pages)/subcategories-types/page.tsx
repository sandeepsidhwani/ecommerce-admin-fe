"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";
import { parseCookies } from "nookies";
import { Pencil, Trash2, Plus } from "lucide-react";

type SubcategoryType = {
  id: number;
  name: string;
  is_active: boolean;
  category?: { id: number; name: string };
  subcategory?: { id: number; name: string };
};

export default function SubcategoryTypesPage() {
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const [types, setTypes] = useState<SubcategoryType[]>([]);
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTypes = async () => {
    try {
      const res = await fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory-type", {
        headers: { Authorization: `Bearer ${token}`, apiKey },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTypes(data.data);
      } else {
        setAlert({ variant: "error", title: "Error", message: "Failed to fetch subcategory types." });
      }
    } catch {
      setAlert({ variant: "error", title: "Network Error", message: "Could not load subcategory types." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subcategory type?")) return;
    try {
      const res = await fetch(`https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory-type/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, apiKey },
      });
      const data = await res.json();
      if (data.success) {
        setTypes((prev) => prev.filter((t) => t.id !== id));
        setAlert({ variant: "success", title: "Deleted", message: "Subcategory type deleted successfully!" });
      } else {
        setAlert({ variant: "error", title: "Error", message: "Failed to delete subcategory type." });
      }
    } catch {
      setAlert({ variant: "error", title: "Error", message: "Delete request failed." });
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Subcategory Types" />

      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          showLink={false}
        />
      )}

      <ComponentCard title="Subcategory Type List">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
          <Link href="/add-subcategory-types">
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
              <Plus style={{ width: "16px", height: "16px" }} /> Add Subcategory Type
            </Button>
          </Link>
        </div>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : types.length === 0 ? (
          <Alert variant="info" title="No Data" message="No subcategory types found." showLink={false} />
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
                <th style={{ padding: "10px" }}>Category</th>
                <th style={{ padding: "10px" }}>Subcategory</th>
                <th style={{ padding: "10px" }}>Active</th>
                <th style={{ padding: "10px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t, i) => (
                <tr key={t.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>{i + 1}</td>
                  <td style={{ padding: "10px", fontWeight: 500 }}>{t.name}</td>
                  <td style={{ padding: "10px" }}>{t.category?.name || "-"}</td>
                  <td style={{ padding: "10px" }}>{t.subcategory?.name || "-"}</td>
                  <td style={{ padding: "10px" }}>
                    <Badge color={t.is_active ? "success" : "error"} variant="solid">
                      {t.is_active ? "Active" : "Inactive"}
                    </Badge>
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
                      <Link href={`/edit-subcategory-types/${t.id}`}>
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
                        onClick={() => handleDelete(t.id)}
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
