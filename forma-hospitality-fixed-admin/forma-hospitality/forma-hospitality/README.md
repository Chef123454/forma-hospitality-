# FORMA — Hospitality Web Design Studio
## Setup & Deployment Guide

---

## STEP 1 — PUT THE FILES ON GITHUB

1. Go to **github.com** and create a free account if you don't have one
2. Click the **+** icon → **New repository**
3. Name it `forma-studio` (or anything you like)
4. Set it to **Private**
5. Click **Create repository**
6. Upload all these files — drag and drop into the repository page
7. Click **Commit changes**

---

## STEP 2 — DEPLOY TO NETLIFY

1. Go to **netlify.com** → Sign up free (use your GitHub account)
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** → Select your `forma-studio` repo
4. Leave all build settings blank (this is a plain HTML site)
5. Set **Publish directory** to `.` (just a dot)
6. Click **Deploy site**

Your site will be live at a URL like `https://your-site-name.netlify.app`

---

## STEP 3 — CONNECT YOUR DOMAIN (Optional)

1. In Netlify → **Domain settings** → **Add custom domain**
2. Enter your domain (e.g. `formawebdesign.com`)
3. Update your domain's nameservers to point to Netlify
4. SSL certificate is set up automatically (free)

---

## STEP 4 — SET UP THE CMS (Content Management)

This lets you edit testimonials, portfolio projects, and pricing from a nice visual editor — no code needed.

### 4a — Enable Netlify Identity
1. In your Netlify dashboard → **Site settings** → **Identity**
2. Click **Enable Identity**
3. Under **Registration** → set to **Invite only** (important!)
4. Under **Git Gateway** → click **Enable Git Gateway**

### 4b — Invite yourself as admin
1. In Netlify → **Identity** → **Invite users**
2. Enter your email address
3. Check your email and click the link to set your password

### 4c — Access the CMS
1. Go to `https://your-site.netlify.app/admin`
2. Log in with your email and password
3. You'll see the CMS dashboard

---

## USING THE CMS

Once you're logged in at `/admin` you can edit:

| Section | What you can change |
|---|---|
| **⚙️ Site Settings** | Studio name, email, clients count, availability status |
| **💬 Testimonials** | Add, edit, or remove client testimonials |
| **🖼️ Portfolio Projects** | Add new client work, upload images, add live site links |
| **💰 Pricing** | Update package prices and delivery times |

### How to add a testimonial:
1. Click **💬 Testimonials** in the left sidebar
2. Click **All Testimonials**
3. Scroll to the bottom → click **Add testimonials**
4. Fill in the quote, name, role, location
5. Click **Save** → **Publish**
6. Changes go live within 1–2 minutes

### How to add a project:
1. Click **🖼️ Portfolio Projects**
2. Click **All Projects**
3. Scroll down → click **Add projects**
4. Fill in the details and upload a screenshot
5. Save and publish

---

## CUSTOMISING THE SITE

### Change your email address
Find and replace `hello@formawebdesign.com` across all HTML files.

Or — update it once in `data/settings.json` (the JS will pick it up on pages that load CMS data).

### Change the studio name
In `data/settings.json` — change `"studio_name"` to whatever you want.
Then find/replace `FORMA.` in the HTML files for the logo.

### Change colours
In `assets/style.css` at the top, find `:root { }` and change:
- `--green: #2a6b4e` — the main accent colour
- `--bg: #fafaf7` — the main background

### Add a new page
1. Copy any existing HTML file
2. Change the `data-page="..."` attribute on `<body>` to match the new page name
3. Add a link to the nav in `assets/main.js` (in both the desktop `NAV_HTML` and mobile nav)

---

## CONTACT FORMS

Forms work automatically on Netlify — no extra setup needed.

To see submissions:
1. Netlify dashboard → **Forms**
2. Click the **contact** form
3. All submissions appear here
4. You can set up **email notifications** under Form settings

---

## NEED HELP?

- Netlify docs: **docs.netlify.com**
- Decap CMS docs: **decapcms.org/docs**
- For anything else: email the studio

---

*Built with plain HTML, CSS, and JavaScript. No frameworks, no build tools, no dependencies — just fast, clean code that works everywhere.*
