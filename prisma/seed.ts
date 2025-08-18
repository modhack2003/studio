import { PrismaClient } from '@prisma/client';
// import { personalData, projects, certificates, education, skills } from '../src/lib/data';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Seed PersonalData
  // await prisma.personalData.deleteMany({});
  // const personal = await prisma.personalData.create({
  //   data: personalData,
  // });
  // console.log(`Created personal data for: ${personal.name}`);

  // Seed Projects
  // await prisma.project.deleteMany({});
  // const createdProjects = await prisma.project.createMany({
  //   data: projects,
  // });
  // console.log(`Created ${createdProjects.count} projects.`);

  // Seed Skills
  // await prisma.skill.deleteMany({});
  // const createdSkills = await prisma.skill.create({
  //   data: skills,
  // });
  // console.log(`Created skills.`);

  // Seed Certificates
  // await prisma.certificate.deleteMany({});
  // const createdCertificates = await prisma.certificate.createMany({
  //   data: certificates,
  // });
  // console.log(`Created ${createdCertificates.count} certificates.`);

  // Seed Education
  // await prisma.education.deleteMany({});
  // const createdEducation = await prisma.education.createMany({
  //   data: education,
  // });
  // console.log(`Created ${createdEducation.count} education entries.`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });