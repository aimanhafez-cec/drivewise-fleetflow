import { supabase } from '@/integrations/supabase/client';

export type InspectionType = 'OUT' | 'IN';

export interface InspectionData {
  id: string;
  agreementId: string;
  lineId: string;
  status: 'DRAFT' | 'SIGNED' | 'LOCKED';
  checklist: {
    exterior: 'OK' | 'DAMAGE';
    glass: 'OK' | 'DAMAGE';
    tires: 'OK' | 'DAMAGE';
    interior: 'OK' | 'DAMAGE';
    accessories: 'OK' | 'DAMAGE';
  };
  metrics: {
    odometer: number;
    fuelLevel: 'E' | 'Q1' | 'H' | 'Q3' | 'F';
    extras?: Array<{code: string; qty: number}>;
  };
  damageMarkerIds: string[];
  media: Array<{id: string; url: string; kind: 'PHOTO' | 'VIDEO'; label?: string}>;
  signature?: { imageUrl: string; name: string; signedAt: string };
  performedByUserId: string;
  performedAt: string;
  deviceInfo?: string;
  locationId?: string;
}

// Legacy type alias for backward compatibility
export type InspectionOutData = InspectionData;

export interface CreateInspectionRequest {
  agreementId: string;
  lineId: string;
  type: InspectionType;
  checklist?: Partial<InspectionData['checklist']>;
  metrics?: Partial<InspectionData['metrics']>;
}

export interface UpdateInspectionRequest {
  checklist?: Partial<InspectionData['checklist']>;
  metrics?: Partial<InspectionData['metrics']>;
  damageMarkerIds?: string[];
  media?: InspectionData['media'];
  signature?: InspectionData['signature'];
}

export const inspectionApi = {
  async startInspection(
    data: CreateInspectionRequest,
    idempotencyKey: string
  ): Promise<InspectionData> {
    const tableName = data.type === 'OUT' ? 'inspection_out' : 'inspection_in';
    
    // Check if inspection already exists for this agreement and line
    const { data: existing } = await supabase
      .from(tableName)
      .select('*')
      .eq('agreement_id', data.agreementId)
      .eq('line_id', data.lineId)
      .maybeSingle();

    if (existing) {
      return this.mapDbToInterface(existing);
    }

    // Create new inspection
    const { data: newInspection, error } = await supabase
      .from(tableName)
      .insert({
        agreement_id: data.agreementId,
        line_id: data.lineId,
        checklist: data.checklist || {},
        metrics: data.metrics || {},
        performed_by_user_id: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapDbToInterface(newInspection);
  },

  async updateInspection(
    inspectionId: string,
    data: UpdateInspectionRequest,
    type: InspectionType = 'OUT'
  ): Promise<InspectionData> {
    const tableName = type === 'OUT' ? 'inspection_out' : 'inspection_in';
    const updateData: any = {};
    
    if (data.checklist) updateData.checklist = data.checklist;
    if (data.metrics) updateData.metrics = data.metrics;
    if (data.damageMarkerIds) updateData.damage_marker_ids = data.damageMarkerIds;
    if (data.media) updateData.media = data.media;
    if (data.signature) updateData.signature = data.signature;

    const { data: updated, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', inspectionId)
      .select()
      .single();

    if (error) throw error;
    return this.mapDbToInterface(updated);
  },

  async lockAndAttach(
    inspectionId: string,
    type: InspectionType = 'OUT'
  ): Promise<{ status: 'LOCKED'; pdfUrl?: string }> {
    const tableName = type === 'OUT' ? 'inspection_out' : 'inspection_in';
    
    // Update status to LOCKED
    const { error } = await supabase
      .from(tableName)
      .update({ 
        status: 'LOCKED',
        performed_at: new Date().toISOString() 
      })
      .eq('id', inspectionId);

    if (error) throw error;

    // TODO: Generate PDF and store in documents
    return { status: 'LOCKED' };
  },

  async getInspection(inspectionId: string, type: InspectionType = 'OUT'): Promise<InspectionData | null> {
    const tableName = type === 'OUT' ? 'inspection_out' : 'inspection_in';
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', inspectionId)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapDbToInterface(data) : null;
  },

  async getInspectionByAgreement(agreementId: string, type: InspectionType = 'OUT'): Promise<InspectionData | null> {
    const tableName = type === 'OUT' ? 'inspection_out' : 'inspection_in';
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('agreement_id', agreementId)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapDbToInterface(data) : null;
  },

  async hasLockedInspection(agreementId: string, type: InspectionType = 'OUT'): Promise<boolean> {
    const functionName = type === 'OUT' 
      ? 'agreement_has_locked_out_inspection'
      : 'agreement_has_locked_in_inspection';
      
    const { data, error } = await supabase
      .rpc(functionName, { agreement_id_param: agreementId });

    if (error) throw error;
    return data || false;
  },

  mapDbToInterface(dbData: any): InspectionData {
    return {
      id: dbData.id,
      agreementId: dbData.agreement_id,
      lineId: dbData.line_id,
      status: dbData.status,
      checklist: dbData.checklist || {},
      metrics: {
        odometer: dbData.metrics?.odometerOut || dbData.metrics?.odometerIn || dbData.metrics?.odometer || 0,
        fuelLevel: dbData.metrics?.fuelLevelOut || dbData.metrics?.fuelLevelIn || dbData.metrics?.fuelLevel || 'F',
        extras: dbData.metrics?.extrasIssued || dbData.metrics?.extrasReturned || dbData.metrics?.extras || []
      },
      damageMarkerIds: dbData.damage_marker_ids || [],
      media: dbData.media || [],
      signature: dbData.signature,
      performedByUserId: dbData.performed_by_user_id,
      performedAt: dbData.performed_at,
      deviceInfo: dbData.device_info,
      locationId: dbData.location_id,
    };
  },
};