const promptInput = document.getElementById('prompt');
const quoteBox = document.getElementById('quote');
const categorySelect = document.getElementById('category');
const languageSelect = document.getElementById('language');

let token = localStorage.getItem('token') || '';
let allQuotes = [];

// ✅ Generate Quote
async function generateQuote() {
  const category = categorySelect.value;
  const prompt = promptInput.value.trim() || `Give me a ${category} quote for programmers.`;
  const lang = languageSelect.value;

  quoteBox.innerText = "⏳ Generating quote...";

  try {
    const res = await fetch('http://localhost:5000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    let quote = data.quote || "Keep going!";
    quote = await translateText(quote, lang);
    quoteBox.innerText = `${quote}`;
  } catch (err) {
    quoteBox.innerText = "❌ Failed to generate quote.";
  }
}

// ✅ Translate Text (if needed)
async function translateText(text, lang) {
  if (lang === "en") return text;
  try {
    const res = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "en", target: lang, format: "text" })
    });
    const data = await res.json();
    return data.translatedText;
  } catch {
    return text;
  }
}

// ✅ Smart Prompt Buttons
function useSmartPrompt(text) {
  promptInput.value = text;
}

// ✅ Copy to Clipboard
function copyQuote() {
  const text = quoteBox.innerText;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => alert("✅ Copied!"));
}

// ✅ Speak Quote
function speakQuote() {
  const utterance = new SpeechSynthesisUtterance(quoteBox.innerText);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
}

// ✅ Save Quote to DB
async function saveQuoteToDB() {
  if (!token) return alert("Please log in first.");
  const text = quoteBox.innerText;
  const category = categorySelect.value;
  const language = languageSelect.value;

  try {
    const res = await fetch("http://localhost:5000/api/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ text, category, language })
    });

    const data = await res.json();
    alert(data.message || "Saved!");
    loadSavedQuotes();
  } catch (err) {
    alert("❌ Save failed.");
  }
}

// ✅ Load Quotes from DB
async function loadSavedQuotes() {
  if (!token) return;
  try {
    const res = await fetch("http://localhost:5000/api/my-quotes", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    allQuotes = await res.json();
    renderQuotes(allQuotes);
    showQuoteStats();
  } catch (err) {
    alert("❌ Load failed.");
  }
}

// ✅ Render Quotes in Table
function renderQuotes(quotes) {
  const tbody = document.querySelector("#quote-table tbody");
  if (quotes.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>📭 No quotes found.</td></tr>";
    return;
  }
  tbody.innerHTML = "";
  quotes.forEach(q => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${q.text}</td>
      <td>${q.category}</td>
      <td>${q.language}</td>
      <td>${new Date(q.createdAt).toLocaleString()}</td>
    `;
    tbody.appendChild(row);
  });
}

// ✅ Search & Filter
function filterQuotes() {
  const keyword = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('filterCategory').value;
  const language = document.getElementById('filterLanguage').value;

  const filtered = allQuotes.filter(q => {
    const matchesKeyword = q.text.toLowerCase().includes(keyword);
    const matchesCategory = category ? q.category === category : true;
    const matchesLanguage = language ? q.language === language : true;
    return matchesKeyword && matchesCategory && matchesLanguage;
  });

  renderQuotes(filtered);
}

// ✅ Export Quotes to CSV
function exportQuotesToCSV() {
  if (!allQuotes.length) return alert("⚠️ No quotes to export!");

  const headers = ["Quote", "Category", "Language", "Date"];
  const rows = allQuotes.map(q => [
    `"${q.text.replace(/"/g, '""')}"`,
    q.category,
    q.language,
    new Date(q.createdAt).toLocaleString()
  ]);

  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.csv";
  a.click();
}

// ✅ Export Quote as Image
function downloadQuoteAsImage() {
  const element = document.getElementById("quote");
  if (!element.innerText || element.innerText.includes("quote will appear")) {
    return alert("⚠️ No quote to export!");
  }

  html2canvas(element).then(canvas => {
    const link = document.createElement("a");
    link.download = "quote_card.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

// ✅ Show Stats with Chart.js
function showQuoteStats() {
  const categoryCounts = {};
  const languageCounts = {};

  allQuotes.forEach(q => {
    categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    languageCounts[q.language] = (languageCounts[q.language] || 0) + 1;
  });

  renderPieChart('categoryChart', 'Quotes by Category', categoryCounts);
  renderPieChart('languageChart', 'Quotes by Language', languageCounts);
}

function renderPieChart(canvasId, label, dataObj) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(dataObj),
      datasets: [{
        label,
        data: Object.values(dataObj),
        backgroundColor: ['#ff9800', '#4caf50', '#2196f3', '#9c27b0', '#f44336', '#00bcd4']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: label }
      }
    }
  });
}

// ✅ Login
async function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value.trim();
  if (!email || !password) return alert("Enter email & password");

  const res = await fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (data.token) {
    token = data.token;
    localStorage.setItem("token", token);
    alert("✅ Logged in");
    window.location.reload();
  } else {
    alert(data.error || "❌ Login failed.");
  }
}

// ✅ Logout
function logoutUser() {
  localStorage.removeItem("token");
  alert("🚪 Logged out.");
  window.location.reload();
}

// ✅ Fetch Profile Info
async function fetchProfile() {
  if (!token) return;

  try {
    const res = await fetch("http://localhost:5000/api/my-profile", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById("profileBox").style.display = "block";
      document.getElementById("profileName").innerText = data.name;
      document.getElementById("profileEmail").innerText = data.email;
      document.getElementById("loginBox").style.display = "none";
      loadSavedQuotes();
    }
  } catch (err) {
    console.warn("⚠️ Profile fetch failed:", err.message);
  }
}

// ✅ Init
window.addEventListener("DOMContentLoaded", fetchProfile);
