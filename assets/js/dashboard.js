/**
 * CLOUDPILOT — LIVE INFRASTRUCTURE TELEMETRY & ARCHITECTURE SIMULATOR
 * File: assets/js/dashboard.js
 * Vanilla JavaScript (ES6+)
 */

(function () {
  'use strict';

  const CLUSTER_PROFILES = {
    'us-east-1': {
      name: 'us-east-1 (N. Virginia)',
      cpu: 18,
      memory: 42,
      disk: 68,
      load: '0.56',
      health: 85,
      uptime: '100%',
      latency: '1.4 ms',
      iops: '148,200 IOPS',
      queries: [
        { sql: 'SELECT reports_agg', time: '1.21 s', pct: 82, color: 'bg-danger' },
        { sql: 'SELECT customers_join', time: '0.87 s', pct: 64, color: 'bg-warning' },
        { sql: 'UPDATE sessions_token', time: '0.65 s', pct: 48, color: 'bg-warning' },
        { sql: 'SELECT orders_recent', time: '0.41 s', pct: 32, color: 'bg-success' },
        { sql: 'SELECT users_auth', time: '0.33 s', pct: 24, color: 'bg-success' }
      ]
    },
    'eu-central-1': {
      name: 'eu-central-1 (Frankfurt)',
      cpu: 24,
      memory: 51,
      disk: 54,
      load: '0.72',
      health: 92,
      uptime: '99.999%',
      latency: '1.8 ms',
      iops: '172,900 IOPS',
      queries: [
        { sql: 'SELECT ledger_audit', time: '0.94 s', pct: 68, color: 'bg-warning' },
        { sql: 'SELECT tenant_metrics', time: '0.71 s', pct: 52, color: 'bg-info' },
        { sql: 'INSERT telemetry_batch', time: '0.52 s', pct: 40, color: 'bg-success' },
        { sql: 'SELECT geo_routing', time: '0.29 s', pct: 24, color: 'bg-success' },
        { sql: 'SELECT session_cache', time: '0.18 s', pct: 16, color: 'bg-success' }
      ]
    },
    'ap-south-1': {
      name: 'ap-south-1 (Mumbai)',
      cpu: 31,
      memory: 47,
      disk: 61,
      load: '0.64',
      health: 94,
      uptime: '100%',
      latency: '2.1 ms',
      iops: '164,500 IOPS',
      queries: [
        { sql: 'SELECT payment_settlement', time: '1.04 s', pct: 74, color: 'bg-warning' },
        { sql: 'SELECT inventory_shards', time: '0.78 s', pct: 56, color: 'bg-info' },
        { sql: 'UPDATE cluster_heartbeat', time: '0.49 s', pct: 36, color: 'bg-success' },
        { sql: 'SELECT cdn_edge_hits', time: '0.35 s', pct: 27, color: 'bg-success' },
        { sql: 'SELECT iam_policy_eval', time: '0.21 s', pct: 18, color: 'bg-success' }
      ]
    },
    'ap-northeast-1': {
      name: 'ap-northeast-1 (Tokyo)',
      cpu: 15,
      memory: 38,
      disk: 49,
      load: '0.41',
      health: 97,
      uptime: '100%',
      latency: '1.1 ms',
      iops: '195,400 IOPS',
      queries: [
        { sql: 'SELECT market_orderbook', time: '0.62 s', pct: 46, color: 'bg-info' },
        { sql: 'SELECT replica_sync_lag', time: '0.48 s', pct: 38, color: 'bg-success' },
        { sql: 'UPDATE kv_store_index', time: '0.37 s', pct: 29, color: 'bg-success' },
        { sql: 'SELECT auth_jwt_verify', time: '0.22 s', pct: 18, color: 'bg-success' },
        { sql: 'SELECT health_probe', time: '0.12 s', pct: 12, color: 'bg-success' }
      ]
    }
  };

  const ARCH_LAYER_SPECS = {
    edge: {
      badge: 'LAYER 01 // GLOBAL EDGE & WAF',
      title: 'Anycast BGP Edge Network & Zero-Trust DDoS Shield',
      desc: 'Traffic enters through 42 global Anycast Points of Presence (PoPs) with inline L3/L4/L7 DDoS mitigation capable of absorbing 180+ Tbps of volumetric attacks at line rate.',
      protocol: 'BGP Anycast + QUIC / HTTP/3 + TLS 1.3',
      sla: '< 1.5 ms Edge Termination',
      security: 'Inline WAF, Bot Mitigation & Geo-Fencing',
      throughput: '180 Tbps Global Edge Capacity'
    },
    mesh: {
      badge: 'LAYER 02 // API GATEWAY & SERVICE MESH',
      title: 'Envoy-Powered Load Balancers & mTLS Service Mesh',
      desc: 'Intelligent L7 API Gateways and Virtual Network Routers authenticate every request via mutual TLS (SPIFFE/SPIRE) and route traffic across healthy availability zones.',
      protocol: 'gRPC / HTTP/2 + Strict mTLS 1.3',
      sla: '99.999% Gateway Availability',
      security: 'Zero-Trust RBAC & Rate Limiting',
      throughput: '12M+ Requests / sec per Region'
    },
    compute: {
      badge: 'LAYER 03 // ELASTIC COMPUTE & KUBERNETES',
      title: 'High-Frequency Bare-Metal & Managed Kubernetes Plane',
      desc: 'Workloads execute on isolated KVM hypervisors and CNCF-certified Kubernetes clusters backed by AMD EPYC™ 4th Gen processors and 200Gbps RDMA fabric.',
      protocol: 'KVM Hypervisor / Containerd / Cilium eBPF',
      sla: '< 800 ms Pod Cold-Start',
      security: 'Hardware SEV-SNP Memory Encryption',
      throughput: 'Up to 256 vCPU / 2 TB RAM per Node'
    },
    storage: {
      badge: 'LAYER 04 // DISTRIBUTED STORAGE & SQL QUORUM',
      title: 'NVMe-oF Block Volumes, Object Storage & Raft Databases',
      desc: 'Triple-replicated NVMe block storage, 11-nines immutable S3 object buckets, and distributed SQL clusters with synchronous zero-data-loss failover.',
      protocol: 'NVMe-over-TCP + Raft Consensus',
      sla: '99.999999999% (11 Nines) Durability',
      security: 'AES-256-GCM Customer-Managed HSM Keys',
      throughput: 'Up to 1.2M Random Read IOPS'
    }
  };

  /* ========================================================================
     1. HOME PAGE LIVE DASHBOARD PREVIEW (index.html)
     ======================================================================== */
  function initHomeDashboard() {
    const clusterButtons = document.querySelectorAll('[data-cluster-region]');
    if (!clusterButtons.length) return;

    let activeRegion = 'us-east-1';

    const renderCluster = (regionKey) => {
      const data = CLUSTER_PROFILES[regionKey] || CLUSTER_PROFILES['us-east-1'];
      activeRegion = regionKey;

      const setElText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };
      const setElWidth = (id, pct) => {
        const el = document.getElementById(id);
        if (el) el.style.width = `${pct}%`;
      };

      setElText('dashRegionName', data.name);
      setElText('dashCpuValue', `${data.cpu}%`);
      setElWidth('dashCpuBar', data.cpu);

      setElText('dashMemValue', `${data.memory}%`);
      setElWidth('dashMemBar', data.memory);

      setElText('dashDiskValue', `${data.disk}%`);
      setElWidth('dashDiskBar', data.disk);

      setElText('dashLoadValue', data.load);
      setElText('dashHealthScore', String(data.health));
      setElText('dashUptimeValue', data.uptime);
      setElText('dashLatencyValue', data.latency);
      setElText('dashIopsValue', data.iops);

      const queryContainer = document.getElementById('dashSlowQueries');
      if (queryContainer) {
        queryContainer.innerHTML = data.queries
          .map(
            (q) => `
          <div class="mb-2">
            <div class="d-flex justify-content-between small mb-1">
              <span class="font-mono text-white">${q.sql}</span>
              <span class="font-mono text-info">${q.time}</span>
            </div>
            <div class="cp-progress-track" style="height: 6px; margin-top: 2px;">
              <div class="progress-bar ${q.color}" style="width: ${q.pct}%; height: 100%; border-radius: 999px;"></div>
            </div>
          </div>
        `
          )
          .join('');
      }
    };

    clusterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const region = btn.getAttribute('data-cluster-region');
        clusterButtons.forEach((b) => b.classList.toggle('active', b === btn));
        renderCluster(region);
      });
    });

    // Time range pills
    const rangeButtons = document.querySelectorAll('[data-dash-range]');
    rangeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        rangeButtons.forEach((b) => b.classList.toggle('active', b === btn));
        const profile = CLUSTER_PROFILES[activeRegion];
        const range = btn.getAttribute('data-dash-range');
        const modifier = range === '24h' ? 4 : range === '7d' ? 0 : -2;
        const cpuEl = document.getElementById('dashCpuValue');
        const cpuBar = document.getElementById('dashCpuBar');
        if (cpuEl && cpuBar && profile) {
          const val = Math.max(8, Math.min(92, profile.cpu + modifier));
          cpuEl.textContent = `${val}%`;
          cpuBar.style.width = `${val}%`;
        }
      });
    });

    // Subtle live telemetry heartbeat every 4 seconds
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      setInterval(() => {
        const profile = CLUSTER_PROFILES[activeRegion];
        if (!profile) return;
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const nextCpu = Math.max(10, Math.min(88, profile.cpu + delta));
        const cpuEl = document.getElementById('dashCpuValue');
        const cpuBar = document.getElementById('dashCpuBar');
        if (cpuEl && cpuBar) {
          cpuEl.textContent = `${nextCpu}%`;
          cpuBar.style.width = `${nextCpu}%`;
        }
      }, 4000);
    }

    renderCluster('us-east-1');
  }

  /* ========================================================================
     2. INFRASTRUCTURE ARCHITECTURE INTERACTIVE DIAGRAM (infrastructure.html)
     ======================================================================== */
  function initArchitectureExplorer() {
    const layers = document.querySelectorAll('[data-arch-layer]');
    if (!layers.length) return;

    const updateSpecPanel = (layerKey) => {
      const spec = ARCH_LAYER_SPECS[layerKey];
      if (!spec) return;

      const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setEl('archSpecBadge', spec.badge);
      setEl('archSpecTitle', spec.title);
      setEl('archSpecDesc', spec.desc);
      setEl('archSpecProtocol', spec.protocol);
      setEl('archSpecSla', spec.sla);
      setEl('archSpecSecurity', spec.security);
      setEl('archSpecThroughput', spec.throughput);
    };

    layers.forEach((layer) => {
      layer.addEventListener('click', () => {
        const key = layer.getAttribute('data-arch-layer');
        layers.forEach((l) => l.classList.toggle('active', l === layer));
        updateSpecPanel(key);
      });

      layer.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          layer.click();
        }
      });
    });

    // Auto-scaling spike simulator on infrastructure.html
    const spikeBtn = document.getElementById('simulateSpikeBtn');
    const resetBtn = document.getElementById('resetSpikeBtn');

    if (spikeBtn) {
      spikeBtn.addEventListener('click', () => {
        const podsEl = document.getElementById('simActivePods');
        const rpsEl = document.getElementById('simThroughput');
        const latEl = document.getElementById('simLatency');
        const statusEl = document.getElementById('simStatusBadge');
        const barEl = document.getElementById('simScaleBar');

        if (podsEl) podsEl.textContent = '184 Active Nodes';
        if (rpsEl) rpsEl.textContent = '94.8 Gbps / 1.4M RPS';
        if (latEl) latEl.textContent = '1.6 ms (p99 Locked)';
        if (barEl) barEl.style.width = '88%';
        if (statusEl) {
          statusEl.className = 'badge bg-info text-dark font-mono px-3 py-2';
          statusEl.innerHTML = '<i class="bi bi-lightning-charge-fill me-1"></i>AUTO-SCALED (+160 PODS IN 1.8s)';
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const podsEl = document.getElementById('simActivePods');
        const rpsEl = document.getElementById('simThroughput');
        const latEl = document.getElementById('simLatency');
        const statusEl = document.getElementById('simStatusBadge');
        const barEl = document.getElementById('simScaleBar');

        if (podsEl) podsEl.textContent = '24 Active Nodes';
        if (rpsEl) rpsEl.textContent = '14.2 Gbps / 210K RPS';
        if (latEl) latEl.textContent = '1.4 ms (Nominal)';
        if (barEl) barEl.style.width = '28%';
        if (statusEl) {
          statusEl.className = 'badge bg-success bg-opacity-25 text-success border border-success font-mono px-3 py-2';
          statusEl.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i>NOMINAL STEADY STATE';
        }
      });
    }
  }

  /* ========================================================================
     3. SERVICES PAGE QUICK FILTER & BENCHMARK TABS (services.html)
     ======================================================================== */
  function initServicesExplorer() {
    const filterPills = document.querySelectorAll('[data-service-jump]');
    filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        filterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHomeDashboard();
    initArchitectureExplorer();
    initServicesExplorer();
  });
})();
