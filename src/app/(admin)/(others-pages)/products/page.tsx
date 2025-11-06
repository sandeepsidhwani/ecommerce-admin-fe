"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { parseCookies } from "nookies";
import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";

type Product = {
    id: number;
    name: string;
    price: number;
    quantity: number;
    is_active: boolean;
};

export default function ProductsPage() {
    const apiKey = "ecommerceapp";
    const { adminToken: token } = parseCookies();
    const [products, setProducts] = useState<Product[]>([]);
    const [alert, setAlert] = useState<{
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const res = await fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/product", {
                headers: { Authorization: `Bearer ${token}`, apiKey },
            });
            const data = await res.json();
            if (data.success && data.data) setProducts(data.data);
            else setAlert({ variant: "error", title: "Error", message: "Failed to load products." });
        } catch {
            setAlert({ variant: "error", title: "Error", message: "Network error." });
        } finally {
            setLoading(false);
        }
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
                setAlert({ variant: "success", title: "Deleted", message: "Product deleted successfully!" });
            } else {
                setAlert({ variant: "error", title: "Error", message: "Delete failed." });
            }
        } catch {
            setAlert({ variant: "error", title: "Error", message: "Request failed." });
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

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
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
                    <Link href="/add-products">
                        <Button color="primary" variant="outline" style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 14px",
                            fontWeight: 600,
                            borderRadius: "6px",
                        }}>
                            <Plus style={{ width: "16px", height: "16px" }} /> Add Product
                        </Button>
                    </Link>
                </div>

                {loading ? (
                   <p style={{ textAlign: "center" }}>Loading...</p>
                ) : (
                    <table style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        overflow: "hidden",
                    }}>
                        <thead>
                            <tr style={{ background: "#f9fafb", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                                <th style={{ padding: "12px 10px", fontWeight: 600 }}>#</th>
                                <th style={{ padding: "12px 10px", fontWeight: 600 }}>Name</th>
                                <th style={{ padding: "12px 10px", fontWeight: 600 }}>Price</th>
                                <th style={{ padding: "12px 10px", fontWeight: 600 }}>Quantity</th>
                                <th style={{ padding: "12px 10px", fontWeight: 600 }}>Status</th>
                                <th style={{ padding: "12px 10px", fontWeight: 600, textAlign: "center" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p, index) => (
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
                                    <td style={{ padding: "20px" }}>{p.quantity}</td>
                                    <td style={{ padding: "10px" }}>
                                        <Badge
                                            color={p.is_active ? "success" : "error"}
                                            variant="solid"
                                        >
                                            {p.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td
                                        style={{
                                            padding: "10px",
                                            textAlign: "center",
                                        }}
                                    >
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
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        width: "36px",
                                                        height: "36px",
                                                        borderRadius: "6px",
                                                    }}
                                                >
                                                    <Pencil />
                                                </Button>
                                            </Link>

                                            <Button
                                                color="error"
                                                onClick={() => handleDelete(p.id)}
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    width: "36px",
                                                    height: "36px",
                                                    borderRadius: "6px",
                                                }}
                                            >
                                                <Trash2 />
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
