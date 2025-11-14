"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Mail, CreditCard } from "lucide-react";

// --- Type Definitions ---
interface EmailSettings {
  host: string;
  port: string;
  login: string;
  password: string;
  emailFrom: string;
  smtpType: string;
  is_active: boolean;
}

interface PaymentGateway {
  id: number;
  name: string;
  client_id: string;
  client_secret: string;
  is_active: boolean;
}

interface AlertType {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { adminToken: token } = parseCookies();
  const apiKey = "ecommerceapp";

  const EMAIL_URL = "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/email-config";
  const GATEWAY_URL = "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/payment-gateways";

  // --- State Management ---
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    host: "",
    port: "",
    login: "",
    password: "",
    emailFrom: "",
    smtpType: "TLS",
    is_active: true,
  });

  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "payment">("email");

  // ✅ Memoized Headers (fixes warning)
  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      apiKey,
    }),
    [token]
  );

  // --- Fetch Settings ---
  const fetchSettings = useCallback(async () => {
    try {
      // Fetch Email Config
      const emailRes = await fetch(EMAIL_URL, { headers });
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

      // Fetch Payment Gateways
      const gatewayRes = await fetch(GATEWAY_URL, { headers });
      const gatewayData = await gatewayRes.json();

      if (gatewayRes.ok && Array.isArray(gatewayData.data)) {
        setPaymentGateways(gatewayData.data);
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed to fetch settings.",
      });
    }
  }, [EMAIL_URL, GATEWAY_URL, headers]);

  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [token, fetchSettings]);

  // --- Handle Input Change ---
  const handleEmailChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value, type } = e.target;

  // Only access checked if it's a checkbox input
  const fieldValue =
    type === "checkbox" && "checked" in e.target ? e.target.checked : value;

  setEmailSettings((prev) => ({
    ...prev,
    [name]: fieldValue,
  }));
};


  // --- Submit Email Config ---
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
          ...headers,
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

  // --- JSX Render ---
  return (
    <div>
      <PageBreadcrumb pageTitle="Settings" />
      {alert && <Alert {...alert} showLink={false} />}

      <ComponentCard title="System Settings">
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "2px solid #e5e7eb",
            marginBottom: "25px",
            gap: "30px",
          }}
        >
          {/* Email Config Tab */}
          <div
            onClick={() => setActiveTab("email")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 0",
              cursor: "pointer",
              borderBottom:
                activeTab === "email"
                  ? "3px solid #3b82f6"
                  : "3px solid transparent",
              color: activeTab === "email" ? "#3b82f6" : "#6b7280",
              fontWeight: activeTab === "email" ? 600 : 500,
            }}
          >
            <Mail size={18} />
            <span>Email Config</span>
          </div>

          {/* Payment Gateway Tab */}
          <div
            onClick={() => setActiveTab("payment")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 0",
              cursor: "pointer",
              borderBottom:
                activeTab === "payment"
                  ? "3px solid #3b82f6"
                  : "3px solid transparent",
              color: activeTab === "payment" ? "#3b82f6" : "#6b7280",
              fontWeight: activeTab === "payment" ? 600 : 500,
            }}
          >
            <CreditCard size={18} />
            <span>Payment Gateways</span>
          </div>
        </div>

        {/* Email Config Section */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailSubmit} style={{ maxWidth: "700px" }}>
            <div style={{ display: "grid", gap: "15px" }}>
              {(
                [
                  { label: "Host", name: "host", type: "text" },
                  { label: "Port", name: "port", type: "number" },
                  { label: "Login", name: "login", type: "text" },
                  { label: "Password", name: "password", type: "password" },
                  { label: "Email From", name: "emailFrom", type: "email" },
                ] as const
              ).map((f) => (
                <div key={f.name}>
                  <label style={{ fontWeight: 600 }}>{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={emailSettings[f.name]} // ✅ Type-safe access (no any)
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
              ))}

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
                style={{ marginTop: "10px", width: "160px" }}
              >
                {saving ? "Saving..." : "Save Email Config"}
              </Button>
            </div>
          </form>
        )}

        {/* Payment Gateway Section */}
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
                    onClick={() => router.push(`/payment-gateway/${gateway.id}`)}
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
