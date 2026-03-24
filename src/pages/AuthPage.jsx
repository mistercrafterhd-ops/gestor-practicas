import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (mensaje) setMensaje('');
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setErrorMsg('');
    setLoading(true);

    const nombre = form.nombre.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    try {
      if (!email || !password) {
        throw new Error('Debes rellenar el correo y la contraseña');
      }

      if (!isLogin && !nombre) {
        throw new Error('Debes indicar tu nombre');
      }

      if (!isLogin && password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMensaje('Inicio de sesión correcto');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre,
            },
          },
        });

        if (error) throw error;

        const user = data?.user;

        if (user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: user.id,
            nombre,
            email,
            rol: 'usuario',
          });

          if (profileError) throw profileError;
        }

        setMensaje(
          'Registro completado. Revisa tu correo si tienes la confirmación activada.'
        );

        setForm({
          nombre: '',
          email,
          password: '',
        });

        setIsLogin(true);
      }
    } catch (error) {
      setErrorMsg(traducirError(error?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Gestión de Asistencias</h1>
        <p style={styles.subtitle}>
          {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={handleChange}
              style={styles.input}
              required={!isLogin}
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading
              ? 'Cargando...'
              : isLogin
              ? 'Iniciar sesión'
              : 'Registrarse'}
          </button>
        </form>

        {mensaje && <p style={styles.successMessage}>{mensaje}</p>}
        {errorMsg && <p style={styles.errorMessage}>{errorMsg}</p>}

        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setMensaje('');
            setErrorMsg('');
          }}
          style={styles.switchButton}
        >
          {isLogin
            ? '¿No tienes cuenta? Regístrate'
            : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
}

function traducirError(message = '') {
  const msg = message.toLowerCase();

  if (msg.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos';
  }

  if (msg.includes('email not confirmed')) {
    return 'Debes confirmar tu correo antes de iniciar sesión';
  }

  if (msg.includes('user already registered')) {
    return 'Ese correo ya está registrado';
  }

  if (msg.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }

  if (msg.includes('duplicate key value')) {
    return 'Ese usuario ya tiene perfil creado';
  }

  return message || 'Ha ocurrido un error';
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f4f7fb',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#fff',
    padding: '32px',
    borderRadius: '18px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },
  title: {
    margin: 0,
    marginBottom: '8px',
    fontSize: '28px',
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: '24px',
    textAlign: 'center',
    color: '#666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  input: {
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #dcdcdc',
    fontSize: '15px',
    outline: 'none',
  },
  button: {
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    opacity: 1,
  },
  switchButton: {
    marginTop: '16px',
    background: 'transparent',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontSize: '14px',
    width: '100%',
  },
  successMessage: {
    marginTop: '16px',
    textAlign: 'center',
    color: '#15803d',
    fontSize: '14px',
  },
  errorMessage: {
    marginTop: '16px',
    textAlign: 'center',
    color: '#dc2626',
    fontSize: '14px',
  },
};