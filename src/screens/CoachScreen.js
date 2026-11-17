import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useHabits } from '../context/HabitContext';
import { useTheme } from '../context/ThemeContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getTodayLocal } from '../utils/dateUtils';

// Note: In production, use environment variables or secure storage for API keys
const GEMINI_API_KEY = 'AIzaSyB9dCB6CoausMFhOqiajvOCC7S0lGPd838';

const CoachScreen = () => {
  const { habits, logs, addHabit } = useHabits();
  const { colors } = useTheme();
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Xin chào! Tôi là AI Coach của bạn. Tôi có thể giúp bạn:\n\n• Tạo thói quen mới từ mô tả tự nhiên\n• Phân tích tiến độ của bạn\n• Đưa ra lời khuyên cải thiện\n• Trả lời câu hỏi về thói quen\n\nBạn muốn tôi giúp gì?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();

  const generateResponse = async (userMessage) => {
    // Create context about user's habits
    const habitsSummary = habits.map(h => `- ${h.name} (${h.icon})`).join('\n');
    const completedToday = logs.filter(
      l => l.date === getTodayLocal() && l.completed
    ).length;
    
    const context = `
User has ${habits.length} habits:
${habitsSummary}

Completed ${completedToday} habits today.

User message: ${userMessage}

You are a helpful habit tracking coach. Provide concise, motivating advice in Vietnamese.
If user asks to create a habit or you suggest a habit, format your response with a special marker:
At the end of your response, if suggesting a habit, add exactly:
[SUGGEST_HABIT:name:icon:group:goalType:goalValue]

Where:
- name: habit name
- icon: emoji (single emoji)
- group: category (Sức khỏe, Học tập, Công việc, Cá nhân, Thể dục, Tinh thần, Khác)
- goalType: times_per_day or times_per_week
- goalValue: number (default 1)

Example: [SUGGEST_HABIT:Tập thể dục:💪:Thể dục:times_per_day:1]
`;

    // Simple rule-based responses (fallback if no API key)
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return generateFallbackResponse(userMessage);
    }

    // Try gemini-2.5-flash
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(context);
      const response = await result.response;
      return response.text();
    } catch (error) {
      // Try other models as fallback
      const fallbackModels = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
      for (const modelName of fallbackModels) {
        try {
          const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(context);
          const response = await result.response;
          return response.text();
        } catch (fallbackError) {
          // Continue to next model
        }
      }
      // All models failed, use fallback response
      return generateFallbackResponse(userMessage);
    }
  };

  // Parse habit suggestion from AI response
  const parseHabitSuggestion = (text) => {
    const match = text.match(/\[SUGGEST_HABIT:(.+?):(.+?):(.+?):(.+?):(.+?)\]/);
    if (match) {
      return {
        name: match[1].trim(),
        icon: match[2].trim(),
        group: match[3].trim(),
        goalType: match[4].trim() || 'times_per_day',
        goalValue: parseInt(match[5].trim()) || 1,
      };
    }
    
    // Fallback: try to extract from natural language
    const lower = text.toLowerCase();
    if (lower.includes('tập thể dục') || lower.includes('thể dục')) {
      return {
        name: 'Tập thể dục',
        icon: '💪',
        group: 'Thể dục',
        goalType: 'times_per_day',
        goalValue: 1,
      };
    }
    if (lower.includes('đọc sách') || lower.includes('đọc')) {
      return {
        name: 'Đọc sách',
        icon: '📚',
        group: 'Học tập',
        goalType: 'times_per_day',
        goalValue: 1,
      };
    }
    if (lower.includes('uống nước') || lower.includes('nước')) {
      return {
        name: 'Uống nước',
        icon: '💧',
        group: 'Sức khỏe',
        goalType: 'times_per_day',
        goalValue: 8,
      };
    }
    
    return null;
  };

  const handleAddHabit = (suggestion) => {
    if (!suggestion) return;
    
    const today = getTodayLocal();
    const newHabit = {
      name: suggestion.name,
      icon: suggestion.icon,
      group: suggestion.group,
      goalType: suggestion.goalType,
      goalValue: suggestion.goalValue,
      reminderTime: '',
      startDate: today,
      endDate: today,
      difficulty: 3,
      active: true,
    };
    
    addHabit(newHabit);
    Alert.alert('Thành công', `Đã thêm thói quen "${suggestion.name}" vào danh sách cho ngày hôm nay!`);
  };

  const generateFallbackResponse = (userMessage) => {
    const lower = userMessage.toLowerCase();
    
    // Detect habit creation intent
    if (lower.includes('tạo') || lower.includes('thêm') || lower.includes('habit mới')) {
      return `Tôi có thể giúp bạn tạo thói quen mới! Dựa vào tin nhắn của bạn, tôi đề xuất:\n\n💪 Tập thể dục buổi sáng\nMục tiêu: 1 lần/ngày\nNhóm: Thể dục\n\n[SUGGEST_HABIT:Tập thể dục buổi sáng:💪:Thể dục:times_per_day:1]`;
    }
    
    if (lower.includes('tiến độ') || lower.includes('thống kê')) {
      const completedToday = logs.filter(
        l => l.date === getTodayLocal() && l.completed
      ).length;
      return `📊 Tiến độ của bạn:\n\n• Tổng số thói quen: ${habits.length}\n• Hoàn thành hôm nay: ${completedToday}/${habits.length}\n• Tổng số log: ${logs.length}\n\n${completedToday >= habits.length * 0.8 ? '🎉 Tuyệt vời! Bạn đang làm rất tốt!' : '💪 Hãy tiếp tục cố gắng!'}`;
    }
    
    if (lower.includes('lời khuyên') || lower.includes('gợi ý') || lower.includes('cải thiện')) {
      return `💡 Lời khuyên từ Coach:\n\n1. Bắt đầu nhỏ - Đừng cố gắng thay đổi mọi thứ cùng lúc\n2. Nhất quán - Làm điều đó cùng thời điểm mỗi ngày\n3. Theo dõi tiến độ - Xem lịch và thống kê thường xuyên\n4. Tự thưởng - Khen thưởng bản thân khi đạt mốc\n5. Linh hoạt - Nếu bỏ lỡ một ngày, hãy quay lại ngày hôm sau\n\nBạn có thắc mắc gì không?`;
    }
    
    if (lower.includes('khó khăn') || lower.includes('khó') || lower.includes('không thể')) {
      return `Tôi hiểu việc duy trì thói quen có thể khó khăn. Đây là những điều bạn có thể thử:\n\n• Giảm mục tiêu xuống - Bắt đầu với 5 phút thay vì 30 phút\n• Liên kết với thói quen có sẵn - Ví dụ: "Sau khi đánh răng, tôi sẽ..."\n• Tạo môi trường thuận lợi - Chuẩn bị mọi thứ sẵn sàng\n• Tìm người đồng hành - Làm cùng bạn bè hoặc gia đình\n\nBạn gặp khó khăn với thói quen nào cụ thể?`;
    }
    
    if (lower.includes('động lực') || lower.includes('motivation')) {
      return `🔥 Nhớ rằng:\n\n"Sự hoàn hảo không đạt được trong một ngày. Mỗi ngày bạn thực hiện thói quen tốt là một bước tiến về phía trước."\n\n${habits.length > 0 ? `Bạn đã có ${habits.length} thói quen. Điều đó cho thấy bạn đang cam kết với sự phát triển bản thân. Tuyệt vời! 🌟` : 'Hãy bắt đầu với thói quen đầu tiên của bạn ngay hôm nay! 💪'}`;
    }
    
    // Default response
    return `Cảm ơn câu hỏi của bạn! Tôi có thể giúp bạn với:\n\n• Tạo thói quen mới\n• Phân tích tiến độ\n• Đưa ra lời khuyên\n• Giải đáp thắc mắc\n\nHãy hỏi tôi về một trong những chủ đề trên nhé!`;
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Generate AI response
    let responseText = await generateResponse(userMessage.text);
    
    // Clean up markdown formatting for better display
    responseText = responseText.replace(/\*\*\*/g, '').replace(/\*\*/g, '').replace(/\*/g, '');
    
    // Parse habit suggestion from response
    const habitSuggestion = parseHabitSuggestion(responseText);
    const cleanText = habitSuggestion ? responseText.replace(/\[SUGGEST_HABIT:.*?\]/g, '').trim() : responseText;
    
    const botMessage = {
      id: (Date.now() + 1).toString(),
      text: cleanText,
      sender: 'bot',
      timestamp: new Date(),
      habitSuggestion: habitSuggestion,
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={[styles.quickActionsTitle, { color: colors.textSecondary }]}>Hành động nhanh:</Text>
      <View style={styles.quickActionsButtons}>
        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={() => setInputText('Tạo thói quen tập thể dục cho tôi')}
        >
          <Text style={[styles.quickActionText, { color: colors.primary }]}>💪 Tạo thói quen tập thể dục</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={() => setInputText('Phân tích tiến độ của tôi')}
        >
          <Text style={[styles.quickActionText, { color: colors.primary }]}>📊 Xem tiến độ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={() => setInputText('Cho tôi lời khuyên cải thiện')}
        >
          <Text style={[styles.quickActionText, { color: colors.primary }]}>💡 Lời khuyên</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={() => setInputText('Làm sao để có động lực?')}
        >
          <Text style={[styles.quickActionText, { color: colors.primary }]}>🔥 Động lực</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.screenBackground }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>🤖 AI Coach</Text>
        <Text style={[styles.headerSubtitle, { color: colors.headerText }]}>Trợ lý thông minh của bạn</Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View key={message.id}>
            <View
              style={[
                styles.messageBubble,
                message.sender === 'user' ? [styles.userBubble, { backgroundColor: colors.primary }] : [styles.botBubble, { backgroundColor: colors.cardBackground }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.sender === 'user' ? { color: '#fff' } : { color: colors.text },
                ]}
              >
                {message.text}
              </Text>
              <Text style={[styles.messageTime, { color: colors.textSecondary }]}>
                {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            {message.sender === 'bot' && message.habitSuggestion && (
              <View style={[styles.suggestionCard, { backgroundColor: colors.cardBackground, borderLeftColor: colors.primary }]}>
                <TouchableOpacity 
                  style={[styles.suggestionItem, { backgroundColor: colors.background }]}
                  onPress={() => handleAddHabit(message.habitSuggestion)}
                >
                  <Text style={styles.suggestionIcon}>{message.habitSuggestion.icon}</Text>
                  <View style={styles.suggestionInfo}>
                    <Text style={[styles.suggestionText, { color: colors.text }]}>{message.habitSuggestion.name}</Text>
                    <Text style={[styles.suggestionCategory, { color: colors.textSecondary }]}>{message.habitSuggestion.group}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleAddHabit(message.habitSuggestion)}
                  >
                    <Text style={styles.addButtonText}>+</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
        
        {isLoading && (
          <View style={[styles.messageBubble, styles.botBubble, { backgroundColor: colors.cardBackground }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Đang suy nghĩ...</Text>
          </View>
        )}

        {messages.length <= 1 && renderQuickActions()}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder="Nhập câu hỏi hoặc yêu cầu..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingText: {
    fontSize: 13,
    marginTop: 4,
  },
  quickActionsContainer: {
    marginTop: 20,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActionsButtons: {
    gap: 8,
  },
  quickActionBtn: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  suggestionCard: {
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 16,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  suggestionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionCategory: {
    fontSize: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CoachScreen;
