const http = require("http");
const fs = require("fs");
const path = require("path");

loadEnvFile();

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const AI_PROVIDER = (process.env.AI_PROVIDER || "openai").toLowerCase();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.2";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const PORTFOLIO_CONTEXT = `
You are the AI assistant embedded in S A Sanush's personal portfolio website.
Your job is to help visitors learn about Sanush and navigate the portfolio.

Facts you may use:
- Full name: S A Sanush
- Role: Front End Developer
- Location: Thiruvananthapuram, Kerala, India
- Current status: Pursuing MCA at Lourdes Matha College of Science and Technology, Trivandrum (2025-2027)
- Previous degree: BCA at Symbiosis Institute of Computer Studies & Research, Pune (2022-2025), CGPA 7.0
- 12th grade: Bharatiya Vidya Bhavan Senior Secondary School, 77%
- 10th grade: Bharatiya Vidya Bhavan Senior Secondary School, 87%
- Skills: HTML5, CSS3, JavaScript, React JS, Tailwind CSS, Bootstrap, Next JS, Three.js, Figma, Python, MySQL, Git, GitHub
- Experience: 3+ years coding, 10+ tech skills
- Email: sasanush86@gmail.com
- GitHub: https://github.com/SA-Sanush
- LinkedIn: https://www.linkedin.com/in/sa-sanush/
- Resume: ./Sanush%20Resume.pdf
- Availability: Open to work and collaboration

Portfolio sections:
- hero
- about
- skills
- education
- contact

Rules:
- Be warm, concise, and helpful.
- Use the visitor's name naturally when available.
- Do not invent facts beyond the portfolio context above.
- When relevant, mention contact links as HTML anchor tags.
- If the user asks to navigate, append one hidden navigation token at the end in the exact form [NAV:sectionid].
- Valid section ids are: hero, about, skills, education, contact.
- Usually answer in 2-5 sentences.
`;

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!key || process.env[key]) return;

    process.env[key] = value;
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error("Request body too large."));
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function buildOpenAIInput(messages) {
  return messages.map(message => ({
    role: message.role,
    content: [
      {
        type: "input_text",
        text: String(message.content || "")
      }
    ]
  }));
}

async function getOpenAIReply({ messages, userName }) {
  if (!OPENAI_API_KEY) {
    return {
      ok: false,
      error: "missing_api_key",
      message:
        "The AI backend is almost ready, but `OPENAI_API_KEY` is not set on the server yet."
    };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: `${PORTFOLIO_CONTEXT}\nVisitor name: ${userName || "Unknown"}`,
      input: buildOpenAIInput(messages),
      max_output_tokens: 500
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data && data.error && data.error.message
        ? data.error.message
        : "OpenAI request failed.";
    return {
      ok: false,
      error: "provider_error",
      message: errorMessage,
      details: data
    };
  }

  const reply =
    typeof data.output_text === "string" && data.output_text.trim()
      ? data.output_text.trim()
      : "";

  if (!reply) {
    return {
      ok: false,
      error: "empty_response",
      message: "The model returned an empty reply."
    };
  }

  return {
    ok: true,
    reply
  };
}

function buildGeminiContents(messages) {
  return messages.map(message => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [
      {
        text: String(message.content || "")
      }
    ]
  }));
}

function extractGeminiReply(data) {
  const candidates = Array.isArray(data && data.candidates) ? data.candidates : [];
  for (const candidate of candidates) {
    const parts = Array.isArray(candidate && candidate.content && candidate.content.parts)
      ? candidate.content.parts
      : [];
    const text = parts
      .map(part => (typeof part.text === "string" ? part.text : ""))
      .join("")
      .trim();
    if (text) return text;
  }
  return "";
}

async function getGeminiReply({ messages, userName }) {
  if (!GEMINI_API_KEY) {
    return {
      ok: false,
      error: "missing_api_key",
      message:
        "The AI backend is almost ready, but `GEMINI_API_KEY` is not set on the server yet."
    };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `${PORTFOLIO_CONTEXT}\nVisitor name: ${userName || "Unknown"}`
            }
          ]
        },
        contents: buildGeminiContents(messages)
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data && data.error && data.error.message
        ? data.error.message
        : "Gemini request failed.";
    return {
      ok: false,
      error: "provider_error",
      message: errorMessage,
      details: data
    };
  }

  const reply = extractGeminiReply(data);
  if (!reply) {
    return {
      ok: false,
      error: "empty_response",
      message: "Gemini returned an empty reply."
    };
  }

  return {
    ok: true,
    reply
  };
}

function safeJoin(rootDir, requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const relativePath = decoded === "/" ? "/index.html" : decoded;
  const normalized = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  return path.join(rootDir, normalized);
}

function serveStaticFile(req, res) {
  const rootDir = process.cwd();
  const filePath = safeJoin(rootDir, req.url || "/");
  const resolvedRoot = path.resolve(rootDir);
  const resolvedFile = path.resolve(filePath);

  if (!resolvedFile.startsWith(resolvedRoot)) {
    sendJson(res, 403, { error: "forbidden" });
    return;
  }

  fs.readFile(resolvedFile, (error, buffer) => {
    if (error) {
      if (error.code === "ENOENT") {
        sendJson(res, 404, { error: "not_found" });
        return;
      }
      sendJson(res, 500, { error: "read_failed" });
      return;
    }

    const ext = path.extname(resolvedFile).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream"
    });
    res.end(buffer);
  });
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: "bad_request" });
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    try {
      const body = await readJsonBody(req);
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const userName = typeof body.userName === "string" ? body.userName.trim() : "";

      if (!messages.length) {
        sendJson(res, 400, { error: "missing_messages" });
        return;
      }

      const result =
        AI_PROVIDER === "gemini"
          ? await getGeminiReply({ messages, userName })
          : await getOpenAIReply({ messages, userName });
      const statusCode = result.ok ? 200 : result.error === "missing_api_key" ? 503 : 502;
      sendJson(res, statusCode, result);
      return;
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        error: "server_error",
        message: error.message || "Unexpected server error."
      });
      return;
    }
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStaticFile(req, res);
    return;
  }

  sendJson(res, 405, { error: "method_not_allowed" });
});

server.listen(PORT, HOST, () => {
  console.log(`Portfolio server running at http://${HOST}:${PORT}`);
});
