import { useState } from "react";
import { login } from "./api";
import dwebinLogo from "./assets/dwebin-logo.png";

function LoginPage({ Icon, onBack, onLogin }) {
  const [form, setForm] = useState({ username: "admin", password: "admin123" });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const user = await login(form.username.trim(), form.password);
      onLogin(user);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="site-shell login-shell">
      <div className="noise" />
      <main className="login-page section-wrap">
        <section className="login-panel">
          <img className="login-logo" src={dwebinLogo} alt="DWebin Digital" />

          <div>
            <p className="eyebrow">Admin Login</p>
            <h1>Masuk ke Dashboard</h1>
            <p>
              Gunakan akun admin untuk mengelola daftar proyek dan link
              portfolio.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Username
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Masukkan username"
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password"
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button className="button button--primary" type="submit">
              Login <Icon name="arrow" size={18} />
            </button>
          </form>

          <div className="login-help">
            <span>Akun default</span>
            <b>admin / admin123</b>
          </div>

          <button className="login-back" onClick={onBack}>
            Kembali ke Portfolio
          </button>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
