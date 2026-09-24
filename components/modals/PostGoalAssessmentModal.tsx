"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Trophy,
  ChevronRight,
  Zap,
  GraduationCap
} from "lucide-react";
import { Goal, QuizAssessment, CourseRecommendation } from "@/lib/types";
import { generatePostGoalQuiz, generateDomainCourseRecommendations } from "@/lib/gemini";
import confetti from "canvas-confetti";

interface PostGoalAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
  onEnrollNewCourse: (course: CourseRecommendation) => void;
}

export const PostGoalAssessmentModal: React.FC<PostGoalAssessmentModalProps> = ({
  isOpen,
  onClose,
  goal,
  onEnrollNewCourse,
}) => {
  const [step, setStep] = useState<"select" | "quiz" | "results">("select");
  const [quizType, setQuizType] = useState<"rapid" | "comprehensive">("rapid");
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<QuizAssessment | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);

  if (!isOpen) return null;

  const startAssessment = async (type: "rapid" | "comprehensive") => {
    setQuizType(type);
    setLoading(true);
    try {
      const qz = await generatePostGoalQuiz(goal.domain, goal.title, type);
      const recs = await generateDomainCourseRecommendations(goal.domain, goal.title);
      setAssessment(qz);
      setRecommendations(recs);
      setStep("quiz");
      setCurrentQIndex(0);
      setSelectedAnswers({});
      setShowExplanation(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (selectedAnswers[currentQIndex] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQIndex]: optIndex }));
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (!assessment) return;
    setShowExplanation(false);
    if (currentQIndex < assessment.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      // Calculate score and move to results
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
      setStep("results");
    }
  };

  // Score calculation
  const totalQuestions = assessment?.questions.length || 0;
  const correctCount = assessment?.questions.filter(
    (q, idx) => selectedAnswers[idx] === q.correctIndex
  ).length || 0;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-3xl rounded-3xl border border-vault-border bg-vault-card/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-vault-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Post-Goal Assessment & Domain Advancement
                </h2>
                <p className="text-xs text-foreground/60">{goal.title}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-foreground/60 hover:text-foreground hover:bg-slate-800 transition-all"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Step 1: Select Quiz or Exam */}
          {step === "select" && (
            <div className="py-6 text-center space-y-6">
              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
                  <CheckCircle2 className="size-3.5" />
                  <span>Curriculum Completed!</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Validate your mastery with an AI Exam
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-foreground/60 leading-relaxed">
                  Would you like to test your understanding with a rapid concept quiz or a full engineering domain exam?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                {/* Rapid Quiz */}
                <button
                  onClick={() => startAssessment("rapid")}
                  disabled={loading}
                  className="flex flex-col items-center justify-between p-6 rounded-2xl border border-vault-border bg-slate-900/40 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all group text-center"
                >
                  <div className="size-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Zap className="size-6" />
                  </div>
                  <div className="text-sm font-bold text-foreground">5-Question Rapid Quiz</div>
                  <p className="text-[11px] text-foreground/50 mt-1">
                    Quick 5-minute sanity check on core mental models and edge cases.
                  </p>
                  <span className="mt-4 text-xs font-semibold text-indigo-400 flex items-center gap-1">
                    <span>Start Rapid Quiz</span>
                    <ArrowRight className="size-3" />
                  </span>
                </button>

                {/* Comprehensive Exam */}
                <button
                  onClick={() => startAssessment("comprehensive")}
                  disabled={loading}
                  className="flex flex-col items-center justify-between p-6 rounded-2xl border border-vault-border bg-slate-900/40 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all group text-center"
                >
                  <div className="size-12 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Trophy className="size-6" />
                  </div>
                  <div className="text-sm font-bold text-foreground">10-Question Domain Exam</div>
                  <p className="text-[11px] text-foreground/50 mt-1">
                    Rigorous deep-dive evaluating tradeoffs, latency, and system invariants.
                  </p>
                  <span className="mt-4 text-xs font-semibold text-violet-400 flex items-center gap-1">
                    <span>Start Domain Exam</span>
                    <ArrowRight className="size-3" />
                  </span>
                </button>
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 text-xs text-indigo-400">
                  <div className="size-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                  <span>Generating exam questions via Gemini 3.8 Flash...</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Interactive Question View */}
          {step === "quiz" && assessment && (
            <div className="py-4 space-y-4">
              {/* Progress Tracker */}
              <div className="flex items-center justify-between text-xs text-foreground/60 mb-2">
                <span>
                  Question {currentQIndex + 1} of {assessment.questions.length}
                </span>
                <span className="font-semibold text-indigo-400">
                  Concept: {assessment.questions[currentQIndex]?.domainConcept}
                </span>
              </div>

              {/* Question Text */}
              <div className="rounded-2xl border border-vault-border bg-slate-900/60 p-5">
                <h4 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                  {assessment.questions[currentQIndex]?.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {assessment.questions[currentQIndex]?.options.map((opt, optIdx) => {
                  const isAnswered = selectedAnswers[currentQIndex] !== undefined;
                  const isSelected = selectedAnswers[currentQIndex] === optIdx;
                  const isCorrect = assessment.questions[currentQIndex].correctIndex === optIdx;

                  let btnStyle = "border-vault-border bg-slate-900/40 hover:bg-slate-800/60 text-foreground/80";
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold";
                    } else if (isSelected) {
                      btnStyle = "border-rose-500 bg-rose-500/20 text-rose-300 font-bold";
                    } else {
                      btnStyle = "border-vault-border bg-slate-900/20 text-foreground/40";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-xs text-left transition-all ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center size-5 rounded-md bg-slate-800/80 text-[10px] font-bold">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isAnswered && isCorrect && <CheckCircle2 className="size-4 text-emerald-400" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle className="size-4 text-rose-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-2"
                >
                  <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="size-3.5" />
                    <span>Gemini 3.8 Flash Explanation:</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {assessment.questions[currentQIndex]?.explanation}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all"
                    >
                      <span>
                        {currentQIndex < assessment.questions.length - 1 ? "Next Question" : "View Results & Next Courses"}
                      </span>
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Step 3: Results & Advanced Course Recommendations */}
          {step === "results" && (
            <div className="py-4 space-y-6">
              {/* Score Card */}
              <div className="rounded-2xl border border-vault-border bg-slate-900/60 p-6 text-center space-y-2">
                <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-600/30 mb-2">
                  <Award className="size-8" />
                </div>
                <h3 className="text-2xl font-black text-foreground">
                  Score: {scorePercent}% ({correctCount}/{totalQuestions} Correct)
                </h3>
                <p className="text-xs text-foreground/60 max-w-sm mx-auto">
                  {scorePercent >= 80
                    ? "Exceptional mastery! You demonstrated deep comprehension of system invariants and runtime architecture."
                    : "Solid effort! Review the takeaways in your Storage Vault and proceed to the recommended follow-up courses below."}
                </p>
              </div>

              {/* Recommended Next Courses */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-cyan-400" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Recommended Next Courses in {goal.domain}
                    </span>
                  </div>
                  <span className="text-[10px] text-foreground/50">Next Skill Tier</span>
                </div>

                <div className="space-y-3">
                  {recommendations.map((course) => (
                    <div
                      key={course.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-vault-border bg-slate-900/40 p-4 hover:border-indigo-500/40 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{course.title}</span>
                          <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-400">
                            {course.difficulty}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground/60 leading-relaxed max-w-lg">
                          {course.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {course.skillsGained?.map((sk, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-slate-800/80 px-2 py-0.5 text-[9px] text-foreground/50"
                            >
                              ✓ {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onEnrollNewCourse(course);
                          onClose();
                        }}
                        className="flex-shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all"
                      >
                        <span>Enroll & Generate Roadmap</span>
                        <ArrowRight className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
