import { useEffect, useMemo, useRef, useState } from "react";
import { useVolunteerProfile } from "../lib/VolunteerProfileContext";
import type { Gender } from "../lib/VolunteerHooks";

type Profile = {
  fullName: string;
  gender: Gender;
  bio: string;
  experience: string;
  languages: string;
};

const DEFAULT_PROFILE: Profile = {
  fullName: "",
  gender: "Prefer not to say",
  bio: "",
  experience: "",
  languages: "",
};

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

function sameProfile(a: Profile, b: Profile) {
  return (
    a.fullName === b.fullName &&
    a.gender === b.gender &&
    a.bio === b.bio &&
    a.experience === b.experience &&
    a.languages === b.languages
  );
}

export default function VolunteerProfile() {
  const { profile: dbProfile, updateProfile, isLoading, refreshProfile } =
    useVolunteerProfile();

  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [status, setStatus] = useState<string>("");

  // Prevent saving during initial sync
  const isInitialLoadRef = useRef(true);
  // Track last saved values
  const lastSavedRef = useRef<Profile | null>(null);

  // Optional: ensure profile is fetched on first mount (doesn't change features)
  useEffect(() => {
    refreshProfile?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync DB profile -> local form state (like participant)
  useEffect(() => {
    if (!dbProfile) return;

    const next: Profile = {
      fullName: dbProfile.fullName,
      gender: dbProfile.gender,
      bio: dbProfile.bio,
      experience: dbProfile.experience,
      languages: dbProfile.languages,
    };

    setProfile(next);
    lastSavedRef.current = next;

    // enable autosave after state settles
    const t = window.setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 50);

    return () => window.clearTimeout(t);
  }, [dbProfile?.id]);

  // Debounced autosave -> context -> Supabase
  useEffect(() => {
    if (!dbProfile) return;
    if (isInitialLoadRef.current) return;

    const last = lastSavedRef.current;
    if (last && sameProfile(profile, last)) return;

    const t = window.setTimeout(async () => {
      const ok = await updateProfile({
        fullName: profile.fullName,
        gender: profile.gender,
        bio: profile.bio,
        experience: profile.experience,
        languages: profile.languages,
      });

      if (ok) {
        lastSavedRef.current = { ...profile };
        setStatus("Changes saved ✅");
      } else {
        setStatus("Failed to save ❌");
      }

      window.setTimeout(() => setStatus(""), 2000);
    }, 800);

    return () => window.clearTimeout(t);
  }, [profile, dbProfile?.id, updateProfile]);

  const avatarText = useMemo(
    () => initials(profile.fullName),
    [profile.fullName]
  );

  async function resetAll() {
    setProfile(DEFAULT_PROFILE);
    setStatus("Resetting...");

    const ok = await updateProfile({ ...DEFAULT_PROFILE });

    if (ok) {
      lastSavedRef.current = { ...DEFAULT_PROFILE };
      setStatus("Profile reset ✅");
    } else {
      setStatus("Failed to reset ❌");
    }

    window.setTimeout(() => setStatus(""), 2000);
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Loading profile...</p>
      </div>
    );
  }

  // If user not logged in (dbProfile null)
  if (!dbProfile) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Not logged in / profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-7rem)]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-600">
              Manage your volunteer profile and preferences.
            </p>
            {status ? (
              <div className="text-sm font-medium text-emerald-600">
                {status}
              </div>
            ) : null}
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-lg font-bold text-white ring-1 ring-slate-200">
              {avatarText}
            </div>

            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-slate-900">
                {profile.fullName.trim() ? profile.fullName : "Volunteer"}
              </div>
              <div className="text-sm text-slate-500">Volunteer profile</div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Tip</div>
            <div className="mt-1 text-slate-600">
              Add a short bio + experience so staff can assign roles better.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  Personal info
                </div>
                <div className="text-sm text-slate-600">
                  Basic details shown to staff.
                </div>
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
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, fullName: e.target.value }))
                  }
                  placeholder="e.g. Alex Tan"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                />
                <Helper>This helps staff identify you.</Helper>
              </div>

              <div className="space-y-2">
                <FieldLabel>Gender</FieldLabel>
                <select
                  value={profile.gender}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      gender: e.target.value as Gender,
                    }))
                  }
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

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <div className="text-lg font-semibold text-slate-900">
                About you
              </div>
              <div className="text-sm text-slate-600">
                Short notes that help staff and other volunteers understand your
                strengths.
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <FieldLabel>Bio</FieldLabel>
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, bio: e.target.value }))
                  }
                  rows={4}
                  placeholder="Introduce yourself (comfort level, interests, what you're happy to help with)"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                />
                <Helper>
                  Example: “I’m patient, calm, and enjoy helping with group
                  activities.”
                </Helper>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel>Experience</FieldLabel>
                  <textarea
                    value={profile.experience}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        experience: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="e.g. Worked with seniors / special needs / student volunteer etc."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel>Languages</FieldLabel>
                  <input
                    value={profile.languages}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        languages: e.target.value,
                      }))
                    }
                    placeholder="e.g. English, Mandarin"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                  />
                  <Helper>
                    Optional but helpful for caregiver/participant communication.
                  </Helper>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold text-slate-900">Preview</div>
            <div className="mt-4 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                {avatarText}
              </div>

              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-slate-900">
                  {profile.fullName.trim() ? profile.fullName : "Volunteer"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {profile.bio.trim()
                    ? profile.bio
                    : "Add a bio to introduce yourself."}
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
            *This profile is saved to your account.
          </div>
        </div>
      </div>
    </div>
  );
}
