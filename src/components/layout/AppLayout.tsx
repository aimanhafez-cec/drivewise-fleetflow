import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Calendar,
  CalendarRange,
  Users,
  FileText,
  ClipboardCheck,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  Bell,
  MessageCircleQuestion
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { NavLink } from 'react-router-dom';
import QuickSearch from "@/components/search/QuickSearch";

const navigation = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Reservations',
    url: '/reservations',
    icon: Calendar,
  },
  {
    title: 'Daily Planner',
    url: '/daily-planner',
    icon: CalendarRange,
  },
  {
    title: 'Vehicles',
    url: '/vehicles',
    icon: Car,
  },
  {
    title: 'Customers',
    url: '/customers',
    icon: Users,
  },
  {
    title: 'RFQs',
    url: '/rfqs',
    icon: MessageCircleQuestion,
  },
  {
    title: 'Quotes',
    url: '/quotes',
    icon: FileText,
  },
  {
    title: 'Inspections',
    url: '/inspections',
    icon: ClipboardCheck,
  },
  {
    title: 'Agreements',
    url: '/agreements',
    icon: FileText,
  },
  {
    title: 'Payments',
    url: '/payments',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

const AppLayout = () => {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between border-b px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <QuickSearch />
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <div className="flex-1 p-4 md:p-6 min-w-0 overflow-x-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

function AppSidebar() {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, setOpen } = useSidebar();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      navigate('/auth');
    }
  };

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar 
      className={state === "collapsed" ? "w-14" : "w-60"} 
      collapsible="icon"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CarRental Pro</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span className="md:hidden">{item.title}</span>
                      {state !== "collapsed" && <span className="hidden md:inline">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left hover:bg-muted/50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="md:hidden">Sign Out</span>
                    {state !== "collapsed" && <span className="hidden md:inline">Sign Out</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppLayout;