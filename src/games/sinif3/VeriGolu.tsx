import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'
export default function VeriGolu({ session, state }: { session: SessionManager; state: SessionState }) {
  return <div className="flex flex-col items-center justify-center h-full p-6 gap-4">
    <span className="text-6xl">📊</span><h2 className="text-xl font-bold text-white">Veri Gölü</h2><p className="text-white/40 text-sm">Grafik okuma ve yorumlama</p>
    <div className="flex gap-3">
      <button className="px-4 py-2 rounded-xl text-sm font-bold bg-green-500/15 text-green-300" onClick={()=>session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:Date.now()-2000,responseAt:Date.now(),responseTimeMs:1500,isCorrect:true,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif3_veri'}})}>✅ Doğru</button>
      <button className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 text-white/50" onClick={()=>session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:Date.now()-2000,responseAt:Date.now(),responseTimeMs:3000,isCorrect:false,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif3_veri'}})}>❌ Yanlış</button>
    </div></div>
}
