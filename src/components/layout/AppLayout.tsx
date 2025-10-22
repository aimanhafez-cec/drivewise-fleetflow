import React, { useState, useEffect } from 'react';
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
  Bell,
  MessageCircleQuestion,
  Zap,
  BarChart3,
  Building2,
  FileSpreadsheet,
  Receipt,
  Wrench,
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
import { AIAssistantButton } from '@/components/ai-assistant/AIAssistantButton';

const navigation = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Instant Booking',
    url: '/instant-booking',
    icon: Zap,
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
    title: 'Manage Quotations',
    url: '/manage-quotations',
    icon: FileSpreadsheet,
  },
  {
    title: 'Inspections',
    url: '/inspections',
    icon: ClipboardCheck,
  },
  {
    title: 'Operations',
    url: '/operations',
    icon: Wrench,
  },
  {
    title: 'Agreements',
    url: '/agreements',
    icon: FileText,
  },
  {
    title: 'Master Agreements',
    url: '/master-agreements',
    icon: Building2,
  },
  {
    title: 'Transactions',
    url: '/transactions',
    icon: Receipt,
  },
  {
    title: 'Reports',
    url: '/reports',
    icon: BarChart3,
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
      <div className="min-h-screen flex w-full overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 w-full">
          <header className="h-14 sm:h-12 flex items-center justify-between border-b px-3 sm:px-4 shrink-0 bg-background">
            <SidebarTrigger className="p-2 hover:bg-muted rounded-md" />
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <QuickSearch />
              </div>
              <AIAssistantButton />
              <Button variant="ghost" size="icon" aria-label="Notifications" className="h-9 w-9 sm:h-8 sm:w-8">
                <Bell className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </header>
          <div className="flex-1 p-3 sm:p-4 md:p-6 min-w-0 overflow-auto">
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
  const { open } = useSidebar();
  const [sidebarWidth, setSidebarWidth] = useState(224);

  useEffect(() => {
    const measureElement = document.createElement('span');
    measureElement.style.cssText = 'position:absolute;visibility:hidden;font-size:0.875rem;font-weight:400;white-space:nowrap;';
    document.body.appendChild(measureElement);
    
    let maxWidth = 0;
    const allItems = [...navigation, { title: 'Sign Out' }];
    
    allItems.forEach(item => {
      measureElement.textContent = item.title;
      const textWidth = measureElement.offsetWidth;
      if (textWidth > maxWidth) maxWidth = textWidth;
    });
    
    document.body.removeChild(measureElement);
    
    // Calculate total: icon(20px) + gap(12px) + text + padding(16px) + extra(16px)
    const totalWidth = 20 + 12 + maxWidth + 16 + 16;
    setSidebarWidth(Math.ceil(totalWidth));
  }, []);

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

  return (
    <Sidebar 
      style={{ width: open ? `${sidebarWidth}px` : undefined }}
      className="data-[state=closed]:w-0 md:data-[state=closed]:w-16 border-r transition-[width]"
      collapsible="icon"
    >
      <SidebarContent className="pt-2">
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="px-1 py-2 text-xs font-semibold text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            Core Car Rental
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-2">
                    <NavLink
                      to={item.url!}
                      className={({ isActive }) =>
                        `flex items-center justify-start group-data-[collapsible=icon]:justify-center gap-3 rounded-md transition-colors min-h-[44px] group-data-[collapsible=icon]:min-h-[40px] ${
                          isActive 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                            : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0 !text-black dark:!text-white" />
                      <span className="truncate text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto px-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-start group-data-[collapsible=icon]:justify-center gap-3 text-left hover:bg-sidebar-accent/50 text-sidebar-foreground rounded-md transition-colors min-h-[44px] group-data-[collapsible=icon]:min-h-[40px]"
                  >
                    <LogOut className="h-5 w-5 shrink-0 !text-black dark:!text-white" />
                    <span className="truncate text-sm group-data-[collapsible=icon]:hidden">Sign Out</span>
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