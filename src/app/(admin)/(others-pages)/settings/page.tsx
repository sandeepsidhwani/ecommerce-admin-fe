"use client";

import React, { useEffect, useState } from "react";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

export default function SettingsPage() {
  const router = useRouter();
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const EMAIL_URL = "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/email-config";
  const GATEWAY_URL = "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/payment-gateways";

  const [emailSettings, setEmailSettings] = useState<any>({
    host: "",
    port: "",
    login: "",
    password: "",
    emailFrom: "",
    smtpType: "TLS",
    is_active: true,
  });

  const [paymentGateways, setPaymentGateways] = useState<any[]>([]);
  const [alert, setAlert] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "payment">("email");

  // Fetch settings
  const fetchSettings = async () => {
    try {
      // --- Email Config ---
      const emailRes = await fetch(EMAIL_URL, {
        headers: { Authorization: `Bearer ${token}`, apiKey },
      });
      const emailData = await emailRes.json();

      if (emailRes.ok && emailData.data) {
        setEmailSettings({
          host: emailData.data.smtp_host || "",
          port: emailData.data.smtp_port || "",
          login: emailData.data.smtp_user || "",
          password: emailData.data.smtp_password || "",
          emailFrom: emailData.data.email || "",
          smtpType: emailData.data.smtp_type || "TLS",
          is_active: emailData.data.is_active ?? true,
        });
      }

      // --- Payment Gateways ---
      const gatewayRes = await fetch(GATEWAY_URL, {
        headers: { Authorization: `Bearer ${token}`, apiKey },
      });
      const gatewayData = await gatewayRes.json();

      if (gatewayRes.ok && gatewayData.data) {
        setPaymentGateways(gatewayData.data);
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed to fetch settings.",
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEmailChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    const payload = {
      email: emailSettings.emailFrom,
      smtp_host: emailSettings.host,
      smtp_port: emailSettings.port,
      smtp_user: emailSettings.login,
      smtp_password: emailSettings.password,
      smtp_type: emailSettings.smtpType,
      is_active: emailSettings.is_active,
    };

    try {
      const res = await fetch(EMAIL_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAlert({
          variant: "success",
          title: "Success",
          message: "Email configuration saved successfully.",
        });
      } else {
        setAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to save configuration.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Network error while saving email configuration.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Settings" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="System Settings">
        {/* --- Tabs --- */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <Button
            color={activeTab === "email" ? "primary" : "secondary"}
            onClick={() => setActiveTab("email")}
          >
            Email Config
          </Button>
          <Button
            color={activeTab === "payment" ? "primary" : "secondary"}
            onClick={() => setActiveTab("payment")}
          >
            Payment Gateways
          </Button>
        </div>

        {/* --- Email Config --- */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailSubmit} style={{ maxWidth: "700px" }}>
            <div style={{ display: "grid", gap: "15px" }}>
              <div>
                <label style={{ fontWeight: 600 }}>Host</label>
                <input
                  type="text"
                  name="host"
                  value={emailSettings.host}
                  onChange={handleEmailChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontWeight: 600 }}>Port</label>
                <input
                  type="number"
                  name="port"
                  value={emailSettings.port}
                  onChange={handleEmailChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontWeight: 600 }}>Login</label>
                <input
                  type="text"
                  name="login"
                  value={emailSettings.login}
                  onChange={handleEmailChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontWeight: 600 }}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={emailSettings.password}
                  onChange={handleEmailChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontWeight: 600 }}>Email From</label>
                <input
                  type="email"
                  name="emailFrom"
                  value={emailSettings.emailFrom}
                  onChange={handleEmailChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontWeight: 600 }}>SMTP Type</label>
                <select
                  name="smtpType"
                  value={emailSettings.smtpType}
                  onChange={handleEmailChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                >
                  <option value="TLS">TLS</option>
                  <option value="SSL">SSL</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={emailSettings.is_active}
                  onChange={handleEmailChange}
                />
                <label>Active</label>
              </div>

              <Button
                color="primary"
                type="submit"
                disabled={saving}
                style={{ marginTop: "10px" }}
              >
                {saving ? "Saving..." : "Save Email Config"}
              </Button>
            </div>
          </form>
        )}

        {/* --- Payment Gateways --- */}
        {activeTab === "payment" && (
          <div>
            {paymentGateways.length === 0 ? (
              <Alert
                variant="info"
                title="No Data"
                message="No payment gateways found."
                showLink={false}
              />
            ) : (
              paymentGateways.map((gateway) => (
                <div
                  key={gateway.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "15px",
                    position: "relative",
                  }}
                >
                  <Badge
                    color={gateway.is_active ? "success" : "error"}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {gateway.is_active ? "Active" : "Inactive"}
                  </Badge>

                  <h4 style={{ marginBottom: "10px" }}>{gateway.name}</h4>

                  <div style={{ marginBottom: "10px" }}>
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

                  <div style={{ marginBottom: "10px" }}>
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
                  <Button
                    color="info"
                    onClick={() =>
                      router.push(`/payment-gateway/${gateway.id}`)
                    }
                  >
                    Edit {gateway.name}
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </ComponentCard>
    </div>
  );
}
