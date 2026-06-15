require("dotenv").config();

const config = {
  port: parseInt(process.env.PORT) || 5000,

  docuseal: {
    apiKey: process.env.DOCUSEAL_API_KEY,
    role: process.env.DOCUSEAL_ROLE || "First Party",
    baseUrl: "https://api.docuseal.com",
  },

  cors: {
    origin: [
      process.env.CORS_ORIGIN || "http://localhost:3000",
      "http://localhost:3000",
    ],
  },
};

// Validate required values on startup
function validate() {
  if (!config.docuseal.apiKey) {
    console.error("ERROR: DOCUSEAL_API_KEY is missing in .env");
    process.exit(1);
  }
}

validate();

module.exports = config;