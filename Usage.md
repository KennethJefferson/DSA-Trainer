# Usage Guide

This guide covers how to use DSA Trainer as both a learner and an administrator.

## Getting Started

### First Time Setup

1. Navigate to the application at `http://localhost:3000`
2. You will be redirected to the login page
3. Use the test accounts or create a new account:
   - **Admin**: `admin@dsatrainer.com` / `admin123`
   - **User**: `test@dsatrainer.com` / `test123`

## Learner Features

### Dashboard

After logging in, you'll see the dashboard with:
- **Stats Overview** - Your XP, accuracy, streak, and level
- **Study Activity** - Weekly activity chart
- **Daily Challenge** - Today's featured quiz challenge
- **My Courses** - Your enrolled courses with progress
- **Recommended Quizzes** - Personalized quiz suggestions

### Taking Quizzes

1. Navigate to **Courses** or **Quizzes** from the sidebar
2. Select a quiz to start
3. The quiz interface includes:
   - **Timer** - Countdown for timed quizzes
   - **Question Map** - Visual navigation showing answered/pending questions
   - **Progress Bar** - Track your completion
4. Answer questions and navigate with Previous/Next buttons
5. Submit when complete to see your results

### Quiz Results

After completing a quiz, you'll see:
- **Score** - Circular progress indicator with percentage
- **Stats** - Time spent, accuracy, streak bonus, XP earned
- **Performance Trend** - Your score history
- **Focus Areas** - Topics that need improvement
- **Question Review** - Expandable review of each question

### Learning Goals

Create and track personal learning objectives:

1. Navigate to **Goals** from the sidebar
2. Click **Create Goal**
3. Set your goal:
   - Title and description
   - Goal type (Quizzes Completed, XP Earned, Streak Days, etc.)
   - Target value and optional deadline
4. Track progress on the Goals page
5. Earn **+100 XP** when you complete a goal!

### Daily Challenges

Participate in daily quiz challenges:

1. Check the **Daily Challenge** widget on the dashboard
2. Complete the featured quiz
3. Earn **+50 XP bonus** for daily participation
4. See how many others have participated

### Community Forum

Connect with other learners:

1. Navigate to **Community** from the sidebar
2. Browse posts by category:
   - General Discussion
   - Help & Support
   - Algorithms
   - Data Structures
   - Interview Prep
   - Resources
3. Create new posts with the **New Post** button
4. Comment on and upvote helpful posts

### Profile

View and manage your profile:

1. Navigate to **Profile** from the sidebar
2. See your stats, level progress, and achievements
3. View your **Activity Heatmap** (GitHub-style contribution graph)
4. Browse your earned **Badges**
5. Update settings in the **Settings** tab

### Leaderboard

Compete with other learners:

1. Navigate to **Leaderboard** from the sidebar
2. View rankings by XP, quizzes completed, or accuracy
3. Filter by time period (weekly, monthly, all-time)

## Administrator Features

### Admin Panel

Access the admin panel (requires admin or superadmin role):

1. Click **Admin** in the sidebar (only visible to admins)
2. Manage questions, quizzes, and users

### Creating Questions

1. Go to **Admin > Questions**
2. Click **Create Question**
3. Select question type:
   - Multiple Choice
   - Multi Select
   - True/False
   - Fill in the Blank
   - Drag & Order
   - Drag & Match
   - Code Writing
   - Debugging
   - Parsons Problem
   - Code Blocks
4. Fill in question details, options, and correct answers
5. Set difficulty, topics, XP reward, and hints
6. Save the question

### Creating Quizzes

1. Go to **Admin > Quizzes**
2. Click **Create Quiz**
3. Set quiz title, description, and settings
4. Add questions from the question bank
5. Set time limit and passing score
6. Publish when ready

### Managing Users

1. Go to **Admin > Users** (admin only)
2. View all registered users
3. Update user roles:
   - `user` - Standard learner access
   - `creator` - Can create content
   - `admin` - Full admin access
   - `superadmin` - System-wide access

### Creating Daily Challenges

Admins can create daily challenges via API:

```
POST /api/daily-challenge
{
  "date": "2025-12-16",
  "quizId": "quiz-id-here",
  "title": "Challenge Title",
  "description": "Challenge description",
  "difficulty": "medium"
}
```

## XP System

| Action | XP Reward |
|--------|-----------|
| Correct answer (Beginner) | 5-15 XP |
| Correct answer (Easy) | 10-25 XP |
| Correct answer (Medium) | 20-50 XP |
| Correct answer (Hard) | 40-100 XP |
| Correct answer (Expert) | 75-200 XP |
| Daily Challenge Bonus | +50 XP |
| Goal Completion | +100 XP |
| Using Hints | -10% XP per hint |

## Troubleshooting

### Login Issues

- Ensure you're using the correct credentials
- Check that the server is running on port 3000
- Clear browser cookies and try again

### Icons Not Displaying

- Check browser console for font loading errors
- Ensure internet connection for Google Fonts CDN
- Try hard refresh (Ctrl+Shift+R)

### Quiz Not Submitting

- Check network connection
- Ensure all required questions are answered
- Try refreshing the page

## Support

For issues or feature requests, please create an issue in the repository.
