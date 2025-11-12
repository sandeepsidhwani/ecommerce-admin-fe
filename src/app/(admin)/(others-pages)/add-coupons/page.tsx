"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";


interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  category_id?: number;
}

interface CouponForm {
  name: string;
  type: "percentage" | "fixed";
  amount: string;
  expiry_date: string;
  total_coupons: string;
  min_order_value: string;
  is_active: boolean;
}

interface AlertData {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export default function AddCouponPage() {
  const apiKey = "ecommerceapp";
  const { adminToken: token } = parseCookies();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [formData, setFormData] = useState<CouponForm>({
    name: "",
    type: "percentage",
    amount: "",
    expiry_date: "",
    total_coupons: "",
    min_order_value: "",
    is_active: true,
  });

  const [alert, setAlert] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/category", {
            headers: { Authorization: `Bearer ${token}`, apiKey },
          }),
          fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory", {
            headers: { Authorization: `Bearer ${token}`, apiKey },
          }),
        ]);

        const catData = await catRes.json();
        const subData = await subRes.json();

        if (catData.success && Array.isArray(catData.data)) {
          setCategories(catData.data);
        }
        if (subData.success && Array.isArray(subData.data)) {
          setSubcategories(subData.data);
        }
      } catch {
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed to load dropdown data.",
        });
      }
    };

    fetchOptions();
  }, [token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const payload = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : 0,
        total_coupons: formData.total_coupons ? parseInt(formData.total_coupons, 10) : 0,
        min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) : 0,
        associations: [] as { category_id?: number; subcategory_id?: number }[],
      };

      if (selectedCategory) payload.associations.push({ category_id: Number(selectedCategory) });
      if (selectedSubcategory) payload.associations.push({ subcategory_id: Number(selectedSubcategory) });

      const res = await fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setAlert({
          variant: "success",
          title: "Success",
          message: "Coupon created successfully!",
        });
        setTimeout(() => router.push("/coupons"), 1000);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to create coupon.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Network request failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Coupon" />
      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          showLink={false}
        />
      )}

      <ComponentCard title="Create New Coupon">
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <input
            type="text"
            name="name"
            placeholder="Coupon Name"
            value={formData.name}
            onChange={handleChange}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
            required
          />

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
          </select>

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
            required
          />

          <input
            type="date"
            name="expiry_date"
            value={formData.expiry_date}
            onChange={handleChange}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
            required
          />

          <input
            type="number"
            name="total_coupons"
            placeholder="Total Coupons"
            value={formData.total_coupons}
            onChange={handleChange}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
            required
          />

          <input
            type="number"
            name="min_order_value"
            placeholder="Min Order Value"
            value={formData.min_order_value}
            onChange={handleChange}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
            required
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
          >
            <option value="">Select Subcategory</option>
            {subcategories
              .filter(
                (s) =>
                  !s.category_id ||
                  !selectedCategory ||
                  String(s.category_id) === selectedCategory
              )
              .map((sub) => (
                <option key={sub.id} value={String(sub.id)}>
                  {sub.name}
                </option>
              ))}
          </select>

          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            Active
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Coupon"}
          </button>
        </form>
      </ComponentCard>
    </div>
  );
}
