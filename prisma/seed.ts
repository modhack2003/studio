import { PrismaClient } from '@prisma/client';

// For local development, you can use a MongoDB Atlas connection or local MongoDB
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL 
    }
  }
});

async function main() {
  console.log('Start seeding ...');

  // Clear existing data
  await prisma.personalData.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.education.deleteMany({});
  await prisma.ctfEvent.deleteMany({});

  // Seed PersonalData (sample)
  const personal = await prisma.personalData.create({
    data: {
      name: 'Bikram Dey',
      title: 'Cybersecurity Analyst & Penetration Tester',
      bio: 'Cybersecurity professional focusing on offensive security, vulnerability assessment, and secure architecture.',
      github: 'https://github.com/modhack2003',
      linkedin: 'https://linkedin.com/in/bikramdey',
      email: 'bikram20031213dey@gmail.com',
      resumeUrl: '/resume/bikram-dey-resume.pdf',
    },
  });
  console.log(`Created personal data for: ${personal.name}`);

  // Seed Projects (sample)
  const createdProjects = await prisma.project.createMany({
    data: [
      { title: 'Network Vulnerability Scanner', description: 'Automated network vuln scanner using Python and Nmap.', tags: ['Python', 'Nmap', 'Security'], link: 'https://github.com/modhack2003/network-vuln-scanner' },
      { title: 'Phishing Detection System', description: 'AI-powered phishing detection for email content and URLs.', tags: ['Python', 'ML', 'Email Security'] },
    ],
  });
  console.log(`Created ${createdProjects.count} projects.`);

  // Seed Skills (sample)
  const createdSkills = await prisma.skill.create({
    data: {
      languages: ['Python', 'JavaScript', 'Bash'],
      tools: ['Burp Suite', 'Wireshark', 'Nmap', 'Metasploit'],
      areas: ['Penetration Testing', 'Web Security', 'Network Security'],
    },
  });
  console.log(`Created skills.`);

  // Seed Certificates (sample)
  const createdCertificates = await prisma.certificate.createMany({
    data: [
      { name: 'CompTIA Security+', issuer: 'CompTIA', year: 2023 },
      { name: 'CEH', issuer: 'EC-Council', year: 2024 },
    ],
  });
  console.log(`Created ${createdCertificates.count} certificates.`);

  // Seed Education (sample)
  const createdEducation = await prisma.education.createMany({
    data: [
      { institution: 'University of Technology', degree: 'B.Sc. Cybersecurity', duration: '2020 - 2024' },
    ],
  });
  console.log(`Created ${createdEducation.count} education entries.`);

  // Seed CTF Events (sample)
  const createdCtf = await prisma.ctfEvent.createMany({
    data: [
      { name: 'Hack The Box University CTF', organizer: 'Hack The Box', date: new Date('2024-11-18'), placement: 'Top 10%', team: 'CyberFortress', categories: ['Web', 'Forensics', 'Crypto'], points: 1450, writeupUrl: 'https://example.com/writeups/htb-unictf-2024' },
      { name: 'picoCTF', organizer: 'CMU', date: new Date('2024-03-25'), placement: 'Top 5%', team: 'Solo', categories: ['General Skills', 'Web'], points: 980 },
    ],
  });
  console.log(`Created ${createdCtf.count} CTF events.`);
  console.log(`Created ${createdEducation.count} education entries.`);

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