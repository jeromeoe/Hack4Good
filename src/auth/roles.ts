export type Role = "participant" | "volunteer" | "staff";

export function setMockRole(role: Role) {
  localStorage.setItem("mock_role", role);
  localStorage.setItem("mock_authed", "true");
}

export function getMockRole(): Role | null {
  const r = localStorage.getItem("mock_role");
  if (r === "participant" || r === "volunteer" || r === "staff") return r;
  return null;
}

export function clearMockAuth() {
  localStorage.removeItem("mock_authed");
  localStorage.removeItem("mock_role");
}

export function isMockAuthed() {
  return localStorage.getItem("mock_authed") === "true";
}
