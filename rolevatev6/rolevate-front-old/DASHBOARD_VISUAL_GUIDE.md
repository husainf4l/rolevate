# User Candidate Dashboard - Visual Guide

## 🎨 Dashboard Layout Preview

```
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║  👋 Welcome back, John!                                                ║
║  Here's what's happening with your job search today.                   ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝

┌──────┬──────┬──────┬──────┬──────┬──────┐
│  12  │   8  │   3  │   1  │   5  │   2  │  📊 Stats Cards
│ Total│Active│Inter-│Offers│Under │  Not │  (6 columns on desktop)
│ Apps │ Apps │views │      │Review│Select│
└──────┴──────┴──────┴──────┴──────┴──────┘

┌─────────────────────────────────┬──────────────────┐
│                                 │                  │
│  📋 Recent Applications         │  ⭐ Profile      │
│  ┌───────────────────────────┐  │  Completion     │
│  │ Senior Developer          │  │  ━━━━━━━━━━ 60% │
│  │ @ Tech Corp               │  │  ☐ Add Resume   │
│  │ 🟢 Submitted | Match: 85%│  │  ☑ Add Skills   │
│  └───────────────────────────┘  │  ☐ Add Education│
│  ┌───────────────────────────┐  │                  │
│  │ Product Manager           │  ├──────────────────┤
│  │ @ StartupXYZ              │  │                  │
│  │ 🟡 Under Review | 92%     │  │  📅 Upcoming     │
│  └───────────────────────────┘  │  Interviews      │
│                                 │  ┌──────────────┐ │
│  ✨ Recommended for You         │  │ Video Call   │ │
│  ┌───────────────────────────┐  │  │ Front Dev    │ │
│  │ [Logo] Full Stack Dev     │  │  │ @ TechStart  │ │
│  │ @ Innovation Labs         │  │  │ Today 2PM    │ │
│  │ 📍 Remote | 💰 $120k      │  │  │ [Join Meet]  │ │
│  │ #React #Node #TypeScript  │  │  └──────────────┘ │
│  │ 🔖 Save                   │  │                  │
│  └───────────────────────────┘  ├──────────────────┤
│                                 │                  │
│  ⚡ Quick Actions               │  📝 Recent       │
│  ┌────┬────┬────┐              │  Activity        │
│  │Jobs│Prof│CV  │              │  • Applied to... │
│  ├────┼────┼────┤              │  • Profile upd...│
│  │Savd│Int │Srch│              │  • Viewed job... │
│  └────┴────┴────┘              │                  │
│                                 │                  │
└─────────────────────────────────┴──────────────────┘
```

## 📱 Component Breakdowns

### 1. Welcome Header
```
┌──────────────────────────────────────────┐
│ 👋 Welcome back, [Candidate Name]!      │
│ Here's what's happening with your job    │
│ search today.                            │
└──────────────────────────────────────────┘
• Personalized greeting
• Dynamic name from user profile
• Gradient background (white card)
```

### 2. Stats Cards (UserStatsCards)
```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ 📋 12  │ │ 💼  8  │ │ 📅  3  │ │ ✅  1  │ │ ⏱️  5  │ │ ❌  2  │
│ Total  │ │ Active │ │ Inter- │ │ Offers │ │ Under  │ │  Not   │
│ Apps   │ │ Apps   │ │ views  │ │        │ │ Review │ │ Select │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
  Blue       Green      Purple     Teal       Amber       Red

Features:
• Hover effect: Scale + shadow
• Color-coded icons
• Animated entrance (staggered)
• Real-time calculated values
```

### 3. Recent Applications (RecentApplicationsWidget)
```
┌─────────────────────────────────────────┐
│ 📋 Recent Applications      [View All →]│
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Senior Frontend Developer           │ │
│ │ 🏢 TechCorp Inc.                    │ │
│ │ 📅 Applied Dec 8 | 🎯 Match: 85%   │ │
│ │ [🔵 Submitted]                      │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Product Manager                     │ │
│ │ 🏢 StartupXYZ                       │ │
│ │ 📅 Applied Dec 7 | 🎯 Match: 92%   │ │
│ │ [🟡 Under Review]                   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

Status Colors:
🔵 Submitted (Blue)
🟡 Under Review (Amber)
🟣 Interview Scheduled (Purple)
🟢 Offer Received (Green)
🔴 Not Selected (Red)
```

### 4. Job Recommendations (UserJobRecommendations)
```
┌─────────────────────────────────────────┐
│ ✨ Recommended for You      [View All →]│
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ [Company Logo] Full Stack Developer │ │
│ │ Innovation Labs Inc.                │ │
│ │ 📍 Remote | ⏰ Full-time | 💰 $120k │ │
│ │ #React #Node #TypeScript #AWS       │ │
│ │ Posted 2 days ago    [View Details →]│
│ │                            🔖 Save   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

Features:
• Company logos
• Save/unsave toggle
• Skills tags (first 3 + more)
• Salary, location, type
• Click to view job details
```

### 5. Quick Actions (UserQuickActions)
```
┌─────────────────────────────────────────┐
│ Quick Actions                           │
├─────────────────────────────────────────┤
│ ┌────────┬────────┬────────┐           │
│ │ 💼     │ 👤     │ 📄     │           │
│ │ Browse │ Update │ Upload │           │
│ │ Jobs   │ Profile│ Resume │           │
│ └────────┴────────┴────────┘           │
│ ┌────────┬────────┬────────┐           │
│ │ 🔖     │ 🎓     │ 🔍     │           │
│ │ Saved  │ Interview│ Job  │           │
│ │ Jobs   │ Prep   │ Search │           │
│ └────────┴────────┴────────┘           │
└─────────────────────────────────────────┘

6 Action Cards:
• Color-coded backgrounds
• Icon animations on hover
• Direct navigation
```

### 6. Profile Completion (UserProfileCompletionWidget)
```
┌─────────────────────────────────────────┐
│ Profile Completion              60%    │
├─────────────────────────────────────────┤
│ Progress: ━━━━━━━━━━━━━━━━━━▱▱▱▱▱▱▱▱   │
│                                         │
│ Complete your profile to increase       │
│ your chances of getting hired           │
│                                         │
│ ☐ Add Resume/CV              [→]       │
│ ☑ Complete Work Experience   [→]       │
│ ☐ Add Skills                 [→]       │
│ ☐ Add Education              [→]       │
│ ☐ Upload Profile Picture     [→]       │
│                                         │
│ [View all incomplete sections]          │
└─────────────────────────────────────────┘

At 100%:
│ ✅ Profile Complete!                    │
│ 🎉 Your profile is fully optimized      │
```

### 7. Upcoming Interviews (UserUpcomingInterviews)
```
┌─────────────────────────────────────────┐
│ 📅 Upcoming Interviews      [View All →]│
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Frontend Developer      [🎥 Video]  │ │
│ │ 🏢 TechStart Inc.                   │ │
│ │ 📅 Friday, Dec 15, 2025             │ │
│ │ ⏰ 10:00 AM                         │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │       [Join Meeting]            │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

Interview Types:
🎥 Video Call (Blue)
📞 Phone Call (Green)
📍 On-site (Purple)
```

### 8. Activity Feed (UserActivityFeed)
```
┌─────────────────────────────────────────┐
│ Recent Activity                         │
├─────────────────────────────────────────┤
│ 💼 Applied to Senior Developer          │
│    at TechCorp Inc.                     │
│    Dec 8, 2025                      [→] │
│                                         │
│ 👤 Updated profile information          │
│    Added work experience                │
│    Dec 7, 2025                      [→] │
│                                         │
│ 👁️ Viewed Product Manager role          │
│    at StartupXYZ                        │
│    Dec 6, 2025                      [→] │
└─────────────────────────────────────────┘

Activity Types:
💼 Application
📅 Interview
👤 Profile Update
📊 Status Change
👁️ Job View
```

## 🎨 Color System

### Status Colors
- **Submitted**: Blue (#3B82F6)
- **Reviewing**: Amber (#F59E0B)
- **Interview**: Purple (#9333EA)
- **Offered**: Green (#10B981)
- **Rejected**: Red (#EF4444)

### Background Colors
- **Primary Cards**: White (#FFFFFF)
- **Secondary**: Gray-50 (#F9FAFB)
- **Hover States**: Gray-100 (#F3F4F6)
- **Page Background**: Gradient from Gray-50 to Gray-100

### Interactive Elements
- **Primary Button**: Cyan (#0891B2)
- **Primary Hover**: Darker Cyan (#0C7594)
- **Links**: Primary Cyan
- **Borders**: Gray-200 (#E5E7EB)

## 📏 Spacing & Sizing

### Card Spacing
- **Padding**: 1.5rem (24px)
- **Gap Between Cards**: 1.5rem (24px)
- **Border Radius**: 0.75rem (12px) to 1rem (16px)

### Typography
- **Page Title**: 1.875rem (30px), Bold
- **Card Titles**: 1.25rem (20px), Semibold
- **Body Text**: 0.875rem (14px) to 1rem (16px)
- **Small Text**: 0.75rem (12px)

### Icons
- **Large Icons**: 1.5rem (24px)
- **Medium Icons**: 1rem (16px)
- **Small Icons**: 0.75rem (12px)

## 🎭 Animation Timings

### Entrance Animations
- **Duration**: 300ms
- **Easing**: ease-out
- **Stagger Delay**: 50ms between items
- **Motion**: Fade in + slide (20px)

### Hover Effects
- **Duration**: 200ms
- **Easing**: ease-out
- **Scale**: 1.0 → 1.05 (buttons), 1.0 → 1.1 (icons)
- **Shadow**: Small → Medium

### Progress Bar
- **Duration**: 1000ms
- **Easing**: ease-out
- **Motion**: Width 0% → actual %

## 📱 Responsive Breakpoints

### Mobile (<640px)
```
┌──────────────┐
│ Welcome      │
├──────────────┤
│ Stat 1       │
│ Stat 2       │
│ Stat 3       │
│ Stat 4       │
│ Stat 5       │
│ Stat 6       │
├──────────────┤
│ Applications │
├──────────────┤
│ Jobs         │
├──────────────┤
│ Quick Actions│
├──────────────┤
│ Profile      │
├──────────────┤
│ Interviews   │
├──────────────┤
│ Activity     │
└──────────────┘
```

### Desktop (>1024px)
```
┌────────────────────────────────┐
│ Welcome                        │
├──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┤
│S1│S2│S3│S4│S5│S6│              │
├──┴──┴──┴──┴──┴──┴──────┬───────┤
│ Applications            │Profile│
│ Jobs                    │Interv │
│ Quick Actions           │Activy │
└─────────────────────────┴───────┘
```

## 🎯 User Interactions

### Clickable Elements
1. **Stat Cards**: Navigate to filtered view
2. **Application Items**: View application details
3. **Job Cards**: View job details
4. **Quick Actions**: Navigate to respective pages
5. **Profile Sections**: Direct to incomplete section
6. **Activity Items**: Navigate to related page

### Hover States
- Scale up slightly
- Add shadow
- Color transition
- Icon animation

### Loading States
- Skeleton screens (pulsing gray)
- Smooth fade in when loaded
- Maintain layout (no jumps)

## ✨ Special Features

### Empty States
Each widget has a custom empty state with:
- Relevant icon (large, gray)
- Descriptive message
- Call-to-action button
- Helpful hint text

### Error Handling
- Console logging
- Graceful degradation
- User-friendly messages
- Retry mechanisms

### Accessibility
- ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader support
- Color contrast (WCAG AA)

## 🚀 Performance

### Optimization Techniques
- Lazy loading components
- Memoized calculations
- Debounced API calls
- Skeleton loading screens
- Optimistic updates

### Loading Times
- Initial Load: <2s
- Component Render: <100ms
- Animation Duration: 300ms
- API Calls: Variable (with loading states)

---

This visual guide provides a comprehensive overview of the dashboard's appearance and behavior. All components work together to create a cohesive, modern, and user-friendly candidate experience.
