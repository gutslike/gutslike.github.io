/**
 * Everything the site knows about the person, in one place.
 *
 * Sourced from public/Manubhav_Sharma_Resume.pdf and from what the user
 * supplied directly on 2026-08-27. Pages read from here; nothing about the
 * person is written twice.
 *
 * The phone number on the CV is deliberately absent. A public HTML page with a
 * phone number on it is a scraping target and nothing here needs one.
 */

export interface SkillGroup {
	label: string;
	items: string[];
}

export interface Project {
	/** Display index. Two digits, because the list is short and ordered. */
	n: string;
	title: string;
	stack: string;
	blurb: string;
	/** Omitted until a URL exists — a row with no link renders with no action. */
	href?: string;
	hrefLabel?: string;
}

export interface Education {
	what: string;
	where: string;
	when: string;
}

export interface Certificate {
	name: string;
	issuer: string;
}

export const PROFILE = {
	name: 'Manubhav Sharma',
	tagline: 'Aspiring full-stack developer.',
	location: 'Ghaziabad, UP',
	email: 'manubhavsharma09@gmail.com',
	github: 'https://github.com/gutslike',
	linkedin: 'https://www.linkedin.com/in/manubhav-sharma-343b98283',
	cv: '/Manubhav_Sharma_Resume.pdf',
} as const;

export const SKILLS: SkillGroup[] = [
	{ label: 'Languages', items: ['JavaScript', 'Python', 'Java', 'C', 'Go'] },
	{
		label: 'Frontend',
		items: [
			'React.js',
			'HTML5',
			'CSS3',
			'Tailwind CSS',
			'Context API',
			'Bootstrap',
		],
	},
	{ label: 'Backend', items: ['Node.js', 'Express.js', 'Go', 'RESTful APIs'] },
	{ label: 'Databases', items: ['MongoDB', 'MySQL', 'SQLite3', 'Firebase'] },
	{
		label: 'Testing',
		items: [
			'Selenium WebDriver',
			'Playwright',
			'Cypress',
			'TestNG',
			'Postman',
			'REST Assured',
		],
	},
	{ label: 'Platform', items: ['Linux', 'Git', 'GitHub', 'Jenkins', 'Azure'] },
];

export const PROJECTS: Project[] = [
	{
		n: '01',
		title: 'E-commerce Platform',
		stack: 'MERN · Tailwind · Sanity · Razorpay · Resend',
		blurb:
			'An end-to-end storefront with an admin panel covering the full set of operational utilities, built so the catalogue and orders are handled dynamically rather than hard-coded.',
		href: 'https://e-commerce-qs8m.vercel.app/',
		hrefLabel: 'Live demo',
	},
	{
		n: '02',
		title: 'FIR Classification System',
		stack: 'Python · PyTorch',
		blurb:
			'A deep-learning model that reads the text of a First Information Report and predicts the correct Indian Penal Code section. I owned the training pipeline end to end, including the hyperparameter tuning that moved classification accuracy.',
	},
	{
		n: '03',
		title: 'HTTPS Server',
		stack: 'C',
		blurb:
			'An HTTPS server written from scratch in C, with a proxy cache layer in front of it.',
	},
	{
		n: '04',
		title: 'CLI Argument Parser',
		stack: 'C',
		blurb:
			'A general-purpose command-line parser in C that dissects arguments and input — built as the foundation other command-line tools sit on top of.',
	},
];

export const EDUCATION: Education[] = [
	{
		what: 'B.Tech, Computer Science & Engineering',
		where: 'ABES Institute of Technology',
		when: '2026',
	},
	{ what: 'Class XII', where: 'KDB Public School', when: '2022' },
	{ what: 'Class X', where: "St. Mary's Convent School", when: '2020' },
];

export const CERTIFICATES: Certificate[] = [
	{
		name: 'Certified Entry-Level Python Programmer (PCEP)',
		issuer: 'Python Institute',
	},
	{
		name: 'Mastering Test Automation with Playwright and TypeScript',
		issuer: 'CodeSignal',
	},
	{ name: 'Oracle Certified Foundations Associate, Java', issuer: 'Oracle' },
	{ name: 'Introduction to Linux (LFS101)', issuer: 'The Linux Foundation' },
	{ name: 'Jenkins Beginner', issuer: 'Udemy' },
	{ name: 'MongoDB Intermediate', issuer: 'MongoDB' },
	{ name: 'AI and ML, Beginner', issuer: 'Self-study' },
];
