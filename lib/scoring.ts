export function extractKeywords(text: string): string[] {
  // A simple list of common tech skills to extract from the JD.
  // In a more advanced version, this could use NLP or a larger dictionary.
  const techSkills = [
    'react', 'angular', 'vue', 'svelte', 'next.js', 'nextjs', 'node.js', 'nodejs',
    'express', 'typescript', 'javascript', 'python', 'django', 'flask', 'java',
    'spring', 'c#', '.net', 'go', 'golang', 'ruby', 'rails', 'php', 'laravel',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'sql', 'mysql', 'postgresql',
    'mongodb', 'nosql', 'redis', 'graphql', 'rest', 'api', 'html', 'css',
    'tailwind', 'sass', 'git', 'ci/cd', 'agile', 'scrum', 'machine learning',
    'ai', 'llm', 'data science'
  ];

  const lowerText = text.toLowerCase();
  const extracted = techSkills.filter(skill => lowerText.includes(skill));
  return extracted;
}

export function calculateKeywordScore(resumeText: string, jdText: string) {
  const jdSkills = extractKeywords(jdText);
  if (jdSkills.length === 0) return { score: 0, matched: [], missing: [] };

  const resumeLower = resumeText.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of jdSkills) {
    // Basic substring check for now
    if (resumeLower.includes(skill)) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const score = Math.round((matched.length / jdSkills.length) * 100);
  return { score, matched, missing };
}
