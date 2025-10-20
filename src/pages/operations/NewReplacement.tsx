import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReplacementForm from './components/ReplacementForm';

export default function NewReplacement() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/operations/replacements')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Replacement Request</h1>
          <p className="text-muted-foreground mt-1">
            Create a temporary or permanent vehicle replacement
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Replacement Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ReplacementForm />
        </CardContent>
      </Card>
    </div>
  );
}
