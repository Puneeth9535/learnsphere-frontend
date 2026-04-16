const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Video = require('../models/Video');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/learnsphere';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Course.deleteMany({});
  await Module.deleteMany({});
  await Video.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: 'Admin User', email: 'admin@learnsphere.com',
    password: 'admin123', role: 'admin'
  });

  // Create instructor/student
  const student = await User.create({
    name: 'John Student', email: 'student@learnsphere.com',
    password: 'student123', role: 'student'
  });

  const sampleCourses = [
    { title: 'C Programming Masterclass', description: 'Learn C from scratch to advanced concepts', shortDescription: 'Master C programming with hands-on projects', instructor: 'Dr. Alex Johnson', category: 'Programming', level: 'Beginner', price: 49.99, thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400', rating: 4.8, totalRatings: 324, duration: '12h 30m', isPublished: true, isFree: false, tags: ['C', 'Programming', 'Systems'], whatYouLearn: ['C syntax and fundamentals', 'Pointers and memory management', 'File handling', 'Data structures in C'], requirements: ['Basic computer knowledge', 'No programming experience needed'] },
    { title: 'JavaScript Full Stack', description: 'Complete JavaScript from frontend to backend', shortDescription: 'Full stack web development with JavaScript', instructor: 'Sarah Williams', category: 'Web Development', level: 'Intermediate', price: 79.99, thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400', rating: 4.9, totalRatings: 892, duration: '24h 15m', isPublished: true, isFree: false, tags: ['JavaScript', 'Node.js', 'React'], whatYouLearn: ['JavaScript ES6+', 'React.js', 'Node.js & Express', 'MongoDB'], requirements: ['Basic HTML/CSS'] },
    { title: 'Python for Data Science', description: 'Python programming for data analysis and ML', shortDescription: 'Data science fundamentals with Python', instructor: 'Prof. Michael Chen', category: 'Data Science', level: 'Beginner', price: 59.99, thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400', rating: 4.7, totalRatings: 567, duration: '18h 45m', isPublished: true, isFree: false, tags: ['Python', 'Data Science', 'ML'], whatYouLearn: ['Python basics', 'NumPy & Pandas', 'Data visualization', 'ML basics'], requirements: ['No prior experience'] },
    { title: 'React.js Complete Guide', description: 'Build modern React applications from scratch', shortDescription: 'Master React.js with hooks and context', instructor: 'Emily Rodriguez', category: 'Web Development', level: 'Intermediate', price: 69.99, thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', rating: 4.8, totalRatings: 1203, duration: '20h 00m', isPublished: true, isFree: false, tags: ['React', 'JavaScript', 'Frontend'], whatYouLearn: ['React fundamentals', 'Hooks', 'Context API', 'React Router'], requirements: ['JavaScript knowledge required'] },
    { title: 'UI/UX Design Fundamentals', description: 'Design beautiful user interfaces and experiences', shortDescription: 'Learn UI/UX design from concept to prototype', instructor: 'Lisa Park', category: 'Design', level: 'Beginner', price: 39.99, thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', rating: 4.6, totalRatings: 445, duration: '10h 30m', isPublished: true, isFree: false, tags: ['UI', 'UX', 'Design', 'Figma'], whatYouLearn: ['Design principles', 'Figma', 'Prototyping', 'User research'], requirements: ['No design experience needed'] },
    { title: 'Git & GitHub Complete', description: 'Version control for developers', shortDescription: 'Master Git and GitHub workflows', instructor: 'Tom Bradley', category: 'DevOps', level: 'Beginner', price: 0, thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400', rating: 4.9, totalRatings: 2100, duration: '6h 00m', isPublished: true, isFree: true, tags: ['Git', 'GitHub', 'DevOps'], whatYouLearn: ['Git basics', 'Branching', 'Pull requests', 'GitHub Actions'], requirements: ['None'] }
  ];

  for (const courseData of sampleCourses) {
    const course = await Course.create({ ...courseData, instructorId: admin._id });

    // Create modules for C Programming (detailed)
    if (course.title === 'C Programming Masterclass') {
      const moduleData = [
        { title: 'Introduction to C', videos: [{ title: 'Introduction to C Programming', url: 'https://www.youtube.com/embed/KJgsSFOSQv0', duration: '10:23' }, { title: 'Installing C Compiler (GCC)', url: 'https://www.youtube.com/embed/KJgsSFOSQv0', duration: '8:45' }] },
        { title: 'C Basics', videos: [{ title: 'Variables and Data Types', url: 'https://www.youtube.com/embed/KJgsSFOSQv0', duration: '12:10' }, { title: 'Operators in C', url: 'https://www.youtube.com/embed/KJgsSFOSQv0', duration: '9:30' }, { title: 'Control Flow', url: 'https://www.youtube.com/embed/KJgsSFOSQv0', duration: '11:00' }] },
        { title: 'Arrays', videos: [{ title: 'Array Introduction', url: 'https://www.youtube.com/embed/KJgsSFOSQv0', duration: '7:45' }, { title: 'Single Dimensional Arrays', url: 'https://www.youtube.com/embed/KJgsSFOSQv0', duration: '13:20' }, { title: 'Multi Dimensional Arrays', url: 'https://www.youtube.com/embed/KJgsSFOSQv0', duration: '14:50' }] },
        { title: 'Pointers', videos: [{ title: 'Introduction to Pointers', url: 'https://www.youtube.com/embed/KJgsSFOSQv0', duration: '16:00' }, { title: 'Pointer Arithmetic', url: 'https://www.youtube.com/embed/KJgsSFOSQv0', duration: '12:30' }] },
        { title: 'Final Project', videos: [{ title: 'Building a Student Grade Calculator', url: 'https://www.youtube.com/embed/KJgsSFOSQv0', duration: '25:00' }, { title: 'Course Wrap Up', url: 'https://www.youtube.com/embed/KJgsSFOSQv0', duration: '5:00' }] }
      ];

      for (let i = 0; i < moduleData.length; i++) {
        const module = await Module.create({ title: moduleData[i].title, course: course._id, order: i + 1 });
        for (let j = 0; j < moduleData[i].videos.length; j++) {
          const video = await Video.create({ ...moduleData[i].videos[j], module: module._id, course: course._id, order: j + 1 });
          module.videos.push(video._id);
        }
        await module.save();
        course.modules.push(module._id);
      }
    } else {
      // Generic modules for other courses
      for (let i = 1; i <= 4; i++) {
        const module = await Module.create({ title: `Module ${i}: Core Concepts ${i}`, course: course._id, order: i });
        for (let j = 1; j <= 3; j++) {
          const video = await Video.create({ title: `Lesson ${j} - Chapter ${i}`, url: 'https://www.youtube.com/embed/KJgsSFOSQv0', duration: `${8 + j}:00`, module: module._id, course: course._id, order: j });
          module.videos.push(video._id);
        }
        await module.save();
        course.modules.push(module._id);
      }
    }
    await course.save();
  }

  console.log('Seed data created successfully!');
  console.log('Admin: admin@learnsphere.com / admin123');
  console.log('Student: student@learnsphere.com / student123');
  mongoose.disconnect();
};

seed().catch(console.error);
