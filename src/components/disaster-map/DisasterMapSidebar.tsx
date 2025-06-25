
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { 
  Activity, 
  CloudRain, 
  Flame, 
  Wind, 
  Sun,
  Waves,
  BarChart3,
  Map,
  Settings,
  Info
} from 'lucide-react';

const menuItems = [
  {
    title: 'ภาพรวม',
    icon: BarChart3,
    description: 'สถิติและภาพรวมทั่วไป'
  },
  {
    title: 'แผ่นดินไหว',
    icon: Activity,
    description: 'ข้อมูลแผ่นดินไหวล่าสุด'
  },
  {
    title: 'ฝนตกหนัก',
    icon: CloudRain,
    description: 'เซ็นเซอร์ตรวจวัดฝน'
  },
  {
    title: 'ไฟป่า',
    icon: Flame,
    description: 'จุดความร้อนจากดาวเทียม'
  },
  {
    title: 'มลพิษอากาศ',
    icon: Wind,
    description: 'คุณภาพอากาศ PM2.5'
  },
  {
    title: 'ภัยแล้ง',
    icon: Sun,
    description: 'ดัชนีความเสี่ยงภัยแล้ง'
  },
  {
    title: 'น้ำท่วม',
    icon: Waves,
    description: 'พื้นที่เสี่ยงน้ำท่วม'
  }
];

export function DisasterMapSidebar() {
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
              <Map className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">เมนูแผนที่</h2>
              <p className="text-xs text-gray-600">เลือกดูข้อมูลภัยพิบัติ</p>
            </div>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 font-medium">
            ประเภทภัยพิบัติ
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="flex items-start space-x-3 p-3 hover:bg-blue-50 rounded-lg">
                    <item.icon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 font-medium">
            เครื่องมือ
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-900">ตั้งค่าแผนที่</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <Info className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-900">คำอธิบายสัญลักษณ์</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
