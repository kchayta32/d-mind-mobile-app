
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface EmergencyArticle {
  id?: number;
  content?: string;
  metadata?: {
    title?: string;
    category?: string;
    summary?: string;
  };
}

// Helper function to safely convert Json type to EmergencyArticle metadata
const convertMetadata = (metadata: Json | null): EmergencyArticle['metadata'] => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }
  
  // Type assertion after validating it's an object
  const meta = metadata as Record<string, unknown>;
  
  return {
    title: typeof meta.title === 'string' ? meta.title : undefined,
    category: typeof meta.category === 'string' ? meta.category : undefined,
    summary: typeof meta.summary === 'string' ? meta.summary : undefined,
  };
};

const EmergencyArticles: React.FC = () => {
  const [articles, setArticles] = useState<EmergencyArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('เตือนภัย CAP')
          .select('id, content, metadata')
          .order('id', { ascending: true });

        if (error) {
          throw error;
        }

        // Convert the data to match our EmergencyArticle interface
        const formattedArticles: EmergencyArticle[] = (data || []).map(item => ({
          id: item.id || undefined,
          content: item.content || undefined,
          metadata: convertMetadata(item.metadata),
        }));

        setArticles(formattedArticles);
      } catch (err) {
        console.error('Error fetching emergency articles:', err);
        setError('ไม่สามารถโหลดข้อมูลบทความได้ กรุณาลองอีกครั้งภายหลัง');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-guardian-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">ไม่พบบทความในระบบ</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <Card key={article.id} className="overflow-hidden">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold mb-2">
              {article.metadata?.title || 'บทความเตือนภัย'}
            </h2>
            
            {article.metadata?.category && (
              <div className="inline-block bg-guardian-purple/10 text-guardian-purple px-2 py-0.5 rounded text-xs mb-2">
                {article.metadata.category}
              </div>
            )}
            
            {article.metadata?.summary && (
              <p className="text-sm text-gray-700 mb-2">{article.metadata.summary}</p>
            )}
            
            <ScrollArea className="max-h-48">
              <div className="text-sm whitespace-pre-wrap">
                {article.content || 'ไม่มีเนื้อหา'}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmergencyArticles;
