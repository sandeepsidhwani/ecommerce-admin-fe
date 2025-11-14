"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";

interface AlertType {
  variant: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
}

export default function AddAdvertisementPage() {
  const router = useRouter();
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const [mediaType, setMediaType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
        "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/advertisement",
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
          message: "Advertisement added successfully!",
        });
        setTimeout(() => router.push("/advertisements"), 1000);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to create advertisement.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Network Error",
        message: "Error creating advertisement.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Advertisement" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="Create Advertisement">
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: "16px" }}
        >
          {/* Media Type */}
          <div>
            <label style={{ fontWeight: 600 }}>Media Type</label>
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

          {/* Upload File */}
          <div>
            <label style={{ fontWeight: 600 }}>Upload File</label>
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

          {/* Active Checkbox */}
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

          <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
            <Button
              type="submit"
              disabled={saving}
              variant="primary"
            >
              {saving ? "Saving..." : "Create Advertisement"}
            </Button>
            <Button
              color="primary"
              variant="outline"
              onClick={() => router.push("/advertisements")}
            >
              Cancel
            </Button>
          </div>

        </form>
      </ComponentCard>
    </div>
  );
}
