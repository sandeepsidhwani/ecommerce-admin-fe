"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { parseCookies } from "nookies";
import { Pencil, Trash2, Plus } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Badge from "@/components/ui/badge/Badge";

type Category = { id: number; name: string };
type Subcategory = { id: number; name: string };

type Association = { category_id?: number; subcategory_id?: number };

type Coupon = {
  id: number;
  name: string;
  type: string;
  amount: number | string;
  expiry_date: string;
  total_coupons: number;
  total_used_coupons?: number;
  min_order_value?: number | string;
  is_active: boolean;
  associations?: Association[];
  // other possible fields from API may exist; keep optional
};

type AlertState = {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
};

export default function CouponsPage() {
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "https://ecommerce.sidhwanitechnologies.com/api/v1/admin";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [couponRes, catRes, subRes] = await Promise.all([
        fetch(`${BASE_URL}/coupon`, {
          headers: { Authorization: `Bearer ${token}`, apiKey },
        }),
        fetch(`${BASE_URL}/category`, {
          headers: { Authorization: `Bearer ${token}`, apiKey },
        }),
        fetch(`${BASE_URL}/subcategory`, {
          headers: { Authorization: `Bearer ${token}`, apiKey },
        }),
      ]);

      const [couponData, catData, subData] = await Promise.all([
        couponRes.json().catch(() => ({})),
        catRes.json().catch(() => ({})),
        subRes.json().catch(() => ({})),
      ]);

      // coupons may be returned under different keys depending on API shape
      const receivedCoupons: Coupon[] =
        (couponData && (couponData.data || couponData.coupons || couponData.rows)) ??
        [];

      if (Array.isArray(receivedCoupons)) setCoupons(receivedCoupons as Coupon[]);

      if (catData && Array.isArray(catData.data)) setCategories(catData.data as Category[]);
      if (subData && Array.isArray(subData.data))
        setSubcategories(subData.data as Subcategory[]);

      // If API sent error messages, surface them
      if (couponData && couponData.success === false) {
        setAlert({
          variant: "error",
          title: "Error",
          message: couponData.message || "Failed to load coupons.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed to fetch coupons data.",
      });
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, apiKey, token]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`${BASE_URL}/coupon/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, apiKey },
      });
      const data = await res.json();
      if (res.ok && (data.success ?? true)) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        setAlert({
          variant: "success",
          title: "Deleted",
          message: "Coupon deleted successfully!",
        });
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: (data && data.message) || "Failed to delete coupon.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Network Error",
        message: "Unable to delete coupon.",
      });
    }
  };

  const getAssociations = (coupon: Coupon) => {
    const assocs = coupon.associations;
    if (!assocs || assocs.length === 0) return "-";

    const assocTexts: string[] = [];

    assocs.forEach((a) => {
      if (a.category_id !== undefined && a.category_id !== null) {
        const cat = categories.find((c) => c.id === a.category_id);
        assocTexts.push(cat ? `Category: ${cat.name}` : `Category #${a.category_id}`);
      }
      if (a.subcategory_id !== undefined && a.subcategory_id !== null) {
        const sub = subcategories.find((s) => s.id === a.subcategory_id);
        assocTexts.push(sub ? `Subcategory: ${sub.name}` : `Subcategory #${a.subcategory_id}`);
      }
    });

    return assocTexts.length ? assocTexts.join(", ") : "-";
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Coupons" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="Coupons List">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
          <Link href="/add-coupons">
            <button
              color="primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                fontWeight: 600,
                borderRadius: "6px",
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} /> Create Coupon
            </button>
          </Link>
        </div>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : coupons.length === 0 ? (
          <Alert variant="info" title="No Data" message="No coupons found." showLink={false} />
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
              <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "10px" }}>#</th>
                <th style={{ padding: "10px" }}>Name</th>
                <th style={{ padding: "10px" }}>Type</th>
                <th style={{ padding: "10px" }}>Amount</th>
                <th style={{ padding: "10px" }}>Expiry</th>
                <th style={{ padding: "10px" }}>Min Order</th>
                <th style={{ padding: "10px" }}>Active</th>
                <th style={{ padding: "10px" }}>Used/Total</th>
                <th style={{ padding: "10px" }}>Associations</th>
                <th style={{ padding: "10px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c, i) => (
                <tr key={c.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>{i + 1}</td>
                  <td style={{ padding: "10px" }}>{c.name}</td>
                  <td style={{ padding: "10px" }}>{c.type}</td>
                  <td style={{ padding: "10px" }}>{String(c.amount)}</td>
                  <td style={{ padding: "10px" }}>
                    {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : "-"}
                  </td>
                  <td style={{ padding: "10px" }}>{String(c.min_order_value ?? "-")}</td>
                  <td style={{ padding: "10px" }}>
                    <Badge color={c.is_active ? "success" : "error"}>
                      {c.is_active ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td style={{ padding: "10px" }}>
                    {String(c.total_used_coupons ?? 0)}/{String(c.total_coupons ?? 0)}
                  </td>
                  <td style={{ padding: "10px" }}>{getAssociations(c)}</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Link href={`/edit-coupon/${c.id}`}>
                        <button
                          color="info"
                          style={{
                            width: "36px",
                            height: "36px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "6px",
                          }}
                        >
                          <Pencil style={{ width: "16px", height: "16px" }} />
                        </button>
                      </Link>
                      <button
                        color="error"
                        onClick={() => handleDelete(c.id)}
                        style={{
                          width: "36px",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "6px",
                        }}
                      >
                        <Trash2 style={{ width: "16px", height: "16px" }} />
                      </button>
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
