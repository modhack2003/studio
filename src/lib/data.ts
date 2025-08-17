import { Github, Linkedin, Mail, FileText, type LucideIcon } from 'lucide-react';

export const personalData = {
  name: 'Bikram Dey',
  title: 'Cybersecurity Student & Enthusiast',
  bio: 'A passionate cybersecurity student with a knack for ethical hacking, penetration testing, and secure system design. I thrive on challenges and am constantly exploring the ever-evolving landscape of digital security. My goal is to leverage my skills to build a more secure digital world.',
  github: 'https://github.com/modhack2003',
  linkedin: 'https://www.linkedin.com/in/bikram-dey-/', // Placeholder
  email: 'bikramdey@example.com',
  resumeUrl: '/Bikram_Dey_Resume.pdf' // Placeholder
};

export interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

export const projects: Project[] = [
  {
    title: 'Vulnerability Scanner',
    description: 'A Python-based tool to scan web applications for common vulnerabilities like SQL Injection, XSS, and more. Features multi-threading for faster scans and generates detailed reports.',
    tags: ['Python', 'Web Security', 'Automation', 'Flask'],
    link: 'https://github.com/modhack2003/VulnerabilityScanner'
  },
  {
    title: 'Encrypted Chat Application',
    description: 'A secure peer-to-peer chat application using end-to-end encryption with RSA and AES algorithms, ensuring message confidentiality and integrity.',
    tags: ['Cryptography', 'Python', 'Networking', 'Security'],
  },
  {
    title: 'CTF Challenge Platform',
    description: 'Developed a Capture The Flag platform with various challenges in web, crypto, and forensics. Built with Django and Docker for easy deployment and scalability.',
    tags: ['Django', 'Docker', 'CTF', 'Full Stack'],
    link: 'https://github.com/modhack2003/CTF-Platform'
  },
  {
    title: 'Phishing Detector',
    description: 'A browser extension that uses machine learning to detect and warn users about potential phishing websites in real-time.',
    tags: ['Machine Learning', 'JavaScript', 'Browser Extension', 'Cybersecurity'],
  },
];

export const skills = {
  languages: ['Python', 'JavaScript', 'Bash', 'C++', 'SQL'],
  tools: ['Nmap', 'Wireshark', 'Metasploit', 'Burp Suite', 'Docker', 'Git'],
  areas: ['Penetration Testing', 'Network Security', 'Cryptography', 'Digital Forensics', 'Secure Coding'],
};

export interface Certificate {
  name: string;
  issuer: string;
  year: number;
}
export const certificates: Certificate[] = [
    { name: 'Certified Ethical Hacker (CEH)', issuer: 'EC-Council', year: 2023 },
    { name: 'CompTIA Security+', issuer: 'CompTIA', year: 2022 },
];

export interface Education {
    institution: string;
    degree: string;
    duration: string;
}

export const education: Education[] = [
    { institution: 'Techno India University', degree: 'B.Tech in Computer Science (Cybersecurity)', duration: '2021 - 2025'}
]

export interface ContactLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const contactLinks: ContactLink[] = [
  { label: 'GitHub', href: personalData.github, icon: Github },
  { label: 'LinkedIn', href: personalData.linkedin, icon: Linkedin },
  { label: 'Email', href: `mailto:${personalData.email}`, icon: Mail },
  { label: 'Resume', href: personalData.resumeUrl, icon: FileText },
];
