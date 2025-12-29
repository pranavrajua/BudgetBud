import React, { useEffect, useState, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LineChart, Line, Legend } from 'recharts';
import './styles.css';
import { createClient } from '@supabase/supabase-js';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

const LOCAL_KEY = 'budget_app_transactions'

// Supabase client (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

function MoneyIcon({ onClick }) {
  return (
    <svg className="m-logo-svg" viewBox="0 0 64 64" width="28" height="28" aria-hidden onClick={onClick} style={{cursor:'pointer'}}>
      <g fill="none" fillRule="evenodd">
        <rect x="6" y="14" width="52" height="36" rx="4" fill="currentColor" opacity="0.12" />
        <rect x="10" y="18" width="44" height="28" rx="3" fill="#fff" />
        <rect x="10" y="18" width="44" height="8" rx="3" fill="currentColor" opacity="0.06" />
        <path d="M32 26c3.312 0 6 2.69 6 6s-2.688 6-6 6-6-2.69-6-6 2.688-6 6-6zm0 2.4a3.6 3.6 0 100 7.2 3.6 3.6 0 000-7.2z" fill="currentColor" />
        <rect x="18" y="36" width="4" height="4" rx="1" fill="currentColor" />
        <rect x="42" y="36" width="4" height="4" rx="1" fill="currentColor" />
      </g>
    </svg>
  );
}

function ThemeToggle({ effectiveTheme, setTheme }) {
  const handle = () => {
    setTheme((prev) => {
      if (prev === 'system') return effectiveTheme === 'dark' ? 'light' : 'dark'
      return prev === 'dark' ? 'light' : 'dark'
    })
  }
  return (
    <button className="m-icon" onClick={handle} title="Toggle theme">
      {effectiveTheme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

function AppBar({ theme, setTheme, onHome }) {
  const effectiveTheme =
    theme === 'system' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  return (
    <header className="m-appbar">
      <div className="m-appbar-left" style={{cursor:'pointer'}} onClick={onHome}>
        <div className="m-logo" aria-hidden>
          <MoneyIcon />
        </div>
        <div className="m-title">Budget Bud</div>
      </div>
      <div className="m-appbar-right">
        <ThemeToggle effectiveTheme={effectiveTheme} setTheme={setTheme} />
        <button className="m-icon" aria-hidden>
          🔔
        </button>
        <button className="m-icon" aria-hidden>
          👤
        </button>
      </div>
    </header>
  );
}

function AnalyticsPage({ monthlyStats, categoryData, merchantData, trendData, budget, setBudget }) {
  return (
    <main className="m-container">
      <section className="m-card" style={{marginBottom:24}}>
        <h3 className="m-card-title">Analytics Dashboard</h3>
        <div style={{display:'flex',flexWrap:'wrap',gap:32}}>
          <div style={{minWidth:260}}>
            <h4>Monthly Breakdown</h4>
            <ul style={{fontSize:14}}>
              {Object.entries(monthlyStats).map(([month, stat]) => (
                <li key={month}>{month}: <span style={{color:'#e55'}}>- ${stat.expense.toFixed(2)}</span> <span style={{color:'#5a5'}}>(+${stat.income.toFixed(2)})</span></li>
              ))}
            </ul>
          </div>
          <div style={{minWidth:260}}>
            <h4>Category Breakdown</h4>
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={["#8884d8","#82ca9d","#ffc658","#ff8042","#0088FE","#00C49F","#FFBB28","#FF8042"][idx % 8]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{minWidth:260}}>
            <h4>Top Merchants</h4>
            <BarChart width={220} height={220} data={merchantData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="merchant" width={80} />
              <Bar dataKey="value" fill="#8884d8" />
              <Tooltip />
            </BarChart>
          </div>
          <div style={{minWidth:320}}>
            <h4>Balance Trend</h4>
            <ResponsiveContainer width={300} height={220}>
              <LineChart data={trendData}>
                <XAxis dataKey="date" hide />
                <YAxis />
                <Line type="monotone" dataKey="balance" stroke="#82ca9d" strokeWidth={2} dot={false} />
                <Tooltip />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{minWidth:260}}>
            <h4>Budget vs Actual</h4>
            <div style={{marginBottom:8}}>
              <label>Monthly Budget: </label>
              <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} style={{width:80}} />
            </div>
            <ul style={{fontSize:14}}>
              {Object.entries(monthlyStats).map(([month, stat]) => (
                <li key={month}>{month}: <span style={{color:stat.expense>budget?'#e55':'#5a5'}}>{stat.expense > budget ? 'Over' : 'Under'} Budget by ${Math.abs(stat.expense-budget).toFixed(2)}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

function HomePage(props) {
  return (
    <main className="m-container">
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
        <button className="m-btn" onClick={props.onAnalytics}>Show Analytics</button>
      </div>
      <section className="m-card m-card--balance">
        <div className="m-card-head">
          <h3 className="m-card-title">Balance</h3>
          <div className="m-balance-amount">${props.balance.toFixed(2)}</div>
        </div>
        <div className="m-accounts">
          <div className="m-row">
            <span>Cash</span>
            <span>$0</span>
          </div>
        </div>
      </section>
      <section className="m-card m-card--form">
        <div className="m-card-head">
          <h3 className="m-card-title">Add Transaction</h3>
        </div>
        <form className="m-form" onSubmit={props.handleAdd}>
          <div className="m-form-row" style={{display:'flex',gap:24,flexWrap:'wrap',marginBottom:16}}>
            <div className="m-field" style={{flex:1,minWidth:120}}>
              <label className="m-label">Transaction Type</label>
              <select className="m-select" value={props.txType} onChange={(e) => props.setTxType(e.target.value)}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            {props.txType === 'expense' ? (
              <>
                <div className="m-field" style={{flex:1,minWidth:120}}>
                  <label className="m-label">Category</label>
                  <Autocomplete
                    options={props.CATEGORY_OPTIONS}
                    value={props.category}
                    onChange={(v) => props.setCategory(v)}
                    placeholder="Category"
                  />
                </div>
                <div className="m-field" style={{flex:1,minWidth:120}}>
                  <label className="m-label">Description</label>
                  <Autocomplete
                    options={(props.MERCHANT_MAP[props.category] || []).slice()}
                    value={props.merchant}
                    onChange={(v) => props.setMerchant(v)}
                    placeholder="Merchant"
                  />
                </div>
                <div className="m-field" style={{flex:1,minWidth:120}}>
                  <label className="m-label">Amount</label>
                  <input className="m-input m-amount" type="number" step="0.01" placeholder="0.00" value={props.amount} onChange={(e) => props.setAmount(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div className="m-field" style={{flex:1,minWidth:120}}>
                  <label className="m-label">Amount</label>
                  <input className="m-input m-amount" type="number" step="0.01" placeholder="0.00" value={props.amount} onChange={(e) => props.setAmount(e.target.value)} />
                </div>
                <div className="m-field" style={{flex:1,minWidth:120}}>
                  <label className="m-label">Income Type</label>
                  <select className="m-select" value={props.incomeKind} onChange={(e) => props.setIncomeKind(e.target.value)}>
                    <option>OCTO</option>
                    <option>BG</option>
                    <option>FOREX</option>
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="m-actions" style={{marginTop:16}}>
            <button className="m-btn m-btn--primary" type="submit">Add</button>
            <button className="m-btn m-btn--ghost" type="button" onClick={() => { props.setMerchant(''); props.setAmount(''); props.setCategory(''); props.setTxType('expense') }}>Reset</button>
          </div>
        </form>
      </section>
      <section className="m-card m-card--txs">
        <div className="m-card-head">
          <h3 className="m-card-title">Transactions</h3>
        </div>
        <ul className="m-txn-list">
          {props.transactions.map((t) => (
            <li key={t.id} className="m-txn">
              <div className="m-txn-left">
                <div className="m-txn-title">{t.merchant || t.category}</div>
                <div className="m-txn-sub">{t.category}</div>
              </div>
              <div className="m-txn-right">
                <div className={t.amount >= 0 ? 'm-amt positive' : 'm-amt negative'}>${Math.abs(t.amount).toFixed(2)}</div>
                <button className="m-icon-small" onClick={() => props.handleDelete(t.id)}>🗑</button>
              </div>
            </li>
          ))}
          {props.transactions.length === 0 && <li className="m-empty">No transactions yet</li>}
        </ul>
      </section>
    </main>
  );
}

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [budget, setBudget] = useState(2000);
  const [email, setEmail] = useState(() => localStorage.getItem('email') || '');
  const [user, setUser] = useState(null);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [txType, setTxType] = useState('expense'); // default Expenses
  const [incomeKind, setIncomeKind] = useState('OCTO');
  const [theme, setTheme] = useState('system'); // 'system' | 'light' | 'dark'
  const [household, setHousehold] = useState(() => localStorage.getItem('household_id') || '');
  const [onboarding, setOnboarding] = useState(() => {
    return !localStorage.getItem('household_id') || !localStorage.getItem('email');
  });

  // Monthly spend/income breakdown
  const monthlyStats = React.useMemo(() => {
    const stats = {};
    transactions.forEach(t => {
      const d = t.inserted_at ? new Date(t.inserted_at) : new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (!stats[key]) stats[key] = { income: 0, expense: 0 };
      if (t.amount >= 0) stats[key].income += t.amount;
      else stats[key].expense += Math.abs(t.amount);
    });
    return stats;
  }, [transactions]);

  // Category breakdown
  const categoryData = React.useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (!map[t.category]) map[t.category] = 0;
      map[t.category] += Math.abs(t.amount);
    });
    return Object.entries(map).map(([category, value]) => ({ category, value }));
  }, [transactions]);

  // Top merchants
  const merchantData = React.useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (!t.merchant) return;
      if (!map[t.merchant]) map[t.merchant] = 0;
      map[t.merchant] += Math.abs(t.amount);
    });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,5).map(([merchant, value]) => ({ merchant, value }));
  }, [transactions]);

  // Trends chart (balance over time)
  const trendData = React.useMemo(() => {
    let bal = 0;
    return transactions.slice().reverse().map(t => {
      bal += Number(t.amount);
      return { date: t.inserted_at ? t.inserted_at.slice(0,10) : '', balance: bal };
    });
  }, [transactions]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      if (parsed && Array.isArray(parsed)) setTransactions(parsed)
      else setTransactions([{ id: Date.now(), category: 'Income', merchant: 'Salary', amount: 1200 }])
    } catch {
      setTransactions([{ id: Date.now(), category: 'Income', merchant: 'Salary', amount: 1200 }])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(transactions))
  }, [transactions])

  // apply theme to documentElement
  useEffect(() => {
    const apply = (t) => {
      const root = document.documentElement
      if (t === 'system') {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
      } else {
        root.setAttribute('data-theme', t)
      }
    }

    apply(theme)

    if (theme === 'system' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => apply('system')
      mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler)
      return () => (mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler))
    }
  }, [theme])

  // Supabase auth listener and initial user
useEffect(() => {
  if (!supabase) return
  let sub
  ;(async () => {
    try {
      // On mount, get the current session (handles magic link reload)
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    } catch (e) {
      // ignore
    }
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })
    sub = listener?.subscription
  })()
  return () => sub?.unsubscribe?.()
}, [])

  // load transactions from Supabase when user signs in and household is set
  useEffect(() => {
    if (!supabase || !user || !household) return
    let mounted = true
    ;(async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('household_id', household)
        .order('inserted_at', { ascending: false })
      if (!error && mounted) setTransactions(data || [])
    })()
    return () => {
      mounted = false
    }
  }, [user, household])

  const balance = transactions.reduce((s, t) => s + Number(t.amount), 0)

  const CATEGORY_OPTIONS = [
    'Groceries',
    'Movies',
    'Dining',
    'Credit Cards',
    'Loans',
    'Bills',
    'Rent',
    'Subscriptions',
    'Gas'
  ]

  const MERCHANT_MAP = {
    Groceries: ['Target', 'Walmart', 'Wegmans', 'Costco', 'Harris Teeter'],
    'Credit Cards': ['Amex', 'Chase', 'Cap One - Savor', 'Cap One - VentureX', 'Discover', 'Synchrony'],
    Bills: ['Rent', 'Car', 'Electricity', 'Gas', 'Tolls', 'T-Mobile'],
    Subscriptions: ['Netflix', 'Regal']
  }

  function handleAdd(e) {
    e.preventDefault()
    const a = parseFloat(amount)
    if (Number.isNaN(a)) return alert('Please enter a valid amount.')
    let t
    if (txType === 'expense') {
      t = {
        id: Date.now() + Math.random(),
        category: category || 'Uncategorized',
        merchant: merchant || '',
        amount: -Math.abs(a)
      }
    } else {
      t = {
        id: Date.now() + Math.random(),
        category: incomeKind || 'Income',
        merchant: '',
        amount: Math.abs(a)
      }
    }

    // Persist to Supabase if available and signed in
    if (supabase && user && household) {
      ;(async () => {
        const payload = {
          user_id: user.id,
          household_id: household,
          category: t.category,
          merchant: t.merchant,
          amount: t.amount
        }
        console.log('DEBUG: user at insert', user)
        console.log('DEBUG: payload at insert', payload)
        const { data: inserted, error } = await supabase.from('transactions').insert([payload]).select()
        if (error) {
          console.error('Insert error', error)
          alert('Failed to save remotely; see console.')
          return
        }
        setTransactions((s) => [inserted[0], ...s])
      })()
    } else {
      setTransactions((s) => [t, ...s])
      localStorage.setItem(LOCAL_KEY, JSON.stringify([t, ...transactions]))
    }

    setMerchant('')
    setAmount('')
    setCategory('')
    setIncomeKind('OCTO')
    setTxType('expense') // keep default as Expenses
  }

  function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return
    if (supabase && user) {
      ;(async () => {
        const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id)
        if (error) return alert('Failed to delete: ' + error.message)
        setTransactions((s) => s.filter((t) => t.id !== id))
      })()
    } else {
      setTransactions((s) => s.filter((t) => t.id !== id))
      localStorage.setItem(LOCAL_KEY, JSON.stringify(transactions.filter((t) => t.id !== id)))
    }
  }

  const navigate = useNavigate();

  // Onboarding screen: ask for household code and email, then sign in
  if (onboarding || !user || !household) {
    return (
      <div className="m-root">
        <main className="m-container">
          <section className="m-card" style={{ margin: '40px auto', maxWidth: 400 }}>
            <h2 style={{ marginBottom: 16 }}>Welcome to Budget Bud</h2>
            <div className="m-field">
              <label className="m-label">Email</label>
              <input
                className="m-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ marginBottom: 12 }}
              />
            </div>
            <div className="m-field">
              <label className="m-label">Secret Code</label>
              <input
                className="m-input"
                placeholder="1234"
                value={household}
                onChange={e => setHousehold(e.target.value)}
                style={{ marginBottom: 12 }}
              />
            </div>
            <button
              className="m-btn m-btn--primary"
              style={{ width: '100%' }}
              onClick={async () => {
                if (!email) return alert('Enter your email')
                if (!household) return alert('Enter the secret code')
                localStorage.setItem('email', email)
                localStorage.setItem('household_id', household)
                setOnboarding(false)
                setHousehold(household)
                setEmail(email)
                if (supabase) {
                  const { error } = await supabase.auth.signInWithOtp({ email })
                  if (error) return alert('Sign-in error: ' + error.message)
                  alert('Check your email for the sign-in link')
                }
              }}
            >Sign In</button>
            
          </section>
        </main>
      </div>
    )
  }

  // Main app UI
  return (
    <div className="m-root">
      <AppBar theme={theme} setTheme={setTheme} onHome={() => navigate('/')} />
      <Routes>
        <Route path="/" element={
          <HomePage
            {...{
              // pass all needed props for home UI
              balance,
              txType,
              setTxType,
              category,
              setCategory,
              merchant,
              setMerchant,
              amount,
              setAmount,
              incomeKind,
              setIncomeKind,
              handleAdd,
              handleDelete,
              transactions,
              CATEGORY_OPTIONS,
              MERCHANT_MAP,
              onAnalytics: () => navigate('/analytics')
            }}
          />
        } />
        <Route path="/analytics" element={
          <AnalyticsPage
            monthlyStats={monthlyStats}
            categoryData={categoryData}
            merchantData={merchantData}
            trendData={trendData}
            budget={budget}
            setBudget={setBudget}
          />
        } />
      </Routes>
    </div>
  );
}

function Autocomplete({ options = [], value, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setShowAll(false)
        setFocusedIndex(-1)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const filtered = showAll
    ? options.slice()
    : value
    ? options.filter((o) => o.toLowerCase().includes(value.toLowerCase()))
    : options.slice(0, 6)

  function handleKey(e) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (focusedIndex >= 0 && filtered[focusedIndex]) onChange(filtered[focusedIndex])
      setOpen(false)
      setShowAll(false)
      setFocusedIndex(-1)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setShowAll(false)
      setFocusedIndex(-1)
    }
  }

  return (
    <div className="autocomplete" ref={ref}>
      <div style={{position: 'relative'}}>
        <input
          className="m-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
            setShowAll(false)
            setFocusedIndex(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          autoComplete="off"
          style={{paddingRight: 40}}
        />

        <button
          type="button"
          className="autocomplete-toggle"
          aria-label="Toggle suggestions"
          onClick={() => {
            const willOpen = !open || !showAll
            setOpen(willOpen)
            setShowAll(willOpen)
            setFocusedIndex(-1)
          }}
        >
          ▾
        </button>
      </div>

      {open && filtered && filtered.length > 0 && (
        <ul className="autocomplete-list" role="listbox">
          {filtered.map((opt, idx) => (
            <li
              key={opt}
              role="option"
              aria-selected={focusedIndex === idx}
              className={`autocomplete-item ${focusedIndex === idx ? 'focused' : ''}`}
              onMouseDown={(ev) => {
                ev.preventDefault()
                onChange(opt)
                setOpen(false)
                setShowAll(false)
                setFocusedIndex(-1)
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}