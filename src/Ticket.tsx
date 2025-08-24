import { toPng } from "html-to-image";
import { useRef, useEffect, useState } from "react";
import { useUserContext } from "./hook/useContext";
import { Github } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Ticket() {
  const { userData } = useUserContext();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate(); // Ajout de useNavigate

  // 🔄 Redirection vers l'accueil si les données sont manquantes
  useEffect(() => {
    if (!userData || !userData.fullName || !userData.email) {
      navigate("/"); // Redirige vers l'accueil
    }
  }, [userData, navigate]);

  useEffect(() => {
    let url: string | null = null;
    if (userData?.avatarUrl instanceof File) {
      url = URL.createObjectURL(userData.avatarUrl);
      setPhotoURL(url);
    } else if (typeof userData?.avatarUrl === "string") {
      setPhotoURL(userData.avatarUrl);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [userData?.avatarUrl]);

  const ensureImagesLoaded = async () => {
    if (!ticketRef.current) return;
    const images = Array.from(ticketRef.current.querySelectorAll("img"));
    await Promise.all(
      images.map((img) => {
        return new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
          } else {
            const onLoadOrError = () => {
              img.removeEventListener("load", onLoadOrError);
              img.removeEventListener("error", onLoadOrError);
              resolve();
            };
            img.addEventListener("load", onLoadOrError);
            img.addEventListener("error", onLoadOrError);
          }
        });
      })
    );
  };

  const captureAndUpload = async () => {
    if (!ticketRef.current || !userData) return;

    await ensureImagesLoaded();
    const dataUrl = await toPng(ticketRef.current);

    const link = document.createElement("a");
    link.href = dataUrl;
    const cleanName = userData.fullName.replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    link.download = `${cleanName}_ticket.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    try {
      await uploadToS3(dataUrl);
    } catch {
      return;
    }
  };

  const uploadToS3 = async (imageDataUrl: string) => {
    try {
      if (!import.meta.env.VITE_API_UPLOAD_S3 || !userData) return;
      const filename = `${userData.fullName.replace(/\s+/g, "-")}_ticket.png`;
      await fetch(import.meta.env.VITE_API_UPLOAD_S3, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, filename }),
      });
      console.log("✅ Ticket uploadé dans S3 !");
    } catch (error) {
      console.error("❌ Erreur lors de l'upload S3 :", error);
      throw error;
    }
  };

  useEffect(() => {
    if (userData?.email && userData?.reqId) {
      captureAndUpload();
    }
  }, [userData?.reqId, userData?.email]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ts = params.get("ts");
    if (ts && userData?.email) {
      captureAndUpload();
    }
  }, [location.search, userData?.email]);

  useEffect(() => {
    if (userData?.email && !userData?.reqId) {
      captureAndUpload();
    }
  }, []);

  // Si pas de données, on affiche un loader pendant la redirection
  if (!userData || !userData.fullName) {
    return (
      <div className="flex flex-col justify-center items-center p-4 h-screen text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p className="mt-4">Redirection...</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col justify-center items-center p-4 h-screen text-sm text-center text-white">
      <Link to="/">
        <img src="/images/logo-full.webp" alt="logo coding conf" className="mb-6 text-3xl font-bold" />
      </Link>

      <h1 className="text-4xl font-bold">
        Congrats,{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">
          {userData.fullName}
        </span>
        !
        <br /> Your ticket is ready.
      </h1>

      <p className="mt-5">
        We have uploaded your ticket to our server. <br />
        We'll keep you posted with updates!
      </p>

      <div className="flex items-center mt-8">
        <div ref={ticketRef} className="relative w-96">
          <img src="/images/pattern-ticket.webp" alt="ticket background" className="w-full" />
          <div className="absolute top-2/4 left-1/4 mt-2 ml-10 text-center transform -translate-x-1/2 -translate-y-1/2">
            <img src="/images/logo-full.webp" alt="logo coding conf" className="text-3xl font-bold" />
            <p className="mt-2 ml-8 text-slate-400">Juin 19, 2026 / Austin, TX</p>
            <div className="flex items-start my-5">
              <img
                src={photoURL || "/images/image-avatar.jpg"}
                alt="User Avatar"
                className="object-cover w-16 h-16 rounded-md"
              />
              <div className="flex flex-col ml-2">
                <h2 className="w-40 text-xl text-left truncate">{userData.fullName}</h2>
                <div className="flex items-center">
                  <Github className="w-5" />
                  <p className="ml-1 text-base truncate text-slate-400">{userData.github}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button onClick={captureAndUpload} className="mt-6 px-4 py-2 bg-[#f57564] text-black font-bold rounded-md">
        Télécharger mon ticket
      </button>
    </main>
  );
}