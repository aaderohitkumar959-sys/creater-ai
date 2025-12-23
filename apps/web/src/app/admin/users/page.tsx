"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "react-hot-toast";
import { AdminChatViewer } from "@/components/admin/AdminChatViewer";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await api.getAdminUsers(page, search);
            setUsers(response.data);
            setMeta(response.meta);
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(loadUsers, 500);
        return () => clearTimeout(debounce);
    }, [page, search]);

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            await api.updateUserRole(userId, newRole);
            toast.success("User role updated");
            loadUsers();
        } catch (error) {
            toast.error("Failed to update role");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">User Management</h1>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                    />
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Stats</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Loading users...
                                </TableCell>
                            </TableRow>
                        ) : users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.image} />
                                        <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{user.name || 'Unnamed'}</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <div>Violations: {user._count?.violations || 0}</div>
                                        <div>Reports: {user._count?.reportsMade || 0}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex justify-end gap-2">
                                            {user.role !== 'ADMIN' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRoleUpdate(user.id, 'ADMIN')}
                                                >
                                                    Make Admin
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm">
                                                Details
                                            </Button>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-blue-400 border-blue-400/20 hover:bg-blue-400/10"
                                            onClick={() => {
                                                setSelectedUser({ id: user.id, name: user.name || 'Unnamed' });
                                                setViewerOpen(true);
                                            }}
                                        >
                                            View Chats
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {meta && (
                <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        Page {meta.page} of {meta.lastPage}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            disabled={page === meta.lastPage}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <AdminChatViewer
                isOpen={viewerOpen}
                onClose={() => setViewerOpen(false)}
                userId={selectedUser?.id || null}
                userName={selectedUser?.name || 'User'}
            />
        </div>
    );
}
