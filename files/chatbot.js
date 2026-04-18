/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SANUSH PORTFOLIO â€” AI CHATBOT
   Powered by Claude (Anthropic API)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

(function () {
  "use strict";

  /* â”€â”€ Portfolio knowledge base passed to Claude â”€â”€ */
  const PORTFOLIO_CONTEXT = `
You are an AI assistant embedded in S A Sanush's personal portfolio website. You help visitors learn about Sanush and navigate the portfolio. Always be friendly, concise, and professional. Use the user's name whenever you naturally can.

== ABOUT SANUSH ==
Full Name: S A Sanush (Sanush)
Role: Front End Developer
Location: Thiruvananthapuram, Kerala, India
Status: Currently pursuing MCA (Master of Computer Applications) at Lourdes Matha College of Science and Technology, Trivandrum, Kerala (2025â€“2027)
Previous Degree: BCA (Bachelor of Computer Applications) from Symbiosis Institute of Computer Studies & Research, Pune, Maharashtra (2022â€“2025) â€” CGPA: 7.0
Quote: "Passionate about blending design and development, creating interfaces that don't just work â€” they feel exceptional."

== EDUCATION ==
- MCA â€” Lourdes Matha College of Science & Technology, Trivandrum (2025â€“2027) â€” Currently pursuing
- BCA â€” Symbiosis Institute of Computer Studies & Research, Pune (2022â€“2025) â€” CGPA: 7.0
- 12th Grade (PCMB) â€” Bharatiya Vidya Bhavan Sr. Sec. School, Thiruvananthapuram â€” 77%
- 10th Grade (SSLC) â€” Bharatiya Vidya Bhavan Sr. Sec. School, Thiruvananthapuram â€” 87%

== SKILLS ==
Frontend: HTML5, CSS3, JavaScript, React JS, Tailwind CSS, Bootstrap, Next JS
3D & Creative: Three.js
Design: Figma
Backend/Other: Python, MySQL, Git & GitHub
Experience: 3+ years of coding, 10+ tech skills mastered

== STATS ==
- 10+ Tech Skills
- BCA CGPA: 7.0
- 10th Score: 87%
- 12th Score: 77%
- 3+ Years Coding

== CONTACT ==
Email: sasanush86@gmail.com
GitHub: https://github.com/SA-Sanush
LinkedIn: https://www.linkedin.com/in/sa-sanush/
Resume: ./Sanush%20Resume.pdf
Availability: Open to Work & Collaboration

== PORTFOLIO SECTIONS (for navigation guidance) ==
- Hero (#hero) â€” Introduction, name, role, CTA buttons
- About (#about) â€” Who Sanush is, background, about stats
- Skills (#skills) â€” All technical skills listed as cards with proficiency
- Education (#education) â€” Full academic history
- Contact (#contact) â€” Email, GitHub, LinkedIn, Resume link, availability

== NAVIGATION INSTRUCTIONS ==
When someone wants to go to a section, tell them you're navigating there and also programmatically scroll there using special navigation commands in your reply. To trigger navigation, include this exact pattern at the END of your reply (it will be hidden from the user): [NAV:sectionid] where sectionid is one of: hero, about, skills, education, contact.

== BEHAVIOR RULES ==
1. Always address the user by their name naturally (not every single sentence, but regularly).
2. Keep responses concise â€” 2â€“4 sentences usually, unless more detail is genuinely needed.
3. If someone wants to contact Sanush, provide the email and social links.
4. If asked to navigate somewhere, do it and confirm.
5. Never make up information not listed here.
6. Be warm, enthusiastic, and reflective of Sanush's creative developer personality.
7. If someone asks about projects, mention that Sanush is an MCA student passionate about web experiences and they can reach him directly for project collaboration.
8. Format links as clickable HTML anchor tags like: <a href="URL" target="_blank">link text</a>
`;

  /* â”€â”€ DOM refs â”€â”€ */
  const trigger       = document.getElementById("chat-trigger");
  const win           = document.getElementById("chat-window");
  const closeBtn      = document.getElementById("chat-close-btn");
  const nameScreen    = document.getElementById("chat-name-screen");
  const nameInput     = document.getElementById("chat-name-input");
  const nameSubmit    = document.getElementById("chat-name-submit");
  const messagesEl    = document.getElementById("chat-messages");
  const inputArea     = document.getElementById("chat-input-area");
  const chatInput     = document.getElementById("chat-input");
  const sendBtn       = document.getElementById("chat-send");

  /* â”€â”€ State â”€â”€ */
  let isOpen       = false;
  let userName     = "";
  let chatHistory  = [];          // [{role, content}]
  let isBotTyping  = false;

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     OPEN / CLOSE
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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

  trigger.addEventListener("click", () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener("click", closeChat);

  /* Extend cursor big ring to chatbot elements */
  function extendCursorRing() {
    const curRing = document.getElementById("cur-ring");
    if (!curRing) return;
    [trigger, closeBtn, nameSubmit, sendBtn, ...document.querySelectorAll(".qr-chip, .chat-close-btn")].forEach(el => {
      if (!el) return;
      el.addEventListener("mouseenter", () => curRing.classList.add("big"));
      el.addEventListener("mouseleave", () => curRing.classList.remove("big"));
    });
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     NAME CAPTURE
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  function submitName() {
    const val = nameInput.value.trim();
    if (!val) {
      nameInput.style.borderColor = "rgba(255,68,68,0.6)";
      setTimeout(() => nameInput.style.borderColor = "", 1000);
      return;
    }
    userName = val.charAt(0).toUpperCase() + val.slice(1);
    nameScreen.classList.add("hidden");
    messagesEl.classList.remove("hidden");
    inputArea.classList.remove("hidden");
    // Remove notification dot
    const notif = trigger.querySelector(".chat-notif");
    if (notif) notif.remove();
    greetUser();
    extendCursorRing();
  }

  nameSubmit.addEventListener("click", submitName);
  nameInput.addEventListener("keydown", e => { if (e.key === "Enter") submitName(); });

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     GREETING
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  function greetUser() {
    const greeting = getTimeGreeting();
    const greetMsg = `${greeting}, <strong>${userName}</strong>! ðŸ‘‹ Welcome to Sanush's portfolio. I'm his AI assistant â€” I can tell you about his skills, education, background, or help you navigate to any section. What would you like to know?`;
    appendBotMessage(greetMsg);
    setTimeout(() => {
      showQuickReplies([
        "Who is Sanush?",
        "View his skills",
        "Education background",
        "Contact Sanush",
        "Sanush Resume â†—"
      ]);
    }, 400);
  }

  function getTimeGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     MESSAGE RENDERING
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
    el.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
    messagesEl.appendChild(el);
    scrollToBottom();
    return el;
  }

  function removeTyping() {
    const el = document.getElementById("typing-indicator");
    if (el) el.remove();
  }

  function showQuickReplies(options) {
    // Remove previous quick replies
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
        handleUserMessage(opt);
      });
      // extend cursor ring
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

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     NAVIGATION
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  function handleNavCommand(text) {
    const match = text.match(/\[NAV:([a-z]+)\]/);
    if (match) {
      const id = match[1];
      const target = document.getElementById(id);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 400);
      }
      // Return text without the nav command
      return text.replace(/\[NAV:[a-z]+\]/g, "").trim();
    }
    return text;
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

    if (hasPhrase(normalized, "contact") || hasPhrase(normalized, "email") || hasPhrase(normalized, "hire") || hasPhrase(normalized, "collaborate")) {
      return `You can contact Sanush at <a href="mailto:sasanush86@gmail.com">sasanush86@gmail.com</a>. His <a href="https://github.com/SA-Sanush" target="_blank">GitHub</a> and <a href="https://www.linkedin.com/in/sa-sanush/" target="_blank">LinkedIn</a> are also available. [NAV:contact]`;
    }

    if (hasPhrase(normalized, "resume") || hasPhrase(normalized, "cv")) {
      return `You can open Sanush's resume here: <a href="./Sanush%20Resume.pdf" target="_blank">Sanush Resume</a>.`; 
    }

    if (hasPhrase(normalized, "skill") || hasPhrase(normalized, "tech") || hasPhrase(normalized, "stack") || hasPhrase(normalized, "react") || hasPhrase(normalized, "javascript") || hasPhrase(normalized, "html") || hasPhrase(normalized, "css")) {
      return `Sanush works with HTML5, CSS3, JavaScript, React JS, Tailwind CSS, Bootstrap, Next JS, Three.js, Figma, Python, MySQL, Git, and GitHub. [NAV:skills]`;
    }

    if (hasPhrase(normalized, "education") || hasPhrase(normalized, "college") || hasPhrase(normalized, "degree") || hasPhrase(normalized, "mca") || hasPhrase(normalized, "bca")) {
      return `Sanush is currently pursuing his MCA at Lourdes Matha College of Science and Technology in Trivandrum (2025-2027). He also completed a BCA at Symbiosis Institute of Computer Studies & Research, Pune with a 7.0 CGPA, plus strong 12th and 10th scores. [NAV:education]`;
    }

    if (hasPhrase(normalized, "who is sanush") || hasPhrase(normalized, "about sanush") || hasPhrase(normalized, "who is he") || hasPhrase(normalized, "about")) {
      return `Sanush is a front end developer based in Thiruvananthapuram, Kerala. He's pursuing MCA, and he builds clean, interactive web experiences with both design and development in mind. [NAV:about]`;
    }

    if (hasPhrase(normalized, "navigate") || hasPhrase(normalized, "go to") || hasPhrase(normalized, "show") || hasPhrase(normalized, "open section") || hasPhrase(normalized, "scroll to")) {
      if (hasPhrase(normalized, "about")) return `Taking you to the About section. [NAV:about]`;
      if (hasPhrase(normalized, "skills")) return `Taking you to the Skills section. [NAV:skills]`;
      if (hasPhrase(normalized, "education")) return `Taking you to the Education section. [NAV:education]`;
      if (hasPhrase(normalized, "contact")) return `Taking you to the Contact section. [NAV:contact]`;
      return `I can take you to About, Skills, Education, or Contact. Which one would you like?`;
    }

    if (hasPhrase(normalized, "thank you") || hasPhrase(normalized, "thanks")) {
      return `You're welcome, ${userName}! If you'd like, I can also take you to a section or tell you more about Sanush.`;
    }

    return `I'm having trouble reaching the AI backend right now. In the meantime, I can still answer basic questions about Sanush's skills, education, contact info, or sections on the page.`;
  }
  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     SEND MESSAGE
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  async function handleUserMessage(text) {
    if (!text.trim() || isBotTyping) return;
    isBotTyping = true;
    sendBtn.disabled = true;

    appendUserMessage(text);
    chatHistory.push({ role: "user", content: text });

    const typingEl = showTyping();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          messages: chatHistory
        })
      });

      const data = await response.json().catch(() => ({}));
      removeTyping();

      let reply = "";
      if (response.ok && data.ok && typeof data.reply === "string" && data.reply.trim()) {
        reply = data.reply.trim();
      } else if (response.ok && typeof data.reply === "string" && data.reply.trim()) {
        reply = data.reply.trim();
      } else if (data.content && data.content[0] && data.content[0].text) {
        // Legacy fallback for direct Anthropic responses
        reply = data.content[0].text;
      } else if (data.message) {
        reply = `${getLocalReply(text)} <br /><br><em>Backend note: ${data.message}</em>`;
      } else {
        reply = getLocalReply(text);
      }

      // Handle navigation
      const cleanReply = handleNavCommand(reply);

      chatHistory.push({ role: "assistant", content: reply });
      appendBotMessage(cleanReply);

      // Smart quick replies based on context
      const lower = text.toLowerCase();
      if (lower.includes("skill") || lower.includes("tech") || lower.includes("stack")) {
        setTimeout(() => showQuickReplies(["Tell me more about React", "View Education", "Contact Sanush"]), 300);
      } else if (lower.includes("education") || lower.includes("study") || lower.includes("college") || lower.includes("degree")) {
        setTimeout(() => showQuickReplies(["View Skills", "Contact Sanush", "Sanush Resume â†—"]), 300);
      } else if (lower.includes("contact") || lower.includes("email") || lower.includes("hire") || lower.includes("collaborate")) {
        setTimeout(() => showQuickReplies(["Open GitHub â†—", "Open LinkedIn â†—", "Send Email â†—"]), 300);
      } else if (lower.includes("resume") || lower.includes("cv")) {
        setTimeout(() => showQuickReplies(["Contact Sanush", "View Skills", "Who is Sanush?"]), 300);
      } else if (lower.includes("about") || lower.includes("who") || lower.includes("sanush")) {
        setTimeout(() => showQuickReplies(["View his skills", "Education background", "Contact Sanush"]), 300);
      }

      // Handle special quick reply actions
      if (text === "Sanush Resume â†—") {
        window.open("./Sanush%20Resume.pdf", "_blank");
      } else if (text === "Open GitHub â†—") {
        window.open("https://github.com/SA-Sanush", "_blank");
      } else if (text === "Open LinkedIn â†—") {
        window.open("https://www.linkedin.com/in/sa-sanush/", "_blank");
      } else if (text === "Send Email â†—") {
        window.open("mailto:sasanush86@gmail.com");
      }

    } catch (err) {
      removeTyping();
      const fallback = getLocalReply(text);
      appendBotMessage(`${fallback} <br /><br><em>Backend note: ${err && err.message ? err.message : 'unable to reach the chat service'}</em>`);
    }

    isBotTyping = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     INPUT EVENTS
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  sendBtn.addEventListener("click", () => {
    const val = chatInput.value.trim();
    if (val) {
      chatInput.value = "";
      autoResizeTextarea();
      handleUserMessage(val);
    }
  });

  chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const val = chatInput.value.trim();
      if (val) {
        chatInput.value = "";
        autoResizeTextarea();
        handleUserMessage(val);
      }
    }
  });

  chatInput.addEventListener("input", autoResizeTextarea);

  function autoResizeTextarea() {
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + "px";
  }

})();
