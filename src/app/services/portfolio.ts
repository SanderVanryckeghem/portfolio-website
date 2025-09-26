import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Testimonial } from '../models/testimonial.model';
import { Experience } from '../models/experience.model';
import { Technology } from '../models/technology.model';
import { Project } from '../models/project.model';
import { Developer } from '../models/developer.model';
import {EmploymentType} from '../models/experience.model';
import {TechCategory} from '../models/technology.model';
import {ProjectCategory} from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private developer: Developer = {
    name: 'John Doe',
    title: 'Full Stack Developer',
    bio: 'Gepassioneerde web developer met 5+ jaar ervaring in het bouwen van moderne, schaalbare web applicaties. Gespecialiseerd in Angular, React en Node.js.',
    avatar: 'assets/images/avatar.jpg',
    skills: [
      'TypeScript', 'JavaScript', 'Angular', 'React', 'Node.js',
      'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Git'
    ],
    email: 'john.doe@example.com',
    location: 'Amsterdam, Nederland',
    social: {
      github: 'https://github.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe'
    }
  };

  private projects: Project[] = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'Een moderne e-commerce platform met real-time inventory management.',
      longDescription: 'Volledig responsive e-commerce platform gebouwd met Angular en Node.js, inclusief payment processing via Stripe.',
      technologies: ['Angular', 'Node.js', 'MongoDB', 'Stripe', 'Docker'],
      imageUrl: 'assets/images/project1.jpg',
      demoUrl: 'https://demo.example.com',
      githubUrl: 'https://github.com/johndoe/ecommerce',
      featured: true,
      category: ProjectCategory.WEB_APP,
      completedDate: new Date('2024-06-15')
    },
    {
      id: 2,
      title: 'Task Management System',
      description: 'Collaborative task management met real-time updates.',
      longDescription: 'Een intuïtieve task management applicatie met drag-and-drop, team collaboration en real-time synchronisatie.',
      technologies: ['React', 'Redux', 'Firebase', 'Material-UI', 'TypeScript'],
      imageUrl: 'assets/images/project2.jpg',
      demoUrl: 'https://tasks.example.com',
      githubUrl: 'https://github.com/johndoe/taskmanager',
      featured: true,
      category: ProjectCategory.WEB_APP,
      completedDate: new Date('2024-03-20')
    },
    {
      id: 3,
      title: 'Real-time Chat Application',
      description: 'Modern chat applicatie met video calling mogelijkheden.',
      longDescription: 'Real-time messaging platform met WebRTC voor video calls, file sharing en group chats.',
      technologies: ['Vue.js', 'Socket.io', 'Express', 'WebRTC', 'Redis'],
      imageUrl: 'assets/images/project3.jpg',
      demoUrl: 'https://chat.example.com',
      githubUrl: 'https://github.com/johndoe/chatapp',
      featured: false,
      category: ProjectCategory.WEB_APP,
      completedDate: new Date('2024-01-10')
    }
  ];

  private technologies: Technology[] = [
    { id: 1, name: 'Angular', icon: 'fab fa-angular', category: TechCategory.FRONTEND, proficiency: 95, color: '#DD0031' },
    { id: 2, name: 'React', icon: 'fab fa-react', category: TechCategory.FRONTEND, proficiency: 90, color: '#61DAFB' },
    { id: 3, name: 'Vue.js', icon: 'fab fa-vuejs', category: TechCategory.FRONTEND, proficiency: 85, color: '#4FC08D' },
    { id: 4, name: 'TypeScript', icon: 'fas fa-code', category: TechCategory.FRONTEND, proficiency: 95, color: '#3178C6' },
    { id: 5, name: 'Node.js', icon: 'fab fa-node-js', category: TechCategory.BACKEND, proficiency: 90, color: '#339933' },
    { id: 6, name: 'Python', icon: 'fab fa-python', category: TechCategory.BACKEND, proficiency: 80, color: '#3776AB' },
    { id: 7, name: 'MongoDB', icon: 'fas fa-database', category: TechCategory.DATABASE, proficiency: 85, color: '#47A248' },
    { id: 8, name: 'PostgreSQL', icon: 'fas fa-database', category: TechCategory.DATABASE, proficiency: 80, color: '#336791' },
    { id: 9, name: 'Docker', icon: 'fab fa-docker', category: TechCategory.DEVOPS, proficiency: 85, color: '#2496ED' },
    { id: 10, name: 'Git', icon: 'fab fa-git-alt', category: TechCategory.TOOLS, proficiency: 95, color: '#F05032' }
  ];

  private experiences: Experience[] = [
    {
      id: 1,
      company: 'Tech Solutions B.V.',
      position: 'Senior Frontend Developer',
      startDate: new Date('2022-01-01'),
      current: true,
      description: 'Lead frontend developer voor enterprise web applicaties.',
      achievements: [
        'Leidde de migratie van AngularJS naar Angular 15',
        'Verminderde laadtijden met 60% door optimalisaties',
        'Mentorde 3 junior developers'
      ],
      technologies: ['Angular', 'TypeScript', 'RxJS', 'NgRx'],
      location: 'Amsterdam, Nederland',
      type: EmploymentType.FULL_TIME
    }
  ];

  constructor() { }

  getDeveloper(): Observable<Developer> {
    return of(this.developer);
  }

  getProjects(): Observable<Project[]> {
    return of(this.projects);
  }

  getFeaturedProjects(): Observable<Project[]> {
    return of(this.projects.filter(p => p.featured));
  }

  getProjectById(id: number): Observable<Project | undefined> {
    return of(this.projects.find(p => p.id === id));
  }

  getTechnologies(): Observable<Technology[]> {
    return of(this.technologies);
  }

  getExperiences(): Observable<Experience[]> {
    return of(this.experiences);
  }
}
