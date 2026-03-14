export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800&family=Barlow:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:            #06080b;
    --bg2:           #090d12;
    --surface:       #0d1520;
    --surface2:      #111d2b;
    --surface3:      #162435;
    --border:        #1c2e40;
    --border2:       #2a4258;
    --accent:        #00e5ff;
    --accent2:       #00b8d4;
    --accent-dim:    rgba(0,229,255,0.07);
    --accent-glow:   rgba(0,229,255,0.18);
    --text:          #ddeeff;
    --text2:         #7a9bb5;
    --muted:         #3d5570;
    --danger:        #ff3a5c;
    --danger-soft:   rgba(255,58,92,0.09);
    --success:       #00e676;
    --success-soft:  rgba(0,230,118,0.09);
    --warn:          #ffab00;
    --warn-soft:     rgba(255,171,0,0.09);
    --purple:        #b388ff;
    --purple-soft:   rgba(179,136,255,0.09);
  }

  body {
    background: var(--bg);
    font-family: 'Barlow', sans-serif;
    color: var(--text);
    line-height: 1.55;
  }

  body::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px);
  }

  .app-shell { display: flex; min-height: 100vh; }

  /* ─ SIDEBAR ─ */
  .sidebar {
    width: 224px; flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
  }
  .sidebar::after {
    content: ''; position: absolute; top: 0; right: -1px; bottom: 0; width: 1px;
    background: linear-gradient(to bottom, transparent 0%, var(--accent) 40%, transparent 100%);
    opacity: 0.25;
  }

  .sidebar-brand {
    padding: 20px 18px 16px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 11px;
  }
  .sidebar-brand-icon {
    width: 32px; height: 32px; flex-shrink: 0;
    background: var(--accent-dim); border: 1px solid var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: var(--accent);
    clip-path: polygon(6px 0%,100% 0%,100% calc(100% - 6px),calc(100% - 6px) 100%,0% 100%,0% 6px);
  }
  .sidebar-brand-text {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 15px; font-weight: 800; color: var(--text);
    letter-spacing: 2px; text-transform: uppercase;
  }
  .sidebar-brand-sub { font-size: 9px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-top: 1px; }

  .sidebar-nav { flex: 1; padding: 14px 8px; overflow-y: auto; }

  .nav-section-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 9px; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: 2.5px;
    padding: 0 10px; margin-bottom: 6px; margin-top: 16px;
  }
  .nav-section-label:first-child { margin-top: 0; }

  .nav-item {
    display: flex; align-items: center; gap: 9px;
    padding: 9px 12px; margin-bottom: 1px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 600; letter-spacing: 1px;
    color: var(--muted); cursor: pointer; transition: all 0.15s;
    border: none; background: none; width: 100%; text-align: left;
    text-transform: uppercase; position: relative;
  }
  .nav-item::before {
    content: ''; position: absolute;
    left: 0; top: 50%; transform: translateY(-50%);
    width: 2px; height: 0;
    background: var(--accent); transition: height 0.2s;
  }
  .nav-item:hover { color: var(--text2); background: var(--surface2); }
  .nav-item.active { color: var(--accent); background: var(--accent-dim); }
  .nav-item.active::before { height: 55%; }
  .nav-item-icon { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; opacity: 0.85; }

  .sidebar-footer { padding: 12px 8px; border-top: 1px solid var(--border); }
  .user-info {
    display: flex; align-items: center; gap: 9px;
    padding: 9px 12px; margin-bottom: 8px;
    background: var(--surface2); border: 1px solid var(--border);
  }
  .user-avatar {
    width: 28px; height: 28px; flex-shrink: 0;
    background: var(--accent-dim); border: 1px solid var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px; font-weight: 800; color: var(--accent);
  }
  .user-name { font-size: 12px; font-weight: 500; color: var(--text2); }
  .user-role { font-size: 10px; color: var(--muted); letter-spacing: 0.3px; }
  .logout-btn {
    width: 100%; padding: 8px;
    background: none; border: 1px solid var(--border);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--muted); cursor: pointer;
    transition: all 0.15s; display: flex; align-items: center; gap: 6px; justify-content: center;
  }
  .logout-btn:hover { border-color: var(--danger); color: var(--danger); }

  /* ─ MAIN ─ */
  .main-content { margin-left: 224px; flex: 1; padding: 32px 36px; min-height: 100vh; }

  .page-header { margin-bottom: 28px; }
  .page-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 38px; font-weight: 800; color: var(--text);
    letter-spacing: 1.5px; text-transform: uppercase; line-height: 1;
  }
  .page-subtitle { font-size: 13px; color: var(--muted); margin-top: 6px; letter-spacing: 0.3px; }

  /* ─ CARD ─ */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    padding: 22px 24px; position: relative;
  }
  .card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 70%);
    opacity: 0.35;
  }
  .card-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px; font-weight: 700; color: var(--accent);
    letter-spacing: 2.5px; text-transform: uppercase;
    margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
  }

  /* ─ STATS ─ */
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    padding: 18px 20px; position: relative; overflow: hidden;
  }
  .stat-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
    background: var(--accent); opacity: 0.18;
  }
  .stat-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 36px; font-weight: 800; color: var(--text); line-height: 1;
  }
  .stat-label {
    font-size: 10px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1.5px; margin-top: 6px;
  }
  .stat-accent { color: var(--accent); }
  .stat-success { color: var(--success); }

  /* ─ FORMS ─ */
  .form-group { margin-bottom: 18px; }
  .form-label {
    display: block; font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;
  }
  .form-input, .form-textarea, .form-select {
    width: 100%; padding: 10px 14px;
    background: var(--bg2); border: 1px solid var(--border);
    color: var(--text); font-family: 'Barlow', sans-serif; font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s; outline: none;
  }
  .form-input:focus, .form-textarea:focus, .form-select:focus {
    border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow);
  }
  .form-input::placeholder, .form-textarea::placeholder { color: var(--muted); opacity: 0.5; }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-select { appearance: none; cursor: pointer; }
  .form-select option { background: var(--surface2); }

  /* ─ BUTTONS ─ */
  .btn {
    padding: 10px 20px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s; border: none;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-primary {
    background: var(--accent); color: var(--bg);
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
  }
  .btn-primary:hover { background: #33eeff; transform: translateY(-1px); box-shadow: 0 4px 20px var(--accent-glow); }
  .btn-secondary { background: transparent; color: var(--text2); border: 1px solid var(--border2); }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
  .btn-danger { background: var(--danger-soft); color: var(--danger); border: 1px solid rgba(255,58,92,0.2); }

  /* ─ TABLE ─ */
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1.5px;
    padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border);
  }
  .data-table td { padding: 12px 14px; font-size: 13px; color: var(--text2); border-bottom: 1px solid var(--border); }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tbody tr { cursor: pointer; transition: background 0.12s; }
  .data-table tbody tr:hover { background: var(--surface2); }

  /* ─ BADGES ─ */
  .badge {
    display: inline-flex; align-items: center;
    padding: 2px 8px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  }
  .badge-success { background: var(--success-soft); color: var(--success); border: 1px solid rgba(0,230,118,0.2); }
  .badge-warning { background: var(--warn-soft); color: var(--warn); border: 1px solid rgba(255,171,0,0.2); }
  .badge-danger  { background: var(--danger-soft); color: var(--danger); border: 1px solid rgba(255,58,92,0.2); }
  .badge-blue    { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(0,229,255,0.2); }
  .badge-purple  { background: var(--purple-soft); color: var(--purple); border: 1px solid rgba(179,136,255,0.2); }

  /* ─ PROGRESS ─ */
  .progress-bar { height: 3px; background: var(--surface3); position: relative; overflow: hidden; }
  .progress-fill { height: 100%; transition: width 0.5s ease; }

  /* ─ ALERTS ─ */
  .alert { padding: 12px 16px; font-size: 13px; margin-bottom: 16px; border-left: 2px solid; }
  .alert-error   { background: var(--danger-soft); border-color: var(--danger); color: #ff6b78; }
  .alert-success { background: var(--success-soft); border-color: var(--success); color: var(--success); }
  .alert-info    { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }

  /* ─ TABS ─ */
  .tabs { display: flex; margin-bottom: 28px; border-bottom: 1px solid var(--border); }
  .tab {
    padding: 10px 20px; border: none; background: none;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--muted); cursor: pointer; transition: all 0.15s;
    border-bottom: 2px solid transparent; margin-bottom: -1px;
  }
  .tab:hover { color: var(--text2); }
  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }

  /* ─ LAYOUT ─ */
  .divider { height: 1px; background: var(--border); margin: 24px 0; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .empty-state { text-align: center; padding: 56px 20px; color: var(--muted); }
  .empty-state .empty-icon { font-size: 36px; margin-bottom: 14px; opacity: 0.4; }
  .empty-state p { font-size: 13px; letter-spacing: 0.3px; }
  .chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; background: var(--surface2); border: 1px solid var(--border);
    font-size: 11px; color: var(--muted);
    font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.5px;
  }
  .section { margin-bottom: 28px; }

  @media (max-width: 900px) {
    .sidebar { width: 200px; }
    .main-content { margin-left: 200px; padding: 22px; }
    .two-col, .three-col { grid-template-columns: 1fr; }
  }
`;