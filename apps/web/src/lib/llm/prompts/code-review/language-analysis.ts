import { PRAnalysis } from '../../../github/types/pr-analysis';
import type { PromptContext } from '../../types/analysis';

export interface LanguageStats {
  name: string;
  percentage: number;
  files: string[];
  primaryInChanges: boolean;
}

export interface LanguageAnalysis {
  languages: LanguageStats[];
  primaryLanguage: string | null;
  frameworks: string[];
  buildTools: string[];
  unsupportedLanguages: string[];
}

interface LanguageConfig {
  extensions: readonly string[];
  frameworks: readonly string[];
  buildTools: readonly string[];
}

type LanguageMapEntry = {
  name: string;
  frameworks: string[];
  buildTools: string[];
};

/**
 * Map of supported languages and their capabilities.
 * This is used both for language detection and documentation.
 */
export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  'TypeScript': {
    extensions: ['.ts', '.tsx'],
    frameworks: ['React', 'Next.js', 'Angular', 'NestJS', 'Vue.js', 'Deno', 'Remix', 'Gatsby'],
    buildTools: ['tsc', 'webpack', 'vite', 'esbuild', 'swc']
  },
  'JavaScript': {
    extensions: ['.js', '.jsx', '.mjs'],
    frameworks: ['React', 'Vue.js', 'Express', 'Node.js', 'Svelte', 'Electron', 'Preact', 'Gatsby'],
    buildTools: ['webpack', 'babel', 'vite', 'rollup', 'parcel']
  },
  'PHP': {
    extensions: ['.php'],
    frameworks: ['Laravel', 'Symfony', 'CodeIgniter', 'WordPress', 'Drupal', 'Yii'],
    buildTools: ['composer', 'phpunit', 'phing', 'deployer']
  },
  'BrightScript': {
    extensions: ['.brs'],
    frameworks: ['Roku SceneGraph'],
    buildTools: ['ropm', 'roku-deploy']
  },
  'Ruby': {
    extensions: ['.rb', '.rake'],
    frameworks: ['Rails', 'Sinatra', 'Hanami', 'Grape', 'Jekyll'],
    buildTools: ['bundler', 'rake', 'rubygems', 'rbenv', 'rvm']
  },
  'Python': {
    extensions: ['.py', '.pyw'],
    frameworks: ['Django', 'Flask', 'FastAPI', 'Pyramid', 'aiohttp', 'Tornado', 'PyQt', 'Tkinter'],
    buildTools: ['pip', 'poetry', 'setuptools', 'conda', 'virtualenv', 'pyenv']
  },
  'Java': {
    extensions: ['.java'],
    frameworks: ['Spring', 'Jakarta EE', 'Micronaut', 'Quarkus', 'Android'],
    buildTools: ['Maven', 'Gradle', 'Ant', 'sbt']
  },
  'C++': {
    extensions: ['.cpp', '.cc', '.hpp'],
    frameworks: ['Qt', 'Boost', 'POCO', 'OpenCV', 'SDL'],
    buildTools: ['CMake', 'Make', 'Ninja', 'Bazel', 'vcpkg']
  },
  'C#': {
    extensions: ['.cs'],
    frameworks: ['.NET Core', 'ASP.NET', 'Unity', 'Xamarin', 'MAUI'],
    buildTools: ['dotnet', 'MSBuild', 'NuGet', 'Cake']
  },
  'Swift': {
    extensions: ['.swift'],
    frameworks: ['SwiftUI', 'UIKit', 'Vapor', 'Perfect', 'Kitura'],
    buildTools: ['swift', 'xcodebuild', 'SPM', 'CocoaPods', 'Carthage']
  },
  'Kotlin': {
    extensions: ['.kt', '.kts'],
    frameworks: ['Spring', 'Ktor', 'Android', 'Compose', 'KMM'],
    buildTools: ['Gradle', 'Maven', 'Bazel']
  },
  'Go': {
    extensions: ['.go'],
    frameworks: ['Gin', 'Echo', 'Fiber', 'Buffalo', 'Beego', 'Revel'],
    buildTools: ['go build', 'go mod', 'goreleaser', 'air']
  },
  'Haskell': {
    extensions: ['.hs', '.lhs'],
    frameworks: ['Yesod', 'Servant', 'Snap', 'IHP'],
    buildTools: ['cabal', 'stack', 'ghc']
  },
  'Erlang': {
    extensions: ['.erl', '.hrl'],
    frameworks: ['OTP', 'Cowboy', 'Phoenix', 'ChicagoBoss'],
    buildTools: ['rebar3', 'erlang.mk', 'mix']
  },
  'Dart': {
    extensions: ['.dart'],
    frameworks: ['Flutter', 'AngularDart', 'Aqueduct'],
    buildTools: ['pub', 'dart2js', 'dartanalyzer', 'dart2native']
  },
  'Scala': {
    extensions: ['.scala', '.sc'],
    frameworks: ['Play', 'Akka', 'Apache Spark', 'Lagom', 'http4s'],
    buildTools: ['sbt', 'Maven', 'Gradle', 'Mill']
  },
  'Elixir': {
    extensions: ['.ex', '.exs'],
    frameworks: ['Phoenix', 'Nerves', 'Absinthe', 'Ecto'],
    buildTools: ['mix', 'hex', 'rebar3']
  },
  'R': {
    extensions: ['.r', '.R', '.Rmd'],
    frameworks: ['Shiny', 'tidyverse', 'ggplot2', 'caret', 'mlr3'],
    buildTools: ['devtools', 'renv', 'packrat', 'rmarkdown']
  },
  'Julia': {
    extensions: ['.jl'],
    frameworks: ['Flux', 'JuMP', 'DifferentialEquations', 'Plots'],
    buildTools: ['Pkg', 'BinaryBuilder', 'PackageCompiler']
  },
  'C': {
    extensions: ['.c', '.h'],
    frameworks: ['GTK', 'SDL', 'OpenGL', 'Qt'],
    buildTools: ['Make', 'CMake', 'Autotools', 'GCC', 'Clang']
  },
  'Rust': {
    extensions: ['.rs'],
    frameworks: ['Actix', 'Rocket', 'Tokio', 'Yew', 'Tauri'],
    buildTools: ['cargo', 'rustc', 'rustup', 'wasm-pack']
  },
  'Bash': {
    extensions: ['.sh', '.bash'],
    frameworks: ['GNU Core Utils', 'Shell Utils', 'AWK', 'sed'],
    buildTools: ['shellcheck', 'shfmt', 'bats']
  }
};

export function analyzeLanguages(analysis: PRAnalysis): LanguageAnalysis {
  // Create extension to language mapping from SUPPORTED_LANGUAGES
  const languageMap: Record<string, LanguageMapEntry> = {};

  // Build the extension map from SUPPORTED_LANGUAGES
  Object.entries(SUPPORTED_LANGUAGES).forEach(([name, info]) => {
    info.extensions.forEach(ext => {
      // Remove the dot from extension
      const extKey = ext.slice(1);
      languageMap[extKey] = {
        name,
        frameworks: [...info.frameworks], // Create mutable copy
        buildTools: [...info.buildTools]  // Create mutable copy
      };
    });
  });

  // Count occurrences of each language
  const languageCounts: Record<string, {
    files: Set<string>;
    frameworks: Set<string>;
    buildTools: Set<string>;
  }> = {};

  // Track unsupported languages
  const unsupportedExtensions = new Set<string>();

  // Process each file
  analysis.diffAnalysis.changedFiles.forEach(file => {
    const parts = file.filename.split('.');
    const ext = parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
    
    // Skip files without extensions
    if (!ext) {
      return;
    }
    
    const lang = languageMap[ext];
    if (lang) {
      // Supported language
      if (!languageCounts[lang.name]) {
        languageCounts[lang.name] = {
          files: new Set(),
          frameworks: new Set(),
          buildTools: new Set()
        };
      }
      languageCounts[lang.name].files.add(file.filename);
      lang.frameworks.forEach(f => languageCounts[lang.name].frameworks.add(f));
      lang.buildTools.forEach(t => languageCounts[lang.name].buildTools.add(t));
    } else {
      // Only track extensions, not filenames without extensions
      unsupportedExtensions.add(ext);
    }
  });

  // Calculate percentages and find primary language
  const totalFiles = Object.values(languageCounts).reduce((sum, { files }) => sum + files.size, 0);
  let maxCount = 0;
  let primaryLanguage: string | null = null;
  const languages: LanguageStats[] = [];
  const allFrameworks = new Set<string>();
  const allBuildTools = new Set<string>();

  Object.entries(languageCounts).forEach(([name, { files, frameworks, buildTools }]) => {
    const count = files.size;
    const percentage = totalFiles > 0 ? (count / totalFiles) * 100 : 0;
    if (count > maxCount) {
      maxCount = count;
      primaryLanguage = name;
    }
    languages.push({
      name,
      percentage,
      files: Array.from(files),
      primaryInChanges: false // Will be set after finding primary
    });
    frameworks.forEach(f => allFrameworks.add(f));
    buildTools.forEach(t => allBuildTools.add(t));
  });

  // Mark primary language
  if (primaryLanguage) {
    const primary = languages.find(l => l.name === primaryLanguage);
    if (primary) {
      primary.primaryInChanges = true;
    }
  }

  // If we found unsupported languages, include them in the warning
  if (unsupportedExtensions.size > 0) {
    const unsupportedFiles = Array.from(unsupportedExtensions).join(', ');
    const supportedLanguagesInfo = Object.entries(SUPPORTED_LANGUAGES)
      .map(([name, info]) => `${name} (${info.extensions.join(', ')})`)
      .join('\n- ');

    console.warn(
      `Found files with unsupported extensions: ${unsupportedFiles}\n\n` +
      'Supported Languages:\n- ' + supportedLanguagesInfo + '\n\n' +
      'For more information see: docs/supported-languages.md'
    );
  }

  return {
    languages: languages.sort((a, b) => b.percentage - a.percentage),
    primaryLanguage,
    frameworks: Array.from(allFrameworks),
    buildTools: Array.from(allBuildTools),
    unsupportedLanguages: Array.from(unsupportedExtensions)
  };
}

export function generateLanguageSpecificPrompt(
  analysis: PRAnalysis,
  context: PromptContext,
  languageAnalysis: LanguageAnalysis
): string {
  const { languages, frameworks, buildTools } = languageAnalysis;

  const prompt = `Language Analysis:
${languages.map(lang => `- ${lang.name}: ${lang.percentage.toFixed(1)}% (${lang.files.length} files)${lang.primaryInChanges ? ' (Primary)' : ''}`).join('\n')}

Frameworks Detected: ${frameworks.join(', ') || 'None'}
Build Tools: ${buildTools.join(', ') || 'None'}

Please analyze the code changes with special attention to:

1. Language-Specific Best Practices:
${languages.map(lang => `   ${lang.name}:
   - Code style and idioms
   - Error handling patterns
   - Performance considerations
   - Type system usage (if applicable)
   - Memory management (if applicable)`).join('\n\n')}

2. Cross-Language Interactions:
   - Interface consistency
   - Data serialization
   - Error propagation
   - Type compatibility
   - Build system integration

3. Framework-Specific Patterns:
${frameworks.map(framework => `   ${framework}:
   - Component architecture
   - State management
   - Performance patterns
   - Security considerations`).join('\n\n')}

4. Build System Considerations:
${buildTools.map(tool => `   ${tool}:
   - Configuration best practices
   - Dependency management
   - Build optimization opportunities`).join('\n\n')}`;

  return prompt;
}
