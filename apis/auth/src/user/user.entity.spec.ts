// apis/auth/src/user/user.entity.spec.ts

import { User } from './user.entity';
import { v5 as uuidv5 } from 'uuidv5';

describe('User Entity', () => {
  const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Use the same namespace as in the entity

  it('should generate a uuidv5 ID based on email before create', () => {
    const email = 'test@example.com';
    const expectedId = uuidv5(email, NAMESPACE);

    const user = new User();
    user.email = email;

    user.generateUuid();

    expect(user.id).toBe(expectedId);
  });

  it('should not overwrite ID if already set', () => {
    const predefinedId = 'some-static-id';
    const user = new User();
    user.id = predefinedId;
    user.email = 'another@example.com';

    user.generateUuid();

    expect(user.id).toBe(predefinedId);
  });

  it('should initialize createdAt and updatedAt dates', () => {
    const user = new User();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });
});
