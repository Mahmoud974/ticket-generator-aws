import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserData {
  fullName: string;
  email: string;
  github: string;
  avatarUrl: any;
  reqId?: string;
}

const UserContext = createContext<{
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}>({
  userData: {
    fullName: "",
    email: "",
    github: "",
    avatarUrl: "",
    reqId: "",
  },
  setUserData: () => {},
});

// Créer le fournisseur du contexte
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData>({
    fullName: "",
    email: "",
    github: "",
    avatarUrl: "",
    reqId: "",
  });

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
