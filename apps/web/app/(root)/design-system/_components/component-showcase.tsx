import type * as React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ComponentShowcaseProps {
	title: string;
	description?: string;
	children: React.ReactNode;
}

export function ComponentShowcase({
	title,
	description,
	children,
}: ComponentShowcaseProps) {
	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-4 items-center">{children}</div>
			</CardContent>
		</Card>
	);
}
