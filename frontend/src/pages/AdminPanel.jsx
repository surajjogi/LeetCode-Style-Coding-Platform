import React, { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import * as z from "zod";
import { toast } from "react-hot-toast";

const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.string().min(1, "Tag is required"),
  visibleTestCases: z
    .array(z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().min(1, "Explanation is required"),
    })).min(1, "At least one visible test case is required"),
  hiddenTestCases: z
    .array(z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
    })).min(1, "At least one hidden test case is required"),
  startCode: z
    .array(z.object({
      language: z.enum(["C++", "Java", "JavaScript"]),
      initialCode: z.string().min(1, "Initial code is required"),
    })).length(3, "All three languages required"),
  hiddenDriverCode: z
    .array(z.object({
      language: z.enum(["C++", "Java", "JavaScript"]),
      initialCode: z.string().min(1, "Driver code is required"),
    })).length(3, "All three driver codes required"),
  referenceSolution: z
    .array(z.object({
      language: z.enum(["C++", "Java", "JavaScript"]),
      initialCode: z.string().min(1, "Reference code is required"),
    })).length(3, "All three solutions required"),
});

const defaultFormValues = {
  startCode: [
    { language: "C++", initialCode: "" },
    { language: "Java", initialCode: "" },
    { language: "JavaScript", initialCode: "" },
  ],
  hiddenDriverCode: [
    { language: "C++", initialCode: "" },
    { language: "Java", initialCode: "" },
    { language: "JavaScript", initialCode: "" },
  ],
  referenceSolution: [
    { language: "C++", initialCode: "" },
    { language: "Java", initialCode: "" },
    { language: "JavaScript", initialCode: "" },
  ],
};

const DIFFICULTY_COLOR = {
  easy: "text-green-400/70 bg-green-400/5",
  medium: "text-yellow-400/70 bg-yellow-400/5",
  hard: "text-red-400/70 bg-red-400/5",
};

// ── Reusable Problem Form ────────────────────────────────────────────────────
function ProblemForm({ editingProblem, onSuccess, onCancel }) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editingProblem;

  const {
    register, control, handleSubmit, setValue, reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: defaultFormValues,
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } =
    useFieldArray({ control, name: "visibleTestCases" });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } =
    useFieldArray({ control, name: "hiddenTestCases" });

  useEffect(() => {
    if (editingProblem) {
      const { title, description, difficulty, tags,
        visibleTestCases, hiddenTestCases, startCode, hiddenDriverCode, referenceSolution } = editingProblem;
      reset({ title, description, difficulty, tags,
        visibleTestCases, hiddenTestCases, startCode, hiddenDriverCode, referenceSolution });
    } else {
      reset(defaultFormValues);
    }
  }, [editingProblem]);

  const handleGenerateAI = async () => {
    if (!aiPrompt) return toast.error("Please enter a prompt for AI");
    setIsGenerating(true);
    toast.loading("Generating problem via AI...", { id: "generateAI" });
    try {
      const { data } = await axiosClient.post("/ai/generate-problem", { prompt: aiPrompt });
      Object.keys(data).forEach(key => setValue(key, data[key]));
      toast.success("Problem generated! Please review the fields.", { id: "generateAI" });
    } catch (error) {
      toast.error(`AI failed: ${error.response?.data || error.message}`, { id: "generateAI" });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    toast.loading("Saving problem...", { id: "saveProblem" });
    try {
      if (isEditing) {
        await axiosClient.put(`/problem/update/${editingProblem._id}`, data);
        toast.success("Problem updated successfully!", { id: "saveProblem" });
      } else {
        await axiosClient.post("/problem/create", data);
        toast.success("Problem created successfully!", { id: "saveProblem" });
      }
      onSuccess();
    } catch (error) {
      const msg = typeof error.response?.data === "string"
        ? error.response.data
        : error.response?.data?.message || error.message;
      toast.error(`Error: ${msg}`, { id: "saveProblem" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* AI Section */}
      <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-6 mb-8">
        <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
          <span>🤖</span> Generate with AI
        </h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            placeholder="e.g. Create a medium graph shortest-path problem..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/50 transition-colors"
          />
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isGenerating 
              ? "bg-purple-900/50 text-white/50 cursor-not-allowed" 
              : "bg-purple-500 hover:bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            }`}
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <Section title="Basic Information">
          <Field label="Title" error={errors.title?.message}>
            <input {...register("title")} className={inputClass(errors.title)} />
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <textarea {...register("description")} rows={4} className={inputClass(errors.description)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Difficulty" error={errors.difficulty?.message}>
              <select {...register("difficulty")} className={inputClass(errors.difficulty)}>
                <option value="easy" className="bg-black">Easy</option>
                <option value="medium" className="bg-black">Medium</option>
                <option value="hard" className="bg-black">Hard</option>
              </select>
            </Field>
            <Field label="Tag (e.g. array, math, dp)" error={errors.tags?.message}>
              <input {...register("tags")} placeholder="e.g. Math" className={inputClass(errors.tags)} />
            </Field>
          </div>
        </Section>

        {/* Visible Test Cases */}
        <Section title="Visible Test Cases"
          action={<AddBtn onClick={() => appendVisible({ input: "", output: "", explanation: "" })}>+ Add Case</AddBtn>}
        >
          {visibleFields.length === 0 && <EmptyHint>No visible test cases yet.</EmptyHint>}
          {visibleFields.map((field, i) => (
            <div key={field.id} className="bg-white/5 border border-white/10 rounded-lg p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-white/40 font-semibold tracking-wider uppercase">Case #{i + 1}</span>
                <RemoveBtn onClick={() => removeVisible(i)} />
              </div>
              <div className="space-y-3">
                <input {...register(`visibleTestCases.${i}.input`)} placeholder="Input" className={inputClass()} />
                <input {...register(`visibleTestCases.${i}.output`)} placeholder="Output" className={inputClass()} />
                <textarea {...register(`visibleTestCases.${i}.explanation`)} placeholder="Explanation" rows={2} className={inputClass()} />
              </div>
            </div>
          ))}
        </Section>

        {/* Hidden Test Cases */}
        <Section title="Hidden Test Cases"
          action={<AddBtn onClick={() => appendHidden({ input: "", output: "" })}>+ Add Case</AddBtn>}
        >
          {hiddenFields.length === 0 && <EmptyHint>No hidden test cases yet.</EmptyHint>}
          {hiddenFields.map((field, i) => (
            <div key={field.id} className="bg-white/5 border border-white/10 rounded-lg p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-white/40 font-semibold tracking-wider uppercase">Case #{i + 1}</span>
                <RemoveBtn onClick={() => removeHidden(i)} />
              </div>
              <div className="space-y-3">
                <input {...register(`hiddenTestCases.${i}.input`)} placeholder="Input" className={inputClass()} />
                <input {...register(`hiddenTestCases.${i}.output`)} placeholder="Output" className={inputClass()} />
              </div>
            </div>
          ))}
        </Section>

        {/* Code Templates */}
        <Section title="Code Templates & Reference Solutions">
          {["C++", "Java", "JavaScript"].map((lang, i) => (
            <div key={lang} className="mb-8 last:mb-0">
              <p className="text-purple-400 font-semibold mb-3">{lang}</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Initial Code (shown to user)">
                  <textarea {...register(`startCode.${i}.initialCode`)} rows={6}
                    className={`${inputClass()} font-mono text-xs`} />
                </Field>
                <Field label="Reference Solution">
                  <textarea {...register(`referenceSolution.${i}.initialCode`)} rows={6}
                    className={`${inputClass()} font-mono text-xs`} />
                </Field>
              </div>
            </div>
          ))}
        </Section>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={isSubmitting} className={`
            flex-1 py-3.5 rounded-lg text-sm font-medium transition-all
            ${isSubmitting 
              ? "bg-white/10 text-white/50 cursor-not-allowed" 
              : "bg-white text-black hover:bg-gray-200"
            }
          `}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Problem" : "Create Problem"}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-8 py-3.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Problems List ────────────────────────────────────────────────────────────
function ProblemsList({ onEdit, onRefresh, refreshKey }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState("all");

  useEffect(() => {
    fetchProblems();
  }, [refreshKey]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/problem/getAllProblem?limit=100");
      setProblems(data.data || []);
    } catch (err) {
      toast.error("Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    toast.loading("Deleting problem...", { id: "deleteProblem" });
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems(prev => prev.filter(p => p._id !== id));
      toast.success("Problem deleted successfully!", { id: "deleteProblem" });
    } catch (err) {
      toast.error("Failed to delete: " + (err.response?.data || err.message), { id: "deleteProblem" });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = problems.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags && p.tags.toLowerCase().includes(search.toLowerCase()));
    const matchDiff = filterDiff === "all" || p.difficulty === filterDiff;
    return matchSearch && matchDiff;
  });

  return (
    <div>
      {/* Search & Filter bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or tag..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/50 transition-colors"
        />
        <select 
          value={filterDiff} onChange={e => setFilterDiff(e.target.value)} 
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-purple-400/50 transition-colors cursor-pointer w-40"
        >
          <option value="all" className="bg-black">All Levels</option>
          <option value="easy" className="bg-black">Easy</option>
          <option value="medium" className="bg-black">Medium</option>
          <option value="hard" className="bg-black">Hard</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "total", value: problems.length, color: "text-purple-400" },
          { label: "easy", value: problems.filter(p => p.difficulty === "easy").length, color: "text-green-400" },
          { label: "medium", value: problems.filter(p => p.difficulty === "medium").length, color: "text-yellow-400" },
          { label: "hard", value: problems.filter(p => p.difficulty === "hard").length, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-lg p-4">
             <div className={`text-2xl font-light ${s.color}`}>{s.value}</div>
             <div className="text-xs text-white/40 uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/40">Loading problems...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/40">No problems found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(problem => (
            <div key={problem._id} className="group relative block">
                <div className="relative bg-white/5 rounded-lg p-4 transition-all duration-200 ease-out hover:bg-white/10 border border-transparent hover:border-purple-400/20 flex items-center gap-4">
                  <div className="flex-1">
                      <h3 className="text-sm text-white/80 group-hover:text-white transition-colors">
                          {problem.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-white/30 group-hover:text-white/40 transition-colors">
                              #{problem.tags}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded transition-colors duration-200 ${DIFFICULTY_COLOR[problem.difficulty]}`}>
                              {problem.difficulty}
                          </span>
                      </div>
                  </div>

                  <button
                    onClick={() => onEdit(problem)}
                    className="text-xs font-medium px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                  >Edit</button>

                  <button
                    onClick={() => handleDelete(problem._id, problem.title)}
                    disabled={deletingId === problem._id}
                    className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors border ${
                        deletingId === problem._id 
                        ? "bg-red-500/5 text-red-400/50 border-red-500/10 cursor-not-allowed" 
                        : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                    }`}
                  >
                    {deletingId === problem._id ? "..." : "Delete"}
                  </button>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionId, setActionId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const { data } = await axiosClient.get("/user/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data || err.message;
      setApiError(String(msg));
      toast.error("Failed to fetch users: " + msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);


  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setActionId(id + "-del");
    try {
      await axiosClient.delete(`/user/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success("User deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    } finally {
      setActionId(null);
    }
  };

  const handleRoleToggle = async (u) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    setActionId(u._id + "-role");
    try {
      await axiosClient.patch(`/user/admin/users/${u._id}/role`, { role: newRole });
      setUsers(prev => prev.map(x => x._id === u._id ? { ...x, role: newRole } : x));
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Role update failed");
    } finally {
      setActionId(null);
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.firstName?.toLowerCase().includes(q) || u.emailId?.toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Users", value: users.length, color: "text-purple-400" },
          { label: "Admins", value: users.filter(u => u.role === "admin").length, color: "text-yellow-400" },
          { label: "Regular Users", value: users.filter(u => u.role === "user").length, color: "text-blue-400" },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-xl p-5 border border-white/5">
            <div className={`text-3xl font-light ${s.color}`}>{s.value}</div>
            <div className="text-xs text-white/40 uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/50 transition-colors" />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white/70 focus:outline-none w-36 cursor-pointer">
          <option value="all" className="bg-black">All Roles</option>
          <option value="user" className="bg-black">User</option>
          <option value="admin" className="bg-black">Admin</option>
        </select>
        <button onClick={fetchUsers} className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm">↻ Refresh</button>
      </div>
      {loading ? (
        <div className="text-center py-16 text-white/40">Loading users…</div>
      ) : apiError ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <div className="text-red-400 font-medium mb-2">⚠️ Failed to load users</div>
          <div className="text-red-400/60 text-sm font-mono">{apiError}</div>
          <div className="text-white/40 text-xs mt-3">Make sure the backend is running on <code className="text-purple-400">localhost:3000</code> and you are logged in as admin.</div>
          <button onClick={fetchUsers} className="mt-4 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm">↻ Try Again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/40">No users found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3.5">User</th>
                <th className="text-left px-5 py-3.5">Email</th>
                <th className="text-center px-4 py-3.5">Solved</th>
                <th className="text-center px-4 py-3.5">Submissions</th>
                <th className="text-center px-4 py-3.5">Accepted</th>
                <th className="text-center px-4 py-3.5">Role</th>
                <th className="text-center px-4 py-3.5">Joined</th>
                <th className="text-right px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u._id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-semibold">
                        {u.firstName?.[0]?.toUpperCase()}{u.lastName?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-white/80">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-white/50 font-mono text-xs">{u.emailId}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-green-400 font-medium">{u.problemsSolved}</span>
                  </td>
                  <td className="px-4 py-4 text-center text-white/60">{u.totalSubmissions}</td>
                  <td className="px-4 py-4 text-center text-blue-400">{u.acceptedSubmissions}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      u.role === "admin" ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20" : "bg-white/5 text-white/50 border border-white/10"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-4 text-center text-white/40 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRoleToggle(u)}
                        disabled={actionId === u._id + "-role"}
                        className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 transition-colors disabled:opacity-40"
                      >{actionId === u._id + "-role" ? "…" : u.role === "admin" ? "Demote" : "Promote"}</button>
                      <button
                        onClick={() => handleDelete(u._id, u.firstName)}
                        disabled={actionId === u._id + "-del"}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-40"
                      >{actionId === u._id + "-del" ? "…" : "Delete"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosClient.get("/user/admin/stats");
        setStats(data);
      } catch { toast.error("Failed to load stats"); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="text-center py-16 text-white/40">Loading stats…</div>;
  if (!stats) return null;

  const metricCards = [
    { label: "Total Users", value: stats.totalUsers, color: "text-purple-400", bg: "from-purple-500/10" },
    { label: "Total Problems", value: stats.totalProblems, color: "text-blue-400", bg: "from-blue-500/10" },
    { label: "Total Submissions", value: stats.totalSubmissions, color: "text-yellow-400", bg: "from-yellow-500/10" },
    { label: "Accepted", value: stats.acceptedSubmissions, color: "text-green-400", bg: "from-green-500/10" },
    { label: "Acceptance Rate", value: `${stats.acceptanceRate}%`, color: "text-cyan-400", bg: "from-cyan-500/10" },
  ];

  return (
    <div className="space-y-10">
      {/* Big metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {metricCards.map(m => (
          <div key={m.label} className={`bg-gradient-to-br ${m.bg} to-transparent border border-white/10 rounded-xl p-5`}>
            <div className={`text-3xl font-light ${m.color}`}>{m.value}</div>
            <div className="text-xs text-white/40 uppercase tracking-wider mt-2">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Difficulty breakdown */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-light text-white/80 mb-6">Problems by Difficulty</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Easy", value: stats.problemsByDifficulty?.easy || 0, color: "text-green-400", bar: "bg-green-400" },
            { label: "Medium", value: stats.problemsByDifficulty?.medium || 0, color: "text-yellow-400", bar: "bg-yellow-400" },
            { label: "Hard", value: stats.problemsByDifficulty?.hard || 0, color: "text-red-400", bar: "bg-red-400" },
          ].map(d => {
            const pct = stats.totalProblems > 0 ? Math.round((d.value / stats.totalProblems) * 100) : 0;
            return (
              <div key={d.label} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">{d.label}</span>
                  <span className={`text-sm font-medium ${d.color}`}>{d.value} <span className="text-white/30">({pct}%)</span></span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${d.bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h3 className="text-base font-light text-white/80 mb-4">Recent Signups</h3>
          <div className="space-y-3">
            {stats.recentUsers?.map(u => (
              <div key={u._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/15 flex items-center justify-center text-purple-400 text-xs font-semibold">
                  {u.firstName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/70 truncate">{u.firstName}</div>
                  <div className="text-xs text-white/30">{new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  u.role === "admin" ? "bg-yellow-400/10 text-yellow-400" : "bg-white/5 text-white/40"
                }`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Recent Submissions */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h3 className="text-base font-light text-white/80 mb-4">Recent Submissions</h3>
          <div className="space-y-3">
            {stats.recentSubmissions?.map(s => (
              <div key={s._id} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  s.status === 'accepted' ? 'bg-green-400' : s.status === 'wrong' ? 'bg-red-400' : 'bg-yellow-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/70 truncate">{s.problemId?.title || 'Unknown'}</div>
                  <div className="text-xs text-white/30">by {s.userId?.firstName || 'Unknown'}</div>
                </div>
                <span className={`text-xs ${
                  s.status === 'accepted' ? 'text-green-400' : s.status === 'wrong' ? 'text-red-400' : 'text-yellow-400'
                }`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main AdminPanel ──────────────────────────────────────────────────────────
function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("list");
  const [editingProblem, setEditingProblem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = async (problem) => {
    try {
      const { data } = await axiosClient.get(`/problem/problemById/${problem._id}`);
      setEditingProblem(data);
      setActiveTab("edit");
    } catch (err) {
      toast.error("Failed to load problem details");
    }
  };

  const handleFormSuccess = () => {
    setEditingProblem(null);
    setActiveTab("list");
    setRefreshKey(k => k + 1);
  };

  const handleCancelEdit = () => {
    setEditingProblem(null);
    setActiveTab("list");
  };

  const tabs = [
    { id: "list", label: "All Problems" },
    { id: "create", label: "Create Problem" },
    { id: "users", label: "👥 Users" },
    { id: "stats", label: "📊 Stats" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-6">
                <button 
                  onClick={() => navigate(-1)} 
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div className="text-xl font-light tracking-wider">
                    <span className="text-white">admin</span>
                    <span className="text-purple-400 font-normal">/panel</span>
                </div>
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-32 pb-12 max-w-5xl">
        {/* Header Area */}
        <div className="mb-12 relative flex justify-between items-end">
            <div className="space-y-2">
                <h1 className="text-4xl font-light tracking-wide">
                    <span className="bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
                        {activeTab === "list" ? "manage problems" : activeTab === "create" ? "new problem" : "edit problem"}
                    </span>
                </h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                {tabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => { setActiveTab(tab.id); setEditingProblem(null); }}
                        className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                            activeTab === tab.id 
                            ? "bg-white/10 text-white shadow-sm" 
                            : "text-white/40 hover:text-white/70"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
                {activeTab === "edit" && (
                    <button className="px-4 py-2 rounded-lg text-sm bg-yellow-500/10 text-yellow-400">
                        Editing Active
                    </button>
                )}
            </div>
        </div>

        {activeTab === "list" && (
          <ProblemsList onEdit={handleEdit} refreshKey={refreshKey} />
        )}

        {activeTab === "create" && (
          <ProblemForm onSuccess={handleFormSuccess} />
        )}

        {activeTab === "edit" && editingProblem && (
          <ProblemForm editingProblem={editingProblem} onSuccess={handleFormSuccess} onCancel={handleCancelEdit} />
        )}

        {activeTab === "users" && <UsersTab />}

        {activeTab === "stats" && <StatsTab />}
      </div>
    </div>
  );
}

// ── Small helper components ──────────────────────────────────────────────────
function Section({ title, children, action }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-light text-white/90 tracking-wide">{title}</h3>
        {action}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-white/40 uppercase tracking-wider font-medium">{label}</label>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

function AddBtn({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="text-xs font-medium px-3 py-1.5 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors border border-purple-500/20">
        {children}
    </button>
  );
}

function RemoveBtn({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="text-xs font-medium px-2.5 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
        Remove
    </button>
  );
}

function EmptyHint({ children }) {
  return <p className="text-white/30 text-sm text-center py-4">{children}</p>;
}

const inputClass = (error) => `w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/50 transition-colors`;

export default AdminPanel;