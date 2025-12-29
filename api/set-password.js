const fetch = require('node-fetch')

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' })

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env' })
  }

  try {
    // Find user by email
    const listUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users?email=${encodeURIComponent(email)}`
    const listRes = await fetch(listUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        'Content-Type': 'application/json'
      }
    })
    if (!listRes.ok) {
      const text = await listRes.text()
      return res.status(listRes.status).json({ error: 'Failed to query users', detail: text })
    }
    const users = await listRes.json()

    if (Array.isArray(users) && users.length > 0) {
      const user = users[0]
      const id = user.id
      // Update password for existing user
      const patchUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users/${id}`
      const patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${SERVICE_KEY}`,
          apikey: SERVICE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      })
      if (!patchRes.ok) {
        const text = await patchRes.text()
        return res.status(patchRes.status).json({ error: 'Failed to update password', detail: text })
      }
      const updated = await patchRes.json()
      return res.json({ ok: true, action: 'updated', user: { id: updated.id, email: updated.email } })
    }

    // User not found -> create user via admin API
    const createUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users`
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, email_confirm: true })
    })
    if (!createRes.ok) {
      const text = await createRes.text()
      return res.status(createRes.status).json({ error: 'Failed to create user', detail: text })
    }
    const created = await createRes.json()
    return res.json({ ok: true, action: 'created', user: { id: created.id, email: created.email } })
  } catch (e) {
    console.error('set-password error', e)
    return res.status(500).json({ error: 'Server error', detail: e.message })
  }
}
