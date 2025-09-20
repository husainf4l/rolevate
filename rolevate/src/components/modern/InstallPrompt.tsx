'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const { canInstall, isInstalled, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show prompt if app can be installed and not already installed
    if (canInstall && !isInstalled && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled, isDismissed]);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Failed to install app:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Check if user previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem('pwa-install-dismissed');
      }
    }
  }, []);

  if (!isVisible || isInstalled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
      >
        <Card variant="glass" className="p-6 shadow-2xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Install Rolevate</h3>
                <p className="text-sm text-muted-foreground">Get the full experience</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Smartphone className="w-4 h-4 text-primary" />
                <span>Access from your home screen</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Monitor className="w-4 h-4 text-accent" />
                <span>Faster loading and offline access</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Push notifications for new jobs</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1"
                rightIcon={isInstalling ? undefined : <Download className="w-4 h-4" />}
              >
                {isInstalling ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Installing...</span>
                  </div>
                ) : (
                  'Install App'
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="px-4"
              >
                Later
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Install to get the best experience with offline access and notifications
            </p>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
