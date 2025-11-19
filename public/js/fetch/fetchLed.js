import { API_KEY } from "../config.js";

export async function sendLightCommand(side, state) {
  try {
    const res = await fetch(`/api/v1/lights/${side}/${state}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({}),
    });

    const data = await res.json().catch(() => ({}));
    console.log(
      "[UI] /lights command response:",
      side,
      state,
      res.status,
      data
    );

    if (!res.ok || !data.ok) {
      alert(
        "Failed to send light command: " +
          (data.error || data.detail || res.status)
      );
    }
  } catch (err) {
    console.error("Error calling /api/v1/lights:", side, state, err);
    alert("Error calling /api/v1/lights: " + err.message);
  }
}

export async function leftOn() {
  return sendLightCommand("L", "on");
}

export async function rightOn() {
  return sendLightCommand("R", "on");
}

export async function leftOff() {
  return sendLightCommand("L", "off");
}

export async function rightOff() {
  return sendLightCommand("R", "off");
}