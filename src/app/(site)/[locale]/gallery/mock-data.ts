export type MockGalleryItem = {
  id: string;
  year: number;
  category: string; // English category used for filtering
  titleEn: string;
  titleTa: string;
  descEn: string;
  descTa: string;
  imageUrl: string;
};

// Available categories (excluding "All", which is handled by UI)
export const GALLERY_CATEGORIES = [
  "Vinayagar Statue",
  "First Day",
  "Games",
  "Last Day"
];

// Reusable placeholder images that fit the theme roughly
const imgStatue = "https://images.unsplash.com/photo-1566453965561-3a05be80e0c9?auto=format&fit=crop&q=80&w=1200";
const imgFirstDay = "https://images.unsplash.com/photo-1600004944439-d35272a27ffb?auto=format&fit=crop&q=80&w=1200";
const imgGames = "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&q=80&w=1200";
const imgLastDay = "https://images.unsplash.com/photo-1533604100650-89196b0c2e9b?auto=format&fit=crop&q=80&w=1200";

export const MOCK_GALLERY_DATA: MockGalleryItem[] = [
  // 2025 Data
  {
    id: "g25-1",
    year: 2025,
    category: "Vinayagar Statue",
    titleEn: "Main Vinayagar Decoration",
    titleTa: "விநாயகர் சிலை அலங்காரம்",
    descEn: "The exquisitely decorated main idol at the temple.",
    descTa: "கோவிலில் அழகாக அலங்கரிக்கப்பட்ட முக்கிய சிலை.",
    imageUrl: imgStatue,
  },
  {
    id: "g25-2",
    year: 2025,
    category: "First Day",
    titleEn: "First Day Pooja",
    titleTa: "முதல் நாள் பூஜை",
    descEn: "Opening ceremonies and special pooja on day one.",
    descTa: "முதல் நாள் சிறப்பு பூஜைகள் மற்றும் தொடக்க விழா.",
    imageUrl: imgFirstDay,
  },
  {
    id: "g25-3",
    year: 2025,
    category: "Games",
    titleEn: "Children Games",
    titleTa: "சிறுவர் விளையாட்டுகள்",
    descEn: "Joyful traditional games organized for children.",
    descTa: "குழந்தைகளுக்காக நடத்தப்பட்ட பாரம்பரிய விளையாட்டுகள்.",
    imageUrl: imgGames,
  },
  {
    id: "g25-4",
    year: 2025,
    category: "Last Day",
    titleEn: "Last Day Celebration",
    titleTa: "கடைசி நாள் விழா",
    descEn: "Grand procession and celebration on the final day.",
    descTa: "இறுதி நாள் பிரமாண்ட ஊர்வலம் மற்றும் கொண்டாட்டம்.",
    imageUrl: imgLastDay,
  },
  {
    id: "g25-5",
    year: 2025,
    category: "Games",
    titleEn: "Adults Tug of War",
    titleTa: "கயிறு இழுக்கும் போட்டி",
    descEn: "Exciting tug of war event for the adults in the community.",
    descTa: "பெரியவர்களுக்கான விறுவிறுப்பான கயிறு இழுக்கும் போட்டி.",
    imageUrl: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "g25-6",
    year: 2025,
    category: "Vinayagar Statue",
    titleEn: "Evening Aarti",
    titleTa: "மாலை ஆராதனை",
    descEn: "Divine evening aarti at the main mandapam.",
    descTa: "பிரதான மண்டபத்தில் தெய்வீக மாலை ஆராதனை.",
    imageUrl: "https://images.unsplash.com/photo-1600004944439-d35272a27ffb?auto=format&fit=crop&q=80&w=1200",
  },
  
  // 2024 Data
  {
    id: "g24-1",
    year: 2024,
    category: "Vinayagar Statue",
    titleEn: "2024 Statue Setup",
    titleTa: "2024 சிலை அமைப்பு",
    descEn: "Setting up the main statue for the 2024 festival.",
    descTa: "2024 ஆம் ஆண்டு விழாவிற்கான முக்கிய சிலை அமைப்பு.",
    imageUrl: imgStatue,
  },
  {
    id: "g24-2",
    year: 2024,
    category: "First Day",
    titleEn: "Morning Homa",
    titleTa: "காலை ஹோமம்",
    descEn: "Sacred fire rituals conducted early in the morning.",
    descTa: "அதிகாலையில் நடத்தப்பட்ட புனித ஹோமம்.",
    imageUrl: imgFirstDay,
  },
  {
    id: "g24-3",
    year: 2024,
    category: "Last Day",
    titleEn: "Visarjan Procession",
    titleTa: "விசர்ஜன ஊர்வலம்",
    descEn: "The final procession towards the water body.",
    descTa: "நீர்நிலையை நோக்கிய இறுதி ஊர்வலம்.",
    imageUrl: imgLastDay,
  },
  {
    id: "g24-4",
    year: 2024,
    category: "Games",
    titleEn: "Musical Chairs",
    titleTa: "சங்கீத நாற்காலி",
    descEn: "Fun-filled musical chairs event for kids.",
    descTa: "குழந்தைகளுக்கான மகிழ்ச்சியான சங்கீத நாற்காலி போட்டி.",
    imageUrl: imgGames,
  },

  // 2023 Data
  {
    id: "g23-1",
    year: 2023,
    category: "Vinayagar Statue",
    titleEn: "Floral Decoration",
    titleTa: "மலர் அலங்காரம்",
    descEn: "The deity adorned with beautiful local flowers.",
    descTa: "உள்ளூர் மலர்களால் அழகாக அலங்கரிக்கப்பட்ட தெய்வம்.",
    imageUrl: imgStatue,
  },
  {
    id: "g23-2",
    year: 2023,
    category: "Games",
    titleEn: "Uriyadi Event",
    titleTa: "உறியடி திருவிழா",
    descEn: "Traditional Uriyadi event celebrated by the youth.",
    descTa: "இளைஞர்களால் கொண்டாடப்பட்ட பாரம்பரிய உறியடி திருவிழா.",
    imageUrl: "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "g23-3",
    year: 2023,
    category: "Last Day",
    titleEn: "Community Feast",
    titleTa: "சமூக விருந்து (அன்னதானம்)",
    descEn: "Grand Annadhanam serving thousands of devotees.",
    descTa: "ஆயிரக்கணக்கான பக்தர்களுக்கு வழங்கப்பட்ட மாபெரும் அன்னதானம்.",
    imageUrl: imgLastDay,
  }
];
