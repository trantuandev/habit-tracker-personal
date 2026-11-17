export default class Habit {
  constructor({id, name, goalType, goalValue, reminderTime, startDate, endDate,
    difficulty, color, icon, group, active=true, createdAt, updatedAt}) {
    this.id = id || Date.now().toString();
    this.name = name;
    this.goalType = goalType; // "times_per_day", "times_per_week"
    this.goalValue = goalValue; // 1, 2, ...
    this.reminderTime = reminderTime; // "07:30"
    this.startDate = startDate; // "YYYY-MM-DD"
    this.endDate = endDate; // optional: "YYYY-MM-DD"
    this.difficulty = difficulty; // 1-5, hoặc 'easy','hard'
    this.color = color || '#1976d2';
    this.icon = icon || '🌱';
    this.group = group || '';
    this.active = active;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }
}





