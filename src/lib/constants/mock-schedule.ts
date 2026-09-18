import { addDays } from "date-fns";

export interface MockPooja {
  id: string;
  date: Date;
  time: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  type: string;
}

export interface MockEvent {
  id: string;
  date: Date;
  time: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  location: string;
}

// Helper to generate dates relative to today
const today = new Date();

export const mockPoojas: MockPooja[] = [
  {
    id: "p1",
    date: today,
    time: "06:00 AM",
    titleEn: "Ganapathy Abhishekam",
    titleTa: "கணபதி அபிஷேகம்",
    descriptionEn: "Early morning holy bath and special prayers for Lord Ganesha.",
    descriptionTa: "விநாயகர் பெருமானுக்கு அதிகாலை சிறப்பு அபிஷேகம்.",
    type: "Daily",
  },
  {
    id: "p2",
    date: today,
    time: "06:30 PM",
    titleEn: "Evening Deepa Aradhana",
    titleTa: "மாலை தீப ஆராதனை",
    descriptionEn: "Auspicious evening lamp offering.",
    descriptionTa: "சிறப்பு மாலை தீப ஆராதனை.",
    type: "Daily",
  },
  {
    id: "p3",
    date: addDays(today, 2),
    time: "08:00 AM",
    titleEn: "Sankatahara Chaturthi Pooja",
    titleTa: "சங்கடஹர சதுர்த்தி பூஜை",
    descriptionEn: "Special prayers for obstacle removal.",
    descriptionTa: "விக்னங்களை தீர்க்கும் சிறப்பு சதுர்த்தி பூஜை.",
    type: "Special",
  },
  {
    id: "p4",
    date: addDays(today, 5),
    time: "09:00 AM",
    titleEn: "Special Navagraha Santhi",
    titleTa: "நவக்கிரக சாந்தி",
    descriptionEn: "Special homam and pooja for planetary peace.",
    descriptionTa: "நவக்கிரக தோஷ நிவர்த்தி சிறப்பு ஹோமம்.",
    type: "Homam",
  },
];

export const mockEvents: MockEvent[] = [
  {
    id: "e1",
    date: today,
    time: "10:00 AM",
    titleEn: "Children's Cultural Games",
    titleTa: "குழந்தைகளுக்கான பாரம்பரிய விளையாட்டுகள்",
    descriptionEn: "Traditional games organized for kids.",
    descriptionTa: "சிறுவர்களுக்கான பாரம்பரிய விளையாட்டுப் போட்டிகள்.",
    location: "Temple Grounds",
  },
  {
    id: "e2",
    date: addDays(today, 2),
    time: "06:00 PM",
    titleEn: "Devotional Music Concert",
    titleTa: "பக்தி இசை நிகழ்ச்சி",
    descriptionEn: "Classical and devotional singing by renowned artists.",
    descriptionTa: "பிரபல பாடகர்களின் பக்தி இசை நிகழ்ச்சி.",
    location: "Temple Stage",
  },
  {
    id: "e3",
    date: addDays(today, 2),
    time: "08:00 PM",
    titleEn: "Prize Distribution",
    titleTa: "பரிசளிப்பு விழா",
    descriptionEn: "Awards for the winners of temple events.",
    descriptionTa: "கோயில் போட்டிகளில் வெற்றி பெற்றவர்களுக்கு பரிசளிப்பு.",
    location: "Temple Grounds",
  },
  {
    id: "e4",
    date: addDays(today, 7),
    time: "07:00 PM",
    titleEn: "Community Annadhanam",
    titleTa: "மாபெரும் அன்னதானம்",
    descriptionEn: "Free meals provided for all devotees.",
    descriptionTa: "அனைத்து பக்தர்களுக்கும் சிறப்பு அன்னதானம்.",
    location: "Dining Hall",
  },
];
