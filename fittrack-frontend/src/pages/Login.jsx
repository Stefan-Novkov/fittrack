import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', form);
            localStorage.setItem('token', res.data.token);
            navigate('/');
        } catch (err) {
            setError('Грешно потребителско име или парола');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>💪 FitTrack</h1>
                <h2 style={styles.subtitle}>Вход</h2>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input}
                        placeholder="Потребителско име"
                        value={form.username}
                        onChange={e => setForm({...form, username: e.target.value})}
                    />
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Парола"
                        value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})}
                    />
                    <button type="submit" style={styles.btn}>Влез</button>
                </form>
                <p style={styles.link}>
                    Нямаш акаунт? <Link to="/register">Регистрирай се</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f3460',
    },
    card: {
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        width: '360px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    },
    title: {
        textAlign: 'center',
        color: '#1a1a2e',
        marginBottom: '8px',
    },
    subtitle: {
        textAlign: 'center',
        color: '#555',
        marginBottom: '24px',
        fontWeight: 'normal',
    },
    input: {
        width: '100%',
        padding: '12px',
        marginBottom: '12px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        boxSizing: 'border-box',
    },
    btn: {
        width: '100%',
        padding: '12px',
        background: '#e94560',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '8px',
    },
    error: {
        color: '#e94560',
        textAlign: 'center',
        marginBottom: '12px',
    },
    link: {
        textAlign: 'center',
        marginTop: '16px',
        color: '#555',
    },
};

export default Login;