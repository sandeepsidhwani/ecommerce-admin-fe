"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function EditPaymentGatewayPage() {
  const router = useRouter();
  const { id } = useParams();
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const [gateway, setGateway] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<any>(null);

  const GATEWAY_URL = "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/payment-gateways";

  // Fetch specific gateway by ID
  useEffect(() => {
    if (!id) return;
    const fetchGateway = async () => {
      try {
        const res = await fetch(GATEWAY_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            apiKey,
          },
        });
        const data = await res.json();

        if (res.ok && data.data) {
          const found = data.data.find((g: any) => g.id === parseInt(id));
          setGateway(found || null);
        } else {
          setAlert({
            variant: "error",
            title: "Error",
            message: data.message || "Failed to fetch gateway.",
          });
        }
      } catch {
        setAlert({
          variant: "error",
          title: "Error",
          message: "Network error while fetching gateway.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchGateway();
  }, [id]);

  // Handle toggle of active status
  const handleToggle = (e: any) => {
    setGateway((prev: any) => ({
      ...prev,
      is_active: e.target.checked,
    }));
  };

  // Submit updated gateway
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const res = await fetch(`${GATEWAY_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apiKey,
        },
        body: JSON.stringify({ is_active: gateway.is_active }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAlert({
          variant: "success",
          title: "Success",
          message: "Payment gateway updated successfully.",
        });
        setTimeout(() => router.push("/settings"), 1000);
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to update gateway.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Network error while updating gateway.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) <p style={{ textAlign: "center" }}>Loading...</p>;

  if (!gateway)
    return (
      <div style={{ padding: "20px" }}>
        <Alert variant="warning" title="Not Found" message="No gateway found." showLink={false} />
      </div>
    );

  return (
    <div>
      <PageBreadcrumb pageTitle={`Edit ${gateway.name}`} />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="Update Payment Gateway">
        <form onSubmit={handleSubmit} style={{ maxWidth: "600px" }}>
          {/* Gateway Info */}
          <div style={{ marginBottom: "15px" }}>
            <h3 style={{ marginBottom: "5px" }}>{gateway.name}</h3>
            <Badge
              color={gateway.is_active ? "success" : "error"}
              style={{
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "0.8rem",
              }}
            >
              {gateway.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Client ID */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: 600 }}>Client ID</label>
            <input
              type="text"
              value={gateway.client_id || ""}
              readOnly
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                background: "#f9fafb",
              }}
            />
          </div>

          {/* Client Secret */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: 600 }}>Client Secret</label>
            <input
              type="text"
              value={gateway.client_secret || ""}
              readOnly
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                background: "#f9fafb",
              }}
            />
          </div>

          {/* Active Switch */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <input
              type="checkbox"
              checked={gateway.is_active}
              onChange={handleToggle}
              id="isActive"
            />
            <label htmlFor="isActive" style={{ fontWeight: 500 }}>
              {gateway.is_active ? "Active" : "Inactive"}
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <Button color="primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button color="secondary" onClick={() => router.push("/settings")}>
              Cancel
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
