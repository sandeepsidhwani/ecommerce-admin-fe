"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { parseCookies } from "nookies";
import { Pencil, Trash2, Plus } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

interface Advertisement {
  id: number;
  media_path: string;
  media_type: "image" | "video";
  is_active: boolean;
  media_url: string;
}

interface AdvertisementApiResponse {
  id: number;
  media_path: string;
  media_type: "image" | "video";
  is_active: boolean;
}

interface AlertProps {
  variant: "success" | "error" | "info";
  title: string;
  message: string;
}

export default function AdvertisementsPage() {
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";
  const BASE_URL =
    "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/advertisement";
  const MEDIA_URL = "https://ecommerce.sidhwanitechnologies.com/uploads/";

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [alert, setAlert] = useState<AlertProps | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Memoized fetch function with proper typing
  const fetchAds = useCallback(async () => {
    try {
      const res = await fetch(BASE_URL, {
        headers: { Authorization: `Bearer ${token}`, apiKey },
      });
      const data = await res.json();

      if (res.ok && Array.isArray(data.data)) {
        const formatted: Advertisement[] = data.data.map(
          (a: AdvertisementApiResponse) => ({
            ...a,
            media_url: MEDIA_URL + a.media_path,
          })
        );
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
  }, [BASE_URL, MEDIA_URL, token]);

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
  }, [fetchAds]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Advertisements" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="Advertisements List">
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "15px",
          }}
        >
          <Link href="/add-advertisement">
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                fontWeight: 600,
                borderRadius: "6px",
                border: "1px solid #4f46e5",
                color: "#4f46e5",
                backgroundColor: "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4f46e5";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#4f46e5";
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} /> Add Advertisement
            </button>
          </Link>


        </div>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : ads.length === 0 ? (
          <Alert
            variant="info"
            title="No Data"
            message="No advertisements found."
            showLink={false}
          />
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
              <tr
                style={{
                  background: "#f9fafb",
                  textAlign: "left",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
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
                      <Image
                        src={a.media_url}
                        alt="Advertisement"
                        width={100}
                        height={70}
                        style={{ borderRadius: "4px", objectFit: "cover" }}
                      />
                    ) : (
                      <video
                        src={a.media_url}
                        controls
                        width={100}
                        height={70}
                        style={{ borderRadius: "4px" }}
                      />
                    )}
                  </td>
                  <td style={{ padding: "10px" }}>{a.media_type}</td>
                  <td style={{ padding: "10px" }}>
                    <Badge color={a.is_active ? "success" : "error"}>
                      {a.is_active ? "Active" : "Inactive"}
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
                      <Link href={`/edit-advertisement/${a.id}`}>
                        <Button
                        >
                          <Pencil style={{ width: "16px", height: "16px" }} />
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleDelete(a.id)}
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
