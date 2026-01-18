import { useEffect, useMemo, useRef, useState } from "react";

type Gender = "Prefer not to say" | "Female" | "Male" | "Non-binary" | "Other";

type Profile = {
  fullName: string;
  gender: Gender;
  bio: string;
  experience: string;
  languages: string;
  photoDataUrl: string; // base64
};

const STORAGE_KEY = "minds_profile_v1";

const DEFAULT_PROFILE: Profile = {
  fullName: "",
  gender: "Prefer not to say",
  bio: "",
  experience: "",
  languages: "",
  photoDataUrl: "",
};

function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const p = JSON.parse(raw) as Partial<Profile>;
    return {
      fullName: p.fullName ?? "",
      gender: (p.gender as Gender) ?? "Prefer not to say",
      bio: p.bio ?? "",
      experience: p.experience ?? "",
      languages: p.languages ?? "",
      photoDataUrl: p.photoDataUrl ?? "",
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function saveProfile(p: Profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "V";
  const a = parts[0]?.[0] ?? "V";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold text-slate-900">{children}</div>;
}

function Helper({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-slate-500">{children}</div>;
}

export default function MyAccount() {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [status, setStatus] = useState<string>("");

  // Auto-save for a “Google settings” feel
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const avatarText = useMemo(() => initials(profile.fullName), [profile.fullName]);

  function pickPhoto() {
    fileRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((p) => ({ ...p, photoDataUrl: String(reader.result || "") }));
      setStatus("Photo updated ✅");
      window.setTimeout(() => setStatus(""), 1400);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  }

  function removePhoto() {
    setProfile((p) => ({ ...p, photoDataUrl: "" }));
    setStatus("Photo removed ✅");
    window.setTimeout(() => setStatus(""), 1400);
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(DEFAULT_PROFILE);
    setStatus("Profile reset ✅");
    window.setTimeout(() => setStatus(""), 1400);
  }

  return (
    <div className="min-h-[calc(100vh-7rem)]">
      {/* Top header area (Google-ish) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">My Account</h1>
            <p className="text-slate-600">
              Manage your volunteer profile and preferences.
            </p>
            {status ? <div className="text-sm font-medium text-emerald-600">{status}</div> : null}
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="w-fit rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            Reset profile
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left: Profile card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {profile.photoDataUrl ? (
              <img
                src={profile.photoDataUrl}
                alt="Profile"
                className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-lg font-bold text-white ring-1 ring-slate-200">
                {avatarText}
              </div>
            )}

            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-slate-900">
                {profile.fullName.trim() ? profile.fullName : "Volunteer"}
              </div>
              <div className="text-sm text-slate-500">Volunteer profile</div>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={pickPhoto}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 active:scale-[0.98]"
            >
              Upload photo
            </button>
            <button
              type="button"
              onClick={removePhoto}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Remove
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Tip</div>
            <div className="mt-1 text-slate-600">
              Add a short bio + experience so staff can assign roles better.
            </div>
          </div>
        </div>

        {/* Right: Settings sections */}
        <div className="space-y-6">
          {/* Personal info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">Personal info</div>
                <div className="text-sm text-slate-600">Basic details shown to staff.</div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Auto-saved
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Full name</FieldLabel>
                <input
                  value={profile.fullName}
                  onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="e.g. Alex Tan"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                />
                <Helper>This helps staff identify you.</Helper>
              </div>

              <div className="space-y-2">
                <FieldLabel>Gender</FieldLabel>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value as Gender }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                >
                  <option>Prefer not to say</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Non-binary</option>
                  <option>Other</option>
                </select>
                <Helper>Optional.</Helper>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <div className="text-lg font-semibold text-slate-900">About you</div>
              <div className="text-sm text-slate-600">
                Short notes that help staff and other volunteers understand your strengths.
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <FieldLabel>Bio</FieldLabel>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  placeholder="Introduce yourself (comfort level, interests, what you're happy to help with)"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                />
                <Helper>Example: “I’m patient, calm, and enjoy helping with group activities.”</Helper>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel>Experience</FieldLabel>
                  <textarea
                    value={profile.experience}
                    onChange={(e) => setProfile((p) => ({ ...p, experience: e.target.value }))}
                    rows={3}
                    placeholder="e.g. Worked with seniors / special needs / student volunteer etc."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel>Languages</FieldLabel>
                  <input
                    value={profile.languages}
                    onChange={(e) => setProfile((p) => ({ ...p, languages: e.target.value }))}
                    placeholder="e.g. English, Mandarin"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                  />
                  <Helper>Optional but helpful for caregiver/participant communication.</Helper>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold text-slate-900">Preview</div>
            <div className="mt-4 flex items-start gap-4">
              {profile.photoDataUrl ? (
                <img
                  src={profile.photoDataUrl}
                  alt="Preview"
                  className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                  {avatarText}
                </div>
              )}

              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-slate-900">
                  {profile.fullName.trim() ? profile.fullName : "Volunteer"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {profile.bio.trim() ? profile.bio : "Add a bio to introduce yourself."}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Gender: {profile.gender}
                  </span>
                  {profile.languages.trim() ? (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Languages: {profile.languages}
                    </span>
                  ) : null}
                  {profile.experience.trim() ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Experience added
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            *This is frontend-only demo storage (saved in your browser).
          </div>
        </div>
      </div>
    </div>
  );
}
