import { db, pool } from "./index";
import { donorsTable, bloodStockTable, bloodRequestsTable, bloodBagsTable } from "./schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(bloodRequestsTable);
  await db.delete(bloodBagsTable);
  await db.delete(donorsTable);
  await db.delete(bloodStockTable);

  // 1. Seed Blood Stock (8 blood groups)
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const stockData = bloodGroups.map((bg) => ({
    blood_group: bg,
    units_available: Math.floor(Math.random() * 20) + 5, // 5 to 25 units
  }));

  console.log("Inserting blood stock...");
  await db.insert(bloodStockTable).values(stockData);

  // 1.5. Seed Blood Bags based on stock (to have dates for expiry dashboard)
  const bagsData: any[] = [];
  for (const { blood_group, units_available } of stockData) {
    for (let i = 0; i < units_available; i++) {
        // Random donation date between now and 30 days ago
        const randomDaysAgo = Math.floor(Math.random() * 30);
        const donationDate = new Date();
        donationDate.setDate(donationDate.getDate() - randomDaysAgo);
        bagsData.push({
            blood_group,
            donation_date: donationDate
        });
    }
  }
  
  if (bagsData.length > 0) {
      console.log(`Inserting ${bagsData.length} blood bags...`);
      await db.insert(bloodBagsTable).values(bagsData);
  }

  // 2. Seed Donors (8 donors)
  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai"];
  const donorsData = [
    { name: "John Doe", age: 30, blood_group: "O+", phone: "9876543210", email: "john@example.com", weight: "75.5", city: "Mumbai", status: "Eligible" as const },
    { name: "Jane Smith", age: 25, blood_group: "A-", phone: "9876543211", email: "jane@example.com", weight: "62.0", city: "Delhi", status: "Eligible" as const },
    { name: "Michael Owen", age: 35, blood_group: "B+", phone: "9876543212", email: "michael@example.com", weight: "82.3", city: "Bangalore", status: "Pending" as const },
    { name: "Emily Watson", age: 28, blood_group: "AB+", phone: "9876543213", email: "emily@example.com", weight: "58.5", city: "Hyderabad", status: "Eligible" as const },
    { name: "Chris Evans", age: 40, blood_group: "O-", phone: "9876543214", email: "chris@example.com", weight: "88.0", city: "Chennai", status: "Deferred" as const },
    { name: "Sarah J", age: 24, blood_group: "A+", phone: "9876543215", email: "sarah@example.com", weight: "55.2", city: "Mumbai", status: "Eligible" as const },
    { name: "David Beck", age: 33, blood_group: "B-", phone: "9876543216", email: "david@example.com", weight: "77.1", city: "Delhi", status: "Rejected" as const },
    { name: "Laura Palmer", age: 29, blood_group: "AB-", phone: "9876543217", email: "laura@example.com", weight: "60.4", city: "Bangalore", status: "Pending" as const },
  ];

  console.log("Inserting donors...");
  await db.insert(donorsTable).values(donorsData);

  // 3. Seed Blood Requests (3 requests)
  const requestsData = [
    { patient_name: "Robert Brown", blood_group: "O+", units_required: 2, hospital_name: "City Hospital", contact_number: "9998887771", city: "Mumbai" },
    { patient_name: "Alice Green", blood_group: "A-", units_required: 1, hospital_name: "Metro Clinic", contact_number: "9998887772", city: "Delhi" },
    { patient_name: "Tom Hardy", blood_group: "B+", units_required: 3, hospital_name: "Sunrise Medical", contact_number: "9998887773", city: "Bangalore" },
  ];

  console.log("Inserting blood requests...");
  await db.insert(bloodRequestsTable).values(requestsData);

  console.log("Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
