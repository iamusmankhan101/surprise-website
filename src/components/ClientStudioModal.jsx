import React, { useState } from 'react';
import { useConfig } from '../config/ConfigContext';
import { 
  X, Save, Download, Upload, Share2, Sparkles, RefreshCw, 
  User, Image, MessageSquare, Clock, Music, Check, Copy, ExternalLink 
} from 'lucide-react';

export default function ClientStudioModal() {
  const { 
    config, 
    updateConfig, 
    resetToDefault, 
    exportConfigJson, 
    importConfigJson, 
    generateShareableLink, 
    isStudioOpen, 
    setIsStudioOpen 
  } = useConfig();

  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState(config);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isStudioOpen) return null;

  const handleTextChange = (section, field, value) => {
    setFormData((prev) => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSave = () => {
    updateConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleCopyLink = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          if (importConfigJson(content)) {
            setFormData(JSON.parse(content));
            setSaveSuccess(true);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#18181b] text-zinc-100 w-full max-w-4xl rounded-2xl shadow-2xl border border-zinc-700/80 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Client Customizer Studio
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Seller Mode
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Personalize & generate ready-to-sell birthday sites for any client in minutes.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsStudioOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex border-b border-zinc-800 px-6 bg-zinc-900/60 overflow-x-auto text-xs font-medium gap-2">
          {[
            { id: 'general', label: '1. Basic Info & Hero', icon: User },
            { id: 'polaroids', label: '2. Polaroid Gallery', icon: Image },
            { id: 'chat', label: '3. iMessage Chat', icon: MessageSquare },
            { id: 'cinema', label: '4. Theater Countdown', icon: Clock },
            { id: 'sell', label: '5. Sell & Export Link', icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-amber-400/5 font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          
          {/* TAB 1: General & Hero */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={formData.hero?.recipientName || ''}
                    onChange={(e) => handleTextChange('hero', 'recipientName', e.target.value)}
                    placeholder="e.g. Sana, Chloe, Emma"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-zinc-100 text-sm focus:border-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Birthday Date Label (Top-Left)
                  </label>
                  <input
                    type="text"
                    value={formData.birthDateLabel || ''}
                    onChange={(e) => handleTextChange(null, 'birthDateLabel', e.target.value)}
                    placeholder="e.g. OCT 2, DEC 15"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-zinc-100 text-sm focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Luxury Typography Font Style
                  </label>
                  <select
                    value={formData.hero?.fontTheme || 'royal-garamond'}
                    onChange={(e) => handleTextChange('hero', 'fontTheme', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-zinc-100 text-sm focus:border-amber-400 outline-none"
                  >
                    <option value="syne-couture">Couture Sculpted (Syne)</option>
                    <option value="vogue-editorial">Vogue Haute Couture (Italiana & Bodoni)</option>
                    <option value="royal-garamond">Royal Palace (Cormorant Garamond)</option>
                    <option value="paris-romance">Paris Romance (Script & Serif)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Name Highlight Color
                  </label>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={formData.hero?.highlightColor || '#d99b26'}
                      onChange={(e) => handleTextChange('hero', 'highlightColor', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-zinc-400">
                      {formData.hero?.highlightColor || '#d99b26'} (Mustard Gold)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Hero Heartfelt Message
                </label>
                <textarea
                  rows={3}
                  value={formData.hero?.message || ''}
                  onChange={(e) => handleTextChange('hero', 'message', e.target.value)}
                  placeholder="Personalized birthday message..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-zinc-100 text-sm focus:border-amber-400 outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Background Song (YouTube link or MP3 URL)
                </label>
                <input
                  type="text"
                  value={formData.music?.audioUrl || ''}
                  onChange={(e) => handleTextChange('music', 'audioUrl', e.target.value)}
                  placeholder="https://youtu.be/... or https://...mp3"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-zinc-100 text-sm focus:border-amber-400 outline-none"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Paste a YouTube link (plays in a small "now playing" player) or any direct MP3 link.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Polaroid Gallery */}
          {activeTab === 'polaroids' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  Customize the polaroid stickers and photos matching Screenshot 2:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(formData.polaroids || []).map((pol, idx) => (
                  <div key={pol.id || idx} className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 space-y-2">
                    <div className="flex gap-2">
                      <img src={pol.url} alt="" className="w-12 h-12 object-cover rounded bg-zinc-800 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pol.caption}
                            onChange={(e) => {
                              const updated = [...formData.polaroids];
                              updated[idx].caption = e.target.value;
                              setFormData({ ...formData, polaroids: updated });
                            }}
                            placeholder="Caption (e.g. Cutie)"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs"
                          />
                          <input
                            type="text"
                            value={pol.emoji}
                            onChange={(e) => {
                              const updated = [...formData.polaroids];
                              updated[idx].emoji = e.target.value;
                              setFormData({ ...formData, polaroids: updated });
                            }}
                            className="w-12 text-center bg-zinc-950 border border-zinc-700 rounded px-1 py-1 text-xs"
                          />
                        </div>
                        <input
                          type="text"
                          value={pol.url}
                          onChange={(e) => {
                            const updated = [...formData.polaroids];
                            updated[idx].url = e.target.value;
                            setFormData({ ...formData, polaroids: updated });
                          }}
                          placeholder="Image URL"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: iMessage Chat */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Contact Name Header
                  </label>
                  <input
                    type="text"
                    value={formData.chat?.contactName || ''}
                    onChange={(e) => handleTextChange('chat', 'contactName', e.target.value)}
                    placeholder="e.g. Sweet Sana"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-zinc-100 text-sm focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Timestamp Header
                  </label>
                  <input
                    type="text"
                    value={formData.chat?.timeLabel || ''}
                    onChange={(e) => handleTextChange('chat', 'timeLabel', e.target.value)}
                    placeholder="TODAY 6:10 PM"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-zinc-100 text-sm focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <label className="block text-xs font-semibold text-zinc-300">
                  iMessage Text Chain (Peach Bubbles)
                </label>
                {(formData.chat?.messages || []).map((msg, idx) => (
                  <div key={msg.id || idx} className="flex gap-2 items-center">
                    <span className="text-xs text-zinc-500 font-mono w-6">#{idx + 1}</span>
                    <input
                      type="text"
                      value={msg.text}
                      onChange={(e) => {
                        const updated = [...formData.chat.messages];
                        updated[idx].text = e.target.value;
                        setFormData({
                          ...formData,
                          chat: { ...formData.chat, messages: updated }
                        });
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100"
                    />
                    <input
                      type="text"
                      value={msg.reaction || ''}
                      placeholder="Reaction (❤️)"
                      onChange={(e) => {
                        const updated = [...formData.chat.messages];
                        updated[idx].reaction = e.target.value;
                        setFormData({
                          ...formData,
                          chat: { ...formData.chat, messages: updated }
                        });
                      }}
                      className="w-20 text-center bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Theater Countdown */}
          {activeTab === 'cinema' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Marquee Ticker Tape Text
                </label>
                <input
                  type="text"
                  value={formData.cinema?.marqueeTapeText || ''}
                  onChange={(e) => handleTextChange('cinema', 'marqueeTapeText', e.target.value)}
                  placeholder="SAVE THE DATE • OCTOBER 11..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-zinc-100 text-sm focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Curtain Subtitle (Cursive)
                </label>
                <input
                  type="text"
                  value={formData.cinema?.subtitle || ''}
                  onChange={(e) => handleTextChange('cinema', 'subtitle', e.target.value)}
                  placeholder="a little production, live October 11th"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-zinc-100 text-sm focus:border-amber-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Footer Text
                  </label>
                  <input
                    type="text"
                    value={formData.cinema?.footerText || ''}
                    onChange={(e) => handleTextChange('cinema', 'footerText', e.target.value)}
                    placeholder="DOORS OPEN AT MIDNIGHT, IST"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-zinc-100 text-sm focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Countdown Target Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.cinema?.targetDate ? formData.cinema.targetDate.slice(0, 16) : ''}
                    onChange={(e) => handleTextChange('cinema', 'targetDate', new Date(e.target.value).toISOString())}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-zinc-100 text-sm focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Premiere Video (revealed when the countdown ends)
                </label>
                <input
                  type="url"
                  value={formData.cinema?.videoUrl || ''}
                  onChange={(e) => handleTextChange('cinema', 'videoUrl', e.target.value)}
                  placeholder="YouTube link or direct .mp4 URL"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-zinc-100 text-sm focus:border-amber-400 outline-none"
                />
                <p className="mt-1 text-[11px] text-zinc-500">Preview the reveal any time by adding ?premiere to the site URL.</p>
              </div>
            </div>
          )}

          {/* TAB 5: How To Sell & Export Link */}
          {activeTab === 'sell' && (
            <div className="space-y-6">
              
              {/* Method 1: Instant Client Link */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 rounded-xl border border-amber-500/30">
                <h3 className="font-bold text-amber-300 flex items-center gap-2 text-sm sm:text-base">
                  <Share2 className="w-4 h-4 text-amber-400" />
                  Method 1: Instant Unique Client Link (Zero Code / Zero Re-deploy)
                </h3>
                <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                  Every customization you made is encoded into this self-contained link. You can send this exact link directly to your customer! When they open it, their custom photos, name, and countdown will load immediately.
                </p>
                
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2.5 rounded-lg text-xs transition-all shadow-md active:scale-95"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? "Client Link Copied!" : "Copy Shareable Client Link"}</span>
                  </button>

                  <button
                    onClick={() => {
                      const link = generateShareableLink();
                      window.open(link, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold px-4 py-2.5 rounded-lg text-xs transition-all border border-zinc-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </button>
                </div>
              </div>

              {/* Method 2: Download Client JSON Config */}
              <div className="bg-zinc-900 p-4 sm:p-5 rounded-xl border border-zinc-800">
                <h3 className="font-bold text-zinc-200 flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4 text-zinc-400" />
                  Method 2: Standalone Client Config File (.json)
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Export this client's profile as a JSON configuration file. You can archive it, send it to other developers, or load it into any instance of this template.
                </p>

                <div className="mt-4 flex flex-wrap gap-3 items-center">
                  <button
                    onClick={exportConfigJson}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-lg text-xs font-semibold border border-zinc-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download client-config.json</span>
                  </button>

                  <label className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-xs font-semibold border border-zinc-700 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Load Saved Client JSON</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Method 3: Commercial Client Pricing Tips */}
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-xs space-y-2 text-zinc-400">
                <h4 className="font-semibold text-zinc-300">💡 Monetization & Client Delivery Guide:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Standard Package ($15 - $35)</strong>: Send the client their personalized live hosted web link with custom music & their photos.</li>
                  <li><strong>Premium VIP Package ($50 - $99)</strong>: Custom domain (e.g. <code>happybirthdaysana.com</code>), unlimited photos, and custom written letters.</li>
                  <li><strong>Host for Free</strong>: You can host this single site on Vercel or Netlify for free, and create unlimited client variations effortlessly using the URL share links!</li>
                </ul>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-zinc-900 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-rose-400 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset To Default (Sana)</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsStudioOpen(false)}
              className="px-4 py-2 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 active:scale-95'
              }`}
            >
              {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saveSuccess ? 'Changes Applied!' : 'Apply To Website'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
