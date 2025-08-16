import { supabase } from '@/integrations/supabase/client';

export interface InspectionOutData {
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
    odometerOut: number;
    fuelLevelOut: 'E' | 'Q1' | 'H' | 'Q3' | 'F';
    extrasIssued?: Array<{code: string; qty: number}>;
  };
  damageMarkerIds: string[];
  media: Array<{id: string; url: string; kind: 'PHOTO' | 'VIDEO'; label?: string}>;
  signature?: { imageUrl: string; name: string; signedAt: string };
  performedByUserId: string;
  performedAt: string;
  deviceInfo?: string;
  locationId?: string;
}

export interface CreateInspectionRequest {
  agreementId: string;
  lineId: string;
  checklist?: Partial<InspectionOutData['checklist']>;
  metrics?: Partial<InspectionOutData['metrics']>;
}

export interface UpdateInspectionRequest {
  checklist?: Partial<InspectionOutData['checklist']>;
  metrics?: Partial<InspectionOutData['metrics']>;
  damageMarkerIds?: string[];
  media?: InspectionOutData['media'];
  signature?: InspectionOutData['signature'];
}

export const inspectionApi = {
  async startInspection(
    data: CreateInspectionRequest,
    idempotencyKey: string
  ): Promise<InspectionOutData> {
    // Check if inspection already exists for this agreement and line
    const { data: existing } = await supabase
      .from('inspection_out')
      .select('*')
      .eq('agreement_id', data.agreementId)
      .eq('line_id', data.lineId)
      .maybeSingle();

    if (existing) {
      return this.mapDbToInterface(existing);
    }

    // Create new inspection
    const { data: newInspection, error } = await supabase
      .from('inspection_out')
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
    data: UpdateInspectionRequest
  ): Promise<InspectionOutData> {
    const updateData: any = {};
    
    if (data.checklist) updateData.checklist = data.checklist;
    if (data.metrics) updateData.metrics = data.metrics;
    if (data.damageMarkerIds) updateData.damage_marker_ids = data.damageMarkerIds;
    if (data.media) updateData.media = data.media;
    if (data.signature) updateData.signature = data.signature;

    const { data: updated, error } = await supabase
      .from('inspection_out')
      .update(updateData)
      .eq('id', inspectionId)
      .select()
      .single();

    if (error) throw error;
    return this.mapDbToInterface(updated);
  },

  async lockAndAttach(
    inspectionId: string
  ): Promise<{ status: 'LOCKED'; pdfUrl?: string }> {
    // Update status to LOCKED
    const { error } = await supabase
      .from('inspection_out')
      .update({ 
        status: 'LOCKED',
        performed_at: new Date().toISOString() 
      })
      .eq('id', inspectionId);

    if (error) throw error;

    // TODO: Generate PDF and store in documents
    return { status: 'LOCKED' };
  },

  async getInspection(inspectionId: string): Promise<InspectionOutData | null> {
    const { data, error } = await supabase
      .from('inspection_out')
      .select('*')
      .eq('id', inspectionId)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapDbToInterface(data) : null;
  },

  async getInspectionByAgreement(agreementId: string): Promise<InspectionOutData | null> {
    const { data, error } = await supabase
      .from('inspection_out')
      .select('*')
      .eq('agreement_id', agreementId)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapDbToInterface(data) : null;
  },

  async hasLockedInspection(agreementId: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('agreement_has_locked_out_inspection', { agreement_id_param: agreementId });

    if (error) throw error;
    return data || false;
  },

  mapDbToInterface(dbData: any): InspectionOutData {
    return {
      id: dbData.id,
      agreementId: dbData.agreement_id,
      lineId: dbData.line_id,
      status: dbData.status,
      checklist: dbData.checklist || {},
      metrics: dbData.metrics || {},
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