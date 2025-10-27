import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Award, AlertCircle, CheckCircle2, Star, TrendingUp, Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface LoyaltyPointsPaymentProps {
  amount: number;
  loyaltyPoints: number;
  loyaltyTier?: string;
  conversionRate?: number; // points per 1 AED
  minRedemption?: number; // minimum points to redeem
  onPointsChange: (points: number, aedValue: number) => void;
  onProcessPoints: (points: number, aedValue: number) => void;
  disabled?: boolean;
}

const TIER_COLORS = {
  bronze: 'bg-orange-700 text-white',
  silver: 'bg-gray-400 text-gray-900',
  gold: 'bg-yellow-500 text-gray-900',
  platinum: 'bg-purple-600 text-white',
};

export const LoyaltyPointsPayment: React.FC<LoyaltyPointsPaymentProps> = ({
  amount,
  loyaltyPoints,
  loyaltyTier = 'bronze',
  conversionRate = 100, // default: 100 points = 1 AED
  minRedemption = 1000,
  onPointsChange,
  onProcessPoints,
  disabled = false,
}) => {
  const maxAedFromPoints = loyaltyPoints / conversionRate;
  const maxUsableAmount = Math.min(maxAedFromPoints, amount);
  const maxUsablePoints = maxUsableAmount * conversionRate;

  const [selectedPoints, setSelectedPoints] = useState(
    Math.min(minRedemption, maxUsablePoints)
  );
  const [error, setError] = useState<string | null>(null);

  const aedValue = selectedPoints / conversionRate;
  const remainingPoints = loyaltyPoints - selectedPoints;
  const percentageUsed = (selectedPoints / loyaltyPoints) * 100;

  const handlePointsChange = (points: number) => {
    setSelectedPoints(points);
    const aed = points / conversionRate;
    onPointsChange(points, aed);
    
    if (points < minRedemption) {
      setError(`Minimum ${minRedemption.toLocaleString()} points required for redemption`);
    } else if (points > loyaltyPoints) {
      setError('Insufficient loyalty points');
    } else if (aed > amount) {
      setError('Points value exceeds payment amount');
    } else {
      setError(null);
    }
  };

  const handleSliderChange = (values: number[]) => {
    handlePointsChange(values[0]);
  };

  const handleAedInputChange = (aed: number) => {
    const points = aed * conversionRate;
    handlePointsChange(Math.round(points));
  };

  const handleUseMax = () => {
    handlePointsChange(maxUsablePoints);
  };

  const handleQuickAmount = (percentage: number) => {
    const points = (loyaltyPoints * percentage) / 100;
    const cappedPoints = Math.min(points, maxUsablePoints);
    handlePointsChange(Math.round(cappedPoints));
  };

  const handleProcess = () => {
    if (selectedPoints < minRedemption) {
      setError(`Minimum ${minRedemption.toLocaleString()} points required`);
      return;
    }
    if (selectedPoints > loyaltyPoints) {
      setError('Insufficient points');
      return;
    }
    onProcessPoints(selectedPoints, aedValue);
  };

  const canProcess = 
    selectedPoints >= minRedemption && 
    selectedPoints <= loyaltyPoints && 
    aedValue <= amount && 
    !error;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Loyalty Points Redemption
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Loyalty Status */}
        <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Your Tier</span>
            </div>
            <Badge className={TIER_COLORS[loyaltyTier.toLowerCase() as keyof typeof TIER_COLORS] || 'bg-primary'}>
              {loyaltyTier.toUpperCase()}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Available Points</p>
            <p className="text-3xl font-bold text-foreground">
              {loyaltyPoints.toLocaleString()} <span className="text-lg">pts</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ≈ {maxAedFromPoints.toFixed(2)} AED value
            </p>
          </div>
        </div>

        {/* Conversion Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">Conversion Rate</p>
            <p className="text-sm text-muted-foreground">
              {conversionRate} points = 1 AED | Minimum redemption: {minRedemption.toLocaleString()} points
            </p>
          </AlertDescription>
        </Alert>

        {/* Points Selection */}
        <div className="space-y-4">
          {/* Points Input */}
          <div>
            <Label htmlFor="points-input">Points to Redeem</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                id="points-input"
                type="number"
                value={selectedPoints}
                onChange={(e) => handlePointsChange(parseInt(e.target.value) || 0)}
                min={0}
                max={maxUsablePoints}
                step={100}
                disabled={disabled}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseMax}
                disabled={disabled}
              >
                Max
              </Button>
            </div>
          </div>

          {/* AED Value Input */}
          <div>
            <Label htmlFor="aed-input">Or Enter AED Amount</Label>
            <Input
              id="aed-input"
              type="number"
              value={aedValue.toFixed(2)}
              onChange={(e) => handleAedInputChange(parseFloat(e.target.value) || 0)}
              min={0}
              max={maxUsableAmount}
              step={0.01}
              disabled={disabled}
              className="mt-2"
            />
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Points Slider</Label>
              <span className="text-sm font-medium">{percentageUsed.toFixed(0)}%</span>
            </div>
            <Slider
              value={[selectedPoints]}
              onValueChange={handleSliderChange}
              max={maxUsablePoints}
              min={0}
              step={100}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0 pts</span>
              <span>{maxUsablePoints.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Quick Percentage Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percentage) => (
              <Button
                key={percentage}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(percentage)}
                disabled={disabled}
              >
                {percentage}%
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Redemption Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Points to Redeem</p>
            </div>
            <p className="text-2xl font-bold text-primary">
              {selectedPoints.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {percentageUsed.toFixed(1)}% of available points
            </p>
          </div>
          
          <div className="p-4 bg-green-500/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium">AED Value</p>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {aedValue.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Applied to payment
            </p>
          </div>
        </div>

        {/* After Redemption */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <p className="text-sm font-medium">After Redemption</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Remaining Points</span>
            <span className="font-semibold">{remainingPoints.toLocaleString()} pts</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Remaining Value</span>
            <span className="font-semibold">{(remainingPoints / conversionRate).toFixed(2)} AED</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Indicator */}
        {canProcess && (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Ready to redeem {selectedPoints.toLocaleString()} points ({aedValue.toFixed(2)} AED)
            </AlertDescription>
          </Alert>
        )}

        {/* Warning if points exceed amount */}
        {aedValue > amount && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Points value ({aedValue.toFixed(2)} AED) exceeds payment amount ({amount.toFixed(2)} AED). 
              Maximum usable: {maxUsablePoints.toLocaleString()} points.
            </AlertDescription>
          </Alert>
        )}

        {/* Process Button */}
        <Button
          onClick={handleProcess}
          disabled={disabled || !canProcess}
          className="w-full"
          size="lg"
        >
          Redeem Points ({selectedPoints.toLocaleString()} pts = {aedValue.toFixed(2)} AED)
        </Button>
      </CardContent>
    </Card>
  );
};
