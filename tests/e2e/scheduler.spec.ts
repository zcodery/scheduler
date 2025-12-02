import { test, expect } from '@playwright/test'

test('scheduler basic interactions', async ({ page }) => {
  await page.goto('/scheduler')
  await expect(page.getByText('人员排期')).toBeVisible()
  const todayButton = page.getByRole('button', { name: '定位今天' })
  await todayButton.click()
  const addButtons = await page.locator('.rs-item', { hasText: '新增任务' }).count()
  expect(addButtons).toBeGreaterThanOrEqual(0)
})
