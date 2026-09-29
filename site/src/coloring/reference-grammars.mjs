import apache from 'highlight.js/lib/languages/apache';
import nginx from 'highlight.js/lib/languages/nginx';
import gradle from 'highlight.js/lib/languages/gradle';
import swift from 'highlight.js/lib/languages/swift';

// These fence names occur in the pinned Uno documentation, not just our demos.
export const referenceAliases = Object.freeze({
  dotnetcli: 'bash', pwsh: 'powershell', apacheconf: 'apache', nginxconf: 'nginx',
  solution: 'sln', plain: 'plaintext', output: 'plaintext', error: 'plaintext',
  paths: 'plaintext', uri: 'plaintext', resources: 'plaintext', schema: 'plaintext'
});
export const referenceLanguages = Object.freeze(['apache', 'nginx', 'gradle', 'swift', 'mermaid', 'sln']);

/** Lexical grammars only: Mermaid source is colored, never evaluated or rendered. */
export function registerReferenceGrammars(hljs) {
  for (const [name, grammar] of Object.entries({apache, nginx, gradle, swift})) {
    hljs.registerLanguage(name, grammar);
  }
  hljs.registerLanguage('mermaid', h => ({
    name: 'Mermaid source',
    keywords: {
      keyword: 'graph flowchart subgraph end direction sequenceDiagram participant actor activate deactivate loop alt else opt par and critical option break rect note Note over right left of classDiagram class stateDiagram stateDiagram-v2 state erDiagram gantt dateFormat title section pie journey mindmap timeline gitGraph commit branch checkout merge classDef linkStyle style click',
      literal: 'TB TD BT LR RL true false'
    },
    contains: [
      h.COMMENT('%%', '$'),
      h.QUOTE_STRING_MODE,
      {scope: 'operator', begin: /(?:<[-.=]+>|[-.=]{2,}>?|<\|[-.]+|[-.]+\|>|:::+|[+~#])/},
      {scope: 'number', begin: /\b\d+(?:\.\d+)?\b/},
      {scope: 'punctuation', begin: /[()[\]{}|:;]/}
    ]
  }));
  hljs.registerLanguage('sln', h => ({
    name: 'Visual Studio solution',
    keywords: {
      keyword: 'Project EndProject ProjectSection EndProjectSection Global EndGlobal GlobalSection EndGlobalSection preProject postProject preSolution postSolution',
      built_in: 'VisualStudioVersion MinimumVisualStudioVersion SolutionConfigurationPlatforms ProjectConfigurationPlatforms SolutionProperties NestedProjects ExtensibilityGlobals'
    },
    contains: [
      h.HASH_COMMENT_MODE,
      h.QUOTE_STRING_MODE,
      {scope: 'meta', begin: /^Microsoft Visual Studio Solution File.*$/m},
      {scope: 'symbol', begin: /\{[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}\}/i},
      {scope: 'number', begin: /\b\d+(?:\.\d+)*\b/}
    ]
  }));
}
