import React, { useState } from "react";
import { CloudUpload, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./hook/useContext";
import postTicket from "./api/api_aws";

export default function Formulaire() {
  const { setUserData } = useUserContext();
  const [avatarUrl, setPhoto] = useState<File | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [github, setGithub] = useState("");
  const [photoError, setPhotoError] = useState<string>("");
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({
    fullName: "",
    email: "",
    github: "",
    avatarUrl: "",
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(photoError);
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setPhotoError("Invalid file type. Please upload a JPG or PNG file.");
      } else {
        const resizedFile = await compressImage(file);
        if (resizedFile.size > 100000) {
          setPhotoError(
            "File size is too large after compression. Please upload a smaller file."
          );
        } else {
          setPhotoError("");
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
    setPhotoError("");
  };

  const validateForm = () => {
    const errors: {
      fullName: string;
      email: string;
      github: string;
      avatarUrl: any;
    } = {
      fullName: "",
      email: "",
      github: "",
      avatarUrl: "",
    };

    if (!fullName) errors.fullName = "Please enter a valid full name.";

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
    }

    if (!avatarUrl) errors.avatarUrl = "Please upload an avatar.";

    setFormErrors(errors);
    return Object.values(errors).every((error) => error === "");
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setUserData({ fullName, email, github, avatarUrl });
      postTicket({ fullName, email, github, avatarUrl: avatarUrl?.name });
      navigate("/ticket");
      console.log({ fullName, email, github, avatarUrl });
    }
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
        <br /> 2025 Starts Here!
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
                  Upload your avatarUrl (JPG or PNG, max size: 500KB).{" "}
                </p>
              </div>
            )}
          </div>

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

          <div>
            <label htmlFor="github" className="block mb-2 text-sm text-left">
              GitHub Username
            </label>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className={`${
                formErrors.github ? "border-red-500" : "border-gray-300"
              } w-full px-3 py-2 text-sm border rounded-md backdrop-blur-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f57564]`}
              placeholder="@yourusername"
            />
            {formErrors.github && (
              <div className="flex items-center mt-1">
                <Info className="w-4 text-red-500" />
                <p className="ml-1 text-xs text-red-500">{formErrors.github}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 text-sm bg-[#f57564] text-black font-bold rounded-md"
          >
            Generate My Ticket
          </button>
        </form>
      </div>
    </main>
  );
}
