# 🎁 Personalized Birthday Gift Website (Client-Ready & Sellable)

A premium, interactive birthday gift website built to match the aesthetic, typography, and interactive details shown in the reference designs:

1. **Curved Ribbon Filmstrip Hero** (Screenshot 1)
   - High-fashion typography: "Happy Birthday [Name]" with custom highlight color (mustard-gold `#d99b26`).
   - Looped 3D ribbon photo path featuring interactive photo frames that tilt and lift on hover/tap.
   - Date badge (e.g. `OCT 2`), personal message, heart sound trigger, and "MADE FOR YOU" branding.
2. **Scattered Polaroid Wall with Pins & Cute Tags** (Screenshot 2)
   - Realistic polaroid frames with red heart pin stickers (`❤️`).
   - Hand-written label badges with emojis (`Cutie 🥺`, `Baddie 😎`, `Pretty ✨`, `Dream Girl 💫`, `Queen 👑`, `My Love 🥰`).
   - Interactive zoom & secret note modal on click.
3. **Interactive iPhone iMessage Chat Section** (Screenshot 3)
   - Realistic iPhone bezel with Dynamic Island, time ("6:10 pm"), signal, wifi, and battery indicators.
   - Contact header: "Sweet [Name]" with profile avatar and active status.
   - Warm peach chat bubbles with heart reaction badge (`❤️`).
   - Interactive replies: type any message in the input and receive an instant sweet reply with confetti!
4. **Retro Theater / Broadway "NOW SHOWING" Countdown** (Screenshot 4)
   - Deep red vintage circus/theater curtain striped background (`#5f161c` / `#7a1d24`).
   - Golden marquee ticket ticker: `SAVE THE DATE • OCTOBER 11`.
   - Glowing marquee lights title: `✦ NOW SHOWING ✦` with cursive subtitle.
   - Mechanical retro flip clock with live countdown: `DAYS TO CURTAIN`, `HRS`, `MIN`, `SEC`.
   - `DOORS OPEN AT MIDNIGHT, IST` footer label and sparkle celebration burst button.

---

## 💼 How To Sell This Website To Different Clients

This project was built specifically with a **Multi-Client Architecture** so you can sell it to unlimited clients without rewriting code:

### 🚀 Method 1: Instant Client Link (Zero Redeploy)
1. Open the website and click the **"Customize Site"** button (top right).
2. Edit the client's name, date, photos, chat messages, and countdown target.
3. Go to the **"Sell & Export Link"** tab and click **"Copy Shareable Client Link"**.
4. Send that URL directly to your buyer! The recipient's entire custom website is encoded right in the link.

### 📁 Method 2: Standalone Deployment per Client
- Click **"Download client-config.json"** from the Studio.
- Replace `src/config/defaultConfig.js` with your buyer's config and run:
  ```bash
  npm run build
  ```
- Deploy the `dist/` folder to Vercel, Netlify, or custom domains (e.g., `happybirthdaysana.com`).

### 🎵 Background Music
- Clients can include their own favorite song by adding any direct MP3 audio link in the Customizer Studio or in `src/config/defaultConfig.js`.

---

## 🛠️ Local Development

```bash
# Run locally
npm run dev

# Build for production
npm run build
```
