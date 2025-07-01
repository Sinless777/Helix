// commitlint.config.ts
import type { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';

const Configuration: UserConfig = {
    extends: ['@commitlint/config-conventional'],
    parserPreset: 'conventional-changelog-atom',
    formatter: '@commitlint/format',

    rules: {
        // restrict types
        'type-enum': [
            RuleConfigSeverity.Error,
            'always',
            [
                'feat',
                'fix',
                'docs',
                'style',
                'refactor',
                'perf',
                'test',
                'build',
                'ci',
                'chore',
                'revert',
                'merge',
            ],
        ],

        // scope is optional: no need to enforce non-empty
        // so we don't add 'scope-empty' or set it to warning

        // require subject non-empty
        'subject-empty': [RuleConfigSeverity.Error, 'never'],

        // require body
        'body-empty': [RuleConfigSeverity.Error, 'never'],

        // ensure header achieves minimal format (type[:scope] subject)
        'header-min-length': [RuleConfigSeverity.Error, 'always', 3],
        'header-max-length': [RuleConfigSeverity.Warning, 'always', 100],
    },
};

export default Configuration;
