'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Users, 
  Star, 
  Heart, 
  ExternalLink,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobCardProps } from '@/types/jobs';

const ModernJobCard: React.FC<JobCardProps> = ({
  job,
  locale = 'en',
  onSave,
  onApply,
  isSaved = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);
  
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 30 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(job.id);
        setSaved(!saved);
      } catch (error) {
        console.error('Failed to save job:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApply) {
      try {
        await onApply(job.id);
      } catch (error) {
        console.error('Failed to apply for job:', error);
      }
    }
  };

  const formatJobType = (type: string) => {
    return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerVariants}
      className={cn("group relative", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
    >
      <motion.div
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        <Card
          variant="glass"
          className={cn(
            "relative overflow-hidden transition-all duration-500 cursor-pointer",
            "hover:shadow-2xl hover:shadow-primary/10",
            isHovered && "scale-[1.02]"
          )}
        >
          {/* Animated Background Gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            animate={{
              background: isHovered 
                ? "linear-gradient(135deg, rgba(26, 115, 232, 0.1), rgba(52, 168, 83, 0.1))"
                : "linear-gradient(135deg, rgba(26, 115, 232, 0.05), rgba(52, 168, 83, 0.05))"
            }}
          />

          {/* Floating Elements */}
          {isHovered && (
            <motion.div
              className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full"
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          <div className="relative p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {/* Company Logo */}
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={`${job.company} logo`}
                      className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center shadow-lg">
                      <Briefcase className="w-7 h-7 text-primary" />
                    </div>
                  )}
                  
                  {/* Verified Badge */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.h3
                    className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2"
                    whileHover={{ x: 5 }}
                  >
                    {job.title}
                  </motion.h3>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {job.company}
                    </p>
                    {job.rating && (
                      <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                          {job.rating}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {job.companySize && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {job.companySize} employees
                    </p>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <motion.button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                  "hover:scale-110 active:scale-95",
                  saved 
                    ? "bg-red-100 dark:bg-red-900/20 text-red-500" 
                    : "bg-muted/50 hover:bg-red-100 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    saved && "fill-current"
                  )}
                />
              </motion.button>
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{job.location}</span>
                {job.remote && (
                  <Badge variant="secondary" className="text-xs">
                    Remote
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-accent" />
                <span>{formatJobType(job.type)}</span>
              </div>
              
              {job.salary && (
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-foreground">{job.salary}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{job.postedAt}</span>
              </div>
            </div>

            {/* Description */}
            <motion.p
              className="text-sm text-muted-foreground leading-relaxed line-clamp-3"
              initial={{ opacity: 0.7 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {job.description}
            </motion.p>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {job.tags.slice(0, 4).map((tag, index) => (
                  <motion.span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-xs font-medium rounded-full border border-primary/20 hover:border-primary/40 transition-all duration-200"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {tag}
                  </motion.span>
                ))}
                {job.tags.length > 4 && (
                  <span className="inline-flex items-center px-3 py-1 bg-muted/50 text-muted-foreground text-xs font-medium rounded-full">
                    +{job.tags.length - 4}
                  </span>
                )}
              </motion.div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {job.benefits.slice(0, 3).map((benefit, index) => (
                  <motion.span
                    key={benefit}
                    className="inline-flex items-center px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-lg"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {benefit}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              className="flex gap-3 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleApply(e);
                }}
                className="flex-1 h-12"
                rightIcon={<ExternalLink className="w-4 h-4" />}
              >
                Apply Now
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="w-12 h-12"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave(e);
                }}
                disabled={isSaving}
              >
                <Heart
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    saved && "fill-current text-red-500"
                  )}
                />
              </Button>
            </motion.div>
          </div>

          {/* Hover Effect Border */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"
            animate={{
              background: isHovered 
                ? "linear-gradient(90deg, rgba(26, 115, 232, 0.2), rgba(52, 168, 83, 0.2), rgba(26, 115, 232, 0.2))"
                : "linear-gradient(90deg, rgba(26, 115, 232, 0.1), rgba(52, 168, 83, 0.1), rgba(26, 115, 232, 0.1))"
            }}
          />
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ModernJobCard;
