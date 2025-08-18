'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, Briefcase, Award, GraduationCap, FileText, Wrench, Menu, PlusCircle, Trash2 } from 'lucide-react';
import PixelCard from './pixel-card';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

// Define types for the data
interface PersonalData {
  id: string;
  name: string;
  title: string;
  bio: string;
  github: string;
  linkedin: string;
  email: string;
  resumeUrl: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  year: number;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  duration: string;
}

interface Skills {
  id: string;
  languages: string[];
  tools: string[];
  areas: string[];
}

export function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skills | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    fetch('/api/personal-data').then(res => res.json()).then(setPersonalData);
    fetch('/api/projects').then(res => res.json()).then(setProjects);
    fetch('/api/certificates').then(res => res.json()).then(setCertificates);
    fetch('/api/education').then(res => res.json()).then(setEducation);
    fetch('/api/skills').then(res => res.json()).then(setSkills);
  }, []);

  const handleSave = async (section: string, data: any, id?: string) => {
    let url = `/api/${section}`;
    let method = 'POST'; // Default to POST

    if (section === 'personal-data' || section === 'skills') {
      method = 'PUT'; // Always PUT for singletons like personal-data and skills
    } else if (id) {
      url = `/api/${section}/${id}`;
      method = 'PUT'; // PUT for updates to specific items
    }
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      toast({ title: `${section} updated successfully!` });
      return result;
    } catch (error) {
      toast({ title: `Error updating ${section}`, variant: 'destructive' });
    }
  };
  
  const handleDelete = async (section: string, id: string) => {
    try {
      await fetch(`/api/${section}/${id}`, {
        method: 'DELETE',
      });
      toast({ title: `${section} deleted successfully!` });
      if (section === 'projects') setProjects(projects.filter(p => p.id !== id));
      if (section === 'certificates') setCertificates(certificates.filter(c => c.id !== id));
      if (section === 'education') setEducation(education.filter(e => e.id !== id));
    } catch (error) {
      toast({ title: `Error deleting ${section}`, variant: 'destructive' });
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append('file', resumeFile);

    try {
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setPersonalData(prev => prev ? { ...prev, resumeUrl: data.resumeUrl } : null);
      toast({ title: 'Resume uploaded successfully!' });
    } catch (error) {
      toast({ title: 'Error uploading resume', variant: 'destructive' });
    }
  };

  const navLinks = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'education', label: 'Study', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'resume', label: 'Resume', icon: FileText },
  ];

  return (
    <PixelCard className="w-full">
      <div className="bg-transparent p-6 rounded-sm">
        <CardHeader>
          <CardTitle className="text-3xl text-glow font-headline">Admin Dashboard</CardTitle>
          <CardDescription>Manage your portfolio content from this centralized interface.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="md:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline"><Menu className="w-4 h-4 mr-2"/> Menu</Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="flex flex-col space-y-2 mt-4">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.id}>
                        <Button
                          variant={activeTab === link.id ? 'default' : 'ghost'}
                          onClick={() => setActiveTab(link.id)}
                          className="justify-start"
                        >
                          <link.icon className="w-4 h-4 mr-2"/>
                          {link.label}
                        </Button>
                      </SheetClose>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <TabsList className="hidden md:flex w-full overflow-x-auto bg-background/50">
              {navLinks.map((link) => (
                <TabsTrigger value={link.id} key={link.id}>
                  <link.icon className="w-4 h-4 mr-2"/>
                  {link.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="profile" className="mt-4">
              <PixelCard>
                <div className="bg-background/80 p-6 rounded-sm">
                  <CardHeader>
                    <CardTitle>Contact & Bio</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                  </CardHeader>
                  {personalData && (
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={personalData.name} onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={personalData.title} onChange={(e) => setPersonalData({ ...personalData, title: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" value={personalData.bio} onChange={(e) => setPersonalData({ ...personalData, bio: e.target.value })} className="h-32" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub URL</Label>
                        <Input id="github" value={personalData.github} onChange={(e) => setPersonalData({ ...personalData, github: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn URL</Label>
                        <Input id="linkedin" value={personalData.linkedin} onChange={(e) => setPersonalData({ ...personalData, linkedin: e.target.value })} />
                      </div>
                    </CardContent>
                  )}
                  <Button className="m-6 mt-0" onClick={() => handleSave('personal-data', personalData, personalData?.id)}>Save Changes</Button>
                </div>
              </PixelCard>
            </TabsContent>

            <TabsContent value="projects" className="mt-4">
              <PixelCard>
                <div className="bg-background/80 p-6 rounded-sm">
                  <CardHeader>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>Add or edit your project listings.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {projects.map((project, index) => (
                      <div key={project.id} className="space-y-2 border-b border-primary/20 pb-4">
                        <Label htmlFor={`project-title-${index}`}>Project Title</Label>
                        <Input id={`project-title-${index}`} value={project.title} onChange={(e) => setProjects(projects.map(p => p.id === project.id ? {...p, title: e.target.value} : p))} />
                        <Label htmlFor={`project-desc-${index}`}>Description</Label>
                        <Textarea id={`project-desc-${index}`} value={project.description} onChange={(e) => setProjects(projects.map(p => p.id === project.id ? {...p, description: e.target.value} : p))} />
                        <Label htmlFor={`project-tags-${index}`}>Tags (comma separated)</Label>
                        <Input id={`project-tags-${index}`} value={project.tags.join(', ')} onChange={(e) => setProjects(projects.map(p => p.id === project.id ? {...p, tags: e.target.value.split(',').map(t => t.trim())} : p))} />
                        <div className="flex justify-end space-x-2">
                          <Button onClick={() => handleSave('projects', project, project.id)}>Save</Button>
                          <Button variant="destructive" onClick={() => handleDelete('projects', project.id)}><Trash2 className="w-4 h-4"/></Button>
                        </div>
                      </div>
                    ))}
                    <Button onClick={async () => {
                      const newProject = await handleSave('projects', {title: 'New Project', description: '', tags: []});
                      setProjects([...projects, newProject]);
                    }}><PlusCircle className="w-4 h-4 mr-2"/>Add Project</Button>
                  </CardContent>
                </div>
              </PixelCard>
            </TabsContent>
            
            <TabsContent value="certificates" className="mt-4">
              <PixelCard>
                <div className="bg-background/80 p-6 rounded-sm">
                  <CardHeader>
                    <CardTitle>Certificates</CardTitle>
                    <CardDescription>Manage your certifications.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {certificates.map((cert, index) => (
                      <div key={cert.id} className="space-y-2 border-b border-primary/20 pb-4">
                        <Label htmlFor={`cert-name-${index}`}>Certificate Name</Label>
                        <Input id={`cert-name-${index}`} value={cert.name} onChange={(e) => setCertificates(certificates.map(c => c.id === cert.id ? {...c, name: e.target.value} : c))} />
                        <Label htmlFor={`cert-issuer-${index}`}>Issuer</Label>
                        <Input id={`cert-issuer-${index}`} value={cert.issuer} onChange={(e) => setCertificates(certificates.map(c => c.id === cert.id ? {...c, issuer: e.target.value} : c))} />
                        <Label htmlFor={`cert-year-${index}`}>Year</Label>
                        <Input id={`cert-year-${index}`} type="number" value={cert.year} onChange={(e) => setCertificates(certificates.map(c => c.id === cert.id ? {...c, year: parseInt(e.target.value)} : c))} />
                        <div className="flex justify-end space-x-2">
                          <Button onClick={() => handleSave('certificates', cert, cert.id)}>Save</Button>
                          <Button variant="destructive" onClick={() => handleDelete('certificates', cert.id)}><Trash2 className="w-4 h-4"/></Button>
                        </div>
                      </div>
                    ))}
                    <Button onClick={async () => {
                      const newCert = await handleSave('certificates', {name: 'New Certificate', issuer: '', year: new Date().getFullYear()});
                      setCertificates([...certificates, newCert]);
                    }}><PlusCircle className="w-4 h-4 mr-2"/>Add Certificate</Button>
                  </CardContent>
                </div>
              </PixelCard>
            </TabsContent>

            <TabsContent value="education" className="mt-4">
              <PixelCard>
                <div className="bg-background/80 p-6 rounded-sm">
                  <CardHeader>
                    <CardTitle>Study Information</CardTitle>
                    <CardDescription>Update your educational background.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {education.map((edu, index) => (
                      <div key={edu.id} className="space-y-2 border-b border-primary/20 pb-4">
                        <Label htmlFor={`edu-inst-${index}`}>Institution</Label>
                        <Input id={`edu-inst-${index}`} value={edu.institution} onChange={(e) => setEducation(education.map(ed => ed.id === edu.id ? {...ed, institution: e.target.value} : ed))} />
                        <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                        <Input id={`edu-degree-${index}`} value={edu.degree} onChange={(e) => setEducation(education.map(ed => ed.id === edu.id ? {...ed, degree: e.target.value} : ed))} />
                        <Label htmlFor={`edu-duration-${index}`}>Duration</Label>
                        <Input id={`edu-duration-${index}`} value={edu.duration} onChange={(e) => setEducation(education.map(ed => ed.id === edu.id ? {...ed, duration: e.target.value} : ed))} />
                        <div className="flex justify-end space-x-2">
                          <Button onClick={() => handleSave('education', edu, edu.id)}>Save</Button>
                          <Button variant="destructive" onClick={() => handleDelete('education', edu.id)}><Trash2 className="w-4 h-4"/></Button>
                        </div>
                      </div>
                    ))}
                    <Button onClick={async () => {
                      const newEdu = await handleSave('education', {institution: 'New Institution', degree: '', duration: ''});
                      setEducation([...education, newEdu]);
                    }}><PlusCircle className="w-4 h-4 mr-2"/>Add Education</Button>
                  </CardContent>
                </div>
              </PixelCard>
            </TabsContent>

            <TabsContent value="skills" className="mt-4">
              <PixelCard>
                <div className="bg-background/80 p-6 rounded-sm">
                  <CardHeader>
                    <CardTitle>Skills & Expertise</CardTitle>
                    <CardDescription>Update your skills. Use comma-separated values.</CardDescription>
                  </CardHeader>
                  {skills && (
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="languages">Languages</Label>
                        <Textarea id="languages" value={skills.languages.join(', ')} onChange={(e) => setSkills({ ...skills, languages: e.target.value.split(',').map(t => t.trim()) })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tools">Tools & Technologies</Label>
                        <Textarea id="tools" value={skills.tools.join(', ')} onChange={(e) => setSkills({ ...skills, tools: e.target.value.split(',').map(t => t.trim()) })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="areas">Areas of Expertise</Label>
                        <Textarea id="areas" value={skills.areas.join(', ')} onChange={(e) => setSkills({ ...skills, areas: e.target.value.split(',').map(t => t.trim()) })} />
                      </div>
                    </CardContent>
                  )}
                  <Button className="m-6 mt-0" onClick={() => handleSave('skills', skills, skills?.id)}>Save Changes</Button>
                </div>
              </PixelCard>
            </TabsContent>
            
            <TabsContent value="resume" className="mt-4">
              <PixelCard>
                <div className="bg-background/80 p-6 rounded-sm">
                  <CardHeader>
                    <CardTitle>Resume PDF</CardTitle>
                    <CardDescription>Upload a new version of your resume.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resume-file">Resume PDF File</Label>
                      <Input id="resume-file" type="file" onChange={(e) => setResumeFile(e.target.files ? e.target.files[0] : null)} className="file:text-primary file:font-semibold"/>
                    </div>
                    {personalData?.resumeUrl && (
                      <p className="text-sm text-muted-foreground">Current file: <Link href={personalData.resumeUrl} className="text-accent underline">{personalData.resumeUrl.split('/').pop()}</Link></p>
                    )}
                  </CardContent>
                  <Button className="m-6 mt-0" onClick={handleResumeUpload}>Upload New Resume</Button>
                </div>
              </PixelCard>
            </TabsContent>

          </Tabs>
        </CardContent>
      </div>
    </PixelCard>
  );
}