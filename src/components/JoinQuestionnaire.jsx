import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const questions = [
  {
    key: "attitude",
    label: "What's your attitude towards this piece?",
    options: ["positive", "neutral", "negative"],
    greyWhenNo: false,
  },
  {
    key: "initiate",
    label: "Are you likely to initiate conversation in the room?",
    options: ["likely", "sometimes", "unlikely"],
    greyWhenNo: true,
  },
  {
    key: "mood",
    label: "What's your mood right now?",
    options: ["happy", "sad", "angry", "chill", "other"],
    greyWhenNo: true,
  },
  {
    key: "goal",
    label: "What's your main goal for this discussion?",
    options: [
      { value: "intellectual_stimulation", label: "Intellectual stimulation" },
      { value: "make_friends", label: "Make friends" },
      { value: "argue", label: "Argue & debate" },
      { value: "learn_more", label: "Learn more" },
      { value: "no_goal", label: "No particular goal" },
    ],
    greyWhenNo: true,
  },
];

export default function JoinQuestionnaire({ open, onClose, onSubmit }) {
  const [willJoin, setWillJoin] = useState(null);
  const [answers, setAnswers] = useState({});

  const update = (key, val) => setAnswers((prev) => ({ ...prev, [key]: val }));

  const notJoining = willJoin === "no";
  const allAnswered =
    willJoin === "yes" &&
    answers.attitude &&
    answers.initiate &&
    answers.mood &&
    answers.goal;

  const handleSubmit = () => {
    if (notJoining) {
      onClose();
      return;
    }
    onSubmit(answers);
    setWillJoin(null);
    setAnswers({});
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Before you join
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            A few quick questions to find your best match.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Q1 */}
          <QuestionBlock label="Will you join the discussion?">
            <RadioGroup
              value={willJoin || ""}
              onValueChange={setWillJoin}
              className="flex gap-6"
            >
              {["yes", "no"].map((v) => (
                <div key={v} className="flex items-center gap-2">
                  <RadioGroupItem value={v} id={`join-${v}`} />
                  <Label htmlFor={`join-${v}`} className="capitalize cursor-pointer">
                    {v}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </QuestionBlock>

          {/* Q2-Q5 */}
          {questions.map((q) => {
            const disabled = q.greyWhenNo && notJoining;
            return (
              <div
                key={q.key}
                className={`transition-all duration-300 ${disabled ? "opacity-25 pointer-events-none" : ""}`}
              >
                <QuestionBlock label={q.label}>
                  <RadioGroup
                    value={answers[q.key] || ""}
                    onValueChange={(v) => update(q.key, v)}
                    className="flex flex-wrap gap-x-6 gap-y-2"
                  >
                    {q.options.map((opt) => {
                      const val = typeof opt === "string" ? opt : opt.value;
                      const lbl = typeof opt === "string" ? opt : opt.label;
                      return (
                        <div key={val} className="flex items-center gap-2">
                          <RadioGroupItem value={val} id={`${q.key}-${val}`} />
                          <Label
                            htmlFor={`${q.key}-${val}`}
                            className="capitalize cursor-pointer text-sm"
                          >
                            {lbl}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </QuestionBlock>
              </div>
            );
          })}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!willJoin || (willJoin === "yes" && !allAnswered)}
          className="w-full mt-2"
        >
          {notJoining ? "Maybe next time" : "Join the room"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function QuestionBlock({ label, children }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {children}
    </div>
  );
}