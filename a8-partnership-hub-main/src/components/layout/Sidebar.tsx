
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  Sidebar as SidebarComponent, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { BarChart3, PieChart, Search, Users, FileText, BarChart } from "lucide-react";

const Sidebar = () => {
  return (
    <SidebarComponent>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-aeight-blue rounded-md flex items-center justify-center text-white font-bold">
            A8
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">A&eight</h2>
            <p className="text-xs text-gray-300">Partnership Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className={({isActive}) => isActive ? "text-white bg-sidebar-accent p-2 rounded-md w-full flex items-center gap-2" : "text-sidebar-foreground hover:text-white p-2 rounded-md w-full flex items-center gap-2"}>
                    <BarChart3 className="h-4 w-4" />
                    <span>Overview</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/opportunities" className={({isActive}) => isActive ? "text-white bg-sidebar-accent p-2 rounded-md w-full flex items-center gap-2" : "text-sidebar-foreground hover:text-white p-2 rounded-md w-full flex items-center gap-2"}>
                    <FileText className="h-4 w-4" />
                    <span>Opportunities</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/partners" className={({isActive}) => isActive ? "text-white bg-sidebar-accent p-2 rounded-md w-full flex items-center gap-2" : "text-sidebar-foreground hover:text-white p-2 rounded-md w-full flex items-center gap-2"}>
                    <Users className="h-4 w-4" />
                    <span>Partners</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/reports" className={({isActive}) => isActive ? "text-white bg-sidebar-accent p-2 rounded-md w-full flex items-center gap-2" : "text-sidebar-foreground hover:text-white p-2 rounded-md w-full flex items-center gap-2"}>
                    <PieChart className="h-4 w-4" />
                    <span>Reports</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-400">
            <p>A&eight Group Analytics</p>
            <p>© 2025 All rights reserved</p>
          </div>
          <SidebarTrigger>
            <span className="sr-only">Toggle sidebar</span>
            <BarChart className="h-5 w-5 text-gray-400" />
          </SidebarTrigger>
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
};

export default Sidebar;
