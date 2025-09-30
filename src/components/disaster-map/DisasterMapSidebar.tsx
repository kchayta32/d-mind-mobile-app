import React from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Activity, CloudRain, Flame, Wind, Sun, Waves, BarChart3, Map, Settings, Info } from 'lucide-react';
const menuItems = [{
  title: 'ภาพรวม',
  icon: BarChart3,
  description: 'สถิติและภาพรวมทั่วไป'
}, {
  title: 'แผ่นดินไหว',
  icon: Activity,
  description: 'ข้อมูลแผ่นดินไหวล่าสุด'
}, {
  title: 'ฝนตกหนัก',
  icon: CloudRain,
  description: 'เซ็นเซอร์ตรวจวัดฝน'
}, {
  title: 'ไฟป่า',
  icon: Flame,
  description: 'จุดความร้อนจากดาวเทียม'
}, {
  title: 'มลพิษอากาศ',
  icon: Wind,
  description: 'คุณภาพอากาศ PM2.5'
}, {
  title: 'ภัยแล้ง',
  icon: Sun,
  description: 'ดัชนีความเสี่ยงภัยแล้ง'
}, {
  title: 'น้ำท่วม',
  icon: Waves,
  description: 'พื้นที่เสี่ยงน้ำท่วม'
}];
export function DisasterMapSidebar() {
  return;
}