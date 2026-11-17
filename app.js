function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const panel = document.getElementById('panel-' + name);
  if (panel) panel.classList.add('active');
}

function updateSwap() {
  const inputEl = document.getElementById('swapIn');
  const outEl = document.getElementById('swapOut');
  const listEl = document.getElementById('feeList');
  if (!inputEl || !outEl) return;
  const val = parseFloat(inputEl.value) || 0;
  const fee = val * 0.0002;
  const net = val - fee;
  outEl.value = net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (listEl) {
    const items = [
      ['35.00% External LPs', fee * 0.35],
      ['20.00% veATOA Lockers', fee * 0.20],
      ['19.00% Day-1 Buyback & Burn', fee * 0.19],
      ['15.00% Locked POL Compound', fee * 0.15],
      ['5.00% rATOA Insurance Vault', fee * 0.05],
      ['6.00% Protocol Cash OPEX', fee * 0.06]
    ];
    listEl.innerHTML = items.map(
      ([k, v]) => `<li><span style="color:#94a3b8">${k}</span><strong>$${v.toFixed(4)}</strong></li>`
    ).join('');
  }
}

function checkCircuitBreaker() {
  const pctEl = document.getElementById('withdrawPct');
  const box = document.getElementById('breakerStatus');
  if (!pctEl || !box) return;
  const pct = parseFloat(pctEl.value) || 0;
  if (pct <= 10) {
    box.style.borderColor = '#10b981';
    box.innerHTML = `<div class="metric-label">Circuit Breaker Status</div>
      <div class="metric-val" style="color:#10b981; font-size:1.05rem;">Instant Standard Withdrawal (&le;10.00% Cap)</div>
      <div class="metric-desc">Within per-epoch safety threshold. Same-Address Return Lock active.</div>`;
  } else {
    box.style.borderColor = '#f59e0b';
    box.innerHTML = `<div class="metric-label">Circuit Breaker &amp; Queue Routing</div>
      <div class="metric-val" style="color:#f59e0b; font-size:1.05rem;">&gt;10% Epoch Cap -> 24-Hour Whale Queue</div>
      <div class="metric-desc">Same-Address Return Lock enforced. 90.00% of pool liquidity remains isolated and safe.</div>`;
  }
}

function updateVeAtoa() {
  const amt = parseFloat(document.getElementById('lockAmt')?.value) || 0;
  const powerEl = document.getElementById('vePower');
  if (powerEl) powerEl.innerText = amt.toLocaleString('en-US') + ' veATOA';
}

function toggleWallet() {
  const btn = document.getElementById('walletBtn');
  if (!btn) return;
  btn.classList.toggle('connected');
  const isConn = btn.classList.contains('connected');
  btn.innerText = isConn ? '0xATOA...v198 (Sui Testnet)' : 'Connect Sui Wallet';
  executeDemo(isConn ? 'Sui Testnet Wallet session connected!' : 'Wallet disconnected.');
}

function executeDemo(msg) {
  alert('AtoaDEX v1.9.8: ' + msg);
}

window.addEventListener('DOMContentLoaded', () => {
  updateSwap();
  checkCircuitBreaker();
  updateVeAtoa();
});
window.addEventListener('DOMContentLoaded', () => {
  const footer = document.querySelector('footer');
  if (footer) {
    const disc = document.createElement('div');
    disc.style.cssText = 'max-width:1040px; margin:18px auto 8px; padding:16px; background:#070d19; border:1px solid #1e293b; border-radius:14px; color:#64748b; font-size:0.74rem; line-height:1.55; text-align:left;';
    disc.innerHTML = `<strong style="color:#94a3b8;">LEGAL &amp; RISK DISCLAIMER (TESTNET MVP):</strong> AtoaDEX is an open-source, non-custodial decentralized protocol interface currently operating in <strong>Testnet Simulation Mode</strong>. Nothing on this website constitutes financial, investment, legal, or tax advice, nor an offer or solicitation to buy or sell securities or digital assets. DeFi protocols carry smart-contract, market, and liquidity risks; while AtoaDEX incorporates a 10.00% epoch circuit breaker, 24-hour whale queue, and rATOA reserve vault, no mechanism guarantees zero loss. Access is restricted in sanctioned jurisdictions (OFAC / UN / EU / AMLA).`;
    footer.parentNode.insertBefore(disc, footer);
  }
});
window.addEventListener('DOMContentLoaded', () => {
  const tokens = [
    { val: 'USDC', label: 'USDC (Stablecoin)' },
    { val: 'USDY', label: 'USDY (Ondo Yield USD)' },
    { val: 'AUSD', label: 'AUSD (Agora USD)' },
    { val: 'SUI', label: 'SUI (Native Gas)' },
    { val: 'haSUI', label: 'haSUI (Haedal LST)' },
    { val: 'vSUI', label: 'vSUI (Volo LST)' },
    { val: 'sSUI', label: 'sSUI (SpringSui LST)' },
    { val: 'afSUI', label: 'afSUI (Aftermath LST)' },
    { val: 'ATOA', label: 'ATOA ($0.16 IDO Ref)' }
  ];

  document.querySelectorAll('select').forEach((sel, idx) => {
    sel.innerHTML = tokens.map(t => `<option value="${t.val}">${t.label}</option>`).join('');
    if (idx === 1) sel.value = 'haSUI';
  });
});
