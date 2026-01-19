import { useMemo, useRef, useState } from "react";
import { useParticipantActivities } from "../lib/ParticipantActivitiesContext";

type Title =
  | "Mr"
  | "Ms"
  | "Mrs"
  | "Mx"
  | "Dr"
  | "Prof"
  | "Mdm"
  | "Other";

type Gender =
  | "Male"
  | "Female"
  | "Non-binary"
  | "Prefer not to say"
  | "Other";

const TITLES: Title[] = ["Mr", "Ms", "Mrs", "Mx", "Dr", "Prof", "Mdm", "Other"];
const GENDERS: Gender[] = [
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to say",
  "Other",
];

const VOL_KEY = "minds_volunteer_profile_v1";

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

type VolunteerProfileData = {
  id: string;
  name: string;

  title: Title;
  otherTitle?: string;

  gender: Gender;
  otherGender?: string;

  photoDataUrl: string;
  bio: string;

  hasWorkedWithPwD: boolean; // Persons with Disabilities
  pwdExperienceDetails?: string;
};

export default function VolunteerProfile() {
  const { volunteerProfile, updateVolunteerProfile } =
    useParticipantActivities() as any;

  const fileRef = useRef<HTMLInputElement | null>(null);

  const DEFAULT_VOLUNTEER: VolunteerProfileData = {
    id: crypto.randomUUID?.() ?? String(Date.now()),
    name: "",
    title: "Mr",
    otherTitle: "",
    gender: "Prefer not to say",
    otherGender: "",
    photoDataUrl: "",
    bio: "",
    hasWorkedWithPwD: false,
    pwdExperienceDetails: "",
  };

  // ✅ Load from:
  // 1) context (if available)
  // 2) localStorage (persist across pages)
  // 3) default
  const [formData, setFormData] = useState<VolunteerProfileData>(() => {
    if (volunteerProfile) return volunteerProfile;
    try {
      const raw = localStorage.getItem(VOL_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_VOLUNTEER;
  });

  const [status, setStatus] = useState<string>("");

  const avatarText = useMemo(() => initials(formData.name), [formData.name]);

  function saveProfile() {
    try {
      // Persist for real
      localStorage.setItem(VOL_KEY, JSON.stringify(formData));
      // Keep context in sync (if other pages use it)
      updateVolunteerProfile?.(formData);

      setStatus("Profile saved ✅");
    } catch {
      setStatus("Save failed ❌");
    }
    window.setTimeout(() => setStatus(""), 2000);
  }

  function pickPhoto() {
    fileRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    // Prevent localStorage quota issues
    if (file.size > 2 * 1024 * 1024) {
      setStatus("Image too large (max 2MB) ❗");
      window.setTimeout(() => setStatus(""), 2200);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((p) => ({ ...p, photoDataUrl: String(reader.result || "") }));
      setStatus("Photo updated ✅");
      window.setTimeout(() => setStatus(""), 1400);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  }

  function removePhoto() {
    setFormData((p) => ({ ...p, photoDataUrl: "" }));
    setStatus("Photo removed ✅");
    window.setTimeout(() => setStatus(""), 1400);
  }

  const displayTitle =
    formData.title === "Other" && formData.otherTitle?.trim()
      ? formData.otherTitle.trim()
      : formData.title;

  const displayGender =
    formData.gender === "Other" && formData.otherGender?.trim()
      ? formData.otherGender.trim()
      : formData.gender;

  return (
    <div className="min-h-[calc(100vh-7rem)]">
      {/* Top header area */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">
              Volunteer Profile
            </h1>
            <p className="text-slate-600">
              Manage your volunteer profile for MINDS Singapore.
            </p>
            {status ? (
              <div className="text-sm font-medium text-emerald-600">
                {status}
              </div>
            ) : null}
          </div>

          {/* ✅ New: Save button */}
          <button
            type="button"
            onClick={saveProfile}
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-[0.98]"
          >
            Save profile
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left: Profile card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {formData.photoDataUrl ? (
              <img
                src={formData.photoDataUrl}
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
                {formData.name.trim()
                  ? `${displayTitle} ${formData.name}`.trim()
                  : "Volunteer"}
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
            <div className="font-semibold text-slate-900">Why we ask</div>
            <div className="mt-1 text-slate-600">
              This helps MINDS match volunteers to suitable roles and support
              needs.
            </div>
          </div>
        </div>

        {/* Right: Settings sections */}
        <div className="space-y-6">
          {/* Volunteer Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  Volunteer Information
                </div>
                <div className="text-sm text-slate-600">
                  Basic details for volunteering and communication.
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Manual save
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Preferred title</FieldLabel>
                <select
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      title: e.target.value as Title,
                      otherTitle:
                        e.target.value === "Other" ? p.otherTitle : "",
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                >
                  {TITLES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <Helper>How you’d like to be addressed.</Helper>
              </div>

              {formData.title === "Other" ? (
                <div className="space-y-2">
                  <FieldLabel>Other title</FieldLabel>
                  <input
                    type="text"
                    value={formData.otherTitle || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, otherTitle: e.target.value }))
                    }
                    placeholder="e.g. Sir, Mx., etc"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                  />
                  <Helper>Optional.</Helper>
                </div>
              ) : null}

              <div className="space-y-2 md:col-span-2">
                <FieldLabel>Full name</FieldLabel>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Tan Ah Kow"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                />
                <Helper>Your name as you’d like it to appear.</Helper>
              </div>

              <div className="space-y-2">
                <FieldLabel>Gender</FieldLabel>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      gender: e.target.value as Gender,
                      otherGender:
                        e.target.value === "Other" ? p.otherGender : "",
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <Helper>Optional—used for respectful addressing and reporting.</Helper>
              </div>

              {formData.gender === "Other" ? (
                <div className="space-y-2">
                  <FieldLabel>Other gender</FieldLabel>
                  <input
                    type="text"
                    value={formData.otherGender || ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        otherGender: e.target.value,
                      }))
                    }
                    placeholder="Type your gender"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                  />
                  <Helper>Optional.</Helper>
                </div>
              ) : null}

              <div className="space-y-2 md:col-span-2">
                <FieldLabel>Bio</FieldLabel>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, bio: e.target.value }))
                  }
                  placeholder="Share a short introduction, interests, and why you want to volunteer with MINDS..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                />
                <Helper>Keep it short and friendly (e.g., 2–6 sentences).</Helper>
              </div>
            </div>
          </div>

          {/* Experience with persons with disabilities */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  Relevant Experience
                </div>
                <div className="text-sm text-slate-600">
                  Helps us match you to suitable roles and provide support.
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasWorkedWithPwD}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      hasWorkedWithPwD: e.target.checked,
                      pwdExperienceDetails: e.target.checked
                        ? p.pwdExperienceDetails
                        : "",
                    }))
                  }
                  className="rounded"
                />
                <span className="text-sm font-semibold text-slate-700">
                  I’ve worked with persons with disabilities before
                </span>
              </label>
            </div>

            {formData.hasWorkedWithPwD ? (
              <div className="mt-5 space-y-2">
                <FieldLabel>Tell us about it (optional)</FieldLabel>
                <textarea
                  value={formData.pwdExperienceDetails || ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      pwdExperienceDetails: e.target.value,
                    }))
                  }
                  placeholder="Example: volunteering, caregiving, teaching, inclusive sports, special education, etc."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                />
                <Helper>1–3 lines is enough.</Helper>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                No worries—training and guidance can be provided.
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold text-slate-900">Preview</div>

            <div className="mt-4 flex items-start gap-4">
              {formData.photoDataUrl ? (
                <img
                  src={formData.photoDataUrl}
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
                  {formData.name.trim()
                    ? `${displayTitle} ${formData.name}`.trim()
                    : "Volunteer"}
                </div>

                <div className="mt-1 text-sm text-slate-600">
                  Gender: {displayGender}
                </div>

                {formData.bio.trim() ? (
                  <div className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">
                    {formData.bio.trim()}
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-slate-500">
                    No bio added yet.
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {formData.hasWorkedWithPwD
                      ? "PwD experience: Yes"
                      : "PwD experience: No"}
                  </span>
                  {formData.photoDataUrl ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Photo added
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            *Changes are saved only when you click “Save profile”.
          </div>
        </div>
      </div>
    </div>
  );
}
