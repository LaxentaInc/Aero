'use client'
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Page Types
type PageType = 'home' | 'projects' | 'skills';

// Project data with her actual repos
const projectsData = [
  {
    name: "ProCommit",
    description: "A Customizable VS Code extension for AI-generated commit messages.",
    tech: ["TypeScript"],
    license: "MIT License",
    updated: "Jul 19",
    url: "https://github.com/koimoee/ProCommit",
    color: "from-blue-400 to-blue-600"
  },
  {
    name: "Kizzy",
    description: "Discord Rich Presence for Android. Made with jetpack compose and material3",
    tech: ["Kotlin"],
    license: "GNU General Public License v3.0",
    updated: "May 25",
    url: "https://github.com/koimoee/Kizzy",
    forked: true,
    color: "from-purple-400 to-purple-600"
  },
  {
    name: "VSNordTheme",
    description: "A Multi awesome Nord theme For Visual Studio Code",
    tech: ["CSS"],
    license: "GNU General Public License v3.0",
    updated: "Jan 9",
    url: "https://github.com/koimoee/VSNordTheme",
    color: "from-cyan-400 to-cyan-600"
  },
  {
    name: "GameServerMonitorFork",
    description: "A discord bot that monitors your game server and tracks the live data of your game servers. Supports over 260 game servers.",
    tech: ["Python"],
    license: "MIT License",
    updated: "Jan 6",
    url: "https://github.com/koimoee/GameServerMonitorFork",
    forked: true,
    color: "from-green-400 to-green-600"
  },
  {
    name: "EllenJoeNextGlass",
    description: "A Clean Frosted Glass Themed Ellen Joe's For Discord.",
    tech: ["CSS"],
    license: "GNU General Public License v3.0",
    updated: "Dec 20, 2024",
    url: "https://github.com/koimoee/EllenJoeNextGlass",
    color: "from-pink-400 to-pink-600"
  },
  {
    name: "GHSocialPreview",
    description: "Create Your Github Social Image!",
    tech: ["JavaScript"],
    license: "MIT License",
    updated: "Dec 19, 2024",
    url: "https://github.com/koimoee/GHSocialPreview",
    color: "from-yellow-400 to-orange-500"
  },
  {
    name: "ActivityCord",
    description: "Allows you to create streaming, playing, and listening status on Discord.",
    tech: ["JavaScript"],
    license: "GNU General Public License v3.0",
    updated: "May 24, 2024",
    url: "https://github.com/koimoee/ActivityCord",
    stars: 8,
    color: "from-indigo-400 to-indigo-600"
  },
  {
    name: "PrismLog",
    description: "Prismlog is a simple logging utility for Node.js applications, providing colorful and formatted console logs.",
    tech: ["JavaScript"],
    license: "MIT License",
    updated: "Mar 31, 2024",
    url: "https://github.com/koimoee/PrismLog",
    color: "from-teal-400 to-teal-600"
  },
  {
    name: "Welcomify",
    description: "A cutting-edge canvas library for creating futuristic welcome cards.",
    tech: ["JavaScript"],
    license: "GNU General Public License v3.0",
    updated: "Mar 7, 2024",
    url: "https://github.com/koimoee/Welcomify",
    color: "from-rose-400 to-rose-600"
  },
  {
    name: "DiscordPresenceCLI",
    description: "A Simple & Easy Show a Discord Presence Using a CLI",
    tech: ["JavaScript"],
    license: "MIT License",
    updated: "Feb 9, 2024",
    url: "https://github.com/koimoee/DiscordPresenceCLI",
    color: "from-violet-400 to-violet-600"
  }
];

const Navigation = ({ currentPage, setCurrentPage }: { currentPage: PageType; setCurrentPage: (page: PageType) => void }) => {
  const navItems = [
    { id: 'home' as PageType, label: 'Home' },
    { id: 'projects' as PageType, label: 'Projects' },
    { id: 'skills' as PageType, label: 'Skills' },
  ];

  return (
    <motion.nav
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md rounded-full px-8 py-3 shadow-lg border border-gray-200/50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex space-x-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
              currentPage === item.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </motion.nav>
  );
};

const HomePage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-4xl">
        <motion.div
          className="relative w-40 h-40 mx-auto mb-12"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <img
            src="https://via.placeholder.com/200x200/6b7280/ffffff?text=KN"
            alt="Koi Natsuko"
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <motion.div
              className="w-20 h-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-60"
              animate={{ 
                opacity: [0.6, 0.9, 0.6],
                scaleX: [1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h1 className="text-6xl font-black mb-4 text-gray-900">
            Koi Natsuko
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            코이 나츠코
          </p>
          <p className="text-lg text-gray-500 mb-8">
            (From がらなつこ)
          </p>
        </motion.div>

        <motion.p
          className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          She a student who always is bored and jumps off cliffs for fun.
          <br />
          Always eager to dive into new knowledge, experiences and off cliffs into the ocean.
          <br />
          When she is not studying, you'll probably find her, coding, talking to me or trying to jump off another cliff.
        </motion.p>

        <motion.p
          className="text-lg text-gray-600 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          That's all I can describe about her Ngl
        </motion.p>

        <motion.div
          className="flex justify-center space-x-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <a
            href="https://discord.gg/i-like-koi-ngl"
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            DISCORD
          </a>
          <a
            href="https://github.com/koimoee"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 transition-colors"
          >
            GITHUB
          </a>
        </motion.div>

        <motion.div
          className="mt-16 inline-flex items-center space-x-2 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Online • {currentTime.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} JST</span>
        </motion.div>
      </div>
    </div>
  );
};

const ProjectsPage = () => {
  const [filter, setFilter] = useState('all');
  const languages = ['all', 'TypeScript', 'JavaScript', 'Python', 'Kotlin', 'CSS'];

  const filteredProjects = filter === 'all' 
    ? projectsData 
    : projectsData.filter(project => project.tech.includes(filter));

  return (
    <div className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-black text-center text-gray-900 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          My Projects
        </motion.h1>

        <motion.p
          className="text-xl text-gray-600 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          A collection of open source projects and contributions
        </motion.p>

        {/* Language Filter */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setFilter(lang)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === lang
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, i) => (
            <motion.a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </h3>
                {project.forked && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    Forked
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{project.license}</span>
                <span>Updated on {project.updated}</span>
              </div>

              {project.stars && (
                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <span className="mr-1">⭐</span>
                  <span>{project.stars}</span>
                </div>
              )}
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

const SkillsPage = () => {
  const skillCategories = [
    {
      category: "Professional Talents",
      description: "Core life competencies that define excellence",
      items: [
        { 
          name: "Procrastination", 
          level: 99, 
          description: "Can turn a 2-hour assignment into a 2-week anxiety marathon" 
        },
        { 
          name: "Overthinking", 
          level: 95, 
          description: "Will analyze a simple 'hi' text for 3 hours straight" 
        },
        { 
          name: "Coffee Dependency", 
          level: 98, 
          description: "Cannot function without at least 5 cups per day" 
        },
        { 
          name: "Tab Hoarding", 
          level: 92, 
          description: "Currently has 47 browser tabs open and refuses to close any" 
        }
      ],
      color: "from-red-400 to-pink-500"
    },
    {
      category: "Social Skills",
      description: "Interpersonal communication mastery",
      items: [
        { 
          name: "Awkward Silence Creation", 
          level: 89, 
          description: "Master of making conversations uncomfortable in 3 seconds" 
        },
        { 
          name: "Meme Knowledge", 
          level: 96, 
          description: "Can communicate entirely through anime reaction gifs" 
        },
        { 
          name: "Social Battery Management", 
          level: 15, 
          description: "Needs 3 business days to recover from saying 'you too' to a waiter" 
        },
        { 
          name: "Online vs IRL Personality Gap", 
          level: 94, 
          description: "Confident online, becomes a shy potato in person" 
        }
      ],
      color: "from-blue-400 to-purple-500"
    },
    {
      category: "Life Skills",
      description: "Essential survival competencies",
      items: [
        { 
          name: "Sleeping Schedule Chaos", 
          level: 97, 
          description: "What is a consistent bedtime? We don't know her" 
        },
        { 
          name: "Snack Discovery", 
          level: 91, 
          description: "Can find the perfect midnight snack in any kitchen" 
        },
        { 
          name: "Excuse Generation", 
          level: 88, 
          description: "Creative storytelling when assignment deadlines approach" 
        },
        { 
          name: "Playlist Curation", 
          level: 99, 
          description: "Has 73 different mood playlists for very specific situations" 
        }
      ],
      color: "from-green-400 to-teal-500"
    },
    {
      category: "Academic Survival",
      description: "Educational endurance strategies",
      items: [
        { 
          name: "Last-Minute Miracle Work", 
          level: 93, 
          description: "Can produce a surprisingly good project 2 hours before deadline" 
        },
        { 
          name: "Google-fu", 
          level: 96, 
          description: "Can find any answer with the right combination of search terms" 
        },
        { 
          name: "Energy Drink Tolerance", 
          level: 85, 
          description: "Immune to most caffeine, requires industrial strength" 
        },
        { 
          name: "Study Group Social Dynamics", 
          level: 67, 
          description: "Shows up, contributes memes, somehow still helpful" 
        }
      ],
      color: "from-yellow-400 to-orange-500"
    },
    {
      category: "Special Skills",
      description: "Unique professional competencies",
      items: [
        { 
          name: "Documentation Avoidance", 
          level: 89, 
          description: "Code is self-documenting, right? Future me will figure it out" 
        },
        { 
          name: "Perfectionist Paralysis", 
          level: 94, 
          description: "Will rewrite the same component 7 times because the button padding feels off by 2px" 
        }
      ],
      color: "from-purple-400 to-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-black text-center text-gray-900 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          My Skills
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.category}
              className="bg-white rounded-2xl p-6 border border-gray-200"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-2">{category.category}</h2>
              <p className="text-gray-600 mb-6">{category.description}</p>

              <div className="space-y-4">
                {category.items.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm text-gray-500">Level {skill.level}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${category.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">{skill.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const KoiPortfolio = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const pageVariants = {
    initial: { opacity: 0, x: -50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 50 }
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.4
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'projects':
        return <ProjectsPage />;
      case 'skills':
        return <SkillsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {renderCurrentPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default KoiPortfolio;