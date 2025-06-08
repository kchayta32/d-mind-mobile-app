
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, FileText, Plus, Edit } from 'lucide-react';

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-700">ระบบจัดการแอดมิน</h2>
        <Button
          onClick={onLogout}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          ออกจากระบบ
        </Button>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <FileText className="w-5 h-5" />
              จัดการบทความ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4" />
              เพิ่มบทความใหม่
            </Button>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Edit className="w-4 h-4" />
              แก้ไขบทความที่มีอยู่
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <FileText className="w-5 h-5" />
              จัดการคู่มือ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              เพิ่มคู่มือใหม่
            </Button>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Edit className="w-4 h-4" />
              แก้ไขคู่มือที่มีอยู่
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-700">สถิติการใช้งาน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">24</div>
              <div className="text-sm text-gray-600">บทความทั้งหมด</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600">คู่มือทั้งหมด</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-sm text-gray-600">ผู้เข้าชมวันนี้</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
