"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";

interface AlertType {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export default function AddSliderPage() {
  const router = useRouter();
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const [mediaType, setMediaType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!mediaType || !file) {
      setAlert({
        variant: "error",
        title: "Missing Fields",
        message: "Please select media type and upload a file.",
      });
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("media_type", mediaType);
    formData.append("is_active", isActive ? "1" : "0");
    formData.append("file", file);

    try {
      const res = await fetch(
        "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/slider",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, apiKey },
          body: formData,
        }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setAlert({
          variant: "success",
          title: "Success",
          message: "Slider added successfully!",
        });
        setTimeout(() => router.push("/sliders"), 1000);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to create slider.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Network Error",
        message: "Error creating slider.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Slider" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="Create Slider">
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <div>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
              Media Type
            </label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            >
              <option value="">Select Type</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
              Upload File
            </label>
            <input
              type="file"
              accept={mediaType ? `${mediaType}/*` : "*/*"}
              onChange={handleFileChange}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              Active
            </label>
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create"}
          </button>
        </form>
      </ComponentCard>
    </div>
  );
}
