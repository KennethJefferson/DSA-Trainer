# DSA Trainer

A gamified learning platform for mastering Data Structures & Algorithms through interactive quizzes, courses, and real-time code execution.

## Features

### For Learners
- **Interactive Quizzes** - 10 different question types including multiple choice, code writing, debugging, drag-and-drop, and more
- **Real-Time Code Execution** - Write and test code directly in the browser with Judge0 CE integration
- **Gamification** - Earn XP, level up, unlock badges, and compete on leaderboards
- **Learning Paths** - Structured courses with modules and progressive difficulty
- **Progress Tracking** - Detailed statistics, streaks, and performance analytics
- **Hints System** - Optional hints with XP penalties to guide learning
- **Daily Challenges** - Complete daily quizzes for bonus XP rewards
- **Learning Goals** - Set and track personal learning objectives
- **Community Forum** - Discuss topics, ask questions, and share knowledge

### For Administrators
- **Question Builder** - Visual editor for creating all question types with live validation
- **Quiz Management** - Create, organize, and publish quizzes with time limits and passing scores
- **User Management** - Role-based access control and user administration
- **Content Import/Export** - Bulk operations for questions and quizzes
- **Analytics Dashboard** - System-wide statistics and usage metrics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Credentials + OAuth)
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor
- **Drag & Drop**: DND Kit
- **Code Execution**: Judge0 CE API
- **Validation**: Zod

## Question Types

| Type | Description |
|------|-------------|
| Multiple Choice | Single correct answer from options |
| Multi Select | Multiple correct answers with partial credit |
| True/False | Binary true or false statements |
| Fill in the Blank | Code completion with placeholder syntax |
| Drag & Order | Arrange items in correct sequence |
| Drag & Match | Match pairs of related items |
| Code Writing | Full code solutions with test cases |
| Debugging | Find and fix bugs in provided code |
| Parsons Problem | Arrange code lines with correct indentation |
| Code Blocks | Arrange code blocks to solve problems |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dsa-trainer.git
   cd dsa-trainer
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Configure the following in `.env`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/dsa_trainer"

   # Authentication
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"

   # Code Execution
   JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
   JUDGE0_API_KEY="your-rapidapi-key"
   ```

4. **Generate NextAuth secret**
   ```bash
   # Generate a random secret and add to .env as NEXTAUTH_SECRET
   openssl rand -base64 32
   ```

5. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Seed with sample data (optional)
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Test Accounts

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dsatrainer.com | admin123 |
| User | test@dsatrainer.com | test123 |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin panel routes
│   ├── (auth)/            # Authentication routes (login, register)
│   ├── (main)/            # Main app routes
│   │   ├── dashboard/     # User dashboard
│   │   ├── courses/       # Course catalog
│   │   ├── quiz/          # Quiz player & results
│   │   ├── profile/       # User profile
│   │   ├── goals/         # Learning goals
│   │   ├── community/     # Community forum
│   │   └── leaderboard/   # Rankings
│   └── api/               # API routes
│       ├── daily-challenge/  # Daily challenge endpoints
│       ├── goals/           # Goals CRUD
│       └── community/       # Forum endpoints
├── components/
│   ├── admin/             # Admin components
│   ├── dashboard/         # Dashboard, Sidebar, Header
│   ├── profile/           # Profile components (heatmap, badges)
│   ├── quiz/              # Quiz components (timer, question map)
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities and configurations
└── types/                 # TypeScript type definitions

prisma/
├── schema.prisma          # Database schema (17 models)
└── seed.ts               # Database seeder
```

## Development

### Common Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database operations
npm run db:studio       # Open Prisma Studio
npm run db:generate     # Generate client
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database
```

### Environment Setup

For local development with Judge0 CE:
1. Sign up at [RapidAPI](https://rapidapi.com)
2. Subscribe to [Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
3. Copy your API key to `JUDGE0_API_KEY`

## User Roles

| Role | Permissions |
|------|-------------|
| `user` | Take quizzes, view courses, track progress |
| `creator` | All user permissions + create/edit own content |
| `admin` | All creator permissions + manage all content and users |
| `superadmin` | Full system access |

## API Endpoints

### Questions
- `GET /api/questions` - List questions with filters
- `POST /api/questions` - Create question
- `GET /api/questions/:id` - Get question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Quizzes
- `GET /api/quizzes` - List quizzes
- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes/:id` - Get quiz with questions
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz
- `POST /api/quizzes/:id/submit` - Submit quiz attempt

### Code Execution
- `POST /api/execute` - Execute code via Judge0

### User
- `GET /api/user/stats` - Get user statistics
- `GET /api/user/progress` - Get learning progress
- `GET /api/leaderboard` - Get leaderboard rankings

## Design System

### Colors
```
Primary:        #7f13ec
Primary Hover:  #6b11c7
Background:     #121212
Surface Dark:   #1e1e24
Surface Light:  #2a2a30
Text Main:      #f7f6f8
Text Muted:     #ad92c9
```

### Typography
- Font Family: Lexend
- Icons: Google Material Symbols

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Judge0](https://judge0.com/) for code execution API
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Next.js](https://nextjs.org/) for the framework
- [Prisma](https://www.prisma.io/) for database ORM
