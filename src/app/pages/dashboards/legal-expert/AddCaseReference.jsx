import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../../../components/DashboardLayout';
import {
  LayoutDashboard, Scale, BookOpen, FileText, Edit,
  MessageCircle, Settings, Bell, ArrowLeft, Save, Send, X
} from 'lucide-react';
import { apiPost } from '../../../utils/api';

export default function AddCaseReference() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    citation: '',
    court: '',
    type: '',
    significance: '',
    summary: '',
    relevantArticles: [],
    judgeName: '',
    pdfUrl: ''
  });
  const [articleInput, setArticleInput] = useState('');

  const navigationItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/legal-expert' },
    { label: 'Update Articles', icon: Scale, path: '/legal-expert/articles' },
    { label: 'Legal Insights', icon: BookOpen, path: '/legal-expert/insights' },
    { label: 'Case References', icon: FileText, path: '/legal-expert/cases', active: true },
    { label: 'Amendment Updates', icon: Edit, path: '/legal-expert/amendments' },
    { label: 'Advisory Requests', icon: MessageCircle, path: '/legal-expert/advisory' },
    { label: 'Notifications', icon: Bell, path: '/legal-expert/notifications' },
    { label: 'Settings', icon: Settings, path: '/legal-expert/settings' },
  ];

  const caseTypes = ['Landmark', 'Important', 'Reference'];
  const courts = ['Supreme Court of India', 'High Court', 'District Court', 'Tribunal', 'Other'];

  const handleAddArticle = () => {
    if (articleInput.trim() && !formData.relevantArticles.includes(articleInput.trim())) {
      setFormData({ ...formData, relevantArticles: [...formData.relevantArticles, articleInput.trim()] });
      setArticleInput('');
    }
  };

  const handleRemoveArticle = (article) => {
    setFormData({ ...formData, relevantArticles: formData.relevantArticles.filter((item) => item !== article) });
  };

  const handleSubmit = async (e, status) => {
    e.preventDefault();
    await apiPost('/case-references', {
      ...formData,
      year: formData.year ? Number(formData.year) : null,
      status,
      relevantArticles: formData.relevantArticles.join(', ')
    });
    alert(`Case reference ${status === 'published' ? 'added' : 'saved as draft'} successfully!`);
    navigate('/legal-expert/cases');
  };

  return (
    <DashboardLayout navigationItems={navigationItems} title="Add Case Reference" role="Legal Expert">
      <button onClick={() => navigate('/legal-expert/cases')} className="flex items-center gap-2 text-[#64748B] hover:text-[#0A1F44] transition-colors mb-6">
        <ArrowLeft className="w-5 h-5" />
        Back to Case References
      </button>

      <div className="mb-8">
        <h1 className="text-3xl text-[#0A1F44] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Add New Case Reference
        </h1>
        <p className="text-[#64748B]">Document important constitutional case law</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass-white rounded-xl p-8 border border-[#138808]/10">
        <form onSubmit={(e) => handleSubmit(e, 'published')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm text-[#0A1F44] mb-2">Case Title *</label>
              <input type="text" id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Kesavananda Bharati v. State of Kerala" className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#138808]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138808] focus:border-transparent" required />
            </div>
            <div>
              <label htmlFor="year" className="block text-sm text-[#0A1F44] mb-2">Year *</label>
              <input type="number" id="year" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} placeholder="e.g., 1973" min="1900" max={new Date().getFullYear()} className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#138808]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138808] focus:border-transparent" required />
            </div>
            <div>
              <label htmlFor="citation" className="block text-sm text-[#0A1F44] mb-2">Citation *</label>
              <input type="text" id="citation" value={formData.citation} onChange={(e) => setFormData({ ...formData, citation: e.target.value })} placeholder="e.g., AIR 1973 SC 1461" className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#138808]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138808] focus:border-transparent" required />
            </div>
            <div>
              <label htmlFor="court" className="block text-sm text-[#0A1F44] mb-2">Court *</label>
              <select id="court" value={formData.court} onChange={(e) => setFormData({ ...formData, court: e.target.value })} className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#138808]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138808] focus:border-transparent cursor-pointer" required>
                <option value="">Select court</option>
                {courts.map((court) => <option key={court} value={court}>{court}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm text-[#0A1F44] mb-2">Case Type *</label>
              <select id="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#138808]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138808] focus:border-transparent cursor-pointer" required>
                <option value="">Select type</option>
                {caseTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="judgeName" className="block text-sm text-[#0A1F44] mb-2">Presiding Judge(s)</label>
            <input type="text" id="judgeName" value={formData.judgeName} onChange={(e) => setFormData({ ...formData, judgeName: e.target.value })} placeholder="e.g., Justice S.M. Sikri, Chief Justice" className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#138808]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138808] focus:border-transparent" />
          </div>

          <div className="mb-6">
            <label htmlFor="significance" className="block text-sm text-[#0A1F44] mb-2">Legal Significance *</label>
            <input type="text" id="significance" value={formData.significance} onChange={(e) => setFormData({ ...formData, significance: e.target.value })} placeholder="e.g., Basic Structure Doctrine" className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#138808]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138808] focus:border-transparent" required />
          </div>

          <div className="mb-6">
            <label htmlFor="articles" className="block text-sm text-[#0A1F44] mb-2">Relevant Constitutional Articles *</label>
            <div className="flex gap-2 mb-3">
              <input type="text" id="articles" value={articleInput} onChange={(e) => setArticleInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArticle())} placeholder="e.g., Article 368" className="flex-1 px-4 py-3 bg-[#F8FAFC] border border-[#138808]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138808] focus:border-transparent" />
              <button type="button" onClick={handleAddArticle} className="px-6 py-3 bg-[#138808] text-white rounded-lg hover:bg-[#1ea712] transition-colors">Add</button>
            </div>
            {formData.relevantArticles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.relevantArticles.map((article, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#138808]/10 text-[#138808] rounded-full text-sm flex items-center gap-2">
                    {article}
                    <button type="button" onClick={() => handleRemoveArticle(article)} className="hover:text-red-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="summary" className="block text-sm text-[#0A1F44] mb-2">Case Summary *</label>
            <textarea id="summary" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} placeholder="Provide a comprehensive summary of the case..." rows="8" className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#138808]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138808] focus:border-transparent resize-vertical" required />
          </div>

          <div className="mb-8">
            <label htmlFor="pdfUrl" className="block text-sm text-[#0A1F44] mb-2">Full Judgment PDF URL (Optional)</label>
            <input type="url" id="pdfUrl" value={formData.pdfUrl} onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })} placeholder="https://example.com/judgment.pdf" className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#138808]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138808] focus:border-transparent" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button type="button" onClick={(e) => handleSubmit(e, 'draft')} className="flex-1 px-6 py-3 bg-[#F8FAFC] text-[#0A1F44] border border-[#138808]/20 rounded-lg hover:bg-[#138808]/5 transition-all flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Save as Draft
            </button>
            <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-[#138808] to-[#1ea712] text-white rounded-lg hover:shadow-lg transition-all hover-lift flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              Add Case Reference
            </button>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}
