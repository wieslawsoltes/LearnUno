import {expect} from '@playwright/test';

/**
 * Read actual control state, including open popup children and ButtonBase
 * subclasses. Click its real DOM host; never synthesize managed input or ARIA.
 */
export function unoControls(page, frame) {
  async function snapshot(name) {
    const result = await page.evaluate(() => window.learnUnoLab.request({method:'inspect',code:''}));
    expect(result.truncated, 'Control inspection must not truncate this lesson').toBe(false);
    return result.controls.filter(control => control.isButton && control.text === name && control.isVisible);
  }
  return {
    button(name) {
      async function current() {
        const values = await snapshot(name);
        return values.length === 1 ? values[0] : null;
      }
      return {
        async expectEnabled(enabled) {
          await expect.poll(async () => (await current())?.isEnabled, {
            message: `Actual Uno Button “${name}” enabled state`, timeout:15000
          }).toBe(enabled);
        },
        async click() {
          await this.expectEnabled(true);
          const control = await current();
          expect(control).not.toBeNull();
          expect(control.handle).toMatch(/^\d+$/);
          await frame.locator(`[xamlhandle="${control.handle}"]`).click({timeout:15000});
        }
      };
    }
  };
}
