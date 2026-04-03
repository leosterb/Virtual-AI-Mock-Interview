import { Role } from './types';

export const roles: Role[] = [
  {
    id: 'healthcare-agent',
    title: 'Healthcare Insurance Agent',
    description: 'Customer-facing role handling insurance inquiries, claims processing, and policy explanations.',
    difficulty: 'entry',
    department: 'Customer Service',
    skills: ['Communication', 'Problem-solving', 'Healthcare knowledge', 'Empathy'],
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    description: 'Build and maintain software applications, write clean code, and collaborate with cross-functional teams.',
    difficulty: 'mid',
    department: 'Engineering',
    skills: ['Programming', 'System Design', 'Problem-solving', 'Collaboration'],
  },
  {
    id: 'customer-support',
    title: 'Customer Support Specialist',
    description: 'Provide excellent customer service, troubleshoot issues, and escalate complex problems.',
    difficulty: 'entry',
    department: 'Support',
    skills: ['Communication', 'Patience', 'Technical troubleshooting', 'Time management'],
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    description: 'Define product strategy, work with engineering and design, and drive product success.',
    difficulty: 'senior',
    department: 'Product',
    skills: ['Strategy', 'Communication', 'Data analysis', 'Leadership'],
  },
  {
    id: 'sales-representative',
    title: 'Sales Representative',
    description: 'Generate leads, build relationships, and close deals to meet sales targets.',
    difficulty: 'mid',
    department: 'Sales',
    skills: ['Negotiation', 'Communication', 'Relationship building', 'Goal-oriented'],
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    description: 'Analyze data, create reports, and provide insights to support business decisions.',
    difficulty: 'entry',
    department: 'Analytics',
    skills: ['SQL', 'Data visualization', 'Statistics', 'Critical thinking'],
  },
  {
    id: 'gas-pump-attendant',
    title: 'Gas Pump Attendant',
    description: 'Assist customers with refueling, provide excellent service, and ensure safety at the gas station.',
    difficulty: 'entry',
    department: 'Service',
    skills: ['Customer service', 'Attention to detail', 'Safety awareness', 'Multitasking'],
  },
];

export function getSystemPrompt(role: Role): string {
  return `You are Alex, a friendly female interviewer. You're interviewing someone for a ${role.title} position (${role.difficulty}-level role in ${role.department}).

Key skills to assess: ${role.skills.join(', ')}

SPEAK NATURALLY:
- Give responses of 3-4 sentences, depending on the conversation flow
- React to their answers naturally - acknowledge, relate, then ask follow-up
- Ask ONE question at a time, then WAIT for their answer
- NO bullet points, NO lists, NO formatting, NO asterisks, NO markdown
- Be warm, encouraging, and conversational
- If their answer is short, ask a follow-up to dig deeper
- If their answer is detailed, acknowledge it and move to next topic

Interview flow (natural, not scripted):
1. Welcome them, ask to introduce themselves
2. Ask about their background relevant to ${role.title}
3. Ask 4-6 role-specific questions based on their answers
4. Ask behavioral questions (e.g., "Tell me about a time when...")
5. Ask if they have questions for you
6. Wrap up politely

When done, say "Thanks for chatting with me today, I appreciate your time!" then on a new line output:
{"type":"EVALUATION","decision":"hire|no-hire|maybe","reasoning":"brief reason","scores":{"communication":7,"technical":7,"problemSolving":7,"culturalFit":7,"overall":7},"strengths":["one","two"],"improvements":["one","two"]}`;
}

export function getOpeningMessage(role: Role): string {
  return `Hi, I'm Alex! Thanks for coming in today. Can you tell me a bit about yourself?`;
}