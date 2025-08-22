import React, { useState, useEffect, useRef } from "react";
import {
  CloudUpload,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./hook/useContext";
import postTicket from "./api/api_aws";
import { toPng } from "html-to-image";

export default function Formulaire() {
  const { setUserData } = useUserContext();
  const [avatarUrl, setPhoto] = useState<File | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [github, setGithub] = useState("");
  const [githubStatus, setGithubStatus] = useState<
    "loading" | "valid" | "invalid" | ""
  >("");
  const [forceUpdate, setForceUpdate] = useState(0);
  const navigate = useNavigate();
  const ticketRef = useRef<HTMLDivElement>(null);

  // Autocomplete GitHub
  type GithubSuggestion = { login: string; avatar_url: string; name?: string };
  const [suggestions, setSuggestions] = useState<GithubSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formErrors, setFormErrors] = useState({
    fullName: "",
    email: "",
    github: "",
    avatarUrl: "",
  });

  useEffect(() => {
    const checkGithubUser = async () => {
      if (!github || !/^@[a-zA-Z0-9_-]+$/.test(github)) {
        setGithubStatus("");
        return;
      }

      setGithubStatus("loading");

      try {
        const username = github.replace("@", "");
        const res = await fetch(`https://api.github.com/users/${username}`);
        setGithubStatus(res.ok ? "valid" : "invalid");
      } catch {
        setGithubStatus("invalid");
      }
    };

    const delay = setTimeout(checkGithubUser, 600);
    return () => clearTimeout(delay);
  }, [github]);

  // Recherche debouncée pour suggestions GitHub
  useEffect(() => {
    const term = github.replace("@", "").trim();
    if (!term) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const searchRes = await fetch(
          `https://api.github.com/search/users?q=${encodeURIComponent(term)}+in:login&type=Users&per_page=5`,
          { signal: controller.signal }
        );
        if (!searchRes.ok) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }
        const searchData = await searchRes.json();
        const base: GithubSuggestion[] = (searchData.items || []).map((u: any) => ({
          login: u.login,
          avatar_url: u.avatar_url,
        }));

        const withNames = await Promise.all(
          base.map(async (u) => {
            try {
              const r = await fetch(`https://api.github.com/users/${u.login}`, {
                signal: controller.signal,
              });
              if (r.ok) {
                const d = await r.json();
                return { ...u, name: d.name || undefined } as GithubSuggestion;
              }
            } catch (err) {
              console.debug("GitHub user details fetch skipped", err);
            }
            return u;
          })
        );

        setSuggestions(withNames);
        setShowSuggestions(true);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [github]);

  // Fermer le menu si clic en dehors
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setPhoto(null);
      } else {
        const resizedFile = await compressImage(file);
        if (resizedFile.size > 500 * 1024) {
          setPhoto(null);
        } else {
          setPhoto(resizedFile);
        }
      }
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxWidth = 800;
          const scaleSize = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleSize;
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(resizedFile);
              }
            },
            file.type,
            0.7
          );
        };
      };
    });
  };

  const removePhoto = () => {
    setPhoto(null);
  };

  const validateForm = () => {
    const errors = {
      fullName: "",
      email: "",
      github: "",
      avatarUrl: "",
    };

    if (!fullName) {
      errors.fullName = "Please enter a valid full name.";
    } else if (/\d/.test(fullName)) {
      errors.fullName = "The name must not contain numbers.";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      errors.email = "Please enter a valid email address.";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address format.";
    }

    const githubRegex = /^@[a-zA-Z0-9_-]+$/;
    if (!github) {
      errors.github = "Please enter a valid Github Username.";
    } else if (!githubRegex.test(github)) {
      errors.github =
        "GitHub username must start with '@' and contain no spaces.";
    } else if (githubStatus === "invalid") {
      errors.github = "GitHub account doesn't exist.";
    }

    if (!avatarUrl) errors.avatarUrl = "Please upload an avatar.";

    setFormErrors(errors);
    return Object.values(errors).every((error) => error === "");
  };

  const captureAndDownloadTicket = async () => {
    if (!ticketRef.current) return;

    try {
      const dataUrl = await toPng(ticketRef.current);
      
      // Téléchargement local
      const link = document.createElement("a");
      link.href = dataUrl;
      const cleanName = fullName.replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      link.download = `${cleanName}_ticket.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log("✅ Ticket téléchargé avec succès !");
    } catch (error) {
      console.error("❌ Erreur lors de la capture du ticket :", error);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      const reqId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUserData({ fullName, email, github, avatarUrl, reqId });
      postTicket({ fullName, email, github, avatarUrl: avatarUrl?.name });
      
      // Forcer la mise à jour du composant caché
      setForceUpdate(prev => prev + 1);
      
      // Capturer et télécharger le ticket
      setTimeout(() => {
        captureAndDownloadTicket();
      }, 100);
     
      navigate(`/ticket?ts=${Date.now()}`);

    }
  };

  const onSelectSuggestion = (u: GithubSuggestion) => {
    setGithub(`@${u.login}`);
    setGithubStatus("valid");
    setShowSuggestions(false);
  };

  return (
    <main className="flex flex-col justify-center items-center p-4 h-screen text-sm text-center text-white">
      <div>
        <img
          src="/images/logo-full.webp"
          alt="logo coding conf"
          className="mb-6"
          loading="eager"
        />
      </div>
      <h1 className="text-3xl font-bold">
        Your Journey to Coding Conf
        <br />
        2025 Starts Here!
      </h1>
      <div className="w-full max-w-md">
        <p className="my-5">
          Secure your spot at next year's biggest coding conference.
        </p>
        <form
          method="POST"
          encType="multipart/form-data"
          onSubmit={handleFormSubmit}
          className="space-y-4"
        >
          {/* Avatar Upload */}
          <div>
            <label className="block mb-2 text-sm text-left" htmlFor="image">
              Upload Avatar
            </label>
            <div
              className={`${
                formErrors.avatarUrl ? "border-red-500" : "border-gray-300"
              } flex flex-col border-2 border-dashed p-4 rounded-md`}
            >
              {avatarUrl ? (
                <div className="flex relative flex-col">
                  <img
                    src={URL.createObjectURL(avatarUrl)}
                    alt="Uploaded Avatar"
                    className="object-cover mx-auto mb-3 w-16 h-16 rounded-md"
                  />
                  <div className="flex gap-2 mx-auto">
                    <p
                      onClick={removePhoto}
                      className="px-2 py-1 text-white rounded-sm transition-opacity duration-300 cursor-pointer opacity-35 bg-slate-600 hover:underline hover:opacity-100"
                    >
                      Remove image
                    </p>
                    <p
                      onClick={removePhoto}
                      className="px-2 py-1 rounded-sm transition-opacity duration-300 cursor-pointer opacity-35 hover:underline bg-slate-600 hover:opacity-100"
                    >
                      Change image
                    </p>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="image"
                  className="flex flex-col justify-center items-center cursor-pointer"
                >
                  <p className="relative mb-3 text-white flex items-center gap-2 overflow-hidden p-3 rounded-md backdrop-blur-md hover:backdrop-blur-lg transition-all duration-300 border border-gray-500 hover:border-[#f57564] focus:outline-none focus:ring-2 focus:ring-[#f57564] focus:ring-opacity-50">
                    <CloudUpload className="text-xl text-[#f57564]" />
                  </p>
                  <p
                    className={`ml-1 text-md ${
                      formErrors.avatarUrl && "text-red-500"
                    }`}
                  >
                    Drag and drop or click to upload
                  </p>
                </label>
              )}
              <input
                type="file"
                id="image"
                accept="image/png, image/jpeg"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            {formErrors.avatarUrl ? (
              <div className="flex items-center mt-1">
                <Info className="w-4 text-red-500" />
                <p className="ml-1 text-xs text-red-500">
                  {formErrors.avatarUrl}
                </p>
              </div>
            ) : (
              <div className="flex items-center mt-1">
                <Info className="w-4" />
                <p className="ml-1 text-xs">
                  Upload your avatar (JPG or PNG, max size: 500KB).
                </p>
              </div>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullname" className="block mb-2 text-sm text-left">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`${
                formErrors.fullName ? "border-red-500" : "border-gray-300"
              } w-full px-3 py-2 text-sm border rounded-md backdrop-blur-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f57564]`}
              placeholder="Enter your full name"
            />
            {formErrors.fullName && (
              <div className="flex items-center mt-1">
                <Info className="w-4 text-red-500" />
                <p className="ml-1 text-xs text-red-500">
                  {formErrors.fullName}
                </p>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-2 text-sm text-left">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${
                formErrors.email ? "border-red-500" : "border-gray-300"
              } w-full px-3 py-2 text-sm border rounded-md backdrop-blur-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f57564]`}
              placeholder="example@email.com"
            />
            {formErrors.email && (
              <div className="flex items-center mt-1">
                <Info className="w-4 text-red-500" />
                <p className="ml-1 text-xs text-red-500">{formErrors.email}</p>
              </div>
            )}
          </div>

          {/* GitHub Username */}
          <div>
            <label htmlFor="github" className="block mb-2 text-sm text-left">
              GitHub Username
            </label>
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                value={github}
                onChange={(e) => {
                  setGithub(e.target.value);
                  setShowSuggestions(true);
                }}
                className={`${
                  formErrors.github ? "border-red-500" : "border-gray-300"
                } w-full px-3 py-2 pr-10 text-sm border rounded-md backdrop-blur-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f57564]`}
                placeholder="@yourusername"
              />
              <div className="absolute top-2.5 right-2">
                {githubStatus === "loading" && (
                  <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                )}
                {githubStatus === "valid" && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
                {githubStatus === "invalid" && (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 overflow-hidden text-left rounded-md shadow-lg backdrop-blur-md border border-slate-600 bg-slate-800/70">
                  {suggestions.map((u) => (
                    <button
                      type="button"
                      key={u.login}
                      onClick={() => onSelectSuggestion(u)}
                      className="flex w-full items-center gap-3 px-3 py-2 hover:bg-slate-700/70 text-left"
                    >
                      <img src={u.avatar_url} alt={u.login} className="w-6 h-6 rounded-full" />
                      <div className="flex flex-col">
                        <span className="text-sm text-white">@{u.login}</span>
                        {u.name && (
                          <span className="text-xs text-slate-300">{u.name}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {formErrors.github && (
              <div className="flex items-center mt-1">
                <Info className="w-4 text-red-500" />
                <p className="ml-1 text-xs text-red-500">{formErrors.github}</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 text-sm bg-[#f57564] text-black font-bold rounded-md"
          >
            Generate My Ticket
          </button>
        </form>
      </div>

      {/* 🎟️ Ticket caché pour la capture */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} key={forceUpdate}>
        <div ref={ticketRef} className="relative w-96">
          <img src="/images/pattern-ticket.webp" alt="ticket background" className="w-full" />
          <div className="absolute top-2/4 left-1/4 mt-2 ml-10 text-center transform -translate-x-1/2 -translate-y-1/2">
            <img src="/images/logo-full.webp" alt="logo coding conf" className="text-3xl font-bold" />
            <p className="mt-2 ml-8 text-slate-400">Juin 19, 2026 / Austin, TX</p>
            <div className="flex items-start my-5">
              <img
                src={avatarUrl ? URL.createObjectURL(avatarUrl) : "/images/image-avatar.jpg"}
                alt="User Avatar"
                className="object-cover w-16 h-16 rounded-md"
              />
              <div className="flex flex-col ml-2">
                <h2 className="w-40 text-xl text-left truncate">{fullName || "Your Name"}</h2>
                <div className="flex items-center">
                  <svg className="w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <p className="ml-1 text-base truncate text-slate-400">{github || "@username"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
