import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, Trash2, GripVertical, Upload, Download, Eye, EyeOff, 
  CheckCircle2, XCircle, AlertTriangle, Code, List, 
  ArrowUpDown, Link2, MousePointer, Bug, ToggleLeft,
  FileJson, FileSpreadsheet, Copy, Play, Save, Lightbulb,
  ChevronRight, ChevronDown, X, Check, HelpCircle, Sparkles
} from 'lucide-react';

// ============ CONSTANTS ============
const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice', icon: List, color: 'bg-blue-500' },
  { value: 'multi_select', label: 'Multi Select', icon: CheckCircle2, color: 'bg-indigo-500' },
  { value: 'fill_blank', label: 'Fill in the Blank', icon: Code, color: 'bg-emerald-500' },
  { value: 'drag_order', label: 'Drag & Drop - Order', icon: ArrowUpDown, color: 'bg-amber-500' },
  { value: 'drag_match', label: 'Drag & Drop - Match', icon: Link2, color: 'bg-rose-500' },
  { value: 'drag_code_blocks', label: 'Code Blocks', icon: Code, color: 'bg-violet-500' },
  { value: 'code_writing', label: 'Code Writing', icon: Code, color: 'bg-cyan-500' },
  { value: 'debugging', label: 'Debugging', icon: Bug, color: 'bg-red-500' },
  { value: 'true_false', label: 'True / False', icon: ToggleLeft, color: 'bg-teal-500' },
  { value: 'parsons', label: 'Parsons Problem', icon: ArrowUpDown, color: 'bg-orange-500' },
];

const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-500' },
  { value: 'easy', label: 'Easy', color: 'bg-lime-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'hard', label: 'Hard', color: 'bg-orange-500' },
  { value: 'expert', label: 'Expert', color: 'bg-red-500' },
];

const TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues', 
  'Trees', 'Binary Trees', 'BST', 'Heaps', 'Graphs',
  'Hash Tables', 'Sorting', 'Searching', 'Recursion', 
  'Dynamic Programming', 'Greedy', 'Backtracking', 'BFS', 'DFS'
];

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'typescript', 'go', 'rust'];

// ============ VALIDATION SCHEMA ============
const validateQuestion = (question) => {
  const errors = [];
  const warnings = [];

  // Base validations
  if (!question.title?.trim()) errors.push({ field: 'title', message: 'Title is required' });
  if (question.title?.length > 200) errors.push({ field: 'title', message: 'Title must be under 200 characters' });
  if (!question.type) errors.push({ field: 'type', message: 'Question type is required' });
  if (!question.difficulty) errors.push({ field: 'difficulty', message: 'Difficulty is required' });
  if (!question.topic?.length) errors.push({ field: 'topic', message: 'At least one topic is required' });
  if (question.xpReward < 1) errors.push({ field: 'xpReward', message: 'XP reward must be at least 1' });
  if (!question.description?.trim()) warnings.push({ field: 'description', message: 'Description is recommended' });
  if (!question.explanation?.trim()) warnings.push({ field: 'explanation', message: 'Explanation is recommended for learning' });

  // Type-specific validations
  switch (question.type) {
    case 'multiple_choice':
    case 'multi_select':
      if (!question.content?.options?.length) {
        errors.push({ field: 'options', message: 'At least one option is required' });
      } else {
        const correctCount = question.content.options.filter(o => o.isCorrect).length;
        if (correctCount === 0) errors.push({ field: 'options', message: 'At least one correct answer is required' });
        if (question.type === 'multiple_choice' && correctCount > 1) {
          errors.push({ field: 'options', message: 'Multiple choice should have exactly one correct answer' });
        }
        if (question.content.options.some(o => !o.text?.trim())) {
          errors.push({ field: 'options', message: 'All options must have text' });
        }
      }
      break;

    case 'fill_blank':
      if (!question.content?.template?.trim()) {
        errors.push({ field: 'template', message: 'Template is required' });
      } else {
        const blankMatches = question.content.template.match(/\{\{(\w+)\}\}/g) || [];
        const blankIds = blankMatches.map(m => m.replace(/[{}]/g, ''));
        const definedBlanks = question.content.blanks?.map(b => b.id) || [];
        
        blankIds.forEach(id => {
          if (!definedBlanks.includes(id)) {
            errors.push({ field: 'blanks', message: `Blank "{{${id}}}" is not defined` });
          }
        });
        
        question.content.blanks?.forEach(blank => {
          if (!blank.acceptedAnswers?.length) {
            errors.push({ field: 'blanks', message: `Blank "${blank.id}" needs at least one accepted answer` });
          }
        });
      }
      break;

    case 'drag_order':
    case 'parsons':
      if (!question.content?.items?.length || question.content.items.length < 2) {
        errors.push({ field: 'items', message: 'At least 2 items are required' });
      }
      break;

    case 'drag_match':
      if (!question.content?.leftItems?.length || !question.content?.rightItems?.length) {
        errors.push({ field: 'items', message: 'Both left and right items are required' });
      }
      break;

    case 'code_writing':
    case 'debugging':
      if (!question.content?.testCases?.length) {
        errors.push({ field: 'testCases', message: 'At least one test case is required' });
      }
      if (!question.content?.language) {
        errors.push({ field: 'language', message: 'Programming language is required' });
      }
      break;

    case 'true_false':
      if (question.content?.isTrue === undefined) {
        errors.push({ field: 'isTrue', message: 'Correct answer must be specified' });
      }
      break;
  }

  return { errors, warnings, isValid: errors.length === 0 };
};

// ============ SAMPLE QUESTION TEMPLATE ============
const getEmptyQuestion = (type = 'multiple_choice') => ({
  id: `q-${Date.now()}`,
  type,
  title: '',
  description: '',
  difficulty: 'medium',
  topic: [],
  tags: [],
  xpReward: 10,
  timeLimit: null,
  hints: [],
  explanation: '',
  createdBy: 'admin',
  isPublic: false,
  content: getEmptyContent(type),
});

const getEmptyContent = (type) => {
  switch (type) {
    case 'multiple_choice':
    case 'multi_select':
      return {
        question: '',
        options: [
          { id: 'opt-1', text: '', isCorrect: false },
          { id: 'opt-2', text: '', isCorrect: false },
        ],
        shuffleOptions: true,
        ...(type === 'multi_select' && { partialCredit: true }),
      };
    case 'fill_blank':
      return { template: '', blanks: [], language: 'javascript' };
    case 'drag_order':
      return { instruction: '', items: [], includeDistractors: false, distractors: [] };
    case 'drag_match':
      return { instruction: '', leftItems: [], rightItems: [] };
    case 'drag_code_blocks':
      return { instruction: '', language: 'javascript', blocks: [], distractorBlocks: [] };
    case 'code_writing':
      return { prompt: '', starterCode: '', language: 'javascript', testCases: [], constraints: [] };
    case 'debugging':
      return { prompt: '', buggyCode: '', language: 'javascript', bugs: [], testCases: [] };
    case 'true_false':
      return { statement: '', isTrue: true };
    case 'parsons':
      return { instruction: '', language: 'javascript', codeLines: [] };
    default:
      return {};
  }
};

// ============ MAIN COMPONENT ============
export default function QuestionBuilder() {
  const [activeTab, setActiveTab] = useState('builder');
  const [question, setQuestion] = useState(getEmptyQuestion());
  const [validation, setValidation] = useState({ errors: [], warnings: [], isValid: true });
  const [showPreview, setShowPreview] = useState(false);
  const [importData, setImportData] = useState('');
  const [importErrors, setImportErrors] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

  // Update validation whenever question changes
  const updateQuestion = useCallback((updates) => {
    setQuestion(prev => {
      const updated = { ...prev, ...updates };
      setValidation(validateQuestion(updated));
      return updated;
    });
  }, []);

  const updateContent = useCallback((contentUpdates) => {
    setQuestion(prev => {
      const updated = {
        ...prev,
        content: { ...prev.content, ...contentUpdates }
      };
      setValidation(validateQuestion(updated));
      return updated;
    });
  }, []);

  // Handle type change
  const handleTypeChange = (newType) => {
    setQuestion(prev => ({
      ...prev,
      type: newType,
      content: getEmptyContent(newType),
    }));
  };

  // Save question
  const handleSave = () => {
    const result = validateQuestion(question);
    setValidation(result);
    if (result.isValid) {
      setSavedQuestions(prev => [...prev, { ...question, id: `q-${Date.now()}` }]);
      setQuestion(getEmptyQuestion());
    }
  };

  // Export questions
  const handleExport = () => {
    const dataStr = JSON.stringify(savedQuestions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions.json';
    a.click();
  };

  // Import questions
  const handleImport = () => {
    try {
      const parsed = JSON.parse(importData);
      const questions = Array.isArray(parsed) ? parsed : [parsed];
      const results = questions.map((q, i) => ({
        index: i,
        question: q,
        validation: validateQuestion(q)
      }));
      
      const valid = results.filter(r => r.validation.isValid);
      const invalid = results.filter(r => !r.validation.isValid);
      
      if (valid.length > 0) {
        setSavedQuestions(prev => [...prev, ...valid.map(r => r.question)]);
      }
      
      setImportErrors(invalid.map(r => ({
        index: r.index,
        title: r.question.title || `Question ${r.index + 1}`,
        errors: r.validation.errors
      })));
      
      if (valid.length > 0) {
        setImportData('');
      }
    } catch (e) {
      setImportErrors([{ index: -1, title: 'Parse Error', errors: [{ message: 'Invalid JSON format' }] }]);
    }
  };

  const themeClass = darkMode ? 'dark' : '';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Question Builder</h1>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>DSA Gamification Admin</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">☀️</span>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <span className="text-sm">🌙</span>
            </div>
            <Badge variant="outline" className={`${darkMode ? 'border-slate-700' : 'border-slate-300'}`}>
              {savedQuestions.length} saved
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full max-w-lg grid-cols-3 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
            <TabsTrigger value="builder" className="gap-2">
              <Plus className="w-4 h-4" /> Builder
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="w-4 h-4" /> Import
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <List className="w-4 h-4" /> Library ({savedQuestions.length})
            </TabsTrigger>
          </TabsList>

          {/* ============ BUILDER TAB ============ */}
          <TabsContent value="builder" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Editor */}
              <div className="lg:col-span-2 space-y-6">
                {/* Question Type Selection */}
                <Card className={darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Question Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {QUESTION_TYPES.map(type => (
                        <button
                          key={type.value}
                          onClick={() => handleTypeChange(type.value)}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                            question.type === type.value
                              ? `${darkMode ? 'border-violet-500 bg-violet-500/10' : 'border-violet-500 bg-violet-50'}`
                              : `${darkMode ? 'border-slate-800 hover:border-slate-700' : 'border-slate-200 hover:border-slate-300'}`
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg ${type.color} flex items-center justify-center`}>
                            <type.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-medium text-center leading-tight">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Basic Info */}
                <Card className={darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={question.title}
                        onChange={e => updateQuestion({ title: e.target.value })}
                        placeholder="e.g., Binary Search Implementation"
                        className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}
                      />
                      {validation.errors.find(e => e.field === 'title') && (
                        <p className="text-xs text-red-500">{validation.errors.find(e => e.field === 'title').message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={question.description}
                        onChange={e => updateQuestion({ description: e.target.value })}
                        placeholder="Describe the question context and what students should learn..."
                        rows={3}
                        className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Difficulty *</Label>
                        <Select value={question.difficulty} onValueChange={v => updateQuestion({ difficulty: v })}>
                          <SelectTrigger className={darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIFFICULTIES.map(d => (
                              <SelectItem key={d.value} value={d.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${d.color}`} />
                                  {d.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>XP Reward</Label>
                        <Input
                          type="number"
                          min={1}
                          max={1000}
                          value={question.xpReward}
                          onChange={e => updateQuestion({ xpReward: parseInt(e.target.value) || 10 })}
                          className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Topics *</Label>
                      <div className="flex flex-wrap gap-2">
                        {TOPICS.map(topic => (
                          <button
                            key={topic}
                            onClick={() => {
                              const topics = question.topic.includes(topic)
                                ? question.topic.filter(t => t !== topic)
                                : [...question.topic, topic];
                              updateQuestion({ topic: topics });
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              question.topic.includes(topic)
                                ? 'bg-violet-500 text-white'
                                : darkMode
                                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                      {validation.errors.find(e => e.field === 'topic') && (
                        <p className="text-xs text-red-500">{validation.errors.find(e => e.field === 'topic').message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Type-Specific Content Editor */}
                <Card className={darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {(() => {
                        const TypeIcon = QUESTION_TYPES.find(t => t.value === question.type)?.icon || List;
                        return <TypeIcon className="w-5 h-5" />;
                      })()}
                      {QUESTION_TYPES.find(t => t.value === question.type)?.label} Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuestionContentEditor
                      type={question.type}
                      content={question.content}
                      updateContent={updateContent}
                      darkMode={darkMode}
                      validation={validation}
                    />
                  </CardContent>
                </Card>

                {/* Hints & Explanation */}
                <Card className={darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" /> Hints & Explanation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Hints</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuestion({
                            hints: [...question.hints, { id: `h-${Date.now()}`, text: '', xpPenalty: 5, order: question.hints.length }]
                          })}
                          className={darkMode ? 'border-slate-700' : ''}
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add Hint
                        </Button>
                      </div>
                      {question.hints.map((hint, idx) => (
                        <div key={hint.id} className={`flex gap-2 p-3 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                            {idx + 1}
                          </span>
                          <Input
                            value={hint.text}
                            onChange={e => {
                              const hints = [...question.hints];
                              hints[idx].text = e.target.value;
                              updateQuestion({ hints });
                            }}
                            placeholder="Hint text..."
                            className={`flex-1 ${darkMode ? 'bg-slate-900 border-slate-700' : ''}`}
                          />
                          <Input
                            type="number"
                            min={0}
                            value={hint.xpPenalty}
                            onChange={e => {
                              const hints = [...question.hints];
                              hints[idx].xpPenalty = parseInt(e.target.value) || 0;
                              updateQuestion({ hints });
                            }}
                            className={`w-20 ${darkMode ? 'bg-slate-900 border-slate-700' : ''}`}
                            placeholder="XP cost"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => updateQuestion({ hints: question.hints.filter((_, i) => i !== idx) })}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="explanation">Explanation (shown after answering)</Label>
                      <Textarea
                        id="explanation"
                        value={question.explanation}
                        onChange={e => updateQuestion({ explanation: e.target.value })}
                        placeholder="Explain why the correct answer is correct and common mistakes..."
                        rows={4}
                        className={`font-mono text-sm ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Validation & Preview */}
              <div className="space-y-6">
                {/* Validation Status */}
                <Card className={darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {validation.isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      Validation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {validation.errors.length === 0 && validation.warnings.length === 0 ? (
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-500/10' : 'bg-green-50'} text-green-500`}>
                        <p className="text-sm font-medium">✓ All checks passed!</p>
                      </div>
                    ) : (
                      <>
                        {validation.errors.map((error, i) => (
                          <Alert key={i} variant="destructive" className="py-2">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">{error.message}</AlertDescription>
                          </Alert>
                        ))}
                        {validation.warnings.map((warning, i) => (
                          <Alert key={i} className={`py-2 ${darkMode ? 'bg-amber-500/10 border-amber-500/50' : 'bg-amber-50 border-amber-200'}`}>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <AlertDescription className="text-xs text-amber-500">{warning.message}</AlertDescription>
                          </Alert>
                        ))}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className={darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}>
                  <CardContent className="pt-6 space-y-3">
                    <Button
                      className="w-full gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                      onClick={handleSave}
                      disabled={!validation.isValid}
                    >
                      <Save className="w-4 h-4" /> Save Question
                    </Button>
                    <Button
                      variant="outline"
                      className={`w-full gap-2 ${darkMode ? 'border-slate-700' : ''}`}
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex-1 gap-1 ${darkMode ? 'border-slate-700' : ''}`}
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(question, null, 2));
                        }}
                      >
                        <Copy className="w-3 h-3" /> Copy JSON
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex-1 gap-1 ${darkMode ? 'border-slate-700' : ''}`}
                        onClick={() => setQuestion(getEmptyQuestion(question.type))}
                      >
                        <Trash2 className="w-3 h-3" /> Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Preview */}
                {showPreview && (
                  <Card className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} overflow-hidden`}>
                    <CardHeader className="pb-3 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Play className="w-5 h-5" /> Live Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <QuestionPreview question={question} darkMode={darkMode} />
                    </CardContent>
                  </Card>
                )}

                {/* Quick Stats */}
                <Card className={darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-violet-400' : 'text-violet-600'}`}>{question.xpReward}</p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>XP Reward</p>
                      </div>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{question.hints.length}</p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hints</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ============ IMPORT TAB ============ */}
          <TabsContent value="import" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileJson className="w-5 h-5" /> Import from JSON
                  </CardTitle>
                  <CardDescription>Paste JSON array of questions or a single question object</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={importData}
                    onChange={e => setImportData(e.target.value)}
                    placeholder={`[\n  {\n    "type": "multiple_choice",\n    "title": "Question Title",\n    ...\n  }\n]`}
                    rows={15}
                    className={`font-mono text-sm ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}
                  />
                  <Button onClick={handleImport} className="w-full gap-2 bg-violet-500 hover:bg-violet-600">
                    <Upload className="w-4 h-4" /> Import Questions
                  </Button>

                  {importErrors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-500">Import Errors:</p>
                      {importErrors.map((err, i) => (
                        <Alert key={i} variant="destructive" className="py-2">
                          <AlertDescription className="text-xs">
                            <strong>{err.title}:</strong> {err.errors.map(e => e.message).join(', ')}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" /> Schema Reference
                  </CardTitle>
                  <CardDescription>Quick reference for question JSON structure</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`p-4 rounded-lg font-mono text-xs overflow-auto max-h-96 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <pre>{`{
  "type": "multiple_choice",
  "title": "String (required)",
  "description": "String (markdown)",
  "difficulty": "beginner|easy|medium|hard|expert",
  "topic": ["arrays", "sorting"],
  "tags": ["interview"],
  "xpReward": 10,
  "timeLimit": 60,
  "hints": [{
    "id": "h1",
    "text": "Hint text",
    "xpPenalty": 5,
    "order": 0
  }],
  "explanation": "Why this is correct...",
  "isPublic": false,
  "content": {
    // Type-specific content
    // See docs for each type
  }
}`}</pre>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Supported Types:</p>
                    <div className="flex flex-wrap gap-1">
                      {QUESTION_TYPES.map(type => (
                        <Badge key={type.value} variant="outline" className={`text-xs ${darkMode ? 'border-slate-700' : ''}`}>
                          {type.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============ LIBRARY TAB ============ */}
          <TabsContent value="library" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Question Library</h2>
              {savedQuestions.length > 0 && (
                <Button onClick={handleExport} variant="outline" className={`gap-2 ${darkMode ? 'border-slate-700' : ''}`}>
                  <Download className="w-4 h-4" /> Export All ({savedQuestions.length})
                </Button>
              )}
            </div>

            {savedQuestions.length === 0 ? (
              <Card className={darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}>
                <CardContent className="py-12 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center`}>
                    <List className={`w-8 h-8 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                  </div>
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>No questions yet</h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-500'} mt-1`}>
                    Create your first question using the Builder tab
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {savedQuestions.map((q, idx) => (
                  <Card key={q.id} className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} overflow-hidden`}>
                    <div className="flex items-stretch">
                      <div className={`w-1 ${QUESTION_TYPES.find(t => t.value === q.type)?.color || 'bg-slate-500'}`} />
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={QUESTION_TYPES.find(t => t.value === q.type)?.color}>
                                {QUESTION_TYPES.find(t => t.value === q.type)?.label}
                              </Badge>
                              <Badge variant="outline" className={darkMode ? 'border-slate-700' : ''}>
                                {q.difficulty}
                              </Badge>
                              <Badge variant="outline" className={darkMode ? 'border-slate-700' : ''}>
                                {q.xpReward} XP
                              </Badge>
                            </div>
                            <h3 className="font-medium truncate">{q.title || 'Untitled'}</h3>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {q.topic.map(t => (
                                <span key={t} className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setQuestion(q);
                                setActiveTab('builder');
                              }}
                              className={darkMode ? 'border-slate-700' : ''}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSavedQuestions(prev => prev.filter((_, i) => i !== idx))}
                              className="text-red-500 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ============ CONTENT EDITOR COMPONENT ============
function QuestionContentEditor({ type, content, updateContent, darkMode, validation }) {
  const inputClass = `${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`;

  switch (type) {
    case 'multiple_choice':
    case 'multi_select':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Question Text</Label>
            <Textarea
              value={content.question || ''}
              onChange={e => updateContent({ question: e.target.value })}
              placeholder="What is the time complexity of binary search?"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateContent({
                  options: [...(content.options || []), { id: `opt-${Date.now()}`, text: '', isCorrect: false }]
                })}
                className={darkMode ? 'border-slate-700' : ''}
              >
                <Plus className="w-3 h-3 mr-1" /> Add Option
              </Button>
            </div>
            {content.options?.map((opt, idx) => (
              <div key={opt.id} className={`flex items-center gap-2 p-3 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <button
                  onClick={() => {
                    const options = content.options.map((o, i) => ({
                      ...o,
                      isCorrect: type === 'multiple_choice' ? i === idx : (i === idx ? !o.isCorrect : o.isCorrect)
                    }));
                    updateContent({ options });
                  }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    opt.isCorrect
                      ? 'border-green-500 bg-green-500'
                      : darkMode ? 'border-slate-600' : 'border-slate-300'
                  }`}
                >
                  {opt.isCorrect && <Check className="w-3 h-3 text-white" />}
                </button>
                <Input
                  value={opt.text}
                  onChange={e => {
                    const options = [...content.options];
                    options[idx].text = e.target.value;
                    updateContent({ options });
                  }}
                  placeholder={`Option ${idx + 1}`}
                  className={`flex-1 ${darkMode ? 'bg-slate-900 border-slate-700' : ''}`}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => updateContent({ options: content.options.filter((_, i) => i !== idx) })}
                  className="text-red-500"
                  disabled={content.options.length <= 2}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {validation.errors.find(e => e.field === 'options') && (
              <p className="text-xs text-red-500">{validation.errors.find(e => e.field === 'options').message}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={content.shuffleOptions || false}
                onCheckedChange={v => updateContent({ shuffleOptions: v })}
              />
              <Label className="text-sm">Shuffle options</Label>
            </div>
            {type === 'multi_select' && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={content.partialCredit || false}
                  onCheckedChange={v => updateContent({ partialCredit: v })}
                />
                <Label className="text-sm">Partial credit</Label>
              </div>
            )}
          </div>
        </div>
      );

    case 'fill_blank':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={content.language || 'javascript'} onValueChange={v => updateContent({ language: v })}>
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Template (use {'{{blank_id}}'} for blanks)</Label>
            <Textarea
              value={content.template || ''}
              onChange={e => updateContent({ template: e.target.value })}
              placeholder="for (int i = {{start}}; i < arr.{{prop}}; {{inc}}) {"
              rows={4}
              className={`font-mono ${inputClass}`}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Blanks Definition</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateContent({
                  blanks: [...(content.blanks || []), { id: `b${(content.blanks?.length || 0) + 1}`, acceptedAnswers: [], caseSensitive: false }]
                })}
                className={darkMode ? 'border-slate-700' : ''}
              >
                <Plus className="w-3 h-3 mr-1" /> Add Blank
              </Button>
            </div>
            {content.blanks?.map((blank, idx) => (
              <div key={blank.id} className={`p-3 rounded-lg space-y-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2">
                  <Input
                    value={blank.id}
                    onChange={e => {
                      const blanks = [...content.blanks];
                      blanks[idx].id = e.target.value;
                      updateContent({ blanks });
                    }}
                    placeholder="Blank ID"
                    className={`w-24 font-mono ${darkMode ? 'bg-slate-900 border-slate-700' : ''}`}
                  />
                  <Input
                    value={blank.acceptedAnswers?.join(', ') || ''}
                    onChange={e => {
                      const blanks = [...content.blanks];
                      blanks[idx].acceptedAnswers = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      updateContent({ blanks });
                    }}
                    placeholder="Accepted answers (comma-separated)"
                    className={`flex-1 ${darkMode ? 'bg-slate-900 border-slate-700' : ''}`}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => updateContent({ blanks: content.blanks.filter((_, i) => i !== idx) })}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'drag_order':
    case 'parsons':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Instruction</Label>
            <Input
              value={content.instruction || ''}
              onChange={e => updateContent({ instruction: e.target.value })}
              placeholder="Arrange the steps in the correct order..."
              className={inputClass}
            />
          </div>

          {type === 'parsons' && (
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={content.language || 'javascript'} onValueChange={v => updateContent({ language: v })}>
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Items (in correct order)</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const items = content.items || content.codeLines || [];
                  const newItem = type === 'parsons'
                    ? { id: `l-${Date.now()}`, code: '', correctPosition: items.length, correctIndent: 0 }
                    : { id: `i-${Date.now()}`, text: '', correctPosition: items.length };
                  updateContent(type === 'parsons' ? { codeLines: [...items, newItem] } : { items: [...items, newItem] });
                }}
                className={darkMode ? 'border-slate-700' : ''}
              >
                <Plus className="w-3 h-3 mr-1" /> Add Item
              </Button>
            </div>
            {(content.items || content.codeLines || []).map((item, idx) => (
              <div key={item.id} className={`flex items-center gap-2 p-2 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <GripVertical className={`w-4 h-4 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold w-6 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{idx + 1}</span>
                <Input
                  value={item.text || item.code || ''}
                  onChange={e => {
                    const key = type === 'parsons' ? 'codeLines' : 'items';
                    const items = [...(content[key] || [])];
                    items[idx] = { ...items[idx], [type === 'parsons' ? 'code' : 'text']: e.target.value };
                    updateContent({ [key]: items });
                  }}
                  placeholder={type === 'parsons' ? 'Code line...' : 'Step description...'}
                  className={`flex-1 ${type === 'parsons' ? 'font-mono' : ''} ${darkMode ? 'bg-slate-900 border-slate-700' : ''}`}
                />
                {type === 'parsons' && (
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={item.correctIndent || 0}
                    onChange={e => {
                      const items = [...(content.codeLines || [])];
                      items[idx].correctIndent = parseInt(e.target.value) || 0;
                      updateContent({ codeLines: items });
                    }}
                    className={`w-16 ${darkMode ? 'bg-slate-900 border-slate-700' : ''}`}
                    title="Indent level"
                  />
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    const key = type === 'parsons' ? 'codeLines' : 'items';
                    updateContent({ [key]: (content[key] || []).filter((_, i) => i !== idx) });
                  }}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {type === 'drag_order' && (
            <div className="flex items-center gap-2">
              <Switch
                checked={content.includeDistractors || false}
                onCheckedChange={v => updateContent({ includeDistractors: v })}
              />
              <Label className="text-sm">Include distractors (wrong options)</Label>
            </div>
          )}
        </div>
      );

    case 'drag_match':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Instruction</Label>
            <Input
              value={content.instruction || ''}
              onChange={e => updateContent({ instruction: e.target.value })}
              placeholder="Match each data structure with its use case..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Left Items</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateContent({
                    leftItems: [...(content.leftItems || []), { id: `l-${Date.now()}`, text: '', matchId: '' }]
                  })}
                  className={darkMode ? 'border-slate-700' : ''}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              {content.leftItems?.map((item, idx) => (
                <div key={item.id} className={`flex gap-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} p-2 rounded`}>
                  <Input
                    value={item.text}
                    onChange={e => {
                      const items = [...content.leftItems];
                      items[idx].text = e.target.value;
                      updateContent({ leftItems: items });
                    }}
                    placeholder="Left item..."
                    className={`flex-1 text-sm ${darkMode ? 'bg-slate-900 border-slate-700' : ''}`}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => updateContent({ leftItems: content.leftItems.filter((_, i) => i !== idx) })}
                    className="text-red-500 h-8 w-8"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Right Items</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateContent({
                    rightItems: [...(content.rightItems || []), { id: `r-${Date.now()}`, text: '' }]
                  })}
                  className={darkMode ? 'border-slate-700' : ''}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              {content.rightItems?.map((item, idx) => (
                <div key={item.id} className={`flex gap-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} p-2 rounded`}>
                  <Input
                    value={item.text}
                    onChange={e => {
                      const items = [...content.rightItems];
                      items[idx].text = e.target.value;
                      updateContent({ rightItems: items });
                    }}
                    placeholder="Right item..."
                    className={`flex-1 text-sm ${darkMode ? 'bg-slate-900 border-slate-700' : ''}`}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => updateContent({ rightItems: content.rightItems.filter((_, i) => i !== idx) })}
                    className="text-red-500 h-8 w-8"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Tip: Items at the same index will be matched. Add extra right items as distractors.
          </p>
        </div>
      );

    case 'code_writing':
    case 'debugging':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea
              value={content.prompt || ''}
              onChange={e => updateContent({ prompt: e.target.value })}
              placeholder="Write a function that reverses a linked list..."
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={content.language || 'javascript'} onValueChange={v => updateContent({ language: v })}>
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{type === 'debugging' ? 'Buggy Code' : 'Starter Code'}</Label>
            <Textarea
              value={content.starterCode || content.buggyCode || ''}
              onChange={e => updateContent(type === 'debugging' ? { buggyCode: e.target.value } : { starterCode: e.target.value })}
              placeholder="function solution(input) {&#10;  // Your code here&#10;}"
              rows={8}
              className={`font-mono text-sm ${inputClass}`}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Test Cases</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateContent({
                  testCases: [...(content.testCases || []), { id: `tc-${Date.now()}`, input: '', expectedOutput: '', isHidden: false }]
                })}
                className={darkMode ? 'border-slate-700' : ''}
              >
                <Plus className="w-3 h-3 mr-1" /> Add Test
              </Button>
            </div>
            {content.testCases?.map((tc, idx) => (
              <div key={tc.id} className={`p-3 rounded-lg space-y-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>#{idx + 1}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <Switch
                      checked={tc.isHidden || false}
                      onCheckedChange={v => {
                        const tests = [...content.testCases];
                        tests[idx].isHidden = v;
                        updateContent({ testCases: tests });
                      }}
                    />
                    <Label className="text-xs">Hidden</Label>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => updateContent({ testCases: content.testCases.filter((_, i) => i !== idx) })}
                    className="text-red-500 h-6 w-6"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={tc.input}
                    onChange={e => {
                      const tests = [...content.testCases];
                      tests[idx].input = e.target.value;
                      updateContent({ testCases: tests });
                    }}
                    placeholder="Input: [1,2,3]"
                    className={`font-mono text-xs ${darkMode ? 'bg-slate-900 border-slate-700' : ''}`}
                  />
                  <Input
                    value={tc.expectedOutput}
                    onChange={e => {
                      const tests = [...content.testCases];
                      tests[idx].expectedOutput = e.target.value;
                      updateContent({ testCases: tests });
                    }}
                    placeholder="Expected: [3,2,1]"
                    className={`font-mono text-xs ${darkMode ? 'bg-slate-900 border-slate-700' : ''}`}
                  />
                </div>
              </div>
            ))}
            {validation.errors.find(e => e.field === 'testCases') && (
              <p className="text-xs text-red-500">{validation.errors.find(e => e.field === 'testCases').message}</p>
            )}
          </div>
        </div>
      );

    case 'true_false':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Statement</Label>
            <Textarea
              value={content.statement || ''}
              onChange={e => updateContent({ statement: e.target.value })}
              placeholder="A stack follows the LIFO (Last In, First Out) principle."
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <div className="flex gap-4">
              <button
                onClick={() => updateContent({ isTrue: true })}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  content.isTrue === true
                    ? 'border-green-500 bg-green-500/10'
                    : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <CheckCircle2 className={`w-8 h-8 mx-auto mb-2 ${content.isTrue === true ? 'text-green-500' : darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                <p className="font-medium">True</p>
              </button>
              <button
                onClick={() => updateContent({ isTrue: false })}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  content.isTrue === false
                    ? 'border-red-500 bg-red-500/10'
                    : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <XCircle className={`w-8 h-8 mx-auto mb-2 ${content.isTrue === false ? 'text-red-500' : darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                <p className="font-medium">False</p>
              </button>
            </div>
          </div>
        </div>
      );

    default:
      return <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Select a question type to configure content.</p>;
  }
}

// ============ PREVIEW COMPONENT ============
function QuestionPreview({ question, darkMode }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [fillAnswers, setFillAnswers] = useState({});
  const [dragItems, setDragItems] = useState([]);

  React.useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setFillAnswers({});
    if (question.type === 'drag_order') {
      const items = [...(question.content?.items || [])];
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      setDragItems(items);
    }
  }, [question.type, question.content]);

  const checkAnswer = () => setShowResult(true);
  const reset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setFillAnswers({});
  };

  const renderPreview = () => {
    switch (question.type) {
      case 'multiple_choice':
      case 'multi_select':
        return (
          <div className="space-y-3">
            <p className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              {question.content?.question || 'Question text...'}
            </p>
            <div className="space-y-2">
              {question.content?.options?.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => !showResult && setSelectedAnswer(opt.id)}
                  disabled={showResult}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    showResult
                      ? opt.isCorrect
                        ? 'border-green-500 bg-green-500/10'
                        : selectedAnswer === opt.id
                          ? 'border-red-500 bg-red-500/10'
                          : darkMode ? 'border-slate-700' : 'border-slate-200'
                      : selectedAnswer === opt.id
                        ? darkMode ? 'border-violet-500 bg-violet-500/10' : 'border-violet-500 bg-violet-50'
                        : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm">{opt.text || `Option ${idx + 1}`}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'fill_blank':
        const parts = (question.content?.template || '').split(/(\{\{\w+\}\})/g);
        return (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg font-mono text-sm ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} whitespace-pre-wrap`}>
              {parts.map((part, idx) => {
                const match = part.match(/\{\{(\w+)\}\}/);
                if (match) {
                  const blankId = match[1];
                  const blank = question.content?.blanks?.find(b => b.id === blankId);
                  const isCorrect = blank?.acceptedAnswers?.some(a => 
                    blank.caseSensitive ? a === fillAnswers[blankId] : a.toLowerCase() === fillAnswers[blankId]?.toLowerCase()
                  );
                  return (
                    <input
                      key={idx}
                      type="text"
                      value={fillAnswers[blankId] || ''}
                      onChange={e => setFillAnswers(prev => ({ ...prev, [blankId]: e.target.value }))}
                      disabled={showResult}
                      className={`inline-block w-24 px-2 py-0.5 mx-1 rounded border ${
                        showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-red-500 bg-red-500/20'
                          : darkMode ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-300'
                      }`}
                      placeholder={blank?.placeholder || '???'}
                    />
                  );
                }
                return <span key={idx}>{part}</span>;
              })}
            </div>
          </div>
        );

      case 'drag_order':
        return (
          <div className="space-y-4">
            <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {question.content?.instruction || 'Drag items into the correct order'}
            </p>
            <div className="space-y-2">
              {dragItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border flex items-center gap-2 ${
                    showResult
                      ? item.correctPosition === idx
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-red-500 bg-red-500/10'
                      : darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <GripVertical className={`w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className="text-sm flex-1">{item.text}</span>
                  {showResult && (
                    <span className={`text-xs ${item.correctPosition === idx ? 'text-green-500' : 'text-red-500'}`}>
                      {item.correctPosition === idx ? '✓' : `→ ${item.correctPosition + 1}`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-4">
            <p className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              {question.content?.statement || 'Statement...'}
            </p>
            <div className="flex gap-3">
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  onClick={() => !showResult && setSelectedAnswer(val)}
                  disabled={showResult}
                  className={`flex-1 p-3 rounded-lg border font-medium transition-all ${
                    showResult
                      ? question.content?.isTrue === val
                        ? 'border-green-500 bg-green-500/10 text-green-500'
                        : selectedAnswer === val
                          ? 'border-red-500 bg-red-500/10 text-red-500'
                          : darkMode ? 'border-slate-700' : 'border-slate-200'
                      : selectedAnswer === val
                        ? darkMode ? 'border-violet-500 bg-violet-500/10' : 'border-violet-500 bg-violet-50'
                        : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {val ? 'True' : 'False'}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Preview not available for this question type yet.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Question Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={DIFFICULTIES.find(d => d.value === question.difficulty)?.color || 'bg-slate-500'}>
          {question.difficulty}
        </Badge>
        <Badge variant="outline" className={darkMode ? 'border-slate-700' : ''}>
          {question.xpReward} XP
        </Badge>
        {question.timeLimit && (
          <Badge variant="outline" className={darkMode ? 'border-slate-700' : ''}>
            {question.timeLimit}s
          </Badge>
        )}
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="font-semibold">{question.title || 'Untitled Question'}</h3>
        {question.description && (
          <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {question.description}
          </p>
        )}
      </div>

      {/* Question Content */}
      {renderPreview()}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={checkAnswer} disabled={showResult} className="bg-violet-500 hover:bg-violet-600">
          Check Answer
        </Button>
        <Button size="sm" variant="outline" onClick={reset} className={darkMode ? 'border-slate-700' : ''}>
          Reset
        </Button>
      </div>

      {/* Explanation */}
      {showResult && question.explanation && (
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
          <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Explanation</p>
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
