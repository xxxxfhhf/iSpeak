// pages/learn/quiz/quiz.js
const LearningData = require('../../../utils/learningData');

const PROGRESS_KEY = 'user_course_progress';

Page({
  data: {
    courseId: '',
    courseTitle: '',
    questions: [],
    currentIndex: 0,
    currentQuestion: {},
    total: 0,
    selectedIndex: -1,
    answers: [],
    showResult: false,
    score: 0,
    passed: false,
    wrongList: []
  },

  onLoad(options) {
    const courseId = options.courseId;
    const course = LearningData.getCourse(courseId);
    if (!course || !course.quiz || !course.quiz.length) {
      wx.showToast({ title: '暂无测验', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    this.setData({
      courseId,
      courseTitle: course.title,
      questions: course.quiz,
      total: course.quiz.length,
      currentQuestion: course.quiz[0],
      answers: new Array(course.quiz.length).fill(-1)
    });
    wx.setNavigationBarTitle({ title: '课程测验' });
  },

  onSelectOption(e) {
    this.setData({ selectedIndex: e.currentTarget.dataset.index });
  },

  onNext() {
    const { currentIndex, total, selectedIndex, answers, questions } = this.data;
    if (selectedIndex === -1) return;

    answers[currentIndex] = selectedIndex;

    if (currentIndex < total - 1) {
      this.setData({
        answers,
        currentIndex: currentIndex + 1,
        currentQuestion: questions[currentIndex + 1],
        selectedIndex: answers[currentIndex + 1] >= 0 ? answers[currentIndex + 1] : -1
      });
    } else {
      this.submitQuiz(answers);
    }
  },

  /** 计算得分并回写（80%及格） */
  submitQuiz(answers) {
    const { questions, courseId } = this.data;
    let correct = 0;
    const wrongList = [];

    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
      else wrongList.push({ q: q.q, correctText: q.options[q.answer] });
    });

    const score = Math.round(correct / questions.length * 100);
    const passed = score >= 80;

    const map = wx.getStorageSync(PROGRESS_KEY) || {};
    const prog = map[courseId] || {};
    map[courseId] = {
      ...prog,
      quizScore: score,
      isCompleted: passed && !!prog.isLearned,
      updatedAt: Date.now()
    };
    wx.setStorageSync(PROGRESS_KEY, map);

    this.setData({ showResult: true, score, passed, wrongList });
  },

  onRetry() {
    const { questions } = this.data;
    this.setData({
      showResult: false,
      currentIndex: 0,
      currentQuestion: questions[0],
      selectedIndex: -1,
      answers: new Array(questions.length).fill(-1),
      score: 0,
      passed: false,
      wrongList: []
    });
  },

  onBackCourse() {
    wx.navigateBack();
  }
});
