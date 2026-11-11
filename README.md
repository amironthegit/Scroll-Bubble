# Scroll Bubble for Obsidian

A lightweight Obsidian plugin that shows a floating tooltip bubble beside the scrollbar thumb while dragging or touching, displaying the real-time scroll progress percentage and the currently active Markdown section heading.

## Features

- **Progress & Section Heading**: Dynamically displays reading percentage along with the current heading so you never lose your place in long notes.
- **Cross-Platform**: Fully supported on Desktop (mouse drag) and Mobile (Android / iOS touch gestures).
- **Distraction-Free**: Activates strictly when dragging the scrollbar thumb. Scrolling via mouse wheel, trackpad gestures, keyboard arrow keys, or typing will not trigger the bubble.
- **RTL & LTR Aware**: Automatically detects document reading direction (right-to-left or left-to-right) and aligns the bubble along the appropriate edge.
- **Pure CSS Customization**: Styled completely via CSS custom properties and snippets without cluttering your core settings.

## Configuration (via CSS Snippet)

You can customize the appearance, dimensions, and locale formatting by creating a CSS snippet (e.g. `scroll-bubble.css`) under `.obsidian/snippets/`:

```css
body {
  --fs-bubble-gap: 10px;        /* Distance between the bubble and scrollbar edge */
  --fs-locale: "en-US";         /* Number formatting locale (e.g., "en-US", "fa-IR") */
  --fs-percent-sign: "%";       /* Percentage indicator symbol (e.g., "%" or "٪") */
  --fs-heading-max-chars: 80;   /* Maximum character length for headings before truncation */
  --fs-edge-hit: 0;             /* Extra hit-area tolerance on scrollbar edge */
}

/* Main bubble container */
.fs-bubble {
  /* Customize background, backdrop-filter, border, or padding */
}

/* Percentage display element */
.fs-pct {
  font-weight: bold;
}

/* Heading title element */
.fs-sec {
  font-size: 0.85em;
  opacity: 0.9;
}
```

## Installation

### Manual Installation

1. Download or clone this repository.
2. Create a folder named `scroll-bubble` inside your vault's plugins directory:
   `<vault>/.obsidian/plugins/scroll-bubble/`
3. Copy `main.js` and `manifest.json` into that folder.
4. Reload Obsidian, open **Settings → Community plugins**, and toggle **Scroll Bubble** on.

---

# افزونه حباب اسکرول (Scroll Bubble) برای ابسیدین

یک افزونه سبک و کاربردی برای ابسیدین که هنگام درگ کردن یا لمس اسکرول‌بار، یک حباب راهنمای شناور کنار دستگیره اسکرول نمایش می‌دهد و درصد پیشرفت متن به همراه تیتر (Heading) بخش فعلی را نشان می‌دهد.

## امکانات

- **نمایش درصد مطالعه و تیتر فعال**: نمایش آنی درصد پیمایش سند و نام عنوانی که در حال مرور آن هستید برای جلوگیری از گم‌شدن در یادداشت‌های طولانی.
- **سازگار با دسکتاپ و موبایل**: عملکرد روان با کشیدن ماوس در ویندوز/مک/لینوکس و لمس لبه در دستگاه‌های اندروید و iOS.
- **بدون مزاحمت و اجرای ناخواسته**: حباب منحصراً هنگام نگه‌داشتن و حرکت دادن نوار اسکرول نمایش داده می‌شود؛ اسکرول با چرخ ماوس، ترک‌پد یا کلیدهای جهت‌نما حباب را باز نمی‌کنند.
- **پشتیبانی کامل از زبان‌های راست‌به‌چپ (RTL)**: تشخیص خودکار جهت چیدمان یادداشت و قرارگیری خودکار حباب در سمت مناسب (راست یا چپ).
- **شخصی‌سازی سبک و ساختار با CSS**: امکان شخصی‌سازی کامل ظاهر، ابعاد و متن‌ها از طریق اسنیپت‌های CSS بدون شلوغ کردن بخش تنظیمات هسته ابسیدین.

## تنظیمات و شخصی‌سازی (از طریق CSS Snippet)

برای تنظیم فونت، فاصله و شیوه نمایش، یک فایل اسنیپت (مثلاً `scroll-bubble.css`) در مسیر `.obsidian/snippets/` بسازید و متغیرهای دلخواه را در `body` تعریف کنید:

```css
body {
  --fs-bubble-gap: 10px;        /* فاصله حباب از نوار اسکرول */
  --fs-locale: "fa-IR";         /* زبان فرمت اعداد (مانند fa-IR یا en-US) */
  --fs-percent-sign: "٪";       /* نماد درصد (مثلاً ٪ یا %) */
  --fs-heading-max-chars: 80;   /* بیشینه طول حروف تیتر قبل از کوتاه شدن با سه‌نقطه */
  --fs-edge-hit: 0;             /* پهنای محدوده حساس به کلیک در لبه صفحه */
}

/* ظاهر کانتینر اصلی حباب */
.fs-bubble {
  /* تنظیم رنگ پس‌زمینه، بلور، کادر دور و سایه */
}

/* متن درصد پیشرفت */
.fs-pct {
  font-weight: bold;
}

/* متن تیتر بخش فعال */
.fs-sec {
  font-size: 0.85em;
  opacity: 0.9;
}
```

## نحوه نصب

### نصب دستی

۱. مخزن را دانلود یا کلون کنید.
۲. پوشه‌ای به نام `scroll-bubble` در مسیر پلاگین‌های والت خود بسازید:
   `<vault>/.obsidian/plugins/scroll-bubble/`
۳. فایل‌های `main.js` و `manifest.json` را درون این پوشه قرار دهید.
۴. ابسیدین را بازخوانی کرده، به بخش **تنظیمات → Community plugins** بروید و افزونه **Scroll Bubble** را روشن کنید.