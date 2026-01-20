import { supabase } from "./supabase";

// ✅ avoid typed "never" issues without editing Database types
const sb: any = supabase;

const TABLE = "volunteer_profiles";

// DB row shape (snake_case)
type VolunteerProfileRow = {
  id: string;
  full_name: string | null;
  gender: string | null;
  bio: string | null;
  experience: string | null;
  languages: string | null;
};

export type Gender =
  | "Prefer not to say"
  | "Female"
  | "Male"
  | "Non-binary"
  | "Other";

export type VolunteerProfile = {
  id: string;
  fullName: string;
  gender: Gender;
  bio: string;
  experience: string;
  languages: string;
};

function toProfile(row: VolunteerProfileRow): VolunteerProfile {
  return {
    id: row.id,
    fullName: row.full_name ?? "",
    gender: (row.gender ?? "Prefer not to say") as Gender,
    bio: row.bio ?? "",
    experience: row.experience ?? "",
    languages: row.languages ?? "",
  };
}

function toRowPatch(patch: Partial<Omit<VolunteerProfile, "id">>) {
  const out: Record<string, unknown> = {};
  if (patch.fullName !== undefined) out.full_name = patch.fullName;
  if (patch.gender !== undefined) out.gender = patch.gender;
  if (patch.bio !== undefined) out.bio = patch.bio;
  if (patch.experience !== undefined) out.experience = patch.experience;
  if (patch.languages !== undefined) out.languages = patch.languages;
  return out;
}

export async function fetchVolunteerProfile(): Promise<VolunteerProfile | null> {
  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData?.user) return null;

  const userId = userData.user.id as string;

  const { data, error } = await sb
    .from(TABLE)
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[VolunteerHooks] fetch error:", error);
    return null;
  }

  // If no row, create one so updates work
  if (!data) {
    const defaultRow: VolunteerProfileRow = {
      id: userId,
      full_name: "",
      gender: "Prefer not to say",
      bio: "",
      experience: "",
      languages: "",
    };

    const { error: insErr } = await sb.from(TABLE).insert(defaultRow);
    if (insErr) console.error("[VolunteerHooks] insert default error:", insErr);

    return {
      id: userId,
      fullName: "",
      gender: "Prefer not to say",
      bio: "",
      experience: "",
      languages: "",
    };
  }

  return toProfile(data as VolunteerProfileRow);
}

export async function updateVolunteerProfile(
  patch: Partial<Omit<VolunteerProfile, "id">>
): Promise<boolean> {
  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData?.user) return false;

  const userId = userData.user.id as string;
  const rowPatch = toRowPatch(patch);

  // Nothing to update
  if (Object.keys(rowPatch).length === 0) return true;

  const { error } = await sb.from(TABLE).update(rowPatch).eq("id", userId);
  if (!error) return true;

  console.error("[VolunteerHooks] update error (fallback upsert):", error);

  const { error: upErr } = await sb
    .from(TABLE)
    .upsert({ id: userId, ...rowPatch }, { onConflict: "id" });

  if (upErr) {
    console.error("[VolunteerHooks] upsert error:", upErr);
    return false;
  }

  return true;
}
