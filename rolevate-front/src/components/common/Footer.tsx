import React from "react";
import Logo from "./logo";

const footerLinks = [
	{
		title: "Company",
		links: [
			{ label: "About", href: "/about" },
			{ label: "Careers", href: "/careers" },
			{ label: "Press", href: "/press" },
			{ label: "Contact", href: "/contact" },
		],
	},
	{
		title: "Product",
		links: [
			{ label: "Features", href: "/features" },
			{ label: "Pricing", href: "/pricing" },
			{ label: "Integrations", href: "/integrations" },
			{ label: "API", href: "/api" },
		],
	},
	{
		title: "Resources",
		links: [
			{ label: "Blog", href: "/blog" },
			{ label: "Help Center", href: "/help" },
			{ label: "Guides", href: "/guides" },
			{ label: "Community", href: "/community" },
		],
	},
	{
		title: "Legal",
		links: [
			{ label: "Privacy Policy", href: "/privacy" },
			{ label: "Terms of Service", href: "/terms" },
			{ label: "Security", href: "/security" },
		],
	},
];

export default function Footer() {
	return (
		<footer className="w-full border-t border-gray-200/60 bg-white/80 backdrop-blur-sm pt-16 pb-8 mt-16">
			<div className="container mx-auto px-6 md:px-12">
				<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12 md:gap-8">
					{/* Logo and Description */}
					<div className="flex-1 min-w-[200px] mb-8 md:mb-0">
						<Logo size={48} />
						<p className="text-gray-500 text-base max-w-xs mb-4 mt-3">
							AI-powered recruitment platform for the Middle East. Elevate your
							hiring and career with intelligent automation.
						</p>
						<div className="flex gap-4 mt-4">
							<a
								href="#"
								aria-label="LinkedIn"
								className="text-[#0891b2] hover:text-[#13ead9] transition"
							>
								<svg
									width="24"
									height="24"
									fill="none"
									viewBox="0 0 24 24"
								>
									<path
										d="M16.5 8.5A4 4 0 0 1 20 12.5v4.25c0 .69-.56 1.25-1.25 1.25h-2.5A1.25 1.25 0 0 1 15 16.75V12.5a1.5 1.5 0 0 0-3 0v4.25c0 .69-.56 1.25-1.25 1.25h-2.5A1.25 1.25 0 0 1 7 16.75V9.25C7 8.56 7.56 8 8.25 8h2.5c.69 0 1.25.56 1.25 1.25v.25"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<rect
										x="3"
										y="8"
										width="4"
										height="12"
										rx="1.25"
										stroke="currentColor"
										strokeWidth="1.5"
									/>
								</svg>
							</a>
							<a
								href="#"
								aria-label="Twitter"
								className="text-[#0891b2] hover:text-[#13ead9] transition"
							>
								<svg
									width="24"
									height="24"
									fill="none"
									viewBox="0 0 24 24"
								>
									<path
										d="M21 6.5c-.6.27-1.25.45-1.93.53A3.25 3.25 0 0 0 20.5 4.5a6.5 6.5 0 0 1-2.06.79A3.25 3.25 0 0 0 12 8.25v.5A9.25 9.25 0 0 1 3.5 5.5s-4 9 5 13a10.5 10.5 0 0 1-6.5 2c9 5 20-2 20-11.5 0-.18-.01-.36-.02-.54A6.5 6.5 0 0 0 21 6.5Z"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</a>
							<a
								href="#"
								aria-label="Facebook"
								className="text-[#0891b2] hover:text-[#13ead9] transition"
							>
								<svg
									width="24"
									height="24"
									fill="none"
									viewBox="0 0 24 24"
								>
									<path
										d="M17 2.5h-2.5A4.5 4.5 0 0 0 10 7v2H7.5A1.5 1.5 0 0 0 6 10.5v2A1.5 1.5 0 0 0 7.5 14H10v7h4v-7h2.5a1.5 1.5 0 0 0 1.5-1.5v-2A1.5 1.5 0 0 0 16.5 9H14V7a2.5 2.5 0 0 1 2.5-2.5H17"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</a>
						</div>
					</div>
					{/* Link Sections */}
					<div className="flex flex-1 flex-wrap gap-8 md:gap-12 justify-between">
						{footerLinks.map((section) => (
							<div key={section.title} className="min-w-[120px]">
								<div className="text-sm font-bold text-gray-900 mb-4">
									{section.title}
								</div>
								<ul className="space-y-2">
									{section.links.map((link) => (
										<li key={link.label}>
											<a
												href={link.href}
												className="text-gray-500 hover:text-[#13ead9] transition text-sm font-medium"
											>
												{link.label}
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
				<div className="mt-12 text-xs text-gray-400 text-center border-t border-gray-100/60 pt-6">
					&copy; {new Date().getFullYear()} Rolevate. All rights reserved.
				</div>
			</div>
		</footer>
	);
}
