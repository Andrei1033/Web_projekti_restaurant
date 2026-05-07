// hero video reverse playback
/**
 * Description placeholder
 *
 * @type {*}
 */
const forward = document.getElementById("videoForward");
/**
 * Description placeholder
 *
 * @type {*}
 */
const reverse = document.getElementById("videoReverse");

// forward finished → play reverse
forward.addEventListener("ended", () => {
  forward.style.display = "none";
  reverse.style.display = "block";
  reverse.currentTime = 0;
  reverse.play();
});

// reverse finished → play forward
reverse.addEventListener("ended", () => {
  reverse.style.display = "none";
  forward.style.display = "block";
  forward.currentTime = 0;
  forward.play();
});
