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

  // page items come from server per-page
  const [products, setProducts] = useState<Product[]>([]);
  // categories/sub filters (server fetched)
  const [categories, setCategories] = useState<any[]>([]);
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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const itemsPerPage = 20;

  const headers = { Authorization: `Bearer ${token}`, apiKey };

  const extractTotalFromResponse = (resp: any): number | null => {
    if (!resp) return null;
    if (typeof resp.total === "number") return resp.total;
    if (resp.meta && typeof resp.meta.total === "number") return resp.meta.total;
    if (resp.pagination && typeof resp.pagination.total === "number")
      return resp.pagination.total;
    if (resp.data && Array.isArray(resp.data) && typeof resp.data.total === "number")
      return resp.data.total;
    return null;
  };

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(itemsPerPage));
      if (filters.category_id) params.set("category_id", filters.category_id);
      if (filters.subcategory_id) params.set("subcategory_id", filters.subcategory_id);
      if (filters.subcategory_type_id)
        params.set("subcategory_type_id", filters.subcategory_type_id);

      const url = `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/product?${params.toString()}`;

      const res = await fetch(url, { headers });
      const data = await res.json();

      const possibleArray =
        (data && Array.isArray(data.data) && data.data) ||
        (data && Array.isArray(data.results) && data.results) ||
        [];

      setProducts(possibleArray);

      const extractedTotal = extractTotalFromResponse(data);
      if (extractedTotal !== null) {
        setTotalCount(extractedTotal);
      } else {
        if (totalCount === null) setTotalCount(2700);
      }

      setCurrentPage(page);
    } catch (err) {
      console.error("fetchProducts error:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed to load products for page " + page,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const catRes = await fetch(
          "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/category",
          { headers }
        );
        const catData = await catRes.json();
        if (catData.success && Array.isArray(catData.data)) setCategories(catData.data);
        await fetchProducts(1);
      } catch (err) {
        console.error(err);
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed to load initial data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [token]);

  // Fetch subcategories/types for filters
  const fetchSubcategories = async (categoryId: number) => {
    try {
      const res = await fetch(
        `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory?category_id=${categoryId}`,
        { headers }
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setFilteredSubcategories(data.data);
        setFilteredTypes([]);
      }
    } catch {
      console.warn("Failed to load subcategories");
    }
  };

  const fetchSubcategoryTypes = async (subcategoryId: number) => {
    try {
      const res = await fetch(
        `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/subcategory-type?subcategory_id=${subcategoryId}`,
        { headers }
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setFilteredTypes(data.data);
    } catch {
      console.warn("Failed to load subcategory types");
    }
  };

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFilters((prev) => ({ ...prev, [name]: value }));

    if (name === "category_id") {
      if (value) fetchSubcategories(parseInt(value));
      setFilters({
        category_id: value,
        subcategory_id: "",
        subcategory_type_id: "",
      });
    }

    if (name === "subcategory_id") {
      if (value) fetchSubcategoryTypes(parseInt(value));
      setFilters((prev) => ({
        ...prev,
        subcategory_id: value,
        subcategory_type_id: "",
      }));
    }

    if (name === "subcategory_type_id") {
      setFilters((prev) => ({ ...prev, subcategory_type_id: value }));
    }
    setTimeout(() => fetchProducts(1), 0);
  };

  const handleClearFilters = () => {
    setFilters({ category_id: "", subcategory_id: "", subcategory_type_id: "" });
    setFilteredSubcategories([]);
    setFilteredTypes([]);
    fetchProducts(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(
        `https://ecommerce.sidhwanitechnologies.com/api/v1/admin/product/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );
      const data = await res.json();
      if (data.success) {
        setAlert({
          variant: "success",
          title: "Deleted",
          message: "Product deleted successfully!",
        });
        const computedTotal = (totalCount ?? 2700) - 1;
        const computedPages = Math.max(1, Math.ceil(computedTotal / itemsPerPage));
        const nextPage = Math.min(currentPage, computedPages);
        setTotalCount(computedTotal);
        await fetchProducts(nextPage);
      } else {
        setAlert({ variant: "error", title: "Error", message: "Delete failed." });
      }
    } catch (err) {
      console.error(err);
      setAlert({ variant: "error", title: "Error", message: "Request failed." });
    }
  };

  const actualTotal = totalCount ?? 2700;
  const totalPages = Math.max(1, Math.ceil(actualTotal / itemsPerPage));

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPageButtons = (total: number, current: number, maxButtons = 10) => {
    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const left = 1;
    const right = total;

    const siblingCount = Math.floor((maxButtons - 3) / 2); // leave space for first,last and two ellipses maybe
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
                  products.map((p, idx) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                    return (
                      <tr
                        key={p.id}
                        style={{
                          borderTop: "1px solid #e5e7eb",
                          background: idx % 2 === 0 ? "#fff" : "#fdfdfd",
                        }}
                      >
                        <td style={{ padding: "10px" }}>{globalIndex}</td>
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
                      variant={currentPage === p ? "solid" : "outline"}
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
