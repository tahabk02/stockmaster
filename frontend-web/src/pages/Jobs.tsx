import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/client";
import { Loader2, Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

// --- Modular Components ---
import { JobHeaderHUD } from "../components/jobs/JobHeaderHUD";
import { JobCard } from "../components/jobs/JobCard";
import { JobTerminal } from "../components/jobs/JobTerminal";

export const Jobs = () => {
  const { t, i18n } = useTranslation();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const isRtl = i18n.language === 'ar';

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/jobs");
      setJobs(data.data || []);
    } catch (e) {
      toast.error(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleRunJob = async (id: string) => {
    const toastId = toast.loading(t('jobs.toast.initializing'));
    try {
      await api.post(`/jobs/${id}/run`);
      toast.success(t('jobs.toast.dispatched'), { id: toastId });
      fetchJobs();
    } catch (e) {
      toast.error(t('jobs.toast.failed'), { id: toastId });
    }
  };

  const handleRunAll = async () => {
    toast.promise(api.post("/jobs/run-all"), {
      loading: t('jobs.toast.syncing'),
      success: t('jobs.toast.allActive'),
      error: t('jobs.toast.syncFailure')
    });
    fetchJobs();
  };

  const stats = useMemo(() => ({
    total: jobs.length,
    running: jobs.filter(j => j.status === 'RUNNING').length,
    failed: jobs.filter(j => j.status === 'FAILED').length,
    completed: jobs.filter(j => j.status === 'COMPLETED').length
  }), [jobs]);

  if (loading) return <div className="h-screen flex flex-col items-center justify-center opacity-20"><Zap size={32} className="animate-spin text-indigo-600 mb-4" /><p className="font-black text-[8px] uppercase tracking-[0.5em]">{t('common.loading')}</p></div>;

  return (
    <div className={cn("w-full space-y-6 pb-20 animate-reveal", isRtl ? "text-right" : "text-left px-2 md:px-0")}>
      <JobHeaderHUD stats={stats} onRefresh={fetchJobs} onRunAll={handleRunAll} isRtl={isRtl} t={t} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
         {jobs.map((job, i) => (
           <JobCard key={job._id} job={job} idx={i} onRun={handleRunJob} onViewLogs={setSelectedJob} isRtl={isRtl} />
         ))}
      </div>

      <AnimatePresence>
        {selectedJob && <JobTerminal job={selectedJob} onClose={() => setSelectedJob(null)} isRtl={isRtl} />}
      </AnimatePresence>
    </div>
  );
};

export default Jobs;
