const API_KEY = "banana";

export async function beginSession() {
  try {
    const res = await fetch("/api/v1/session/begin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({}),
    });

    const data = await res.json().catch(() => ({}));
    console.log("[UI] /session/begin response:", res.status, data);

    if (!res.ok || !data.ok) {
      alert("Failed to begin session: " + (data.error || res.status));
    }
  } catch (err) {
    console.error("Error calling /api/v1/session/begin:", err);
    alert("Error calling /api/v1/session/begin: " + err.message);
  }
}

export async function endSession(json) {
  try {
    const res = await fetch("/api/v1/session/end", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: json,
    });
    const data = await res.json().catch(() => ({}));
    console.log("[UI] /session/end response:", res.status, data);

    if (!res.ok || !data.ok) {
      alert("Failed to end session: " + (data.error || res.status));
    }
  } catch (err) {
    console.error("Error calling /api/v1/session/end:", err);
    alert("Error calling /api/v1/session/end: " + err.message);
  }
}