
import { useState } from 'react';
import { Article } from './types';

export const useArticleManager = (type: 'article' | 'guide') => {
  const [articles, setArticles] = useState<Article[]>([
    {
      id: 'sample-1',
      title: type === 'article' ? 'บทความตัวอย่าง' : 'คู่มือตัวอย่าง',
      subtitle: 'จาก ระบบจัดการแอดมิน',
      description: 'นี่คือตัวอย่างบทความสำหรับการทดสอบระบบ',
      image: '/lovable-uploads/70e87fa1-9284-4474-bda5-04c19250a4d5.png',
      content: '<h2>ตัวอย่างเนื้อหา</h2><p>นี่คือตัวอย่างเนื้อหาที่สามารถจัดรูปแบบได้ด้วย <strong>HTML</strong></p><ul><li>รายการที่ 1</li><li>รายการที่ 2</li></ul>',
      created_at: new Date().toISOString()
    }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const handleCreateNew = () => {
    const newArticle: Article = {
      id: `new-${Date.now()}`,
      title: '',
      subtitle: '',
      description: '',
      image: '',
      content: '',
      created_at: new Date().toISOString()
    };
    setEditingArticle(newArticle);
    setIsEditing(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle({ ...article });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingArticle) return;

    const existingIndex = articles.findIndex(a => a.id === editingArticle.id);
    if (existingIndex >= 0) {
      const updated = [...articles];
      updated[existingIndex] = editingArticle;
      setArticles(updated);
    } else {
      setArticles([...articles, editingArticle]);
    }
    
    setIsEditing(false);
    setEditingArticle(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingArticle(null);
  };

  const updateEditingArticle = (updates: Partial<Article>) => {
    if (editingArticle) {
      setEditingArticle({ ...editingArticle, ...updates });
    }
  };

  return {
    articles,
    isEditing,
    editingArticle,
    handleCreateNew,
    handleEdit,
    handleSave,
    handleCancel,
    updateEditingArticle
  };
};
