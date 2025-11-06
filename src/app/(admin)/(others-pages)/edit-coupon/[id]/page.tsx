"use client";

import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { parseCookies } from "nookies";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";

export default function EditCouponPage() {
  const router = useRouter();
  const { id } = useParams();
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const BASE_URL = "https://ecommerce.sidhwanitechnologies.com/api/v1/admin";
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "percentage",
    amount: "",
    expiry_date: "",
    total_coupons: "",
    min_order_value: "",
    is_active: true,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          fetch(`${BASE_URL}/category`, { headers: { Authorization: `Bearer ${token}`, apiKey } }),
          fetch(`${BASE_URL}/subcategory`, { headers: { Authorization: `Bearer ${token}`, apiKey } }),
        ]);

        const catData = await catRes.json();
        const subData = await subRes.json();
        if (catData.success) setCategories(catData.data);
        if (subData.success) setSubcategories(subData.data);
      } catch {
        setAlert({ variant: "error", title: "Error", message: "Failed to load categories." });
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const res = await fetch(`${BASE_URL}/coupon/${id}`, {
          headers: { Authorization: `Bearer ${token}`, apiKey },
        });
        const data = await res.json();

        if (data.success && data.coupon) {
          const c = data.coupon;
          setForm({
            name: c.name || "",
            type: c.type || "percentage",
            amount: c.amount || "",
            expiry_date: c.expiry_date ? c.expiry_date.split("T")[0] : "",
            total_coupons: c.total_coupons || "",
            min_order_value: c.min_order_value || "",
            is_active: c.is_active || false,
          });

          const assocCat = (c.associations || []).find((a: any) => a.category_id);
          const assocSub = (c.associations || []).find((a: any) => a.subcategory_id);
          if (assocCat) setSelectedCategory(String(assocCat.category_id));
          if (assocSub) setSelectedSubcategory(String(assocSub.subcategory_id));
        } else {
          setAlert({ variant: "error", title: "Error", message: "Failed to load coupon." });
        }
      } catch {
        setAlert({ variant: "error", title: "Error", message: "Network error loading coupon." });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCoupon();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      amount: parseFloat(form.amount || "0"),
      total_coupons: parseInt(form.total_coupons || "0"),
      min_order_value: parseFloat(form.min_order_value || "0"),
      associations: [],
    };

    if (selectedCategory) payload.associations.push({ category_id: Number(selectedCategory) });
    if (selectedSubcategory) payload.associations.push({ subcategory_id: Number(selectedSubcategory) });

    try {
      const res = await fetch(`${BASE_URL}/coupon/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setAlert({ variant: "success", title: "Updated", message: "Coupon updated successfully!" });
        setTimeout(() => router.push("/coupons"), 1000);
      } else {
        setAlert({ variant: "error", title: "Error", message: data.message || "Failed to update coupon." });
      }
    } catch {
      setAlert({ variant: "error", title: "Network Error", message: "Unable to update coupon." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Coupon" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title={`Edit Coupon #${id}`}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "10px" }}>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
            {/* Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontWeight: 600 }}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "6px" }}
                />
              </div>
              <div>
                <label style={{ fontWeight: 600 }}>Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "6px" }}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontWeight: 600 }}>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "6px" }}
                />
              </div>
              <div>
                <label style={{ fontWeight: 600 }}>Expiry Date</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={form.expiry_date}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "6px" }}
                />
              </div>
              <div>
                <label style={{ fontWeight: 600 }}>Total Coupons</label>
                <input
                  type="number"
                  name="total_coupons"
                  value={form.total_coupons}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "6px" }}
                />
              </div>
            </div>

            {/* Row 3 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontWeight: 600 }}>Min Order Value</label>
                <input
                  type="number"
                  name="min_order_value"
                  value={form.min_order_value}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "6px" }}
                />
              </div>
              <div>
                <label style={{ fontWeight: 600 }}>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "6px" }}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 600 }}>Subcategory</label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "6px" }}
                >
                  <option value="">Select Subcategory</option>
                  {subcategories
                    .filter((s) => !selectedCategory || String(s.category_id) === selectedCategory)
                    .map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Row 4 */}
            <div>
              <label style={{ fontWeight: 600 }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  style={{ marginRight: "8px" }}
                />
                Active
              </label>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Updating..." : "Update Coupon"}
            </Button>
          </form>
        )}
      </ComponentCard>
    </div>
  );
}
