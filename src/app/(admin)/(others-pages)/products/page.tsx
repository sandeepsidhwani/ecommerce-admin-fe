"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { parseCookies } from "nookies";
import Link from "next/link";
import { Pencil, Trash2, Plus, Filter } from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  is_active: boolean;
  category_id?: number;
  subcategory_id?: number;
  subcategory_type_id?: number;
};

export default function ProductsPage() {
  const apiKey = "ecommerceapp";
  const { adminToken: token } = parseCookies();

  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);

  const [filteredSubcategories, setFilteredSubcategories] = useState<any[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<any[]>([]);

  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);

  const [filters, setFilters] = useState({
    category_id: "",
    subcategory_id: "",
    subcategory_type_id: "",
  });

  // ✅ Fetch categories and products immediately
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, productRes] = await Promise.all([
          fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/category", {
            headers: { Authorization: `Bearer ${token}`, apiKey },
          }),
          fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/product", {
            headers: { Authorization: `Bearer ${token}`, apiKey },
          }),
        ]);

        const [catData, productData] = await Promise.all([
          catRes.json(),
          productRes.json(),
        ]);

        if (catData.success) setCategories(catData.data);
        if (productData.success && Array.isArray(productData.data)) {
          setProducts(productData.data);
          setAllProducts(productData.data);
        } else {
          setProducts([]);
        }
      } catch {
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed to load products or categories.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [token]);

  // ✅ Fetch subcategories based on selected category
  const fetchSubcategories = async (categoryId: number) => {
    try {
      const res = await fetch(
        `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory?category_id=${categoryId}`,
        {
          headers: { Authorization: `Bearer ${token}`, apiKey },
        }
      );
      const data = await res.json();
      if (data.success) {
        setFilteredSubcategories(data.data);
        setFilteredTypes([]); // Reset types
      }
    } catch {
      console.warn("Failed to load subcategories");
    }
  };

  // ✅ Fetch subcategory types based on selected subcategory
  const fetchSubcategoryTypes = async (subcategoryId: number) => {
    try {
      const res = await fetch(
        `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory-type?subcategory_id=${subcategoryId}`,
        {
          headers: { Authorization: `Bearer ${token}`, apiKey },
        }
      );
      const data = await res.json();
      if (data.success) setFilteredTypes(data.data);
    } catch {
      console.warn("Failed to load subcategory types");
    }
  };

  // ✅ Handle dropdown logic dynamically
  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFilters((prev) => ({ ...prev, [name]: value }));

    if (name === "category_id") {
      if (value) {
        fetchSubcategories(parseInt(value));
      }
      setFilters({
        category_id: value,
        subcategory_id: "",
        subcategory_type_id: "",
      });
    }

    if (name === "subcategory_id") {
      if (value) {
        fetchSubcategoryTypes(parseInt(value));
      }
      setFilters((prev) => ({
        ...prev,
        subcategory_id: value,
        subcategory_type_id: "",
      }));
    }

    if (name === "subcategory_type_id") {
      setFilters((prev) => ({ ...prev, subcategory_type_id: value }));
    }
  };

  // ✅ Filter products client-side instantly
  useEffect(() => {
    if (
      !filters.category_id &&
      !filters.subcategory_id &&
      !filters.subcategory_type_id
    ) {
      setProducts(allProducts);
      return;
    }

    const catId = filters.category_id ? parseInt(filters.category_id) : null;
    const subId = filters.subcategory_id ? parseInt(filters.subcategory_id) : null;
    const typeId = filters.subcategory_type_id
      ? parseInt(filters.subcategory_type_id)
      : null;

    const filtered = allProducts.filter((p) => {
      const matchCat = !catId || p.category_id === catId;
      const matchSub = !subId || p.subcategory_id === subId;
      const matchType = !typeId || p.subcategory_type_id === typeId;
      return matchCat && matchSub && matchType;
    });

    setProducts(filtered);
  }, [filters, allProducts]);

  const handleClearFilters = () => {
    setFilters({ category_id: "", subcategory_id: "", subcategory_type_id: "" });
    setFilteredSubcategories([]);
    setFilteredTypes([]);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(
        `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/product/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}`, apiKey },
        }
      );
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p.id !== id));
        setAllProducts(allProducts.filter((p) => p.id !== id));
        setAlert({
          variant: "success",
          title: "Deleted",
          message: "Product deleted successfully!",
        });
      } else {
        setAlert({ variant: "error", title: "Error", message: "Delete failed." });
      }
    } catch {
      setAlert({ variant: "error", title: "Error", message: "Request failed." });
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Products" />

      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          showLink={false}
        />
      )}

      <ComponentCard title="Products List">
        {/* --- Buttons --- */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginBottom: "15px",
          }}
        >
          <Button
            color="secondary"
            variant="outline"
            onClick={() => setFilterVisible((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              fontWeight: 600,
              borderRadius: "6px",
            }}
          >
            <Filter style={{ width: "16px", height: "16px" }} />
            {filterVisible ? "Hide Filters" : "Add Filter"}
          </Button>

          <Link href="/add-products">
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
              <Plus style={{ width: "16px", height: "16px" }} /> Add Product
            </Button>
          </Link>
        </div>

        {/* --- Filters Section (Instantly visible when toggled) --- */}
        {filterVisible && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "10px",
              marginBottom: "15px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              background: "#fafafa",
              transition: "all 0.3s ease",
            }}
          >
            {/* Category */}
            <div>
              <label>Category</label>
              <select
                name="category_id"
                value={filters.category_id}
                onChange={handleFilterChange}
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
            {filteredSubcategories.length > 0 && (
              <div>
                <label>Subcategory</label>
                <select
                  name="subcategory_id"
                  value={filters.subcategory_id}
                  onChange={handleFilterChange}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                  }}
                >
                  <option value="">Select Subcategory</option>
                  {filteredSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Type */}
            {filteredTypes.length > 0 && (
              <div>
                <label>Subcategory Type</label>
                <select
                  name="subcategory_type_id"
                  value={filters.subcategory_type_id}
                  onChange={handleFilterChange}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                  }}
                >
                  <option value="">Select Type</option>
                  {filteredTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "end" }}>
              <Button
                type="button"
                variant="outline"
                color="error"
                onClick={handleClearFilters}
                style={{
                  padding: "8px 14px",
                  fontWeight: 600,
                  borderRadius: "6px",
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* --- Product Table --- */}
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : (
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
                <th style={{ padding: "12px 10px", fontWeight: 600 }}>Name</th>
                <th style={{ padding: "12px 10px", fontWeight: 600 }}>Price</th>
                <th style={{ padding: "12px 10px", fontWeight: 600 }}>Quantity</th>
                <th style={{ padding: "12px 10px", fontWeight: 600 }}>Status</th>
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
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "15px",
                      color: "#777",
                    }}
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p, index) => (
                  <tr
                    key={p.id}
                    style={{
                      borderTop: "1px solid #e5e7eb",
                      background: index % 2 === 0 ? "#fff" : "#fdfdfd",
                    }}
                  >
                    <td style={{ padding: "10px" }}>{index + 1}</td>
                    <td style={{ padding: "10px", fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: "10px" }}>₹{p.price}</td>
                    <td style={{ padding: "10px" }}>{p.quantity}</td>
                    <td style={{ padding: "10px" }}>
                      <Badge color={p.is_active ? "success" : "error"} variant="solid">
                        {p.is_active ? "Active" : "Inactive"}
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
                        <Link href={`/product/${p.id}`}>
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
                            <Pencil />
                          </Button>
                        </Link>

                        <Button
                          color="error"
                          onClick={() => handleDelete(p.id)}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "6px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </ComponentCard>
    </div>
  );
}
