import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { PortfolioService } from './portfolio';
import { Developer } from '../models/developer.model';
import { Project } from '../models/project.model';
import { Experience } from '../models/experience.model';
import { Education } from '../models/education.model';
import { Certificate } from '../models/certificate.model';
import { Technology, TechCategory } from '../models/technology.model';
import { TtBlock, TtColour, TtDetail, TtEntry, TtPage, TtTarget } from '../models/teletext.model';

// Page map:
//   100 index
//   200 projects index, 201+ one page per project (newest first)
//   300 work experience index, 301+ one page per job (newest first)
//   350 education, 360 certificates
//   400 about, 410 technologies, 420 contact, 430 message form
export const PAGE = {
  index: 100,
  projects: 200,
  experience: 300,
  education: 350,
  certificates: 360,
  about: 400,
  technologies: 410,
  contact: 420,
  message: 430,
} as const;

export const FASTEXT: { label: string; page: number; colour: 'red' | 'green' | 'yellow' | 'cyan' }[] = [
  { label: 'Projects', page: PAGE.projects, colour: 'red' },
  { label: 'Experience', page: PAGE.experience, colour: 'green' },
  { label: 'About', page: PAGE.about, colour: 'yellow' },
  { label: 'Contact', page: PAGE.contact, colour: 'cyan' },
];

const HERO_TITLES = ['Frontend Developer', 'Full Stack Developer', 'Mobile Developer'];

const STATS = [
  { label: 'Years Experience', value: '3+' },
  { label: 'Projects Completed', value: '4+' },
  { label: 'Happy Clients', value: '4+' },
  { label: 'Code Commits', value: '2000+' },
];

const SERVICES = ['Web', 'Mobile', 'Frontend', 'Fullstack'];

const CV: TtTarget = { action: 'cv' };

/**
 * Turns the portfolio content into numbered teletext pages. Pages are plain
 * data (headings, paragraphs, lists); layout and splitting into sub-pages is
 * left to the browser. All copy comes from PortfolioService or the constants above.
 */
@Injectable({
  providedIn: 'root',
})
export class TeletextPagesService {
  private readonly portfolioService = inject(PortfolioService);

  private readonly data = toSignal(
    combineLatest({
      developer: this.portfolioService.getDeveloper(),
      projects: this.portfolioService.getProjects(),
      technologies: this.portfolioService.getTechnologies(),
      experiences: this.portfolioService.getExperiences(),
      education: this.portfolioService.getEducation(),
      certificates: this.portfolioService.getCertificates(),
    }),
  );

  private readonly pages = computed(() => {
    const data = this.data();
    if (!data) return new Map<number, TtPage>();
    const pages = [
      indexPage(data.developer),
      ...projectPages(data.projects),
      ...experiencePages(data.experiences, data.developer),
      educationPage(data.education),
      certificatesPage(data.certificates),
      aboutPage(data.developer),
      technologiesPage(data.technologies),
      contactPage(data.developer),
      messagePage(),
    ];
    return new Map(pages.map((page) => [page.number, page]));
  });

  get(number: number): TtPage | undefined {
    return this.pages().get(number);
  }

  notFound(number: number): TtPage {
    return {
      number,
      title: 'Page not found',
      band: 'red',
      titleColour: 'white',
      parent: PAGE.index,
      blocks: [
        text(`Page ${number} is not in this service.`),
        contents([pageEntry('Index', PAGE.index)], 1),
      ],
    };
  }
}

// Block helpers ---------------------------------------------------------------

function heading(content: string, gap = 0): TtBlock {
  return { kind: 'heading', text: content, gap };
}

function text(content: string, colour?: TtColour, gap = 0): TtBlock {
  return { kind: 'text', text: content, colour, gap };
}

function contents(entries: TtEntry[], gap = 0): TtBlock {
  return { kind: 'contents', entries, gap };
}

function details(rows: TtDetail[], gap = 0, labelWidth?: number): TtBlock {
  return { kind: 'details', rows, gap, labelWidth };
}

function pageEntry(label: string, page: number, extra: Partial<TtEntry> = {}): TtEntry {
  return { label, target: { page }, right: String(page), ...extra };
}

const CV_ENTRY: TtEntry = { label: 'Download CV', target: CV, right: 'PDF' };

// P100 -----------------------------------------------------------------------

function indexPage(dev: Developer): TtPage {
  return {
    number: PAGE.index,
    title: dev.name,
    band: 'blue',
    titleColour: 'yellow',
    // The job titles follow below, so the masthead names the employer.
    masthead: {
      name: dev.name,
      title: dev.employer ? `Consultant at ${dev.employer.name}` : dev.title,
    },
    blocks: [
      text(`Hi, I'm ${dev.name}`, 'yellow'),
      text(HERO_TITLES.join(', '), 'cyan'),
      contents(
        [
          pageEntry('About Me', PAGE.about),
          pageEntry('Technologies', PAGE.technologies),
          pageEntry('My Projects', PAGE.projects),
          pageEntry('Work Experience', PAGE.experience),
          pageEntry('Education', PAGE.education),
          pageEntry('Certificates', PAGE.certificates),
          pageEntry('Get In Touch', PAGE.contact),
          pageEntry('Send Message', PAGE.message),
          CV_ENTRY,
        ],
        1,
      ),
      // Two blank rows centre the hint between the list and the Fastext bar.
      {
        kind: 'text',
        text: 'Key in a 3-digit page number, or use the coloured keys below.',
        centre: true,
        only: 'desktop',
        gap: 2,
      },
      {
        kind: 'text',
        text: 'Tap a topic, or use the coloured buttons above.',
        centre: true,
        only: 'touch',
        gap: 1,
      },
    ],
  };
}

// P200 -----------------------------------------------------------------------

function projectPages(projects: Project[]): TtPage[] {
  const numbered = projects.map((project, i) => ({ project, page: PAGE.projects + 1 + i }));
  const categoryOf = (project: Project) => project.category ?? 'Other project';
  const categories = [...new Set(projects.map(categoryOf))];

  const index: TtBlock[] = [text('A selection of my recent work and personal projects', 'cyan')];
  for (const category of categories) {
    index.push(
      heading(`${category}s`, 1),
      contents(
        numbered
          .filter(({ project }) => categoryOf(project) === category)
          .map(({ project, page }) =>
            pageEntry(project.title, page, { marker: project.featured ? '*' : ' ' }),
          ),
      ),
    );
  }
  index.push(text('* Featured', 'yellow', 1));

  const detail = numbered.map(({ project, page }, i): TtPage => {
    const meta = [project.category, project.featured ? 'Featured' : null].filter(Boolean);
    const blocks: TtBlock[] = [heading(project.title)];
    if (meta.length) blocks.push(text(meta.join(' · '), 'cyan'));
    if (project.completedDate) {
      blocks.push(text(`Completed: ${formatMonthYear(project.completedDate)}`));
    }
    blocks.push(text(project.description, 'cyan', 1));
    if (project.longDescription) {
      blocks.push(heading('About this project', 1), text(project.longDescription));
    }
    blocks.push(heading('Technologies Used', 1), text(project.technologies.join(', '), 'cyan'));

    const links: TtDetail[] = [];
    if (project.demoUrl) {
      links.push({ label: 'Live Demo', value: stripScheme(project.demoUrl), link: { href: project.demoUrl } });
    }
    if (project.githubUrl) {
      links.push({ label: 'Code', value: stripScheme(project.githubUrl), link: { href: project.githubUrl } });
    }
    if (links.length) blocks.push(details(links, 1, 10));

    return {
      number: page,
      title: 'My Projects',
      band: 'red',
      titleColour: 'white',
      parent: PAGE.projects,
      next: numbered[i + 1]?.page,
      blocks,
    };
  });

  return [
    {
      number: PAGE.projects,
      title: 'My Projects',
      band: 'red',
      titleColour: 'white',
      parent: PAGE.index,
      blocks: index,
    },
    ...detail,
  ];
}

// P300 -----------------------------------------------------------------------

function experiencePages(experiences: Experience[], dev: Developer): TtPage[] {
  // Client assignments first, then internal projects; each newest first.
  const ordered = [
    ...experiences.filter((exp) => exp.client),
    ...experiences.filter((exp) => !exp.client),
  ];
  const numbered = ordered.map((exp, i) => ({ exp, page: PAGE.experience + 1 + i }));
  const year = (exp: Experience) => new Date(exp.startDate).getFullYear();

  const index: TtBlock[] = [text('My professional journey', 'cyan')];
  if (dev.employer) {
    const { name, kind, description, since } = dev.employer;
    index.push(
      heading(name, 1),
      text(`${kind} · ${new Date(since).getFullYear()} - Present`, 'cyan'),
      text(description),
    );
  }
  index.push(
    heading('Client assignments', 1),
    contents(
      numbered
        .filter(({ exp }) => exp.client)
        .map(({ exp, page }) =>
          pageEntry(exp.client!, page, { sub: `${exp.position}, ${year(exp)}` }),
        ),
    ),
    heading(dev.employer ? `Internal ${dev.employer.name} projects` : 'Internal projects', 1),
    contents(
      numbered
        .filter(({ exp }) => !exp.client)
        .map(({ exp, page }) =>
          pageEntry(exp.position, page, {
            sub: [exp.project, year(exp)].filter(Boolean).join(', '),
          }),
        ),
    ),
    contents([pageEntry('Education', PAGE.education), pageEntry('Certificates', PAGE.certificates)], 1),
  );

  const detail = numbered.map(({ exp, page }, i): TtPage => {
    const period = `${formatMonthYear(exp.startDate)} - ${
      exp.current ? 'Present' : formatMonthYear(exp.endDate!)
    }`;
    const facts: TtDetail[] = [{ label: 'Employer', value: exp.company }];
    if (exp.client) facts.push({ label: 'Client', value: exp.client });
    else facts.push({ label: 'Project', value: exp.project ?? 'Internal' });
    facts.push({ label: 'Period', value: period });
    if (exp.type) facts.push({ label: 'Type', value: exp.type });
    if (exp.location) facts.push({ label: 'Location', value: exp.location });

    const blocks: TtBlock[] = [heading(exp.position), details(facts)];
    blocks.push(text(exp.description, undefined, 1));
    if (exp.achievements?.length) {
      blocks.push(heading('Achievements', 1), { kind: 'bullets', items: exp.achievements });
    }
    if (exp.technologies?.length) {
      blocks.push(heading('Technologies', 1), text(exp.technologies.join(', '), 'cyan'));
    }
    return {
      number: page,
      title: 'Work Experience',
      band: 'blue',
      titleColour: 'cyan',
      parent: PAGE.experience,
      next: numbered[i + 1]?.page,
      blocks,
    };
  });

  return [
    {
      number: PAGE.experience,
      title: 'Experience & Education',
      band: 'blue',
      titleColour: 'cyan',
      parent: PAGE.index,
      blocks: index,
    },
    ...detail,
  ];
}

function educationPage(education: Education[]): TtPage {
  const blocks = education.flatMap((edu, i): TtBlock[] => [
    heading(edu.degree, i === 0 ? 0 : 1),
    text(`${edu.institution} · ${edu.year}`, 'cyan'),
    text(edu.description),
    ...(edu.technologies?.length ? [text(edu.technologies.join(', '), 'cyan')] : []),
  ]);
  return {
    number: PAGE.education,
    title: 'Education',
    band: 'blue',
    titleColour: 'cyan',
    parent: PAGE.experience,
    next: PAGE.certificates,
    blocks,
  };
}

function certificatesPage(certificates: Certificate[]): TtPage {
  const cards = certificates.map((cert) => {
    const dates =
      formatShortMonthYear(cert.achievedDate) +
      (cert.expiryDate ? ` - Expires: ${formatShortMonthYear(cert.expiryDate)}` : '');
    return [
      { text: cert.name, colour: 'yellow' as const },
      { text: cert.issuer, colour: 'cyan' as const },
      { text: dates },
    ];
  });
  return {
    number: PAGE.certificates,
    title: 'Certificates',
    band: 'blue',
    titleColour: 'cyan',
    parent: PAGE.experience,
    blocks: [{ kind: 'cards', cards }],
  };
}

// P400 -----------------------------------------------------------------------

function aboutPage(dev: Developer): TtPage {
  const facts: TtDetail[] = [];
  if (dev.email) facts.push({ label: 'Email', value: dev.email, link: { href: `mailto:${dev.email}` } });
  if (dev.location) facts.push({ label: 'Location', value: dev.location });

  return {
    number: PAGE.about,
    title: 'About Me',
    band: 'blue',
    titleColour: 'yellow',
    parent: PAGE.index,
    next: PAGE.technologies,
    blocks: [
      text('Get to know me better', 'cyan'),
      heading(`I'm ${dev.name}`, 1),
      text(dev.bio),
      details(facts, 1),
      heading('My Skills', 1),
      text(dev.skills.join(', '), 'cyan'),
      {
        kind: 'details',
        rows: STATS.map((stat) => ({ label: stat.value, value: stat.label })),
        labelWidth: 6,
        labelColour: 'yellow',
        gap: 1,
      },
      text('Passionate web developer creating amazing digital experiences.', undefined, 1),
      heading('Services', 1),
      text(SERVICES.join(' · '), 'cyan'),
      contents([pageEntry('Technologies', PAGE.technologies), CV_ENTRY], 1),
    ],
  };
}

function technologiesPage(technologies: Technology[]): TtPage {
  const width = Math.max(...technologies.map((t) => t.name.length));
  const blocks: TtBlock[] = [text('The tools and frameworks I work with', 'cyan')];
  for (const category of Object.values(TechCategory)) {
    const items = technologies.filter((t) => t.category === category).map((t) => t.name);
    if (items.length) blocks.push(heading(category, 1), { kind: 'columns', items, width });
  }
  return {
    number: PAGE.technologies,
    title: 'Technologies',
    band: 'blue',
    titleColour: 'yellow',
    parent: PAGE.about,
    next: PAGE.contact,
    blocks,
  };
}

function contactPage(dev: Developer): TtPage {
  const reach: TtDetail[] = [];
  if (dev.email) reach.push({ label: 'Email', value: dev.email, link: { href: `mailto:${dev.email}` } });
  if (dev.phone) {
    reach.push({ label: 'Phone', value: dev.phone, link: { href: `tel:${dev.phone.replace(/\s+/g, '')}` } });
  }
  if (dev.location) reach.push({ label: 'Location', value: dev.location });

  const social: TtDetail[] = [];
  if (dev.social.github) {
    social.push({ label: 'GitHub', value: stripScheme(dev.social.github), link: { href: dev.social.github } });
  }
  if (dev.social.linkedin) {
    social.push({
      label: 'LinkedIn',
      value: stripScheme(dev.social.linkedin),
      link: { href: dev.social.linkedin },
    });
  }

  return {
    number: PAGE.contact,
    title: 'Get In Touch',
    band: 'blue',
    titleColour: 'yellow',
    parent: PAGE.index,
    next: PAGE.message,
    blocks: [
      text("Let's build something great together", 'cyan'),
      details(reach, 1),
      heading('Follow me on social media', 1),
      details(social),
      ...(dev.employer
        ? [text(`Consultant at ${dev.employer.name} (${dev.employer.kind}).`, undefined, 1)]
        : []),
      text('Response time within 24 hours.', undefined, dev.employer ? 0 : 1),
      contents([pageEntry('Send Message', PAGE.message), CV_ENTRY], 1),
    ],
  };
}

function messagePage(): TtPage {
  return {
    number: PAGE.message,
    title: 'Send Message',
    band: 'blue',
    titleColour: 'yellow',
    parent: PAGE.contact,
    form: 'contact',
    blocks: [],
  };
}

// Formatting -----------------------------------------------------------------

function stripScheme(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

function formatMonthYear(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

function formatShortMonthYear(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}
