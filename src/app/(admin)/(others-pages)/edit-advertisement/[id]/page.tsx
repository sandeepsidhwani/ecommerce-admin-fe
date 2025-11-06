"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { parseCookies } from "nookies";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";

export default function EditAdvertisementPage() {
  const router = useRouter();
  const { id } = useParams();
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const BASE_URL = "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/advertisement";
  const MEDIA_URL = "https://ecommerce.sidhwanitechnologies.com/uploads/";

  const [mediaType, setMediaType] = useState("");
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}`, apiKey },
        });
        const data = await res.json();
        if (res.ok && data.data) {
          const a = data.data;
          setMediaType(a.media_type);
          setCurrentFile(MEDIA_URL + a.media_path);
          setIsActive(a.is_active);
        } else {
          setAlert({ variant: "error", title: "Error", message: data.message || "Failed to load advertisement." });
        }
      } catch {
        setAlert({ variant: "error", title: "Network Error", message: "Unable to load advertisement." });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAd();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append("media_type", mediaType);
    formData.append("is_active", isActive ? "1" : "0");
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, apiKey },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlert({ variant: "success", title: "Updated", message: "Advertisement updated successfully!" });
        setTimeout(() => router.push("/advertisements"), 1000);
      } else {
        setAlert({ variant: "error", title: "Error", message: data.message || "Failed to update advertisement." });
      }
    } catch {
      setAlert({ variant: "error", title: "Network Error", message: "Error updating advertisement." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Advertisement" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title={`Edit Advertisement #${id}`}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "10px" }}>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
            <div>
              <label style={{ fontWeight: 600 }}>Media Type</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "6px" }}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 600 }}>Current File</label>
              {currentFile ? (
                mediaType === "image" ? (
                  <img src={currentFile} alt="ad" style={{ width: "120px", borderRadius: "6px", border: "1px solid #ddd", padding: "4px" }} />
                ) : (
                  <video src={currentFile} controls style={{ width: "150px", borderRadius: "6px", border: "1px solid #ddd", padding: "4px" }} />
                )
              ) : (
                <p>No file uploaded</p>
              )}
            </div>

            <div>
              <label style={{ fontWeight: 600 }}>Upload New File (optional)</label>
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
              {saving ? "Updating..." : "Update Advertisement"}
            </Button>
          </form>
        )}
      </ComponentCard>
    </div>
  );
}
