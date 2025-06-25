
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteTodo = async (input: DeleteTodoInput): Promise<{ success: boolean }> => {
  try {
    // Delete the todo with the given ID
    const result = await db.delete(todosTable)
      .where(eq(todosTable.id, input.id))
      .execute();

    // Check if any rows were affected (deleted)
    // result is a ResultSet with rowCount property
    const success = (result as any).rowCount > 0;
    
    return { success };
  } catch (error) {
    console.error('Todo deletion failed:', error);
    throw error;
  }
};
