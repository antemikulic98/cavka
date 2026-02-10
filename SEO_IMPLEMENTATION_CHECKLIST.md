# ✅ SEO IMPLEMENTACIJSKI CHECKLIST

## Family Rent a Car Croatia - Post-Launch Guide

---

## 🎯 ODMAH NAKON DEPLOYA (Dan 1)

### 1. Google Search Console Setup ⚡ KRITIČNO
```
□ Idi na: https://search.google.com/search-console
□ Dodaj property: https://hit-rent.com
□ Verificiraj ownership (meta tag ili DNS)
□ Submit sitemap: https://hit-rent.com/sitemap.xml
□ Provjeriti coverage report
```

**Verification Meta Tag (dodaj u layout.tsx ako ga nemaš):**
```tsx
<meta name="google-site-verification" content="YOUR_CODE_HERE" />
```

---

### 2. Google Analytics 4 Setup ⚡ KRITIČNO
```
□ Kreiraj GA4 property
□ Dobij Measurement ID (G-XXXXXXXXXX)
□ Dodaj tracking code u layout
□ Test tracking
□ Postavi konverzijske ciljeve
```

**GA4 Code (dodaj u <head>):**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

### 3. Google My Business Profile ⚡ KRITIČNO
```
□ Idi na: https://www.google.com/business
□ Create business listing
□ Add all locations:
  - Zagreb (Main Office)
  - Split Airport
  - Dubrovnik Airport
□ Upload fotografija (min. 10)
□ Add business hours (24/7)
□ Add phone & email
□ Request reviews link
```

**Kategorije:**
- Primary: Car Rental Agency
- Secondary: Car Leasing Service, Airport Shuttle Service

---

## 📅 FIRST WEEK (Dan 1-7)

### 4. Schema Validation Testing
```
□ Test schemas: https://validator.schema.org
□ Google Rich Results Test: https://search.google.com/test/rich-results
□ Provjeri sve JSON-LD blokove
□ Fix any errors
```

**Pages to test:**
- Homepage (/)
- Browse cars (/browse-cars)
- FAQ sekcija

---

### 5. Page Speed Optimization Check
```
□ Test: https://pagespeed.web.dev
□ Cilj: Score > 90 (mobile & desktop)
□ Check Core Web Vitals:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
□ Fix any issues
```

---

### 6. Mobile Optimization Test
```
□ Test: https://search.google.com/test/mobile-friendly
□ Provjeri sve stranice
□ Test na realnim uređajima:
  - iPhone
  - Android
  - Tablet
```

---

### 7. Set Up Bing Webmaster Tools
```
□ Idi na: https://www.bing.com/webmasters
□ Add site
□ Submit sitemap
□ Import from Google Search Console (brže)
```

---

## 📊 SECOND WEEK (Dan 8-14)

### 8. Create Location Landing Pages
Kreiraj 3 location-specific stranice:

**A) /zagreb**
```tsx
export const metadata = {
  title: "Car Rental Zagreb | Family Rent a Car - Airport & City",
  description: "Rent a car in Zagreb with Family Rent a Car. Airport pickup, competitive prices, quality vehicles. Book your Zagreb car rental online!",
};

// Sadržaj:
- H1: "Car Rental Zagreb - Family Rent a Car"
- LocalBusiness Schema (Zagreb specific)
- Mapa s lokacijom
- Testimonials
- Featured vehicles available in Zagreb
- Unique content (500+ words)
```

**B) /split**
Similar struktura, Split-specific content

**C) /dubrovnik**
Similar struktura, Dubrovnik-specific content

---

### 9. Collect & Display Reviews
```
□ Email prošlim klijentima za reviews
□ Setup Trustpilot ili Google Reviews widget
□ Add review schema na homepage
□ Cilj: 20+ reviews u prvom mjesecu
```

**Review Schema Example:**
```json
{
  "@type": "Review",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5"
  },
  "reviewBody": "Excellent service..."
}
```

---

### 10. Internal Linking Strategy
```
□ Homepage → Location pages
□ Location pages → Browse cars
□ FAQ → Booking page
□ Footer links provjeriti
□ Broken links check
```

**Tool:**
- https://ahrefs.com/broken-link-checker (free)

---

## 📝 THIRD WEEK (Dan 15-21)

### 11. Create First Blog Posts
Piši SEO-optimizirane članke:

**Post 1:** "Top 10 Road Trips in Croatia"
- Keywords: croatia road trip, driving croatia coast
- Length: 1500+ words
- Internal links: vehicles, locations
- CTA: Book your car

**Post 2:** "Driving in Croatia: Complete Guide for Tourists"
- Keywords: driving rules croatia, rent car croatia tips
- Length: 1200+ words
- FAQ schema

**Post 3:** "Zagreb to Dubrovnik: Ultimate Road Trip Itinerary"
- Keywords: zagreb dubrovnik drive, croatia coastal drive
- Length: 1800+ words
- Itinerary schema

---

### 12. Social Media Setup
```
□ Update Facebook page
  - New cover photo (branded)
  - Add "Family Rent a Car" name
  - Update About section
  - Add website link

□ Update Instagram
  - Bio: "Family Rent a Car Croatia 🚗"
  - Link to website
  - Story highlights

□ Create LinkedIn company page

□ Update all social links in schema
```

---

### 13. Backlink Building START
```
□ Submit to directories:
  - Google My Business ✅
  - Yelp
  - TripAdvisor
  - Booking.com (if applicable)
  - Croatian tourism directories

□ Partner websites:
  - Local hotels
  - Tourism agencies
  - Travel blogs
```

---

## 📈 FOURTH WEEK (Dan 22-30)

### 14. Monitor First Rankings
```
□ Setup rank tracking:
  - Google Search Console (free)
  - Ahrefs/SEMrush (paid)

□ Track primary keywords:
  1. family rent a car croatia
  2. rent a car croatia
  3. rent a car zagreb
  4. rent a car split
  5. rent a car dubrovnik

□ Weekly ranking report
```

---

### 15. Analyze Traffic Sources
```
□ Google Analytics 4:
  - Top pages
  - Traffic sources
  - User behavior
  - Bounce rate
  - Conversion rate

□ Goals to track:
  - Booking form submissions
  - Phone calls
  - Email clicks
  - Search interactions
```

---

### 16. Competitor Analysis
```
□ Identify top 5 competitors
□ Analyze their:
  - Keywords
  - Content strategy
  - Backlinks
  - Social presence

□ Find gaps & opportunities
```

**Tools:**
- Ahrefs Site Explorer
- SEMrush Domain Overview
- Similar Web

---

## 🔧 ONGOING MAINTENANCE (Mjesečno)

### Monthly SEO Checklist:

#### Week 1 of Month:
```
□ Full SEO audit
□ Check Search Console errors
□ Update broken links
□ Review keyword rankings
□ Analyze competitor changes
```

#### Week 2 of Month:
```
□ Publish 2 new blog posts
□ Update old content (if needed)
□ Add new FAQs (based on customer questions)
□ Collect new reviews
```

#### Week 3 of Month:
```
□ Build 5+ quality backlinks
□ Reach out to partners
□ Guest posting opportunities
□ Social media updates
```

#### Week 4 of Month:
```
□ Performance review
□ Generate monthly report:
  - Traffic growth
  - Ranking improvements
  - Conversions
  - ROI calculation
□ Plan next month strategy
```

---

## 🎯 KEY PERFORMANCE INDICATORS (KPIs)

### Track Monthly:

**Traffic Metrics:**
- Organic sessions: ____
- Total pageviews: ____
- Avg. session duration: ____
- Bounce rate: ____%

**Ranking Metrics:**
- Keywords in top 10: ____
- Keywords in top 20: ____
- Featured snippets: ____
- Average position: ____

**Conversion Metrics:**
- Form submissions: ____
- Phone calls: ____
- Email inquiries: ____
- Conversion rate: ____%

**Technical Metrics:**
- Page speed score: ____/100
- Core Web Vitals: PASS/FAIL
- Indexed pages: ____
- Crawl errors: ____

---

## ⚠️ COMMON MISTAKES TO AVOID

### ❌ DON'T:
1. Keyword stuff
2. Copy competitor content
3. Buy backlinks
4. Ignore mobile users
5. Forget to update sitemap
6. Ignore Search Console warnings
7. Neglect page speed
8. Use duplicate meta descriptions

### ✅ DO:
1. Write for users first, search engines second
2. Update content regularly
3. Build quality backlinks
4. Mobile-first approach
5. Monitor Core Web Vitals
6. Fix technical errors quickly
7. Test everything
8. Be patient (SEO takes time)

---

## 📞 TOOLS YOU NEED

### Free Tools:
- ✅ Google Search Console
- ✅ Google Analytics 4
- ✅ Google My Business
- ✅ Bing Webmaster Tools
- ✅ Schema Validator
- ✅ PageSpeed Insights
- ✅ Mobile-Friendly Test

### Recommended Paid Tools:
- Ahrefs ($99/month) - Best for backlinks & keywords
- SEMrush ($119/month) - All-in-one SEO suite
- Screaming Frog ($149/year) - Technical SEO audit

### Optional:
- Hotjar - User behavior tracking
- Crazy Egg - Heatmaps
- Moz Pro - Rank tracking

---

## 🏆 SUCCESS MILESTONES

### Month 1:
- [ ] 100% of pages indexed
- [ ] 10+ keywords tracked
- [ ] 5+ quality backlinks
- [ ] Google My Business verified

### Month 3:
- [ ] Top 10 for branded keyword
- [ ] 50% traffic increase
- [ ] 20+ backlinks
- [ ] 10+ blog posts published

### Month 6:
- [ ] Top 5 for 5+ keywords
- [ ] 100% traffic increase
- [ ] 50+ backlinks
- [ ] Featured snippets achieved

### Month 12:
- [ ] #1 for branded keywords
- [ ] 200% traffic increase
- [ ] 100+ backlinks
- [ ] Authority in niche established

---

## 📧 AUTOMATION SETUP

### Email Alerts:
```
□ Search Console alerts (crawl errors)
□ Analytics alerts (traffic drops)
□ Ranking alerts (position changes)
□ Backlink alerts (new/lost links)
```

### Weekly Reports:
```
□ Traffic overview
□ Top performing pages
□ Keyword ranking changes
□ Technical issues
```

### Monthly Reports:
```
□ Executive summary
□ Goal completion
□ ROI calculation
□ Next month action plan
```

---

## 🎓 LEARNING RESOURCES

### Must-Read Blogs:
- Google Search Central Blog
- Moz Blog
- Ahrefs Blog
- Search Engine Journal

### Follow on Twitter:
- @rustybrick (Barry Schwartz)
- @dannysullivan (Google)
- @JohnMu (Google)
- @aleyda (Aleyda Solis)

---

**Last Updated:** 10. veljače 2026.
**Status:** ✅ Ready for Implementation
**Priority:** HIGH - Start Day 1 activities immediately after deploy!

---

## ✨ FINAL NOTES

SEO je **marathon, ne sprint**. Results won't be instant, ali s ovim planom i dosljednim radom, očekujte:

- **30 dana:** Prve vidljive rezultate
- **90 dana:** Značajan traffic growth
- **6 mjeseci:** Dominacija u local search
- **12 mjeseci:** Industry authority

**Ostani discipliniran, prati metrike, i prilagođavaj strategiju!** 🚀

Sretno! 🍀
