import rawCurriculum from './curriculum.json';
import type { Curriculum, CurriculumTopic } from '../types/curriculum';

export const curriculum = rawCurriculum as Curriculum;
export const curriculumTopics = curriculum.topics;
export const topicById = new Map(curriculumTopics.map((topic) => [topic.id, topic]));

export function publishedTopics(): CurriculumTopic[] {
  return curriculumTopics.filter((topic) => topic.editorialStatus === 'published');
}

export function getNextLesson(completed: ReadonlySet<string>): CurriculumTopic | undefined {
  return curriculumTopics.find((topic) => topic.editorialStatus === 'published'
    && !completed.has(topic.id)
    && topic.prerequisites.every((prerequisiteId) => completed.has(prerequisiteId)));
}

export function groupTopicsByArea(topics = curriculumTopics): Map<string, CurriculumTopic[]> {
  const grouped = new Map<string, CurriculumTopic[]>();
  for (const topic of topics) grouped.set(topic.area, [...(grouped.get(topic.area) ?? []), topic]);
  return grouped;
}
