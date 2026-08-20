import { useState, useEffect } from 'react';
import { get, post, del } from '../lib/api';

export const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(null);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await get('/chat/conversations');
      // The backend returns paginated data inside res.data.data.items or directly in res.data.data
      setConversations(res.data.data.items || res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async () => {
    const res = await post('/chat/conversations', { title: "New Conversation" });
    const newConv = res.data.data;
    setConversations(prev => [newConv, ...prev]);
    return newConv;
  };

  const loadMessages = async (conversationId) => {
    setLoading(true);
    setCurrentConversation(conversationId);
    try {
      const res = await get(`/chat/conversations/${conversationId}`);
      // Assuming backend returns { data: { conversation: {...}, messages: [...] } }
      setMessages(res.data.data.messages || []);
    } catch (e) {
      console.error(e);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (conversationId, message) => {
    const tempId = Date.now().toString();
    const newMsg = { id: tempId, role: 'user', content: message };
    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    try {
      const res = await post(`/chat/conversations/${conversationId}/messages`, { message });
      const { user_message, assistant_message } = res.data.data;
      setMessages(prev => prev.map(m => m.id === tempId ? { ...user_message, content: user_message.message } : m));
      setMessages(prev => [...prev, { ...assistant_message, content: assistant_message.message }]);
      // Refresh conversations so the updated title immediately reflects in sidebar
      loadConversations();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };


  const deleteConversation = async (id) => {
    try {
      await del(`/chat/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversation === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const clearMessages = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  return {
    conversations,
    messages,
    loading,
    currentConversation,
    loadConversations,
    createConversation,
    loadMessages,
    sendMessage,
    deleteConversation,
    clearMessages
  };
};
