"use client";

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface CVUploadProps {
  locale: string;
}

export default function CVUpload({ locale }: CVUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf' || file.type.includes('text/') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      setUploadedFile(file);
    } else {
      alert(locale === 'ar' ? 'يرجى رفع ملف PDF أو Word فقط' : 'Please upload only PDF or Word files');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setAnalysisComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3000);
  };

  const handleDownloadReport = () => {
    // Simulate downloading analysis report
    console.log('Downloading analysis report...');
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {locale === 'ar' ? 'غير متأكد مما يناسبك؟' : 'Not Sure What Fits You?'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {locale === 'ar' 
                ? 'ارفع سيرتك الذاتية لتتم مطابقتها مع أفضل الوظائف وفرص التطوير المهني. سيقوم الذكاء الاصطناعي لدينا بتقديم تحليل شامل وتوصيات شخصية.'
                : 'Upload your CV to match you with the best jobs and career enhancement opportunities. Our AI will provide a comprehensive analysis and personalized recommendations.'
              }
            </p>
          </div>

          {/* Upload Card */}
          <Card className="border border-border/50 hover:border-primary/50 transition-all duration-300">
            {!uploadedFile ? (
              <div
                className={`p-8 text-center transition-all duration-300 ${
                  isDragOver 
                    ? 'bg-primary/5' 
                    : 'hover:bg-muted/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Upload Icon */}
                <div className={`w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isDragOver 
                    ? 'bg-primary/10' 
                    : 'bg-muted/50'
                }`}>
                  <Upload className={`w-8 h-8 transition-colors duration-300 ${
                    isDragOver ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>

                {/* Upload Text */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isDragOver 
                    ? (locale === 'ar' ? 'أفلت الملف هنا' : 'Drop your file here')
                    : (locale === 'ar' ? 'اسحب وأفلت ملفك هنا' : 'Drag and drop your file here')
                  }
                </h3>
                <p className="text-muted-foreground mb-4">
                  {locale === 'ar' 
                    ? 'أو انقر للاختيار من جهازك'
                    : 'or click to select from your device'
                  }
                </p>

                {/* File Types */}
                <div className="flex justify-center gap-2 mb-6">
                  <Badge variant="outline" className="text-xs">PDF</Badge>
                  <Badge variant="outline" className="text-xs">DOC</Badge>
                  <Badge variant="outline" className="text-xs">DOCX</Badge>
                </div>

                {/* Upload Button */}
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="px-6 py-2"
                >
                  {locale === 'ar' ? 'اختيار ملف' : 'Choose File'}
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="p-6">
                {/* File Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{uploadedFile.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Analysis Status */}
                {!analysisComplete ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {locale === 'ar' ? 'جاهز للتحليل' : 'Ready for Analysis'}
                      </span>
                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        size="sm"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {locale === 'ar' ? 'جاري التحليل...' : 'Analyzing...'}
                          </>
                        ) : (
                          <>
                            {locale === 'ar' ? 'ابدأ التحليل' : 'Start Analysis'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {locale === 'ar' ? 'تم التحليل بنجاح' : 'Analysis Complete'}
                      </span>
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-2">
                        {locale === 'ar' ? 'توصيات الذكاء الاصطناعي' : 'AI Recommendations'}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {locale === 'ar' 
                          ? 'تم العثور على 12 وظيفة مناسبة و 5 فرص تطوير مهني'
                          : 'Found 12 matching jobs and 5 career development opportunities'
                        }
                      </p>
                      
                      <div className="flex gap-3">
                        <Button size="sm" className="flex-1">
                          {locale === 'ar' ? 'عرض التوصيات' : 'View Recommendations'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleDownloadReport}>
                          {locale === 'ar' ? 'تحميل التقرير' : 'Download Report'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
