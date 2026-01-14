'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Newspaper, Calendar, ExternalLink } from "lucide-react";

// Mock data - replace with real data from CMS/backend
const mockNews = [
	{
		id: 1,
		title: 'Welcome to Relic of Lies!',
		content: 'We\'re excited to launch our blockchain-based card game. Join thousands of players in epic battles of strategy and deception.',
		date: '2024-01-15',
		category: 'Announcement',
		image: '/images/news/welcome.jpg',
	},
	{
		id: 2,
		title: 'Season 1 Tournament Coming Soon',
		content: 'Get ready for the first official tournament! Compete for the grand prize of 10,000 SUI. Registration opens next week.',
		date: '2024-01-10',
		category: 'Tournament',
		image: '/images/news/tournament.jpg',
	},
	{
		id: 3,
		title: 'New Card Pack Update',
		content: 'We\'ve added new card effects and balanced gameplay based on community feedback. Check out the patch notes for details.',
		date: '2024-01-05',
		category: 'Update',
		image: '/images/news/update.jpg',
	},
	{
		id: 4,
		title: 'Leaderboard Reset & Rewards',
		content: 'Monthly leaderboard reset is here! Top players will receive exclusive rewards. Check your rankings now.',
		date: '2024-01-01',
		category: 'Event',
		image: '/images/news/leaderboard.jpg',
	},
];

export function NewsContent() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-5xl">
				{/* Header */}
				<div className="mb-8 text-center">
					<Newspaper className="w-12 h-12 mx-auto mb-4 text-primary" />
					<h1 className="text-4xl font-bold mb-2">News & Updates</h1>
					<p className="text-muted-foreground text-lg">
						Stay updated with the latest announcements and events
					</p>
				</div>

				{/* News List */}
				<div className="space-y-6">
					{mockNews.map((article) => (
						<Card key={article.id} className="overflow-hidden">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-0">
								{article.image && (
									<div className="md:col-span-1 bg-muted h-48 md:h-full min-h-[200px] flex items-center justify-center">
										<Newspaper className="w-16 h-16 text-muted-foreground opacity-50" />
									</div>
								)}
								<div className={article.image ? "md:col-span-2" : "md:col-span-3"}>
									<CardHeader>
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<Badge variant="secondary">{article.category}</Badge>
													<span className="text-sm text-muted-foreground flex items-center gap-1">
														<Calendar className="w-3 h-3" />
														{new Date(article.date).toLocaleDateString('en-US', {
															year: 'numeric',
															month: 'long',
															day: 'numeric',
														})}
													</span>
												</div>
												<CardTitle className="text-2xl mb-2">{article.title}</CardTitle>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<CardDescription className="text-base mb-4">
											{article.content}
										</CardDescription>
										<div className="flex items-center gap-2 text-primary hover:underline cursor-pointer">
											<span className="text-sm font-medium">Read More</span>
											<ExternalLink className="w-4 h-4" />
										</div>
									</CardContent>
								</div>
							</div>
						</Card>
					))}
				</div>

				{/* Newsletter Signup */}
				<Card className="mt-8 bg-primary/5 border-primary/20">
					<CardContent className="pt-6">
						<div className="text-center">
							<h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
							<p className="text-muted-foreground mb-4">
								Subscribe to get the latest news and updates delivered to your inbox
							</p>
							<div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
								<Input
									type="email"
									placeholder="Enter your email"
									className="flex-1"
								/>
								<Button>
									Subscribe
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
