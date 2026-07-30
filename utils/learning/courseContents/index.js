/**
 * 课程正文汇总
 */
const l1 = require('./l1.js').COURSES;
const l2 = require('./l2.js').COURSES;
const l3 = require('./l3.js').COURSES;

const COURSES = [...l1, ...l2, ...l3];

function getCourse(id) {
  return COURSES.find(c => c.id === id);
}

function getCoursesByStage(stageId) {
  return COURSES.filter(c => c.stageId === stageId);
}

function searchCourses(keyword) {
  const kw = (keyword || '').trim().toLowerCase();
  if (!kw) return [];
  const match = (t) => (t || '').toLowerCase().includes(kw);
  return COURSES.filter(c =>
    match(c.title) || match(c.learnContent) || match(c.courseContent) || match(c.id)
  );
}

module.exports = { COURSES, getCourse, getCoursesByStage, searchCourses };
