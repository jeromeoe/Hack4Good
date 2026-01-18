import { useState } from "react";
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

export default function ParticipantProfile() {
  const { profile, updateProfile } = useParticipantActivities();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile || {
    id: "",
    name: "",
    email: "",
    phone: "",
    age: 0,
    disability: "Physical Disability" as Disability,
    isCaregiver: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(profile || formData);
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-600">My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="text-gray-900">{profile.name}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="text-gray-900">{profile.age} years old</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="text-gray-900">{profile.email}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="text-gray-900">{profile.phone}</div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disability Type
                </label>
                {isEditing ? (
                  <select
                    value={formData.disability}
                    onChange={(e) => setFormData({ ...formData, disability: e.target.value as Disability })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {DISABILITIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-gray-900">{profile.disability}</div>
                )}
              </div>
            </div>
          </div>

          {/* Caregiver Information */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Caregiver Information
              </h2>
              {isEditing && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.isCaregiver}
                    onChange={(e) => setFormData({ ...formData, isCaregiver: e.target.checked })}
                    className="rounded"
                  />
                  <span>I am registering as a caregiver</span>
                </label>
              )}
            </div>

            {(isEditing && formData.isCaregiver) || (!isEditing && profile.isCaregiver) ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caregiver Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.caregiverName || ""}
                      onChange={(e) => setFormData({ ...formData, caregiverName: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="text-gray-900">{profile.caregiverName || "Not provided"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caregiver Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.caregiverEmail || ""}
                      onChange={(e) => setFormData({ ...formData, caregiverEmail: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="text-gray-900">{profile.caregiverEmail || "Not provided"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caregiver Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.caregiverPhone || ""}
                      onChange={(e) => setFormData({ ...formData, caregiverPhone: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="text-gray-900">{profile.caregiverPhone || "Not provided"}</div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                {isEditing ? "Check the box above to add caregiver information" : "No caregiver information provided"}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 justify-end border-t pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
