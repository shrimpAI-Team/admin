import React, { useEffect, useState } from "react";
import { adminApi, type ShrimpSpecies, type ShrimpTestResult } from "../api/admin.api";
import { apiError } from "../lib/api";
import { Alert } from "../components/ui/Alert";
import { useI18nStore } from "../store/i18n.store";

export function AiCenterPage() {
  const { t } = useI18nStore();
  const [species, setSpecies] = useState<ShrimpSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Testbench state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ShrimpTestResult | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminApi.getShrimpSpecies();
        setSpecies(data);
      } catch (e) {
        setError(apiError(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setTestResult(null);
  };

  const handleRunInference = async () => {
    if (!selectedFile) return;
    setTesting(true);
    setError("");
    try {
      const res = await adminApi.testAnalyze(selectedFile);
      setTestResult(res);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* ════════════ HEADER BAR ════════════ */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          {t("aiCenterTitle")}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "4px" }}>
          {t("aiCenterSubtitle")}
        </p>
      </div>

      {error && <Alert variant="error" onClose={() => setError("")}>{error}</Alert>}

      {/* ════════════ SPECIES CATALOG CARDS ════════════ */}
      <div>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🦐</span> {t("speciesCatalogTitle")}
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
          {species.map((sp) => (
            <div key={sp.id} className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {sp.name}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--primary)", fontStyle: "italic", fontFamily: "var(--font-mono)" }}>
                    {sp.scientificName}
                  </p>
                </div>
                <span
                  style={{
                    backgroundColor: "rgba(6, 182, 212, 0.15)",
                    color: "var(--primary)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {sp.id}
                </span>
              </div>

              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {sp.description}
              </p>

              <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>{t("typicalSizeLabel")}</span>
                <strong style={{ color: "#10b981" }}>{sp.typicalSize}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════ DIAGNOSTIC AI TESTBENCH ════════════ */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <div style={{ marginBottom: "18px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🔬</span> {t("testbenchTitle")}
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            {t("testbenchSubtitle")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
          {/* Upload Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed var(--border-highlight)",
                borderRadius: "14px",
                padding: "36px 20px",
                cursor: "pointer",
                backgroundColor: "var(--btn-secondary-bg)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-highlight)";
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <span style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📸</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                {selectedFile ? selectedFile.name : t("uploadPlaceholder")}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                {t("uploadHelp")}
              </span>
            </label>

            {previewUrl && (
              <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-subtle)", maxHeight: "240px" }}>
                <img
                  src={previewUrl}
                  alt="Sample"
                  style={{ width: "100%", height: "240px", objectFit: "cover" }}
                />
              </div>
            )}

            <button
              onClick={handleRunInference}
              disabled={!selectedFile || testing}
              className="btn-primary"
              style={{ padding: "12px" }}
            >
              {testing ? t("analyzingBtn") : t("runDiagnosticBtn")}
            </button>
          </div>

          {/* Inference Results & Technical JSON Output */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-secondary)" }}>
              {t("technicalOutputTitle")}
            </h3>

            {testResult ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Result Highlights */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(6, 182, 212, 0.1)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{t("identifiedSpecies")}</span>
                    <div style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1.1rem" }}>
                      {testResult.species}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      {testResult.scientificName}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{t("confidenceLabel")}</span>
                    <div style={{ fontWeight: 800, color: "#10b981", fontSize: "1.1rem" }}>
                      {testResult.confidence}%
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {t("aiTimeLabel")} {testResult.processingTime}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{t("estimatedSizeLabel")}</span>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>
                      {testResult.sizeEstimate}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{t("roundtripLatencyLabel")}</span>
                    <div style={{ fontWeight: 600, color: "#a855f7", fontSize: "0.875rem" }}>
                      {testResult.diagnostics.serverExecutionMs} ms
                    </div>
                  </div>
                </div>

                {/* Raw JSON Debugger */}
                <div style={{ borderRadius: "10px", backgroundColor: "var(--bg-app)", border: "1px solid var(--border-subtle)", padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <span>RAW JSON PAYLOAD</span>
                    <span>Status: {testResult.modelStatus}</span>
                  </div>
                  <pre
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      color: "var(--primary)",
                      maxHeight: "180px",
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div
                style={{
                  height: "260px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--btn-secondary-bg)",
                  borderRadius: "12px",
                  border: "1px dashed var(--border-subtle)",
                  color: "var(--text-muted)",
                  fontSize: "0.875rem",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <span>{t("testbenchEmptyState")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
