import { Injectable, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PortfolioService } from './portfolio';
import { Developer } from '../models/developer.model';
import { Experience } from '../models/experience.model';
import { Education } from '../models/education.model';
import { Project } from '../models/project.model';
import { Technology } from '../models/technology.model';
import { Certificate } from '../models/certificate.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root',
})
export class CVGeneratorService {
  private readonly portfolioService = inject(PortfolioService);

  private getActiveColors(): {
    primary: [number, number, number];
    secondary: [number, number, number];
    dark: [number, number, number];
    gray: [number, number, number];
    lightGray: [number, number, number];
  } {
    const rootStyles = getComputedStyle(document.documentElement);

    // Get the accent color from CSS variable
    const accentColor = rootStyles.getPropertyValue('--accent').trim();
    const accentHoverColor = rootStyles.getPropertyValue('--accent-hover').trim();

    // Parse gradient to get secondary color (the end color of the gradient)
    const gradient = rootStyles.getPropertyValue('--gradient').trim();
    const gradientColors = gradient.match(/#[a-fA-F0-9]{6}/g) || [];
    const secondaryHex = gradientColors[1] || accentHoverColor || accentColor;

    return {
      primary: this.hexToRgb(accentColor),
      secondary: this.hexToRgb(secondaryHex),
      dark: [26, 26, 26] as [number, number, number], // Dark text for PDF readability
      gray: [102, 102, 102] as [number, number, number], // Secondary text
      lightGray: [229, 229, 229] as [number, number, number], // Borders/dividers
    };
  }

  private hexToRgb(hex: string): [number, number, number] {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Return default orange if parsing fails
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return [249, 115, 22]; // Default to #f97316
    }

    return [r, g, b];
  }

  generateCV(): void {
    forkJoin({
      developer: this.portfolioService.getDeveloper(),
      experiences: this.portfolioService.getExperiences(),
      education: this.portfolioService.getEducation(),
      projects: this.portfolioService.getProjects(),
      technologies: this.portfolioService.getTechnologies(),
      certificates: this.portfolioService.getCertificates(),
    }).subscribe((data) => {
      this.createPDF(data);
    });
  }

  private createPDF(data: {
    developer: Developer;
    experiences: Experience[];
    education: Education[];
    projects: Project[];
    technologies: Technology[];
    certificates: Certificate[];
  }): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPosition = margin;

    // Get active colors from website theme
    const colors = this.getActiveColors();

    // Header Section
    yPosition = this.addHeader(doc, data.developer, margin, yPosition, contentWidth, colors);

    // About Section
    yPosition = this.addAboutSection(doc, data.developer, margin, yPosition, contentWidth, colors);

    // Skills Section
    yPosition = this.addSkillsSection(doc, data.technologies, margin, yPosition, colors);

    // Check if we need a new page before work experience
    if (yPosition > 220) {
      doc.addPage();
      yPosition = margin;
    }

    // Work Experience Section
    yPosition = this.addExperienceSection(
      doc,
      data.experiences,
      margin,
      yPosition,
      contentWidth,
      colors,
    );

    // Education Section
    yPosition = this.addEducationSection(
      doc,
      data.education,
      margin,
      yPosition,
      contentWidth,
      colors,
    );

    // Projects Section
    yPosition = this.addProjectsSection(
      doc,
      data.projects,
      margin,
      yPosition,
      contentWidth,
      colors,
    );

    // Certificates Section
    this.addCertificatesSection(doc, data.certificates, margin, yPosition, colors);

    // Save the PDF
    const fileName = `${data.developer.name.replace(/\s+/g, '_')}_CV.pdf`;
    doc.save(fileName);
  }

  private addHeader(
    doc: jsPDF,
    developer: Developer,
    margin: number,
    yPosition: number,
    contentWidth: number,
    colors: ReturnType<typeof this.getActiveColors>,
  ): number {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Name
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.dark);
    doc.text(developer.name, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.primary);
    doc.text(developer.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // Contact info
    doc.setFontSize(10);
    doc.setTextColor(...colors.gray);
    const contactInfo = `${developer.email} | ${developer.location}`;
    doc.text(contactInfo, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;

    // Social links
    const socialLinks: string[] = [];
    if (developer.social?.github) {
      socialLinks.push('GitHub: ' + developer.social.github.replace('https://', ''));
    }
    if (developer.social?.linkedin) {
      socialLinks.push('LinkedIn: ' + developer.social.linkedin.replace('https://', ''));
    }
    if (socialLinks.length > 0) {
      doc.setFontSize(9);
      doc.text(socialLinks.join(' | '), pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 4;
    }

    // Divider line
    yPosition += 4;
    doc.setDrawColor(...colors.lightGray);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, margin + contentWidth, yPosition);
    yPosition += 10;

    return yPosition;
  }

  private addAboutSection(
    doc: jsPDF,
    developer: Developer,
    margin: number,
    yPosition: number,
    contentWidth: number,
    colors: ReturnType<typeof this.getActiveColors>,
  ): number {
    // Section title
    yPosition = this.addSectionTitle(doc, 'About Me', margin, yPosition, colors);

    // Bio text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.dark);
    const bioLines = doc.splitTextToSize(developer.bio, contentWidth);
    doc.text(bioLines, margin, yPosition);
    yPosition += bioLines.length * 5 + 10;

    return yPosition;
  }

  private addSkillsSection(
    doc: jsPDF,
    technologies: Technology[],
    margin: number,
    yPosition: number,
    colors: ReturnType<typeof this.getActiveColors>,
  ): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;

    yPosition = this.addSectionTitle(doc, 'Skills', margin, yPosition, colors);

    // Sort by proficiency and display as inline list
    const sortedTech = [...technologies].sort((a, b) => b.proficiency - a.proficiency);
    const skillNames = sortedTech.map((tech) => tech.name);
    const skillsText = skillNames.join('  •  ');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.dark);
    const skillLines = doc.splitTextToSize(skillsText, contentWidth);
    doc.text(skillLines, margin, yPosition);
    yPosition += skillLines.length * 5 + 10;

    return yPosition;
  }

  private addExperienceSection(
    doc: jsPDF,
    experiences: Experience[],
    margin: number,
    yPosition: number,
    contentWidth: number,
    colors: ReturnType<typeof this.getActiveColors>,
  ): number {
    // Check if we need a new page
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition = this.addSectionTitle(doc, 'Work Experience', margin, yPosition, colors);

    // Sort experiences by startDate (newest first)
    const sortedExperiences = [...experiences].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );

    for (const exp of sortedExperiences) {
      // Check for page break
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Position & Company
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.dark);
      doc.text(exp.position, margin, yPosition);
      yPosition += 5;

      // Company and dates
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.primary);
      const dateStr = exp.current
        ? `${this.formatDate(exp.startDate)} - Present`
        : `${this.formatDate(exp.startDate)} - ${this.formatDate(exp.endDate!)}`;
      doc.text(`${exp.company} | ${dateStr}`, margin, yPosition);
      yPosition += 5;

      // Description
      doc.setFontSize(9);
      doc.setTextColor(...colors.gray);
      const descLines = doc.splitTextToSize(exp.description, contentWidth);
      doc.text(descLines, margin, yPosition);
      yPosition += descLines.length * 4 + 3;

      // Achievements
      if (exp.achievements && exp.achievements.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(...colors.dark);
        for (const achievement of exp.achievements.slice(0, 3)) {
          const bulletText = `• ${achievement}`;
          const achLines = doc.splitTextToSize(bulletText, contentWidth - 5);
          doc.text(achLines, margin + 3, yPosition);
          yPosition += achLines.length * 4;
        }
      }

      // Technologies
      if (exp.technologies && exp.technologies.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(...colors.secondary);
        const techText = exp.technologies.join(' • ');
        const techLines = doc.splitTextToSize(techText, contentWidth);
        doc.text(techLines, margin, yPosition);
        yPosition += techLines.length * 4;
      }

      yPosition += 12;
    }

    return yPosition;
  }

  private addEducationSection(
    doc: jsPDF,
    education: Education[],
    margin: number,
    yPosition: number,
    contentWidth: number,
    colors: ReturnType<typeof this.getActiveColors>,
  ): number {
    // Check if we need a new page
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition = this.addSectionTitle(doc, 'Education', margin, yPosition, colors);

    for (const edu of education) {
      // Degree
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.dark);
      doc.text(edu.degree, margin, yPosition);
      yPosition += 5;

      // Institution and year
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.primary);
      doc.text(`${edu.institution} | ${edu.year}`, margin, yPosition);
      yPosition += 5;

      // Description
      doc.setFontSize(9);
      doc.setTextColor(...colors.gray);
      doc.text(edu.description, margin, yPosition);
      yPosition += 5;

      // Technologies learned
      if (edu.technologies && edu.technologies.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(...colors.secondary);
        const techText = edu.technologies.join(' • ');
        const techLines = doc.splitTextToSize(techText, contentWidth);
        doc.text(techLines, margin, yPosition);
        yPosition += techLines.length * 4;
      }

      yPosition += 12;
    }

    return yPosition;
  }

  private addProjectsSection(
    doc: jsPDF,
    projects: Project[],
    margin: number,
    yPosition: number,
    contentWidth: number,
    colors: ReturnType<typeof this.getActiveColors>,
  ): number {
    // Check if we need a new page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition = this.addSectionTitle(doc, 'Projects', margin, yPosition, colors);

    for (const project of projects) {
      // Check for page break
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Project title
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.dark);
      doc.text(project.title, margin, yPosition);
      yPosition += 5;

      // Description
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.gray);
      const descLines = doc.splitTextToSize(project.longDescription, contentWidth);
      doc.text(descLines, margin, yPosition);
      yPosition += descLines.length * 4 + 2;

      // Technologies
      if (project.technologies && project.technologies.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(...colors.secondary);
        const techText = project.technologies.join(' • ');
        doc.text(techText, margin, yPosition);
        yPosition += 4;
      }

      yPosition += 12;
    }

    return yPosition;
  }

  private addCertificatesSection(
    doc: jsPDF,
    certificates: Certificate[],
    margin: number,
    yPosition: number,
    colors: ReturnType<typeof this.getActiveColors>,
  ): number {
    // Check if we need a new page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition = this.addSectionTitle(doc, 'Certificates', margin, yPosition, colors);

    const certData = certificates.map((cert) => [
      cert.name,
      cert.issuer,
      this.formatCertDate(cert.achievedDate),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Certificate', 'Issuer', 'Date']],
      body: certData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: colors.dark,
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
    return yPosition;
  }

  private addSectionTitle(
    doc: jsPDF,
    title: string,
    margin: number,
    yPosition: number,
    colors: ReturnType<typeof this.getActiveColors>,
  ): number {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.primary);
    doc.text(title, margin, yPosition);
    yPosition += 2;

    // Underline
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, margin + 40, yPosition);
    yPosition += 8;

    return yPosition;
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  }

  private formatCertDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  }
}
