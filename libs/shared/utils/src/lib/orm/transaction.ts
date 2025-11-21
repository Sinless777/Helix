import type { EntityManager } from '@mikro-orm/core';

export const transactional = async <T>(
  em: EntityManager,
  fn: (tx: EntityManager) => Promise<T>,
): Promise<T> => {
  const fork = em.fork({ useContext: false });
  return fork.transactional(fn);
};
