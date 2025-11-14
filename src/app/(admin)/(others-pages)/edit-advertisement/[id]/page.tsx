"use client";

import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { parseCookies } from "nookies";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Image from "next/image";
import Button from "@/components/ui/button/Button";

type AlertType = {
  variant: "success" | "error" | "info";
  title: string;
  message: string;
};

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
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch Advertisement Details
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
          setAlert({
            variant: "error",
            title: "Error",
            message: data.message || "Failed to load advertisement.",
          });
        }
      } catch {
        setAlert({
          variant: "error",
          title: "Network Error",
          message: "Unable to load advertisement.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchAd();
  }, [id, token]); // ✅ token added to dependencies

  // ✅ Handle File Input Safely
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // ✅ Handle Submit
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
        setAlert({
          variant: "success",
          title: "Updated",
          message: "Advertisement updated successfully!",
        });
        setTimeout(() => router.push("/advertisements"), 1000);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to update advertisement.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Network Error",
        message: "Error updating advertisement.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Render
  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Advertisement" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title={`Edit Advertisement #${id}`}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "10px" }}>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
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
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            {/* Current File */}
            <div>
              <label style={{ fontWeight: 600 }}>Current File</label>
              {currentFile ? (
                mediaType === "image" ? (
                  <Image
                    src={currentFile}
                    alt="ad"
                    width={150}
                    height={100}
                    style={{
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      padding: "4px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <video
                    src={currentFile}
                    controls
                    style={{
                      width: "150px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      padding: "4px",
                    }}
                  />
                )
              ) : (
                <p>No file uploaded</p>
              )}
            </div>

            {/* Upload New File */}
            <div>
              <label style={{ fontWeight: 600 }}>Upload New File (optional)</label>
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
               <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              <label> Active </label>
            </div>

            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                <Button type="submit" disabled={saving} variant="primary">
              {saving ? "Updating..." : "Update Advertisement"}
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
        )}
      </ComponentCard>
    </div>
  );
}
