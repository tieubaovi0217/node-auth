jest.mock('path', () => {
  return {
    join: (...args: string[]) => {
      return args.join('/');
    },
  };
});

import { makeResourcePath } from '../../src/shares/makeResourcePath';

it('should make path correctly', () => {
  process.env.WEB_SERVER_RESOURCE_PATH = '/tmp/root';
  const username = 'test';

  const result = makeResourcePath(username, 'folderA', 'fileB.txt');

  const expected = '/tmp/root/test/folderA/fileB.txt';
  expect(result).toBe(expected);
});
