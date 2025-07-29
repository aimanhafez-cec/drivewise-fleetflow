import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, AlertCircle, CheckCircle } from "lucide-react";

interface VehicleTasksProps {
  vehicleId: string;
}

export function VehicleTasks({ vehicleId }: VehicleTasksProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  
  // This is a placeholder implementation
  // In a real application, you would integrate with your database
  const mockTasks = [
    {
      id: '1',
      title: 'Oil Change',
      description: 'Regular maintenance oil change due',
      priority: 'high',
      dueDate: '2024-02-01',
      completed: false,
      category: 'maintenance'
    },
    {
      id: '2',
      title: 'Insurance Renewal',
      description: 'Vehicle insurance policy expires soon',
      priority: 'high',
      dueDate: '2024-01-25',
      completed: false,
      category: 'documentation'
    },
    {
      id: '3',
      title: 'Interior Cleaning',
      description: 'Deep clean interior before next rental',
      priority: 'medium',
      dueDate: '2024-01-30',
      completed: true,
      category: 'cleaning'
    },
    {
      id: '4',
      title: 'Tire Inspection',
      description: 'Check tire wear and pressure',
      priority: 'low',
      dueDate: '2024-02-05',
      completed: false,
      category: 'inspection'
    }
  ];

  const priorityColors = {
    high: "destructive",
    medium: "default", 
    low: "secondary"
  } as const;

  const categoryColors = {
    maintenance: "default",
    documentation: "secondary",
    cleaning: "outline",
    inspection: "default"
  } as const;

  const pendingTasks = mockTasks.filter(task => !task.completed);
  const completedTasks = mockTasks.filter(task => task.completed);
  const overdueTasks = pendingTasks.filter(task => new Date(task.dueDate) < new Date());

  return (
    <div className="space-y-6">
      {/* Task Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{overdueTasks.length}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{pendingTasks.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{completedTasks.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{mockTasks.length}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Task */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Task Management</CardTitle>
            <Button onClick={() => setShowAddTask(!showAddTask)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddTask && (
            <div className="space-y-4 p-4 border rounded-lg mb-4">
              <Input placeholder="Task title" />
              <Textarea placeholder="Task description" />
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" />
                <select className="px-3 py-2 border rounded-md">
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Save Task</Button>
                <Button variant="outline" size="sm" onClick={() => setShowAddTask(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Tasks ({pendingTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTasks.length > 0 ? (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]}>
                          {task.priority}
                        </Badge>
                        <Badge variant={categoryColors[task.category as keyof typeof categoryColors]}>
                          {task.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                      {new Date(task.dueDate) < new Date() && (
                        <span className="text-destructive ml-2">(Overdue)</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No pending tasks</p>
          )}
        </CardContent>
      </Card>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks ({completedTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg opacity-60">
                  <Checkbox checked disabled />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium line-through">{task.title}</h4>
                      <Badge variant="outline">completed</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-through">{task.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}