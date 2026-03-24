import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { GroupCard } from '../components/ui/GroupCard';

const GroupsPage = () => {
  const { groups, tasks, addGroup } = useContext(AppContext);

  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupError, setGroupError] = useState('');

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    const trimmedName = newGroupName.trim();

    if (!trimmedName) {
      setGroupError('El nombre del grupo es obligatorio');
      return;
    }

    const result = await addGroup({ name: trimmedName });

    if (!result?.ok) {
      setGroupError(result?.error || 'No se pudo crear el grupo');
      return;
    }

    setNewGroupName('');
    setGroupError('');
    setShowNewGroupModal(false);
  };

  return (
    <div className="content-area animate-fade-in">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700' }}>Grupos</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Gestiona los grupos de prácticas.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowNewGroupModal(true);
            setGroupError('');
          }}
        >
          + Nuevo Grupo
        </button>
      </div>

      <div className="grid-cards">
        {groups.map((g) => (
          <GroupCard key={g.id} group={g} tasks={tasks} />
        ))}
      </div>

      {showNewGroupModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
              background: 'var(--bg-primary)',
            }}
          >
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}
            >
              Crear nuevo grupo
            </h3>

            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => {
                  setNewGroupName(e.target.value);
                  if (groupError) setGroupError('');
                }}
                placeholder="Ej: Marketing, Desarrollo..."
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  fontSize: '0.95rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                }}
              />

              {groupError && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'crimson' }}>
                  {groupError}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1.25rem',
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowNewGroupModal(false);
                    setNewGroupName('');
                    setGroupError('');
                  }}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  Cancelar
                </button>

                <button type="submit" className="btn btn-primary">
                  Guardar grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;