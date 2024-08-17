export default function getMesoDayLabels(mesoWeek) {
  return mesoWeek.days.map(day => day.label);
}
