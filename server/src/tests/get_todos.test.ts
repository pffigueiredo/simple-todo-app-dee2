
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { getTodos } from '../handlers/get_todos';

describe('getTodos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no todos exist', async () => {
    const result = await getTodos();
    
    expect(result).toEqual([]);
  });

  it('should return all todos ordered by creation date (newest first)', async () => {
    // Create test todos with slight delays to ensure different timestamps
    await db.insert(todosTable)
      .values({ title: 'First todo', completed: false })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(todosTable)
      .values({ title: 'Second todo', completed: true })
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(todosTable)
      .values({ title: 'Third todo', completed: false })
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(3);
    
    // Verify ordering (newest first)
    expect(result[0].title).toEqual('Third todo');
    expect(result[1].title).toEqual('Second todo');
    expect(result[2].title).toEqual('First todo');

    // Verify all expected fields are present
    result.forEach(todo => {
      expect(todo.id).toBeDefined();
      expect(todo.title).toBeDefined();
      expect(typeof todo.completed).toBe('boolean');
      expect(todo.created_at).toBeInstanceOf(Date);
      expect(todo.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return todos with correct data types', async () => {
    await db.insert(todosTable)
      .values({ title: 'Test todo', completed: true })
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(1);
    const todo = result[0];
    
    expect(typeof todo.id).toBe('number');
    expect(typeof todo.title).toBe('string');
    expect(typeof todo.completed).toBe('boolean');
    expect(todo.created_at).toBeInstanceOf(Date);
    expect(todo.updated_at).toBeInstanceOf(Date);
    expect(todo.title).toEqual('Test todo');
    expect(todo.completed).toBe(true);
  });
});
