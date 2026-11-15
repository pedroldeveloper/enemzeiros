export type EditorialStatus = 'published' | 'draft' | 'in_review' | 'pending';
export type CurriculumStatus = 'in_progress' | 'published';

export type CurriculumTopic = {
  id: string;
  area: string;
  subject: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  priority: string;
  priorityBasis: string;
  order: number;
  subjectOrder: number;
  prerequisites: string[];
  enemSkills: string[];
  learningObjective: string;
  editorialStatus: EditorialStatus;
  requiredForPractice: boolean;
  lessonVersion: number;
  source: { document: string; line: number; exactTopic: string };
  references: { label: string; url: string }[];
};

export type Curriculum = {
  version: string;
  status: CurriculumStatus;
  complete: boolean;
  source: string;
  topicCount: number;
  topics: CurriculumTopic[];
};

export type LessonQuestion = {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type LessonContent = {
  topicId: string;
  title: string;
  objective: string[];
  concepts: string[];
  explanation: { heading: string; paragraphs: string[] }[];
  workedExample: { context: string; steps: string[]; conclusion: string };
  enemApplication: string;
  commonErrors: { error: string; correction: string }[];
  summary: string[];
  quiz: LessonQuestion[];
  references: { label: string; url: string }[];
};

export type LessonProgress = {
  topicId: string;
  status: 'not_started' | 'completed';
  lessonVersion: number;
  completedAt?: Date;
  updatedAt?: Date;
  lastOpenedAt?: Date;
};
