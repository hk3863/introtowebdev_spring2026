document.addEventListener('DOMContentLoaded', function () {
  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var experience = document.getElementById('about-experience');
  var panels = gsap.utils.toArray('.about-city-panel');
  var cityLinks = gsap.utils.toArray('.about-city-nav a');

  if (!experience || panels.length === 0) {
    return;
  }

  panels.forEach(function (panel, index) {
    var content = panel.querySelector('.about-city-content');
    var pieces = panel.querySelectorAll('.timeline-label, h3, p:last-child');

    if (index === 0) {
      gsap.set(panel, { opacity: 1, scale: 1, zIndex: panels.length });
      gsap.set(content, { y: 0, opacity: 1 });
      gsap.set(pieces, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(panel, { opacity: 0, scale: 1.06, zIndex: panels.length - index });
    gsap.set(content, { y: 48, opacity: 0 });
    gsap.set(pieces, { opacity: 0, y: 48 });
  });

  function setActiveCity(index) {
    cityLinks.forEach(function (link, linkIndex) {
      link.classList.toggle('is-active', linkIndex === index);
    });
  }

  setActiveCity(0);

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: experience,
      start: 'top top',
      end: '+=' + (panels.length - 1) * 100 + '%',
      scrub: 1,
      pin: '.about-stage',
      anticipatePin: 1,
      snap: {
        snapTo: panels.length > 1 ? 1 / (panels.length - 1) : 1,
        duration: { min: 0.2, max: 0.45 },
        ease: 'power1.inOut'
      }
    }
  });

  panels.forEach(function (panel, index) {
    if (index === 0) {
      return;
    }

    var previousPanel = panels[index - 1];
    var previousContent = previousPanel.querySelector('.about-city-content');
    var previousPieces = previousPanel.querySelectorAll('.timeline-label, h3, p:last-child');
    var nextContent = panel.querySelector('.about-city-content');
    var nextPieces = panel.querySelectorAll('.timeline-label, h3, p:last-child');
    var stepStart = index - 1;

    tl.call(function () {
      setActiveCity(index - 1);
    }, null, stepStart);

    tl.to(
      previousPanel,
      {
        scale: 1.08,
        duration: 0.8,
        ease: 'power2.inOut'
      },
      stepStart
    )
      .to(
        previousContent,
        {
          y: -34,
          opacity: 0,
          duration: 0.45,
          ease: 'power2.in'
        },
        stepStart
      )
      .to(
        previousPieces,
        {
          opacity: 0,
          y: -34,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.in'
        },
        stepStart
      )
      .to(
        previousPanel,
        {
          opacity: 0,
          duration: 0.55,
          ease: 'power2.inOut'
        },
        stepStart + 0.28
      )
      .fromTo(
        panel,
        {
          opacity: 0,
          scale: 1.08
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.75,
          ease: 'power2.out'
        },
        stepStart + 0.22
      )
      .fromTo(
        nextContent,
        {
          y: 58,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out'
        },
        stepStart + 0.38
      )
      .fromTo(
        nextPieces,
        {
          opacity: 0,
          y: 52
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out'
        },
        stepStart + 0.42
      )
      .call(function () {
        setActiveCity(index);
      }, null, stepStart + 0.5);
  });

});
