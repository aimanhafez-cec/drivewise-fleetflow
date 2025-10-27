import React, { useState } from 'react';
import { MultiLineBuilder } from './MultiLineBuilder';
import { LineConfigDialog } from './LineConfigDialog';
import { MultiLineToggle } from './MultiLineToggle';
import type { AgreementLine } from '@/types/agreement-line';
import { useMultiLineAgreement } from '@/hooks/useMultiLineAgreement';

interface MultiLineAgreementStepProps {
  customerId?: string;
  onDataChange: (data: any) => void;
  initialData?: any;
}

export const MultiLineAgreementStep: React.FC<MultiLineAgreementStepProps> = ({
  customerId,
  onDataChange,
  initialData,
}) => {
  const [multiLineEnabled, setMultiLineEnabled] = useState(initialData?.multiLineEnabled || false);
  const [editingLine, setEditingLine] = useState<AgreementLine | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  const {
    multiLineData,
    addLine,
    removeLine,
    duplicateLine,
    updateLine,
    getLine,
    recalculateTotalPricing,
    validateLine,
    totalAmount,
    lineCount,
  } = useMultiLineAgreement({
    enabled: multiLineEnabled,
    initialData: initialData?.multiLineData,
  });

  const handleToggleMultiLine = (enabled: boolean) => {
    setMultiLineEnabled(enabled);
    if (enabled && lineCount === 0) {
      // Automatically add first line when enabling
      const newLine = addLine();
      handleEditLine(newLine.id);
    }
    onDataChange({
      multiLineEnabled: enabled,
      multiLineData: enabled ? multiLineData : null,
    });
  };

  const handleAddLine = () => {
    const newLine = addLine();
    setEditingLine(newLine);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEditLine = (lineId: string) => {
    const line = getLine(lineId);
    if (line) {
      setEditingLine(line);
      setDialogMode('edit');
      setDialogOpen(true);
    }
  };

  const handleSaveLine = (line: AgreementLine) => {
    updateLine(line.id, line);
    validateLine(line.id);
    recalculateTotalPricing();
    onDataChange({
      multiLineEnabled,
      multiLineData,
    });
  };

  const handleRemoveLine = (lineId: string) => {
    removeLine(lineId);
    recalculateTotalPricing();
    onDataChange({
      multiLineEnabled,
      multiLineData,
    });
  };

  const handleDuplicateLine = (lineId: string) => {
    duplicateLine(lineId);
    recalculateTotalPricing();
    onDataChange({
      multiLineEnabled,
      multiLineData,
    });
  };

  // Build errors map for MultiLineBuilder
  const lineErrors: Record<string, string[]> = {};
  multiLineData.lines.forEach(line => {
    if (line.errors.length > 0) {
      lineErrors[line.id] = line.errors;
    }
  });

  return (
    <div className="space-y-6">
      {/* Multi-Line Toggle */}
      <MultiLineToggle
        enabled={multiLineEnabled}
        onToggle={handleToggleMultiLine}
        lineCount={lineCount}
        disabled={!customerId}
        disabledReason={!customerId ? 'Please select a customer first' : undefined}
      />

      {/* Multi-Line Builder (only shown when enabled) */}
      {multiLineEnabled && (
        <MultiLineBuilder
          lines={multiLineData.lines}
          onAddLine={handleAddLine}
          onRemoveLine={handleRemoveLine}
          onDuplicateLine={handleDuplicateLine}
          onEditLine={handleEditLine}
          totalAmount={totalAmount}
          errors={lineErrors}
        />
      )}

      {/* Line Configuration Dialog */}
      <LineConfigDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        line={editingLine}
        onSave={handleSaveLine}
        mode={dialogMode}
      />
    </div>
  );
};
