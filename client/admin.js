let adminQuotes = [];

async function loadAdminQuotes() {
  const token = document.getElementById('adminToken').value;
  const table = document.querySelector("#adminQuoteTable tbody");
  table.innerHTML = "<tr><td colspan='5'>⏳ Loading...</td></tr>";

  try {
    const res = await fetch("http://localhost:5000/api/admin/quotes", {
      headers: { "x-admin-token": token }
    });

    if (!res.ok) throw new Error("Unauthorized or fetch failed");

    const quotes = await res.json();
    adminQuotes = quotes;
    document.getElementById('adminTableWrapper').style.display = 'block';
    renderAdminQuotes(token);
  } catch (err) {
    alert("❌ Invalid admin token or failed to load quotes");
    console.error(err);
  }
}

function renderAdminQuotes(token) {
  const table = document.querySelector("#adminQuoteTable tbody");
  table.innerHTML = "";

  adminQuotes.forEach(q => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><input value="${q.text}" onchange="updateQuote('${q._id}', 'text', this.value, '${token}')"/></td>
      <td><input value="${q.category}" onchange="updateQuote('${q._id}', 'category', this.value, '${token}')"/></td>
      <td><input value="${q.language}" onchange="updateQuote('${q._id}', 'language', this.value, '${token}')"/></td>
      <td>${new Date(q.createdAt).toLocaleString()}</td>
      <td><button onclick="deleteQuote('${q._id}', '${token}')">🗑️ Delete</button></td>
    `;
    table.appendChild(row);
  });
}

async function updateQuote(id, field, value, token) {
  const quote = adminQuotes.find(q => q._id === id);
  if (!quote) return;

  quote[field] = value;

  try {
    const res = await fetch(`http://localhost:5000/api/admin/quote/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token
      },
      body: JSON.stringify({
        text: quote.text,
        category: quote.category,
        language: quote.language
      })
    });

    if (!res.ok) throw new Error("Update failed");
    console.log("✅ Quote updated");
  } catch (err) {
    alert("❌ Failed to update quote");
    console.error(err);
  }
}

async function deleteQuote(id, token) {
  if (!confirm("Are you sure you want to delete this quote?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/admin/quote/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token }
    });

    if (!res.ok) throw new Error("Delete failed");

    adminQuotes = adminQuotes.filter(q => q._id !== id);
    renderAdminQuotes(token);
  } catch (err) {
    alert("❌ Failed to delete quote");
    console.error(err);
  }
}
