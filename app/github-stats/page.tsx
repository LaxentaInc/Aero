'use client';
import React, { useState } from 'react';
import { Copy, Check, Github, Sparkles } from 'lucide-react';

export default function GitHubHeatmapGenerator() {
    const [username, setUsername] = useState('shelleyloosespatience');
    const [color, setColor] = useState('6366F1');
    const [bgColor, setBgColor] = useState('0D1117');
    const [theme, setTheme] = useState('default');
    const [showStats, setShowStats] = useState(true);
    const [copied, setCopied] = useState(false);

    const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}`;
    const previewUrl = `${baseUrl}/api/github-heatmap?user=${username}&color=${color}&bg=${bgColor}&theme=${theme}&stats=${showStats}`;
    const markdownCode = `![GitHub Activity](${previewUrl})`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(markdownCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const presetColors = [
        { name: 'Indigo', color: '6366F1', bg: '0D1117' },
        { name: 'Green', color: '10B981', bg: '0D1117' },
        { name: 'Pink', color: 'EC4899', bg: '0D1117' },
        { name: 'Purple', color: 'A855F7', bg: '0D1117' },
        { name: 'Cyan', color: '06B6D4', bg: '0D1117' },
        { name: 'Orange', color: 'F97316', bg: '0D1117' },
    ];

    return (
        <div className="min-h-screen bg-[#0D1117] text-white">
            <div className="h-20"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Github className="w-12 h-12 text-[#6366F1]" />
                        <Sparkles className="w-8 h-8 text-[#6366F1]" />
                    </div>
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#6366F1] to-[#A855F7] bg-clip-text text-transparent">
                        Git Activity Chart 
                    </h1>
                    <p className="text-xl text-gray-400">
                        contribution graph for your README or portfolios
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-[#161B22] rounded-xl p-8 border border-gray-800">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            <span className="text-[#6366F1]">⚙️</span> Customize
                        </h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                GitHub Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="your-username"
                                className="w-full bg-[#0D1117] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366F1] transition"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Theme Style
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {['default', 'compact', 'minimal'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        className={`px-4 py-3 rounded-lg border transition capitalize ${theme === t
                                                ? 'bg-[#6366F1] border-[#6366F1] text-white'
                                                : 'bg-[#0D1117] border-gray-700 text-gray-400 hover:border-[#6366F1]'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Color Presets
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {presetColors.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => {
                                            setColor(preset.color);
                                            setBgColor(preset.bg);
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition"
                                    >
                                        <div
                                            className="w-6 h-6 rounded"
                                            style={{ backgroundColor: `#${preset.color}` }}
                                        ></div>
                                        <span className="text-sm text-gray-300">{preset.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Primary Color
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={`#${color}`}
                                        onChange={(e) => setColor(e.target.value.substring(1))}
                                        className="w-12 h-12 rounded cursor-pointer bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value.replace('#', ''))}
                                        placeholder="6366F1"
                                        className="flex-1 bg-[#0D1117] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#6366F1]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Background
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={`#${bgColor}`}
                                        onChange={(e) => setBgColor(e.target.value.substring(1))}
                                        className="w-12 h-12 rounded cursor-pointer bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value.replace('#', ''))}
                                        placeholder="0D1117"
                                        className="flex-1 bg-[#0D1117] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#6366F1]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-[#0D1117] rounded-lg border border-gray-700">
                            <span className="text-sm font-medium text-gray-300">Show Statistics</span>
                            <button
                                onClick={() => setShowStats(!showStats)}
                                className={`relative w-14 h-7 rounded-full transition ${showStats ? 'bg-[#6366F1]' : 'bg-gray-700'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${showStats ? 'translate-x-7' : 'translate-x-0'
                                        }`}
                                ></div>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#161B22] rounded-xl p-8 border border-gray-800">
                            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                                <span className="text-[#6366F1]"></span> Preview
                            </h2>
                            <div className="bg-[#0D1117] rounded-lg p-6 border border-gray-700 flex items-center justify-center min-h-[200px]">
                                <img
                                    src={previewUrl}
                                    alt="GitHub Activity Heatmap"
                                    className="max-w-full"
                                    key={previewUrl}
                                />
                            </div>
                        </div>

                        {/* Markdown Code */}
                        <div className="bg-[#161B22] rounded-xl p-8 border border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <span className="text-[#6366F1]"></span> Markdown Code
                                </h2>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] rounded-lg transition"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="bg-[#0D1117] rounded-lg p-4 border border-gray-700">
                                <code className="text-sm text-gray-300 break-all">
                                    {markdownCode}
                                </code>
                            </div>
                        </div>

                        {/* Direct URL */}
                        <div className="bg-[#161B22] rounded-xl p-8 border border-gray-800">
                            {/* header row with button */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <span className="text-[#6366F1]">🔗</span> Direct URL
                                </h2>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-1 px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] rounded-lg transition"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* URL block */}
                            <div className="bg-[#0D1117] rounded-lg p-4 border border-gray-700">
                                <code className="text-sm text-gray-300 break-all">
                                    {previewUrl}
                                </code>
                            </div>
                        </div>

                    </div>
                </div>

                {/* API Info */}
                <div className="mt-12 bg-[#161B22] rounded-xl p-8 border border-gray-800">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <span className="text-[#6366F1]"></span> usage?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <h3 className="text-lg font-medium text-[#6366F1] mb-3">Parameters</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><code className="text-[#6366F1]">user</code> - GitHub username (required)</li>
                                <li><code className="text-[#6366F1]">color</code> - Primary color (hex without #)</li>
                                <li><code className="text-[#6366F1]">bg</code> - Background color (hex without #)</li>
                                <li><code className="text-[#6366F1]">theme</code> - default | compact | minimal</li>
                                <li><code className="text-[#6366F1]">stats</code> - Show stats (true | false)</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-[#6366F1] mb-3">Example</h3>
                            <div className="bg-[#0D1117] rounded-lg p-4 border border-gray-700">
                                <code className="text-xs text-gray-300 break-all">
                                    /api/github-heatmap?user=yourusername&color=6366F1&theme=compact
                                </code>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center text-gray-500 text-sm">
                    <p><a href="https://github.com/shelleyloosespatience" className="text-[#6366F1] hover:underline">@shelleyloosespatience</a></p>
                    <p className="mt-2">Free to use • No API key required obv</p>
                </div>
            </div>
        </div>
    );
}