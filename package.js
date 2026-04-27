/* global Package */

Package.describe({
  name: "4fox4:apollo-accounts",
  version: "0.2.0",
  // Brief, one-line summary of the package.
  summary: "Meteor accounts in GraphQL",
  // URL to the Git repository containing the source code for this package.
  git: "https://github.com/4fox4/meteor-apollo-accounts",
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: "README.md",
});

Package.onUse(function (api) {
  api.versionsFrom(["2.4", "3.0"]);

  api.use(
    [
      "check",
      "accounts-base",
      "oauth2",
      "ecmascript",
      "random",
      "oauth",
      "service-configuration",
      "accounts-oauth",
      "sha",
      "fetch",
    ],
    "server",
  );

  api.mainModule("src/index.js", "server");
});

Package.onTest(function (api) {});
