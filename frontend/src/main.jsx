import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { api } from './services/api.js';
import './styles.css';

const emptyStudent = { studentId: '', name: '', email: '', course: '', year: 1, status: 'Active' };

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyStudent);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (term = '') => {
    try { setLoading(true); setStudents(await api.list(term)); setError(''); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) await api.update(editingId, form);
      else await api.create(form);
      setForm(emptyStudent); setEditingId(null); await load(search); setError('');
    } catch (e) { setError(e.message); }
  };

  const edit = (student) => { setEditingId(student.id); setForm(student); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async (student) => {
    if (!window.confirm(`Remove ${student.name}?`)) return;
    try { await api.remove(student.id); await load(search); }
    catch (e) { setError(e.message); }
  };

  const activeCount = students.filter((student) => student.status === 'Active').length;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">S</span><span>Student Hub</span></div>
        <nav><button className="nav-item active">◫ <span>Students</span></button></nav>
      </aside>

      <section className="content">
        <header className="topbar"><div><p className="eyebrow">Academic administration</p><h1>Student Management</h1></div></header>

        <div className="stats">
          <article><span>Total students</span><strong>{students.length}</strong></article>
          <article><span>Active students</span><strong>{activeCount}</strong></article>
          <article><span>Inactive students</span><strong>{students.length - activeCount}</strong></article>
        </div>

        {error && <div className="alert">{error}</div>}

        <section className="panel form-panel">
          <div className="panel-heading"><h2>{editingId ? 'Edit student' : 'Add a student'}</h2><p>Enter the student's academic information</p></div>
          <form onSubmit={submit}>
            <label>Student ID<input required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="STU-2026-001" /></label>
            <label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" /></label>
            <label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@university.edu" /></label>
            <label>Course<input required value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="Computer Science" /></label>
            <label>Year<select value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}>{[1,2,3,4,5,6,7,8].map((year) => <option key={year} value={year}>Year {year}</option>)}</select></label>
            <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option></select></label>
            <div className="form-actions">
              {editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(emptyStudent); }}>Cancel</button>}
              <button type="submit">{editingId ? 'Save changes' : 'Add student'}</button>
            </div>
          </form>
        </section>

        <section className="panel table-panel">
          <div className="table-toolbar"><div><h2>Student records</h2><p>{students.length} records found</p></div><input type="search" placeholder="Search students..." value={search} onChange={(e) => { setSearch(e.target.value); load(e.target.value); }} /></div>
          <div className="table-wrap"><table><thead><tr><th>Student</th><th>Student ID</th><th>Course</th><th>Year</th><th>Status</th><th></th></tr></thead>
            <tbody>{loading ? <tr><td colSpan="6" className="empty">Loading...</td></tr> : students.length === 0 ? <tr><td colSpan="6" className="empty">No student records found</td></tr> : students.map((student) => (
              <tr key={student.id}><td><strong>{student.name}</strong><span>{student.email}</span></td><td>{student.studentId}</td><td>{student.course}</td><td>Year {student.year}</td><td><span className={`status ${student.status.toLowerCase()}`}>{student.status}</span></td><td className="actions"><button onClick={() => edit(student)} aria-label={`Edit ${student.name}`}>Edit</button><button className="danger" onClick={() => remove(student)} aria-label={`Delete ${student.name}`}>Delete</button></td></tr>
            ))}</tbody>
          </table></div>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
