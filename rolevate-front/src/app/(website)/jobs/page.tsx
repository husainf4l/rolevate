"use client";

import React, { useState, useEffect } from "react";
import JobCard, { JobData } from "@/components/common/JobCard";
import { Button } from "@/components/common/Button";

const jobsData: JobData[] = [
	{
		id: 1,
		title: "Senior Software Engineer",
		company: "Aramco Digital",
		location: "Riyadh, Saudi Arabia",
		type: "Full-time",
		salary: "25,000 - 35,000 SAR",
		skills: ["React", "Node.js", "TypeScript", "AWS", "GraphQL"],
		posted: "2 days ago",
		applicants: 23,
		logo: "🏢",
		description:
			"Join Saudi Arabia's leading tech transformation initiative building next-generation digital solutions.",
		urgent: true,
	},
	{
		id: 2,
		title: "Product Manager",
		company: "Qatar Airways Group",
		location: "Doha, Qatar",
		type: "Full-time",
		salary: "18,000 - 25,000 QAR",
		skills: ["Product Strategy", "Analytics", "Leadership", "Agile", "Aviation Tech"],
		posted: "1 day ago",
		applicants: 41,
		logo: "✈️",
		description:
			"Drive digital product innovation for Qatar's world-class airline and travel ecosystem.",
	},
	{
		id: 3,
		title: "UX Designer",
		company: "Zain Jordan",
		location: "Amman, Jordan",
		type: "Full-time",
		salary: "1,200 - 1,800 JOD",
		skills: ["Figma", "User Research", "Arabic UX", "Mobile Design"],
		posted: "3 days ago",
		applicants: 18,
		logo: "📱",
		description:
			"Design innovative digital experiences for Jordan's leading telecommunications company.",
	},
	{
		id: 4,
		title: "Data Scientist",
		company: "NEOM Tech",
		location: "NEOM, Saudi Arabia",
		type: "Full-time",
		salary: "30,000 - 45,000 SAR",
		skills: ["Python", "Machine Learning", "Smart Cities", "IoT", "AI"],
		posted: "1 day ago",
		applicants: 35,
		logo: "🌟",
		description:
			"Shape the future of smart cities with cutting-edge AI and data science at NEOM.",
		urgent: true,
	},
	{
		id: 5,
		title: "Digital Marketing Manager",
		company: "Careem",
		location: "Dubai, UAE / Remote",
		type: "Full-time",
		salary: "15,000 - 22,000 AED",
		skills: ["Digital Marketing", "Arabic Content", "Social Media", "Growth Hacking"],
		posted: "4 days ago",
		applicants: 29,
		logo: "🚗",
		description:
			"Lead regional marketing campaigns for the Middle East's super app serving millions.",
	},
	{
		id: 6,
		title: "Cloud Solutions Architect",
		company: "Ooredoo Qatar",
		location: "Doha, Qatar",
		type: "Full-time",
		salary: "20,000 - 28,000 QAR",
		skills: ["AWS", "Azure", "5G Infrastructure", "Enterprise Solutions"],
		posted: "2 days ago",
		applicants: 27,
		logo: "☁️",
		description:
			"Architect next-generation cloud and 5G solutions for Qatar's digital transformation.",
	},
	{
		id: 7,
		title: "Cybersecurity Specialist",
		company: "Dubai Police",
		location: "Dubai, UAE",
		type: "Full-time",
		salary: "18,000 - 28,000 AED",
		skills: ["Cybersecurity", "Threat Analysis", "Incident Response", "Arabic"],
		posted: "5 days ago",
		applicants: 15,
		logo: "🛡️",
		description:
			"Protect Dubai's digital infrastructure with cutting-edge cybersecurity solutions.",
	},
	{
		id: 8,
		title: "AI Research Engineer",
		company: "KAUST",
		location: "Thuwal, Saudi Arabia",
		type: "Full-time",
		salary: "28,000 - 38,000 SAR",
		skills: ["Machine Learning", "Deep Learning", "Research", "Python", "TensorFlow"],
		posted: "3 days ago",
		applicants: 31,
		logo: "🧠",
		description:
			"Advance AI research at one of the world's leading science and technology universities.",
	},
];

const jobTypes = [
	"All",
	"Full-time",
	"Part-time",
	"Contract",
	"Remote",
	"Internship",
];
const locations = [
	"All",
	"Saudi Arabia",
	"Qatar",
	"Jordan",
	"UAE",
	"Kuwait",
	"Bahrain",
	"Oman",
];
const experienceLevels = [
	"All",
	"Entry Level",
	"Mid Level",
	"Senior Level",
	"Executive",
	"Director",
];
const salaryRanges = ["All", "Below 10K", "10K - 20K", "20K - 35K", "35K - 50K", "50K+"];
const companies = [
	"All",
	"Aramco Digital",
	"Qatar Airways",
	"Zain",
	"NEOM Tech",
	"Careem",
	"Ooredoo",
	"Dubai Police",
	"KAUST",
];
const industries = [
	"All",
	"Technology",
	"Aviation",
	"Telecommunications",
	"Energy",
	"Transportation",
	"Government",
	"Research",
	"Finance",
];

export default function JobsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedType, setSelectedType] = useState("All");
	const [selectedLocation, setSelectedLocation] = useState("All");
	const [selectedExperience, setSelectedExperience] = useState("All");
	const [selectedSalary, setSelectedSalary] = useState("All");
	const [selectedCompany, setSelectedCompany] = useState("All");
	const [selectedIndustry, setSelectedIndustry] = useState("All");
	const [sortBy, setSortBy] = useState("latest");
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
	const [showMobileFilters, setShowMobileFilters] = useState(false);
	const [loading, setLoading] = useState(false);
	const [savedJobs, setSavedJobs] = useState<number[]>([]);

	const handleApply = (jobId: number) => {
		console.log(`Applying for job ID: ${jobId}`);
	};

	const handleSaveJob = (jobId: number) => {
		setSavedJobs((prev) =>
			prev.includes(jobId)
				? prev.filter((id) => id !== jobId)
				: [...prev, jobId]
		);
	};

	// Simulate loading when filters/search change
	const [sortedJobs, setSortedJobs] = useState<JobData[]>(jobsData);

	useEffect(() => {
		setLoading(true);
		const timeout = setTimeout(() => {
			const result = jobsData.filter((job) => {
				const matchesSearch =
					job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
					job.skills.some((skill) =>
						skill.toLowerCase().includes(searchTerm.toLowerCase())
					);
				const matchesType = selectedType === "All" || job.type === selectedType;
				const matchesLocation =
					selectedLocation === "All" || job.location.includes(selectedLocation);
				const matchesCompany =
					selectedCompany === "All" || job.company === selectedCompany;
				// Salary range matching
				const matchesSalary =
					selectedSalary === "All" ||
					(() => {
						const salaryNum = parseInt(job.salary.replace(/[^\d]/g, ""));
						switch (selectedSalary) {
							case "Below 10K":
								return salaryNum < 10000;
							case "10K - 20K":
								return (
									salaryNum >= 10000 && salaryNum <= 20000
								);
							case "20K - 35K":
								return (
									salaryNum >= 20000 && salaryNum <= 35000
								);
							case "35K - 50K":
								return (
									salaryNum >= 35000 && salaryNum <= 50000
								);
							case "50K+":
								return salaryNum > 50000;
							default:
								return true;
						}
					})();
				// Industry matching (simplified)
				const matchesIndustry =
					selectedIndustry === "All" ||
					(() => {
						const industryMap: { [key: string]: string } = {
							"Aramco Digital": "Technology",
							"Qatar Airways Group": "Aviation",
							"Zain Jordan": "Telecommunications",
							"NEOM Tech": "Technology",
							"Careem": "Transportation",
							"Ooredoo Qatar": "Telecommunications",
							"Dubai Police": "Government",
							"KAUST": "Research",
						};
						return industryMap[job.company] === selectedIndustry;
					})();
				// Experience level matching (simplified)
				const matchesExperience =
					selectedExperience === "All" ||
					(() => {
						const experienceMap: { [key: string]: string } = {
							"Senior Software Engineer": "Senior Level",
							"Product Manager": "Mid Level",
							"UX Designer": "Mid Level",
							"Data Scientist": "Senior Level",
							"Digital Marketing Manager": "Mid Level",
							"Cloud Solutions Architect": "Senior Level",
							"Cybersecurity Specialist": "Senior Level",
							"AI Research Engineer": "Senior Level",
						};
						return experienceMap[job.title] === selectedExperience;
					})();
				return (
					matchesSearch &&
					matchesType &&
					matchesLocation &&
					matchesCompany &&
					matchesSalary &&
					matchesIndustry &&
					matchesExperience
				);
			});
			setSortedJobs(result);
			setLoading(false);
		}, 500); // 0.5s loading
		return () => clearTimeout(timeout);
	}, [
		searchTerm,
		selectedType,
		selectedLocation,
		selectedExperience,
		selectedSalary,
		selectedCompany,
		selectedIndustry,
		sortBy,
	]);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
					<div className="text-center mb-8 lg:mb-10">
						<h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
							Find Your Next{" "}
							<span
								className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] bg-clip-text text-transparent"
								style={{
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
								}}
							>
								Opportunity
							</span>
						</h1>
						<p className="font-text text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto px-4">
							Discover premium career opportunities from leading companies
							across the Middle East
						</p>
					</div>

					{/* Mobile Search Bar - Shows at top on mobile */}
					<div className="lg:hidden mb-6">
						<div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
							<div className="mb-4">
								<div className="relative">
									<svg
										className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
									<input
										type="text"
										placeholder="Job title, company, or skills..."
										className="w-full pl-12 pr-6 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-base shadow-sm transition-all duration-200"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</div>
							</div>
							<button
								onClick={() => setShowMobileFilters(!showMobileFilters)}
								className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors text-base py-2"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
									/>
								</svg>
								{showMobileFilters ? "Hide Filters" : "Show Filters"}
							</button>
							{showMobileFilters && (
								<div className="mt-4 space-y-4 animate-fade-in">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Job Type
										</label>
										<select
											className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
											value={selectedType}
											onChange={(e) => setSelectedType(e.target.value)}
										>
											{jobTypes.map((type) => (
												<option key={type} value={type}>
													{type}
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Location
										</label>
										<select
											className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
											value={selectedLocation}
											onChange={(e) => setSelectedLocation(e.target.value)}
										>
											{locations.map((location) => (
												<option key={location} value={location}>
													{location}
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Salary Range
										</label>
										<select
											className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
											value={selectedSalary}
											onChange={(e) => setSelectedSalary(e.target.value)}
										>
											{salaryRanges.map((range) => (
												<option key={range} value={range}>
													{range}
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Experience Level
										</label>
										<select
											className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
											value={selectedExperience}
											onChange={(e) => setSelectedExperience(e.target.value)}
										>
											{experienceLevels.map((level) => (
												<option key={level} value={level}>
													{level}
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Company
										</label>
										<select
											className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
											value={selectedCompany}
											onChange={(e) => setSelectedCompany(e.target.value)}
										>
											{companies.map((company) => (
												<option key={company} value={company}>
													{company}
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Industry
										</label>
										<select
											className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
											value={selectedIndustry}
											onChange={(e) => setSelectedIndustry(e.target.value)}
										>
											{industries.map((industry) => (
												<option key={industry} value={industry}>
													{industry}
												</option>
											))}
										</select>
									</div>
									<button
										onClick={() => {
											setSearchTerm("");
											setSelectedType("All");
											setSelectedLocation("All");
											setSelectedExperience("All");
											setSelectedSalary("All");
											setSelectedCompany("All");
											setSelectedIndustry("All");
										}}
										className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-base"
									>
										Clear All Filters
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Search and Filters as Side Section */}
					<div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8">
						{/* Desktop Sidebar Filters - Hidden on mobile, appears on left on desktop */}
						<aside className="hidden lg:block w-80 xl:w-96 bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8 sticky top-8 self-start animate-fade-in">
							<div className="mb-8">
								<label className="block text-lg font-bold text-gray-800 mb-4 tracking-wide">
									Search Jobs
								</label>
								<div className="relative">
									<svg
										className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
									<input
										type="text"
										placeholder="Job title, company, or skills..."
										className="w-full pl-12 pr-6 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-base shadow-sm transition-all duration-200"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</div>
							</div>
							<div className="space-y-6">
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-3">
										Job Type
									</label>
									<select
										className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
										value={selectedType}
										onChange={(e) => setSelectedType(e.target.value)}
									>
										{jobTypes.map((type) => (
											<option key={type} value={type}>
												{type}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-3">
										Location
									</label>
									<select
										className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
										value={selectedLocation}
										onChange={(e) => setSelectedLocation(e.target.value)}
									>
										{locations.map((location) => (
											<option key={location} value={location}>
												{location}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-3">
										Salary Range
									</label>
									<select
										className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
										value={selectedSalary}
										onChange={(e) => setSelectedSalary(e.target.value)}
									>
										{salaryRanges.map((range) => (
											<option key={range} value={range}>
												{range}
											</option>
										))}
									</select>
								</div>
								<button
									onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
									className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors text-base"
								>
									<svg
										className={`w-5 h-5 transform transition-transform ${
											showAdvancedFilters ? "rotate-180" : ""
										}`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
									{showAdvancedFilters
										? "Hide Advanced Filters"
										: "Show Advanced Filters"}
								</button>
								{showAdvancedFilters && (
									<div className="animate-fade-in space-y-6">
										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-3">
												Experience Level
											</label>
											<select
												className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
												value={selectedExperience}
												onChange={(e) => setSelectedExperience(e.target.value)}
											>
												{experienceLevels.map((level) => (
													<option key={level} value={level}>
														{level}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-3">
												Company
											</label>
											<select
												className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
												value={selectedCompany}
												onChange={(e) => setSelectedCompany(e.target.value)}
											>
												{companies.map((company) => (
													<option key={company} value={company}>
														{company}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-3">
												Industry
											</label>
											<select
												className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
												value={selectedIndustry}
												onChange={(e) => setSelectedIndustry(e.target.value)}
											>
												{industries.map((industry) => (
													<option key={industry} value={industry}>
														{industry}
													</option>
												))}
											</select>
										</div>
										<button
											onClick={() => {
												setSearchTerm("");
												setSelectedType("All");
												setSelectedLocation("All");
												setSelectedExperience("All");
												setSelectedSalary("All");
												setSelectedCompany("All");
												setSelectedIndustry("All");
											}}
											className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-base"
										>
											Clear All Filters
										</button>
									</div>
								)}
							</div>
						</aside>

						{/* Main Content */}
						<div className="flex-1 min-w-0">
							<div className="mb-6 lg:mb-8">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
									<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
										<div className="text-lg sm:text-xl font-semibold text-gray-900">
											{sortedJobs.length}{" "}
											{sortedJobs.length === 1 ? "Job" : "Jobs"} Found
										</div>
										{(searchTerm ||
											selectedType !== "All" ||
											selectedLocation !== "All" ||
											selectedExperience !== "All" ||
											selectedSalary !== "All" ||
											selectedCompany !== "All" ||
											selectedIndustry !== "All") && (
											<div className="flex flex-wrap gap-2">
												{searchTerm && (
													<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
														Search: "{searchTerm}"
													</span>
												)}
												{selectedType !== "All" && (
													<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
														{selectedType}
													</span>
												)}
												{selectedLocation !== "All" && (
													<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
														{selectedLocation}
													</span>
												)}
											</div>
										)}
									</div>
									<div className="flex items-center gap-3">
										<span className="text-sm font-medium text-gray-600 hidden sm:block">
											Sort by:
										</span>
										<select
											className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white shadow-sm min-w-0 flex-shrink-0"
											value={sortBy}
											onChange={(e) => setSortBy(e.target.value)}
										>
											<option value="latest">Latest Posted</option>
											<option value="salary">Highest Salary</option>
											<option value="applicants">Most Popular</option>
										</select>
									</div>
								</div>
								{/* Jobs Grid */}
								<div className="mt-8">
									{loading ? (
										<div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24">
											<svg
												className="animate-spin h-12 w-12 sm:h-14 sm:w-14 text-blue-500 mb-4"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												aria-label="Loading Spinner"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8v8z"
												></path>
											</svg>
											<div className="text-lg text-gray-500">
												Loading jobs...
											</div>
										</div>
									) : (
										<>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 xl:gap-10">
												{sortedJobs.map((job) => (
													<div
														key={job.id}
														className="animate-fade-in group relative flex flex-col h-full"
														tabIndex={0}
														aria-label={`Job: ${job.title} at ${job.company}`}
													>
														<div className="flex-1">
															<JobCard
																job={job}
																onApply={handleApply}
																onSave={handleSaveJob}
																isSaved={savedJobs.includes(job.id)}
																showDescription={true}
																compact={false}
															/>
														</div>
													</div>
												))}
											</div>
											{/* No Results */}
											{sortedJobs.length === 0 && (
												<div className="text-center py-12 sm:py-16 lg:py-20">
													<div
														className="text-gray-400 text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6"
														aria-hidden="true"
													>
														🔍
													</div>
													<h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
														No jobs found
													</h3>
													<p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-4 max-w-md mx-auto">
														Try adjusting your search criteria to find more
														opportunities
													</p>
													<Button
														variant="primary"
														onClick={() => {
															setSearchTerm("");
															setSelectedType("All");
															setSelectedLocation("All");
															setSelectedExperience("All");
															setSelectedSalary("All");
															setSelectedCompany("All");
															setSelectedIndustry("All");
														}}
														className="px-6 py-3 text-base"
													>
														Clear All Filters
													</Button>
												</div>
											)}
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ...existing code... */}
		</div>
	);
}