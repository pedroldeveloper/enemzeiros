import type { Curriculum, CurriculumTopic } from '../types/curriculum';

export function isInfinitePracticeUnlocked(
  curriculum: Pick<Curriculum, 'complete' | 'status'>,
  requiredTopics: readonly Pick<CurriculumTopic, 'id' | 'editorialStatus' | 'requiredForPractice'>[],
  completedTopicIds: ReadonlySet<string>,
): boolean {
  if (!curriculum.complete || curriculum.status !== 'published') return false;
  const required = requiredTopics.filter((topic) => topic.requiredForPractice);
  if (required.length === 0) return false;
  return required.every((topic) => topic.editorialStatus === 'published' && completedTopicIds.has(topic.id));
}
