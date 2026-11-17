export default class HabitLog {
  constructor({id, habitId, date, times=1, memo='', completed=false, mood='', createdAt}) {
    this.id = id || Date.now().toString() + Math.random().toString().slice(2,6);
    this.habitId = habitId;
    this.date = date; // 'YYYY-MM-DD'
    this.times = times;
    this.memo = memo;
    this.completed = completed;
    this.mood = mood;
    this.createdAt = createdAt || new Date().toISOString();
  }
}









