import { describe, expect, it } from 'vitest';
import { curriculum, curriculumTopics } from '../data/curriculum';
import { lessons } from '../data/lessons';

describe('currículo rastreável', () => {
  it('preserva todos os tópicos identificados no plano original', () => {
    expect(curriculumTopics).toHaveLength(287);
    expect(new Set(curriculumTopics.map((topic) => topic.id)).size).toBe(287);
    expect(curriculumTopics.every((topic) => topic.source.line > 0 && topic.source.exactTopic === topic.title && topic.title.trim().length > 0)).toBe(true);
  });

  it('só marca como publicada uma aula com conteúdo didático associado', () => {
    const published = curriculumTopics.filter((topic) => topic.editorialStatus === 'published');
    expect(published).toHaveLength(4);
    for (const topic of published) {
      const lesson = lessons[topic.id];
      expect(lesson).toBeDefined();
      if (!lesson) throw new Error(`Aula publicada sem conteúdo: ${topic.id}`);
      expect(lesson.objective.length).toBeGreaterThan(0);
      expect(lesson.explanation.length).toBeGreaterThan(0);
      expect(lesson.workedExample.steps.length).toBeGreaterThan(0);
      expect(lesson.quiz.length).toBeGreaterThan(0);
    }
  });

  it('mantém o currículo incompleto enquanto houver conteúdo pendente', () => {
    expect(curriculum.complete).toBe(false);
    expect(curriculum.status).toBe('in_progress');
    expect(curriculumTopics.filter((topic) => topic.editorialStatus === 'pending')).toHaveLength(283);
  });
});
