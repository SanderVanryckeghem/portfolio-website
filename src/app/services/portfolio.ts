import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Experience, EmploymentType } from '../models/experience.model';
import { Technology, TechCategory } from '../models/technology.model';
import { Project, ProjectCategory } from '../models/project.model';
import { Developer } from '../models/developer.model';
import { Certificate } from '../models/certificate.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private developer: Developer = {
    name: 'Sander Vanryckeghem',
    title: 'Front-end Developer',
    bio: 'I am a front-end developer with a passion for creating intuitive and visually appealing user interfaces. With a strong passion for React, React Native and Mobile development, but thanks to my educational background and eagerness to learn, I effortlessly pick up new technologies.',
    avatar: 'assets/images/avatar.png',
    skills: [
      'React', 'React Native', 'TypeScript', 'JavaScript', 'HTML & CSS',
      'Swift', 'SwiftUI', 'Angular', 'Liquid', 'Git', 'Figma'
    ],
    email: 'sandervanryckeghem@outlook.com',
    location: 'Deinze, Belgium',
    social: {
      github: 'https://github.com/SanderVanryckeghem',
      linkedin: 'https://www.linkedin.com/in/sander-vanryckeghem-b29042b9/',
      twitter: undefined
    }
  };

  private projects: Project[] = [
    // Sorted by completion date (newest first)
    {
      id: 8,
      title: 'Portfolio Website',
      description: 'Modern, animated portfolio website built with Angular 20 showcasing my projects and skills.',
      longDescription: 'A fully responsive portfolio website built with Angular 20 using standalone components, signals, and modern best practices. Features include: GSAP-powered animations with ScrollTrigger, 3D rolling text effect using SplitText, particle background, dark/light theme toggle, contact form with rate limiting, and smooth scroll navigation. The site showcases my projects, technologies, work experience, and certifications.',
      technologies: ['Angular', 'TypeScript', 'SCSS', 'GSAP', 'RxJS'],
      imageUrl: 'assets/images/projects/portfolio.png',
      githubUrl: 'https://github.com/SanderVanryckeghem/portfolio-website',
      featured: true,
      category: ProjectCategory.WEB_APP,
      completedDate: new Date('2025-02-01')
    },
    {
      id: 1,
      title: 'Bakkerij Vanryckeghem',
      description: 'Modern, responsive website for a traditional Belgian bakery with SEO optimization.',
      longDescription: 'A fully responsive and SEO-optimized website for a traditional Belgian bakery in Harelbeke. Built with Angular v20 using modern practices like signal-based reactivity, OnPush change detection, and lazy-loaded routes. Features a centralized ContentService for managing products, categories, FAQs, and opening hours with automatic image preloading.',
      technologies: ['Angular', 'TypeScript', 'TailwindCSS', 'RxJS', 'Signals'],
      imageUrl: 'assets/images/projects/bakkerij_vanryckeghem.png',
      githubUrl: 'https://github.com/SanderVanryckeghem/bakkerij_vanryckeghem',
      featured: true,
      category: ProjectCategory.WEB_APP,
      completedDate: new Date('2025-02-01')
    },
    {
      id: 2,
      title: 'CarpoolTool',
      description: 'Full-stack web application for organizing carpooling to Axxes events.',
      longDescription: 'As the conclusion of the Java traineeship, we developed CarpoolTool, a web application for Axxes employees. Features: event-based carpool matching, choice between driver or passenger, and regional filtering to find colleagues in the same region. My tasks included deployment to AWS, frontend development in Angular, and setting up Bitbucket pipelines.',
      technologies: ['Angular', 'Java Spring', 'AWS Amplify', 'AWS Beanstalk', 'Bitbucket Pipelines'],
      imageUrl: 'assets/images/projects/project.jpg',
      featured: false,
      category: ProjectCategory.WEB_APP,
      completedDate: new Date('2022-09-01')
    },
    {
      id: 3,
      title: 'Bachelor Thesis: React Native Integratie',
      description: 'Research on integration of native components, widgets and watch extensions with React Native.',
      longDescription: 'For my bachelor thesis, I conducted an extensive study on the integration of native components, widgets and watch extensions with React Native. The project included: literature research, widget integration for weekly news articles on the home screen, and WatchOS extension development. The result was the successful integration of these extensions into the Axxes app.',
      technologies: ['React Native', 'iOS/Android Widgets', 'WatchOS', 'Swift'],
      imageUrl: 'assets/images/projects/project.jpg',
      featured: false,
      category: ProjectCategory.MOBILE_APP,
      completedDate: new Date('2022-07-01')
    },
    {
      id: 4,
      title: 'Year In Review',
      description: 'Development of a Spotify Wrapped-like feature for Axxes employees.',
      longDescription: 'During my internship at Axxes, I worked with three other interns on a Year In Review feature. Inspired by Spotify Wrapped, it provides an overview of: event attendance, project involvement, work hours analysis, a 25th anniversary special with photos, and a customizable video recap for social media. The feature was integrated into the existing Axxes React Native app.',
      technologies: ['React Native', 'TypeScript', 'Python', 'Figma', 'MobX'],
      imageUrl: 'assets/images/projects/project.jpg',
      featured: true,
      category: ProjectCategory.MOBILE_APP,
      completedDate: new Date('2023-06-01')
    },
    {
      id: 5,
      title: 'EcoInsights',
      description: 'iOS app that helps consumers make sustainable choices through AR product recognition.',
      longDescription: 'As part of the Agile Team Project, I developed an innovative app for ecoInsights together with five fellow students. The app recognizes products in supermarkets via the camera and displays an EcoScore in augmented reality. Features: real-time product recognition, AR EcoScore display, CoreML integration for image recognition, and dynamic data integration from Excel.',
      technologies: ['Swift', 'SwiftUI', 'Firebase', 'CoreML', 'GitLab', 'Figma', 'Scrum'],
      imageUrl: 'assets/images/projects/eco_insights.png',
      githubUrl: 'https://github.com/SanderVanryckeghem/EcoInsights',
      featured: false,
      category: ProjectCategory.MOBILE_APP,
      completedDate: new Date('2022-05-01')
    },
    {
      id: 6,
      title: 'BeerFinder',
      description: 'Flutter app that helps users discover new beers through OCR menu scanning.',
      longDescription: 'Together with four fellow students, I developed a mobile app that helps users discover new beers. The app scans a bar menu with OCR, asks questions through a quiz, and gives beer recommendations based on taste preferences. Features: user account system with beer history, OCR menu scanning, and quiz functionality.',
      technologies: ['Flutter', 'Firebase', 'OCR', 'Scrum', 'GitLab'],
      imageUrl: 'assets/images/projects/project.jpg',
      featured: false,
      category: ProjectCategory.MOBILE_APP,
      completedDate: new Date('2021-12-01')
    },
    {
      id: 7,
      title: 'FietsTracker',
      description: 'Apple Watch app for tracking bike rides with Bluetooth heart rate monitor.',
      longDescription: 'During the Mobile Application Development course, I developed a bike tracking app for the Apple Watch. Unique features: Bluetooth heart rate integration with external sensors, customizable display with selectable metrics, and post-activity review with route on map. Additional features: speed display, toggling between values, and music control.',
      technologies: ['Swift', 'SwiftUI', 'HealthKit', 'Core Bluetooth', 'Figma', 'GitLab'],
      imageUrl: 'assets/images/projects/fietstracker.png',
      githubUrl: 'https://github.com/SanderVanryckeghem/FietsTracker',
      featured: false,
      category: ProjectCategory.MOBILE_APP,
      completedDate: new Date('2022-06-01')
    }
  ];

  private technologies: Technology[] = [
    { id: 1, name: 'React', icon: 'fab fa-react', category: TechCategory.FRONTEND, proficiency: 95, color: '#61DAFB' },
    { id: 2, name: 'React Native', icon: 'fab fa-react', category: TechCategory.MOBILE, proficiency: 95, color: '#61DAFB' },
    { id: 3, name: 'TypeScript', icon: 'fas fa-code', category: TechCategory.FRONTEND, proficiency: 90, color: '#3178C6' },
    { id: 4, name: 'JavaScript', icon: 'fab fa-js-square', category: TechCategory.FRONTEND, proficiency: 90, color: '#F7DF1E' },
    { id: 5, name: 'HTML & CSS', icon: 'fab fa-html5', category: TechCategory.FRONTEND, proficiency: 95, color: '#E34F26' },
    { id: 6, name: 'Swift', icon: 'fab fa-swift', category: TechCategory.MOBILE, proficiency: 80, color: '#FA7343' },
    { id: 7, name: 'SwiftUI', icon: 'fab fa-swift', category: TechCategory.MOBILE, proficiency: 80, color: '#FA7343' },
    { id: 8, name: 'Angular', icon: 'fab fa-angular', category: TechCategory.FRONTEND, proficiency: 75, color: '#DD0031' },
    { id: 9, name: 'Liquid', icon: 'fas fa-code', category: TechCategory.FRONTEND, proficiency: 85, color: '#7AB55C' },
    { id: 10, name: 'Git', icon: 'fab fa-git-alt', category: TechCategory.TOOLS, proficiency: 90, color: '#F05032' },
    { id: 11, name: 'Figma', icon: 'fab fa-figma', category: TechCategory.DESIGN, proficiency: 85, color: '#F24E1E' },
    { id: 12, name: 'Flutter', icon: 'fab fa-flutter', category: TechCategory.MOBILE, proficiency: 85, color: '#61DAFB' },
    { id: 13, name: 'SQL', icon: 'fas fa-database', category: TechCategory.BACKEND, proficiency: 75, color: '#336791' },
    { id: 14, name: 'Firebase', icon: 'fas fa-fire', category: TechCategory.BACKEND, proficiency: 80, color: '#FFCA28' }
  ];

  private certificates: Certificate[] = [
    {
      id: 1,
      name: 'Certified Mid-Level Angular Developer',
      issuer: 'Angular',
      achievedDate: new Date('2026-01-01'),
      expiryDate: new Date('2029-01-01'),
      icon: 'fab fa-angular'
    },
    {
      id: 2,
      name: 'Certified Junior Angular Developer',
      issuer: 'Angular',
      achievedDate: new Date('2025-11-01'),
      expiryDate: new Date('2028-11-01'),
      icon: 'fab fa-angular'
    },
    {
      id: 3,
      name: 'React',
      issuer: 'W3Schools',
      achievedDate: new Date('2024-08-01'),
      icon: 'fab fa-react'
    },
    {
      id: 4,
      name: 'The Joy of React',
      issuer: 'Josh W. Comeau',
      achievedDate: new Date('2024-01-01'),
      icon: 'fab fa-react'
    },
    {
      id: 5,
      name: 'Traineeship Axxes',
      issuer: 'Axxes',
      achievedDate: new Date('2023-09-01'),
      icon: 'fas fa-certificate'
    },
    {
      id: 6,
      name: 'Advanced Google Analytics',
      issuer: 'Google',
      achievedDate: new Date('2022-12-01'),
      expiryDate: new Date('2025-12-01'),
      icon: 'fab fa-google'
    },
    {
      id: 7,
      name: 'Fundamentals of Digital Marketing',
      issuer: 'Google',
      achievedDate: new Date('2022-10-01'),
      icon: 'fab fa-google'
    }
  ];

  private experiences: Experience[] = [
    {
      id: 1,
      company: 'Axxes - Silverfin',
      position: 'BSO Solution Developer UK-Unit',
      startDate: new Date('2025-05-01'),
      current: true,
      description: 'For my third term at Silverfin, I switched from Team Platform to Team UK. Within this team, I work on updating Corporate Tax templates to support multiple business types. The team consists of 5 internal BSO Developers and another Axxes Consultant.',
      achievements: [
        'Updating existing templates',
        'Performing code reviews',
        'Processing review comments',
        'Working in a fully English-speaking team'
      ],
      technologies: ['Liquid', 'Silverfin Template Language', 'HTML', 'Scrum', 'Git', 'Testing'],
      location: 'Belgium (Remote for London office)',
      type: EmploymentType.FULL_TIME
    },
    {
      id: 2,
      company: 'Axxes - Silverfin',
      position: 'BSO Solution Developer Platform-Unit',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-05-01'),
      current: false,
      description: 'This team handles all clients that do not belong to Silverfin\'s standard markets. I helped develop custom workflows and templates for clients like EY Portugal and MYOB Australia. Due to my previous experience, I was tasked with creating the more complex templates.',
      achievements: [
        'Building new custom templates in Liquid',
        'Collaboration with internal developers from EY Belgium, EY Portugal and MYOB',
        'Processing review comments',
        'Processing E2E tickets'
      ],
      technologies: ['Liquid', 'Silverfin Template Language', 'HTML', 'Agile/Scrum', 'Git'],
      location: 'Belgium',
      type: EmploymentType.FULL_TIME
    },
    {
      id: 3,
      company: 'Axxes - Silverfin',
      position: 'BSO Solution Developer BE-Unit',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-07-01'),
      current: false,
      description: 'Silverfin (part of Visma) is the cloud-based accounting platform that top firms use for their digital transformation strategy. My primary focus was the Personal Income Tax project - a highly time-sensitive project where I was added to meet the deadline.',
      achievements: [
        'Development of mini flows for Personal Income Tax',
        'Processing review comments',
        'Processing E2E tickets',
        'Working in a team of 9 people'
      ],
      technologies: ['Liquid', 'Silverfin Template Language', 'Agile/Scrum', 'HTML', 'Git'],
      location: 'Belgium',
      type: EmploymentType.FULL_TIME
    },
    {
      id: 4,
      company: 'Axxes',
      position: 'Mobile Developer',
      startDate: new Date('2023-09-01'),
      endDate: new Date('2023-12-01'),
      current: false,
      description: 'After my internship, I continued working on the Year In Review app. Improvements included: simpler navigation, cleaning up visuals, bugfixes, introduction of React Query for better state management, and code cleanup.',
      achievements: [
        'Simpler navigation with blinking arrows',
        'Cleaning up visuals and faster opening slide',
        'Introduction of React Query',
        'Code cleanup and styling in separate files'
      ],
      technologies: ['React Native', 'TypeScript', 'React Query'],
      location: 'Belgium',
      type: EmploymentType.FULL_TIME
    },
    {
      id: 5,
      company: 'Axxes - Java Traineeship',
      position: 'Fullstack Developer',
      startDate: new Date('2023-08-01'),
      endDate: new Date('2023-09-01'),
      current: false,
      description: 'As the conclusion of the Java traineeship, we developed CarpoolTool, a web application for Axxes employees to organize carpooling to company events.',
      achievements: [
        'Deployment of backend & frontend to AWS',
        'Development of the frontend in Angular',
        'Setting up Bitbucket pipelines'
      ],
      technologies: ['Angular', 'Java Spring', 'AWS Amplify', 'AWS Beanstalk', 'Bitbucket Pipelines'],
      location: 'Belgium',
      type: EmploymentType.FULL_TIME
    },
    {
      id: 6,
      company: 'Axxes',
      position: 'Intern - Front-end Developer',
      startDate: new Date('2023-02-01'),
      endDate: new Date('2023-06-01'),
      current: false,
      description: 'During my internship at Axxes, I worked with three other interns on a Year In Review feature. Inspired by Spotify Wrapped, it provides an overview of event attendance, project involvement, work hours analysis, and more.',
      achievements: [
        'Development of the Year In Review feature in React Native',
        'Creation of Figma designs and flows',
        'Integration of notifications',
        'Implementation of social media sharing feature'
      ],
      technologies: ['React Native', 'TypeScript', 'Python', 'Figma', 'MobX'],
      location: 'Belgium',
      type: EmploymentType.INTERNSHIP
    }
  ];

  constructor() { }

  getDeveloper(): Observable<Developer> {
    return of(this.developer);
  }

  getProjects(): Observable<Project[]> {
    return of(this.sortByCompletedDate(this.projects));
  }

  getFeaturedProjects(): Observable<Project[]> {
    return of(this.sortByCompletedDate(this.projects.filter(p => p.featured)));
  }

  private sortByCompletedDate(projects: Project[]): Project[] {
    return [...projects].sort((a, b) => {
      const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0;
      const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0;
      return dateB - dateA; // Newest first
    });
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

  getCertificates(): Observable<Certificate[]> {
    return of(this.certificates);
  }
}
