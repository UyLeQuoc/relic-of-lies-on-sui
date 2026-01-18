"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  useLeaderboardV4,
  type PlayerRecordType,
} from "@/hooks/use-game-contract-v4";

export function LeaderboardContent() {
  const {
    leaderboard,
    refetch: fetchLeaderboard,
    isLoading,
    error,
  } = useLeaderboardV4();

  // client-side pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLeaderboard();
    const id = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(id);
  }, [fetchLeaderboard]);

  const filtered = useMemo(() => {
    const records = leaderboard?.records ?? [];
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter((r: PlayerRecordType) =>
      r.addr.toLowerCase().includes(q),
    );
  }, [leaderboard, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageData = filtered.slice(start, end);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  useEffect(() => {
    // reset to first page on filters/page size change
    setPage(1);
  }, [search, pageSize]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
            <p className="text-muted-foreground">
              Top players ranked by total wins (lower games played breaks ties).
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="gap-2">
            <CardTitle className="text-xl">Global Rankings</CardTitle>
            <CardDescription>
              Browse and search players. Data refreshes every 10 seconds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search by address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-80"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">
                  Rows per page
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-9 rounded-md border bg-transparent px-2 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {isLoading && !leaderboard ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Spinner className="mr-2" /> Loading leaderboard...
              </div>
            ) : error ? (
              <div className="text-destructive text-sm">{error.message}</div>
            ) : (
              <div className="space-y-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[70px]">Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">Wins</TableHead>
                      <TableHead className="text-right">Games</TableHead>
                      <TableHead className="text-right">Win Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-8"
                        >
                          No records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageData.map((r: PlayerRecordType, idx: number) => {
                        const absoluteRank = start + idx + 1;
                        const wins = Number(r.wins);
                        const games = Number(r.games_played);
                        const rate =
                          games > 0 ? Math.round((wins / games) * 100) : 0;
                        return (
                          <TableRow key={`${r.addr}-${absoluteRank}`}>
                            <TableCell>{absoluteRank}</TableCell>
                            <TableCell className="font-mono">
                              {r.addr.slice(0, 6)}...{r.addr.slice(-4)}
                            </TableCell>
                            <TableCell className="text-right">{wins}</TableCell>
                            <TableCell className="text-right">
                              {games}
                            </TableCell>
                            <TableCell className="text-right">
                              {rate}%
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="text-xs text-muted-foreground">
                    {total === 0 ? (
                      <>0 results</>
                    ) : (
                      <>
                        Showing {start + 1}-{Math.min(end, total)} of {total}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      Page {currentPage} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
