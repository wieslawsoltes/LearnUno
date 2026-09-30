import {expect} from '@playwright/test';

/** Test observable content as well as successful construction of a UIElement. */
export async function expectRichTextContent(frame) {
  await expect(frame.getByText(
    'Browser exercise: TextBlock.Inlines; RichTextBlock project example is in the chapter.',
    {exact:true}
  )).toBeVisible();
  await expect(frame.getByText(
    'Release review: keep the whole instruction readable. Read keyboard guidance before publishing.',
    {exact:true}
  )).toBeVisible();
  await expect(frame.getByText(
    'A second paragraph separates the next idea without hard-coded line positions.',
    {exact:true}
  )).toBeVisible();
  const link = frame.getByRole('link',{name:'Read keyboard guidance',exact:true});
  await expect(link).toBeVisible();
  return link;
}
