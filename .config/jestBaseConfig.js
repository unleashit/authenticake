const { readdirSync } = require('fs');
const { resolve } = require('path');

/*
 * Due to a bug where Jetbrains test runner ignores jest configs in monorepo packages,
 * testing roots are provided as an array of paths in the base config (used in a JB run configuration)
 * then in each child config for the package, "roots" is overridden with the local path.
 * The <rootDir> token should not be used in this file since it changes depending on context (Jetbrains runner vs cli).
 * */

function getRoots() {
  const pkgRoot = resolve(__dirname, '../packages');

  const roots = readdirSync(pkgRoot, {
    withFileTypes: true,
  })
    .filter((item) => item.isDirectory())
    .map(({ name }) => `${pkgRoot}/${name}/src`);

  if (!roots || roots.length === 0) {
    throw new Error("Couldn't find any packages to test");
  }

  return roots;
}

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: getRoots(),
  setupFilesAfterEnv: [
    `${__dirname}/jestSetupNode.ts`,
    // `${__dirname}/jestSetupReact.js`,
  ],
  // projects: [`${pkgRoot}/*`],
  testURL: 'http://localhost/',
  transform: {
    '\\.tsx?$': 'ts-jest',
    '\\.jsx?$': 'babel-jest',
  },
  // testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  snapshotSerializers: ['enzyme-to-json/serializer'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|svg)$':
      '../../testConfig/__mocks__/fileMock.js',
    '\\.(css|scss)$': '../../testConfig/__mocks__/styleMock.js',
  },
  passWithNoTests: true,
};
