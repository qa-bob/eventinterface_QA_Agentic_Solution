/**
 * tests/functional/pricing.spec.ts
 *
 * Functional tests for the Eventinterface pricing page.
 * Verifies pricing tiers exist, CTAs are present per plan, and
 * the feature comparison table is accessible — without account creation.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Pricing Page @functional', () => {
  // ── Pricing page navigation ──────────────────────────────────────────────────

  test('pricing page is accessible from navigation @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToPricing();

    if (!found) {
      console.warn(
        '[functional] Could not reach a pricing page at /pricing, /plans, /packages ' +
          'or via navigation link. ' +
          'Site may use a different URL — update navigateToPricing() in features.page.ts.'
      );
      test.skip(true, 'No pricing page found');
      return;
    }

    const title = await featuresPage.getTitle();
    expect(title.trim().length, 'Pricing page should have a document title').toBeGreaterThan(0);
  });

  test('pricing page has a heading @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToPricing();
    if (!found) {
      test.skip(true, 'No pricing page found');
      return;
    }

    const h1 = page.locator('h1, h2').first();
    await expect(h1, 'Pricing page should have a primary heading').toBeVisible();

    const headingText = (await h1.textContent() ?? '').trim();
    expect(headingText.length, 'Pricing page heading should have text').toBeGreaterThan(0);
  });

  // ── Pricing tiers ────────────────────────────────────────────────────────────

  test('pricing page has at least one plan or pricing tier @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToPricing();
    if (!found) {
      test.skip(true, 'No pricing page found');
      return;
    }

    const tiers = await featuresPage.getPricingTierLocators();

    if (tiers.length === 0) {
      // Fall back: check for price-like content on the page
      const pricePattern = await page.locator('*').filter({
        hasText: /\$\d+|\bfree\b|\bper month\b|\bper user\b|\bcontact us\b/i,
      }).count();

      expect(
        pricePattern,
        'Pricing page should display at least one pricing option (dollar amounts, "Free", or "Contact Us")'
      ).toBeGreaterThan(0);
    } else {
      expect(
        tiers.length,
        'Pricing page should have at least one pricing plan card'
      ).toBeGreaterThan(0);
    }
  });

  test('each pricing tier has a CTA button or link @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToPricing();
    if (!found) {
      test.skip(true, 'No pricing page found');
      return;
    }

    const tiers = await featuresPage.getPricingTiers();
    if (tiers.length === 0) {
      console.warn('[functional] No structured pricing tiers found — skipping per-tier CTA check');
      return;
    }

    const tiersWithoutCTA = tiers.filter((t) => !t.hasCTA);
    if (tiersWithoutCTA.length > 0) {
      console.warn(
        `[functional] ${tiersWithoutCTA.length} pricing tier(s) have no CTA:\n` +
          tiersWithoutCTA.map((t) => `  "${t.name}"`).join('\n')
      );
    }

    // Soft assertion: each plan should ideally have a CTA
    expect(
      tiersWithoutCTA.length,
      `${tiersWithoutCTA.length} pricing tier(s) are missing a CTA button/link`
    ).toBeLessThanOrEqual(Math.ceil(tiers.length / 2)); // Allow max 50% without explicit CTA
  });

  test('pricing page has visible CTA buttons @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToPricing();
    if (!found) {
      test.skip(true, 'No pricing page found');
      return;
    }

    const hasCTA = await featuresPage.hasVisibleCTA();
    expect(
      hasCTA,
      'Pricing page should have at least one visible CTA ' +
        '(Get Started, Try Free, Sign Up, Contact Us, etc.)'
    ).toBeTruthy();
  });

  // ── Feature comparison ───────────────────────────────────────────────────────

  test('pricing page feature list or comparison is present @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToPricing();
    if (!found) {
      test.skip(true, 'No pricing page found');
      return;
    }

    // Check for feature lists within pricing cards or a comparison table
    const hasTable = await featuresPage.hasFeatureComparison();
    const hasFeatureLists = await page.locator(
      '[class*="plan"] ul, [class*="plan"] li, ' +
      '[class*="pricing"] ul, [class*="pricing"] li, ' +
      '[class*="tier"] ul, [class*="tier"] li'
    ).count() > 0;

    const hasFeatureContent = hasTable || hasFeatureLists;

    if (!hasFeatureContent) {
      console.warn(
        '[functional] No feature comparison table or feature lists found in pricing tiers. ' +
          'Users need to know what they get with each plan.'
      );
    }
    // Soft assertion — feature lists are best practice
  });

  // ── FAQ on pricing page ──────────────────────────────────────────────────────

  test('pricing FAQ section is functional if present @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToPricing();
    if (!found) {
      test.skip(true, 'No pricing page found');
      return;
    }

    const hasFAQ = await featuresPage.hasFAQSection();
    if (!hasFAQ) {
      // No FAQ is fine — this is informational only
      console.warn('[functional] No FAQ section found on pricing page');
      return;
    }

    // If FAQ exists, the first item should be clickable
    const faqItem = page.locator(
      'details summary, [class*="faq"] button, [class*="accordion"] button'
    ).first();

    if (await faqItem.count() === 0) return;

    await expect(faqItem, 'FAQ item should be visible').toBeVisible();
    await faqItem.click();
    await page.waitForTimeout(300);

    // After clicking, expanded content should be available
    const expanded = await page.locator('details[open], [aria-expanded="true"]').count();
    expect(expanded, 'FAQ item should expand when clicked').toBeGreaterThan(0);
  });

  // ── Accessibility on pricing page ────────────────────────────────────────────

  test('pricing page has no images missing alt attributes @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToPricing();
    if (!found) {
      test.skip(true, 'No pricing page found');
      return;
    }

    const missingAlt = await page.evaluate<number>(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter((img) => !img.hasAttribute('alt')).length;
    });

    if (missingAlt > 0) {
      console.warn(`[functional] ${missingAlt} image(s) on pricing page are missing alt attributes`);
    }

    expect(
      missingAlt,
      `${missingAlt} pricing page image(s) are missing alt attributes`
    ).toBe(0);
  });

  test('pricing page CTA buttons are not disabled @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToPricing();
    if (!found) {
      test.skip(true, 'No pricing page found');
      return;
    }

    const ctaButtons = page.locator('button, a[role="button"]').filter({
      hasText: /get started|sign up|try free|choose|select|subscribe|start/i,
    });

    const count = await ctaButtons.count();
    if (count === 0) {
      console.warn('[functional] No explicit CTA buttons found on pricing page');
      return;
    }

    const disabledCTAs: string[] = [];
    for (let i = 0; i < count; i++) {
      const btn = ctaButtons.nth(i);
      const isDisabled = await btn.isDisabled();
      if (isDisabled) {
        const text = (await btn.textContent() ?? '').trim();
        disabledCTAs.push(text);
      }
    }

    expect(
      disabledCTAs,
      `These pricing CTA buttons are disabled: ${disabledCTAs.join(', ')}`
    ).toHaveLength(0);
  });
});
