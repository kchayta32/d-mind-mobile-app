
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ArticleList } from './article/ArticleList';
import { ArticleForm } from './article/ArticleForm';
import { useArticleManager } from './article/useArticleManager';
import { ArticleManagerProps } from './article/types';

const ArticleManager: React.FC<ArticleManagerProps> = ({ onBack, type }) => {
  const {
    articles,
    isEditing,
    editingArticle,
    handleCreateNew,
    handleEdit,
    handleSave,
    handleCancel,
    updateEditingArticle
  } = useArticleManager(type);

  const typeLabel = type === 'article' ? 'บทความ' : 'คู่มือ';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-blue-600 hover:bg-blue-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold text-blue-700">จัดการ{typeLabel}</h2>
      </div>

      {!isEditing ? (
        <ArticleList
          articles={articles}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          typeLabel={typeLabel}
        />
      ) : (
        <ArticleForm
          article={editingArticle}
          onSave={handleSave}
          onCancel={handleCancel}
          onUpdate={updateEditingArticle}
          typeLabel={typeLabel}
        />
      )}
    </div>
  );
};

export default ArticleManager;
