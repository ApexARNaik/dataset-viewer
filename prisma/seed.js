const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const teammates = [
  { name: "atu", passcode: "pass1" },
  { name: "saha", passcode: "pass2" },
  { name: "mich", passcode: "pass3" },
  { name: "hars", passcode: "pass4" },
  { name: "pree", passcode: "pass5" },
];

async function main() {
  console.log("Seeding teammates...");

  for (const teammate of teammates) {
    await prisma.teammate.upsert({
      where: { name: teammate.name },
      update: {},
      create: teammate,
    });
    console.log(`Created/Updated teammate: ${teammate.name}`);
  }

  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
