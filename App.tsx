import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShieldCheck, 
  Settings as SettingsIcon, 
  Info, 
  Trash2, 
  AlertTriangle, 
  ExternalLink,
  Lock,
  X,
  Activity
} from 'lucide-react';
import BottomNav from './components/BottomNav';
import RadialScore from './components/RadialScore';
import Scanner from './components/Scanner';
import { ScanLog, ThreatLevel, AppSettings, SafetyTip, Notification } from './types';
import { calculateSafeScore, simulateBackgroundScan } from './services/scannerService';
import { History as HistoryIcon } from 'lucide-react';

// --- CONFIGURATION ---
// You can paste your key here to have it load automatically
const DEFAULT_API_KEY = "d6c43ed4959ea35a56649c290eab0197236859ffd281481564dee159ba9125d4"; 

// --- Toast Component ---
const ToastContainer: React.FC<{ notifications: Notification[], onClose: (id: string) => void }> = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
      {notifications.map(n => (
        <div 
          key={n.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md animate-in slide-in-from-top-2 duration-300 max-w-sm w-full
            ${n.type === 'danger' ? 'bg-red-950/90 border-red-800 text-red-100' : 
              n.type === 'success' ? 'bg-emerald-950/90 border-emerald-800 text-emerald-100' :
              n.type === 'warning' ? 'bg-yellow-950/90 border-yellow-800 text-yellow-100' :
              'bg-slate-900/90 border-slate-700 text-slate-100'}`}
        >
          <div className={`p-1 rounded-full ${n.type === 'danger' ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
            {n.type === 'danger' ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
          </div>
          <span className="text-sm font-medium flex-1 truncate">{n.message}</span>
          <button onClick={() => onClose(n.id)} className="text-white/50 hover:text-white">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

// --- Sub-components for specific screens ---

const HistoryScreen: React.FC<{ logs: ScanLog[], onClear: () => void }> = ({ logs, onClear }) => (
  <div className="p-4 space-y-4 pb-24 animate-in fade-in duration-500">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-white">Scan History</h2>
      {logs.length > 0 && (
        <button onClick={onClear} className="p-2 text-slate-400 hover:text-red-400">
          <Trash2 size={20} />
        </button>
      )}
    </div>
    
    {logs.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <HistoryIcon size={48} className="mb-4 opacity-50" />
        <p>No scans recorded yet.</p>
      </div>
    ) : (
      <div className="space-y-3">
        {logs.map(log => (
          <div key={log.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
            <div className={`mt-1 p-2 rounded-full ${
              log.threatLevel === ThreatLevel.SAFE ? 'bg-emerald-500/20 text-emerald-400' : 
              log.threatLevel === ThreatLevel.MALICIOUS ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {log.threatLevel === ThreatLevel.SAFE ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-white truncate pr-2">{log.fileName}</h4>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 truncate">Hash: {log.hash.substring(0, 12)}...</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  log.threatLevel === ThreatLevel.SAFE ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 
                  log.threatLevel === ThreatLevel.MALICIOUS ? 'bg-red-950 text-red-400 border border-red-900' : 'bg-yellow-950 text-yellow-400 border border-yellow-900'
                }`}>
                  {log.threatLevel}
                </span>
                <span className="text-[10px] text-slate-500">{log.details}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const QuarantineScreen: React.FC<{ logs: ScanLog[] }> = ({ logs }) => {
  const threats = logs.filter(l => l.threatLevel === ThreatLevel.MALICIOUS);
  
  return (
    <div className="p-4 space-y-4 pb-24 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-white mb-4">Quarantine</h2>
      {threats.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-center">
          <ShieldCheck size={48} className="mb-4 text-emerald-500 opacity-50" />
          <p className="text-white font-medium">You are safe!</p>
          <p className="text-sm mt-1">No threats currently in quarantine.</p>
        </div>
      ) : (
        threats.map(log => (
          <div key={log.id} className="bg-red-950/30 p-4 rounded-xl border border-red-900/50 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Lock className="text-red-500" size={24} />
              <div>
                <h4 className="font-bold text-red-100">{log.fileName}</h4>
                <p className="text-xs text-red-400/80">Isolated in: /data/quarantine/</p>
              </div>
            </div>
            <div className="bg-black/40 p-3 rounded-lg text-xs font-mono text-slate-300 break-all">
              {log.hash}
            </div>
            <div className="flex gap-2 mt-1">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                Delete Permanently
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const TipsScreen: React.FC = () => {
  const tips: SafetyTip[] = [
    { id: '1', title: 'Two-Step Verification', description: 'Enable 2FA in WhatsApp Settings > Account to prevent account theft.', icon: 'lock', severity: 'high' },
    { id: '2', title: 'Unknown Links', description: 'Never click short-links (bit.ly, etc) from unknown numbers.', icon: 'link', severity: 'medium' },
    { id: '3', title: 'Media Auto-Download', description: 'Turn off auto-download for photos/videos to stop malicious payloads.', icon: 'download', severity: 'medium' },
    { id: '4', title: 'Privacy Settings', description: 'Set "Last Seen" and "Profile Photo" to "My Contacts" only.', icon: 'eye', severity: 'low' },
  ];

  return (
    <div className="p-4 space-y-4 pb-24 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-white mb-2">Safety Tips</h2>
      <div className="grid grid-cols-1 gap-4">
        {tips.map(tip => (
          <div key={tip.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                tip.severity === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {tip.id === '1' ? <Lock size={24} /> : tip.id === '3' ? <SettingsIcon size={24} /> : <Info size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{tip.title}</h3>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">{tip.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsScreen: React.FC<{ settings: AppSettings, onSave: (s: AppSettings) => void }> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-white">Settings</h2>
      
      <div className="space-y-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Scanner Engine</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">VirusTotal API Key</label>
              <input 
                type="password" 
                value={localSettings.apiKey}
                onChange={(e) => setLocalSettings({...localSettings, apiKey: e.target.value})}
                placeholder="Enter your API Key"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <Info size={12} /> Required for real cloud scanning.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Background Monitor</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-white font-medium">Real-time Protection</div>
              <div className="text-xs text-slate-500">Scan new WhatsApp files automatically</div>
            </div>
            <button 
              onClick={() => setLocalSettings(prev => ({...prev, backgroundScan: !prev.backgroundScan}))}
              className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.backgroundScan ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${localSettings.backgroundScan ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          {localSettings.backgroundScan && (
             <p className="text-xs text-emerald-500/80 mt-2 bg-emerald-500/10 p-2 rounded">
                Simulated mode active: The app will periodically 'detect' files to demonstrate functionality.
             </p>
          )}
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [logs, setLogs] = useState<ScanLog[]>([]);
  
  // Initialize settings from localStorage or defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('wassup_settings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      apiKey: DEFAULT_API_KEY,
      backgroundScan: true,
      scanIntervalMinutes: 15
    };
  });
  
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Persist settings changes
  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('wassup_settings', JSON.stringify(newSettings));
    addNotification('Settings saved successfully', 'success');
  };

  const addNotification = (message: string, type: 'info' | 'success' | 'warning' | 'danger') => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, message, type }]);
    // Auto dismiss
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const stats = useMemo(() => {
    const malicious = logs.filter(l => l.threatLevel === ThreatLevel.MALICIOUS).length;
    const clean = logs.filter(l => l.threatLevel === ThreatLevel.SAFE).length;
    return {
      total: logs.length,
      malicious,
      clean,
      score: calculateSafeScore(clean, malicious)
    };
  }, [logs]);

  // Background Scanning Logic
  useEffect(() => {
    if (!settings.backgroundScan) return;

    // Use a faster interval for demo purposes (e.g. every 8-15 seconds)
    const intervalTime = 8000 + Math.random() * 5000;
    
    const interval = setInterval(() => {
      // 40% chance to detect a file per tick to feel "random"
      if (Math.random() > 0.6) {
        const newLog = simulateBackgroundScan();
        setLogs(prev => [newLog, ...prev]);
        
        if (newLog.threatLevel === ThreatLevel.MALICIOUS) {
          addNotification(`THREAT BLOCKED: ${newLog.fileName}`, 'danger');
        } else if (newLog.threatLevel === ThreatLevel.SUSPICIOUS) {
          addNotification(`Suspicious file detected: ${newLog.fileName}`, 'warning');
        } else {
          addNotification(`Auto-scanned: ${newLog.fileName} (Safe)`, 'success');
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [settings.backgroundScan]);

  const handleManualScanComplete = (log: ScanLog) => {
    setLogs(prev => [log, ...prev]);
    if (log.threatLevel === ThreatLevel.MALICIOUS) {
      addNotification(`Threat Detected! Moved to Quarantine.`, 'danger');
      setActiveTab('quarantine');
    } else {
      addNotification(`Scan Complete: File is Safe`, 'success');
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <div className="flex flex-col h-full animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="pt-8 px-6 pb-4">
              <h1 className="text-2xl font-bold text-white">Wassup Guard</h1>
              <div className="flex items-center gap-2 mt-1">
                {settings.backgroundScan ? (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">Monitoring WhatsApp</span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-sm">Monitoring Paused</span>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="mb-6">
              <RadialScore score={stats.score} />
            </div>

            {/* Main Actions */}
            <div className="px-6 space-y-4 flex-1 overflow-y-auto no-scrollbar">
              <Scanner apiKey={settings.apiKey} onScanComplete={handleManualScanComplete} />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between h-28">
                  <div className="p-2 bg-blue-500/20 w-fit rounded-lg text-blue-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.clean}</div>
                    <div className="text-xs text-slate-400">Files Clean</div>
                  </div>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between h-28">
                  <div className="p-2 bg-red-500/20 w-fit rounded-lg text-red-400">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.malicious}</div>
                    <div className="text-xs text-slate-400">Threats Blocked</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Mini-List */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Recent Scans</h3>
                  <button onClick={() => setActiveTab('history')} className="text-xs text-emerald-400">View All</button>
                </div>
                <div className="space-y-2">
                  {logs.slice(0, 3).map(log => (
                    <div key={log.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${log.threatLevel === ThreatLevel.SAFE ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-slate-300 truncate flex-1">{log.fileName}</span>
                      <span className="text-xs text-slate-500 uppercase">{log.threatLevel}</span>
                    </div>
                  ))}
                  {logs.length === 0 && <p className="text-xs text-slate-500 italic">No recent activity.</p>}
                </div>
              </div>
            </div>
          </div>
        );
      case 'history':
        return <HistoryScreen logs={logs} onClear={() => setLogs([])} />;
      case 'quarantine':
        return <QuarantineScreen logs={logs} />;
      case 'tips':
        return <TipsScreen />;
      case 'settings':
        return <SettingsScreen settings={settings} onSave={updateSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-96 bg-emerald-900/10 -z-10 rounded-b-[3rem] blur-3xl pointer-events-none" />
      
      <ToastContainer notifications={notifications} onClose={removeNotification} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        {renderContent()}
      </main>

      {/* Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;