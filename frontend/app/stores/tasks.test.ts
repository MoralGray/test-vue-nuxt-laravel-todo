import { describe, expect, it } from 'vitest';
import type { Task } from '~/stores/tasks';

function parseTasks(tasks: Task[], filter: { search?: string; status?: string }): Task[] {
  let result = tasks;
  if (filter.search) {
    const q = filter.search.toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(q));
  }
  if (filter.status) {
    result = result.filter((t) => t.status === filter.status);
  }
  return result;
}

describe('parseTasks (filtering logic)', () => {
  const tasks: Task[] = [
    {
      id: 1,
      user_id: 1,
      title: 'Buy milk',
      description: null,
      due_date: '2026-08-01',
      status: 'pending',
      created_at: '',
      updated_at: '',
    },
    {
      id: 2,
      user_id: 1,
      title: 'Write docs',
      description: null,
      due_date: null,
      status: 'in_progress',
      created_at: '',
      updated_at: '',
    },
    {
      id: 3,
      user_id: 1,
      title: 'Deploy app',
      description: null,
      due_date: '2026-07-15',
      status: 'completed',
      created_at: '',
      updated_at: '',
    },
  ];

  it('returns all when no filter', () => {
    expect(parseTasks(tasks, {})).toHaveLength(3);
  });

  it('filters by status', () => {
    expect(parseTasks(tasks, { status: 'completed' })).toHaveLength(1);
    expect(parseTasks(tasks, { status: 'completed' })[0].title).toBe('Deploy app');
  });

  it('searches by title', () => {
    expect(parseTasks(tasks, { search: 'milk' })).toHaveLength(1);
    expect(parseTasks(tasks, { search: 'milk' })[0].title).toBe('Buy milk');
  });

  it('search is case-insensitive', () => {
    expect(parseTasks(tasks, { search: 'MILK' })).toHaveLength(1);
  });

  it('returns empty for no match', () => {
    expect(parseTasks(tasks, { search: 'xyz' })).toHaveLength(0);
  });
});
