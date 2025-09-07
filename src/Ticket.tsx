// src/components/Ticket.tsx
import { toPng } from "html-to-image";
import { useRef, useEffect, useState } from "react";
import { useUserContext } from "./hook/useContext";
import { Github } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import postTicket from "./api/api_aws";

type UploadResult = { secure_url: string; public_id: string };

const SHOULD_DOWNLOAD_LOCAL = false;

export default function Ticket() {
  const { userData } = useUserContext();
  const ticketRef = useRef<HTMLDivElement>(null);


  const [photoURL, setPhotoURL] = useState<string | null>(null);

 
  const hasRunRef = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();

  const assertEnv = () => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;
    const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
    if (!cloudName) throw new Error("Env manquante: VITE_CLOUDINARY_CLOUD_NAME");
    if (!uploadPreset) throw new Error("Env manquante: VITE_CLOUDINARY_UPLOAD_PRESET");
    if (!apiUrl) throw new Error("Env manquante: VITE_API_URL");
    return { cloudName, uploadPreset, apiUrl };
  };

  const uploadToCloudinary = async (
    ticketDataUrl: string,
    fileBaseName: string
  ): Promise<UploadResult> => {
    const { cloudName, uploadPreset } = assertEnv();
    const form = new FormData();
    form.append("file", ticketDataUrl);
    form.append("upload_preset", uploadPreset);

    // public_id unique (évite écrasement et facilite debug)
    const unique = userData?.reqId ?? `${Date.now()}`;
    form.append("public_id", `${fileBaseName}_ticket_${unique}`);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message || "Cloudinary upload failed");
    }
    return json as UploadResult;
  };

  const ensureImagesLoaded = async () => {
    if (!ticketRef.current) return;
    const imgs = Array.from(ticketRef.current.querySelectorAll("img"));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) return resolve();
            const done = () => {
              img.removeEventListener("load", done);
              img.removeEventListener("error", done);
              resolve();
            };
            img.addEventListener("load", done);
            img.addEventListener("error", done);
          })
      )
    );
  };

  const downloadLocal = (dataUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
 
  useEffect(() => {
    if (!userData || !userData.fullName || !userData.email) navigate("/");
  }, [userData, navigate]);

  useEffect(() => {
    // Prépare l’avatar pour l’affichage du ticket uniquement
    let blobUrl: string | null = null;
    if (userData?.avatarUrl instanceof File) {
      blobUrl = URL.createObjectURL(userData.avatarUrl);
      setPhotoURL(blobUrl);
    } else if (typeof userData?.avatarUrl === "string") {
      // on garde l’URL fournie par l’utilisateur (pas l’URL Cloudinary du ticket)
      setPhotoURL(userData.avatarUrl);
    } else {
      setPhotoURL(null);
    }
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [userData?.avatarUrl]);

 
  const captureUploadAndSave = async () => {
    if (!ticketRef.current || !userData) return;

    // Valide les env tôt
    assertEnv();

    await ensureImagesLoaded();

    
    const dataUrl = await toPng(ticketRef.current);

    const cleanName = userData.fullName
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    
    if (SHOULD_DOWNLOAD_LOCAL) {
      downloadLocal(dataUrl, `${cleanName}_ticket.png`);
    }

     
    const uploaded = await uploadToCloudinary(dataUrl, cleanName);

   
    await postTicket({
      fullName: userData.fullName,
      email: userData.email,
      github: userData.github,
      avatarUrl: uploaded.secure_url,
    });

    console.log("✅ Ticket uploadé (Cloudinary) & enregistré via l’API:", uploaded.secure_url);
  };

   
  useEffect(() => {
    if (!userData?.email || !userData?.fullName) return;

    
    const ts = new URLSearchParams(location.search).get("ts");
    const shouldRun = Boolean(userData.reqId || ts || true);

    if (!shouldRun) return;
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    // microtask pour contourner le double-run dev
    queueMicrotask(() => {
      captureUploadAndSave().catch((e) => {
        console.error("❌ Échec capture/upload:", e);
        alert((e as Error).message || "Une erreur est survenue pendant l’upload.");
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.email, userData?.fullName, userData?.reqId, location.search]);
 
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
      <div>
        <img src="/images/logo-full.webp" alt="logo coding conf" className="mb-6 text-3xl font-bold" />
      </div>

      <h1 className="text-4xl font-bold">
        Congrats,{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">
          {userData.fullName}
        </span>
        !
        <br /> Your ticket is ready.
      </h1>

      <p className="mt-5">
        We have uploaded your ticket to our server. <br /> We&apos;ll keep you posted with updates!
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
    </main>
  );
}
