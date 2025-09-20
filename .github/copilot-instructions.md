# AI Coding Assistant Instructions for Todo App

## Project Architecture

This is a full-stack todo and notes application with a **React + Vite frontend** and **Express.js + MongoDB backend**. The app supports user authentication, folders, todos, and rich notes with a clean separation between concerns.

### Key Components
- **Backend**: Express.js API (port 5000) with MongoDB, JWT auth via httpOnly cookies
- **Frontend**: React 19 SPA (dev port 5173) with React Router, Context API for state management
- **Database**: MongoDB with Mongoose ODM, optimized for serverless deployments
- **Authentication**: Cookie-based JWT with httpOnly cookies (not localStorage)

## Critical Development Patterns

### Authentication Flow
- **Backend**: Uses `protect` middleware from `authMiddleware.js` that reads JWT from httpOnly cookies
- **Frontend**: `AuthContext` manages global auth state, `authService.js` handles API calls with `credentials: 'include'`
- **Route Protection**: `ProtectedRoute` and `RedirectIfAuthenticated` components wrap routes based on auth state
- Always use `credentials: 'include'` in fetch requests - authentication relies on cookies, not headers

### Data Models & Relationships
```javascript
// User -> Folders (1:many) -> Notes (1:many)
// User -> Todos (1:many, direct relationship)
```
- Users have default folders created automatically on registration (`folderModel.js`)
- All models use `userId` field as string (not ObjectId) for consistency
- Models transform `_id` to `id` in JSON responses and remove MongoDB metadata

### Context Providers Pattern
The app uses React Context extensively - each major feature has its own provider:
```javascript
// App.jsx provider hierarchy (order matters):
<ThemeProvider>
  <AuthProvider> 
    <FoldersProvider>
      // TodoProvider only wraps /todo route
```
- `AuthContext`: Global user state, must be available to all other contexts
- `FoldersContext`: Folder management, depends on AuthContext
- `TodoContext`: Todo CRUD operations, scoped to todo page only
- `ThemeContext`: App-wide theming (dark/light mode)

### API Communication Patterns

#### Environment Configuration
- Frontend uses `import.meta.env.VITE_API_BASE_URL` with fallback to `/api`
- Vite proxy config routes `/api/*` to backend in development
- Production deploys frontend to Vercel, backend separately

#### Error Handling Convention
All API services follow this pattern:
```javascript
try {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Operation failed');
  }
  return await response.json();
} catch (error) {
  setError(error.message);
  console.error('Operation error:', error);
}
```

### Backend Development Patterns

#### Route Structure
- Routes in `routes/` define endpoints only
- Business logic in `controllers/` 
- `authMiddleware.js` protects routes requiring authentication
- All protected routes expect `userId` from `req.user.id`

#### Database Optimizations
- Connection caching for serverless environments (`db.js`)
- Text indexes on notes for search functionality
- Compound indexes for efficient queries (user + folder + order)
- Pre-save middleware auto-updates `updatedAt` timestamps

#### Model Conventions
- Use ES6 modules (`import/export`) throughout backend
- Mongoose schemas include virtuals and JSON transform methods
- Password hashing with bcrypt in pre-save middleware
- Instance methods for complex operations (e.g., `moveToFolder`)

## Development Workflow

### Starting Development
```bash
# Backend (from /backend)
npm run dev  # Uses nodemon for auto-restart

# Frontend (from /frontend)  
npm run dev  # Vite dev server with HMR
```

### Key Files for Feature Development
- **New API endpoints**: Add route in `routes/`, controller in `controllers/`, protect with `authMiddleware.js`
- **New React features**: Create context in `context/`, components in `components/`, integrate in `App.jsx`
- **Database changes**: Modify models in `models/`, consider indexes and relationships
- **Styling**: Component-specific CSS files alongside JSX files, global themes in `styles/theme.css`

### Testing & Debugging
- Backend logs extensively (see `authMiddleware.js` for debug pattern)
- Use `import.meta.env.DEV` for development-only features in frontend
- Network tab crucial for debugging auth issues (check cookie headers)

## Common Gotchas

1. **Auth cookies**: Always include `credentials: 'include'` in fetch requests
2. **Port mismatch**: Backend runs on 5000, but `.env` shows 5001 - check actual server startup
3. **CORS settings**: Backend allows specific origins including Vercel deployment URL
4. **ES modules**: Backend uses `"type": "module"` - use import/export syntax consistently  
5. **Context dependencies**: AuthContext must be available before other contexts that depend on user state
6. **Folder relationships**: Notes require valid `folderId`, enforce in UI and API validation

## Deployment Architecture
- **Frontend**: Vercel SPA with rewrites for client-side routing (`vercel.json`)
- **Backend**: Designed for serverless deployment with connection caching
- **Environment**: Different CORS origins for dev (`localhost:5173`) vs prod (`vercel.app`)