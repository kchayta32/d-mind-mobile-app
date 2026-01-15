
import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, TrendingUp, BarChart3, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ImageUpload from '@/components/damage-assessment/ImageUpload';
import AssessmentCard from '@/components/damage-assessment/AssessmentCard';
import { useDamageAssessment } from '@/hooks/useDamageAssessment';
import { useIsMobile } from '@/hooks/use-mobile';

const DamageAssessment = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const {
    assessments,
    isLoading,
    uploadAndAnalyze,
    deleteAssessment,
    isUploading
  } = useDamageAssessment();

  const handleUpload = (file: File) => {
    uploadAndAnalyze({ file });
  };

  const handleViewAssessment = (assessment: any) => {
    setSelectedAssessment(assessment);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteAssessment = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลการประเมินนี้?')) {
      deleteAssessment(id);
    }
  };

  // Calculate statistics
  const completedAssessments = assessments.filter(a => a.processing_status === 'completed');
  const totalEstimatedCost = completedAssessments.reduce((sum, a) => sum + (a.estimated_cost || 0), 0);
  const averageConfidence = completedAssessments.length > 0
    ? completedAssessments.reduce((sum, a) => sum + (a.confidence_score || 0), 0) / completedAssessments.length
    : 0;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-24">
        {/* Modern Header */}
        <header className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white pt-6 pb-8 px-5 rounded-b-3xl shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/90 hover:bg-white/20 rounded-xl"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Damage Assessment</h1>
                <p className="text-white/70 text-xs">ประเมินความเสียหายด้วย AI</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
              <p className="text-lg font-bold">{assessments.length}</p>
              <p className="text-[10px] text-white/70">ทั้งหมด</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
              <p className="text-lg font-bold">{completedAssessments.length}</p>
              <p className="text-[10px] text-white/70">วิเคราะห์แล้ว</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
              <p className="text-lg font-bold">{(averageConfidence * 100).toFixed(0)}%</p>
              <p className="text-[10px] text-white/70">ความแม่นยำ</p>
            </div>
          </div>
        </header>

        {/* Tab Pills */}
        <div className="px-4 -mt-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-1.5 flex gap-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === 'upload'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
            >
              อัปโหลด
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === 'results'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
            >
              ผลประเมิน ({assessments.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <main className="px-4 pt-5">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
            {activeTab === 'upload' ? (
              <ImageUpload onUpload={handleUpload} isUploading={isUploading} />
            ) : isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">กำลังโหลด...</p>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">ยังไม่มีการประเมิน</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assessments.map((assessment) => (
                  <AssessmentCard
                    key={assessment.id}
                    assessment={assessment}
                    onView={handleViewAssessment}
                    onDelete={handleDeleteAssessment}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>รายละเอียดการประเมิน</DialogTitle>
            </DialogHeader>
            {selectedAssessment && (
              <div className="space-y-4">
                <img src={selectedAssessment.image_url} alt="Damage" className="w-full rounded-lg" />
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">ระดับความเสียหาย:</span> {selectedAssessment.damage_level}</p>
                  <p><span className="font-medium">ความแม่นยำ:</span> {(selectedAssessment.confidence_score * 100).toFixed(1)}%</p>
                  {selectedAssessment.estimated_cost && (
                    <p><span className="font-medium">ค่าซ่อมประมาณ:</span> {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(selectedAssessment.estimated_cost)}</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Desktop Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                กลับหน้าหลัก
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  AI Damage Assessment
                </h1>
                <p className="text-sm text-gray-500">
                  ระบบประเมินความเสียหายด้วย AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">วิเคราะห์แล้ว</p>
                  <p className="text-2xl font-bold text-green-600">{completedAssessments.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ค่าซ่อมรวม</p>
                  <p className="text-lg font-bold text-red-600">
                    {new Intl.NumberFormat('th-TH', {
                      style: 'currency',
                      currency: 'THB',
                      minimumFractionDigits: 0
                    }).format(totalEstimatedCost)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ความแม่นยำเฉลี่ย</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(averageConfidence * 100).toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">อัปโหลดรูปภาพ</TabsTrigger>
            <TabsTrigger value="results">ผลการประเมิน</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>อัปโหลดรูปภาพเพื่อประเมินความเสียหาย</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onUpload={handleUpload}
                  isUploading={isUploading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
              </div>
            ) : assessments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">ยังไม่มีข้อมูลการประเมินความเสียหาย</p>
                  <p className="text-sm text-gray-500 mt-2">
                    เริ่มต้นด้วยการอัปโหลดรูปภาพในแท็บ "อัปโหลดรูปภาพ"
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assessments.map((assessment) => (
                  <AssessmentCard
                    key={assessment.id}
                    assessment={assessment}
                    onView={handleViewAssessment}
                    onDelete={handleDeleteAssessment}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดการประเมินความเสียหาย</DialogTitle>
          </DialogHeader>

          {selectedAssessment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedAssessment.image_url}
                    alt="Damage assessment"
                    className="w-full rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">ข้อมูลพื้นฐาน</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">ชื่อไฟล์:</span> {selectedAssessment.original_filename}</p>
                      <p><span className="font-medium">สถานะ:</span> {selectedAssessment.processing_status}</p>
                      <p><span className="font-medium">ระดับความเสียหาย:</span> {selectedAssessment.damage_level}</p>
                      {selectedAssessment.confidence_score && (
                        <p><span className="font-medium">ความแม่นยำ:</span> {(selectedAssessment.confidence_score * 100).toFixed(1)}%</p>
                      )}
                      {selectedAssessment.estimated_cost && (
                        <p><span className="font-medium">ค่าซ่อมแซมประมาณ:</span> {new Intl.NumberFormat('th-TH', {
                          style: 'currency',
                          currency: 'THB'
                        }).format(selectedAssessment.estimated_cost)}</p>
                      )}
                    </div>
                  </div>

                  {selectedAssessment.detected_categories && selectedAssessment.detected_categories.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">ประเภทความเสียหาย</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedAssessment.detected_categories.map((category, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedAssessment.assessment_result && (
                    <div>
                      <h3 className="font-semibold mb-2">ผลการวิเคราะห์แบบละเอียด</h3>
                      <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                        {JSON.stringify(selectedAssessment.assessment_result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DamageAssessment;
