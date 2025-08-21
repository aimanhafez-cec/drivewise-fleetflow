import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Star, MessageCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SatisfactionFeedbackReportProps {
  dateRange?: DateRange;
}

const SatisfactionFeedbackReport: React.FC<SatisfactionFeedbackReportProps> = ({ dateRange }) => {
  // Mock data for satisfaction and feedback since these tables don't exist yet
  // In a real implementation, you would create feedback, ratings, and complaints tables
  
  const mockRatingsData = [
    { month: 'Jan', rating: 4.2, responses: 45 },
    { month: 'Feb', rating: 4.1, responses: 52 },
    { month: 'Mar', rating: 4.4, responses: 61 },
    { month: 'Apr', rating: 4.3, responses: 48 },
    { month: 'May', rating: 4.5, responses: 67 },
    { month: 'Jun', rating: 4.2, responses: 55 },
  ];

  const mockFeedbackCategories = [
    { category: 'Vehicle Condition', positive: 85, negative: 15 },
    { category: 'Staff Service', positive: 92, negative: 8 },
    { category: 'Booking Process', positive: 88, negative: 12 },
    { category: 'Pricing', positive: 76, negative: 24 },
    { category: 'Location Convenience', positive: 89, negative: 11 },
  ];

  const mockComplaints = [
    {
      id: 1,
      customer: 'Ahmed Al Rashid',
      category: 'Vehicle Condition',
      description: 'Vehicle was not properly cleaned',
      status: 'Resolved',
      created_at: '2024-01-15',
      resolved_at: '2024-01-16'
    },
    {
      id: 2,
      customer: 'Sara Mohammed',
      category: 'Staff Service',
      description: 'Long wait time during pickup',
      status: 'In Progress',
      created_at: '2024-01-18',
      resolved_at: null
    },
    {
      id: 3,
      customer: 'Omar Hassan',
      category: 'Pricing',
      description: 'Unexpected charges not explained',
      status: 'Resolved',
      created_at: '2024-01-20',
      resolved_at: '2024-01-22'
    }
  ];

  const mockNPSData = [
    { score: 9, label: 'Promoters', count: 145, color: 'hsl(var(--success))' },
    { score: 7, label: 'Passives', count: 98, color: 'hsl(var(--warning))' },
    { score: 4, label: 'Detractors', count: 23, color: 'hsl(var(--destructive))' }
  ];

  // Calculate NPS Score
  const totalResponses = mockNPSData.reduce((sum, item) => sum + item.count, 0);
  const promoters = mockNPSData[0].count;
  const detractors = mockNPSData[2].count;
  const npsScore = totalResponses > 0 ? ((promoters - detractors) / totalResponses) * 100 : 0;

  // Calculate average rating
  const averageRating = mockRatingsData.reduce((sum, month) => sum + month.rating, 0) / mockRatingsData.length;
  
  // Calculate resolution rate
  const resolvedComplaints = mockComplaints.filter(c => c.status === 'Resolved').length;
  const resolutionRate = (resolvedComplaints / mockComplaints.length) * 100;

  const chartColors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}/5.0</div>
            <p className="text-xs text-muted-foreground">
              From {mockRatingsData.reduce((sum, m) => sum + m.responses, 0)} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{npsScore.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              {totalResponses} total responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockComplaints.length}</div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <MessageCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolutionRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {resolvedComplaints} of {mockComplaints.length} resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Rating Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Trends</CardTitle>
            <CardDescription>Customer satisfaction over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockRatingsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}/5.0`, 'Average Rating']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="hsl(var(--warning))" 
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* NPS Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>NPS Distribution</CardTitle>
            <CardDescription>Customer loyalty segmentation</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockNPSData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="count"
                    label={({ label, count }) => `${label}: ${count}`}
                  >
                    {mockNPSData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Feedback Categories */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Feedback by Category</CardTitle>
            <CardDescription>Positive vs negative feedback distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockFeedbackCategories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="positive" stackId="a" fill="hsl(var(--success))" name="Positive" />
                  <Bar dataKey="negative" stackId="a" fill="hsl(var(--destructive))" name="Negative" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Complaints</CardTitle>
          <CardDescription>Latest customer complaints and resolution status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Resolution Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockComplaints.map((complaint) => {
                const resolutionDays = complaint.resolved_at 
                  ? Math.ceil((new Date(complaint.resolved_at).getTime() - new Date(complaint.created_at).getTime()) / (1000 * 60 * 60 * 24))
                  : null;
                
                return (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-medium">{complaint.customer}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{complaint.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{complaint.description}</TableCell>
                    <TableCell>
                      <Badge variant={complaint.status === 'Resolved' ? 'default' : 'secondary'}>
                        {complaint.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(complaint.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      {resolutionDays ? `${resolutionDays} day${resolutionDays !== 1 ? 's' : ''}` : 'Pending'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Note about mock data */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              <strong>Note:</strong> This report currently displays mock data. To fully implement customer satisfaction tracking, 
              you would need to add feedback, ratings, and complaints tables to your database, and integrate with your customer communication system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SatisfactionFeedbackReport;