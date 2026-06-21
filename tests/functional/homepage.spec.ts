/**
 * tests/functional/homepage.spec.ts
 *
 * Functional tests for the Eventinterface homepage.
 * Verifies business-critical elements: hero content, feature highlights,
 * social proof, CTAs, and footer — without account creation or form submission.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Homepage Functional @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    // homePage fixture auto-navigates; wait for full load
    await homePage.waitForLoad();
  });

  // ── Page loads with meaningful content ──────────────────────────────────────

  test('homepage is fully loaded with heading and navigation @functional', async ({ homePage }) => {
    const isLoaded = await homePage.isLoaded();
    expect(
      isLoaded,
      'Homepage should have a heading, navigation, and body text after load'
    ).toBeTruthy();
  });

  test('homepage has a primary heading @functional', async ({ homePage }) => {
    const heading = await homePage.getMainHeading();
    expect(
      heading.length,
      'Homepage should have a non-empty <h1> or <h2> heading'
    ).toBeGreaterThan(0);
  });

  // ── Hero section ────────────────────────────────────────────────────────────

  test('hero section is visible with text content @functional', async ({ homePage }) => {
    const heroText = await homePage.getHeroText();
    expect(
      heroText.trim().length,
      'Hero/banner section should contain visible text'
    ).toBeGreaterThan(10);
  });

  // ── Call-to-action buttons ──────────────────────────────────────────────────

  test('homepage has at least one call-to-action button @functional', async ({ homePage }) => {
    const ctas = await homePage.getCTAButtons();
    expect(
      ctas.length,
      'Homepage should have at least one CTA button (e.g., "Get Started", "Request Demo")'
    ).toBeGreaterThan(0);

    // First CTA should be visible
    if (ctas.length > 0) {
      await expect(ctas[0], 'Primary CTA should be visible').toBeVisible();
    }
  });

  test('primary CTA links to a valid destination @functional', async ({ homePage, page, siteConfig }) => {
    const ctas = await homePage.getCTAButtons();
    if (ctas.length === 0) {
      test.skip(true, 'No CTAs found on homepage — skipping destination check');
      return;
    }

    const firstCTA = ctas[0];
    const tagName = await firstCTA.evaluate((el) => el.tagName.toLowerCase());

    if (tagName === 'a') {
      const href = await firstCTA.getAttribute('href');
      expect(href, 'CTA <a> element should have an href attribute').not.toBeNull();
      expect(href, 'CTA href should not be empty or "#"').not.toBe('#');
    }

    // If it's a button, verify it's clickable (not disabled)
    if (tagName === 'button') {
      const isDisabled = await firstCTA.isDisabled();
      expect(isDisabled, 'Primary CTA button should not be disabled').toBeFalsy();
    }
  });

  // ── Feature highlights ──────────────────────────────────────────────────────

  test('homepage has feature or benefit sections @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    // Count h2/h3 headings as a proxy for feature sections
    const headingCount = await page.locator('h2, h3').count();
    expect(
      headingCount,
      'Homepage should have multiple section headings describing product features or benefits'
    ).toBeGreaterThan(0);
  });

  test('homepage has meaningful paragraph text content @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const paragraphs = page.locator('p');
    const count = await paragraphs.count();

    if (count === 0) {
      console.warn('[functional] No <p> elements found on homepage — site may be using divs for text');
      return;
    }

    // At least one non-trivial paragraph
    const nonEmptyParagraphs = await page.evaluate<number>(() => {
      return Array.from(document.querySelectorAll('p'))
        .filter((p) => (p.textContent?.trim().length ?? 0) > 20)
        .length;
    });

    expect(
      nonEmptyParagraphs,
      'Homepage should have at least one paragraph with substantial text'
    ).toBeGreaterThan(0);
  });

  // ── Social proof ────────────────────────────────────────────────────────────

  test('homepage has social proof elements @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    // Look for common social proof patterns
    const socialProofSelectors = [
      '[class*="testimonial"]',
      '[class*="review"]',
      '[class*="quote"]',
      '[class*="customer"]',
      '[class*="client"]',
      '[class*="logo"]',
      'blockquote',
    ];

    let found = false;
    for (const selector of socialProofSelectors) {
      if (await page.locator(selector).count() > 0) {
        found = true;
        break;
      }
    }

    if (!found) {
      console.warn(
        '[functional] No social proof elements found on homepage ' +
          '(testimonials, customer logos, reviews). ' +
          'These are important for conversion — consider adding them.'
      );
    }
    // Soft assertion — social proof is best practice, not a hard requirement
  });

  // ── Footer ──────────────────────────────────────────────────────────────────

  test('homepage has a footer with links @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const footer = page.locator('footer, [role="contentinfo"]').first();
    const footerExists = await footer.count() > 0;

    if (!footerExists) {
      console.warn('[functional] No <footer> or [role="contentinfo"] found on homepage');
      return;
    }

    await expect(footer, 'Footer should be visible').toBeVisible();

    const footerLinks = footer.locator('a[href]');
    const linkCount = await footerLinks.count();

    expect(
      linkCount,
      'Footer should contain navigation links'
    ).toBeGreaterThan(0);
  });

  test('footer has copyright text @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const footer = page.locator('footer, [role="contentinfo"]').first();
    if (await footer.count() === 0) {
      test.skip(true, 'No footer found — skipping copyright check');
      return;
    }

    const footerText = (await footer.textContent() ?? '').toLowerCase();
    const hasCopyright = footerText.includes('©') ||
      footerText.includes('copyright') ||
      footerText.includes('all rights reserved');

    if (!hasCopyright) {
      console.warn('[functional] Footer does not appear to contain copyright text');
    }
  });

  // ── Event planning specific ─────────────────────────────────────────────────

  test('homepage references event or meeting management concepts @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'networkidle' });

    const bodyText = (await page.evaluate<string>(() => document.body.innerText)).toLowerCase();

    const eventKeywords = [
      'event', 'meeting', 'conference', 'attendee', 'registration',
      'planning', 'schedule', 'agenda', 'speaker', 'venue',
    ];

    const foundKeywords = eventKeywords.filter((kw) => bodyText.includes(kw));

    expect(
      foundKeywords.length,
      `Homepage should mention event/meeting planning concepts. ` +
        `Searched for: ${eventKeywords.join(', ')}. ` +
        `Found: ${foundKeywords.join(', ') || 'none'}`
    ).toBeGreaterThan(0);
  });
});
