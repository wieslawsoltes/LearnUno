import {test, expect, chromium} from '@playwright/test';

test('WebGPU compute and render pipelines execute on a software test adapter', async ({baseURL}) => {
  test.skip(!!process.env.PUBLIC_URL, 'The exact artifact is shader-validated before deployment; public checks use the default browser configuration.');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-unsafe-webgpu', '--use-angle=swiftshader', '--use-vulkan=swiftshader', '--enable-features=Vulkan']
  });
  const context = await browser.newContext({baseURL, viewport: {width: 1440, height: 1050}});
  await context.addInitScript(() => {
    globalThis.gpuEvidence = {computePipelines: 0, renderPipelines: 0, submissions: 0, errors: []};
    if (!globalThis.GPUAdapter) return;
    const requestDevice = GPUAdapter.prototype.requestDevice;
    GPUAdapter.prototype.requestDevice = async function (...args) {
      const device = await requestDevice.apply(this, args);
      device.addEventListener('uncapturederror', event => gpuEvidence.errors.push(event.error.message));
      return device;
    };
    for (const [method, counter] of [['createComputePipelineAsync','computePipelines'], ['createRenderPipelineAsync','renderPipelines']]) {
      const original = GPUDevice.prototype[method];
      GPUDevice.prototype[method] = async function (...args) {
        const pipeline = await original.apply(this, args);
        gpuEvidence[counter]++;
        return pipeline;
      };
    }
    const submit = GPUQueue.prototype.submit;
    GPUQueue.prototype.submit = function (...args) {
      const result = submit.apply(this, args);
      gpuEvidence.submissions++;
      return result;
    };
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  try {
    await page.goto('./#/lesson/binding-flow/visualize');
    await expect(page.locator('#visual-backend')).toHaveText('WebGPU · compute + render', {timeout: 30000});
    await page.waitForFunction(() => gpuEvidence.submissions >= 2, {}, {timeout: 15000});
    await page.locator('#visual-play').click();
    const evidence = await page.evaluate(() => gpuEvidence);
    expect(evidence.computePipelines).toBe(1);
    expect(evidence.renderPipelines).toBe(1);
    expect(evidence.errors).toEqual([]);
    expect(pageErrors).toEqual([]);
    await test.info().attach('software-webgpu-evidence', {body: JSON.stringify(evidence, null, 2), contentType: 'application/json'});
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({path: 'artifacts/evidence/webgpu-software.png', fullPage: true});
  } finally {
    await browser.close();
  }
});
