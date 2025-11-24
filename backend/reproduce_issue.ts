const API_URL = "http://localhost:4001/api/v1";

async function run() {
  console.log("1. Logging in with wallet...");
  const loginRes = await fetch(`${API_URL}/login-wallet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: "0x1234567890abcdef1234567890abcdef12345678",
    }),
  });

  if (!loginRes.ok) {
    console.error("Login failed:", loginRes.status, await loginRes.text());
    return;
  }

  const loginData = await loginRes.json();
  console.log("Login success. Token:", loginData.token);

  const token = loginData.token;

  console.log("\n2. Attempting to update user...");
  const updateRes = await fetch(`${API_URL}/update-user`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bio: "Updated bio from script" }),
  });

  if (updateRes.ok) {
    console.log("Update success:", await updateRes.json());
  } else {
    console.error("Update failed:", updateRes.status, await updateRes.text());
  }
}

run().catch(console.error);
