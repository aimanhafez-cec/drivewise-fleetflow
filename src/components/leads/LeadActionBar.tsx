import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, X, UserPlus, Mail, Phone, MessageCircle } from 'lucide-react';
import { Lead } from '@/hooks/useLeadsRealtime';

interface LeadActionBarProps {
  lead: Lead;
  onConfirm: () => void;
  onSendQuote: () => void;
  onReject: () => void;
  onAssign: () => void;
  onContact: (method: 'email' | 'phone' | 'whatsapp') => void;
}

export const LeadActionBar = ({
  lead,
  onConfirm,
  onSendQuote,
  onReject,
  onAssign,
  onContact,
}: LeadActionBarProps) => {
  const canConfirm = ['new', 'contacted', 'quoted'].includes(lead.status);
  const canSendQuote = lead.status !== 'confirmed' && lead.status !== 'rejected';
  const isUAEPhone = lead.customer_phone?.startsWith('+971') || false;

  return (
    <div className="flex flex-wrap gap-2">
      {canConfirm && (
        <Button onClick={onConfirm} className="gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Confirm Lead
        </Button>
      )}
      
      {canSendQuote && (
        <Button onClick={onSendQuote} variant="secondary" className="gap-2">
          <FileText className="h-4 w-4" />
          Send Quote
        </Button>
      )}
      
      <Button onClick={() => onContact('email')} variant="outline" className="gap-2">
        <Mail className="h-4 w-4" />
        Email
      </Button>
      
      <Button onClick={() => onContact('phone')} variant="outline" className="gap-2">
        <Phone className="h-4 w-4" />
        Call
      </Button>
      
      {isUAEPhone && (
        <Button onClick={() => onContact('whatsapp')} variant="outline" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button>
      )}
      
      {!lead.assigned_to && (
        <Button onClick={onAssign} variant="outline" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Assign Agent
        </Button>
      )}
      
      {lead.status !== 'rejected' && (
        <Button onClick={onReject} variant="destructive" className="gap-2">
          <X className="h-4 w-4" />
          Reject
        </Button>
      )}
    </div>
  );
};
