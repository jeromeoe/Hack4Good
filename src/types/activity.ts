export type Activity = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  volunteerSlotsTotal: number;
  volunteerSlotsFilled: number;
  //Staff / Participant Info 
  participantCapacity: number;
  participantRegistered: number;
  waitlistCount: number;
  tags: string[];
};
