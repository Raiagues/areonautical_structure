import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'tests/browser',timeout:60000,workers:2,
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',launchOptions:{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}},
  projects:[{name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:1100}}},{name:'mobile',use:{...devices['Pixel 5']}}],
  webServer:{command:'npm run serve',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI}
});
