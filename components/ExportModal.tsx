"use client";

import { FileText, Download, X, ClipboardList, Lightbulb } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  isExporting?: boolean;
  isDraft?: boolean;
  onFinalize?: () => void;
  isFinalizing?: boolean;
  includeRationale?: boolean;
  onToggleRationale?: (value: boolean) => void;
  hasRationale?: boolean;
}

export default function ExportModal({
  isOpen,
  onClose,
  onExportPDF,
  onExportCSV,
  isExporting = false,
  isDraft = true,
  onFinalize,
  isFinalizing = false,
  includeRationale = true,
  onToggleRationale,
  hasRationale = false,
}: ExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      {/* Loading overlay */}
      {isExporting && (
        <div className="fixed inset-x-0 top-0 z-[80] flex justify-center animate-slide-up">
          <div className="mt-6 flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/90 border border-[#D4B2F4] shadow-2xl shadow-[#8A2BE2]/20 backdrop-blur-xl">
            <Spinner className="w-5 h-5 text-[#8A2BE2]" />
            <span className="text-sm font-medium text-[#3C0E66]">
              Generating PDF document...
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-slide-up">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Export Campaign Strategy</h3>
              <p className="text-sm text-white/80">Choose your preferred format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[#561493]/70">
            Export your complete campaign strategy including funnel allocation, KPIs, target audiences, and ad format recommendations.
          </p>

          {/* Export Options */}
          <div className="space-y-3">
            {/* PDF Export */}
            <button
              onClick={onExportPDF}
              disabled={isExporting}
              className="w-full p-4 rounded-2xl border-2 border-[#D4B2F4] hover:border-[#8A2BE2] hover:bg-[#F0E5FC] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#701AC0] to-[#8A2BE2] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-[#3C0E66]">Export as PDF</h4>
                  <p className="text-xs text-[#561493]/70">Professional document with charts and visuals</p>
                </div>
                <Download className="w-5 h-5 text-[#8A2BE2] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            {/* CSV Export */}
            <button
              onClick={onExportCSV}
              className="w-full p-4 rounded-2xl border-2 border-[#D4B2F4] hover:border-[#8A2BE2] hover:bg-[#F0E5FC] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#22D3EE] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-[#3C0E66]">Export as CSV</h4>
                  <p className="text-xs text-[#561493]/70">Spreadsheet format for data analysis</p>
                </div>
                <Download className="w-5 h-5 text-[#8A2BE2] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </div>

          {/* PDF Options */}
          {hasRationale && (
            <div className="pt-3 border-t border-[#D4B2F4]/50">
              <p className="text-xs font-semibold text-[#561493]/60 uppercase tracking-wide mb-3">PDF Options</p>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 cursor-pointer hover:border-amber-300 transition-all">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={includeRationale}
                    onChange={(e) => onToggleRationale?.(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-amber-300 bg-white peer-checked:bg-gradient-to-br peer-checked:from-amber-400 peer-checked:to-orange-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                    <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-sm font-medium text-[#3C0E66]">Include Strategy Rationale</span>
                    <p className="text-xs text-[#561493]/60">AI-generated insights explaining why this strategy works</p>
                  </div>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#F8F2FE] border-t border-[#D4B2F4]/50 space-y-2">
          {isDraft && onFinalize && (
            <button
              onClick={onFinalize}
              disabled={isFinalizing}
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#059669] hover:to-[#10B981] transition-all shadow-lg shadow-[#10B981]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isFinalizing ? (
                <>
                  <Spinner className="w-4 h-4" />
                  Finalizing...
                </>
              ) : (
                "Finalize Strategy"
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[#701AC0] hover:bg-[#F0E5FC] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
