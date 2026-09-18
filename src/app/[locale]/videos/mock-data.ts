export type MockVideoItem = {
  id: string;
  year: number;
  category: string; // English category used for filtering
  youtubeId: string;
  titleEn: string;
  titleTa: string;
  descEn: string;
  descTa: string;
  thumbnailUrl: string;
};

// Available categories (excluding "All")
export const VIDEO_CATEGORIES = [
  "Festival",
  "Pooja",
  "First Day",
  "Last Day",
  "Games",
  "Vinayagar"
];

// Helper to reliably get a good YouTube thumbnail
const getYoutubeThumbnail = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

export const MOCK_VIDEO_DATA: MockVideoItem[] = [
  // 2025 Data
  {
    id: "v25-1",
    year: 2025,
    category: "Festival",
    youtubeId: "LXb3EKWsInQ", // Placeholder Costa Rica 4k
    titleEn: "2025 Grand Vinayagar Festival Highlights",
    titleTa: "2025 பிரமாண்ட விநாயகர் திருவிழா சிறப்பம்சங்கள்",
    descEn: "A cinematic recap of the entire 2025 festival celebrations.",
    descTa: "2025 ஆம் ஆண்டு முழு திருவிழா கொண்டாட்டங்களின் திரட்டு.",
    thumbnailUrl: getYoutubeThumbnail("LXb3EKWsInQ"),
  },
  {
    id: "v25-2",
    year: 2025,
    category: "Pooja",
    youtubeId: "aqz-KE-bpKQ", // Placeholder Big buck bunny
    titleEn: "Maha Ganapathi Homam",
    titleTa: "மகா கணபதி ஹோமம்",
    descEn: "The sacred fire ritual performed for universal peace and prosperity.",
    descTa: "உலக அமைதிக்காக செய்யப்பட்ட புனித அக்னி சடங்கு.",
    thumbnailUrl: getYoutubeThumbnail("aqz-KE-bpKQ"),
  },
  {
    id: "v25-3",
    year: 2025,
    category: "Games",
    titleEn: "Youth Sports Event",
    titleTa: "இளைஞர் விளையாட்டு விழா",
    youtubeId: "tO01J-M3g0U", // Placeholder Nature 4k
    descEn: "Traditional and modern games organized for the temple youth.",
    descTa: "கோவில் இளைஞர்களுக்காக நடத்தப்பட்ட பாரம்பரிய விளையாட்டுகள்.",
    thumbnailUrl: getYoutubeThumbnail("tO01J-M3g0U"),
  },
  {
    id: "v25-4",
    year: 2025,
    category: "Last Day",
    titleEn: "Visarjan Procession Live",
    titleTa: "விசர்ஜன ஊர்வலம் நேரலை",
    youtubeId: "jNQXAC9IVRw", // Placeholder Me at the zoo
    descEn: "The grand final day procession and immersion ceremony.",
    descTa: "இறுதி நாள் பிரமாண்ட ஊர்வலம் மற்றும் கரைப்பு விழா.",
    thumbnailUrl: getYoutubeThumbnail("jNQXAC9IVRw"),
  },

  // 2024 Data
  {
    id: "v24-1",
    year: 2024,
    category: "Vinayagar",
    titleEn: "Statue Unveiling Ceremony",
    titleTa: "சிலை திறப்பு விழா",
    youtubeId: "LXb3EKWsInQ",
    descEn: "The beautiful moment when the 2024 statue was revealed.",
    descTa: "2024 ஆம் ஆண்டு சிலை திறக்கப்பட்ட அழகிய தருணம்.",
    thumbnailUrl: getYoutubeThumbnail("LXb3EKWsInQ"),
  },
  {
    id: "v24-2",
    year: 2024,
    category: "First Day",
    titleEn: "First Day Abhishekam",
    titleTa: "முதல் நாள் அபிஷேகம்",
    youtubeId: "tO01J-M3g0U",
    descEn: "The grand abhishekam performed on the opening day.",
    descTa: "தொடக்க நாளில் செய்யப்பட்ட பிரமாண்ட அபிஷேகம்.",
    thumbnailUrl: getYoutubeThumbnail("tO01J-M3g0U"),
  },
  {
    id: "v24-3",
    year: 2024,
    category: "Festival",
    titleEn: "Cultural Dance Performances",
    titleTa: "கலாச்சார நடன நிகழ்ச்சிகள்",
    youtubeId: "aqz-KE-bpKQ",
    descEn: "Beautiful traditional dances performed by devotees.",
    descTa: "பக்தர்களால் நிகழ்த்தப்பட்ட அழகிய பாரம்பரிய நடனங்கள்.",
    thumbnailUrl: getYoutubeThumbnail("aqz-KE-bpKQ"),
  },

  // 2023 Data
  {
    id: "v23-1",
    year: 2023,
    category: "Last Day",
    titleEn: "2023 Farewell Aarti",
    titleTa: "2023 விடைபெறும் ஆராதனை",
    youtubeId: "jNQXAC9IVRw",
    descEn: "The emotional final aarti before the 2023 visarjan.",
    descTa: "2023 விசர்ஜனத்திற்கு முன் நடந்த உணர்ச்சிகரமான இறுதி ஆராதனை.",
    thumbnailUrl: getYoutubeThumbnail("jNQXAC9IVRw"),
  },
  {
    id: "v23-2",
    year: 2023,
    category: "Pooja",
    titleEn: "Annadhanam Highlights",
    titleTa: "அன்னதானம் சிறப்பம்சங்கள்",
    youtubeId: "tO01J-M3g0U",
    descEn: "Feeding thousands of devotees at the temple.",
    descTa: "கோவிலில் பல்லாயிரக்கணக்கான பக்தர்களுக்கு அன்னதானம்.",
    thumbnailUrl: getYoutubeThumbnail("tO01J-M3g0U"),
  }
];
