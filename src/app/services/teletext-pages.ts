import { Injectable, inject, signal } from '@angular/core';
import { combineLatest } from 'rxjs';
import { PortfolioService } from './portfolio';
import { Developer } from '../models/developer.model';
import { Project } from '../models/project.model';
import { Experience } from '../models/experience.model';
import { Education } from '../models/education.model';
import { Certificate } from '../models/certificate.model';
import { Technology, TechCategory } from '../models/technology.model';
import { TtBlock, TtPage, TtPageSource, TtTarget } from '../models/teletext.model';
import {
  COLS,
  MARGIN,
  blank,
  gridCols,
  withColumns,
  bullet,
  columns,
  contentCapacity,
  heading,
  keyValue,
  leader,
  mosaicWord,
  paginate,
  row,
  text,
  blockHeight,
} from '../utils/teletext-layout';

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

const HERO_TITLES = ['Mobile Developer', 'Frontend Developer', 'Full Stack Developer'];

const STATS = [
  { label: 'Years Experience', value: '3+' },
  { label: 'Projects Completed', value: '4+' },
  { label: 'Happy Clients', value: '4+' },
  { label: 'Code Commits', value: '2000+' },
];

const SERVICES = ['Web', 'Mobile', 'Frontend', 'Fullstack'];

const CV: TtTarget = { action: 'cv' };

interface PortfolioData {
  developer: Developer;
  projects: Project[];
  technologies: Technology[];
  experiences: Experience[];
  education: Education[];
  certificates: Certificate[];
}

/**
 * Turns the portfolio content into numbered teletext pages: 40x25 sub-pages
 * on desktop, or a narrower continuous grid on phones. All copy comes from PortfolioService or the constants
 * above - this service only decides where it goes on the grid.
 */
@Injectable({
  providedIn: 'root',
})
export class TeletextPagesService {
  private readonly portfolioService = inject(PortfolioService);

  private readonly data = signal<PortfolioData | null>(null);
  // Composed pages per grid width (40 on desktop, narrower on phones).
  private readonly cache = new Map<number, Map<number, TtPage>>();

  constructor() {
    combineLatest({
      developer: this.portfolioService.getDeveloper(),
      projects: this.portfolioService.getProjects(),
      technologies: this.portfolioService.getTechnologies(),
      experiences: this.portfolioService.getExperiences(),
      education: this.portfolioService.getEducation(),
      certificates: this.portfolioService.getCertificates(),
    }).subscribe((data) => {
      this.cache.clear();
      this.data.set(data);
    });
  }

  get(number: number, cols: number = COLS): TtPage | undefined {
    return this.pagesFor(cols).get(number);
  }

  notFound(number: number, cols: number = COLS): TtPage {
    return withColumns(cols, () =>
      compose(
        {
          number,
          title: 'Page not found',
          band: 'red',
          titleFg: 'white',
          parent: PAGE.index,
          blocks: [
            blank(),
            text(`Page ${number} is not in this service.`),
            blank(),
            leader('Index', { page: PAGE.index }, String(PAGE.index)),
          ],
        },
        cols,
      ),
    );
  }

  private pagesFor(cols: number): Map<number, TtPage> {
    const data = this.data();
    if (!data) return new Map();
    let pages = this.cache.get(cols);
    if (!pages) {
      pages = withColumns(cols, () => {
        const sources = [
          this.indexPage(data.developer),
          ...this.projectPages(data.projects),
          ...this.experiencePages(data.experiences),
          this.educationPage(data.education),
          this.certificatesPage(data.certificates),
          this.aboutPage(data.developer),
          this.technologiesPage(data.technologies),
          this.contactPage(data.developer),
          this.messagePage(),
        ];
        return new Map(sources.map((source) => [source.number, compose(source, cols)]));
      });
      this.cache.set(cols, pages);
    }
    return pages;
  }

  // P100 ---------------------------------------------------------------------

  private indexPage(dev: Developer): TtPageSource {
    const logo = mosaicWord('SV');
    // Drop the mosaic logo when the name wouldn't fit beside it (narrow phones).
    const showLogo = MARGIN.length + logo[0].length + 2 + dev.name.length <= gridCols();
    const masthead: TtBlock = showLogo ? {
      tag: 'div',
      rows: [
        row(
          [
            { text: MARGIN, decorative: true },
            { text: logo[0], fg: 'white', decorative: true },
            { text: '  ' },
            { text: dev.name, fg: 'yellow', double: true },
          ],
          { bg: 'blue' },
        ),
        row([{ text: MARGIN + logo[1], fg: 'white', decorative: true }], { bg: 'blue' }),
        row(
          [
            { text: MARGIN, decorative: true },
            { text: logo[2], fg: 'white', decorative: true },
            { text: '  ' },
            { text: dev.title, fg: 'cyan' },
          ],
          { bg: 'blue' },
        ),
      ],
    } : {
      tag: 'div',
      rows: [
        row([{ text: MARGIN + dev.name, fg: 'yellow' }], { bg: 'blue', double: true }),
        row([{ text: MARGIN + dev.title, fg: 'cyan' }], { bg: 'blue' }),
      ],
    };

    const entry = (label: string, page: number) => leader(label, { page }, String(page));

    return {
      number: PAGE.index,
      title: dev.name,
      band: 'blue',
      titleFg: 'yellow',
      masthead,
      footer: row([
        { text: MARGIN + 'Made with ' },
        { text: '♥', fg: 'red' },
        { text: ' using Angular' },
      ]),
      blocks: [
        blank(),
        text(`Hi, I'm ${dev.name}`, { fg: 'yellow' }),
        text(HERO_TITLES.join(', '), { fg: 'cyan' }),
        blank(),
        entry('About Me', PAGE.about),
        entry('Technologies', PAGE.technologies),
        entry('My Projects', PAGE.projects),
        entry('Work Experience', PAGE.experience),
        entry('Education', PAGE.education),
        entry('Certificates', PAGE.certificates),
        entry('Get In Touch', PAGE.contact),
        entry('Send Message', PAGE.message),
        leader('Download CV', CV, 'PDF'),
        blank(),
        text(
          gridCols() === COLS
            ? 'Key in a 3-digit page number, or use the coloured keys below.'
            : 'Tap a topic, or use the coloured buttons below.',
        ),
        blank(),
        text(`© ${new Date().getFullYear()} Portfolio · All rights reserved`),
      ],
    };
  }

  // P200 ---------------------------------------------------------------------

  private projectPages(projects: Project[]): TtPageSource[] {
    const numbered = projects.map((project, i) => ({ project, page: PAGE.projects + 1 + i }));
    const categories = [...new Set(projects.map((p) => p.category ?? 'Other project'))];

    const index: TtBlock[] = [
      blank(),
      text('A selection of my recent work and personal projects', { fg: 'cyan' }),
    ];
    for (const category of categories) {
      index.push(blank(), heading(`${category}s`));
      for (const { project, page } of numbered.filter(
        (n) => (n.project.category ?? 'Other project') === category,
      )) {
        index.push(
          leader(project.title, { page }, String(page), {
            marker: project.featured ? { text: '* ', fg: 'yellow' } : { text: '  ' },
          }),
        );
      }
    }
    index.push(blank(), text('* Featured', { fg: 'yellow' }));

    const detail = numbered.map(({ project, page }, i): TtPageSource => {
      const meta = [project.category, project.featured ? 'Featured' : null].filter(Boolean);
      const blocks: TtBlock[] = [blank(), heading(project.title)];
      if (meta.length) blocks.push(text(meta.join(' · '), { fg: 'cyan' }));
      if (project.completedDate) {
        blocks.push(text(`Completed: ${formatMonthYear(project.completedDate)}`));
      }
      blocks.push(blank(), text(project.description, { fg: 'cyan' }));
      if (project.longDescription) {
        blocks.push(blank(), heading('About this project'), text(project.longDescription));
      }
      blocks.push(
        blank(),
        heading('Technologies Used'),
        text(project.technologies.join(', '), { fg: 'cyan' }),
      );
      if (project.demoUrl || project.githubUrl) blocks.push(blank());
      if (project.demoUrl) {
        blocks.push(
          keyValue('Live Demo', stripScheme(project.demoUrl), {
            labelWidth: 10,
            link: { href: project.demoUrl },
          }),
        );
      }
      if (project.githubUrl) {
        blocks.push(
          keyValue('Code', stripScheme(project.githubUrl), {
            labelWidth: 10,
            link: { href: project.githubUrl },
          }),
        );
      }
      return {
        number: page,
        title: 'My Projects',
        band: 'red',
        titleFg: 'white',
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
        titleFg: 'white',
        parent: PAGE.index,
        blocks: index,
      },
      ...detail,
    ];
  }

  // P300 ---------------------------------------------------------------------

  private experiencePages(experiences: Experience[]): TtPageSource[] {
    const numbered = experiences.map((exp, i) => ({ exp, page: PAGE.experience + 1 + i }));

    const index: TtBlock[] = [
      blank(),
      text('My professional journey', { fg: 'cyan' }),
      blank(),
      heading('Work Experience'),
      ...numbered.map(({ exp, page }) =>
        leader(exp.position, { page }, String(page), {
          sub: `${exp.company}, ${new Date(exp.startDate).getFullYear()}`,
        }),
      ),
      blank(),
      leader('Education', { page: PAGE.education }, String(PAGE.education)),
      leader('Certificates', { page: PAGE.certificates }, String(PAGE.certificates)),
    ];

    const detail = numbered.map(({ exp, page }, i): TtPageSource => {
      const period = `${formatMonthYear(exp.startDate)} - ${
        exp.current ? 'Present' : formatMonthYear(exp.endDate!)
      }`;
      const where = [exp.type, exp.location].filter(Boolean).join(' · ');
      const blocks: TtBlock[] = [
        blank(),
        heading(exp.position),
        text(exp.company, { fg: 'cyan' }),
        text(period),
      ];
      if (where) blocks.push(text(where));
      blocks.push(blank(), text(exp.description));
      if (exp.achievements?.length) {
        blocks.push(blank(), heading('Achievements'), ...exp.achievements.map((a) => bullet(a)));
      }
      if (exp.technologies?.length) {
        blocks.push(
          blank(),
          heading('Technologies'),
          text(exp.technologies.join(', '), { fg: 'cyan' }),
        );
      }
      return {
        number: page,
        title: 'Work Experience',
        band: 'blue',
        titleFg: 'cyan',
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
        titleFg: 'cyan',
        parent: PAGE.index,
        blocks: index,
      },
      ...detail,
    ];
  }

  private educationPage(education: Education[]): TtPageSource {
    const blocks: TtBlock[] = [];
    for (const edu of education) {
      blocks.push(
        blank(),
        heading(edu.degree),
        text(`${edu.institution} · ${edu.year}`, { fg: 'cyan' }),
        text(edu.description),
      );
      if (edu.technologies?.length) {
        blocks.push(text(edu.technologies.join(', '), { fg: 'cyan' }));
      }
    }
    return {
      number: PAGE.education,
      title: 'Education',
      band: 'blue',
      titleFg: 'cyan',
      parent: PAGE.experience,
      next: PAGE.certificates,
      blocks,
    };
  }

  private certificatesPage(certificates: Certificate[]): TtPageSource {
    const blocks: TtBlock[] = [];
    for (const cert of certificates) {
      const dates =
        formatShortMonthYear(cert.achievedDate) +
        (cert.expiryDate ? ` - Expires: ${formatShortMonthYear(cert.expiryDate)}` : '');
      blocks.push(
        blank(),
        stack('li', [
          text(cert.name, { fg: 'yellow' }),
          text(cert.issuer, { fg: 'cyan' }),
          text(dates),
        ]),
      );
    }
    return {
      number: PAGE.certificates,
      title: 'Certificates',
      band: 'blue',
      titleFg: 'cyan',
      parent: PAGE.experience,
      blocks,
    };
  }

  // P400 ---------------------------------------------------------------------

  private aboutPage(dev: Developer): TtPageSource {
    const blocks: TtBlock[] = [
      blank(),
      text('Get to know me better', { fg: 'cyan' }),
      blank(),
      heading(`I'm ${dev.name}`),
      text(dev.bio),
      blank(),
    ];
    if (dev.email) {
      blocks.push(keyValue('Email', dev.email, { link: { href: `mailto:${dev.email}` } }));
    }
    if (dev.location) blocks.push(keyValue('Location', dev.location));
    blocks.push(
      blank(),
      heading('My Skills'),
      text(dev.skills.join(', '), { fg: 'cyan' }),
      blank(),
      ...STATS.map((stat) =>
        keyValue(stat.value, stat.label, { labelWidth: 6, labelFg: 'yellow' }),
      ),
      blank(),
      text('Passionate web developer creating amazing digital experiences.'),
      blank(),
      heading('Services'),
      text(SERVICES.join(' · '), { fg: 'cyan' }),
      blank(),
      leader('Technologies', { page: PAGE.technologies }, String(PAGE.technologies)),
      leader('Download CV', CV, 'PDF'),
    );
    return {
      number: PAGE.about,
      title: 'About Me',
      band: 'blue',
      titleFg: 'yellow',
      parent: PAGE.index,
      next: PAGE.technologies,
      blocks,
    };
  }

  private technologiesPage(technologies: Technology[]): TtPageSource {
    const blocks: TtBlock[] = [
      blank(),
      text('The tools and frameworks I work with', { fg: 'cyan' }),
    ];
    const longest = Math.max(...technologies.map((t) => t.name.length));
    for (const category of Object.values(TechCategory)) {
      const names = technologies.filter((t) => t.category === category).map((t) => t.name);
      if (names.length) blocks.push(blank(), heading(category), columns(names, 3, 'white', longest));
    }
    return {
      number: PAGE.technologies,
      title: 'Technologies',
      band: 'blue',
      titleFg: 'yellow',
      parent: PAGE.about,
      next: PAGE.contact,
      blocks,
    };
  }

  private contactPage(dev: Developer): TtPageSource {
    const blocks: TtBlock[] = [
      blank(),
      text("Let's build something great together", { fg: 'cyan' }),
      blank(),
    ];
    if (dev.email) {
      blocks.push(keyValue('Email', dev.email, { link: { href: `mailto:${dev.email}` } }));
    }
    if (dev.phone) {
      blocks.push(
        keyValue('Phone', dev.phone, { link: { href: `tel:${dev.phone.replace(/\s+/g, '')}` } }),
      );
    }
    if (dev.location) blocks.push(keyValue('Location', dev.location));
    blocks.push(blank(), heading('Follow me on social media'));
    if (dev.social.github) {
      blocks.push(
        keyValue('GitHub', stripScheme(dev.social.github), { link: { href: dev.social.github } }),
      );
    }
    if (dev.social.linkedin) {
      blocks.push(
        keyValue('LinkedIn', stripScheme(dev.social.linkedin), {
          link: { href: dev.social.linkedin },
        }),
      );
    }
    blocks.push(
      blank(),
      text('Working for Axxes IT Consultancy.'),
      text('Response time within 24 hours.'),
      blank(),
      leader('Send Message', { page: PAGE.message }, String(PAGE.message)),
      leader('Download CV', CV, 'PDF'),
    );
    return {
      number: PAGE.contact,
      title: 'Get In Touch',
      band: 'blue',
      titleFg: 'yellow',
      parent: PAGE.index,
      next: PAGE.message,
      blocks,
    };
  }

  private messagePage(): TtPageSource {
    return {
      number: PAGE.message,
      title: 'Send Message',
      band: 'blue',
      titleFg: 'yellow',
      parent: PAGE.contact,
      form: 'contact',
      blocks: [],
    };
  }
}

// Desktop pages are split into 40x25 sub-pages; on a phone grid the page is
// one continuous scroll, so there's nothing to flip through.
function compose(source: TtPageSource, cols: number): TtPage {
  const { blocks, ...meta } = source;
  const titleRows = source.masthead ? blockHeight(source.masthead) : 2;
  const capacity = cols === COLS ? contentCapacity(titleRows) : Infinity;
  return { ...meta, subPages: paginate(blocks, capacity) };
}

// Several short paragraphs that read as one item (and never split).
function stack(tag: 'li' | 'p', parts: TtBlock[]): TtBlock {
  return { tag, keepTogether: true, rows: parts.flatMap((p) => p.rows) };
}

function stripScheme(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

function formatMonthYear(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

function formatShortMonthYear(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}
