import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 5000)
});

export const initializeDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      student_id VARCHAR(30) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      course VARCHAR(100) NOT NULL,
      year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 8),
      status VARCHAR(20) NOT NULL DEFAULT 'Active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

export const studentStore = {
  async list(search = '') {
    if (!search) {
      const result = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
      return result.rows;
    }

    const term = `%${search}%`;
    const result = await pool.query(
      `SELECT * FROM students
       WHERE name ILIKE $1 OR email ILIKE $1 OR student_id ILIKE $1 OR course ILIKE $1
       ORDER BY created_at DESC`,
      [term]
    );
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(student) {
    const result = await pool.query(
      `INSERT INTO students (student_id, name, email, course, year, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [student.studentId, student.name, student.email, student.course, student.year, student.status]
    );
    return { id: result.rows[0].id };
  },

  async update(id, student) {
    const result = await pool.query(
      `UPDATE students
       SET student_id=$1, name=$2, email=$3, course=$4, year=$5, status=$6, updated_at=NOW()
       WHERE id=$7
       RETURNING id`,
      [student.studentId, student.name, student.email, student.course, student.year, student.status, id]
    );
    return { changes: result.rowCount };
  },

  async remove(id) {
    const result = await pool.query('DELETE FROM students WHERE id = $1', [id]);
    return { changes: result.rowCount };
  }
};
