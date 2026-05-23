"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Award,
  Download,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Lock,
  Eye,
  X
} from "lucide-react";

interface Certificate {
  id: number;
  course_title: string;
  certificate_id: string;
  issued_at: string;
  pdf_url: string;
  progress_percent?: number;
  is_locked?: boolean;
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Verification tool state
  const [verifyId, setVerifyId] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  // Certificate Preview Modal
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getCertificates();
      setCerts(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch certificates from the server.");
      // Fallback local mock certificates for testing representation
      setCerts([
        {
          id: 1,
          course_title: "Advanced Interview Strategies & Behavioral Mastery",
          certificate_id: "PRE4M56UV-MOCK1",
          issued_at: new Date().toISOString(),
          pdf_url: "#",
          progress_percent: 100,
          is_locked: false
        },
        {
          id: 2,
          course_title: "Modern Mobile App Development for Beginners",
          certificate_id: "",
          issued_at: "",
          pdf_url: "#",
          progress_percent: 45,
          is_locked: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Verify a certificate code
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyId.trim()) return;

    setVerifyLoading(true);
    setVerifyResult(null);
    try {
      const res = await api.verifyCertificate(verifyId.trim());
      setVerifyResult(res);
    } catch (err: any) {
      console.error(err);
      setVerifyResult({
        valid: false,
        error: "Credential hash not found or formatting is invalid."
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  // Format date utility
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Truncate certificate hash
  const shortHash = (hash: string) => {
    if (hash.length <= 12) return hash;
    return `${hash.substring(0, 8).toUpperCase()}...`;
  };

  // Get download url
  const getDownloadUrl = (cert: Certificate) => {
    if (cert.pdf_url && cert.pdf_url !== "#") {
      return cert.pdf_url;
    }
    return api.getCertificateDownloadUrl(cert.id);
  };

  const earnedCerts = certs.filter((c) => !c.is_locked);
  const lockedCerts = certs.filter((c) => c.is_locked);

  return (
    <div className="space-y-8 pb-16 relative">
      {/* Header - Swiss Minimalism */}
      <div>
        <h1 className="text-3xl font-display font-black text-black flex items-center gap-2 uppercase tracking-tight">
          <Award className="w-8 h-8 text-black" /> Credentials Hub
        </h1>
        <p className="text-xs text-neutral-600 font-bold mt-1 uppercase tracking-wider">
          Access, verify, and export your completed course completion certificates.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Certificates List */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Earned Certificates */}
          <div className="bg-white rounded-none border border-black p-6 space-y-4">
            <h2 className="font-black text-base text-black border-b border-black pb-2 flex items-center gap-2 uppercase tracking-wider">
              🎓 Earned Certificates ({earnedCerts.length})
            </h2>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-2 border-black border-t-transparent animate-spin rounded-none mb-3" />
                <p className="text-xs text-black font-black uppercase tracking-wider animate-pulse">
                  Querying credentials database...
                </p>
              </div>
            ) : earnedCerts.length === 0 ? (
              <div className="py-12 text-center space-y-3 border border-dashed border-neutral-300 rounded-none p-6 bg-neutral-50/50">
                <div className="w-10 h-10 bg-white border border-black rounded-none flex items-center justify-center mx-auto text-black/55">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-xs uppercase tracking-wider text-black/70">No Certificates Earned Yet</h4>
                  <p className="text-[10px] text-neutral-500 max-w-xs mx-auto">
                    Certificates will automatically unlock here once any active course syllabus progress reaches 100%.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {earnedCerts.map((cert) => (
                  <div
                    key={cert.id}
                    className="group bg-white border border-black rounded-none p-5 transition-all flex flex-col justify-between min-h-[220px] relative overflow-hidden hover:bg-neutral-50"
                  >
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div className="w-8 h-8 rounded-none bg-neutral-100 border border-black text-black flex items-center justify-center shrink-0">
                          <Award className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-black uppercase bg-neutral-100 text-black px-2 py-0.5 border border-black flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-black" /> Verified
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-black text-xs text-black line-clamp-2 leading-relaxed uppercase group-hover:underline transition-colors">
                          {cert.course_title}
                        </h4>
                        <div className="flex gap-4 items-center text-[10px] text-neutral-500 font-bold uppercase tracking-wider pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(cert.issued_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-black mt-4 flex items-center justify-between">
                      <div className="text-[10px]">
                        <span className="text-neutral-500 block font-black uppercase tracking-wider text-[8px]">Credential ID</span>
                        <code className="font-mono font-bold text-black">{shortHash(cert.certificate_id)}</code>
                      </div>

                      <div className="flex gap-2">
                        {/* Eye Preview button */}
                        <button
                          onClick={() => setPreviewCert(cert)}
                          className="bg-white border border-black hover:bg-neutral-100 text-black p-2 rounded-none transition-colors"
                          title="Preview Certificate"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {/* Download button */}
                        <a
                          href={getDownloadUrl(cert)}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-black text-white hover:bg-neutral-800 border border-black p-2 rounded-none transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-white" />
                          <span>PDF</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Locked / In-Progress Certificates */}
          <div className="bg-white rounded-none border border-black p-6 space-y-4">
            <h2 className="font-black text-base text-black border-b border-black pb-2 flex items-center gap-2 uppercase tracking-wider">
              🔒 In-Progress & Locked Certificates ({lockedCerts.length})
            </h2>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-2 border-black border-t-transparent animate-spin rounded-none mb-3" />
                <p className="text-xs text-black font-black uppercase tracking-wider animate-pulse">
                  Querying learning roadmaps...
                </p>
              </div>
            ) : lockedCerts.length === 0 ? (
              <div className="py-12 text-center space-y-3 border border-dashed border-neutral-300 rounded-none p-6 bg-neutral-50/50">
                <div className="w-10 h-10 bg-white border border-black rounded-none flex items-center justify-center mx-auto text-black/55">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-xs uppercase tracking-wider text-black/70">No Active Learning Roadmaps</h4>
                  <p className="text-[10px] text-neutral-500 max-w-xs mx-auto">
                    Generate an AI roadmap or enroll in a syllabus to track your progress and work toward your certificates.
                  </p>
                </div>
                <a
                  href="/roadmap"
                  className="inline-flex bg-black text-white hover:bg-neutral-800 border border-black px-6 py-2.5 rounded-none font-black text-xs uppercase tracking-widest transition-colors mt-2"
                >
                  Generate AI Roadmap
                </a>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {lockedCerts.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-neutral-50 border border-black rounded-none p-5 flex flex-col justify-between min-h-[220px] relative overflow-hidden"
                  >
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div className="w-8 h-8 rounded-none bg-neutral-200 border border-black text-black/60 flex items-center justify-center shrink-0">
                          <Lock className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-black uppercase bg-black text-[#E4FF00] px-2 py-0.5 border border-black flex items-center gap-1">
                          Locked
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-black text-xs text-black/60 line-clamp-2 leading-relaxed uppercase">
                          {cert.course_title}
                        </h4>
                      </div>

                      {/* Swiss Brutalist Progress Bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-neutral-500">
                          <span>Syllabus Completion</span>
                          <span>{cert.progress_percent}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 border border-black h-4 rounded-none overflow-hidden relative">
                          <div
                            className="bg-black h-full transition-all duration-500"
                            style={{ width: `${cert.progress_percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-dashed border-neutral-300 mt-4 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                        Reach 100% to earn
                      </span>

                      <a
                        href={`/learning/${cert.id}`}
                        className="bg-[#E4FF00] text-black hover:bg-black hover:text-[#E4FF00] border border-black px-3 py-1.5 rounded-none transition-all text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                      >
                        Resume Course
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Credential Verification Tool */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white text-black rounded-none border border-black p-6 space-y-4">
            <h3 className="font-black text-sm text-black border-b border-black pb-2 flex items-center gap-2 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-black" /> Credential Verifier
            </h3>

            <p className="text-[11px] text-neutral-600 leading-relaxed">
              Enter any SkillForge.Ai credential code below to verify the learner identity and validation authenticity.
            </p>

            <form onSubmit={handleVerify} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={verifyId}
                  onChange={(e) => setVerifyId(e.target.value)}
                  placeholder="e.g. PRE4M56U-MOCK1"
                  className="w-full bg-white border border-black px-3.5 py-2.5 rounded-none text-xs font-bold text-black placeholder-neutral-400 focus:outline-none focus:bg-neutral-50 transition-colors uppercase"
                />
                <Search className="absolute right-3.5 top-3 w-4 h-4 text-neutral-400" />
              </div>

              <button
                type="submit"
                disabled={verifyLoading || !verifyId.trim()}
                className="w-full bg-black border border-black text-white hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:border-neutral-200 py-2.5 rounded-none font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {verifyLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border border-white border-t-transparent animate-spin rounded-none" />
                    <span>Checking Credential Database...</span>
                  </>
                ) : (
                  <span>Verify Authenticity</span>
                )}
              </button>
            </form>

            {/* Verification Result Display */}
            {verifyResult && (
              <div className="mt-5 pt-5 border-t border-black">
                {verifyResult.valid ? (
                  <div className="space-y-4">
                    {/* Valid Header Badge */}
                    <div className="bg-neutral-100 border border-black text-black rounded-none p-3 text-xs font-black uppercase tracking-wider flex items-start gap-2">
                      <CheckCircle2 className="w-4.5 h-4.5 text-black shrink-0 mt-0.5" />
                      <div>
                        <span>✓ AUTHENTIC CREDENTIAL</span>
                        <span className="block font-bold text-[9px] text-neutral-500 mt-0.5 normal-case tracking-normal">Verified on secure servers.</span>
                      </div>
                    </div>

                    {/* Meta info details */}
                    <div className="space-y-2.5 text-[10px] text-black">
                      <div>
                        <span className="text-neutral-500 uppercase tracking-wide text-[8px] font-black block">Learner</span>
                        <span className="font-bold uppercase">{verifyResult.learner_name || "Learner Profile"}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 uppercase tracking-wide text-[8px] font-black block">Course Title</span>
                        <span className="font-bold">{verifyResult.course_title}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 uppercase tracking-wide text-[8px] font-black block">Issued On</span>
                        <span className="font-bold">{formatDate(verifyResult.issued_at)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Invalid Output */
                  <div className="bg-neutral-100 border border-black text-neutral-800 rounded-none p-3 text-xs font-black uppercase tracking-wider flex items-start gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 text-black shrink-0 mt-0.5" />
                    <div>
                      <span>✗ CREDENTIAL NOT FOUND</span>
                      <span className="block font-bold text-[9px] text-neutral-500 mt-1 leading-normal normal-case tracking-normal">
                        {verifyResult.error || "The requested verification hash is missing. Verify spelling and retry."}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Certificate Premium Modal Preview */}
      {previewCert && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none border-2 border-black max-w-2xl w-full p-1 shadow-none relative overflow-hidden flex flex-col">
            {/* Modal close */}
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 bg-white border border-black text-black hover:bg-black hover:text-white p-1.5 rounded-none z-20 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Premium Simulated PDF representation layout */}
            <div className="p-8 bg-white border-[6px] border-black relative min-h-[380px] text-center flex flex-col justify-between">
              {/* Inner minimalist border */}
              <div className="absolute inset-1 border border-black pointer-events-none" />

              {/* Branding Header */}
              <div className="space-y-1 pt-4">
                <span className="font-display font-black text-black tracking-widest text-xl">SKILLFORGE.AI</span>
                <span className="block text-[8px] font-black text-neutral-500 tracking-widest uppercase">Transforming Content Into Competence</span>
              </div>

              {/* Certificate Core Texts */}
              <div className="space-y-4 py-6">
                <div className="space-y-0.5">
                  <h3 className="font-display font-black text-black text-2xl tracking-wide uppercase">Certificate of Completion</h3>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider italic">This is proudly presented to</p>
                </div>

                <div className="space-y-1">
                  <span className="font-black text-lg text-black border-b-2 border-black pb-1 uppercase px-4 inline-block tracking-widest">
                    Learner Profile
                  </span>
                  <p className="text-[10px] text-neutral-500 font-bold tracking-wider pt-1 uppercase">
                    for successfully completing all curriculum requirements for
                  </p>
                </div>

                <span className="font-black text-sm text-black uppercase block max-w-md mx-auto leading-relaxed tracking-wide">
                  "{previewCert.course_title}"
                </span>
              </div>

              {/* Signatures Footer */}
              <div className="grid grid-cols-2 gap-12 px-6 pt-4 pb-2 text-left border-t border-black">
                <div className="space-y-1">
                  <div className="h-6 flex items-end">
                    <span className="font-mono text-xs text-black font-black italic">SkillForge Director</span>
                  </div>
                  <div className="border-t border-black pt-1">
                    <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-black block">AI learning Director</span>
                  </div>
                </div>

                <div className="space-y-1 text-right">
                  <div className="h-6 flex items-end justify-end">
                    <code className="font-mono text-[9px] font-black text-black uppercase">{previewCert.certificate_id.substring(0, 12).toUpperCase()}</code>
                  </div>
                  <div className="border-t border-black pt-1">
                    <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-black block">Verification Code Signature</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="p-4 bg-white border-t border-black flex justify-end gap-3 rounded-none">
              <button
                onClick={() => setPreviewCert(null)}
                className="border border-black text-black bg-white hover:bg-neutral-100 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-none transition-colors"
              >
                Close Preview
              </button>
              <a
                href={getDownloadUrl(previewCert)}
                target="_blank"
                rel="noreferrer"
                className="bg-black text-white hover:bg-neutral-800 border border-black text-xs font-black uppercase tracking-wider px-4 py-2 rounded-none transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Download PDF File</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
