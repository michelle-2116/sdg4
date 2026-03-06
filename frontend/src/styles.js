// Shared CSS string used across dashboards
export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d1117;
    --surface: #161b22;
    --surface2: #1c2330;
    --surface3: #21262d;
    --border: #2a3441;
    --border2: #3a4451;
    --accent: #e8a020;
    --accent2: #f5c842;
    --accent-soft: rgba(232,160,32,0.12);
    --text: #e6edf3;
    --text2: #c9d1d9;
    --muted: #7d8590;
    --danger: #e05555;
    --danger-soft: rgba(224,85,85,0.12);
    --success: #3fb950;
    --success-soft: rgba(63,185,80,0.12);
    --blue: #58a6ff;
    --blue-soft: rgba(88,166,255,0.12);
  }

  body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); }

  /* Layout */
  .app-shell { display: flex; min-height: 100vh; }

  .sidebar {
    width: 240px; flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 100;
  }

  .sidebar-brand {
    padding: 24px 20px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 12px;
  }

  .sidebar-brand-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }

  .sidebar-brand-text { font-size: 15px; font-weight: 600; color: var(--text); line-height: 1.2; }
  .sidebar-brand-sub { font-size: 11px; color: var(--muted); }

  .sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }

  .nav-section-label {
    font-size: 10px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1px;
    padding: 0 8px; margin-bottom: 8px; margin-top: 16px;
  }
  .nav-section-label:first-child { margin-top: 0; }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 8px;
    font-size: 14px; font-weight: 500; color: var(--muted);
    cursor: pointer; transition: all 0.15s;
    border: none; background: none; width: 100%; text-align: left;
    margin-bottom: 2px;
  }

  .nav-item:hover { background: var(--surface2); color: var(--text2); }

  .nav-item.active {
    background: var(--accent-soft);
    color: var(--accent);
  }

  .nav-item-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }

  .sidebar-footer {
    padding: 16px 12px;
    border-top: 1px solid var(--border);
  }

  .user-info {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px;
    background: var(--surface2); margin-bottom: 8px;
  }

  .user-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #0d1117; flex-shrink: 0;
  }

  .user-name { font-size: 13px; font-weight: 500; color: var(--text2); }
  .user-role { font-size: 11px; color: var(--muted); }

  .logout-btn {
    width: 100%; padding: 9px 12px;
    background: none; border: 1px solid var(--border);
    border-radius: 8px; color: var(--muted);
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; gap: 8px; justify-content: center;
  }
  .logout-btn:hover { border-color: var(--danger); color: var(--danger); }

  /* Main content */
  .main-content { margin-left: 240px; flex: 1; padding: 32px; min-height: 100vh; }

  .page-header { margin-bottom: 32px; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 600; color: var(--text); }
  .page-subtitle { font-size: 14px; color: var(--muted); margin-top: 4px; }

  /* Cards */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 24px;
  }

  .card-title {
    font-size: 15px; font-weight: 600; color: var(--text);
    margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
  }

  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }

  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 20px;
  }

  .stat-value { font-size: 28px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .stat-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-accent { color: var(--accent); }
  .stat-success { color: var(--success); }

  /* Forms */
  .form-group { margin-bottom: 20px; }

  .form-label {
    display: block; font-size: 12px; font-weight: 600;
    color: var(--muted); margin-bottom: 8px;
    text-transform: uppercase; letter-spacing: 0.5px;
  }

  .form-input, .form-textarea, .form-select {
    width: 100%; padding: 11px 14px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    transition: border-color 0.2s; outline: none;
  }

  .form-input:focus, .form-textarea:focus, .form-select:focus { border-color: var(--accent); }
  .form-input::placeholder, .form-textarea::placeholder { color: var(--muted); }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-select { appearance: none; cursor: pointer; }
  .form-select option { background: var(--surface2); }

  /* Buttons */
  .btn {
    padding: 10px 20px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.15s; border: none;
    display: inline-flex; align-items: center; gap: 6px;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #0d1117; font-weight: 600;
    box-shadow: 0 2px 8px rgba(232,160,32,0.2);
  }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

  .btn-secondary {
    background: var(--surface2); color: var(--text2);
    border: 1px solid var(--border);
  }
  .btn-secondary:hover { border-color: var(--border2); background: var(--surface3); }

  .btn-danger { background: var(--danger-soft); color: var(--danger); border: 1px solid rgba(224,85,85,0.2); }

  /* Tables */
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th {
    font-size: 11px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.5px;
    padding: 10px 16px; text-align: left;
    border-bottom: 1px solid var(--border);
  }
  .data-table td {
    padding: 12px 16px; font-size: 14px; color: var(--text2);
    border-bottom: 1px solid var(--border);
  }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tbody tr { cursor: pointer; transition: background 0.12s; }
  .data-table tbody tr:hover { background: var(--surface2); }

  /* Badges */
  .badge {
    display: inline-flex; align-items: center;
    padding: 3px 10px; border-radius: 20px;
    font-size: 12px; font-weight: 500;
  }
  .badge-success { background: var(--success-soft); color: var(--success); }
  .badge-warning { background: var(--accent-soft); color: var(--accent); }
  .badge-danger { background: var(--danger-soft); color: var(--danger); }
  .badge-blue { background: var(--blue-soft); color: var(--blue); }

  /* Progress bar */
  .progress-bar { height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }

  /* Alerts */
  .alert { padding: 14px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }
  .alert-error { background: var(--danger-soft); border: 1px solid rgba(224,85,85,0.25); color: #ff8080; }
  .alert-success { background: var(--success-soft); border: 1px solid rgba(63,185,80,0.25); color: #7ee787; }
  .alert-info { background: var(--blue-soft); border: 1px solid rgba(88,166,255,0.25); color: var(--blue); }

  /* Tabs */
  .tabs { display: flex; gap: 4px; margin-bottom: 28px; border-bottom: 1px solid var(--border); padding-bottom: 0; }
  .tab {
    padding: 10px 18px; border: none; background: none;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    color: var(--muted); cursor: pointer; transition: all 0.15s;
    border-bottom: 2px solid transparent; margin-bottom: -1px;
  }
  .tab:hover { color: var(--text2); }
  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }

  /* Divider */
  .divider { height: 1px; background: var(--border); margin: 24px 0; }

  /* Two-col grid */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }

  /* Empty state */
  .empty-state { text-align: center; padding: 60px 20px; color: var(--muted); }
  .empty-state .empty-icon { font-size: 40px; margin-bottom: 16px; }
  .empty-state p { font-size: 14px; }

  /* Chip */
  .chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px; background: var(--surface2);
    border: 1px solid var(--border); border-radius: 20px;
    font-size: 12px; color: var(--muted);
  }

  /* Section gap */
  .section { margin-bottom: 32px; }

  @media (max-width: 900px) {
    .sidebar { width: 200px; }
    .main-content { margin-left: 200px; padding: 24px; }
    .two-col, .three-col { grid-template-columns: 1fr; }
  }
`;