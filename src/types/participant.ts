export type Disability = 
  | "Physical Disability"
  | "Visual Impairment"
  | "Hearing Impairment"
  | "Intellectual Disability"
  | "Autism Spectrum"
  | "Multiple Disabilities"
  | "Other";

export type ParticipantProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  disability: Disability;
  isCaregiver: boolean;
  caregiverName?: string;
  caregiverEmail?: string;
  caregiverPhone?: string;
  photoDataUrl?: string;
};

export type ActivityAccessibility = {
  wheelchairAccessible: boolean;
  visuallyImpairedFriendly: boolean;
  hearingImpairedFriendly: boolean;
  intellectualDisabilityFriendly: boolean;
  autismFriendly: boolean;
};

export type ParticipantActivity = {
  id: string;
  title: string;
  startISO: string;
  endISO: string;
  location: string;
  description: string;
  meetingPoint: string;
  mealsProvided: boolean;
  accessibility: ActivityAccessibility;
  capacity: number;
  registered: number;
  isRegistered: boolean;
  waitlisted: boolean;
  suitableFor: Disability[];
};
