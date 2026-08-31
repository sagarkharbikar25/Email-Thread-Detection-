# Person 5: Frontend Developer - React UI & Visualization
## SIH 2026 - 6 Hour Sprint

**Your Role**: Next.js frontend, React components, visualization  
**Key Dependencies**: P1 (API endpoints), P6 (build/deployment)  
**Success =**: All 7 critical pages working by Hour 5:30

---

## Hour 0:30 - 1:30: Next.js Setup & Design System

### Task 1: Project Setup
```bash
cd apps/web
npx create-next-app@latest . --typescript --tailwind --app

# Install dependencies
npm install \
  react-flow-renderer \
  maplibre-gl \
  recharts \
  axios \
  zustand \
  @tanstack/react-query \
  shadcn-ui \
  lucide-react
```

### Task 2: Design Tokens
Create `apps/web/src/styles/tokens.css`:
```css
:root {
  /* Backgrounds */
  --bg-base: #0a0e17;
  --bg-surface: #0f1624;
  --bg-elevated: #162032;
  --border: #1e2d45;
  
  /* Text */
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-mono: #67e8f9;
  
  /* Severity */
  --critical: #ef4444;
  --high: #f97316;
  --medium: #eab308;
  --low: #22c55e;
  --info: #3b82f6;
  
  /* Accent */
  --accent: #3b82f6;
  --accent-hover: #2563eb;
}
```

### Task 3: Core Components
Create `apps/web/src/components/RiskScore.tsx`:
```typescript
export function RiskScore({ score, size = 'md' }: { score: number; size?: string }) {
  const getColor = (s: number) => {
    if (s >= 85) return 'text-red-500';
    if (s >= 60) return 'text-orange-500';
    if (s >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getLabel = (s: number) => {
    if (s >= 85) return 'CRITICAL';
    if (s >= 60) return 'HIGH';
    if (s >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const sizes = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-32 h-32 text-5xl',
  };

  return (
    <div className={`flex flex-col items-center justify-center rounded-full border-4 ${getColor(score)} ${sizes[size]}`}>
      <div className="font-bold">{score}</div>
      <div className="text-xs mt-1">{getLabel(score)}</div>
    </div>
  );
}
```

Create `apps/web/src/components/ThreatBadge.tsx`:
```typescript
export function ThreatBadge({ classification }: { classification: string }) {
  const colors: Record<string, string> = {
    'BUSINESS_EMAIL_COMPROMISE': 'bg-red-900 text-red-100',
    'PHISHING': 'bg-orange-900 text-orange-100',
    'SPOOFING': 'bg-yellow-900 text-yellow-100',
    'LEGITIMATE': 'bg-green-900 text-green-100',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[classification] || 'bg-gray-700'}`}>
      {classification}
    </span>
  );
}
```

---

## Hour 1:30 - 2:30: Core Pages

### Task 1: Login Page
Create `apps/web/src/app/login/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user_role', response.data.role);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold mb-6 text-white">TRACE</h1>
        <p className="text-gray-400 mb-6">Email Forensic Investigation</p>

        {error && <div className="bg-red-900 text-red-100 p-3 rounded mb-4">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-700 text-white p-3 rounded mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-700 text-white p-3 rounded mb-6"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-semibold"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">Demo credentials:</p>
          <p className="text-gray-300 text-sm">Email: demo.analyst@institution.in</p>
          <p className="text-gray-300 text-sm">Password: demo123</p>
        </div>
      </div>
    </div>
  );
}
```

### Task 2: Dashboard (Command Center)
Create `apps/web/src/app/dashboard/page.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { RiskScore, ThreatBadge } from '@/components';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/dashboard/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">TRACE Command Center</h1>

        {/* Status Bar */}
        <div className="bg-slate-800 p-4 rounded-lg mb-8 text-sm text-gray-300">
          <span className="mr-6">● System Status: Ready</span>
          <span className="mr-6">● Analysis Queue: {stats?.queue_count || 0} pending</span>
          <span>● Workers: ● 2/2 active</span>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-1 bg-slate-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Active Cases</h2>
            <div className="space-y-2">
              {stats?.active_cases?.map((c: any) => (
                <div key={c.id} className="bg-slate-700 p-3 rounded">
                  <p className="text-white font-semibold">{c.case_number}</p>
                  <p className="text-gray-400 text-sm">{c.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 bg-slate-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Live Alerts</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {stats?.alerts?.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between bg-slate-700 p-3 rounded">
                  <div>
                    <p className="text-white">{a.type}</p>
                    <p className="text-gray-400 text-sm">{a.email_subject}</p>
                  </div>
                  <RiskScore score={a.risk_score} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => router.push('/upload')}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-semibold"
        >
          + Upload Email
        </button>
      </div>
    </div>
  );
}
```

---

## Hour 2:30 - 3:30: Email Upload & Analysis Pages

### Task: Upload & Analysis Pages
Create `apps/web/src/app/upload/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [hash, setHash] = useState('');
  const router = useRouter();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/emails/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setHash(response.data.sha256);

      // Redirect to analysis page after short delay
      setTimeout(() => {
        router.push(`/analysis/${response.data.email_id}`);
      }, 1000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Upload failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Ingest Email</h1>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition"
        >
          {file ? (
            <div>
              <p className="text-white font-semibold">{file.name}</p>
              <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-white">↑ Drag .eml file here</p>
              <p className="text-gray-400 text-sm">or click to browse</p>
            </div>
          )}

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="file-input"
          />
        </div>

        <button
          onClick={() => document.getElementById('file-input')?.click()}
          className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded"
        >
          Choose File
        </button>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-semibold disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload & Analyze'}
        </button>

        {hash && (
          <div className="mt-6 bg-slate-800 p-4 rounded">
            <p className="text-gray-400 text-xs">SHA-256 Hash</p>
            <p className="text-mono text-xs text-cyan-400 break-all">{hash}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Hour 3:30 - 4:30: Analysis Pages

### Task: Analysis Detail Page
Create `apps/web/src/app/analysis/[id]/page.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { RiskScore, ThreatBadge } from '@/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalysisPage() {
  const params = useParams();
  const emailId = params.id as string;
  const [email, setEmail] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(pollAnalysis, 2000);
    return () => clearInterval(interval);
  }, [emailId]);

  const pollAnalysis = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/emails/${emailId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEmail(response.data.email);
      setAnalysis(response.data.analysis);

      if (response.data.analysis?.risk_score !== undefined) {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch analysis', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 flex items-center justify-center">
        <div className="text-white">
          <p className="text-lg">Analyzing email...</p>
          <div className="mt-4 animate-spin">⟳ Processing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">{email?.subject}</p>
              <div className="flex items-center gap-4">
                <RiskScore score={analysis?.risk_score || 0} size="lg" />
                <div>
                  <ThreatBadge classification={analysis?.classification} />
                  <p className="text-gray-400 text-sm mt-2">Confidence: {analysis?.confidence || 0}%</p>
                </div>
              </div>
            </div>
            <button className="bg-blue-600 px-4 py-2 rounded text-white">+ Create Case</button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="bg-slate-800 p-6 rounded-lg">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="trace">Trace Path</TabsTrigger>
            <TabsTrigger value="graph">Threat Graph</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Detection Signals</h3>
              {analysis?.signals?.map((signal: any, i: number) => (
                <div key={i} className="bg-slate-700 p-4 rounded flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{signal.title}</p>
                    <p className="text-gray-400 text-sm">{signal.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-semibold bg-${signal.severity}-900`}>
                    {signal.severity}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="headers">
            <p className="text-gray-400">Headers table would go here</p>
          </TabsContent>

          <TabsContent value="auth">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-700 p-4 rounded">
                <p className="text-gray-400 text-sm">SPF</p>
                <p className="text-white font-semibold mt-2">FAIL</p>
              </div>
              <div className="bg-slate-700 p-4 rounded">
                <p className="text-gray-400 text-sm">DKIM</p>
                <p className="text-white font-semibold mt-2">PASS</p>
              </div>
              <div className="bg-slate-700 p-4 rounded">
                <p className="text-gray-400 text-sm">DMARC</p>
                <p className="text-white font-semibold mt-2">FAIL</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trace">
            <p className="text-gray-400">Relay path visualization would go here</p>
          </TabsContent>

          <TabsContent value="graph">
            <p className="text-gray-400">Threat graph (React Flow) would go here</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

---

## Hour 4:30 - 5:30: Report & Case Pages

### Task: Create Report Page
Create `apps/web/src/app/reports/[emailId]/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import axios from 'axios';

export default function ReportPage({ params }: { params: { emailId: string } }) {
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reports/generate`,
        { email_id: params.emailId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Poll for completion, then download
      const downloadReport = async (reportId: string) => {
        const downloadResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reports/${reportId}/download`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
          }
        );

        const url = window.URL.createObjectURL(downloadResponse.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forensic-report.pdf`;
        a.click();
      };

      // Wait 2s then download
      setTimeout(() => downloadReport(response.data.report_id), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Generate Forensic Report</h1>

        <button
          onClick={generateReport}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-semibold disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate PDF Report'}
        </button>
      </div>
    </div>
  );
}
```

---

## Hour 5:30 - 6:00: Final Check

**Critical Checklist:**
- ✅ Login page works (demo credentials)
- ✅ Dashboard loads stats
- ✅ Upload file drag & drop works
- ✅ Analysis page polls and displays results
- ✅ Risk score displayed prominently
- ✅ Signal list shows
- ✅ Report generation button present

---

**Success = All 7 critical pages functional by end of sprint**

