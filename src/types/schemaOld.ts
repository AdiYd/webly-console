import { z } from 'zod';

// ===================================
// Utility Types
// ===================================

/**
 * Represents a Firebase Timestamp
 * Accepts Date objects, timestamp objects, numbers and ISO strings
 */
const TimestampSchema = z
  .number()
  .int('Timestamp must be an integer')
  .nonnegative('Timestamp must be non-negative')
  .default(() => Date.now())
  .describe('Timestamp in milliseconds since epoch');

/**
 * URL Schema with validation
 */
const UrlSchema = z.string().url('Must be a valid URL').describe('Valid URL');

/**
 * Hex Color Schema with validation for color codes
 */
const HexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color (e.g., #FF0000)')
  .describe('Hex color code');

// ===================================
// Onboarding Collection Schemas
// ===================================

/**
 * Payment Method Schema
 */
const PaymentMethodSchema = z
  .string()
  .min(1, 'Payment method is required')
  .describe('Payment method (e.g., card, paypal)');

/**
 * Billing Record Schema
 */
const BillingRecordSchema = z
  .object({
    date: TimestampSchema.describe('Date of the payment'),
    amount: z.number().positive('Payment amount must be positive').describe('Amount paid'),
    currency: z.enum(['ILS', 'USD']).describe('Currency of the payment'),
    status: z.enum(['paid', 'pending', 'failed']).describe('Payment status'),
  })
  .describe('Record of a billing transaction');

/**
 * Subscription Schema
 */
const SubscriptionSchema = z
  .object({
    plan: z
      .enum(['trial', 'starter', 'pro', 'master'])
      .default('trial')
      .describe('Subscription plan level'),
    status: z
      .enum(['active', 'inactive', 'pending'])
      .default('pending')
      .describe('Current status of the subscription'),
    startDate: TimestampSchema.describe('Start date of the subscription'),
    endDate: TimestampSchema.optional().describe('End date of the subscription'),
    paymentMethod: PaymentMethodSchema.describe('Payment method details'),
    billingHistory: z
      .array(BillingRecordSchema)
      .default([])
      .describe('History of billing transactions'),
  })
  .describe('Client subscription information');

/**
 * User Preferences Schema
 */
const UserPreferencesSchema = z
  .object({
    notifications: z.boolean().default(true).describe('Whether notifications are enabled'),
    language: z.enum(['en', 'he']).default('en').describe('Preferred language'),
  })
  .describe('User preferences and settings');

/**
 * Color Scheme for website themes
 */
const ColorSchemeSchema = z
  .object({
    primary: HexColorSchema.describe('Primary brand color'),
    secondary: HexColorSchema.describe('Secondary brand color'),
    accent: HexColorSchema.describe('Accent brand color'),
    background: HexColorSchema.describe('Background color'),
    card: HexColorSchema.describe('Card background color'),
    text: HexColorSchema.describe('Text color'),
    border: HexColorSchema.describe('Border color'),
  })
  .describe('Theme color scheme');

/**
 * Typography configuration for themes
 */
const TypographySchema = z
  .object({
    fontFamily: z
      .enum([
        'Rubik',
        'Poppins',
        'Alef',
        'Montserrat',
        'Roboto',
        'Quicksand',
        'Nunito',
        'Playfair Display',
        'Libre Baskerville',
        'Merriweather',
        'Dancing Script',
        'Exo 2',
        'Assistant',
        'Orbitron',
        'Rajdhani',
        'Lato',
        'Open Sans',
        'Pacifico',
        'Source Sans Pro',
        'Heebo',
        'Inter',
      ])
      .describe('Font family used throughout the website'),
  })
  .describe('Typography settings');

/**
 * Theme radius configuration
 */
const RadiusSchema = z
  .object({
    button: z
      .number()
      .int()
      .min(1, 'Button radius must be at least 1')
      .max(50, 'Button radius must be at most 50')
      .describe('Button border radius in pixels'),
    card: z
      .number()
      .int()
      .min(1, 'Card radius must be at least 1')
      .max(34, 'Card radius must be at most 34')
      .describe('Card border radius in pixels'),
  })
  .describe('Border radius settings');

/**
 * Theme configuration schema
 */
const ThemeSchema = z
  .object({
    colors: z
      .object({
        light: ColorSchemeSchema.describe('Light theme colors'),
        dark: ColorSchemeSchema.describe('Dark theme colors'),
      })
      .describe('Theme color configurations'),
    typography: TypographySchema.describe('Typography settings'),
    radius: RadiusSchema.describe('Border radius settings'),
  })
  .describe('Complete theme configuration');

/**
 * Image resource schema
 */
const ImageResourceSchema = z
  .object({
    url: UrlSchema.describe('Image URL'),
    title: z.string().describe('Alternative text for the image'),
    size: z.string().describe('Image dimensions in format width x height'),
    query: z.string().describe('Search query that led to this image'),
    source: z.string().describe('Source of the image (e.g., Unsplash, Pexels, Freepik)'),
  })
  .describe('Image resource');

/**
 * Video resource schema
 */
const VideoResourceSchema = z
  .object({
    url: UrlSchema.describe('Video URL'),
    size: z.string().describe('Video dimensions in format width x height'),
    thumbnail: UrlSchema.optional().describe('Thumbnail URL'),
    title: z.string().describe('Video title'),
    query: z.string().describe('Search query that led to this video'),
    source: z.string().describe('Source of the video (e.g., Unsplash, Pexels)'),
  })
  .describe('Video resource');

/**
 * Icon resource schema
 */
const IconResourceSchema = z
  .object({
    title: z.string().describe('Icon name'),
    iconId: z.string().describe('Icon ID (e.g., fa-solid-user, mdi:home)'),
    query: z.string().describe('Icon search query that led to this icon'),
    source: z.string().describe('Source of the icon (e.g., FontAwesome, Iconify)'),
  })
  .describe('Icon resource');

/**
 * Website section schema
 */
const SectionSchema = z
  .object({
    section_name: z
      .string()
      .max(50, 'Section name must be at most 50 characters')
      .describe('Name of the section'),
    section_description: z
      .string()
      .max(250, 'Section description must be at most 250 characters')
      .describe('Description of the section'),
  })
  .describe('Website section definition');

/**
 * Website page schema
 */
const PageSchema = z
  .object({
    page_name: z
      .string()
      .max(50, 'Page name must be at most 50 characters')
      .describe('Name of the page'),
    page_description: z
      .string()
      .max(250, 'Page description must be at most 250 characters')
      .describe('Description of the page'),
    sections: z.array(SectionSchema).default([]).describe('Sections within the page'),
  })
  .describe('Website page definition');

/**
 * Website context schema
 */
const WebsiteContextSchema = z
  .object({
    client_context_summary: z
      .string()
      .max(800, 'Client context summary must be at most 800 characters')
      .describe("Summary of the client's context and requirements"),
    query: z
      .string()
      .max(100, 'Query must be at most 100 characters')
      .describe('Search query in English only'),
    tags: z
      .array(z.string().max(25, 'Tag must be at most 25 characters'))
      .max(5, 'Maximum 5 tags allowed')
      .describe('Tags for categorization'),
    target_audience: z
      .string()
      .max(100, 'Target audience must be at most 100 characters')
      .describe('Description of the target audience'),
    goals: z.string().max(400, 'Goals must be at most 400 characters').describe('Website goals'),
    guidelines: z
      .string()
      .max(800, 'Guidelines must be at most 800 characters')
      .describe('Additional guidelines or requirements'),
  })
  .describe('Website contextual information');

/**
 * Resources for website generation
 */
const ResourcesSchema = z
  .object({
    images: z.array(ImageResourceSchema).default([]).describe('Image resources'),
    videos: z.array(VideoResourceSchema).default([]).describe('Video resources'),
    icons: z.array(IconResourceSchema).default([]).describe('Icon resources'),
  })
  .describe('Website resources');

/**
 * Design instructions schema
 */
const DesignSchema = z
  .object({
    style: z
      .enum(['modern', 'minimal', 'classic', 'elegant', 'professional', 'playful', 'futuristic'])
      .describe('Design style'),
    theme_name: z
      .string()
      .max(25, 'Theme name must be at most 25 characters')
      .describe('Name of the theme'),
    theme_icon: z
      .string()
      .max(50, 'Theme icon must be at most 50 characters')
      .describe('Iconify icon name for the theme'),
    theme: ThemeSchema.describe('Theme configuration'),
  })
  .describe('Design instructions');

/**
 * Client schema for onboarding collection (website form)
 */

const WebsiteFormSchema = z.object({
  doc_type: z.enum(['html', 'react']).default('html').describe('Document type'),
  ai_model: z.enum(['gemini', 'gpt', 'anthropic']).default('anthropic').describe('AI model'),
  website_language: z.enum(['en', 'he']).default('en').describe('Website language'),
  website_name: z
    .string()
    .max(100, 'Website name must be at most 100 characters')
    .default('')
    .describe('Website name'),
  website_description: z
    .string()
    .max(1500, 'Website description must be at most 1500 characters')
    .default('')
    .describe('Website description'),
  website_pages: z
    .record(
      z.string(),
      z.string().transform(val => val.trim().slice(0, 500))
    )
    .describe('Website pages name and content description'),
  website_images: z.array(UrlSchema).default([]).describe('Website images URLs'),
  website_logo: z.array(UrlSchema).default([]).describe('Website logo URL'),
  website_style: z.string().optional().describe('Website style'),
  website_colors: z
    .record(z.string(), z.string().max(7, 'Hex color must be 7 characters long'))
    .default({})
    .describe('Website hex colors'),
  website_radius: z
    .record(z.string(), z.number().min(0).max(50))
    .default({})
    .describe('Website border radius values'),
  demo: z.boolean().default(false).describe('Demo mode'),
});

/**
 * Website instructions schema
 */
export const WebsiteInstructionsSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Website name is required')
      .max(50, 'Website name must be at most 50 characters')
      .refine(val => val.split(/\s+/).length <= 5, {
        message: 'Website name must not exceed 5 words',
      })
      .describe('Website name'),
    language: z.enum(['en', 'he']).describe('Website language'),
    description: z
      .string()
      .min(300, 'Description must be at least 300 characters')
      .max(800, 'Description must be at most 800 characters')
      .describe('Website description'),
    type: z
      .enum([
        'Blog',
        'Portfolio',
        'SaaS',
        'E-commerce',
        'Corporate',
        'Community',
        'Information',
        'Educational',
        'Event',
        'Personal',
        'Business',
        'Personal Brand',
        'Landing Page',
        'Entertainment',
        'Non-profit',
        'Technology',
        'other',
      ])
      .describe('Website type'),
    design: DesignSchema.describe('Design instructions'),
    context: WebsiteContextSchema.describe('Website context'),
    pages: z.array(PageSchema).min(1, 'At least one page is required').describe('Website pages'),
    resources: ResourcesSchema.describe('Resources for website generation'),
  })
  .describe('Website generation instructions');

/**
 * Website schema for onboarding collection
 */
export const OnboardingWebsiteSchema = z
  .object({
    website_id: z.string().describe('Website ID (same as document ID)'),
    client_id: z.string().describe('Client ID (same as user ID)'),
    client_form: WebsiteFormSchema.describe('Client form data for website generation'),
    assistant_instructions: WebsiteInstructionsSchema.describe('Website generation instructions'),
    status: z
      .enum(['draft', 'development', 'published'])
      .default('draft')
      .describe('Current status of the website'),
    createdAt: TimestampSchema.describe('Creation timestamp'),
  })
  .describe('Website in onboarding collection');

const sectionSchema = z.object({
  html: z
    .string()
    .describe('HTML content of the section. Must be wrapped in <section> tags with id attribute.'),
  js: z.string().describe('JavaScript code for the section. Must be wrapped in <script> tags.'),
  css: z
    .string()
    .optional()
    .describe('Optional CSS styles for the section. Must be wrapped in <style> tags.'),
});

export const webPageSchema = z
  .object({
    page_name: z.string().describe('Name of the page.'),
    page_description: z.string().describe('Description of the page.'),
    sections: z
      .array(
        z.object({
          section_name: z.string().describe('Name of the section.'),
          section_description: z.string().describe('Description of the section.'),
          src: sectionSchema,
          id: z.string().describe('ID of the section.'),
          AI: z
            .object({
              provider: z
                .string()
                .optional()
                .describe('AI provider used for generation (e.g., "anthropic", "openai").'),
              model: z
                .string()
                .optional()
                .describe('AI model used for generation (e.g., "claude-3-7", "gpt-4.1").'),
              temperature: z.number().optional().describe('Temperature setting for AI generation.'),
            })
            .default({}),
          used_assets: z
            .array(z.string())
            .default([])
            .describe('An array of asset IDs or URLs used in the section.'),
        })
      )
      .describe(
        'An array of sections, each containing id, src files (html, js, css), AI and used_assets.'
      ),
  })
  .describe('A web page object containing name, description and sections.');

/**
 * Client schema for onboarding collection
 */
export const OnboardingClientSchema = z
  .object({
    userId: z.string().describe('User ID (same as client ID)'),
    email: z
      .string()
      .email('Invalid email address')
      .transform(val => val.toLowerCase().trim().slice(0, 100))
      .describe("Client's email address"),
    displayName: z
      .string()
      .transform(val => val.slice(0, 30).trim())
      .describe("Client's full name"),
    profilePicture: UrlSchema.optional().describe('URL to profile image'),
    subscription: SubscriptionSchema.describe('Subscription details'),
    createdAt: TimestampSchema.describe('Account creation date'),
    updatedAt: TimestampSchema.describe('Last account update'),
    lastLogin: TimestampSchema.describe('Last login time'),
    preferences: UserPreferencesSchema.default({}).describe('User preferences and settings'),
    coupon: z
      .string()
      .transform(val => val.slice(0, 30).trim())
      .optional()
      .describe('Unique coupon code if used'),
  })
  .describe('Client in onboarding collection');

// ===================================
// Development Collection Schemas
// ===================================

/**
 * Global assets schema for shared resources
 */
const GlobalAssetsSchema = z.record(UrlSchema).describe('Shared global assets');

/**
 * Brand kit schema
 */
const BrandKitSchema = z
  .object({
    name: z.string().describe('Brand kit name'),
    colors: z.array(HexColorSchema).describe('Brand colors'),
    fonts: z.array(z.string()).describe('Brand fonts'),
    logos: z.record(UrlSchema).optional().describe('Brand logos'),
  })
  .describe('Brand style kit');

/**
 * Site metadata schema
 */
const SiteMetadataSchema = z
  .object({
    title: z.string().describe('Website title'),
    description: z.string().describe('SEO description'),
    keywords: z.array(z.string()).describe('SEO keywords'),
    favicon: UrlSchema.optional().describe('Favicon URL'),
    siteUrl: z.string().optional().describe('Planned URL'),
  })
  .describe('Website metadata');

/**
 * Asset with dimensions schema
 */
const AssetWithDimensionsSchema = z
  .object({
    url: UrlSchema.describe('Asset URL'),
    alt: z.string().optional().describe('Alternative text'),
    dimensions: z
      .object({
        width: z.number().int().positive(),
        height: z.number().int().positive(),
      })
      .optional()
      .describe('Asset dimensions'),
  })
  .describe('Asset with dimensions');

/**
 * Video asset schema
 */
const VideoAssetSchema = z
  .object({
    url: UrlSchema.describe('Video URL'),
    thumbnail: UrlSchema.optional().describe('Video thumbnail URL'),
    duration: z.number().nonnegative().optional().describe('Video duration in seconds'),
  })
  .describe('Video asset');

/**
 * Document asset schema
 */
const DocumentAssetSchema = z
  .object({
    url: UrlSchema.describe('Document URL'),
    name: z.string().describe('Document name'),
    size: z.number().positive().optional().describe('Document size in bytes'),
    type: z.string().optional().describe('Document MIME type'),
  })
  .describe('Document asset');

/**
 * Assets schema
 */
const AssetsSchema = z
  .object({
    images: z.record(AssetWithDimensionsSchema).default({}).describe('Image assets by ID'),
    videos: z.record(VideoAssetSchema).default({}).describe('Video assets by ID'),
    documents: z.record(DocumentAssetSchema).default({}).describe('Document assets by ID'),
  })
  .describe('Website media resources');

/**
 * Professional text schema
 */
const ProfessionalTextSchema = z.record(z.string()).describe('Curated professional content');

/**
 * Context schema
 */
const ContextSchema = z
  .object({
    professionalText: ProfessionalTextSchema.default({}).describe('Curated content'),
    designGuidelines: z.array(z.string()).default([]).describe('Design rules'),
    tags: z.array(z.string()).default([]).describe('Categorization tags'),
    seoQueries: z.array(z.string()).default([]).describe('Search optimization queries'),
    promptHistory: z.array(z.string()).default([]).describe('AI prompt history'),
  })
  .describe('Website context information');

/**
 * Development theme schema
 */
const DevelopmentThemeSchema = z
  .object({
    id: z.string().describe('Theme identifier'),
    name: z.string().describe('Theme name'),
    colors: z.record(z.any()).default({}).describe('Color scheme'),
    typography: z.record(z.any()).default({}).describe('Font settings'),
    spacing: z.record(z.any()).default({}).describe('Layout spacing'),
    components: z.record(z.any()).default({}).describe('Component styles'),
    createdAt: TimestampSchema.describe('Creation timestamp'),
    updatedAt: TimestampSchema.describe('Last update timestamp'),
  })
  .describe('Theme configuration');

/**
 * Section schema for development
 */
const DevelopmentSectionSchema = z
  .object({
    name: z.string().describe('Section name'),
    description: z.string().describe('Section purpose'),
    data: z.string().describe('HTML content'),
    order: z.number().int().nonnegative().describe('Display order'),
    settings: z.record(z.any()).default({}).describe('Section-specific settings'),
    createdAt: TimestampSchema.describe('Creation timestamp'),
    updatedAt: TimestampSchema.describe('Last update timestamp'),
  })
  .describe('Page section');

/**
 * Page schema for development
 */
const DevelopmentPageSchema = z
  .object({
    title: z.string().describe('Page title'),
    slug: z.string().describe('URL path'),
    sections: z.record(DevelopmentSectionSchema).default({}).describe('Page sections'),
  })
  .describe('Website page');

/**
 * Header schema
 */
const HeaderSchema = z
  .object({
    type: z.string().describe('Header type'),
    logo: UrlSchema.optional().describe('Logo URL'),
    menuItems: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
          submenu: z
            .array(
              z.object({
                label: z.string(),
                url: z.string(),
              })
            )
            .optional(),
        })
      )
      .default([])
      .describe('Navigation items'),
  })
  .describe('Navigation structure');

/**
 * Footer column schema
 */
const FooterColumnSchema = z
  .object({
    title: z.string().optional().describe('Column title'),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        })
      )
      .optional(),
    content: z.string().optional().describe('Text content'),
  })
  .describe('Footer column');

/**
 * Footer schema
 */
const FooterSchema = z
  .object({
    columns: z.array(FooterColumnSchema).default([]).describe('Footer columns'),
    copyright: z.string().optional().describe('Copyright text'),
    socialLinks: z
      .array(
        z.object({
          platform: z.string(),
          url: z.string(),
        })
      )
      .default([])
      .describe('Social media links'),
  })
  .describe('Footer structure');

/**
 * Layout schema
 */
const LayoutSchema = z
  .object({
    header: HeaderSchema.default({
      type: 'standard',
      menuItems: [],
    }).describe('Navigation structure'),
    footer: FooterSchema.default({
      columns: [],
      socialLinks: [],
    }).describe('Footer structure'),
  })
  .describe('Global layout elements');

/**
 * Token schema
 */
const TokenSchema = z
  .object({
    remaining: z.number().int().nonnegative().describe('Tokens remaining'),
    total: z.number().int().positive().describe('Total allocation'),
    resetDate: TimestampSchema.optional().describe('Next reset date'),
  })
  .describe('AI token allocation');

/**
 * Website schema for development collection
 */
const DevelopmentWebsiteSchema = z
  .object({
    siteMetadata: SiteMetadataSchema.default({
      title: '',
      description: '',
      keywords: [],
    }).describe('SEO and site metadata'),
    assets: AssetsSchema.default({}).describe('Website media resources'),
    context: ContextSchema.default({}).describe('Website context information'),
    theme: DevelopmentThemeSchema.describe('Theme configuration'),
    pages: z.record(DevelopmentPageSchema).default({}).describe('Website pages'),
    layout: LayoutSchema.default({}).describe('Global layout elements'),
    tokens: TokenSchema.optional().describe('AI token allocation'),
    status: z
      .enum(['draft', 'in_development', 'ready_for_review'])
      .default('draft')
      .describe('Development status'),
    lastEdited: TimestampSchema.describe('Last edit timestamp'),
    lastEditor: z.string().describe("Last editor's ID"),
    version: z.number().int().nonnegative().default(1).describe('Development version'),
  })
  .describe('Website in development collection');

/**
 * Snapshot schema for development
 */
const DevelopmentSnapshotSchema = z
  .object({
    timestamp: TimestampSchema.describe('When snapshot was created'),
    creator: z.string().describe('Who created the snapshot'),
    description: z.string().describe('Snapshot description'),
    data: z.record(z.any()).describe('Complete site data at snapshot time'),
    type: z.enum(['auto', 'manual']).default('manual').describe('Snapshot type'),
  })
  .describe('Development snapshot');

/**
 * Client schema for development collection
 */
const DevelopmentClientSchema = z
  .object({
    activeWebsites: z.array(z.string()).default([]).describe('List of active website IDs'),
    totalWebsites: z.number().int().nonnegative().default(0).describe("Count of client's websites"),
    sharedResources: z
      .object({
        globalAssets: GlobalAssetsSchema.default({}).describe('Shared assets'),
        brandKits: z.array(BrandKitSchema).default([]).describe('Brand style kits'),
      })
      .default({
        globalAssets: {},
        brandKits: [],
      })
      .describe('Resources shared across sites'),
    aiTokensUsed: z.number().int().nonnegative().default(0).describe('Total AI tokens consumed'),
    createdAt: TimestampSchema.describe('Creation timestamp'),
    updatedAt: TimestampSchema.describe('Last update timestamp'),
  })
  .describe('Client in development collection');

// ===================================
// Published Collection Schemas
// ===================================

/**
 * Domain settings schema
 */
const DomainSettingsSchema = z
  .object({
    customDomains: z.array(z.string()).default([]).describe("Client's custom domains"),
    subdomains: z.array(z.string()).default([]).describe('Webly subdomains'),
  })
  .describe('Domain configurations');

/**
 * Analytics overview schema
 */
const AnalyticsOverviewSchema = z.record(z.any()).describe('High-level analytics');

/**
 * Published site metadata schema
 */
const PublishedSiteMetadataSchema = z
  .object({
    title: z.string().describe('Website title'),
    description: z.string().describe('SEO description'),
    ogImage: UrlSchema.optional().describe('Open Graph image URL'),
    canonicalUrl: z.string().optional().describe('Canonical URL'),
  })
  .describe('SEO and site metadata');

/**
 * Page meta schema
 */
const PageMetaSchema = z
  .object({
    description: z.string().optional().describe('Page description'),
    lastPublished: TimestampSchema.describe('Last publish time'),
  })
  .describe('Page-specific metadata');

/**
 * Published page schema
 */
const PublishedPageSchema = z
  .object({
    title: z.string().describe('Page title'),
    slug: z.string().describe('URL path'),
    content: z.string().describe('Complete HTML with layout'),
    meta: PageMetaSchema.default({}).describe('Page-specific metadata'),
  })
  .describe('Published page');

/**
 * Image sizes schema
 */
const ImageSizesSchema = z
  .object({
    thumbnail: UrlSchema.optional().describe('Thumbnail URL'),
    medium: UrlSchema.optional().describe('Medium-sized image URL'),
    large: UrlSchema.optional().describe('Large-sized image URL'),
  })
  .describe('Image in multiple sizes');

/**
 * Published image asset schema
 */
const PublishedImageAssetSchema = z
  .object({
    url: UrlSchema.describe('Original image URL'),
    sizes: ImageSizesSchema.optional().describe('Optimized image sizes'),
  })
  .describe('Published image asset');

/**
 * Published assets schema
 */
const PublishedAssetsSchema = z
  .object({
    images: z.record(PublishedImageAssetSchema).default({}).describe('Production image assets'),
    // Could add videos, documents, etc.
  })
  .describe('Production assets with optimized URLs');

/**
 * Compiled theme schema
 */
const CompiledThemeSchema = z
  .object({
    css: UrlSchema.describe('Compiled CSS URL'),
    js: UrlSchema.optional().describe('Compiled JS URL'),
  })
  .describe('Compiled theme assets');

/**
 * Published theme schema
 */
const PublishedThemeSchema = z
  .object({
    id: z.string().describe('Theme identifier'),
    compiled: CompiledThemeSchema.describe('Compiled theme assets'),
  })
  .describe('Finalized theme settings');

/**
 * Sitemap URL schema
 */
const SitemapUrlSchema = z
  .object({
    url: z.string().describe('Page URL'),
    priority: z.number().min(0).max(1).describe('SEO priority'),
    lastmod: z.string().optional().describe('Last modified date'),
    changefreq: z
      .enum(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'])
      .optional()
      .describe('Change frequency'),
  })
  .describe('Sitemap URL entry');

/**
 * Sitemap schema
 */
const SitemapSchema = z
  .object({
    xml: UrlSchema.optional().describe('Sitemap XML URL'),
    structure: z.array(SitemapUrlSchema).default([]).describe('Sitemap structure'),
  })
  .describe('Site structure and navigation');

/**
 * Page analytics schema
 */
const PageAnalyticsSchema = z
  .record(z.number().int().nonnegative())
  .describe('Page-specific analytics');

/**
 * Website analytics schema
 */
const WebsiteAnalyticsSchema = z
  .object({
    pageViews: PageAnalyticsSchema.default({}).describe('Page view counts'),
    topReferrers: z.array(z.string()).default([]).describe('Top referring sites'),
    // Could add more analytics metrics
  })
  .describe('Website analytics data');

/**
 * Published website schema
 */
const PublishedWebsiteSchema = z
  .object({
    siteMetadata: PublishedSiteMetadataSchema.describe('SEO and site metadata'),
    pages: z.record(PublishedPageSchema).default({}).describe('Complete pages with compiled HTML'),
    assets: PublishedAssetsSchema.default({}).describe('Production assets with optimized URLs'),
    theme: PublishedThemeSchema.describe('Finalized theme settings'),
    siteMap: SitemapSchema.default({
      structure: [],
    }).describe('Site structure and navigation'),
    analytics: WebsiteAnalyticsSchema.default({}).describe('Page-specific analytics'),
    publishDate: TimestampSchema.describe('Initial publish date'),
    lastPublished: TimestampSchema.describe('Last publish date'),
    publishedBy: z.string().describe("Publisher's ID"),
    version: z.number().int().positive().default(1).describe('Published version'),
  })
  .describe('Published website');

/**
 * Published snapshot schema
 */
const PublishedSnapshotSchema = z
  .object({
    timestamp: TimestampSchema.describe('When published'),
    publisher: z.string().describe('Who published'),
    notes: z.string().optional().describe('Publishing notes'),
    data: z.record(z.any()).describe('Complete published site data'),
  })
  .describe('Published snapshot');

/**
 * Client schema for published collection
 */
const PublishedClientSchema = z
  .object({
    publishedSites: z.number().int().nonnegative().default(0).describe('Count of published sites'),
    domainSettings: DomainSettingsSchema.default({
      customDomains: [],
      subdomains: [],
    }).describe('Domain configurations'),
    analytics: AnalyticsOverviewSchema.default({}).describe('High-level analytics'),
    createdAt: TimestampSchema.describe('Creation timestamp'),
    updatedAt: TimestampSchema.describe('Last update timestamp'),
  })
  .describe('Client in published collection');

// ===================================
// Export schemas and types
// ===================================

// Onboarding exports
export const onboardingSchemas = {
  client: OnboardingClientSchema,
  website: OnboardingWebsiteSchema,
};

export type daisyThemeName =
  | 'webly-light'
  | 'webly-dark'
  | 'light'
  | 'dark'
  | 'night'
  | 'cupcake'
  | 'bumblebee'
  | 'emerald'
  | 'corporate'
  | 'synthwave'
  | 'retro'
  | 'cyberpunk'
  | 'valentine'
  | 'halloween'
  | 'garden'
  | 'forest'
  | 'aqua'
  | 'lofi'
  | 'pastel'
  | 'lemonade'
  | 'nord'
  | 'sunset'
  | 'fantasy'
  | 'wireframe'
  | 'black'
  | 'luxury'
  | 'dracula'
  | 'webly-light'
  | 'webly-dark';

export type WebsiteTheme = z.infer<typeof ThemeSchema>;
export type WebsiteInstructions = z.infer<typeof WebsiteInstructionsSchema>;
export type OnboardingClient = z.infer<typeof OnboardingClientSchema>;
export type OnboardingWebsite = z.infer<typeof OnboardingWebsiteSchema>;
export type WebsitePage = z.infer<typeof webPageSchema>;
// Development exports
export const developmentSchemas = {
  client: DevelopmentClientSchema,
  website: DevelopmentWebsiteSchema,
  snapshot: DevelopmentSnapshotSchema,
};

export type DevelopmentClient = z.infer<typeof DevelopmentClientSchema>;
export type DevelopmentWebsite = z.infer<typeof DevelopmentWebsiteSchema>;
export type DevelopmentSnapshot = z.infer<typeof DevelopmentSnapshotSchema>;

// Published exports
export const publishedSchemas = {
  client: PublishedClientSchema,
  website: PublishedWebsiteSchema,
  snapshot: PublishedSnapshotSchema,
};

export type PublishedClient = z.infer<typeof PublishedClientSchema>;
export type PublishedWebsite = z.infer<typeof PublishedWebsiteSchema>;
export type PublishedSnapshot = z.infer<typeof PublishedSnapshotSchema>;

// Common types
export type Timestamp = z.infer<typeof TimestampSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type ColorScheme = z.infer<typeof ColorSchemeSchema>;
