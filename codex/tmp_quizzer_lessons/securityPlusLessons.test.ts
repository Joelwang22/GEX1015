import { beforeEach, describe, expect, it } from 'vitest';
import {
  SECURITY_PLUS_LESSONS,
  getDoneLessons,
  markLessonDone,
  searchLessons,
} from '../securityPlusLessons';

describe('securityPlusLessons', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('searches lesson content by keyword', () => {
    const results = searchLessons('certificate pinning');

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((result) => result.lessonId === 'implementation-and-identity')).toBe(true);
  });

  it('stores completed lessons without duplicates', () => {
    markLessonDone('threats-and-controls');
    markLessonDone('threats-and-controls');

    expect(getDoneLessons()).toEqual(['threats-and-controls']);
  });

  it('includes a complete lesson path', () => {
    expect(SECURITY_PLUS_LESSONS).toHaveLength(5);
    expect(SECURITY_PLUS_LESSONS.every((lesson) => lesson.slides.length >= 8)).toBe(true);
  });
});
