/**
 * Prisma Database Seed Script
 *
 * Run with: npm run db:seed
 *
 * This script seeds sample data for 2023-2026 for development.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log("🌱 Starting database seed...");

  // Seed Admin User
  await prisma.user.upsert({
    where: { email: "admin@sakthivinayagar.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@sakthivinayagar.com",
      password: "hashed_password", // Placeholder
      role: "SUPER_ADMIN",
    },
  });

  // Seed Temple Settings
  const existingSettings = await prisma.templeSettings.findFirst();
  if (!existingSettings) {
    await prisma.templeSettings.create({
      data: {
        templeNameEn: "Sakthi Vinayagar Temple",
        templeNameTa: "சக்தி விநாயகர் கோயில்",
        addressEn: "123 Temple Street, City",
        addressTa: "123 கோயில் தெரு, நகரம்",
        phone: "+91 9876543210",
        email: "contact@sakthivinayagar.com",
      },
    });
  }

  // Seed Organizers (Delete existing to avoid duplicates if run multiple times)
  await prisma.organizer.deleteMany({});
  await Promise.all([
    prisma.organizer.create({
      data: {
        name: "Kumar",
        roleEn: "President",
        roleTa: "தலைவர்",
        phone: "+91 9876543211",
      }
    }),
    prisma.organizer.create({
      data: {
        name: "Ravi",
        roleEn: "Secretary",
        roleTa: "செயலாளர்",
        phone: "+91 9876543212",
      }
    }),
  ]);

  // Seed Expense Categories (Delete existing)
  await prisma.expenseCategory.deleteMany({});
  const expenseCategories = await Promise.all([
    prisma.expenseCategory.create({ data: { nameEn: "Pooja Items", nameTa: "பூஜை பொருட்கள்" } }),
    prisma.expenseCategory.create({ data: { nameEn: "Food / Annadhanam", nameTa: "அன்னதானம்" } }),
    prisma.expenseCategory.create({ data: { nameEn: "Decoration", nameTa: "அலங்காரம்" } }),
    prisma.expenseCategory.create({ data: { nameEn: "Prizes", nameTa: "பரிசுகள்" } }),
  ]);

  // Seed 4 Years (2023-2026)
  const years = [2023, 2024, 2025, 2026];
  for (const year of years) {
    const festival = await prisma.festivalYear.upsert({
      where: { year },
      update: {},
      create: {
        year,
        titleEn: `Vinayagar Chaturthi ${year}`,
        titleTa: `விநாயகர் சதுர்த்தி ${year}`,
        descriptionEn: `Annual Vinayagar Chaturthi Celebrations for ${year}`,
        descriptionTa: `${year} ஆம் ஆண்டு விநாயகர் சதுர்த்தி விழா`,
        startDate: new Date(`${year}-09-01T00:00:00.000Z`),
        endDate: new Date(`${year}-09-10T23:59:59.000Z`),
      },
    });

    // We clear dependent data for the festival year to avoid duplicates on re-seed
    await prisma.event.deleteMany({ where: { festivalYearId: festival.id }});
    await prisma.poojaSchedule.deleteMany({ where: { festivalYearId: festival.id }});
    await prisma.winner.deleteMany({ where: { festivalYearId: festival.id }});
    await prisma.galleryAlbum.deleteMany({ where: { festivalYearId: festival.id }});
    await prisma.video.deleteMany({ where: { festivalYearId: festival.id }});
    await prisma.invitation.deleteMany({ where: { festivalYearId: festival.id }});
    await prisma.expense.deleteMany({ where: { festivalYearId: festival.id }});
    await prisma.donation.deleteMany({ where: { festivalYearId: festival.id }});

    // Sample Event
    const event1 = await prisma.event.create({
      data: {
        festivalYearId: festival.id,
        date: new Date(`${year}-09-02T18:00:00.000Z`),
        time: "6:00 PM",
        titleEn: "Cultural Dance",
        titleTa: "கலை நிகழ்ச்சி",
        eventType: "CULTURAL",
        location: "Temple Ground",
      }
    });

    // Sample Pooja
    await prisma.poojaSchedule.create({
      data: {
        festivalYearId: festival.id,
        date: new Date(`${year}-09-01T06:00:00.000Z`),
        time: "6:00 AM",
        titleEn: "Maha Ganapathy Homam",
        titleTa: "மகா கணபதி ஹோமம்",
      }
    });

    // Sample Winner
    await prisma.winner.create({
      data: {
        festivalYearId: festival.id,
        eventId: event1.id,
        name: "Student A",
        categoryEn: "Drawing",
        categoryTa: "ஓவியம்",
        position: "1st",
        prizeEn: "Shield",
        prizeTa: "கேடயம்",
      }
    });

    // Sample Album & Item
    const album = await prisma.galleryAlbum.create({
      data: {
        festivalYearId: festival.id,
        titleEn: `Celebrations ${year}`,
        titleTa: `விழா ${year}`,
      }
    });
    
    await prisma.galleryItem.create({
      data: {
        albumId: album.id,
        imageUrl: "https://example.com/placeholder.jpg",
        titleEn: "Opening Ceremony",
        titleTa: "தொடக்க விழா",
      }
    });

    // Sample Video
    await prisma.video.create({
      data: {
        festivalYearId: festival.id,
        titleEn: `Highlights ${year}`,
        titleTa: `சிறப்பம்சங்கள் ${year}`,
        videoUrl: "https://youtube.com/watch?v=placeholder",
      }
    });

    // Sample Invitation
    await prisma.invitation.create({
      data: {
        festivalYearId: festival.id,
        titleEn: `Invitation ${year}`,
        titleTa: `அழைப்பிதழ் ${year}`,
        imageUrl: "https://example.com/invitation.jpg",
      }
    });

    // Sample Expense
    await prisma.expense.create({
      data: {
        festivalYearId: festival.id,
        categoryId: expenseCategories[0].id,
        descriptionEn: "Pooja Flowers",
        descriptionTa: "பூஜை பூக்கள்",
        amount: 5000.00,
        expenseDate: new Date(`${year}-09-01T10:00:00.000Z`),
      }
    });

    // Sample Donation
    await prisma.donation.create({
      data: {
        festivalYearId: festival.id,
        donorName: "Devotee X",
        amount: 10000.00,
        paymentMethod: "CASH",
        status: "COMPLETED",
        donatedAt: new Date(`${year}-08-20T10:00:00.000Z`),
      }
    });
  }

  console.log("✅ Database seed completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error: unknown) => {
    console.error("❌ Seed failed:", error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
