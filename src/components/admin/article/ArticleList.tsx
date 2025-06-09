
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import { Article } from './types';

interface ArticleListProps {
  articles: Article[];
  onCreateNew: () => void;
  onEdit: (article: Article) => void;
  typeLabel: string;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  onCreateNew,
  onEdit,
  typeLabel
}) => {
  return (
    <>
      <Button
        onClick={onCreateNew}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        เพิ่ม{typeLabel}ใหม่
      </Button>

      <div className="space-y-4">
        {articles.map((article) => (
          <Card key={article.id} className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img 
                  src={article.image || '/lovable-uploads/70e87fa1-9284-4474-bda5-04c19250a4d5.png'} 
                  alt={article.title}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-700 mb-1">{article.title || 'ไม่มีชื่อเรื่อง'}</h3>
                  <p className="text-sm text-gray-500 mb-2">{article.subtitle}</p>
                  <p className="text-gray-700 text-sm">{article.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    สร้างเมื่อ: {new Date(article.created_at).toLocaleDateString('th-TH')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(article)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  แก้ไข
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};
