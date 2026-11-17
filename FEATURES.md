# 📋 Tài liệu Tính năng Chi tiết

## 🎯 Tổng quan

Habit Tracker là ứng dụng hoàn chỉnh giúp người dùng xây dựng và duy trì thói quen tốt với giao diện đẹp, trực quan và nhiều tính năng thông minh.

---

## 📱 Các Màn hình

### 1. 📅 Today Screen (Màn hình Hôm nay)

**Mục đích:** Màn hình chính để check-in nhanh các thói quen trong ngày

**Tính năng:**
- ✅ Hiển thị danh sách thói quen active
- ✅ Check-in nhanh bằng 1 tap
- ✅ Hiển thị tỷ lệ hoàn thành hôm nay (%)
- ✅ Thông báo động viên theo tiến độ
- ✅ Pull-to-refresh
- ✅ Empty state khi chưa có thói quen
- ✅ Mẹo nhỏ (tips) cho người dùng
- ✅ Hiển thị ngày và thứ bằng tiếng Việt

**UI Components:**
- Header với gradient màu xanh
- Stats card với progress circle
- Danh sách HabitCard
- Tips card màu vàng nhạt

**Data displayed:**
- Tên thói quen + icon
- Mục tiêu (lần/ngày hoặc lần/tuần)
- Thời gian nhắc nhở
- Trạng thái hoàn thành (checkbox)

---

### 2. 📋 Habits Screen (Quản lý Thói quen)

**Mục đích:** CRUD và quản lý tất cả thói quen

**Tính năng:**
- ✅ Danh sách thói quen với grouping
- ✅ Tìm kiếm real-time
- ✅ Filter: Tất cả / Đang hoạt động / Tạm dừng
- ✅ Sửa thói quen
- ✅ Xóa thói quen (với confirmation)
- ✅ Navigation tới Edit screen
- ✅ Stats footer: Tổng số / Active / Nhóm
- ✅ Empty state

**UI Components:**
- Header với button "Thêm mới"
- Search bar
- Filter buttons
- Grouped list với section headers
- Stats footer cố định

**Interactions:**
- Tap card → Show detail (future)
- Tap ✏️ → Edit screen
- Tap 🗑️ → Confirm delete dialog
- Search → Real-time filter

---

### 3. ✏️ Habit Edit Screen (Tạo/Sửa Thói quen)

**Mục đích:** Form đầy đủ để tạo hoặc chỉnh sửa thói quen

**Tính năng:**
- ✅ Tên thói quen (required)
- ✅ Chọn icon từ 14 emoji
- ✅ Chọn màu từ 10 màu sẵn
- ✅ Chọn nhóm (7 categories)
- ✅ Đặt mục tiêu: mỗi ngày / mỗi tuần
- ✅ Số lần mục tiêu (input number)
- ✅ Thời gian nhắc nhở (text input HH:mm)
- ✅ Ngày bắt đầu & kết thúc
- ✅ Độ khó (1-5 stars)
- ✅ Toggle Active/Inactive
- ✅ Validation tên thói quen
- ✅ Success alert sau khi lưu

**UI Components:**
- ScrollView form
- Icon grid (7 icons x 2 rows)
- Color picker grid
- Group selector (pills)
- Goal type toggle
- Star rating picker
- Switch toggle
- Save & Cancel buttons

**Icons available:**
🌱 💪 📚 🏃 🧘 💧 🎯 ✍️ 🎨 🍎 😴 🧠 ❤️ ⭐

**Colors available:**
Blue, Pink, Purple, Deep Purple, Indigo, Cyan, Teal, Green, Orange, Deep Orange

**Groups:**
- Sức khỏe (Health)
- Học tập (Study)
- Công việc (Work)
- Cá nhân (Personal)
- Thể dục (Exercise)
- Tinh thần (Mental)
- Khác (Other)

---

### 4. 📆 Calendar Screen (Lịch & Heatmap)

**Mục đích:** Xem lịch sử hoàn thành trực quan theo tháng

**Tính năng:**
- ✅ Calendar view theo tháng
- ✅ Heatmap với 5 màu theo tỷ lệ
- ✅ Navigation tháng trước/sau
- ✅ Tap ngày để xem chi tiết
- ✅ Legend giải thích màu sắc
- ✅ Detail section cho ngày đã chọn
- ✅ Monthly stats:
  - Ngày hoàn hảo (100%)
  - Ngày có hoạt động
  - Tỷ lệ thực hiện tháng
- ✅ Hiển thị mini count (x/y) trên mỗi ngày

**Heatmap Colors:**
- `#f0f0f0` - Không hoàn thành (0%)
- `#ffcccc` - < 33%
- `#ffaa88` - 33-66%
- `#88ccff` - 66-99%
- `#4caf50` - Hoàn hảo (100%)

**UI Components:**
- Month selector với arrows
- Calendar grid 7x6
- Legend với color boxes
- Selected date details
- Monthly stats cards

---

### 5. 📊 Insights Screen (Thống kê & Phân tích)

**Mục đích:** Hiển thị insights và analytics chi tiết

**Tính năng:**
- ✅ Time range selector: 7 ngày / 30 ngày / 1 năm
- ✅ Overall stats cards:
  - Tổng hoàn thành
  - Tỷ lệ hoàn thành (%)
  - Số thói quen
- ✅ Best habit card (thói quen xuất sắc nhất)
- ✅ Weekly pattern bar chart
- ✅ All habits performance ranking
- ✅ Streak calculation (chuỗi ngày liên tiếp)
- ✅ Motivational message dựa vào completion rate
- ✅ Progress bars cho từng thói quen

**Charts:**
1. **Bar Chart** - Tỷ lệ hoàn thành theo ngày trong tuần
   - 7 bars (CN - T7)
   - Color coded: Green (≥80%), Orange (≥50%), Red (<50%)
   - Height theo tỷ lệ %

**Algorithms:**
- **Streak calculation:** Đếm số ngày liên tiếp hoàn thành
- **Best habit:** Habit có completion rate cao nhất
- **Weekly pattern:** Group logs theo day of week

**UI Components:**
- Time range buttons
- Stat cards with big numbers
- Best habit card (gold border)
- Custom bar chart component
- Habit performance list
- Streak cards
- Motivation card (blue background)

---

### 6. 🤖 Coach Screen (AI Chatbot)

**Mục đích:** Trợ lý AI để tư vấn và hỗ trợ người dùng

**Tính năng:**
- ✅ Chat interface với bubble messages
- ✅ User messages (right, blue)
- ✅ Bot messages (left, white)
- ✅ Quick action buttons
- ✅ Auto-scroll khi có message mới
- ✅ Loading indicator khi AI đang xử lý
- ✅ Keyboard avoiding view
- ✅ Send button disabled khi empty
- ✅ Timestamp cho mỗi message

**AI Capabilities:**
- ✅ Tạo gợi ý thói quen mới
- ✅ Phân tích tiến độ người dùng
- ✅ Đưa ra lời khuyên cải thiện
- ✅ Trả lời câu hỏi về thói quen
- ✅ Động viên và tăng động lực
- ✅ Fallback responses (không cần API key)

**Quick Actions:**
- 💪 Tạo thói quen tập thể dục
- 📊 Xem tiến độ
- 💡 Lời khuyên
- 🔥 Động lực

**AI Integration:**
- Google Gemini API (optional)
- Rule-based fallback system
- Context-aware responses
- Uses habit data for personalization

**Fallback Rules:**
- Keyword detection (tạo, tiến độ, lời khuyên, khó khăn, động lực)
- Pre-written responses cho các chủ đề chính
- Luôn phản hồi bằng tiếng Việt

---

## 🗂️ Data Models

### Habit Model
```javascript
{
  id: string,
  name: string,
  goalType: 'times_per_day' | 'times_per_week',
  goalValue: number,
  reminderTime: string, // 'HH:mm'
  startDate: string, // 'YYYY-MM-DD'
  endDate: string, // optional
  difficulty: number, // 1-5
  color: string, // hex
  icon: string, // emoji
  group: string,
  active: boolean,
  createdAt: string,
  updatedAt: string
}
```

### HabitLog Model
```javascript
{
  id: string,
  habitId: string,
  date: string, // 'YYYY-MM-DD'
  times: number,
  memo: string,
  completed: boolean,
  mood: string,
  createdAt: string
}
```

---

## 🔄 State Management

**Context API** được sử dụng cho global state

### HabitContext

**State:**
- `habits: Habit[]`
- `logs: HabitLog[]`

**Methods:**
- `addHabit(habit)` - Thêm thói quen mới
- `updateHabit(habit)` - Cập nhật thói quen
- `removeHabit(id)` - Xóa thói quen
- `addLog(log)` - Thêm log/check-in
- `updateLog(log)` - Cập nhật log
- `removeLog(id)` - Xóa log
- `getLogs(habitId, date?)` - Lấy logs của habit
- `getDayLogs(date)` - Lấy tất cả logs của ngày
- `getLogsInRange(start, end)` - Lấy logs trong khoảng
- `exportData()` - Export JSON
- `importData(json)` - Import JSON

**Persistence:**
- Auto-save to AsyncStorage on every change
- Auto-load from AsyncStorage on app start
- Key: `habit_data`

---

## 🎨 Design System

### Colors
- **Primary:** `#1976d2` (Blue)
- **Success:** `#4caf50` (Green)
- **Warning:** `#ff9800` (Orange)
- **Error:** `#f44336` (Red)
- **Background:** `#f8f9fc` (Light gray-blue)
- **Card:** `#ffffff` (White)
- **Text Primary:** `#333333`
- **Text Secondary:** `#666666`
- **Text Disabled:** `#999999`
- **Border:** `#e0e0e0`

### Typography
- **Header:** 24px, bold
- **Title:** 18-21px, semi-bold
- **Body:** 14-16px, regular
- **Caption:** 11-13px, regular

### Spacing
- **Small:** 4-8px
- **Medium:** 12-16px
- **Large:** 20-24px

### Border Radius
- **Small:** 6-8px
- **Medium:** 10-12px
- **Large:** 16-20px
- **Circle:** 50%

### Shadows
```javascript
shadowColor: '#000',
shadowOpacity: 0.05-0.1,
shadowRadius: 4-8,
shadowOffset: { width: 0, height: 2-4 },
elevation: 2-5, // Android
```

---

## 🔐 Privacy & Security

- ✅ Tất cả dữ liệu lưu local (AsyncStorage)
- ✅ Không thu thập dữ liệu cá nhân
- ✅ Không yêu cầu đăng nhập
- ✅ API key cho AI Coach không được commit
- ✅ Export/Import để backup thủ công

---

## 🚀 Performance

### Optimizations
- ✅ FlatList cho danh sách dài
- ✅ Memoization cho expensive calculations
- ✅ Debounce cho search input
- ✅ Lazy loading cho images
- ✅ AsyncStorage batch operations

### Bundle Size
- Expo app: ~30-50MB
- Dependencies được optimize
- No unused libraries

---

## 🧪 Testing Scenarios

### Manual Test Cases

**1. Tạo thói quen:**
- [ ] Tạo với tất cả fields
- [ ] Tạo với minimum fields
- [ ] Validation: không cho submit khi thiếu tên
- [ ] Chọn icon, màu, nhóm
- [ ] Success alert hiển thị

**2. Check-in:**
- [ ] Check thói quen → màu xanh
- [ ] Uncheck thói quen → trở lại xám
- [ ] Stats cập nhật real-time
- [ ] Log được lưu với date đúng

**3. Calendar:**
- [ ] Navigate tháng trước/sau
- [ ] Heatmap hiển thị đúng màu
- [ ] Tap ngày → detail cập nhật
- [ ] Monthly stats chính xác

**4. Insights:**
- [ ] Switch time range → data update
- [ ] Bar chart render đúng
- [ ] Best habit hiển thị đúng
- [ ] Streak tính toán chính xác

**5. Coach:**
- [ ] Send message → bot reply
- [ ] Quick actions work
- [ ] Scroll to bottom auto
- [ ] Fallback works without API key

---

## 🔮 Future Enhancements

### Phase 2 (Planned)
- [ ] Push notifications
- [ ] Cloud sync
- [ ] Dark mode toggle
- [ ] Multi-language
- [ ] Habit templates
- [ ] Social features

### Phase 3 (Ideas)
- [ ] Widgets
- [ ] Apple Watch / Wear OS
- [ ] Gamification
- [ ] Achievements/Badges
- [ ] Community challenges
- [ ] Habit recommendations based on ML

---

**Document Version:** 1.0
**Last Updated:** October 30, 2025

