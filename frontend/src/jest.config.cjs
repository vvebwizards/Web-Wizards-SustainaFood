module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text"],
  moduleFileExtensions: ["js", "jsx"],
};
