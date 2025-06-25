
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Circle, Edit3, Trash2, Plus, ListTodo } from 'lucide-react';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../../server/src/schema';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Form state for new todo
  const [newTodo, setNewTodo] = useState<CreateTodoInput>({
    title: ''
  });

  // Load todos
  const loadTodos = useCallback(async () => {
    try {
      const result = await trpc.getTodos.query();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
      // Note: Backend handlers are currently stubs, so this will return empty array
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Create new todo
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    setIsLoading(true);
    try {
      const response = await trpc.createTodo.mutate(newTodo);
      setTodos((prev: Todo[]) => [response, ...prev]);
      setNewTodo({ title: '' });
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle todo completion
  const handleToggleComplete = async (todo: Todo) => {
    try {
      const updateData: UpdateTodoInput = {
        id: todo.id,
        completed: !todo.completed
      };
      
      const response = await trpc.updateTodo.mutate(updateData);
      if (response) {
        setTodos((prev: Todo[]) =>
          prev.map((t: Todo) => (t.id === todo.id ? response : t))
        );
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  // Start editing todo title
  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  // Save edited todo title
  const handleSaveEdit = async (id: number) => {
    if (!editingTitle.trim()) return;

    try {
      const updateData: UpdateTodoInput = {
        id,
        title: editingTitle.trim()
      };
      
      const response = await trpc.updateTodo.mutate(updateData);
      if (response) {
        setTodos((prev: Todo[]) =>
          prev.map((t: Todo) => (t.id === id ? response : t))
        );
      }
      setEditingId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // Delete todo
  const handleDeleteTodo = async (id: number) => {
    try {
      const response = await trpc.deleteTodo.mutate({ id });
      if (response.success) {
        setTodos((prev: Todo[]) => prev.filter((t: Todo) => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const completedCount = todos.filter((todo: Todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ListTodo className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">My Todo List</h1>
          </div>
          <p className="text-gray-600">Stay organized and get things done! ✨</p>
          
          {/* Progress indicator */}
          {totalCount > 0 && (
            <div className="mt-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                {completedCount} of {totalCount} completed 
                {completedCount === totalCount && totalCount > 0 && " 🎉"}
              </Badge>
            </div>
          )}
        </div>

        {/* Add new todo form */}
        <Card className="mb-6 shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-indigo-600" />
              Add New Todo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTodo} className="flex gap-3">
              <Input
                placeholder="What needs to be done? 📝"
                value={newTodo.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewTodo((prev: CreateTodoInput) => ({ ...prev, title: e.target.value }))
                }
                className="flex-1"
                required
              />
              <Button 
                type="submit" 
                disabled={isLoading || !newTodo.title.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? 'Adding...' : 'Add Todo'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stub notification */}
        {todos.length === 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <p className="text-orange-800 text-sm text-center">
                📝 <strong>Note:</strong> Backend handlers are currently stubs. 
                Your todos won't persist between page refreshes, but all functionality is implemented and ready for real backend integration.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Todo list */}
        {todos.length === 0 ? (
          <Card className="text-center py-12 shadow-lg border-0">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <ListTodo className="h-16 w-16 mx-auto mb-4 opacity-50" />
              </div>
              <p className="text-gray-500 text-lg">No todos yet! 🌟</p>
              <p className="text-gray-400 text-sm mt-2">Create your first todo above to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todos.map((todo: Todo) => (
              <Card 
                key={todo.id} 
                className={`shadow-md border-0 transition-all duration-200 hover:shadow-lg ${
                  todo.completed ? 'bg-green-50 border-l-4 border-l-green-500' : 'bg-white border-l-4 border-l-indigo-500'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Completion checkbox */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto hover:bg-transparent"
                      onClick={() => handleToggleComplete(todo)}
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400 hover:text-indigo-600" />
                      )}
                    </Button>

                    {/* Todo title */}
                    <div className="flex-1">
                      {editingId === todo.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editingTitle}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              setEditingTitle(e.target.value)
                            }
                            onKeyDown={(e: React.KeyboardEvent) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(todo.id);
                              }
                              if (e.key === 'Escape') {
                                cancelEditing();
                              }
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveEdit(todo.id)}
                            disabled={!editingTitle.trim()}
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={cancelEditing}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <p 
                            className={`text-lg ${
                              todo.completed 
                                ? 'line-through text-gray-500' 
                                : 'text-gray-800'
                            }`}
                          >
                            {todo.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {todo.created_at.toLocaleDateString()} at {todo.created_at.toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {editingId !== todo.id && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(todo)}
                          className="text-gray-400 hover:text-indigo-600"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Todo</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{todo.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteTodo(todo.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <Separator className="mb-4" />
          <p>Built with React, TypeScript, and tRPC ⚡</p>
        </div>
      </div>
    </div>
  );
}

export default App;
