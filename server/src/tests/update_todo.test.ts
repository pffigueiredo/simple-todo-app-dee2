
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoInput } from '../schema';
import { updateTodo } from '../handlers/update_todo';
import { eq } from 'drizzle-orm';

describe('updateTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update todo title', async () => {
    // Create a test todo first
    const [createdTodo] = await db.insert(todosTable)
      .values({
        title: 'Original Title',
        completed: false
      })
      .returning()
      .execute();

    const updateInput: UpdateTodoInput = {
      id: createdTodo.id,
      title: 'Updated Title'
    };

    const result = await updateTodo(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdTodo.id);
    expect(result!.title).toEqual('Updated Title');
    expect(result!.completed).toEqual(false); // Should remain unchanged
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > createdTodo.updated_at).toBe(true);
  });

  it('should update todo completed status', async () => {
    // Create a test todo first
    const [createdTodo] = await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        completed: false
      })
      .returning()
      .execute();

    const updateInput: UpdateTodoInput = {
      id: createdTodo.id,
      completed: true
    };

    const result = await updateTodo(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdTodo.id);
    expect(result!.title).toEqual('Test Todo'); // Should remain unchanged
    expect(result!.completed).toEqual(true);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > createdTodo.updated_at).toBe(true);
  });

  it('should update both title and completed status', async () => {
    // Create a test todo first
    const [createdTodo] = await db.insert(todosTable)
      .values({
        title: 'Original Title',
        completed: false
      })
      .returning()
      .execute();

    const updateInput: UpdateTodoInput = {
      id: createdTodo.id,
      title: 'Updated Title',
      completed: true
    };

    const result = await updateTodo(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdTodo.id);
    expect(result!.title).toEqual('Updated Title');
    expect(result!.completed).toEqual(true);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > createdTodo.updated_at).toBe(true);
  });

  it('should return null for non-existent todo', async () => {
    const updateInput: UpdateTodoInput = {
      id: 99999, // Non-existent ID
      title: 'Updated Title'
    };

    const result = await updateTodo(updateInput);

    expect(result).toBeNull();
  });

  it('should save updated todo to database', async () => {
    // Create a test todo first
    const [createdTodo] = await db.insert(todosTable)
      .values({
        title: 'Original Title',
        completed: false
      })
      .returning()
      .execute();

    const updateInput: UpdateTodoInput = {
      id: createdTodo.id,
      title: 'Database Updated Title',
      completed: true
    };

    await updateTodo(updateInput);

    // Verify the update was persisted in database
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, createdTodo.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].title).toEqual('Database Updated Title');
    expect(todos[0].completed).toEqual(true);
    expect(todos[0].updated_at).toBeInstanceOf(Date);
    expect(todos[0].updated_at > createdTodo.updated_at).toBe(true);
  });

  it('should only update provided fields', async () => {
    // Create a test todo first
    const [createdTodo] = await db.insert(todosTable)
      .values({
        title: 'Original Title',
        completed: true
      })
      .returning()
      .execute();

    // Update only the title
    const updateInput: UpdateTodoInput = {
      id: createdTodo.id,
      title: 'Only Title Updated'
    };

    const result = await updateTodo(updateInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Only Title Updated');
    expect(result!.completed).toEqual(true); // Should remain unchanged
  });
});
