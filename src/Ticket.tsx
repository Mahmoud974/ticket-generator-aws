import { Github } from "lucide-react";
import { useUserContext } from "./hook/useContext";

export default function Ticket() {
  const { userData } = useUserContext();
  const photoURL = userData.photo ? URL.createObjectURL(userData.photo) : null;
  console.log(userData);

  return (
    <main className="flex flex-col text-white justify-center items-center h-screen text-sm text-center p-4">
      <a href="/">
        <img
          src="/images/logo-full.svg"
          alt="logo coding conf"
          className="mb-6 text-3xl font-bold"
        />
      </a>
      <h1 className="text-4xl font-bold">
        Congrats,
        <span className="bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
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
            src="/images/pattern-ticket.svg"
            alt="ticket user"
            className="w-full"
          />
          <div className="absolute mt-2 top-2/4 left-1/4 ml-10 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <img
              src="/images/logo-full.svg"
              alt="logo coding conf"
              className="text-3xl font-bold"
            />
            <p className=" ml-8 mt-2 text-slate-400">
              Jan 31, 2025 / Austin, TX
            </p>
            <div className="flex items-start my-5">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="User Avatar"
                  className="w-16 h-16 object-cover rounded-md"
                />
              ) : (
                <img
                  src="/images/image-avatar.jpg"
                  alt="Uploaded Avatar"
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}

              <div className="flex flex-col ml-2">
                <h2 className="text-xl text-left w-40 truncate">
                  {userData.fullName}
                </h2>
                <div className="flex items-center">
                  <Github className="w-5" />

                  <p className="text-base ml-1 text-slate-400   truncate">
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
