import { describe, expect, it } from 'vitest';
import { isInfinitePracticeUnlocked } from './practiceGate';
import type { CurriculumTopic } from '../types/curriculum';

const topics = [
  { id: 'a', requiredForPractice: true, editorialStatus: 'published' },
  { id: 'b', requiredForPractice: true, editorialStatus: 'published' },
] as CurriculumTopic[];

describe('isInfinitePracticeUnlocked', () => {
  it('keeps the mode locked while the curriculum is in production', () => {
    expect(isInfinitePracticeUnlocked({ complete: false, status: 'in_progress' }, topics, new Set(['a', 'b']))).toBe(false);
  });

  it('requires all published required lessons to be complete', () => {
    expect(isInfinitePracticeUnlocked({ complete: true, status: 'published' }, topics, new Set(['a']))).toBe(false);
  });

  it('does not unlock if a required topic is still pending', () => {
    const pendingTopics = [{ ...topics[0] }, { ...topics[1], editorialStatus: 'pending' }] as CurriculumTopic[];
    expect(isInfinitePracticeUnlocked({ complete: true, status: 'published' }, pendingTopics, new Set(['a', 'b']))).toBe(false);
  });

  it('unlocks only after publication and completion of every required lesson', () => {
    expect(isInfinitePracticeUnlocked({ complete: true, status: 'published' }, topics, new Set(['a', 'b']))).toBe(true);
  });

  it('does not unlock an empty curriculum', () => {
    expect(isInfinitePracticeUnlocked({ complete: true, status: 'published' }, [], new Set())).toBe(false);
  });
});
