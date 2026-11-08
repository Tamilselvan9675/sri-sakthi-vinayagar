import zlib from "zlib";

export interface DonorRecord {
  id: number;
  donorNameTa: string;
  donorNameEn: string;
  detailsTa: string;
  detailsEn: string;
  amount: number | null;
}

export interface ExpenseRecord {
  id: number;
  categoryTa: string;
  categoryEn: string;
  detailsTa: string;
  detailsEn: string;
  responsibleTa: string;
  responsibleEn: string;
  amount: number | null;
}

export interface ParsedBudgetPdf {
  donors: DonorRecord[];
  expenses: ExpenseRecord[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

/* -------------------------------------------------------------------------- */
/* Tamil -> English dictionary & transliteration                              */
/* -------------------------------------------------------------------------- */

const STREET_MAP: Record<string, string> = {
  "சின்னம்மன் கோவில் தெரு": "Chinnaman Kovil Street",
  "கிழக்கு குளக்கரை தெரு": "East Kulakarai Street",
  "விநாயகர் கோவில் தெரு": "Vinayagar Kovil Street",
  "பாடசாலை தெரு": "Padasalai Street",
  "நந்தவனத்தோட்டம்": "Nandavanathottam",
  "கடம்பாடி": "Kadambadi",
  "மேலக்குப்பம்": "Melakuppam",
  "பஜனை கோவில் தெரு": "Bajanai Kovil Street",
  "அம்பேத்கர் தெரு": "Ambedkar Street",
};

const NAME_MAP: Record<string, string> = {
  "ஸ்ரீ சக்தி விநாயகர் - முந்தைய ஆண்டு சேமிப்பு": "Sri Sakthi Vinayagar - Previous Year Savings",
  "ஸ்ரீ சக்தி விநாயகர் - உண்டியல்": "Sri Sakthi Vinayagar - Hundi",
  "K.அருணாமூர்த்தி": "K.Arunamoorthy",
  "A.ஜெய்கணேஷ்": "A.Jaiganesh",
  "V.சக்திதாஸ்": "V.Sakthidas",
  "தணிகை அரசு": "Thanigai Arasu",
  "செல்வராஜ்": "Selvaraj",
  "G.கந்தவேல் (டீ கடை)": "G.Kandavel (Tea Shop)",
  "E.முத்து": "E.Muthu",
  "H.குமார்": "H.Kumar",
  "A.பூபாலன்": "A.Boopalan",
  "M.சுகுமார்": "M.Sugumar",
  "R.ராஜேஷ்": "R.Rajesh",
  "K.ரஞ்சித்": "K.Ranjith",
  "K.சுபாஷ்": "K.Subash",
  "K.மன்னார்": "K.Mannar",
  "M.விசு": "M.Visu",
  "D.ஆகாஷ்": "D.Akash",
  "K.சேஷாத்திரி": "K.Seshadri",
  "E.சண்முகம்": "E.Shanmugam",
  "N.பழனி (சிவன் கோயில் பூசாரி)": "N.Palani (Sivan Temple Priest)",
  "N.பழனி (பூசாரி)": "N.Palani (Priest)",
  "A.சிவகுமார்": "A.Sivakumar",
  "பௌனம்மாள்": "Pounammal",
  "B.வேலு": "B.Velu",
  "A. கோபு (Post Man)": "A.Gopu (Post Man)",
  "N.மன்னார்": "N.Mannar",
  "N.வேதகிரி": "N.Vedhagiri",
  "K.சுரேஷ் (குமாரசாமி)": "K.Suresh (Kumarasamy)",
  "K.சுரேஷ்": "K.Suresh",
  "J.பாலு (JBK சப்ளையர்)": "J.Balu (JBK Supplier)",
  "துரைக்கண்ணு": "Duraikannu",
  "சதா": "Sadha",
  "மணிகண்டன்": "Manikandan",
  "N.சுதாகர்": "N.Sudhakar",
  "V.பரமேஸ்வரி (V.லோகேஷ்)": "V.Parameswari (V.Lokesh)",
  "G.ரமேஷ்": "G.Ramesh",
  "G.ரஞ்சித்": "G.Ranjith",
  "S.சதிஷ்": "S.Sathish",
  "S.டில்லி": "S.Dilli",
  "J.மணி": "J.Mani",
  "H.சரவணன்": "H.Saravanan",
  "A.கோபிநாத்": "A.Gopinath",
  "G.தமிழ்ச்செல்வன்": "G.Tamilselvan",
  "G.தமிழ்": "G.Tamil",
  "P.கார்த்தி": "P.Karthi",
  "P.கார்த்திக்": "P.Karthik",
  "G.சங்கரநாராயணன்": "G.Sankaranarayanan",
  "G.சங்கர்": "G.Shankar",
  "H.தேவகுமார்": "H.Devakumar",
  "P.கலைவாணன்": "P.Kalaivanan",
  "P.கபாலி": "P.Kabali",
  "P.கபிலன்": "P.Kabilan",
  "S.பாஸ்கர்": "S.Baskar",
  "S.தீனா": "S.Deena",
  "S.தீனதயாளன்": "S.Deenadhayalan",
  "S.ரோஹன்": "S.Rohan",
  "கார்த்திகேயன்": "Karthikeyan",
  "B.ஜெகதீஸ்வரி (டீ கடை)": "B.Jegatheeswari (Tea Shop)",
  "வடிவேலு": "Vadivelu",
  "நடராஜ்": "Nataraj",
  "வெங்கடேசன்": "Venkatesan",
  "லட்சுமணன்": "Lakshmanan",
  "D.ராஜேஷ்": "D.Rajesh",
  "D.சரவணன்": "D.Saravanan",
  "D.பிரதாப்": "D.Prathap",
  "ஆறுமுகம் பிள்ளை": "Arumugam Pillai",
  "A.தாண்டவ மூர்த்தி": "A.Thandava Moorthy",
  "R.கங்காதரன்": "R.Gangadharan",
  "பச்சையப்பன்": "Pachaiyappan",
  "S.பொன்குமார்": "S.Ponkumar",
  "S.பொன்ராஜ்": "S.Ponraj",
  "ராமலிங்கம்": "Ramalingam",
  "L.பிரகாஷ்": "L.Prakash",
  "L.ரமேஷ்": "L.Ramesh",
  "கோபு": "Gopu",
  "D.ஏழுமலை": "D.Elumalai",
  "E.பாண்டியன் & P.கோமதி": "E.Pandian & P.Gomathi",
  "P.அனந்தன் & P.தினேஷ்": "P.Ananthan & P.Dinesh",
  "P.அனந்தன்": "P.Ananthan",
  "P.தினேஷ்": "P.Dinesh",
  "S.அஜித்": "S.Ajith",
  "S.அஜித் (ராமலிங்கம்)": "S.Ajith (Ramalingam)",
  "முருகன்": "Murugan",
  "பொம்மி": "Bommi",
  "மகேஷ்": "Mahesh",
  "K.S.ராஜா": "K.S.Raja",
  "கடம்பாடி பாய்ஸ்": "Kadambadi Boys",
  "மற்றும் மகளிர் குழு.": "and Women's Group.",
  "பிரவீன்": "Praveen",
  "ரீத்திஷ்": "Reethish",
  "A.லோகேஷ்": "A.Lokesh",
  "S.கணேசன்": "S.Ganesan",
  "M.தனசேகரன்": "M.Dhanasekaran",
  "K.சேகர் (நாடார்)": "K.Sekar (Nadar)",
  "K.சுரேஷ் குமார்": "K.Suresh Kumar",
  "S.மன்னார் (சுந்தர மூர்த்தி)": "S.Mannar (Sundara Moorthy)",
  "V.கந்தசாமி & K.கலா": "V.Kandasamy & K.Kala",
  "J.K தண்டபாணி": "J.K.Dhandapani",
  "S.ரஜினி": "S.Rajini",
  "பாளையம் & லல்லி": "Palaiyam & Lalli",
  "பாண்டியன் & கோமதி": "Pandian & Gomathi",
  "வேணுநாத பெருமாள் கோயில்": "Venunatha Perumal Temple",
  "தினேஷ்": "Dinesh",
  "நாராயணன்": "Narayanan",
};

const DONOR_DESC_MAP: Record<string, string> = {
  "முந்தைய ஆண்டு சேமிப்பிலிருந்து\n• விநாயகர் சிலை – (₹26500)\n• சக்தி விநாயகருக்கு கோட்டை அமைத்தல் --(₹21500)":
    "From Previous Year Savings:\n• Vinayagar Statue – (₹26500)\n• Shed/Mandapam Construction for Sakthi Vinayagar – (₹21500)",
  "ஸ்ரீ சக்தி விநாயகர் - உண்டியல்": "Sri Sakthi Vinayagar - Hundi",
  "அன்னதானம் நன்கொடை- (₹6000)": "Annadhanam Donation - (₹6000)",
  "அன்னதானம் நன்கொடை - (₹6000)": "Annadhanam Donation - (₹6000)",
  "சக்தி விநாயகருக்கு முதல் நாள் மற்றும் கடைசி நாள் மாலை வழங்கினார்":
    "Provided garlands for Sakthi Vinayagar on the first and last day",
  "சக்தி விநாயகருக்கு நோட்டீஸ் வழங்கினார்(₹1000)":
    "Contributed the notice for Sakthi Vinayagar (₹1000)",
  "அன்னதானம் செய்ய பாத்திரங்கள் அனைத்தும் வழங்கினார்":
    "Provided all utensils for Annadhanam",
  "சுண்டல் (10 Kg) / பால் கொழுக்கட்டை (200 Qty)":
    "Sundal (10 Kg) / Paal Kozhukattai (200 Qty)",
  "அரிசி (50 Kg) வழங்கினார்கள்": "Contributed Rice (50 Kg)",
  "அரிசி (25 kg)": "Rice (25 Kg)",
  "சக்தி விநாயகருக்கு முதல் நாள் மற்றும் கடைசி நாள் – தேங்காய் வழங்கினர்":
    "Provided coconuts for Sakthi Vinayagar on the first and last day",
};

const EXPENSE_CATEGORY_MAP: Record<string, string> = {
  "சக்தி விநாயகர் சிலை": "Sakthi Vinayagar Statue",
  "சக்தி விநாயகருக்கு கோட்டை அமைத்தல்": "Shed / Mandapam Construction for Sakthi Vinayagar",
  "சக்தி விநாயகருக்கு நோட்டீஸ்": "Notice for Sakthi Vinayagar",
  "சக்தி விநாயகருக்கு அன்னதானம்": "Annadhanam for Sakthi Vinayagar",
  "சக்தி விநாயகருக்கு வானவேடிக்கை": "Firecrackers for Sakthi Vinayagar",
  "தாரைதப்பட்டை": "Tharai Thappattai (Drums)",
  "விளையாட்டு பரிசு": "Games Prizes",
  "வீடுகளுக்கு பரிசு (200 தட்டு)": "Household Gifts (200 Plates)",
  "விநாயகர் காலை பூஜை (பொறி,விநாயகர் துணி,வெற்றிலை பாக்கு, பூஜை சாமான்)":
    "Vinayagar Morning Pooja (Puffed Rice, Cloth, Betel Leaves & Nuts, Pooja Items)",
  "விநாயகருக்கு முதல் & கடைசி நாள் மாலை": "First & Last Day Garlands for Vinayagar",
  "விநாயகர் பூஜை சாமான்கள்": "Vinayagar Pooja Items",
  "பொன்னி அரிசி (50 Kg)": "Ponni Rice (50 Kg)",
  "பொன்னி அரிசி (25 Kg)": "Ponni Rice (25 Kg)",
  "பச்சை அரிசி (5 Kg)": "Raw Rice (5 Kg)",
  "சுண்டல் (10 Kg) + பால் கொழுக்கட்டை (200 Qty)": "Sundal (10 Kg) + Paal Kozhukattai (200 Qty)",
  "வாழை மரம்": "Banana Trees",
  "பெட்ரோல்": "Petrol",
  "கலர் பவுடர்": "Color Powder",
  "தலப்ப துணி": "Turban Cloth (Thalappa Thuni)",
  "விநாயகர் கடைசி நாள் சாப்பாடு": "Vinayagar Last Day Meals",
  "விநாயகர் பூஜை": "Vinayagar Pooja",
  "விளையாட்டு பொருட்கள் – பன், கோலமாவு, ஸ்பூன், பேப்பர் கிளாஸ், ஸ்ட்ரா":
    "Sports Items – Bun, Kolam Powder, Spoon, Paper Glass, Straw",
  "விநாயகர் தேர் கட்டுதல்": "Vinayagar Chariot Building",
  "நாடார் கடை செலவுகள்": "Nadar Shop Expenses",
};

const EXPENSE_DETAILS_MAP: Record<string, string> = {
  "• முந்தைய ஆண்டு சேமிப்பில் இருந்து பணம் எடுத்தால் – (₹27500)\n• G.தமிழ் – (₹3000)\n• M.விசு – (₹3000)\n• K.மன்னார் – (₹3000)\n• S.பொன்குமார் – (₹3000)\n• P.கார்த்திக் – (₹2000)\n• G.சங்கர் – (₹2000)\n------------------------------------------------\n• விநாயகர் சிலை – (₹35500)\n• விநாயகர் பூஜை – (₹100)\n• வண்டி & டீசல் – (₹3500)\n• சாப்பாடு – (₹1500)\n• விநாயகர் லோகோ டிசைன் – (₹200)\n• விநாயகர் அலங்காரம் – (₹700)\n• வெடி (ஒரு நாள்) – (₹500)\n• பெட்ரோல் & சாப்பாடு (அட்வான்ஸ்) – (₹1500)":
    "• Withdrawal from previous year savings – (₹27500)\n• G.Tamil – (₹3000)\n• M.Visu – (₹3000)\n• K.Mannar – (₹3000)\n• S.Ponkumar – (₹3000)\n• P.Karthik – (₹2000)\n• G.Shankar – (₹2000)\n------------------------------------------------\n• Vinayagar Statue – (₹35500)\n• Vinayagar Pooja – (₹100)\n• Transport & Diesel – (₹3500)\n• Meals – (₹1500)\n• Vinayagar Logo Design – (₹200)\n• Vinayagar Decoration – (₹700)\n• Firecrackers (1 day) – (₹500)\n• Petrol & Meals (Advance) – (₹1500)",
  "• முக்கிய மெட்டீரியல் – (₹36500)\n• செய்கூலி – (₹2000)\n• கூடுதல் மெட்டீரியல் – (₹6000)":
    "• Main Materials – (₹36500)\n• Labor Charges – (₹2000)\n• Additional Materials – (₹6000)",
  "சக்தி விநாயகருக்கு நோட்டீஸ் அன்பளிப்பு":
    "Notice contribution for Sakthi Vinayagar",
  "• காய்கறி – (₹2650)\n• மளிகைச் சாமான்கள் – (₹7350)\n• தண்ணீர் பாட்டில் – (₹2100)\n• அன்னதானம் பிளேட் (300 qty) – (₹2000)\n• சிலிண்டர் அன்பளிப்பு – (D.பிரதாப்)\n• அன்னதானம் செய்ய பாத்திரங்கள் அன்பளிப்பு – (J.பாலு (JBK சப்ளையர்))":
    "• Vegetables – (₹2650)\n• Groceries – (₹7350)\n• Water Bottles – (₹2100)\n• Annadhanam Plates (300 qty) – (₹2000)\n• Cylinder Contribution – (D.Prathap)\n• Utensils Contribution for Annadhanam – (J.Balu (JBK Supplier))",
  "• J.மணி – (₹2000)\n• A.கோபிநாத் – (₹2500)\n• H.தேவகுமார் – (₹2000)\n• S.பாஸ்கர் – (₹2500)\n• P.கலைவாணன் – (₹2500)\n• S.தீனதயாளன் – (₹2500)\n• P.கபிலன் – (₹2100)\n• D.ஆகாஷ் – (₹2000)\n• விநாயகர் தொகை – (₹700)":
    "• J.Mani – (₹2000)\n• A.Gopinath – (₹2500)\n• H.Devakumar – (₹2000)\n• S.Baskar – (₹2500)\n• P.Kalaivanan – (₹2500)\n• S.Deenadhayalan – (₹2500)\n• P.Kabilan – (₹2100)\n• D.Akash – (₹2000)\n• Vinayagar Amount – (₹700)",
  "• அட்வான்ஸ் – (₹1000)\n• தாரைதப்பட்டை – (₹16000)\n• தண்ணீர் – (₹2400)":
    "• Advance – (₹1000)\n• Tharai Thappattai – (₹16000)\n• Water – (₹2400)",
  "• விளையாட்டு பரிசு (5 நாள்) – (₹1500)\n• கோலப் போட்டி பரிசு – (₹2500)\n• வாழைமரம் விளையாட்டு – (₹500)":
    "• Games Prizes (5 Days) – (₹1500)\n• Kolam Competition Prize – (₹2500)\n• Banana Tree Game – (₹500)",
  "வீடுகளுக்கு பரிசு (200 தட்டு) (கடைசி நாள்) – (₹8443)":
    "Household Gifts (200 Plates) (Last Day) – (₹8443)",
  "K.ரஞ்சித் & K.சுபாஷ் அவர்கள் வழங்கினார்கள்":
    "Contributed by K.Ranjith & K.Subash",
  "விநாயகருக்கு முதல் (₹2500) & கடைசி (₹3500) நாள் மாலை":
    "First Day (₹2500) & Last Day (₹3500) Garlands for Vinayagar",
  "விநாயகர் கடைசி நாள் பூஜை சாமான்கள், பழங்கள், இனிப்புகள் – (₹1500)":
    "Vinayagar Last Day Pooja Items, Fruits, Sweets – (₹1500)",
  "P.அனந்தன் & P.தினேஷ் அவர்கள் பொன்னி அரிசி (50 Kg) வழங்கினார்கள்":
    "P.Ananthan & P.Dinesh contributed Ponni Rice (50 Kg)",
  "S.அஜித் (ராமலிங்கம்) அவர்கள் பொன்னி அரிசி (25 Kg)":
    "S.Ajith (Ramalingam) contributed Ponni Rice (25 Kg)",
  "K.சுரேஷ் (குமாரசாமி) அவர்கள் பச்சை அரிசி (5 Kg) வழங்கினார்":
    "K.Suresh (Kumarasamy) contributed Raw Rice (5 Kg)",
  "பாண்டியன் & கோமதி அவர்கள் சுண்டல் (10 Kg) + பால் கொழுக்கட்டை (200 Qty) வழங்கினார்கள் - (₹2000)":
    "Pandian & Gomathi contributed Sundal (10 Kg) + Paal Kozhukattai (200 Qty) - (₹2000)",
  "விநாயகர் கோயிலுக்கு வாழை & சறுக்கு மரம் - (₹230)":
    "Banana Trees & Slippery Pole for Vinayagar Temple - (₹230)",
  "திருக்கழுக்குன்றம் + மாமல்லபுரம் + கல்பாக்கம்":
    "Thirukazhukundram + Mamallapuram + Kalpakkam",
  "கலர் பவுடர் - (₹450)": "Color Powder - (₹450)",
  "தலப்ப துணி - (₹1220)": "Turban Cloth (Thalappa Thuni) - (₹1220)",
  "விநாயகர் கடைசி நாள் சாப்பாடு - (₹850)": "Vinayagar Last Day Meals - (₹850)",
  "விநாயகர் பூஜைக்கு அன்பளிப்பு - N.பழனி அவர்கள் - (₹200)":
    "Contribution for Vinayagar Pooja - N.Palani - (₹200)",
  "விளையாட்டு பொருட்கள் - (₹500)": "Sports Items - (₹500)",
  "விநாயகர் தேர் கட்டுதல் - கேசவன் அவர்களுக்கு தற்சனை கொடுக்கப்பட்டது - (₹301)":
    "Vinayagar Chariot Building - Dakshina given to Kesavan - (₹301)",
  "நாடார் கடை செலவுகள் - (₹1411)": "Nadar Shop Expenses - (₹1411)",
};

const PHRASE_REPLACEMENTS: Array<[string, string]> = [
  ["முந்தைய ஆண்டு சேமிப்பில் இருந்து பணம் எடுத்தால்", "Withdrawal from previous year savings"],
  ["முந்தைய ஆண்டு சேமிப்பிலிருந்து", "From Previous Year Savings"],
  ["முந்தைய ஆண்டு சேமிப்பு", "Previous Year Savings"],
  ["முந்தைய ஆண்டு சேமிப்பி", "Previous Year Savings"],
  ["அன்னதானம் செய்ய பாத்திரங்கள் அன்பளிப்பு", "Utensils Contribution for Annadhanam"],
  ["அன்னதானம் செய்ய பாத்திரங்கள் அனைத்தும் வழங்கினார்", "Provided all utensils for Annadhanam"],
  ["சக்தி விநாயகருக்கு கோட்டை அமைத்தல்", "Shed / Mandapam Construction for Sakthi Vinayagar"],
  ["சக்தி விநாயகருக்கு வானவேடிக்கை", "Firecrackers for Sakthi Vinayagar"],
  ["சக்தி விநாயகருக்கு அன்னதானம்", "Annadhanam for Sakthi Vinayagar"],
  ["சக்தி விநாயகருக்கு நோட்டீஸ்", "Notice for Sakthi Vinayagar"],
  ["விநாயகர் தேர் கட்டுதல்", "Vinayagar Chariot Building"],
  ["விநாயகர் லோகோ டிசைன்", "Vinayagar Logo Design"],
  ["விநாயகர் அலங்காரம்", "Vinayagar Decoration"],
  ["விநாயகர் பூஜை தரிசனை", "Vinayagar Pooja Dakshina"],
  ["விநாயகர் பூஜை சாமான்கள்", "Vinayagar Pooja Items"],
  ["விநாயகர் பூஜை சாமான்", "Vinayagar Pooja Items"],
  ["விநாயகர் பூஜை", "Vinayagar Pooja"],
  ["விநாயகர் சிலை", "Vinayagar Statue"],
  ["விநாயகர் தொகை", "Vinayagar Amount"],
  ["சக்தி விநாயகர்", "Sakthi Vinayagar"],
  ["ஸ்ரீ சக்தி விநாயகர்", "Sri Sakthi Vinayagar"],
  ["விநாயகர்", "Vinayagar"],
  ["எலக்ட்ரிசியன் சாமான்", "Electrician Items"],
  ["எலெக்ட்ரிசின் சாமான்", "Electrician Items"],
  ["அலங்காரம்/தலப்பணி", "Decoration / Head Work"],
  ["அன்னதானம் சாமான்", "Annadhanam Items"],
  ["அன்னதானம் பிளேட்", "Annadhanam Plates"],
  ["தண்ணீர் பாட்டில்", "Water Bottles"],
  ["மளிகைச் சாமான்கள்", "Groceries"],
  ["விளையாட்டு பொருட்கள்", "Sports Items"],
  ["பானை உடைத்தல் விளையாட்டு", "Pot Breaking Game"],
  ["விளையாட்டு பரிசு", "Games Prizes"],
  ["கோலப் போட்டி பரிசு", "Kolam Competition Prize"],
  ["வாழைமரம் விளையாட்டு", "Banana Tree Game"],
  ["வீடுகளுக்கு பரிசு", "Household Gifts"],
  ["தாரைதப்பட்டை", "Tharai Thappattai"],
  ["நாடார் கடை செலவுகள்", "Nadar Shop Expenses"],
  ["மதிய உணவு & சிற்றுண்ட", "Afternoon Meals & Snacks"],
  ["டிராக்டர் டீசல்", "Tractor Diesel"],
  ["வண்டி & டீசல்", "Transport & Diesel"],
  ["பால் கொழுக்கட்டை", "Paal Kozhukattai"],
  ["சக்கரை பொங்கல்", "Sakkarai Pongal"],
  ["அண்ணாச்சி ஆப்பிள் கேசரி", "Pineapple Kesari"],
  ["பைன் ஆப்பிள் கேசரி", "Pineapple Kesari"],
  ["பைன் ஆப்பிள்", "Pineapple"],
  ["பொன்னி அரிசி", "Ponni Rice"],
  ["பச்சை அரிசி", "Raw Rice"],
  ["பச்ச அரிசி", "Raw Rice"],
  ["வாழை மரம்", "Banana Trees"],
  ["கலர் ஸ்மோக்கர்", "Color Smoker"],
  ["கலர் பவுடர்", "Color Powder"],
  ["தலப்ப துணி", "Turban Cloth"],
  ["ரிப்பன் அலங்காரம்", "Ribbon Decoration"],
  ["பேக்ட்ராப்", "Backdrop"],
  ["விநாயகர் சிலை மூடும் தார்பாய்", "Tarpaulin for Covering Vinayagar Statue"],
  ["தார்பாய்", "Tarpaulin"],
  ["பேனர்", "Banner"],
  ["போலீஸ்க்கு", "For Police"],
  ["போலீஸ்", "Police"],
  ["சணல் கட்டு", "Jute Rope Bundle"],
  ["கேசவன் அவர்களுக்கு தற்சனை கொடுக்கப்பட்டது", "Dakshina given to Kesavan"],
  ["விநாயகர் வேலைகள்", "Vinayagar Works"],
  ["கொட்டகை சீட்", "Shed Sheet"],
  ["ஹார்ன் ஸ்பீக்கர்", "Horn Speaker"],
  ["எலுமிச்சை பழம்", "Lemons"],
  ["பிளேட்ஸ்", "Plates"],
  ["பூஜை பொருட்கள்", "Pooja Items"],
  ["சின்னம்மன் கோயில் பூசாரி", "Chinnaman Temple Priest"],
  ["அன்னதானம் செய்வதற்கு", "for Annadhanam"],
  ["அன்பளிப்பாக", "as a contribution"],
  ["பானை", "Pot"],
  ["டிஃபென்", "Tiffin Box"],
  ["உருண்டை", "Urundai"],
  ["பணம்", "Cash"],
  ["பாரீஸ்", "Parrys"],
  ["திருக்கழுக்குன்றம்", "Thirukazhukundram"],
  ["பலூன்", "Balloon"],
  ["பேப்பர் கப்", "Paper Cup"],
  ["பேப்பர் கிளாஸ்", "Paper Glass"],
  ["கிரீஸ்", "Grease"],
  ["எண்ணெய்", "Oil"],
  ["குட்டி பால்ஸ்", "Small Balls"],
  ["பிஸ்கட்", "Biscuit"],
  ["கோலமாவு", "Kolam Powder"],
  ["ஸ்பாஞ்ச்", "Sponge"],
  ["ஸ்ட்ரா", "Straw"],
  ["கார்ட்ஸ்", "Cards"],
  ["கடைசி நாள்", "Last Day"],
  ["முதல் நாள்", "First Day"],
  ["ஒரு நாள்", "1 Day"],
  ["உண்டியல்", "Hundi"],
  ["காய்கறி", "Vegetables"],
  ["சிலிண்டர்", "Cylinder"],
  ["தண்ணீர்", "Water"],
  ["சாப்பாடு", "Meals"],
  ["காலை", "Morning"],
  ["மதியம்", "Afternoon"],
  ["ட்ரம்ஸ்", "Drums"],
  ["அட்வான்ஸ்", "Advance"],
  ["பெட்ரோல்", "Petrol"],
  ["வெடி", "Firecrackers"],
  ["சுண்டல்", "Sundal"],
  ["அரிசி", "Rice"],
  ["தேங்காய்", "Coconut"],
  ["மாலை", "Garland"],
  ["தட்டு", "Plates"],
  ["பழங்கள்", "Fruits"],
  ["இனிப்புகள்", "Sweets"],
  ["பொறுப்பு :", "Responsible:"],
  ["பொறுப்பு:", "Responsible:"],
  ["அவர்கள்", ""],
  ["வழங்கினார்கள்", "contributed"],
  ["வழங்கினார்", "contributed"],
  ["வழங்கினர்", "contributed"],
  ["அன்பளிப்பு", "Contribution"],
  ["நன்கொடை", "Donation"],
  ["அன்னதானம்", "Annadhanam"],
  ["மற்றும் மகளிர் குழு", "and Women's Group"],
  ["கடம்பாடி பாய்ஸ்", "Kadambadi Boys"],
  ["டீ கடை", "Tea Shop"],
  ["சிவன் கோயில் பூசாரி", "Sivan Temple Priest"],
  ["பூசாரி", "Priest"],
  ["சப்ளையர்", "Supplier"],
  ["நாள்", "Days"],
];

const TAMIL_VOWELS: Record<string, string> = {
  அ: "a", ஆ: "aa", இ: "i", ஈ: "ee", உ: "u", ஊ: "oo",
  எ: "e", ஏ: "e", ஐ: "ai", ஒ: "o", ஓ: "o", ஔ: "au",
};
const TAMIL_CONSONANTS: Record<string, string> = {
  க: "k", ங: "ng", ச: "s", ஞ: "nj", ட: "d", ண: "n", த: "th", ந: "n",
  ப: "p", ம: "m", ய: "y", ர: "r", ல: "l", வ: "v", ழ: "zh", ள: "l",
  ற: "r", ன: "n", ஜ: "j", ஶ: "s", ஷ: "sh", ஸ: "s", ஹ: "h",
};
const TAMIL_MATRAS: Record<string, string> = {
  "ா": "a", "ி": "i", "ீ": "ee", "ு": "u", "ூ": "oo",
  "ெ": "e", "ே": "e", "ை": "ai", "ொ": "o", "ோ": "o", "ௌ": "au",
};

function transliterateTamil(str: string): string {
  if (!/[\u0B80-\u0BFF]/.test(str)) return str;
  let out = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const next = str[i + 1] ?? "";
    if (TAMIL_VOWELS[ch]) {
      out += TAMIL_VOWELS[ch];
    } else if (TAMIL_CONSONANTS[ch]) {
      const base = TAMIL_CONSONANTS[ch];
      if (next === "்") {
        out += base;
        i++;
      } else if (TAMIL_MATRAS[next]) {
        out += base + TAMIL_MATRAS[next];
        i++;
      } else {
        out += base + "a";
      }
    } else if (!TAMIL_MATRAS[ch] && ch !== "்" && ch !== "ஃ") {
      out += ch;
    }
  }
  return out.replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

function translateText(ta: string, exactDict?: Record<string, string>): string {
  const trimmed = ta.trim();
  if (!trimmed || trimmed === "-") return trimmed;
  if (exactDict) {
    if (exactDict[trimmed]) return exactDict[trimmed];
    const singleLine = trimmed.replace(/\s+/g, " ");
    if (exactDict[singleLine]) return exactDict[singleLine];
  }
  if (trimmed.includes("\n")) {
    return trimmed
      .split("\n")
      .map((line) => translateText(line, exactDict))
      .join("\n");
  }
  const single = trimmed.replace(/\s+/g, " ");
  if (NAME_MAP[single]) return NAME_MAP[single];
  if (STREET_MAP[single]) return STREET_MAP[single];

  let out = single;
  // Sort keys longest-first so longer names match before prefixes
  const sortedNames = Object.entries(NAME_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [k, v] of sortedNames) {
    if (out.includes(k)) out = out.split(k).join(v);
  }
  for (const [k, v] of Object.entries(STREET_MAP)) {
    if (out.includes(k)) out = out.split(k).join(v);
  }
  for (const [k, v] of PHRASE_REPLACEMENTS) {
    if (out.includes(k)) out = out.split(k).join(v);
  }
  return transliterateTamil(out.replace(/\s+/g, " ").trim());
}

/* -------------------------------------------------------------------------- */
/* PDF Stream, TrueType GSUB, & CMap Decoder                                  */
/* -------------------------------------------------------------------------- */

function decodeHexUtf16(hex: string, offset = 0): string {
  const units: number[] = [];
  for (let i = 0; i < hex.length; i += 4) {
    units.push(parseInt(hex.slice(i, i + 4), 16));
  }
  if (units.length > 0) units[units.length - 1] += offset;
  return String.fromCharCode(...units);
}

function parseCMap(s: string): Map<number, string> {
  const map = new Map<number, string>();
  for (const cm of s.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const pair of cm[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      map.set(parseInt(pair[1], 16), decodeHexUtf16(pair[2]));
    }
  }
  for (const rm of s.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const range of rm[1].matchAll(
      /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(?:<([0-9A-Fa-f]+)>|\[([\s\S]*?)\])/g,
    )) {
      const start = parseInt(range[1], 16);
      const end = parseInt(range[2], 16);
      if (range[3]) {
        if (end - start < 2000) {
          for (let k = start; k <= end; k++) {
            map.set(k, decodeHexUtf16(range[3], k - start));
          }
        }
      } else if (range[4]) {
        const hexes = [...range[4].matchAll(/<([0-9A-Fa-f]+)>/g)].map((x) => x[1]);
        hexes.forEach((dstHex, idx) => {
          map.set(start + idx, decodeHexUtf16(dstHex));
        });
      }
    }
  }
  return map;
}

function enrichCmapFromTtf(ttf: Buffer, baseCmap: Map<number, string>): Map<number, string> {
  const map = new Map<number, string>(baseCmap);
  try {
    const numTables = ttf.readUInt16BE(4);
    const tables: Record<string, { offset: number; length: number }> = {};
    for (let i = 0; i < numTables; i++) {
      const p = 12 + i * 16;
      const tag = ttf.subarray(p, p + 4).toString("ascii");
      tables[tag] = {
        offset: ttf.readUInt32BE(p + 8),
        length: ttf.readUInt32BE(p + 12),
      };
    }

    if (tables["cmap"]) {
      const cmapOff = tables["cmap"].offset;
      const numSub = ttf.readUInt16BE(cmapOff + 2);
      for (let i = 0; i < numSub; i++) {
        const subOff = cmapOff + ttf.readUInt32BE(cmapOff + 4 + i * 8 + 4);
        const fmt = ttf.readUInt16BE(subOff);
        if (fmt === 12) {
          const numGroups = ttf.readUInt32BE(subOff + 12);
          for (let g = 0; g < numGroups; g++) {
            const grpOff = subOff + 16 + g * 12;
            const startChar = ttf.readUInt32BE(grpOff);
            const endChar = ttf.readUInt32BE(grpOff + 4);
            const startGid = ttf.readUInt32BE(grpOff + 8);
            if (endChar - startChar < 5000) {
              for (let c = startChar; c <= endChar; c++) {
                const gid = startGid + (c - startChar);
                if (gid !== 0 && !map.has(gid)) {
                  map.set(gid, String.fromCodePoint(c));
                }
              }
            }
          }
        }
      }
    }

    // Fill unmapped Tamil gap glyphs (ஶ U+0BB6..ஹ U+0BB9, ீ U+0BC0, ு U+0BC1, ூ U+0BC2)
    let gidVa = -1;
    let gidI = -1;
    let gidIi = -1;
    let gidE = -1;
    for (const [gid, ch] of map) {
      if (ch === "\u0BB5") gidVa = gid;
      else if (ch === "\u0BBF") gidI = gid;
      else if (ch === "\u0BC0") gidIi = gid;
      else if (ch === "\u0BC6") gidE = gid;
    }
    if (gidVa > 0 && !map.has(gidVa + 1)) map.set(gidVa + 1, "\u0BB6");
    if (gidVa > 0 && !map.has(gidVa + 2)) map.set(gidVa + 2, "\u0BB7");
    if (gidVa > 0 && !map.has(gidVa + 3)) map.set(gidVa + 3, "\u0BB8");
    if (gidVa > 0 && !map.has(gidVa + 4)) map.set(gidVa + 4, "\u0BB9");
    if (gidI > 0 && gidIi < 0) {
      gidIi = gidI + 1;
      if (!map.has(gidIi)) map.set(gidIi, "\u0BC0");
    }
    if (gidIi > 0 && gidE > gidIi + 1) {
      const span = gidE - gidIi;
      if (span === 5) {
        if (!map.has(gidIi + 1)) map.set(gidIi + 1, "\u0BC1");
        if (!map.has(gidIi + 2)) map.set(gidIi + 2, "\u0BC1");
        if (!map.has(gidIi + 3)) map.set(gidIi + 3, "\u0BC2");
        if (!map.has(gidIi + 4)) map.set(gidIi + 4, "\u0BC2");
      } else if (span >= 3) {
        if (!map.has(gidIi + 1)) map.set(gidIi + 1, "\u0BC1");
        if (!map.has(gidIi + 2)) map.set(gidIi + 2, "\u0BC2");
      }
    }

    if (tables["GSUB"]) {
      const gsubOff = tables["GSUB"].offset;
      const lookupListOff = gsubOff + ttf.readUInt16BE(gsubOff + 8);
      const lookupCount = ttf.readUInt16BE(lookupListOff);

      const readCoverage = (off: number): number[] => {
        const fmt = ttf.readUInt16BE(off);
        const glyphs: number[] = [];
        if (fmt === 1) {
          const cnt = ttf.readUInt16BE(off + 2);
          for (let i = 0; i < cnt; i++) glyphs.push(ttf.readUInt16BE(off + 4 + i * 2));
        } else if (fmt === 2) {
          const cnt = ttf.readUInt16BE(off + 2);
          for (let i = 0; i < cnt; i++) {
            const start = ttf.readUInt16BE(off + 4 + i * 6);
            const end = ttf.readUInt16BE(off + 4 + i * 6 + 2);
            for (let g = start; g <= end; g++) glyphs.push(g);
          }
        }
        return glyphs;
      };

      const subst = new Map<number, number[]>();
      for (let i = 0; i < lookupCount; i++) {
        const lOff = lookupListOff + ttf.readUInt16BE(lookupListOff + 2 + i * 2);
        const lType = ttf.readUInt16BE(lOff);
        const subCount = ttf.readUInt16BE(lOff + 4);
        for (let s = 0; s < subCount; s++) {
          let sOff = lOff + ttf.readUInt16BE(lOff + 6 + s * 2);
          let actualType = lType;
          if (lType === 7) {
            actualType = ttf.readUInt16BE(sOff + 2);
            sOff = sOff + ttf.readUInt32BE(sOff + 4);
          }
          if (actualType === 1) {
            const fmt = ttf.readUInt16BE(sOff);
            const cov = readCoverage(sOff + ttf.readUInt16BE(sOff + 2));
            if (fmt === 1) {
              const delta = ttf.readInt16BE(sOff + 4);
              cov.forEach((g) => {
                const dst = (g + delta) & 0xffff;
                if (!subst.has(dst)) subst.set(dst, [g]);
              });
            } else if (fmt === 2) {
              const cnt = ttf.readUInt16BE(sOff + 4);
              for (let k = 0; k < cnt; k++) {
                const dst = ttf.readUInt16BE(sOff + 6 + k * 2);
                if (!subst.has(dst)) subst.set(dst, [cov[k]]);
              }
            }
          } else if (actualType === 4) {
            const fmt = ttf.readUInt16BE(sOff);
            if (fmt === 1) {
              const cov = readCoverage(sOff + ttf.readUInt16BE(sOff + 2));
              const setCnt = ttf.readUInt16BE(sOff + 4);
              for (let k = 0; k < setCnt; k++) {
                const firstGlyph = cov[k];
                const setOff = sOff + ttf.readUInt16BE(sOff + 6 + k * 2);
                const ligCnt = ttf.readUInt16BE(setOff);
                for (let l = 0; l < ligCnt; l++) {
                  const ligOff = setOff + ttf.readUInt16BE(setOff + 2 + l * 2);
                  const ligGlyph = ttf.readUInt16BE(ligOff);
                  const compCnt = ttf.readUInt16BE(ligOff + 2);
                  const comps = [firstGlyph];
                  for (let c = 0; c < compCnt - 1; c++) {
                    comps.push(ttf.readUInt16BE(ligOff + 4 + c * 2));
                  }
                  if (!subst.has(ligGlyph)) subst.set(ligGlyph, comps);
                }
              }
            }
          }
        }
      }

      const resolveGlyph = (gid: number, depth = 0): string => {
        if (map.has(gid)) return map.get(gid)!;
        if (depth > 6) return "";
        const parts = subst.get(gid);
        if (!parts) return "";
        const resolved = parts.map((p) => resolveGlyph(p, depth + 1)).join("");
        if (resolved) map.set(gid, resolved);
        return resolved;
      };

      for (const gid of subst.keys()) {
        resolveGlyph(gid);
      }
    }
  } catch {
    // ignore malformed TTF table
  }
  return map;
}

function cleanTamil(s: string, visualOrder = false): string {
  let out = s;
  if (visualOrder) {
    out = out
      .replace(/\u0BC6([\u0B95-\u0BB9])\u0BBE/g, "$1\u0BCA")
      .replace(/\u0BC7([\u0B95-\u0BB9])\u0BBE/g, "$1\u0BCB")
      .replace(/\u0BC6([\u0B95-\u0BB9])\u0BD7/g, "$1\u0BCC")
      .replace(/([\u0BC6-\u0BC8])([\u0B95-\u0BB9])/g, "$2$1");
  }
  return out
    .replace(/\r\n?/g, "\n")
    .replace(/\u0BB6\u0BCD\u0BB0\u0BC0/g, "ஸ்ரீ")
    .replace(/(?:👉|☞|👈|👆|👇)\s*/g, "• ")
    .replace(/([\u0B80-\u0BFF])\s+([\u0BBE-\u0BCD\u0BD7])/g, "$1$2")
    .replace(/([\u0B80-\u0BFF])\s+([\u0BBE-\u0BCD\u0BD7])/g, "$1$2")
    .replace(/\uF0F0/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function mergeWrappedLines(rawLines: string[]): string {
  const merged: string[] = [];
  for (const line of rawLines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("• ") || /^-{3,}/.test(t) || merged.length === 0 || /^-{3,}/.test(merged[merged.length - 1])) {
      merged.push(t);
    } else {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${t}`;
    }
  }
  return merged.join("\n");
}

function extractSummaryBoxValues(lines: string[]): {
  income: number | null;
  expense: number | null;
  balance: number | null;
} {
  let income: number | null = null;
  let expense: number | null = null;
  let balance: number | null = null;
  let pending: "income" | "expense" | "balance" | null = null;
  let sawPrevYear = false;

  for (const raw of lines) {
    const t = raw.replace(/\s+/g, " ").trim();
    if (!t) continue;
    if (t.includes("முந்தைய") || t.includes("(")) {
      sawPrevYear = t.includes("முந்தைய") && !t.includes("(");
      continue;
    }
    if (t.includes("செலவு")) {
      pending = "expense";
      sawPrevYear = false;
      continue;
    }
    if (t.includes("வருமானம்") || t.includes("நண்கொடை") || t.includes("நன்கொடை")) {
      pending = "income";
      sawPrevYear = false;
      continue;
    }
    if (t.includes("இருப்பு")) {
      if (!sawPrevYear) pending = "balance";
      sawPrevYear = false;
      continue;
    }
    if (/^(?:₹\s*)?[\d,]+(?:\.\d+)?(?:\s*₹)?$/.test(t) && pending) {
      const val = Number(t.replace(/[^0-9.]/g, ""));
      if (!Number.isNaN(val)) {
        if (pending === "income") income = val;
        else if (pending === "expense") expense = val;
        else if (pending === "balance") balance = val;
        pending = null;
      }
    }
  }
  return { income, expense, balance };
}

export function parseBudgetPdf(buf: Buffer): ParsedBudgetPdf | null {
  try {
    const raw = buf.toString("latin1");
    const objRegex = /(\d+)\s+0\s+obj\b([\s\S]*?)endobj/g;
    const streams = new Map<number, string>();
    const streamBufs = new Map<number, Buffer>();
    const dicts = new Map<number, string>();
    let m: RegExpExecArray | null;

    while ((m = objRegex.exec(raw)) !== null) {
      const id = Number(m[1]);
      const body = m[2];
      dicts.set(id, body);
      const sm = body.match(/stream\r?\n([\s\S]*?)\r?\nendstream/);
      if (sm) {
        try {
          const inf = zlib.inflateSync(Buffer.from(sm[1], "latin1"));
          streamBufs.set(id, inf);
          streams.set(id, inf.toString("latin1"));
        } catch {
          const b = Buffer.from(sm[1], "latin1");
          streamBufs.set(id, b);
          streams.set(id, sm[1]);
        }
      }
    }

    // Page tree: /Kids and /Type /Pages may appear in any order; nested trees are flattened.
    const expandKids = (id: number, seen = new Set<number>()): number[] => {
      if (seen.has(id)) return [];
      seen.add(id);
      const d = dicts.get(id) || "";
      const km = d.match(/\/Kids\s*\[([\s\S]*?)\]/);
      if (!km) return [id];
      return [...km[1].matchAll(/(\d+)\s+0\s+R/g)].flatMap((x) => expandKids(Number(x[1]), seen));
    };
    let pageIds: number[] = [];
    for (const [id, d] of dicts) {
      if (/\/Type\s*\/Pages\b/.test(d) && /\/Kids\s*\[/.test(d) && !/\/Parent\s+\d+\s+0\s+R/.test(d)) {
        pageIds = expandKids(id);
        break;
      }
    }
    if (pageIds.length === 0) {
      for (const [id, d] of dicts) {
        if (/\/Type\s*\/Page\b/.test(d)) pageIds.push(id);
      }
    }

    const donors: DonorRecord[] = [];
    const expenses: ExpenseRecord[] = [];
    let summaryIncome: number | null = null;
    let summaryExpense: number | null = null;
    let summaryBalance: number | null = null;
    let mode: "summary" | "donors" | "expenses" = "summary";

    for (let pIdx = 0; pIdx < pageIds.length; pIdx++) {
      const id = pageIds[pIdx];
      const d = dicts.get(id) || "";

      // /Contents can be a single stream reference or an array of streams.
      let content = "";
      const cArr = d.match(/\/Contents\s*\[([\s\S]*?)\]/);
      if (cArr) {
        content = [...cArr[1].matchAll(/(\d+)\s+0\s+R/g)]
          .map((x) => streams.get(Number(x[1])) || "")
          .join("\n");
      } else {
        const cm = d.match(/\/Contents\s+(\d+)\s+0\s+R/);
        if (cm) content = streams.get(Number(cm[1])) || "";
      }
      if (!content) continue;

      const mb = d.match(/\/MediaBox\s*\[\s*[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)\s*\]/);
      const pageH = mb ? parseFloat(mb[2]) : 842;

      // /Resources may be inline or an indirect object; /Font may be indirect too.
      let resText = d;
      const rr = d.match(/\/Resources\s+(\d+)\s+0\s+R/);
      if (rr) resText += "\n" + (dicts.get(Number(rr[1])) || "");
      const fr = resText.match(/\/Font\s+(\d+)\s+0\s+R/);
      if (fr) resText += "\n" + (dicts.get(Number(fr[1])) || "");

      const fontMap = new Map<string, { type: "cid" | "ansi"; cmap?: Map<number, string> }>();
      for (const fm of resText.matchAll(/\/(F\d+)\s+(\d+)\s+0\s+R/g)) {
        const fName = fm[1];
        const fObj = dicts.get(Number(fm[2])) || "";
        const tu = fObj.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
        if (tu) {
          let cmap = parseCMap(streams.get(Number(tu[1])) || "");
          let ff2 = fObj.match(/\/FontFile2\s+(\d+)\s+0\s+R/);
          if (!ff2) {
            const fd = fObj.match(/\/FontDescriptor\s+(\d+)\s+0\s+R/);
            if (fd) {
              ff2 = (dicts.get(Number(fd[1])) || "").match(/\/FontFile2\s+(\d+)\s+0\s+R/);
            }
            if (!ff2) {
              const df = fObj.match(/\/DescendantFonts\s*\[\s*(\d+)\s+0\s+R/);
              if (df) {
                const dfObj = dicts.get(Number(df[1])) || "";
                const dfFd = dfObj.match(/\/FontDescriptor\s+(\d+)\s+0\s+R/);
                if (dfFd) {
                  ff2 = (dicts.get(Number(dfFd[1])) || "").match(/\/FontFile2\s+(\d+)\s+0\s+R/);
                }
              }
            }
          }
          if (ff2 && streamBufs.has(Number(ff2[1]))) {
            cmap = enrichCmapFromTtf(streamBufs.get(Number(ff2[1]))!, cmap);
          }
          fontMap.set(fName, { type: "cid", cmap });
        } else {
          fontMap.set(fName, { type: "ansi" });
        }
      }

      const hasBdc = /\/P\s*<<\/MCID\s*\d+>>\s*BDC/.test(content);

      if (hasBdc) {
        const chunks = [...content.matchAll(/\/P\s*<<\/MCID\s*\d+>>\s*BDC([\s\S]*?)EMC/g)].map(
          (x) => x[1],
        );
        const blocks: Array<{ x: number; y: number; text: string }> = [];
        for (const chunk of chunks) {
          let curFont = "F1";
          let sumY = 0;
          let countY = 0;
          let minX = Infinity;
          let curY: number | null = null;
          const lines: string[] = [];
          let curLine = "";

          for (const bt of chunk.matchAll(/BT([\s\S]*?)ET/g)) {
            for (const tok of bt[1].matchAll(
              /\/(F\d+)\s+[\d.]+\s+Tf|([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+Tm|([\d.-]+)\s+([\d.-]+)\s+Td|(\[(?:[\s\S]*?)\])\s*TJ|(\((?:\\.|[^\\)])*\)|<[0-9A-Fa-f]+>)\s*Tj/g,
            )) {
              if (tok[1]) {
                curFont = tok[1];
              } else if (tok[2]) {
                const nx = parseFloat(tok[6]);
                const rawY = parseFloat(tok[7]);
                const ny = parseFloat(tok[5]) < 0 ? pageH - rawY : rawY;
                if (nx < minX) minX = nx;
                sumY += ny;
                countY++;
                if (curY !== null && Math.abs(ny - curY) > 3.5) {
                  if (curLine.trim()) lines.push(cleanTamil(curLine));
                  curLine = "";
                }
                curY = ny;
              } else if (tok[8]) {
                const dy = parseFloat(tok[9]);
                if (Math.abs(dy) > 3.5) {
                  if (curLine.trim()) lines.push(cleanTamil(curLine));
                  curLine = "";
                  if (curY !== null) curY += dy;
                }
              } else if (tok[10] || tok[11]) {
                const rawTj = tok[10] || tok[11];
                const f = fontMap.get(curFont) || { type: "ansi" };
                let text = "";
                for (const strTok of rawTj.matchAll(/<([0-9A-Fa-f]+)>|\((?:\\.|[^\\)])*\)/g)) {
                  if (strTok[1]) {
                    const hex = strTok[1];
                    for (let i = 0; i < hex.length; i += 4) {
                      const code = parseInt(hex.slice(i, i + 4), 16);
                      text += f.cmap?.get(code) ?? "";
                    }
                  } else {
                    const lit = strTok[0].slice(1, -1).replace(/\\([()\\])/g, "$1");
                    if (f.type === "cid" && f.cmap) {
                      for (let i = 0; i < lit.length; i += 2) {
                        const code = (lit.charCodeAt(i) << 8) | (lit.charCodeAt(i + 1) || 0);
                        text += f.cmap.get(code) ?? "";
                      }
                    } else {
                      text += lit;
                    }
                  }
                }
                curLine += text;
              }
            }
          }
          if (curLine.trim()) lines.push(cleanTamil(curLine));
          if (lines.length && countY > 0) {
            blocks.push({ x: minX, y: sumY / countY, text: mergeWrappedLines(lines) });
          }
        }

        const sectionMarkers = blocks.filter(
          (b) => b.text === "வருமானம் / நிதி" || b.text === "செலவுகள்",
        );
        if (pIdx === 0 && sectionMarkers.length > 0) {
          const topMarkerY = Math.max(...sectionMarkers.map((s) => s.y));
          const leftSummaryLines = blocks
            .filter((b) => b.y > topMarkerY && b.x < 175)
            .sort((a, b) => b.y - a.y)
            .flatMap((b) => b.text.split("\n"));
          const sb = extractSummaryBoxValues(leftSummaryLines);
          if (sb.income !== null) summaryIncome = sb.income;
          if (sb.expense !== null) summaryExpense = sb.expense;
          if (sb.balance !== null) summaryBalance = sb.balance;
        }
        const anchors = blocks
          .filter((b) => b.x < 65 && /^\d+$/.test(b.text.trim()))
          .map((b) => ({ id: Number(b.text.trim()), y: b.y }))
          .sort((a, b) => b.y - a.y);

        for (const anc of anchors) {
          for (const sm of sectionMarkers) {
            if (sm.y > anc.y) mode = sm.text.includes("வருமானம்") ? "donors" : "expenses";
          }
          if (mode === "summary") mode = "donors";

          const rowCells = blocks.filter((b) => b.x >= 65 && Math.abs(b.y - anc.y) < 10);
          let col2 = "";
          let col3 = "";
          let col4 = "";
          let col5 = "";
          for (const c of rowCells.sort((a, b) => a.x - b.x)) {
            if (c.x < 195) col2 = col2 ? col2 + "\n" + c.text : c.text;
            else if (c.x < 348) col3 = col3 ? col3 + "\n" + c.text : c.text;
            else if (c.x < 493) col4 = col4 ? col4 + "\n" + c.text : c.text;
            else col5 = col5 ? col5 + " " + c.text : c.text;
          }
          const numMatch = col5.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
          const amount = numMatch ? Number(numMatch[1]) : null;

          if (mode === "donors") {
            const donorNameTa = col2.replace(/\s+/g, " ").trim();
            const donorNameEn = translateText(donorNameTa, NAME_MAP);
            const streetTa = col3.replace(/\s+/g, " ").trim();
            const streetEn = translateText(streetTa, STREET_MAP);
            const descTaRaw = col4.trim();
            const hasDesc = Boolean(descTaRaw && descTaRaw !== "-");
            const descEnRaw = hasDesc ? translateText(descTaRaw, DONOR_DESC_MAP) : "";

            donors.push({
              id: anc.id,
              donorNameTa,
              donorNameEn,
              detailsTa: hasDesc ? `${streetTa} - ${descTaRaw}` : streetTa,
              detailsEn: hasDesc ? `${streetEn} - ${descEnRaw}` : streetEn,
              amount,
            });
          } else {
            const categoryTa = col2.replace(/\s+/g, " ").trim();
            const categoryEn = translateText(categoryTa, EXPENSE_CATEGORY_MAP);
            const detailsTa = col3.trim();
            const detailsEn = translateText(detailsTa, EXPENSE_DETAILS_MAP);
            const responsibleTa = col4.replace(/\s+/g, " ").trim();
            const responsibleEn = translateText(responsibleTa);

            expenses.push({
              id: anc.id,
              categoryTa,
              categoryEn,
              detailsTa,
              detailsEn,
              responsibleTa,
              responsibleEn,
              amount,
            });
          }
        }
        continue;
      }

      // Non-BDC PDF layout (e.g. Chromium/Skia PDFs with top-down coordinates, cm+TD clusters, TJ jumps, and grid lines)
      const frags: Array<{ x: number; y: number; text: string }> = [];
      const usedBtRanges: Array<[number, number]> = [];

      for (const cmBlock of content.matchAll(
        /1\s+0\s+0\s+-1\s+([\d.-]+)\s+([\d.-]+)\s+cm([\s\S]*?)Q/g,
      )) {
        const cmX = parseFloat(cmBlock[1]);
        const cmY = parseFloat(cmBlock[2]);
        const body = cmBlock[3];
        const blockStart = cmBlock.index ?? 0;
        usedBtRanges.push([blockStart, blockStart + cmBlock[0].length]);

        let runText = "";
        let runStartX = cmX;
        let runY = cmY;
        let lastDx: number | null = null;
        for (const bt of body.matchAll(/BT([\s\S]*?)ET/g)) {
          const fm = bt[1].match(/\/(F\d+)\s+([\d.]+)\s+Tf/);
          const td = bt[1].match(/([\d.-]+)\s+([\d.-]+)\s+TD/);
          const tj = bt[1].match(/<([0-9A-Fa-f]+)>\s*Tj/);
          if (!fm || !td || !tj) continue;
          const f = fontMap.get(fm[1]) || { type: "ansi" };
          const dx = parseFloat(td[1]);
          const dy = parseFloat(td[2]);
          if (lastDx !== null && (dx - lastDx > 25 || Math.abs(dy) > 4)) {
            if (runText) frags.push({ x: runStartX, y: runY, text: runText });
            runText = "";
            runStartX = cmX + dx;
            runY = cmY - dy;
          } else if (lastDx === null) {
            runStartX = cmX + dx;
            runY = cmY - dy;
          }
          lastDx = dx;
          const hex = tj[1];
          for (let i = 0; i < hex.length; i += 4) {
            const code = parseInt(hex.slice(i, i + 4), 16);
            runText += f.cmap?.get(code) ?? "";
          }
        }
        if (runText) {
          frags.push({ x: runStartX, y: runY, text: runText });
        }
      }

      for (const bt of content.matchAll(/BT([\s\S]*?)ET/g)) {
        const btIdx = bt.index ?? 0;
        if (usedBtRanges.some(([s, e]) => btIdx >= s && btIdx < e)) continue;
        let curFont = "F1";
        let fontSize = 11.65;
        let curX = 0;
        let curY = 0;
        let hasTm = false;
        for (const tok of bt[1].matchAll(
          /\/(F\d+)\s+([\d.]+)\s+Tf|([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+Tm|([\d.-]+)\s+([\d.-]+)\s+Td|(\[(?:[\s\S]*?)\])\s*TJ|(\((?:\\.|[^\\)])*\)|<[0-9A-Fa-f]+>)\s*Tj/g,
        )) {
          if (tok[1]) {
            curFont = tok[1];
            fontSize = parseFloat(tok[2]) || 11.65;
          } else if (tok[3]) {
            curX = parseFloat(tok[7]);
            curY = parseFloat(tok[8]);
            hasTm = true;
          } else if (tok[9]) {
            curX += parseFloat(tok[9]);
            curY += parseFloat(tok[10]);
            hasTm = true;
          } else if ((tok[11] || tok[12]) && hasTm) {
            const rawTj = tok[11] || tok[12];
            const f = fontMap.get(curFont) || { type: "ansi" };
            let runX = curX;
            let curText = "";
            let runStartX = curX;
            for (const item of rawTj.matchAll(
              /<([0-9A-Fa-f]+)>|\((?:\\.|[^\\)])*\)|(-?\d+(?:\.\d+)?)/g,
            )) {
              if (item[2]) {
                const adj = parseFloat(item[2]);
                const dx = (-adj / 1000) * fontSize;
                if (adj < -1500) {
                  if (curText) {
                    frags.push({ x: runStartX, y: curY, text: curText });
                    curText = "";
                  }
                  runX += dx;
                  runStartX = runX;
                } else {
                  runX += dx;
                }
              } else if (item[1]) {
                const hex = item[1];
                for (let i = 0; i < hex.length; i += 4) {
                  const code = parseInt(hex.slice(i, i + 4), 16);
                  curText += f.cmap?.get(code) ?? "";
                  runX += fontSize * 0.55;
                }
              } else {
                const lit = item[0].slice(1, -1).replace(/\\([()\\])/g, "$1");
                if (f.type === "cid" && f.cmap) {
                  for (let i = 0; i < lit.length; i += 2) {
                    const code = (lit.charCodeAt(i) << 8) | (lit.charCodeAt(i + 1) || 0);
                    curText += f.cmap.get(code) ?? "";
                  }
                } else {
                  curText += lit;
                }
                runX += lit.length * fontSize * 0.5;
              }
            }
            if (curText) {
              frags.push({ x: runStartX, y: curY, text: curText });
            }
          }
        }
      }

      // Extract horizontal and vertical grid lines from the content stream
      const hLines: number[] = [];
      const tallRectXs: number[] = [];
      const allTallRectXs: number[] = [];
      for (const rm of content.matchAll(
        /([\d.]+)\s+([\d.]+)\s+m\s+([\d.]+)\s+([\d.]+)\s+l(?:\s+([\d.]+)\s+([\d.]+)\s+l)?/g,
      )) {
        const x1 = parseFloat(rm[1]);
        const y1 = parseFloat(rm[2]);
        const x2 = parseFloat(rm[3]);
        const y2 = parseFloat(rm[4]);
        if (Math.abs(y1 - y2) < 1 && Math.abs(x2 - x1) > 300) {
          hLines.push(y1);
        }
        if (rm[6] !== undefined) {
          const y3 = parseFloat(rm[6]);
          const h = Math.abs(y3 - y1);
          if (h > 30) {
            allTallRectXs.push(x1, x2);
            if (Math.max(y1, y3) > 400) {
              tallRectXs.push(x1, x2);
            }
          }
        }
      }
      const sortedHLines = [...new Set(hLines.map((y) => Math.round(y * 10) / 10))].sort(
        (a, b) => a - b,
      );

      const clusterXs = (xs: number[]): number[] => {
        const sorted = [...xs].sort((a, b) => a - b);
        const clusters: number[] = [];
        for (const x of sorted) {
          if (clusters.length === 0 || x - clusters[clusters.length - 1] > 8) {
            clusters.push(Math.round(x * 10) / 10);
          }
        }
        return clusters;
      };
      let vClusters = clusterXs(tallRectXs);
      if (vClusters.length < 5) {
        vClusters = clusterXs(allTallRectXs);
      }

      // Typical 5-column table has 6 vertical borders: [left, col1Max, col2Max, col3Max, col4Max, right]
      const col0Min = vClusters.length >= 5 ? vClusters[0] - 4 : 40;
      const col1Max = vClusters.length >= 5 ? vClusters[1] : 73.4;
      const col2Max = vClusters.length >= 5 ? vClusters[2] : 253.4;
      const col3Max = vClusters.length >= 5 ? vClusters[3] : 470.9;
      const col4Max = vClusters.length >= 5 ? vClusters[4] : 674.6;
      const summaryLeftMax = vClusters.length >= 5 ? vClusters[0] + 170 : 225;

      const assembleCell = (
        cellFrags: Array<{ x: number; y: number; text: string }>,
        mergeLines = true,
      ): string => {
        if (cellFrags.length === 0) return "";
        const sortedByY = [...cellFrags].sort((a, b) => a.y - b.y);
        const lines: Array<{ y: number; items: Array<{ x: number; text: string }> }> = [];
        for (const f of sortedByY) {
          const last = lines[lines.length - 1];
          if (!last || Math.abs(f.y - last.y) > 4.5) {
            lines.push({ y: f.y, items: [{ x: f.x, text: f.text }] });
          } else {
            last.items.push({ x: f.x, text: f.text });
          }
        }
        const cleanedLines = lines
          .map((l) => {
            const lineStr = l.items
              .sort((a, b) => a.x - b.x)
              .map((it) => it.text)
              .join("");
            return cleanTamil(lineStr, true);
          })
          .filter(Boolean);
        return mergeLines ? mergeWrappedLines(cleanedLines) : cleanedLines.join("\n");
      };

      // Detect table header / section mode changes on this page
      const pageLines = (() => {
        const sortedByY = [...frags].sort((a, b) => a.y - b.y);
        const lns: Array<{ y: number; text: string }> = [];
        const groups: Array<{ y: number; items: Array<{ x: number; text: string }> }> = [];
        for (const f of sortedByY) {
          const last = groups[groups.length - 1];
          if (!last || Math.abs(f.y - last.y) > 4.5) {
            groups.push({ y: f.y, items: [{ x: f.x, text: f.text }] });
          } else {
            last.items.push({ x: f.x, text: f.text });
          }
        }
        for (const g of groups) {
          const txt = cleanTamil(
            g.items
              .sort((a, b) => a.x - b.x)
              .map((it) => it.text)
              .join(""),
            true,
          );
          if (txt) lns.push({ y: g.y, text: txt });
        }
        return lns;
      })();

      const anchors = frags
        .filter((b) => b.x >= col0Min && b.x < col1Max && /^\d+$/.test(b.text.trim()))
        .map((b) => ({ id: Number(b.text.trim()), y: b.y }))
        .sort((a, b) => a.y - b.y);

      if (pIdx === 0 && anchors.length > 0) {
        const firstAnchorY = anchors[0].y;
        const leftSummaryFrags = frags.filter(
          (f) => f.y < firstAnchorY - 15 && f.x >= col0Min && f.x < summaryLeftMax,
        );
        const sortedByY = [...leftSummaryFrags].sort((a, b) => a.y - b.y);
        const sGroups: Array<{ y: number; items: Array<{ x: number; text: string }> }> = [];
        for (const f of sortedByY) {
          const last = sGroups[sGroups.length - 1];
          if (!last || Math.abs(f.y - last.y) > 4.5) {
            sGroups.push({ y: f.y, items: [{ x: f.x, text: f.text }] });
          } else {
            last.items.push({ x: f.x, text: f.text });
          }
        }
        const leftSummaryLines = sGroups.map((g) =>
          cleanTamil(
            g.items
              .sort((a, b) => a.x - b.x)
              .map((it) => it.text)
              .join(""),
            true,
          ),
        );
        const sb = extractSummaryBoxValues(leftSummaryLines);
        if (sb.income !== null) summaryIncome = sb.income;
        if (sb.expense !== null) summaryExpense = sb.expense;
        if (sb.balance !== null) summaryBalance = sb.balance;
      }

      for (let aIdx = 0; aIdx < anchors.length; aIdx++) {
        const anc = anchors[aIdx];
        for (const pl of pageLines) {
          if (pl.y < anc.y) {
            if (pl.text.includes("வருமானம் / நிதி") || pl.text.includes("நன்கொடையாளர்")) {
              mode = "donors";
            } else if (pl.text === "செலவுகள்" || pl.text.includes("பொறுப்புள்ள")) {
              mode = "expenses";
            }
          }
        }
        if (anc.id === 1 && donors.length > 0 && mode !== "expenses") {
          mode = "expenses";
        }
        if (mode === "summary") mode = "donors";

        const prevAncY = aIdx > 0 ? (anchors[aIdx - 1].y + anc.y) / 2 : anc.y - 20;
        const nextAncY = aIdx + 1 < anchors.length ? (anc.y + anchors[aIdx + 1].y) / 2 : anc.y + 20;
        const yTop =
          [...sortedHLines].reverse().find((h) => h < anc.y - 2) ?? prevAncY;
        const yBot = sortedHLines.find((h) => h > anc.y + 2) ?? nextAncY;

        const rowFrags = frags.filter((f) => f.x >= col1Max && f.y >= yTop && f.y <= yBot);
        const col2 = assembleCell(rowFrags.filter((f) => f.x < col2Max));
        const col3 = assembleCell(rowFrags.filter((f) => f.x >= col2Max && f.x < col3Max));
        const col4 = assembleCell(rowFrags.filter((f) => f.x >= col3Max && f.x < col4Max));
        const col5 = assembleCell(rowFrags.filter((f) => f.x >= col4Max), false);

        const numMatch = col5.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
        const amount = numMatch ? Number(numMatch[1]) : null;

        if (mode === "donors") {
          const donorNameTa = col2.replace(/\s+/g, " ").trim();
          const donorNameEn = translateText(donorNameTa, NAME_MAP);
          const streetTa = col3.replace(/\s+/g, " ").trim();
          const streetEn = translateText(streetTa, STREET_MAP);
          const descTaRaw = col4.trim();
          const hasDesc = Boolean(descTaRaw && descTaRaw !== "-");
          const descEnRaw = hasDesc ? translateText(descTaRaw, DONOR_DESC_MAP) : "";

          donors.push({
            id: anc.id,
            donorNameTa,
            donorNameEn,
            detailsTa: hasDesc ? `${streetTa} - ${descTaRaw}` : streetTa,
            detailsEn: hasDesc ? `${streetEn} - ${descEnRaw}` : streetEn,
            amount,
          });
        } else {
          const categoryTa = col2.replace(/\s+/g, " ").trim();
          const categoryEn = translateText(categoryTa, EXPENSE_CATEGORY_MAP);
          const detailsTa = col3.trim();
          const detailsEn = translateText(detailsTa, EXPENSE_DETAILS_MAP);
          const responsibleTa = col4.replace(/\s+/g, " ").trim();
          const responsibleEn = translateText(responsibleTa);

          expenses.push({
            id: anc.id,
            categoryTa,
            categoryEn,
            detailsTa,
            detailsEn,
            responsibleTa,
            responsibleEn,
            amount,
          });
        }
      }
    }

    if (donors.length === 0 && expenses.length === 0) {
      return null;
    }

    const uniqueDonors = Array.from(new Map(donors.map((d) => [d.id, d])).values()).sort(
      (a, b) => a.id - b.id,
    );
    const uniqueExpenses = Array.from(new Map(expenses.map((e) => [e.id, e])).values()).sort(
      (a, b) => a.id - b.id,
    );
    const calcIncome = uniqueDonors.reduce((sum, d) => sum + (d.amount || 0), 0);
    const calcExpense = uniqueExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalIncome = summaryIncome ?? calcIncome;
    const totalExpense = summaryExpense ?? calcExpense;
    const balance = summaryBalance ?? totalIncome - totalExpense;

    return {
      donors: uniqueDonors,
      expenses: uniqueExpenses,
      totalIncome,
      totalExpense,
      balance,
    };
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Excel (.xlsx) ZIP + XML Reader                                             */
/* -------------------------------------------------------------------------- */

function unzipEntries(buf: Buffer): Map<string, string> {
  const entries = new Map<string, string>();
  let offset = 0;
  while (offset + 30 <= buf.length) {
    const sig = buf.readUInt32LE(offset);
    if (sig !== 0x04034b50) break;
    const method = buf.readUInt16LE(offset + 8);
    const compSize = buf.readUInt32LE(offset + 18);
    const nameLen = buf.readUInt16LE(offset + 26);
    const extraLen = buf.readUInt16LE(offset + 28);
    const name = buf.subarray(offset + 30, offset + 30 + nameLen).toString("utf8");
    const dataStart = offset + 30 + nameLen + extraLen;
    const dataEnd = dataStart + compSize;
    if (dataEnd > buf.length) break;
    const rawSlice = buf.subarray(dataStart, dataEnd);
    try {
      const content =
        method === 0
          ? rawSlice.toString("utf8")
          : method === 8
            ? zlib.inflateRawSync(rawSlice).toString("utf8")
            : "";
      if (content) entries.set(name, content);
    } catch {
      // ignore unreadable entry
    }
    offset = dataEnd;
  }
  return entries;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
}

function colRefToIndex(ref: string): number {
  const letters = ref.replace(/[^A-Za-z]/g, "").toUpperCase();
  let idx = 0;
  for (let i = 0; i < letters.length; i++) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64);
  }
  return idx - 1;
}

export function parseBudgetXlsx(buf: Buffer): ParsedBudgetPdf | null {
  try {
    const files = unzipEntries(buf);
    const sharedXml = files.get("xl/sharedStrings.xml") || "";
    const sharedStrings: string[] = [];
    for (const si of sharedXml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)) {
      const parts = [...si[1].matchAll(/<t(?:\s+[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) =>
        decodeXmlEntities(m[1]),
      );
      sharedStrings.push(cleanTamil(parts.join("")));
    }

    const donors: DonorRecord[] = [];
    const expenses: ExpenseRecord[] = [];
    let summaryIncome: number | null = null;
    let summaryExpense: number | null = null;
    let summaryBalance: number | null = null;
    const summaryLeftColLines: string[] = [];
    let mode: "summary" | "donors" | "expenses" = "summary";

    const sheetNames = [...files.keys()]
      .filter((k) => /^xl\/worksheets\/sheet\d+\.xml$/.test(k))
      .sort((a, b) => {
        const na = Number(a.match(/sheet(\d+)/)?.[1] ?? 0);
        const nb = Number(b.match(/sheet(\d+)/)?.[1] ?? 0);
        return na - nb;
      });

    for (const sheetName of sheetNames) {
      const sheetXml = files.get(sheetName) || "";
      for (const rm of sheetXml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
        const rowBody = rm[1];
        const rawCells: string[] = [];
        let nextColIdx = 0;
        for (const cm of rowBody.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
          const attrs = cm[1];
          const inner = cm[2];
          const refMatch = attrs.match(/\br="([A-Za-z]+\d+)"/);
          const colIdx = refMatch ? colRefToIndex(refMatch[1]) : nextColIdx;
          nextColIdx = colIdx + 1;

          const typeMatch = attrs.match(/\bt="([^"]+)"/);
          const cellType = typeMatch ? typeMatch[1] : "n";
          let val = "";
          if (cellType === "s") {
            const vm = inner.match(/<v>(\d+)<\/v>/);
            if (vm) val = sharedStrings[Number(vm[1])] ?? "";
          } else if (cellType === "inlineStr") {
            val = [...inner.matchAll(/<t(?:\s+[^>]*)?>([\s\S]*?)<\/t>/g)]
              .map((x) => decodeXmlEntities(x[1]))
              .join("");
          } else {
            const vm = inner.match(/<v>([\s\S]*?)<\/v>/);
            if (vm) val = decodeXmlEntities(vm[1]);
          }
          if (val.trim()) rawCells[colIdx] = cleanTamil(val);
        }

        const nonEmpty = rawCells.filter(Boolean);
        if (nonEmpty.length === 0) continue;
        const joined = nonEmpty.join(" ");
        if (joined.includes("வருமானம் / நிதி") || joined.includes("நன்கொடையாளர்")) {
          mode = "donors";
          continue;
        }
        if (nonEmpty.some((c) => c === "செலவுகள்") || joined.includes("பொறுப்புள்ள")) {
          mode = "expenses";
          continue;
        }

        const firstIdx = rawCells.findIndex((c) => c !== undefined && c !== "");
        if (firstIdx < 0) continue;
        const idStr = rawCells[firstIdx] ?? "";
        if (mode === "summary") {
          if (idStr === "1" && nonEmpty.length >= 3 && rawCells[firstIdx + 1]) {
            mode = "donors";
          } else {
            if (firstIdx <= 1 && idStr) {
              summaryLeftColLines.push(...idStr.split("\n"));
            }
            continue;
          }
        }
        if (!/^\d+$/.test(idStr) || nonEmpty.length < 3) continue;
        const id = Number(idStr);
        if (id === 1 && donors.length > 0 && mode !== "expenses") {
          mode = "expenses";
        }

        const col2 = rawCells[firstIdx + 1] ?? "";
        const col3 = rawCells[firstIdx + 2] ?? "";
        const col4 = rawCells[firstIdx + 3] ?? "-";
        const col5 = rawCells[firstIdx + 4] ?? rawCells[rawCells.length - 1] ?? "";
        const numMatch = col5.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
        const amount = numMatch ? Number(numMatch[1]) : null;

        if (mode === "donors") {
          const donorNameTa = col2.replace(/\s+/g, " ").trim();
          const donorNameEn = translateText(donorNameTa, NAME_MAP);
          const streetTa = col3.replace(/\s+/g, " ").trim();
          const streetEn = translateText(streetTa, STREET_MAP);
          const descTaRaw = col4.trim();
          const hasDesc = Boolean(descTaRaw && descTaRaw !== "-");
          const descEnRaw = hasDesc ? translateText(descTaRaw, DONOR_DESC_MAP) : "";

          donors.push({
            id,
            donorNameTa,
            donorNameEn,
            detailsTa: hasDesc ? `${streetTa} - ${descTaRaw}` : streetTa,
            detailsEn: hasDesc ? `${streetEn} - ${descEnRaw}` : streetEn,
            amount,
          });
        } else {
          const categoryTa = col2.replace(/\s+/g, " ").trim();
          const categoryEn = translateText(categoryTa, EXPENSE_CATEGORY_MAP);
          const detailsTa = col3.trim();
          const detailsEn = translateText(detailsTa, EXPENSE_DETAILS_MAP);
          const responsibleTa = col4.replace(/\s+/g, " ").trim();
          const responsibleEn = translateText(responsibleTa);

          expenses.push({
            id,
            categoryTa,
            categoryEn,
            detailsTa,
            detailsEn,
            responsibleTa,
            responsibleEn,
            amount,
          });
        }
      }
    }

    if (donors.length === 0 && expenses.length === 0) return null;
    if (summaryLeftColLines.length > 0) {
      const sb = extractSummaryBoxValues(summaryLeftColLines);
      if (sb.income !== null) summaryIncome = sb.income;
      if (sb.expense !== null) summaryExpense = sb.expense;
      if (sb.balance !== null) summaryBalance = sb.balance;
    }
    const uniqueDonors = Array.from(new Map(donors.map((d) => [d.id, d])).values()).sort(
      (a, b) => a.id - b.id,
    );
    const uniqueExpenses = Array.from(new Map(expenses.map((e) => [e.id, e])).values()).sort(
      (a, b) => a.id - b.id,
    );
    const calcIncome = uniqueDonors.reduce((sum, d) => sum + (d.amount || 0), 0);
    const calcExpense = uniqueExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalIncome = summaryIncome ?? calcIncome;
    const totalExpense = summaryExpense ?? calcExpense;
    const balance = summaryBalance ?? totalIncome - totalExpense;
    return {
      donors: uniqueDonors,
      expenses: uniqueExpenses,
      totalIncome,
      totalExpense,
      balance,
    };
  } catch {
    return null;
  }
}

export function parseBudgetFile(buf: Buffer, filename?: string | null): ParsedBudgetPdf | null {
  const lower = (filename || "").toLowerCase();
  if (lower.endsWith(".xlsx")) return parseBudgetXlsx(buf);
  return parseBudgetPdf(buf);
}
