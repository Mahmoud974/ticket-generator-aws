import { useEffect } from "react";
import { useUserContext } from "./hook/useContext";
import { Github } from "lucide-react";

export default function Ticket() {
  const { userData } = useUserContext();
  const photoURL = userData.avatarUrl
    ? URL.createObjectURL(userData.avatarUrl)
    : null;

  const downloadTicket = (): void => {
    const ticketData = `
      Ticket for: ${userData.fullName}
      Email: ${userData.email}
      GitHub: ${userData.github}
      Event: Coding Conf 2025, Austin, TX
    `;

    const blob = new Blob([ticketData], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${userData.fullName}_Ticket.txt`;
    link.click();
  };

  useEffect(() => {
    downloadTicket();
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
        We've emailed your ticket to
        <br /> {userData.email} and will send updates in
        <br /> the run-up to the event.
      </p>

      <div className="flex items-center mt-8">
        <div className="relative w-96">
          <img
            src="/images/pattern-ticket.webp"
            alt="ticket user"
            className="w-full"
          />
          <div className="absolute top-2/4 left-1/4 mt-2 ml-10 text-center transform -translate-x-1/2 -translate-y-1/2">
            <img
              src="/images/logo-full.webp"
              alt="logo coding conf"
              className="text-3xl font-bold"
            />
            <p className="mt-2 ml-8 text-slate-400">
              Jan 31, 2025 / Austin, TX
            </p>
            <div className="flex items-start my-5">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="User Avatar"
                  className="object-cover w-16 h-16 rounded-md"
                />
              ) : (
                <img
                  src="/images/image-avatar.web"
                  alt="Uploaded Avatar"
                  className="object-cover w-16 h-16 rounded-md"
                />
              )}

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
