import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.brand}>💪 FitTrack</Link>
            <div style={styles.links}>
                <Link to="/" style={styles.link}>Dashboard</Link>
                <Link to="/workout/new" style={styles.link}>+ Workout</Link>
                <button onClick={logout} style={styles.btn}>Logout</button>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        background: '#1a1a2e',
        color: 'white',
    },
    brand: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '20px',
        fontWeight: 'bold',
    },
    links: {
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
    },
    link: {
        color: 'white',
        textDecoration: 'none',
    },
    btn: {
        background: '#e94560',
        color: 'white',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
    },
};

export default Navbar;