import React, { useState, useEffect } from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import { rulesApi } from '../../services/rules.api';
import { applicationsApi } from '../../services/applications.api';

export default function NewApplication({ onCreated }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    rulesApi.getCategories()
      .then(res => {
        if (res.categories?.length) {
          setCategories(res.categories);
          setSelectedCategory(res.categories[0]);
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !selectedCategory) return;
    setSubmitting(true);
    try {
      const res = await applicationsApi.create({
        institution_name: name,
        institution_email: email,
        category: selectedCategory
      });
      if (res.success) {
        onCreated(res.application);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-xl mx-auto flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">New AICTE Regulatory Filing</h2>
        <p className="text-xs text-slate-500">Initiate an application and load the mandatory handbook checklist.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Application Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Institution Name</label>
          <input
            type="text"
            required
            placeholder="e.g. National Institute of Technology"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Authorized Contact Email</label>
          <input
            type="email"
            required
            placeholder="principal@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs"
        >
          {submitting ? 'Generating Checklist...' : 'Create Application & Load Checklist'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
