"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";
import { parseCookies } from "nookies";
import { Pencil, Trash2, Plus } from "lucide-react";

// ✅ Type definitions
type SubcategoryType = {
  id: number;
  name: string;
  is_active: boolean;
  category?: { id: number; name: string };
  subcategory?: { id: number; name: string };
};

type ApiResponse = {
  data?: SubcategoryType[];
  results?: SubcategoryType[];
  total?: number;
  meta?: { total?: number };
  pagination?: { total?: number };
  success?: boolean;
  message?: string;
};

type AlertType = {
  variant: "success" | "error" | "info";
  title: string;
  message: string;
};

export default function SubcategoryTypesPage() {
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";
  const BASE_URL =
    "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory-type";

  const [types, setTypes] = useState<SubcategoryType[]>([]);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const itemsPerPage = 20;

  // ✅ FIX: Memoize headers so they don’t change on every render
  const headers = useMemo<HeadersInit>(
    () => ({
      Authorization: `Bearer ${token}`,
      apiKey,
    }),
    [token, apiKey]
  );

  // ✅ Helper to extract total count safely
  const extractTotalFromResponse = (resp: ApiResponse): number | null => {
    if (!resp) return null;
    if (typeof resp.total === "number") return resp.total;
    if (resp.meta?.total) return resp.meta.total;
    if (resp.pagination?.total) return resp.pagination.total;
    return null;
  };

  // ✅ Fetch subcategory types
  const fetchTypes = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(itemsPerPage),
        });

        const res = await fetch(`${BASE_URL}?${params.toString()}`, { headers });
        const data: ApiResponse = await res.json();

        const arrayData =
          (Array.isArray(data.data) && data.data) ||
          (Array.isArray(data.results) && data.results) ||
          [];

        setTypes(arrayData);

        const extractedTotal = extractTotalFromResponse(data);
        if (extractedTotal !== null) {
          setTotalCount(extractedTotal);
        } else if (totalCount === null) {
          setTotalCount(1087); // fallback value
        }

        setCurrentPage(page);
      } catch (err) {
        console.error("fetchTypes error:", err);
        setAlert({
          variant: "error",
          title: "Error",
          message: `Failed to load subcategory types for page ${page}`,
        });
      } finally {
        setLoading(false);
      }
    },
    [BASE_URL, headers, itemsPerPage, totalCount]
  );

  // ✅ Initial load
  useEffect(() => {
    fetchTypes(1);
  }, [fetchTypes]);

  // ✅ Delete logic
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subcategory type?")) return;
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers,
      });
      const data: ApiResponse = await res.json();

      if (data.success) {
        setAlert({
          variant: "success",
          title: "Deleted",
          message: "Subcategory type deleted successfully!",
        });

        const computedTotal = (totalCount ?? 1087) - 1;
        const computedPages = Math.max(1, Math.ceil(computedTotal / itemsPerPage));
        const nextPage = Math.min(currentPage, computedPages);

        setTotalCount(computedTotal);
        await fetchTypes(nextPage);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Delete failed.",
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({ variant: "error", title: "Error", message: "Request failed." });
    }
  };

  // ✅ Pagination Logic
  const actualTotal = totalCount ?? 1087;
  const totalPages = Math.max(1, Math.ceil(actualTotal / itemsPerPage));

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchTypes(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPageButtons = (
    total: number,
    current: number,
    maxButtons = 10
  ): (number | string)[] => {
    if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | string)[] = [];
    const siblingCount = Math.floor((maxButtons - 3) / 2);
    let start = Math.max(current - siblingCount, 2);
    let end = Math.min(current + siblingCount, total - 1);

    if (current - 1 <= siblingCount) {
      start = 2;
      end = Math.min(maxButtons - 2, total - 1);
    }
    if (total - current <= siblingCount) {
      start = Math.max(total - (maxButtons - 3), 2);
      end = total - 1;
    }

    pages.push(1);
    if (start > 2) pages.push("...");
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < total - 1) pages.push("...");
    pages.push(total);
    return pages;
  };

  const pageButtons = buildPageButtons(totalPages, currentPage, 12);

  // ✅ UI
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
        {/* Add Button */}
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

        {/* Table */}
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : types.length === 0 ? (
          <Alert
            variant="info"
            title="No Data"
            message="No subcategory types found."
            showLink={false}
          />
        ) : (
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
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
                  <th style={{ padding: "10px" }}>#</th>
                  <th style={{ padding: "10px" }}>Name</th>
                  <th style={{ padding: "10px" }}>Category</th>
                  <th style={{ padding: "10px" }}>Subcategory</th>
                  <th style={{ padding: "10px" }}>Active</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {types.map((t, i) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + i + 1;
                  return (
                    <tr key={t.id} style={{ borderTop: "1px solid #eee" }}>
                      <td style={{ padding: "10px" }}>{globalIndex}</td>
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
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "20px",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Prev
                </Button>

                {pageButtons.map((p, i) =>
                  typeof p === "string" ? (
                    <span key={`dot-${i}`} style={{ padding: "8px 6px" }}>
                      {p}
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={currentPage === p ? "primary" : "outline"}
                      onClick={() => handlePageChange(p)}
                      style={{
                        minWidth: "36px",
                        borderRadius: "6px",
                        background: currentPage === p ? "#2563eb" : "transparent",
                        color: currentPage === p ? "#fff" : "#000",
                      }}
                    >
                      {p}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </ComponentCard>
    </div>
  );
}
