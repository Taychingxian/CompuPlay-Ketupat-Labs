const { useState, useEffect } = React;

// API Configuration
const API_BASE = 'http://localhost/CompuPlay/backend/api/classes.php';

// Main App Component
function App() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [editingClass, setEditingClass] = useState(null);
    const [deletingClass, setDeletingClass] = useState(null);
    const [showClassDetail, setShowClassDetail] = useState(false);

    // Fetch all classes
    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_BASE);
            const data = await response.json();
            setClasses(data);
        } catch (error) {
            console.error('Error fetching classes:', error);
            alert('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    // Create new class
    const handleCreate = async (classData) => {
        try {
            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(classData),
            });

            if (response.ok) {
                await fetchClasses();
                setShowCreateModal(false);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to create class');
            }
        } catch (error) {
            console.error('Error creating class:', error);
            alert('Failed to create class');
        }
    };

    // Update class
    const handleUpdate = async (classData) => {
        try {
            const response = await fetch(API_BASE, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(classData),
            });

            if (response.ok) {
                await fetchClasses();
                setShowEditModal(false);
                setEditingClass(null);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update class');
            }
        } catch (error) {
            console.error('Error updating class:', error);
            alert('Failed to update class');
        }
    };

    // Delete class
    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${API_BASE}?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchClasses();
                setShowDeleteConfirm(false);
                setDeletingClass(null);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete class');
            }
        } catch (error) {
            console.error('Error deleting class:', error);
            alert('Failed to delete class');
        }
    };

    // Open edit modal
    const openEditModal = (classItem) => {
        setEditingClass(classItem);
        setShowEditModal(true);
    };

    // Open delete confirm
    const openDeleteConfirm = (classItem) => {
        setDeletingClass(classItem);
        setShowDeleteConfirm(true);
    };

    // Open class detail
    const openClassDetail = (classItem) => {
        setSelectedClass(classItem);
        setShowClassDetail(true);
    };

    return (
        <div style={styles.app}>
            {/* Top Bar */}
            <TopBar onCreateClick={() => setShowCreateModal(true)} />

            {/* Main Content */}
            <div style={styles.content}>
                {loading ? (
                    <div style={styles.loading}>Loading classes...</div>
                ) : classes.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p>No classes yet. Create your first class!</p>
                    </div>
                ) : (
                    <div style={styles.classesGrid}>
                        {classes.map((classItem) => (
                            <ClassCard
                                key={classItem.id}
                                classItem={classItem}
                                onCardClick={() => openClassDetail(classItem)}
                                onEdit={() => openEditModal(classItem)}
                                onDelete={() => openDeleteConfirm(classItem)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <CreateClassModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreate}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && editingClass && (
                <EditClassModal
                    classItem={editingClass}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingClass(null);
                    }}
                    onSubmit={handleUpdate}
                />
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && deletingClass && (
                <DeleteConfirmModal
                    classItem={deletingClass}
                    onClose={() => {
                        setShowDeleteConfirm(false);
                        setDeletingClass(null);
                    }}
                    onConfirm={() => handleDelete(deletingClass.id)}
                />
            )}

            {/* Class Detail Modal */}
            {showClassDetail && selectedClass && (
                <ClassDetailModal
                    classItem={selectedClass}
                    onClose={() => {
                        setShowClassDetail(false);
                        setSelectedClass(null);
                    }}
                />
            )}
        </div>
    );
}

// Top Bar Component
function TopBar({ onCreateClick }) {
    return (
        <div style={styles.topBar}>
            <h1 style={styles.topBarTitle}>My Classes</h1>
            <button style={styles.createButton} onClick={onCreateClick}>
                + Create Class
            </button>
        </div>
    );
}

// Class Card Component
function ClassCard({ classItem, onCardClick, onEdit, onDelete }) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div style={styles.card}>
            <div style={styles.cardContent} onClick={onCardClick}>
                <h3 style={styles.cardTitle}>{classItem.name}</h3>
                {classItem.subject && (
                    <p style={styles.cardSubject}>{classItem.subject}</p>
                )}
                {classItem.year && (
                    <p style={styles.cardYear}>Year: {classItem.year}</p>
                )}
                <p style={styles.cardDate}>
                    Created: {new Date(classItem.created_at).toLocaleDateString()}
                </p>
            </div>
            <div style={styles.cardMenu}>
                <button
                    style={styles.menuButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                >
                    ⋮
                </button>
                {showMenu && (
                    <div style={styles.menuDropdown}>
                        <button
                            style={styles.menuItem}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                onEdit();
                            }}
                        >
                            Edit
                        </button>
                        <button
                            style={styles.menuItemDelete}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                onDelete();
                            }}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
            {showMenu && (
                <div
                    style={styles.menuOverlay}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                    }}
                />
            )}
        </div>
    );
}

// Create Class Modal
function CreateClassModal({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        year: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Class name is required');
            return;
        }

        onSubmit({
            name: formData.name,
            subject: formData.subject || null,
            year: formData.year ? parseInt(formData.year) : null,
        });
    };

    return (
        <Modal onClose={onClose}>
            <h2 style={styles.modalTitle}>Create New Class</h2>
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Class Name *</label>
                    <input
                        type="text"
                        style={styles.input}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="e.g., Mathematics 101"
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Subject</label>
                    <input
                        type="text"
                        style={styles.input}
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g., Mathematics"
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Year</label>
                    <input
                        type="number"
                        style={styles.input}
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="e.g., 2024"
                    />
                </div>
                <div style={styles.modalActions}>
                    <button type="button" style={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" style={styles.submitButton}>
                        Create
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// Edit Class Modal
function EditClassModal({ classItem, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        id: classItem.id,
        name: classItem.name || '',
        subject: classItem.subject || '',
        year: classItem.year || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Class name is required');
            return;
        }

        onSubmit({
            id: formData.id,
            name: formData.name,
            subject: formData.subject || null,
            year: formData.year ? parseInt(formData.year) : null,
        });
    };

    return (
        <Modal onClose={onClose}>
            <h2 style={styles.modalTitle}>Edit Class</h2>
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Class Name *</label>
                    <input
                        type="text"
                        style={styles.input}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Subject</label>
                    <input
                        type="text"
                        style={styles.input}
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Year</label>
                    <input
                        type="number"
                        style={styles.input}
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                </div>
                <div style={styles.modalActions}>
                    <button type="button" style={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" style={styles.submitButton}>
                        Save Changes
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ classItem, onClose, onConfirm }) {
    return (
        <Modal onClose={onClose}>
            <h2 style={styles.modalTitle}>Delete Class</h2>
            <p style={styles.confirmText}>
                Are you sure you want to delete <strong>{classItem.name}</strong>? This action cannot be undone.
            </p>
            <div style={styles.modalActions}>
                <button style={styles.cancelButton} onClick={onClose}>
                    Cancel
                </button>
                <button style={styles.deleteButton} onClick={onConfirm}>
                    Delete
                </button>
            </div>
        </Modal>
    );
}

// Class Detail Modal
function ClassDetailModal({ classItem, onClose }) {
    return (
        <Modal onClose={onClose}>
            <h2 style={styles.modalTitle}>{classItem.name}</h2>
            <div style={styles.detailContent}>
                <div style={styles.detailItem}>
                    <strong>Subject:</strong> {classItem.subject || 'Not specified'}
                </div>
                <div style={styles.detailItem}>
                    <strong>Year:</strong> {classItem.year || 'Not specified'}
                </div>
                <div style={styles.detailItem}>
                    <strong>Created:</strong> {new Date(classItem.created_at).toLocaleString()}
                </div>
                <div style={styles.detailItem}>
                    <strong>Last Updated:</strong> {new Date(classItem.updated_at).toLocaleString()}
                </div>
            </div>
            <div style={styles.modalActions}>
                <button style={styles.submitButton} onClick={onClose}>
                    Close
                </button>
            </div>
        </Modal>
    );
}

// Modal Wrapper Component
function Modal({ children, onClose }) {
    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

// Styles
const styles = {
    app: {
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
    },
    topBar: {
        backgroundColor: '#FFFFFF',
        padding: '20px 40px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topBarTitle: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#3E3E3E',
    },
    createButton: {
        backgroundColor: '#2454FF',
        color: '#FFFFFF',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    content: {
        padding: '40px',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '18px',
        color: '#969696',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px',
        fontSize: '18px',
        color: '#969696',
    },
    classesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '20px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: '1px solid #969696',
    },
    cardContent: {
        paddingRight: '30px',
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '10px',
        color: '#3E3E3E',
    },
    cardSubject: {
        fontSize: '14px',
        color: '#969696',
        marginBottom: '8px',
    },
    cardYear: {
        fontSize: '14px',
        color: '#969696',
        marginBottom: '8px',
    },
    cardDate: {
        fontSize: '12px',
        color: '#969696',
        marginTop: '10px',
    },
    cardMenu: {
        position: 'absolute',
        top: '15px',
        right: '15px',
    },
    menuButton: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#969696',
        padding: '5px 10px',
    },
    menuDropdown: {
        position: 'absolute',
        top: '30px',
        right: '0',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        borderRadius: '6px',
        minWidth: '120px',
        zIndex: 10,
        border: '1px solid #969696',
    },
    menuItem: {
        width: '100%',
        padding: '10px 15px',
        border: 'none',
        background: 'none',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#3E3E3E',
    },
    menuItemDelete: {
        width: '100%',
        padding: '10px 15px',
        border: 'none',
        background: 'none',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#E92222',
    },
    menuOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
    },
    modalTitle: {
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '20px',
        color: '#3E3E3E',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#3E3E3E',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #969696',
        borderRadius: '6px',
        fontSize: '14px',
        color: '#3E3E3E',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '30px',
    },
    cancelButton: {
        padding: '10px 20px',
        border: '1px solid #969696',
        borderRadius: '6px',
        backgroundColor: '#FFFFFF',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#3E3E3E',
    },
    submitButton: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: '#2454FF',
        color: '#FFFFFF',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    deleteButton: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: '#E92222',
        color: '#FFFFFF',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    confirmText: {
        fontSize: '16px',
        color: '#969696',
        marginBottom: '20px',
        lineHeight: '1.5',
    },
    detailContent: {
        marginBottom: '20px',
    },
    detailItem: {
        padding: '12px 0',
        borderBottom: '1px solid #969696',
        fontSize: '14px',
        color: '#969696',
    },
};

// Render App
ReactDOM.render(<App />, document.getElementById('root'));

