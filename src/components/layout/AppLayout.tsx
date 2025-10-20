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
  Menu,
  Bell,
  MessageCircleQuestion,
  Zap,
  BarChart3,
  Building2,
  FileCheck,
  FileSpreadsheet,
  ChevronDown,
  Receipt,
  Wallet,
  TrendingUp,
  DollarSign,
  Wrench,
  RefreshCw,
  Settings2
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    icon: Wrench,
    subItems: [
      { title: 'Manage Replacement', url: '/operations/replacement', icon: RefreshCw },
      { title: 'Maintenance', url: '/operations/maintenance', icon: Settings2 },
    ],
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
    icon: Receipt,
    subItems: [
      { title: 'Manage Expenses', url: '/transactions/expenses', icon: Receipt },
      { title: 'Manage Invoices', url: '/transactions/invoices', icon: FileText },
      { title: 'Payment Processing', url: '/transactions/payments', icon: CreditCard },
      { title: 'Revenue Reports', url: '/transactions/revenue', icon: TrendingUp },
      { title: 'Account Ledger', url: '/transactions/ledger', icon: Wallet },
      { title: 'Financial Summary', url: '/transactions/summary', icon: DollarSign },
    ],
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
  const { state, open, setOpen } = useSidebar();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

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

  const isActive = (path: string) => location.pathname === path;
  
  const isSubItemActive = (subItems?: Array<{ url: string }>) => {
    if (!subItems) return false;
    return subItems.some(item => location.pathname.startsWith(item.url));
  };

  // Auto-expand menu if a sub-route is active
  useEffect(() => {
    const activeMenuItem = navigation.find(item => 
      item.subItems && isSubItemActive(item.subItems)
    );
    if (activeMenuItem) {
      setExpandedItem(activeMenuItem.title);
    }
  }, [location.pathname]);

  return (
    <Sidebar 
      className="data-[state=open]:w-64 data-[state=closed]:w-0 md:data-[state=closed]:w-16 border-r"
      collapsible="icon"
    >
      <SidebarContent className="pt-2 overflow-visible">
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="px-1 py-2 text-xs font-semibold text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            Core Car Rental
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.subItems ? (
                    <>
                      {/* Expanded sidebar: Collapsible menu */}
                      <div className="group-data-[collapsible=icon]:hidden">
                        <Collapsible
                          open={expandedItem === item.title}
                          onOpenChange={() => setExpandedItem(expandedItem === item.title ? null : item.title)}
                        >
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton className={`h-10 transition-all duration-200 ${
                              isSubItemActive(item.subItems) ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                            }`}>
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  <item.icon className="h-5 w-5 shrink-0 !text-black dark:!text-white" />
                                  <span className="truncate text-sm">{item.title}</span>
                                </div>
                                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                                  expandedItem === item.title ? 'rotate-180' : ''
                                }`} />
                              </div>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="animate-accordion-down">
                            <SidebarMenu className="ml-6 mt-1 space-y-0.5 border-l border-sidebar-border/50 pl-3">
                              {item.subItems.map((subItem) => (
                                <SidebarMenuItem key={subItem.url}>
                                  <SidebarMenuButton asChild className="h-9">
                                    <NavLink
                                      to={subItem.url}
                                      className={({ isActive }) =>
                                        `flex items-center gap-2 rounded-md transition-all duration-200 text-xs ${
                                          isActive 
                                            ? "bg-sidebar-accent/80 text-sidebar-accent-foreground font-medium shadow-sm" 
                                            : "hover:bg-sidebar-accent/40 text-sidebar-foreground/90 hover:text-sidebar-foreground"
                                        }`
                                      }
                                    >
                                      <subItem.icon className="h-3.5 w-3.5 shrink-0 !text-black dark:!text-white opacity-70" />
                                      <span className="truncate">{subItem.title}</span>
                                    </NavLink>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              ))}
                            </SidebarMenu>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>

                      {/* Collapsed sidebar: Dropdown menu */}
                      <div className="hidden group-data-[collapsible=icon]:block">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton className={`h-10 w-10 p-2 transition-all duration-200 ${
                              isSubItemActive(item.subItems) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                            }`}>
                              <item.icon className="h-5 w-5 shrink-0 !text-black dark:!text-white" />
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start" className="w-56 animate-scale-in">
                            <div className="px-2 py-1.5 text-sm font-semibold">{item.title}</div>
                            {item.subItems.map((subItem) => (
                              <DropdownMenuItem 
                                key={subItem.url}
                                onClick={() => navigate(subItem.url)}
                                className={`cursor-pointer ${
                                  location.pathname.startsWith(subItem.url) ? 'bg-accent' : ''
                                }`}
                              >
                                <subItem.icon className="mr-2 h-4 w-4" />
                                <span>{subItem.title}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </>
                  ) : (
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
                  )}
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