import {expect} from '@playwright/test';

/**
 * The pinned NativeRenderer emits Button as a div. Read the control's actual
 * state through the .NET bridge; click its real DOM host rather than invoking
 * a managed event or inventing ARIA state in the test.
 */
export function unoControls(page, frame) {
  async function snapshot(name) {
    const result = await page.evaluate(() => window.learnUnoLab.request({method:'inspect',code:''}));
    expect(result.truncated, 'Control inspection must not truncate this lesson').toBe(false);
    return result.controls.filter(c => c.type === 'Microsoft.UI.Xaml.Controls.Button' && c.text === name && c.isVisible);
  }
  return {
    button(name) {
      async function current() {
        const values = await snapshot(name);
        if (values.length !== 1) return null;
        return values[0];
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
