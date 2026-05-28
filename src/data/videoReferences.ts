export type VideoReferenceType = 'short' | 'video';

export interface VideoReference {
  id: string;
  title: string;
  type: VideoReferenceType;
  url: string;
  embedUrl: string;
  focus: string;
  tags: string[];
  notes: string;
}

const toEmbedUrl = (youtubeId: string) => `https://www.youtube.com/embed/${youtubeId}`;

export const VIDEO_REFERENCES: VideoReference[] = [
  {
    id: 'touchtight-g2uv91xrtpi',
    title: 'Touchtight Reference Short 1',
    type: 'short',
    url: 'https://youtube.com/shorts/G2Uv91xrTPI',
    embedUrl: toEmbedUrl('G2Uv91xrTPI'),
    focus: 'Animated coaching-board movement reference',
    tags: ['movement timing', 'support angles', 'session animation'],
    notes: 'Use as a visual reference for how simple player icons can move with readable timing and clear coaching intent.',
  },
  {
    id: 'touchtight-uh61xqadveu',
    title: 'Touchtight Reference Short 2',
    type: 'short',
    url: 'https://youtube.com/shorts/uh61xQaDVeU',
    embedUrl: toEmbedUrl('uh61xQaDVeU'),
    focus: 'Pattern-play movement reference',
    tags: ['pattern play', 'rotations', 'ball path'],
    notes: 'Use for comparing player run timing, staggered movement, and ball/player synchronization.',
  },
  {
    id: 'touchtight-qwrtlb99a8q',
    title: 'Touchtight Reference Short 3',
    type: 'short',
    url: 'https://youtube.com/shorts/qWrtlb99a8Q',
    embedUrl: toEmbedUrl('qWrtlb99a8Q'),
    focus: 'Coaching animation spacing reference',
    tags: ['spacing', 'movement realism', 'player shape'],
    notes: 'Use to review how the team shape is presented while keeping the animation simple and coach-friendly.',
  },
  {
    id: 'touchtight-tkof-mllgfg',
    title: 'Touchtight Reference Short 4',
    type: 'short',
    url: 'https://youtube.com/shorts/Tkof-mllgFg',
    embedUrl: toEmbedUrl('Tkof-mllgFg'),
    focus: 'Session-plan animation reference',
    tags: ['session plan', 'timed runs', 'coaching board'],
    notes: 'Use as a reference for making session-plan concepts easier to understand visually.',
  },
  {
    id: 'touchtight-p6avumhhnug',
    title: 'Touchtight Reference Video 1',
    type: 'video',
    url: 'https://youtu.be/P6AVUMHHNug',
    embedUrl: toEmbedUrl('P6AVUMHHNug'),
    focus: 'Long-form session-plan reference',
    tags: ['session plan', 'drill design', 'coaching detail'],
    notes: 'Use as a deeper reference for converting a session idea into phases, progressions, and coaching points.',
  },
  {
    id: 'touchtight-glulnetrld8',
    title: 'Touchtight Reference Video 2',
    type: 'video',
    url: 'https://youtu.be/GlUlnEtRlD8',
    embedUrl: toEmbedUrl('GlUlnEtRlD8'),
    focus: 'Long-form movement/session reference',
    tags: ['movement patterns', 'session structure', 'coaching reference'],
    notes: 'Use to compare the app movement model against a complete session-plan style video.',
  },
];
