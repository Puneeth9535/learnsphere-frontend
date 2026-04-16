const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Video = require('./models/Video');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnsphere';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  // Clear existing
  await User.deleteMany(); await Course.deleteMany();
  await Module.deleteMany(); await Video.deleteMany();

  // Create admin
  const admin = await User.create({
    name: 'Admin User', email: 'admin@learnsphere.com',
    password: 'admin123', role: 'admin'
  });

  // Create student
  await User.create({
    name: 'John Student', email: 'student@learnsphere.com',
    password: 'student123', role: 'student'
  });

  const coursesData = [
    {
      title: 'C Programming Masterclass',
      description: 'Master C programming from absolute basics to advanced topics including pointers, memory management, and data structures.',
      shortDescription: 'Learn C programming from scratch',
      instructor: 'Dr. Sarah Mitchell',
      thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500',
      price: 49.99, category: 'Programming', level: 'Beginner',
      duration: '12h 30m', rating: 4.8, totalStudents: 1240,
      whatYouLearn: ['C Syntax & Basics', 'Pointers & Memory', 'Data Structures', 'File I/O'],
      requirements: ['Basic computer knowledge', 'A C compiler installed'],
      modules: [
        {
          title: 'Module 1: Introduction', order: 1,
          videos: [
            { title: 'Introduction to C', duration: '8:30', order: 1, videoUrl: 'https://www.youtube.com/embed/KJgsSFOSQv0' },
            { title: 'Installing C Compiler', duration: '12:15', order: 2, videoUrl: 'https://www.youtube.com/embed/KJgsSFOSQv0', isPreview: true }
          ]
        },
        {
          title: 'Module 2: C Basics', order: 2,
          videos: [
            { title: 'Variables & Constants', duration: '15:00', order: 1, videoUrl: 'https://www.youtube.com/embed/KJgsSFOSQv0' },
            { title: 'Data Types', duration: '18:20', order: 2, videoUrl: 'https://www.youtube.com/embed/KJgsSFOSQv0' },
            { title: 'Operators', duration: '14:45', order: 3, videoUrl: 'https://www.youtube.com/embed/KJgsSFOSQv0' }
          ]
        },
        {
          title: 'Module 3: Arrays', order: 3,
          videos: [
            { title: 'Array Introduction', duration: '10:00', order: 1, videoUrl: 'https://www.youtube.com/embed/KJgsSFOSQv0' },
            { title: 'Single Dimensional Arrays', duration: '20:30', order: 2, videoUrl: 'https://www.youtube.com/embed/KJgsSFOSQv0' },
            { title: 'Multi Dimensional Arrays', duration: '22:15', order: 3, videoUrl: 'https://www.youtube.com/embed/KJgsSFOSQv0' }
          ]
        }
      ]
    },
    {
      title: 'React.js Complete Guide 2024',
      description: 'Build modern web apps with React including hooks, context, Redux, and deployment strategies.',
      shortDescription: 'Full React.js development course',
      instructor: 'Alex Johnson',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
      price: 79.99, category: 'Web Development', level: 'Intermediate',
      duration: '20h 15m', rating: 4.9, totalStudents: 3400,
      whatYouLearn: ['React Hooks', 'State Management', 'REST APIs', 'Deployment'],
      requirements: ['JavaScript basics', 'HTML & CSS knowledge'],
      modules: [
        {
          title: 'Getting Started', order: 1,
          videos: [
            { title: 'What is React?', duration: '7:00', order: 1, videoUrl: 'https://www.youtube.com/embed/Tn6-PIqc4UM', isPreview: true },
            { title: 'Setting Up Environment', duration: '10:00', order: 2, videoUrl: 'https://www.youtube.com/embed/Tn6-PIqc4UM' }
          ]
        },
        {
          title: 'React Hooks Deep Dive', order: 2,
          videos: [
            { title: 'useState Hook', duration: '16:30', order: 1, videoUrl: 'https://www.youtube.com/embed/Tn6-PIqc4UM' },
            { title: 'useEffect Hook', duration: '19:45', order: 2, videoUrl: 'https://www.youtube.com/embed/Tn6-PIqc4UM' }
          ]
        }
      ]
    },
    {
      title: 'Python for Data Science',
      description: 'Learn Python for data analysis, visualization, and machine learning fundamentals.',
      shortDescription: 'Python + data science essentials',
      instructor: 'Dr. Emma Chen',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500',
      price: 0, isFree: true, category: 'Data Science', level: 'Beginner',
      duration: '15h 00m', rating: 4.7, totalStudents: 8900,
      whatYouLearn: ['Python basics', 'Pandas & NumPy', 'Data Visualization', 'ML intro'],
      requirements: ['No prior experience needed'],
      modules: [
        {
          title: 'Python Fundamentals', order: 1,
          videos: [
            { title: 'Python Introduction', duration: '9:00', order: 1, videoUrl: 'https://www.youtube.com/embed/_uQrJ0TkZlc', isPreview: true },
            { title: 'Variables and Types', duration: '14:00', order: 2, videoUrl: 'https://www.youtube.com/embed/_uQrJ0TkZlc' }
          ]
        },
        {
          title: 'Data Analysis with Pandas', order: 2,
          videos: [
            { title: 'Pandas Introduction', duration: '18:00', order: 1, videoUrl: 'https://www.youtube.com/embed/_uQrJ0TkZlc' },
            { title: 'DataFrames', duration: '22:00', order: 2, videoUrl: 'https://www.youtube.com/embed/_uQrJ0TkZlc' }
          ]
        }
      ]
    },
    {
      title: 'Full Stack Web Development Bootcamp',
      description: 'Complete bootcamp covering HTML, CSS, JavaScript, Node.js, MongoDB and deployment.',
      shortDescription: 'Become a full stack developer',
      instructor: 'Mike Torres',
      thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=500',
      price: 129.99, category: 'Web Development', level: 'Beginner',
      duration: '45h 00m', rating: 4.6, totalStudents: 5600,
      whatYouLearn: ['HTML/CSS', 'JavaScript', 'Backend with Node.js', 'Database design'],
      requirements: ['Computer with internet', 'Motivation to learn'],
      modules: [
        {
          title: 'HTML & CSS', order: 1,
          videos: [
            { title: 'HTML Basics', duration: '20:00', order: 1, videoUrl: 'https://www.youtube.com/embed/pQN-pnXPaVg', isPreview: true },
            { title: 'CSS Fundamentals', duration: '25:00', order: 2, videoUrl: 'https://www.youtube.com/embed/pQN-pnXPaVg' }
          ]
        }
      ]
    },
    {
      title: 'UI/UX Design Fundamentals',
      description: 'Learn design principles, Figma, user research, and how to create beautiful digital products.',
      shortDescription: 'Design beautiful digital products',
      instructor: 'Sophie Laurent',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
      price: 59.99, category: 'Design', level: 'Beginner',
      duration: '10h 00m', rating: 4.8, totalStudents: 2100,
      whatYouLearn: ['Design Principles', 'Figma Basics', 'Prototyping', 'User Testing'],
      requirements: ['No design experience needed'],
      modules: [
        {
          title: 'Design Principles', order: 1,
          videos: [
            { title: 'What is UI/UX?', duration: '8:00', order: 1, videoUrl: 'https://www.youtube.com/embed/c9Wg6Cb_YlU', isPreview: true },
            { title: 'Color Theory', duration: '15:00', order: 2, videoUrl: 'https://www.youtube.com/embed/c9Wg6Cb_YlU' }
          ]
        }
      ]
    },
    {
      title: 'Node.js & Express API Development',
      description: 'Build production-ready REST APIs with Node.js, Express, MongoDB and authentication.',
      shortDescription: 'Backend API development with Node.js',
      instructor: 'James Wright',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500',
      price: 69.99, category: 'Backend', level: 'Intermediate',
      duration: '18h 30m', rating: 4.7, totalStudents: 1800,
      whatYouLearn: ['Express.js', 'REST APIs', 'JWT Auth', 'MongoDB'],
      requirements: ['JavaScript knowledge', 'Basic web understanding'],
      modules: [
        {
          title: 'Express.js Basics', order: 1,
          videos: [
            { title: 'Setting Up Express', duration: '12:00', order: 1, videoUrl: 'https://www.youtube.com/embed/L72fhGm1tfE', isPreview: true },
            { title: 'Routes & Middleware', duration: '18:00', order: 2, videoUrl: 'https://www.youtube.com/embed/L72fhGm1tfE' }
          ]
        }
      ]
    }
  ];

  for (const courseData of coursesData) {
    const { modules: modulesData, ...courseFields } = courseData;
    const course = await Course.create({ ...courseFields, instructorId: admin._id });
    const moduleIds = [];
    for (const modData of modulesData) {
      const { videos: videosData, ...modFields } = modData;
      const mod = await Module.create({ ...modFields, courseId: course._id });
      for (const vidData of videosData) {
        await Video.create({ ...vidData, moduleId: mod._id, courseId: course._id });
      }
      const populatedMod = await Module.findById(mod._id);
      moduleIds.push(mod._id);
    }
    await Course.findByIdAndUpdate(course._id, { modules: moduleIds });
  }

  console.log('✅ Seed complete!');
  console.log('Admin: admin@learnsphere.com / admin123');
  console.log('Student: student@learnsphere.com / student123');
  mongoose.connection.close();
};

seed().catch(console.error);
