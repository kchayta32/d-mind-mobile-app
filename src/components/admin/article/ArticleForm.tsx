
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';
import ImageUpload from '../ImageUpload';
import { Article } from './types';

interface ArticleFormProps {
  article: Article | null;
  onSave: () => void;
  onCancel: () => void;
  onUpdate: (updates: Partial<Article>) => void;
  typeLabel: string;
}

export const ArticleForm: React.FC<ArticleFormProps> = ({
  article,
  onSave,
  onCancel,
  onUpdate,
  typeLabel
}) => {
  if (!article) return null;

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-700">
          {article.id.startsWith('new-') ? `เพิ่ม${typeLabel}ใหม่` : `แก้ไข${typeLabel}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="title">ชื่อเรื่อง</Label>
          <Input
            id="title"
            value={article.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder={`ระบุชื่อ${typeLabel}`}
          />
        </div>
        
        <div>
          <Label htmlFor="subtitle">คำบรรยาย</Label>
          <Input
            id="subtitle"
            value={article.subtitle || ''}
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            placeholder="แหล่งที่มาหรือคำบรรยายย่อ"
          />
        </div>
        
        <div>
          <Label htmlFor="description">รายละเอียดสั้น</Label>
          <Input
            id="description"
            value={article.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="รายละเอียดสั้นๆ ที่จะแสดงในรายการ"
          />
        </div>
        
        <ImageUpload
          value={article.image || ''}
          onChange={(url) => onUpdate({ image: url })}
          label={`รูปภาพ${typeLabel}`}
        />
        
        <div>
          <Label htmlFor="content">เนื้อหา</Label>
          <div className="mt-2">
            <RichTextEditor
              value={article.content || ''}
              onChange={(content) => onUpdate({ content })}
              placeholder={`เขียนเนื้อหาของ${typeLabel}ที่นี่...`}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            บันทึก
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            ยกเลิก
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
