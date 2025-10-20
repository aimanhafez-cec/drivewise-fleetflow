import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Maintenance = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance</h1>
          <p className="text-muted-foreground mt-1">Schedule and track vehicle maintenance</p>
        </div>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Settings2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This feature will help you schedule and track all vehicle maintenance activities.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <ul className="text-sm text-muted-foreground space-y-2 mb-6">
            <li>• Schedule preventive and corrective maintenance tasks</li>
            <li>• Track maintenance history and service records</li>
            <li>• Manage service providers and vendors</li>
            <li>• Monitor maintenance costs and budgets</li>
          </ul>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;
