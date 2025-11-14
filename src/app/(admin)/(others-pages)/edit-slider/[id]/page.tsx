"use client";

import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { parseCookies } from "nookies";
import Image from "next/image"; // ✅ for optimized images
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";

type AlertType = {
  variant: "success" | "error" | "info";
  title: string;
  message: string;
};

export default function EditSliderPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const [mediaType, setMediaType] = useState("");
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const BASE_URL = "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/slider";
  const MEDIA_URL = "https://ecommerce.sidhwanitechnologies.com/uploads/";

  // ✅ Fetch existing slider
  useEffect(() => {
    const fetchSlider = async () => {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}`, apiKey },
        });
        const data = await res.json();

        if (res.ok && data.data) {
          const s = data.data;
          setMediaType(s.media_type);
          setCurrentFile(s.image_url);
          setIsActive(s.is_active);
        } else {
          setAlert({
            variant: "error",
            title: "Error",
            message: data.message || "Failed to load slider details.",
          });
        }
      } catch {
        setAlert({
          variant: "error",
          title: "Network Error",
          message: "Unable to load slider details.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchSlider();
  }, [id, token]); // ✅ added token to dependencies

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

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
          message: "Slider updated successfully!",
        });
        setTimeout(() => router.push("/sliders"), 1000);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to update slider.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Network Error",
        message: "Error updating slider.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Slider" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title={`Edit Slider #${id}`}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "10px" }}>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
            {/* Media Type */}
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

            {/* Current File */}
            <div>
              <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
                Current File
              </label>
              {currentFile ? (
                mediaType === "image" ? (
                  <Image
                    src={currentFile}
                    alt="current slider"
                    width={120}
                    height={80}
                    style={{
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      padding: "4px",
                    }}
                  />
                ) : (
                  <video
                    src={currentFile}
                    controls
                    style={{
                      width: "140px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      padding: "4px",
                    }}
                  />
                )
              ) : (
                <p style={{ fontSize: "14px", color: "#6b7280" }}>No media uploaded</p>
              )}
            </div>

            {/* Replace File */}
            <div>
              <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
                Replace File (optional)
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

            {/* Active */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label style={{ fontWeight: 600 }}> Active </label>
            </div>

            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
              <Button type="submit" disabled={saving} color="primary" variant="primary">
                {saving ? "Updating..." : "Update Slider"}
              </Button>
              <Button
                color="primary"
                variant="outline"
                onClick={() => router.push("/sliders")}
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
