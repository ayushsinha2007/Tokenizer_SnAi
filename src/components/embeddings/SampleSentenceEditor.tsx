import React, { useState } from 'react';
import { SentenceItem } from '../../engine/embeddings/types';
import { 
  ChevronDown, ChevronUp, Edit3, Trash2, Plus, 
  RotateCcw, Check, X, FileText 
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface SampleSentenceEditorProps {
  sampleSentences: SentenceItem[];
  onAddSample: (text: string) => void;
  onEditSample: (id: string, newText: string) => void;
  onDeleteSample: (id: string) => void;
  onResetDefaults: () => void;
}

export const SampleSentenceEditor: React.FC<SampleSentenceEditorProps> = ({
  sampleSentences,
  onAddSample,
  onEditSample,
  onDeleteSample,
  onResetDefaults,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [newSampleInput, setNewSampleInput] = useState('');

  const handleStartEdit = (item: SentenceItem) => {
    soundFx.playSpinClick();
    setEditingId(item.id);
    setEditingText(item.text);
  };

  const handleSaveEdit = (id: string) => {
    if (editingText.trim()) {
      soundFx.playSpinClick();
      onEditSample(id, editingText.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSampleInput.trim()) {
      soundFx.playSpinClick();
      onAddSample(newSampleInput.trim());
      setNewSampleInput('');
    }
  };

  return (
    <div className="lab-glass rounded-2xl border border-white/10 overflow-hidden transition-all duration-200">
      
      {/* Header Button (Toggles Accordion) */}
      <button
        onClick={() => {
          soundFx.playSpinClick();
          setIsOpen(!isOpen);
        }}
        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#080F1E] border border-white/5">
            <FileText className="w-4 h-4 text-[#398BFF]" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-[#F1F5FC] flex items-center gap-2">
              <span>EDIT SAMPLE SENTENCES</span>
              <span className="text-[11px] font-mono text-[#62C9F5] px-2 py-0.5 rounded-full bg-[#111C30] border border-white/5">
                {sampleSentences.length} Sentences
              </span>
            </h4>
            <p className="text-xs text-[#9AAAC0] mt-0.5">
              Customize, add, or prune baseline sample texts. 3D coordinates re-project instantly via PCA.
            </p>
          </div>
        </div>

        <div className="p-1 rounded-lg bg-[#080F1E] text-[#9AAAC0]">
          {isOpen ? <ChevronUp className="w-4 h-4 text-[#398BFF]" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Editor Body */}
      {isOpen && (
        <div className="p-5 sm:p-6 border-t border-white/5 bg-[#080F1E]/80 space-y-4">
          
          {/* Action Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#9AAAC0] uppercase tracking-wider">
              Sample Sentence List
            </span>
            <button
              onClick={() => {
                soundFx.playSpinClick();
                onResetDefaults();
              }}
              className="text-xs font-mono text-[#398BFF] hover:text-[#62C9F5] flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          {/* List of Sample Sentences */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {sampleSentences.map((s, idx) => {
              const isEditing = editingId === s.id;

              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#111C30] border border-white/5 text-xs font-mono transition-colors hover:border-[#398BFF]/30"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="text-[11px] text-[#398BFF] font-bold shrink-0">
                      #{idx + 1}
                    </span>

                    {isEditing ? (
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="flex-1 bg-[#080F1E] border border-[#398BFF] rounded-lg px-2.5 py-1 text-white focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="text-[#F1F5FC] truncate">
                        &quot;{s.text}&quot;
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(s.id)}
                          className="p-1.5 rounded-lg bg-[#2DD4BF]/20 text-[#2DD4BF] hover:bg-[#2DD4BF]/30 transition-colors"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1.5 rounded-lg bg-white/5 text-[#9AAAC0] hover:bg-white/10 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(s)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-[#9AAAC0] hover:text-[#62C9F5] transition-colors"
                          title="Edit sentence"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            soundFx.playSpinClick();
                            onDeleteSample(s.id);
                          }}
                          disabled={sampleSentences.length <= 3}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-[#9AAAC0] hover:text-red-400 transition-colors disabled:opacity-30"
                          title="Delete sentence"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Sample Form */}
          <form onSubmit={handleAddNew} className="pt-2 flex gap-2">
            <input
              type="text"
              value={newSampleInput}
              onChange={(e) => setNewSampleInput(e.target.value)}
              placeholder="Add another sample sentence to the baseline set..."
              className="flex-1 bg-[#080F1E] border border-white/10 focus:border-[#398BFF] rounded-xl px-3.5 py-2 text-xs font-mono text-[#F1F5FC] placeholder:text-[#9AAAC0]/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newSampleInput.trim()}
              className="px-4 py-2 rounded-xl bg-[#398BFF]/20 hover:bg-[#398BFF]/30 text-[#62C9F5] hover:text-white border border-[#398BFF]/40 text-xs font-mono transition-all flex items-center gap-1.5 disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Sample</span>
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
