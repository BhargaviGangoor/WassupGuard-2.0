import { ScanLog, ThreatLevel } from '../types';

// Helper to compute SHA-256 hash of a file
export const computeFileHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Simulate VirusTotal API response
// In a real app, this would use fetch() to call the VirusTotal API using the apiKey
export const scanFileWithVirusTotal = async (file: File, apiKey: string): Promise<ScanLog> => {
  const hash = await computeFileHash(file);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulation logic: determine threat based on random chance or specific filenames for demo
  let threatLevel = ThreatLevel.SAFE;
  let details = "No threats detected by engine.";

  const randomFactor = Math.random();
  
  if (file.name.toLowerCase().includes('virus') || file.name.toLowerCase().includes('malware')) {
    threatLevel = ThreatLevel.MALICIOUS;
    details = "Identified as Trojan.AndroidOS.Generic";
  } else if (file.name.toLowerCase().includes('hack') || randomFactor > 0.9) {
    threatLevel = ThreatLevel.SUSPICIOUS;
    details = "Heuristic analysis flags this file as potentially unsafe.";
  } else if (randomFactor > 0.95) {
     threatLevel = ThreatLevel.MALICIOUS;
     details = "Known malicious signature match.";
  }

  return {
    id: crypto.randomUUID(),
    fileName: file.name,
    fileSize: file.size,
    hash: hash,
    timestamp: Date.now(),
    threatLevel: threatLevel,
    details: details
  };
};

export const calculateSafeScore = (clean: number, malicious: number): number => {
  // Base score 100
  // -10 for every malicious file
  // +1 reputation boost for every 5 clean files
  let score = 100 - (malicious * 10) + Math.floor(clean / 5);
  return Math.max(0, Math.min(100, score));
};

// --- Background Simulation Helpers ---

const WHATSAPP_NAMES = [
  'IMG-20240521-WA0042.jpg',
  'VID-20240521-WA0043.mp4',
  'PTT-20240521-WA0045.opus',
  'WhatsApp Image 2024-05-21 at 10.15.22.jpeg',
  'Shared Document.pdf',
  'Funny_Cat_Video.mp4',
];

const MALICIOUS_NAMES = [
  'Free_Nitro_Generator.apk',
  'WhatsApp_Pink_Mode.apk',
  'Invoice_May_2024.exe',
  'winner_prize_claim.html',
];

export const simulateBackgroundScan = (): ScanLog => {
  // 90% chance of being a normal WhatsApp file, 10% chance of being a threat
  const isThreat = Math.random() > 0.90;
  
  let fileName = "";
  let threatLevel = ThreatLevel.SAFE;
  let details = "Clean.";

  if (isThreat) {
    fileName = MALICIOUS_NAMES[Math.floor(Math.random() * MALICIOUS_NAMES.length)];
    threatLevel = Math.random() > 0.5 ? ThreatLevel.MALICIOUS : ThreatLevel.SUSPICIOUS;
    details = threatLevel === ThreatLevel.MALICIOUS 
      ? "Trojan.AndroidOS.FakeApp detected" 
      : "Suspicious file structure detected";
  } else {
    fileName = WHATSAPP_NAMES[Math.floor(Math.random() * WHATSAPP_NAMES.length)];
    // Add unique ID to filename
    const ext = fileName.split('.').pop();
    const base = fileName.substring(0, fileName.lastIndexOf('.'));
    fileName = `${base}_${Math.floor(Math.random() * 1000)}.${ext}`;
  }

  return {
    id: crypto.randomUUID(),
    fileName: fileName,
    fileSize: Math.floor(Math.random() * 2000000) + 50000,
    hash: Array(64).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join(''),
    timestamp: Date.now(),
    threatLevel: threatLevel,
    details: details
  };
};