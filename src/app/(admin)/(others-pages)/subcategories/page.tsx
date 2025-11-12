"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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

type AlertType = {
  variant: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
};

type ApiResponse = {
  data?: Subcategory[];
  results?: Subcategory[];
  total?: number;
  meta?: { total?: number };
  pagination?: { total?: number };
  success?: boolean;
  message?: string;
};

export default function SubcategoriesPage() {
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const itemsPerPage = 20;

  // ✅ Use useMemo to prevent re-creation of headers object
  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      apiKey,
    }),
    [token, apiKey]
  );

  const extractTotalFromResponse = (resp: ApiResponse): number | null => {
    if (!resp) return null;
    if (typeof resp.total === "number") return resp.total;
    if (resp.meta?.total) return resp.meta.total;
    if (resp.pagination?.total) return resp.pagination.total;
    return null;
  };

  const fetchSubcategories = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(itemsPerPage));

        const res = await fetch(
          `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory?${params.toString()}`,
          { headers }
        );
        const data: ApiResponse = await res.json();

        const possibleArray =
          (Array.isArray(data.data) && data.data) ||
          (Array.isArray(data.results) && data.results) ||
          [];

        setSubcategories(possibleArray);

        const extractedTotal = extractTotalFromResponse(data);
        if (extractedTotal !== null) {
          setTotalCount(extractedTotal);
        } else if (totalCount === null) {
          setTotalCount(130);
        }

        setCurrentPage(page);
      } catch (err) {
        console.error("fetchSubcategories error:", err);
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed to load subcategories for page " + page,
        });
      } finally {
        setLoading(false);
      }
    },
    [headers, itemsPerPage, totalCount]
  );

  useEffect(() => {
    fetchSubcategories(1);
  }, [fetchSubcategories]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      const res = await fetch(
        `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );
      const data: ApiResponse = await res.json();
      if (data.success) {
        setAlert({
          variant: "success",
          title: "Deleted",
          message: "Subcategory deleted successfully!",
        });
        const computedTotal = (totalCount ?? 130) - 1;
        const computedPages = Math.max(1, Math.ceil(computedTotal / itemsPerPage));
        const nextPage = Math.min(currentPage, computedPages);
        setTotalCount(computedTotal);
        await fetchSubcategories(nextPage);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Delete failed.",
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Request failed.",
      });
    }
  };

  const actualTotal = totalCount ?? 130;
  const totalPages = Math.max(1, Math.ceil(actualTotal / itemsPerPage));

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchSubcategories(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPageButtons = (
    total: number,
    current: number,
    maxButtons = 10
  ): (number | string)[] => {
    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

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
                  <th style={{ padding: "10px" }}>Category ID</th>
                  <th style={{ padding: "10px" }}>Active</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "15px", color: "#777" }}>
                      No subcategories found.
                    </td>
                  </tr>
                ) : (
                  subcategories.map((sub, idx) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                    return (
                      <tr
                        key={sub.id}
                        style={{
                          borderTop: "1px solid #eee",
                          background: idx % 2 === 0 ? "#fff" : "#fdfdfd",
                        }}
                      >
                        <td style={{ padding: "10px" }}>{globalIndex}</td>
                        <td style={{ padding: "10px", fontWeight: 500 }}>{sub.name}</td>
                        <td style={{ padding: "10px" }}>{sub.category_id}</td>
                        <td style={{ padding: "10px" }}>
                          <Badge color={sub.is_active ? "success" : "error"} variant="solid">
                            {sub.is_active ? "Active" : "Inactive"}
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
                    );
                  })
                )}
              </tbody>
            </table>

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
                    <span key={"dot-" + i} style={{ padding: "8px 6px" }}>
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
