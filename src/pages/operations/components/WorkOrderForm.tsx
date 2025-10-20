import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateWorkOrder } from '@/hooks/useWorkOrders';
import { CreateWorkOrderData } from '@/lib/api/maintenance';

interface Task {
  complaint: string;
  estimated_hours?: number;
}

const WorkOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateWorkOrderData>();
  const createMutation = useCreateWorkOrder();
  const [tasks, setTasks] = useState<Task[]>([{ complaint: '' }]);

  const reason = watch('reason');
  const priority = watch('priority');

  const addTask = () => {
    setTasks([...tasks, { complaint: '' }]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: keyof Task, value: string | number) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const onSubmit = (data: CreateWorkOrderData) => {
    const workOrderData = {
      ...data,
      tasks: tasks.filter(t => t.complaint.trim() !== ''),
    };

    createMutation.mutate(workOrderData, {
      onSuccess: () => {
        navigate('/operations/maintenance');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle_id">Vehicle *</Label>
          <Input
            id="vehicle_id"
            placeholder="Vehicle ID or Plate"
            {...register('vehicle_id', { required: 'Vehicle is required' })}
          />
          {errors.vehicle_id && (
            <p className="text-sm text-destructive">{errors.vehicle_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Work Order Reason *</Label>
          <Select value={reason} onValueChange={(value) => setValue('reason', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pm">Preventive Maintenance</SelectItem>
              <SelectItem value="breakdown">Breakdown</SelectItem>
              <SelectItem value="accident">Accident</SelectItem>
              <SelectItem value="recall">Recall</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select value={priority} onValueChange={(value) => setValue('priority', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduled_start">Scheduled Date</Label>
          <Input
            id="scheduled_start"
            type="datetime-local"
            {...register('scheduled_start')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mileage">Current Mileage</Label>
          <Input
            id="mileage"
            type="number"
            placeholder="Current mileage"
            {...register('mileage', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workshop_vendor">Workshop/Vendor</Label>
          <Input
            id="workshop_vendor"
            placeholder="Workshop or vendor name"
            {...register('workshop_vendor')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes or description..."
          rows={3}
          {...register('notes')}
        />
      </div>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            Define specific tasks for this work order (Complaint/Cause/Correction)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.map((task, index) => (
            <div key={index} className="flex gap-3 items-start p-4 border rounded-lg">
              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <Label>Complaint *</Label>
                  <Textarea
                    placeholder="Describe the issue or work needed..."
                    value={task.complaint}
                    onChange={(e) => updateTask(index, 'complaint', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Hours</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="Hours"
                    value={task.estimated_hours || ''}
                    onChange={(e) => updateTask(index, 'estimated_hours', parseFloat(e.target.value))}
                  />
                </div>
              </div>
              {tasks.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTask(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addTask}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/operations/maintenance')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create Work Order'}
        </Button>
      </div>
    </form>
  );
};

export default WorkOrderForm;
