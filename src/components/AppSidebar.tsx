
import React from 'react';
import { MapPin, Globe2, Home } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  selectedRegion: 'thailand' | 'neighbors' | 'all';
  onRegionChange: (region: 'thailand' | 'neighbors' | 'all') => void;
}

const regions = [
  {
    id: 'all' as const,
    title: 'ทั้งหมด',
    icon: Globe2,
    description: 'แจ้งเตือนทั่วโลก'
  },
  {
    id: 'thailand' as const,
    title: 'ประเทศไทย',
    icon: Home,
    description: 'เฉพาะในประเทศ'
  },
  {
    id: 'neighbors' as const,
    title: 'ประเทศเพื่อนบ้าน',
    icon: MapPin,
    description: 'ประเทศใกล้เคียง'
  },
];

export function AppSidebar({ selectedRegion, onRegionChange }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
            alt="D-MIND Logo" 
            className="h-6 w-6"
          />
          <h2 className="font-semibold text-lg">บริเวณแจ้งเตือน</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>เลือกบริเวณ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {regions.map((region) => {
                const Icon = region.icon;
                return (
                  <SidebarMenuItem key={region.id}>
                    <SidebarMenuButton 
                      onClick={() => onRegionChange(region.id)}
                      isActive={selectedRegion === region.id}
                      className="w-full"
                    >
                      <Icon className="h-4 w-4" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{region.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {region.description}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
