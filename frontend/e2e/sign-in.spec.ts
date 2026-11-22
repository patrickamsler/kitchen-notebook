import { expect, test } from '@playwright/test';

const password = process.env['KN_TEST_USER_PASSWORD'] ?? '';

test(
  'PLT-02 PLT-04 sign-in shows the email and sign-out ends the session',
  { tag: ['@PLT-02', '@PLT-04'] },
  async ({ page }) => {
    // given a signed-out visitor opening the web app
    await page.goto('/');
    await expect(page).toHaveURL(/\/realms\/kitchen-notebook\//);

    // when Anna signs in at Keycloak
    await page.locator('#username').fill('anna@example.com');
    await page.locator('#password').fill(password);
    await page.locator('#kc-login').click();

    // then the shell shows her email
    await expect(page.getByTestId('signed-in-as')).toHaveText('Signed in as anna@example.com');

    // when she signs out
    await page.getByRole('button', { name: 'Sign out' }).click();

    // then Keycloak asks for credentials again and the API rejects the old session
    await expect(page.locator('#kc-form-login')).toBeVisible();
    const me = await page.request.get('/api/me');
    expect(me.status()).toBe(401);
  },
);
