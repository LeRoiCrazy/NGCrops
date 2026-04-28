#!/usr/bin/env node

/**
 * Smoke tests for NGCrops
 * 
 * Tests basic SSR rendering of critical routes.
 * Usage: node scripts/smoke-tests.js
 */

const http = require("http");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const TIMEOUT_MS = 5000;

const ROUTES = [
  {
    path: "/auth/signin",
    name: "Sign-in page",
    expectStatus: 200,
  },
  {
    path: "/",
    name: "Home/Market page (requires auth)",
    expectStatus: [200, 303], // 303 redirect if not authenticated
  },
  {
    path: "/api/health",
    name: "Health check endpoint",
    expectStatus: 200,
  },
];

async function testRoute(route) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({
        route: route.name,
        path: route.path,
        status: "timeout",
        passed: false,
        error: "Request timeout",
      });
    }, TIMEOUT_MS);

    const url = new URL(route.path, BASE_URL);

    http
      .get(url, (res) => {
        clearTimeout(timeout);
        const passed = Array.isArray(route.expectStatus)
          ? route.expectStatus.includes(res.statusCode)
          : res.statusCode === route.expectStatus;

        resolve({
          route: route.name,
          path: route.path,
          status: res.statusCode,
          passed,
          error: passed ? null : `Expected ${route.expectStatus}, got ${res.statusCode}`,
        });
      })
      .on("error", (err) => {
        clearTimeout(timeout);
        resolve({
          route: route.name,
          path: route.path,
          status: "error",
          passed: false,
          error: err.message,
        });
      });
  });
}

async function runSmokeTests() {
  console.log(`\n🧪 NGCrops Smoke Tests\n`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Timeout: ${TIMEOUT_MS}ms\n`);

  const results = await Promise.all(ROUTES.map(testRoute));

  console.log("Results:\n");
  let passCount = 0;
  let failCount = 0;

  for (const result of results) {
    const icon = result.passed ? "✓" : "✗";
    const status = result.status === "timeout" ? "TIMEOUT" : result.status;

    console.log(`${icon} ${result.route}`);
    console.log(`  Path: ${result.path}`);
    console.log(`  Status: ${status}`);

    if (result.error) {
      console.log(`  Error: ${result.error}`);
      failCount++;
    } else {
      passCount++;
    }
    console.log();
  }

  console.log(`\n Summary: ${passCount} passed, ${failCount} failed out of ${ROUTES.length}`);

  if (failCount > 0) {
    console.log("\n❌ Smoke tests FAILED\n");
    process.exit(1);
  } else {
    console.log("\n✓ All smoke tests PASSED\n");
    process.exit(0);
  }
}

// Start tests
runSmokeTests().catch((err) => {
  console.error("Smoke tests error:", err);
  process.exit(1);
});
