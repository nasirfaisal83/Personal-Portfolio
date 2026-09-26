// A .cjs file rather than JSON so the audited case study can be one that was
// actually exported: a project set to `visible: false` has no page in out/.
const { existsSync, readdirSync } = require("node:fs");

const exported = existsSync("./out/projects") ? readdirSync("./out/projects").sort() : [];
const caseStudy = exported.includes("order-saga") ? "order-saga" : exported[0];

module.exports = {
  ci: {
    collect: {
      staticDistDir: "./out",
      url: [
        "http://localhost/index.html",
        ...(caseStudy ? [`http://localhost/projects/${caseStudy}/index.html`] : []),
      ],
      numberOfRuns: 3,
      settings: { preset: "desktop", emulatedFormFactor: "mobile" },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
      },
    },
    upload: { target: "temporary-public-storage" },
  },
};
