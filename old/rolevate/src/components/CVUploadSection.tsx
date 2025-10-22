'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/theme-context';
import { Upload, FileText, Target, BarChart3, TrendingUp } from 'lucide-react';

interface CVUploadSectionProps {
  locale: string;
}

export default function CVUploadSection({ locale }: CVUploadSectionProps) {
  const t = useTranslations('cvUpload');
  const { resolvedTheme } = useTheme();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0].type === 'application/pdf') {
      setSelectedFile(files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const features = [
    {
      icon: Target,
      title: t('features.jobMatching.title'),
      description: t('features.jobMatching.description')
    },
    {
      icon: BarChart3,
      title: t('features.cvAnalysis.title'),
      description: t('features.cvAnalysis.description')
    },
    {
      icon: TrendingUp,
      title: t('features.careerEnhancement.title'),
      description: t('features.careerEnhancement.description')
    }
  ];

  return (
    <section className={`py-20 transition-colors duration-300 ${
      resolvedTheme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 transition-colors duration-300 ${
            resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            {t('title')}
          </h2>
          <p className={`text-xl max-w-3xl mx-auto leading-relaxed transition-colors duration-300 ${
            resolvedTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Upload Section */}
          <div className="space-y-8">
            <div className={`rounded-3xl p-8 shadow-xl transition-all duration-300 ${
              resolvedTheme === 'dark' ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  {t('uploadTitle')}
                </h3>
                <p className={`transition-colors duration-300 ${
                  resolvedTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {t('uploadSubtitle')}
                </p>
              </div>

              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
                className={`
                  relative cursor-pointer transition-all duration-300 ease-in-out
                  ${isDragOver
                    ? 'bg-primary/5 border-primary/50'
                    : resolvedTheme === 'dark'
                      ? 'bg-slate-700/50 hover:bg-slate-700 border-slate-600'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-300'
                  }
                  border-2 border-dashed
                  rounded-2xl p-12 text-center group
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="space-y-4">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isDragOver
                      ? 'bg-primary/20 text-primary'
                      : resolvedTheme === 'dark'
                        ? 'bg-slate-600 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
                        : 'bg-slate-200 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary'
                  }`}>
                    <Upload className="w-8 h-8" />
                  </div>

                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="w-5 h-5 text-green-500" />
                        <span className={`font-medium transition-colors duration-300 ${
                          resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}>
                          {selectedFile.name}
                        </span>
                      </div>
                      <p className={`text-sm transition-colors duration-300 ${
                        resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                        resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}>
                        {t('chooseFile')}
                      </p>
                      <p className={`text-sm transition-colors duration-300 ${
                        resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {t('fileSupport')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </div>

              {/* Upload Button */}
              <button
                className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {t('analyzeButton')}
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  resolvedTheme === 'dark' ? 'bg-slate-800' : 'bg-white'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                      resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>
                      {feature.title}
                    </h4>
                    <p className={`leading-relaxed transition-colors duration-300 ${
                      resolvedTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}