import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { WarehouseHeader } from "../components/warehouse/WarehouseHeader";
import { ZoneDetailsSidebar } from "../components/warehouse/ZoneDetailsSidebar";
import { WarehouseLoading } from "../components/warehouse/WarehouseLoading";
import { WarehouseFooter } from "../components/warehouse/WarehouseFooter";
import { WarehouseGrid } from "../components/warehouse/WarehouseGrid";
import { CognitiveTerminal } from "../components/warehouse/CognitiveTerminal";
import { WAREHOUSE_ZONES } from "../components/warehouse/WarehouseData";
import type { ZoneNode } from "../components/warehouse/WarehouseUI";

export const WarehouseMap = () => {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ZoneNode | null>(null);
  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <WarehouseLoading />;

  return (
    <div className={cn("w-full space-y-6 pb-16 px-3 md:px-6 animate-reveal text-slate-900 dark:text-slate-200", isRtl ? 'font-ar text-right' : 'font-sans text-left')}>
      <WarehouseHeader />
      <main className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
         <WarehouseGrid zones={WAREHOUSE_ZONES} selectedZone={selectedZone} setSelectedZone={setSelectedZone} isSyncing={isSyncing} />
         <ZoneDetailsSidebar selectedZone={selectedZone} setSelectedZone={setSelectedZone} setIsSyncing={setIsSyncing} />
      </main>
      <AnimatePresence>{isSyncing && <CognitiveTerminal onClose={() => setIsSyncing(false)} />}</AnimatePresence>
      <WarehouseFooter />
    </div>
  );
};

export default WarehouseMap;
