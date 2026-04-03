'use client';

import { Role } from '@/lib/types';
import { roles } from '@/lib/interviewPrompts';
import { Briefcase, Star, ArrowRight } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: Role) => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI Interview Practice
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Practice job interviews with our AI interviewer. Get real-time feedback and improve your interview skills.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            How it works
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>Select a job role you want to practice</li>
            <li>Allow microphone and camera access when prompted</li>
            <li>Respond to the AI interviewer&apos;s questions by speaking</li>
            <li>Get detailed feedback on your performance</li>
          </ol>
        </div>

        {/* Role Grid */}
        <h2 className="text-2xl font-bold mb-6">Select a Role</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role)}
              className="group bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-blue-500 rounded-xl p-6 text-left transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>

              <h3 className="text-lg font-semibold mb-2">{role.title}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{role.description}</p>

              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  role.difficulty === 'entry' ? 'bg-green-500/20 text-green-400' :
                  role.difficulty === 'mid' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {role.difficulty.charAt(0).toUpperCase() + role.difficulty.slice(1)} Level
                </span>
                <span className="text-slate-500 text-sm">{role.department}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {role.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
                {role.skills.length > 3 && (
                  <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400">
                    +{role.skills.length - 3}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center text-slate-500 text-sm mt-8">
          Requires microphone access. Works best in Chrome browser.
        </p>
      </div>
    </div>
  );
}