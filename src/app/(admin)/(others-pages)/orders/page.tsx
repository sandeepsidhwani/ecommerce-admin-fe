"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { parseCookies } from "nookies";
import { Eye } from "lucide-react";

type User = {
  id?: number;
  name?: string;
  email?: string;
};

type Address = {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
};

type Order = {
  id: number;
  user?: User;
  address?: Address;
  grand_total?: number | string;
  created_at?: string;
  // other fields from API can exist but are optional
  [key: string]: unknown;
};

type AlertState = {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
};

export default function OrdersPage() {
  const apiKey = "ecommerceapp";
  const { adminToken: token } = parseCookies();

  const [orders, setOrders] = useState<Order[]>([]);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const itemsPerPage = 20;

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}`, apiKey }), [token]);

  const extractTotalFromResponse = (resp: unknown): number | null => {
    if (!resp || typeof resp !== "object") return null;
    const r = resp as Record<string, unknown>;
    if (typeof r.total === "number") return r.total;
    if (r.meta && typeof (r.meta as Record<string, unknown>).total === "number")
      return (r.meta as Record<string, number>).total;
    if (
      r.pagination &&
      typeof (r.pagination as Record<string, unknown>).total === "number"
    )
      return (r.pagination as Record<string, number>).total;
    if (r.data && typeof (r.data as Record<string, unknown>).total === "number")
      return (r.data as Record<string, number>).total;
    return null;
  };

  const fetchOrders = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(itemsPerPage));

        const url = `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/orders?${params.toString()}`;

        const res = await fetch(url, { headers });
        const data = await res.json();

        if (data && data.success && Array.isArray(data.data)) {
          setOrders(data.data as Order[]);
        } else if (data && Array.isArray(data.data)) {
          // in case API returns success false but still provides data
          setOrders(data.data as Order[]);
        } else {
          setOrders([]);
          setAlert({
            variant: "error",
            title: "Error",
            message: (data && (data.msg || data.message)) || "Failed to fetch orders.",
          });
        }

        const extractedTotal = extractTotalFromResponse(data);
        if (extractedTotal !== null) {
          setTotalCount(extractedTotal);
        } else if (totalCount === null) {
          // fallback estimate only once
          setTotalCount(2700);
        }

        setCurrentPage(page);
      } catch (err) {
        console.error("fetchOrders error:", err);
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed to load orders.",
        });
      } finally {
        setLoading(false);
      }
    },
    [headers, itemsPerPage, totalCount]
  );

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setOrders([]);
      return;
    }
    fetchOrders(1);
    // fetchOrders is stable via useCallback; include it in deps
  }, [fetchOrders, token]);

  const actualTotal = totalCount ?? 2700;
  const totalPages = Math.max(1, Math.ceil(actualTotal / itemsPerPage));

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchOrders(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPageButtons = (total: number, current: number, maxButtons = 10) => {
    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const left = 1;
    const right = total;

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

    pages.push(left);

    if (start > 2) pages.push("...");

    for (let p = start; p <= end; p++) pages.push(p);

    if (end < total - 1) pages.push("...");

    pages.push(right);

    return pages;
  };

  const pageButtons = buildPageButtons(totalPages, currentPage, 12);

  return (
    <div>
      <PageBreadcrumb pageTitle="Orders" />

      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          showLink={false}
        />
      )}

      <ComponentCard title="Orders List">
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
                  <th style={{ padding: "12px 10px", fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: "12px 10px", fontWeight: 600 }}>Total</th>
                  <th style={{ padding: "12px 10px", fontWeight: 600 }}>Address</th>
                  <th style={{ padding: "12px 10px", fontWeight: 600 }}>Date</th>
                  <th
                    style={{
                      padding: "12px 10px",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: "15px",
                        color: "#777",
                      }}
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order, idx) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                    const user = (order.user as User) ?? {};
                    const address = (order.address as Address) ?? {};

                    return (
                      <tr
                        key={order.id}
                        style={{
                          borderTop: "1px solid #e5e7eb",
                          background: idx % 2 === 0 ? "#fff" : "#fdfdfd",
                        }}
                      >
                        <td style={{ padding: "10px" }}>{globalIndex}</td>
                        <td style={{ padding: "10px" }}>
                          <strong>{user.name ?? "N/A"}</strong>
                          <br />
                          <span style={{ color: "#555", fontSize: "0.9rem" }}>
                            {user.email ?? ""}
                          </span>
                        </td>
                        <td style={{ padding: "10px" }}>
                          <Badge color="info" variant="solid">
                            ₹{String(order.grand_total ?? "0")}
                          </Badge>
                        </td>
                        <td style={{ padding: "10px", fontSize: "0.9rem" }}>
                          {address.name && <strong>{address.name}</strong>}
                          <br />
                          {address.address ? `${address.address}, ` : ""}
                          {address.city ? `${address.city}, ` : ""}
                          {address.state ?? ""}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.created_at ? new Date(String(order.created_at)).toLocaleDateString() : "-"}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button
                              color="info"
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "6px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Eye />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
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
                    <span key={"dot-" + i} style={{ padding: "8px 6px" }}>
                      {p}
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={currentPage === p ? "primary" : "outline"}
                      onClick={() => handlePageChange(p as number)}
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
