const axios = require("axios");
const config = require("./config");

/**
 * Creates a submission in DocuSeal and sends signing email to client.
 *
 * @param {Object} proposal
 * @param {string} proposal.client_name
 * @param {string} proposal.client_email
 * @param {string} proposal.project_type
 * @param {string} proposal.project_address
 * @param {string|number} proposal.fee
 * @returns {Promise<{ signingUrl: string|null, submissionId: number }>}
 */
async function createSubmission(proposal) {
  const { client_name, client_email, project_type, project_address, fee } = proposal;

  const payload = {
    template_id: config.docuseal.templateId,
    send_email: true, // DocuSeal emails the client automatically
    submitters: [
      {
        role: config.docuseal.role,
        name: client_name,
        email: client_email,
        fields: [
          {
            name: "client_name",
            default_value: client_name,
          },
          {
            name: "project_type",
            default_value: project_type,
          },
          {
            name: "project_address",
            default_value: project_address,
          },
          {
            name: "fee",
            default_value: `$${fee} (excl. GST)`,
          },
        ],
      },
    ],
  };

  const response = await axios.post(
    `${config.docuseal.baseUrl}/submissions`,
    payload,
    {
      headers: {
        "X-Auth-Token": config.docuseal.apiKey,
        "Content-Type": "application/json",
      },
      timeout: 15000, // 15 second timeout
    }
  );

  // DocuSeal returns an array of submitters
  const submitter = Array.isArray(response.data)
    ? response.data[0]
    : response.data;

  const signingUrl = submitter?.slug
    ? `https://docuseal.com/s/${submitter.slug}`
    : null;

  return {
    signingUrl,
    submissionId: submitter?.submission_id || null,
  };
}

module.exports = { createSubmission };
