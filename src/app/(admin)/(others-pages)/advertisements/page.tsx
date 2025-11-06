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

export default function AdvertisementsPage() {
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";
  const BASE_URL = "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/advertisement";
  const MEDIA_URL = "https://ecommerce.sidhwanitechnologies.com/uploads/";

  const [ads, setAds] = useState<any[]>([]);
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    try {
      const res = await fetch(BASE_URL, {
        headers: { Authorization: `Bearer ${token}`, apiKey },
      });
      const data = await res.json();

      if (res.ok && data.data) {
        const formatted = data.data.map((a: any) => ({
          ...a,
          media_url: MEDIA_URL + a.media_path,
        }));
        setAds(formatted);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to fetch advertisements.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Network Error",
        message: "Unable to load advertisements.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return;
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, apiKey },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAds((prev) => prev.filter((item) => item.id !== id));
        setAlert({
          variant: "success",
          title: "Deleted",
          message: "Advertisement deleted successfully!",
        });
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to delete advertisement.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Network error occurred.",
      });
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Advertisements" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="Advertisements List">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
          <Link href="/add-advertisement">
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
              <Plus style={{ width: "16px", height: "16px" }} /> Add Advertisement
            </Button>
          </Link>
        </div>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : ads.length === 0 ? (
          <Alert variant="info" title="No Data" message="No advertisements found." showLink={false} />
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
              <tr style={{ background: "#f9fafb", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "10px" }}>#</th>
                <th style={{ padding: "10px" }}>Preview</th>
                <th style={{ padding: "10px" }}>Media Type</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((a, i) => (
                <tr key={a.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>{i + 1}</td>
                  <td style={{ padding: "10px" }}>
                    {a.media_type === "image" ? (
                      <img src={a.media_url} alt="ad" style={{ width: "100px", borderRadius: "4px" }} />
                    ) : (
                      <video src={a.media_url} controls style={{ width: "100px", borderRadius: "4px" }} />
                    )}
                  </td>
                  <td style={{ padding: "10px" }}>{a.media_type}</td>
                  <td style={{ padding: "10px" }}>
                    <Badge color={a.is_active ? "success" : "error"}>{a.is_active ? "Active" : "Inactive"}</Badge>
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
                      <Link href={`/edit-advertisement/${a.id}`}>
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
                        onClick={() => handleDelete(a.id)}
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
