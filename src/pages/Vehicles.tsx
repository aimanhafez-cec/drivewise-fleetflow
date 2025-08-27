import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import VehicleForm from '@/components/vehicles/VehicleForm';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  color: string;
  status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  odometer: number;
  fuel_level: number;
  location: string;
  transmission: string;
  engine_size: string;
  features: string[];
  category_id: string;
  subtype: string;
  ownership_type: string;
  categories?: {
    name: string;
    icon: string;
  };
}

const statusConfig = {
  available: { label: 'Available', className: 'bg-green-500 text-white' },
  rented: { label: 'On Rent', className: 'bg-orange-500 text-white' },
  maintenance: { label: 'In Service', className: 'bg-blue-500 text-white' },
  out_of_service: { label: 'Out of Service', className: 'bg-red-500 text-white' },
};

const Vehicles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Vehicle>('make');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          categories (
            name,
            icon
          )
        `)
        .order('make', { ascending: true });

      if (error) throw error;
      return data as Vehicle[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredVehicles = vehicles?.filter(vehicle => {
    const matchesSearch = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      vehicle.category_id === selectedCategory ||
      (!vehicle.category_id && selectedCategory === 'uncategorized');
    
    return matchesSearch && matchesCategory;
  }) || [];

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVehicles = sortedVehicles.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof Vehicle) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAdd = () => {
    setSelectedVehicle(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedVehicle(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden" data-page="vehicles">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Vehicles</h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <Select value={`${itemsPerPage}`} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
            <SelectTrigger className="w-16 sm:w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="flex-shrink-0">
            <Filter className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd} className="bg-teal-500 hover:bg-teal-600 flex-shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">New Vehicle</span>
                <span className="sm:hidden">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                </DialogTitle>
              </DialogHeader>
              <VehicleForm
                vehicle={selectedVehicle}
                onSuccess={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Vehicle Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
            {categories?.map(category => <SelectItem key={category.id} value={category.id}>
                {category.name} - {category.description || ""}
              </SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-slate-800 text-white">
              <TableRow>
                <TableHead className="text-white cursor-pointer min-w-[80px]" onClick={() => handleSort('id')}>
                  <div className="flex items-center">
                    Vehicle No.
                    {sortField === 'id' && (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                  </div>
                </TableHead>
                <TableHead className="text-white cursor-pointer min-w-[100px]" onClick={() => handleSort('license_plate')}>
                  <div className="flex items-center">
                    License No.
                    {sortField === 'license_plate' && (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                  </div>
                </TableHead>
                <TableHead className="text-white cursor-pointer min-w-[80px]" onClick={() => handleSort('make')}>
                  <div className="flex items-center">
                    Make
                    {sortField === 'make' && (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                  </div>
                </TableHead>
                <TableHead className="text-white cursor-pointer min-w-[80px]" onClick={() => handleSort('model')}>
                  <div className="flex items-center">
                    Model
                    {sortField === 'model' && (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                  </div>
                </TableHead>
                <TableHead className="text-white cursor-pointer min-w-[70px]" onClick={() => handleSort('year')}>
                  <div className="flex items-center">
                    Year
                    {sortField === 'year' && (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                  </div>
                </TableHead>
                <TableHead className="text-white cursor-pointer min-w-[100px]" onClick={() => handleSort('status')}>
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                  </div>
                </TableHead>
                <TableHead className="text-white min-w-[100px] hidden md:table-cell">Type</TableHead>
                <TableHead className="text-white min-w-[120px] hidden lg:table-cell">Location</TableHead>
                <TableHead className="text-white min-w-[150px] hidden lg:table-cell">VIN</TableHead>
                <TableHead className="text-white min-w-[100px] hidden xl:table-cell">Transmission</TableHead>
                <TableHead className="text-white min-w-[120px] hidden xl:table-cell">Odometer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVehicles.map((vehicle, index) => (
                <TableRow 
                  key={vehicle.id} 
                  className="hover:bg-muted/50 cursor-pointer text-card-foreground"
                  onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                >
                  <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{vehicle.license_plate}</TableCell>
                  <TableCell>{vehicle.make}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[vehicle.status]?.className}>
                      {statusConfig[vehicle.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{vehicle.subtype || vehicle.categories?.name || '-'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{vehicle.location || '-'}</TableCell>
                  <TableCell className="font-mono text-xs hidden lg:table-cell">{vehicle.vin}</TableCell>
                  <TableCell className="hidden xl:table-cell">{vehicle.transmission || 'Automatic'}</TableCell>
                  <TableCell className="hidden xl:table-cell">{vehicle.odometer?.toLocaleString() || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Rows per Page: {itemsPerPage} | Current Page: {currentPage}
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNumber = i + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNumber)}
                    isActive={currentPage === pageNumber}
                    className="cursor-pointer"
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {filteredVehicles.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first vehicle.'}
          </p>
          {!searchTerm && (
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Vehicles;