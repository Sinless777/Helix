// commitlint.config.ts

import type { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: 'conventional-changelog-atom',
  formatter: '@commitlint/format',
  rules: {
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      ['feat','fix','docs','style','refactor','perf','test','build','ci','chore','revert','merge'],
    ],
    'subject-empty': [RuleConfigSeverity.Error, 'never'],
    // Disable subject-case to allow sentence-case commits
    'subject-case': [0, 'never', []],
    // Allow empty body if needed
    'body-empty': [RuleConfigSeverity.Warning, 'always'],
    'body-leading-blank': [RuleConfigSeverity.Warning, 'always'],
    // allow 1000 characters in body
    'body-max-length': [RuleConfigSeverity.Warning, 'always', 1000],
    'body-max-line-length': [RuleConfigSeverity.Warning, 'always', 1000],
    'header-max-length': [RuleConfigSeverity.Warning, 'always', 250],
  },
};

export default Configuration;
