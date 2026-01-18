import { useEffect, useMemo, useRef, useState } from "react";
import { useParticipantActivities } from "../lib/ParticipantActivitiesContext";
import type { Disability } from "../types/participant";

const DISABILITIES: Disability[] = [
  "Physical Disability",
  "Visual Impairment",
  "Hearing Impairment",
  "Intellectual Disability",
  "Autism Spectrum",
  "Multiple Disabilities",
  "Other",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  const a = parts[0]?.[0] ?? "P";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold text-slate-900">{children}</div>;
}

function Helper({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-slate-500">{children}</div>;
}

export default function ParticipantProfile() {
  const { profile, updateProfile } = useParticipantActivities();
  const fileRef = useRef<HTMLInputElement | null>(null);
  
  const [formData, setFormData] = useState(profile || {
    id: "",
    name: "",
    email: "",
    phone: "",
    age: 0,
    disability: "Physical Disability" as Disability,
    isCaregiver: false,
    photoDataUrl: "",
  });

  const [status, setStatus] = useState<string>("");

  // Auto-save effect
  useEffect(() => {
    if (profile) {
      updateProfile(formData);
    }
  }, [formData]);

  const avatarText = useMemo(() => initials(formData.name), [formData.name]);

  function pickPhoto() {
    fileRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

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

  if (!profile) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-7rem)]">
      {/* Top header area */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-600">
              Manage your participant profile and information.
            </p>
            {status ? <div className="text-sm font-medium text-emerald-600">{status}</div> : null}
          </div>
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
                {formData.name.trim() ? formData.name : "Participant"}
              </div>
              <div className="text-sm text-slate-500">Participant profile</div>
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
            <div className="font-semibold text-slate-900">Info</div>
            <div className="mt-1 text-slate-600">
              Your profile helps staff understand your needs and preferences.
            </div>
          </div>
        </div>

        {/* Right: Settings sections */}
        <div className="space-y-6">
          {/* Participant Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">Participant Information</div>
                <div className="text-sm text-slate-600">Basic details for activity registration.</div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Auto-saved
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Full name</FieldLabel>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                />
                <Helper>Your full name as you'd like it to appear.</Helper>
              </div>

              <div className="space-y-2">
                <FieldLabel>Age</FieldLabel>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.age || ""}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  placeholder="Age"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                />
                <Helper>Required for appropriate activity matching.</Helper>
              </div>

              <div className="space-y-2">
                <FieldLabel>Email</FieldLabel>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                />
                <Helper>For activity confirmations and updates.</Helper>
              </div>

              <div className="space-y-2">
                <FieldLabel>Phone Number</FieldLabel>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+65 9123 4567"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                />
                <Helper>For emergency contact during activities.</Helper>
              </div>

              <div className="space-y-2 md:col-span-2">
                <FieldLabel>Disability Type</FieldLabel>
                <select
                  value={formData.disability}
                  onChange={(e) => setFormData({ ...formData, disability: e.target.value as Disability })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                >
                  {DISABILITIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <Helper>Helps us recommend suitable activities for you.</Helper>
              </div>
            </div>
          </div>

          {/* Caregiver Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">Caregiver Information</div>
                <div className="text-sm text-slate-600">
                  Optional details for caregiver contact.
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCaregiver}
                  onChange={(e) => setFormData({ ...formData, isCaregiver: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-semibold text-slate-700">I have a caregiver</span>
              </label>
            </div>

            {formData.isCaregiver ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel>Caregiver Name</FieldLabel>
                  <input
                    type="text"
                    value={formData.caregiverName || ""}
                    onChange={(e) => setFormData({ ...formData, caregiverName: e.target.value })}
                    placeholder="Caregiver's full name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                  />
                  <Helper>Name of your primary caregiver.</Helper>
                </div>

                <div className="space-y-2">
                  <FieldLabel>Caregiver Email</FieldLabel>
                  <input
                    type="email"
                    value={formData.caregiverEmail || ""}
                    onChange={(e) => setFormData({ ...formData, caregiverEmail: e.target.value })}
                    placeholder="caregiver@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                  />
                  <Helper>For receiving activity updates.</Helper>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <FieldLabel>Caregiver Phone</FieldLabel>
                  <input
                    type="tel"
                    value={formData.caregiverPhone || ""}
                    onChange={(e) => setFormData({ ...formData, caregiverPhone: e.target.value })}
                    placeholder="+65 8123 4567"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                  />
                  <Helper>Emergency contact number for your caregiver.</Helper>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                Check the box above to add caregiver information.
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
                  {formData.name.trim() ? formData.name : "Participant"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Age: {formData.age || "Not specified"}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {formData.disability}
                  </span>
                  {formData.email.trim() && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Email added
                    </span>
                  )}
                  {formData.phone.trim() && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Phone added
                    </span>
                  )}
                  {formData.isCaregiver && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Caregiver info added
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            *All changes are automatically saved to your profile.
          </div>
        </div>
      </div>
    </div>
  );
}
