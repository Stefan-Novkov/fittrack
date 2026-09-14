import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function NewWorkout() {
    const [name, setName] = useState('');
    const [notes, setNotes] = useState('');
    const [exercises, setExercises] = useState([]);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [newExercise, setNewExercise] = useState({ name: '', muscleGroup: '', description: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/exercises').then(res => setAvailableExercises(res.data));
    }, []);

    const filteredExercises = availableExercises.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase())
    );

    const addNewExercise = async () => {
        if (!newExercise.name.trim()) return;
        try {
            const res = await api.post('/exercises', newExercise);
            setAvailableExercises([...availableExercises, res.data]);
            setNewExercise({ name: '', muscleGroup: '', description: '' });
            setShowAddForm(false);
        } catch (err) {
            setError('Грешка при добавяне на упражнение');
        }
    };

    const addExercise = (exercise) => {
        if (exercises.find(e => e.exerciseId === exercise.id)) return;
        setExercises([...exercises, {
            exerciseId: exercise.id,
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
            sets: 3,
            reps: 10,
            weight: 20,
        }]);
    };

    const updateExercise = (index, field, value) => {
        const updated = [...exercises];
        updated[index][field] = Number(value);
        setExercises(updated);
    };

    const removeExercise = (index) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Въведи име на тренировката');
            return;
        }
        try {
            await api.post('/workouts', {
                name,
                notes,
                exercises: exercises.map(ex => ({
                    exerciseId: ex.exerciseId,
                    sets: ex.sets,
                    reps: ex.reps,
                    weight: ex.weight,
                })),
            });
            navigate('/');
        } catch (err) {
            setError('Грешка при създаване на тренировката');
        }
    };

    return (
        <div>
            <Navbar />
            <div style={styles.container}>
                <h2 style={styles.title}>Нова тренировка</h2>
                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.section}>
                        <label style={styles.label}>Име на тренировката</label>
                        <input
                            style={styles.input}
                            placeholder="Chest Day, Leg Day..."
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        <label style={styles.label}>Бележки</label>
                        <textarea
                            style={styles.textarea}
                            placeholder="Бележки за тренировката..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>

                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Добави упражнения</h3>
                        <input
                            style={styles.input}
                            placeholder="Търси упражнение..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />

                        <button
                            type="button"
                            style={styles.addExerciseBtn}
                            onClick={() => setShowAddForm(!showAddForm)}>
                            {showAddForm ? 'Скрий формата' : '+ Ново упражнение'}
                        </button>

                        {showAddForm && (
                            <div style={styles.newExerciseForm}>
                                <input
                                    style={styles.input}
                                    placeholder="Име на упражнението"
                                    value={newExercise.name}
                                    onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                                />
                                <input
                                    style={styles.input}
                                    placeholder="Мускулна група (Chest, Back, Legs...)"
                                    value={newExercise.muscleGroup}
                                    onChange={e => setNewExercise({...newExercise, muscleGroup: e.target.value})}
                                />
                                <input
                                    style={styles.input}
                                    placeholder="Описание (по желание)"
                                    value={newExercise.description}
                                    onChange={e => setNewExercise({...newExercise, description: e.target.value})}
                                />
                                <button
                                    type="button"
                                    style={styles.addExerciseBtn}
                                    onClick={addNewExercise}>
                                    Добави упражнение
                                </button>
                            </div>
                        )}

                        <div style={styles.exerciseList}>
                            {filteredExercises.length === 0 ? (
                                <p style={styles.emptyText}>Няма намерени упражнения. Добави ново с бутона горе.</p>
                            ) : (
                                filteredExercises.map(ex => (
                                    <div key={ex.id} style={styles.exerciseItem}>
                                        <div>
                                            <span style={styles.exName}>{ex.name}</span>
                                            {ex.muscleGroup && (
                                                <span style={styles.exGroup}>{ex.muscleGroup}</span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            style={styles.addBtn}
                                            onClick={() => addExercise(ex)}>
                                            +
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {exercises.length > 0 && (
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Избрани упражнения</h3>
                            {exercises.map((ex, i) => (
                                <div key={i} style={styles.selectedExercise}>
                                    <div style={styles.exHeader}>
                                        <span style={styles.exName}>{ex.name}</span>
                                        <button
                                            type="button"
                                            style={styles.removeBtn}
                                            onClick={() => removeExercise(i)}>
                                            ✕
                                        </button>
                                    </div>
                                    <div style={styles.exInputs}>
                                        <div>
                                            <label style={styles.smallLabel}>Серии</label>
                                            <input
                                                style={styles.smallInput}
                                                type="number"
                                                value={ex.sets}
                                                onChange={e => updateExercise(i, 'sets', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label style={styles.smallLabel}>Повторения</label>
                                            <input
                                                style={styles.smallInput}
                                                type="number"
                                                value={ex.reps}
                                                onChange={e => updateExercise(i, 'reps', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label style={styles.smallLabel}>Тегло (кг)</label>
                                            <input
                                                style={styles.smallInput}
                                                type="number"
                                                value={ex.weight}
                                                onChange={e => updateExercise(i, 'weight', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button type="submit" style={styles.submitBtn}>
                        Запази тренировката
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '700px', margin: '0 auto', padding: '24px' },
    title: { color: '#1a1a2e', marginBottom: '24px' },
    error: { color: '#e94560', marginBottom: '12px' },
    section: {
        background: 'white', borderRadius: '12px',
        padding: '20px', marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    sectionTitle: { color: '#1a1a2e', marginTop: 0, marginBottom: '12px' },
    label: { display: 'block', marginBottom: '6px', color: '#555', fontSize: '14px' },
    input: {
        width: '100%', padding: '10px', marginBottom: '12px',
        borderRadius: '8px', border: '1px solid #ddd',
        fontSize: '14px', boxSizing: 'border-box',
    },
    textarea: {
        width: '100%', padding: '10px', borderRadius: '8px',
        border: '1px solid #ddd', fontSize: '14px',
        boxSizing: 'border-box', minHeight: '80px', resize: 'vertical',
    },
    addExerciseBtn: {
        background: '#0f3460', color: 'white', border: 'none',
        padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
        fontSize: '13px', marginBottom: '10px',
    },
    newExerciseForm: {
        background: '#f8f9fa', borderRadius: '8px',
        padding: '12px', marginBottom: '10px',
    },
    exerciseList: { maxHeight: '200px', overflowY: 'auto' },
    emptyText: { color: '#999', fontSize: '13px', textAlign: 'center', padding: '12px 0' },
    exerciseItem: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '8px',
        borderBottom: '1px solid #f0f0f0',
    },
    exName: { fontWeight: '500', color: '#333', marginRight: '8px' },
    exGroup: {
        fontSize: '12px', color: '#888',
        background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px',
    },
    addBtn: {
        background: '#0f3460', color: 'white', border: 'none',
        width: '28px', height: '28px', borderRadius: '50%',
        cursor: 'pointer', fontSize: '18px',
    },
    selectedExercise: {
        border: '1px solid #eee', borderRadius: '8px',
        padding: '12px', marginBottom: '8px',
    },
    exHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
    removeBtn: {
        background: 'none', border: 'none',
        color: '#e94560', cursor: 'pointer', fontSize: '16px',
    },
    exInputs: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
    smallLabel: { display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' },
    smallInput: {
        width: '60px', padding: '6px', borderRadius: '6px',
        border: '1px solid #ddd', fontSize: '14px', textAlign: 'center',
    },
    submitBtn: {
        width: '100%', padding: '14px', background: '#e94560',
        color: 'white', border: 'none', borderRadius: '8px',
        fontSize: '16px', cursor: 'pointer',
    },
};

export default NewWorkout;