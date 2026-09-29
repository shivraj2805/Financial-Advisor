const axios = require("axios");

// Read API key once at module load; never log its value.
const API_KEY = process.env.GEMINI_API_KEY;

// gemini-2.5-flash is broadly available and stable.
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

// ─── Retry configuration ──────────────────────────────────────────────────────
const MAX_RETRIES = 3;      // up to 3 retries after the first attempt
const BASE_DELAY_MS = 1000; // 1 s → 2 s → 4 s (exponential backoff)

/**
 * Returns true for transient HTTP errors that are safe to retry.
 * Permanent errors (401, 400, 404 …) must NOT be retried.
 */
function isRetryable(err) {
  const status = err.response?.status;
  if (!status) {
    // Network-level errors (ECONNRESET, ECONNABORTED, etc.) are retryable.
    return true;
  }
  return status === 429 || status === 503 || status === 502 || status === 504;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call the Gemini REST API with automatic exponential-backoff retries for
 * transient 429 / 5xx errors.
 *
 * Throws a structured error with a `statusCode` property so callers can
 * forward the correct HTTP status to the client.
 *
 * @param {string} prompt
 * @returns {Promise<string>} Generated text
 */
async function gemini(prompt) {
  if (!API_KEY) {
    const err = new Error("GEMINI_API_KEY is not configured");
    err.statusCode = 500;
    throw err;
  }

  let lastErr;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`Gemini retry attempt ${attempt}/${MAX_RETRIES}, waiting ${delayMs}ms...`);
        await sleep(delayMs);
      } else {
        console.log("Making request to Gemini API...");
        console.log("API Key present:", !!API_KEY); // logs true/false only, never the key itself
        console.log("Prompt length:", prompt.length);
      }

      const response = await axios.post(
        GEMINI_URL,
        { contents: [{ parts: [{ text: prompt }] }] },
        {
          timeout: 60000,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.data?.candidates?.[0]) {
        console.error(
          "Unexpected Gemini response structure:",
          JSON.stringify(response.data, null, 2)
        );
        const structErr = new Error("Invalid response structure from Gemini API");
        structErr.statusCode = 502;
        throw structErr;
      }

      const text = response.data.candidates[0].content.parts[0].text;
      if (!text) {
        const emptyErr = new Error("Empty text response from Gemini API");
        emptyErr.statusCode = 502;
        throw emptyErr;
      }

      console.log("Gemini API response text length:", text.length);
      return text;
    } catch (err) {
      lastErr = err;

      // Permanent or non-HTTP errors — do not retry
      if (!isRetryable(err)) {
        break;
      }

      // Transient error — retry unless exhausted
      if (attempt < MAX_RETRIES) {
        console.warn(
          `Gemini transient error (attempt ${attempt + 1}): HTTP ${err.response?.status ?? "network"}`
        );
        continue;
      }
    }
  }

  // ── Map to structured errors with statusCode for callers ─────────────────
  const status = lastErr.response?.status;

  if (status === 401 || status === 403) {
    const out = new Error("Gemini API authentication failed - check API key");
    out.statusCode = 500; // configuration problem, hide from client
    throw out;
  }

  if (status === 400) {
    const out = new Error("Gemini API rejected the request (bad input)");
    out.statusCode = 400;
    throw out;
  }

  if (status === 404) {
    const out = new Error(`Gemini model '${GEMINI_MODEL}' not found`);
    out.statusCode = 500;
    throw out;
  }

  if (status === 429 || status === 503 || status === 502 || status === 504) {
    const out = new Error("AI service is temporarily unavailable. Please try again.");
    out.statusCode = 503;
    throw out;
  }

  if (lastErr.code === "ECONNABORTED") {
    const out = new Error("AI service is temporarily unavailable. Please try again.");
    out.statusCode = 503;
    throw out;
  }

  // statusCode already set (e.g. from response structure errors above)
  if (lastErr.statusCode) {
    throw lastErr;
  }

  // Generic fallback
  const out = new Error("Gemini API request failed");
  out.statusCode = 502;
  throw out;
}

module.exports = gemini;
