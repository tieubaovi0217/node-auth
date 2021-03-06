// eslint-disable-next-line no-undef
module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/test/**/*.test.(ts|js)'],
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/@types/**/*',
    '!src/common/constants.ts',
    '!src/routes/**/*',
    '!src/index.ts',
    '!src/shares/cloudconvert.ts',
  ],
  // coverageThreshold: {
  //   global: {
  //     lines: 90,
  //     statements: 90,
  //   },
  // },
};
