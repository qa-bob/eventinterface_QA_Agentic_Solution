/**
 * tests/functional/features.spec.ts
 *
 * Functional tests for the Eventinterface product features/capabilities pages.
 * Covers feature sections, content completeness, media embeds, CTAs,
 * and FAQ/accordion interactions — without account creation or form submission.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Product Features @functional', () => {
  // ── Features page navigation ─────────────────────────────────────────────────

  test('features page is accessible from homepage @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToFeatures();

    if (!found) {
      console.warn(
        '[functional] Could not find a features page at common paths ' +
          '(/features, /product, /platform, etc.) or in the navigation. ' +
          'Site may not have a dedicated features page.'
      );
      test.skip(true, 'No features page found — check site navigation or update navigateToFeatures()');
      return;
    }

    // Verify we landed on a content page
    const title = await featuresPage.getTitle();
    expect(title.trim().length, 'Features page should have a title').toBeGreaterThan(0);
  });

  test('features page has a primary heading @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToFeatures();
    if (!found) {
      test.skip(true, 'No features page found');
      return;
    }

    const headingCount = await featuresPage.getFeatureHeadingCount();
    expect(
      headingCount,
      'Features page should have multiple headings describing product capabilities'
    ).toBeGreaterThan(0);
  });

  // ── Feature sections content ─────────────────────────────────────────────────

  test('features page has multiple distinct feature sections @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToFeatures();
    if (!found) {
      test.skip(true, 'No features page found');
      return;
    }

    const sections = await featuresPage.getFeatureSections();

    if (sections.length === 0) {
      console.warn('[functional] No named feature sections found — checking for any content sections');
      const genericSections = await page.locator('section, article, [class*="content"]').count();
      expect(
        genericSections,
        'Features page should have at least one content section'
      ).toBeGreaterThan(0);
    } else {
      expect(
        sections.length,
        'Features page should have multiple feature sections'
      ).toBeGreaterThan(1);
    }
  });

  test('feature sections have non-empty text @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToFeatures();
    if (!found) {
      test.skip(true, 'No features page found');
      return;
    }

    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      bodyText.trim().length,
      'Features page body should have substantial text content'
    ).toBeGreaterThan(100);
  });

  test('feature cards have titles and descriptions @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToFeatures();
    if (!found) {
      test.skip(true, 'No features page found');
      return;
    }

    const cards = await featuresPage.getFeatureCards();
    if (cards.length === 0) {
      console.warn('[functional] No feature cards identified — skipping card content check');
      return;
    }

    const emptyCards: number[] = [];
    for (let i = 0; i < Math.min(cards.length, 10); i++) {
      const text = (await cards[i].textContent() ?? '').trim();
      if (text.length < 5) emptyCards.push(i);
    }

    expect(
      emptyCards.length,
      `Found ${emptyCards.length} feature card(s) with empty or trivial text content`
    ).toBe(0);
  });

  // ── CTAs on features page ────────────────────────────────────────────────────

  test('features page has at least one call-to-action @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToFeatures();
    if (!found) {
      test.skip(true, 'No features page found');
      return;
    }

    const hasCTA = await featuresPage.hasVisibleCTA();
    expect(
      hasCTA,
      'Features page should have at least one visible CTA ' +
        '(Get Started, Request Demo, Try Free, etc.)'
    ).toBeTruthy();
  });

  // ── Media ────────────────────────────────────────────────────────────────────

  test('features page images have alt attributes @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToFeatures();
    if (!found) {
      test.skip(true, 'No features page found');
      return;
    }

    const missingAlt = await page.evaluate<string[]>(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter((img) => !img.hasAttribute('alt'))
        .map((img) => img.src || '[no src]');
    });

    if (missingAlt.length > 0) {
      console.warn(
        `[functional] ${missingAlt.length} image(s) on features page missing alt attribute:\n` +
          missingAlt.slice(0, 5).map((s) => `  ${s}`).join('\n')
      );
    }

    expect(
      missingAlt.length,
      `${missingAlt.length} image(s) on features page are missing alt attributes (accessibility)`
    ).toBe(0);
  });

  // ── FAQ / Accordion ──────────────────────────────────────────────────────────

  test('FAQ or accordion items expand when clicked @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToFeatures();
    if (!found) {
      test.skip(true, 'No features page found');
      return;
    }

    const hasFAQ = await featuresPage.hasFAQSection();
    if (!hasFAQ) {
      console.warn('[functional] No FAQ/accordion section found on features page — skipping');
      return;
    }

    // Try to find and click the first accordion item
    const accordionItem = page.locator(
      'details summary, [class*="accordion"] [class*="header"], ' +
      '[class*="faq"] [class*="question"], [class*="faq"] button'
    ).first();

    if (await accordionItem.count() === 0) return;

    // Click to expand
    await accordionItem.click();
    await page.waitForTimeout(400);

    // Verify something expanded (details open, aria-expanded changed, or new content visible)
    const detailsOpen = await page.locator('details[open]').count() > 0;
    const ariaExpanded = await page.locator('[aria-expanded="true"]').count() > 0;

    expect(
      detailsOpen || ariaExpanded,
      'Clicking an FAQ/accordion item should expand it (details[open] or aria-expanded="true")'
    ).toBeTruthy();
  });

  // ── Event management specifics ───────────────────────────────────────────────

  test('features page mentions event management capabilities @functional', async ({ featuresPage, siteConfig, page }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const found = await featuresPage.navigateToFeatures();
    if (!found) {
      test.skip(true, 'No features page found');
      return;
    }

    const bodyText = (await page.evaluate<string>(() => document.body.innerText)).toLowerCase();

    const eventPlatformKeywords = [
      'event', 'attendee', 'registration', 'speaker', 'agenda',
      'session', 'meeting', 'conference', 'venue', 'schedule',
    ];

    const found_kw = eventPlatformKeywords.filter((kw) => bodyText.includes(kw));

    expect(
      found_kw.length,
      `Features page should describe event management capabilities. ` +
        `Keywords searched: ${eventPlatformKeywords.join(', ')}. ` +
        `Found: ${found_kw.join(', ') || 'none'}`
    ).toBeGreaterThan(0);
  });
});
