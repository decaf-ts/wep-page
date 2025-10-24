// Inject a random slogan after the copyright line in the footer
(function () {
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function findCopyrightP() {
    const footer = document.querySelector("footer");
    if (!footer) return null;
    const ps = footer.querySelectorAll("p");
    for (const p of ps) {
      const text = (p.textContent || "").trim();
      if (text.includes("© 2025 Decaf. All rights reserved.")) {
        return p;
      }
    }
    return null;
  }

  async function loadSlogans() {
    try {
      const res = await fetch("./assets/slogans.json", { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch (_) {
      return null;
    }
  }

  function flattenSlogans(json) {
    if (!json || typeof json !== "object") return [];
    const all = [];
    for (const key of Object.keys(json)) {
      const arr = Array.isArray(json[key]) ? json[key] : [];
      for (const item of arr) {
        if (item && typeof item === "object" && item.Slogan) {
          all.push(item.Slogan);
        }
      }
    }
    return all;
  }

  function insertSlogan(afterEl, slogan) {
    if (!slogan) return;
    // prevent duplicate insertion
    if (document.getElementById("decaf-slogan-banner")) return;
    const p = document.createElement("p");
    p.id = "decaf-slogan-banner";
    // Centered in the footer row on larger screens; centered full-width on mobile
    p.className = "text-gray-500 text-sm text-center w-full sm:flex-1";
    p.textContent = slogan;

    // Target the footer bottom row
    const row = document.querySelector("footer .border-t > div");
    if (row) {
      row.classList.add("w-full");
      const copyright = row.querySelector("p");
      const socials = row.lastElementChild;
      // Insert the banner after the copyright (center position between left and right)
      if (copyright && copyright.parentNode === row) {
        row.insertBefore(p, copyright.nextSibling);
      } else if (socials) {
        row.insertBefore(p, socials);
      } else {
        row.appendChild(p);
      }
      // Ensure layout aligns: left, center, right
      if (copyright) {
        copyright.classList.add("w-full", "sm:flex-1", "sm:text-left");
      }
      if (socials && socials instanceof HTMLElement) {
        socials.classList.add("w-full", "sm:flex-1");
        // make sure socials container aligns right on sm+
        socials.classList.add("flex", "justify-center", "sm:justify-end");
      }
    } else if (afterEl && afterEl.parentNode) {
      afterEl.parentNode.insertBefore(p, afterEl.nextSibling);
    } else {
      const footer = document.querySelector("footer .border-t");
      if (footer) footer.appendChild(p);
      else document.querySelector("footer")?.appendChild(p);
    }
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(async () => {
    // Prefer inserting into the footer row so it can be centered between left/right
    const footerRow = document.querySelector('footer .border-t > div');
    const anchor = footerRow || findCopyrightP();
    let json = await loadSlogans();
    let slogans = flattenSlogans(json);

    // Fallback if fetch blocked (e.g., file://) or empty
    if (!slogans.length) {
      console.warn("[banner] No slogans found; skipping banner slogan.");
      return;
    }

    if (!slogans.length) return;
    insertSlogan(anchor, pickRandom(slogans));
  });
})();
