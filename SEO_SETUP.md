# SEO Configuration Guide

This document explains the SEO enhancements implemented for the Sperrmüll Karte website.

## Files Added/Modified

### 1. **Enhanced Metadata** (`app/layout.tsx`)
- **Title & Description**: Improved for search engines and social media
- **Keywords**: Relevant keywords for the German waste management niche
- **Open Graph Tags**: For better sharing on social media (Facebook, LinkedIn, etc.)
- **Twitter Card Tags**: For optimized Twitter/X sharing
- **Robots Meta**: Allows indexing and following links
- **Apple Web App Meta**: For iOS home screen optimization
- **Google Site Verification**: Connected your Google Search Console

### 2. **robots.txt** (`public/robots.txt`)
- Tells search engines which parts of the site to crawl
- Disallows crawling of API routes and internal directories
- Specifies sitemap location
- Sets crawl delay to be respectful of server resources

### 3. **Sitemap** (`public/sitemap.xml`)
- XML sitemap for search engine discovery
- Currently set to daily change frequency for the main page
- Includes all important URLs with last modified dates and priority

### 4. **Web Manifest** (`public/manifest.json`)
- Defines web app metadata for PWAs (Progressive Web Apps)
- Enables installation as an app on mobile devices
- Specifies app icons, theme colors, and display modes
- Includes app shortcuts for quick access

### 5. **Structured Data (JSON-LD)** (in `app/layout.tsx`)
- Schema.org markup for better search engine understanding
- Includes WebSite schema for the site structure
- LocalBusiness schema for your service area
- BreadcrumbList for navigation hierarchy
- Helps Google understand your content better

## Environment Variables

Add these to your `.env.local` file:

```
# Base URL of your website
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Google Analytics ID (optional but recommended)
# Get this from Google Analytics dashboard
NEXT_PUBLIC_GA_ID=G_XXXXXXXXXX

# Google AdSense (optional)
NEXT_PUBLIC_GOOGLE_ADSENSE_PUBLISHER_ID=ca-pub-xxxxxxxxxxxxxxxx
```

## Configuration Steps

### 1. Update Base URL
Replace `https://sperrmüll.local` with your actual domain in:
- `app/layout.tsx` (line with `baseUrl`)
- `public/robots.txt` (sitemap URL)
- `.env.local` (`NEXT_PUBLIC_BASE_URL`)

### 2. Submit to Search Engines

#### Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Click "URL Prefix" and enter your domain
3. Add the Google verification file (`public/google1da1a000f50dacf0.html`)
4. Submit your sitemap: `https://yourdomain.com/sitemap.xml`

#### Bing Webmaster Tools
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site
3. Submit your sitemap

#### Yandex (for Russian/Eastern European users)
1. Go to [Yandex Webmaster](https://webmaster.yandex.com/)
2. Add your site
3. Submit your sitemap

### 3. Set Up Google Analytics (Recommended)

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property for your domain
3. Get your Measurement ID (starts with `G_`)
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_ID=G_XXXXXXXXXX
   ```

### 4. Configure Open Graph Images

The metadata expects og-image.png files. Create these:
- `public/og-image.png` (1200x630px) - for general sharing
- This should be a preview image of your map/website

### 5. Create PWA Icons

For the manifest.json to work properly, add these icon files to `public/`:
- `icon-192.png` (192x192px) - standard icon
- `icon-512.png` (512x512px) - large icon
- `icon-192-maskable.png` (192x192px) - maskable icon for Android
- `icon-512-maskable.png` (512x512px) - maskable icon for Android
- `screenshot-narrow.png` (540x720px) - portrait screenshot
- `screenshot-wide.png` (1280x720px) - landscape screenshot

### 6. Update robots.txt Sitemap URL
Change the sitemap URL in `public/robots.txt` to match your actual domain.

## SEO Best Practices Implemented

✅ **Meta Tags**
- Title and description optimized for keywords
- Open Graph tags for social media
- Twitter Card for social sharing
- Viewport meta for mobile responsiveness
- Theme color and web app capable

✅ **Structured Data**
- JSON-LD schema markup
- WebSite schema
- LocalBusiness schema
- BreadcrumbList schema

✅ **Crawlability**
- robots.txt file for crawler guidance
- Sitemap.xml for URL discovery
- Canonical URL specification
- Clear site structure

✅ **Social Sharing**
- Open Graph images
- Twitter Card optimization
- Rich snippet support

✅ **Performance**
- Analytics setup ready
- Proper heading structure (in components)
- Fast page load (Next.js optimization)

✅ **Mobile**
- Responsive design
- PWA manifest
- Apple web app support
- Mobile-friendly icons

## Mobile/PWA Features

Users can now:
1. Install your site as an app on mobile devices
2. Access it offline (with service worker support)
3. Get notifications (already supported via web-push)
4. Have a home screen icon with custom theme colors

## Monitoring & Maintenance

1. **Check Google Search Console regularly**
   - Coverage issues
   - Mobile usability
   - Core Web Vitals

2. **Monitor Analytics**
   - Traffic sources
   - User behavior
   - Conversion tracking

3. **Update Sitemap**
   - Whenever you add major new features/pages
   - Keep last modified dates current

4. **Test SEO**
   - Use [Google's Rich Results Test](https://search.google.com/test/rich-results)
   - Check with [PageSpeed Insights](https://pagespeed.web.dev/)
   - Validate XML with validators

## Next Steps

1. Replace placeholder domain names with your actual domain
2. Add environment variables to `.env.local`
3. Create/add the icon files mentioned above
4. Submit to Google Search Console
5. Monitor search performance over time

## Support & Resources

- [Google Search Central](https://developers.google.com/search)
- [JSON-LD Documentation](https://json-ld.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Web Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
