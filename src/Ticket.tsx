import html2canvas from "html2canvas";
import { useRef, useEffect, useState } from "react";
import { useUserContext } from "./hook/useContext";
import { Github } from "lucide-react";

export default function Ticket() {
  const { userData } = useUserContext();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  // Gérer l'URL de l'avatar
  useEffect(() => {
    if (userData.avatarUrl instanceof File) {
      const url = URL.createObjectURL(userData.avatarUrl);
      setPhotoURL(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof userData.avatarUrl === "string") {
      setPhotoURL(userData.avatarUrl);
    }
  }, [userData.avatarUrl]);

  useEffect(() => {
    const captureAndSend = async () => {
      if (ticketRef.current) {
        const canvas = await html2canvas(ticketRef.current);
        const dataUrl = canvas.toDataURL("image/png");

        // ✅ Envoi par e-mail
        await sendTicketByEmail(dataUrl);

        // ✅ Téléchargement local
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${userData.fullName}_ticket.png`;
        document.body.appendChild(link); // nécessaire sur Safari
        link.click();
        document.body.removeChild(link);
      }
    };

    captureAndSend();
  }, [userData]);

  // Envoie l'image du ticket au backend
  const sendTicketByEmail = async (imageDataUrl: string) => {
    try {
      const response = await fetch(import.meta.env.VITE_API_SEND_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: userData.fullName,
          email: userData.email,
          ticketImage: imageDataUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi de l'email");
      }

      console.log("Ticket envoyé par e-mail !");
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
    }
  };

  // Capture l'élément et déclenche l'envoi
  useEffect(() => {
    const captureAndSend = async () => {
      if (ticketRef.current) {
        const canvas = await html2canvas(ticketRef.current);
        const dataUrl = canvas.toDataURL("image/png");
        await sendTicketByEmail(dataUrl);
      }
    };

    captureAndSend();
  }, [userData]);

  return (
    <main className="flex flex-col justify-center items-center p-4 h-screen text-sm text-center text-white">
      <a href="/">
        <img
          src="/images/logo-full.webp"
          alt="logo coding conf"
          className="mb-6 text-3xl font-bold"
        />
      </a>

      <h1 className="text-4xl font-bold">
        Congrats,
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">
          {userData.fullName}
        </span>
        !
        <br /> Your ticket is ready.
      </h1>

      <p className="mt-5">
        We've emailed your ticket to <br />
        {userData.email} and will send updates <br />
        in the run-up to the event.
      </p>

      {/* 🎟️ Ticket à capturer */}
      <div className="flex items-center mt-8">
        <div ref={ticketRef} className="relative w-96">
          <img
            src="/images/pattern-ticket.webp"
            alt="ticket background"
            className="w-full"
          />
          <div className="absolute top-2/4 left-1/4 mt-2 ml-10 text-center transform -translate-x-1/2 -translate-y-1/2">
            <img
              src="/images/logo-full.webp"
              alt="logo coding conf"
              className="text-3xl font-bold"
            />
            <p className="mt-2 ml-8 text-slate-400">
              Juin 19, 2026 / Austin, TX
            </p>
            <div className="flex items-start my-5">
              <img
                src={photoURL || "/images/image-avatar.web"}
                alt="User Avatar"
                className="object-cover w-16 h-16 rounded-md"
              />
              <div className="flex flex-col ml-2">
                <h2 className="w-40 text-xl text-left truncate">
                  {userData.fullName}
                </h2>
                <div className="flex items-center">
                  <Github className="w-5" />
                  <p className="ml-1 text-base truncate text-slate-400">
                    {userData.github}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
