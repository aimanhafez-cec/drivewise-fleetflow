import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface VehicleFormData {
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  color: string;
  status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  odometer: number;
  fuel_level: number;
  location: string;
  transmission: string;
  engine_size: string;
  features: string;
  category_id: string;
  subtype: string;
  ownership_type: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  color: string;
  status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  odometer: number;
  fuel_level: number;
  location: string;
  transmission: string;
  engine_size: string;
  features: string[];
  category_id: string;
  subtype: string;
  ownership_type: string;
}

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSuccess?: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VehicleFormData>({
    defaultValues: {
      status: 'available',
      fuel_level: 100,
      transmission: 'automatic',
      ownership_type: 'owned',
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (vehicle) {
      reset({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        license_plate: vehicle.license_plate,
        vin: vehicle.vin,
        color: vehicle.color || '',
        status: vehicle.status,
        daily_rate: vehicle.daily_rate || 0,
        weekly_rate: vehicle.weekly_rate || 0,
        monthly_rate: vehicle.monthly_rate || 0,
        odometer: vehicle.odometer || 0,
        fuel_level: vehicle.fuel_level || 100,
        location: vehicle.location || '',
        transmission: vehicle.transmission || 'automatic',
        engine_size: vehicle.engine_size || '',
        features: vehicle.features?.join(', ') || '',
        category_id: vehicle.category_id || '',
        subtype: vehicle.subtype || '',
        ownership_type: vehicle.ownership_type || 'owned',
      });
    }
  }, [vehicle, reset]);

  const mutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      const vehicleData = {
        ...data,
        features: data.features.split(',').map(f => f.trim()).filter(f => f),
        year: Number(data.year),
        daily_rate: Number(data.daily_rate),
        weekly_rate: Number(data.weekly_rate),
        monthly_rate: Number(data.monthly_rate),
        odometer: Number(data.odometer),
        fuel_level: Number(data.fuel_level),
      };

      if (vehicle) {
        const { error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', vehicle.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vehicles')
          .insert([vehicleData]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({
        title: "Success",
        description: `Vehicle ${vehicle ? 'updated' : 'created'} successfully`,
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VehicleFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="make">Make *</Label>
          <Input
            id="make"
            {...register('make', { required: 'Make is required' })}
            placeholder="e.g., Toyota"
          />
          {errors.make && (
            <p className="text-sm text-destructive mt-1">{errors.make.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            {...register('model', { required: 'Model is required' })}
            placeholder="e.g., Camry"
          />
          {errors.model && (
            <p className="text-sm text-destructive mt-1">{errors.model.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            type="number"
            {...register('year', { 
              required: 'Year is required',
              min: { value: 1900, message: 'Year must be after 1900' },
              max: { value: new Date().getFullYear() + 1, message: 'Year cannot be in the future' }
            })}
            placeholder="e.g., 2023"
          />
          {errors.year && (
            <p className="text-sm text-destructive mt-1">{errors.year.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="license_plate">License Plate *</Label>
          <Input
            id="license_plate"
            {...register('license_plate', { required: 'License plate is required' })}
            placeholder="e.g., ABC-1234"
          />
          {errors.license_plate && (
            <p className="text-sm text-destructive mt-1">{errors.license_plate.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="vin">VIN *</Label>
          <Input
            id="vin"
            {...register('vin', { required: 'VIN is required' })}
            placeholder="17-character VIN"
          />
          {errors.vin && (
            <p className="text-sm text-destructive mt-1">{errors.vin.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            {...register('color')}
            placeholder="e.g., Blue"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={watch('status')} onValueChange={(value) => setValue('status', value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="out_of_service">Out of Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category_id">Category</Label>
          <Select value={watch('category_id')} onValueChange={(value) => setValue('category_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="daily_rate">Daily Rate ($)</Label>
          <Input
            id="daily_rate"
            type="number"
            step="0.01"
            {...register('daily_rate')}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="weekly_rate">Weekly Rate ($)</Label>
          <Input
            id="weekly_rate"
            type="number"
            step="0.01"
            {...register('weekly_rate')}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="monthly_rate">Monthly Rate ($)</Label>
          <Input
            id="monthly_rate"
            type="number"
            step="0.01"
            {...register('monthly_rate')}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="odometer">Odometer (miles)</Label>
          <Input
            id="odometer"
            type="number"
            {...register('odometer')}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="fuel_level">Fuel Level (%)</Label>
          <Input
            id="fuel_level"
            type="number"
            min="0"
            max="100"
            {...register('fuel_level')}
            placeholder="100"
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register('location')}
            placeholder="e.g., Main Office"
          />
        </div>

        <div>
          <Label htmlFor="transmission">Transmission</Label>
          <Select value={watch('transmission')} onValueChange={(value) => setValue('transmission', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="cvt">CVT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="engine_size">Engine Size</Label>
          <Input
            id="engine_size"
            {...register('engine_size')}
            placeholder="e.g., 2.4L"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="features">Features (comma-separated)</Label>
        <Textarea
          id="features"
          {...register('features')}
          placeholder="e.g., GPS, Bluetooth, Backup Camera"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {vehicle ? 'Update Vehicle' : 'Create Vehicle'}
        </Button>
      </div>
    </form>
  );
};

export default VehicleForm;