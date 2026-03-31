import React, { useState, useEffect, useRef } from "react";
import { Barcode, Zap, XCircle, Loader2 } from "lucide-react";

interface BarcodeSearchProps {
  onScan: (code: string) => void;
}

const BarcodeSearch: React.FC<BarcodeSearchProps> = ({ onScan }) => {
  const [lastCode, setLastCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    lastKeyTimeRef.current = Date.now();
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;

      // أجهزة الباركود سريعة جداً (تكتب الكود بالكامل في أقل من 50-100 مللي ثانية)
      // إذا كان الوقت بين المفاتيح طويلاً، فهذا يعني أن المستخدم يكتب يدوياً وليس الجهاز
      if (timeDiff > 50) {
        bufferRef.current = "";
      }

      lastKeyTimeRef.current = currentTime;

      if (e.key === "Enter") {
        if (bufferRef.current.length > 2) {
          const scannedCode = bufferRef.current;
          onScan(scannedCode);
          setLastCode(scannedCode);
          setIsScanning(true);
          bufferRef.current = "";

          // إعادة الحالة للوضع الطبيعي بعد ثانيتين
          setTimeout(() => setIsScanning(false), 2000);
        }
      } else {
        // تجاهل أزرار التحكم مثل Shift/Alt وقبول الحروف والأرقام فقط
        if (e.key.length === 1) {
          bufferRef.current += e.key;
        }
      }
    };

    // الاستماع لضغطات المفاتيح في كامل الصفحة
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScan]);

  return (
    <div className="relative w-full max-w-lg mx-auto mb-6">
      {/* تأثير ضوئي عند التقاط الكود */}
      <div
        className={`absolute -inset-1 rounded-[2rem] blur-xl transition-all duration-500 opacity-0 ${
          isScanning ? "bg-indigo-400 opacity-30 scale-105" : ""
        }`}
      />

      <div
        className={`relative flex items-center bg-white border-2 transition-all duration-300 rounded-[1.8rem] px-5 py-4 shadow-xl shadow-slate-200/50 ${
          isScanning
            ? "border-emerald-500 scale-[1.02]"
            : "border-slate-100 focus-within:border-indigo-500"
        }`}
      >
        {/* أيقونة الحالة */}
        <div
          className={`p-3 rounded-2xl transition-all duration-500 ${
            isScanning
              ? "bg-emerald-500 text-white rotate-[360deg]"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {isScanning ? (
            <Zap size={22} fill="currentColor" />
          ) : (
            <Barcode size={22} />
          )}
        </div>

        <div className="ml-5 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Scanner Intégré
            </p>
            {isScanning && (
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>

          <div className="text-sm font-bold mt-0.5">
            {isScanning ? (
              <span className="text-emerald-600 animate-in slide-in-from-left-2 duration-300">
                Code détecté :{" "}
                <span className="font-black underline">{lastCode}</span>
              </span>
            ) : (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                <span>En attente d'un scan...</span>
              </div>
            )}
          </div>
        </div>

        {/* مؤشر بصري للسرعة */}
        <div className="hidden md:flex flex-col items-end opacity-40">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 w-4 rounded-full ${isScanning ? "bg-emerald-400" : "bg-slate-200"}`}
              />
            ))}
          </div>
          <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">
            Ready to scan
          </span>
        </div>

        {isScanning && (
          <button
            onClick={() => setIsScanning(false)}
            className="ml-4 p-2 text-slate-300 hover:text-rose-500 transition-colors"
          >
            <XCircle size={20} />
          </button>
        )}
      </div>

      <input
        type="text"
        className="sr-only" // مخفي تماماً ولكن موجود لاستقبال التركيز إذا لزم الأمر
        aria-hidden="true"
      />
    </div>
  );
};

export default BarcodeSearch;
