"use client";

import React, {
  useEffect,
  useState,
  ChangeEvent,
  FormEvent,
} from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ---------- Types ----------
type Category = {
  id: number;
  name: string;
};

type Subcategory = {
  id: number;
  name: string;
};

type SubcategoryType = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  category_id: number;
  subcategory_id: number;
  subcategory_type_id?: number | null;
  price: string;
  image_url: string | null;
  product_medias?: { image_url?: string }[];
};

type AlertType = {
  variant: "success" | "error" | "info";
  title: string;
  message: string;
};

// ---------- Component ----------
export default function AddDealPage() {
  const router = useRouter();
  const apiKey = "ecommerceapp";
  const { adminToken: token } = parseCookies();

  const [form, setForm] = useState({
    deal_name: "",
    category_id: "",
    subcategory_id: "",
    subcategory_type_id: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [types, setTypes] = useState<SubcategoryType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- Fetch dropdown data ---
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, subRes, typeRes] = await Promise.all([
          fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/category", {
            headers: { Authorization: `Bearer ${token}`, apiKey },
          }),
          fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory", {
            headers: { Authorization: `Bearer ${token}`, apiKey },
          }),
          fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory-type", {
            headers: { Authorization: `Bearer ${token}`, apiKey },
          }),
        ]);

        const [catData, subData, typeData] = await Promise.all([
          catRes.json(),
          subRes.json(),
          typeRes.json(),
        ]);

        if (catData.success) setCategories(catData.data);
        if (subData.success) setSubcategories(subData.data);
        if (typeData.success) setTypes(typeData.data);
      } catch {
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed to load category data.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOptions();
  }, [token]);

  // --- Handle input change ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- Fetch products when filters change ---
  useEffect(() => {
    const { category_id, subcategory_id, subcategory_type_id } = form;
    if (!category_id || !subcategory_id) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/product",
          {
            headers: { Authorization: `Bearer ${token}`, apiKey },
          }
        );
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          const filtered = data.data.filter((p: Product) => {
            const matchCat = p.category_id == Number(category_id);
            const matchSub = p.subcategory_id == Number(subcategory_id);
            const matchType =
              !subcategory_type_id ||
              p.subcategory_type_id == Number(subcategory_type_id);
            return matchCat && matchSub && matchType;
          });

          const withImageAndPrice = filtered.map((p: Product) => ({
            ...p,
            image_url: p.product_medias?.[0]?.image_url || null,
            price: p.price || "0.00",
          }));

          setProducts(withImageAndPrice);
        } else {
          setProducts([]);
        }
      } catch {
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed to fetch products.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProducts();
  }, [form, token]); // ✅ includes full form dependency

  // --- Handle product select ---
  const handleSelectProduct = (id: number) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // --- Select / Deselect All ---
  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProducts(products.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const allSelected =
    products.length > 0 && selectedProducts.length === products.length;

  // --- Submit Deal ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.deal_name || !form.category_id || !form.subcategory_id) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Deal name, category, and subcategory are required.",
      });
      return;
    }

    if (selectedProducts.length === 0) {
      setAlert({
        variant: "error",
        title: "No Products Selected",
        message: "Please select at least one product for the deal.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/deal",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            product_ids: selectedProducts,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setAlert({
          variant: "success",
          title: "Success",
          message: "Deal created successfully!",
        });
        setTimeout(() => router.push("/deals"), 1200);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to create deal.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Network Error",
        message: "Unable to connect to server.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- JSX ----------
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Deal" />

      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          showLink={false}
        />
      )}

      <ComponentCard title="Create New Deal">
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Deal name */}
            <div>
              <label>
                Deal Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="deal_name"
                value={form.deal_name}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label>
                Category <span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label>
                Subcategory <span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="subcategory_id"
                value={form.subcategory_id}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label>Subcategory Type (optional)</label>
              <select
                name="subcategory_type_id"
                value={form.subcategory_type_id}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              >
                <option value="">Select Type</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Table */}
            <div style={{ gridColumn: "1 / -1", marginTop: 16 }}>
              <h4>Products</h4>
              {products.length === 0 ? (
                <p style={{ color: "#777" }}>
                  No products found for the selected filters.
                </p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f4f4f4",
                        borderBottom: "2px solid #ddd",
                      }}
                    >
                      <th style={{ padding: "10px" }}>
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={allSelected}
                        />
                      </th>
                      <th style={{ padding: "10px" }}>ID</th>
                      <th style={{ padding: "10px" }}>Image</th>
                      <th style={{ padding: "10px" }}>Name</th>
                      <th style={{ padding: "10px" }}>Price</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((p, index) => (
                      <tr
                        key={p.id}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#fff" : "#fafafa",
                        }}
                      >
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(p.id)}
                            onChange={() => handleSelectProduct(p.id)}
                          />
                        </td>

                        <td style={{ textAlign: "center" }}>{p.id}</td>

                        <td style={{ textAlign: "center" }}>
                          {p.image_url ? (
                            <Image
                              src={p.image_url}
                              alt={p.name}
                              width={50}
                              height={50}
                              style={{
                                objectFit: "cover",
                                borderRadius: 6,
                                border: "1px solid #ddd",
                              }}
                            />
                          ) : (
                            <span style={{ color: "#999" }}>No Image</span>
                          )}
                        </td>

                        <td style={{ textAlign: "center" }}>{p.name}</td>
                        <td style={{ textAlign: "center" }}>₹{p.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ gridColumn: "1 / -1", marginTop: 16 }}>
              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Create Deal"}
              </button>
            </div>
          </form>
        )}
      </ComponentCard>
    </div>
  );
}
