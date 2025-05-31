import React from 'react';
import { ChevronRight, Zap, FileText, MessageSquare, UserCheck, Link2 } from 'lucide-react'; // Using lucide-react for icons

const steps = [
	{
		id: 1,
		icon: Link2,
		title: 'Connect to Your HR System',
		description: 'We plug into your existing job board or ATS.',
	},
	{
		id: 2,
		icon: FileText,
		title: 'Smart CV Analysis',
		description: 'AI filters and scores CVs instantly.',
	},
	{
		id: 3,
		icon: MessageSquare,
		title: 'WhatsApp Outreach',
		description: 'Top candidates are contacted automatically.',
	},
	{
		id: 4,
		icon: Zap,
		title: 'AI-Powered Interview',
		description: 'In English/Arabic, conducted professionally via agent.',
	},
	{
		id: 5,
		icon: UserCheck,
		title: 'Final Fit Score',
		description: 'Combines CV + interview data for structured HR review.',
	},
];

const HowItWorks: React.FC = () => {
	return (
		<React.Fragment>
			<section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
				<div className="container mx-auto px-6 md:px-8">
					<div className="text-center mb-12 md:mb-16">
						<h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
							How Rolevate Works
						</h2>
						<p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
							Our streamlined process integrates seamlessly with your workflow, from
							initial CV screening to final candidate scoring, all powered by
							intelligent automation.
						</p>
					</div>

					{/* Desktop: Horizontal Stepper */}
					<div className="hidden md:flex flex-col items-center">
						<div className="flex justify-between items-start w-full max-w-6xl mx-auto">
							{steps.map((step, index) => (
								<React.Fragment key={step.id}>
									<div className="flex flex-col items-center text-center w-1/5 px-2 group transform transition-all duration-300 hover:-translate-y-2">
										<div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full text-white mb-3 ring-4 ring-cyan-500/30 shadow-lg shadow-cyan-500/20 transition-all duration-300 group-hover:shadow-cyan-400/40">
											<step.icon size={28} />
										</div>
										<h3 className="font-semibold text-lg mb-1 text-slate-100 group-hover:text-cyan-300 transition-colors duration-300">
											{step.title}
										</h3>
										<p className="text-sm text-slate-300">
											{step.description}
										</p>
									</div>
									{index < steps.length - 1 && (
										<div className="flex-1 flex items-center justify-center pt-10 px-2 group">
											{/* Animated arrow */}
											<div className="w-full h-1 bg-slate-700 rounded-full relative overflow-hidden">
												<div className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
											</div>
											<ChevronRight
												size={36}
												className="text-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity duration-300 ml-2 shrink-0"
											/>
										</div>
									)}
								</React.Fragment>
							))}
						</div>
					</div>

					{/* Mobile: Vertical Infographic */}
					<div className="md:hidden space-y-10">
						{steps.map((step, index) => (
							<div key={step.id} className="flex items-start group">
								<div className="mr-6 flex flex-col items-center">
									<div className="p-3 bg-sky-600 rounded-full text-white ring-4 ring-sky-600/30 shadow-lg transition-all duration-300 group-hover:bg-sky-500 group-hover:ring-sky-500/50 group-hover:scale-105">
										<step.icon size={24} />
									</div>
									{index < steps.length - 1 && (
										<div className="h-20 w-1 bg-slate-700 mt-2 group-hover:bg-sky-500 transition-colors duration-300"></div>
									)}
								</div>
								<div>
									<h3 className="font-semibold text-xl mb-1 text-slate-100 group-hover:text-sky-400 transition-colors duration-300">
										{step.title}
									</h3>
									<p className="text-slate-400">{step.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</React.Fragment>
	);
};

export default HowItWorks;
