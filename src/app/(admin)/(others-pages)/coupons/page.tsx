"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { parseCookies } from "nookies";
import { Pencil, Trash2, Plus } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

export default function CouponsPage() {
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const [coupons, setCoupons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "https://ecommerce.sidhwanitechnologies.com/api/v1/admin";

  const fetchData = async () => {
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

      const couponData = await couponRes.json();
      const catData = await catRes.json();
      const subData = await subRes.json();

      if (couponData.success) setCoupons(couponData.coupons || []);
      if (catData.success) setCategories(catData.data || []);
      if (subData.success) setSubcategories(subData.data || []);
    } catch {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed to fetch coupons data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`${BASE_URL}/coupon/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, apiKey },
      });
      const data = await res.json();
      if (data.success) {
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
          message: data.message || "Failed to delete coupon.",
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

  const getAssociations = (coupon: any) => {
    if (!coupon.associations || coupon.associations.length === 0) return "-";

    const assocTexts: string[] = [];

    coupon.associations.forEach((a: any) => {
      if (a.category_id) {
        const cat = categories.find((c) => c.id === a.category_id);
        assocTexts.push(cat ? `Category: ${cat.name}` : `Category #${a.category_id}`);
      }
      if (a.subcategory_id) {
        const sub = subcategories.find((s) => s.id === a.subcategory_id);
        assocTexts.push(sub ? `Subcategory: ${sub.name}` : `Subcategory #${a.subcategory_id}`);
      }
    });

    return assocTexts.join(", ");
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Coupons" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="Coupons List">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
          <Link href="/add-coupons">
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
              <Plus style={{ width: "16px", height: "16px" }} /> Create Coupon
            </Button>
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
                  <td style={{ padding: "10px" }}>{c.amount}</td>
                  <td style={{ padding: "10px" }}>{new Date(c.expiry_date).toLocaleDateString()}</td>
                  <td style={{ padding: "10px" }}>{c.min_order_value}</td>
                  <td style={{ padding: "10px" }}>
                    <Badge color={c.is_active ? "success" : "error"}>
                      {c.is_active ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td style={{ padding: "10px" }}>
                    {c.total_used_coupons}/{c.total_coupons}
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
                        <Button
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
                        </Button>
                      </Link>
                      <Button
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
