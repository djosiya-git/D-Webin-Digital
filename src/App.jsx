import { useEffect, useMemo, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import LoginPage from "./LoginPage";
import dwebinLogo from "./assets/dwebin-logo.png";
import {
  createMessage,
  getContentItems,
  getMessages,
  getProjects,
  getSettings,
  getStoredSession,
  logout,
} from "./api";

const Icon = ({ name, size = 20, stroke = 1.9 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  const paths = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    github: (
      <>
        <path d="M15 22v-3.87a3.37 3.37 0 0 0-.94-2.62c3.08-.34 6.32-1.51 6.32-6.84A5.35 5.35 0 0 0 19 4.94 5 5 0 0 0 18.87 1S17.71.66 15 2.48a13.4 13.4 0 0 0-6 0C6.29.66 5.13 1 5.13 1A5 5 0 0 0 5 4.94a5.35 5.35 0 0 0-1.38 3.73c0 5.32 3.23 6.5 6.31 6.84A3.37 3.37 0 0 0 9 18.13V22" />
        <path d="M9 19c-4 .9-5-2-5-2" />
      </>
    ),
    linkedin: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
    mail: (
      <>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </>
    ),
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
    code: (
      <>
        <path d="m16 18 6-6-6-6" />
        <path d="m8 6-6 6 6 6" />
        <path d="m14.5 4-5 16" />
      </>
    ),
    external: (
      <>
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    sparkle: (
      <>
        <path d="m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5L12 3z" />
        <path d="m5 17-.75 2.25L2 20l2.25.75L5 23l.75-2.25L8 20l-2.25-.75L5 17z" />
      </>
    ),
  };
  return <svg {...common}>{paths[name] || paths.code}</svg>;
};

const fallbackProjects = [
  {
    id: 1,
    category: "Web App",
    title: "Sistem Absensi Sekolah",
    desc: "Dashboard absensi siswa dengan notifikasi WhatsApp dan integrasi mesin fingerprint.",
    stack: ["CodeIgniter 4", "MySQL", "Bootstrap"],
    accent: "purple",
    details:
      "Sistem manajemen absensi yang menangani data siswa, log fingerprint, status kehadiran, notifikasi orang tua, serta laporan real-time untuk kebutuhan sekolah.",
    links: { demo: "#contact", github: "https://github.com/" },
  },
  {
    id: 2,
    category: "Frontend",
    title: "Portfolio Developer",
    desc: "Website personal responsif dengan micro-interactions dan pengalaman pengguna modern.",
    stack: ["React", "CSS", "Vite"],
    accent: "blue",
    details:
      "Portfolio yang berfokus pada visual modern, kemudahan navigasi, performa ringan, dan presentasi proyek yang mudah dipahami.",
    links: { demo: "#home", github: "https://github.com/" },
  },
  {
    id: 3,
    category: "Mobile App",
    title: "RefaSpeed POS",
    desc: "Konsep aplikasi kasir mobile untuk transaksi, stok produk, dan laporan penjualan.",
    stack: ["React", "REST API", "MySQL"],
    accent: "orange",
    details:
      "Aplikasi kasir yang dirancang untuk mempercepat transaksi dengan UI sederhana dan laporan yang mudah dibaca oleh pemilik usaha.",
    links: { demo: "#contact", github: "https://github.com/" },
  },
  {
    id: 4,
    category: "Web App",
    title: "PSB & Data Siswa",
    desc: "Pengelolaan informasi pendaftaran sekolah dan data siswa dalam satu dashboard.",
    stack: ["PHP", "MySQL", "DataTables"],
    accent: "green",
    details:
      "Platform administratif yang membantu proses pendaftaran, pencarian data, ekspor laporan, dan pengelolaan data siswa secara lebih terstruktur.",
    links: { demo: "#contact", github: "https://github.com/" },
  },
];

const fallbackServices = [
  [
    "Company Profile",
    "Website profesional untuk memperkenalkan bisnis, layanan, profil usaha, dan kontak dengan tampilan modern.",
  ],
  [
    "Landing Page",
    "Halaman promosi untuk produk, jasa, campaign, atau personal brand yang fokus mendorong calon pelanggan menghubungi Anda.",
  ],
  [
    "Website Sekolah",
    "Website informasi sekolah, profil lembaga, berita, halaman PPDB, dan sistem sederhana sesuai kebutuhan.",
  ],
  [
    "Custom Web App",
    "Dashboard, sistem absensi, data siswa, katalog, atau aplikasi internal yang dibuat mengikuti alur kerja Anda.",
  ],
];

const fallbackPackages = [
  {
    name: "Basic",
    price: "Mulai 750rb",
    desc: "Cocok untuk landing page sederhana atau portfolio personal.",
    items: ["1 halaman", "Responsive mobile", "Form kontak", "Revisi ringan"],
  },
  {
    name: "Standard",
    price: "Mulai 1,5jt",
    desc: "Cocok untuk company profile, jasa, sekolah, atau UMKM.",
    items: [
      "3-5 halaman",
      "Desain custom",
      "Integrasi WhatsApp",
      "Optimasi dasar",
    ],
  },
  {
    name: "Custom",
    price: "Diskusi dulu",
    desc: "Untuk sistem web dengan dashboard, login, database, dan fitur khusus.",
    items: [
      "Fitur sesuai kebutuhan",
      "Admin panel",
      "Database MySQL",
      "Support deploy",
    ],
  },
];

const workflow = [
  [
    "01",
    "Diskusi Kebutuhan",
    "Kita bahas tujuan website, fitur utama, referensi desain, dan target pengguna.",
  ],
  [
    "02",
    "Struktur & Desain",
    "Kami susun halaman, konten utama, dan arah visual agar website mudah dipahami.",
  ],
  [
    "03",
    "Development",
    "Website dibuat responsif, cepat, dan siap dipakai di perangkat desktop maupun mobile.",
  ],
  [
    "04",
    "Revisi & Online",
    "Setelah review, website dirapikan lalu dibantu sampai siap publish.",
  ],
];

const fallbackFaqs = [
  [
    "Berapa lama pengerjaan website?",
    "Landing page biasanya 3-7 hari. Website company profile sekitar 1-2 minggu, tergantung jumlah halaman dan revisi.",
  ],
  [
    "Apakah bisa request desain?",
    "Bisa. Anda boleh membawa referensi, warna brand, logo, atau contoh website yang disukai.",
  ],
  [
    "Apakah sudah termasuk hosting dan domain?",
    "Bisa dibantu setup. Biaya hosting/domain menyesuaikan provider yang dipilih.",
  ],
  [
    "Apakah bisa dibuatkan dashboard admin?",
    "Bisa, terutama untuk proyek custom seperti data siswa, absensi, katalog, atau sistem internal.",
  ],
];

const fallbackSettings = {
  brand_name: "DWebin Digital",
  whatsapp: "6281234567890",
  email: "djosiyawahyudianto14@gmail.com",
  github: "https://github.com/",
  linkedin: "https://www.linkedin.com/",
};

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("portfolio-theme") || "dark",
  );
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(() => getStoredSession());
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [apiError, setApiError] = useState("");
  const [services, setServices] = useState(fallbackServices);
  const [packages, setPackages] = useState(fallbackPackages);
  const [faqs, setFaqs] = useState(fallbackFaqs);
  const [testimonials, setTestimonials] = useState([]);
  const [pageContent, setPageContent] = useState({});
  const [settings, setSettings] = useState(fallbackSettings);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  useEffect(() => {
    Promise.all([
      getProjects(),
      getContentItems("service"),
      getContentItems("pricing"),
      getContentItems("faq"),
      getContentItems("testimonial"),
      getContentItems("page_content"),
      getSettings(),
    ])
      .then(
        ([
          projectData,
          serviceData,
          pricingData,
          faqData,
          testimonialData,
          pageData,
          settingData,
        ]) => {
          setProjects(projectData);
          setServices(serviceData.map((item) => [item.title, item.body]));
          setPackages(
            pricingData.map((item) => ({
              name: item.title,
              price: item.subtitle,
              desc: item.body,
              items: item.meta?.items || [],
            })),
          );
          setFaqs(faqData.map((item) => [item.title, item.body]));
          setTestimonials(testimonialData);
          setPageContent(pageData[0] || {});
          setSettings({ ...fallbackSettings, ...settingData });
          setApiError("");
        },
      )
      .catch(() => {
        setProjects([]);
        setApiError("API belum aktif. Jalankan npm run server.");
      });
  }, []);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    getMessages()
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 },
    );

    window.addEventListener("scroll", onScroll);
    onScroll();

    if (page === "home") {
      window.requestAnimationFrame(() => {
        document.querySelectorAll(".reveal").forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight * 0.95) {
            el.classList.add("is-visible");
          }
          observer.observe(el);
        });
      });
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [
    page,
    projects.length,
    services.length,
    packages.length,
    faqs.length,
    testimonials.length,
  ]);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && setSelectedProject(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filteredProjects = useMemo(() => {
    return activeFilter === "All"
      ? projects
      : projects.filter((project) => project.category === activeFilter);
  }, [activeFilter, projects]);
  const whatsappLink = `https://wa.me/${settings.whatsapp}?text=Halo%20DWebin%20Digital,%20kami%20ingin%20konsultasi%20pembuatan%20website.`;
  const heroTitle =
    pageContent.subtitle || "Website profesional untuk bisnis dan sekolah";
  const heroDescription =
    pageContent.body ||
    "Kami membantu membuat website responsif, cepat, dan mudah digunakan untuk promosi, company profile, sekolah, UMKM, dan sistem web custom.";

  const navLinks = [
    ["Home", "#home"],
    ["Layanan", "#services"],
    ["Paket", "#pricing"],
    ["Portfolio", "#projects"],
    ["FAQ", "#faq"],
    ["Kontak", "#contact"],
  ];

  const closeMenu = () => setIsMenuOpen(false);

  const showHome = () => {
    setPage("home");
    setIsMenuOpen(false);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 0);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(settings.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${settings.email}`;
    }
  };

  const handleContactChange = (event) => {
    setContactForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const submitContact = async (event) => {
    event.preventDefault();

    try {
      const savedMessage = await createMessage(contactForm);
      setMessages((currentMessages) => [savedMessage, ...currentMessages]);
      setContactForm({ name: "", email: "", message: "" });
      setContactStatus(
        "Pesan berhasil dikirim. Kami akan membalas secepatnya.",
      );
    } catch {
      setContactStatus("Pesan belum terkirim. Silakan hubungi via WhatsApp.");
    }
  };

  const logoutAdmin = async () => {
    await logout();
    setUser(null);
    setMessages([]);
    setPage("home");
  };

  if (page === "login") {
    return (
      <LoginPage
        Icon={Icon}
        onBack={showHome}
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
          setPage("admin");
        }}
      />
    );
  }

  if (page === "admin") {
    if (!user) {
      return (
        <LoginPage
          Icon={Icon}
          onBack={showHome}
          onLogin={(loggedInUser) => {
            setUser(loggedInUser);
            setPage("admin");
          }}
        />
      );
    }

    return (
      <AdminDashboard
        projects={projects}
        Icon={Icon}
        user={user}
        messages={messages}
        onBack={showHome}
        onLogout={logoutAdmin}
        onProjectsChange={setProjects}
        onMessagesChange={setMessages}
      />
    );
  }

  return (
    <div className="site-shell">
      <div className="noise" />
      {apiError && <div className="api-banner">{apiError}</div>}
      <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <a
          className="brand"
          href="#home"
          onClick={closeMenu}
          aria-label="Ke beranda"
        >
          <img
            className="brand-logo"
            src={dwebinLogo}
            alt={settings.brand_name || "DWebin Digital"}
          />
        </a>

        <nav className={`nav-links ${isMenuOpen ? "nav-links--open" : ""}`}>
          {navLinks.map(([label, href]) => (
            <a key={label} href={href} onClick={closeMenu}>
              {label}
            </a>
          ))}
          <a
            className="nav-contact"
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
          >
            Konsultasi <Icon name="arrow" size={16} />
          </a>
        </nav>

        <div className="nav-actions">
          <button className="login-button" onClick={() => setPage("login")}>
            Login
          </button>
          <button
            className="theme-button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Ganti tema"
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
          </button>
          <button
            className="menu-button"
            onClick={() => setIsMenuOpen((value) => !value)}
            aria-label="Buka menu"
          >
            <Icon name={isMenuOpen ? "close" : "menu"} size={24} />
          </button>
        </div>
      </header>

      <main>
        <section id="home" className="hero section-wrap">
          <div className="hero-copy reveal is-visible">
            <p className="eyebrow">
              <span className="pulse" /> Jasa pembuatan website
            </p>
            <h1>
              {heroTitle}
              <br />
              <span>yang siap online.</span>
            </h1>
            <p className="hero-description">{heroDescription}</p>
            <div className="hero-cta">
              <a
                className="button button--primary"
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
              >
                Konsultasi gratis <Icon name="arrow" size={18} />
              </a>
              <a className="button button--ghost" href="#pricing">
                <Icon name="external" size={18} /> Lihat paket
              </a>
            </div>
            <div className="hero-meta">
              <span>
                <i /> Website siap mobile
              </span>
              <span>React / PHP / MySQL / Admin Panel</span>
            </div>
          </div>

          <div className="hero-visual reveal is-visible">
            <div className="orb orb--one" />
            <div className="orb orb--two" />
            <div className="hero-card">
              <div className="card-top">
                <span className="fake-window">
                  <i />
                  <i />
                  <i />
                </span>
                <span>website.service</span>
              </div>
              <div className="code-card">
                <p>
                  <span className="token-purple">const</span> developer = {"{"}
                </p>
                <p className="indent">
                  brand: <span className="token-green">'DWebin Digital'</span>,
                </p>
                <p className="indent">
                  service:{" "}
                  <span className="token-green">'Website Development'</span>,
                </p>
                <p className="indent">
                  focus: [<span className="token-green">'Company Profile'</span>
                  , <span className="token-green">'Web App'</span>],
                </p>
                <p className="indent">
                  status: <span className="token-orange">'Developing'</span>
                </p>
                <p>{"}"}</p>
              </div>
              <div className="mini-status">
                <span className="status-icon">
                  <Icon name="sparkle" size={15} />
                </span>
                <div>
                  <small>Siap dibantu</small>
                  <b>Konsultasi kebutuhan website</b>
                </div>
              </div>
            </div>
            <div className="float-card float-card--top">
              <span>01</span>
              <b>Desain rapi</b>
            </div>
            <div className="float-card float-card--bottom">
              <span>02</span>
              <b>Siap online</b>
            </div>
          </div>
        </section>

        <section id="services" className="section-wrap about reveal">
          <div className="section-heading">
            <p className="eyebrow">01 - Layanan</p>
            <h2>
              Website yang dibuat
              <br />
              <span>sesuai kebutuhan.</span>
            </h2>
          </div>
          <div className="about-content">
            <p>
              Fokus kami bukan hanya membuat tampilan yang bagus, tetapi juga
              membuat website yang jelas, mudah dipakai, dan membantu calon
              pelanggan memahami layanan Anda.
            </p>
            <p>
              Cocok untuk sekolah, UMKM, jasa profesional, personal brand,
              sampai sistem internal sederhana yang membutuhkan login,
              dashboard, dan database.
            </p>
            <div className="about-stats">
              <div>
                <b>4</b>
                <span>Jenis layanan</span>
              </div>
              <div>
                <b>3</b>
                <span>Paket fleksibel</span>
              </div>
              <div>
                <b>1</b>
                <span>Diskusi gratis</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-wrap skills reveal">
          <div className="section-heading">
            <p className="eyebrow">02 - Pilihan layanan</p>
            <h2>
              Bisa dibangun untuk
              <br />
              <span>berbagai kebutuhan.</span>
            </h2>
          </div>
          <div className="skills-grid">
            {services.map(([title, detail], index) => (
              <article className="skill-card" key={title}>
                <span className="skill-number">0{index + 1}</span>
                <Icon name="code" size={23} />
                <h3>{title}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="section-wrap pricing reveal">
          <div className="section-heading">
            <p className="eyebrow">03 - Paket harga</p>
            <h2>
              Mulai dari sederhana
              <br />
              <span>sampai custom system.</span>
            </h2>
          </div>
          <div className="pricing-grid">
            {packages.map((item) => (
              <article className="pricing-card" key={item.name}>
                <p>{item.name}</p>
                <h3>{item.price}</h3>
                <span>{item.desc}</span>
                <ul>
                  {item.items.map((feature) => (
                    <li key={feature}>
                      <Icon name="check" size={15} /> {feature}
                    </li>
                  ))}
                </ul>
                <a
                  className="button button--ghost"
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Tanya paket <Icon name="arrow" size={17} />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="process" className="section-wrap process reveal">
          <div className="section-heading">
            <p className="eyebrow">04 - Alur kerja</p>
            <h2>
              Proses jelas dari
              <br />
              <span>diskusi sampai online.</span>
            </h2>
          </div>
          <div className="process-list">
            {workflow.map(([number, title, detail]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className="section-wrap projects reveal">
          <div className="projects-head">
            <div className="section-heading">
              <p className="eyebrow">05 - Portfolio</p>
              <h2>
                Contoh solusi yang
                <br />
                <span>bisa jadi referensi.</span>
              </h2>
            </div>
            <div className="filter-row">
              {["All", "Web App", "Frontend", "Mobile App"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={activeFilter === filter ? "active" : ""}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="projects-grid">
            {filteredProjects.length === 0 && (
              <article className="project-empty">
                <Icon name="external" size={24} />
                <h3>Belum ada portfolio</h3>
                <p>
                  Data portfolio akan tampil setelah ditambahkan dari admin.
                </p>
              </article>
            )}

            {filteredProjects.map((project, index) => (
              <article
                className={`project-card project-card--${project.accent}`}
                key={project.id}
                style={{ "--delay": `${index * 80}ms` }}
              >
                <div className="project-art">
                  <span className="art-grid" />
                  <span className="project-index">0{project.id}</span>
                  <span className="project-shape shape-a" />
                  <span className="project-shape shape-b" />
                </div>
                <div className="project-content">
                  <p className="project-category">{project.category}</p>
                  <h3>{project.title}</h3>
                  <p>{project.desc}</p>
                  <div className="tag-row">
                    {project.stack.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <button
                    className="project-link"
                    onClick={() => setSelectedProject(project)}
                  >
                    Lihat detail <Icon name="arrow" size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="section-wrap faq reveal">
          <div className="section-heading">
            <p className="eyebrow">06 - FAQ</p>
            <h2>
              Pertanyaan yang
              <br />
              <span>sering ditanyakan.</span>
            </h2>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => (
              <article key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </article>
            ))}
          </div>
        </section>

        {testimonials.length > 0 && (
          <section className="section-wrap testimonials reveal">
            <div className="section-heading">
              <p className="eyebrow">07 - Testimoni</p>
              <h2>
                Cerita singkat dari
                <br />
                <span>klien dan partner.</span>
              </h2>
            </div>
            <div className="testimonial-grid">
              {testimonials.map((item) => (
                <article key={item.id}>
                  <span>{"★".repeat(item.meta?.rating || 5)}</span>
                  <p>{item.body}</p>
                  <h3>{item.title}</h3>
                  <small>{item.subtitle}</small>
                </article>
              ))}
            </div>
          </section>
        )}

        <section id="contact" className="section-wrap contact reveal">
          <div className="contact-glow" />
          <div className="contact-content">
            <p className="eyebrow">07 - Kontak</p>
            <h2>
              Siap punya website
              <br />
              <span>yang lebih profesional?</span>
            </h2>
            <p>
              Ceritakan kebutuhan website Anda. Kami bantu arahkan paket, fitur,
              dan estimasi pengerjaan yang paling sesuai.
            </p>
          </div>
          <div className="contact-actions">
            <a
              className="button button--primary whatsapp-button"
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
            >
              Konsultasi via WhatsApp <Icon name="arrow" size={18} />
            </a>
            <button className="email-card" onClick={copyEmail}>
              <span className="email-icon">
                <Icon name={copied ? "check" : "mail"} size={22} />
              </span>
              <span>
                <small>
                  {copied ? "Email berhasil disalin" : "Email kami"}
                </small>
                <b>{settings.email}</b>
              </span>
              <Icon name="arrow" size={20} />
            </button>
            <form className="contact-form" onSubmit={submitContact}>
              <input
                name="name"
                value={contactForm.name}
                onChange={handleContactChange}
                placeholder="Nama Anda"
                required
              />
              <input
                name="email"
                type="email"
                value={contactForm.email}
                onChange={handleContactChange}
                placeholder="Email aktif"
                required
              />
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleContactChange}
                placeholder="Ceritakan kebutuhan website Anda"
                required
              />
              <button className="button button--ghost" type="submit">
                Kirim pesan <Icon name="arrow" size={17} />
              </button>
              {contactStatus && <p>{contactStatus}</p>}
            </form>
            <div className="social-row">
              <a href={settings.github} target="_blank" rel="noreferrer">
                <Icon name="github" size={19} /> GitHub
              </a>
              <a href={settings.linkedin} target="_blank" rel="noreferrer">
                <Icon name="linkedin" size={19} /> LinkedIn
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>
          © {new Date().getFullYear()} DWebin Digital. Dibangun dengan React.
        </p>
        <a href="#home">Kembali ke atas ↑</a>
      </footer>

      {selectedProject && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setSelectedProject(null)}
        >
          <div
            className="project-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="modal-close"
              onClick={() => setSelectedProject(null)}
              aria-label="Tutup detail"
            >
              <Icon name="close" />
            </button>
            <p className="project-category">{selectedProject.category}</p>
            <h3>{selectedProject.title}</h3>
            <p>{selectedProject.details}</p>
            <div className="tag-row">
              {selectedProject.stack.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div className="modal-actions">
              <a
                className="button button--primary"
                href={selectedProject.links.demo}
              >
                Demo <Icon name="arrow" size={18} />
              </a>
              <a
                className="button button--ghost"
                href={selectedProject.links.github}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="github" size={18} /> Source
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
