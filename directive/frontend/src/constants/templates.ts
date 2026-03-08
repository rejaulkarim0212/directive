/**
 * Template Constants — 任务模板相关常量
 */

export interface TemplateParam {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  default?: string;
  required?: boolean;
  options?: string[];
}

export interface Template {
  id: string;
  cat: string;
  icon: string;
  name: string;
  desc: string;
  depts: string[];
  est: string;
  cost: string;
  params: TemplateParam[];
  command: string;
}

export const TEMPLATES: Template[] = [
  {
    id: 'tpl-weekly-report', cat: 'Operations', icon: '📝', name: 'Weekly Brief',
    desc: 'Summarize the week across active directives and department outputs.',
    depts: ['Department of the Treasury', 'Department of State'], est: '~10m', cost: '$0.5',
    params: [
      { key: 'date_range', label: 'Date range', type: 'text', default: 'This week', required: true },
      { key: 'focus', label: 'Focus areas', type: 'text', default: 'progress,next week priorities' },
      { key: 'format', label: 'Output format', type: 'select', options: ['Markdown', 'Doc'], default: 'Markdown' },
    ],
    command: 'Create a weekly brief for {date_range}, focused on {focus}, delivered as {format}.',
  },
  {
    id: 'tpl-code-review', cat: 'Engineering', icon: '🔍', name: 'Code Review',
    desc: 'Run an engineering and compliance review on a repo or file set.',
    depts: ['Department of Defense', 'Department of Justice'], est: '~20m', cost: '$2',
    params: [
      { key: 'repo', label: 'Repository or path', type: 'text', required: true },
      { key: 'scope', label: 'Scope', type: 'select', options: ['Full repo', 'Recent changes', 'Specific files'], default: 'Recent changes' },
      { key: 'focus', label: 'Review focus', type: 'text', default: 'security,error handling,performance' },
    ],
    command: 'Review {repo}. Scope: {scope}. Focus on {focus}.',
  },
  {
    id: 'tpl-api-design', cat: 'Engineering', icon: '⚡', name: 'API Design + Build',
    desc: 'Turn a product requirement into an API plan, implementation, and test pass.',
    depts: ['National Security Council', 'Department of Defense'], est: '~45m', cost: '$3',
    params: [
      { key: 'requirement', label: 'Requirement', type: 'textarea', required: true },
      { key: 'tech', label: 'Stack', type: 'select', options: ['Python/FastAPI', 'Node/Express', 'Go/Gin'], default: 'Python/FastAPI' },
      { key: 'auth', label: 'Auth', type: 'select', options: ['JWT', 'API Key', 'None'], default: 'JWT' },
    ],
    command: 'Design and implement a {tech} REST API for: {requirement}. Auth: {auth}.',
  },
  {
    id: 'tpl-competitor', cat: 'Analysis', icon: '📊', name: 'Competitive Analysis',
    desc: 'Compare competitor products, positioning, and public signals.',
    depts: ['Department of Defense', 'Department of the Treasury', 'Department of State'], est: '~60m', cost: '$5',
    params: [
      { key: 'targets', label: 'Targets (one per line)', type: 'textarea', required: true },
      { key: 'dimensions', label: 'Dimensions', type: 'text', default: 'features,pricing,user sentiment' },
      { key: 'format', label: 'Output format', type: 'select', options: ['Markdown report', 'Comparison table'], default: 'Markdown report' },
    ],
    command: 'Analyze these competitors:\n{targets}\n\nDimensions: {dimensions}. Output: {format}.',
  },
  {
    id: 'tpl-data-report', cat: 'Analysis', icon: '📈', name: 'Data Report',
    desc: 'Clean, analyze, and summarize a dataset into an executive report.',
    depts: ['Department of the Treasury', 'Department of State'], est: '~30m', cost: '$2',
    params: [
      { key: 'data_source', label: 'Dataset path or source', type: 'text', required: true },
      { key: 'questions', label: 'Questions to answer', type: 'textarea' },
      { key: 'viz', label: 'Need charts?', type: 'select', options: ['Yes', 'No'], default: 'Yes' },
    ],
    command: 'Analyze {data_source}. Questions: {questions}. Charts: {viz}.',
  },
  {
    id: 'tpl-blog', cat: 'Communications', icon: '✍️', name: 'Article Draft',
    desc: 'Draft a structured article for an external or internal audience.',
    depts: ['Department of State'], est: '~15m', cost: '$1',
    params: [
      { key: 'topic', label: 'Topic', type: 'text', required: true },
      { key: 'audience', label: 'Audience', type: 'text', default: 'technical stakeholders' },
      { key: 'length', label: 'Length', type: 'select', options: ['~1,000 words', '~2,000 words', '~3,000 words'], default: '~2,000 words' },
      { key: 'style', label: 'Style', type: 'select', options: ['Technical explainer', 'Opinion', 'Case study'], default: 'Technical explainer' },
    ],
    command: 'Write an article about {topic} for {audience}, length {length}, style {style}.',
  },
  {
    id: 'tpl-deploy', cat: 'Engineering', icon: '🚀', name: 'Deployment Plan',
    desc: 'Generate rollout steps, runtime config, and CI/CD guidance.',
    depts: ['Department of Defense', 'Department of Commerce'], est: '~25m', cost: '$2',
    params: [
      { key: 'project', label: 'Project', type: 'text', required: true },
      { key: 'env', label: 'Environment', type: 'select', options: ['Docker', 'K8s', 'VPS', 'Serverless'], default: 'Docker' },
      { key: 'ci', label: 'CI/CD', type: 'select', options: ['GitHub Actions', 'GitLab CI', 'None'], default: 'GitHub Actions' },
    ],
    command: 'Generate a {env} deployment plan for {project}. CI/CD: {ci}.',
  },
  {
    id: 'tpl-email', cat: 'Communications', icon: '📧', name: 'Email / Notice',
    desc: 'Draft a polished message for a business, customer, or internal audience.',
    depts: ['Department of State'], est: '~5m', cost: '$0.3',
    params: [
      { key: 'scenario', label: 'Scenario', type: 'select', options: ['Business email', 'Launch notice', 'Customer update', 'Internal memo'], default: 'Business email' },
      { key: 'purpose', label: 'Message content', type: 'textarea', required: true },
      { key: 'tone', label: 'Tone', type: 'select', options: ['Formal', 'Friendly', 'Concise'], default: 'Formal' },
    ],
    command: 'Draft a {tone} {scenario}. Content: {purpose}.',
  },
  {
    id: 'tpl-standup', cat: 'Operations', icon: '🗓️', name: 'Daily Standup Summary',
    desc: 'Summarize today\'s activity and next actions across the cabinet workflow.',
    depts: ['Office of Management and Budget'], est: '~5m', cost: '$0.3',
    params: [
      { key: 'range', label: 'Window', type: 'select', options: ['Today', 'Last 24 hours', 'Yesterday + today'], default: 'Today' },
    ],
    command: 'Create a standup summary for {range} across all departments.',
  },
];

export const TPL_CATS = [
  { name: 'All', icon: '📋' },
  { name: 'Operations', icon: '💼' },
  { name: 'Analysis', icon: '📊' },
  { name: 'Engineering', icon: '⚙️' },
  { name: 'Communications', icon: '✍️' },
];
