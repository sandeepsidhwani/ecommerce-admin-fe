"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";

export default function AddAdvertisementPage() {
  const router = useRouter();
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const [mediaType, setMediaType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [alert, setAlert] = useState<any>(null);
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
      const res = await fetch("https://ecommerce.sidhwanitechnologies.com/api/v1/admin/advertisement", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, apiKey },
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAlert({ variant: "success", title: "Success", message: "Advertisement added successfully!" });
        setTimeout(() => router.push("/advertisements"), 1000);
      } else {
        setAlert({ variant: "error", title: "Error", message: data.message || "Failed to create advertisement." });
      }
    } catch {
      setAlert({ variant: "error", title: "Network Error", message: "Error creating advertisement." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Advertisement" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="Create Advertisement">
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <div>
            <label style={{ fontWeight: 600 }}>Media Type</label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "6px" }}
            >
              <option value="">Select Type</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 600 }}>Upload File</label>
            <input
              type="file"
              accept={mediaType ? `${mediaType}/*` : "*/*"}
              onChange={(e: any) => setFile(e.target.files[0])}
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "6px" }}
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

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create Advertisement"}
          </Button>
        </form>
      </ComponentCard>
    </div>
  );
}
