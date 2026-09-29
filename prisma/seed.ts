import { PrismaClient } from '@prisma/client';

/**
 * Sample data for LOCAL development only.
 * Refuses to touch a database that already has a profile unless SEED_FORCE=true,
 * so running it against production by accident is harmless.
 */
const prisma = new PrismaClient();

async function main() {
  const force = process.env.SEED_FORCE === 'true';
  const existing = await prisma.personalData.count();
  if (existing > 0 && !force) {
    console.log('Database already has data — seed skipped (set SEED_FORCE=true to wipe and re-seed sample data).');
    return;
  }

  console.log('Start seeding ...');

  if (force) {
    await prisma.personalData.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.certificate.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.ctfEvent.deleteMany({});
    await prisma.experience.deleteMany({});
  }

  const personal = await prisma.personalData.create({
    data: {
      name: 'Bikram Dey',
      title: 'Cybersecurity Analyst & Penetration Tester',
      bio: 'Cybersecurity professional focusing on offensive security, vulnerability assessment, and secure architecture.',
      github: 'https://github.com/modhack2003',
      linkedin: 'https://www.linkedin.com/in/bikram-dey-700452997020031312/',
      email: 'bikram20031213dey@gmail.com',
      resumeUrl: '',
    },
  });
  console.log(`Created personal data for: ${personal.name}`);

  const createdProjects = await prisma.project.createMany({
    data: [
      { title: 'Network Vulnerability Scanner', description: 'Automated network vuln scanner using Python and Nmap.', tags: ['Python', 'Nmap', 'Security'] },
      { title: 'Phishing Detection System', description: 'AI-powered phishing detection for email content and URLs.', tags: ['Python', 'ML', 'Email Security'] },
    ],
  });
  console.log(`Created ${createdProjects.count} projects.`);

  await prisma.skill.create({
    data: {
      languages: ['Python', 'JavaScript', 'Bash'],
      tools: ['Burp Suite', 'Wireshark', 'Nmap', 'Metasploit'],
      areas: ['Penetration Testing', 'Web Security', 'Network Security'],
    },
  });
  console.log('Created skills.');

  const createdCertificates = await prisma.certificate.createMany({
    data: [
      { name: 'CompTIA Security+', issuer: 'CompTIA', year: 2023 },
      { name: 'CEH', issuer: 'EC-Council', year: 2024 },
    ],
  });
  console.log(`Created ${createdCertificates.count} certificates.`);

  const createdEducation = await prisma.education.createMany({
    data: [{ institution: 'University of Technology', degree: 'B.Sc. Cybersecurity', duration: '2020 - 2024' }],
  });
  console.log(`Created ${createdEducation.count} education entries.`);

  const createdCtf = await prisma.ctfEvent.createMany({
    data: [
      { name: 'Hack The Box University CTF', organizer: 'Hack The Box', date: new Date('2024-11-18'), placement: 'Top 10%', team: 'CyberFortress', categories: ['Web', 'Forensics', 'Crypto'], points: 1450 },
      { name: 'picoCTF', organizer: 'CMU', date: new Date('2024-03-25'), placement: 'Top 5%', team: 'Solo', categories: ['General Skills', 'Web'], points: 980 },
    ],
  });
  console.log(`Created ${createdCtf.count} CTF events.`);

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
