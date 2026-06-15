/**
 * Validates the incoming proposal request body.
 * Returns an error string if invalid, or null if valid.
 */
function validateProposalBody(body) {
  const { client_name, client_email, project_type, project_address, fee } = body;

  if (!client_name || !client_name.trim()) {
    return "client_name is required.";
  }

  if (!client_email || !client_email.trim()) {
    return "client_email is required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(client_email.trim())) {
    return "client_email is not a valid email address.";
  }

  const allowedTypes = ["Residential", "Commercial", "Subdivision"];
  if (!project_type || !allowedTypes.includes(project_type)) {
    return `project_type must be one of: ${allowedTypes.join(", ")}.`;
  }

  if (!project_address || !project_address.trim()) {
    return "project_address is required.";
  }

  if (!fee || !fee.toString().trim()) {
    return "fee is required.";
  }

  if (isNaN(Number(fee))) {
    return "fee must be a valid number.";
  }

  if (Number(fee) <= 0) {
    return "fee must be greater than zero.";
  }

  return null;
}

module.exports = { validateProposalBody };
