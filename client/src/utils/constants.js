export const APP_NAME = 'ReadMyCode';
export const APP_TAGLINE = 'AI-Powered Code Analysis & Documentation';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ANALYZE: '/analyze',
  REPO: '/repo/:id',
  README: '/repo/:id/readme',
  API_DOCS: '/repo/:id/api-docs',
  FLOWCHART: '/repo/:id/flowchart',
  ARCHITECTURE: '/repo/:id/architecture',
  FUNCTIONS: '/repo/:id/functions',
  DEBUGGER: '/repo/:id/debugger',
  HISTORY: '/history',
  SETTINGS: '/settings',
  PROFILE: '/profile',
};

export const SIDEBAR_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/analyze', label: 'Analyze Repo', icon: 'Upload' },
  { path: '/history', label: 'History', icon: 'History' },
];

export const REPO_TABS = [
  { path: 'readme', label: 'README', icon: 'FileText' },
  { path: 'api-docs', label: 'API Docs', icon: 'Code2' },
  { path: 'flowchart', label: 'Flowchart', icon: 'GitBranch' },
  { path: 'architecture', label: 'Architecture', icon: 'Network' },
  { path: 'functions', label: 'Functions', icon: 'FunctionSquare' },
  { path: 'debugger', label: 'Debugger', icon: 'Bug' },
];

export const ANALYSIS_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const FILE_EXTENSIONS = {
  js: 'JavaScript',
  jsx: 'React JSX',
  ts: 'TypeScript',
  tsx: 'React TSX',
  py: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  cs: 'C#',
  go: 'Go',
  rs: 'Rust',
  rb: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kt: 'Kotlin',
  dart: 'Dart',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  less: 'Less',
  json: 'JSON',
  md: 'Markdown',
  yml: 'YAML',
  yaml: 'YAML',
  xml: 'XML',
  sql: 'SQL',
  sh: 'Shell',
  bash: 'Bash',
  dockerfile: 'Dockerfile',
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const SUPPORTED_ARCHIVE_TYPES = ['.zip', '.tar.gz', '.tar'];

export const THEME_COLORS = {
  background: '#0B1120',
  card: '#111827',
  primary: '#2563EB',
  secondary: '#38BDF8',
  accent: '#14B8A6',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};