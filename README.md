# Anjali & Adarsh — Bride's Invitation

A separate, blush-garden themed wedding invitation from the **bride's family's perspective**.  
Completely different look from the [groom-side invitation](https://ibm-adarsh.github.io/wedding-invitation/).

## Live site

After deploy: **https://ibm-adarsh.github.io/wedding-invitation-bride/**

Update `SITE_URL` in `site-url.js` if your GitHub username or repo name differs.

## What's different from the groom site

| | Groom site | Bride site |
|---|------------|------------|
| Theme | Royal maroon & gold | Peacock & jasmine (animated) |
| Perspective | Groom's family | Bride's family |
| Haldi | 26 June | Combined with Mehndi on **27 June** |
| Mehndi | 27 June | Same day as Haldi |
| Pooja / Haldi / Mehndi venue | Home address shown | **No home address** — dates & times only |
| Wedding venue | Laxmi Narayan Vatika | Same (shared in `wedding-data.js`) |

## Shared data

Couple names, wedding venue, and dates live in `wedding-data.js`.  
Keep this file in sync with `wedding-invitation/wedding-data.js` when details change.

## RSVP contact

Set the bride's family WhatsApp/call number in `site-url.js`:

```javascript
window.SITE_CONFIG = {
  familyPhone: '91XXXXXXXXXX',       // digits only, country code included
  familyPhoneDisplay: '+91 XXXXX XXXXX',
  friendsNote: [
    { name: 'Contact Name', phone: '+91 XXXXX XXXXX' }
  ]
};
```

Until `familyPhone` is set, RSVP shows a message to contact the bride's family directly.

## Local preview

```bash
chmod +x start.sh
./start.sh
```

Opens at http://localhost:8001

## Deploy

1. Create repo `wedding-invitation-bride` on GitHub
2. Push this folder
3. Enable **GitHub Pages** → Source: **GitHub Actions**
4. Push to `main` triggers deploy
