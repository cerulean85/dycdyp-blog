import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const prefix = "fixtures/admin-assets-load-test/";

async function main() {
  const beforeCount = await prisma.mediaAsset.count({
    where: {
      objectKey: {
        startsWith: prefix,
      },
    },
  });

  const result = await prisma.mediaAsset.deleteMany({
    where: {
      objectKey: {
        startsWith: prefix,
      },
    },
  });

  const remainingCount = await prisma.mediaAsset.count();

  console.log(
    JSON.stringify(
      {
        deleted: result.count,
        beforeCount,
        remainingCount,
        prefix,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
