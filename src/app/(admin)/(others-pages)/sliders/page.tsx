"use client";

import React, { JSX, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { parseCookies } from "nookies";
import { Pencil, Trash2, Plus } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

type Slider = {
  id: number;
  media_type: "image" | "video" | string;
  media_path: string;
  is_active: boolean;
  media_url?: string;
};

type SliderApiResponse = {
  id: number;
  media_type: string;
  media_path: string;
  is_active: boolean | number;
};

type SliderResponse = {
  data?: SliderApiResponse[];
  success?: boolean;
  message?: string;
};

type AlertType = {
  variant: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
};

export default function SlidersPage(): JSX.Element {
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";
  const BASE_URL = "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/slider";
  const MEDIA_URL = "https://ecommerce.sidhwanitechnologies.com/uploads/";

  const [sliders, setSliders] = useState<Slider[]>([]);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Strongly typed fetch logic
  const fetchSliders = useCallback(async () => {
    setLoading(true);
    setAlert(null);

    if (!token) {
      setAlert({
        variant: "error",
        title: "Auth Error",
        message: "No admin token found. Please login.",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(BASE_URL, {
        headers: { Authorization: `Bearer ${token}`, apiKey },
      });

      const data: SliderResponse = await res.json();

      if (res.ok && Array.isArray(data.data)) {
        const formatted: Slider[] = data.data.map((s: SliderApiResponse) => ({
          id: s.id,
          media_type: s.media_type,
          media_path: s.media_path,
          is_active: Boolean(s.is_active),
          media_url: MEDIA_URL + s.media_path,
        }));
        setSliders(formatted);
      } else {
        setSliders([]);
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to fetch sliders.",
        });
      }
    } catch (err) {
      console.error("fetchSliders:", err);
      setAlert({
        variant: "error",
        title: "Network Error",
        message: "Unable to load sliders.",
      });
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, MEDIA_URL, apiKey, token]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this slider?")) return;
    if (!token) {
      setAlert({ variant: "error", title: "Auth", message: "Missing admin token." });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, apiKey },
      });
      const data: { success?: boolean; message?: string } = await res.json();

      if (res.ok && data.success) {
        setSliders((prev) => prev.filter((item) => item.id !== id));
        setAlert({
          variant: "success",
          title: "Deleted",
          message: "Slider deleted successfully!",
        });
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to delete.",
        });
      }
    } catch (err) {
      console.error("delete slider:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Network error occurred.",
      });
    }
  };

  useEffect(() => {
    fetchSliders();
  }, [fetchSliders]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Sliders" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="Sliders List">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
          <Link href="/add-slider">
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
              <Plus style={{ width: "16px", height: "16px" }} /> Add Slider
            </Button>
          </Link>
        </div>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : sliders.length === 0 ? (
          <Alert variant="info" title="No Data" message="No sliders found." showLink={false} />
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
              {sliders.map((s, i) => (
                <tr key={s.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>{i + 1}</td>
                  <td style={{ padding: "10px" }}>
                    {s.media_type === "image" ? (
                      <div style={{ width: 100, height: 60, position: "relative" }}>
                        <Image
                          src={s.media_url || ""}
                          alt={`slider-${s.id}`}
                          fill
                          style={{ objectFit: "cover", borderRadius: 4 }}
                          sizes="100px"
                        />
                      </div>
                    ) : (
                      <video
                        src={s.media_url}
                        controls
                        style={{ width: "100px", borderRadius: "4px" }}
                      />
                    )}
                  </td>
                  <td style={{ padding: "20px" }}>{s.media_type}</td>
                  <td style={{ padding: "10px" }}>
                    <Badge
                      color={s.is_active ? "success" : "error"}
                      style={{
                        padding: "4px 10px",
                        fontWeight: 600,
                        borderRadius: "6px",
                      }}
                    >
                      {s.is_active ? "Active" : "Inactive"}
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
                      <Link href={`/edit-slider/${s.id}`}>
                        <Button
                          color="info"
                        >
                          <Pencil size={15} />
                        </Button>
                      </Link>
                      <Button
                        color="error"
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 size={15} />
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
