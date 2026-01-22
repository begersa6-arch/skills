// Predefined skills list for CHEER
export const SKILLS_LIST = [
  "JavaScript",
  "TypeScript",
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Git",
  "CI/CD",
  "Machine Learning",
  "Data Analysis",
  "UI/UX Design",
  "Figma",
  "Adobe Creative Suite",
  "Project Management",
  "Agile/Scrum",
  "Communication",
  "Leadership",
  "Problem Solving",
  "Marketing",
  "Sales",
  "Customer Service",
  "Financial Analysis",
  "Accounting",
  "Human Resources",
  "Legal",
  "Healthcare",
  "Research",
  "Writing",
  "Editing",
  "Social Media",
  "SEO",
  "Content Strategy",
];

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Media & Entertainment",
  "Consulting",
  "Real Estate",
  "Transportation",
  "Energy",
  "Hospitality",
  "Non-Profit",
  "Government",
  "Other",
];

export const calculateSkillMatch = (
  seekerSkills: string[],
  requiredSkills: string[]
): number => {
  if (!requiredSkills || requiredSkills.length === 0) return 0;
  const matchedSkills = seekerSkills.filter((skill) =>
    requiredSkills.some(
      (reqSkill) => reqSkill.toLowerCase() === skill.toLowerCase()
    )
  );
  return Math.round((matchedSkills.length / requiredSkills.length) * 100);
};
