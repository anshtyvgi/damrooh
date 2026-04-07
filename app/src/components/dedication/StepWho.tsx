"use client";

import { motion } from "framer-motion";
import { useStore } from "@/stores/useStore";
import { Button } from "@/components/ui/Button";
import { OCCASIONS } from "@/types";
import { ArrowRight } from "lucide-react";

const relationships = [
  { value: "partner" as const, label: "Partner" },
  { value: "parent" as const, label: "Parent" },
  { value: "friend" as const, label: "Friend" },
  { value: "sibling" as const, label: "Sibling" },
  { value: "colleague" as const, label: "Colleague" },
  { value: "crush" as const, label: "Crush" },
];

export function StepWho() {
  const { dedication, setRecipientName, setOccasion, setRelationship, setStep } = useStore();

  const canProceed = dedication.recipientName.trim().length > 0;

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-medium font-[family-name:Poppins]">
          Who is this for?
        </h1>
        <p className="text-text-secondary mt-3 text-sm">
          Tell us about the person and the occasion
        </p>
      </div>

      {/* Name input */}
      <div className="space-y-2">
        <label className="text-xs text-text-muted uppercase tracking-wider font-medium">Their name</label>
        <input
          type="text"
          value={dedication.recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="Who are you making this for?"
          className="w-full px-5 py-4 rounded-2xl bg-bg-card text-text text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 border border-border transition-all"
          autoFocus
        />
      </div>

      {/* Occasion */}
      <div className="space-y-2">
        <label className="text-xs text-text-muted uppercase tracking-wider font-medium">Occasion</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {OCCASIONS.map((occ) => (
            <motion.button
              key={occ.value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setOccasion(occ.value)}
              className={`px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                dedication.occasion === occ.value
                  ? "bg-accent text-white shadow-sm"
                  : "bg-bg-card text-text-secondary hover:text-text border border-border"
              }`}
            >
              <span className="mr-1.5">{occ.emoji}</span>
              {occ.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Relationship */}
      <div className="space-y-2">
        <label className="text-xs text-text-muted uppercase tracking-wider font-medium">They are your...</label>
        <div className="flex flex-wrap gap-2">
          {relationships.map((rel) => (
            <motion.button
              key={rel.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRelationship(rel.value)}
              className={`px-5 py-2.5 rounded-full text-sm transition-all cursor-pointer ${
                dedication.relationship === rel.value
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "bg-bg-card text-text-secondary hover:text-text border border-border"
              }`}
            >
              {rel.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Next */}
      <div className="pt-4">
        <Button
          size="lg"
          fullWidth
          disabled={!canProceed}
          onClick={() => setStep(1)}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
