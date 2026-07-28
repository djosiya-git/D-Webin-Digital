import { useEffect, useMemo, useState } from "react";
import {
  createContentItem,
  createMessage,
  createProject,
  deleteContentItem,
  deleteMessage as removeMessage,
  deleteProject as removeProject,
  getContentItems,
  getSettings,
  reorderContentItems,
  reorderMessages,
  reorderProjects,
  updateContentItem,
  updateMessage,
  updateProject,
  updateSettings,
} from "./api";
import dwebinLogo from "./assets/dwebin-logo.png";

const emptyProjectForm = {
  title: "",
  category: "Web App",
  desc: "",
  stack: "",
  demo: "",
  github: "",
};

const emptyMessageForm = {
  name: "",
  email: "",
  message: "",
};

const emptyContentForm = {
  title: "",
  subtitle: "",
  body: "",
  metaText: "",
};

const hasValue = (values) =>
  values.some((value) => String(value || "").trim().length > 0);

const moveItem = (items, draggedId, targetId) => {
  const fromIndex = items.findIndex((item) => item.id === draggedId);
  const toIndex = items.findIndex((item) => item.id === targetId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items;

  const nextItems = [...items];
  const [draggedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, draggedItem);
  return nextItems.map((item, index) => ({ ...item, sortOrder: index + 1 }));
};

const menuItems = [
  ["dashboard", "Dashboard", "code"],
  ["content", "Konten Website", "external"],
  ["services", "Layanan", "sparkle"],
  ["pricing", "Paket Harga", "check"],
  ["projects", "Portfolio", "external"],
  ["messages", "Pesan Masuk", "mail"],
  ["faq", "FAQ", "code"],
  ["testimonials", "Testimoni", "sparkle"],
  ["settings", "Pengaturan", "sun"],
];

const contentConfig = {
  services: {
    type: "service",
    eyebrow: "Layanan",
    title: "Kelola Layanan",
    subtitleLabel: "Subjudul",
    bodyLabel: "Deskripsi layanan",
    metaPlaceholder: "Kosongkan dulu, opsional",
  },
  pricing: {
    type: "pricing",
    eyebrow: "Paket",
    title: "Kelola Paket Harga",
    subtitleLabel: "Harga",
    bodyLabel: "Deskripsi paket",
    metaPlaceholder: "Fitur, pisahkan dengan koma",
  },
  faq: {
    type: "faq",
    eyebrow: "FAQ",
    title: "Kelola FAQ",
    subtitleLabel: "Kategori atau catatan",
    bodyLabel: "Jawaban",
    metaPlaceholder: "Kosongkan dulu, opsional",
  },
  content: {
    type: "page_content",
    eyebrow: "Konten",
    title: "Kelola Konten Website",
    subtitleLabel: "Subheadline",
    bodyLabel: "Isi konten",
    metaPlaceholder: "Kosongkan dulu, opsional",
  },
  testimonials: {
    type: "testimonial",
    eyebrow: "Testimoni",
    title: "Kelola Testimoni",
    subtitleLabel: "Bisnis / posisi klien",
    bodyLabel: "Isi testimoni",
    metaPlaceholder: "Rating, contoh: 5",
  },
};

function AdminDashboard({
  projects,
  Icon,
  user,
  messages,
  onBack,
  onLogout,
  onProjectsChange,
  onMessagesChange,
}) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [messageForm, setMessageForm] = useState(emptyMessageForm);
  const [contentData, setContentData] = useState({});
  const [contentForm, setContentForm] = useState(emptyContentForm);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContentId, setEditingContentId] = useState(null);
  const [settings, setSettings] = useState({});
  const [settingsStatus, setSettingsStatus] = useState("");
  const [notice, setNotice] = useState(null);
  const [dragging, setDragging] = useState(null);

  const uniqueCategories = useMemo(
    () => [...new Set(projects.map((project) => project.category))],
    [projects],
  );
  const activeConfig = contentConfig[activeMenu];

  useEffect(() => {
    const configs = Object.values(contentConfig);

    Promise.all(configs.map((config) => getContentItems(config.type)))
      .then((results) => {
        const nextData = {};
        configs.forEach((config, index) => {
          nextData[config.type] = results[index];
        });
        setContentData(nextData);
      })
      .catch(() => setContentData({}));

    getSettings()
      .then(setSettings)
      .catch(() => setSettings({}));
  }, []);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const showNotice = (message, type = "success") => {
    setNotice({ message, type, id: Date.now() });
  };

  const startDrag = (type, itemId) => {
    setDragging({ type, itemId });
  };

  const allowDrop = (event) => {
    event.preventDefault();
  };

  const finishDrag = () => {
    setDragging(null);
  };

  const reorderProjectItems = async (targetId) => {
    if (!dragging || dragging.type !== "projects") return;
    const nextProjects = moveItem(projects, dragging.itemId, targetId);
    if (nextProjects === projects) return;

    onProjectsChange(nextProjects);
    setDragging(null);

    try {
      await reorderProjects(nextProjects.map((project) => project.id));
      showNotice("Urutan portfolio berhasil disimpan.");
    } catch (error) {
      showNotice(error.message || "Urutan portfolio gagal disimpan.", "error");
    }
  };

  const reorderMessageItems = async (targetId) => {
    if (!dragging || dragging.type !== "messages") return;
    const nextMessages = moveItem(messages, dragging.itemId, targetId);
    if (nextMessages === messages) return;

    onMessagesChange(nextMessages);
    setDragging(null);

    try {
      await reorderMessages(nextMessages.map((message) => message.id));
      showNotice("Urutan pesan berhasil disimpan.");
    } catch (error) {
      showNotice(error.message || "Urutan pesan gagal disimpan.", "error");
    }
  };

  const reorderContentList = async (config, targetId) => {
    if (!dragging || dragging.type !== config.type) return;
    const items = contentData[config.type] || [];
    const nextItems = moveItem(items, dragging.itemId, targetId);
    if (nextItems === items) return;

    setContentData((currentData) => ({
      ...currentData,
      [config.type]: nextItems,
    }));
    setDragging(null);

    try {
      await reorderContentItems(config.type, nextItems.map((item) => item.id));
      showNotice(`Urutan ${config.eyebrow} berhasil disimpan.`);
    } catch (error) {
      showNotice(error.message || `Urutan ${config.eyebrow} gagal disimpan.`, "error");
    }
  };

  const pageTitle =
    activeMenu === "dashboard"
      ? "Dashboard Admin"
      : activeMenu === "projects"
        ? "Portfolio / Proyek"
        : activeMenu === "messages"
          ? "Pesan Masuk"
          : activeMenu === "settings"
            ? "Pengaturan Website"
            : activeConfig?.title || "Admin";

  const pageDescription =
    activeMenu === "dashboard"
      ? "Kelola isi website jasa, portfolio, pesan masuk, dan pengaturan dari satu tempat."
      : "Gunakan menu ini untuk memperbarui konten yang tampil di website jasa.";

  const handleProjectChange = (event) => {
    setProjectForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const saveProject = async (event) => {
    event.preventDefault();
    const currentProject = projects.find((project) => project.id === editingProjectId);
    const newProject = {
      category: projectForm.category,
      title: projectForm.title,
      desc: projectForm.desc,
      stack: projectForm.stack
        .split(",")
        .map((stack) => stack.trim())
        .filter(Boolean),
      accent: "blue",
      details: projectForm.desc,
      links: {
        demo: projectForm.demo || "#contact",
        github: projectForm.github || "https://github.com/",
      },
      sortOrder: currentProject?.sortOrder || projects.length + 1,
    };

    try {
      if (editingProjectId) {
        const savedProject = await updateProject(editingProjectId, newProject);
        onProjectsChange(
          projects.map((project) =>
            project.id === editingProjectId ? savedProject : project,
          ),
        );
        setEditingProjectId(null);
        showNotice("Proyek berhasil diperbarui.");
      } else {
        const savedProject = await createProject(newProject);
        onProjectsChange([savedProject, ...projects]);
        showNotice("Proyek berhasil ditambahkan.");
      }

      setProjectForm(emptyProjectForm);
    } catch (error) {
      showNotice(error.message || "Proyek gagal disimpan.", "error");
    }
  };

  const startEditProject = (project) => {
    setEditingProjectId(project.id);
    setProjectForm({
      title: project.title,
      category: project.category,
      desc: project.desc,
      stack: project.stack.join(", "),
      demo: project.links.demo,
      github: project.links.github,
    });
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setProjectForm(emptyProjectForm);
  };

  const deleteProject = async (projectId) => {
    try {
      await removeProject(projectId);
      onProjectsChange(projects.filter((project) => project.id !== projectId));
      showNotice("Proyek berhasil dihapus.");
    } catch (error) {
      showNotice(error.message || "Proyek gagal dihapus.", "error");
    }
  };

  const handleMessageChange = (event) => {
    setMessageForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const saveMessage = async (event) => {
    event.preventDefault();

    try {
      if (editingMessageId) {
        const currentMessage = messages.find(
          (message) => message.id === editingMessageId,
        );
        const savedMessage = await updateMessage(editingMessageId, {
          ...messageForm,
          sortOrder: currentMessage?.sortOrder || messages.length + 1,
        });
        onMessagesChange(
          messages.map((message) =>
            message.id === editingMessageId ? savedMessage : message,
          ),
        );
        setEditingMessageId(null);
        showNotice("Pesan berhasil diperbarui.");
      } else {
        const savedMessage = await createMessage(messageForm);
        onMessagesChange([savedMessage, ...messages]);
        showNotice("Pesan berhasil ditambahkan.");
      }

      setMessageForm(emptyMessageForm);
    } catch (error) {
      showNotice(error.message || "Pesan gagal disimpan.", "error");
    }
  };

  const startEditMessage = (message) => {
    setEditingMessageId(message.id);
    setMessageForm({
      name: message.name,
      email: message.email,
      message: message.message,
    });
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setMessageForm(emptyMessageForm);
  };

  const deleteMessage = async (messageId) => {
    try {
      await removeMessage(messageId);
      onMessagesChange(messages.filter((message) => message.id !== messageId));
      showNotice("Pesan berhasil dihapus.");
    } catch (error) {
      showNotice(error.message || "Pesan gagal dihapus.", "error");
    }
  };

  const handleContentChange = (event) => {
    setContentForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const saveContent = async (event) => {
    event.preventDefault();
    const config = contentConfig[activeMenu];
    const currentItem = (contentData[config.type] || []).find(
      (item) => item.id === editingContentId,
    );
    const meta =
      activeMenu === "pricing"
        ? { items: contentForm.metaText.split(",").map((item) => item.trim()).filter(Boolean) }
        : activeMenu === "testimonials"
          ? { rating: Number(contentForm.metaText || 5) }
          : {};
    const payload = {
      title: contentForm.title,
      subtitle: contentForm.subtitle,
      body: contentForm.body,
      meta,
      sortOrder: currentItem?.sortOrder || (contentData[config.type] || []).length + 1,
    };

    try {
      if (editingContentId) {
        const savedItem = await updateContentItem(
          config.type,
          editingContentId,
          payload,
        );
        setContentData((currentData) => ({
          ...currentData,
          [config.type]: (currentData[config.type] || []).map((item) =>
            item.id === editingContentId ? savedItem : item,
          ),
        }));
        setEditingContentId(null);
        showNotice(`${config.eyebrow} berhasil diperbarui.`);
      } else {
        const savedItem = await createContentItem(config.type, payload);
        setContentData((currentData) => ({
          ...currentData,
          [config.type]: [...(currentData[config.type] || []), savedItem],
        }));
        showNotice(`${config.eyebrow} berhasil ditambahkan.`);
      }

      setContentForm(emptyContentForm);
    } catch (error) {
      showNotice(error.message || `${config.eyebrow} gagal disimpan.`, "error");
    }
  };

  const startEditContent = (item) => {
    setEditingContentId(item.id);
    setContentForm({
      title: item.title,
      subtitle: item.subtitle,
      body: item.body,
      metaText:
        activeMenu === "pricing"
          ? (item.meta?.items || []).join(", ")
          : activeMenu === "testimonials"
            ? String(item.meta?.rating || 5)
            : "",
    });
  };

  const cancelEditContent = () => {
    setEditingContentId(null);
    setContentForm(emptyContentForm);
  };

  const removeContent = async (type, itemId) => {
    try {
      await deleteContentItem(type, itemId);
      setContentData((currentData) => ({
        ...currentData,
        [type]: (currentData[type] || []).filter((item) => item.id !== itemId),
      }));
      showNotice("Data berhasil dihapus.");
    } catch (error) {
      showNotice(error.message || "Data gagal dihapus.", "error");
    }
  };

  const handleSettingsChange = (event) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [event.target.name]: event.target.value,
    }));
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    try {
      await updateSettings(settings);
      setSettingsStatus("Pengaturan berhasil disimpan.");
      showNotice("Pengaturan berhasil disimpan.");
    } catch (error) {
      showNotice(error.message || "Pengaturan gagal disimpan.", "error");
    }
  };

  const getContentPreviewItems = (config) => {
    const items = contentData[config.type] || [];
    const fallbackItem = items[0] || {};
    const isTyping = hasValue([
      contentForm.title,
      contentForm.subtitle,
      contentForm.body,
      contentForm.metaText,
    ]);

    if (!isTyping) return items;

    const draftItem = {
      id: "draft",
      title: contentForm.title || fallbackItem.title || "Judul konten",
      subtitle:
        contentForm.subtitle || fallbackItem.subtitle || config.subtitleLabel,
      body: contentForm.body || fallbackItem.body || config.bodyLabel,
      meta:
        activeMenu === "pricing"
          ? {
              items: contentForm.metaText
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            }
          : activeMenu === "testimonials"
            ? { rating: Number(contentForm.metaText || fallbackItem.meta?.rating || 5) }
            : fallbackItem.meta || {},
    };

    return [
      draftItem,
      ...items.filter((item) => item.id !== editingContentId),
    ];
  };

  const getProjectPreviewItems = () => {
    const fallbackProject = projects[0] || {};
    const isTyping = hasValue([
      projectForm.title,
      projectForm.category,
      projectForm.desc,
      projectForm.stack,
    ]);

    if (!isTyping) return projects;

    const draftProject = {
      id: "draft",
      category: projectForm.category || fallbackProject.category || "Web App",
      title: projectForm.title || fallbackProject.title || "Nama Proyek",
      desc:
        projectForm.desc ||
        fallbackProject.desc ||
        "Deskripsi singkat proyek akan tampil di sini.",
      stack: projectForm.stack
        ? projectForm.stack
            .split(",")
            .map((stack) => stack.trim())
          .filter(Boolean)
        : fallbackProject.stack || ["React", "MySQL"],
      accent: fallbackProject.accent || "blue",
    };

    return [
      draftProject,
      ...projects.filter((project) => project.id !== editingProjectId),
    ];
  };

  const getMessagePreviewItems = () => {
    const isTyping = hasValue([
      messageForm.name,
      messageForm.email,
      messageForm.message,
    ]);

    if (!isTyping) return messages;

    return [
      {
        id: "draft",
        name: messageForm.name || "Nama pengirim",
        email: messageForm.email || "email@example.com",
        message: messageForm.message || "Isi pesan akan tampil di sini.",
      },
      ...messages.filter((message) => message.id !== editingMessageId),
    ];
  };

  const renderPreview = () => {
    if (activeMenu === "dashboard") {
      return (
        <section className="admin-card live-preview">
          <div className="admin-card-head">
            <div>
              <span>Mini View</span>
              <h2>Ringkasan Website</h2>
            </div>
          </div>
          <div className="preview-browser">
            <div className="preview-nav">
              <img src={dwebinLogo} alt="DWebin Digital" />
              <span>{settings.brand_name || "DWebin Digital"}</span>
            </div>
            <div className="preview-hero">
              <small>Jasa pembuatan website</small>
              <h3>{contentData.page_content?.[0]?.subtitle || "Website profesional untuk bisnis dan sekolah"}</h3>
              <p>{contentData.page_content?.[0]?.body || "Konten utama website tampil di sini."}</p>
            </div>
          </div>
        </section>
      );
    }

    if (activeMenu === "projects") {
      const previewProjects = getProjectPreviewItems();
      return (
        <section className="admin-card live-preview">
          <div className="admin-card-head">
            <div>
              <span>Mini View</span>
              <h2>Preview Portfolio</h2>
            </div>
          </div>

          <div className="preview-list preview-list--projects">
            {previewProjects.length === 0 && (
              <article className="preview-content">
                <span>Portfolio</span>
                <h3>Belum ada portfolio</h3>
                <p>Tambahkan proyek pertama lewat form di bawah.</p>
              </article>
            )}

            {previewProjects.map((project) => (
              <article className={`preview-project project-card--${project.accent}`} key={project.id}>
                <div className="preview-art">
                  <span className="art-grid" />
                </div>
                <div>
                  <span>{project.id === "draft" ? "Draft Preview" : project.category}</span>
                  <h3>{project.title}</h3>
                  <p>{project.desc}</p>
                  <div className="tag-row">
                    {project.stack.map((stack) => (
                      <span key={stack}>{stack}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      );
    }

    if (activeMenu === "messages") {
      const previewMessages = getMessagePreviewItems();
      return (
        <section className="admin-card live-preview">
          <div className="admin-card-head">
            <div>
              <span>Mini View</span>
              <h2>Preview Pesan</h2>
            </div>
          </div>

          <div className="preview-list">
            {previewMessages.length === 0 && (
              <article className="preview-content">
                <span>Inbox</span>
                <h3>Belum ada pesan</h3>
                <p>Pesan dari form kontak akan tampil di sini.</p>
              </article>
            )}

            {previewMessages.map((message) => (
              <article className="preview-message" key={message.id}>
                <span>{message.id === "draft" ? "Draft Preview" : message.email}</span>
                <h3>{message.name}</h3>
                <p>{message.message}</p>
              </article>
            ))}
          </div>
        </section>
      );
    }

    if (activeMenu === "settings") {
      return (
        <section className="admin-card live-preview">
          <div className="admin-card-head">
            <div>
              <span>Mini View</span>
              <h2>Preview Pengaturan</h2>
            </div>
          </div>
          <div className="preview-list preview-list--settings">
            {["brand_name", "email", "whatsapp", "github", "linkedin"].map((key) => (
              <article className="preview-setting" key={key}>
                <span>{key.replace("_", " ")}</span>
                <b>{settings[key] || "Belum diisi"}</b>
              </article>
            ))}
          </div>
        </section>
      );
    }

    if (activeConfig) {
      const previewItems = getContentPreviewItems(activeConfig);
      return (
        <section className="admin-card live-preview">
          <div className="admin-card-head">
            <div>
              <span>Mini View</span>
              <h2>Preview {activeConfig.eyebrow}</h2>
            </div>
          </div>

          <div className="preview-list">
            {previewItems.length === 0 && (
              <article className={`preview-content preview-content--${activeMenu}`}>
                <span>{activeConfig.eyebrow}</span>
                <h3>Belum ada data</h3>
                <p>Tambahkan data pertama lewat form di bawah.</p>
              </article>
            )}

            {previewItems.map((item) => (
              <article className={`preview-content preview-content--${activeMenu}`} key={item.id}>
                <span>{item.id === "draft" ? "Draft Preview" : item.subtitle || activeConfig.eyebrow}</span>
                <h3>{item.title || "Judul konten"}</h3>
                <p>{item.body || "Isi konten akan tampil di sini."}</p>
                {activeMenu === "pricing" && item.meta?.items?.length > 0 && (
                  <ul>
                    {item.meta.items.map((feature) => (
                      <li key={feature}>
                        <Icon name="check" size={14} /> {feature}
                      </li>
                    ))}
                  </ul>
                )}
                {activeMenu === "testimonials" && (
                  <b>Rating {item.meta?.rating || 5}/5</b>
                )}
              </article>
            ))}
          </div>
        </section>
      );
    }

    return null;
  };

  const renderContentManager = (config) => {
    const items = contentData[config.type] || [];

    return (
      <section className="admin-card admin-link-list">
        <div className="admin-card-head">
          <div>
            <span>{config.eyebrow}</span>
            <h2>{config.title}</h2>
          </div>
        </div>

        <form className="project-form" onSubmit={saveContent}>
          <label>
            Judul
            <input
              name="title"
              value={contentForm.title}
              onChange={handleContentChange}
              placeholder="Masukkan judul"
              required
            />
          </label>
          <label>
            {config.subtitleLabel}
            <input
              name="subtitle"
              value={contentForm.subtitle}
              onChange={handleContentChange}
              placeholder={config.subtitleLabel}
            />
          </label>
          <label className="field-wide">
            {config.bodyLabel}
            <textarea
              name="body"
              value={contentForm.body}
              onChange={handleContentChange}
              placeholder={config.bodyLabel}
              required
            />
          </label>
          <label className="field-wide">
            Data tambahan
            <input
              name="metaText"
              value={contentForm.metaText}
              onChange={handleContentChange}
              placeholder={config.metaPlaceholder}
            />
          </label>
          <button className="button button--primary" type="submit">
            {editingContentId ? "Simpan Perubahan" : "Tambah Data"}
          </button>
          {editingContentId && (
            <button className="button button--ghost" type="button" onClick={cancelEditContent}>
              Batal Edit
            </button>
          )}
        </form>

        <div className="project-link-list">
          {items.length === 0 && (
            <article>
              <div>
                <span>{config.eyebrow}</span>
                <h3>Belum ada data</h3>
                <p>Tambahkan data pertama lewat form di atas.</p>
              </div>
            </article>
          )}

          {items.map((item) => (
            <article
              key={item.id}
              className={dragging?.itemId === item.id ? "is-dragging" : ""}
              draggable
              onDragStart={() => startDrag(config.type, item.id)}
              onDragOver={allowDrop}
              onDrop={() => reorderContentList(config, item.id)}
              onDragEnd={finishDrag}
            >
              <div>
                <span>{item.subtitle || config.eyebrow}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
              <div className="project-link-actions">
                <button className="drag-handle" type="button">
                  Seret
                </button>
                <button onClick={() => startEditContent(item)}>
                  Edit
                </button>
                <button onClick={() => removeContent(config.type, item.id)}>
                  Hapus
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="site-shell admin-shell">
      <div className="noise" />
      <main className="admin-page">
        <aside className="admin-sidebar">
          <a className="brand" href="#admin" aria-label="Dashboard admin">
            <img className="brand-logo" src={dwebinLogo} alt="DWebin Digital Admin" />
          </a>

          <nav className="admin-menu" aria-label="Menu admin">
            {menuItems.map(([key, label, icon]) => (
              <button
                key={key}
                className={activeMenu === key ? "active" : ""}
                onClick={() => {
                  setActiveMenu(key);
                  setContentForm(emptyContentForm);
                  setProjectForm(emptyProjectForm);
                  setMessageForm(emptyMessageForm);
                  setEditingProjectId(null);
                  setEditingMessageId(null);
                  setEditingContentId(null);
                  setSettingsStatus("");
                  setNotice(null);
                }}
              >
                <Icon name={icon} size={17} /> {label}
              </button>
            ))}
          </nav>

          <div className="admin-user">
            <small>Login sebagai</small>
            <b>{user.name}</b>
          </div>

          <button className="admin-logout" onClick={onLogout}>
            Logout
          </button>
        </aside>

        <section className="admin-content">
          <div className="admin-hero">
            <div>
              <p className="eyebrow">Admin Area</p>
              <h1>{pageTitle}</h1>
              <p>{pageDescription}</p>
            </div>
            <button className="button button--primary" onClick={onBack}>
              Lihat Website
            </button>
          </div>

          {notice && (
            <div className={`admin-alert admin-alert--${notice.type}`} role="status">
              <span>{notice.message}</span>
              <button onClick={() => setNotice(null)} aria-label="Tutup alert">
                x
              </button>
            </div>
          )}

          {renderPreview()}

          {activeMenu === "dashboard" && (
            <>
              <div className="admin-stats">
                <article>
                  <span>Total Proyek</span>
                  <b>{projects.length}</b>
                  <small>Portfolio aktif</small>
                </article>
                <article>
                  <span>Pesan Masuk</span>
                  <b>{messages.length}</b>
                  <small>Dari form kontak</small>
                </article>
                <article>
                  <span>Menu Admin</span>
                  <b>9</b>
                  <small>Konten website siap dikelola</small>
                </article>
              </div>

              <div className="admin-grid">
                <section className="admin-card admin-projects">
                  <div className="admin-card-head">
                    <div>
                      <span>Ringkasan</span>
                      <h2>Konten Penting</h2>
                    </div>
                  </div>
                  <div className="admin-table">
                    {menuItems.slice(1).map(([key, label]) => (
                      <article key={key}>
                        <div>
                          <b>{label}</b>
                          <span>Menu tersedia</span>
                        </div>
                        <button onClick={() => setActiveMenu(key)}>Kelola</button>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="admin-card admin-activity">
                  <div className="admin-card-head">
                    <div>
                      <span>Status</span>
                      <h2>Website Jasa</h2>
                    </div>
                  </div>
                  <ul>
                    <li><span /><p>9 menu admin sudah aktif.</p></li>
                    <li><span /><p>Konten tersimpan di database MySQL.</p></li>
                    <li><span /><p>Portfolio dan pesan sudah punya CRUD dasar.</p></li>
                  </ul>
                </section>
              </div>
            </>
          )}

          {activeMenu === "projects" && (
            <section className="admin-card admin-link-list">
              <div className="admin-card-head">
                <div>
                  <span>Portfolio</span>
                  <h2>Daftar Proyek</h2>
                </div>
              </div>

              <form className="project-form" onSubmit={saveProject}>
                <label>
                  Nama Proyek
                  <input name="title" value={projectForm.title} onChange={handleProjectChange} placeholder="Website Company Profile" required />
                </label>
                <label>
                  Kategori
                  <select name="category" value={projectForm.category} onChange={handleProjectChange}>
                    <option>Web App</option>
                    <option>Frontend</option>
                    <option>Mobile App</option>
                  </select>
                </label>
                <label className="field-wide">
                  Deskripsi
                  <textarea name="desc" value={projectForm.desc} onChange={handleProjectChange} placeholder="Tulis deskripsi proyek" required />
                </label>
                <label>
                  Stack
                  <input name="stack" value={projectForm.stack} onChange={handleProjectChange} placeholder="React, CSS, Vite" required />
                </label>
                <label>
                  Link Demo
                  <input name="demo" value={projectForm.demo} onChange={handleProjectChange} placeholder="https://..." />
                </label>
                <label>
                  Link Source
                  <input name="github" value={projectForm.github} onChange={handleProjectChange} placeholder="https://github.com/..." />
                </label>
                <button className="button button--primary" type="submit">
                  {editingProjectId ? "Simpan Perubahan" : "Tambah Proyek"}
                </button>
                {editingProjectId && (
                  <button className="button button--ghost" type="button" onClick={cancelEditProject}>
                    Batal Edit
                  </button>
                )}
              </form>

              <div className="project-link-list">
                {projects.map((project) => (
                  <article
                    key={project.id}
                    className={dragging?.itemId === project.id ? "is-dragging" : ""}
                    draggable
                    onDragStart={() => startDrag("projects", project.id)}
                    onDragOver={allowDrop}
                    onDrop={() => reorderProjectItems(project.id)}
                    onDragEnd={finishDrag}
                  >
                    <div>
                      <span>{project.category}</span>
                      <h3>{project.title}</h3>
                      <p>{project.desc}</p>
                    </div>
                    <div className="project-link-actions">
                      <button className="drag-handle" type="button">Seret</button>
                      <a href={project.links.demo}>Demo</a>
                      <a href={project.links.github} target="_blank" rel="noreferrer">Source</a>
                      <button onClick={() => startEditProject(project)}>Edit</button>
                      <button onClick={() => deleteProject(project.id)}>Hapus</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeMenu === "messages" && (
            <section className="admin-card empty-state">
              <div className="admin-card-head">
                <div>
                  <span>Inbox</span>
                  <h2>Pesan Portfolio</h2>
                </div>
              </div>
              <form className="message-form" onSubmit={saveMessage}>
                <label>Nama<input name="name" value={messageForm.name} onChange={handleMessageChange} placeholder="Nama pengirim" required /></label>
                <label>Email<input name="email" type="email" value={messageForm.email} onChange={handleMessageChange} placeholder="email@example.com" required /></label>
                <label className="field-wide">Pesan<textarea name="message" value={messageForm.message} onChange={handleMessageChange} placeholder="Isi pesan" required /></label>
                <button className="button button--primary" type="submit">
                  {editingMessageId ? "Simpan Perubahan" : "Simpan Pesan"}
                </button>
                {editingMessageId && (
                  <button className="button button--ghost" type="button" onClick={cancelEditMessage}>
                    Batal Edit
                  </button>
                )}
              </form>
              <div className="message-list">
                {messages.map((item) => (
                  <article
                    key={item.id}
                    className={dragging?.itemId === item.id ? "is-dragging" : ""}
                    draggable
                    onDragStart={() => startDrag("messages", item.id)}
                    onDragOver={allowDrop}
                    onDrop={() => reorderMessageItems(item.id)}
                    onDragEnd={finishDrag}
                  >
                    <div>
                      <b>{item.name}</b>
                      <span>{item.email}</span>
                      <p>{item.message}</p>
                    </div>
                    <div className="project-link-actions">
                      <button className="drag-handle" type="button">Seret</button>
                      <button onClick={() => startEditMessage(item)}>Edit</button>
                      <button onClick={() => deleteMessage(item.id)}>Hapus</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeConfig && renderContentManager(activeConfig)}

          {activeMenu === "settings" && (
            <section className="admin-card">
              <div className="admin-card-head">
                <div>
                  <span>Website</span>
                  <h2>Pengaturan</h2>
                </div>
              </div>
              <form className="project-form" onSubmit={saveSettings}>
                {["brand_name", "whatsapp", "email", "github", "linkedin"].map((key) => (
                  <label key={key}>
                    {key.replace("_", " ").toUpperCase()}
                    <input name={key} value={settings[key] || ""} onChange={handleSettingsChange} />
                  </label>
                ))}
                <button className="button button--primary" type="submit">Simpan Pengaturan</button>
                {settingsStatus && <p className="form-success">{settingsStatus}</p>}
              </form>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
