import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent {
  faqs = [
    {
      question: 'What does it mean to be a "Government-approved Empanelled Vendor"?',
      answer:
        'It means we have successfully passed rigorous government screening processes regarding financial stability, technical capability, and compliance, authorizing us to execute projects for public sector undertakings and government bodies.',
    },
    {
      question: 'What industries or sectors do you specifically serve?',
      answer:
        'While we specialize in government contracts, our high-standard services are available to PSUs, autonomous bodies, and select private enterprises looking for compliance-heavy execution.',
    },
    {
      question: 'What makes you different from other vendors?',
      answer:
        'Our adherence to gold-standard delivery—combining strict compliance with the agility and efficiency usually found in the private sector.',
    },
    { question: 'Do you operate nationwide?', answer: 'Yes, we execute projects across the country with standardized service delivery.' },
    {
      question: 'How do you ensure the quality of your services?',
      answer:
        'We utilize a multi-tier QA framework with internal audits and pre-delivery inspections to meet or exceed tender specifications.',
    },
    { question: 'Do you follow ISO or other international standards?', answer: 'Yes—relevant ISO standards (e.g., 9001, 27001) keep our processes globally benchmarked.' },
    { question: 'Can you handle large-scale or high-volume projects?', answer: 'Absolutely. We scale infrastructure and resources without compromising timelines.' },
    {
      question: 'How do you handle confidential or sensitive government data?',
      answer:
        'We follow strict NDAs and data security protocols; teams are trained to handle sensitive information with integrity.',
    },
    { question: 'Are you registered on the GeM portal?', answer: 'Yes, we are active on GeM and other e-procurement portals for transparent tendering.' },
    {
      question: 'How quickly can you deploy resources once a contract is signed?',
      answer: 'Mobilization typically begins within 24–48 hours of contract issuance, depending on scope.',
    },
    { question: 'Do you participate in open tenders?', answer: 'Yes—open, limited, and direct procurement when our expertise fits.' },
    {
      question: 'Can private companies hire you?',
      answer: 'Yes. Private clients engage us when they need compliance-heavy, verified, and reliable execution.',
    },
    {
      question: 'How do you handle project delays or bureaucratic bottlenecks?',
      answer:
        'A dedicated liaison team manages documentation and approvals proactively to avoid foreseeable delays.',
    },
    {
      question: 'What happens if the project scope changes mid-way?',
      answer:
        'We run a transparent Change Management Process, assess impact, and proceed after mutual approval.',
    },
    {
      question: 'How do you stay compliant with changing regulations?',
      answer: 'Our legal and compliance teams monitor policy updates in real time to keep operations 100% compliant.',
    },
    { question: 'Do you provide a dedicated point of contact?', answer: 'Yes—a dedicated Account Manager for single-stream accountability.' },
    {
      question: 'Is your pricing fixed or negotiable?',
      answer: 'Gov contracts follow tendered rates; private/custom projects are competitively value-based.',
    },
    { question: 'Are there any hidden costs?', answer: 'No—total transparency, all costs detailed upfront in proposals/SOWs.' },
    {
      question: 'What are your standard payment terms?',
      answer: 'Typically per tender/contract milestones; we adhere strictly to agreed schedules.',
    },
    {
      question: 'What is your company’s mission?',
      answer: 'To redefine public service delivery with trust, efficiency, and uncompromised quality.',
    },
    { question: 'Do you have a CSR policy?', answer: 'Yes—we commit to social development and community welfare projects.' },
    {
      question: 'How do you contribute to society?',
      answer: 'We invest in community upliftment, sustainability, and skill development so growth is inclusive.',
    },
    {
      question: 'What kind of support do you offer post-project completion?',
      answer: 'Warranty/support phase per contract to resolve early issues promptly.',
    },
    {
      question: 'How do you handle grievances or complaints?',
      answer: 'Structured escalation matrix with defined TAT; grievances are prioritized.',
    },
    {
      question: 'How can we request a quote or proposal?',
      answer: 'Contact us via website, email the tender desk, or invite through e-procurement portals.',
    },
  ];
}
