import { WebsiteTheme } from '@/types/schemaOld';

export const themeIconify = {
  light: 'ph:sun-bold',
  dark: 'ph:moon-bold',
  system: 'ph:desktop-bold',
  cupcake: 'mdi:cupcake',
  bumblebee: 'lucide-lab:bee',
  emerald: 'fa6-solid:gem',
  corporate: 'mdi:office-building',
  synthwave: 'mdi:sine-wave',
  retro: 'fa-solid:camera-retro',
  valentine: 'mdi:heart',
  halloween: 'mdi:halloween',
  garden: 'mdi:flower',
  'webly-light': 'mdi:lightbulb-on',
  'webly-dark': 'mdi:moon-waning-crescent',
  forest: 'mdi:pine-tree',
  aqua: 'mdi:water',
  lofi: 'mdi:fantasy',
  pastel: 'mdi:palette-swatch',
  lemonade: 'mdi:fruit-lemon',
  nord: 'mdi:ice-cream',
  sunset: 'mdi:weather-sunset',
  fantasy: 'mdi:wizard-hat',
  wireframe: 'mdi:pencil-ruler',
  black: 'mdi:circle',
  luxury: 'mdi:crown',
  cmyk: 'mdi:printer',
  autumn: 'mdi:leaf-maple',
  business: 'mdi:briefcase',
  acid: 'mdi:flask',
  night: 'mdi:weather-night',
  winter: 'mdi:snowflake',
  dracula: 'game-icons:vampire-dracula',
};

export const fallbackPage = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Page Not Found</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef);
                    font-family: 'Arial', sans-serif;
                    color: white;
                    text-align: center;
                }
                .container {
                    max-width: 600px;
                    padding: 2rem;
                    animation: fadeIn 1s ease-in-out;
                }
                .emoji {
                    font-size: 72px;
                    margin-bottom: 1rem;
                    animation: bounce 2s infinite;
                }
                h1 {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }
                p {
                    font-size: 1.25rem;
                    opacity: 0.9;
                    line-height: 1.6;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="emoji">🪄</div>
                <h1>Oops! The page seems to have vanished!</h1>
                <p>Looks like this page took a spontaneous vacation. Our digital detectives are on the case, searching through the internet's lost and found.</p>
                <p>In the meantime, perhaps try refreshing or checking back later when it's had time to find its way home.</p>
            </div>
        </body>
    </html>
    `;

export const exampleTheme: WebsiteTheme = {
  colors: {
    light: {
      primary: '#EF4444', // Red
      secondary: '#F97316', // Orange
      accent: '#FB923C', // Light orange as accent
      background: '#FFFFFF',
      card: '#FEF2F2', // Light red tint for cards
      text: '#1E293B',
      border: '#FECACA',
    },
    dark: {
      primary: '#F87171', // Lighter red for dark mode
      secondary: '#FB923C', // Brighter orange for dark mode
      accent: '#FDBA74', // Very light orange as accent
      background: '#0F172A',
      card: '#1E293B', // Darker blue-gray for cards
      text: '#F1F5F9',
      border: '#334155',
    },
  },
  typography: {
    fontFamily: 'Montserrat',
  },
  radius: {
    button: 8,
    card: 8,
  },
};

export const examplePage3 = {
  page_name: 'Nexus Digital Agency',
  sections: [
    {
      section_name: 'Header',
      id: 'header',
      src: {
        html: `<section id="header" class="sticky top-0 z-50 w-full bg-base-100/90 backdrop-blur-sm shadow-sm">
                <div class="navbar container mx-auto px-4">
                    <div class="navbar-start">
                        <a class="flex items-center space-x-2">
                            <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <span class="font-bold text-primary-content text-xl">N</span>
                            </div>
                            <span class="text-xl font-bold">Nexus<span class="text-primary">Digital</span></span>
                        </a>
                    </div>
                    <div class="navbar-center hidden lg:flex">
                        <ul class="menu menu-horizontal px-1 font-medium">
                            <li><a href="#hero">Home</a></li>
                            <li><a href="#services">Services</a></li>
                            <li><a href="#portfolio">Portfolio</a></li>
                            <li><a href="#" class="opacity-50">About</a></li>
                            <li><a href="#" class="opacity-50">Contact</a></li>
                        </ul>
                    </div>
                    <div class="navbar-end">
                        <a class="btn btn-primary btn-sm md:btn-md rounded-btn">Get a Quote</a>
                        <div class="dropdown dropdown-end ml-2 lg:hidden">
                            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                                <iconify-icon icon="mdi:menu" class="text-xl"></iconify-icon>
                            </div>
                            <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-3 shadow bg-base-100 rounded-box w-52">
                                <li><a href="#hero">Home</a></li>
                                <li><a href="#services">Services</a></li>
                                <li><a href="#portfolio">Portfolio</a></li>
                                <li><a href="#" class="opacity-50">About</a></li>
                                <li><a href="#" class="opacity-50">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>`,
        js: `<script>
                window.addEventListener('scroll', function() {
                    const header = document.getElementById('header');
                    if (window.scrollY > 10) {
                        header.classList.add('shadow-md');
                    } else {
                        header.classList.remove('shadow-md');
                    }
                });
            </script>`,
      },
    },
    {
      section_name: 'Hero',
      id: 'hero',
      src: {
        html: `<section id="hero" class="py-16 md:py-28 bg-gradient-to-br from-base-100 to-base-200">
                <div class="container mx-auto px-4">
                    <div class="flex flex-col lg:flex-row items-center gap-12">
                        <div class="lg:w-1/2 space-y-6" data-aos="fade-up">
                            <div class="badge badge-primary">Digital Solutions</div>
                            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">We Create <span class="text-primary">Digital Experiences</span> That Matter</h1>
                            <p class="text-lg opacity-80 max-w-xl">Transform your brand with cutting-edge digital solutions that drive growth and engage your audience.</p>
                            <div class="flex flex-wrap gap-4 pt-4">
                                <button class="btn btn-primary btn-lg rounded-btn">
                                    <span>Our Services</span>
                                    <iconify-icon icon="mdi:arrow-right"></iconify-icon>
                                </button>
                                <button class="btn btn-outline btn-lg rounded-btn">
                                    <iconify-icon icon="mdi:play-circle"></iconify-icon>
                                    <span>Watch Showreel</span>
                                </button>
                            </div>
                            <div class="pt-8 flex gap-8">
                                <div>
                                    <div class="text-3xl font-bold text-primary">250+</div>
                                    <div class="opacity-70">Projects Completed</div>
                                </div>
                                <div>
                                    <div class="text-3xl font-bold text-primary">95%</div>
                                    <div class="opacity-70">Client Satisfaction</div>
                                </div>
                                <div>
                                    <div class="text-3xl font-bold text-primary">15+</div>
                                    <div class="opacity-70">Industry Awards</div>
                                </div>
                            </div>
                        </div>
                        <div class="lg:w-1/2" data-aos="fade-left" data-aos-delay="200">
                            <div class="relative">
                                <div class="absolute -top-6 -right-6 w-64 h-64 bg-primary/10 rounded-full blur-2xl"></div>
                                <div class="absolute -bottom-8 -left-8 w-64 h-64 bg-secondary/10 rounded-full blur-2xl"></div>
                                <img src="https://picsum.photos/id/3/800/600" alt="Digital experience showcase" class="rounded-2xl shadow-lg relative z-10" />
                                <div class="absolute -bottom-5 -right-5 bg-base-200 p-4 rounded-lg shadow-lg z-20 flex items-center gap-3">
                                    <div class="avatar-group -space-x-2">
                                        <div class="avatar">
                                            <div class="w-10 h-10">
                                                <img src="https://i.pravatar.cc/150?img=1" />
                                            </div>
                                        </div>
                                        <div class="avatar">
                                            <div class="w-10 h-10">
                                                <img src="https://i.pravatar.cc/150?img=2" />
                                            </div>
                                        </div>
                                        <div class="avatar">
                                            <div class="w-10 h-10">
                                                <img src="https://i.pravatar.cc/150?img=3" />
                                            </div>
                                        </div>
                                        <div class="avatar placeholder">
                                            <div class="w-10 h-10 bg-primary text-primary-content">
                                                <span>+5</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="font-medium">Our Team</div>
                                        <div class="text-xs opacity-70">Experts in digital</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-wrap justify-center md:justify-between items-center gap-8 mt-20 pt-10 border-t border-base-300" data-aos="fade-up" data-aos-delay="400">
                        <div class="text-2xl font-bold opacity-50">Trusted by leading brands</div>
                        <div class="flex flex-wrap justify-center gap-8 md:gap-12">
                            <div class="flex items-center gap-2 opacity-70">
                                <iconify-icon icon="mdi:microsoft" class="text-3xl"></iconify-icon>
                                <span class="font-medium">Microsoft</span>
                            </div>
                            <div class="flex items-center gap-2 opacity-70">
                                <iconify-icon icon="mdi:google" class="text-3xl"></iconify-icon>
                                <span class="font-medium">Google</span>
                            </div>
                            <div class="flex items-center gap-2 opacity-70">
                                <iconify-icon icon="mdi:amazon" class="text-3xl"></iconify-icon>
                                <span class="font-medium">Amazon</span>
                            </div>
                            <div class="flex items-center gap-2 opacity-70">
                                <iconify-icon icon="mdi:spotify" class="text-3xl"></iconify-icon>
                                <span class="font-medium">Spotify</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>`,
        js: `<script>
                document.addEventListener('DOMContentLoaded', function() {
                    const heroButtons = document.querySelectorAll('#hero .btn');
                    heroButtons.forEach(button => {
                        button.addEventListener('mouseover', function() {
                            this.classList.add('shadow-lg', 'scale-105');
                        });
                        button.addEventListener('mouseout', function() {
                            this.classList.remove('shadow-lg', 'scale-105');
                        });
                    });
                });
            </script>`,
      },
    },
    {
      section_name: 'Services',
      id: 'services',
      src: {
        html: `<section id="services" class="py-16 md:py-24 bg-base-100">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-16">
                        <div class="badge badge-secondary mb-2">Our Expertise</div>
                        <h2 class="text-3xl md:text-4xl font-bold mb-4" data-aos="fade-up">Services We Provide</h2>
                        <p class="text-lg opacity-80 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">We offer a comprehensive range of digital solutions to help your business thrive in the digital landscape.</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div class="card hover:shadow-xl transition-shadow" data-aos="fade-up" data-aos-delay="0">
                            <div class="card-body">
                                <div class="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                                    <iconify-icon icon="mdi:web" class="text-3xl text-primary"></iconify-icon>
                                </div>
                                <h3 class="card-title text-2xl font-bold">Web Development</h3>
                                <p class="opacity-80 mb-6">We create responsive, high-performance websites that deliver exceptional user experiences and drive business results.</p>
                                <div class="card-actions">
                                    <ul class="space-y-2">
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-primary"></iconify-icon>
                                            <span>Custom Website Design</span>
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-primary"></iconify-icon>
                                            <span>E-commerce Solutions</span>
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-primary"></iconify-icon>
                                            <span>CMS Development</span>
                                        </li>
                                    </ul>
                                </div>
                                <div class="card-actions justify-end mt-6">
                                    <button class="btn btn-primary btn-sm rounded-btn">Learn More</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card hover:shadow-xl transition-shadow" data-aos="fade-up" data-aos-delay="100">
                            <div class="card-body">
                                <div class="w-14 h-14 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
                                    <iconify-icon icon="mdi:cellphone" class="text-3xl text-secondary"></iconify-icon>
                                </div>
                                <h3 class="card-title text-2xl font-bold">Mobile App Development</h3>
                                <p class="opacity-80 mb-6">We build native and cross-platform mobile applications that provide seamless experiences across all devices.</p>
                                <div class="card-actions">
                                    <ul class="space-y-2">
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-secondary"></iconify-icon>
                                            <span>iOS & Android Apps</span>
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-secondary"></iconify-icon>
                                            <span>Cross-Platform Solutions</span>
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-secondary"></iconify-icon>
                                            <span>App Store Optimization</span>
                                        </li>
                                    </ul>
                                </div>
                                <div class="card-actions justify-end mt-6">
                                    <button class="btn btn-secondary btn-sm rounded-btn">Learn More</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card hover:shadow-xl transition-shadow" data-aos="fade-up" data-aos-delay="200">
                            <div class="card-body">
                                <div class="w-14 h-14 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                                    <iconify-icon icon="mdi:chart-line" class="text-3xl text-accent"></iconify-icon>
                                </div>
                                <h3 class="card-title text-2xl font-bold">Digital Marketing</h3>
                                <p class="opacity-80 mb-6">We help you reach your target audience and grow your business with data-driven digital marketing strategies.</p>
                                <div class="card-actions">
                                    <ul class="space-y-2">
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-accent"></iconify-icon>
                                            <span>SEO Optimization</span>
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-accent"></iconify-icon>
                                            <span>Social Media Marketing</span>
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-accent"></iconify-icon>
                                            <span>PPC Campaigns</span>
                                        </li>
                                    </ul>
                                </div>
                                <div class="card-actions justify-end mt-6">
                                    <button class="btn btn-accent btn-sm rounded-btn">Learn More</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card hover:shadow-xl transition-shadow" data-aos="fade-up" data-aos-delay="300">
                            <div class="card-body">
                                <div class="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                                    <iconify-icon icon="mdi:palette" class="text-3xl text-primary"></iconify-icon>
                                </div>
                                <h3 class="card-title text-2xl font-bold">UI/UX Design</h3>
                                <p class="opacity-80 mb-6">We create intuitive, user-centered designs that enhance user engagement and deliver exceptional experiences.</p>
                                <div class="card-actions">
                                    <ul class="space-y-2">
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-primary"></iconify-icon>
                                            <span>User Research</span>
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-primary"></iconify-icon>
                                            <span>Wireframing & Prototyping</span>
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-primary"></iconify-icon>
                                            <span>Interactive Design</span>
                                        </li>
                                    </ul>
                                </div>
                                <div class="card-actions justify-end mt-6">
                                    <button class="btn btn-primary btn-sm rounded-btn">Learn More</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card hover:shadow-xl transition-shadow" data-aos="fade-up" data-aos-delay="400">
                            <div class="card-body">
                                <div class="w-14 h-14 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
                                    <iconify-icon icon="mdi:code-braces" class="text-3xl text-secondary"></iconify-icon>
                                </div>
                                <h3 class="card-title text-2xl font-bold">Custom Software</h3>
                                <p class="opacity-80 mb-6">We develop tailored software solutions that address your unique business challenges and drive efficiency.</p>
                                <div class="card-actions">
                                    <ul class="space-y-2">
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-secondary"></iconify-icon>
                                            <span>Enterprise Applications</span>
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-secondary"></iconify-icon>
                                            <span>SaaS Development</span>
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-secondary"></iconify-icon>
                                            <span>API Integration</span>
                                        </li>
                                    </ul>
                                </div>
                                <div class="card-actions justify-end mt-6">
                                    <button class="btn btn-secondary btn-sm rounded-btn">Learn More</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card hover:shadow-xl transition-shadow" data-aos="fade-up" data-aos-delay="500">
                            <div class="card-body">
                                <div class="w-14 h-14 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                                    <iconify-icon icon="mdi:brain" class="text-3xl text-accent"></iconify-icon>
                                </div>
                                <h3 class="card-title text-2xl font-bold">AI Solutions</h3>
                                <p class="opacity-80 mb-6">We leverage artificial intelligence and machine learning to build intelligent applications that automate and optimize processes.</p>
                                <div class="card-actions">
                                    <ul class="space-y-2">
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-accent"></iconify-icon>
                                            <span>Machine Learning Models</span>
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-accent"></iconify-icon>
                                            <span>Natural Language Processing</span>
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <iconify-icon icon="mdi:check-circle" class="text-accent"></iconify-icon>
                                            <span>Predictive Analytics</span>
                                        </li>
                                    </ul>
                                </div>
                                <div class="card-actions justify-end mt-6">
                                    <button class="btn btn-accent btn-sm rounded-btn">Learn More</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>`,
        js: `<script>
                // Add hover effect to service cards
                document.addEventListener('DOMContentLoaded', function() {
                    const cards = document.querySelectorAll('#services .card');
                    cards.forEach(card => {
                        card.addEventListener('mouseover', function() {
                            this.classList.add('shadow-lg');
                            const icon = this.querySelector('iconify-icon');
                            icon.classList.add('scale-110', 'transition-transform', 'duration-300');
                        });
                        
                        card.addEventListener('mouseout', function() {
                            this.classList.remove('shadow-lg');
                            const icon = this.querySelector('iconify-icon');
                            icon.classList.remove('scale-110', 'transition-transform', 'duration-300');
                        });
                    });
                });
            </script>`,
      },
    },
    {
      section_name: 'Portfolio',
      id: 'portfolio',
      src: {
        html: `<section id="portfolio" class="py-16 md:py-24">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-16">
                        <div class="badge badge-primary mb-2">Our Work</div>
                        <h2 class="text-3xl md:text-4xl font-bold mb-4" data-aos="fade-up">Featured Projects</h2>
                        <p class="text-lg opacity-80 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">Explore some of our recent work that showcases our creativity, technical expertise, and attention to detail.</p>
                    </div>
                    
                    <div class="tabs tabs-boxed justify-center mb-10 bg-base-200 max-w-3xl mx-auto p-1 rounded-full" data-aos="fade-up">
                        <button class="tab tab-active" data-filter="all">All Projects</button>
                        <button class="tab" data-filter="web">Web Design</button>
                        <button class="tab" data-filter="mobile">Mobile Apps</button>
                        <button class="tab" data-filter="branding">Branding</button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 portfolio-grid">
                        <div class="card shadow-lg overflow-hidden group" data-category="web" data-aos="fade-up">
                            <figure class="relative">
                                <img src="https://picsum.photos/id/26/600/400" alt="Project 1" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div class="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div class="btn btn-ghost btn-circle bg-base-100/30 backdrop-blur-sm">
                                        <iconify-icon icon="mdi:eye" class="text-2xl text-white"></iconify-icon>
                                    </div>
                                </div>
                            </figure>
                            <div class="card-body">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-primary font-medium">Web Design</span>
                                    <div class="badge badge-ghost">2023</div>
                                </div>
                                <h3 class="card-title text-xl">Artemis Financial Dashboard</h3>
                                <p class="opacity-70">A comprehensive financial analytics platform with real-time data visualization.</p>
                                <div class="card-actions justify-between items-center mt-4">
                                    <div class="flex gap-2">
                                        <div class="badge badge-outline">React</div>
                                        <div class="badge badge-outline">Node.js</div>
                                        <div class="badge badge-outline">D3.js</div>
                                    </div>
                                    <button class="btn btn-sm btn-primary btn-circle">
                                        <iconify-icon icon="mdi:arrow-right" class="text-lg"></iconify-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card shadow-lg overflow-hidden group" data-category="mobile" data-aos="fade-up" data-aos-delay="100">
                            <figure class="relative">
                                <img src="https://picsum.photos/id/60/600/400" alt="Project 2" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div class="absolute inset-0 bg-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div class="btn btn-ghost btn-circle bg-base-100/30 backdrop-blur-sm">
                                        <iconify-icon icon="mdi:eye" class="text-2xl text-white"></iconify-icon>
                                    </div>
                                </div>
                            </figure>
                            <div class="card-body">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-secondary font-medium">Mobile App</span>
                                    <div class="badge badge-ghost">2023</div>
                                </div>
                                <h3 class="card-title text-xl">HealthTrack Pro</h3>
                                <p class="opacity-70">A fitness and health tracking application with personalized coaching features.</p>
                                <div class="card-actions justify-between items-center mt-4">
                                    <div class="flex gap-2">
                                        <div class="badge badge-outline">Flutter</div>
                                        <div class="badge badge-outline">Firebase</div>
                                        <div class="badge badge-outline">ML Kit</div>
                                    </div>
                                    <button class="btn btn-sm btn-secondary btn-circle">
                                        <iconify-icon icon="mdi:arrow-right" class="text-lg"></iconify-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card shadow-lg overflow-hidden group" data-category="branding" data-aos="fade-up" data-aos-delay="200">
                            <figure class="relative">
                                <img src="https://picsum.photos/id/30/600/400" alt="Project 3" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div class="absolute inset-0 bg-accent/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div class="btn btn-ghost btn-circle bg-base-100/30 backdrop-blur-sm">
                                        <iconify-icon icon="mdi:eye" class="text-2xl text-white"></iconify-icon>
                                    </div>
                                </div>
                            </figure>
                            <div class="card-body">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-accent font-medium">Branding</span>
                                    <div class="badge badge-ghost">2022</div>
                                </div>
                                <h3 class="card-title text-xl">Nova Coffee Rebrand</h3>
                                <p class="opacity-70">Complete brand refresh for a premium coffee chain, including logo, packaging, and store design.</p>
                                <div class="card-actions justify-between items-center mt-4">
                                    <div class="flex gap-2">
                                        <div class="badge badge-outline">Branding</div>
                                        <div class="badge badge-outline">Packaging</div>
                                        <div class="badge badge-outline">UI Design</div>
                                    </div>
                                    <button class="btn btn-sm btn-accent btn-circle">
                                        <iconify-icon icon="mdi:arrow-right" class="text-lg"></iconify-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card shadow-lg overflow-hidden group" data-category="web" data-aos="fade-up" data-aos-delay="300">
                            <figure class="relative">
                                <img src="https://picsum.photos/id/64/600/400" alt="Project 4" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div class="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div class="btn btn-ghost btn-circle bg-base-100/30 backdrop-blur-sm">
                                        <iconify-icon icon="mdi:eye" class="text-2xl text-white"></iconify-icon>
                                    </div>
                                </div>
                            </figure>
                            <div class="card-body">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-primary font-medium">Web Design</span>
                                    <div class="badge badge-ghost">2022</div>
                                </div>
                                <h3 class="card-title text-xl">EcoHome Smart System</h3>
                                <p class="opacity-70">An IoT-powered smart home platform that optimizes energy consumption and enhances security.</p>
                                <div class="card-actions justify-between items-center mt-4">
                                    <div class="flex gap-2">
                                        <div class="badge badge-outline">Vue.js</div>
                                        <div class="badge badge-outline">IoT</div>
                                        <div class="badge badge-outline">Python</div>
                                    </div>
                                    <button class="btn btn-sm btn-primary btn-circle">
                                        <iconify-icon icon="mdi:arrow-right" class="text-lg"></iconify-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card shadow-lg overflow-hidden group" data-category="mobile" data-aos="fade-up" data-aos-delay="400">
                            <figure class="relative">
                                <img src="https://picsum.photos/id/25/600/400" alt="Project 5" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div class="absolute inset-0 bg-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div class="btn btn-ghost btn-circle bg-base-100/30 backdrop-blur-sm">
                                        <iconify-icon icon="mdi:eye" class="text-2xl text-white"></iconify-icon>
                                    </div>
                                </div>
                            </figure>
                            <div class="card-body">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-secondary font-medium">Mobile App</span>
                                    <div class="badge badge-ghost">2022</div>
                                </div>
                                <h3 class="card-title text-xl">TravelBuddy Navigator</h3>
                                <p class="opacity-70">A travel companion app featuring AR navigation, local recommendations, and real-time translations.</p>
                                <div class="card-actions justify-between items-center mt-4">
                                    <div class="flex gap-2">
                                        <div class="badge badge-outline">React Native</div>
                                        <div class="badge badge-outline">AR Kit</div>
                                        <div class="badge badge-outline">Maps API</div>
                                    </div>
                                    <button class="btn btn-sm btn-secondary btn-circle">
                                        <iconify-icon icon="mdi:arrow-right" class="text-lg"></iconify-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card shadow-lg overflow-hidden group" data-category="branding" data-aos="fade-up" data-aos-delay="500">
                            <figure class="relative">
                                <img src="https://picsum.photos/id/28/600/400" alt="Project 6" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div class="absolute inset-0 bg-accent/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div class="btn btn-ghost btn-circle bg-base-100/30 backdrop-blur-sm">
                                        <iconify-icon icon="mdi:eye" class="text-2xl text-white"></iconify-icon>
                                    </div>
                                </div>
                            </figure>
                            <div class="card-body">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-accent font-medium">Branding</span>
                                    <div class="badge badge-ghost">2021</div>
                                </div>
                                <h3 class="card-title text-xl">Quantum Athletics</h3>
                                <p class="opacity-70">Brand identity and digital presence for a premium sportswear company targeting urban professionals.</p>
                                <div class="card-actions justify-between items-center mt-4">
                                    <div class="flex gap-2">
                                        <div class="badge badge-outline">Branding</div>
                                        <div class="badge badge-outline">E-commerce</div>
                                        <div class="badge badge-outline">UX Design</div>
                                    </div>
                                    <button class="btn btn-sm btn-accent btn-circle">
                                        <iconify-icon icon="mdi:arrow-right" class="text-lg"></iconify-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center mt-12">
                        <button class="btn btn-primary btn-wide">View All Projects</button>
                    </div>
                </div>
            </section>`,
        js: `<script>
                document.addEventListener('DOMContentLoaded', function() {
                    const tabs = document.querySelectorAll('#portfolio .tab');
                    const projects = document.querySelectorAll('#portfolio .card');
                    
                    tabs.forEach(tab => {
                        tab.addEventListener('click', function() {
                            // Remove active class from all tabs
                            tabs.forEach(t => t.classList.remove('tab-active'));
                            
                            // Add active class to clicked tab
                            this.classList.add('tab-active');
                            
                            const filter = this.dataset.filter;
                            
                            // Filter projects
                            projects.forEach(project => {
                                if (filter === 'all' || project.dataset.category === filter) {
                                    project.style.display = 'block';
                                } else {
                                    project.style.display = 'none';
                                }
                            });
                        });
                    });
                    
                    // Add modal functionality for project previews
                    const viewButtons = document.querySelectorAll('#portfolio .btn-ghost');
                    viewButtons.forEach(button => {
                        button.addEventListener('click', function(e) {
                            e.preventDefault();
                            const projectCard = this.closest('.card');
                            const projectTitle = projectCard.querySelector('.card-title').textContent;
                            const projectImage = projectCard.querySelector('img').src;
                            
                            // Create toast notification
                            const toast = document.createElement('div');
                            toast.className = 'toast toast-end';
                            toast.innerHTML = \`
                                <div class="alert alert-info">
                                    <span>Project "\${projectTitle}" details coming soon!</span>
                                </div>
                            \`;
                            document.body.appendChild(toast);
                            
                            // Remove toast after 3 seconds
                            setTimeout(() => {
                                toast.remove();
                            }, 3000);
                        });
                    });
                });
            </script>`,
      },
    },
  ],
};

export const generateTailwindConfig = (theme: any) => {
  let tailwindConfig = `{
      theme: {},
      plugins: [],
    };`;
  if (theme && Object.keys(theme).length > 0) {
    const { colors, radius, typography } = theme;

    tailwindConfig = `{
                theme: {
                    extend: {
                        colors: {
                            light: ${colors?.light ? JSON.stringify(colors?.light) : '{}'},
                            dark: ${colors?.dark ? JSON.stringify(colors?.dark) : '{}'},
                        },
                        rounded: {
                            'button': "${radius?.button || '8'}px",
                            'card': "${radius?.card || '8'}px",
                        },
                        fontFamily: {
                            sans: "${
                              typography?.fontFamily || 'Montserrat'
                            } , system-ui, sans-serif",
                        },
                    }
                },
                plugins: [window.daisyui],
                };
            `;
  }
  return tailwindConfig;
};
