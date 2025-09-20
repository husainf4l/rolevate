'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Sparkles, ArrowRight, Globe, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedHeroProps {
  locale: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  countries: string[];
}

const AnimatedHero: React.FC<AnimatedHeroProps> = ({
  locale,
  title,
  subtitle,
  searchPlaceholder,
  countries,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0] || '');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  const { ref: heroRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Handle search logic
      console.log('Searching for:', searchQuery, 'in', selectedCountry);
    }
  };

  return (
    <motion.section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20"
      style={{ y: springY, opacity }}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-8"
            variants={itemVariants}
          >
            <div className="space-y-6">
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
                variants={itemVariants}
              >
                <span className="block">Find Your</span>
                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Dream Job
                </span>
                <span className="block">with AI</span>
              </motion.h1>
              
              <motion.p
                className="text-xl text-muted-foreground leading-relaxed max-w-2xl"
                variants={itemVariants}
              >
                {subtitle}
              </motion.p>
            </div>

            {/* Search Form */}
            <motion.div
              className="space-y-4"
              variants={itemVariants}
            >
              <Card variant="glass" className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        leftIcon={<Search className="w-4 h-4" />}
                        variant="glass"
                        className="h-12"
                      />
                    </div>
                    <div className="w-40">
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border-2 border-white/20 bg-white/5 backdrop-blur-sm text-foreground focus:outline-none focus:border-primary transition-all duration-300"
                      >
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      onClick={handleSearch}
                      size="lg"
                      className="h-12 px-8"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <motion.div
                className="grid grid-cols-3 gap-4"
                variants={itemVariants}
              >
                <Card variant="minimal" className="p-4 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-2">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Jobs</div>
                </Card>
                
                <Card variant="minimal" className="p-4 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-xl mx-auto mb-2">
                    <Globe className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">50+</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </Card>
                
                <Card variant="minimal" className="p-4 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Content - Animated Visual */}
          <motion.div
            className="relative"
            variants={itemVariants}
          >
            <div className="relative">
              {/* Main Visual Card */}
              <motion.div
                className="relative z-10"
                variants={floatingVariants}
                animate="float"
              >
                <Card variant="glass" className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">AI-Powered Matching</h3>
                        <p className="text-sm text-muted-foreground">Find the perfect job match</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-sm text-foreground">Analyzing your skills...</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <span className="text-sm text-foreground">Matching with companies...</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                        <span className="text-sm text-foreground">Preparing recommendations...</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              <motion.div
                className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/20 rounded-full blur-xl"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.6, 0.3, 0.6],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default AnimatedHero;
