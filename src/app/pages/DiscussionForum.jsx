import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import {
  ArrowLeft, MessageSquare, MessageCircle, User,
  Clock, Plus, Search, X
} from 'lucide-react';
import { apiGet, apiPost } from '../utils/api';

export default function DiscussionForum() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedThread, setExpandedThread] = useState(null);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [threads, setThreads] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [newDiscussion, setNewDiscussion] = useState({
    name: '',
    profession: '',
    title: '',
    content: '',
    category: 'general'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadThreads = async (category = selectedCategory) => {
    try {
      const path = category && category !== 'all'
        ? `/forum/topics?category=${encodeURIComponent(category)}`
        : '/forum/topics';
      setThreads(await apiGet(path));
    } catch (error) {
      console.error('Error loading forum topics:', error);
    }
  };

  useEffect(() => {
    loadThreads(selectedCategory);
  }, [selectedCategory]);

  const categories = [
    { id: 'all', label: 'All Discussions' },
    { id: 'rights', label: 'Fundamental Rights' },
    { id: 'duties', label: 'Fundamental Duties' },
    { id: 'amendments', label: 'Amendments' },
    { id: 'general', label: 'General' },
  ];

  const filteredThreads = threads.filter((thread) =>
    !searchTerm.trim() ||
    thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitDiscussion = async (e) => {
    e.preventDefault();
    await apiPost('/forum/topics', {
      title: newDiscussion.title,
      content: newDiscussion.content,
      category: newDiscussion.category,
      guestName: newDiscussion.name,
      guestProfession: newDiscussion.profession,
    });
    setNewDiscussion({
      name: '',
      profession: '',
      title: '',
      content: '',
      category: 'general'
    });
    setShowNewDiscussion(false);
    await loadThreads(selectedCategory);
  };

  const handleReply = async (threadId) => {
    const content = replyText[threadId];
    if (!content?.trim()) return;
    await apiPost(`/forum/topics/${threadId}/replies`, {
      content,
      guestName: 'Community Member'
    });
    setReplyText((prev) => ({ ...prev, [threadId]: '' }));
    await loadThreads(selectedCategory);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-[#64748B] hover:text-[#0A1F44] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <button onClick={() => setShowNewDiscussion(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#0A1F44] text-white rounded-lg hover:bg-[#1A3A6B] transition-all">
              <Plus className="w-5 h-5" />
              New Discussion
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-5xl text-[#0A1F44] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            Discussion Forum
          </h1>
          <p className="text-lg text-[#64748B]">Engage with fellow citizens, share insights, and learn together</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] sticky top-6">
              <h3 className="text-lg text-[#0A1F44] mb-4" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm ${selectedCategory === category.id ? 'bg-[#FF9933] text-white font-medium' : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#FF9933]/10 hover:text-[#FF9933]'}`}>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search discussions..." className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent text-[#0A1F44] placeholder:text-[#94A3B8]" />
              </div>
            </div>

            <div className="space-y-4">
              {filteredThreads.map((thread) => (
                <div key={thread.id} className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all cursor-pointer" onClick={() => setExpandedThread(expandedThread === thread.id ? null : thread.id)}>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9933] to-[#0A1F44] flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg text-[#0A1F44] font-medium hover:text-[#FF9933] transition-colors">{thread.title}</h3>
                      </div>

                      <p className="text-[#64748B] text-sm mb-4 line-clamp-2">{thread.content}</p>

                      <div className="flex items-center gap-4 text-sm text-[#64748B]">
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          {thread.authorName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {new Date(thread.createdAt).toLocaleString()}
                        </span>
                        <button className="flex items-center gap-1.5 hover:text-[#FF9933] transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          {thread.repliesCount} replies
                        </button>
                      </div>

                      <AnimatePresence>
                        {expandedThread === thread.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mt-4 pt-4 border-t border-[#E2E8F0]">
                            <textarea
                              placeholder="Write your reply..."
                              rows="3"
                              value={replyText[thread.id] || ''}
                              onChange={(e) => setReplyText((prev) => ({ ...prev, [thread.id]: e.target.value }))}
                              className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent mb-3 text-[#0A1F44] placeholder:text-[#94A3B8]"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button className="px-6 py-2 bg-[#0A1F44] text-white rounded-lg hover:bg-[#1A3A6B] transition-all text-sm font-medium" onClick={(e) => { e.stopPropagation(); handleReply(thread.id); }}>
                              Post Reply
                            </button>
                            {thread.replies?.length > 0 && (
                              <div className="mt-4 space-y-3">
                                {thread.replies.map((reply) => (
                                  <div key={reply.id} className="bg-[#F8FAFC] rounded-lg p-3">
                                    <p className="text-sm text-[#0A1F44]">{reply.content}</p>
                                    <p className="text-xs text-[#64748B] mt-2">{reply.authorName} • {new Date(reply.createdAt).toLocaleString()}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredThreads.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-[#E2E8F0]">
                <MessageSquare className="w-16 h-16 text-[#CBD5E1] mx-auto mb-4" />
                <h3 className="text-xl text-[#0A1F44] mb-2 font-medium">No discussions found</h3>
                <p className="text-[#64748B]">Be the first to start a discussion in this category!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showNewDiscussion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-[#0A1F44]/80 backdrop-blur-sm" onClick={() => setShowNewDiscussion(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3 }} className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-8 py-6 flex items-center justify-between rounded-t-2xl z-10">
                <div>
                  <h2 className="text-3xl text-[#0A1F44]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>New Discussion</h2>
                  <p className="text-sm text-[#64748B] mt-1">Share your thoughts with the community</p>
                </div>
                <button onClick={() => setShowNewDiscussion(false)} className="w-10 h-10 rounded-full hover:bg-[#F8FAFC] flex items-center justify-center transition-colors">
                  <X className="w-6 h-6 text-[#64748B]" />
                </button>
              </div>

              <form onSubmit={handleSubmitDiscussion} className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-[#0A1F44] mb-2 font-medium">Your Name <span className="text-[#FF9933]">*</span></label>
                    <input type="text" required value={newDiscussion.name} onChange={(e) => setNewDiscussion({ ...newDiscussion, name: e.target.value })} placeholder="Enter your full name" className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent text-[#0A1F44] placeholder:text-[#94A3B8]" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#0A1F44] mb-2 font-medium">Profession <span className="text-[#FF9933]">*</span></label>
                    <input type="text" required value={newDiscussion.profession} onChange={(e) => setNewDiscussion({ ...newDiscussion, profession: e.target.value })} placeholder="e.g., Student, Lawyer, Teacher" className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent text-[#0A1F44] placeholder:text-[#94A3B8]" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#0A1F44] mb-2 font-medium">Category <span className="text-[#FF9933]">*</span></label>
                    <select required value={newDiscussion.category} onChange={(e) => setNewDiscussion({ ...newDiscussion, category: e.target.value })} className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent text-[#0A1F44]">
                      <option value="general">General</option>
                      <option value="rights">Fundamental Rights</option>
                      <option value="duties">Fundamental Duties</option>
                      <option value="amendments">Amendments</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#0A1F44] mb-2 font-medium">Discussion Title <span className="text-[#FF9933]">*</span></label>
                    <input type="text" required value={newDiscussion.title} onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })} placeholder="Enter a descriptive title" className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent text-[#0A1F44] placeholder:text-[#94A3B8]" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#0A1F44] mb-2 font-medium">Discussion Content <span className="text-[#FF9933]">*</span></label>
                    <textarea required value={newDiscussion.content} onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })} placeholder="Share your thoughts, questions, or insights..." rows="6" className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent resize-none text-[#0A1F44] placeholder:text-[#94A3B8]" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-[#E2E8F0]">
                  <button type="button" onClick={() => setShowNewDiscussion(false)} className="px-6 py-3 text-[#64748B] hover:text-[#0A1F44] transition-colors font-medium">Cancel</button>
                  <button type="submit" className="px-8 py-3 bg-gradient-to-r from-[#0A1F44] to-[#1A3A6B] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium">
                    <MessageSquare className="w-5 h-5" />
                    Post Discussion
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
