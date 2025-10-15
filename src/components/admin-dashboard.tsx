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
import { User, Briefcase, Award, GraduationCap, FileText, Wrench, Menu, PlusCircle, Trash2, Github, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Flag } from 'lucide-react';
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

interface CtfEvent {
  id: string;
  name: string;
  organizer: string;
  date: string; // ISO
  placement?: string;
  team?: string;
  writeupUrl?: string;
  categories: string[];
  points?: number;
}

interface GitHubRepository {
  id: string;
  githubId: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  cloneUrl: string;
  language: string | null;
  topics: string[];
  stargazersCount: number;
  forksCount: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;
  defaultBranch: string;
  visibility: string;
  archived: boolean;
  disabled: boolean;
  homepage: string | null;
  license: string | null;
  displayInPortfolio: boolean;
  customTitle: string | null;
  customDescription: string | null;
  customTags: string[];
  displayOrder: number | null;
  syncedAt: string;
  lastChecked: string;
}

type SaveData = PersonalData | Project | Certificate | Education | Skills | CtfEvent;

export function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepository[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skills | null>(null);
  const [ctfEvents, setCtfEvents] = useState<CtfEvent[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    fetch('/api/personal-data').then(res => res.json()).then(setPersonalData);
    fetch('/api/projects').then(res => res.json()).then(setProjects);
    fetch('/api/github/sync').then(res => res.json()).then(data => setGithubRepos(data.repositories || []));
    fetch('/api/certificates').then(res => res.json()).then(setCertificates);
    fetch('/api/education').then(res => res.json()).then(setEducation);
    fetch('/api/skills').then(res => res.json()).then(setSkills);
    fetch('/api/ctf').then(res => res.json()).then(setCtfEvents);
  }, []);

  const handleSave = async (section: string, data: SaveData | null, id?: string) => {
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
    } catch (_error) {
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
    } catch (_error) {
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
    } catch (_error) {
      toast({ title: 'Error uploading resume', variant: 'destructive' });
    }
  };

  const handleSyncGitHubRepos = async () => {
    try {
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'modhack2003' })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({ title: `Synced ${data.data.syncedCount} repositories` });
        // Refresh the repositories list
        const reposResponse = await fetch('/api/github/sync');
        const reposData = await reposResponse.json();
        setGithubRepos(reposData.repositories || []);
      } else {
        throw new Error('Sync failed');
      }
    } catch (_error) {
      toast({ title: 'Error syncing repositories', variant: 'destructive' });
    }
  };

  const handleToggleRepoDisplay = async (repoId: string, displayInPortfolio: boolean) => {
    try {
      const response = await fetch(`/api/github/repos/${repoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayInPortfolio })
      });
      
      if (response.ok) {
        toast({ title: `Repository ${displayInPortfolio ? 'added to' : 'removed from'} portfolio` });
        // Update local state
        setGithubRepos(prev => prev.map(repo => 
          repo.id === repoId ? { ...repo, displayInPortfolio } : repo
        ));
      } else {
        throw new Error('Update failed');
      }
    } catch (_error) {
      toast({ title: 'Error updating repository', variant: 'destructive' });
    }
  };

  const handleUpdateRepoSettings = async (repoId: string, settings: Partial<GitHubRepository>) => {
    try {
      const response = await fetch(`/api/github/repos/${repoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        toast({ title: 'Repository settings updated' });
        // Update local state
        setGithubRepos(prev => prev.map(repo => 
          repo.id === repoId ? { ...repo, ...settings } : repo
        ));
      } else {
        throw new Error('Update failed');
      }
    } catch (_error) {
      toast({ title: 'Error updating repository settings', variant: 'destructive' });
    }
  };

  const navLinks = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'github', label: 'GitHub Repos', icon: Github },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'education', label: 'Study', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'ctf', label: 'CTF', icon: Flag },
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
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={personalData.email} onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })} />
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
                      const newProject = await handleSave('projects', {id: '', title: 'New Project', description: '', tags: []});
                      setProjects([...projects, newProject]);
                    }}><PlusCircle className="w-4 h-4 mr-2"/>Add Project</Button>
                  </CardContent>
                </div>
              </PixelCard>
            </TabsContent>

            <TabsContent value="ctf" className="mt-4">
              <PixelCard>
                <div className="bg-background/80 p-6 rounded-sm">
                  <CardHeader>
                    <CardTitle>CTF Competitions</CardTitle>
                    <CardDescription>Manage your CTF participation and results.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {ctfEvents.map((evt, index) => (
                      <div key={evt.id} className="space-y-2 border-b border-primary/20 pb-4">
                        <Label htmlFor={`ctf-name-${index}`}>Event Name</Label>
                        <Input id={`ctf-name-${index}`} value={evt.name} onChange={(e) => setCtfEvents(ctfEvents.map(x => x.id === evt.id ? { ...x, name: e.target.value } : x))} />
                        <Label htmlFor={`ctf-organizer-${index}`}>Organizer</Label>
                        <Input id={`ctf-organizer-${index}`} value={evt.organizer} onChange={(e) => setCtfEvents(ctfEvents.map(x => x.id === evt.id ? { ...x, organizer: e.target.value } : x))} />
                        <Label htmlFor={`ctf-date-${index}`}>Date</Label>
                        <Input id={`ctf-date-${index}`} type="date" value={evt.date?.slice(0,10)} onChange={(e) => setCtfEvents(ctfEvents.map(x => x.id === evt.id ? { ...x, date: e.target.value } : x))} />
                        <Label htmlFor={`ctf-placement-${index}`}>Placement</Label>
                        <Input id={`ctf-placement-${index}`} value={evt.placement || ''} onChange={(e) => setCtfEvents(ctfEvents.map(x => x.id === evt.id ? { ...x, placement: e.target.value } : x))} />
                        <Label htmlFor={`ctf-team-${index}`}>Team</Label>
                        <Input id={`ctf-team-${index}`} value={evt.team || ''} onChange={(e) => setCtfEvents(ctfEvents.map(x => x.id === evt.id ? { ...x, team: e.target.value } : x))} />
                        <Label htmlFor={`ctf-categories-${index}`}>Categories (comma separated)</Label>
                        <Input id={`ctf-categories-${index}`} value={evt.categories.join(', ')} onChange={(e) => setCtfEvents(ctfEvents.map(x => x.id === evt.id ? { ...x, categories: e.target.value.split(',').map(t => t.trim()) } : x))} />
                        <Label htmlFor={`ctf-points-${index}`}>Points</Label>
                        <Input id={`ctf-points-${index}`} type="number" value={evt.points ?? 0} onChange={(e) => setCtfEvents(ctfEvents.map(x => x.id === evt.id ? { ...x, points: parseInt(e.target.value) } : x))} />
                        <Label htmlFor={`ctf-writeup-${index}`}>Write-up URL</Label>
                        <Input id={`ctf-writeup-${index}`} value={evt.writeupUrl || ''} onChange={(e) => setCtfEvents(ctfEvents.map(x => x.id === evt.id ? { ...x, writeupUrl: e.target.value } : x))} />
                        <div className="flex justify-end space-x-2">
                          <Button onClick={() => handleSave('ctf', evt as SaveData, evt.id)}>Save</Button>
                          <Button variant="destructive" onClick={() => { handleDelete('ctf', evt.id); setCtfEvents(ctfEvents.filter(x => x.id !== evt.id)); }}><Trash2 className="w-4 h-4"/></Button>
                        </div>
                      </div>
                    ))}
                    <Button onClick={async () => {
                      const newEvt = await handleSave('ctf', { id: '', name: 'New CTF', organizer: '', date: new Date().toISOString(), categories: [] } as SaveData);
                      setCtfEvents([...ctfEvents, newEvt]);
                    }}><PlusCircle className="w-4 h-4 mr-2"/>Add CTF</Button>
                  </CardContent>
                </div>
              </PixelCard>
            </TabsContent>

            <TabsContent value="github" className="mt-4">
              <PixelCard>
                <div className="bg-background/80 p-6 rounded-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>GitHub Repositories</CardTitle>
                        <CardDescription>Manage which repositories to display in your portfolio.</CardDescription>
                      </div>
                      <Button onClick={handleSyncGitHubRepos} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Repos
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {githubRepos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Github className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No repositories found. Click "Sync Repos" to fetch from GitHub.</p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {githubRepos.map((repo) => (
                            <div key={repo.id} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">{repo.name}</h3>
                                    {repo.language && (
                                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                                        {repo.language}
                                      </span>
                                    )}
                                    <span className="text-sm text-muted-foreground">
                                      {repo.stargazersCount} ⭐ {repo.forksCount} 🍴
                                    </span>
                                  </div>
                                  {repo.description && (
                                    <p className="text-sm text-muted-foreground mb-2">{repo.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Updated: {new Date(repo.updatedAt).toLocaleDateString()}</span>
                                    <span>Size: {Math.round(repo.size / 1024)} KB</span>
                                    {repo.homepage && (
                                      <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Live Demo
                                      </a>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => handleToggleRepoDisplay(repo.id, !repo.displayInPortfolio)}
                                    variant={repo.displayInPortfolio ? "default" : "outline"}
                                    size="sm"
                                  >
                                    {repo.displayInPortfolio ? (
                                      <>
                                        <Eye className="w-4 h-4 mr-2" />
                                        In Portfolio
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="w-4 h-4 mr-2" />
                                        Add to Portfolio
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                  >
                                    <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer">
                                      View on GitHub
                                    </a>
                                  </Button>
                                </div>
                              </div>
                              
                              {repo.displayInPortfolio && (
                                <div className="border-t pt-3 space-y-2">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor={`custom-title-${repo.id}`}>Custom Title (optional)</Label>
                                      <Input
                                        id={`custom-title-${repo.id}`}
                                        placeholder={repo.name}
                                        value={repo.customTitle || ''}
                                        onChange={(e) => handleUpdateRepoSettings(repo.id, { customTitle: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`display-order-${repo.id}`}>Display Order</Label>
                                      <Input
                                        id={`display-order-${repo.id}`}
                                        type="number"
                                        placeholder="0"
                                        value={repo.displayOrder || ''}
                                        onChange={(e) => handleUpdateRepoSettings(repo.id, { displayOrder: parseInt(e.target.value) || null })}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor={`custom-description-${repo.id}`}>Custom Description (optional)</Label>
                                    <Textarea
                                      id={`custom-description-${repo.id}`}
                                      placeholder={repo.description || 'Enter custom description...'}
                                      value={repo.customDescription || ''}
                                      onChange={(e) => handleUpdateRepoSettings(repo.id, { customDescription: e.target.value })}
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
                      const newCert = await handleSave('certificates', {id: '', name: 'New Certificate', issuer: '', year: new Date().getFullYear()});
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
                      const newEdu = await handleSave('education', {id: '', institution: 'New Institution', degree: '', duration: ''});
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