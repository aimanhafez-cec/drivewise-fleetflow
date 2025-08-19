import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertTriangle, CheckCircle, Camera, Plus, Trash2 } from 'lucide-react';

interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  testId: string;
}

const CHECKLIST_SECTIONS: { name: string; items: ChecklistItem[] }[] = [
  {
    name: 'Exterior',
    items: [
      { id: 'exterior', name: 'Exterior Panels', description: 'Check for dents, scratches, paint damage', testId: 'chk-exterior' }
    ]
  },
  {
    name: 'Glass',
    items: [
      { id: 'glass', name: 'Windshield & Windows', description: 'Check for cracks, chips, or damage', testId: 'chk-glass' }
    ]
  },
  {
    name: 'Tires & Rims',
    items: [
      { id: 'tires', name: 'Tires & Rims', description: 'Check tread, sidewalls, rim condition', testId: 'chk-tires' }
    ]
  },
  {
    name: 'Interior',
    items: [
      { id: 'interior', name: 'Dashboard & Seats', description: 'Check seats, dashboard, controls', testId: 'chk-interior' }
    ]
  },
  {
    name: 'Accessories',
    items: [
      { id: 'accessories', name: 'Spare Tire & Equipment', description: 'Check spare tire, jack, GPS, child seats', testId: 'chk-accessories' }
    ]
  }
];

interface DamagePhoto {
  id: string;
  file: File;
  preview: string;
}

interface DamageEntry {
  id: string;
  description: string;
  photos: DamagePhoto[];
}

interface ChecklistData {
  status: Record<string, 'OK' | 'DAMAGE'>;
  photos: Record<string, DamagePhoto[]>;
  extraDamages: Record<string, DamageEntry[]>;
}

interface InspectionChecklistProps {
  data: ChecklistData;
  onUpdate: (data: ChecklistData) => void;
}

export const InspectionChecklist: React.FC<InspectionChecklistProps> = ({
  data,
  onUpdate
}) => {
  const [checklistData, setChecklistData] = useState<ChecklistData>(
    data || { status: {}, photos: {}, extraDamages: {} }
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setChecklistData(data || { status: {}, photos: {}, extraDamages: {} });
  }, [data]);

  const handleItemChange = (itemId: string, value: 'OK' | 'DAMAGE') => {
    const newData = { 
      ...checklistData, 
      status: { ...checklistData.status, [itemId]: value }
    };
    setChecklistData(newData);
    setHasUnsavedChanges(true);
    onUpdate(newData);
  };

  const handlePhotoUpload = (itemId: string, files: FileList) => {
    const newPhotos: DamagePhoto[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file)
    }));

    const newData = {
      ...checklistData,
      photos: {
        ...checklistData.photos,
        [itemId]: [...(checklistData.photos[itemId] || []), ...newPhotos]
      }
    };
    
    setChecklistData(newData);
    setHasUnsavedChanges(true);
    onUpdate(newData);
  };

  const handlePhotoRemove = (itemId: string, photoId: string) => {
    const newData = {
      ...checklistData,
      photos: {
        ...checklistData.photos,
        [itemId]: checklistData.photos[itemId]?.filter(photo => photo.id !== photoId) || []
      }
    };
    
    setChecklistData(newData);
    setHasUnsavedChanges(true);
    onUpdate(newData);
  };

  const handleAddExtraDamage = (sectionName: string) => {
    const newDamage: DamageEntry = {
      id: crypto.randomUUID(),
      description: '',
      photos: []
    };

    const newData = {
      ...checklistData,
      extraDamages: {
        ...checklistData.extraDamages,
        [sectionName]: [...(checklistData.extraDamages[sectionName] || []), newDamage]
      }
    };
    
    setChecklistData(newData);
    setHasUnsavedChanges(true);
    onUpdate(newData);
  };

  const handleExtraDamageChange = (sectionName: string, damageId: string, description: string) => {
    const newData = {
      ...checklistData,
      extraDamages: {
        ...checklistData.extraDamages,
        [sectionName]: checklistData.extraDamages[sectionName]?.map(damage =>
          damage.id === damageId ? { ...damage, description } : damage
        ) || []
      }
    };
    
    setChecklistData(newData);
    setHasUnsavedChanges(true);
    onUpdate(newData);
  };

  const handleExtraDamagePhotoUpload = (sectionName: string, damageId: string, files: FileList) => {
    const newPhotos: DamagePhoto[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file)
    }));

    const newData = {
      ...checklistData,
      extraDamages: {
        ...checklistData.extraDamages,
        [sectionName]: checklistData.extraDamages[sectionName]?.map(damage =>
          damage.id === damageId 
            ? { ...damage, photos: [...damage.photos, ...newPhotos] }
            : damage
        ) || []
      }
    };
    
    setChecklistData(newData);
    setHasUnsavedChanges(true);
    onUpdate(newData);
  };

  const handleRemoveExtraDamage = (sectionName: string, damageId: string) => {
    const newData = {
      ...checklistData,
      extraDamages: {
        ...checklistData.extraDamages,
        [sectionName]: checklistData.extraDamages[sectionName]?.filter(damage => damage.id !== damageId) || []
      }
    };
    
    setChecklistData(newData);
    setHasUnsavedChanges(true);
    onUpdate(newData);
  };

  const getCompletionStats = () => {
    const totalItems = CHECKLIST_SECTIONS.flatMap(s => s.items).length;
    const completedItems = Object.keys(checklistData.status).length;
    const damageItems = Object.values(checklistData.status).filter(v => v === 'DAMAGE').length;
    
    return { totalItems, completedItems, damageItems };
  };

  const { totalItems, completedItems, damageItems } = getCompletionStats();

  return (
    <div id="step-checklist" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Walk-Around Checklist</h3>
        <p className="text-muted-foreground">
          Inspect each section of the vehicle and mark as OK or Damage.
        </p>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium">{completedItems}/{totalItems}</span> sections completed
              </div>
              {damageItems > 0 && (
                <Badge variant="destructive">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {damageItems} damage{damageItems !== 1 ? 's' : ''} found
                </Badge>
              )}
              {completedItems === totalItems && damageItems === 0 && (
                <Badge variant="default">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  All OK
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Sections */}
      <div className="space-y-4">
        {CHECKLIST_SECTIONS.map((section) => (
          <Card key={section.name}>
            <CardHeader>
              <CardTitle className="text-base">{section.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item) => (
                <div key={item.id} className="space-y-3">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  
                  <RadioGroup
                    value={checklistData.status[item.id] || ''}
                    onValueChange={(value: 'OK' | 'DAMAGE') => handleItemChange(item.id, value)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="OK" id={`${item.testId}-ok`} />
                      <Label htmlFor={`${item.testId}-ok`} className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        OK
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="DAMAGE" id={`${item.testId}-damage`} />
                      <Label htmlFor={`${item.testId}-damage`} className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        Damage
                      </Label>
                    </div>
                  </RadioGroup>

                  {checklistData.status[item.id] === 'DAMAGE' && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg space-y-3">
                      <p className="text-sm text-red-800">
                        Damage detected. Add photos for documentation:
                      </p>
                      
                      {/* Photo Upload */}
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => e.target.files && handlePhotoUpload(item.id, e.target.files)}
                          className="text-sm"
                        />
                        
                        {/* Display uploaded photos */}
                        {checklistData.photos[item.id]?.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {checklistData.photos[item.id].map((photo) => (
                              <div key={photo.id} className="relative">
                                <img
                                  src={photo.preview}
                                  alt="Damage"
                                  className="w-full h-20 object-cover rounded border"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                  onClick={() => handlePhotoRemove(item.id, photo.id)}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Extra Damages Section */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-sm">Additional Damages</h5>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddExtraDamage(section.name)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Damage
                  </Button>
                </div>

                {checklistData.extraDamages[section.name]?.map((damage) => (
                  <div key={damage.id} className="p-3 border border-gray-200 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Describe the damage..."
                        value={damage.description}
                        onChange={(e) => handleExtraDamageChange(section.name, damage.id, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveExtraDamage(section.name, damage.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => e.target.files && handleExtraDamagePhotoUpload(section.name, damage.id, e.target.files)}
                        className="text-sm"
                      />
                      
                      {damage.photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {damage.photos.map((photo) => (
                            <div key={photo.id} className="relative">
                              <img
                                src={photo.preview}
                                alt="Damage"
                                className="w-full h-20 object-cover rounded border"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                onClick={() => {
                                  const updatedDamages = checklistData.extraDamages[section.name]?.map(d =>
                                    d.id === damage.id
                                      ? { ...d, photos: d.photos.filter(p => p.id !== photo.id) }
                                      : d
                                  ) || [];
                                  
                                  const newData = {
                                    ...checklistData,
                                    extraDamages: {
                                      ...checklistData.extraDamages,
                                      [section.name]: updatedDamages
                                    }
                                  };
                                  
                                  setChecklistData(newData);
                                  onUpdate(newData);
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasUnsavedChanges && (
        <div className="text-sm text-muted-foreground text-center">
          Changes are automatically saved
        </div>
      )}

    </div>
  );
};