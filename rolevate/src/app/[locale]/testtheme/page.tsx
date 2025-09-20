'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/common';
import Footer from '@/components/Footer';
import { Sun, Moon, Palette, Copy, Check } from 'lucide-react';

export default function ThemeTestPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [locale, setLocale] = useState('en');
  const t = useTranslations('theme');

  // Get locale from params
  useEffect(() => {
    params.then((resolvedParams) => {
      setLocale(resolvedParams.locale);
    });
  }, [params]);

  const copyToClipboard = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  // Light Theme Colors
  const lightThemeColors = {
    primary: [
      { name: 'background', value: '#ffffff', description: 'Pure white background' },
      { name: 'foreground', value: '#0f172a', description: 'Deep slate for excellent contrast' },
      { name: 'muted', value: '#f1f5f9', description: 'Light slate background' },
      { name: 'muted-foreground', value: '#64748b', description: 'Medium slate for secondary text' },
    ],
    cards: [
      { name: 'card', value: '#ffffff', description: 'Pure white cards' },
      { name: 'card-foreground', value: '#0f172a', description: 'Deep slate text' },
    ],
    interactive: [
      { name: 'primary', value: '#2563eb', description: 'Modern blue' },
      { name: 'primary-foreground', value: '#ffffff', description: 'White text on blue' },
      { name: 'secondary', value: '#f1f5f9', description: 'Light slate secondary' },
      { name: 'secondary-foreground', value: '#0f172a', description: 'Dark text on light' },
      { name: 'accent', value: '#059669', description: 'Modern emerald green' },
      { name: 'accent-foreground', value: '#ffffff', description: 'White on green' },
    ],
    forms: [
      { name: 'input', value: '#ffffff', description: 'White input background' },
      { name: 'border', value: '#e2e8f0', description: 'Light slate border' },
      { name: 'ring', value: '#2563eb', description: 'Blue focus ring' },
    ],
    status: [
      { name: 'destructive', value: '#dc2626', description: 'Modern red' },
      { name: 'destructive-foreground', value: '#ffffff', description: 'White on red' },
      { name: 'success', value: '#059669', description: 'Emerald green' },
      { name: 'warning', value: '#d97706', description: 'Modern amber' },
      { name: 'info', value: '#2563eb', description: 'Modern blue' },
    ],
    extended: [
      { name: 'tertiary', value: '#64748b', description: 'Medium slate' },
      { name: 'tertiary-foreground', value: '#ffffff', description: 'White text' },
      { name: 'highlight', value: '#dbeafe', description: 'Light blue highlight' },
    ]
  };

  // Dark Theme Colors
  const darkThemeColors = {
    primary: [
      { name: 'background', value: '#0f172a', description: 'Deep slate background' },
      { name: 'foreground', value: '#f8fafc', description: 'Near-white text for excellent contrast' },
      { name: 'muted', value: '#1e293b', description: 'Medium slate for muted areas' },
      { name: 'muted-foreground', value: '#94a3b8', description: 'Light slate for secondary text' },
    ],
    cards: [
      { name: 'card', value: '#1e293b', description: 'Medium slate cards' },
      { name: 'card-foreground', value: '#f8fafc', description: 'Near-white text' },
    ],
    interactive: [
      { name: 'primary', value: '#3b82f6', description: 'Bright blue for dark mode' },
      { name: 'primary-foreground', value: '#ffffff', description: 'White text on blue' },
      { name: 'secondary', value: '#334155', description: 'Darker slate secondary' },
      { name: 'secondary-foreground', value: '#f8fafc', description: 'Light text on dark' },
      { name: 'accent', value: '#10b981', description: 'Bright emerald green' },
      { name: 'accent-foreground', value: '#ffffff', description: 'White on green' },
    ],
    forms: [
      { name: 'input', value: '#1e293b', description: 'Medium slate input background' },
      { name: 'border', value: '#475569', description: 'Medium border for definition' },
      { name: 'ring', value: '#3b82f6', description: 'Bright blue focus' },
    ],
    status: [
      { name: 'destructive', value: '#ef4444', description: 'Bright red' },
      { name: 'destructive-foreground', value: '#ffffff', description: 'White on red' },
      { name: 'success', value: '#10b981', description: 'Bright emerald' },
      { name: 'warning', value: '#f59e0b', description: 'Bright amber' },
      { name: 'info', value: '#3b82f6', description: 'Bright blue' },
    ],
    extended: [
      { name: 'tertiary', value: '#94a3b8', description: 'Light slate' },
      { name: 'tertiary-foreground', value: '#0f172a', description: 'Dark text' },
      { name: 'highlight', value: '#334155', description: 'Dark highlight' },
    ]
  };

  // Surface Variations
  const surfaceVariations = [
    { name: 'surface-50', value: '#f8fafc', description: 'Lightest surface' },
    { name: 'surface-100', value: '#f1f5f9', description: 'Very light surface' },
    { name: 'surface-200', value: '#e2e8f0', description: 'Light surface' },
    { name: 'surface-300', value: '#cbd5e1', description: 'Medium light surface' },
    { name: 'surface-400', value: '#94a3b8', description: 'Medium surface' },
    { name: 'surface-500', value: '#64748b', description: 'Medium dark surface' },
    { name: 'surface-600', value: '#475569', description: 'Dark surface' },
    { name: 'surface-700', value: '#334155', description: 'Darker surface' },
    { name: 'surface-800', value: '#1e293b', description: 'Very dark surface' },
    { name: 'surface-900', value: '#0f172a', description: 'Darkest surface' },
  ];

  const ColorSwatch = ({ color }: { color: { name: string; value: string; description: string } }) => (
    <div className="group relative bg-card rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-border">
      <div className="flex items-center gap-4 mb-3">
        <div
          className="w-16 h-16 rounded-lg shadow-inner border border-border/20 flex-shrink-0"
          style={{ backgroundColor: color.value }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm truncate">{color.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{color.value}</p>
        </div>
        <button
          onClick={() => copyToClipboard(color.value)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-muted"
        >
          {copiedColor === color.value ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{color.description}</p>
    </div>
  );

  const ColorSection = ({ title, colors, icon }: { title: string; colors: any[]; icon: React.ReactNode }) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colors.map((color) => (
          <ColorSwatch key={color.name} color={color} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-full">
                <Palette className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Theme Color Palette
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore all the beautiful colors in your design system. Click any color to copy its hex value.
            </p>
          </div>

          {/* Theme Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-card rounded-2xl p-2 shadow-lg border border-border/50">
              <button
                onClick={() => setIsDark(false)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                  !isDark
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sun className="w-5 h-5" />
                Light Theme
              </button>
              <button
                onClick={() => setIsDark(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                  isDark
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Moon className="w-5 h-5" />
                Dark Theme
              </button>
            </div>
          </div>

          {/* Color Sections */}
          <div className="space-y-16">
            {/* Primary Colors */}
            <ColorSection
              title="Primary Colors"
              colors={isDark ? darkThemeColors.primary : lightThemeColors.primary}
              icon={<div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-primary/80" />}
            />

            {/* Card Colors */}
            <ColorSection
              title="Card & Surface Colors"
              colors={isDark ? darkThemeColors.cards : lightThemeColors.cards}
              icon={<div className="w-6 h-6 rounded-lg bg-card border border-border" />}
            />

            {/* Interactive Colors */}
            <ColorSection
              title="Interactive Elements"
              colors={isDark ? darkThemeColors.interactive : lightThemeColors.interactive}
              icon={<div className="w-6 h-6 rounded-full bg-primary" />}
            />

            {/* Form Colors */}
            <ColorSection
              title="Form Elements"
              colors={isDark ? darkThemeColors.forms : lightThemeColors.forms}
              icon={<div className="w-6 h-6 rounded-lg bg-input border border-border" />}
            />

            {/* Status Colors */}
            <ColorSection
              title="Status Colors"
              colors={isDark ? darkThemeColors.status : lightThemeColors.status}
              icon={<div className="w-6 h-6 rounded-full bg-success" />}
            />

            {/* Extended Colors */}
            <ColorSection
              title="Extended Palette"
              colors={isDark ? darkThemeColors.extended : lightThemeColors.extended}
              icon={<div className="w-6 h-6 rounded-full bg-gradient-to-r from-tertiary to-highlight" />}
            />

            {/* Surface Variations */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-surface-50 to-surface-900" />
                <h2 className="text-2xl font-bold text-foreground">Surface Variations</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {surfaceVariations.map((surface) => (
                  <div key={surface.name} className="group relative bg-card rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-12 h-12 rounded-lg shadow-inner border border-border/20 flex-shrink-0"
                        style={{ backgroundColor: surface.value }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-xs truncate">{surface.name}</h3>
                      </div>
                      <button
                        onClick={() => copyToClipboard(surface.value)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                      >
                        {copiedColor === surface.value ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{surface.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{surface.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="mt-16 bg-card rounded-2xl p-8 shadow-lg border border-border/50">
            <h3 className="text-xl font-bold text-foreground mb-4">How to Use</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">In CSS:</h4>
                <code className="block bg-muted p-3 rounded-lg">
                  .my-element {'{'}<br />
                  {'  '}color: var(--primary);<br />
                  {'  '}background: var(--background);<br />
                  {'}'}
                </code>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">In Tailwind:</h4>
                <code className="block bg-muted p-3 rounded-lg">
                  className="text-primary"<br />
                  className="bg-background"<br />
                  className="border-border"
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer locale={locale} />
    </div>
  );
}