import { supabase } from '@/integrations/supabase/client';
import type { 
  DamageMarker, 
  CreateDamageMarkerInput, 
  UpdateDamageMarkerInput,
  DamageMarkerPhoto 
} from '@/types/damage-marker';

export async function createDamageMarker(
  input: CreateDamageMarkerInput
): Promise<string> {
  const { data, error } = await supabase
    .from('damage_markers')
    .insert({
      event: input.event,
      side: input.side,
      x: input.x,
      y: input.y,
      damage_type: input.damage_type,
      severity: input.severity,
      notes: input.notes || null,
      photos: (input.photos || []) as any,
      occurred_at: new Date().toISOString(),
    } as any)
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateDamageMarker(
  id: string,
  updates: UpdateDamageMarkerInput
): Promise<void> {
  const { error } = await supabase
    .from('damage_markers')
    .update({
      ...updates,
      photos: updates.photos as any,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteDamageMarker(id: string): Promise<void> {
  const { error } = await supabase
    .from('damage_markers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getDamageMarkers(ids: string[]): Promise<DamageMarker[]> {
  if (!ids || ids.length === 0) return [];

  const { data, error } = await supabase
    .from('damage_markers')
    .select('*')
    .in('id', ids)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(d => ({
    ...d,
    photos: (d.photos as any) || [],
  })) as DamageMarker[];
}

export async function uploadDamagePhoto(
  file: File,
  markerId: string
): Promise<DamageMarkerPhoto> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${markerId}-${Date.now()}.${fileExt}`;
  const filePath = `damage-markers/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('vehicle-documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('vehicle-documents')
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    filename: file.name,
    uploadedAt: new Date().toISOString(),
  };
}
