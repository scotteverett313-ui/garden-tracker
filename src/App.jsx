import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { supabase, dbSave, dbLoadPlants, dbSavePlants, dbLoadSeeds, dbSaveSeeds, setUserId, authSignOut } from "./supabase.js";
import { ICONS, PLANT_DB, DEFAULT_ZONES } from "./constants.js";
import { generateId, daysSince, formatDate, loadData } from "./utils.js";
import { useToast } from "./hooks/useToast.js";
import { useWindowWidth } from "./hooks/useWindowWidth.js";
import { Toast } from "./components/Toast.jsx";
import { Modal } from "./components/Modal.jsx";
import { CTAButton } from "./components/CTAButton.jsx";
import { AddPlantModal } from "./components/AddPlantModal.jsx";
import { DBSearchPicker } from "./components/DBSearchPicker.jsx";
import { SeedScanPicker } from "./components/SeedScanPicker.jsx";
import { SettingsPanel } from "./components/SettingsPanel.jsx";
import { AuthScreen } from "./components/AuthScreen.jsx";
import { SignupFlow } from "./components/SignupFlow.jsx";
import { WelcomeScreen } from "./components/WelcomeScreen.jsx";
import { OnboardingScreen } from "./components/OnboardingScreen.jsx";
import { GardenTab } from "./tabs/GardenTab.jsx";
import { SeedLibraryTab } from "./tabs/SeedLibraryTab.jsx";
import { CalendarTab } from "./tabs/CalendarTab.jsx";
import { HarvestTab } from "./tabs/HarvestTab.jsx";
import { ProfileTab } from "./tabs/ProfileTab.jsx";

async function saveData(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); await dbSave(key, value); } catch {}
}

export default function App() {
  const { toasts, toast } = useToast();
  const isWide = useWindowWidth() >= 768;
  const tabContentRef = useRef(null);
  const [plants, setPlants] = useState([]);
  const [seeds, setSeeds] = useState([]);
  const [frostDates, setFrostDates] = useState({});
  const [userDB, setUserDB] = useState([]);
  const [zones, setZones] = useState(DEFAULT_ZONES);
  const [tab, setTab] = useState("garden");
  const [showAdd, setShowAdd] = useState(false);
  const [addFlow, setAddFlow] = useState(null);
  const [prefillPlant, setPrefillPlant] = useState(null);
  const [showFrost, setShowFrost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [search, setSearch] = useState("");
  const [filterZone, setFilterZone] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showBackup, setShowBackup] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [lastBackup, setLastBackup] = useState(() => localStorage.getItem("last_backup_at") || null);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [welcomeDone, setWelcomeDone] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("onboarding_complete"));
  const [showAuth, setShowAuth] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState(null);

  // Show splash until BOTH animation is done AND data is loaded
  const stillShowingWelcome = !welcomeDone || !loaded;

  useEffect(() => {
    async function loadAll() {
      setSyncing(true);
      try {
        if (supabase) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              setUserId(session.user.id);
              setUser({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.name || "" });
            } else {
              setShowAuth(true);
            }
          } catch {
            setShowAuth(true);
          }
        }
        const [dbPlants, dbSeeds, f, db, savedZones] = await Promise.all([
          dbLoadPlants(), dbLoadSeeds(), loadData("frost_dates"), loadData("user_plant_db"), loadData("garden_zones"),
        ]);
        if (dbPlants && dbPlants.length > 0) { setPlants(dbPlants); localStorage.setItem("garden_plants", JSON.stringify(dbPlants)); }
        else { const lp = await loadData("garden_plants"); if (lp?.length) { setPlants(lp); await dbSavePlants(lp); } }
        if (dbSeeds && dbSeeds.length > 0) { setSeeds(dbSeeds); localStorage.setItem("seed_library", JSON.stringify(dbSeeds)); }
        else { const ls = await loadData("seed_library"); if (ls?.length) { setSeeds(ls); await dbSaveSeeds(ls); } }
        if (f) setFrostDates(f);
        if (savedZones?.length) setZones(savedZones);
        if (db) { setUserDB(db); }
        else { const seeded = PLANT_DB.map(p => ({ ...p, addedAt: new Date().toISOString(), seeded: true })); setUserDB(seeded); saveData("user_plant_db", seeded); }
      } catch (e) {
        console.error("Load error:", e);
        try {
          const [p, f, db, sl] = await Promise.all([loadData("garden_plants"), loadData("frost_dates"), loadData("user_plant_db"), loadData("seed_library")]);
          if (p) setPlants(p); if (f) setFrostDates(f); if (sl) setSeeds(sl); if (db) setUserDB(db);
        } catch {}
      } finally {
        setSyncing(false); setLoaded(true);
      }
    }
    loadAll();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUserId(session.user.id);
          setUser({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.name || "" });
        } else {
          setUserId(null);
          setUser(null);
        }
      });
      return () => subscription.unsubscribe();
    } catch {}
  }, []);

  useEffect(() => {
    if (!tabContentRef.current) return;
    gsap.fromTo(tabContentRef.current,
      { y: 10 },
      { y: 0, duration: 0.3, ease: "power2.out", clearProps: "transform" }
    );
  }, [tab]);

  async function savePlants(p) { setPlants(p); localStorage.setItem("garden_plants", JSON.stringify(p)); await dbSavePlants(p); }
  async function saveFrost(f) { setFrostDates(f); await saveData("frost_dates", f); }
  async function saveUserDB(db) { setUserDB(db); await saveData("user_plant_db", db); }
  async function saveSeeds(s) { setSeeds(s); localStorage.setItem("seed_library", JSON.stringify(s)); await dbSaveSeeds(s); }
  async function saveZones(z) { setZones(z); await saveData("garden_zones", z); }
  async function renameZone(zoneId, newName) {
    const old = zones.find(z => z.id === zoneId);
    if (!old || old.name === newName) return;
    const nextZones = zones.map(z => z.id === zoneId ? { ...z, name: newName } : z);
    const migrated = plants.map(p => p.zone === old.name ? { ...p, zone: newName } : p);
    setZones(nextZones);
    await saveData("garden_zones", nextZones);
    if (migrated.some((p, i) => p !== plants[i])) await savePlants(migrated);
  }

  function handleSetUser(u) {
    setUser(u);
    if (u?.id) setUserId(u.id);
  }

  function handleAdd(plant) { savePlants([...plants, plant]); toast(`${plant.name} added`, { icon: ICONS.seedlingGreen }); }
  function handleUpdate(updated) { savePlants(plants.map(p => p.id === updated.id ? updated : p)); }
  function handleSplit(updatedOriginal, newPlants) {
    const without = plants.filter(p => p.id !== updatedOriginal.id);
    savePlants([...without, updatedOriginal, ...newPlants]);
    toast(`${newPlants[0].name} split into ${newPlants.length} group${newPlants.length !== 1 ? "s" : ""}`, { icon: ICONS.growing });
  }
  function handleDelete(id) {
    const deleted = plants.find(p => p.id === id);
    const updated = plants.filter(p => p.id !== id);
    savePlants(updated);
    toast("Plant removed", { type: "warning", icon: ICONS.trash, duration: 4000, action: { label: "Undo", onClick: () => savePlants([...updated, deleted]) } });
  }
  function handleAddSeedToGarden(seed) { setPrefillPlant({ name: seed.name, variety: seed.variety, about: seed.about, water: seed.water, sun: seed.sun, dtm: seed.dtm }); setAddFlow("manual"); setShowAdd(true); }
  function openAddFlow() { setAddFlow("choose"); setShowAdd(true); setPrefillPlant(null); }
  function closeAdd() { setShowAdd(false); setAddFlow(null); setPrefillPlant(null); }

  function handleExport() {
    const backup = { version: 1, exportedAt: new Date().toISOString(), plants, frostDates, seeds, userDB: userDB.filter(p => !p.seeded) };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `dirt-rich-backup-${new Date().toISOString().split("T")[0]}.json`; a.click();
    URL.revokeObjectURL(url);
    const now = new Date().toISOString(); localStorage.setItem("last_backup_at", now); setLastBackup(now);
    toast("Backup downloaded", { icon: ICONS.backup });
  }

  function handleImport(e) {
    const file = e.target.files[0]; if (!file) return;
    setImportError(""); setImportSuccess(false);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.plants || !Array.isArray(data.plants)) throw new Error("Invalid backup.");
        await savePlants(data.plants);
        if (data.frostDates) await saveFrost(data.frostDates);
        if (data.seeds) await saveSeeds(data.seeds);
        if (data.userDB?.length) { const seeded = PLANT_DB.map(p => ({ ...p, addedAt: new Date().toISOString(), seeded: true })); await saveUserDB([...seeded, ...data.userDB.filter(p => !seeded.find(s => s.name === p.name))]); }
        setImportSuccess(true); setTimeout(() => { setShowBackup(false); setImportSuccess(false); }, 2000);
      } catch { setImportError("Couldn't read that file. Make sure it's a Dirt Rich backup."); }
    };
    reader.readAsText(file); e.target.value = "";
  }

  function replayOnboarding() { localStorage.removeItem("onboarding_complete"); authSignOut(); setUserId(null); setUser(null); setShowOnboarding(true); setShowAuth(false); setShowSignup(false); }
  function finishOnboarding() { localStorage.setItem("onboarding_complete", "1"); setShowOnboarding(false); if (!user) setShowAuth(true); }
  function handleSignupDone({ openAdd }) {
    setShowSignup(false); setShowAuth(false);
    if (openAdd) { setTimeout(() => openAddFlow(), 300); }
  }
  async function handleSignOut() { await authSignOut(); setUserId(null); setUser(null); setShowAuth(true); toast("Signed out", { icon: ICONS.exit }); }

  if (showOnboarding) return <OnboardingScreen onDone={finishOnboarding} onReplayOnboarding={replayOnboarding} />;
  if (stillShowingWelcome) return <WelcomeScreen onDone={() => setWelcomeDone(true)} onReplayOnboarding={replayOnboarding} />;
  if (showAuth) return <AuthScreen onCreateAccount={() => { setShowAuth(false); setShowSignup(true); }} onSignIn={(u) => { handleSetUser(u); setShowAuth(false); }} onReplayOnboarding={replayOnboarding} onSkip={() => setShowAuth(false)} />;
  if (showSignup) return <SignupFlow onDone={handleSignupDone} onSetUser={handleSetUser} onSaveFrostDates={saveFrost} onSelectZones={selectedIds => { const active = zones.filter(z => selectedIds.includes(z.id)); if (active.length) saveZones(active); }} />;

  const NAV_TABS = [
    { id: "garden", label: "My Garden", icon: ICONS.garden },
    { id: "seeds", label: "Seeds", icon: ICONS.seeds },
    { id: "calendar", label: "Calendar", icon: ICONS.calendar },
    { id: "harvest", label: "Harvest", icon: ICONS.harvest },
    { id: "profile", label: "Profile", icon: ICONS.profile },
  ];

  const FrostBar = () => {
    const today = new Date();
    // Frost dates are seasonal — always use current year so stale stored years don't break the bar
    function toThisYear(dateStr) {
      if (!dateStr) return null;
      const d = new Date(dateStr + "T12:00:00");
      if (isNaN(d)) return null;
      return new Date(today.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
    }
    const spring = toThisYear(frostDates.lastSpring);
    const fall = toThisYear(frostDates.firstFall);

    if (!spring || !fall) return (
      <button onClick={() => setShowSettings(true)}
        style={{ width: "100%", background: "#f5f5f3", border: "1.5px dashed #ccc", borderRadius: 'var(--radius-icon)', padding: "10px 14px", cursor: "pointer", textAlign: "center", color: "#aaa", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
        Set frost dates →
      </button>
    );

    const totalDays = (fall - spring) / (1000 * 60 * 60 * 24);
    const daysPassed = Math.max(0, (today - spring) / (1000 * 60 * 60 * 24));
    const progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    const daysToSpring = Math.ceil((spring - today) / (1000 * 60 * 60 * 24));
    const daysToFall = Math.ceil((fall - today) / (1000 * 60 * 60 * 24));
    const countdownText = daysToSpring > 0
      ? `${daysToSpring} Days Until Last Frost`
      : daysToFall > 0
        ? `${daysToFall} Days Until First Frost`
        : "Season Complete";

    return (
      <button onClick={() => setShowSettings(true)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 1 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5 }}>Growing Season</span>
          {frostDates.zone && <span style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5 }}>Zone {frostDates.zone}</span>}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#000", marginBottom: 4, letterSpacing: -0.2 }}>{countdownText}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#000", flexShrink: 0 }}>{formatDate(frostDates.lastSpring)}</span>
          <div style={{ flex: 1, height: 8, background: "#e8e8e8", borderRadius: 'var(--radius-pill)', overflow: "hidden", border: "1.5px solid #ddd" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "#a8e063", borderRadius: 'var(--radius-pill)', transition: "width 0.3s ease" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#000", flexShrink: 0 }}>{formatDate(frostDates.firstFall)}</span>
        </div>
      </button>
    );
  };

  return (
    <div style={{ fontFamily: "'Cabin', system-ui, sans-serif", display: "flex", minHeight: "100vh", maxWidth: isWide ? 1140 : 600, margin: "0 auto", background: "#faf6f0" }}>

      {/* ── Sidebar (tablet+) ─────────────────────────────────────── */}
      {isWide && (
        <div style={{ width: 240, flexShrink: 0, background: "#fff", borderRight: "1px solid #eee", position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", padding: "28px 16px 24px", overflowY: "auto" }}>
          <img src={ICONS.logo} alt="Dirt Rich" style={{ height: 44, objectFit: "contain", marginBottom: 32, alignSelf: "flex-start" }} />

          {/* Nav items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {NAV_TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 'var(--radius-icon)', border: "none",
                background: tab === t.id ? "#f0fbe0" : "none",
                cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                transition: "background 0.15s ease",
              }}>
                <img src={t.icon} alt={t.label} style={{ width: 22, height: 22, objectFit: "contain", opacity: tab === t.id ? 1 : 0.45 }} />
                <span style={{ fontSize: 14, fontWeight: tab === t.id ? 800 : 500, color: tab === t.id ? "#000" : "#888" }}>{t.label}</span>
                {tab === t.id && <div style={{ width: 4, height: 16, background: "#a8e063", borderRadius: 2, marginLeft: "auto" }} />}
              </button>
            ))}
          </div>

          {/* Bottom — frost + backup + settings */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tab === "garden" && <FrostBar />}
            {syncing && <div style={{ fontSize: 11, color: "#aaa", textAlign: "center" }}>syncing...</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ position: "relative", paddingBottom: 3, flex: 1 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 3, bottom: 0, background: "#000", borderRadius: 'var(--radius-pill)', zIndex: 0 }} />
                <button onClick={() => setShowBackup(true)} className="btn-cta"
                  style={{ position: "relative", zIndex: 1, width: "100%", background: "#a8e063", color: "#000", border: "2.5px solid #000", borderRadius: 'var(--radius-pill)', padding: "7px 10px", cursor: "pointer", fontWeight: 800, fontSize: 12, fontFamily: "inherit" }}>
                  {(!lastBackup || daysSince(lastBackup) >= 3) ? <><img src={ICONS.backup} alt="" style={{ width: 16, height: 16, objectFit: "contain", marginRight: 5, verticalAlign: "middle" }} />Backup</> : "Backup"}
                </button>
              </div>
              <div style={{ position: "relative", paddingBottom: 3, flexShrink: 0 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 3, bottom: 0, background: "#000", borderRadius: 'var(--radius-input)', zIndex: 0 }} />
                <button onClick={() => setShowSettings(true)}
                  style={{ position: "relative", zIndex: 1, background: "#a8e063", border: "2.5px solid #000", borderRadius: 'var(--radius-input)', width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={ICONS.settings} alt="Settings" style={{ width: 18, height: 18, objectFit: "contain" }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main column ───────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", paddingBottom: isWide ? 0 : 80 }}>

        {/* Narrow header — logo scrolls away, frost bar sticks */}
        {!isWide && (
          <>
            <div style={{ background: "#fff", padding: "14px 16px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <button onClick={() => setTab("garden")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <img src={ICONS.logo} alt="Dirt Rich" style={{ height: 52, objectFit: "contain" }} />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {syncing && <span style={{ fontSize: 11, color: "#aaa" }}>syncing...</span>}
                  <div style={{ position: "relative", paddingBottom: 3 }}>
                    <div style={{ position: "absolute", left: 0, right: 0, top: 3, bottom: 0, background: "#000", borderRadius: 'var(--radius-pill)', zIndex: 0 }} />
                    <button onClick={() => setShowBackup(true)} className="btn-cta"
                      style={{ position: "relative", zIndex: 1, background: "#a8e063", color: "#000", border: "2.5px solid #000", borderRadius: 'var(--radius-pill)', padding: "8px 20px", cursor: "pointer", fontWeight: 800, fontSize: 14, fontFamily: "inherit" }}>
                      {(!lastBackup || daysSince(lastBackup) >= 3) ? <><img src={ICONS.backup} alt="" style={{ width: 16, height: 16, objectFit: "contain", marginRight: 5, verticalAlign: "middle" }} />Backup</> : "Backup"}
                    </button>
                  </div>
                  <div style={{ position: "relative", paddingBottom: 3, flexShrink: 0 }}>
                    <div style={{ position: "absolute", left: 0, right: 0, top: 3, bottom: 0, background: "#000", borderRadius: 'var(--radius-icon)', zIndex: 0 }} />
                    <button onClick={() => setShowSettings(true)}
                      style={{ position: "relative", zIndex: 1, background: "#a8e063", border: "2.5px solid #000", borderRadius: 'var(--radius-icon)', width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={ICONS.settings} alt="Settings" style={{ width: 20, height: 20, objectFit: "contain" }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "10px 16px 14px", position: "sticky", top: 0, zIndex: 50 }}>
              {tab === "garden" && <FrostBar />}
            </div>
          </>
        )}

        {/* Wide header — tab title */}
        {isWide && (
          <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "18px 24px", position: "sticky", top: 0, zIndex: 50 }}>
            <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: -0.5, color: "#111" }}>
              {NAV_TABS.find(t => t.id === tab)?.label}
            </div>
          </div>
        )}

        {/* Tab content */}
        <div ref={tabContentRef} style={{ padding: isWide ? "20px 24px" : "16px 14px", flex: 1 }}>
          {tab === "garden" && <GardenTab plants={plants} frostDates={frostDates} onUpdate={handleUpdate} onDelete={handleDelete} onSplit={handleSplit} search={search} setSearch={setSearch} filterZone={filterZone} setFilterZone={setFilterZone} filterStatus={filterStatus} setFilterStatus={setFilterStatus} onAddPlant={openAddFlow} userDB={userDB} onSaveUserDB={saveUserDB} toast={toast} zones={zones} onSaveZones={saveZones} isWide={isWide} />}
          {tab === "seeds" && <SeedLibraryTab seeds={seeds} onSaveSeeds={saveSeeds} onAddToGarden={handleAddSeedToGarden} userDB={userDB} onSaveUserDB={saveUserDB} />}
          {tab === "calendar" && <CalendarTab plants={plants} frostDates={frostDates} seeds={seeds} />}
          {tab === "harvest" && <HarvestTab plants={plants} frostDates={frostDates} onUpdate={handleUpdate} />}
          {tab === "profile" && <ProfileTab plants={plants} frostDates={frostDates} user={user} onOpenSettings={() => setShowSettings(true)} onSignOut={handleSignOut} />}
        </div>
      </div>

      <Toast toasts={toasts} />

      {/* Bottom nav (narrow only) */}
      {!isWide && (
        <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 600, background: "#fff", borderTop: "1px solid #eee", display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
          {NAV_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="nav-tab" style={{ flex: 1, border: "none", background: "none", cursor: "pointer", padding: "10px 4px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <img src={t.icon} alt={t.label} style={{ width: 24, height: 24, objectFit: "contain", opacity: tab === t.id ? 1 : 0.4 }} />
              <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? "#000" : "#aaa", letterSpacing: 0.2 }}>{t.label}</span>
              {tab === t.id && <div style={{ width: 20, height: 2, background: "#a8e063", borderRadius: 2 }} />}
            </button>
          ))}
        </nav>
      )}

      {showAdd && addFlow === "choose" && (
        <Modal onClose={closeAdd} width={480}>
          <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>Add a Plant</h2>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>How would you like to add it?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { flow: "db", icon: ICONS.database, title: "Search database", desc: "Pick from 30+ plants, auto-fills everything", accent: "#f5ece0" },
              { flow: "scan", icon: ICONS.camera, title: "Scan seed packet", desc: "Point camera at a packet, Claude reads it", accent: "#f0f8f0" },
              { flow: "transplant", icon: ICONS.transplantShop, title: "Bought as transplant", desc: "Already growing — quick add", accent: "#f0f4ff" },
              { flow: "manual", icon: ICONS.edit, title: "Enter manually", desc: "Blank form, full control", accent: "#fafaf8" },
            ].map(opt => (
              <div key={opt.flow} style={{ position: "relative", paddingBottom: 3 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 3, bottom: 0, background: "#000", borderRadius: 'var(--radius-card-sm)', zIndex: 0 }} />
                <button onClick={() => setAddFlow(opt.flow)} style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 14, padding: 16, background: opt.accent, border: "2px solid #000", borderRadius: 'var(--radius-card-sm)', cursor: "pointer", textAlign: "left", width: "100%", boxSizing: "border-box" }}>
                  <div style={{ width: 48, height: 48, background: "#fff", border: "2px solid #000", borderRadius: 'var(--radius-icon)', display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><img src={opt.icon} alt="" style={{ width: 26, height: 26, objectFit: "contain" }} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{opt.title}</div>
                    <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{opt.desc}</div>
                  </div>
                  <span style={{ fontSize: 18, color: "#aaa" }}>›</span>
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showAdd && addFlow === "db" && (
        <Modal onClose={closeAdd} width={480}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <button onClick={() => setAddFlow("choose")} style={{ background: "#f0f0f0", border: "none", borderRadius: 'var(--radius-sm)', padding: "6px 12px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>← Back</button>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Search Database</h2>
          </div>
          <DBSearchPicker userDB={userDB} onSelect={entry => { setPrefillPlant(entry); setAddFlow("manual"); }} />
        </Modal>
      )}

      {showAdd && addFlow === "scan" && (
        <Modal onClose={closeAdd} width={480}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <button onClick={() => setAddFlow("choose")} style={{ background: "#f0f0f0", border: "none", borderRadius: 'var(--radius-sm)', padding: "6px 12px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>← Back</button>
          </div>
          <SeedScanPicker onScanned={data => {
            const seedEntry = { ...data, id: generateId(), addedAt: new Date().toISOString(), started: false, source: "Scanned" };
            saveSeeds([...seeds, seedEntry]);
            toast(`${data.name || "Packet"} saved to Seed Library`, { icon: ICONS.seeds });
            setPrefillPlant(data); setAddFlow("manual");
          }} />
        </Modal>
      )}

      {showAdd && (addFlow === "manual" || addFlow === "transplant") && (
        <AddPlantModal onAdd={handleAdd} onClose={closeAdd} userDB={userDB} onSaveUserDB={saveUserDB} prefill={prefillPlant} isTransplant={addFlow === "transplant"} zones={zones} />
      )}

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} zones={zones}
          onSaveZones={z => { saveZones(z); toast("Zones saved", { icon: ICONS.seedlingGreen }); }}
          onRenameZone={(id, name) => { renameZone(id, name); toast("Zone renamed", { icon: ICONS.zone }); }}
          frostDates={frostDates} onSaveFrost={f => { saveFrost(f); toast("Frost dates saved", { icon: ICONS.settings }); }}
          plants={plants} seeds={seeds} lastBackup={lastBackup} daysSince={daysSince}
          onExport={handleExport} onImport={handleImport} importError={importError} importSuccess={importSuccess}
          user={user}
          onShowAuth={() => { setShowSettings(false); setShowAuth(true); }}
          onSignOut={handleSignOut} />
      )}

      {showBackup && (
        <Modal onClose={() => { setShowBackup(false); setImportError(""); setImportSuccess(false); }} width={440}>
          <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}><img src={ICONS.backup} alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />Backup & Restore</h2>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>Export to iCloud or Google Drive to keep it safe.</p>
          <div style={{ background: "#fdf6ee", border: "1px solid #d4a96a", borderRadius: 'var(--radius-icon)', padding: 16, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><img src={ICONS.save} alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />Export</div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{plants.length} plants · {seeds.length} seeds</div>
            {lastBackup && <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>Last backup: {daysSince(lastBackup) === 0 ? "today" : `${daysSince(lastBackup)} days ago`}</div>}
            <button onClick={handleExport} style={{ width: "100%", padding: 11, background: "#5c3d1e", color: "#fff", border: "none", borderRadius: 'var(--radius-input)', cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Download Backup</button>
          </div>
          <div style={{ background: "#fafaf8", border: "1px solid #e8e8e8", borderRadius: 'var(--radius-icon)', padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><img src={ICONS.backup} alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />Restore</div>
            <label style={{ display: "block", width: "100%", padding: 11, background: "#fff", border: "1.5px dashed #ccc", borderRadius: 'var(--radius-input)', cursor: "pointer", fontSize: 14, textAlign: "center", color: "#555", boxSizing: "border-box" }}>
              Choose Backup File
              <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
            </label>
            {importError && <div style={{ marginTop: 8, fontSize: 13, color: "#c0392b", background: "#fdecea", padding: "8px 12px", borderRadius: 'var(--radius-sm)' }}>{importError}</div>}
            {importSuccess && <div style={{ marginTop: 8, fontSize: 13, color: "#5c3d1e", background: "#f5ece0", padding: "8px 12px", borderRadius: 'var(--radius-sm)' }}>✓ Restored!</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}
