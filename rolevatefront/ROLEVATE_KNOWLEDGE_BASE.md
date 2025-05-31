# Rolevate AI - Knowledge Base for Dashboard Development

## 🎯 Core Business Overview

### What is Rolevate?
**Rolevate AI** is an AI-powered interview platform specifically designed for banks and financial institutions. It streamlines the hiring process by automating CV screening, candidate outreach, and conducting AI-led interviews in both Arabic and English.

### Mission Statement
"Revolutionize hiring with AI. Save time. Find the right fit."

### Target Market
- **Primary**: Banks and financial institutions
- **Secondary**: Any organization requiring high-volume, compliance-ready recruitment
- **Geographic Focus**: Arabic-speaking regions (bilingual Arabic/English support)

---

## 🏢 Business Model & Value Proposition

### Core Problems Solved
1. **CV Overload**: Too many CVs, not enough time for proper review
2. **Inconsistent Interviews**: Quality varies based on interviewer availability and bias
3. **Compliance Challenges**: Manual processes don't meet banking compliance standards
4. **Language Barriers**: Need for bilingual (Arabic/English) interview capabilities
5. **Time-to-Hire**: Slow traditional recruitment processes

### Solution Architecture
1. **Smart CV Analysis**: AI filters and scores CVs instantly
2. **WhatsApp Auto Outreach**: Automated candidate contact via WhatsApp
3. **AI-Powered Interviews**: Professional interviews conducted by AI agent "Laila"
4. **Final Fit Score**: Combines CV + interview data for structured HR review
5. **Compliance Ready**: Built for banking industry standards

---

## 🎨 Brand Identity & Design System

### Color Palette
- **Primary Brand Color**: `#00C6AD` (Teal/Aqua)
- **Secondary**: `#14B8A6` (Darker teal)
- **Background**: `#0F172A` (Dark slate)
- **Text Primary**: `#F8FAFC` (Off-white)
- **Text Secondary**: `#CBD5E1` (Light slate)
- **Accent**: `#2DD4BF` (Bright teal)

### Typography & Styling
- **Modern, professional aesthetic**
- **Glassmorphism effects**: `backdrop-blur-lg bg-slate-800/30`
- **Gradient accents**: Teal-based gradients
- **Shadow system**: `shadow-2xl` for cards
- **Border system**: `border-slate-700/50` for subtle borders

### Visual Elements
- **Hero Character**: "Laila" - AI interviewer avatar
- **Banking Imagery**: Professional HR/banking contexts
- **Icons**: Lucide React icons primarily
- **Animations**: Subtle hover effects, pulse animations, glassmorphism

---

## 🛠 Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **UI Components**: Custom component library
- **State Management**: React hooks (useState, useEffect)
- **Icons**: Lucide React
- **Images**: Next.js Image optimization

### Key Features
- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Primary design system
- **SEO Optimized**: Comprehensive metadata and JSON-LD structured data
- **Accessibility**: ARIA labels and semantic markup
- **Performance**: Image optimization, code splitting

### Real-time Capabilities
- **LiveKit Integration**: For voice/video interviews
- **WebRTC**: Real-time communication
- **Audio Processing**: ElevenLabs integration for AI voice
- **Transcription**: Real-time speech-to-text

---

## 📋 Core Workflow & Features

### 1. CV Processing Pipeline
```
Job Posting → CV Collection → AI Screening → Scoring → Ranking
```

### 2. Candidate Outreach
```
Top Candidates → WhatsApp Automation → Interview Scheduling → Confirmation
```

### 3. AI Interview Process
```
Pre-Interview Setup → Live Interview with Laila → Real-time Scoring → Post-Interview Analysis
```

### 4. HR Dashboard Features
- **CV Management**: View, filter, and score candidates
- **Interview Scheduling**: Calendar integration
- **Analytics**: Hiring metrics and insights
- **Candidate Profiles**: Detailed candidate information
- **Report Generation**: Compliance and performance reports

---

## 🎭 AI Interviewer "Laila"

### Character Profile
- **Name**: Laila
- **Role**: AI Banking Interview Specialist
- **Languages**: Fluent in Arabic and English
- **Personality**: Professional, warm, thorough
- **Expertise**: Banking and financial services recruitment

### Technical Capabilities
- **Voice AI**: ElevenLabs integration for natural speech
- **Real-time Processing**: Instant response and analysis
- **Contextual Understanding**: Banking industry knowledge
- **Scoring Algorithm**: Multi-factor candidate assessment

---

## 🏦 Banking Industry Focus

### Supported Roles
- Branch Manager (Score: 87%)
- Bank Teller (Score: 92%)
- Risk Analyst (Score: 84%)
- Relationship Manager (Score: 91%)
- Compliance Officer (Score: 89%)
- Loan Officer (Score: 86%)

### Compliance Features
- **Data Security**: Bank-grade security standards
- **Audit Trails**: Complete interview and decision tracking
- **Regulatory Compliance**: Meets financial industry requirements
- **Privacy Protection**: GDPR and local privacy law compliance

---

## 📊 Dashboard Requirements

### Core Dashboard Sections
1. **Overview/Stats Dashboard**
   - Total CVs processed
   - New CVs today
   - Match rate percentage
   - Average candidate scores
   - Interviews scheduled
   - Pending reviews

2. **CV Management**
   - CV listing with filters
   - Individual CV review pages
   - Bulk actions
   - Export capabilities

3. **Interview Management**
   - Schedule interviews
   - Live interview monitoring
   - Interview results review
   - Recording/transcript access

4. **Analytics & Reporting**
   - Hiring pipeline metrics
   - Performance analytics
   - Compliance reports
   - Custom report generation

5. **Job Posting Management**
   - Create/edit job postings
   - Position-specific interview templates
   - Job posting analytics

### Dashboard Design Principles
- **Consistent with main site**: Same color scheme and styling
- **Data-driven**: Clear metrics and KPIs
- **Action-oriented**: Easy access to common tasks
- **Mobile responsive**: Works on all devices
- **Real-time updates**: Live data where appropriate

---

## 🔧 Integration Points

### External Services
- **WhatsApp Business API**: For candidate outreach
- **LiveKit**: For real-time interviews
- **ElevenLabs**: For AI voice generation
- **Banking HR Systems**: ATS integration
- **Calendar Services**: Interview scheduling

### API Requirements
- **Authentication**: Secure login for HR users
- **CV Processing**: Upload and analysis endpoints
- **Interview Management**: Scheduling and control
- **Reporting**: Data export and analytics
- **Real-time**: WebSocket connections for live features

---

## 📱 User Experience Principles

### For HR Users (Dashboard)
- **Efficiency First**: Quick access to most common tasks
- **Clear Information Hierarchy**: Easy to scan and process
- **Actionable Insights**: Data that leads to decisions
- **Minimal Clicks**: Streamlined workflows

### For Candidates (Interview)
- **Professional Experience**: Banking industry standards
- **Multilingual Support**: Seamless Arabic/English switching
- **Clear Instructions**: Easy to understand process
- **Technical Reliability**: Stable connection and audio

---

## 🚀 Key Messaging & Content

### Value Propositions
1. **Time Savings**: "Save 80% of time on initial screening"
2. **Quality Improvement**: "Consistent, bias-free interview process"
3. **Compliance**: "Bank-grade security and audit trails"
4. **Bilingual**: "Native Arabic and English support"
5. **AI-Powered**: "Latest AI technology for better hiring decisions"

### Call-to-Actions
- **Primary**: "Try Demo"
- **Secondary**: "Schedule a Meeting"
- **Conversion**: "Request Live Demo"

This knowledge base should provide comprehensive context for building a cohesive dashboard that aligns with Rolevate's brand, functionality, and user needs in the banking recruitment space.
