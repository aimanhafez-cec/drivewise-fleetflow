import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
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

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <RefreshCw className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This feature will help you manage vehicle replacement requests and track replacement history.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <ul className="text-sm text-muted-foreground space-y-2 mb-6">
            <li>• Track replacement vehicles assigned to customers</li>
            <li>• Manage replacement requests and approvals</li>
            <li>• View complete replacement history and analytics</li>
            <li>• Generate replacement reports and documentation</li>
          </ul>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageReplacement;
