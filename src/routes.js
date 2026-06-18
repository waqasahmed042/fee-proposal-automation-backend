const express = require("express");
const axios = require("axios");
const config = require("./config");

const router = express.Router();

// Health
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// STEP 1: Upload DOCX → POST /api/upload-template
router.post("/api/upload-template", async (req, res) => {
  try {
    const { documentBase64, templateName } = req.body;

    if (!documentBase64) {
      return res.status(400).json({ error: "documentBase64 is required." });
    }

    // Official DocuSeal API — POST /templates/docx
    const response = await axios.post(
      `${config.docuseal.baseUrl}/templates/docx`,
      {
        name: templateName || "Proposal Template",
        documents: [
          {
            name: "proposal.docx",
            file: documentBase64,
          },
        ],
      },
      {
        headers: {
          "X-Auth-Token": config.docuseal.apiKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        timeout: 30000,
      }
    );

    const templateId = response.data?.id;

    if (!templateId) {
      return res.status(500).json({
        error: "DocuSeal did not return a template ID.",
        details: response.data,
      });
    }

    console.log(`[${new Date().toISOString()}] Template uploaded — ID: ${templateId}`);

    return res.json({
      success: true,
      templateId,
      templateName: response.data?.name,
    });

  } catch (err) {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "Failed to upload template.";
    console.error("Upload template error:", msg, err.response?.data);
    return res.status(err.response?.status || 500).json({ error: msg });
  }
});

// STEP 2: Get template → GET /api/get-template/:templateId
router.get("/api/get-template/:templateId", async (req, res) => {
  try {
    const { templateId } = req.params;

    const response = await axios.get(
      `${config.docuseal.baseUrl}/templates/${templateId}`,
      {
        headers: {
          "X-Auth-Token": config.docuseal.apiKey,
          "Accept": "application/json",
        },
        timeout: 10000,
      }
    );

    return res.json({
      success: true,
      templateId: response.data?.id,
      templateName: response.data?.name,
    });

  } catch (err) {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "Failed to get template.";
    console.error("Get template error:", msg);
    return res.status(err.response?.status || 500).json({ error: msg });
  }
});

// STEP 3: Send proposal → POST /api/send-proposal
router.post("/api/send-proposal", async (req, res) => {
  try {
    const {
      templateId,
      client_name,
      client_email,
      project_type,
      project_address,
      fee,
    } = req.body;

    // Relaxed validation (fee is no longer mandatory)
    if (!templateId) return res.status(400).json({ error: "templateId is required." });
    if (!client_name?.trim()) return res.status(400).json({ error: "client_name is required." });
    if (!client_email?.trim()) return res.status(400).json({ error: "client_email is required." });
    if (!project_address?.trim()) return res.status(400).json({ error: "project_address is required." });

    // Use defaults if missing
    const finalProjectType = project_type || "Civil Engineering Services";
    const finalFee = fee !== undefined && fee !== null ? fee : "0";

    // Official DocuSeal API
    const response = await axios.post(
      `${config.docuseal.baseUrl}/submissions`,
      {
        template_id: Number(templateId),
        send_email: true,
        submitters: [
          {
            role: config.docuseal.role || "First Party",
            name: client_name.trim(),
            email: client_email.trim().toLowerCase(),
            fields: [
              { name: "client_name", default_value: client_name.trim() },
              { name: "project_type", default_value: finalProjectType },
              { name: "project_address", default_value: project_address.trim() },
              { name: "fee", default_value: `$${finalFee} (excl. GST)` },
            ],
          },
        ],
      },
      {
        headers: {
          "X-Auth-Token": config.docuseal.apiKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        timeout: 15000,
      }
    );

    const submitter = Array.isArray(response.data)
      ? response.data[0]
      : response.data?.submitters?.[0];

    const signingUrl = submitter?.slug
      ? `https://docuseal.com/s/${submitter.slug}`
      : null;

    console.log(`[${new Date().toISOString()}] Proposal sent — client: ${client_email}, template: ${templateId}`);

    return res.json({
      success: true,
      signingUrl,
      submissionId: submitter?.submission_id || null,
      message: `Proposal sent to ${client_email}`,
    });

  } catch (err) {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "Failed to send proposal.";
    console.error("Send proposal error:", msg, err.response?.data);
    return res.status(err.response?.status || 500).json({ error: msg });
  }
});

// GET ALL TEMPLATES → GET /api/all-templates
router.get("/api/all-templates", async (req, res) => {
  try {
    const response = await axios.get(
      `${config.docuseal.baseUrl}/templates`,
      {
        headers: {
          "X-Auth-Token": config.docuseal.apiKey,
          "Accept": "application/json",
        },
        timeout: 15000,
      }
    );

    console.log(`[${new Date().toISOString()}] Fetched ${response.data?.length || 0} templates`);

    return res.json({
      success: true,
      templates: response.data || [],
      count: response.data?.length || 0
    });

  } catch (err) {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "Failed to fetch templates.";

    console.error("Get all templates error:", msg, err.response?.data);

    return res.status(err.response?.status || 500).json({
      error: msg,
      details: err.response?.data
    });
  }
});

module.exports = router;