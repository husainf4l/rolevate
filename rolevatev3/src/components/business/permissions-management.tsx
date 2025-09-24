"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  UserCheck,
  Search,
  Key,
  Lock,
  UserPlus
} from "lucide-react";
import { useAuthContext } from "@/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { permissionsService, type Permission, type User, type Group } from "@/services/permissions.service";

interface ExtendedPermission extends Permission {
  users?: User[];
  groups?: Group[];
}

interface PermissionsManagementProps {
  locale: string;
}

export default function PermissionsManagement({ locale }: PermissionsManagementProps) {
  const { user, isAuthenticated } = useAuthContext();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<ExtendedPermission[]>([]);
  const [systemPermissions, setSystemPermissions] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("permissions");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPermissionName, setNewPermissionName] = useState("");

  // Load data from API
  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load permissions, system permissions, users, and groups in parallel
      const [permissionsData, systemPermissionsData, usersData, groupsData] = await Promise.all([
        permissionsService.getAllPermissions(),
        permissionsService.getSystemPermissions(),
        permissionsService.getAllUsers(),
        permissionsService.getAllGroups()
      ]);

      // Enhance permissions with user and group data
      const enhancedPermissions = await Promise.all(
        permissionsData.map(async (permission) => {
          try {
            const [permissionUsers, permissionGroups] = await Promise.all([
              permissionsService.getUsersWithPermission(permission.id),
              permissionsService.getGroupsWithPermission(permission.id)
            ]);

            return {
              ...permission,
              users: permissionUsers,
              groups: permissionGroups
            };
          } catch (error) {
            console.error(`Failed to load details for permission ${permission.id}:`, error);
            return {
              ...permission,
              users: [],
              groups: []
            };
          }
        })
      );

      setPermissions(enhancedPermissions);
      setSystemPermissions(systemPermissionsData);
      setUsers(usersData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Failed to load permissions data:', error);
      toast({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        description: locale === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPermission = async () => {
    if (!newPermissionName.trim()) return;

    try {
      const newPermission = await permissionsService.createPermission({
        name: newPermissionName
      });

      // Add to local state with empty users/groups
      setPermissions(prev => [...prev, {
        ...newPermission,
        users: [],
        groups: []
      }]);

      setNewPermissionName("");
      setIsCreateDialogOpen(false);

      toast({
        title: locale === 'ar' ? 'تم إنشاء الصلاحية' : 'Permission Created',
        description: locale === 'ar' ? 'تم إنشاء الصلاحية بنجاح' : 'Permission created successfully',
      });
    } catch (error) {
      console.error('Failed to create permission:', error);
      toast({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        description: locale === 'ar' ? 'فشل في إنشاء الصلاحية' : 'Failed to create permission',
        variant: "destructive",
      });
    }
  };

  const deletePermission = async (id: string) => {
    try {
      await permissionsService.deletePermission(id);
      setPermissions(prev => prev.filter(p => p.id !== id));

      toast({
        title: locale === 'ar' ? 'تم الحذف' : 'Deleted',
        description: locale === 'ar' ? 'تم حذف الصلاحية بنجاح' : 'Permission deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete permission:', error);
      toast({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        description: locale === 'ar' ? 'فشل في حذف الصلاحية' : 'Failed to delete permission',
        variant: "destructive",
      });
    }
  };

  const adminAssignPermissionToUser = async (userId: string, permissionId: string) => {
    try {
      await permissionsService.adminAssignPermissionToUser(userId, permissionId);

      // Refresh data to reflect changes
      await loadData();

      toast({
        title: locale === 'ar' ? 'تم التعيين' : 'Assigned',
        description: locale === 'ar' ? 'تم تعيين الصلاحية للمستخدم بنجاح' : 'Permission assigned to user successfully',
      });
    } catch (error) {
      console.error('Failed to assign permission to user:', error);
      toast({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        description: locale === 'ar' ? 'فشل في تعيين الصلاحية' : 'Failed to assign permission',
        variant: "destructive",
      });
    }
  };

  const adminRemovePermissionFromUser = async (userId: string, permissionId: string) => {
    try {
      await permissionsService.adminRemovePermissionFromUser(userId, permissionId);

      // Refresh data to reflect changes
      await loadData();

      toast({
        title: locale === 'ar' ? 'تم الإزالة' : 'Removed',
        description: locale === 'ar' ? 'تم إزالة الصلاحية من المستخدم بنجاح' : 'Permission removed from user successfully',
      });
    } catch (error) {
      console.error('Failed to remove permission from user:', error);
      toast({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        description: locale === 'ar' ? 'فشل في إزالة الصلاحية' : 'Failed to remove permission',
        variant: "destructive",
      });
    }
  };

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors = {
      permissions: "bg-blue-100 text-blue-800",
      users: "bg-green-100 text-green-800",
      jobs: "bg-purple-100 text-purple-800",
      custom: "bg-gray-100 text-gray-800"
    };
    return colors[category as keyof typeof colors] || colors.custom;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            {locale === 'ar' ? 'إدارة الصلاحيات' : 'Permissions Management'}
          </h2>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'إدارة صلاحيات المستخدمين والمجموعات' : 'Manage user and group permissions'}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'إضافة صلاحية' : 'Add Permission'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {locale === 'ar' ? 'إنشاء صلاحية جديدة' : 'Create New Permission'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="permission-name">
                  {locale === 'ar' ? 'اسم الصلاحية' : 'Permission Name'}
                </Label>
                <Input
                  id="permission-name"
                  value={newPermissionName}
                  onChange={(e) => setNewPermissionName(e.target.value)}
                  placeholder={locale === 'ar' ? 'أدخل اسم الصلاحية' : 'Enter permission name'}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createPermission} className="flex-1">
                  {locale === 'ar' ? 'إنشاء' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            {locale === 'ar' ? 'الصلاحيات' : 'Permissions'}
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {locale === 'ar' ? 'النظام' : 'System'}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {locale === 'ar' ? 'المستخدمون' : 'Users'}
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            {locale === 'ar' ? 'المجموعات' : 'Groups'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={locale === 'ar' ? 'البحث في الصلاحيات...' : 'Search permissions...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredPermissions.map((permission) => (
              <Card key={permission.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Lock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{permission.name}</CardTitle>
                        {permission.description && (
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(permission.category)}>
                        {permission.category}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            {locale === 'ar' ? 'تعديل' : 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="w-4 h-4 mr-2" />
                            {locale === 'ar' ? 'تعيين للمستخدمين' : 'Assign to Users'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deletePermission(permission.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {locale === 'ar' ? 'حذف' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">
                        {locale === 'ar' ? 'المستخدمون المخولون' : 'Authorized Users'}
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {permission.users && permission.users.length > 0 ? (
                          permission.users.map((user) => (
                            <Badge key={user.id} variant="outline">
                              {user.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {locale === 'ar' ? 'لا يوجد مستخدمون' : 'No users assigned'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        {locale === 'ar' ? 'المجموعات المخولة' : 'Authorized Groups'}
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {permission.groups && permission.groups.length > 0 ? (
                          permission.groups.map((group) => (
                            <Badge key={group.id} variant="secondary">
                              {group.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {locale === 'ar' ? 'لا توجد مجموعات' : 'No groups assigned'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={locale === 'ar' ? 'البحث في صلاحيات النظام...' : 'Search system permissions...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {locale === 'ar' ? 'صلاحيات النظام' : 'System Permissions'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {locale === 'ar' ? 'صلاحيات النظام الأساسية المتاحة للتعيين' : 'Core system permissions available for assignment'}
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{locale === 'ar' ? 'اسم الصلاحية' : 'Permission Name'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'المعرف' : 'ID'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemPermissions
                    .filter(permission =>
                      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      permission.id.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {permission.id}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <UserPlus className="w-4 h-4 mr-2" />
                              {locale === 'ar' ? 'تعيين للمستخدم' : 'Assign to User'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserCheck className="w-4 h-4 mr-2" />
                              {locale === 'ar' ? 'تعيين للمجموعة' : 'Assign to Group'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {systemPermissions.filter(permission =>
                permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                permission.id.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {locale === 'ar' ? 'لا توجد صلاحيات نظام مطابقة' : 'No matching system permissions'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'ar' ? 'إدارة صلاحيات المستخدمين' : 'User Permission Management'}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {locale === 'ar' ? 'إدارة الصلاحيات للمستخدمين الفرديين (يتطلب صلاحية admin:permissions)' : 'Manage permissions for individual users (requires admin:permissions permission)'}
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{locale === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'الدور' : 'Role'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'الصلاحيات' : 'Permissions'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const userPermissions = permissions.filter(p =>
                      p.users?.some(u => u.id === user.id)
                    );

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {userPermissions.length > 0 ? (
                              userPermissions.slice(0, 3).map((permission) => (
                                <Badge key={permission.id} variant="secondary" className="text-xs">
                                  {permission.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {locale === 'ar' ? 'لا توجد صلاحيات' : 'No permissions'}
                              </span>
                            )}
                            {userPermissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{userPermissions.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <UserPlus className="w-4 h-4 mr-2" />
                                {locale === 'ar' ? 'إضافة صلاحية' : 'Add Permission'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                {locale === 'ar' ? 'إدارة الصلاحيات' : 'Manage Permissions'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'ar' ? 'المجموعات' : 'Groups'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{locale === 'ar' ? 'اسم المجموعة' : 'Group Name'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'الوصف' : 'Description'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'عدد المستخدمين' : 'User Count'}</TableHead>
                    <TableHead>{locale === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{group.userCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}