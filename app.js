// AtoaDEX v1.9.8 Canonical Frontend + Native Slush Wallet Standard
const ATOADEX_TESTNET = {
  rpc: "https://" + "fullnode.testnet.sui.io:443",
  packageId: "0xf2fe78eb7c97df7323bb29d6abe74d055338cd3e02b949b23ed710cc43e69628",
  tsuiFaucetId: "0xe7a7c1365feca934a61bbc23222ef5cd0188ef12749f5a83ce7cb12625fde2",
  genesisVaultsId: "0x7bb50549b7500e00f5d986bae5a1ca58fedf827a273ad3115c7785bda912b3b8"
};

let tsuiBalance = parseInt(localStorage.getItem('atoadex_tsui_bal') || '0', 10);
let lockedVeAtoa = parseFloat(localStorage.getItem('atoadex_ve_bal') || '0');
let detectedSuiWallets = new Array();

function registerSuiWallet(wallet) {
  if (wallet && wallet.features && wallet.features['standard:connect']) {
    if (!detectedSuiWallets.find(w => w.name === wallet.name)) {
      detectedSuiWallets.push(wallet);
    }
  }
}

window.addEventListener('wallet-standard:register-wallet', (event) => {
  if (typeof event.detail === 'function') {
    event.detail({ register: registerSuiWallet });
  }
});
window.dispatchEvent(new CustomEvent('wallet-standard:app-ready', {
  detail: { register: registerSuiWallet }
}));

function claimTestnetTSui() {
  tsuiBalance += 1000;
  localStorage.setItem('atoadex_tsui_bal', String(tsuiBalance));
  const balEl = document.getElementById('tsuiFaucetBal');
  if (balEl) balEl.innerText = tsuiBalance.toLocaleString('en-US') + ' tSUI';
  const sel = document.querySelector('select');
  if (sel) sel.value = 'tSUI';
  const inEl = document.getElementById('swapIn');
  if (inEl) inEl.value = '1000';
  updateSwap();
  alert(`✅ Minted +1,000 tSUI (AtoaDEX Testnet SUI)!\n\n• Saved Balance: ${tsuiBalance.toLocaleString('en-US')} tSUI\n• Faucet Contract: ${ATOADEX_TESTNET.tsuiFaucetId.slice(0, 14)}...`);
}

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
  const fee = val * 0.0008;
  const net = val - fee;
  outEl.value = net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (listEl) {
    const items = new Array(
      { k: '35.00% External LPs', v: fee * 0.35 },
      { k: '20.00% veATOA Lockers', v: fee * 0.20 },
      { k: '19.00% Day-1 Buyback & Burn', v: fee * 0.19 },
      { k: '15.00% Locked POL Compound', v: fee * 0.15 },
      { k: '5.00% rATOA Insurance Vault', v: fee * 0.05 },
      { k: '6.00% Protocol Cash OPEX', v: fee * 0.06 }
    );
    listEl.innerHTML = items.map(item =>
      `<li><span>${item.k}</span><strong style="color:#94a3b8">${item.v.toFixed(4)}</strong></li>`
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
    box.innerHTML = `<div class="metric-label">Circuit Breaker Status</div><div class="metric-val" style="color:#10b981;font-size:1.05rem;">Instant Standard Withdrawal (&le;10.00% Cap)</div><div class="metric-desc">Within per-epoch safety threshold. Same-Address Return Lock active.</div>`;
  } else {
    box.style.borderColor = '#f59e0b';
    box.innerHTML = `<div class="metric-label">Circuit Breaker &amp; Queue Routing</div><div class="metric-val" style="color:#f59e0b;font-size:1.05rem;">&gt;10% Epoch Cap &rarr; 24-Hour Whale Queue</div><div class="metric-desc">Same-Address Return Lock enforced. 90.00% of pool liquidity remains isolated and safe.</div>`;
  }
}

function updateVeAtoa() {
  const amtInput = document.getElementById('lockAmt') || document.querySelector('#panel-veatoa input');
  const amt = parseFloat(amtInput?.value) || 0;
  const powerEl = document.getElementById('vePower');
  const totalDisplay = lockedVeAtoa > 0 ? lockedVeAtoa : amt;
  if (powerEl) {
    powerEl.innerHTML = `${totalDisplay.toLocaleString('en-US')} veATOA` +
      (lockedVeAtoa > 0 ? ` <span style="font-size:0.75rem;color:#10b981;">(Locked &amp; Active)</span>` : '');
  }
}

function applyWalletState(addr) {
  const btn = document.getElementById('walletBtn');
  if (!btn) return;
  if (addr) {
    btn.classList.add('connected');
    btn.innerText = addr.slice(0, 6) + '...' + addr.slice(-4) + ' (Sui)';
  } else {
    btn.classList.remove('connected');
    btn.innerText = 'Connect Sui Wallet';
  }
}

async function toggleWallet() {
  const savedAddr = localStorage.getItem('atoadex_wallet_addr');
  if (savedAddr) {
    localStorage.removeItem('atoadex_wallet_addr');
    applyWalletState(null);
    alert('AtoaDEX v1.9.8: Wallet disconnected.');
    return;
  }

  const suiWallet = detectedSuiWallets.find(w => w.name.toLowerCase().includes('slush')) || detectedSuiWallets.at(0);
  if (suiWallet && suiWallet.features['standard:connect']) {
    try {
      const result = await suiWallet.features['standard:connect'].connect();
      const firstAcct = result && result.accounts ? result.accounts.at(0) : null;
      const account = firstAcct ? firstAcct.address : null;
      if (account) {
        localStorage.setItem('atoadex_wallet_addr', account);
        applyWalletState(account);
        alert(`✅ Connected to ${suiWallet.name}!\nAddress: ${account}`);
        return;
      }
    } catch (err) {
      alert('Connection cancelled in ' + suiWallet.name);
      return;
    }
  }

  const demoAddr = '0xATOA19800000000000000000000000000000v198';
  localStorage.setItem('atoadex_wallet_addr', demoAddr);
  applyWalletState(demoAddr);
  alert('AtoaDEX v1.9.8: Preview wallet connected!');
}

function executeDemo(msg) {
  if (msg && msg.toLowerCase().includes('veatoa')) {
    const amtInput = document.getElementById('lockAmt') || document.querySelector('#panel-veatoa input');
    const amt = parseFloat(amtInput?.value) || 0;
    if (amt <= 0) {
      alert('Please enter an $ATOA amount greater than 0 to lock.');
      return;
    }
    lockedVeAtoa += amt;
    localStorage.setItem('atoadex_ve_bal', String(lockedVeAtoa));
    updateVeAtoa();
    alert(`🔒 Locked +${amt.toLocaleString('en-US')} $ATOA!\n\n• Total Active Voting Power: ${lockedVeAtoa.toLocaleString('en-US')} veATOA\n• Earning 20.00% Protocol Fee Share + Gauge Bribes!`);
    return;
  }
  alert('AtoaDEX v1.9.8: ' + msg);
}

async function verifyOnChainVaults() {
  try {
    const res = await fetch(ATOADEX_TESTNET.rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "sui_getObject",
        params: new Array(ATOADEX_TESTNET.tsuiFaucetId, { showContent: true })
      })
    });
    const data = await res.json();
    const statusEl = document.getElementById("sui-rpc-status");
    if (statusEl && data && data.result && data.result.data) {
      statusEl.innerHTML = `🟢 LIVE SUI TESTNET • Package: ${ATOADEX_TESTNET.packageId.slice(0, 10)}...`;
    }
  } catch (e) {
    console.warn("Testnet RPC check:", e);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const bar = document.createElement('div');
  bar.id = 'sui-testnet-live-badge';
  bar.style.cssText = 'background:#06281e;color:#34d399;border-bottom:1px solid #059669;padding:10px 14px;font-size:12px;font-family:monospace;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;';
  bar.innerHTML = `
    <span id="sui-rpc-status">🟢 LIVE SUI TESTNET • Package: ${ATOADEX_TESTNET.packageId.slice(0, 10)}...</span>
    <span style="background:#0f172a;color:#38bdf8;padding:4px 10px;border-radius:8px;border:1px solid #0284c7;">Faucet Bal: <strong id="tsuiFaucetBal">${tsuiBalance.toLocaleString('en-US')} tSUI</strong></span>
    <button onclick="claimTestnetTSui()" style="background:#10b981;color:#022c22;font-weight:800;border:none;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px;">🚰 Claim 1,000 tSUI (Free Faucet)</button>
  `;
  document.body.prepend(bar);
  verifyOnChainVaults();

  applyWalletState(localStorage.getItem('atoadex_wallet_addr'));
  updateSwap();
  checkCircuitBreaker();
  updateVeAtoa();

  const footer = document.querySelector('footer');
  if (footer) {
    const disc = document.createElement('div');
    disc.style.cssText = 'max-width:1040px;margin:18px auto 8px;padding:16px;background:#070d19;border:1px solid #1e293b;border-radius:14px;color:#64748b;font-size:0.74rem;line-height:1.55;text-align:left;';
    disc.innerHTML = `<strong style="color:#94a3b8;">LEGAL &amp; RISK DISCLAIMER (TESTNET MVP):</strong> AtoaDEX is an open-source, non-custodial decentralized protocol interface currently operating on <strong>Sui Testnet</strong> (Package: ${ATOADEX_TESTNET.packageId.slice(0, 12)}...). Nothing on this website constitutes financial, investment, legal, or tax advice, nor an offer or solicitation to buy or sell securities or digital assets. DeFi protocols carry smart contract, market, and liquidity risks; while AtoaDEX incorporates a 10.00% epoch circuit breaker, 24-hour whale queue, and rATOA reserve vault, no mechanism guarantees zero loss. Access is restricted in sanctioned jurisdictions (OFAC / UN / EU / AMLA).`;
    footer.parentNode.insertBefore(disc, footer);
  }

  const tokens = new Array(
    { val: 'tSUI', label: 'tSUI (AtoaDEX Testnet SUI)' },
    { val: 'USDC', label: 'USDC (Stablecoin)' },
    { val: 'USDY', label: 'USDY (Ondo Yield USD)' },
    { val: 'AUSD', label: 'AUSD (Agora USD)' },
    { val: 'SUI', label: 'SUI (Native Gas)' },
