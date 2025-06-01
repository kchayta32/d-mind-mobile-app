
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ResourceItem, resourcesData } from '@/data/resourcesData';
import AppLogo from '@/components/AppLogo';

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
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6 text-blue-800">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-blue-700">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-blue-600">$1</h3>')
      .replace(/\*\*(.*?)\*\*/gm, '<strong class="text-blue-900 font-semibold">$1</strong>')
      .replace(/- (.*$)/gm, '<li class="ml-6 mb-2 text-gray-700 list-disc">$1</li>')
      .replace(/\d\. (.*$)/gm, '<li class="ml-6 mb-3 text-gray-700 list-decimal">$1</li>')
      .replace(/\n\n/gm, '<div class="mb-4"></div>');
      
    return <div className="leading-relaxed text-gray-800" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container max-w-4xl mx-auto pt-8 p-6">
          <div className="bg-white rounded-2xl shadow-xl animate-pulse p-8">
            <div className="h-10 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-3/4 mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
            <div className="h-64 bg-gradient-to-r from-purple-200 to-pink-200 rounded-xl w-full mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบบทความ</h1>
          <Button onClick={handleBackClick} className="bg-blue-500 hover:bg-blue-600">
            กลับหน้าหลัก
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg">
        <div className="container max-w-4xl mx-auto p-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={handleBackClick} 
              className="text-white hover:bg-white/20 mr-4 rounded-full p-2"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center">
              <AppLogo size="md" className="mr-4" />
              <h1 className="text-2xl font-bold">AI Emergency Guardian</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto p-6">
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <header className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-8 border-b border-gray-100">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {resource.title}
            </h1>
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">{resource.description}</p>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {resource.tags?.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 px-3 py-1 text-sm font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            {resource.date && (
              <p className="text-sm text-gray-500 font-medium">
                📅 {formatDate(resource.date)}
              </p>
            )}
          </header>

          {resource.imageUrl && (
            <div className="p-8 pb-0">
              <img 
                src={resource.imageUrl} 
                alt={resource.title} 
                className="w-full h-auto rounded-xl object-cover shadow-lg border border-gray-100" 
              />
            </div>
          )}

          <div className="p-8">
            <div className="prose max-w-none text-lg">
              {renderContent(resource.content)}
            </div>
          </div>
        </article>

        {/* Back to top button */}
        <div className="mt-8 text-center">
          <Button 
            onClick={handleBackClick}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            กลับหน้าหลัก
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ResourceDetail;
