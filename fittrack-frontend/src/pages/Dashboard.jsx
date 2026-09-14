import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function Dashboard() {
    const [workouts, setWorkouts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [workoutsRes, statsRes] = await Promise.all([
                    api.get('/workouts'),
                    api.get('/stats/summary'),
                ]);
                setWorkouts(workoutsRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const deleteWorkout = async (id) => {
        if (!window.confirm('Сигурен ли си?')) return;
        try {
            await api.delete(`/workouts/${id}`);
            setWorkouts(workouts.filter(w => w.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={styles.loading}>Зареждане...</div>;

    return (
        <div>
            <Navbar />
            <div style={styles.container}>
                {stats && (
                    <div style={styles.statsRow}>
                        <div style={styles.statCard}>
                            <div style={styles.statNum}>{stats.totalWorkouts}</div>
                            <div style={styles.statLabel}>Общо тренировки</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statNum}>💪</div>
                            <div style={styles.statLabel}>Здравей, {stats.username}!</div>
                        </div>
                    </div>
                )}

                <div style={styles.header}>
                    <h2 style={styles.title}>Моите тренировки</h2>
                    <button
                        style={styles.addBtn}
                        onClick={() => navigate('/workout/new')}>
                        + Нова тренировка
                    </button>
                </div>

                {workouts.length === 0 ? (
                    <div style={styles.empty}>
                        <p>Нямаш тренировки още.</p>
                        <button
                            style={styles.addBtn}
                            onClick={() => navigate('/workout/new')}>
                            Добави първата си тренировка
                        </button>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {workouts.map(workout => (
                            <div key={workout.id} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <h3 style={styles.cardTitle}>{workout.name}</h3>
                                    <button
                                        style={styles.deleteBtn}
                                        onClick={() => deleteWorkout(workout.id)}>
                                        🗑
                                    </button>
                                </div>
                                {workout.notes && (
                                    <p style={styles.notes}>{workout.notes}</p>
                                )}
                                <p style={styles.date}>
                                    {new Date(workout.workoutDate).toLocaleDateString('bg-BG')}
                                </p>
                                {workout.exercises && workout.exercises.length > 0 && (
                                    <div style={styles.exercises}>
                                        {workout.exercises.map((ex, i) => (
                                            <div key={i} style={styles.exercise}>
                                                <span style={styles.exName}>{ex.exerciseName}</span>
                                                <span style={styles.exDetail}>
                                                    {ex.sets} х {ex.reps} @ {ex.weight}кг
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '900px', margin: '0 auto', padding: '24px' },
    loading: { textAlign: 'center', padding: '40px', fontSize: '18px' },
    statsRow: { display: 'flex', gap: '16px', marginBottom: '24px' },
    statCard: {
        flex: 1, background: '#1a1a2e', color: 'white',
        borderRadius: '12px', padding: '20px', textAlign: 'center',
    },
    statNum: { fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' },
    statLabel: { fontSize: '14px', opacity: 0.8 },
    header: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '16px',
    },
    title: { color: '#1a1a2e', margin: 0 },
    addBtn: {
        background: '#e94560', color: 'white', border: 'none',
        padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
    },
    empty: { textAlign: 'center', padding: '60px', color: '#888' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
    card: {
        background: 'white', borderRadius: '12px', padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { margin: 0, color: '#1a1a2e' },
    deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' },
    notes: { color: '#666', fontSize: '14px', margin: '8px 0' },
    date: { color: '#999', fontSize: '12px', margin: '4px 0 12px' },
    exercises: { borderTop: '1px solid #eee', paddingTop: '12px' },
    exercise: { display: 'flex', justifyContent: 'space-between', padding: '4px 0' },
    exName: { fontWeight: '500', color: '#333' },
    exDetail: { color: '#666', fontSize: '13px' },
};

export default Dashboard;