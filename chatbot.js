/* SANUSH PORTFOLIO - SMART ASSISTANT */

(function () {
  "use strict";

  const KNOWLEDGE_BASE = {
    profile: {
      fullName: "S A Sanush",
      shortName: "Sanush",
      role: "Front End Developer",
      location: "Thiruvananthapuram, Kerala, India",
      status:
        "currently pursuing MCA at Lourdes Matha College of Science and Technology, Trivandrum (2025-2027)",
      previousDegree:
        "completed a BCA at Symbiosis Institute of Computer Studies & Research, Pune (2022-2025) with a 7.0 CGPA",
      summary:
        "He enjoys building clean, interactive, and memorable web experiences that blend design and development.",
      quote:
        "Passionate about blending design and development, creating interfaces that don't just work - they feel exceptional."
    },
    education: [
      "MCA - Lourdes Matha College of Science and Technology, Trivandrum (2025-2027), currently pursuing",
      "BCA - Symbiosis Institute of Computer Studies & Research, Pune (2022-2025), CGPA 7.0",
      "12th Grade (PCMB) - Bharatiya Vidya Bhavan Senior Secondary School, Thiruvananthapuram, 77%",
      "10th Grade (SSLC) - Bharatiya Vidya Bhavan Senior Secondary School, Thiruvananthapuram, 87%"
    ],
    skills: {
      frontend: ["HTML5", "CSS3", "JavaScript", "React JS", "Tailwind CSS", "Bootstrap", "Next JS"],
      creative: ["Three.js", "Figma"],
      other: ["Python", "MySQL", "Git", "GitHub"]
    },
    stats: [
      "10+ tech skills",
      "3+ years of coding",
      "BCA CGPA: 7.0",
      "10th score: 87%",
      "12th score: 77%"
    ],
    contact: {
      email: "sasanush86@gmail.com",
      github: "https://github.com/SA-Sanush",
      linkedin: "https://www.linkedin.com/in/sa-sanush/",
      resume: "./files/Sanush%20Resume.pdf",
      availability: "Open to work and collaboration"
    }
  };

  const SECTION_ALIASES = {
    hero: ["hero", "home", "top", "start"],
    about: ["about", "background", "profile"],
    skills: ["skills", "skill", "tech", "stack"],
    education: ["education", "study", "college", "degree"],
    contact: ["contact", "email", "hire", "reach"]
  };

  const TOPIC_RULES = [
    {
      id: "about",
      keywords: ["who is sanush", "about sanush", "background", "introduce", "summary", "profile", "who is he"],
      reply: userName =>
        `${KNOWLEDGE_BASE.profile.shortName} is a ${KNOWLEDGE_BASE.profile.role} from ${KNOWLEDGE_BASE.profile.location}. ${capitalize(KNOWLEDGE_BASE.profile.status)} and ${KNOWLEDGE_BASE.profile.previousDegree}. ${KNOWLEDGE_BASE.profile.summary} [NAV:about]`
    },
    {
      id: "skills",
      keywords: ["skills", "skill", "tech", "stack", "frontend", "react", "javascript", "html", "css", "tailwind", "bootstrap", "next", "three", "figma", "python", "mysql", "git"],
      reply: userName =>
        `${safeName(userName)}, Sanush works with ${KNOWLEDGE_BASE.skills.frontend.join(", ")}, and also uses ${KNOWLEDGE_BASE.skills.creative.join(" and ")} for creative work. He complements that with ${KNOWLEDGE_BASE.skills.other.join(", ")}, which gives him a solid mix of UI, interaction, and practical development skills. [NAV:skills]`
    },
    {
      id: "education",
      keywords: ["education", "study", "college", "degree", "mca", "bca", "school", "cgpa", "marks"],
      reply: () =>
        `Sanush is currently pursuing his MCA at Lourdes Matha College of Science and Technology in Trivandrum for 2025-2027. Before that, he completed his BCA at Symbiosis Institute of Computer Studies & Research in Pune with a 7.0 CGPA, and earlier scored 77% in 12th and 87% in 10th. [NAV:education]`
    },
    {
      id: "contact",
      keywords: ["contact", "email", "mail", "hire", "reach", "linkedin", "github", "collaborate", "work with"],
      reply: () =>
        `You can contact Sanush at <a href="mailto:${KNOWLEDGE_BASE.contact.email}">${KNOWLEDGE_BASE.contact.email}</a>. His <a href="${KNOWLEDGE_BASE.contact.github}" target="_blank">GitHub</a>, <a href="${KNOWLEDGE_BASE.contact.linkedin}" target="_blank">LinkedIn</a>, and <a href="${KNOWLEDGE_BASE.contact.resume}" target="_blank">Sanush Resume</a> are also available, and he is open to work and collaboration. [NAV:contact]`
    },
    {
      id: "resume",
      keywords: ["resume", "cv"],
      reply: () =>
        `You can open Sanush's resume here: <a href="${KNOWLEDGE_BASE.contact.resume}" target="_blank">Sanush Resume</a>. If you'd like, I can also tell you about his skills, education, or contact details.`
    },
    {
      id: "location",
      keywords: ["location", "where", "based", "city", "kerala", "trivandrum", "thiruvananthapuram", "india"],
      reply: () =>
        `Sanush is based in ${KNOWLEDGE_BASE.profile.location}. His portfolio highlights both his academic journey and his front-end development work. [NAV:hero]`
    },
    {
      id: "projects",
      keywords: ["project", "projects", "work samples", "portfolio work"],
      reply: () =>
        `This portfolio mainly focuses on Sanush's background, education, skills, and contact details, while reflecting his interest in interactive web experiences. For project discussions or collaboration, the best next step is to email him at <a href="mailto:${KNOWLEDGE_BASE.contact.email}">${KNOWLEDGE_BASE.contact.email}</a>.`
    },
    {
      id: "site",
      keywords: ["this site", "this website", "site about", "website about", "what is this site about", "what is this website about", "portfolio about"],
      reply: () =>
        `This site is Sanush's personal portfolio. It introduces who he is, shows his skills and education, shares ways to contact him, and helps visitors explore his work profile as a front-end developer and MCA student. [NAV:hero]`
    },
    {
      id: "stats",
      keywords: ["stats", "score", "numbers", "experience", "years"],
      reply: () =>
        `Here are a few quick highlights: ${KNOWLEDGE_BASE.stats.join(", ")}. Together they show a strong academic base and growing front-end experience.`
    }
  ];

  const trigger = document.getElementById("chat-trigger");
  const win = document.getElementById("chat-window");
  const closeBtn = document.getElementById("chat-close-btn");
  const nameScreen = document.getElementById("chat-name-screen");
  const nameInput = document.getElementById("chat-name-input");
  const nameSubmit = document.getElementById("chat-name-submit");
  const messagesEl = document.getElementById("chat-messages");
  const inputArea = document.getElementById("chat-input-area");
  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");

  let isOpen = false;
  let userName = "";
  let chatHistory = [];
  let isBotTyping = false;
  let lastTopic = "";

  async function getBackendReply() {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userName,
        messages: chatHistory
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        data && typeof data.message === "string" && data.message.trim()
          ? data.message.trim()
          : "The AI backend is not available right now.";
      throw new Error(message);
    }

    if (!data || typeof data.reply !== "string" || !data.reply.trim()) {
      throw new Error("The AI backend returned an empty reply.");
    }

    return data.reply.trim();
  }

  function openChat() {
    isOpen = true;
    trigger.classList.add("open");
    win.classList.add("visible");
    if (userName) {
      chatInput.focus();
    } else {
      nameInput.focus();
    }
  }

  function closeChat() {
    isOpen = false;
    trigger.classList.remove("open");
    win.classList.remove("visible");
  }

  trigger.addEventListener("click", () => (isOpen ? closeChat() : openChat()));
  closeBtn.addEventListener("click", closeChat);

  function extendCursorRing() {
    const curRing = document.getElementById("cur-ring");
    if (!curRing) return;

    [trigger, closeBtn, nameSubmit, sendBtn, ...document.querySelectorAll(".qr-chip, .chat-close-btn")].forEach(
      el => {
        if (!el) return;
        el.addEventListener("mouseenter", () => curRing.classList.add("big"));
        el.addEventListener("mouseleave", () => curRing.classList.remove("big"));
      }
    );
  }

  function submitName() {
    const val = nameInput.value.trim();
    if (!val) {
      nameInput.style.borderColor = "rgba(255,68,68,0.6)";
      setTimeout(() => {
        nameInput.style.borderColor = "";
      }, 1000);
      return;
    }

    userName = val.charAt(0).toUpperCase() + val.slice(1);
    nameScreen.classList.add("hidden");
    messagesEl.classList.remove("hidden");
    inputArea.classList.remove("hidden");

    const notif = trigger.querySelector(".chat-notif");
    if (notif) notif.remove();

    greetUser();
    extendCursorRing();
  }

  nameSubmit.addEventListener("click", submitName);
  nameInput.addEventListener("keydown", event => {
    if (event.key === "Enter") submitName();
  });

  function greetUser() {
    const greeting = getTimeGreeting();
    appendBotMessage(
      `${greeting}, <strong>${escapeHtml(userName)}</strong>! Welcome to Sanush's portfolio. I can answer questions about his background, skills, education, contact details, and help you navigate the site.`
    );

    setTimeout(() => {
      showQuickReplies([
        "Who is Sanush?",
        "What are his skills?",
        "Tell me about his education",
        "How can I contact him?",
        "Open Sanush Resume"
      ]);
    }, 400);
  }

  function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  function appendBotMessage(html) {
    const div = document.createElement("div");
    div.className = "msg-bubble bot";
    div.innerHTML = html;
    messagesEl.appendChild(div);
    scrollToBottom();
  }

  function appendUserMessage(text) {
    const div = document.createElement("div");
    div.className = "msg-bubble user";
    div.textContent = text;
    messagesEl.appendChild(div);
    scrollToBottom();
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "typing-indicator";
    el.id = "typing-indicator";
    el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    messagesEl.appendChild(el);
    scrollToBottom();
    return el;
  }

  function removeTyping() {
    const el = document.getElementById("typing-indicator");
    if (el) el.remove();
  }

  function showQuickReplies(options) {
    document.querySelectorAll(".quick-replies").forEach(el => el.remove());

    const wrap = document.createElement("div");
    wrap.className = "quick-replies";

    options.forEach((opt, index) => {
      const chip = document.createElement("button");
      chip.className = "qr-chip";
      chip.textContent = opt;
      chip.style.animationDelay = `${index * 0.06}s`;
      chip.addEventListener("click", () => {
        wrap.remove();
        handleUserMessage(opt);
      });

      const curRing = document.getElementById("cur-ring");
      if (curRing) {
        chip.addEventListener("mouseenter", () => curRing.classList.add("big"));
        chip.addEventListener("mouseleave", () => curRing.classList.remove("big"));
      }

      wrap.appendChild(chip);
    });

    messagesEl.appendChild(wrap);
    scrollToBottom();
  }

  function scrollToBottom() {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "smooth" });
  }

  function handleNavCommand(text) {
    const match = text.match(/\[NAV:([a-z]+)\]/);
    if (!match) return text;

    const id = match[1];
    const target = document.getElementById(id);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    }

    return text.replace(/\[NAV:[a-z]+\]/g, "").trim();
  }

  function escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return String(text).replace(/[&<>"']/g, char => map[char]);
  }

  function normalizeText(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function safeName(name) {
    return `<strong>${escapeHtml(name || "there")}</strong>`;
  }

  function includesAny(text, patterns) {
    return patterns.some(pattern => hasPhrase(text, pattern));
  }

  function hasPhrase(text, phrase) {
    return ` ${text} `.includes(` ${String(phrase || "").trim()} `);
  }

  function getNavigationReply(normalizedMessage) {
    const sectionId = Object.keys(SECTION_ALIASES).find(id =>
      SECTION_ALIASES[id].some(alias => normalizedMessage.includes(alias))
    );

    if (!sectionId) {
      return `I can take you to About, Skills, Education, or Contact, ${safeName(userName)}. Just tell me which section you'd like to open.`;
    }

    const label = capitalize(sectionId === "hero" ? "home" : sectionId);
    return `Taking you to the ${label} section, ${safeName(userName)}. [NAV:${sectionId}]`;
  }

  function getTopicMatch(normalizedMessage) {
    let bestTopic = null;
    let bestScore = 0;

    TOPIC_RULES.forEach(topic => {
      const score = topic.keywords.reduce((total, keyword) => {
        return total + (hasPhrase(normalizedMessage, keyword) ? keyword.split(" ").length : 0);
      }, 0);

      if (score > bestScore) {
        bestScore = score;
        bestTopic = topic;
      }
    });

    return bestScore > 0 ? bestTopic : null;
  }

  function getFollowUpReply(normalizedMessage) {
    if (!lastTopic) return "";
    if (!includesAny(normalizedMessage, ["tell me more", "more", "details", "detail", "explain", "what else"])) {
      return "";
    }

    if (lastTopic === "skills") {
      return `Sanush's strength is not just knowing tools like ${KNOWLEDGE_BASE.skills.frontend.join(", ")}, but using them to build polished and interactive interfaces. His experience with ${KNOWLEDGE_BASE.skills.creative.join(" and ")} also supports more creative web experiences. [NAV:skills]`;
    }

    if (lastTopic === "education") {
      return `His academic journey shows steady growth, from strong school scores to a BCA with a 7.0 CGPA, and now an MCA for deeper technical development. That gives him both practical momentum and a solid learning base. [NAV:education]`;
    }

    if (lastTopic === "about") {
      return `A simple way to describe Sanush is that he combines academic grounding with creative front-end interest. He cares about interfaces that feel memorable, not just functional, which suits modern web experience work well. [NAV:about]`;
    }

    if (lastTopic === "contact") {
      return `The easiest way to start a conversation with Sanush is by email at <a href="mailto:${KNOWLEDGE_BASE.contact.email}">${KNOWLEDGE_BASE.contact.email}</a>. You can also review his <a href="${KNOWLEDGE_BASE.contact.github}" target="_blank">GitHub</a> and <a href="${KNOWLEDGE_BASE.contact.linkedin}" target="_blank">LinkedIn</a> first. [NAV:contact]`;
    }

    return "";
  }

  function getLocalReply(message) {
    const normalized = normalizeText(message);

    if (!normalized) {
      return `I'm here whenever you're ready, ${safeName(userName)}. Ask me about Sanush's background, skills, education, resume, or contact details.`;
    }

    if (hasPhrase(normalized, "contact sanush") || hasPhrase(normalized, "how can i contact him")) {
      lastTopic = "contact";
      return `You can contact Sanush at <a href="mailto:${KNOWLEDGE_BASE.contact.email}">${KNOWLEDGE_BASE.contact.email}</a>. His <a href="${KNOWLEDGE_BASE.contact.github}" target="_blank">GitHub</a>, <a href="${KNOWLEDGE_BASE.contact.linkedin}" target="_blank">LinkedIn</a>, and <a href="${KNOWLEDGE_BASE.contact.resume}" target="_blank">Sanush Resume</a> are also available, and he is open to work and collaboration. [NAV:contact]`;
    }

    if (hasPhrase(normalized, "what are his skills") || hasPhrase(normalized, "view his skills")) {
      lastTopic = "skills";
      return `${safeName(userName)}, Sanush works with ${KNOWLEDGE_BASE.skills.frontend.join(", ")}, and also uses ${KNOWLEDGE_BASE.skills.creative.join(" and ")} for creative work. He complements that with ${KNOWLEDGE_BASE.skills.other.join(", ")}, which gives him a solid mix of UI, interaction, and practical development skills. [NAV:skills]`;
    }

    if (
      hasPhrase(normalized, "tell me about his education") ||
      hasPhrase(normalized, "education background") ||
      hasPhrase(normalized, "tell me about education")
    ) {
      lastTopic = "education";
      return `Sanush is currently pursuing his MCA at Lourdes Matha College of Science and Technology in Trivandrum for 2025-2027. Before that, he completed his BCA at Symbiosis Institute of Computer Studies & Research in Pune with a 7.0 CGPA, and earlier scored 77% in 12th and 87% in 10th. [NAV:education]`;
    }

    if (
      hasPhrase(normalized, "what is this site about") ||
      hasPhrase(normalized, "what is this website about") ||
      hasPhrase(normalized, "what is this site") ||
      hasPhrase(normalized, "what is this website")
    ) {
      lastTopic = "site";
      return `This site is Sanush's personal portfolio. It highlights his background, technical skills, education, resume, and contact details, while helping visitors quickly navigate the different sections. [NAV:hero]`;
    }

    if (includesAny(normalized, ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"])) {
      return `Hello ${safeName(userName)}. I can tell you about Sanush's background, education, skills, location, resume, and contact details.`;
    }

    if (includesAny(normalized, ["thank you", "thanks"])) {
      return `You're welcome, ${safeName(userName)}. If you'd like, I can also take you to a section of the portfolio or answer another question about Sanush.`;
    }

    if (includesAny(normalized, ["go to", "navigate", "take me", "open section", "show section", "scroll to"])) {
      lastTopic = "navigation";
      return getNavigationReply(normalized);
    }

    const followUpReply = getFollowUpReply(normalized);
    if (followUpReply) return followUpReply;

    const topic = getTopicMatch(normalized);
    if (topic) {
      lastTopic = topic.id;
      return topic.reply(userName);
    }

    return `I can help with Sanush's background, skills, education, resume, contact details, and site navigation, ${safeName(userName)}. Try asking "Who is Sanush?", "What are his skills?", "Tell me about his education", or "How can I contact him?"`;
  }

  function getQuickRepliesForMessage(message) {
    const normalized = normalizeText(message);

    if (includesAny(normalized, ["skill", "tech", "stack", "react", "javascript"])) {
      return ["Tell me more", "Education details", "Contact Sanush"];
    }

    if (includesAny(normalized, ["education", "college", "degree", "mca", "bca"])) {
      return ["Tell me more", "What are his skills?", "Open Sanush Resume"];
    }

    if (includesAny(normalized, ["contact", "email", "hire", "linkedin", "github"])) {
      return ["Open GitHub", "Open LinkedIn", "Send email"];
    }

    if (includesAny(normalized, ["resume", "cv"])) {
      return ["What are his skills?", "Tell me about his education", "Contact Sanush"];
    }

    if (includesAny(normalized, ["who", "about", "background", "sanush"])) {
      return ["What are his skills?", "Tell me about his education", "Contact Sanush"];
    }

    return ["Who is Sanush?", "What are his skills?", "How can I contact him?"];
  }

  function handleQuickAction(text) {
    if (text === "Open Sanush Resume") {
      window.open(KNOWLEDGE_BASE.contact.resume, "_blank");
    } else if (text === "Open GitHub") {
      window.open(KNOWLEDGE_BASE.contact.github, "_blank");
    } else if (text === "Open LinkedIn") {
      window.open(KNOWLEDGE_BASE.contact.linkedin, "_blank");
    } else if (text === "Send email") {
      window.open(`mailto:${KNOWLEDGE_BASE.contact.email}`);
    }
  }

  async function handleUserMessage(text) {
    if (!text.trim() || isBotTyping) return;

    isBotTyping = true;
    sendBtn.disabled = true;

    appendUserMessage(text);
    chatHistory.push({ role: "user", content: text });

    try {
      showTyping();

      let reply = "";

      try {
        reply = await getBackendReply();
      } catch (backendError) {
        reply = getLocalReply(text);

        if (
          backendError &&
          typeof backendError.message === "string" &&
          (backendError.message.includes("OPENAI_API_KEY") ||
            backendError.message.includes("GEMINI_API_KEY"))
        ) {
          reply += ` <br /><br /><em>Note: the live AI backend is not configured yet. Add a Gemini or OpenAI API key in the server environment to enable real model responses.</em>`;
        }
      }

      removeTyping();

      const cleanReply = handleNavCommand(reply);
      chatHistory.push({ role: "assistant", content: reply });
      appendBotMessage(cleanReply);
      showQuickReplies(getQuickRepliesForMessage(text));
      handleQuickAction(text);
    } catch (err) {
      removeTyping();
      appendBotMessage(
        `Something went wrong, ${safeName(userName)}. Please try again or contact Sanush directly at <a href="mailto:${KNOWLEDGE_BASE.contact.email}">${KNOWLEDGE_BASE.contact.email}</a>.`
      );
    }

    isBotTyping = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }

  sendBtn.addEventListener("click", () => {
    const val = chatInput.value.trim();
    if (!val) return;

    chatInput.value = "";
    autoResizeTextarea();
    handleUserMessage(val);
  });

  chatInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const val = chatInput.value.trim();
      if (!val) return;

      chatInput.value = "";
      autoResizeTextarea();
      handleUserMessage(val);
    }
  });

  chatInput.addEventListener("input", autoResizeTextarea);

  function autoResizeTextarea() {
    chatInput.style.height = "auto";
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 100)}px`;
  }
})();
