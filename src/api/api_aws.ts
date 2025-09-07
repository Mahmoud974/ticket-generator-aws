// src/api/postTicket.ts
const postTicket = async (data: {
  fullName: string;
  email: string;
  github: string;
  avatarUrl: string;
}) => {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (!apiUrl) throw new Error("Env manquante: VITE_API_URL");

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Erreur API ${response.status}: ${text || "unknown"}`);
  }

  return response.json();
};

export default postTicket;
