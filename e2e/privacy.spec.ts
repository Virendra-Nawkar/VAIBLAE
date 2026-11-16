import { test, expect } from '@playwright/test';
test('image processing never sends a selected image binary over the network',async({page})=>{
  const binaries:Array<number[]>=[];await page.route('**/*',async route=>{const req=route.request();const body=req.postDataBuffer();if(body&&body.length>8)binaries.push([...body]);await route.continue();});
  await page.goto('/');
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/r6sAAAAASUVORK5CYII=','base64');
  await page.locator('input[type=file]').setInputFiles({name:'tiny.png',mimeType:'image/png',buffer:png});
  await expect(page.getByText('tiny.png')).toBeVisible();await page.getByRole('button',{name:/remove metadata/i}).click();
  await expect(page.getByText(/verified clean copy/i)).toBeVisible();expect(binaries).toHaveLength(0);
});
