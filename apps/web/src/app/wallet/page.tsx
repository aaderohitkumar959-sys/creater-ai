"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Coins, CreditCard, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Transaction {
    id: string;
    type: 'PURCHASE' | 'SPEND' | 'EARN';
    amount: number;
    description: string;
    createdAt: string;
}

export default function WalletPage() {
    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [balanceData, transactionsData] = await Promise.all([
                    api.getWalletBalance(),
                    api.getTransactionHistory(),
                ]);
                setBalance(balanceData);
                setTransactions(transactionsData);
            } catch (error) {
                console.error("Failed to fetch wallet data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Wallet</h1>
                <Link href="/wallet/buy">
                    <Button size="lg" className="gap-2">
                        <Coins className="w-5 h-5" />
                        Buy Coins
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                        <Coins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{balance.toLocaleString()} Coins</div>
                        <p className="text-xs text-muted-foreground">
                            Available for use
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="text-right">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4">
                                        No transactions yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {tx.type === 'PURCHASE' && <CreditCard className="w-4 h-4 text-green-500" />}
                                                {tx.type === 'SPEND' && <ArrowUpRight className="w-4 h-4 text-red-500" />}
                                                {tx.type === 'EARN' && <ArrowDownLeft className="w-4 h-4 text-blue-500" />}
                                                <span className="capitalize">{tx.type.toLowerCase()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{tx.description}</TableCell>
                                        <TableCell className={tx.amount > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                            {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
