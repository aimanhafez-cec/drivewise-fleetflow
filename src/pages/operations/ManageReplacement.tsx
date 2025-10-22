import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ManageReplacement = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Replacement</h1>
          <p className="text-muted-foreground mt-1">Track and manage vehicle replacements</p>
        </div>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Configuration Required</CardTitle>
          <CardDescription>
            Please verify system configurations before accessing this feature
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Before you can manage replacements, please ensure the following configurations are set up:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 mb-6 text-left max-w-md mx-auto">
            <li>• Configure replacement policies</li>
            <li>• Set up vehicle eligibility rules</li>
            <li>• Define approval workflows</li>
            <li>• Review replacement request types</li>
          </ul>
          <div className="flex justify-center gap-3">
            <Button onClick={() => navigate('/settings')}>
              Check Settings
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageReplacement;
