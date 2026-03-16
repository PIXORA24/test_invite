const events = {
  wedding: {
    title: "Wedding",
    video: "assets/wedding/video.mp4",
    audio: "assets/wedding/music.mp3",
    poster: "assets/wedding/bg.webp",
    calendarTitle: "Nidhishree & Gopi Chand Wedding",
    startDate: "2026-04-02T11:00:00+05:30",
    venue: "Vanitha Achuth Pai Convention Centre, Konchady, Mangaluru",
    lat: "12.908887",
    lng: "74.866511"
  },

  sangeet: {
    title: "Sangeet",
    video: "assets/sangeet/video.mp4",
    audio: "assets/sangeet/music.mp3",
    poster: "assets/sangeet/bg.webp",
    calendarTitle: "Nidhishree's Sangeet",
    startDate: "2026-03-29T18:30:00+05:30",
    venue: "Near Kadri Park, Vasanth Vihar, Mangaluru",
    lat: "12.888451",
    lng: "74.853508"
  }
};

// Change these defaults once per studio, or override them via query params.
const defaultStudioPartner = {
  enabled: true,
  name: "The Vok Signature",
  label: "Crafted by",
  url: "https://www.instagram.com/thevoksignature?igsh=MTMwMWtpOWk5a3N6dg=="
};

const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const params = new URLSearchParams(window.location.search);
const eventKey = params.get("event");
const data = events[eventKey];

if (!data) {
  window.location.replace("index.html");
  throw new Error("Invalid event key.");
}

function readParam(name) {
  const value = params.get(name);
  return value ? value.trim() : "";
}

function isSafeUrl(url) {
  return /^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/)/i.test(url);
}

function buildStudioPartner(basePartner) {
  const overrides = {
    name: readParam("studio"),
    label: readParam("studioLabel"),
    url: readParam("studioUrl")
  };

  const partner = { ...basePartner };

  Object.entries(overrides).forEach(([key, value]) => {
    if (value) {
      partner[key] = value;
    }
  });

  if (!isSafeUrl(partner.url)) {
    partner.url = basePartner.url;
  }

  return partner;
}

const studioPartner = buildStudioPartner(defaultStudioPartner);
const hasStudioPartner =
  studioPartner.enabled &&
  Boolean(studioPartner.name) &&
  Boolean(studioPartner.url);

const navDim = document.getElementById("navDim");
const video = document.getElementById("video");
const audio = document.getElementById("audio");
const overlay = document.getElementById("overlay");
const openBtn = document.getElementById("openBtn");
const mapBtn = document.getElementById("mapBtn");
const calendarBtn = document.getElementById("calendarBtn");
const actionBar = document.querySelector(".action-bar");
const studioLink = document.getElementById("studioLink");
const studioLinkLabel = document.getElementById("studioLinkLabel");
const studioLinkName = document.getElementById("studioLinkName");

openBtn.textContent = `Tap to Open ${data.title} Invite`;

video.src = data.video;
video.poster = data.poster;
video.muted = true;
video.playsInline = true;
video.loop = true;

video.addEventListener("ended", () => {
  video.currentTime = 0;
  video.play().catch(() => {});
});

audio.src = data.audio;
audio.volume = 1;
audio.loop = true;

if (hasStudioPartner) {
  studioLink.hidden = false;
  studioLink.href = studioPartner.url;
  studioLinkLabel.textContent = studioPartner.label;
  studioLinkName.textContent = studioPartner.name;
}

mapBtn.href =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  data.lat +
  "," +
  data.lng;

let soundOn = true;
let fadeInterval = null;
let navigatingAway = false;

function stopFade() {
  clearInterval(fadeInterval);
}

function fadeOutAudio() {
  stopFade();

  fadeInterval = setInterval(() => {
    if (audio.volume > 0.05) {
      audio.volume -= 0.05;
    } else {
      audio.volume = 0;
      audio.pause();
      stopFade();
    }
  }, 40);
}

function fadeInAudio() {
  if (!soundOn || navigatingAway) {
    return;
  }

  stopFade();
  audio.volume = 0;

  const playPromise = audio.paused ? audio.play() : Promise.resolve();

  playPromise
    .then(() => {
      fadeInterval = setInterval(() => {
        if (audio.volume < 0.95) {
          audio.volume += 0.05;
        } else {
          audio.volume = 1;
          stopFade();
        }
      }, 40);
    })
    .catch(() => {});
}

function navigateWithFade(url) {
  navigatingAway = true;
  navDim.classList.add("active");

  if (soundOn) {
    fadeOutAudio();
  }

  setTimeout(() => {
    window.location.href = url;
  }, 150);
}

mapBtn.addEventListener("click", (e) => {
  e.preventDefault();
  navigateWithFade(mapBtn.href);
});

calendarBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const start = new Date(data.startDate);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const formatGoogleDate = (date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const googleUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(data.calendarTitle) +
    "&dates=" + formatGoogleDate(start) + "/" + formatGoogleDate(end) +
    "&details=" + encodeURIComponent(data.title + " at " + data.venue) +
    "&location=" + encodeURIComponent(data.venue);

  navigateWithFade(googleUrl);
});

studioLink.addEventListener("click", (e) => {
  const studioUrl = studioLink.getAttribute("href");

  if (!studioUrl) {
    return;
  }

  e.preventDefault();
  navigateWithFade(studioUrl);
});

const countdown = document.createElement("div");
countdown.className = "countdown-ambient";
actionBar.after(countdown);

if (hasStudioPartner) {
  countdown.after(studioLink);
}

const eventTime = new Date(data.startDate).getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = eventTime - now;

  if (diff <= 0) {
    countdown.style.display = "none";
    clearInterval(timer);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdown.innerHTML = `
    <div><span>${days}</span><small>Days</small></div>
    <div><span>${String(hours).padStart(2, "0")}</span><small>Hours</small></div>
    <div><span>${String(minutes).padStart(2, "0")}</span><small>Minutes</small></div>
    <div><span>${String(seconds).padStart(2, "0")}</span><small>Seconds</small></div>
  `;
}

const timer = setInterval(updateCountdown, 1000);
updateCountdown();

function startInvite() {
  overlay.style.display = "none";
  video.muted = false;
  video.play().catch(() => {});
  fadeInAudio();
}

if (isIOS) {
  openBtn.addEventListener("click", startInvite, { once: true });
} else {
  overlay.style.display = "none";
  startInvite();

  setTimeout(() => {
    if (video.paused) {
      overlay.style.display = "flex";
      openBtn.addEventListener("click", startInvite, { once: true });
    }
  }, 600);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    audio.pause();
    return;
  }

  video.play().catch(() => {});

  if (soundOn && !navigatingAway) {
    fadeInAudio();
  }
});

window.addEventListener("pageshow", (event) => {
  navigatingAway = false;
  navDim.classList.remove("active");

  if (event.persisted && soundOn) {
    fadeInAudio();
  }

  video.play().catch(() => {});
});

window.addEventListener("focus", () => {
  if (navigatingAway) {
    navigatingAway = false;
    navDim.classList.remove("active");

    if (soundOn) {
      fadeInAudio();
    }
  }
});
