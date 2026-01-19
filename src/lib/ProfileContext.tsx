import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Role = "volunteer" | "participant" | "staff";

export type Profile = {
  name: string;
  gender: string;
  area: "all" | "Central" | "East" | "West";
  bio: string;
  experience: string;
};

const DEFAULT_PROFILE: Profile = {
  name: "",
  gender: "",
  area: "all",
  bio: "",
  experience: "",
};

type ProfileCtx = {
  profile: Profile;
  setProfile: (patch: Partial<Profile>) => void;
  saveProfile: () => void;

  // auth
  isLoggedIn: boolean;
  role: Role | null;
  email: string;
  login: (role: Role, email?: string) => void;
  logout: () => void;
};

const Ctx = createContext<ProfileCtx | null>(null);

const LS_PROFILE_KEY = "minds_profile_v1";
const LS_LOGIN_KEY = "minds_logged_in";
const LS_EMAIL_KEY = "minds_user_email";
const LS_ROLE_KEY = "minds_user_role";

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<Profile>(DEFAULT_PROFILE);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");

  // load once
  useEffect(() => {
    // profile
    try {
      const raw = localStorage.getItem(LS_PROFILE_KEY);
      if (raw) setProfileState({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
    } catch {
      setProfileState(DEFAULT_PROFILE);
    }

    // auth
    const logged = localStorage.getItem(LS_LOGIN_KEY) === "true";
    const savedRole = localStorage.getItem(LS_ROLE_KEY) as Role | null;
    const savedEmail = localStorage.getItem(LS_EMAIL_KEY) || "";

    setIsLoggedIn(logged);
    setRole(savedRole && ["volunteer", "participant", "staff"].includes(savedRole) ? savedRole : null);
    setEmail(savedEmail);
  }, []);

  function setProfile(patch: Partial<Profile>) {
    setProfileState((prev) => ({ ...prev, ...patch }));
  }

  function saveProfile() {
    localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem("minds_profile_name", profile.name || "");
  }

  function login(nextRole: Role, nextEmail?: string) {
    localStorage.setItem(LS_LOGIN_KEY, "true");
    localStorage.setItem(LS_ROLE_KEY, nextRole);

    setIsLoggedIn(true);
    setRole(nextRole);

    if (nextEmail) {
      localStorage.setItem(LS_EMAIL_KEY, nextEmail);
      setEmail(nextEmail);
    }
  }

  function logout() {
    localStorage.setItem(LS_LOGIN_KEY, "false");
    localStorage.removeItem(LS_EMAIL_KEY);
    localStorage.removeItem(LS_ROLE_KEY);

    setIsLoggedIn(false);
    setRole(null);
    setEmail("");
  }

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      saveProfile,
      isLoggedIn,
      role,
      email,
      login,
      logout,
    }),
    [profile, isLoggedIn, role, email]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProfile() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
