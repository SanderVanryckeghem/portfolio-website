import { Injectable, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PortfolioService } from './portfolio';
import { Developer } from '../models/developer.model';
import { Experience } from '../models/experience.model';
import { Education } from '../models/education.model';
import { Technology } from '../models/technology.model';
import { Certificate } from '../models/certificate.model';
import { Project } from '../models/project.model';
import jsPDF from 'jspdf';

interface CVColors {
  primary: [number, number, number];
  dark: [number, number, number];
  gray: [number, number, number];
  lightGray: [number, number, number];
  sidebarBg: [number, number, number];
  white: [number, number, number];
}

interface CVData {
  developer: Developer;
  experiences: Experience[];
  education: Education[];
  technologies: Technology[];
  certificates: Certificate[];
  projects: Project[];
}

@Injectable({
  providedIn: 'root',
})
export class CVGeneratorService {
  private readonly portfolioService = inject(PortfolioService);

  // Layout constants
  private readonly PAGE_HEIGHT = 297; // A4 height in mm
  private readonly SIDEBAR_WIDTH = 70;
  private readonly CONTENT_START = 75;
  private readonly CONTENT_WIDTH = 125;
  private readonly SIDEBAR_PADDING = 8;

  private getActiveColors(): CVColors {
    const rootStyles = getComputedStyle(document.documentElement);
    const accentColor = rootStyles.getPropertyValue('--accent').trim();

    return {
      primary: this.hexToRgb(accentColor),
      dark: [51, 51, 51],
      gray: [102, 102, 102],
      lightGray: [180, 180, 180],
      sidebarBg: [235, 235, 235],
      white: [255, 255, 255],
    };
  }

  private hexToRgb(hex: string): [number, number, number] {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return [249, 115, 22]; // Default orange
    }
    return [r, g, b];
  }

  generateCV(): void {
    forkJoin({
      developer: this.portfolioService.getDeveloper(),
      experiences: this.portfolioService.getExperiences(),
      education: this.portfolioService.getEducation(),
      technologies: this.portfolioService.getTechnologies(),
      certificates: this.portfolioService.getCertificates(),
      projects: this.portfolioService.getCVProjects(),
    }).subscribe(async (data) => {
      const avatarBase64 = await this.loadImageAsBase64(data.developer.avatar);
      this.createPDF(data, avatarBase64);
    });
  }

  private loadImageAsBase64(imagePath: string): Promise<string | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imagePath;
    });
  }

  private createPDF(data: CVData, avatarBase64: string | null): void {
    const doc = new jsPDF();
    const colors = this.getActiveColors();

    // Page 1
    this.drawSidebarBackground(doc, colors);
    let sidebarY = this.addSidebarHeader(doc, data.developer, colors);
    sidebarY = this.addSidebarEducation(doc, data.education, sidebarY, colors);
    sidebarY = this.addSidebarLanguages(doc, sidebarY, colors);
    this.addSidebarExpertise(doc, data.technologies, sidebarY, colors);

    let contentY = this.addContentHeader(doc, data.developer, colors, avatarBase64);
    contentY = this.addContentProfile(doc, data.developer, contentY, colors);
    const { createdNewPage } = this.addContentExperience(doc, data.experiences, contentY, colors);

    // Page for Certificates and Projects
    doc.addPage();
    this.drawSidebarBackground(doc, colors);
    // Only add Profile and Interests to sidebar if not already added during experience overflow
    if (!createdNewPage) {
      const sidebar2Y = this.addSidebarProfile(doc, 15, colors);
      this.addSidebarInterests(doc, sidebar2Y, colors);
    }

    let content2Y = this.addContentProjects(doc, data.projects, 20, colors);
    this.addContentCertificates(doc, data.certificates, content2Y, colors);

    // Save
    const fileName = `${data.developer.name.replace(/\s+/g, '_')}_CV.pdf`;
    doc.save(fileName);
  }

  private drawSidebarBackground(doc: jsPDF, colors: CVColors): void {
    doc.setFillColor(...colors.sidebarBg);
    doc.rect(0, 0, this.SIDEBAR_WIDTH, this.PAGE_HEIGHT, 'F');
  }

  // ============ SIDEBAR - PAGE 1 ============

  private addSidebarHeader(doc: jsPDF, developer: Developer, colors: CVColors): number {
    let y = 25;
    const x = this.SIDEBAR_PADDING;

    // Name split into first and last
    const nameParts = developer.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // First name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(...colors.dark);
    doc.text(firstName, x, y);
    y += 9;

    // Last name
    doc.setFontSize(22);
    doc.text(lastName, x, y);
    y += 12;

    // Role badges with orange bar
    const roles = ['FRONT-END DEVELOPER', 'MOBILE DEVELOPER', 'FULLSTACK DEVELOPER'];
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');

    for (const role of roles) {
      // Orange bar
      doc.setFillColor(...colors.primary);
      doc.rect(x, y - 3.5, 2, 4, 'F');
      // Role text
      doc.setTextColor(...colors.dark);
      doc.text(role, x + 5, y);
      y += 6;
    }

    y += 4;

    // Location
    doc.setFontSize(9);
    doc.setTextColor(...colors.gray);
    doc.text(developer.location, x, y);
    y += 15;

    return y;
  }

  private addSidebarEducation(
    doc: jsPDF,
    education: Education[],
    startY: number,
    colors: CVColors,
  ): number {
    let y = startY;
    const x = this.SIDEBAR_PADDING;
    const maxWidth = this.SIDEBAR_WIDTH - this.SIDEBAR_PADDING * 2;

    // Section title
    y = this.addSidebarSectionTitle(doc, 'EDUCATION', x, y, colors);

    for (const edu of education) {
      // Degree (bold, uppercase for first line)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...colors.dark);

      const degreeLines = doc.splitTextToSize(edu.degree.toUpperCase(), maxWidth);
      doc.text(degreeLines, x, y);
      y += degreeLines.length * 4;

      // Institution
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...colors.dark);
      doc.text(edu.institution, x, y);
      y += 4;

      // Year
      doc.setFontSize(8);
      doc.setTextColor(...colors.gray);
      doc.text(edu.year, x, y);
      y += 10;
    }

    return y;
  }

  private addSidebarLanguages(doc: jsPDF, startY: number, colors: CVColors): number {
    let y = startY;
    const x = this.SIDEBAR_PADDING;

    y = this.addSidebarSectionTitle(doc, 'LANGUAGES', x, y, colors);

    const languages = [
      { name: 'Dutch', level: 'Native language' },
      { name: 'English', level: 'Professional' },
      { name: 'French', level: 'Basic' },
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    for (const lang of languages) {
      doc.setFillColor(...colors.dark);
      doc.circle(x + 1.5, y - 1.2, 0.8, 'F');
      doc.setTextColor(...colors.dark);
      doc.text(`${lang.name} – ${lang.level}`, x + 5, y);
      y += 5;
    }

    return y + 8;
  }

  private addSidebarExpertise(
    doc: jsPDF,
    technologies: Technology[],
    startY: number,
    colors: CVColors,
  ): number {
    let y = startY;
    const x = this.SIDEBAR_PADDING;

    y = this.addSidebarSectionTitle(doc, 'EXPERTISE', x, y, colors);

    // Sort by proficiency and take top skills
    const skills = [...technologies]
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 10)
      .map((t) => t.name);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.dark);

    for (const skill of skills) {
      doc.setFillColor(...colors.dark);
      doc.circle(x + 1.5, y - 1.2, 0.8, 'F');
      doc.text(skill, x + 5, y);
      y += 5;
    }

    return y;
  }

  // ============ SIDEBAR - PAGE 2 ============

  private addSidebarProfile(doc: jsPDF, startY: number, colors: CVColors): number {
    let y = startY;
    const x = this.SIDEBAR_PADDING;

    y = this.addSidebarSectionTitle(doc, 'PROFILE', x, y, colors);

    const traits = ['Targeted', 'Teamplayer', 'Eager to learn', 'Caring', 'Problem-solving'];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.dark);

    for (const trait of traits) {
      doc.setFillColor(...colors.dark);
      doc.circle(x + 1.5, y - 1.2, 0.8, 'F');
      doc.text(trait, x + 5, y);
      y += 5;
    }

    return y + 10;
  }

  private addSidebarInterests(doc: jsPDF, startY: number, colors: CVColors): number {
    let y = startY;
    const x = this.SIDEBAR_PADDING;

    y = this.addSidebarSectionTitle(doc, 'INTERESTS', x, y, colors);

    const interests = ['Skiing', 'Travelling', 'Cycling', 'Padel'];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.dark);

    for (const interest of interests) {
      doc.setFillColor(...colors.dark);
      doc.circle(x + 1.5, y - 1.2, 0.8, 'F');
      doc.text(interest, x + 5, y);
      y += 5;
    }

    return y;
  }

  private addSidebarSectionTitle(
    doc: jsPDF,
    title: string,
    x: number,
    y: number,
    colors: CVColors,
  ): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...colors.dark);

    // Add letter spacing effect
    const spacedTitle = title.split('').join(' ');
    doc.text(spacedTitle, x, y);

    // Underline
    y += 2;
    doc.setDrawColor(...colors.dark);
    doc.setLineWidth(0.5);
    doc.line(x, y, x + 20, y);

    return y + 8;
  }

  // ============ CONTENT - PAGE 1 ============

  private addContentHeader(
    doc: jsPDF,
    developer: Developer,
    colors: CVColors,
    avatarBase64: string | null,
  ): number {
    let y = 25;
    const x = this.CONTENT_START;

    // Profile photo - aligned with section titles
    const photoSize = 25;
    const photoX = x;
    const photoY = y;

    if (avatarBase64) {
      // Add the actual profile image
      doc.addImage(avatarBase64, 'PNG', photoX, photoY, photoSize, photoSize);
    } else {
      // Fallback: draw placeholder circle
      doc.setDrawColor(...colors.lightGray);
      doc.setLineWidth(0.5);
      doc.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2);
    }

    // Contact info to the right of photo
    const contactX = photoX + photoSize + 15;
    const iconOffset = 5; // Space for icon + gap
    let contactY = y + 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.dark);

    // Email with icon
    this.drawEmailIcon(doc, contactX, contactY - 2, colors);
    doc.text(developer.email, contactX + iconOffset, contactY);
    contactY += 6;

    // Phone with icon
    this.drawPhoneIcon(doc, contactX, contactY - 2, colors);
    doc.text('+32499470343', contactX + iconOffset, contactY);
    contactY += 6;

    // Website with icon
    this.drawWebsiteIcon(doc, contactX, contactY - 2, colors);
    doc.text('sandervanryckeghem.be', contactX + iconOffset, contactY);
    contactY += 6;

    // GitHub with icon
    if (developer.social?.github) {
      this.drawGitHubIcon(doc, contactX, contactY - 2, colors);
      doc.text(developer.social.github.replace('https://', ''), contactX + iconOffset, contactY);
    }

    return y + photoSize + 15;
  }

  private addContentProfile(
    doc: jsPDF,
    developer: Developer,
    startY: number,
    colors: CVColors,
  ): number {
    let y = startY;
    const x = this.CONTENT_START;
    const maxWidth = this.CONTENT_WIDTH - 10;

    y = this.addContentSectionTitle(doc, 'PROFILE', x, y, colors);

    // Bio text from developer data
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.dark);

    // Use the bio from developer data, with additional paragraph for personal touch
    const bioText = developer.bio;
    const bioLines = doc.splitTextToSize(bioText, maxWidth);
    doc.text(bioLines, x, y);
    y += bioLines.length * 4 + 10;

    return y;
  }

  private addContentExperience(
    doc: jsPDF,
    experiences: Experience[],
    startY: number,
    colors: CVColors,
  ): { y: number; createdNewPage: boolean } {
    let y = startY;
    const x = this.CONTENT_START;
    const maxWidth = this.CONTENT_WIDTH - 10;

    y = this.addContentSectionTitle(doc, 'EXPERIENCE', x, y, colors);

    // Sort experiences by start date (newest first)
    const sortedExp = [...experiences].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );

    // Track if we've added sidebar content to overflow pages
    let createdNewPage = false;

    // Show each experience individually
    for (const exp of sortedExp) {
      if (y > 250) {
        doc.addPage();
        this.drawSidebarBackground(doc, colors);
        // Add Profile and Interests to sidebar on overflow pages
        if (!createdNewPage) {
          const sidebar2Y = this.addSidebarProfile(doc, 15, colors);
          this.addSidebarInterests(doc, sidebar2Y, colors);
          createdNewPage = true;
        }
        y = 20;
      }

      // Position title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      doc.text(exp.position, x, y);

      // Date on the right
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...colors.gray);
      const dateStr = exp.current
        ? `${this.formatDateShort(exp.startDate)} – Present`
        : `${this.formatDateShort(exp.startDate)} – ${this.formatDateShort(exp.endDate!)}`;
      doc.text(dateStr, x + maxWidth - 30, y);
      y += 5;

      // Company
      doc.setTextColor(...colors.dark);
      doc.text(exp.company, x, y);
      y += 6;

      // Description
      doc.setFontSize(9);
      const descLines = doc.splitTextToSize(exp.description, maxWidth);
      doc.text(descLines, x, y);
      y += descLines.length * 4 + 2;

      // Achievements (if any)
      if (exp.achievements && exp.achievements.length > 0) {
        const bulletIndent = 6;
        const achievementMaxWidth = maxWidth - bulletIndent;
        for (const achievement of exp.achievements.slice(0, 3)) {
          doc.setFillColor(...colors.dark);
          doc.circle(x + 3, y - 1, 0.6, 'F');
          const achievementLines = doc.splitTextToSize(achievement, achievementMaxWidth);
          doc.text(achievementLines[0], x + bulletIndent, y);
          y += 4;
          // Render additional lines without bullet point
          for (let i = 1; i < achievementLines.length; i++) {
            doc.text(achievementLines[i], x + bulletIndent, y);
            y += 4;
          }
        }
      }

      // Technologies
      if (exp.technologies && exp.technologies.length > 0) {
        y += 2;
        doc.setFontSize(8);
        doc.setTextColor(...colors.primary);
        const techText = exp.technologies.slice(0, 5).join(' • ');
        doc.text(techText, x, y);
        y += 4;
      }

      y += 8;
    }

    return { y, createdNewPage };
  }

  private addContentSectionTitle(
    doc: jsPDF,
    title: string,
    x: number,
    y: number,
    colors: CVColors,
  ): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...colors.dark);

    // Add letter spacing effect
    const spacedTitle = title.split('').join(' ');
    doc.text(spacedTitle, x, y);

    // Underline
    y += 2;
    doc.setDrawColor(...colors.dark);
    doc.setLineWidth(0.5);
    doc.line(x, y, x + 25, y);

    return y + 8;
  }

  // ============ CONTENT - PAGE 2 ============

  private addContentCertificates(
    doc: jsPDF,
    certificates: Certificate[],
    startY: number,
    colors: CVColors,
  ): number {
    let y = startY;
    const x = this.CONTENT_START;
    const maxWidth = this.CONTENT_WIDTH - 10;

    y = this.addContentSectionTitle(doc, 'CERTIFICATES', x, y, colors);

    // Sort by date (newest first)
    const sortedCerts = [...certificates].sort(
      (a, b) => new Date(b.achievedDate).getTime() - new Date(a.achievedDate).getTime(),
    );

    for (const cert of sortedCerts) {
      // Certificate name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      doc.text(cert.name, x, y);

      // Date on the right
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...colors.gray);
      const dateStr = this.formatCertDate(cert.achievedDate);
      const expiryStr = cert.expiryDate
        ? ` - expires: ${this.formatCertDate(cert.expiryDate)}`
        : ' - expires: never';
      doc.text(`obtained: ${dateStr}${expiryStr}`, x + maxWidth - 50, y);
      y += 5;

      // Issuer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...colors.dark);
      doc.text(cert.issuer, x, y);
      y += 10;
    }

    return y;
  }

  private addContentProjects(
    doc: jsPDF,
    projects: Project[],
    startY: number,
    colors: CVColors,
  ): number {
    let y = startY + 5;
    const x = this.CONTENT_START;
    const maxWidth = this.CONTENT_WIDTH - 10;

    if (projects.length === 0) return y;

    y = this.addContentSectionTitle(doc, 'PROJECTS', x, y, colors);

    for (const project of projects) {
      if (y > 260) {
        doc.addPage();
        this.drawSidebarBackground(doc, colors);
        y = 20;
      }

      // Project title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      doc.text(project.title, x, y);

      // Date if available
      if (project.completedDate) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...colors.gray);
        doc.text(this.formatCertDate(project.completedDate), x + maxWidth - 15, y);
      }
      y += 5;

      // Description
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...colors.dark);
      const desc = project.longDescription || project.description;
      const descLines = doc.splitTextToSize(desc, maxWidth);
      doc.text(descLines.slice(0, 4), x, y); // Limit to 4 lines
      y += Math.min(descLines.length, 4) * 4 + 2;

      // Technologies
      if (project.technologies && project.technologies.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(...colors.primary);
        const techText = project.technologies.slice(0, 6).join(' • ');
        doc.text(techText, x, y);
        y += 4;
      }

      y += 8;
    }

    return y;
  }

  // ============ ICONS ============

  private drawEmailIcon(doc: jsPDF, x: number, y: number, colors: CVColors): void {
    const size = 3;
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.3);
    // Envelope rectangle
    doc.rect(x, y, size, size * 0.7);
    // Envelope flap (V shape)
    doc.line(x, y, x + size / 2, y + size * 0.4);
    doc.line(x + size / 2, y + size * 0.4, x + size, y);
  }

  private drawPhoneIcon(doc: jsPDF, x: number, y: number, colors: CVColors): void {
    const size = 3;
    doc.setDrawColor(...colors.primary);
    doc.setFillColor(...colors.primary);
    doc.setLineWidth(0.3);
    // Phone rectangle with rounded appearance
    doc.roundedRect(x + 0.3, y - 0.3, size * 0.6, size * 0.9, 0.3, 0.3, 'S');
    // Small speaker line at top
    doc.line(x + 0.7, y, x + 1.3, y);
    // Home button circle at bottom
    doc.circle(x + 1.2, y + size * 0.7, 0.2, 'S');
  }

  private drawWebsiteIcon(doc: jsPDF, x: number, y: number, colors: CVColors): void {
    const size = 3;
    const centerX = x + size / 2;
    const centerY = y + size / 2 - 0.2;
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.3);
    // Globe circle
    doc.circle(centerX, centerY, size / 2, 'S');
    // Horizontal line through middle
    doc.line(x, centerY, x + size, centerY);
    // Vertical ellipse line
    doc.ellipse(centerX, centerY, size * 0.2, size / 2, 'S');
  }

  private drawGitHubIcon(doc: jsPDF, x: number, y: number, colors: CVColors): void {
    const size = 3;
    const centerX = x + size / 2;
    const centerY = y + size / 2 - 0.2;
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.3);
    // Circle for the octocat head
    doc.circle(centerX, centerY, size / 2, 'S');
    // Simple face elements
    doc.setFillColor(...colors.primary);
    // Two small eyes
    doc.circle(centerX - 0.4, centerY - 0.2, 0.2, 'F');
    doc.circle(centerX + 0.4, centerY - 0.2, 0.2, 'F');
    // Small smile curve approximated with a line
    doc.line(centerX - 0.3, centerY + 0.4, centerX + 0.3, centerY + 0.4);
  }

  private formatDateShort(date: Date): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${year}`;
  }

  private formatCertDate(date: Date): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${year}`;
  }
}
