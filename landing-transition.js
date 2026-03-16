const brandTransition = document.getElementById("brandTransition");
const brandTransitionLabel = document.getElementById("brandTransitionLabel");
const brandTransitionName = document.getElementById("brandTransitionName");

if (brandTransition && brandTransitionLabel && brandTransitionName) {
  const studioLabel = document.body.dataset.studioLabel?.trim() || "Crafted by";
  const studioName = document.body.dataset.studioName?.trim() || "Studio Name";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let transitionLocked = false;

  brandTransitionLabel.textContent = studioLabel;
  brandTransitionName.textContent = studioName;

  document.addEventListener("click", (e) => {
    const target = e.target.closest(".invite-card");

    if (!target || transitionLocked) {
      return;
    }

    if (
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      prefersReducedMotion.matches
    ) {
      return;
    }

    e.preventDefault();
    transitionLocked = true;

    document.body.classList.add("is-transitioning");
    target.classList.add("is-opening");
    brandTransition.classList.add("is-active");

    window.setTimeout(() => {
      window.location.href = target.href;
    }, 980);
  });
}
