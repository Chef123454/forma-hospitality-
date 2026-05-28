const BUSINESS_DEFAULTS = {
  'Pub or bar': {
    headline: 'A warmer digital front door for <em>locals, regulars, and weekend bookings.</em>',
    intro: 'A confident pub website built around atmosphere, events, food, drinks, and easy table enquiries.',
    sections: ['Menus that sell the visit', 'Events and private hire', 'Fast mobile booking']
  },
  Restaurant: {
    headline: 'A restaurant website that makes guests <em>hungry before they arrive.</em>',
    intro: 'A refined restaurant concept built around menus, story, reservations, reviews, and the feeling of the room.',
    sections: ['Signature menu storytelling', 'Reservation-first structure', 'Private dining enquiries']
  },
  'Cafe or coffee shop': {
    headline: 'A brighter online home for <em>coffee, community, and daily visits.</em>',
    intro: 'A fresh cafe concept built around opening hours, location, menu highlights, atmosphere, and repeat local traffic.',
    sections: ['Daily essentials made clear', 'Coffee and food highlights', 'Local search foundations']
  },
  'Hotel or boutique stay': {
    headline: 'A boutique stay website designed to turn browsers <em>into direct bookings.</em>',
    intro: 'A polished accommodation concept built around rooms, location, facilities, direct booking, and trust.',
    sections: ['Rooms with clear reasons to book', 'Location and experience pages', 'Direct booking pathway']
  },
  'Luxury villa': {
    headline: 'A premium villa showcase for guests who expect <em>everything to feel considered.</em>',
    intro: 'A luxury property concept built around imagery, amenities, concierge services, staff, and high-value enquiries.',
    sections: ['High-value enquiry flow', 'Concierge-led experience', 'Premium property storytelling']
  },
  'Private chef or catering': {
    headline: 'A chef-led website that sells <em>trust, taste, and occasion.</em>',
    intro: 'A personal culinary concept built around menus, events, villa dining, testimonials, and enquiry quality.',
    sections: ['Menus and occasions', 'Chef credibility', 'Simple enquiry path']
  },
  'Event venue': {
    headline: 'A venue website built for <em>enquiries, viewings, and booked dates.</em>',
    intro: 'A venue concept built around capacity, spaces, events, galleries, packages, and lead capture.',
    sections: ['Space-led storytelling', 'Packages and use cases', 'Viewing enquiry flow']
  },
  'Yacht or marine hospitality': {
    headline: 'A sleek charter website for <em>high-value marine enquiries.</em>',
    intro: 'A marine hospitality concept built around routes, specs, crew, experiences, and confident enquiry capture.',
    sections: ['Charter-ready presentation', 'Routes and experiences', 'Crew and trust signals']
  },
  'F&B brand': {
    headline: 'A sharper digital launchpad for <em>your food and drink brand.</em>',
    intro: 'A brand-led concept built around product story, stockists, e-commerce readiness, and launch credibility.',
    sections: ['Product story', 'Stockist and sales journey', 'Brand credibility']
  }
};

const PALETTES = [
  { bg: '#171714', ink: '#fbf6ec', accent: '#c9a567' },
  { bg: '#18231f', ink: '#f7f3e9', accent: '#d8b56d' },
  { bg: '#241b18', ink: '#fff8ed', accent: '#d6a067' },
  { bg: '#121b22', ink: '#f5f7f2', accent: '#a9c4ba' }
];

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  let lead;
  try {
    lead = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid request.' });
  }

  const required = ['name', 'email', 'telephone', 'businessType'];
  const missing = required.filter((field) => !String(lead[field] || '').trim());
  if (missing.length) {
    return json(400, { error: 'Please complete all required fields.' });
  }

  const websiteData = await readWebsite(lead.website);
  const concept = await buildConcept(lead, websiteData);
  const encodedConcept = encodeConcept(concept);
  const baseUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://forma-hospitality.netlify.app';
  const previewUrl = `${baseUrl}/preview.html?concept=${encodedConcept}`;

  const emailSent = await sendEmails({ lead, concept, previewUrl });

  return json(200, {
    previewUrl,
    emailSent,
    concept
  });
};

async function buildConcept(lead, websiteData) {
  const businessName = clean(lead.businessName) || websiteData.siteName || deriveNameFromUrl(lead.website) || clean(lead.businessType);
  const defaults = BUSINESS_DEFAULTS[lead.businessType] || {
    headline: 'A clearer hospitality website for <em>better enquiries and better bookings.</em>',
    intro: 'A tailored concept built around your guests, your offer, and the moments that turn interest into action.',
    sections: ['Clear guest journey', 'Stronger brand story', 'Better enquiry flow']
  };
  const palette = PALETTES[Math.abs(hashCode(`${businessName}${lead.businessType}`)) % PALETTES.length];
  const sourceDescription = websiteData.description || clean(lead.notes);

  if (process.env.OPENAI_API_KEY) {
    const aiConcept = await createAiConcept(lead, websiteData, defaults, businessName, palette);
    if (aiConcept) return aiConcept;
  }

  return {
    businessName,
    businessType: clean(lead.businessType),
    headline: defaults.headline,
    intro: sourceDescription ? `${defaults.intro} Based on the current online presence, the draft leans into ${sourceDescription.slice(0, 180)}.` : defaults.intro,
    positioning: `For ${businessName}, the website should quickly communicate atmosphere, quality, trust, and the next step a guest should take. The first screen needs to feel polished while making booking, enquiry, or visit planning obvious.`,
    nextStep: `Forma can turn this automated direction into a finished ${clean(lead.businessType).toLowerCase()} website with proper copy, imagery, responsive build, CMS setup, and launch support.`,
    image: websiteData.image || '',
    palette,
    sections: defaults.sections.map((title) => ({
      title,
      copy: sectionCopy(title, lead.businessType, businessName)
    }))
  };
}

async function createAiConcept(lead, websiteData, defaults, businessName, palette) {
  try {
    const prompt = [
      'Create a concise hospitality website concept as JSON only.',
      `Business name: ${businessName}`,
      `Business type: ${lead.businessType}`,
      `Current website title: ${websiteData.title || ''}`,
      `Current website description: ${websiteData.description || ''}`,
      `User notes: ${lead.notes || ''}`,
      'Return keys: headline HTML with one <em> phrase, intro, positioning, nextStep, sections array of 3 objects with title and copy.'
    ].join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    const parsed = JSON.parse(String(content || '').replace(/^```json|```$/g, '').trim());
    return {
      businessName,
      businessType: clean(lead.businessType),
      headline: parsed.headline || defaults.headline,
      intro: parsed.intro || defaults.intro,
      positioning: parsed.positioning || '',
      nextStep: parsed.nextStep || '',
      image: websiteData.image || '',
      palette,
      sections: Array.isArray(parsed.sections) ? parsed.sections.slice(0, 3) : []
    };
  } catch {
    return null;
  }
}

async function readWebsite(url) {
  const normalized = normalizeUrl(url);
  if (!normalized) return {};
  try {
    const response = await fetch(normalized, {
      headers: { 'User-Agent': 'Forma Hospitality preview generator' },
      redirect: 'follow'
    });
    if (!response.ok) return {};
    const html = await response.text();
    const title = pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = meta(html, 'description') || meta(html, 'og:description');
    const siteName = meta(html, 'og:site_name');
    const image = absolutize(meta(html, 'og:image') || firstImage(html), normalized);
    return {
      title: clean(title),
      description: clean(description),
      siteName: clean(siteName),
      image
    };
  } catch {
    return {};
  }
}

async function sendEmails({ lead, concept, previewUrl }) {
  if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) return false;
  const teamEmail = process.env.TEAM_EMAIL || process.env.FROM_EMAIL;
  const subject = `Your ${concept.businessName} website concept from Forma`;
  const visitorText = `Hello ${clean(lead.name)},\n\nThank you for visiting Forma. We have prepared an initial website direction for ${concept.businessName} based on the details you shared.\n\nView your custom preview here:\n${previewUrl}\n\nThis is an automated first draft. A member of the Forma team will be in touch shortly to talk through ideas, improvements, and next steps.\n\nForma Hospitality Studio`;
  const teamText = `New Imagine Your Website lead\n\nName: ${lead.name}\nEmail: ${lead.email}\nTelephone: ${lead.telephone}\nBusiness: ${concept.businessName}\nType: ${lead.businessType}\nWebsite: ${lead.website || 'Not provided'}\nNotes: ${lead.notes || 'None'}\nPreview: ${previewUrl}`;

  const visitor = await sendResendEmail({
    to: lead.email,
    from: process.env.FROM_EMAIL,
    subject,
    text: visitorText
  });
  await sendResendEmail({
    to: teamEmail,
    from: process.env.FROM_EMAIL,
    subject: `New Forma preview lead: ${concept.businessName}`,
    text: teamText
  });
  return visitor;
}

async function sendResendEmail(message) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify(message)
    });
    return response.ok;
  } catch {
    return false;
  }
}

function sectionCopy(title, type, businessName) {
  const lower = String(type || 'hospitality business').toLowerCase();
  if (/menu/i.test(title)) return `Make food, drinks, pricing, and signature items easy to scan on mobile, with enough atmosphere to make ${businessName} feel worth visiting.`;
  if (/booking|enquiry|reservation/i.test(title)) return `Give guests a clear route from interest to action, whether that is a table booking, room enquiry, private event request, or direct call.`;
  if (/event|private/i.test(title)) return `Present private hire, events, and special occasions as premium opportunities instead of hidden extras.`;
  if (/room|property|villa/i.test(title)) return `Use structure and imagery to help guests understand the spaces, the experience, and why booking direct is worthwhile.`;
  return `Shape the ${lower} story around what guests need to trust quickly: quality, atmosphere, location, service, and the next step.`;
}

function normalizeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    return url.href;
  } catch {
    return '';
  }
}

function absolutize(value, base) {
  if (!value) return '';
  try {
    return new URL(value, base).href;
  } catch {
    return '';
  }
}

function firstImage(html) {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : '';
}

function meta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return pick(html, new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'))
    || pick(html, new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${escaped}["'][^>]*>`, 'i'));
}

function pick(value, regex) {
  const match = String(value || '').match(regex);
  return match ? match[1] : '';
}

function clean(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function deriveNameFromUrl(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) return '';
  try {
    const host = new URL(normalized).hostname.replace(/^www\./, '');
    return host.split('.')[0].replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  } catch {
    return '';
  }
}

function encodeConcept(concept) {
  return Buffer.from(JSON.stringify(concept), 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function hashCode(value) {
  return String(value).split('').reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0);
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}
