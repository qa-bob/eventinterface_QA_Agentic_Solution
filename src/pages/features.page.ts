/**
 * src/pages/features.page.ts
 *
 * FeaturesPage models the product features and pricing sections of the site.
 * Uses semantic and role-based selectors to stay design-agnostic across
 * SaaS site patterns (event management, pricing tiers, feature grids).
 */

import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export interface PricingTierInfo {
  name: string;
  price: string;
  hasCTA: boolean;
}

export class FeaturesPage extends BasePage {
  // ── Navigation to features/pricing ──────────────────────────────────────────

  /**
   * Navigate to the site's features page.
   * Tries /features, /product, /how-it-works in order.
   */
  async navigateToFeatures(): Promise<boolean> {
    const candidates = ['/features', '/product', '/how-it-works', '/platform', '/solutions'];

    for (const path of candidates) {
      try {
        const response = await this.page.goto(
          this.url.replace(/\/$/, '') + path,
          { waitUntil: 'domcontentloaded', timeout: 10_000 }
        );
        if (response && response.status() < 400) return true;
      } catch {
        // Try next path
      }
    }

    // Fall back to looking for a Features nav link and clicking it
    const featuresLink = this.page.locator('nav a, [role="navigation"] a').filter({
      hasText: /features|product|platform|solutions|how it works/i,
    }).first();

    if (await featuresLink.count() > 0) {
      await featuresLink.click();
      await this.page.waitForLoadState('domcontentloaded');
      return true;
    }

    return false;
  }

  /**
   * Navigate to the site's pricing page.
   * Tries /pricing, /plans, /packages in order.
   */
  async navigateToPricing(): Promise<boolean> {
    const candidates = ['/pricing', '/plans', '/packages', '/subscribe'];

    for (const path of candidates) {
      try {
        const response = await this.page.goto(
          this.url.replace(/\/$/, '') + path,
          { waitUntil: 'domcontentloaded', timeout: 10_000 }
        );
        if (response && response.status() < 400) return true;
      } catch {
        // Try next path
      }
    }

    // Fall back to nav link
    const pricingLink = this.page.locator('nav a, [role="navigation"] a').filter({
      hasText: /pricing|plans|packages/i,
    }).first();

    if (await pricingLink.count() > 0) {
      await pricingLink.click();
      await this.page.waitForLoadState('domcontentloaded');
      return true;
    }

    return false;
  }

  // ── Feature sections ─────────────────────────────────────────────────────────

  /**
   * Return all major feature section containers.
   * Looks for common SaaS feature section patterns.
   */
  async getFeatureSections(): Promise<Locator[]> {
    const candidates = [
      '[class*="feature"]',
      '[class*="benefit"]',
      '[class*="capability"]',
      '[class*="service"]',
      'section',
    ];

    for (const selector of candidates) {
      const sections = this.page.locator(selector);
      const count = await sections.count();
      if (count > 1) return sections.all();
    }

    return [];
  }

  /**
   * Return feature card elements — individual feature items within a grid or list.
   */
  async getFeatureCards(): Promise<Locator[]> {
    const candidates = [
      '[class*="feature-card"]',
      '[class*="feature-item"]',
      '[class*="feature__item"]',
      '[class*="card"]',
      'article',
      'li[class*="feature"]',
    ];

    for (const selector of candidates) {
      const cards = this.page.locator(selector);
      const count = await cards.count();
      if (count > 0) return cards.all();
    }

    return [];
  }

  /**
   * Return the count of feature headings (h2, h3) on the current page.
   * Useful for verifying a features page has substantial content.
   */
  async getFeatureHeadingCount(): Promise<number> {
    return this.page.locator('h2, h3').count();
  }

  // ── Pricing tiers ────────────────────────────────────────────────────────────

  /**
   * Return all pricing tier/plan containers.
   * Looks for common pricing table patterns.
   */
  async getPricingTierLocators(): Promise<Locator[]> {
    const candidates = [
      '[class*="pricing-card"]',
      '[class*="pricing-plan"]',
      '[class*="pricing-tier"]',
      '[class*="plan-card"]',
      '[class*="plan-item"]',
      '[class*="price-card"]',
      '[class*="tier"]',
    ];

    for (const selector of candidates) {
      const tiers = this.page.locator(selector);
      const count = await tiers.count();
      if (count > 0) return tiers.all();
    }

    return [];
  }

  /**
   * Extract pricing tier metadata: name, displayed price, and whether a CTA exists.
   */
  async getPricingTiers(): Promise<PricingTierInfo[]> {
    const tierLocators = await this.getPricingTierLocators();
    const tiers: PricingTierInfo[] = [];

    for (const tier of tierLocators) {
      const heading = tier.locator('h2, h3, h4').first();
      const name = (await heading.textContent().catch(() => ''))?.trim() ?? '';

      // Look for price: dollar sign, number, or "Free" / "Contact"
      const priceEl = tier.locator('[class*="price"], [class*="amount"], [class*="cost"]').first();
      const price = (await priceEl.textContent().catch(() => ''))?.trim() ?? '';

      const ctaEl = tier.locator('a, button').filter({
        hasText: /get started|sign up|try|choose|select|subscribe|contact|free|start/i,
      }).first();
      const hasCTA = await ctaEl.count() > 0;

      if (name) {
        tiers.push({ name, price, hasCTA });
      }
    }

    return tiers;
  }

  /**
   * Returns true if a pricing comparison table or feature matrix exists on the page.
   */
  async hasFeatureComparison(): Promise<boolean> {
    const tablePatterns = [
      'table[class*="comparison"]',
      'table[class*="pricing"]',
      '[class*="comparison-table"]',
      '[class*="feature-comparison"]',
      'table',
    ];

    for (const selector of tablePatterns) {
      if (await this.page.locator(selector).count() > 0) return true;
    }

    return false;
  }

  // ── CTA elements ─────────────────────────────────────────────────────────────

  /**
   * Return all CTA buttons/links on the current page.
   */
  async getPageCTAs(): Promise<Locator[]> {
    const ctas = this.page.locator('a, button').filter({
      hasText: /get started|try free|sign up|request demo|contact|learn more|see pricing|start free|book demo/i,
    });
    return ctas.all();
  }

  /**
   * Returns true if there is at least one visible CTA on the page.
   */
  async hasVisibleCTA(): Promise<boolean> {
    const ctas = await this.getPageCTAs();
    for (const cta of ctas) {
      if (await cta.isVisible()) return true;
    }
    return false;
  }

  // ── Video / media ────────────────────────────────────────────────────────────

  /**
   * Returns true if the page contains an embedded video (YouTube, Vimeo, or native).
   */
  async hasVideoEmbed(): Promise<boolean> {
    const patterns = [
      'iframe[src*="youtube"]',
      'iframe[src*="vimeo"]',
      'iframe[src*="wistia"]',
      'video',
      '[class*="video-player"]',
      '[class*="video-embed"]',
    ];

    for (const p of patterns) {
      if (await this.page.locator(p).count() > 0) return true;
    }
    return false;
  }

  // ── Testimonials / social proof ──────────────────────────────────────────────

  /**
   * Returns true if the page contains a testimonials or social proof section.
   */
  async hasTestimonials(): Promise<boolean> {
    const patterns = [
      '[class*="testimonial"]',
      '[class*="review"]',
      '[class*="quote"]',
      '[class*="social-proof"]',
      '[class*="customer"]',
      'blockquote',
    ];

    for (const p of patterns) {
      if (await this.page.locator(p).count() > 0) return true;
    }
    return false;
  }

  /**
   * Returns true if the page has a FAQ or accordion section.
   */
  async hasFAQSection(): Promise<boolean> {
    const patterns = [
      '[class*="faq"]',
      '[class*="accordion"]',
      'details',
      '[class*="collapsible"]',
    ];

    for (const p of patterns) {
      if (await this.page.locator(p).count() > 0) return true;
    }
    return false;
  }
}
