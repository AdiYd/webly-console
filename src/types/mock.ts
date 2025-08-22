import { z } from 'zod';

export const examplePage2 = {
  page_name: 'Landing Page',
  page_description:
    'A compelling landing page for CodeCalm, showcasing its benefits and features for developers through modern design and relatable content.',
  sections: [
    {
      section_name: 'Hero Section',
      section_description:
        'Stylized visual of a developer meditating at a desk, headline "Find Your Flow, Not Your Frustration," and CTA "Try CodeCalm Free."',
      src: {
        html: '<section id="hero" class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 px-4 overflow-hidden" data-aos="fade-in">\n  <!-- Background SVG Tech Lines -->\n  <div class="absolute inset-0 z-0 pointer-events-none">\n    <svg class="absolute top-0 left-1/2 -translate-x-1/2 blur-sm opacity-40" width="900" height="400" fill="none" xmlns="http://www.w3.org/2000/svg">\n      <path d="M0 100 Q450 200 900 100" stroke="var(--color-primary)" stroke-width="2"/>\n      <path d="M0 200 Q450 300 900 200" stroke="var(--color-secondary)" stroke-width="2"/>\n      <path d="M150 0 Q450 150 750 0" stroke="var(--color-accent)" stroke-width="1"/>\n    </svg>\n    <div class="absolute -top-32 -left-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>\n    <div class="absolute -bottom-24 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-2xl"></div>\n  </div>\n\n  <div class="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">\n    <!-- L: Meditating Developer Visual -->\n    <div class="flex flex-col items-center lg:items-start text-center lg:text-left gap-8" data-aos="fade-right">\n      <span class="badge badge-primary badge-outline px-4 py-2 text-base font-medium flex items-center gap-2 mb-2">\n        <iconify-icon icon="mdi:meditation" class="text-lg"></iconify-icon>\n        Mindfulness for Developers\n      </span>\n      <h1 class="text-4xl md:text-6xl font-extrabold leading-tight text-base-content max-w-2xl drop-shadow-lg">\n        Find Your <span class="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">Flow</span>,<br>\n        Not Your Frustration\n      </h1>\n      <p class="text-lg opacity-80 max-w-xl mt-3 font-normal">\n        Welcome to <span class="font-semibold text-primary">CodeCalm</span>, the mindfulness app designed for the modern developer. Reduce burnout, enhance focus, and reclaim your passion for coding with sessions made just for you. Experience calm, clarity, and creative breakthroughs with every breath.\n      </p>\n      <div class="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-sm">\n        <button id="cta-try-free" class="btn btn-primary btn-lg rounded-[12px] shadow-lg w-full flex items-center justify-center gap-2 transition-transform duration-200">\n          <iconify-icon icon="material-symbols:mindfulness" class="text-2xl"></iconify-icon>\n          Try CodeCalm Free\n        </button>\n        <button class="btn btn-outline btn-lg rounded-[12px] w-full flex items-center justify-center gap-2">\n          <iconify-icon icon="mdi:play-circle-outline" class="text-xl"></iconify-icon>\n          Watch Demo\n        </button>\n      </div>\n      <div class="flex gap-6 mt-8">\n        <div class="flex flex-col items-center">\n          <span class="text-3xl font-bold text-primary">12K+</span>\n          <span class="text-sm opacity-70">Developers Relaxed</span>\n        </div>\n        <div class="flex flex-col items-center">\n          <span class="text-3xl font-bold text-secondary">4.9★</span>\n          <span class="text-sm opacity-70">App Store Rating</span>\n        </div>\n      </div>\n    </div>\n    <!-- R: Illustration or Animated Visual -->\n    <div class="flex items-center justify-center relative" data-aos="fade-left">\n      <div class="relative group">\n        <div class="absolute -inset-3 bg-accent/10 rounded-[16px] blur-xl group-hover:blur-2xl transition-all duration-300"></div>\n        <img src="https://img.b2bpic.net/premium-vector/woman-meditating-lotus-pose-female-character-enjoying-outdoors-yoga-healthy-lifestyle-relaxation-emotional-balance_1016-9560.jpg" alt="Developer Meditating" class="w-[340px] md:w-[420px] rounded-[16px] shadow-xl border border-base-200 bg-base-100/80"/>\n        <div class="absolute top-4 right-4 bg-secondary/80 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">\n          <iconify-icon icon="mdi:laptop" class="text-base"></iconify-icon> Dev Mode\n        </div>\n        <div class="absolute bottom-4 left-4 flex items-center gap-2">\n          <iconify-icon icon="mdi:code-braces" class="text-primary text-xl"></iconify-icon>\n          <span class="text-base-content text-sm bg-base-100/80 rounded px-2 py-1 font-mono">#StayZen</span>\n        </div>\n      </div>\n    </div>\n  </div>\n  <!-- Scroll Indicator -->\n  <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">\n    <button aria-label="Scroll to more" class="scroll-indicator flex flex-col items-center animate-bounce gap-1">\n      <iconify-icon icon="mdi:chevron-down" class="text-3xl text-accent"></iconify-icon>\n      <span class="text-xs opacity-60">Learn More</span>\n    </button>\n  </div>\n</section>',
        js: "<script>\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Smooth scroll for scroll indicator\n  const scrollBtn = document.querySelector('.scroll-indicator');\n  if(scrollBtn) {\n    scrollBtn.addEventListener('click', () => {\n      // Scroll to next section (why-for-developers)\n      const target = document.getElementById('why-for-developers');\n      if(target) target.scrollIntoView({behavior: 'smooth'});\n    });\n  }\n\n  // CTA Button ripple effect and toast\n  const ctaBtn = document.getElementById('cta-try-free');\n  if(ctaBtn) {\n    ctaBtn.addEventListener('click', function(e) {\n      // Ripple effect\n      const circle = document.createElement('span');\n      circle.className = 'ripple';\n      this.appendChild(circle);\n      const size = Math.max(this.clientWidth, this.clientHeight);\n      circle.style.width = circle.style.height = size + 'px';\n      circle.style.left = (e.offsetX - size/2) + 'px';\n      circle.style.top = (e.offsetY - size/2) + 'px';\n      setTimeout(()=>circle.remove(), 600);\n      // Toast\n      const toast = document.createElement('div');\n      toast.className = 'toast toast-top toast-center z-[99]';\n      toast.innerHTML = '<div class=\"alert alert-success\"><iconify-icon icon=\"mdi:meditation\" class=\"text-lg mr-2\"></iconify-icon><span>Welcome to CodeCalm! Your free trial is just a click away.</span></div>';\n      document.body.appendChild(toast);\n      setTimeout(()=>toast.remove(), 3000);\n    });\n  }\n});\n</script>",
        css: '<style>\n.ripple {\n  position: absolute;\n  border-radius: 9999px;\n  background: var(--color-primary, #4CAF50);\n  opacity: 0.18;\n  pointer-events: none;\n  animation: ripple-wave 0.6s linear;\n  z-index: 15;\n}\n@keyframes ripple-wave {\n  to { transform: scale(3); opacity: 0; }\n}\n</style>',
      },
      id: 'hero',
      AI: {
        provider: 'OpenAI',
        model: 'gpt-4.1',
        temperature: 0.7,
      },
      used_assets: [
        'https://img.b2bpic.net/premium-vector/woman-meditating-lotus-pose-female-character-enjoying-outdoors-yoga-healthy-lifestyle-relaxation-emotional-balance_1016-9560.jpg',
        'mdi:meditation',
        'material-symbols:mindfulness',
        'mdi:play-circle-outline',
        'mdi:laptop',
        'mdi:code-braces',
        'mdi:chevron-down',
      ],
    },
    {
      section_name: 'Why for Developers?',
      section_description:
        'Highlights common developer pain points and how CodeCalm addresses them with specific meditation sessions and stress-reduction techniques.',
      src: {
        html: '<section id="why-developers" class="relative py-20 bg-gradient-to-b from-base-100 via-base-200 to-base-100 overflow-hidden">\n  <!-- Decorative tech lines and blur -->\n  <div class="absolute inset-0 pointer-events-none z-0">\n    <div class="absolute top-10 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>\n    <div class="absolute bottom-0 right-0 w-40 h-40 bg-secondary/10 rounded-full blur-2xl"></div>\n    <div class="hidden md:block absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-primary/20 via-secondary/20 to-accent/10 opacity-60"></div>\n  </div>\n  <div class="container mx-auto px-4 relative z-10">\n    <div class="text-center mb-14">\n      <span class="badge badge-secondary badge-outline mb-3 text-base">\n        <iconify-icon icon="mdi:meditation" class="text-lg mr-1"></iconify-icon>\n        Why Mindfulness for Developers?\n      </span>\n      <h2 class="text-4xl md:text-5xl font-bold text-base-content mb-6" data-aos="fade-up">CodeCalm: Designed for the Developer\'s Mind</h2>\n      <p class="max-w-2xl mx-auto text-lg opacity-80" data-aos="fade-up" data-aos-delay="100">\n        Coding is mentally demanding. Long hours, shifting deadlines, complex logic, and constant context switching can lead to burnout, anxiety, and loss of focus. CodeCalm was built to help developers rise above these challenges by making mindfulness accessible, relatable, and practical—directly in your coding routine.\n      </p>\n    </div>\n    <div class="grid grid-cols-1 md:grid-cols-3 gap-8" data-bind="painpoints">\n      <div class="card bg-card shadow-md rounded-card flex flex-col items-center p-8" data-repeat data-aos="fade-up" data-aos-delay="0">\n        <div class="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-4">\n          <iconify-icon icon="mdi:bug-outline" class="text-primary text-3xl"></iconify-icon>\n        </div>\n        <h3 class="card-title text-xl font-semibold mb-2">Debugging Stress</h3>\n        <p class="opacity-80 mb-3 text-center">Hours spent tracking elusive bugs can heighten frustration and create tunnel vision. CodeCalm offers short, targeted meditations to reset your mind, so you can approach problems with clarity and patience.</p>\n        <span class="badge badge-primary badge-outline">Stress Relief</span>\n      </div>\n      <div class="card bg-card shadow-md rounded-card flex flex-col items-center p-8" data-repeat data-aos="fade-up" data-aos-delay="150">\n        <div class="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mb-4">\n          <iconify-icon icon="mdi:clock-alert-outline" class="text-secondary text-3xl"></iconify-icon>\n        </div>\n        <h3 class="card-title text-xl font-semibold mb-2">Deadline Pressure</h3>\n        <p class="opacity-80 mb-3 text-center">Tight sprints and urgent launches can erode your calm. CodeCalm\'s breathing exercises and focus sessions are crafted to help you regain composure and avoid burnout, even in the most demanding moments.</p>\n        <span class="badge badge-secondary badge-outline">Burnout Prevention</span>\n      </div>\n      <div class="card bg-card shadow-md rounded-card flex flex-col items-center p-8" data-repeat data-aos="fade-up" data-aos-delay="300">\n        <div class="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mb-4">\n          <iconify-icon icon="mdi:focus-field" class="text-accent text-3xl"></iconify-icon>\n        </div>\n        <h3 class="card-title text-xl font-semibold mb-2">Losing Focus</h3>\n        <p class="opacity-80 mb-3 text-center">Constant notifications and context switching can fracture your attention. Our "Deep Work" meditations are designed to help you enter flow state faster—and stay there longer—for truly productive coding sessions.</p>\n        <span class="badge badge-accent badge-outline">Enhanced Focus</span>\n      </div>\n    </div>\n    <div class="mt-16 flex flex-col lg:flex-row items-center gap-8">\n      <div class="w-full lg:w-1/2" data-aos="fade-right">\n        <img src="https://img.b2bpic.net/premium-vector/mental-health-inner-balance-meditation_316839-5314.jpg" alt="Developer mindfulness meditation" class="rounded-2xl shadow-lg w-full max-w-lg mx-auto bg-base-100/60 backdrop-blur-sm" loading="lazy"/>\n      </div>\n      <div class="w-full lg:w-1/2 flex flex-col gap-5" data-aos="fade-left" data-aos-delay="100">\n        <div class="flex items-start gap-4">\n          <iconify-icon icon="material-symbols:mindfulness-rounded" class="text-primary text-3xl"></iconify-icon>\n          <div>\n            <h4 class="font-semibold text-lg mb-1">Real-World Techniques</h4>\n            <p class="opacity-80">All sessions are developed with input from software engineers and mindfulness experts, ensuring they fit seamlessly into your workday and address real developer struggles.</p>\n          </div>\n        </div>\n        <div class="flex items-start gap-4">\n          <iconify-icon icon="mdi:code-tags" class="text-secondary text-3xl"></iconify-icon>\n          <div>\n            <h4 class="font-semibold text-lg mb-1">Code-Friendly Guidance</h4>\n            <p class="opacity-80">Sessions use analogies and language familiar to developers, from "refactoring your mind" to "debugging negative thoughts." It\'s mindfulness made for your world.</p>\n          </div>\n        </div>\n        <div class="flex items-start gap-4">\n          <iconify-icon icon="mdi:progress-clock" class="text-accent text-3xl"></iconify-icon>\n          <div>\n            <h4 class="font-semibold text-lg mb-1">Fits Any Schedule</h4>\n            <p class="opacity-80">Whether you have 2 minutes before a stand-up or need a longer reset, CodeCalm adapts to your needs without disrupting your productivity.</p>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</section>',
        js: "<script>\n// Animated badge on scroll\nwindow.addEventListener('DOMContentLoaded', function() {\n  const badge = document.querySelector('#why-developers .badge');\n  if (badge) {\n    badge.classList.add('animate-pulse');\n  }\n\n  // Card hover effects\n  document.querySelectorAll('#why-developers .card').forEach(card => {\n    card.addEventListener('mouseenter', function() {\n      this.classList.add('shadow-lg', 'scale-105', 'transition-all', 'duration-300', 'z-10');\n    });\n    card.addEventListener('mouseleave', function() {\n      this.classList.remove('shadow-lg', 'scale-105', 'transition-all', 'duration-300', 'z-10');\n    });\n  });\n});\n</script>",
      },
      id: 'why-developers',
      AI: {
        provider: 'OpenAI',
        model: 'gpt-4.1',
        temperature: 0.7,
      },
      used_assets: [
        'https://img.b2bpic.net/premium-vector/mental-health-inner-balance-meditation_316839-5314.jpg',
        'mdi:meditation',
        'mdi:bug-outline',
        'mdi:clock-alert-outline',
        'mdi:focus-field',
        'material-symbols:mindfulness-rounded',
        'mdi:code-tags',
        'mdi:progress-clock',
      ],
    },
    {
      section_name: 'Featured Sessions',
      section_description:
        'Overview of specific sessions like "Deep Work Flow Meditation" and "Bug Hunt Breathwork" with brief descriptions and benefits.',
      src: {
        html: '<section id="featured-sessions" class="py-16 bg-gradient-to-b from-base-100 to-base-200">\n  <div class="max-w-6xl mx-auto px-4">\n    <div class="text-center mb-12">\n      <span class="badge badge-primary badge-outline mb-2 flex items-center gap-2">\n        <iconify-icon icon="material-symbols:mindfulness" class="text-primary text-xl"></iconify-icon>\n        FEATURED SESSIONS\n      </span>\n      <h2 class="text-4xl font-bold mb-4 text-base-content" data-aos="fade-up">Mindful Practices for Developers</h2>\n      <p class="text-lg opacity-80 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">\n        Discover targeted meditation sessions and breathwork designed to help you conquer coding stress, boost concentration, and maintain your best workflow. Whether you’re debugging under pressure or seeking deep creative focus, CodeCalm has a practice for every developer’s journey.\n      </p>\n    </div>\n\n    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-bind="sessions">\n      <div class="card bg-base-100 shadow-lg rounded-card transition-transform hover:scale-105" data-aos="fade-up" data-aos-delay="0" data-repeat>\n        <figure class="p-6 pb-0 flex justify-center">\n          <img src="https://img.b2bpic.net/premium-vector/mental-health-inner-balance-meditation_316839-5314.jpg" alt="Deep Work Flow Meditation" class="w-32 h-32 object-contain rounded-full shadow-md bg-primary/10" />\n        </figure>\n        <div class="card-body items-center text-center">\n          <div class="flex items-center gap-2 mb-1">\n            <iconify-icon icon="mdi:brain" class="text-primary text-2xl"></iconify-icon>\n            <span class="badge badge-primary badge-sm">Focus</span>\n          </div>\n          <h3 class="card-title text-2xl font-semibold mb-2">Deep Work Flow Meditation</h3>\n          <p class="opacity-80 mb-4 text-base">\n            Enter a state of deep concentration with a guided session that minimizes distractions and helps you code with clarity. Perfect for sprints, intense problem-solving, or creative sessions.\n          </p>\n          <div class="flex items-center gap-2">\n            <span class="badge badge-success">15 mins</span>\n            <span class="badge badge-outline">Guided</span>\n          </div>\n        </div>\n      </div>\n\n      <div class="card bg-base-100 shadow-lg rounded-card transition-transform hover:scale-105" data-aos="fade-up" data-aos-delay="100" data-repeat>\n        <figure class="p-6 pb-0 flex justify-center">\n          <img src="https://img.b2bpic.net/premium-vector/set-yoga-themed-doodle-white-background-hand-drawn-abstract-doodle-isolated-white-background_6199-356.jpg" alt="Bug Hunt Breathwork" class="w-32 h-32 object-contain rounded-full shadow-md bg-accent/10" />\n        </figure>\n        <div class="card-body items-center text-center">\n          <div class="flex items-center gap-2 mb-1">\n            <iconify-icon icon="mdi:bug-check-outline" class="text-accent text-2xl"></iconify-icon>\n            <span class="badge badge-accent badge-sm">Stress Relief</span>\n          </div>\n          <h3 class="card-title text-2xl font-semibold mb-2">Bug Hunt Breathwork</h3>\n          <p class="opacity-80 mb-4 text-base">\n            Calm your nerves and reset your mind after a tough debugging session. This short breathwork exercise is ideal for restoring patience and lifting developer spirits.\n          </p>\n          <div class="flex items-center gap-2">\n            <span class="badge badge-warning">7 mins</span>\n            <span class="badge badge-outline">Guided</span>\n          </div>\n        </div>\n      </div>\n\n      <div class="card bg-base-100 shadow-lg rounded-card transition-transform hover:scale-105" data-aos="fade-up" data-aos-delay="200" data-repeat>\n        <figure class="p-6 pb-0 flex justify-center">\n          <img src="https://img.b2bpic.net/premium-vector/mental-health-concept-illustration_86047-997.jpg" alt="Standup Serenity Scan" class="w-32 h-32 object-contain rounded-full shadow-md bg-secondary/10" />\n        </figure>\n        <div class="card-body items-center text-center">\n          <div class="flex items-center gap-2 mb-1">\n            <iconify-icon icon="mdi:account-group-outline" class="text-secondary text-2xl"></iconify-icon>\n            <span class="badge badge-secondary badge-sm">Team Calm</span>\n          </div>\n          <h3 class="card-title text-2xl font-semibold mb-2">Standup Serenity Scan</h3>\n          <p class="opacity-80 mb-4 text-base">\n            Prepare for daily team standups with a quick mindfulness check-in. Improve communication and reduce meeting anxiety with a centering practice.\n          </p>\n          <div class="flex items-center gap-2">\n            <span class="badge badge-info">5 mins</span>\n            <span class="badge badge-outline">Quick</span>\n          </div>\n        </div>\n      </div>\n\n      <div class="card bg-base-100 shadow-lg rounded-card transition-transform hover:scale-105" data-aos="fade-up" data-aos-delay="300" data-repeat>\n        <figure class="p-6 pb-0 flex justify-center">\n          <img src="https://img.b2bpic.net/premium-photo/young-woman-meditating-top-mountain_172134-3831.jpg" alt="Release the Refactor" class="w-32 h-32 object-contain rounded-full shadow-md bg-primary/10" />\n        </figure>\n        <div class="card-body items-center text-center">\n          <div class="flex items-center gap-2 mb-1">\n            <iconify-icon icon="mdi:code-tags" class="text-primary text-2xl"></iconify-icon>\n            <span class="badge badge-primary badge-sm">Clarity</span>\n          </div>\n          <h3 class="card-title text-2xl font-semibold mb-2">Release the Refactor</h3>\n          <p class="opacity-80 mb-4 text-base">\n            Let go of perfectionism and code anxiety with a mindfulness session focused on acceptance and progress. Great for pre-release jitters or after major refactors.\n          </p>\n          <div class="flex items-center gap-2">\n            <span class="badge badge-success">10 mins</span>\n            <span class="badge badge-outline">Acceptance</span>\n          </div>\n        </div>\n      </div>\n\n      <div class="card bg-base-100 shadow-lg rounded-card transition-transform hover:scale-105" data-aos="fade-up" data-aos-delay="400" data-repeat>\n        <figure class="p-6 pb-0 flex justify-center">\n          <img src="https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg" alt="Night Owl Recharge" class="w-32 h-32 object-contain rounded-full shadow-md bg-accent/10" />\n        </figure>\n        <div class="card-body items-center text-center">\n          <div class="flex items-center gap-2 mb-1">\n            <iconify-icon icon="mdi:weather-night" class="text-accent text-2xl"></iconify-icon>\n            <span class="badge badge-accent badge-sm">Energy</span>\n          </div>\n          <h3 class="card-title text-2xl font-semibold mb-2">Night Owl Recharge</h3>\n          <p class="opacity-80 mb-4 text-base">\n            Recharge after a long coding night with soothing sounds and gentle guidance. Restore energy and prevent late-night burnout with this sleep-friendly session.\n          </p>\n          <div class="flex items-center gap-2">\n            <span class="badge badge-warning">12 mins</span>\n            <span class="badge badge-outline">Sleep</span>\n          </div>\n        </div>\n      </div>\n\n      <div class="card bg-base-100 shadow-lg rounded-card transition-transform hover:scale-105" data-aos="fade-up" data-aos-delay="500" data-repeat>\n        <figure class="p-6 pb-0 flex justify-center">\n          <img src="https://img.b2bpic.net/premium-photo/relaxed-afro-american-woman-doing-yoga-exercises-bed_754108-3768.jpg" alt="Zen Commit Cooldown" class="w-32 h-32 object-contain rounded-full shadow-md bg-secondary/10" />\n        </figure>\n        <div class="card-body items-center text-center">\n          <div class="flex items-center gap-2 mb-1">\n            <iconify-icon icon="mdi:meditation" class="text-secondary text-2xl"></iconify-icon>\n            <span class="badge badge-secondary badge-sm">Calm</span>\n          </div>\n          <h3 class="card-title text-2xl font-semibold mb-2">Zen Commit Cooldown</h3>\n          <p class="opacity-80 mb-4 text-base">\n            Wind down after shipping new features with a gratitude-focused cooldown. Reflect, breathe, and celebrate your coding wins for a balanced dev life.\n          </p>\n          <div class="flex items-center gap-2">\n            <span class="badge badge-info">8 mins</span>\n            <span class="badge badge-outline">Reflection</span>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class="mt-12 flex justify-center">\n      <a href="#" class="btn btn-primary btn-lg rounded-button flex items-center gap-2 px-8">\n        <iconify-icon icon="material-symbols:mindfulness-outline-rounded" class="text-xl"></iconify-icon>\n        Explore All Sessions\n      </a>\n    </div>\n  </div>\n</section>',
        js: "<script>\n// Animate cards on hover\nconst sessionCards = document.querySelectorAll('#featured-sessions .card');\nsessionCards.forEach(card => {\n  card.addEventListener('mouseenter', function() {\n    this.classList.add('shadow-xl', 'scale-105', 'transition-all', 'duration-300');\n  });\n  card.addEventListener('mouseleave', function() {\n    this.classList.remove('shadow-xl', 'scale-105', 'transition-all', 'duration-300');\n  });\n});\n</script>",
      },
      id: 'featured-sessions',
      AI: {
        provider: 'OpenAI',
        model: 'gpt-4.1',
        temperature: 0.7,
      },
      used_assets: [
        'https://img.b2bpic.net/premium-vector/mental-health-inner-balance-meditation_316839-5314.jpg',
        'https://img.b2bpic.net/premium-vector/set-yoga-themed-doodle-white-background-hand-drawn-abstract-doodle-isolated-white-background_6199-356.jpg',
        'https://img.b2bpic.net/premium-vector/mental-health-concept-illustration_86047-997.jpg',
        'https://img.b2bpic.net/premium-photo/young-woman-meditating-top-mountain_172134-3831.jpg',
        'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg',
        'https://img.b2bpic.net/premium-photo/relaxed-afro-american-woman-doing-yoga-exercises-bed_754108-3768.jpg',
        'material-symbols:mindfulness',
        'mdi:brain',
        'mdi:bug-check-outline',
        'mdi:account-group-outline',
        'mdi:code-tags',
        'mdi:weather-night',
        'mdi:meditation',
        'material-symbols:mindfulness-outline-rounded',
      ],
    },
    {
      section_name: 'Developer Quotes',
      section_description:
        'Testimonials from developers who have successfully used CodeCalm, emphasizing its impact on productivity and stress reduction.',
      src: {
        html: '<section id="developer-quotes" class="py-20 bg-gradient-to-b from-base-100 to-base-200">\n  <div class="container mx-auto px-4">\n    <div class="text-center mb-12">\n      <span class="badge badge-secondary badge-outline mb-2 flex items-center gap-2 justify-center">\n        <iconify-icon icon="mdi:format-quote-open" class="text-2xl text-secondary"></iconify-icon>\n        Real Developer Stories\n      </span>\n      <h2 class="text-4xl md:text-5xl font-bold text-base-content mb-4" data-aos="fade-up">\n        Why CodeCalm Works for Devs\n      </h2>\n      <p class="text-lg opacity-80 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="200">\n        Hear directly from developers who found clarity, focus, and balance with CodeCalm. Their journeys prove that a mindful coder is a happier, more productive coder.\n      </p>\n    </div>\n    <div class="w-full max-w-5xl mx-auto">\n      <div class="carousel" id="dev-quotes-carousel" data-bind="dev-testimonials">\n        <div class="carousel-item flex flex-col items-center gap-8 px-4" data-repeat>\n          <div class="avatar mb-2">\n            <div class="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">\n              <img src="https://i.pravatar.cc/150?img=31" alt="Sofia, Full Stack Developer" />\n            </div>\n          </div>\n          <div class="card shadow-main rounded-card max-w-2xl w-full px-8 py-6 bg-base-100">\n            <div class="flex justify-center mb-3">\n              <div class="rating rating-md">\n                <input type="radio" name="sofia-rating" class="mask mask-star-2 bg-primary" checked />\n                <input type="radio" name="sofia-rating" class="mask mask-star-2 bg-primary" checked />\n                <input type="radio" name="sofia-rating" class="mask mask-star-2 bg-primary" checked />\n                <input type="radio" name="sofia-rating" class="mask mask-star-2 bg-primary" checked />\n                <input type="radio" name="sofia-rating" class="mask mask-star-2 bg-primary" checked />\n              </div>\n            </div>\n            <p class="text-lg text-base-content opacity-90 mb-4 text-center">\n              <iconify-icon icon="mdi:format-quote-open" class="text-2xl text-accent align-text-top"></iconify-icon>\n              CodeCalm has transformed my workflow. Whenever I\'m stuck on a bug, a quick meditation helps me reset and find the solution faster. I finally feel in control of my focus again.\n              <iconify-icon icon="mdi:format-quote-close" class="text-2xl text-accent align-text-bottom"></iconify-icon>\n            </p>\n            <div class="text-center">\n              <h4 class="font-semibold text-lg text-primary mb-1">Sofia P.</h4>\n              <p class="text-sm opacity-70">Full Stack Developer</p>\n            </div>\n          </div>\n        </div>\n        <div class="carousel-item flex flex-col items-center gap-8 px-4" data-repeat>\n          <div class="avatar mb-2">\n            <div class="w-20 h-20 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">\n              <img src="https://i.pravatar.cc/150?img=15" alt="Ethan, DevOps Engineer" />\n            </div>\n          </div>\n          <div class="card shadow-main rounded-card max-w-2xl w-full px-8 py-6 bg-base-100">\n            <div class="flex justify-center mb-3">\n              <div class="rating rating-md">\n                <input type="radio" name="ethan-rating" class="mask mask-star-2 bg-secondary" checked />\n                <input type="radio" name="ethan-rating" class="mask mask-star-2 bg-secondary" checked />\n                <input type="radio" name="ethan-rating" class="mask mask-star-2 bg-secondary" checked />\n                <input type="radio" name="ethan-rating" class="mask mask-star-2 bg-secondary" checked />\n                <input type="radio" name="ethan-rating" class="mask mask-star-2 bg-secondary" />\n              </div>\n            </div>\n            <p class="text-lg text-base-content opacity-90 mb-4 text-center">\n              <iconify-icon icon="mdi:format-quote-open" class="text-2xl text-accent align-text-top"></iconify-icon>\n              The "Deep Work Flow Meditation" session is my go-to before sprints. My productivity has never been better, and I feel less drained at the end of the day. Highly recommended for any engineer!\n              <iconify-icon icon="mdi:format-quote-close" class="text-2xl text-accent align-text-bottom"></iconify-icon>\n            </p>\n            <div class="text-center">\n              <h4 class="font-semibold text-lg text-secondary mb-1">Ethan V.</h4>\n              <p class="text-sm opacity-70">DevOps Engineer</p>\n            </div>\n          </div>\n        </div>\n        <div class="carousel-item flex flex-col items-center gap-8 px-4" data-repeat>\n          <div class="avatar mb-2">\n            <div class="w-20 h-20 rounded-full ring ring-accent ring-offset-base-100 ring-offset-2">\n              <img src="https://i.pravatar.cc/150?img=37" alt="Priya, Frontend Developer" />\n            </div>\n          </div>\n          <div class="card shadow-main rounded-card max-w-2xl w-full px-8 py-6 bg-base-100">\n            <div class="flex justify-center mb-3">\n              <div class="rating rating-md">\n                <input type="radio" name="priya-rating" class="mask mask-star-2 bg-accent" checked />\n                <input type="radio" name="priya-rating" class="mask mask-star-2 bg-accent" checked />\n                <input type="radio" name="priya-rating" class="mask mask-star-2 bg-accent" checked />\n                <input type="radio" name="priya-rating" class="mask mask-star-2 bg-accent" checked />\n                <input type="radio" name="priya-rating" class="mask mask-star-2 bg-accent" checked />\n              </div>\n            </div>\n            <p class="text-lg text-base-content opacity-90 mb-4 text-center">\n              <iconify-icon icon="mdi:format-quote-open" class="text-2xl text-accent align-text-top"></iconify-icon>\n              Our team uses CodeCalm to de-stress after high-pressure releases. The guided sessions are short, effective, and even fun! It\'s now part of our daily standup routine.\n              <iconify-icon icon="mdi:format-quote-close" class="text-2xl text-accent align-text-bottom"></iconify-icon>\n            </p>\n            <div class="text-center">\n              <h4 class="font-semibold text-lg text-accent mb-1">Priya D.</h4>\n              <p class="text-sm opacity-70">Frontend Developer</p>\n            </div>\n          </div>\n        </div>\n        <div class="carousel-item flex flex-col items-center gap-8 px-4" data-repeat>\n          <div class="avatar mb-2">\n            <div class="w-20 h-20 rounded-full ring ring-warning ring-offset-base-100 ring-offset-2">\n              <img src="https://i.pravatar.cc/150?img=14" alt="Alex, Backend Engineer" />\n            </div>\n          </div>\n          <div class="card shadow-main rounded-card max-w-2xl w-full px-8 py-6 bg-base-100">\n            <div class="flex justify-center mb-3">\n              <div class="rating rating-md">\n                <input type="radio" name="alex-rating" class="mask mask-star-2 bg-warning" checked />\n                <input type="radio" name="alex-rating" class="mask mask-star-2 bg-warning" checked />\n                <input type="radio" name="alex-rating" class="mask mask-star-2 bg-warning" checked />\n                <input type="radio" name="alex-rating" class="mask mask-star-2 bg-warning" checked />\n                <input type="radio" name="alex-rating" class="mask mask-star-2 bg-warning" />\n              </div>\n            </div>\n            <p class="text-lg text-base-content opacity-90 mb-4 text-center">\n              <iconify-icon icon="mdi:format-quote-open" class="text-2xl text-accent align-text-top"></iconify-icon>\n              I used to struggle with sleep after late-night coding. The bedtime wind-downs on CodeCalm are a lifesaver. I wake up more refreshed and ready to tackle complex problems.\n              <iconify-icon icon="mdi:format-quote-close" class="text-2xl text-accent align-text-bottom"></iconify-icon>\n            </p>\n            <div class="text-center">\n              <h4 class="font-semibold text-lg text-warning mb-1">Alex L.</h4>\n              <p class="text-sm opacity-70">Backend Engineer</p>\n            </div>\n          </div>\n        </div>\n      </div>\n      <div class="flex justify-center mt-8 gap-4">\n        <button id="dev-quotes-prev" class="btn btn-circle btn-outline">\n          <iconify-icon icon="mdi:chevron-left"></iconify-icon>\n        </button>\n        <button id="dev-quotes-next" class="btn btn-circle btn-outline">\n          <iconify-icon icon="mdi:chevron-right"></iconify-icon>\n        </button>\n      </div>\n    </div>\n    <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">\n      <div class="flex items-center gap-4 bg-base-200 rounded-card p-6 shadow-main" data-aos="fade-up" data-aos-delay="100">\n        <iconify-icon icon="mdi:meditation" class="text-4xl text-primary"></iconify-icon>\n        <div>\n          <h3 class="font-semibold text-xl mb-1">"Calm is my new superpower!"</h3>\n          <p class="text-base opacity-80">Before CodeCalm, deadlines left me frazzled. Now, I take mindful breaks and my code (and mood) are better than ever.</p>\n        </div>\n      </div>\n      <div class="flex items-center gap-4 bg-base-200 rounded-card p-6 shadow-main" data-aos="fade-up" data-aos-delay="200">\n        <iconify-icon icon="mdi:mindfulness" class="text-4xl text-secondary"></iconify-icon>\n        <div>\n          <h3 class="font-semibold text-xl mb-1">"Meditation, but for programmers."</h3>\n          <p class="text-base opacity-80">The tech-inspired sessions speak my language. It\'s like pair programming with my own mental wellbeing.</p>\n        </div>\n      </div>\n    </div>\n  </div>\n</section>',
        js: "<script>\ndocument.addEventListener('DOMContentLoaded', function() {\n  const carousel = document.getElementById('dev-quotes-carousel');\n  const items = carousel.querySelectorAll('.carousel-item');\n  let current = 0;\n\n  function showItem(idx) {\n    items.forEach((item, i) => {\n      if (i === idx) {\n        item.style.opacity = '1';\n        item.style.display = 'flex';\n        item.classList.add('animate-fadeIn');\n      } else {\n        item.style.opacity = '0';\n        item.style.display = 'none';\n        item.classList.remove('animate-fadeIn');\n      }\n    });\n  }\n\n  document.getElementById('dev-quotes-next').addEventListener('click', function() {\n    current = (current + 1) % items.length;\n    showItem(current);\n  });\n\n  document.getElementById('dev-quotes-prev').addEventListener('click', function() {\n    current = (current - 1 + items.length) % items.length;\n    showItem(current);\n  });\n\n  // Initialize\n  showItem(current);\n\n  // Auto-play carousel every 7 seconds\n  setInterval(() => {\n    current = (current + 1) % items.length;\n    showItem(current);\n  }, 7000);\n});\n</script>",
      },
      id: 'developer-quotes',
      AI: {
        provider: 'OpenAI',
        model: 'gpt-4.1',
        temperature: 0.7,
      },
      used_assets: [
        'https://i.pravatar.cc/150?img=31',
        'https://i.pravatar.cc/150?img=15',
        'https://i.pravatar.cc/150?img=37',
        'https://i.pravatar.cc/150?img=14',
        'mdi:format-quote-open',
        'mdi:format-quote-close',
        'mdi:chevron-left',
        'mdi:chevron-right',
        'mdi:meditation',
        'mdi:mindfulness',
      ],
    },
    {
      section_name: 'Final Call to Action',
      section_description:
        'Encourages app download with links to iOS and Android stores, reinforced by a motivating message.',
      src: {
        html: '<section id="final-cta" class="py-20 bg-gradient-to-br from-[var(--color-secondary)]/10 to-[var(--color-accent)]/10 relative overflow-hidden">\n  <div class="absolute inset-0 pointer-events-none z-0">\n    <div class="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl"></div>\n    <div class="absolute right-10 bottom-0 w-40 h-40 bg-accent/20 rounded-full blur-2xl"></div>\n    <div class="absolute left-0 top-1/4 w-24 h-24 bg-secondary/20 rounded-full blur-3xl"></div>\n  </div>\n  <div class="relative z-10 max-w-3xl mx-auto px-4 text-center flex flex-col items-center" data-aos="fade-up">\n    <div class="inline-flex items-center gap-2 mb-4">\n      <iconify-icon icon="material-symbols:mindfulness-rounded" class="text-primary text-3xl"></iconify-icon>\n      <span class="text-lg font-semibold text-primary">Ready to Code Calmly?</span>\n      <iconify-icon icon="mdi:meditation" class="text-secondary text-2xl"></iconify-icon>\n    </div>\n    <h2 class="text-4xl md:text-5xl font-bold mb-4 text-base-content">Start Your Mindful Coding Journey Today</h2>\n    <p class="text-lg opacity-80 max-w-xl mx-auto mb-8">Don\'t let stress and distractions hold your code back. Unlock deeper focus, reduce burnout, and experience a new level of developer productivity with CodeCalm. Mindfulness is just a tap away—wherever you code, whenever you need it.</p>\n    <div class="flex flex-col md:flex-row items-center justify-center gap-6 mb-8" data-bind="download-badges">\n      <a data-repeat href="#" class="btn btn-primary btn-lg rounded-[12px] px-8 flex items-center gap-2 shadow-lg transition-transform duration-200 hover:scale-105" aria-label="Download on the App Store">\n        <iconify-icon icon="mdi:apple" class="text-xl"></iconify-icon>\n        <span>App Store</span>\n      </a>\n      <a data-repeat href="#" class="btn btn-secondary btn-lg rounded-[12px] px-8 flex items-center gap-2 shadow-lg transition-transform duration-200 hover:scale-105" aria-label="Get it on Google Play">\n        <iconify-icon icon="mdi:android" class="text-xl"></iconify-icon>\n        <span>Google Play</span>\n      </a>\n    </div>\n    <div class="flex flex-wrap items-center justify-center gap-8 mt-6" data-aos="fade-up" data-aos-delay="200">\n      <div class="flex items-center gap-2">\n        <iconify-icon icon="mdi:star" class="text-accent text-xl"></iconify-icon>\n        <span class="font-semibold">4.9/5</span>\n        <span class="opacity-70 text-sm">App Store Rating</span>\n      </div>\n      <div class="flex items-center gap-2">\n        <iconify-icon icon="mdi:account-group-outline" class="text-primary text-xl"></iconify-icon>\n        <span class="font-semibold">80,000+</span>\n        <span class="opacity-70 text-sm">Developers Benefitted</span>\n      </div>\n      <div class="flex items-center gap-2">\n        <iconify-icon icon="mdi:clock-check-outline" class="text-secondary text-xl"></iconify-icon>\n        <span class="font-semibold">Free 7-day trial</span>\n      </div>\n    </div>\n    <div class="mt-10">\n      <span class="text-md opacity-80">No credit card required &bull; Cancel anytime</span>\n    </div>\n  </div>\n</section>',
        js: "<script>\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Download badge click analytics mockup\n  const badges = document.querySelectorAll('#final-cta [data-bind=\"download-badges\"] a');\n  badges.forEach(badge => {\n    badge.addEventListener('click', function(e) {\n      // Replace with actual tracking if needed\n      const platform = badge.textContent.trim();\n      const toast = document.createElement('div');\n      toast.className = 'toast toast-end z-50';\n      toast.innerHTML = `<div class='alert alert-success'><iconify-icon icon='mdi:check-circle'></iconify-icon><span>Opening ${platform}…</span></div>`;\n      document.body.appendChild(toast);\n      setTimeout(() => toast.remove(), 2500);\n    });\n  });\n});\n</script>",
      },
      id: 'final-cta',
      AI: {
        provider: 'OpenAI',
        model: 'gpt-4.1',
        temperature: 0.7,
      },
      used_assets: [
        'material-symbols:mindfulness-rounded',
        'mdi:meditation',
        'mdi:apple',
        'mdi:android',
        'mdi:star',
        'mdi:account-group-outline',
        'mdi:clock-check-outline',
      ],
    },
    {
      section_name: 'Tech-Inspired Footer',
      section_description:
        'Incorporates tech-inspired design elements, contact information, and social media links to maintain connection with the audience.',
      src: {
        html: '<section id="footer" class="bg-base-200 text-base-content pt-12 pb-4 border-t border-base-300 relative overflow-hidden">\n  <div class="container mx-auto px-4">\n    <div class="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">\n      <!-- Logo & Brand -->\n      <div class="space-y-4">\n        <a href="#" class="flex items-center gap-3">\n          <span class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20">\n            <iconify-icon icon="mdi:meditation" class="text-primary text-3xl"></iconify-icon>\n          </span>\n          <span class="font-bold text-2xl">Code<span class="text-primary">Calm</span></span>\n        </a>\n        <p class="opacity-80 text-sm max-w-xs">Mindfulness designed for developers. Reduce stress, find focus, and thrive in the tech world with CodeCalm.</p>\n        <div class="flex items-center gap-2 mt-2">\n          <iconify-icon icon="mdi:leaf" class="text-success text-lg"></iconify-icon>\n          <span class="text-xs opacity-70">Dev Tranquility Theme</span>\n        </div>\n      </div>\n      <!-- Quick Links -->\n      <div class="space-y-2">\n        <h4 class="footer-title text-base font-semibold mb-2">Quick Links</h4>\n        <a class="link link-hover" href="#">Home</a>\n        <a class="link link-hover" href="#why">Why for Developers?</a>\n        <a class="link link-hover" href="#sessions">Featured Sessions</a>\n        <a class="link link-hover" href="#testimonials">Testimonials</a>\n      </div>\n      <!-- Resources -->\n      <div class="space-y-2">\n        <h4 class="footer-title text-base font-semibold mb-2">Resources</h4>\n        <a class="link link-hover" href="#">Blog</a>\n        <a class="link link-hover" href="#">Guides</a>\n        <a class="link link-hover" href="#">Support</a>\n        <a class="link link-hover" href="#">API Docs</a>\n      </div>\n      <!-- Contact Info -->\n      <div class="space-y-2">\n        <h4 class="footer-title text-base font-semibold mb-2">Contact</h4>\n        <div class="flex items-center gap-2">\n          <iconify-icon icon="mdi:email-outline" class="text-primary text-lg"></iconify-icon>\n          <a href="mailto:support@codecalm.dev" class="link link-hover">support@codecalm.dev</a>\n        </div>\n        <div class="flex items-center gap-2">\n          <iconify-icon icon="mdi:map-marker-outline" class="text-secondary text-lg"></iconify-icon>\n          <span class="text-sm">Remote Worldwide</span>\n        </div>\n        <div class="flex items-center gap-2">\n          <iconify-icon icon="mdi:clock-outline" class="text-accent text-lg"></iconify-icon>\n          <span class="text-sm">Mon-Fri 09:00-18:00 UTC</span>\n        </div>\n      </div>\n      <!-- Newsletter -->\n      <div class="space-y-3">\n        <h4 class="footer-title text-base font-semibold mb-2">Newsletter</h4>\n        <form id="newsletter-form" class="join w-full">\n          <input type="email" class="input input-bordered join-item w-36 md:w-48" placeholder="you@devmail.com" aria-label="Email for newsletter" required />\n          <button type="submit" class="btn btn-primary join-item">Subscribe</button>\n        </form>\n        <span class="text-xs opacity-70">Get monthly mindfulness tips for devs.</span>\n      </div>\n    </div>\n    <!-- Social and Copyright -->\n    <div class="flex flex-col md:flex-row items-center justify-between mt-10 border-t border-base-300 pt-6 gap-4">\n      <div class="flex gap-3">\n        <a href="#" class="btn btn-sm btn-circle btn-outline hover:bg-primary/10" aria-label="GitHub">\n          <iconify-icon icon="mdi:github" class="text-lg"></iconify-icon>\n        </a>\n        <a href="#" class="btn btn-sm btn-circle btn-outline hover:bg-primary/10" aria-label="Twitter">\n          <iconify-icon icon="mdi:twitter" class="text-lg"></iconify-icon>\n        </a>\n        <a href="#" class="btn btn-sm btn-circle btn-outline hover:bg-primary/10" aria-label="LinkedIn">\n          <iconify-icon icon="mdi:linkedin" class="text-lg"></iconify-icon>\n        </a>\n        <a href="#" class="btn btn-sm btn-circle btn-outline hover:bg-primary/10" aria-label="Discord">\n          <iconify-icon icon="mdi:discord" class="text-lg"></iconify-icon>\n        </a>\n      </div>\n      <span class="text-sm opacity-60">&copy; 2024 CodeCalm. Made with <iconify-icon icon="mdi:heart" class="text-error text-base"></iconify-icon> for devs, by devs.</span>\n      <div class="flex gap-2 text-xs">\n        <a href="#" class="hover:text-primary">Privacy</a>\n        <span>|</span>\n        <a href="#" class="hover:text-primary">Terms</a>\n      </div>\n    </div>\n    <!-- Tech-inspired HUD ring decorative element -->\n    <div class="absolute -top-20 -left-24 md:-left-40 w-96 h-96 pointer-events-none opacity-20 z-0">\n      <img src="https://img.b2bpic.net/free-photo/hi-tech-futuristic-hud-display-circle-elements_1379-889.jpg" alt="hud ring" class="object-contain w-full h-full select-none" draggable="false" />\n    </div>\n    <div class="absolute -bottom-32 right-0 w-72 h-72 pointer-events-none opacity-10 z-0">\n      <img src="https://img.b2bpic.net/free-photo/hi-tech-futuristic-hud-display-circle-elements_1379-889.jpg" alt="hud ring" class="object-contain w-full h-full select-none" draggable="false" />\n    </div>\n  </div>\n</section>',
        js: "<script>\n// Newsletter form submission\nconst newsletterForm = document.getElementById('newsletter-form');\nif (newsletterForm) {\n  newsletterForm.addEventListener('submit', function(e) {\n    e.preventDefault();\n    const btn = newsletterForm.querySelector('button');\n    btn.disabled = true;\n    btn.innerHTML = '<span class=\"loading loading-spinner loading-xs\"></span>';\n    setTimeout(() => {\n      btn.innerHTML = 'Subscribed!';\n      btn.classList.add('btn-success');\n      // Toast notification\n      const toast = document.createElement('div');\n      toast.className = 'toast toast-end';\n      toast.innerHTML = `\n        <div class=\"alert alert-success\">\n          <iconify-icon icon=\"mdi:check-circle\"></iconify-icon>\n          <span>Thanks for subscribing to CodeCalm!</span>\n        </div>\n      `;\n      document.body.appendChild(toast);\n      setTimeout(() => {\n        toast.remove();\n        btn.innerHTML = 'Subscribe';\n        btn.classList.remove('btn-success');\n        btn.disabled = false;\n        newsletterForm.reset();\n      }, 2500);\n    }, 1400);\n  });\n}\n// Animate HUD ring on scroll\nwindow.addEventListener('scroll', function() {\n  const hud = document.querySelectorAll('#footer img[alt=\"hud ring\"]');\n  hud.forEach((el, i) => {\n    el.style.transform = `rotate(${window.scrollY / (i ? 4 : 8)}deg)`;\n  });\n});\n</script>",
        css: '<style>\n#footer .footer-title {\n  letter-spacing: .04em;\n}\n#footer input:focus, #footer select:focus {\n  border-color: var(--color-primary);\n  box-shadow: 0 0 0 1.5px var(--color-primary);\n}\n</style>',
      },
      id: 'footer',
      AI: {
        provider: 'OpenAI',
        model: 'gpt-4.1',
        temperature: 0.7,
      },
      used_assets: [
        'https://img.b2bpic.net/free-photo/hi-tech-futuristic-hud-display-circle-elements_1379-889.jpg',
        'mdi:meditation',
        'mdi:leaf',
        'mdi:email-outline',
        'mdi:map-marker-outline',
        'mdi:clock-outline',
        'mdi:github',
        'mdi:twitter',
        'mdi:linkedin',
        'mdi:discord',
        'mdi:heart',
      ],
    },
  ],
};

export const exampleWebsite = {
  name: 'CodeCalm',
  language: 'en',
  description:
    'I will craft an engaging landing page for "CodeCalm," a mindfulness app tailored for developers. 🌿 The design will feature a developer-friendly aesthetic with tech-inspired elements and calming visuals. I envision a hero section showcasing a developer in a meditative pose, capturing the essence of finding balance amidst the coding chaos. The site will highlight the app\'s benefits like reducing burnout and improving focus, with testimonials from satisfied users. Let\'s create a digital space that resonates with the tech community and promotes mental wellness. 📱 Try CodeCalm for a stress-free coding journey!',
  type: 'Landing Page',
  design: {
    style: 'modern',
    theme_name: 'Dev Tranquility',
    theme_icon: 'mdi:meditation',
    theme: {
      colors: {
        light: {
          primary: '#4CAF50',
          secondary: '#00BCD4',
          accent: '#FFC107',
          background: '#F5F5F5',
          card: '#FFFFFF',
          text: '#212121',
          border: '#E0E0E0',
        },
        dark: {
          primary: '#81C784',
          secondary: '#4DD0E1',
          accent: '#FFD54F',
          background: '#263238',
          card: '#37474F',
          text: '#ECEFF1',
          border: '#455A64',
        },
      },
      typography: {
        fontFamily: 'Quicksand',
      },
      radius: {
        button: 12,
        card: 16,
      },
    },
  },
  context: {
    client_context_summary:
      'The client desires a focused landing page for "CodeCalm," a mindfulness app catering to software developers aiming to reduce burnout and enhance productivity through meditation. The page should resonate with developers experiencing stress, using relatable imagery and language, emphasizing the app\'s practical benefits for the tech industry.',
    query: 'mindfulness app for developers',
    tags: ['mindfulness', 'developers', 'productivity', 'meditation', 'focus'],
    target_audience: 'Software developers experiencing stress or seeking improved focus',
    goals:
      'Promote CodeCalm app to developers, reduce burnout, improve concentration, and increase app downloads.',
    guidelines:
      'Use a tech-friendly, calming design with relatable developer imagery. Include a hero section with a meditative developer visual, a compelling headline, and a CTA for free trials. Highlight pain points and solutions, app features, testimonials, and download options for iOS/Android. Ensure the design is modern and resonates with the tech-savvy audience.',
  },
  pages: [
    {
      page_name: 'Landing Page',
      page_description:
        'A compelling landing page for CodeCalm, showcasing its benefits and features for developers through modern design and relatable content.',
      sections: [
        {
          section_name: 'Hero Section',
          section_description:
            'Stylized visual of a developer meditating at a desk, headline "Find Your Flow, Not Your Frustration," and CTA "Try CodeCalm Free."',
        },
        {
          section_name: 'Why for Developers?',
          section_description:
            'Highlights common developer pain points and how CodeCalm addresses them with specific meditation sessions and stress-reduction techniques.',
        },
        {
          section_name: 'Featured Sessions',
          section_description:
            'Overview of specific sessions like "Deep Work Flow Meditation" and "Bug Hunt Breathwork" with brief descriptions and benefits.',
        },
        {
          section_name: 'Developer Quotes',
          section_description:
            'Testimonials from developers who have successfully used CodeCalm, emphasizing its impact on productivity and stress reduction.',
        },
        {
          section_name: 'Final Call to Action',
          section_description:
            'Encourages app download with links to iOS and Android stores, reinforced by a motivating message.',
        },
        {
          section_name: 'Tech-Inspired Footer',
          section_description:
            'Incorporates tech-inspired design elements, contact information, and social media links to maintain connection with the audience.',
        },
      ],
    },
  ],
  resources: {
    images: [
      {
        title:
          'Woman Meditating in Lotus Pose, Female Character Enjoying Outdoors Yoga. Healthy Lifestyle Relaxation, Emotional Balance',
        size: '626x543',
        url: 'https://img.b2bpic.net/premium-vector/woman-meditating-lotus-pose-female-character-enjoying-outdoors-yoga-healthy-lifestyle-relaxation-emotional-balance_1016-9560.jpg',
        query: 'mindfulness',
        source: 'Freepik',
      },
      {
        title: 'Workforce organization and management',
        size: '626x417',
        url: 'https://img.b2bpic.net/free-vector/workforce-organization-management_335657-3158.jpg',
        query: 'productivity',
        source: 'Freepik',
      },
      {
        title:
          'Hands with binocular Planning and vision of future Black telescope Optical instrument with heart silhouettes Template and layout Cartoon flat vector illustration isolated on white background',
        size: '626x494',
        url: 'https://img.b2bpic.net/premium-vector/hands-with-binocular-planning-vision-future-black-telescope-optical-instrument-with-heart-silhouettes-template-layout-cartoon-flat-vector-illustration-isolated-white-background_1002658-1908.jpg',
        query: 'focus',
        source: 'Freepik',
      },
      {
        title: 'Peaceful meditation silhouette at sunset on a serene beach.',
        size: '2560x1920',
        url: 'https://images.pexels.com/photos/268134/pexels-photo-268134.jpeg',
        query: 'meditation',
        source: 'Pexels',
      },
      {
        title:
          'Internet technology security specialists team fixing computer system cyberattack, developers coding antivirus program script. Diverse coders programming cybersecurity app at night time',
        size: '626x417',
        url: 'https://img.b2bpic.net/premium-photo/internet-technology-security-specialists-team-fixing-computer-system-cyberattack-developers-coding-antivirus-program-script-diverse-coders-programming-cybersecurity-app-night-time_482257-71327.jpg',
        query: 'developers',
        source: 'Freepik',
      },
      {
        title:
          "A unique perspective of Düsseldorf's city streets seen through a camera lens at night.",
        size: '4000x6000',
        url: 'https://images.pexels.com/photos/339379/pexels-photo-339379.jpeg',
        query: 'focus',
        source: 'Pexels',
      },
      {
        title: 'Vibrant pink water lily blooming gracefully on a lush green pond.',
        size: '5080x3090',
        url: 'https://images.pexels.com/photos/158465/waterlily-pink-water-lily-water-plant-158465.jpeg',
        query: 'meditation',
        source: 'Pexels',
      },
      {
        title:
          'A woman enjoying a serene moment in a sunlit garden, surrounded by vibrant flowers.',
        size: '4256x2832',
        url: 'https://images.pexels.com/photos/321576/pexels-photo-321576.jpeg',
        query: 'mindfulness',
        source: 'Pexels',
      },
      {
        title:
          'Set of yoga themed doodle on white background Hand drawn abstract doodle isolated on white background',
        size: '626x626',
        url: 'https://img.b2bpic.net/premium-vector/set-yoga-themed-doodle-white-background-hand-drawn-abstract-doodle-isolated-white-background_6199-356.jpg',
        query: 'meditation',
        source: 'Freepik',
      },
      {
        title:
          'Team of software developers having web server hacked, reading critical error on computer display in agency. Multi ethnic programmers trying to solve hacking problem, firewall security.',
        size: '626x417',
        url: 'https://img.b2bpic.net/premium-photo/team-software-developers-having-web-server-hacked-reading-critical-error-computer-display-agency-multi-ethnic-programmers-trying-solve-hacking-problem-firewall-security_482257-57286.jpg',
        query: 'developers',
        source: 'Freepik',
      },
      {
        title: 'Mental health and inner balance meditation',
        size: '626x447',
        url: 'https://img.b2bpic.net/premium-vector/mental-health-inner-balance-meditation_316839-5314.jpg',
        query: 'mindfulness',
        source: 'Freepik',
      },
      {
        title: 'Mental health concept illustration',
        size: '626x501',
        url: 'https://img.b2bpic.net/premium-vector/mental-health-concept-illustration_86047-997.jpg',
        query: 'mindfulness',
        source: 'Freepik',
      },
      {
        title:
          'Silhouette of a person practicing yoga outdoors during sunrise, creating a calming atmosphere.',
        size: '4700x2818',
        url: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg',
        query: 'meditation',
        source: 'Pexels',
      },
      {
        title: 'A team of software developers collaborating in a modern office working',
        size: '626x351',
        url: 'https://img.b2bpic.net/premium-photo/team-software-developers-collaborating-modern-office-working_1291600-106.jpg',
        query: 'developers',
        source: 'Freepik',
      },
      {
        title:
          'A brown pawn with a crown stands prominently on a chessboard, symbolizing strategic play.',
        size: '3089x2114',
        url: 'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg',
        query: 'focus',
        source: 'Pexels',
      },
      {
        title: 'The Man with Binoculars',
        size: '626x351',
        url: 'https://img.b2bpic.net/premium-photo/man-with-binoculars_1030879-60137.jpg',
        query: 'focus',
        source: 'Freepik',
      },
      {
        title:
          'Developer working remotely, coding on a laptop with phone in hand, showcasing modern work culture.',
        size: '6016x4016',
        url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
        query: 'developers',
        source: 'Pexels',
      },
      {
        title: 'Young woman meditating on top of a mountain',
        size: '626x417',
        url: 'https://img.b2bpic.net/premium-photo/young-woman-meditating-top-mountain_172134-3831.jpg',
        query: 'meditation',
        source: 'Freepik',
      },
      {
        title:
          'A stack of smooth stones artfully balanced by a waterside, evoking tranquility and zen.',
        size: '5472x3648',
        url: 'https://images.pexels.com/photos/355863/pexels-photo-355863.jpeg',
        query: 'meditation',
        source: 'Pexels',
      },
      {
        title: 'A crystal ball reflecting city architecture on a wet Manchester street.',
        size: '3283x4924',
        url: 'https://images.pexels.com/photos/2251798/pexels-photo-2251798.jpeg',
        query: 'focus',
        source: 'Pexels',
      },
      {
        title: 'a magnifying glass is on the target and the word can be seen on the label',
        size: '626x352',
        url: 'https://img.b2bpic.net/premium-photo/magnifying-glass-is-target-word-can-be-seen-label_793518-400.jpg',
        query: 'focus',
        source: 'Freepik',
      },
      {
        title: 'Time management, planning events, business organization, optimization',
        size: '626x626',
        url: 'https://img.b2bpic.net/premium-vector/time-management-planning-events-business-organization-optimization_1200-534.jpg',
        query: 'productivity',
        source: 'Freepik',
      },
      {
        title:
          'Freelancer writing notes in a minimalist home office with a white tablet, plant, and reading glasses.',
        size: '3941x2632',
        url: 'https://images.pexels.com/photos/4065891/pexels-photo-4065891.jpeg',
        query: 'productivity',
        source: 'Pexels',
      },
      {
        title: 'A close-up side view of a young man with a serious and focused expression.',
        size: '5312x2831',
        url: 'https://images.pexels.com/photos/583437/pexels-photo-583437.jpeg',
        query: 'focus',
        source: 'Pexels',
      },
      {
        title:
          'A man enjoys outdoor relaxation and mindfulness beneath a bright, cloudy sky, exuding calm and peace.',
        size: '6000x4000',
        url: 'https://images.pexels.com/photos/810775/pexels-photo-810775.jpeg',
        query: 'mindfulness',
        source: 'Pexels',
      },
      {
        title: 'Circle line of focus, shoot icon logo collection',
        size: '626x313',
        url: 'https://img.b2bpic.net/premium-vector/circle-line-focus-shoot-icon-logo-collection_340145-153.jpg',
        query: 'focus',
        source: 'Freepik',
      },
      {
        title: 'Relaxed afro american woman doing yoga exercises on bed',
        size: '626x417',
        url: 'https://img.b2bpic.net/premium-photo/relaxed-afro-american-woman-doing-yoga-exercises-bed_754108-3768.jpg',
        query: 'mindfulness',
        source: 'Freepik',
      },
      {
        title: 'Hi-Tech Futuristic HUD Display Circle Elements',
        size: '2000x1125',
        url: 'https://img.b2bpic.net/free-photo/hi-tech-futuristic-hud-display-circle-elements_1379-889.jpg',
        query: 'focus',
        source: 'Freepik',
      },
      {
        title: 'Woman practicing yoga lesson at home',
        size: '626x417',
        url: 'https://img.b2bpic.net/premium-photo/woman-practicing-yoga-lesson-home_52701-953.jpg',
        query: 'meditation',
        source: 'Freepik',
      },
      {
        title: 'Young woman meditating at home for inner peace and mindfulness',
        size: '626x417',
        url: 'https://img.b2bpic.net/premium-photo/young-woman-meditating-home-inner-peace-mindfulness_695242-20525.jpg',
        query: 'meditation',
        source: 'Freepik',
      },
      {
        title: 'A cozy breakfast setup with coffee, bread, and fruit next to a laptop.',
        size: '5184x3456',
        url: 'https://images.pexels.com/photos/907810/pexels-photo-907810.jpeg',
        query: 'productivity',
        source: 'Pexels',
      },
      {
        title:
          'Eyeglasses reflecting computer code on a monitor, ideal for technology and programming themes.',
        size: '3353x2514',
        url: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg',
        query: 'developers',
        source: 'Pexels',
      },
      {
        title:
          'An overhead view of a person working on a laptop in a minimalist home office setting.',
        size: '4240x2832',
        url: 'https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg',
        query: 'productivity',
        source: 'Pexels',
      },
      {
        title: 'A web developer working on code in a modern office setting with multiple devices.',
        size: '3456x5184',
        url: 'https://images.pexels.com/photos/2102416/pexels-photo-2102416.jpeg',
        query: 'developers',
        source: 'Pexels',
      },
      {
        title: 'Close-up of a computer screen displaying programming code in a dark environment.',
        size: '4288x2848',
        url: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
        query: 'developers',
        source: 'Pexels',
      },
      {
        title: 'A clean and modern workspace featuring a laptop, houseplant, and notebook.',
        size: '2832x4240',
        url: 'https://images.pexels.com/photos/4065864/pexels-photo-4065864.jpeg',
        query: 'productivity',
        source: 'Pexels',
      },
      {
        title:
          'Praying hands relax and meditation by woman in a living room for peace wellness or mental health balance at home Prayer pose yoga and lady meditate in lounge for zen healing or holistic exercise',
        size: '626x452',
        url: 'https://img.b2bpic.net/premium-photo/praying-hands-relax-meditation-by-woman-living-room-peace-wellness-mental-health-balance-home-prayer-pose-yoga-lady-meditate-lounge-zen-healing-holistic-exercise_590464-204397.jpg',
        query: 'meditation',
        source: 'Freepik',
      },
      {
        title: 'Mixed race woman meditating at home with eyes closed',
        size: '626x417',
        url: 'https://img.b2bpic.net/premium-photo/mixed-race-woman-meditating-home-with-eyes-closed_1112411-7789.jpg',
        query: 'mindfulness',
        source: 'Freepik',
      },
      {
        title: 'A close-up shot of a person coding on a laptop, focusing on the hands and screen.',
        size: '6144x4069',
        url: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg',
        query: 'developers',
        source: 'Pexels',
      },
      {
        title: 'A magnifying glass held by a hand outdoors at sunset, focusing on exploration.',
        size: '4000x6000',
        url: 'https://images.pexels.com/photos/1194775/pexels-photo-1194775.jpeg',
        query: 'focus',
        source: 'Pexels',
      },
      {
        title: 'Balance and tranquility embodied by stacked stones in a natural outdoor setting.',
        size: '4256x2832',
        url: 'https://images.pexels.com/photos/668353/pexels-photo-668353.jpeg',
        query: 'meditation',
        source: 'Pexels',
      },
      {
        title: 'Concentrated Developers Working',
        size: '417x626',
        url: 'https://img.b2bpic.net/premium-photo/concentrated-developers-working_274689-34950.jpg',
        query: 'developers',
        source: 'Freepik',
      },
      {
        title:
          'Overhead view of a stressed woman working at a desk with a laptop, phone, and notebooks.',
        size: '4608x3456',
        url: 'https://images.pexels.com/photos/313690/pexels-photo-313690.jpeg',
        query: 'productivity',
        source: 'Pexels',
      },
      {
        title: 'Productivity concept illustration',
        size: '626x417',
        url: 'https://img.b2bpic.net/premium-vector/productivity-concept-illustration_114360-25881.jpg',
        query: 'productivity',
        source: 'Freepik',
      },
      {
        title:
          'Businessman with many arms sitting at computer in office and doing many tasks at the same time Freelance worker Multitasking skills effective time management and productivity concept',
        size: '626x425',
        url: 'https://img.b2bpic.net/premium-vector/businessman-with-many-arms-sitting-computer-office-doing-many-tasks-same-time-freelance-worker-multitasking-skills-effective-time-management-productivity-concept_458444-1248.jpg',
        query: 'productivity',
        source: 'Freepik',
      },
      {
        title: 'Hands of young intercultural software developers typing on computer keyboards',
        size: '626x417',
        url: 'https://img.b2bpic.net/premium-photo/hands-young-intercultural-software-developers-typing-computer-keyboards_236854-37195.jpg',
        query: 'developers',
        source: 'Freepik',
      },
      {
        title:
          'A serene stack of stones on the rocky seashore during a peaceful sunrise, embodying balance and zen.',
        size: '3500x2129',
        url: 'https://images.pexels.com/photos/289586/pexels-photo-289586.jpeg',
        query: 'mindfulness',
        source: 'Pexels',
      },
      {
        title: 'Shopkeeper vector outline illustrations EPS 10 file',
        size: '626x626',
        url: 'https://img.b2bpic.net/premium-vector/shopkeeper-vector-outline-illustrations-eps-10-file_848977-6168.jpg',
        query: 'productivity',
        source: 'Freepik',
      },
    ],
    videos: [
      {
        title: 'Pexels Video of mindfulness',
        size: '1920x1080',
        url: 'https://videos.pexels.com/video-files/5149354/5149354-hd_1280_720_24fps.mp4',
        thumbnail: 'https://images.pexels.com/videos/5149354/pictures/preview-0.jpg',
        query: 'mindfulness',
        source: 'Pexels',
      },
      {
        title: 'Pexels Video of mindfulness',
        size: '2160x3840',
        url: 'https://videos.pexels.com/video-files/33535071/14259883_360_640_30fps.mp4',
        thumbnail: 'https://images.pexels.com/videos/33535071/pictures/preview-0.jpg',
        query: 'mindfulness',
        source: 'Pexels',
      },
      {
        title: 'Pexels Video of developers',
        size: '4096x2160',
        url: 'https://videos.pexels.com/video-files/6804109/6804109-hd_1366_720_25fps.mp4',
        thumbnail: 'https://images.pexels.com/videos/6804109/pictures/preview-0.jpg',
        query: 'developers',
        source: 'Pexels',
      },
      {
        title: 'Pexels Video of developers',
        size: '4096x2160',
        url: 'https://videos.pexels.com/video-files/6804111/6804111-sd_426_226_25fps.mp4',
        thumbnail: 'https://images.pexels.com/videos/6804111/pictures/preview-0.jpg',
        query: 'developers',
        source: 'Pexels',
      },
      {
        title: 'Pexels Video of productivity',
        size: '4096x2160',
        url: 'https://videos.pexels.com/video-files/4065924/4065924-sd_640_338_25fps.mp4',
        thumbnail: 'https://images.pexels.com/videos/4065924/pictures/preview-0.jpg',
        query: 'productivity',
        source: 'Pexels',
      },
      {
        title: 'Pexels Video of productivity',
        size: '3840x2160',
        url: 'https://videos.pexels.com/video-files/4146415/4146415-hd_1920_1080_25fps.mp4',
        thumbnail: 'https://images.pexels.com/videos/4146415/pictures/preview-0.jpg',
        query: 'productivity',
        source: 'Pexels',
      },
      {
        title: 'Pexels Video of meditation',
        size: '3840x2160',
        url: 'https://videos.pexels.com/video-files/3209148/3209148-hd_1280_720_25fps.mp4',
        thumbnail: 'https://images.pexels.com/videos/3209148/pictures/preview-0.jpg',
        query: 'meditation',
        source: 'Pexels',
      },
      {
        title: 'Pexels Video of meditation',
        size: '4096x2160',
        url: 'https://videos.pexels.com/video-files/3191421/3191421-hd_1366_720_25fps.mp4',
        thumbnail: 'https://images.pexels.com/videos/3191421/pictures/preview-0.jpg',
        query: 'meditation',
        source: 'Pexels',
      },
      {
        title: 'Pexels Video of focus',
        size: '1920x1080',
        url: 'https://videos.pexels.com/video-files/3327253/3327253-sd_426_240_24fps.mp4',
        thumbnail: 'https://images.pexels.com/videos/3327253/pictures/preview-0.jpg',
        query: 'focus',
        source: 'Pexels',
      },
      {
        title: 'Pexels Video of focus',
        size: '3840x2160',
        url: 'https://videos.pexels.com/video-files/3209148/3209148-hd_1280_720_25fps.mp4',
        thumbnail: 'https://images.pexels.com/videos/3209148/pictures/preview-0.jpg',
        query: 'focus',
        source: 'Pexels',
      },
    ],
    icons: [
      {
        title: 'mindfulness',
        iconId: 'material-symbols:mindfulness',
        query: 'mindfulness',
        source: 'Iconify',
      },
      {
        title: 'mindfulness-outline',
        iconId: 'material-symbols:mindfulness-outline',
        query: 'mindfulness',
        source: 'Iconify',
      },
      {
        title: 'mindfulness-outline-rounded',
        iconId: 'material-symbols:mindfulness-outline-rounded',
        query: 'mindfulness',
        source: 'Iconify',
      },
      {
        title: 'mindfulness-outline-sharp',
        iconId: 'material-symbols:mindfulness-outline-sharp',
        query: 'mindfulness',
        source: 'Iconify',
      },
      {
        title: 'mindfulness-rounded',
        iconId: 'material-symbols:mindfulness-rounded',
        query: 'mindfulness',
        source: 'Iconify',
      },
      {
        title: 'mindfulness-sharp',
        iconId: 'material-symbols:mindfulness-sharp',
        query: 'mindfulness',
        source: 'Iconify',
      },
      {
        title: 'mindfulness',
        iconId: 'material-symbols-light:mindfulness',
        query: 'mindfulness',
        source: 'Iconify',
      },
      {
        title: 'mindfulness-outline',
        iconId: 'material-symbols-light:mindfulness-outline',
        query: 'mindfulness',
        source: 'Iconify',
      },
      {
        title: 'mindfulness-outline-rounded',
        iconId: 'material-symbols-light:mindfulness-outline-rounded',
        query: 'mindfulness',
        source: 'Iconify',
      },
      {
        title: 'mindfulness-outline-sharp',
        iconId: 'material-symbols-light:mindfulness-outline-sharp',
        query: 'mindfulness',
        source: 'Iconify',
      },
      {
        title: 'google-developers',
        iconId: 'logos:google-developers',
        query: 'developers',
        source: 'Iconify',
      },
      {
        title: 'xdadevelopers',
        iconId: 'simple-icons:xdadevelopers',
        query: 'developers',
        source: 'Iconify',
      },
      {
        title: 'xdadevelopers',
        iconId: 'arcticons:xdadevelopers',
        query: 'developers',
        source: 'Iconify',
      },
      {
        title: 'productivity',
        iconId: 'material-symbols:productivity',
        query: 'productivity',
        source: 'Iconify',
      },
      {
        title: 'productivity-outline',
        iconId: 'material-symbols:productivity-outline',
        query: 'productivity',
        source: 'Iconify',
      },
      {
        title: 'productivity',
        iconId: 'material-symbols-light:productivity',
        query: 'productivity',
        source: 'Iconify',
      },
      {
        title: 'productivity-outline',
        iconId: 'material-symbols-light:productivity-outline',
        query: 'productivity',
        source: 'Iconify',
      },
      {
        title: 'productivity',
        iconId: 'arcticons:productivity',
        query: 'productivity',
        source: 'Iconify',
      },
      {
        title: 'productivity-launcher',
        iconId: 'arcticons:productivity-launcher',
        query: 'productivity',
        source: 'Iconify',
      },
      {
        title: 'meditation',
        iconId: 'mdi:meditation',
        query: 'meditation',
        source: 'Iconify',
      },
      {
        title: 'meditation-bold',
        iconId: 'solar:meditation-bold',
        query: 'meditation',
        source: 'Iconify',
      },
      {
        title: 'meditation-bold-duotone',
        iconId: 'solar:meditation-bold-duotone',
        query: 'meditation',
        source: 'Iconify',
      },
      {
        title: 'meditation-broken',
        iconId: 'solar:meditation-broken',
        query: 'meditation',
        source: 'Iconify',
      },
      {
        title: 'meditation-line-duotone',
        iconId: 'solar:meditation-line-duotone',
        query: 'meditation',
        source: 'Iconify',
      },
      {
        title: 'meditation-linear',
        iconId: 'solar:meditation-linear',
        query: 'meditation',
        source: 'Iconify',
      },
      {
        title: 'meditation-outline',
        iconId: 'solar:meditation-outline',
        query: 'meditation',
        source: 'Iconify',
      },
      {
        title: 'meditation',
        iconId: 'picon:meditation',
        query: 'meditation',
        source: 'Iconify',
      },
      {
        title: 'meditation',
        iconId: 'game-icons:meditation',
        query: 'meditation',
        source: 'Iconify',
      },
      {
        title: 'ez-meditation',
        iconId: 'arcticons:ez-meditation',
        query: 'meditation',
        source: 'Iconify',
      },
      {
        title: 'focus',
        iconId: 'tabler:focus',
        query: 'focus',
        source: 'Iconify',
      },
      {
        title: 'focus-fill',
        iconId: 'ri:focus-fill',
        query: 'focus',
        source: 'Iconify',
      },
      {
        title: 'focus-line',
        iconId: 'ri:focus-line',
        query: 'focus',
        source: 'Iconify',
      },
      {
        title: 'focus',
        iconId: 'lucide:focus',
        query: 'focus',
        source: 'Iconify',
      },
      {
        title: 'focus',
        iconId: 'uil:focus',
        query: 'focus',
        source: 'Iconify',
      },
      {
        title: 'focus',
        iconId: 'tdesign:focus',
        query: 'focus',
        source: 'Iconify',
      },
      {
        title: 'focus-filled',
        iconId: 'tdesign:focus-filled',
        query: 'focus',
        source: 'Iconify',
      },
      {
        title: 'focus',
        iconId: 'mage:focus',
        query: 'focus',
        source: 'Iconify',
      },
      {
        title: 'focus-fill',
        iconId: 'mage:focus-fill',
        query: 'focus',
        source: 'Iconify',
      },
      {
        title: 'focus',
        iconId: 'icon-park-outline:focus',
        query: 'focus',
        source: 'Iconify',
      },
      {
        title: 'bars',
        iconId: 'fa-solid-bars',
        name: 'bars',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/bars.svg',
        query: 'mindfulness',
        source: 'FontAwesome',
      },
      {
        title: 'th',
        iconId: 'fa-solid-th',
        name: 'th',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th.svg',
        query: 'mindfulness',
        source: 'FontAwesome',
      },
      {
        title: 'th large',
        iconId: 'fa-solid-th-large',
        name: 'th-large',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th-large.svg',
        query: 'mindfulness',
        source: 'FontAwesome',
      },
      {
        title: 'th list',
        iconId: 'fa-solid-th-list',
        name: 'th-list',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th-list.svg',
        query: 'mindfulness',
        source: 'FontAwesome',
      },
      {
        title: 'ellipsis h',
        iconId: 'fa-solid-ellipsis-h',
        name: 'ellipsis-h',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/ellipsis-h.svg',
        query: 'mindfulness',
        source: 'FontAwesome',
      },
      {
        title: 'ellipsis v',
        iconId: 'fa-solid-ellipsis-v',
        name: 'ellipsis-v',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/ellipsis-v.svg',
        query: 'mindfulness',
        source: 'FontAwesome',
      },
      {
        title: 'cog',
        iconId: 'fa-solid-cog',
        name: 'cog',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/cog.svg',
        query: 'mindfulness',
        source: 'FontAwesome',
      },
      {
        title: 'cogs',
        iconId: 'fa-solid-cogs',
        name: 'cogs',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/cogs.svg',
        query: 'mindfulness',
        source: 'FontAwesome',
      },
      {
        title: 'sliders h',
        iconId: 'fa-solid-sliders-h',
        name: 'sliders-h',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/sliders-h.svg',
        query: 'mindfulness',
        source: 'FontAwesome',
      },
      {
        title: 'tools',
        iconId: 'fa-solid-tools',
        name: 'tools',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/tools.svg',
        query: 'mindfulness',
        source: 'FontAwesome',
      },
      {
        title: 'bars',
        iconId: 'fa-solid-bars',
        name: 'bars',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/bars.svg',
        query: 'developers',
        source: 'FontAwesome',
      },
      {
        title: 'th',
        iconId: 'fa-solid-th',
        name: 'th',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th.svg',
        query: 'developers',
        source: 'FontAwesome',
      },
      {
        title: 'th large',
        iconId: 'fa-solid-th-large',
        name: 'th-large',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th-large.svg',
        query: 'developers',
        source: 'FontAwesome',
      },
      {
        title: 'th list',
        iconId: 'fa-solid-th-list',
        name: 'th-list',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th-list.svg',
        query: 'developers',
        source: 'FontAwesome',
      },
      {
        title: 'ellipsis h',
        iconId: 'fa-solid-ellipsis-h',
        name: 'ellipsis-h',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/ellipsis-h.svg',
        query: 'developers',
        source: 'FontAwesome',
      },
      {
        title: 'ellipsis v',
        iconId: 'fa-solid-ellipsis-v',
        name: 'ellipsis-v',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/ellipsis-v.svg',
        query: 'developers',
        source: 'FontAwesome',
      },
      {
        title: 'cog',
        iconId: 'fa-solid-cog',
        name: 'cog',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/cog.svg',
        query: 'developers',
        source: 'FontAwesome',
      },
      {
        title: 'cogs',
        iconId: 'fa-solid-cogs',
        name: 'cogs',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/cogs.svg',
        query: 'developers',
        source: 'FontAwesome',
      },
      {
        title: 'sliders h',
        iconId: 'fa-solid-sliders-h',
        name: 'sliders-h',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/sliders-h.svg',
        query: 'developers',
        source: 'FontAwesome',
      },
      {
        title: 'tools',
        iconId: 'fa-solid-tools',
        name: 'tools',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/tools.svg',
        query: 'developers',
        source: 'FontAwesome',
      },
      {
        title: 'bars',
        iconId: 'fa-solid-bars',
        name: 'bars',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/bars.svg',
        query: 'productivity',
        source: 'FontAwesome',
      },
      {
        title: 'th',
        iconId: 'fa-solid-th',
        name: 'th',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th.svg',
        query: 'productivity',
        source: 'FontAwesome',
      },
      {
        title: 'th large',
        iconId: 'fa-solid-th-large',
        name: 'th-large',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th-large.svg',
        query: 'productivity',
        source: 'FontAwesome',
      },
      {
        title: 'th list',
        iconId: 'fa-solid-th-list',
        name: 'th-list',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th-list.svg',
        query: 'productivity',
        source: 'FontAwesome',
      },
      {
        title: 'ellipsis h',
        iconId: 'fa-solid-ellipsis-h',
        name: 'ellipsis-h',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/ellipsis-h.svg',
        query: 'productivity',
        source: 'FontAwesome',
      },
      {
        title: 'ellipsis v',
        iconId: 'fa-solid-ellipsis-v',
        name: 'ellipsis-v',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/ellipsis-v.svg',
        query: 'productivity',
        source: 'FontAwesome',
      },
      {
        title: 'cog',
        iconId: 'fa-solid-cog',
        name: 'cog',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/cog.svg',
        query: 'productivity',
        source: 'FontAwesome',
      },
      {
        title: 'cogs',
        iconId: 'fa-solid-cogs',
        name: 'cogs',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/cogs.svg',
        query: 'productivity',
        source: 'FontAwesome',
      },
      {
        title: 'sliders h',
        iconId: 'fa-solid-sliders-h',
        name: 'sliders-h',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/sliders-h.svg',
        query: 'productivity',
        source: 'FontAwesome',
      },
      {
        title: 'tools',
        iconId: 'fa-solid-tools',
        name: 'tools',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/tools.svg',
        query: 'productivity',
        source: 'FontAwesome',
      },
      {
        title: 'bars',
        iconId: 'fa-solid-bars',
        name: 'bars',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/bars.svg',
        query: 'meditation',
        source: 'FontAwesome',
      },
      {
        title: 'th',
        iconId: 'fa-solid-th',
        name: 'th',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th.svg',
        query: 'meditation',
        source: 'FontAwesome',
      },
      {
        title: 'th large',
        iconId: 'fa-solid-th-large',
        name: 'th-large',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th-large.svg',
        query: 'meditation',
        source: 'FontAwesome',
      },
      {
        title: 'th list',
        iconId: 'fa-solid-th-list',
        name: 'th-list',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th-list.svg',
        query: 'meditation',
        source: 'FontAwesome',
      },
      {
        title: 'ellipsis h',
        iconId: 'fa-solid-ellipsis-h',
        name: 'ellipsis-h',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/ellipsis-h.svg',
        query: 'meditation',
        source: 'FontAwesome',
      },
      {
        title: 'ellipsis v',
        iconId: 'fa-solid-ellipsis-v',
        name: 'ellipsis-v',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/ellipsis-v.svg',
        query: 'meditation',
        source: 'FontAwesome',
      },
      {
        title: 'cog',
        iconId: 'fa-solid-cog',
        name: 'cog',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/cog.svg',
        query: 'meditation',
        source: 'FontAwesome',
      },
      {
        title: 'cogs',
        iconId: 'fa-solid-cogs',
        name: 'cogs',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/cogs.svg',
        query: 'meditation',
        source: 'FontAwesome',
      },
      {
        title: 'sliders h',
        iconId: 'fa-solid-sliders-h',
        name: 'sliders-h',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/sliders-h.svg',
        query: 'meditation',
        source: 'FontAwesome',
      },
      {
        title: 'tools',
        iconId: 'fa-solid-tools',
        name: 'tools',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/tools.svg',
        query: 'meditation',
        source: 'FontAwesome',
      },
      {
        title: 'bars',
        iconId: 'fa-solid-bars',
        name: 'bars',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/bars.svg',
        query: 'focus',
        source: 'FontAwesome',
      },
      {
        title: 'th',
        iconId: 'fa-solid-th',
        name: 'th',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th.svg',
        query: 'focus',
        source: 'FontAwesome',
      },
      {
        title: 'th large',
        iconId: 'fa-solid-th-large',
        name: 'th-large',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th-large.svg',
        query: 'focus',
        source: 'FontAwesome',
      },
      {
        title: 'th list',
        iconId: 'fa-solid-th-list',
        name: 'th-list',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/th-list.svg',
        query: 'focus',
        source: 'FontAwesome',
      },
      {
        title: 'ellipsis h',
        iconId: 'fa-solid-ellipsis-h',
        name: 'ellipsis-h',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/ellipsis-h.svg',
        query: 'focus',
        source: 'FontAwesome',
      },
      {
        title: 'ellipsis v',
        iconId: 'fa-solid-ellipsis-v',
        name: 'ellipsis-v',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/ellipsis-v.svg',
        query: 'focus',
        source: 'FontAwesome',
      },
      {
        title: 'cog',
        iconId: 'fa-solid-cog',
        name: 'cog',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/cog.svg',
        query: 'focus',
        source: 'FontAwesome',
      },
      {
        title: 'cogs',
        iconId: 'fa-solid-cogs',
        name: 'cogs',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/cogs.svg',
        query: 'focus',
        source: 'FontAwesome',
      },
      {
        title: 'sliders h',
        iconId: 'fa-solid-sliders-h',
        name: 'sliders-h',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/sliders-h.svg',
        query: 'focus',
        source: 'FontAwesome',
      },
      {
        title: 'tools',
        iconId: 'fa-solid-tools',
        name: 'tools',
        url: 'https://ka-f.fontawesome.com/releases/v6.0.0/svgs/solid/tools.svg',
        query: 'focus',
        source: 'FontAwesome',
      },
    ],
  },
};

export const examplePage = {
  page_name: 'Landing Page',
  page_description:
    'An inviting landing page for the TerraGrow Hydroponics Masterclass, featuring a lush urban hydroponic garden visual, information on course offerings, instructor bio, student success stories, and pricing tiers.',
  sections: [
    {
      section_name: 'Hero Section',
      section_description:
        'Displays a lush urban hydroponic garden visual with headline and compelling CTA "Enroll in TerraGrow Masterclass."',
      src: {
        html: '<section id="hero" class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-100 to-secondary/10 overflow-hidden">\n  <!-- Lush Urban Hydroponic Garden Visual -->\n  <div class="absolute inset-0 z-0">\n    <video autoplay loop muted playsinline class="object-cover w-full h-full brightness-90">\n      <source src="https://videos.pexels.com/video-files/3195351/3195351-uhd_3840_2160_25fps.mp4" type="video/mp4" />\n    </video>\n    <div class="absolute inset-0 bg-gradient-to-b from-base-100/70 to-primary/40 backdrop-blur-sm"></div>\n  </div>\n\n  <!-- Main Content -->\n  <div class="relative z-10 flex flex-col items-center text-center px-4 max-w-2xl mx-auto" data-aos="fade-up">\n    <div class="inline-flex items-center gap-3 bg-primary/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow">\n      <iconify-icon icon="mdi:leaf" class="text-primary text-2xl"></iconify-icon>\n      <span class="font-medium text-primary">TerraGrow Hydroponics Masterclass</span>\n    </div>\n    <h1 class="text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-base-content mb-4 drop-shadow-lg">\n      Grow Greener in the City\n    </h1>\n    <p class="mt-2 mb-8 text-lg sm:text-xl opacity-80 max-w-xl mx-auto">\n      Discover the art and science of soil-free urban farming. Learn expert hydroponic techniques and start your journey to sustainable, homegrown harvests—no backyard required!\n    </p>\n    <button id="enroll-btn" class="btn btn-primary btn-lg rounded-full shadow-xl flex items-center gap-2 px-8 transition-transform duration-200 hover:scale-105">\n      <iconify-icon icon="mdi:seedling" class="text-xl"></iconify-icon>\n      Enroll in TerraGrow Masterclass\n    </button>\n    <div class="mt-8 flex flex-wrap gap-6 justify-center">\n      <div class="stats bg-base-100/80 shadow rounded-card">\n        <div class="stat">\n          <div class="stat-title">Hands-On Modules</div>\n          <div class="stat-value text-primary">8+</div>\n        </div>\n      </div>\n      <div class="stats bg-base-100/80 shadow rounded-card">\n        <div class="stat">\n          <div class="stat-title">Expert Instructor</div>\n          <div class="stat-value text-secondary">15+ yrs</div>\n        </div>\n      </div>\n      <div class="stats bg-base-100/80 shadow rounded-card">\n        <div class="stat">\n          <div class="stat-title">Urban Growers Helped</div>\n          <div class="stat-value text-accent">1,200+</div>\n        </div>\n      </div>\n    </div>\n    <div class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-80">\n      <iconify-icon icon="mdi:clock-fast" class="text-primary text-2xl"></iconify-icon>\n      <span class="text-sm">Limited spots. Next cohort starts <span class="font-semibold">June 10</span></span>\n    </div>\n  </div>\n</section>',
        js: "<script>\ndocument.addEventListener('DOMContentLoaded', function() {\n  const enrollBtn = document.getElementById('enroll-btn');\n  enrollBtn.addEventListener('click', function() {\n    // Smooth scroll to pricing tiers or enrollment section\n    const pricing = document.getElementById('pricing-tiers') || document.getElementById('pricing');\n    if (pricing) {\n      pricing.scrollIntoView({ behavior: 'smooth' });\n    } else {\n      // fallback: show toast notification\n      const toast = document.createElement('div');\n      toast.className = 'toast toast-end';\n      toast.innerHTML = `\n        <div class=\"alert alert-info\">\n          <iconify-icon icon=\"mdi:information\"></iconify-icon>\n          <span>Scroll down to see enrollment options!</span>\n        </div>\n      `;\n      document.body.appendChild(toast);\n      setTimeout(() => { toast.remove(); }, 3000);\n    }\n  });\n});\n</script>",
      },
      id: 'hero',
      AI: {
        provider: 'OpenAI',
        model: 'gpt-4.1',
        temperature: 0.7,
      },
      used_assets: [
        'https://videos.pexels.com/video-files/3195351/3195351-uhd_3840_2160_25fps.mp4',
        'mdi:leaf',
        'mdi:seedling',
        'mdi:clock-fast',
      ],
    },
    {
      section_name: "What You'll Learn",
      section_description:
        'Highlights course content using bullet points and relevant icons to convey key learning points.',
      src: {
        html: '<section id="what-youll-learn" class="py-16 bg-gradient-to-b from-base-100 to-base-200">\n  <div class="max-w-5xl mx-auto px-4">\n    <div class="text-center mb-12">\n      <span class="badge badge-accent badge-outline mb-2">WHAT YOU\'LL LEARN</span>\n      <h2 class="text-4xl font-bold text-base-content mb-4" data-aos="fade-up">Grow Smarter, Greener, Together</h2>\n      <p class="text-lg opacity-80 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="150">The TerraGrow Hydroponics Masterclass arms you with practical knowledge and sustainable techniques to transform any urban space into a thriving, soil-free garden. Dive into expert-led lessons, hands-on modules, and actionable takeaways tailored for eco-conscious city dwellers and aspiring urban farmers.</p>\n    </div>\n    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10" data-bind="learning-points">\n      <div class="card shadow-main bg-base-100 rounded-card p-6 flex flex-col items-center text-center" data-repeat data-aos="fade-up" data-aos-delay="0">\n        <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">\n          <iconify-icon icon="mdi:water-outline" class="text-primary text-3xl"></iconify-icon>\n        </div>\n        <h3 class="card-title text-2xl font-semibold mb-2">Hydroponic Fundamentals</h3>\n        <p class="opacity-80 mb-3">Understand the science behind soilless growing, nutrient cycles, and plant health in urban settings.</p>\n      </div>\n      <div class="card shadow-main bg-base-100 rounded-card p-6 flex flex-col items-center text-center" data-repeat data-aos="fade-up" data-aos-delay="100">\n        <div class="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">\n          <iconify-icon icon="mdi:city-variant-outline" class="text-secondary text-3xl"></iconify-icon>\n        </div>\n        <h3 class="card-title text-2xl font-semibold mb-2">Urban Space Transformation</h3>\n        <p class="opacity-80 mb-3">Learn how to set up vertical gardens, balcony farms, and compact hydroponic systems—even in the smallest apartments.</p>\n      </div>\n      <div class="card shadow-main bg-base-100 rounded-card p-6 flex flex-col items-center text-center" data-repeat data-aos="fade-up" data-aos-delay="200">\n        <div class="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">\n          <iconify-icon icon="mdi:leaf-circle-outline" class="text-accent text-3xl"></iconify-icon>\n        </div>\n        <h3 class="card-title text-2xl font-semibold mb-2">Sustainable Practices</h3>\n        <p class="opacity-80 mb-3">Embrace eco-friendly methods, water conservation, and energy-efficient solutions for healthy, ongoing harvests.</p>\n      </div>\n      <div class="card shadow-main bg-base-100 rounded-card p-6 flex flex-col items-center text-center" data-repeat data-aos="fade-up" data-aos-delay="300">\n        <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">\n          <iconify-icon icon="mdi:tools" class="text-primary text-3xl"></iconify-icon>\n        </div>\n        <h3 class="card-title text-2xl font-semibold mb-2">DIY System Building</h3>\n        <p class="opacity-80 mb-3">Step-by-step guidance to build affordable hydroponic setups using everyday materials—no special tools required.</p>\n      </div>\n      <div class="card shadow-main bg-base-100 rounded-card p-6 flex flex-col items-center text-center" data-repeat data-aos="fade-up" data-aos-delay="400">\n        <div class="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">\n          <iconify-icon icon="mdi:food-apple-outline" class="text-secondary text-3xl"></iconify-icon>\n        </div>\n        <h3 class="card-title text-2xl font-semibold mb-2">Crop Selection & Care</h3>\n        <p class="opacity-80 mb-3">Discover which vegetables, herbs, and greens thrive in hydroponics and how to nurture them from seed to table.</p>\n      </div>\n      <div class="card shadow-main bg-base-100 rounded-card p-6 flex flex-col items-center text-center" data-repeat data-aos="fade-up" data-aos-delay="500">\n        <div class="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">\n          <iconify-icon icon="mdi:account-group-outline" class="text-accent text-3xl"></iconify-icon>\n        </div>\n        <h3 class="card-title text-2xl font-semibold mb-2">Community & Support</h3>\n        <p class="opacity-80 mb-3">Join a passionate network of urban growers for troubleshooting, tips, and ongoing mentorship from industry experts.</p>\n      </div>\n    </div>\n    <div class="mt-14 flex flex-col items-center">\n      <div class="inline-flex items-center gap-3 px-6 py-3 bg-base-200 rounded-full shadow-main" data-aos="fade-up" data-aos-delay="600">\n        <iconify-icon icon="mdi:leaf" class="text-success text-xl"></iconify-icon>\n        <span class="font-medium text-base-content">No green thumb? No problem—TerraGrow is designed for all levels.</span>\n      </div>\n    </div>\n  </div>\n</section>',
        js: "<script>\n// Add subtle card hover effect for interactivity\nconst learnCards = document.querySelectorAll('#what-youll-learn .card');\nlearnCards.forEach(card => {\n  card.addEventListener('mouseenter', function() {\n    this.classList.add('shadow-lg', 'scale-105', 'transition-all', 'duration-300');\n  });\n  card.addEventListener('mouseleave', function() {\n    this.classList.remove('shadow-lg', 'scale-105', 'transition-all', 'duration-300');\n  });\n});\n</script>",
      },
      id: 'what-youll-learn',
      AI: {
        provider: 'OpenAI',
        model: 'gpt-4.1',
        temperature: 0.7,
      },
      used_assets: [
        'mdi:water-outline',
        'mdi:city-variant-outline',
        'mdi:leaf-circle-outline',
        'mdi:tools',
        'mdi:food-apple-outline',
        'mdi:account-group-outline',
        'mdi:leaf',
      ],
    },
    {
      section_name: 'Instructor Bio',
      section_description:
        "Features a concise professional bio with a photo, emphasizing the instructor's expertise.",
      src: {
        html: '<section id="instructor-bio" class="py-16 bg-base-100">\n  <div class="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">\n    <!-- Instructor Photo -->\n    <div class="flex-shrink-0">\n      <div class="avatar">\n        <div class="w-40 h-40 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4 shadow-lg overflow-hidden">\n          <img src="https://i.pravatar.cc/300?img=16" alt="Instructor Photo" class="object-cover w-full h-full" />\n        </div>\n      </div>\n    </div>\n    <!-- Instructor Details -->\n    <div data-aos="fade-left">\n      <div class="flex items-center gap-3 mb-4">\n        <iconify-icon icon="mdi:leaf" class="text-primary text-2xl"></iconify-icon>\n        <span class="badge badge-success badge-outline">Meet Your Instructor</span>\n      </div>\n      <h3 class="text-3xl font-semibold mb-2 text-base-content">Dr. Maya Greenfield</h3>\n      <p class="text-lg font-medium text-primary mb-2">Urban Agriculture Specialist & Hydroponics Pioneer</p>\n      <p class="opacity-80 mb-4 max-w-xl">\n        With over 15 years dedicated to sustainable urban farming, Dr. Greenfield is recognized worldwide for her hands-on hydroponics expertise and innovative teaching approach. She holds a Ph.D. in Plant Sciences and has transformed rooftops and city spaces into thriving gardens across five continents. \n      </p>\n      <ul class="list-none space-y-2 mb-6" data-bind="instructor-highlights">\n        <li data-repeat class="flex items-center gap-2">\n          <iconify-icon icon="mdi:school-outline" class="text-accent text-xl"></iconify-icon>\n          <span>Published author in leading agricultural journals and frequent TEDx speaker</span>\n        </li>\n        <li data-repeat class="flex items-center gap-2">\n          <iconify-icon icon="mdi:city-variant-outline" class="text-secondary text-xl"></iconify-icon>\n          <span>Consulted for over 60 urban hydroponics projects globally</span>\n        </li>\n        <li data-repeat class="flex items-center gap-2">\n          <iconify-icon icon="mdi:hand-heart-outline" class="text-primary text-xl"></iconify-icon>\n          <span>Passionate mentor, empowering 10,000+ students to grow food sustainably</span>\n        </li>\n      </ul>\n      <div class="flex gap-3 items-center">\n        <a href="#student-success" class="btn btn-primary rounded-full px-6 flex items-center gap-2">\n          <iconify-icon icon="mdi:star-circle" class="text-lg"></iconify-icon>\n          See Student Success\n        </a>\n        <a href="#" class="btn btn-outline btn-secondary rounded-full px-6 flex items-center gap-2">\n          <iconify-icon icon="mdi:linkedin" class="text-lg"></iconify-icon>\n          LinkedIn\n        </a>\n      </div>\n    </div>\n  </div>\n</section>',
        js: "<script>\n// Optional: Add hover effect for LinkedIn button\nconst linkedinBtn = document.querySelector('#instructor-bio a.btn-outline');\nif (linkedinBtn) {\n  linkedinBtn.addEventListener('mouseenter', function() {\n    this.classList.add('btn-accent');\n    this.classList.remove('btn-outline', 'btn-secondary');\n  });\n  linkedinBtn.addEventListener('mouseleave', function() {\n    this.classList.remove('btn-accent');\n    this.classList.add('btn-outline', 'btn-secondary');\n  });\n}\n</script>",
      },
      id: 'instructor-bio',
      AI: {
        provider: 'OpenAI',
        model: 'gpt-4.1',
        temperature: 0.7,
      },
      used_assets: [
        'https://i.pravatar.cc/300?img=16',
        'mdi:leaf',
        'mdi:school-outline',
        'mdi:city-variant-outline',
        'mdi:hand-heart-outline',
        'mdi:star-circle',
        'mdi:linkedin',
      ],
    },
    {
      section_name: 'Student Success',
      section_description:
        'Showcases quotes and project photos from successful students, highlighting course impact.',
      src: {
        html: '<section id="student-success" class="py-20 bg-gradient-to-b from-base-100 to-base-200 relative overflow-hidden">\n  <!-- Decorative Hydroponic Blur Elements -->\n  <div class="absolute -top-16 left-0 w-44 h-44 bg-primary/20 rounded-full blur-3xl z-0"></div>\n  <div class="absolute bottom-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl z-0"></div>\n\n  <div class="container mx-auto px-4 relative z-10">\n    <div class="text-center mb-12 max-w-2xl mx-auto">\n      <span class="badge badge-secondary badge-outline mb-3">STUDENT SUCCESS</span>\n      <h2 class="text-4xl md:text-5xl font-bold mb-4 text-base-content" data-aos="fade-up">See Real Results</h2>\n      <p class="text-lg opacity-80 mb-6" data-aos="fade-up" data-aos-delay="100">\n        Meet our thriving alumni! TerraGrow students are transforming their rooftops, balconies, and city spaces into lush, productive gardens. Explore their stories, discover their hydroponic creations, and join a vibrant community of urban growers.\n      </p>\n    </div>\n\n    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-bind="student-stories">\n      <!-- Testimonial 1 -->\n      <div class="card bg-base-100 shadow-main rounded-card overflow-hidden" data-aos="fade-up" data-aos-delay="0" data-repeat>\n        <figure class="relative">\n          <img src="https://img.b2bpic.net/premium-photo/lettuce-growing-greenhouse-vegetable-hydroponic-system-farm_73523-948.jpg" alt="Hydroponic Lettuce Success" class="w-full h-48 object-cover" />\n          <div class="absolute top-2 left-2 bg-primary/90 text-primary-content px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">\n            <iconify-icon icon="mdi:leaf" class="text-base mr-1"></iconify-icon> Urban Rooftop\n          </div>\n        </figure>\n        <div class="card-body flex flex-col gap-2">\n          <div class="flex items-center gap-3 mb-2">\n            <div class="avatar">\n              <div class="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">\n                <img src="https://i.pravatar.cc/100?img=13" alt="Student Photo" />\n              </div>\n            </div>\n            <div>\n              <h4 class="font-bold text-base-content">Emma Rodriguez</h4>\n              <span class="text-xs text-primary font-semibold">Brooklyn, NY</span>\n            </div>\n          </div>\n          <blockquote class="text-base opacity-80 mb-2">“I never thought I could grow my own food in the city. TerraGrow\'s masterclass gave me the confidence and skills to turn my apartment rooftop into a leafy retreat. Harvesting fresh lettuce year-round feels amazing!”</blockquote>\n          <div class="flex items-center gap-2 mt-2">\n            <iconify-icon icon="mdi:star" class="text-accent text-base"></iconify-icon>\n            <span class="text-sm font-medium opacity-70">Project: 32 sqft hydroponic garden</span>\n          </div>\n        </div>\n      </div>\n      \n      <!-- Testimonial 2 -->\n      <div class="card bg-base-100 shadow-main rounded-card overflow-hidden" data-aos="fade-up" data-aos-delay="200" data-repeat>\n        <figure class="relative">\n          <img src="https://images.pexels.com/photos/2886937/pexels-photo-2886937.jpeg" alt="Student Project Microgreens" class="w-full h-48 object-cover" />\n          <div class="absolute top-2 left-2 bg-secondary/90 text-secondary-content px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">\n            <iconify-icon icon="mdi:sprout" class="text-base mr-1"></iconify-icon> Apartment Balcony\n          </div>\n        </figure>\n        <div class="card-body flex flex-col gap-2">\n          <div class="flex items-center gap-3 mb-2">\n            <div class="avatar">\n              <div class="w-12 h-12 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">\n                <img src="https://i.pravatar.cc/100?img=21" alt="Student Photo" />\n              </div>\n            </div>\n            <div>\n              <h4 class="font-bold text-base-content">Harjit Singh</h4>\n              <span class="text-xs text-secondary font-semibold">Toronto, CA</span>\n            </div>\n          </div>\n          <blockquote class="text-base opacity-80 mb-2">“The hands-on lessons and expert tips made hydroponics easy to understand. My microgreens business started as a hobby—now I supply local cafés with fresh, organic greens every week!”</blockquote>\n          <div class="flex items-center gap-2 mt-2">\n            <iconify-icon icon="mdi:star" class="text-accent text-base"></iconify-icon>\n            <span class="text-sm font-medium opacity-70">Launched: Microgreens Startup</span>\n          </div>\n        </div>\n      </div>\n      \n      <!-- Testimonial 3 -->\n      <div class="card bg-base-100 shadow-main rounded-card overflow-hidden" data-aos="fade-up" data-aos-delay="400" data-repeat>\n        <figure class="relative">\n          <img src="https://images.pexels.com/photos/31111077/pexels-photo-31111077.jpeg" alt="Hydroponic Tomato Project" class="w-full h-48 object-cover" />\n          <div class="absolute top-2 left-2 bg-accent/90 text-accent-content px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">\n            <iconify-icon icon="mdi:home-city" class="text-base mr-1"></iconify-icon> Community Garden\n          </div>\n        </figure>\n        <div class="card-body flex flex-col gap-2">\n          <div class="flex items-center gap-3 mb-2">\n            <div class="avatar">\n              <div class="w-12 h-12 rounded-full ring ring-accent ring-offset-base-100 ring-offset-2">\n                <img src="https://i.pravatar.cc/100?img=19" alt="Student Photo" />\n              </div>\n            </div>\n            <div>\n              <h4 class="font-bold text-base-content">Sara Ahmed</h4>\n              <span class="text-xs text-accent font-semibold">London, UK</span>\n            </div>\n          </div>\n          <blockquote class="text-base opacity-80 mb-2">“The community aspect is fantastic! Sharing progress and troubleshooting with fellow learners kept me motivated. Our neighborhood garden now produces plump tomatoes and crisp basil thanks to hydroponics.”</blockquote>\n          <div class="flex items-center gap-2 mt-2">\n            <iconify-icon icon="mdi:star" class="text-accent text-base"></iconify-icon>\n            <span class="text-sm font-medium opacity-70">Impact: 8 families now grow their own food</span>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <!-- CTA -->\n    <div class="mt-16 flex justify-center" data-aos="fade-up" data-aos-delay="600">\n      <a href="#pricing" class="btn btn-primary btn-lg rounded-button px-8 flex items-center gap-2 group shadow-xl transition-transform hover:scale-105">\n        <iconify-icon icon="mdi:rocket-launch" class="text-xl"></iconify-icon>\n        <span>Start Your Success Story</span>\n      </a>\n    </div>\n\n    <!-- Section Footer: Community Stats -->\n    <div class="mt-12 flex flex-wrap justify-center gap-8" data-aos="fade-up" data-aos-delay="800">\n      <div class="stat bg-base-200 rounded-box shadow-sm px-8 py-6 flex flex-col items-center">\n        <div class="stat-figure text-primary mb-2">\n          <iconify-icon icon="mdi:account-group" class="text-3xl"></iconify-icon>\n        </div>\n        <div class="stat-value text-primary">1,200+</div>\n        <div class="stat-title">Active Students</div>\n      </div>\n      <div class="stat bg-base-200 rounded-box shadow-sm px-8 py-6 flex flex-col items-center">\n        <div class="stat-figure text-secondary mb-2">\n          <iconify-icon icon="mdi:leaf" class="text-3xl"></iconify-icon>\n        </div>\n        <div class="stat-value text-secondary">95%</div>\n        <div class="stat-title">Course Completion</div>\n      </div>\n      <div class="stat bg-base-200 rounded-box shadow-sm px-8 py-6 flex flex-col items-center">\n        <div class="stat-figure text-accent mb-2">\n          <iconify-icon icon="mdi:city-variant" class="text-3xl"></iconify-icon>\n        </div>\n        <div class="stat-value text-accent">32</div>\n        <div class="stat-title">Cities Growing Green</div>\n      </div>\n    </div>\n  </div>\n</section>',
        js: "<script>\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Animate stats counters on scroll into view\n  const stats = document.querySelectorAll('#student-success .stat-value');\n  const observer = new IntersectionObserver((entries) => {\n    entries.forEach(entry => {\n      if (entry.isIntersecting && !entry.target.dataset.animated) {\n        const target = entry.target;\n        const value = target.textContent.replace(/[^\\d.]/g, '');\n        const isPercent = target.textContent.trim().endsWith('%');\n        const isPlus = target.textContent.trim().endsWith('+');\n        const intValue = parseFloat(value.replace(/,/g, ''));\n        let current = 0;\n        const increment = Math.max(1, Math.floor(intValue / 80));\n        const suffix = isPercent ? '%' : (isPlus ? '+' : '');\n        target.textContent = suffix;\n        const timer = setInterval(() => {\n          current += increment;\n          if (current >= intValue) {\n            current = intValue;\n            clearInterval(timer);\n          }\n          target.textContent = current.toLocaleString() + suffix;\n        }, 18);\n        target.dataset.animated = \"true\";\n        observer.unobserve(target);\n      }\n    });\n  }, { threshold: 0.5 });\n  stats.forEach(stat => observer.observe(stat));\n\n  // Add hover scale effect to cards\n  document.querySelectorAll('#student-success .card').forEach(card => {\n    card.addEventListener('mouseenter', function() {\n      this.classList.add('scale-105', 'shadow-lg', 'transition-transform', 'duration-300');\n    });\n    card.addEventListener('mouseleave', function() {\n      this.classList.remove('scale-105', 'shadow-lg', 'transition-transform', 'duration-300');\n    });\n  });\n});\n</script>",
      },
      id: 'student-success',
      AI: {
        provider: 'OpenAI',
        model: 'gpt-4.1',
        temperature: 0.7,
      },
      used_assets: [
        'https://img.b2bpic.net/premium-photo/lettuce-growing-greenhouse-vegetable-hydroponic-system-farm_73523-948.jpg',
        'https://i.pravatar.cc/100?img=13',
        'https://images.pexels.com/photos/2886937/pexels-photo-2886937.jpeg',
        'https://i.pravatar.cc/100?img=21',
        'https://images.pexels.com/photos/31111077/pexels-photo-31111077.jpeg',
        'https://i.pravatar.cc/100?img=19',
        'mdi:leaf',
        'mdi:star',
        'mdi:sprout',
        'mdi:home-city',
        'mdi:rocket-launch',
        'mdi:account-group',
        'mdi:city-variant',
      ],
    },
    {
      section_name: 'Pricing Tiers',
      section_description:
        'Compares single course and bundle options, leading to a final enrollment CTA.',
      src: {
        html: '<section id="pricing-tiers" class="py-20 bg-gradient-to-b from-base-100 to-base-200">\n  <div class="max-w-6xl mx-auto px-4">\n    <div class="text-center mb-12">\n      <span class="badge badge-accent badge-outline mb-2">ENROLL NOW</span>\n      <h2 class="text-4xl font-bold text-base-content mb-4" data-aos="fade-up">Choose Your Path to Urban Farming Mastery</h2>\n      <p class="text-lg opacity-80 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="120">Whether you want to test the waters or commit to a complete transformation, TerraGrow offers flexible pricing. Compare options and join a vibrant community of urban growers today.</p>\n    </div>\n    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pb-10" data-bind="pricing-tiers">\n      <!-- Single Course -->\n      <div class="card backdrop-blur-xl shadow-main rounded-card border border-base-300/40 overflow-hidden flex flex-col" data-aos="fade-up" data-aos-delay="0" data-repeat>\n        <div class="bg-primary/10 p-6 text-center">\n          <h3 class="text-2xl font-bold mb-1">Single Course</h3>\n          <p class="opacity-70 mb-4">Instant access to the TerraGrow Hydroponics Masterclass</p>\n          <div class="flex justify-center items-baseline">\n            <span class="text-4xl font-extrabold">$79</span>\n            <span class="text-lg ml-1">one-time</span>\n          </div>\n        </div>\n        <div class="flex-1 p-6 flex flex-col justify-between">\n          <ul class="space-y-3 mb-8">\n            <li class="flex items-center"><iconify-icon icon="mdi:check-circle" class="text-success mr-2"></iconify-icon>Full course access</li>\n            <li class="flex items-center"><iconify-icon icon="mdi:check-circle" class="text-success mr-2"></iconify-icon>Downloadable resources</li>\n            <li class="flex items-center"><iconify-icon icon="mdi:check-circle" class="text-success mr-2"></iconify-icon>Lifetime access</li>\n            <li class="flex items-center opacity-50"><iconify-icon icon="mdi:close-circle" class="text-error mr-2"></iconify-icon>Bonus mini-courses</li>\n            <li class="flex items-center opacity-50"><iconify-icon icon="mdi:close-circle" class="text-error mr-2"></iconify-icon>1-on-1 coaching</li>\n          </ul>\n          <button class="btn btn-primary btn-block rounded-button text-lg enroll-btn" data-tier="single">\n            Enroll Now\n            <iconify-icon icon="mdi:arrow-right" class="ml-2"></iconify-icon>\n          </button>\n        </div>\n      </div>\n      <!-- Bundle -->\n      <div class="card border-2 border-primary/60 backdrop-blur-xl shadow-xl rounded-card transform scale-105 overflow-visible flex flex-col" data-aos="fade-up" data-aos-delay="150" data-repeat>\n        <div class="absolute -top-4 left-0 w-full flex justify-center z-20">\n          <div class="badge badge-secondary badge-lg">BEST VALUE</div>\n        </div>\n        <div class="bg-success/10 p-8 text-center">\n          <h3 class="text-2xl font-bold mb-1">Urban Grower Bundle</h3>\n          <p class="opacity-70 mb-4">Masterclass + Bonus Content + Community</p>\n          <div class="flex justify-center items-baseline">\n            <span class="text-4xl font-extrabold">$199</span>\n            <span class="text-lg ml-1">one-time</span>\n          </div>\n        </div>\n        <div class="flex-1 p-8 flex flex-col justify-between">\n          <ul class="space-y-3 mb-8">\n            <li class="flex items-center"><iconify-icon icon="mdi:check-circle" class="text-success mr-2"></iconify-icon>All Single Course features</li>\n            <li class="flex items-center"><iconify-icon icon="mdi:check-circle" class="text-success mr-2"></iconify-icon>3 Bonus mini-courses</li>\n            <li class="flex items-center"><iconify-icon icon="mdi:check-circle" class="text-success mr-2"></iconify-icon>Private student community</li>\n            <li class="flex items-center"><iconify-icon icon="mdi:check-circle" class="text-success mr-2"></iconify-icon>1-on-1 instructor coaching</li>\n            <li class="flex items-center"><iconify-icon icon="mdi:check-circle" class="text-success mr-2"></iconify-icon>Priority support</li>\n          </ul>\n          <button class="btn btn-secondary btn-block rounded-button text-lg enroll-btn" data-tier="bundle">\n            Get the Bundle\n            <iconify-icon icon="mdi:leaf" class="ml-2"></iconify-icon>\n          </button>\n        </div>\n      </div>\n      <!-- Team/Organization -->\n      <div class="card backdrop-blur-xl shadow-main rounded-card border border-base-300/40 overflow-hidden flex flex-col" data-aos="fade-up" data-aos-delay="300" data-repeat>\n        <div class="bg-secondary/10 p-6 text-center">\n          <h3 class="text-2xl font-bold mb-1">Team/Organization</h3>\n          <p class="opacity-70 mb-4">Group access for schools, startups, or community projects</p>\n          <div class="flex justify-center items-baseline">\n            <span class="text-4xl font-extrabold">Custom</span>\n          </div>\n        </div>\n        <div class="flex-1 p-6 flex flex-col justify-between">\n          <ul class="space-y-3 mb-8">\n            <li class="flex items-center"><iconify-icon icon="mdi:check-circle" class="text-success mr-2"></iconify-icon>All Bundle features</li>\n            <li class="flex items-center"><iconify-icon icon="mdi:check-circle" class="text-success mr-2"></iconify-icon>Bulk enrollment discounts</li>\n            <li class="flex items-center"><iconify-icon icon="mdi:check-circle" class="text-success mr-2"></iconify-icon>Custom onboarding</li>\n            <li class="flex items-center"><iconify-icon icon="mdi:check-circle" class="text-success mr-2"></iconify-icon>Progress tracking dashboard</li>\n            <li class="flex items-center"><iconify-icon icon="mdi:check-circle" class="text-success mr-2"></iconify-icon>Dedicated support</li>\n          </ul>\n          <button class="btn btn-accent btn-block rounded-button text-lg enroll-btn" data-tier="team">\n            Request a Quote\n            <iconify-icon icon="mdi:email" class="ml-2"></iconify-icon>\n          </button>\n        </div>\n      </div>\n    </div>\n    <div class="mt-12 text-center" data-aos="fade-up" data-aos-delay="400">\n      <div class="inline-flex items-center gap-3 bg-base-200/60 px-6 py-3 rounded-full shadow-sm">\n        <iconify-icon icon="mdi:leaf" class="text-primary text-2xl"></iconify-icon>\n        <span class="font-medium text-base-content">Money-back guarantee if you’re not satisfied within 30 days!</span>\n      </div>\n      <div class="mt-6">\n        <button class="btn btn-primary btn-lg rounded-button px-10 shadow-lg enroll-btn" data-tier="cta">\n          <iconify-icon icon="mdi:rocket-launch" class="mr-2"></iconify-icon>\n          Start Your Urban Farming Journey Now\n        </button>\n      </div>\n    </div>\n  </div>\n</section>',
        js: "<script>\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Enrollment Button Feedback\n  const enrollBtns = document.querySelectorAll('.enroll-btn');\n  enrollBtns.forEach(btn => {\n    btn.addEventListener('click', function(e) {\n      e.preventDefault();\n      // Show toast for feedback\n      const toast = document.createElement('div');\n      toast.className = 'toast toast-end z-40';\n      let message = '';\n      if (btn.dataset.tier === 'single') {\n        message = 'You selected the Single Course! Redirecting to secure checkout...';\n      } else if (btn.dataset.tier === 'bundle') {\n        message = 'Unlocking the Bundle! Redirecting to secure checkout...';\n      } else if (btn.dataset.tier === 'team') {\n        message = 'Request received! Our team will contact you for a custom quote.';\n      } else {\n        message = 'Let’s get you started on your urban farming journey!';\n      }\n      toast.innerHTML = `\n        <div class=\"alert alert-success\">\n          <iconify-icon icon=\"mdi:check-circle\"></iconify-icon>\n          <span>${message}</span>\n        </div>\n      `;\n      document.body.appendChild(toast);\n      setTimeout(() => { toast.remove(); }, 3500);\n      // Simulate redirect\n      if (btn.dataset.tier === 'single' || btn.dataset.tier === 'bundle') {\n        setTimeout(() => {\n          window.location.href = 'https://checkout.terragrow.com/' + btn.dataset.tier;\n        }, 1200);\n      } else if (btn.dataset.tier === 'team') {\n        setTimeout(() => {\n          window.location.href = 'mailto:info@terragrow.com?subject=Team%20Enrollment%20Quote';\n        }, 1200);\n      }\n    });\n  });\n});\n</script>",
      },
      id: 'pricing-tiers',
      AI: {
        provider: 'OpenAI',
        model: 'gpt-4.1',
        temperature: 0.7,
      },
      used_assets: [
        'mdi:check-circle',
        'mdi:close-circle',
        'mdi:arrow-right',
        'mdi:leaf',
        'mdi:email',
        'mdi:rocket-launch',
      ],
    },
  ],
};

/**
 * Core building blocks
 */
export const AISchema = z.object({
  provider: z.string().default('openai'),
  model: z.string().default('gpt-4.1'),
  temperature: z.number().optional(),
});

export const SrcSchema = z.object({
  html: z.string().optional(),
  js: z.string().optional(),
  css: z.string().optional(),
});

export const SectionSchema = z.object({
  section_name: z.string(),
  section_description: z.string().optional(),
  src: SrcSchema.optional(),
  id: z.string().optional(),
  AI: AISchema.optional(),
  used_assets: z.array(z.string()).optional(),
});

export const PageSchema = z
  .object({
    page_name: z.string(),
    page_description: z.string().optional(),
    sections: z.array(SectionSchema),
    // allow arbitrary metadata that might appear on pages (e.g. ids, timestamps)
    // keep strict for known keys, but allow unknown keys if needed:
  })
  .strict();

/**
 * Resources
 */
export const ResourceImageSchema = z.object({
  title: z.string().optional(),
  size: z.string().optional(),
  url: z.string().url(),
  query: z.string().optional(),
  source: z.string().optional(),
});

export const ResourceVideoSchema = z.object({
  title: z.string().optional(),
  size: z.string().optional(),
  url: z.string().url(),
  thumbnail: z.string().optional(),
  query: z.string().optional(),
  source: z.string().optional(),
});

export const ResourceIconSchema = z.object({
  title: z.string().optional(),
  iconId: z.string().optional(),
  name: z.string().optional(),
  url: z.string().optional(),
  query: z.string().optional(),
  source: z.string().optional(),
});

/**
 * Design & Theme
 */
const ThemeColorsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string().optional(),
  card: z.string().optional(),
  text: z.string().optional(),
  border: z.string().optional(),
});

const ThemeSchema = z.object({
  colors: z.object({
    light: ThemeColorsSchema,
    dark: ThemeColorsSchema.optional(),
  }),
  typography: z
    .object({
      fontFamily: z.string().optional(),
      fontSize: z.any().optional(),
      lineHeight: z.number().optional(),
    })
    .optional(),
  radius: z
    .object({
      button: z.number().optional(),
      card: z.number().optional(),
    })
    .optional(),
});

/**
 * Page meta used in exampleWebsite.pages array
 */
export const PageMetaSchema = z.object({
  page_name: z.string(),
  page_description: z.string().optional(),
  sections: z
    .array(
      z.object({
        section_name: z.string(),
        section_description: z.string().optional(),
      })
    )
    .optional(),
});

/**
 * Full Website schema
 *
 * Reflects the exampleWebsite plus an additional collection of pages
 * where each entry is a full Page document matching examplePage.
 */
export const WebsiteSchema = z
  .object({
    name: z.string(),
    language: z.string().optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    design: z
      .object({
        style: z.string().optional(),
        theme_name: z.string().optional(),
        theme_icon: z.string().optional(),
        theme: ThemeSchema.optional(),
      })
      .optional(),
    context: z
      .object({
        client_context_summary: z.string().optional(),
        query: z.string().optional(),
        tags: z.array(z.string()).optional(),
        target_audience: z.string().optional(),
        goals: z.string().optional(),
        guidelines: z.string().optional(),
      })
      .optional(),
    // original lightweight pages array (meta)
    pages: z.array(PageMetaSchema).optional(),
    // resources
    resources: z
      .object({
        images: z.array(ResourceImageSchema).optional(),
        videos: z.array(ResourceVideoSchema).optional(),
        icons: z.array(ResourceIconSchema).optional(),
      })
      .optional(),
    // New: a collection/map of full page documents keyed by id or slug.
    // Each value must match the PageSchema (structure of examplePage).
    pagesCollection: z.record(PageSchema).optional(),
  })
  .strict();

/**
 * Type exports
 */
export type AI = z.infer<typeof AISchema>;
export type Src = z.infer<typeof SrcSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Page = z.infer<typeof PageSchema>;

export type ResourceImage = z.infer<typeof ResourceImageSchema>;
export type ResourceVideo = z.infer<typeof ResourceVideoSchema>;
export type ResourceIcon = z.infer<typeof ResourceIconSchema>;

export type Website = z.infer<typeof WebsiteSchema>;
export type WebsitePage = z.infer<typeof PageSchema>;
export type WebsiteTheme = z.infer<typeof ThemeSchema>;
