'use client';

import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { personalData, projects, certificates, education, skills } from '@/lib/data';
import { User, Briefcase, Award, GraduationCap, FileText, Wrench } from 'lucide-react';
import PixelCard from './pixel-card';

export function AdminDashboard() {
  const { toast } = useToast();

  const handleSave = (section: string) => {
    toast({
      title: `Saving ${section}`,
      description: 'In a real app, this would save the data. For now, it\'s just a demo.',
    });
  };
  
  return (
    <PixelCard className="w-full">
      <div className="bg-transparent p-6 rounded-sm">
      <CardHeader>
        <CardTitle className="text-3xl text-glow font-headline">Admin Dashboard</CardTitle>
        <CardDescription>Manage your portfolio content from this centralized interface.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-background/50">
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-2"/>Profile</TabsTrigger>
            <TabsTrigger value="projects"><Briefcase className="w-4 h-4 mr-2"/>Projects</TabsTrigger>
            <TabsTrigger value="certificates"><Award className="w-4 h-4 mr-2"/>Certificates</TabsTrigger>
            <TabsTrigger value="education"><GraduationCap className="w-4 h-4 mr-2"/>Study</TabsTrigger>
            <TabsTrigger value="skills"><Wrench className="w-4 h-4 mr-2"/>Skills</TabsTrigger>
            <TabsTrigger value="resume"><FileText className="w-4 h-4 mr-2"/>Resume</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-4">
            <PixelCard>
              <div className="bg-background/80 p-6 rounded-sm">
                <CardHeader>
                  <CardTitle>Contact & Bio</CardTitle>
                  <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue={personalData.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" defaultValue={personalData.title} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" defaultValue={personalData.bio} className="h-32" />
                  </div>
                    <div className="space-y-2">
                    <Label htmlFor="github">GitHub URL</Label>
                    <Input id="github" defaultValue={personalData.github} />
                  </div>
                    <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input id="linkedin" defaultValue={personalData.linkedin} />
                  </div>
                </CardContent>
                <Button className="m-6 mt-0" onClick={() => handleSave('Profile')}>Save Changes</Button>
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
                  <div key={index} className="space-y-2 border-b border-primary/20 pb-4">
                    <Label htmlFor={`project-title-${index}`}>Project Title</Label>
                    <Input id={`project-title-${index}`} defaultValue={project.title} />
                    <Label htmlFor={`project-desc-${index}`}>Description</Label>
                    <Textarea id={`project-desc-${index}`} defaultValue={project.description} />
                      <Label htmlFor={`project-tags-${index}`}>Tags (comma separated)</Label>
                    <Input id={`project-tags-${index}`} defaultValue={project.tags.join(', ')} />
                  </div>
                ))}
              </CardContent>
              <Button className="m-6 mt-0" onClick={() => handleSave('Projects')}>Save Changes</Button>
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
                    <div key={index} className="space-y-2 border-b border-primary/20 pb-4">
                        <Label htmlFor={`cert-name-${index}`}>Certificate Name</Label>
                        <Input id={`cert-name-${index}`} defaultValue={cert.name} />
                        <Label htmlFor={`cert-issuer-${index}`}>Issuer</Label>
                        <Input id={`cert-issuer-${index}`} defaultValue={cert.issuer} />
                        <Label htmlFor={`cert-year-${index}`}>Year</Label>
                        <Input id={`cert-year-${index}`} type="number" defaultValue={cert.year} />
                    </div>
                ))}
              </CardContent>
                <Button className="m-6 mt-0" onClick={() => handleSave('Certificates')}>Save Changes</Button>
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
                        <div key={index} className="space-y-2 border-b border-primary/20 pb-4">
                            <Label htmlFor={`edu-inst-${index}`}>Institution</Label>
                            <Input id={`edu-inst-${index}`} defaultValue={edu.institution} />
                            <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                            <Input id={`edu-degree-${index}`} defaultValue={edu.degree} />
                            <Label htmlFor={`edu-duration-${index}`}>Duration</Label>
                            <Input id={`edu-duration-${index}`} defaultValue={edu.duration} />
                        </div>
                    ))}
                  </CardContent>
                  <Button className="m-6 mt-0" onClick={() => handleSave('Education')}>Save Changes</Button>
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages</Label>
                    <Textarea id="languages" defaultValue={skills.languages.join(', ')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tools">Tools & Technologies</Label>
                    <Textarea id="tools" defaultValue={skills.tools.join(', ')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="areas">Areas of Expertise</Label>
                    <Textarea id="areas" defaultValue={skills.areas.join(', ')} />
                  </div>
                </CardContent>
                <Button className="m-6 mt-0" onClick={() => handleSave('Skills')}>Save Changes</Button>
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
                    <Input id="resume-file" type="file" className="file:text-primary file:font-semibold"/>
                  </div>
                  <p className="text-sm text-muted-foreground">Current file: <Link href={personalData.resumeUrl} className="text-accent underline">{personalData.resumeUrl.split('/').pop()}</Link></p>
                </CardContent>
                <Button className="m-6 mt-0" onClick={() => handleSave('Resume')}>Upload New Resume</Button>
              </div>
            </PixelCard>
          </TabsContent>

        </Tabs>
      </CardContent>
      </div>
    </PixelCard>
  );
}
