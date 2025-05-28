
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ResourceItem, resourcesData } from '@/data/resourcesData';

const ResourceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resource, setResource] = useState<ResourceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // จำลองการโหลดข้อมูล
    setLoading(true);
    setTimeout(() => {
      const foundResource = resourcesData.find(item => item.id === id);
      
      if (foundResource) {
        setResource(foundResource);
      } else {
        toast({
          title: "ไม่พบบทความ",
          description: "ขออภัย ไม่พบบทความที่คุณต้องการ",
          variant: "destructive"
        });
        navigate('/');
      }
      
      setLoading(false);
    }, 500);
  }, [id, navigate, toast]);

  const handleBackClick = () => {
    navigate('/');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  // แปลงเนื้อหา Markdown เป็น HTML อย่างง่าย
  const renderContent = (content: string) => {
    if (!content) return null;
    
    const htmlContent = content
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-5 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/gm, '<strong>$1</strong>')
      .replace(/- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
      .replace(/\d\. (.*$)/gm, '<li class="ml-4 mb-2">$1</li>')
      .replace(/\n\n/gm, '<br />');
      
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-guardian-light-bg p-4">
        <div className="container max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return <div className="min-h-screen bg-guardian-light-bg p-4">ไม่พบบทความ</div>;
  }

  return (
    <div className="min-h-screen bg-guardian-light-bg">
      {/* Header */}
      <header className="bg-guardian-purple text-white p-4">
        <div className="container max-w-2xl mx-auto flex items-center">
          <h1 className="text-xl font-bold flex-1">AI Emergency Guardian</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto p-4">
        <Button 
          variant="ghost" 
          onClick={handleBackClick} 
          className="mb-4 inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับ
        </Button>

        <article className="bg-white p-6 rounded-lg shadow-md">
          <header className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{resource.title}</h1>
            <p className="text-gray-500 mb-4">{resource.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {resource.tags?.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {resource.date && (
              <p className="text-sm text-gray-500">
                {formatDate(resource.date)}
              </p>
            )}
          </header>

          {resource.imageUrl && (
            <div className="mb-6">
              <img 
                src={resource.imageUrl} 
                alt={resource.title} 
                className="w-full h-auto rounded-lg object-cover" 
              />
            </div>
          )}

          <div className="prose max-w-none">
            {renderContent(resource.content)}
          </div>
        </article>
      </main>
    </div>
  );
};

export default ResourceDetail;
