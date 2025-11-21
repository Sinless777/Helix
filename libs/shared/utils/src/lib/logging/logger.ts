export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export type Logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => void;
  info: (msg: string, meta?: Record<string, unknown>) => void;
  warn: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, meta?: Record<string, unknown>) => void;
};

export const createLogger = (level: LogLevel = 'info'): Logger => {
  const threshold = levelOrder[level];
  const log =
    (lvl: LogLevel) =>
    (msg: string, meta?: Record<string, unknown>) => {
      if (levelOrder[lvl] < threshold) return;
      const text = meta ? `${msg} ${JSON.stringify(meta)}` : msg;
      // eslint-disable-next-line no-console
      console[lvl === 'debug' ? 'log' : lvl](text);
    };

  return {
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
  };
};
