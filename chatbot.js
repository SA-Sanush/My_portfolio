(function () {
  "use strict";

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
  const defaultQuickReplies = [
    "Who is Sanush?",
    "View his skills",
    "Education background",
    "Contact Sanush",
    "Sanush Resume"
  ];

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

  function extendCursorRing() {
    const curRing = document.getElementById("cur-ring");
    if (!curRing) return;

    [trigger, closeBtn, nameSubmit, sendBtn, ...document.querySelectorAll(".qr-chip, .chat-close-btn")].forEach(el => {
      if (!el) return;
      el.addEventListener("mouseenter", () => curRing.classList.add("big"));
      el.addEventListener("mouseleave", () => curRing.classList.remove("big"));
    });
  }

  function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  function greetUser() {
    const greeting = getTimeGreeting();
    appendBotMessage(
      `${greeting}, <strong>${userName}</strong>! Welcome to Sanush's portfolio. I'm his AI assistant - I can tell you about his skills, education, background, or help you navigate to any section. What would you like to know?`
    );

    setTimeout(() => {
      showQuickReplies(defaultQuickReplies);
    }, 400);
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
  }

  function removeTyping() {
    const el = document.getElementById("typing-indicator");
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "smooth" });
  }

  function showQuickReplies(options) {
    document.querySelectorAll(".quick-replies").forEach(el => el.remove());

    const wrap = document.createElement("div");
    wrap.className = "quick-replies";

    options.forEach((opt, i) => {
      const chip = document.createElement("button");
      chip.className = "qr-chip";
      chip.textContent = opt;
      chip.style.animationDelay = `${i * 0.06}s`;
      chip.addEventListener("click", () => {
        wrap.remove();
        if (handleQuickAction(opt)) return;
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

  function handleQuickAction(text) {
    const lower = String(text || "").toLowerCase();

    if (lower.includes("resume")) {
      appendUserMessage(text);
      window.open("./Sanush%20Resume.pdf", "_blank");
      return true;
    }

    if (lower.includes("github")) {
      appendUserMessage(text);
      window.open("https://github.com/SA-Sanush", "_blank");
      return true;
    }

    if (lower.includes("linkedin")) {
      appendUserMessage(text);
      window.open("https://www.linkedin.com/in/sa-sanush/", "_blank");
      return true;
    }

    if (lower.includes("email")) {
      appendUserMessage(text);
      window.open("mailto:sasanush86@gmail.com");
      return true;
    }

    return false;
  }

  function handleNavCommand(text) {
    const match = String(text || "").match(/\[NAV:([a-z]+)\]/);
    if (!match) return String(text || "");

    const id = match[1];
    const target = document.getElementById(id);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    }

    return String(text).replace(/\[NAV:[a-z]+\]/g, "").trim();
  }

  function normalizeMessage(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function hasPhrase(text, phrase) {
    return normalizeMessage(text).includes(normalizeMessage(phrase));
  }

  function getLocalReply(text) {
    const normalized = normalizeMessage(text);

    if (!normalized) {
      return `I'm here whenever you're ready, ${userName}. Ask me about Sanush's skills, education, contact details, or portfolio sections.`;
    }

    if (
      hasPhrase(normalized, "contact") ||
      hasPhrase(normalized, "email") ||
      hasPhrase(normalized, "hire") ||
      hasPhrase(normalized, "collaborate")
    ) {
      return `You can contact Sanush at <a href="mailto:sasanush86@gmail.com">sasanush86@gmail.com</a>. His <a href="https://github.com/SA-Sanush" target="_blank">GitHub</a> and <a href="https://www.linkedin.com/in/sa-sanush/" target="_blank">LinkedIn</a> are also available. [NAV:contact]`;
    }

    if (hasPhrase(normalized, "resume") || hasPhrase(normalized, "cv")) {
      return `You can open Sanush's resume here: <a href="./Sanush%20Resume.pdf" target="_blank">Sanush Resume</a>.`;
    }

    if (
      hasPhrase(normalized, "skill") ||
      hasPhrase(normalized, "tech") ||
      hasPhrase(normalized, "stack") ||
      hasPhrase(normalized, "react") ||
      hasPhrase(normalized, "javascript") ||
      hasPhrase(normalized, "html") ||
      hasPhrase(normalized, "css")
    ) {
      return `Sanush works with HTML5, CSS3, JavaScript, React JS, Tailwind CSS, Bootstrap, Next JS, Three.js, Figma, Python, MySQL, Git, and GitHub. [NAV:skills]`;
    }

    if (
      hasPhrase(normalized, "education") ||
      hasPhrase(normalized, "college") ||
      hasPhrase(normalized, "degree") ||
      hasPhrase(normalized, "mca") ||
      hasPhrase(normalized, "bca")
    ) {
      return `Sanush is currently pursuing his MCA at Lourdes Matha College of Science and Technology in Trivandrum (2025-2027). He also completed a BCA at Symbiosis Institute of Computer Studies & Research, Pune with a 7.0 CGPA, plus strong 12th and 10th scores. [NAV:education]`;
    }

    if (
      hasPhrase(normalized, "who is sanush") ||
      hasPhrase(normalized, "about sanush") ||
      hasPhrase(normalized, "who is he") ||
      hasPhrase(normalized, "background") ||
      hasPhrase(normalized, "about")
    ) {
      return `Sanush is a front end developer based in Thiruvananthapuram, Kerala. He's pursuing MCA, and he builds clean, interactive web experiences with both design and development in mind. [NAV:about]`;
    }

    if (
      hasPhrase(normalized, "navigate") ||
      hasPhrase(normalized, "go to") ||
      hasPhrase(normalized, "show") ||
      hasPhrase(normalized, "open section") ||
      hasPhrase(normalized, "scroll to")
    ) {
      if (hasPhrase(normalized, "about")) return "Taking you to the About section. [NAV:about]";
      if (hasPhrase(normalized, "skills")) return "Taking you to the Skills section. [NAV:skills]";
      if (hasPhrase(normalized, "education")) return "Taking you to the Education section. [NAV:education]";
      if (hasPhrase(normalized, "contact")) return "Taking you to the Contact section. [NAV:contact]";
      return "I can take you to About, Skills, Education, or Contact. Which one would you like?";
    }

    if (hasPhrase(normalized, "thank you") || hasPhrase(normalized, "thanks")) {
      return `You're welcome, ${userName}! If you'd like, I can also take you to a section or tell you more about Sanush.`;
    }

    return "";
  }

  async function handleUserMessage(text) {
    if (!text.trim() || isBotTyping) return;

    isBotTyping = true;
    sendBtn.disabled = true;

    appendUserMessage(text);
    chatHistory.push({ role: "user", content: text });
    showTyping();

    try {
      let reply = getLocalReply(text);

      if (!reply) {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName,
            messages: chatHistory
          })
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.ok && typeof data.reply === "string" && data.reply.trim()) {
          reply = data.reply.trim();
        } else if (response.ok && typeof data.reply === "string" && data.reply.trim()) {
          reply = data.reply.trim();
        } else {
          reply = "I can help with Sanush's background, skills, education, contact details, or navigation to any section on this page.";
        }
      }

      removeTyping();
      const cleanReply = handleNavCommand(reply);
      chatHistory.push({ role: "assistant", content: reply });
      appendBotMessage(cleanReply);

      setTimeout(() => showQuickReplies(defaultQuickReplies), 300);
    } catch (error) {
      removeTyping();
      const fallback =
        getLocalReply(text) ||
        "I can still help with Sanush's skills, education, contact info, resume, or page navigation.";
      appendBotMessage(fallback);
      setTimeout(() => showQuickReplies(defaultQuickReplies), 300);
    }

    isBotTyping = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }

  function autoResizeTextarea() {
    chatInput.style.height = "auto";
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 100)}px`;
  }

  trigger.addEventListener("click", () => (isOpen ? closeChat() : openChat()));
  closeBtn.addEventListener("click", closeChat);
  nameSubmit.addEventListener("click", submitName);
  nameInput.addEventListener("keydown", event => {
    if (event.key === "Enter") submitName();
  });

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
})();
