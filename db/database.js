/**
 * PostgreSQL Database Module
 * Handles all database operations for Railway PostgreSQL
 */

/**
 * Initialize database schema
 */
export async function initializeDatabase(pool) {
  try {
    const client = await pool.connect();

    try {
      // Create contact_submissions table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS contact_submissions (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create index on email for faster queries
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_contact_submissions_email
        ON contact_submissions(email);
      `);

      // Create index on created_at for sorting
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
        ON contact_submissions(created_at);
      `);

      console.log('✅ Database schema initialized successfully');
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    throw err;
  }
}

/**
 * Submit contact form to database
 */
export async function submitContactForm(pool, data) {
  try {
    const { name, email, phone, subject, message, ip_address, user_agent } = data;

    const result = await pool.query(
      `INSERT INTO contact_submissions (name, email, phone, subject, message, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [name, email, phone, subject, message, ip_address, user_agent]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Failed to insert contact form'
      };
    }

    return {
      success: true,
      recordId: result.rows[0].id,
      submittedAt: result.rows[0].created_at
    };
  } catch (err) {
    console.error('Database error in submitContactForm:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Test contact submission (for diagnostics)
 */
export async function testContactSubmission(pool, data) {
  try {
    const { name, email, phone, subject, message } = data;

    const result = await pool.query(
      `INSERT INTO contact_submissions (name, email, phone, subject, message, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [name, email, phone, subject, message, 'test']
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Failed to insert test contact'
      };
    }

    return {
      success: true,
      recordId: result.rows[0].id,
      submittedAt: result.rows[0].created_at
    };
  } catch (err) {
    console.error('Database error in testContactSubmission:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Get database schema status
 */
export async function getSchemaStatus(pool) {
  try {
    const client = await pool.connect();

    try {
      // Check if contact_submissions table exists
      const result = await client.query(
        `SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = 'contact_submissions'
        ) as table_exists`
      );

      const tableExists = result.rows[0].table_exists;

      return {
        connected: true,
        tableExists: tableExists,
        error: null
      };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Database error in getSchemaStatus:', err.message);
    return {
      connected: false,
      tableExists: false,
      error: err.message
    };
  }
}

/**
 * Get all contact submissions (for admin)
 */
export async function getAllSubmissions(pool) {
  try {
    const result = await pool.query(
      `SELECT * FROM contact_submissions
       ORDER BY created_at DESC
       LIMIT 100`
    );

    return {
      success: true,
      submissions: result.rows
    };
  } catch (err) {
    console.error('Database error in getAllSubmissions:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Delete old contact submissions (cleanup)
 */
export async function deleteOldSubmissions(pool, daysOld = 90) {
  try {
    const result = await pool.query(
      `DELETE FROM contact_submissions
       WHERE created_at < NOW() - INTERVAL '1 day' * $1`,
      [daysOld]
    );

    return {
      success: true,
      deletedRows: result.rowCount
    };
  } catch (err) {
    console.error('Database error in deleteOldSubmissions:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}
